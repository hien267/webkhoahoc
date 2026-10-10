/**
 * TRANG QUẢN LÝ EDUAI — trang admin.html (Dashboard quản lý Lead + Báo cáo doanh thu tháng)
 * - Chế độ CLOUD: đọc/ghi qua /api/leads (Vercel + Upstash Redis), đăng nhập bằng ADMIN_KEY → thấy học viên mọi thiết bị.
 * - Chế độ CỤC BỘ: khi chưa cấu hình cloud (hoặc chạy máy nhà), đọc localStorage của chính trình duyệt này.
 */
(function () {
  'use strict';

  const CFG = window.EDUAI_CONFIG || {};
  const Model = window.EduLeadModel;
  const Store = window.EduStore;
  const esc = Store.escapeHtml;
  const money = Store.formatCurrency;
  const POLL_MS = 30000;
  const SALES = typeof SALES_TEAM !== 'undefined' ? SALES_TEAM : [];
  const COMMISSION_RATE = typeof SALES_COMMISSION_RATE !== 'undefined' ? SALES_COMMISSION_RATE : 0.03;
  const ACCOUNTANT_SESSION_KEY = 'eduai_accountant_ok';
  const LOCAL_PROOFS_KEY = 'eduai_sale_proofs';
  const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

  const STATUS_META = {
    paid: { label: 'Đã thanh toán', icon: 'fa-circle-check', cls: 'status-paid' },
    pending: { label: 'Chờ xác nhận', icon: 'fa-clock', cls: 'status-pending' },
    unpaid: { label: 'Chưa thanh toán', icon: 'fa-circle-minus', cls: 'status-unpaid' }
  };

  const state = {
    mode: 'local',
    adminKey: '',
    leads: [],
    search: '',
    status: 'all',
    breakdownMonth: '',
    openLeadId: null,
    pollTimer: null,
    accountantOk: readAccountantSession(),
    saleDraft: {},        // leadId → saleId đang chọn trong dropdown (chưa tải ảnh)
    proofTarget: null,    // leadId đang chờ chọn ảnh minh chứng
    uploadingId: null,
    proofCache: {},       // leadId → data URL ảnh đã xem/tải lên
    saleQuery: '',
    commissionMonth: ''   // '' = toàn bộ thời gian
  };

  const $ = id => document.getElementById(id);

  // ==========================================
  // KHỞI ĐỘNG & ĐĂNG NHẬP
  // ==========================================

  // Luôn bắt nhập mật khẩu quản trị (cả chế độ Cloud lẫn Cục bộ). Nếu vừa nhập đúng ở popup trên header
  // (js/site.js) thì mật khẩu đã nằm trong sessionStorage → vào thẳng dashboard, không hỏi lại.
  async function boot() {
    bindEvents();
    const savedKey = Store.getAdminSession();
    if (savedKey && await login(savedKey, true)) return;
    showLogin();
  }

  function showLogin() {
    $('admin-login').hidden = false;
    $('admin-app').hidden = true;
    $('admin-actions').hidden = true;
    setTimeout(() => $('admin-key').focus(), 50);
  }

  function showApp() {
    $('admin-login').hidden = true;
    $('admin-app').hidden = false;
    $('admin-actions').hidden = false;
    $('btn-admin-logout').hidden = false;
    $('local-mode-notice').hidden = state.mode !== 'local';
    const badge = $('data-mode-badge');
    badge.className = `status-badge ${state.mode === 'cloud' ? 'status-paid' : 'status-unpaid'}`;
    badge.innerHTML = state.mode === 'cloud'
      ? '<i class="fa-solid fa-cloud"></i> <span class="btn-label-hide-sm">Cloud</span>'
      : '<i class="fa-solid fa-database"></i> <span class="btn-label-hide-sm">Cục bộ</span>';
    render();
    selectTabFromHash(); // vd. vào từ menu "Báo cáo doanh thu" (admin.html#doanh-thu) → hỏi mật khẩu Kế toán
  }

  async function login(key, silent) {
    const result = await Store.verifyAdminKey(key);
    if (!result.ok) {
      if (!silent) showKeyError(result.error);
      return false;
    }
    state.mode = result.mode;
    state.adminKey = key;
    if (result.mode === 'cloud') {
      state.leads = result.leads;
      startPolling();
    } else {
      state.leads = Store.loadLeads();
    }
    showApp();
    return true;
  }

  // Tab khác của trang ghi Lead mới (chế độ Cục bộ) → cập nhật ngay lập tức
  window.addEventListener('storage', e => {
    if (e.key === Store.KEYS.leads && state.mode === 'local' && isActive()) refresh(true);
  });

  function startPolling() {
    clearInterval(state.pollTimer);
    state.pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && isActive()) refresh(true);
    }, POLL_MS);
  }

  // Chỉ làm mới khi đã vào được dashboard
  function isActive() {
    return !$('admin-app').hidden;
  }

  function logoutAdmin() {
    clearInterval(state.pollTimer);
    Store.setAdminSession(null);
    lockRevenue(true);
    state.adminKey = '';
    state.leads = [];
    $('admin-key').value = '';
    showLogin();
  }

  function showKeyError(message) {
    const input = $('admin-key');
    input.classList.add('is-invalid');
    const err = input.closest('.form-group').querySelector('.form-error-text');
    err.textContent = message;
    err.classList.add('visible');
  }

  // ==========================================
  // MẬT KHẨU KẾ TOÁN (tab "Báo cáo doanh thu" + KPI doanh thu)
  // So mã băm SHA-256 với CFG.ACCOUNTANT_PASSWORD_SHA256; đúng thì nhớ trong sessionStorage (đóng tab là mất).
  // ==========================================

  function readAccountantSession() {
    try { return sessionStorage.getItem(ACCOUNTANT_SESSION_KEY) === '1'; } catch (e) { return false; }
  }

  function writeAccountantSession(ok) {
    try {
      if (ok) sessionStorage.setItem(ACCOUNTANT_SESSION_KEY, '1');
      else sessionStorage.removeItem(ACCOUNTANT_SESSION_KEY);
    } catch (e) { /* bỏ qua */ }
  }

  function openAccountantModal() {
    const input = $('accountant-key');
    input.value = '';
    clearAccountantError();
    $('accountant-modal').classList.add('active');
    setTimeout(() => input.focus(), 50);
  }

  function closeAccountantModal() {
    $('accountant-modal').classList.remove('active');
  }

  function clearAccountantError() {
    const input = $('accountant-key');
    input.classList.remove('is-invalid');
    input.closest('.form-group').querySelector('.form-error-text').classList.remove('visible');
  }

  function showAccountantError(message) {
    const input = $('accountant-key');
    input.classList.add('is-invalid');
    const err = input.closest('.form-group').querySelector('.form-error-text');
    err.textContent = message;
    err.classList.add('visible');
    input.select();
  }

  async function submitAccountant(e) {
    e.preventDefault();
    const key = $('accountant-key').value;
    if (!key) return showAccountantError('Vui lòng nhập mật khẩu Kế toán.');
    const btn = $('accountant-submit');
    btn.disabled = true;
    let ok = false;
    try {
      ok = (await Store.sha256Hex(key)) === String(CFG.ACCOUNTANT_PASSWORD_SHA256 || '').toLowerCase();
    } catch (err) {
      btn.disabled = false;
      return showAccountantError('Trình duyệt không hỗ trợ kiểm tra mật khẩu, hãy mở trang qua https://.');
    }
    btn.disabled = false;
    if (!ok) return showAccountantError('Mật khẩu Kế toán không đúng.');

    state.accountantOk = true;
    writeAccountantSession(true);
    closeAccountantModal();
    renderKpis();
    showTab('revenue');
    showToast('Đã mở Báo cáo doanh thu cho Kế toán.', 'success');
  }

  function lockRevenue(silent) {
    state.accountantOk = false;
    writeAccountantSession(false);
    // Xóa số liệu đã vẽ để không còn nằm trong trang
    ['revenue-chart', 'revenue-tbody', 'breakdown-list', 'commission-tbody', 'sale-lookup'].forEach(id => { $(id).innerHTML = ''; });
    updateRevenueLock();
    if (!silent) {
      renderKpis();
      showTab('students');
      showToast('Đã khóa Báo cáo doanh thu.', 'info');
    }
  }

  function updateRevenueLock() {
    $('revenue-locked').hidden = state.accountantOk;
    $('revenue-content').hidden = !state.accountantOk;
    $('revenue-tab-lock').className = `fa-solid ${state.accountantOk ? 'fa-lock-open' : 'fa-lock'} tab-lock`;
  }

  // ==========================================
  // DỮ LIỆU
  // ==========================================

  async function refresh(silent) {
    const beforeIds = new Set(state.leads.map(l => l.id));
    if (state.mode === 'cloud') {
      try {
        const res = await fetch(CFG.LEADS_API_URL, { headers: { 'x-admin-key': state.adminKey }, cache: 'no-store' });
        if (res.status === 401) return logoutAdmin();
        const data = await res.json();
        if (data.ok) state.leads = data.leads || [];
      } catch (e) {
        if (!silent) showToast('Không tải được dữ liệu, kiểm tra kết nối mạng.', 'error');
        return;
      }
    } else {
      state.leads = Store.loadLeads();
    }
    const added = state.leads.filter(l => !beforeIds.has(l.id)).length;
    render();
    if (added > 0 && silent) showToast(`Có ${added} học viên mới vừa đăng nhập!`, 'success');
    else if (!silent) showToast('Đã cập nhật dữ liệu mới nhất.', 'info');
  }

  async function applyAction(payload) {
    if (state.mode === 'cloud') {
      try {
        const res = await fetch(CFG.LEADS_API_URL, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-admin-key': state.adminKey },
          body: JSON.stringify(payload)
        });
        if (res.status === 401) { logoutAdmin(); return false; }
        const data = await res.json();
        if (!data.ok) { showToast(data.error || 'Thao tác thất bại.', 'error'); return false; }
        if (payload.action === 'delete') state.leads = state.leads.filter(l => l.id !== payload.id);
        else if (data.lead) state.leads = state.leads.map(l => (l.id === data.lead.id ? data.lead : l));
      } catch (e) {
        showToast('Không kết nối được máy chủ.', 'error');
        return false;
      }
    } else {
      let leads = Store.loadLeads();
      const idx = leads.findIndex(l => l.id === payload.id);
      if (idx < 0) return false;
      if (payload.action === 'delete') {
        leads.splice(idx, 1);
        saveLocalProof(payload.id, null);
      } else if (payload.action === 'set_sale') {
        const result = Model.setSaleClose(leads[idx], payload.saleId);
        if (!result.ok) { showToast(result.error, 'error'); return false; }
        if (!saveLocalProof(payload.id, payload.proof)) {
          showToast('Bộ nhớ trình duyệt đã đầy, không lưu được ảnh. Hãy xóa bớt dữ liệu cũ hoặc dùng chế độ Cloud.', 'error');
          return false;
        }
        leads[idx] = result.lead;
      } else if (payload.action === 'clear_sale') {
        leads[idx] = Model.clearSaleClose(leads[idx]);
        saveLocalProof(payload.id, null);
      } else if (payload.action === 'remove_enrollment') {
        leads[idx] = Object.assign({}, leads[idx], {
          enrollments: (leads[idx].enrollments || []).filter(e => e.courseId !== payload.courseId),
          updatedAt: new Date().toISOString()
        });
      } else if (payload.action === 'set_status') {
        leads[idx] = Model.mergeLead(leads[idx], {
          enrollment: {
            courseId: payload.courseId,
            courseTitle: payload.courseTitle,
            amount: payload.amount,
            status: payload.status,
            transactionId: payload.transactionId
          }
        }, { allowPaid: true });
      }
      Store.replaceLeads(leads);
      state.leads = leads;
    }
    if (payload.action === 'set_sale') state.proofCache[payload.id] = payload.proof;
    if (payload.action === 'clear_sale' || payload.action === 'delete') delete state.proofCache[payload.id];
    render();
    return true;
  }

  // ---------- Ảnh minh chứng chốt khách ----------
  // Cục bộ: localStorage riêng (eduai_sale_proofs). Cloud: hash Redis riêng, chỉ tải khi bấm xem.
  function readLocalProofs() {
    try { return JSON.parse(localStorage.getItem(LOCAL_PROOFS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function saveLocalProof(id, dataUrl) {
    const all = readLocalProofs();
    if (dataUrl) all[id] = dataUrl;
    else delete all[id];
    try {
      localStorage.setItem(LOCAL_PROOFS_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      return false;
    }
  }

  async function loadProof(id) {
    if (state.proofCache[id]) return state.proofCache[id];
    let proof = '';
    if (state.mode === 'cloud') {
      const res = await fetch(`${CFG.LEADS_API_URL}?proof=${encodeURIComponent(id)}`, { headers: { 'x-admin-key': state.adminKey }, cache: 'no-store' });
      if (res.status === 401) { logoutAdmin(); return ''; }
      const data = await res.json();
      proof = (data && data.ok && data.proof) || '';
    } else {
      proof = readLocalProofs()[id] || '';
    }
    if (proof) state.proofCache[id] = proof;
    return proof;
  }

  // Thu nhỏ ảnh chụp màn hình (thường 2–5 MB) về JPEG ~100–400 KB trước khi lưu.
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const attempts = [[1600, 0.8], [1280, 0.7], [1024, 0.6], [800, 0.55]];
        for (const [maxSide, quality] of attempts) {
          const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          if (dataUrl.length <= 1400000) return resolve(dataUrl);
        }
        reject(new Error('too-large'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad-image')); };
      img.src = url;
    });
  }

  function startProofUpload(leadId) {
    const saleId = state.saleDraft[leadId];
    if (!saleId) return showToast('Vui lòng chọn tên Sale trước khi tải ảnh minh chứng.', 'error');
    state.proofTarget = leadId;
    $('proof-file-input').value = '';
    $('proof-file-input').click();
  }

  async function onProofFileChosen() {
    const input = $('proof-file-input');
    const file = input.files && input.files[0];
    const leadId = state.proofTarget;
    input.value = '';
    state.proofTarget = null;
    if (!file || !leadId) return;

    const saleId = state.saleDraft[leadId];
    if (!saleId) return showToast('Vui lòng chọn tên Sale trước khi tải ảnh minh chứng.', 'error');
    if (!/^image\//.test(file.type)) return showToast('Chỉ nhận file ảnh (JPG, PNG, ảnh chụp màn hình...).', 'error');
    if (file.size > MAX_UPLOAD_BYTES) return showToast('Ảnh quá lớn (tối đa 15 MB).', 'error');

    state.uploadingId = leadId;
    renderTable();
    let proof;
    try {
      proof = await compressImage(file);
    } catch (e) {
      state.uploadingId = null;
      renderTable();
      return showToast(e.message === 'too-large' ? 'Ảnh quá lớn, hãy chụp/cắt nhỏ lại.' : 'Không đọc được ảnh này, hãy thử ảnh khác.', 'error');
    }

    const ok = await applyAction({ action: 'set_sale', id: leadId, saleId, proof });
    state.uploadingId = null;
    if (ok) {
      delete state.saleDraft[leadId];
      const lead = state.leads.find(l => l.id === leadId);
      showToast(`Đã ghi nhận ${saleName(saleId)} chốt khách ${lead ? lead.fullName : ''}.`, 'success');
    }
    render();
  }

  async function openProofModal(leadId) {
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead || !lead.closedBy) return;
    const body = $('proof-modal-body');
    const caption = `
      <p class="proof-caption">
        <span class="sale-chip"><i class="fa-solid fa-user-tie"></i> ${esc(saleLabel(lead.closedBy.saleId))}</span>
        chốt khách <strong>${esc(lead.fullName || '')}</strong> lúc ${formatDateTime(lead.closedBy.closedAt)}
      </p>`;
    body.innerHTML = `${caption}<div class="proof-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải ảnh...</div>`;
    $('proof-modal').classList.add('active');

    let proof = '';
    try { proof = await loadProof(leadId); } catch (e) { proof = ''; }
    if (!$('proof-modal').classList.contains('active')) return;
    body.innerHTML = caption + (proof
      ? `<img src="${esc(proof)}" alt="Ảnh minh chứng chốt khách ${esc(lead.fullName || '')}" class="proof-img">`
      : '<p class="empty-state"><i class="fa-solid fa-image big"></i>Không tìm thấy ảnh minh chứng (có thể đã được tải lên từ trình duyệt khác ở chế độ Cục bộ).</p>');
  }

  function closeProofModal() {
    $('proof-modal').classList.remove('active');
  }

  async function clearSale(leadId) {
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead || !lead.closedBy) return;
    if (!confirm(`Gỡ ghi nhận "${saleLabel(lead.closedBy.saleId)}" đã chốt khách ${lead.fullName}? Ảnh minh chứng sẽ bị xóa.`)) return;
    if (await applyAction({ action: 'clear_sale', id: leadId })) showToast('Đã gỡ ghi nhận chốt khách.', 'info');
  }

  // ==========================================
  // RENDER
  // ==========================================

  function render() {
    renderKpis();
    // Không vẽ lại bảng khi người dùng đang thao tác trong bảng (đang mở dropdown chọn Sale) — lần sau sẽ cập nhật.
    if (!$('students-tbody').contains(document.activeElement) || document.activeElement.tagName !== 'SELECT') renderTable();
    updateRevenueLock();
    if (state.accountantOk) renderRevenue();
    if (state.openLeadId) renderLeadModal(state.openLeadId);
  }

  function renderKpis() {
    const leads = state.leads;
    const weekAgo = Date.now() - 7 * 86400000;
    const newThisWeek = leads.filter(l => new Date(l.createdAt).getTime() >= weekAgo).length;
    const paidCount = leads.filter(l => Model.leadStatus(l) === 'paid').length;
    const pendingCount = leads.filter(l => Model.leadStatus(l) === 'pending').length;
    const monthly = Model.monthlyRevenue(leads);
    const thisMonthKey = monthKeyOf(new Date());
    const thisMonth = monthly.find(m => m.month === thisMonthKey) || { revenue: 0, orders: 0 };
    const total = monthly.reduce((s, m) => s + m.revenue, 0);

    const cards = [
      { icon: 'fa-users', bg: 'var(--primary-50)', color: 'var(--primary-600)', label: 'Tổng học viên', value: leads.length.toLocaleString('vi-VN'), foot: `+${newThisWeek} trong 7 ngày qua` },
      { icon: 'fa-circle-check', bg: 'var(--emerald-50)', color: 'var(--emerald-600)', label: 'Đã thanh toán', value: paidCount.toLocaleString('vi-VN'), foot: `${pendingCount} đang chờ xác nhận` },
      { icon: 'fa-calendar-day', bg: 'var(--cyan-50)', color: 'var(--cyan-600)', label: `Doanh thu tháng ${monthLabel(thisMonthKey)}`, value: money(thisMonth.revenue), foot: `${thisMonth.orders} đơn đã xác nhận` },
      { icon: 'fa-sack-dollar', bg: 'var(--amber-100)', color: 'var(--amber-600)', label: 'Tổng doanh thu', value: money(total), foot: 'Toàn bộ thời gian' }
    ];

    // Ô doanh thu chỉ hiện số khi đã nhập mật khẩu Kế toán
    if (!state.accountantOk) {
      [cards[2], cards[3]].forEach(c => {
        c.value = '••••••';
        c.foot = '<i class="fa-solid fa-lock"></i> Cần mật khẩu Kế toán';
        c.locked = true;
      });
    }

    $('kpi-grid').innerHTML = cards.map(c => `
      <div class="kpi-card ${c.locked ? 'kpi-locked' : ''}" ${c.locked ? 'data-unlock-revenue role="button" tabindex="0" title="Bấm để nhập mật khẩu Kế toán"' : ''}>
        <div class="kpi-icon" style="background:${c.bg}; color:${c.color};"><i class="fa-solid ${c.icon}"></i></div>
        <div>
          <div class="kpi-label">${c.label}</div>
          <div class="kpi-value">${c.value}</div>
          <div class="kpi-foot">${c.foot}</div>
        </div>
      </div>`).join('');
  }

  function filteredLeads() {
    const q = fold(state.search);
    return state.leads
      .filter(l => state.status === 'all' || Model.leadStatus(l) === state.status)
      .filter(l => !q || fold(`${l.fullName} ${l.phone} ${l.email}`).includes(q))
      .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  }

  function renderTable() {
    const rows = filteredLeads();
    $('students-count').textContent = `${rows.length} / ${state.leads.length} học viên`;

    if (!rows.length) {
      $('students-tbody').innerHTML = `
        <tr class="empty-row"><td colspan="8">
          <i class="fa-solid fa-user-clock" style="font-size:1.6rem; color:var(--primary-400); display:block; margin-bottom:6px;"></i>
          ${state.leads.length ? 'Không có học viên phù hợp bộ lọc.' : 'Chưa có học viên nào. Học viên sẽ xuất hiện ngay khi đăng nhập trên trang chủ.'}
        </td></tr>`;
      return;
    }

    $('students-tbody').innerHTML = rows.map(lead => {
      const status = Model.leadStatus(lead);
      const meta = STATUS_META[status];
      const enrolled = (lead.enrollments || []).map(e => courseName(e.courseId, e.courseTitle));
      const interested = lead.interestedCourseTitle ? courseName(lead.interestedCourseId, lead.interestedCourseTitle) : '';
      const pendingAmount = (lead.enrollments || []).filter(e => e.status === 'pending').reduce((s, e) => s + (Number(e.amount) || 0), 0);

      return `
        <tr>
          <td>
            <div class="cell-person">
              <span class="avatar-sm">${esc(Store.initials(lead.fullName))}</span>
              <div>
                <strong>${esc(lead.fullName || 'Chưa cung cấp')}</strong>
                <small>${formatDate(lead.createdAt)} &middot; ${lead.provider === 'google' ? '<i class="fa-brands fa-google"></i> Google' : '<i class="fa-solid fa-phone"></i> SĐT'}</small>
              </div>
            </div>
          </td>
          <td style="white-space:nowrap;">${lead.phone ? `<a href="tel:${esc(lead.phone)}">${esc(formatPhone(lead.phone))}</a>` : '<span class="cell-muted">Chưa có</span>'}</td>
          <td>${lead.email ? esc(lead.email) : '<span class="cell-muted">Chưa có</span>'}</td>
          <td class="cell-course">
            ${interested ? esc(interested) : '<span class="cell-muted">Chưa làm khảo sát</span>'}
            ${enrolled.length ? `<div class="cell-muted"><i class="fa-solid fa-cart-shopping"></i> Đã đăng ký: ${esc(enrolled.join(', '))}</div>` : ''}
          </td>
          <td><span class="status-badge ${meta.cls}"><i class="fa-solid ${meta.icon}"></i> ${meta.label}</span></td>
          <td class="num">
            <strong>${money(Model.paidAmount(lead))}</strong>
            ${pendingAmount ? `<div class="cell-muted">chờ: ${money(pendingAmount)}</div>` : ''}
          </td>
          <td class="cell-close">${renderCloseCell(lead, status)}</td>
          <td><button class="btn btn-outline btn-sm" style="white-space:nowrap;" data-open-lead="${esc(lead.id)}">Chi tiết</button></td>
        </tr>`;
    }).join('');
  }

  /**
   * Ô "Đã chốt được khách":
   * - Đã thanh toán  → chỉ hiện trạng thái hoàn tất (kèm tên Sale nếu có), không còn ô nhập.
   * - Chưa thanh toán & đã có Sale chốt → tên Sale + xem ảnh minh chứng + gỡ.
   * - Chưa thanh toán & chưa ai chốt → dropdown chọn Sale + nút tải ảnh minh chứng (bắt buộc để hoàn tất).
   */
  function renderCloseCell(lead, status) {
    const closed = lead.closedBy && lead.closedBy.saleId ? lead.closedBy : null;
    const id = esc(lead.id);

    if (status === 'paid') {
      return closed
        ? `<span class="status-badge status-paid"><i class="fa-solid fa-circle-check"></i> Hoàn tất</span>
           <div class="close-meta">
             <span class="cell-muted">${esc(saleLabel(closed.saleId))}</span>
             <button type="button" class="link-btn" data-view-proof="${id}"><i class="fa-solid fa-image"></i> Ảnh</button>
           </div>`
        : '<span class="cell-muted"><i class="fa-solid fa-circle-check"></i> Đã thanh toán</span>';
    }

    if (closed) {
      return `
        <span class="sale-chip"><i class="fa-solid fa-user-check"></i> ${esc(saleLabel(closed.saleId))}</span>
        <div class="close-meta">
          <span class="cell-muted">${formatDate(closed.closedAt)}</span>
          <button type="button" class="link-btn" data-view-proof="${id}"><i class="fa-solid fa-image"></i> Xem ảnh</button>
          <button type="button" class="link-btn link-danger" data-clear-sale="${id}" aria-label="Gỡ ghi nhận chốt khách"><i class="fa-solid fa-rotate-left"></i> Gỡ</button>
        </div>`;
    }

    const draft = state.saleDraft[lead.id] || '';
    const uploading = state.uploadingId === lead.id;
    return `
      <div class="close-form">
        <select class="form-control form-select close-select" data-sale-select="${id}" aria-label="Chọn Sale đã chốt khách ${esc(lead.fullName || '')}" ${uploading ? 'disabled' : ''}>
          <option value="">— Chọn Sale —</option>
          ${SALES.map(s => `<option value="${esc(s.id)}" ${s.id === draft ? 'selected' : ''}>${esc(saleLabel(s.id))}</option>`).join('')}
        </select>
        <button type="button" class="btn btn-outline btn-sm close-upload" data-upload-proof="${id}" ${draft && !uploading ? '' : 'disabled'} title="Tải ảnh chụp cuộc hội thoại / cuộc gọi chốt khách">
          ${uploading ? '<i class="fa-solid fa-spinner fa-spin"></i> Đang tải...' : '<i class="fa-solid fa-cloud-arrow-up"></i> Tải ảnh minh chứng'}
        </button>
      </div>`;
  }

  // ---------- Hoa hồng đội Sale (Kế toán) ----------
  function renderCommission(months) {
    const select = $('commission-month');
    select.innerHTML = `<option value="">Toàn bộ thời gian</option>` + months.slice().reverse()
      .map(k => `<option value="${k}" ${k === state.commissionMonth ? 'selected' : ''}>Tháng ${monthLabel(k)}</option>`).join('');
    $('sale-code-list').innerHTML = SALES.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
    $('commission-sub').textContent = `${Math.round(COMMISSION_RATE * 1000) / 10}% trên giá trị khóa học Sale đã chốt (có ảnh minh chứng) và đã xác nhận thanh toán · ${state.commissionMonth ? `tháng ${monthLabel(state.commissionMonth)}` : 'toàn bộ thời gian'}`;

    const stats = Model.salesStats(state.leads, COMMISSION_RATE, state.commissionMonth);
    const empty = { closedLeads: 0, waitingLeads: 0, courses: 0, sales: 0, commission: 0 };
    const totals = Object.assign({}, empty);
    const selected = findSale(state.saleQuery);

    $('commission-tbody').innerHTML = SALES.map(s => {
      const st = stats[s.id] || empty;
      Object.keys(totals).forEach(k => { totals[k] += st[k]; });
      return `
        <tr class="${selected && selected.id === s.id ? 'is-selected' : ''}" data-pick-sale="${esc(s.id)}" tabindex="0" title="Xem chi tiết ${esc(s.name)}">
          <td><code class="sale-code">${esc(s.id)}</code></td>
          <td><strong>${esc(s.name)}</strong></td>
          <td class="num">${st.closedLeads}${st.waitingLeads ? ` <span class="cell-muted">(${st.waitingLeads} chờ TT)</span>` : ''}</td>
          <td class="num">${st.courses}</td>
          <td class="num">${money(st.sales)}</td>
          <td class="num"><strong class="commission-val">${money(st.commission)}</strong></td>
        </tr>`;
    }).join('') + `
      <tr class="total-row">
        <td colspan="2"><strong>Tổng cộng</strong></td>
        <td class="num">${totals.closedLeads}</td>
        <td class="num">${totals.courses}</td>
        <td class="num">${money(totals.sales)}</td>
        <td class="num"><strong>${money(totals.commission)}</strong></td>
      </tr>`;

    renderSaleLookup(stats);
  }

  function renderSaleLookup(stats) {
    const box = $('sale-lookup');
    const query = state.saleQuery.trim();
    if (!query) {
      box.innerHTML = '<p class="cell-muted"><i class="fa-solid fa-circle-info"></i> Gõ mã Sale (vd: <code>sale1</code>) hoặc bấm vào một dòng trong bảng để xem chi tiết hoa hồng.</p>';
      return;
    }
    const sale = findSale(query);
    if (!sale) {
      box.innerHTML = `<p class="lookup-miss"><i class="fa-solid fa-circle-exclamation"></i> Không tìm thấy nhân viên Sale có mã "${esc(query)}". Mã hợp lệ: ${SALES.map(s => esc(s.id)).join(', ')}.</p>`;
      return;
    }
    const st = (stats || Model.salesStats(state.leads, COMMISSION_RATE, state.commissionMonth))[sale.id] ||
      { closedLeads: 0, waitingLeads: 0, courses: 0, sales: 0, commission: 0 };
    box.innerHTML = `
      <div class="lookup-card">
        <div class="lookup-person">
          <span class="avatar-sm">${esc(Store.initials(sale.name))}</span>
          <div>
            <strong>${esc(sale.name)}</strong>
            <small>Mã nhân viên: <code class="sale-code">${esc(sale.id)}</code> &middot; ${state.commissionMonth ? `Tháng ${monthLabel(state.commissionMonth)}` : 'Toàn bộ thời gian'}</small>
          </div>
        </div>
        <div class="lookup-stats">
          <div><span>Khóa học đã chốt thành công</span><strong>${st.courses}</strong><small>${st.closedLeads} khách đã chốt${st.waitingLeads ? `, ${st.waitingLeads} chờ thanh toán` : ''}</small></div>
          <div><span>Doanh số đã thanh toán</span><strong>${money(st.sales)}</strong><small>Tổng giá trị khóa học</small></div>
          <div class="lookup-highlight"><span>Hoa hồng thực nhận</span><strong>${money(st.commission)}</strong><small>= ${Math.round(COMMISSION_RATE * 1000) / 10}% × doanh số</small></div>
        </div>
      </div>`;
  }

  // Nhận "sale1", "Sale 1", "SALE-1", "1" hoặc một phần họ tên.
  function findSale(query) {
    const q = fold(query).replace(/[\s_-]+/g, '');
    if (!q) return null;
    const code = /^\d+$/.test(q) ? `sale${q}` : q;
    return SALES.find(s => s.id === code) ||
      SALES.find(s => fold(s.name).replace(/\s+/g, '').includes(q)) || null;
  }

  function saleName(id) {
    const sale = SALES.find(s => s.id === id);
    return sale ? sale.name : id;
  }

  function saleLabel(id) {
    const sale = SALES.find(s => s.id === id);
    return sale ? `Sale ${id.replace(/^sale/, '')} - ${sale.name}` : id;
  }

  // ---------- Báo cáo doanh thu ----------
  function lastMonths(n) {
    const keys = [];
    const now = new Date(Date.now() + 7 * 3600 * 1000);
    let y = now.getUTCFullYear();
    let m = now.getUTCMonth() + 1;
    for (let i = 0; i < n; i++) {
      keys.unshift(`${y}-${String(m).padStart(2, '0')}`);
      m -= 1;
      if (m === 0) { m = 12; y -= 1; }
    }
    return keys;
  }

  function renderRevenue() {
    const monthly = Model.monthlyRevenue(state.leads);
    const byMonth = Object.fromEntries(monthly.map(m => [m.month, m]));
    const months = lastMonths(12);
    const series = months.map(k => byMonth[k] || { month: k, revenue: 0, orders: 0, students: 0 });
    renderRevenueChart(series);
    renderRevenueTable(monthly, byMonth);
    renderBreakdownSelect(months);
    renderBreakdown();
    renderCommission(months);
  }

  function renderRevenueChart(series) {
    const max = Math.max(...series.map(s => s.revenue), 0);
    const step = niceStep(max / 4);
    const ticks = Math.max(1, Math.ceil(max / step));
    const top = step * ticks;
    const currentKey = monthKeyOf(new Date());

    const gridlines = Array.from({ length: ticks + 1 }, (_, i) => `
      <div class="chart-gridline" style="bottom:${(i / ticks) * 100}%;"><span>${shortMoney(step * i)}</span></div>`).join('');

    const cols = series.map((s, i) => `
      <div class="chart-col ${i < series.length / 2 ? 'tip-start' : 'tip-end'} ${s.month === currentKey ? 'is-current' : ''}" tabindex="0" aria-label="Tháng ${monthLabel(s.month)}: ${money(s.revenue)}, ${s.orders} đơn">
        <div class="chart-bar" style="height:${top ? (s.revenue / top) * 100 : 0}%;"></div>
        <div class="chart-tooltip"><strong>${money(s.revenue)}</strong>Tháng ${monthLabel(s.month)} &middot; ${s.orders} đơn &middot; ${s.students} học viên</div>
      </div>`).join('');

    $('revenue-chart').innerHTML = `
      <div class="chart-plot">${gridlines}${cols}</div>
      <div class="chart-x">${series.map(s => `<span>${monthLabel(s.month, true)}</span>`).join('')}</div>
      ${max === 0 ? '<p class="empty-state" style="padding:1rem 0 0;">Chưa có doanh thu đã xác nhận. Xác nhận thanh toán trong tab "Quản lý học viên" để số liệu hiện ở đây.</p>' : ''}`;
  }

  function renderRevenueTable(monthly, byMonth) {
    const currentKey = monthKeyOf(new Date());
    const keys = Array.from(new Set(monthly.map(m => m.month).concat(currentKey))).sort().reverse();
    $('revenue-tbody').innerHTML = keys.map(key => {
      const m = byMonth[key] || { revenue: 0, orders: 0, students: 0 };
      const prev = byMonth[prevMonthKey(key)];
      let change = '<span class="cell-muted">—</span>';
      if (prev && prev.revenue > 0) {
        const pct = Math.round(((m.revenue - prev.revenue) / prev.revenue) * 100);
        change = pct >= 0
          ? `<span style="color:#047857; font-weight:700;"><i class="fa-solid fa-arrow-trend-up"></i> +${pct}%</span>`
          : `<span style="color:var(--rose-600); font-weight:700;"><i class="fa-solid fa-arrow-trend-down"></i> ${pct}%</span>`;
      }
      return `
        <tr>
          <td><strong>Tháng ${monthLabel(key)}</strong>${key === currentKey ? ' <span class="cell-muted">(tháng này)</span>' : ''}</td>
          <td class="num">${m.orders}</td>
          <td class="num">${m.students}</td>
          <td class="num"><strong>${money(m.revenue)}</strong></td>
          <td class="num">${change}</td>
        </tr>`;
    }).join('');
  }

  function renderBreakdownSelect(months) {
    const select = $('breakdown-month');
    if (!state.breakdownMonth) state.breakdownMonth = months[months.length - 1];
    select.innerHTML = months.slice().reverse()
      .map(k => `<option value="${k}" ${k === state.breakdownMonth ? 'selected' : ''}>Tháng ${monthLabel(k)}</option>`).join('');
  }

  function renderBreakdown() {
    const totals = {};
    state.leads.forEach(lead => (lead.enrollments || []).forEach(e => {
      if (e.status !== 'paid' || !e.paidAt || monthKeyOf(new Date(e.paidAt)) !== state.breakdownMonth) return;
      if (!totals[e.courseId]) totals[e.courseId] = { name: courseName(e.courseId, e.courseTitle), revenue: 0, orders: 0 };
      totals[e.courseId].revenue += Number(e.amount) || 0;
      totals[e.courseId].orders += 1;
    }));
    const rows = Object.values(totals).sort((a, b) => b.revenue - a.revenue);
    const max = rows.length ? rows[0].revenue : 0;
    const sum = rows.reduce((s, r) => s + r.revenue, 0);

    $('breakdown-list').innerHTML = rows.length
      ? `<li class="breakdown-row"><span class="name">Tổng tháng</span><span class="val">${money(sum)}</span></li>` +
        rows.map(r => `
          <li class="breakdown-row">
            <span class="name" title="${esc(r.name)}">${esc(r.name)} <span class="cell-muted">(${r.orders} đơn)</span></span>
            <span class="val">${money(r.revenue)}</span>
            <div class="breakdown-track"><div class="breakdown-fill" style="width:${max ? (r.revenue / max) * 100 : 0}%;"></div></div>
          </li>`).join('')
      : '<li class="empty-state"><i class="fa-solid fa-receipt big"></i>Chưa có khóa học nào được thanh toán trong tháng này.</li>';
  }

  // ---------- Modal chi tiết ----------
  function openLeadModal(id) {
    state.openLeadId = id;
    renderLeadModal(id);
    $('lead-modal').classList.add('active');
  }

  function closeLeadModal() {
    state.openLeadId = null;
    $('lead-modal').classList.remove('active');
  }

  function renderLeadModal(id) {
    const lead = state.leads.find(l => l.id === id);
    if (!lead) { closeLeadModal(); return; }
    const courses = typeof COURSES_DATA !== 'undefined' ? COURSES_DATA : [];
    const enrollments = lead.enrollments || [];
    const zaloPhone = lead.phone ? `https://zalo.me/${encodeURIComponent(lead.phone)}` : '';

    $('lead-modal-body').innerHTML = `
      <dl class="detail-grid">
        <div><dt>Họ tên</dt><dd>${esc(lead.fullName)}</dd></div>
        <div><dt>Số điện thoại</dt><dd>${lead.phone ? `<a href="tel:${esc(lead.phone)}">${esc(formatPhone(lead.phone))}</a> &middot; <a href="${zaloPhone}" target="_blank" rel="noopener">Zalo</a>` : 'Chưa có'}</dd></div>
        <div><dt>Email</dt><dd>${lead.email ? `<a href="mailto:${esc(lead.email)}">${esc(lead.email)}</a>` : 'Chưa có'}</dd></div>
        <div><dt>Đăng nhập bằng</dt><dd>${lead.provider === 'google' ? 'Tài khoản Google' : 'Số điện thoại'}</dd></div>
        <div><dt>Ngày đăng ký</dt><dd>${formatDateTime(lead.createdAt)}</dd></div>
        <div><dt>Hoạt động gần nhất</dt><dd>${formatDateTime(lead.updatedAt)}</dd></div>
        <div style="grid-column:1/-1;"><dt>Khóa học quan tâm (theo khảo sát)</dt><dd>${lead.interestedCourseTitle ? `${esc(lead.interestedCourseTitle)}${lead.matchRate ? ` — phù hợp ${esc(lead.matchRate)}%` : ''}` : 'Chưa làm khảo sát'}</dd></div>
      </dl>

      <div class="enroll-item" style="margin-bottom:1.25rem;">
        <div>
          <h5><i class="fa-solid fa-user-tie" style="color:var(--primary-600);"></i> Sale chốt khách</h5>
          <div class="cell-muted">${lead.closedBy
            ? `${esc(saleLabel(lead.closedBy.saleId))} &middot; ghi nhận ${formatDateTime(lead.closedBy.closedAt)}`
            : (Model.leadStatus(lead) === 'paid' ? 'Không có Sale ghi nhận (khách tự thanh toán).' : 'Chưa có Sale ghi nhận. Chọn Sale + tải ảnh minh chứng ở cột "Đã chốt được khách".')}</div>
        </div>
        ${lead.closedBy ? `
        <div class="enroll-actions">
          <button class="btn btn-secondary btn-sm" data-act="view_proof"><i class="fa-solid fa-image"></i> Xem ảnh</button>
          <button class="btn btn-danger-soft btn-sm" data-act="clear_sale" aria-label="Gỡ ghi nhận chốt khách"><i class="fa-solid fa-rotate-left"></i></button>
        </div>` : ''}
      </div>

      <h4 style="font-size:1rem; margin-bottom:0.75rem;"><i class="fa-solid fa-cart-shopping" style="color:var(--primary-600);"></i> Khóa học đã đăng ký</h4>
      ${enrollments.length ? enrollments.map(e => {
        const meta = STATUS_META[e.status] || STATUS_META.pending;
        return `
          <div class="enroll-item">
            <div>
              <h5>${esc(courseName(e.courseId, e.courseTitle))}</h5>
              <div class="cell-muted">${money(e.amount)}${e.transactionId ? ` &middot; Mã GD: ${esc(e.transactionId)}` : ''} &middot; ${e.status === 'paid' ? `xác nhận ${formatDate(e.paidAt)}` : `báo CK ${formatDate(e.createdAt)}`}</div>
              <span class="status-badge ${meta.cls}" style="margin-top:6px;"><i class="fa-solid ${meta.icon}"></i> ${meta.label}</span>
            </div>
            <div class="enroll-actions">
              ${e.status === 'paid'
                ? `<button class="btn btn-secondary btn-sm" data-act="set_status" data-status="pending" data-course="${esc(e.courseId)}">Hủy xác nhận</button>`
                : `<button class="btn btn-success btn-sm" data-act="set_status" data-status="paid" data-course="${esc(e.courseId)}"><i class="fa-solid fa-check"></i> Xác nhận đã nhận tiền</button>`}
              <button class="btn btn-danger-soft btn-sm" data-act="remove_enrollment" data-course="${esc(e.courseId)}" aria-label="Xóa khóa học này"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </div>`;
      }).join('') : '<p class="cell-muted" style="margin-bottom:0.75rem;">Học viên chưa đăng ký/chuyển khoản khóa nào.</p>'}

      <div style="margin-top:1rem;">
        <label class="form-label" for="add-enroll-course">Ghi nhận thanh toán thủ công (khách chuyển khoản/tiền mặt)</label>
        <div class="add-enroll-row">
          <select id="add-enroll-course" class="form-control form-select">
            ${courses.map(c => `<option value="${esc(c.id)}" ${c.id === lead.interestedCourseId ? 'selected' : ''}>${esc(c.shortTitle || c.title)} — ${money(c.price)}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" data-act="add_paid"><i class="fa-solid fa-plus"></i> Ghi nhận đã thanh toán</button>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--slate-200);">
        <button class="btn btn-danger-soft btn-sm" data-act="delete"><i class="fa-solid fa-user-xmark"></i> Xóa học viên</button>
        <button class="btn btn-secondary btn-sm" data-act="close">Đóng</button>
      </div>`;
  }

  async function onLeadModalAction(btn) {
    const lead = state.leads.find(l => l.id === state.openLeadId);
    if (!lead) return;
    const act = btn.dataset.act;

    if (act === 'close') return closeLeadModal();
    if (act === 'view_proof') return openProofModal(lead.id);
    if (act === 'clear_sale') return clearSale(lead.id);

    if (act === 'delete') {
      if (!confirm(`Xóa vĩnh viễn học viên "${lead.fullName}" và toàn bộ lịch sử thanh toán?`)) return;
      if (await applyAction({ action: 'delete', id: lead.id })) {
        closeLeadModal();
        showToast('Đã xóa học viên.', 'info');
      }
      return;
    }

    if (act === 'remove_enrollment') {
      if (!confirm('Xóa khóa học này khỏi hồ sơ học viên?')) return;
      if (await applyAction({ action: 'remove_enrollment', id: lead.id, courseId: btn.dataset.course })) showToast('Đã xóa khóa học khỏi hồ sơ.', 'info');
      return;
    }

    if (act === 'set_status') {
      const enr = (lead.enrollments || []).find(e => e.courseId === btn.dataset.course);
      if (!enr) return;
      const ok = await applyAction({
        action: 'set_status', id: lead.id, courseId: enr.courseId, courseTitle: enr.courseTitle,
        amount: enr.amount, status: btn.dataset.status, transactionId: enr.transactionId
      });
      if (ok) showToast(btn.dataset.status === 'paid' ? `Đã xác nhận thanh toán ${money(enr.amount)} — cộng vào doanh thu.` : 'Đã chuyển về "Chờ xác nhận".', 'success');
      return;
    }

    if (act === 'add_paid') {
      const course = (COURSES_DATA || []).find(c => c.id === $('add-enroll-course').value);
      if (!course) return;
      const ok = await applyAction({
        action: 'set_status', id: lead.id, courseId: course.id, courseTitle: course.title,
        amount: course.price, status: 'paid', transactionId: `ADMIN-${Date.now().toString().slice(-6)}`
      });
      if (ok) showToast(`Đã ghi nhận ${money(course.price)} cho khóa "${course.shortTitle || course.title}".`, 'success');
    }
  }

  // ---------- Xuất CSV ----------
  function exportCsv() {
    const header = ['Họ tên', 'Số điện thoại', 'Email', 'Đăng nhập bằng', 'Khóa học quan tâm', 'Khóa đã đăng ký', 'Tình trạng thanh toán', 'Số tiền đã thanh toán', 'Sale chốt khách', 'Ngày đăng ký'];
    const rows = filteredLeads().map(l => [
      l.fullName,
      l.phone ? `="${l.phone}"` : '',
      l.email,
      l.provider === 'google' ? 'Google' : 'SĐT',
      l.interestedCourseTitle || '',
      (l.enrollments || []).map(e => `${courseName(e.courseId, e.courseTitle)} (${STATUS_META[e.status] ? STATUS_META[e.status].label : e.status})`).join('; '),
      STATUS_META[Model.leadStatus(l)].label,
      Model.paidAmount(l),
      l.closedBy ? saleLabel(l.closedBy.saleId) : '',
      formatDate(l.createdAt)
    ]);
    const csv = [header].concat(rows)
      .map(r => r.map(v => (String(v).startsWith('="') ? String(v) : `"${String(v == null ? '' : v).replace(/"/g, '""')}"`)).join(','))
      .join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `eduai-hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ==========================================
  // SỰ KIỆN
  // ==========================================

  function bindEvents() {
    $('admin-login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const key = $('admin-key').value.trim();
      if (!key) return showKeyError('Vui lòng nhập mật khẩu.');
      const btn = $('admin-login-btn');
      btn.disabled = true;
      await login(key, false);
      btn.disabled = false;
    });
    $('admin-key').addEventListener('input', () => {
      $('admin-key').classList.remove('is-invalid');
      $('admin-key').closest('.form-group').querySelector('.form-error-text').classList.remove('visible');
    });

    $('btn-refresh').addEventListener('click', () => refresh(false));
    $('btn-export').addEventListener('click', exportCsv);
    $('btn-admin-logout').addEventListener('click', logoutAdmin);

    document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));

    // Mật khẩu Kế toán
    $('accountant-form').addEventListener('submit', submitAccountant);
    $('accountant-key').addEventListener('input', clearAccountantError);
    $('accountant-modal-close').addEventListener('click', closeAccountantModal);
    $('accountant-modal').addEventListener('click', e => { if (e.target.id === 'accountant-modal') closeAccountantModal(); });
    $('btn-unlock-revenue').addEventListener('click', openAccountantModal);
    $('btn-lock-revenue').addEventListener('click', () => lockRevenue(false));
    $('kpi-grid').addEventListener('click', e => { if (e.target.closest('[data-unlock-revenue]')) openAccountantModal(); });
    $('kpi-grid').addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-unlock-revenue]')) { e.preventDefault(); openAccountantModal(); }
    });

    // Hoa hồng Sale
    $('sale-code').addEventListener('input', e => { state.saleQuery = e.target.value; renderCommission(lastMonths(12)); });
    $('commission-month').addEventListener('change', e => { state.commissionMonth = e.target.value; renderCommission(lastMonths(12)); });
    $('commission-tbody').addEventListener('click', e => {
      const row = e.target.closest('[data-pick-sale]');
      if (!row) return;
      state.saleQuery = row.dataset.pickSale;
      $('sale-code').value = state.saleQuery;
      renderCommission(lastMonths(12));
    });
    $('commission-tbody').addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.closest('[data-pick-sale]')) e.target.closest('[data-pick-sale]').click();
    });

    // Cột "Đã chốt được khách"
    $('students-tbody').addEventListener('change', e => {
      const select = e.target.closest('[data-sale-select]');
      if (!select) return;
      const id = select.dataset.saleSelect;
      if (select.value) state.saleDraft[id] = select.value;
      else delete state.saleDraft[id];
      const btn = select.closest('.close-form').querySelector('[data-upload-proof]');
      if (btn) btn.disabled = !select.value;
    });
    $('proof-file-input').addEventListener('change', onProofFileChosen);
    $('proof-modal-close').addEventListener('click', closeProofModal);
    $('proof-modal').addEventListener('click', e => { if (e.target.id === 'proof-modal') closeProofModal(); });

    $('filter-search').addEventListener('input', e => { state.search = e.target.value; renderTable(); });
    $('filter-status').addEventListener('change', e => { state.status = e.target.value; renderTable(); });
    $('breakdown-month').addEventListener('change', e => { state.breakdownMonth = e.target.value; renderBreakdown(); });

    $('students-tbody').addEventListener('click', e => {
      const btn = e.target.closest('[data-open-lead], [data-upload-proof], [data-view-proof], [data-clear-sale]');
      if (!btn) return;
      if (btn.dataset.openLead) openLeadModal(btn.dataset.openLead);
      else if (btn.dataset.uploadProof) startProofUpload(btn.dataset.uploadProof);
      else if (btn.dataset.viewProof) openProofModal(btn.dataset.viewProof);
      else if (btn.dataset.clearSale) clearSale(btn.dataset.clearSale);
    });

    $('lead-modal-body').addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (btn) onLeadModalAction(btn);
    });
    $('lead-modal-close').addEventListener('click', closeLeadModal);
    $('lead-modal').addEventListener('click', e => { if (e.target.id === 'lead-modal') closeLeadModal(); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if ($('proof-modal').classList.contains('active')) closeProofModal();
      else if ($('accountant-modal').classList.contains('active')) closeAccountantModal();
      else if (state.openLeadId) closeLeadModal();
    });
  }

  // ==========================================
  // TIỆN ÍCH
  // ==========================================

  function monthKeyOf(date) {
    const d = new Date(date.getTime() + 7 * 3600 * 1000);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  function prevMonthKey(key) {
    let [y, m] = key.split('-').map(Number);
    m -= 1;
    if (m === 0) { m = 12; y -= 1; }
    return `${y}-${String(m).padStart(2, '0')}`;
  }

  function monthLabel(key, short) {
    const [y, m] = key.split('-');
    return short ? `T${Number(m)}/${y.slice(2)}` : `${m}/${y}`;
  }

  function niceStep(raw) {
    if (!raw) return 250000;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
  }

  function shortMoney(v) {
    if (v >= 1e6) return `${(v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
    if (v >= 1e3) return `${Math.round(v / 1e3)}k`;
    return String(v);
  }

  function courseName(id, fallback) {
    const course = typeof COURSES_DATA !== 'undefined' ? COURSES_DATA.find(c => c.id === id) : null;
    return course ? (course.shortTitle || course.title) : (fallback || id || '');
  }

  function formatPhone(p) {
    const d = String(p).replace(/\D/g, '');
    return d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : p;
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('vi-VN');
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fold(str) {
    return String(str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').trim();
  }

  function showToast(message, type) {
    const container = $('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${esc(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // Tab theo hash trên URL: admin.html#hoc-vien | admin.html#doanh-thu (link từ menu "Quản lý" trên header)
  const TAB_BY_HASH = { 'hoc-vien': 'students', 'doanh-thu': 'revenue' };

  function selectTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      const active = b.dataset.tab === name;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${name}`));
  }

  // Mở tab có kiểm tra quyền: tab doanh thu chưa có mật khẩu Kế toán → hiện popup, vẫn đứng ở tab hiện tại.
  function showTab(name) {
    if (name === 'revenue' && !state.accountantOk) {
      if (isActive()) openAccountantModal();
      return;
    }
    selectTab(name);
    if (name === 'revenue') {
      updateRevenueLock();
      renderRevenue();
    }
    const hash = Object.keys(TAB_BY_HASH).find(k => TAB_BY_HASH[k] === name);
    if (hash && window.location.hash !== `#${hash}`) history.replaceState(null, '', `#${hash}`);
  }

  function selectTabFromHash() {
    const tab = TAB_BY_HASH[window.location.hash.slice(1)];
    if (tab) showTab(tab);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isActive()) refresh(true);
    });
    window.addEventListener('hashchange', selectTabFromHash);
    selectTabFromHash();
    boot();
  });
})();
