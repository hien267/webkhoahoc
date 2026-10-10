/**
 * MÔ HÌNH DỮ LIỆU LEAD / HỌC VIÊN — dùng chung cho trình duyệt (window.EduLeadModel)
 * và Vercel Serverless Function (require('../js/lead-model.js')), để 2 nơi gộp dữ liệu giống hệt nhau.
 *
 * Lead = {
 *   id, fullName, email, phone, provider ('google' | 'phone'), avatarUrl,
 *   interestedCourseId, interestedCourseTitle, matchRate,
 *   enrollments: [{ courseId, courseTitle, amount, status: 'pending' | 'paid', transactionId, createdAt, paidAt }],
 *   closedBy: { saleId, closedAt } | undefined,
 *   createdAt, updatedAt, lastLoginAt
 * }
 * - closedBy: Sale đã chốt khách (kèm ảnh minh chứng lưu riêng, không nằm trong Lead). Chỉ ghi được
 *   khi học viên CHƯA thanh toán; chỉ quản trị viên ghi được (khách không thể tự gán).
 * - 'pending': khách bấm "Tôi đã chuyển khoản" (chưa đối soát).
 * - 'paid'   : quản trị viên đã xác nhận nhận tiền → mới được tính vào doanh thu.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EduLeadModel = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PROFILE_FIELDS = ['fullName', 'email', 'phone', 'provider', 'avatarUrl', 'interestedCourseId', 'interestedCourseTitle', 'matchRate'];
  const MAX_TEXT = 200;

  function normalizePhone(phone) {
    let digits = String(phone || '').replace(/[^\d+]/g, '');
    if (digits.startsWith('+84')) digits = '0' + digits.slice(3);
    else if (digits.startsWith('84') && digits.length === 11) digits = '0' + digits.slice(2);
    return digits.replace(/\D/g, '');
  }

  function leadIdFor(data) {
    const email = String(data.email || '').trim().toLowerCase();
    if (email) return 'e:' + email;
    const phone = normalizePhone(data.phone);
    return phone ? 'p:' + phone : '';
  }

  function clean(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    return String(value).trim().slice(0, MAX_TEXT);
  }

  // Chuyển Lead định dạng cũ (courseId/status/paidAt ở cấp ngoài) sang định dạng mới.
  function normalizeLead(lead, priceOf) {
    if (!lead || typeof lead !== 'object') return null;
    const out = Object.assign({}, lead);
    if (!Array.isArray(out.enrollments)) {
      out.enrollments = [];
      if (lead.courseId && (lead.status === 'paid' || lead.status === 'pending')) {
        out.enrollments.push({
          courseId: lead.courseId,
          courseTitle: lead.courseTitle || '',
          amount: (priceOf && priceOf(lead.courseId)) || 0,
          status: lead.status,
          transactionId: lead.transactionId || '',
          createdAt: lead.paidAt || lead.updatedAt || lead.createdAt,
          paidAt: lead.status === 'paid' ? (lead.paidAt || lead.updatedAt) : null
        });
      }
    }
    if (!out.interestedCourseId && lead.courseId) out.interestedCourseId = lead.courseId;
    if (!out.interestedCourseTitle && lead.courseTitle) out.interestedCourseTitle = lead.courseTitle;
    if (!out.phone || out.phone === 'Chưa cung cấp') out.phone = '';
    if (!out.provider) out.provider = 'phone';
    ['courseId', 'courseTitle', 'status', 'paidAt'].forEach(k => delete out[k]);
    out.id = out.id && /^[ep]:/.test(out.id) ? out.id : leadIdFor(out) || out.id;
    return out;
  }

  /**
   * Gộp patch vào lead hiện có (hoặc tạo mới).
   * @param {Object|null} existing
   * @param {Object} patch - các trường hồ sơ + tùy chọn patch.enrollment
   * @param {Object} [opts] - { allowPaid: true } chỉ dành cho quản trị viên
   */
  function mergeLead(existing, patch, opts) {
    const allowPaid = !!(opts && opts.allowPaid);
    const now = new Date().toISOString();
    const lead = existing ? Object.assign({}, existing) : { createdAt: now, enrollments: [] };
    lead.enrollments = (lead.enrollments || []).map(e => Object.assign({}, e));

    PROFILE_FIELDS.forEach(field => {
      const val = clean(patch[field]);
      if (val !== undefined && val !== null && val !== '') lead[field] = val;
    });
    if (lead.phone) lead.phone = normalizePhone(lead.phone);
    if (lead.email) lead.email = String(lead.email).toLowerCase();
    if (patch.lastLoginAt) lead.lastLoginAt = now;

    const enr = patch.enrollment;
    if (enr && enr.courseId) {
      const wantPaid = allowPaid && enr.status === 'paid';
      const idx = lead.enrollments.findIndex(e => e.courseId === enr.courseId);
      const prev = idx >= 0 ? lead.enrollments[idx] : null;
      if (prev && prev.status === 'paid' && !allowPaid) {
        // Khách không được ghi đè một khóa đã được xác nhận thanh toán.
      } else {
        const next = {
          courseId: clean(enr.courseId),
          courseTitle: clean(enr.courseTitle) || (prev && prev.courseTitle) || '',
          amount: Math.max(0, Math.round(Number(enr.amount != null ? enr.amount : (prev && prev.amount) || 0)) || 0),
          status: wantPaid ? 'paid' : 'pending',
          transactionId: clean(enr.transactionId) || (prev && prev.transactionId) || '',
          createdAt: (prev && prev.createdAt) || now,
          paidAt: wantPaid ? ((prev && prev.status === 'paid' && prev.paidAt) || now) : null
        };
        if (idx >= 0) lead.enrollments[idx] = next;
        else lead.enrollments.push(next);
      }
    }

    lead.id = lead.id || leadIdFor(lead);
    lead.updatedAt = now;
    return lead;
  }

  function leadStatus(lead) {
    const list = (lead && lead.enrollments) || [];
    if (list.some(e => e.status === 'paid')) return 'paid';
    if (list.some(e => e.status === 'pending')) return 'pending';
    return 'unpaid';
  }

  function paidAmount(lead) {
    return ((lead && lead.enrollments) || [])
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  // Tháng 'YYYY-MM' theo giờ Việt Nam của một mốc thời gian ISO ('' nếu không hợp lệ).
  function vnMonthKey(iso) {
    const d = new Date(new Date(iso).getTime() + 7 * 3600 * 1000);
    if (!iso || isNaN(d)) return '';
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
  }

  const SALE_ID_RE = /^sale[1-9]\d?$/;

  /**
   * Ghi nhận Sale đã chốt khách. Trả về { ok, lead } hoặc { ok: false, error }.
   * Không cho ghi khi học viên đã thanh toán (khách đã chốt xong thì không còn để Sale nhận).
   */
  function setSaleClose(lead, saleId) {
    if (!SALE_ID_RE.test(String(saleId || ''))) return { ok: false, error: 'Mã Sale không hợp lệ' };
    if (leadStatus(lead) === 'paid') return { ok: false, error: 'Học viên đã thanh toán, không cần ghi nhận chốt khách' };
    const now = new Date().toISOString();
    return { ok: true, lead: Object.assign({}, lead, { closedBy: { saleId, closedAt: now }, updatedAt: now }) };
  }

  function clearSaleClose(lead) {
    const out = Object.assign({}, lead, { updatedAt: new Date().toISOString() });
    delete out.closedBy;
    return out;
  }

  /**
   * Thống kê hoa hồng theo từng Sale.
   * @param {Array} leads
   * @param {number} rate - tỉ lệ hoa hồng (0.03 = 3%)
   * @param {string} [month] - 'YYYY-MM' (giờ VN, theo ngày xác nhận thanh toán); bỏ trống = toàn bộ thời gian
   * @returns {Object} saleId → { closedLeads, waitingLeads, courses, sales, commission }
   */
  function salesStats(leads, rate, month) {
    const stats = {};
    (leads || []).forEach(lead => {
      const saleId = lead && lead.closedBy && lead.closedBy.saleId;
      if (!saleId) return;
      const s = stats[saleId] || (stats[saleId] = { closedLeads: 0, waitingLeads: 0, courses: 0, sales: 0, commission: 0 });
      s.closedLeads += 1;
      const paid = (lead.enrollments || []).filter(e => e.status === 'paid' && e.paidAt && (!month || vnMonthKey(e.paidAt) === month));
      if (leadStatus(lead) !== 'paid') s.waitingLeads += 1;
      paid.forEach(e => {
        s.courses += 1;
        s.sales += Number(e.amount) || 0;
      });
    });
    Object.values(stats).forEach(s => { s.commission = Math.round(s.sales * (Number(rate) || 0)); });
    return stats;
  }

  // Doanh thu theo tháng 'YYYY-MM' (giờ Việt Nam) từ các khóa đã xác nhận thanh toán.
  function monthlyRevenue(leads) {
    const months = {};
    (leads || []).forEach(lead => {
      ((lead && lead.enrollments) || []).forEach(e => {
        if (e.status !== 'paid' || !e.paidAt) return;
        const key = vnMonthKey(e.paidAt);
        if (!key) return;
        if (!months[key]) months[key] = { month: key, revenue: 0, orders: 0, students: new Set() };
        months[key].revenue += Number(e.amount) || 0;
        months[key].orders += 1;
        months[key].students.add(lead.id);
      });
    });
    return Object.values(months)
      .map(m => ({ month: m.month, revenue: m.revenue, orders: m.orders, students: m.students.size }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  return {
    normalizePhone, leadIdFor, normalizeLead, mergeLead, leadStatus, paidAmount, monthlyRevenue,
    vnMonthKey, setSaleClose, clearSaleClose, salesStats
  };
});
