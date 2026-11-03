/**
 * VERCEL SERVERLESS FUNCTION — /api/quiz  (Game Kéo Co, trang keo-co.html)
 * Trình duyệt gửi nội dung tài liệu/giáo án → máy chủ gọi Google Gemini → trả về 10 câu trắc nghiệm (JSON).
 * Dùng chung GEMINI_API_KEY / GEMINI_MODEL với Trợ lý AI (/api/ai). API key KHÔNG ra tới trình duyệt.
 *
 * POST { text, topic? }
 *   → 200 { questions: [{ question, answers: [4 chuỗi], correct: 0..3 }] }
 *   → 4xx/5xx { error }
 */
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
// Mô hình dự phòng khi mô hình chính quá tải (503/429) hoặc treo quá lâu
const FALLBACK_MODEL = process.env.GEMINI_QUIZ_FALLBACK_MODEL || 'gemini-flash-lite-latest';
const ATTEMPT_TIMEOUT_MS = 50000;
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const DAILY_LIMIT_PER_IP = 20;
const MIN_TEXT_CHARS = 80;
const MAX_TEXT_CHARS = 40000;
const QUESTION_COUNT = 10;

const SYSTEM_PROMPT = `Bạn là chuyên gia khảo thí của EduAI Teacher Hub, soạn câu hỏi trắc nghiệm cho trò chơi kéo co trong lớp học Việt Nam.

NHIỆM VỤ: Đọc kỹ tài liệu/giáo án giáo viên cung cấp (bất kỳ môn nào: Văn, Toán, Sử, Địa, Khoa học, Tiếng Anh...) và soạn ĐÚNG ${QUESTION_COUNT} câu hỏi trắc nghiệm khách quan.

QUY TẮC NỘI DUNG:
- Mọi câu hỏi phải bám sát kiến thức CÓ TRONG tài liệu; không hỏi ngoài tài liệu, không bịa số liệu.
- Mỗi câu có đúng 4 phương án, chỉ 1 phương án đúng; 3 phương án nhiễu hợp lý, cùng dạng, độ dài tương đương đáp án đúng.
- Câu hỏi ngắn gọn (tối đa khoảng 25 từ), phương án ngắn (tối đa khoảng 12 từ) để học sinh đọc nhanh trên máy chiếu.
- Không dùng phương án "Tất cả các đáp án trên" / "Cả A và B". Không ghi chữ cái A/B/C/D trước phương án.
- Trải đều nội dung tài liệu, mức độ nhận biết – thông hiểu – vận dụng. Viết tiếng Việt chuẩn chính tả (trừ khi tài liệu là môn ngoại ngữ thì dùng ngôn ngữ của tài liệu).
- Vị trí đáp án đúng phân bố ngẫu nhiên giữa 0, 1, 2, 3.

ĐỊNH DẠNG ĐẦU RA (BẮT BUỘC):
- Chỉ trả về JSON thuần túy, KHÔNG markdown, KHÔNG \`\`\`json, KHÔNG lời dẫn hay giải thích.
- Là một mảng gồm đúng ${QUESTION_COUNT} phần tử, mỗi phần tử có dạng:
{"question": "Nội dung câu hỏi?", "answers": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], "correct": 0}
- "correct" là số nguyên từ 0 đến 3, là chỉ số của đáp án đúng trong mảng "answers".`;

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      question: { type: 'STRING' },
      answers: { type: 'ARRAY', items: { type: 'STRING' } },
      correct: { type: 'INTEGER' }
    },
    required: ['question', 'answers', 'correct'],
    propertyOrdering: ['question', 'answers', 'correct']
  }
};

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

// Giới hạn số lần tạo game mỗi ngày theo IP (Redis lỗi/chưa cấu hình thì cho qua).
async function overDailyLimit(req) {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const day = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10); // ngày theo giờ VN
  const key = `eduai:quiz-usage:${day}:${ip}`;
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

function callGemini(model, userText, withThinkingLevel) {
  const generationConfig = {
    temperature: 0.6,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
    responseSchema: RESPONSE_SCHEMA
  };
  if (withThinkingLevel) generationConfig.thinkingConfig = { thinkingLevel: 'low' };
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig
    })
  });
}

