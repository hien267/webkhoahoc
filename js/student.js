/**
 * CỔNG HỌC VIÊN EDUAI — trang student.html (cần đăng nhập)
 * Thông tin cá nhân, lịch học Zoom (lịch tháng tô nổi bật ngày có lớp), tiến trình học và kho video xem lại.
 * Lịch buổi học được sinh từ course.nextClassSchedule + course.duration (js/data.js), bắt đầu từ ngày sau khi đăng ký.
 */
(function () {
  'use strict';

  const Store = window.EduStore;
  const esc = Store.escapeHtml;
  const DOW_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const DOW_LONG = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const JOIN_EARLY_MS = 15 * 60 * 1000;

  const state = {
    user: null,
    lead: null,
    sessions: [],
    calMonth: null,
    selectedDay: null,
    countdownTimer: null
  };

  const $ = id => document.getElementById(id);

  // Trang cần đăng nhập: chưa đăng nhập thì hiện khung khóa + modal đăng nhập (js/site.js),
  // đăng nhập xong hiện Cổng học viên ngay; đăng xuất thì quay về Trang chủ.
  function boot() {
    window.addEventListener('eduai:auth', e => {
      if (!e.detail) {
        window.location.href = 'index.html';
        return;
      }
      enter();
    });
    $('btn-student-login').addEventListener('click', () => EduSite.openAuth());

    if (Store.getUser()) enter();
    else EduSite.openAuth();
  }

  let eventsBound = false;
  function enter() {
    const user = Store.getUser();
    if (!user) return;
    $('student-locked').hidden = true;
    $('student-portal').hidden = false;
    if (!state.user || state.user.id !== user.id) {
      state.calMonth = null;
      state.selectedDay = null;
    }
    state.user = user;
    if (!eventsBound) {
      bindEvents();
      eventsBound = true;
    }
    loadAndRender();
    syncFromCloud();
  }

  function loadAndRender() {
    state.lead = Store.getLead(state.user.id) || {
      id: state.user.id, fullName: state.user.fullName, email: state.user.email, phone: state.user.phone,
      provider: state.user.provider, createdAt: state.user.loggedInAt, enrollments: []
    };
    state.sessions = buildAllSessions(state.lead.enrollments || []);
    if (!state.calMonth) {
      const next = nextSession();
      const base = next ? next.start : new Date();
      state.calMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    }
    renderAll();
  }

  // Lấy trạng thái thanh toán mới nhất do quản trị viên xác nhận trên cloud
  async function syncFromCloud() {
    const remote = await Store.fetchCloudEnrollments(state.user.id);
    if (!remote || !remote.length) return;
    const local = (state.lead && state.lead.enrollments) || [];
    let changed = false;
    remote.forEach(r => {
      const mine = local.find(e => e.courseId === r.courseId);
      if (mine && mine.status === r.status) return;
      const course = findCourse(r.courseId);
      Store.upsertLead({
        id: state.user.id,
        enrollment: {
          courseId: r.courseId,
          courseTitle: course ? course.title : r.courseId,
          amount: course ? course.price : 0,
          status: r.status
        }
      }, { allowPaid: true, skipCloud: true });
      changed = true;
    });
    if (changed) {
      loadAndRender();
      showToast('Đã cập nhật trạng thái khóa học mới nhất từ Trung tâm.', 'success');
    }
  }

  // ==========================================
  // SINH LỊCH BUỔI HỌC
  // ==========================================

  function findCourse(id) {
    return COURSES_DATA.find(c => c.id === id) || null;
  }

  function parseSchedule(course) {
    const text = String(course.nextClassSchedule || '').toLowerCase();
    const time = text.match(/(\d{1,2}):(\d{2})/);
    const days = (text.match(/thứ [2-7]|chủ nhật/g) || [])
      .map(k => WEEKDAY_MAP[k])
      .filter(d => d !== undefined);
    const total = Number((String(course.duration).match(/(\d+)\s*buổi/) || [])[1]) || 4;
    const hours = Number((String(course.duration).match(/\((\d+)\s*giờ\)/) || [])[1]) || total * 2;
    return {
      hour: time ? Number(time[1]) : 20,
      minute: time ? Number(time[2]) : 0,
      days: days.length ? days : [6],
      total,
      minutes: Math.round((hours * 60) / total)
    };
  }

  function sessionTitle(course, index, total) {
    if (index === total - 1) return 'Tổng kết, chấm sản phẩm & cấp chứng nhận';
    return (course.outcomes && course.outcomes[index]) || 'Thực hành chuyên sâu & hỏi đáp 1:1';
  }

  function buildAllSessions(enrollments) {
    const all = [];
    enrollments.forEach(enr => {
      const course = findCourse(enr.courseId);
      if (!course) return;
      const sch = parseSchedule(course);
      const cursor = new Date(enr.createdAt || Date.now());
      cursor.setHours(0, 0, 0, 0);
      cursor.setDate(cursor.getDate() + 1);
      let index = 0;
      for (let guard = 0; index < sch.total && guard < 400; guard++) {
        if (sch.days.includes(cursor.getDay())) {
          const start = new Date(cursor);
          start.setHours(sch.hour, sch.minute, 0, 0);
          all.push({
            course,
            enrollment: enr,
            index,
            total: sch.total,
            title: sessionTitle(course, index, sch.total),
            start,
            end: new Date(start.getTime() + sch.minutes * 60000),
            minutes: sch.minutes
          });
          index++;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    });
    return all.sort((a, b) => a.start - b.start);
  }

  function sessionStatus(s, now) {
    const t = (now || new Date()).getTime();
    if (t > s.end.getTime()) return 'done';
    if (t >= s.start.getTime() - JOIN_EARLY_MS) return 'live';
    return 'upcoming';
  }

  function nextSession() {
    return state.sessions.find(s => sessionStatus(s) !== 'done') || null;
  }

  // ==========================================
  // RENDER
  // ==========================================

  function renderAll() {
    renderHero();
    renderProfile();
    renderCalendar();
    renderSessionList();
    renderProgress();
    renderVideos();
  }

  function renderHero() {
    const user = state.user;
    const nameParts = user.fullName.trim().split(/\s+/);
    $('hero-greeting').textContent = `Xin chào, ${nameParts[nameParts.length - 1]}!`;
    const count = (state.lead.enrollments || []).length;
    $('hero-sub').textContent = count
      ? `Thầy/Cô đang theo học ${count} khóa. Cùng tiếp tục hành trình ứng dụng AI vào giảng dạy nhé!`
      : 'Thầy/Cô chưa đăng ký khóa học nào. Làm bài Test AI 2 phút để nhận lộ trình phù hợp nhất.';
    $('hero-student-id').textContent = `Mã học viên: ${studentCode(state.user.id)}`;
    renderNextClassCard();
  }

  function renderNextClassCard() {
    clearInterval(state.countdownTimer);
    const card = $('next-class-card');
    const next = nextSession();

    if (!next) {
      const interested = state.lead.interestedCourseId ? findCourse(state.lead.interestedCourseId) : null;
      card.innerHTML = interested
        ? `<div class="label">Gợi ý dành riêng cho Thầy/Cô</div>
           <h3>${esc(interested.title)}</h3>
           <div class="when"><i class="fa-regular fa-clock"></i> ${esc(interested.nextClassSchedule)} &middot; ${Store.formatCurrency(interested.price)}</div>
           <a href="index.html#courses" class="btn btn-success btn-block"><i class="fa-solid fa-cart-shopping"></i> Đăng ký khóa học</a>`
        : `<div class="label">Buổi học tiếp theo</div>
           <h3>Chưa có lịch học</h3>
           <div class="when">Đăng ký khóa học để nhận lịch Zoom và link vào lớp.</div>
           <a href="index.html#survey-section" class="btn btn-success btn-block"><i class="fa-solid fa-wand-magic-sparkles"></i> Làm bài Test AI 2 phút</a>`;
      return;
    }

    const c = next.course;
    card.innerHTML = `
      <div class="label">${sessionStatus(next) === 'live' ? '🔴 Lớp đang mở — vào ngay' : 'Buổi học tiếp theo'}</div>
      <h3>Buổi ${next.index + 1}/${next.total}: ${esc(c.shortTitle || c.title)}</h3>
      <div class="when"><i class="fa-regular fa-calendar"></i> ${DOW_LONG[next.start.getDay()]}, ${fmtDate(next.start)} &middot; ${fmtTime(next.start)} – ${fmtTime(next.end)}</div>
      <div class="countdown" id="countdown" aria-live="off"></div>
      <a href="${esc(c.zoomDemoUrl)}" target="_blank" rel="noopener" class="btn btn-success btn-block" data-zoom="${esc(c.id)}">
        <i class="fa-solid fa-video"></i> Vào lớp Zoom
      </a>
      <div style="font-size:0.76rem; color:var(--primary-100); margin-top:8px; text-align:center;">
        Meeting ID: <strong>${esc(c.zoomMeetingId)}</strong> &middot; Passcode: <strong>${esc(c.zoomPasscode)}</strong>
      </div>`;

    const tick = () => {
      const el = $('countdown');
      if (!el) return;
      const diff = Math.max(0, next.start.getTime() - Date.now());
      if (diff === 0) {
        el.innerHTML = '<div style="flex:1;"><strong>Đang học</strong><span>Chúc Thầy/Cô buổi học vui!</span></div>';
        clearInterval(state.countdownTimer);
        return;
      }
      const parts = [
        [Math.floor(diff / 86400000), 'Ngày'],
        [Math.floor((diff % 86400000) / 3600000), 'Giờ'],
        [Math.floor((diff % 3600000) / 60000), 'Phút'],
        [Math.floor((diff % 60000) / 1000), 'Giây']
      ];
      el.innerHTML = parts.map(([v, l]) => `<div><strong>${String(v).padStart(2, '0')}</strong><span>${l}</span></div>`).join('');
    };
    tick();
    state.countdownTimer = setInterval(tick, 1000);
  }

  function renderProfile() {
    const u = state.user;
    const lead = state.lead;
    const avatar = u.avatarUrl
      ? `<img src="${esc(u.avatarUrl)}" alt="" referrerpolicy="no-referrer">`
      : esc(Store.initials(u.fullName));

    $('profile-card').innerHTML = `
      <div class="profile-avatar">${avatar}</div>
      <h2 style="font-size:1.1rem;">${esc(u.fullName)}</h2>
      <div class="panel-sub">Học viên EduAI Teacher Hub</div>
      <ul class="profile-list">
        <li><i class="fa-solid fa-envelope"></i><div><small>Email</small>${esc(u.email || 'Chưa có')}</div></li>
        <li><i class="fa-solid fa-phone"></i><div style="flex:1;"><small>Số điện thoại (Zalo)</small>
          ${u.phone ? esc(u.phone) : `
            <form class="inline-form" id="phone-form" novalidate>
              <input type="tel" id="profile-phone" class="form-control" placeholder="0912 345 678" inputmode="tel" aria-label="Số điện thoại">
              <button class="btn btn-primary btn-sm" type="submit">Lưu</button>
            </form>`}
        </div></li>
        <li><i class="fa-solid fa-right-to-bracket"></i><div><small>Đăng nhập bằng</small>${u.provider === 'google' ? 'Tài khoản Google' : 'Số điện thoại'}</div></li>
        <li><i class="fa-solid fa-calendar-check"></i><div><small>Tham gia từ</small>${fmtDate(new Date(lead.createdAt || u.loggedInAt))}</div></li>
        <li><i class="fa-solid fa-id-badge"></i><div><small>Mã học viên</small>${studentCode(u.id)}</div></li>
      </ul>`;

    const form = $('phone-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const phone = $('profile-phone').value;
        if (!Store.validate.phone(phone)) {
          $('profile-phone').classList.add('is-invalid');
          showToast('SĐT Việt Nam không hợp lệ (10 số).', 'error');
          return;
        }
        state.user = Store.setUser({ phone });
        Store.upsertLead({ id: state.user.id, email: state.user.email, phone: state.user.phone });
        renderProfile();
        showToast('Đã lưu số điện thoại. Trung tâm sẽ gửi tài liệu qua Zalo!', 'success');
      });
    }
  }

  function renderCalendar() {
    const month = state.calMonth;
    $('cal-title').textContent = `Tháng ${month.getMonth() + 1}/${month.getFullYear()}`;

    const byDay = {};
    state.sessions.forEach(s => {
      const key = dayKey(s.start);
      (byDay[key] = byDay[key] || []).push(s);
    });

    const todayKey = dayKey(new Date());
    const firstDow = (month.getDay() + 6) % 7; // Thứ 2 đứng đầu tuần
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    let html = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => `<div class="cal-dow">${d}</div>`).join('');
    for (let i = 0; i < firstDow; i++) html += '<div class="cal-day is-empty"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d);
      const key = dayKey(date);
      const list = byDay[key];
      const classes = ['cal-day'];
      if (key === todayKey) classes.push('is-today');
      if (key === state.selectedDay) classes.push('is-selected');
      if (list) {
        classes.push('has-class');
        if (list.every(s => sessionStatus(s) === 'done')) classes.push('is-past');
        const label = list.map(s => `${fmtTime(s.start)} ${s.course.shortTitle || s.course.title}`).join('; ');
        html += `<button type="button" class="${classes.join(' ')}" data-day="${key}" title="${esc(label)}" aria-label="Ngày ${d}: ${esc(label)}">${d}<i class="fa-solid fa-video"></i></button>`;
      } else {
        html += `<div class="${classes.join(' ')}">${d}</div>`;
      }
    }
    $('cal-grid').innerHTML = html;
  }

  function renderSessionList() {
    let list;
    if (state.selectedDay) {
      list = state.sessions.filter(s => dayKey(s.start) === state.selectedDay);
      const [y, m, d] = state.selectedDay.split('-');
      $('session-list-title').innerHTML = `Buổi học ngày ${d}/${m}/${y} <button type="button" class="btn-copy" id="btn-show-upcoming" style="margin-left:6px;">Xem tất cả</button>`;
    } else {
      list = state.sessions.filter(s => sessionStatus(s) !== 'done').slice(0, 5);
      $('session-list-title').textContent = 'Các buổi sắp tới';
    }

    if (!list.length) {
      $('session-list').innerHTML = `
        <li class="empty-state">
          <i class="fa-regular fa-calendar-xmark big"></i>
          ${state.sessions.length ? 'Thầy/Cô đã hoàn thành tất cả buổi học. Chúc mừng!' : 'Chưa có buổi học nào. Lịch Zoom sẽ hiện ngay sau khi Thầy/Cô đăng ký khóa học.'}
          ${state.sessions.length ? '' : '<br><a href="index.html#courses" class="btn btn-primary btn-sm"><i class="fa-solid fa-layer-group"></i> Xem khóa học</a>'}
        </li>`;
      return;
    }

    $('session-list').innerHTML = list.map(s => {
      const status = sessionStatus(s);
      const isPaid = s.enrollment.status === 'paid';
      let action;
      if (status === 'live') action = `<a href="${esc(s.course.zoomDemoUrl)}" target="_blank" rel="noopener" class="btn btn-success btn-sm" data-zoom="${esc(s.course.id)}"><i class="fa-solid fa-video"></i> Vào lớp</a>`;
      else if (status === 'upcoming') action = `<a href="${esc(s.course.zoomDemoUrl)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" data-zoom="${esc(s.course.id)}">Link Zoom</a>`;
      else if (isPaid) action = `<button type="button" class="btn btn-trial-video btn-sm" data-play="${s.course.id}|${s.index}"><i class="fa-solid fa-circle-play"></i> Xem lại</button>`;
      else action = '<span class="status-badge status-unpaid"><i class="fa-solid fa-check"></i> Đã học</span>';

      return `
        <li class="session-item ${status === 'live' ? 'is-live' : ''}">
          <div class="session-date"><span>${DOW_SHORT[s.start.getDay()]}</span><strong>${s.start.getDate()}</strong><span>Th${s.start.getMonth() + 1}</span></div>
          <div class="session-info">
            <h5 title="${esc(s.title)}">Buổi ${s.index + 1}/${s.total} &middot; ${esc(s.course.shortTitle || s.course.title)}</h5>
            <p>${fmtTime(s.start)} – ${fmtTime(s.end)} &middot; ${esc(s.title)}</p>
          </div>
          ${action}
        </li>`;
    }).join('');
  }

  function renderProgress() {
    const enrollments = state.lead.enrollments || [];
    if (!enrollments.length) {
      $('progress-list').innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-seedling big"></i>
          Tiến trình học tập sẽ hiển thị khi Thầy/Cô bắt đầu khóa học đầu tiên.
        </div>`;
      return;
    }

    $('progress-list').innerHTML = enrollments.map(enr => {
      const course = findCourse(enr.courseId);
      if (!course) return '';
      const mine = state.sessions.filter(s => s.enrollment === enr);
      const done = mine.filter(s => sessionStatus(s) === 'done').length;
      const total = mine.length || parseSchedule(course).total;
      const pct = Math.round((done / total) * 100);
      const upcoming = mine.find(s => sessionStatus(s) !== 'done');
      const badge = enr.status === 'paid'
        ? '<span class="status-badge status-paid"><i class="fa-solid fa-circle-check"></i> Đã kích hoạt</span>'
        : '<span class="status-badge status-pending"><i class="fa-solid fa-clock"></i> Chờ xác nhận thanh toán</span>';

      return `
        <div class="progress-item">
          <div class="progress-top">
            <div>
              <h5>${esc(course.title)}</h5>
              <div style="margin-top:4px;">${badge}</div>
            </div>
            <span class="pct">${pct}%</span>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ ${esc(course.shortTitle || course.title)}">
            <div class="progress-fill" style="width:${pct}%;"></div>
          </div>
          <div class="progress-meta">
            <span><i class="fa-solid fa-circle-check"></i> ${done}/${total} buổi đã học</span>
            <span><i class="fa-regular fa-calendar"></i> ${upcoming ? `Buổi tới: ${DOW_LONG[upcoming.start.getDay()]}, ${fmtDate(upcoming.start)} lúc ${fmtTime(upcoming.start)}` : 'Đã hoàn thành khóa học 🎉'}</span>
          </div>
        </div>`;
    }).join('');
  }

  function renderVideos() {
    const done = state.sessions.filter(s => sessionStatus(s) === 'done').reverse();
    const unlocked = done.filter(s => s.enrollment.status === 'paid');
    const lockedCount = done.length - unlocked.length;
    const first = state.sessions[0];

    let html = '';
    if (unlocked.length) {
      html += `<div class="video-grid">${unlocked.map(s => `
        <button type="button" class="video-card" data-play="${s.course.id}|${s.index}">
          <div class="video-thumb" style="background:${s.course.gradient};">
            <span class="play"><i class="fa-solid fa-play"></i></span>
            <span class="dur">${s.minutes} phút</span>
          </div>
          <div class="video-card-body">
            <h5>Buổi ${s.index + 1}: ${esc(s.title)}</h5>
            <p>${esc(s.course.shortTitle || s.course.title)} &middot; ${fmtDate(s.start)}</p>
          </div>
        </button>`).join('')}</div>`;
    }
    if (lockedCount) {
      html += `<div class="notice notice-warn" style="margin:1rem 0 0;"><i class="fa-solid fa-lock"></i><div>${lockedCount} video sẽ mở khóa ngay khi Trung tâm xác nhận thanh toán của Thầy/Cô.</div></div>`;
    }
    if (!done.length) {
      html = `
        <div class="empty-state">
          <i class="fa-solid fa-film big"></i>
          ${first ? `Bản ghi buổi đầu tiên sẽ có tại đây sau buổi học ngày <strong>${fmtDate(first.start)}</strong>.` : 'Chưa có video. Bản ghi Zoom sẽ xuất hiện sau mỗi buổi học của khóa Thầy/Cô đăng ký.'}
        </div>`;
    }
    $('video-library').innerHTML = html;
  }

  // ==========================================
  // SỰ KIỆN
  // ==========================================

  function bindEvents() {
    $('cal-prev').addEventListener('click', () => shiftMonth(-1));
    $('cal-next').addEventListener('click', () => shiftMonth(1));

    $('cal-grid').addEventListener('click', e => {
      const btn = e.target.closest('[data-day]');
      if (!btn) return;
      state.selectedDay = state.selectedDay === btn.dataset.day ? null : btn.dataset.day;
      renderCalendar();
      renderSessionList();
    });

    $('session-list-title').addEventListener('click', e => {
      if (e.target.id !== 'btn-show-upcoming') return;
      state.selectedDay = null;
      renderCalendar();
      renderSessionList();
    });

    document.addEventListener('click', e => {
      const play = e.target.closest('[data-play]');
      if (play) openRecording(play.dataset.play);
      const zoom = e.target.closest('[data-zoom]');
      if (zoom) Store.track('join_zoom', { course_id: zoom.dataset.zoom });
    });

    $('recording-close').addEventListener('click', closeRecording);
    $('recording-modal').addEventListener('click', e => { if (e.target.id === 'recording-modal') closeRecording(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('recording-modal').classList.contains('active')) closeRecording();
    });
  }

  function shiftMonth(delta) {
    state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth() + delta, 1);
    renderCalendar();
  }

  function openRecording(ref) {
    const [courseId, idx] = ref.split('|');
    const s = state.sessions.find(x => x.course.id === courseId && String(x.index) === idx);
    if (!s) return;
    $('recording-title').innerHTML = `<i class="fa-solid fa-circle-play"></i> Buổi ${s.index + 1}: ${esc(s.title)}`;
    const player = $('recording-player');
    player.src = s.course.videoDemoUrl;
    player.poster = s.course.videoDemoPoster || '';
    $('recording-modal').classList.add('active');
    player.play().catch(() => {});
    Store.track('watch_recording', { course_id: courseId, session: Number(idx) + 1 });
  }

  function closeRecording() {
    const player = $('recording-player');
    player.pause();
    $('recording-modal').classList.remove('active');
  }

  // ==========================================
  // TIỆN ÍCH
  // ==========================================

  function studentCode(id) {
    let h = 0;
    for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return `EDUAI-${String(h % 100000).padStart(5, '0')}`;
  }

  function dayKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function fmtDate(d) {
    return isNaN(d) ? '—' : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fmtTime(d) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${esc(message)}</span>`;
    $('toast-container').appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'all 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
