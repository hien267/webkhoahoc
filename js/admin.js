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
    pollTimer: null
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
    render();
    return true;
  }

  // ==========================================
  // RENDER
  // ==========================================

  function render() {
    renderKpis();
    renderTable();
    renderRevenue();
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

    $('kpi-grid').innerHTML = cards.map(c => `
      <div class="kpi-card">
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
        <tr class="empty-row"><td colspan="7">
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
          <td><button class="btn btn-outline btn-sm" style="white-space:nowrap;" data-open-lead="${esc(lead.id)}">Chi tiết</button></td>
        </tr>`;
    }).join('');
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
    const header = ['Họ tên', 'Số điện thoại', 'Email', 'Đăng nhập bằng', 'Khóa học quan tâm', 'Khóa đã đăng ký', 'Tình trạng thanh toán', 'Số tiền đã thanh toán', 'Ngày đăng ký'];
    const rows = filteredLeads().map(l => [
      l.fullName,
      l.phone ? `="${l.phone}"` : '',
      l.email,
      l.provider === 'google' ? 'Google' : 'SĐT',
      l.interestedCourseTitle || '',
      (l.enrollments || []).map(e => `${courseName(e.courseId, e.courseTitle)} (${STATUS_META[e.status] ? STATUS_META[e.status].label : e.status})`).join('; '),
      STATUS_META[Model.leadStatus(l)].label,
      Model.paidAmount(l),
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

    document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
      selectTab(btn.dataset.tab);
      const hash = Object.keys(TAB_BY_HASH).find(k => TAB_BY_HASH[k] === btn.dataset.tab);
      if (hash) history.replaceState(null, '', `#${hash}`);
    }));

    $('filter-search').addEventListener('input', e => { state.search = e.target.value; renderTable(); });
    $('filter-status').addEventListener('change', e => { state.status = e.target.value; renderTable(); });
    $('breakdown-month').addEventListener('change', e => { state.breakdownMonth = e.target.value; renderBreakdown(); });

    $('students-tbody').addEventListener('click', e => {
      const btn = e.target.closest('[data-open-lead]');
      if (btn) openLeadModal(btn.dataset.openLead);
    });

    $('lead-modal-body').addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (btn) onLeadModalAction(btn);
    });
    $('lead-modal-close').addEventListener('click', closeLeadModal);
    $('lead-modal').addEventListener('click', e => { if (e.target.id === 'lead-modal') closeLeadModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.openLeadId) closeLeadModal(); });
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

  function selectTabFromHash() {
    const tab = TAB_BY_HASH[window.location.hash.slice(1)];
    if (tab) selectTab(tab);
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
