/**
 * TRỢ LÝ AI SƯ PHẠM — trang assistant.html (cần đăng nhập)
 * Khung chat gọi /api/ai (Vercel Function → Google Gemini), chữ trả lời hiện dần (streaming).
 * Lịch sử hội thoại lưu trong sessionStorage (mất khi đóng tab). 5 nút gợi ý nhanh điền sẵn câu lệnh mẫu.
 */
(function () {
  'use strict';

  const Store = window.EduStore;
  const esc = Store.escapeHtml;
  const $ = id => document.getElementById(id);

  const API_URL = '/api/ai';
  const CHAT_KEY = 'eduai_ai_chat';
  const MAX_SEND_MESSAGES = 20;

  // Phần trong [ngoặc vuông] là chỗ Thầy/Cô sửa lại cho đúng bài của mình.
  const PRESETS = [
    {
      id: 'giao_an',
      icon: '📝',
      label: 'Soạn Giáo án 5512',
      chip: 'Giáo án 5512',
      desc: 'Kế hoạch bài dạy chuẩn 4 hoạt động',
      prompt: `Hãy soạn Kế hoạch bài dạy theo Phụ lục IV Công văn 5512 cho:
- Môn: [Ngữ văn]
- Lớp: [7]
- Tên bài: [Tên bài học]
- Bộ sách: [Kết nối tri thức với cuộc sống]
- Thời lượng: [2 tiết]

Yêu cầu: đủ I. Mục tiêu (kiến thức, năng lực, phẩm chất); II. Thiết bị dạy học và học liệu; III. Tiến trình dạy học gồm 4 hoạt động (Mở đầu, Hình thành kiến thức mới, Luyện tập, Vận dụng). Mỗi hoạt động trình bày a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện theo 4 bước (chuyển giao nhiệm vụ – thực hiện nhiệm vụ – báo cáo, thảo luận – kết luận, nhận định). Kèm phiếu học tập.`
    },
    {
      id: 'slide',
      icon: '🎨',
      label: 'Slide / Kịch bản bài giảng',
      chip: 'Slide & Kịch bản',
      desc: 'Chia nội dung từng slide cho Canva, Gamma',
      prompt: `Hãy viết kịch bản bài giảng trình chiếu cho bài [Tên bài học], môn [Khoa học tự nhiên], lớp [6], khoảng [12] slide, để em dán vào Gamma / Canva.

Với mỗi slide, trình bày: Tiêu đề; Nội dung chính (gạch đầu dòng ngắn gọn); Gợi ý hình ảnh / biểu tượng minh họa; Lời giảng của giáo viên (2–3 câu); Hoạt động tương tác với học sinh (nếu có).
Slide đầu là phần khởi động gây hứng thú, slide cuối là tổng kết và câu hỏi củng cố.`
    },
    {
      id: 'ma_tran',
      icon: '📊',
      label: 'Ma trận & Câu hỏi Trắc nghiệm',
      chip: 'Ma trận & Trắc nghiệm',
      desc: 'Tỉ lệ Nhận biết – Thông hiểu – Vận dụng',
      prompt: `Hãy xây dựng ma trận và bản đặc tả đề kiểm tra [giữa học kì I] môn [Toán], lớp [8], thời gian [90 phút].
- Phạm vi kiến thức: [Chương 1, Chương 2]
- Tỉ lệ mức độ: Nhận biết [40%] – Thông hiểu [30%] – Vận dụng [30%]
- Cấu trúc đề: [12] câu trắc nghiệm nhiều lựa chọn, [2] câu đúng/sai, [4] câu trả lời ngắn, [3] câu tự luận

Trình bày ma trận và bản đặc tả dạng bảng, sau đó soạn đề hoàn chỉnh kèm đáp án và hướng dẫn chấm.`
    },
    {
      id: 'skkn',
      icon: '📖',
      label: 'Viết Sáng kiến Kinh nghiệm',
      chip: 'Sáng kiến kinh nghiệm',
      desc: 'Cấu trúc 3 phần, hướng tới đạt giải cấp tỉnh',
      prompt: `Hãy giúp em xây dựng dàn ý chi tiết Sáng kiến kinh nghiệm với đề tài: "[Một số biện pháp ứng dụng AI giúp học sinh lớp 5 học tốt môn Tiếng Việt]".
- Cấp học: [Tiểu học]
- Thực trạng nổi bật ở lớp/trường em: [mô tả ngắn]

Cấu trúc 3 phần: Phần I. Đặt vấn đề (lý do chọn đề tài, mục đích, đối tượng, phạm vi, phương pháp nghiên cứu); Phần II. Giải quyết vấn đề (cơ sở lý luận, thực trạng có bảng khảo sát trước khi áp dụng, các biện pháp cụ thể có ví dụ minh họa, hiệu quả sau khi áp dụng có bảng so sánh); Phần III. Kết luận và kiến nghị.
Gợi ý thêm điểm mới, tính sáng tạo và khả năng nhân rộng để đề tài có thể đạt giải cấp tỉnh.`
    },
    {
      id: 'nhan_xet',
      icon: '📋',
      label: 'Nhận xét Học bạ Định kỳ',
      chip: 'Nhận xét học bạ',
      desc: 'Đoạn nhận xét phong phú, không lặp từ',
      prompt: `Hãy viết [10] đoạn nhận xét học bạ [cuối học kì I] cho học sinh lớp [4], nội dung nhận xét: [môn Toán và các năng lực, phẩm chất chung], theo tinh thần Thông tư [27/2020/TT-BGDĐT].
Chia theo mức: [3] em Hoàn thành tốt, [5] em Hoàn thành, [2] em Chưa hoàn thành.

Mỗi đoạn 2–3 câu: nêu điểm mạnh cụ thể và điều cần cố gắng, lời lẽ động viên, không lặp từ ngữ giữa các đoạn, không dùng tên học sinh. Trình bày dạng bảng (STT – Mức đạt – Nhận xét).`
    }
  ];

  const EXAMPLES = [
    'Gợi ý 5 trò chơi khởi động 5 phút cho tiết Toán lớp 3',
    'Viết thư mời phụ huynh họp đầu năm, giọng văn trang trọng mà gần gũi',
    'Giải thích cho học sinh lớp 9 về hiện tượng khúc xạ ánh sáng thật dễ hiểu',
    'Viết prompt để ChatGPT tạo phiếu bài tập phân hóa 3 mức độ'
  ];

  const state = {
    messages: [], // { role: 'user'|'model'|'error', text, stopped? }
    busy: false,
    controller: null,
    presetId: ''
  };

  // ==========================================
  // KHỞI ĐỘNG & ĐĂNG NHẬP
  // ==========================================

  function boot() {
    window.addEventListener('eduai:auth', e => {
      if (!e.detail) {
        window.location.href = 'index.html';
        return;
      }
      enter();
    });
    $('btn-ai-login').addEventListener('click', () => EduSite.openAuth());

    if (Store.getUser()) enter();
    else EduSite.openAuth();
  }

  let eventsBound = false;
  function enter() {
    if (!Store.getUser()) return;
    $('ai-locked').hidden = true;
    $('ai-app').hidden = false;
    $('btn-ai-new').hidden = false;
    if (!eventsBound) {
      state.messages = loadChat();
      renderChips();
      bindEvents();
      eventsBound = true;
    }
    renderMessages();
    if (state.messages.length) scrollToBottom(true);
  }

  function bindEvents() {
    const input = $('ai-input');
    $('ai-form').addEventListener('submit', e => {
      e.preventDefault();
      if (state.busy) stop();
      else submitInput();
    });
    input.addEventListener('input', () => {
      autosize();
      if (!input.value.trim()) setHint(false);
    });
    input.addEventListener('keydown', e => {
      // Máy tính: Enter gửi, Shift+Enter xuống dòng. Điện thoại: Enter luôn xuống dòng.
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(hover: hover)').matches) {
        e.preventDefault();
        if (!state.busy) submitInput();
      }
    });

    $('ai-chips').addEventListener('click', e => {
      const chip = e.target.closest('[data-preset]');
      if (chip) applyPreset(chip.dataset.preset);
    });

    $('ai-messages').addEventListener('click', e => {
      const preset = e.target.closest('[data-preset]');
      if (preset) return applyPreset(preset.dataset.preset);
      const example = e.target.closest('[data-example]');
      if (example) {
        setInput(example.dataset.example);
        state.presetId = '';
        return;
      }
      const action = e.target.closest('[data-msg-action]');
      if (!action) return;
      const index = Number(action.closest('[data-index]').dataset.index);
      const msg = state.messages[index];
      if (!msg) return;
      if (action.dataset.msgAction === 'copy') copyText(msg.text);
      else if (action.dataset.msgAction === 'word') downloadWord(msg.text);
      else if (action.dataset.msgAction === 'retry') retry(index);
    });

    $('btn-ai-new').addEventListener('click', () => {
      if (!state.messages.length) return $('ai-input').focus();
      if (!window.confirm('Bắt đầu cuộc trò chuyện mới? Nội dung hiện tại sẽ bị xóa.')) return;
      if (state.busy) stop();
      state.messages = [];
      state.presetId = '';
      saveChat();
      renderMessages();
      setInput('');
      setHint(false);
    });
  }

  // ==========================================
  // NÚT GỢI Ý NHANH
  // ==========================================

  function renderChips() {
    $('ai-chips').innerHTML = PRESETS.map(p => `
      <button type="button" class="ai-chip" data-preset="${p.id}" title="${esc(p.label)} — ${esc(p.desc)}">
        <span aria-hidden="true">${p.icon}</span> ${esc(p.chip)}
      </button>`).join('');
  }

  function applyPreset(id) {
    const preset = PRESETS.find(p => p.id === id);
    if (!preset) return;
    const input = $('ai-input');
    const current = input.value.trim();
    if (current && !PRESETS.some(p => p.prompt === current) &&
        !window.confirm('Thay nội dung Thầy/Cô đang gõ bằng câu lệnh mẫu?')) return;

    state.presetId = id;
    setInput(preset.prompt);
    setHint(true, preset);
    // Bôi đen chỗ cần sửa đầu tiên để Thầy/Cô gõ đè ngay
    const start = preset.prompt.indexOf('[');
    const end = preset.prompt.indexOf(']', start);
    if (start >= 0 && end > start) input.setSelectionRange(start, end + 1);
    input.scrollTop = 0;
    Store.track('ai_preset_click', { preset: id });
  }

  function setHint(show, preset) {
    const hint = $('ai-hint');
    hint.hidden = !show;
    if (show) {
      hint.innerHTML = `<span><strong>${preset.icon} ${esc(preset.label)}:</strong> Thầy/Cô sửa các phần trong <b>[ngoặc vuông]</b> cho đúng bài của mình, rồi bấm <b>Gửi</b>.</span>`;
    }
  }

  function setInput(text) {
    const input = $('ai-input');
    input.value = text;
    autosize();
    input.focus();
    input.setSelectionRange(text.length, text.length);
  }

  function autosize() {
    const input = $('ai-input');
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 220) + 'px';
  }

  // ==========================================
  // GỬI CÂU HỎI & NHẬN TRẢ LỜI (STREAMING)
  // ==========================================

  function submitInput() {
    const input = $('ai-input');
    const text = input.value.trim();
    if (!text) return input.focus();
    // Bỏ các thông báo lỗi cũ để lịch sử gửi lên chỉ còn hỏi – đáp
    state.messages = state.messages.filter(m => m.role !== 'error');
    state.messages.push({ role: 'user', text });
    Store.track('ai_ask', { preset: state.presetId || 'tu_do' });
    state.presetId = '';
    input.value = '';
    autosize();
    setHint(false);
    ask();
  }

  function retry(errorIndex) {
    if (state.busy) return;
    state.messages.splice(errorIndex, 1);
    if (!state.messages.length || state.messages[state.messages.length - 1].role !== 'user') return renderMessages();
    ask();
  }

  async function ask() {
    const history = state.messages
      .filter(m => (m.role === 'user' || m.role === 'model') && m.text)
      .slice(-MAX_SEND_MESSAGES)
      .map(m => ({ role: m.role, text: m.text }));

    const reply = { role: 'model', text: '' };
    state.messages.push(reply);
    setBusy(true);
    renderMessages();
    scrollToBottom(true);

    const controller = new AbortController();
    state.controller = controller;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal
      });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !res.body || !type.startsWith('text/plain')) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || offlineMessage());
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply.text += decoder.decode(value, { stream: true });
        scheduleStreamRender();
      }
      reply.text += decoder.decode();
    } catch (err) {
      if (err.name === 'AbortError') {
        reply.stopped = true;
      } else {
        const message = err instanceof TypeError ? offlineMessage() : err.message;
        if (!reply.text) state.messages.splice(state.messages.indexOf(reply), 1);
        state.messages.push({ role: 'error', text: message });
      }
    }
    if (!reply.text && reply.stopped) state.messages.splice(state.messages.indexOf(reply), 1);
    state.controller = null;
    setBusy(false);
    saveChat();
    renderMessages();
    scrollToBottom(false);
  }

  function offlineMessage() {
    const local = location.protocol === 'file:' || /^(localhost|127\.)/.test(location.hostname);
    return local
      ? 'Trợ lý AI chỉ chạy trên website đã đăng lên Vercel (máy chủ /api/ai), không chạy khi mở file trên máy.'
      : 'Không kết nối được tới Trợ lý AI. Thầy/Cô kiểm tra mạng rồi bấm "Thử lại" nhé.';
  }

  function stop() {
    if (state.controller) state.controller.abort();
  }

  function setBusy(busy) {
    state.busy = busy;
    const btn = $('ai-send');
    btn.classList.toggle('is-stop', busy);
    btn.setAttribute('aria-label', busy ? 'Dừng trả lời' : 'Gửi');
    btn.title = busy ? 'Dừng trả lời' : 'Gửi (Enter)';
    btn.innerHTML = busy ? '<i class="fa-solid fa-stop"></i>' : '<i class="fa-solid fa-paper-plane"></i>';
  }

  // Vẽ lại bong bóng đang trả lời tối đa 1 lần mỗi khung hình
  let renderQueued = false;
  function scheduleStreamRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      const nearBottom = isNearBottom();
      const index = state.messages.length - 1;
      const body = document.querySelector(`.ai-msg[data-index="${index}"] .ai-msg-body`);
      if (body) {
        body.innerHTML = renderMarkdown(state.messages[index].text);
        body.classList.remove('is-waiting');
      }
      if (nearBottom) scrollToBottom(true);
    });
  }

  // ==========================================
  // HIỂN THỊ HỘI THOẠI
  // ==========================================

  function renderMessages() {
    const box = $('ai-messages');
    if (!state.messages.length) {
      box.innerHTML = welcomeHtml();
      box.scrollTop = 0;
      return;
    }
    const last = state.messages.length - 1;
    box.innerHTML = state.messages.map((m, i) => messageHtml(m, i, state.busy && i === last)).join('');
  }

  function welcomeHtml() {
    const user = Store.getUser();
    const name = user ? user.fullName.trim().split(/\s+/).pop() : '';
    return `
      <div class="ai-welcome">
        <div class="ai-welcome-icon"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <h2>Chào Thầy/Cô ${esc(name)}! Hôm nay em giúp gì được ạ?</h2>
        <p>Chọn một nghiệp vụ bên dưới để có ngay câu lệnh mẫu, hoặc gõ bất kỳ câu hỏi nào vào ô chat.</p>
        <div class="ai-preset-grid">
          ${PRESETS.map(p => `
            <button type="button" class="ai-preset-card" data-preset="${p.id}">
              <span class="ai-preset-icon" aria-hidden="true">${p.icon}</span>
              <span><strong>${esc(p.label)}</strong><small>${esc(p.desc)}</small></span>
            </button>`).join('')}
        </div>
        <div class="ai-examples">
          <span class="ai-examples-label">Hoặc thử hỏi:</span>
          ${EXAMPLES.map(t => `<button type="button" class="ai-example" data-example="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>`;
  }

  function messageHtml(m, i, streaming) {
    if (m.role === 'user') {
      return `<div class="ai-msg ai-msg-user" data-index="${i}"><div class="ai-msg-body">${esc(m.text)}</div></div>`;
    }
    if (m.role === 'error') {
      return `
        <div class="ai-msg ai-msg-error" data-index="${i}">
          <div class="ai-avatar"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="ai-msg-main">
            <div class="ai-msg-body">${esc(m.text)}</div>
            <div class="ai-msg-actions"><button type="button" data-msg-action="retry"><i class="fa-solid fa-rotate-right"></i> Thử lại</button></div>
          </div>
        </div>`;
    }
    const body = m.text
      ? renderMarkdown(m.text)
      : '<span class="ai-typing" aria-label="Trợ lý đang soạn câu trả lời"><span></span><span></span><span></span></span> <span class="ai-typing-label">Trợ lý đang soạn câu trả lời...</span>';
    const actions = streaming ? '' : `
      <div class="ai-msg-actions">
        ${m.stopped ? '<span class="ai-stopped"><i class="fa-solid fa-circle-pause"></i> Đã dừng</span>' : ''}
        <button type="button" data-msg-action="copy"><i class="fa-regular fa-copy"></i> Sao chép</button>
        <button type="button" data-msg-action="word"><i class="fa-regular fa-file-word"></i> Tải file Word</button>
      </div>`;
    return `
      <div class="ai-msg ai-msg-model${streaming ? ' is-streaming' : ''}" data-index="${i}">
        <div class="ai-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
        <div class="ai-msg-main">
          <div class="ai-msg-body ai-md${m.text ? '' : ' is-waiting'}">${body}</div>
          ${actions}
        </div>
      </div>`;
  }

  function isNearBottom() {
    const box = $('ai-messages');
    return box.scrollHeight - box.scrollTop - box.clientHeight < 120;
  }

  function scrollToBottom(instant) {
    const box = $('ai-messages');
    box.scrollTo({ top: box.scrollHeight, behavior: instant ? 'auto' : 'smooth' });
  }

  // ==========================================
  // MARKDOWN → HTML (đã escape, không chèn HTML thô từ AI)
  // ==========================================

  function inline(text) {
    return esc(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  }

  const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
  const isTableSep = line => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
  const splitRow = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());

  function renderMarkdown(src) {
    const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    let html = '';
    let i = 0;
    const startsBlock = line => /^(#{1,6}\s|>|```|\s*([-*+]|\d+[.)])\s)/.test(line) || /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim());

    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }

      if (/^\s*```/.test(line)) {
        const code = [];
        i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i++]);
        i++;
        html += `<pre><code>${esc(code.join('\n'))}</code></pre>`;
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        const level = Math.min(Math.max(heading[1].length + 1, 3), 5);
        html += `<h${level}>${inline(heading[2].replace(/\s*#+\s*$/, ''))}</h${level}>`;
        i++;
        continue;
      }

      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line.trim())) { html += '<hr>'; i++; continue; }

      if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        const head = splitRow(line);
        i += 2;
        let body = '';
        while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
          body += '<tr>' + splitRow(lines[i]).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
          i++;
        }
        html += `<div class="ai-table-wrap"><table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
        continue;
      }

      if (/^>/.test(line)) {
        const quote = [];
        while (i < lines.length && /^>/.test(lines[i])) quote.push(lines[i++].replace(/^>\s?/, ''));
        html += `<blockquote>${renderMarkdown(quote.join('\n'))}</blockquote>`;
        continue;
      }

      if (LIST_RE.test(line)) {
        const items = [];
        while (i < lines.length && (LIST_RE.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) items.push(lines[i++]);
        html += renderList(items);
        continue;
      }

      const para = [];
      while (i < lines.length && lines[i].trim() && !startsBlock(lines[i]) &&
             !(lines[i].includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1]))) para.push(lines[i++]);
      if (!para.length) para.push(lines[i++]);
      html += `<p>${para.map(inline).join('<br>')}</p>`;
    }
    return html;
  }

  function renderList(lines) {
    const stack = [];
    let out = '';
    lines.forEach(line => {
      const m = line.match(LIST_RE);
      if (!m) {
        out += '<br>' + inline(line.trim());
        return;
      }
      const indent = m[1].replace(/\t/g, '    ').length;
      const type = /\d/.test(m[2]) ? 'ol' : 'ul';
      const startAttr = type === 'ol' && parseInt(m[2], 10) > 1 ? ` start="${parseInt(m[2], 10)}"` : '';
      const top = stack[stack.length - 1];
      if (!top || indent > top.indent + 1) {
        out += `<${type}${startAttr}>`;
        stack.push({ indent, type });
      } else {
        while (stack.length > 1 && indent < stack[stack.length - 1].indent) {
          out += `</li></${stack.pop().type}>`;
        }
        out += '</li>';
      }
      out += '<li>' + inline(m[3]);
    });
    while (stack.length) out += `</li></${stack.pop().type}>`;
    return out;
  }

  // ==========================================
  // SAO CHÉP / TẢI FILE WORD / LƯU PHIÊN
  // ==========================================

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    EduSite.toast('Đã sao chép câu trả lời.', 'success');
  }

  function downloadWord(text) {
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>EduAI - Trợ lý AI Sư phạm</title>
<style>body{font-family:"Times New Roman",serif;font-size:13pt;line-height:1.5}table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:4pt 6pt;vertical-align:top}th{background:#DBEAFE}h3,h4,h5{color:#1E3A8A}</style>
</head><body>${renderMarkdown(text)}</body></html>`;
    const blob = new Blob(['﻿', doc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    a.href = url;
    a.download = `EduAI-Tro-ly-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    Store.track('ai_download_word');
  }

  function loadChat() {
    try {
      const data = JSON.parse(sessionStorage.getItem(CHAT_KEY) || '[]');
      return Array.isArray(data) ? data.filter(m => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'model')) : [];
    } catch (e) {
      return [];
    }
  }

  function saveChat() {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(state.messages.filter(m => m.role !== 'error' && m.text)));
    } catch (e) {
      /* hết dung lượng / bị chặn: chỉ mất lịch sử khi tải lại trang */
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
