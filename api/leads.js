/**
 * VERCEL SERVERLESS FUNCTION — /api/leads
 * Lưu Lead/Học viên lên Upstash Redis để trang admin.html xem được dữ liệu từ MỌI thiết bị khách.
 *
 * Biến môi trường cần có trên Vercel (Project → Settings → Environment Variables):
 *   - ADMIN_KEY                       : mật khẩu đăng nhập admin.html (tự đặt, dài & khó đoán)
 *   - KV_REST_API_URL / KV_REST_API_TOKEN  (tự sinh khi thêm Upstash Redis từ Vercel Marketplace)
 *     hoặc UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *
 * GET    ?id=<leadId>            (công khai)  → chỉ trả trạng thái các khóa của học viên đó
 * GET    header x-admin-key      (quản trị)   → toàn bộ danh sách Lead
 * POST   { lead }                (công khai)  → tạo/gộp Lead; KHÔNG thể tự đánh dấu "đã thanh toán"
 * GET    ?proof=<leadId> + header x-admin-key (quản trị) → ảnh minh chứng Sale chốt khách (data URL)
 * PATCH  header x-admin-key { action, id, ... } (quản trị) → xác nhận/hủy thanh toán, xóa Lead,
 *        ghi nhận Sale chốt khách (set_sale + ảnh minh chứng) / gỡ ghi nhận (clear_sale)
 *
 * Khi chưa cấu hình, luôn trả HTTP 200 kèm { configured: false } để trình duyệt không báo lỗi console.
 */
const crypto = require('crypto');
const Model = require('../js/lead-model.js');

const HASH_KEY = 'eduai:leads';
// Ảnh minh chứng lưu ở hash riêng để danh sách Lead (tải lại mỗi 30s) không bị nặng.
const PROOF_KEY = 'eduai:sale-proofs';
const MAX_PROOF_CHARS = 1500000; // ~1.1 MB ảnh — trình duyệt đã nén JPEG trước khi gửi
const PROOF_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_KEY = process.env.ADMIN_KEY || '';

async function redis(command) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

async function getLead(id) {
  const raw = await redis(['HGET', HASH_KEY, id]);
  return raw ? JSON.parse(raw) : null;
}

async function saveLead(lead) {
  await redis(['HSET', HASH_KEY, lead.id, JSON.stringify(lead)]);
}

function isAdmin(req) {
  const given = String(req.headers['x-admin-key'] || '');
  if (!ADMIN_KEY || !given) return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(ADMIN_KEY).digest();
  return crypto.timingSafeEqual(a, b);
}

function validId(id) {
  return typeof id === 'string' && id.length <= 160 && /^[ep]:[^\s]+$/.test(id);
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch (e) {
    return {};
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (!REDIS_URL || !REDIS_TOKEN || !ADMIN_KEY) {
    return res.status(200).json({ ok: false, configured: false });
  }

  try {
    if (req.method === 'GET') {
      if (req.query && req.query.proof) {
        if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'Sai mật khẩu quản trị' });
        if (!validId(req.query.proof)) return res.status(400).json({ ok: false, error: 'id không hợp lệ' });
        const proof = await redis(['HGET', PROOF_KEY, req.query.proof]);
        return res.status(200).json({ ok: true, proof: proof || '' });
      }
      if (req.query && req.query.id) {
        if (!validId(req.query.id)) return res.status(200).json({ ok: false });
        const lead = await getLead(req.query.id);
        const enrollments = lead ? (lead.enrollments || []).map(e => ({ courseId: e.courseId, status: e.status, paidAt: e.paidAt })) : [];
        return res.status(200).json({ ok: true, enrollments });
      }
      if (!req.headers['x-admin-key']) {
        return res.status(200).json({ ok: false, configured: true, authRequired: true });
      }
      if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'Sai mật khẩu quản trị' });

      const flat = (await redis(['HGETALL', HASH_KEY])) || [];
      const leads = [];
      for (let i = 1; i < flat.length; i += 2) {
        try { leads.push(JSON.parse(flat[i])); } catch (e) { /* bỏ bản ghi hỏng */ }
      }
      leads.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      return res.status(200).json({ ok: true, configured: true, leads });
    }

    if (req.method === 'POST') {
      const patch = (readBody(req).lead) || {};
      const id = Model.leadIdFor(patch);
      if (!validId(id)) return res.status(400).json({ ok: false, error: 'Thiếu email hoặc số điện thoại' });
      const lead = Model.mergeLead(await getLead(id), Object.assign({}, patch, { id }), { allowPaid: false });
      lead.id = id;
      await saveLead(lead);
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'PATCH') {
      if (!isAdmin(req)) return res.status(401).json({ ok: false, error: 'Sai mật khẩu quản trị' });
      const body = readBody(req);
      if (!validId(body.id)) return res.status(400).json({ ok: false, error: 'id không hợp lệ' });

      if (body.action === 'delete') {
        await redis(['HDEL', HASH_KEY, body.id]);
        await redis(['HDEL', PROOF_KEY, body.id]);
        return res.status(200).json({ ok: true });
      }

      const existing = await getLead(body.id);
      if (!existing) return res.status(404).json({ ok: false, error: 'Không tìm thấy học viên' });

      if (body.action === 'set_status' && body.courseId && (body.status === 'paid' || body.status === 'pending')) {
        const lead = Model.mergeLead(existing, {
          enrollment: {
            courseId: body.courseId,
            courseTitle: body.courseTitle,
            amount: body.amount,
            status: body.status,
            transactionId: body.transactionId
          }
        }, { allowPaid: true });
        await saveLead(lead);
        return res.status(200).json({ ok: true, lead });
      }

      if (body.action === 'set_sale') {
        const proof = String(body.proof || '');
        if (!proof || proof.length > MAX_PROOF_CHARS || !PROOF_RE.test(proof)) {
          return res.status(400).json({ ok: false, error: 'Thiếu ảnh minh chứng hoặc ảnh quá lớn' });
        }
        const result = Model.setSaleClose(existing, body.saleId);
        if (!result.ok) return res.status(409).json({ ok: false, error: result.error });
        await redis(['HSET', PROOF_KEY, body.id, proof]);
        await saveLead(result.lead);
        return res.status(200).json({ ok: true, lead: result.lead });
      }

      if (body.action === 'clear_sale') {
        const lead = Model.clearSaleClose(existing);
        await saveLead(lead);
        await redis(['HDEL', PROOF_KEY, body.id]);
        return res.status(200).json({ ok: true, lead });
      }

      if (body.action === 'remove_enrollment' && body.courseId) {
        existing.enrollments = (existing.enrollments || []).filter(e => e.courseId !== body.courseId);
        existing.updatedAt = new Date().toISOString();
        await saveLead(existing);
        return res.status(200).json({ ok: true, lead: existing });
      }

      return res.status(400).json({ ok: false, error: 'action không hợp lệ' });
    }

    res.setHeader('Allow', 'GET, POST, PATCH');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/leads]', err);
    return res.status(500).json({ ok: false, error: 'Lỗi máy chủ' });
  }
};
