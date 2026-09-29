/**
 * EDUSTORE — Phiên đăng nhập, lưu Lead (localStorage + đồng bộ cloud), GA4 event và tiện ích dùng chung.
 * Phụ thuộc: js/config.js, js/lead-model.js (và js/data.js nếu cần tra giá khóa học).
 */
(function () {
  'use strict';

  const CFG = window.EDUAI_CONFIG || {};
  const Model = window.EduLeadModel;
  const KEYS = {
    auth: 'eduai_auth_user',
    leads: 'eduai_leads_data'
  };

  // ---------- localStorage an toàn (không văng lỗi ở chế độ ẩn danh / bị chặn) ----------
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[EduStore] Không thể ghi localStorage:', e);
    }
  }

  function priceOf(courseId) {
    const list = typeof COURSES_DATA !== 'undefined' ? COURSES_DATA : [];
    const course = list.find(c => c.id === courseId);
    return course ? course.price : 0;
  }

  // ---------- Leads (bản sao lưu cục bộ) ----------
  function loadLeads() {
    const raw = readJSON(KEYS.leads, []);
    if (!Array.isArray(raw)) return [];
    // Gộp các bản ghi cũ trùng người (định dạng cũ khóa theo SĐT) về cùng 1 id.
    const byId = new Map();
    raw.map(l => Model.normalizeLead(l, priceOf)).filter(Boolean).forEach(lead => {
      const prev = byId.get(lead.id);
      if (!prev) { byId.set(lead.id, lead); return; }
      const merged = Object.assign({}, prev, lead);
      merged.enrollments = prev.enrollments.concat(lead.enrollments.filter(e => !prev.enrollments.some(p => p.courseId === e.courseId)));
      byId.set(lead.id, merged);
    });
    return Array.from(byId.values());
  }

  function saveLeads(leads) {
    writeJSON(KEYS.leads, leads);
  }

  function getLead(id) {
    return loadLeads().find(l => l.id === id) || null;
  }

  /**
   * Ghi/gộp Lead vào localStorage và đẩy lên cloud (nếu có).
   * @param {Object} patch - fullName, email, phone, provider, interestedCourseId, ..., enrollment
   * @param {Object} [opts] - { allowPaid, skipCloud }
   */
  function upsertLead(patch, opts) {
    const options = opts || {};
    const id = patch.id || Model.leadIdFor(patch);
    if (!id) return null;

    const leads = loadLeads();
    const idx = leads.findIndex(l => l.id === id);
    const lead = Model.mergeLead(idx >= 0 ? leads[idx] : null, Object.assign({}, patch, { id }), options);
    lead.id = id;
    if (idx >= 0) leads[idx] = lead;
    else leads.unshift(lead);
    saveLeads(leads);

    if (!options.skipCloud) pushToCloud(Object.assign({}, patch, { id }));
    return lead;
  }

  function replaceLeads(leads) {
    saveLeads(leads);
  }

  // ---------- Đồng bộ cloud (Vercel Serverless /api/leads) ----------
  function cloudEnabled() {
    if (!CFG.LEADS_API_URL) return false;
    const { protocol, hostname } = window.location;
    if (protocol === 'file:') return false;
    return !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(hostname);
  }

  function pushToCloud(patch) {
    if (!cloudEnabled()) return;
    const body = JSON.stringify({ lead: patch });
    try {
      fetch(CFG.LEADS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(() => {});
    } catch (e) {
      /* bỏ qua — localStorage vẫn giữ bản sao */
    }
  }

  // Học viên lấy trạng thái thanh toán mới nhất (quản trị viên xác nhận trên cloud).
  async function fetchCloudEnrollments(id) {
    if (!cloudEnabled() || !id) return null;
    try {
      const res = await fetch(`${CFG.LEADS_API_URL}?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      return data && data.ok && Array.isArray(data.enrollments) ? data.enrollments : null;
    } catch (e) {
      return null;
    }
  }

  // ---------- Mật khẩu Trang quản lý ----------
  // Cloud (Upstash + ADMIN_KEY đã cấu hình): máy chủ kiểm tra mật khẩu, dữ liệu chỉ trả về khi đúng.
  // Cục bộ: so mã băm SHA-256 với CFG.ADMIN_PASSWORD_SHA256 (mặc định là "abc").
  const ADMIN_SESSION_KEY = 'eduai_admin_key';
  let adminModePromise = null;

  function adminMode() {
    if (!adminModePromise) {
      adminModePromise = (async () => {
        if (!cloudEnabled()) return 'local';
        try {
          const probe = await (await fetch(CFG.LEADS_API_URL, { cache: 'no-store' })).json();
          return probe && probe.configured !== false ? 'cloud' : 'local';
        } catch (e) {
          return 'local';
        }
      })();
    }
    return adminModePromise;
  }

  async function sha256Hex(text) {
    if (!window.crypto || !crypto.subtle) throw new Error('no-subtle-crypto');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Kiểm tra mật khẩu quản trị. Đúng thì ghi nhớ trong phiên (sessionStorage, mất khi đóng trình duyệt).
   * @returns {Promise<{ok: boolean, mode: 'cloud'|'local', leads?: Array, error?: string}>}
   */
  async function verifyAdminKey(key) {
    const mode = await adminMode();
    const fail = error => { setAdminSession(null); return { ok: false, mode, error }; };
    if (!key) return fail('Vui lòng nhập mật khẩu quản trị.');

    if (mode === 'cloud') {
      try {
        const res = await fetch(CFG.LEADS_API_URL, { headers: { 'x-admin-key': key }, cache: 'no-store' });
        const data = await res.json();
        if (res.status === 401 || !data.ok) return fail('Mật khẩu quản trị không đúng.');
        setAdminSession(key);
        return { ok: true, mode, leads: data.leads || [] };
      } catch (e) {
        return fail('Không kết nối được máy chủ, vui lòng thử lại.');
      }
    }

    try {
      if ((await sha256Hex(key)) !== String(CFG.ADMIN_PASSWORD_SHA256 || '').toLowerCase()) {
        return fail('Mật khẩu quản trị không đúng.');
      }
    } catch (e) {
      return fail('Trình duyệt không hỗ trợ kiểm tra mật khẩu, hãy mở trang qua https://.');
    }
    setAdminSession(key);
    return { ok: true, mode };
  }

  function getAdminSession() {
    try { return sessionStorage.getItem(ADMIN_SESSION_KEY) || ''; } catch (e) { return ''; }
  }

  function setAdminSession(key) {
    try {
      if (key) sessionStorage.setItem(ADMIN_SESSION_KEY, key);
      else sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (e) { /* bỏ qua */ }
  }

  // ---------- Phiên đăng nhập ----------
  function getUser() {
    const user = readJSON(KEYS.auth, null);
    return user && user.id && user.fullName ? user : null;
  }

  function setUser(data) {
    const prev = getUser() || {};
    const user = {
      id: Model.leadIdFor(data.email ? data : Object.assign({}, prev, data)) || prev.id,
      fullName: data.fullName || prev.fullName || '',
      email: (data.email || prev.email || '').toLowerCase(),
      phone: Model.normalizePhone(data.phone || prev.phone || ''),
      provider: data.provider || prev.provider || 'phone',
      avatarUrl: data.avatarUrl || prev.avatarUrl || '',
      loggedInAt: prev.loggedInAt || new Date().toISOString()
    };
    writeJSON(KEYS.auth, user);
    window.dispatchEvent(new CustomEvent('eduai:auth', { detail: user }));
    return user;
  }

  function logout() {
    writeJSON(KEYS.auth, null);
    window.dispatchEvent(new CustomEvent('eduai:auth', { detail: null }));
  }

  // Giải mã payload ID token của Google (JWT) để lấy tên/email/ảnh.
  function decodeGoogleCredential(token) {
    try {
      const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = part + '='.repeat((4 - (part.length % 4)) % 4);
      const bytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder('utf-8').decode(bytes));
    } catch (e) {
      return null;
    }
  }

  // ---------- Kiểm tra dữ liệu ----------
  const validate = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()),
    phone: v => /^0(3|5|7|8|9)\d{8}$/.test(Model.normalizePhone(v))
  };

  // ---------- Google Analytics 4 ----------
  function track(eventName, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', eventName, params || {});
    } catch (e) {
      /* GA4 không được phép làm hỏng trải nghiệm */
    }
  }

  // ---------- Tiện ích hiển thị ----------
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(Number(amount) || 0)) + ' đ';
  }

  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'GV';
    const last = parts[parts.length - 1];
    return (parts.length > 1 ? parts[0][0] + last[0] : last.slice(0, 2)).toUpperCase();
  }

  window.EduStore = {
    KEYS,
    getUser,
    setUser,
    logout,
    decodeGoogleCredential,
    loadLeads,
    replaceLeads,
    getLead,
    upsertLead,
    cloudEnabled,
    fetchCloudEnrollments,
    adminMode,
    verifyAdminKey,
    getAdminSession,
    setAdminSession,
    validate,
    track,
    escapeHtml,
    formatCurrency,
    initials,
    priceOf
  };
})();
