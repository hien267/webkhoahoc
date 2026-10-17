/**
 * VERCEL SERVERLESS FUNCTION — /api/ai  (Trợ lý AI Sư phạm, trang assistant.html)
 * Trình duyệt gửi lịch sử hội thoại → máy chủ gọi Google Gemini → trả chữ về dần (streaming, text/plain).
 * API key KHÔNG bao giờ ra tới trình duyệt.
 *
 * Biến môi trường trên Vercel (Project → Settings → Environment Variables):
 *   - GEMINI_API_KEY   : key tạo ở https://aistudio.google.com (mục "Get API key")
 *   - GEMINI_MODEL     : (tùy chọn) tên mô hình, mặc định 'gemini-flash-latest' — luôn trỏ bản Flash mới nhất
 *   - KV_REST_API_URL / KV_REST_API_TOKEN : (đã có sẵn cho /api/leads) dùng để giới hạn số lượt hỏi mỗi ngày
 *
 * POST { messages: [{ role: 'user'|'model', text }] }
 *   → 200 text/plain (chữ trả lời, chảy dần)
 *   → 4xx/5xx application/json { error } khi lỗi trước lúc bắt đầu trả lời
 */
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const DAILY_LIMIT_PER_IP = 40;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 12000;
const MAX_TOTAL_CHARS = 60000;

const SYSTEM_PROMPT = `Bạn là "Trợ lý AI Sư phạm" của EduAI Teacher Hub — chuyên gia giáo dục Việt Nam giàu kinh nghiệm, am hiểu Chương trình GDPT 2018, Công văn 5512/BGDĐT-GDTrH (Kế hoạch bài dạy), các thông tư đánh giá học sinh (Thông tư 27/2020 cho Tiểu học, Thông tư 22/2021 cho THCS-THPT), cách xây dựng ma trận - bản đặc tả đề kiểm tra, viết Sáng kiến kinh nghiệm và nghiên cứu khoa học sư phạm, cùng các công cụ AI cho giáo viên (ChatGPT, Gemini, Canva, Gamma, Quizizz...).

Cách làm việc:
- Xưng "em", gọi người dùng là "Thầy/Cô". Văn phong sư phạm, ấm áp, rõ ràng, chuẩn chính tả tiếng Việt.
- Trả lời bằng Markdown: tiêu đề (##, ###), gạch đầu dòng, **in đậm** ý chính; dùng bảng khi trình bày ma trận, kế hoạch, so sánh.
- Sản phẩm phải dùng được ngay (giáo án, đề, nhận xét, dàn ý...), đúng cấu trúc văn bản hành chính - chuyên môn hiện hành.
- Nếu yêu cầu còn thiếu thông tin (môn, lớp, bộ sách, thời lượng...), hãy tự chọn giả định hợp lý, ghi rõ giả định ở đầu câu trả lời rồi vẫn làm đầy đủ; cuối bài mời Thầy/Cô bổ sung để chỉnh sửa.
- Không bịa số liệu khảo sát, trích dẫn, số hiệu văn bản hay tên tác giả. Số liệu minh họa phải ghi rõ "(số liệu minh họa — Thầy/Cô thay bằng số liệu thực tế)". Khi không chắc về quy định, nói rõ và khuyên đối chiếu văn bản gốc.
- Với nhận xét học sinh: không dùng tên thật, đa dạng từ ngữ, tránh lặp, mang tính động viên và cụ thể.
- Vẫn trả lời mọi câu hỏi khác ngoài chuyên môn một cách hữu ích, ngắn gọn.`;

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

// Giới hạn số lượt hỏi mỗi ngày theo IP để người lạ không dùng hết hạn mức miễn phí của Gemini.
// Redis lỗi/chưa cấu hình thì cho qua (không chặn giáo viên vì lỗi hạ tầng).
async function overDailyLimit(req) {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const day = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10); // ngày theo giờ VN
  const key = `eduai:ai-usage:${day}:${ip}`;
  try {
    const count = await redis(['INCR', key]);
    if (count === 1) await redis(['EXPIRE', key, 2 * 24 * 3600]);
    return count > DAILY_LIMIT_PER_IP;
  } catch (e) {
    return false;
  }
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch (e) {
    return {};
  }
}

