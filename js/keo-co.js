/**
 * GAME KÉO CO TỪ TÀI LIỆU (keo-co.html)
 * Bước 1: giáo viên tải file .docx/.txt hoặc dán nội dung → POST /api/quiz (Gemini) → 10 câu trắc nghiệm.
 * Bước 2: sân đấu 2 đội (Xanh trái / Đỏ phải), mỗi đội một nửa bộ câu hỏi, trả lời độc lập.
 *   - Đúng: +1 điểm, dây kéo dịch STEP_PX theo mỗi điểm chênh lệch.
 *   - Sai: đội bị đóng băng FREEZE_SEC giây (hiện đáp án đúng), sân rung lắc.
 *   - Kết thúc: dẫn trước WIN_GAP điểm, hết GAME_SECONDS giây, hoặc cả 2 đội hết câu hỏi.
 * Âm thanh tự tạo bằng Web Audio API (playTone), không dùng file mp3.
 */
(function () {
  'use strict';

  const GAME_SECONDS = 60;
  const WIN_GAP = 3;
  const STEP_PX = 45;
  const FREEZE_SEC = 3;
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MIN_TEXT_CHARS = 80;
  const API_URL = '/api/quiz';
  const LAST_GAME_KEY = 'eduai_keoco_last';

  // Câu hỏi dự phòng khi chưa có tài liệu hoặc máy chủ AI lỗi
  const FALLBACK_QUESTIONS = [
    { question: 'Thủ đô của Việt Nam là thành phố nào?', answers: ['Hà Nội', 'Huế', 'Đà Nẵng', 'TP. Hồ Chí Minh'], correct: 0 },
    { question: 'Kết quả của phép tính 7 × 8 là bao nhiêu?', answers: ['54', '56', '58', '64'], correct: 1 },
    { question: 'Hành tinh nào gần Mặt Trời nhất?', answers: ['Sao Kim', 'Trái Đất', 'Sao Thủy', 'Sao Hỏa'], correct: 2 },
    { question: 'Tác giả của "Truyện Kiều" là ai?', answers: ['Hồ Xuân Hương', 'Nguyễn Trãi', 'Nguyễn Khuyến', 'Nguyễn Du'], correct: 3 },
    { question: 'Nước sôi ở bao nhiêu độ C (ở áp suất thường)?', answers: ['90°C', '100°C', '110°C', '120°C'], correct: 1 },
    { question: 'Dãy núi dài nhất Việt Nam là dãy nào?', answers: ['Trường Sơn', 'Hoàng Liên Sơn', 'Bạch Mã', 'Tam Đảo'], correct: 0 }
  ];

  const TEAMS = {
    blue: { name: 'Đội Xanh', keys: ['1', '2', '3', '4'] },
    red: { name: 'Đội Đỏ', keys: ['7', '8', '9', '0'] }
  };
  const LETTERS = ['A', 'B', 'C', 'D'];

  const $ = id => document.getElementById(id);
  const Store = window.EduStore || {};
  const escapeHtml = Store.escapeHtml || (s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]));
  const track = (name, params) => Store.track && Store.track(name, params);
  const toast = (msg, type) => (window.EduSite && window.EduSite.toast ? window.EduSite.toast(msg, type) : alert(msg));

  const state = {
    fileText: '',
    fileName: '',
    questions: [],
    topic: '',
    teams: {},
    endAt: 0,
    running: false,
    round: 0, // tăng mỗi ván / khi thoát → các setTimeout của ván cũ tự bỏ qua
    tickTimer: null,
    muted: false,
    loading: false
  };

  // =====================================================================
  // ĐỌC FILE (.txt / .docx) — .docx là file zip, tự giải nén bằng DecompressionStream
  // =====================================================================
  async function readDocx(buffer) {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    let eocd = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('File Word bị lỗi hoặc không đúng định dạng .docx.');

    const total = view.getUint16(eocd + 10, true);
    let p = view.getUint32(eocd + 16, true);
    let entry = null;
    for (let n = 0; n < total && view.getUint32(p, true) === 0x02014b50; n++) {
      const nameLen = view.getUint16(p + 28, true);
      const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
      if (name === 'word/document.xml') {
        entry = { method: view.getUint16(p + 10, true), size: view.getUint32(p + 20, true), offset: view.getUint32(p + 42, true) };
        break;
      }
      p += 46 + nameLen + view.getUint16(p + 30, true) + view.getUint16(p + 32, true);
    }
    if (!entry) throw new Error('Không tìm thấy nội dung văn bản trong file Word.');

    const start = entry.offset + 30 + view.getUint16(entry.offset + 26, true) + view.getUint16(entry.offset + 28, true);
    const data = bytes.subarray(start, start + entry.size);
    let xmlBytes;
    if (entry.method === 0) xmlBytes = data;
    else if (entry.method === 8) {
      if (typeof DecompressionStream === 'undefined') throw new Error('Trình duyệt này chưa đọc được file Word. Thầy/Cô mở file, sao chép nội dung rồi dán vào ô bên dưới nhé.');
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      xmlBytes = new Uint8Array(await new Response(stream).arrayBuffer());
    } else throw new Error('File Word dùng kiểu nén chưa hỗ trợ.');

    const xml = new TextDecoder().decode(xmlBytes);
    return xml
      .replace(/<w:(instrText|delText)[^>]*>[\s\S]*?<\/w:\1>/g, '')
      .replace(/<w:tab\/>/g, '\t')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(Number(d)))
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async function readFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (file.size > MAX_FILE_BYTES) throw new Error('File lớn hơn 10MB. Thầy/Cô chọn file nhỏ hơn hoặc dán phần nội dung chính nhé.');
    if (ext === 'docx') return readDocx(await file.arrayBuffer());
    if (ext === 'txt' || ext === 'md' || file.type === 'text/plain') return (await file.text()).trim();
    if (ext === 'doc') throw new Error('File .doc (Word đời cũ) chưa hỗ trợ. Thầy/Cô mở file và "Lưu thành" .docx, hoặc sao chép nội dung dán vào ô bên dưới.');
    if (ext === 'pdf') throw new Error('File PDF chưa hỗ trợ. Thầy/Cô mở PDF, sao chép nội dung rồi dán vào ô bên dưới nhé.');
    throw new Error('Chỉ hỗ trợ file .docx hoặc .txt.');
  }

  async function handleFile(file) {
    if (!file) return;
    setStatus('loading', `Đang đọc file "${file.name}"...`);
    try {
      const text = await readFile(file);
      if (!text) throw new Error('File không có nội dung chữ (có thể chỉ chứa hình ảnh).');
      state.fileText = text;
      state.fileName = file.name;
      $('kc-file-name').textContent = file.name;
      $('kc-file-meta').textContent = `${text.length.toLocaleString('vi-VN')} ký tự đã đọc`;
      $('kc-file-chip').hidden = false;
      $('kc-dropzone').hidden = true;
      if (!$('kc-topic').value.trim()) $('kc-topic').value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 80);
      setStatus(null);
    } catch (e) {
      clearFile();
      setStatus('error', e.message);
    }
  }

  function clearFile() {
    state.fileText = '';
    state.fileName = '';
    $('kc-file').value = '';
    $('kc-file-chip').hidden = true;
    $('kc-dropzone').hidden = false;
  }

  function setStatus(type, html) {
    const el = $('kc-status');
    if (!type) { el.hidden = true; el.innerHTML = ''; return; }
    el.className = `kc-status is-${type}`;
    const icon = type === 'loading' ? '<span class="kc-spinner"></span>' : type === 'error' ? '<i class="fa-solid fa-circle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
    el.innerHTML = `${icon}<div>${html}</div>`;
    el.hidden = false;
  }

  // =====================================================================
  // GỌI AI TẠO CÂU HỎI
  // =====================================================================
  async function generate() {
    if (state.loading) return;
    const pasted = $('kc-text').value.trim();
    const text = [state.fileText, pasted].filter(Boolean).join('\n\n');
    if (text.length < MIN_TEXT_CHARS) {
      setStatus('error', 'Thầy/Cô chọn file tài liệu hoặc dán nội dung bài học (ít nhất vài câu) trước khi tạo game nhé.');
      $('kc-text').focus();
      return;
    }
    const topic = $('kc-topic').value.trim();
    state.loading = true;
    $('kc-generate').disabled = true;
    setStatus('loading', 'AI đang đọc tài liệu và soạn 10 câu hỏi trắc nghiệm... <small>(thường mất 10–30 giây)</small>');
    track('game_generate', { method: state.fileText ? 'file' : 'paste' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 100000);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, topic }),
        signal: controller.signal
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.questions) || !data.questions.length) {
        throw new Error(data.error || 'Máy chủ AI chưa phản hồi đúng.');
      }
      const questions = sanitize(data.questions);
      if (questions.length < 2) throw new Error('AI chưa tạo được bộ câu hỏi hợp lệ.');
      saveLastGame(questions, topic);
      setStatus(null);
      startGame(questions, topic || 'Ôn tập kiến thức');
    } catch (e) {
      const offline = location.protocol === 'file:' || e instanceof TypeError;
      const msg = e.name === 'AbortError' ? 'Máy chủ AI phản hồi quá lâu.' : offline ? 'Không kết nối được máy chủ AI (tính năng chỉ chạy trên website đã đăng tải).' : e.message;
      setStatus('error', `${escapeHtml(msg)}<br><button type="button" class="kc-inline-btn" data-kc-fallback>Chơi tạm với câu hỏi mẫu</button>`);
    } finally {
      clearTimeout(timeout);
      state.loading = false;
      $('kc-generate').disabled = false;
    }
  }

  function sanitize(list) {
    return (Array.isArray(list) ? list : [])
      .filter(q => q && typeof q.question === 'string' && Array.isArray(q.answers) && q.answers.length === 4 && Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3)
      .map(q => ({ question: q.question.trim(), answers: q.answers.map(a => String(a).trim()), correct: q.correct }));
  }

  function saveLastGame(questions, topic) {
    try {
      localStorage.setItem(LAST_GAME_KEY, JSON.stringify({ questions, topic, savedAt: Date.now() }));
    } catch (e) { /* bộ nhớ đầy → bỏ qua */ }
    showLastGameButton();
  }

  function loadLastGame() {
    try {
      const data = JSON.parse(localStorage.getItem(LAST_GAME_KEY) || 'null');
      if (data && sanitize(data.questions).length >= 2) return data;
    } catch (e) { /* dữ liệu hỏng */ }
    return null;
  }

  function showLastGameButton() {
    const last = loadLastGame();
    const btn = $('kc-last');
    btn.hidden = !last;
    if (last) btn.querySelector('span').textContent = `Chơi lại bộ câu hỏi gần nhất${last.topic ? `: ${last.topic}` : ''} (${last.questions.length} câu)`;
  }

  // =====================================================================
  // ÂM THANH — Web Audio API
  // =====================================================================
  let audioCtx = null;
  let bgmTimer = null;
  let bgmStep = 0;

  function getAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, duration, type, volume, delay) {
    if (state.muted || !freq) return;
    const ctx = getAudio();
    if (!ctx) return;
    const t = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume || 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  const SFX = {
    correct() { [660, 880, 1320].forEach((f, i) => playTone(f, 0.12, 'square', 0.07, i * 0.07)); },
    wrong() { playTone(220, 0.18, 'sawtooth', 0.08); playTone(150, 0.3, 'sawtooth', 0.08, 0.16); },
    tick() { playTone(1046, 0.05, 'square', 0.04); },
    count() { playTone(587, 0.15, 'square', 0.07); },
    go() { playTone(1175, 0.35, 'square', 0.08); },
    win() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => playTone(f, i === 5 ? 0.6 : 0.16, 'square', 0.08, i * 0.14)); }
  };

  // Nhạc nền 8-bit vui nhộn (giai điệu tự soạn, lặp lại); 0 = nghỉ
  const BGM_MELODY = [523, 659, 784, 659, 698, 880, 784, 0, 659, 784, 1047, 784, 880, 698, 587, 0,
    523, 659, 784, 659, 698, 880, 1047, 0, 988, 784, 880, 698, 659, 587, 523, 0];
  const BGM_BASS = [131, 196, 175, 196, 165, 196, 147, 196];

  function startBgm() {
    stopBgm();
    bgmStep = 0;
    bgmTimer = setInterval(() => {
      playTone(BGM_MELODY[bgmStep % BGM_MELODY.length], 0.14, 'square', 0.025);
      if (bgmStep % 4 === 0) playTone(BGM_BASS[(bgmStep / 4) % BGM_BASS.length], 0.3, 'triangle', 0.05);
      bgmStep++;
    }, 170);
  }

  function stopBgm() {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }

  function toggleSound() {
    state.muted = !state.muted;
    const btn = $('kc-sound');
    btn.innerHTML = `<i class="fa-solid fa-volume-${state.muted ? 'xmark' : 'high'}"></i>`;
    btn.setAttribute('aria-label', state.muted ? 'Bật âm thanh' : 'Tắt âm thanh');
    btn.classList.toggle('is-off', state.muted);
  }

  // =====================================================================
  // SÂN ĐẤU
  // =====================================================================
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Đảo vị trí đáp án (AI hay để đáp án đúng ở đầu), giữ đúng chỉ số correct
  function shuffleAnswers(q) {
    const order = shuffle([0, 1, 2, 3]);
    return { question: q.question, answers: order.map(i => q.answers[i]), correct: order.indexOf(q.correct) };
  }

  function startGame(questions, topic) {
    state.questions = questions;
    state.topic = topic;
    const prepared = questions.map(shuffleAnswers);
    state.teams = {
      blue: { list: prepared.filter((q, i) => i % 2 === 0), idx: 0, score: 0, frozen: false, busy: false, done: false },
      red: { list: prepared.filter((q, i) => i % 2 === 1), idx: 0, score: 0, frozen: false, busy: false, done: false }
    };
    state.round++;
    state.running = false;
    clearInterval(state.tickTimer);

    $('kc-topic-label').textContent = topic;
    $('kc-topic-label').title = topic;
    $('kc-result').hidden = true;
    $('kc-setup').hidden = true;
    $('kc-arena').hidden = false;
    document.body.classList.add('kc-game-on');
    window.scrollTo(0, 0);

    renderTeam('blue');
    renderTeam('red');
    updateScores();
    updateRope();
    renderTime(GAME_SECONDS);
    track('game_start', { questions: questions.length });
    runCountdown();
  }

  function runCountdown() {
    const round = state.round;
    const el = $('kc-countdown');
    const steps = ['3', '2', '1', 'Bắt đầu!'];
    el.hidden = false;
    steps.forEach((label, i) => {
      setTimeout(() => {
        if (round !== state.round) return;
        el.textContent = label;
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
        if (i < 3) SFX.count(); else SFX.go();
      }, i * 800);
    });
    setTimeout(() => {
      if (round !== state.round) return;
      el.hidden = true;
      state.running = true;
      state.endAt = Date.now() + GAME_SECONDS * 1000;
      state.tickTimer = setInterval(tick, 250);
      startBgm();
    }, steps.length * 800);
  }

  function tick() {
    const left = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
    if (String(left) !== $('kc-time').textContent) {
      renderTime(left);
      if (left > 0 && left <= 10) SFX.tick();
    }
    if (left <= 0) endGame('time');
  }

  function renderTime(left) {
    $('kc-time').textContent = left;
    $('kc-timer').classList.toggle('is-low', left <= 10);
  }

  function renderTeam(team) {
    const t = state.teams[team];
    const box = $(`kc-team-${team}`);
    const head = `<div class="kc-team-head"><h2>${TEAMS[team].name}</h2><span class="kc-team-progress">${t.done ? 'Hoàn thành' : `Câu ${t.idx + 1}/${t.list.length}`}</span></div>`;
    if (t.done) {
      box.innerHTML = `${head}<div class="kc-team-done"><span>🎉</span><p>${TEAMS[team].name} đã trả lời hết câu hỏi!</p><small>Chờ đội bạn hoàn thành...</small></div>`;
      return;
    }
    const q = t.list[t.idx];
    box.innerHTML = `${head}
      <div class="kc-question">${escapeHtml(q.question)}</div>
      <div class="kc-answers">
        ${q.answers.map((a, i) => `<button type="button" class="kc-answer" data-team="${team}" data-index="${i}">
          <span class="kc-answer-letter">${LETTERS[i]}</span><span class="kc-answer-text">${escapeHtml(a)}</span><kbd>${TEAMS[team].keys[i]}</kbd>
        </button>`).join('')}
      </div>
      <div class="kc-freeze" hidden><span class="kc-freeze-icon">❄️</span><strong>Đang đóng băng...</strong><span class="kc-freeze-num">${FREEZE_SEC}</span></div>`;
  }

  function answer(team, index) {
    const t = state.teams[team];
    if (!state.running || !t || t.frozen || t.busy || t.done) return;
    const q = t.list[t.idx];
    const box = $(`kc-team-${team}`);
    const buttons = box.querySelectorAll('.kc-answer');
    const round = state.round;
    t.busy = true;
    buttons.forEach(b => (b.disabled = true));

    if (index === q.correct) {
      t.score++;
      buttons[index].classList.add('is-correct');
      SFX.correct();
      updateScores();
      updateRope();
      if (Math.abs(state.teams.blue.score - state.teams.red.score) >= WIN_GAP) {
        endGame('gap');
        return;
      }
      setTimeout(() => { if (round === state.round) nextQuestion(team); }, 500);
    } else {
      buttons[index].classList.add('is-wrong');
      buttons[q.correct].classList.add('is-correct');
      SFX.wrong();
      shakeField();
      t.frozen = true;
      const overlay = box.querySelector('.kc-freeze');
      const num = overlay.querySelector('.kc-freeze-num');
      overlay.hidden = false;
      for (let s = 1; s <= FREEZE_SEC; s++) {
        setTimeout(() => {
          if (round !== state.round) return;
          if (s < FREEZE_SEC) num.textContent = FREEZE_SEC - s;
          else {
            t.frozen = false;
            if (state.running) nextQuestion(team);
          }
        }, s * 1000);
      }
    }
  }

  function nextQuestion(team) {
    const t = state.teams[team];
    t.busy = false;
    t.idx++;
    if (t.idx >= t.list.length) t.done = true;
    renderTeam(team);
    if (state.teams.blue.done && state.teams.red.done) endGame('questions');
  }

  function updateScores() {
    ['blue', 'red'].forEach(team => {
      const el = $(`kc-score-${team}`);
      if (el.textContent !== String(state.teams[team].score)) {
        el.textContent = state.teams[team].score;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
      }
    });
  }

  // Đội Xanh ở bên trái → Đội Xanh dẫn thì dây dịch sang trái (giá trị âm)
  function updateRope() {
    const diff = state.teams.blue.score - state.teams.red.score;
    const clamped = Math.max(-WIN_GAP, Math.min(WIN_GAP, diff));
    $('kc-rope').style.setProperty('--kc-shift', `${-clamped * STEP_PX}px`);
    const hint = $('kc-field-hint');
    if (diff === 0) hint.textContent = `Dẫn trước ${WIN_GAP} điểm để kéo đối thủ qua vạch!`;
    else if (Math.abs(diff) >= WIN_GAP) hint.textContent = `${diff > 0 ? TEAMS.blue.name : TEAMS.red.name} đã kéo đối thủ qua vạch!`;
    else hint.textContent = `${diff > 0 ? TEAMS.blue.name : TEAMS.red.name} đang dẫn ${Math.abs(diff)} điểm — còn ${WIN_GAP - Math.abs(diff)} điểm nữa là thắng!`;
  }

  function shakeField() {
    const rope = $('kc-rope');
    rope.classList.remove('shake');
    void rope.offsetWidth;
    rope.classList.add('shake');
  }

  function endGame(reason) {
    if (!state.running) return;
    state.running = false;
    state.round++;
    clearInterval(state.tickTimer);
    stopBgm();
    document.querySelectorAll('.kc-answer').forEach(b => (b.disabled = true));

    const { blue, red } = state.teams;
    const winner = blue.score > red.score ? 'blue' : red.score > blue.score ? 'red' : null;
    const reasons = {
      gap: `Dẫn trước ${WIN_GAP} điểm — kéo đối thủ qua vạch!`,
      time: `Hết ${GAME_SECONDS} giây thi đấu.`,
      questions: 'Cả hai đội đã trả lời hết câu hỏi.'
    };
    $('kc-result-icon').textContent = winner ? '🏆' : '🤝';
    $('kc-result-title').textContent = winner ? `${TEAMS[winner].name} chiến thắng!` : 'Hai đội hòa nhau!';
    $('kc-result-title').className = winner ? `is-${winner}` : '';
    $('kc-result-reason').textContent = reasons[reason] || '';
    $('kc-result-blue').textContent = blue.score;
    $('kc-result-red').textContent = red.score;
    $('kc-result-blue-sub').textContent = `đúng ${blue.score}/${blue.list.length} câu`;
    $('kc-result-red-sub').textContent = `đúng ${red.score}/${red.list.length} câu`;
    document.querySelector('.kc-result-team.blue').classList.toggle('is-winner', winner === 'blue');
    document.querySelector('.kc-result-team.red').classList.toggle('is-winner', winner === 'red');

    setTimeout(() => {
      $('kc-result').hidden = false;
      $('kc-replay').focus();
      SFX.win();
      launchConfetti(winner);
    }, reason === 'gap' ? 700 : 300);
    track('game_end', { reason, winner: winner || 'draw' });
  }

  function exitGame() {
    if (state.running && !confirm('Thầy/Cô muốn thoát ván đang chơi?')) return;
    state.running = false;
    state.round++;
    clearInterval(state.tickTimer);
    stopBgm();
    stopConfetti();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    $('kc-result').hidden = true;
    $('kc-countdown').hidden = true;
    $('kc-arena').hidden = true;
    $('kc-setup').hidden = false;
    document.body.classList.remove('kc-game-on');
    showLastGameButton();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => toast('Trình duyệt không cho phép toàn màn hình. Thầy/Cô thử nhấn phím F11 nhé.', 'error'));
    } else toast('Trình duyệt không hỗ trợ toàn màn hình. Thầy/Cô thử nhấn phím F11 nhé.', 'error');
  }

  function syncFullscreenButton() {
    const on = !!document.fullscreenElement;
    $('kc-fullscreen').innerHTML = `<i class="fa-solid fa-${on ? 'compress' : 'expand'}"></i>`;
    $('kc-fullscreen').setAttribute('aria-label', on ? 'Thoát toàn màn hình' : 'Toàn màn hình');
  }

  // =====================================================================
  // PHÁO GIẤY (Confetti) trên <canvas>
  // =====================================================================
  let confettiFrame = null;

  function launchConfetti(winner) {
    stopConfetti();
    const canvas = $('kc-confetti');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.classList.add('is-on');

    const palette = winner === 'blue' ? ['#2563EB', '#3B82F6', '#06B6D4', '#F59E0B', '#FFFFFF']
      : winner === 'red' ? ['#E11D48', '#F43F5E', '#F59E0B', '#FBBF24', '#FFFFFF']
        : ['#2563EB', '#E11D48', '#10B981', '#F59E0B', '#06B6D4'];
    const pieces = Array.from({ length: 200 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? 0 : w,
        y: h * 0.75,
        vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 9),
        vy: -(10 + Math.random() * 12),
        size: 6 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: palette[i % palette.length],
        wobble: Math.random() * 10
      };
    });
    const startedAt = performance.now();

    const draw = now => {
      const elapsed = now - startedAt;
      ctx.clearRect(0, 0, w, h);
      pieces.forEach(p => {
        p.vy += 0.32;
        p.vx *= 0.99;
        p.x += p.vx + Math.sin((elapsed / 200) + p.wobble) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - elapsed / 4500);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (elapsed < 4500) confettiFrame = requestAnimationFrame(draw);
      else stopConfetti();
    };
    confettiFrame = requestAnimationFrame(draw);
  }

  function stopConfetti() {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
    const canvas = $('kc-confetti');
    canvas.classList.remove('is-on');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  // =====================================================================
  // GẮN SỰ KIỆN
  // =====================================================================
  function init() {
    const dropzone = $('kc-dropzone');
    $('kc-file').addEventListener('change', e => handleFile(e.target.files[0]));
    $('kc-file-remove').addEventListener('click', clearFile);
    ['dragenter', 'dragover'].forEach(type => dropzone.addEventListener(type, e => {
      e.preventDefault();
      dropzone.classList.add('is-drag');
    }));
    ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, e => {
      e.preventDefault();
      dropzone.classList.remove('is-drag');
    }));
    dropzone.addEventListener('drop', e => handleFile(e.dataTransfer && e.dataTransfer.files[0]));
    // Thả file lệch ra ngoài vùng → không để trình duyệt mở file thay cho trang
    window.addEventListener('dragover', e => e.preventDefault());
    window.addEventListener('drop', e => e.preventDefault());

    $('kc-text').addEventListener('input', () => {
      $('kc-text-count').textContent = `${$('kc-text').value.trim().length.toLocaleString('vi-VN')} ký tự`;
    });

    $('kc-generate').addEventListener('click', generate);
    $('kc-demo').addEventListener('click', () => startGame(FALLBACK_QUESTIONS, 'Câu hỏi mẫu — Kiến thức chung'));
    $('kc-status').addEventListener('click', e => {
      if (e.target.closest('[data-kc-fallback]')) {
        setStatus(null);
        startGame(FALLBACK_QUESTIONS, 'Câu hỏi mẫu — Kiến thức chung');
      }
    });
    $('kc-last').addEventListener('click', () => {
      const last = loadLastGame();
      if (last) startGame(sanitize(last.questions), last.topic || 'Ôn tập kiến thức');
    });

    $('kc-arena').addEventListener('click', e => {
      const btn = e.target.closest('.kc-answer');
      if (btn) answer(btn.dataset.team, Number(btn.dataset.index));
    });
    document.addEventListener('keydown', e => {
      if (!state.running || e.ctrlKey || e.metaKey || e.altKey) return;
      ['blue', 'red'].forEach(team => {
        const i = TEAMS[team].keys.indexOf(e.key);
        if (i >= 0) answer(team, i);
      });
    });

    $('kc-sound').addEventListener('click', toggleSound);
    $('kc-fullscreen').addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', syncFullscreenButton);
    $('kc-exit').addEventListener('click', exitGame);
    $('kc-replay').addEventListener('click', () => { stopConfetti(); startGame(state.questions, state.topic); });
    $('kc-new').addEventListener('click', () => { state.running = false; exitGame(); });

    showLastGameButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