// Bóc JSON từ chữ Gemini trả về (phòng khi mô hình vẫn kèm ```json hoặc lời dẫn).
function parseQuestions(raw) {
  let text = String(raw || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) return [];
  let list;
  try {
    list = JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    return [];
  }
  if (!Array.isArray(list)) return [];
  return list
    .map(q => ({
      question: String((q && q.question) || '').trim().slice(0, 300),
      answers: Array.isArray(q && q.answers) ? q.answers.map(a => String(a || '').trim().replace(/^[A-D][.):]\s+/, '').slice(0, 160)) : [],
      correct: Number(q && q.correct)
    }))
    .filter(q => q.question && q.answers.length === 4 && q.answers.every(Boolean) && Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3)
    .slice(0, QUESTION_COUNT);
}

function friendlyError(status) {
  if (status === 429) return 'Máy chủ AI đang quá tải (giới hạn gói miễn phí của Google). Thầy/Cô thử lại sau ít phút nhé.';
  if (status === 400 || status === 403) return 'Máy chủ AI từ chối yêu cầu (có thể API key hết hiệu lực). Thầy/Cô vui lòng báo quản trị viên.';
  return 'Máy chủ AI đang bận hoặc gián đoạn. Thầy/Cô vui lòng thử lại sau ít phút.';
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ hỗ trợ POST.' });
  if (!GEMINI_KEY) return res.status(503).json({ error: 'Máy chủ AI chưa được cấu hình (thiếu GEMINI_API_KEY).' });

  const body = readBody(req);
  const text = String(body.text || '').trim();
  const topic = String(body.topic || '').trim().slice(0, 120);
  if (text.length < MIN_TEXT_CHARS) return res.status(400).json({ error: 'Tài liệu quá ngắn, Thầy/Cô bổ sung thêm nội dung (ít nhất vài câu) nhé.' });

  if (await overDailyLimit(req)) {
    return res.status(429).json({ error: `Thầy/Cô đã tạo ${DAILY_LIMIT_PER_IP} game hôm nay — hết lượt miễn phí. Hẹn gặp lại vào ngày mai nhé!` });
  }

  const userText = `${topic ? `Chủ đề/môn học: ${topic}\n\n` : ''}TÀI LIỆU CỦA GIÁO VIÊN:\n"""\n${text.slice(0, MAX_TEXT_CHARS)}\n"""\n\nHãy soạn đúng ${QUESTION_COUNT} câu hỏi trắc nghiệm theo đúng định dạng JSON đã quy định.`;

  let upstream = null;
  for (const model of [...new Set([MODEL, FALLBACK_MODEL])]) {
    try {
      upstream = await callGemini(model, userText, true);
      // Mô hình không nhận thinkingLevel → gọi lại không kèm cấu hình này
      if (upstream.status === 400) upstream = await callGemini(model, userText, false);
    } catch (e) {
      console.error('Gemini timeout/network', model, e.name);
      upstream = null;
      continue;
    }
    if (upstream.ok) break;
    const detail = await upstream.text().catch(() => '');
    console.error('Gemini error', model, upstream.status, detail.slice(0, 300));
    if (upstream.status !== 503 && upstream.status !== 429 && upstream.status !== 500) break;
  }
  if (!upstream || !upstream.ok) {
    const status = upstream ? upstream.status : 502;
    return res.status(status === 429 ? 429 : 502).json({ error: friendlyError(status) });
  }

  const data = await upstream.json().catch(() => null);
  const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
  const raw = parts.filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('');
  const questions = parseQuestions(raw);
  if (questions.length < 4) {
    console.error('Quiz parse failed', raw.slice(0, 500));
    return res.status(502).json({ error: 'AI chưa tạo được bộ câu hỏi hợp lệ từ tài liệu này. Thầy/Cô thử lại hoặc dán nội dung rõ ràng hơn nhé.' });
  }
  return res.status(200).json({ questions });
};