// Chuẩn hóa lịch sử hội thoại: chỉ giữ role/text hợp lệ, cắt bớt tin cũ khi quá dài.
function toContents(messages) {
  if (!Array.isArray(messages)) return null;
  const list = messages
    .filter(m => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, text: m.text.slice(0, MAX_MESSAGE_CHARS) }));
  let total = list.reduce((sum, m) => sum + m.text.length, 0);
  while (list.length > 1 && total > MAX_TOTAL_CHARS) total -= list.shift().text.length;
  while (list.length && list[0].role !== 'user') list.shift();
  if (!list.length || list[list.length - 1].role !== 'user') return null;
  return list.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
}

function callGemini(contents, withThinkingLevel) {
  const generationConfig = { temperature: 0.8, maxOutputTokens: 8192 };
  // Bớt thời gian "suy nghĩ" để chữ bắt đầu hiện nhanh hơn
  if (withThinkingLevel) generationConfig.thinkingConfig = { thinkingLevel: 'low' };
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig
    })
  });
}

function friendlyError(status) {
  if (status === 429) return 'Trợ lý AI đang có quá nhiều lượt hỏi cùng lúc (giới hạn gói miễn phí của Google). Thầy/Cô vui lòng thử lại sau ít phút nhé.';
  if (status === 400 || status === 403) return 'Máy chủ AI từ chối yêu cầu (có thể API key hết hiệu lực). Thầy/Cô vui lòng báo quản trị viên.';
  return 'Máy chủ AI đang bận hoặc gián đoạn. Thầy/Cô vui lòng thử lại sau ít phút.';
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ hỗ trợ POST.' });
  if (!GEMINI_KEY) return res.status(503).json({ error: 'Trợ lý AI chưa được cấu hình (thiếu GEMINI_API_KEY).' });

  const contents = toContents(readBody(req).messages);
  if (!contents) return res.status(400).json({ error: 'Nội dung câu hỏi không hợp lệ.' });

  if (await overDailyLimit(req)) {
    return res.status(429).json({ error: `Thầy/Cô đã dùng hết ${DAILY_LIMIT_PER_IP} lượt hỏi miễn phí hôm nay. Hẹn gặp lại Thầy/Cô vào ngày mai nhé!` });
  }

  let upstream;
  try {
    upstream = await callGemini(contents, true);
    // Mô hình mới hơn có thể không nhận thinkingLevel → gọi lại không kèm cấu hình này
    if (upstream.status === 400) upstream = await callGemini(contents, false);
  } catch (e) {
    return res.status(502).json({ error: friendlyError(502) });
  }
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    console.error('Gemini error', upstream.status, detail.slice(0, 500));
    return res.status(upstream.status === 429 ? 429 : 502).json({ error: friendlyError(upstream.status) });
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Accel-Buffering': 'no'
  });

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finishReason = '';
  let wroteAny = false;

  const handleEvent = line => {
    if (!line.startsWith('data:')) return;
    let data;
    try {
      data = JSON.parse(line.slice(5).trim());
    } catch (e) {
      return;
    }
    const cand = data.candidates && data.candidates[0];
    if (!cand) return;
    if (cand.finishReason) finishReason = cand.finishReason;
    const parts = (cand.content && cand.content.parts) || [];
    const text = parts.filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('');
    if (text) {
      wroteAny = true;
      res.write(text);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf('\n')) >= 0) {
        handleEvent(buffer.slice(0, idx).trim());
        buffer = buffer.slice(idx + 1);
      }
    }
    if (buffer.trim()) handleEvent(buffer.trim());
    if (finishReason === 'MAX_TOKENS') res.write('\n\n> ⚠️ Câu trả lời dài nên bị ngắt giữa chừng. Thầy/Cô gõ **"Viết tiếp"** để em hoàn thành phần còn lại.');
    else if (!wroteAny) res.write('Xin lỗi Thầy/Cô, em chưa thể trả lời câu hỏi này. Thầy/Cô thử diễn đạt lại giúp em nhé.');
  } catch (e) {
    res.write('\n\n> ⚠️ Kết nối tới máy chủ AI bị gián đoạn. Thầy/Cô bấm **Gửi lại** hoặc gõ "Viết tiếp".');
  }
  res.end();
};
