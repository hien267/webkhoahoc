/**
 * EDUSITE — Phần dùng chung cho mọi trang (index.html, student.html, admin.html):
 * - Header navbar ngang: dropdown mục con (rê chuột trên desktop, bấm mũi tên trên cảm ứng/mobile),
 *   menu ☰ dưới 1024px, tô sáng trang hiện tại theo <body data-page="home|student|admin">.
 * - Thẻ người dùng trên header (Đăng nhập / avatar + Đăng xuất).
 * - Modal đăng nhập (Google Identity Services hoặc Họ tên + SĐT + Email) — tự chèn vào trang.
 * - Popup mật khẩu quản trị: bấm link tới admin.html (mục "Quản lý") khi chưa nhập mật khẩu → hỏi trước.
 * - Modal Chính sách & Quy định (link có data-policy) — tự chèn vào trang.
 * - Gated Access: trang có <body data-gated> (index.html) — khách chưa đăng nhập bấm vào BẤT KỲ đâu
 *   → mở modal đăng nhập, đăng nhập xong tự chạy tiếp thao tác dang dở (vd. bấm "Đăng ký" → mở checkout).
 * Phụ thuộc: js/config.js, js/lead-model.js, js/store.js; js/telegram.js (tùy chọn).
 * Các trang lắng nghe sự kiện window 'eduai:auth' (detail = user hoặc null khi đăng xuất).
 */
(function () {
  'use strict';

  const Store = window.EduStore;
  const esc = Store.escapeHtml;
  const $ = id => document.getElementById(id);

  // Không chặn: modal đăng nhập/chính sách, toast, phần tử có data-gate-exempt (nút ☰, mũi tên dropdown,
  // lối vào Trang quản lý — quản trị viên dùng mật khẩu riêng, không cần tài khoản học viên).
  const GATE_EXEMPT_SELECTOR = '#auth-modal, #admin-modal, #policy-modal, .toast-container, [data-gate-exempt]';
  const SURVEY_STATE_KEY = 'eduai_survey_state';

  let pendingAction = null;
  let adminTarget = 'admin.html';
  let googleButtonRendered = false;

  const AUTH_MODAL_HTML = `
    <div class="modal-backdrop auth-backdrop" id="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div class="modal-box auth-modal-box">
        <button type="button" class="auth-close-btn" id="auth-modal-close" aria-label="Đóng">&times;</button>
        <div class="auth-modal-head">
          <div class="auth-logo"><i class="fa-solid fa-graduation-cap"></i></div>
          <h3 id="auth-modal-title">Đăng nhập để tiếp tục</h3>
          <p>Miễn phí &middot; Lưu kết quả Test AI, nhận lộ trình học riêng và vào Cổng học viên.</p>
        </div>
        <div class="auth-modal-body">
          <div id="auth-google-block" hidden>
            <div class="auth-google-btn-wrap" id="google-signin-btn"></div>
            <div class="auth-divider"><span>hoặc đăng nhập bằng số điện thoại</span></div>
          </div>
          <form id="auth-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="auth-fullname">Họ và tên <span class="required">*</span></label>
              <div class="input-with-icon">
                <input type="text" id="auth-fullname" class="form-control" placeholder="Ví dụ: Cô Nguyễn Thu Hà" autocomplete="name" required>
                <i class="fa-solid fa-user-tie"></i>
              </div>
              <div class="form-error-text"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="auth-phone">Số điện thoại (Zalo) <span class="required">*</span></label>
              <div class="input-with-icon">
                <input type="tel" id="auth-phone" class="form-control" placeholder="0912 345 678" autocomplete="tel" inputmode="tel" required>
                <i class="fa-solid fa-phone"></i>
              </div>
              <div class="form-error-text"></div>
            </div>
            <div class="form-group">
              <label class="form-label" for="auth-email">Email <span class="required">*</span></label>
              <div class="input-with-icon">
                <input type="email" id="auth-email" class="form-control" placeholder="nguyenthuha@gmail.com" autocomplete="email" required>
                <i class="fa-solid fa-envelope"></i>
              </div>
              <div class="form-error-text"></div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block" id="auth-submit-btn">
              <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập &amp; Tiếp tục
            </button>
          </form>
          <p class="auth-terms">
            Bằng việc đăng nhập, Thầy/Cô đồng ý với
            <a href="#" data-policy="terms">Điều khoản sử dụng</a> và
            <a href="#" data-policy="privacy">Chính sách bảo mật</a>.
          </p>
        </div>
      </div>
    </div>`;

  // Popup mật khẩu khi bấm mục "Quản lý" trên header
  const ADMIN_MODAL_HTML = `
    <div class="modal-backdrop auth-backdrop" id="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <div class="modal-box auth-modal-box">
        <button type="button" class="auth-close-btn" id="admin-modal-close" aria-label="Đóng">&times;</button>
        <div class="auth-modal-head">
          <div class="auth-logo"><i class="fa-solid fa-lock"></i></div>
          <h3 id="admin-modal-title">Khu vực Quản trị</h3>
          <p>Nhập mật khẩu quản trị để vào Dashboard học viên &amp; Báo cáo doanh thu.</p>
        </div>
        <div class="auth-modal-body">
          <form id="admin-modal-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="admin-modal-key">Mật khẩu quản trị <span class="required">*</span></label>
              <div class="input-with-icon">
                <input type="password" id="admin-modal-key" class="form-control" autocomplete="current-password" required>
                <i class="fa-solid fa-key"></i>
              </div>
              <div class="form-error-text"></div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block" id="admin-modal-submit">
              <i class="fa-solid fa-right-to-bracket"></i> Vào trang quản trị
            </button>
          </form>
        </div>
      </div>
    </div>`;

  const POLICY_MODAL_HTML = `
    <div class="modal-backdrop" id="policy-modal" role="dialog" aria-modal="true" aria-labelledby="policy-modal-title">
      <div class="modal-box policy-modal-box">
        <div class="modal-header">
          <h3 id="policy-modal-title">Chính sách</h3>
          <button type="button" class="modal-close-btn" id="policy-modal-close-btn" aria-label="Đóng">&times;</button>
        </div>
        <div class="modal-body policy-modal-body" id="policy-modal-body"></div>
      </div>
    </div>`;

  const POLICY_CONTENT = {
    privacy: {
      title: 'Chính sách bảo mật',
      icon: 'fa-shield-halved',
      items: [
        'EduAI chỉ thu thập Họ tên, Email, Số điện thoại và câu trả lời khảo sát để đề xuất lộ trình học và hỗ trợ đăng ký khóa học.',
        'Thông tin của thầy cô không được bán, cho thuê hay chia sẻ cho bên thứ ba vì mục đích quảng cáo.',
        'Tiến trình khảo sát được lưu tạm trên chính trình duyệt của thầy cô để không bị mất khi tải lại trang; có thể xóa bất kỳ lúc nào bằng nút "Xóa & Làm lại".',
        'Thầy cô có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân bằng cách liên hệ hotro@eduai.edu.vn.'
      ]
    },
    terms: {
      title: 'Điều khoản sử dụng',
      icon: 'fa-file-contract',
      items: [
        'Nội dung bài giảng, video, kho Prompt mẫu thuộc bản quyền của EduAI Teacher Hub, chỉ dùng cho mục đích học tập và giảng dạy cá nhân.',
        'Không sao chép, phát tán hoặc bán lại tài liệu khóa học dưới bất kỳ hình thức nào khi chưa có sự đồng ý bằng văn bản.',
        'Tài khoản và link Zoom lớp học chỉ dành cho học viên đã đăng ký, không chia sẻ cho người khác.',
        'EduAI có quyền cập nhật điều khoản; mọi thay đổi sẽ được thông báo trên website và nhóm Zalo học viên.'
      ]
    },
    refund: {
      title: 'Chính sách hoàn tiền',
      icon: 'fa-rotate-left',
      items: [
        'Hoàn 100% học phí nếu thầy cô yêu cầu trong vòng 7 ngày kể từ ngày thanh toán và chưa tham gia quá 1 buổi học.',
        'Trường hợp lớp học bị hủy hoặc dời lịch từ phía Trung tâm, thầy cô được chọn chuyển lớp miễn phí hoặc hoàn tiền toàn bộ.',
        'Yêu cầu hoàn tiền gửi qua Zalo hoặc Email kèm Mã giao dịch; Trung tâm xử lý trong 3–5 ngày làm việc.',
        'Tiền được hoàn về đúng tài khoản ngân hàng đã chuyển khoản.'
      ]
    },
    student: {
      title: 'Quy định học viên',
      icon: 'fa-user-graduate',
      items: [
        'Vào lớp Zoom đúng giờ, đặt tên hiển thị theo cú pháp: Họ tên – Môn dạy – Tỉnh/Thành.',
        'Chuẩn bị máy tính/điện thoại có kết nối Internet ổn định và tài khoản Gmail để thực hành các công cụ AI.',
        'Tôn trọng giảng viên và đồng nghiệp, không đăng nội dung quảng cáo, không phù hợp trong nhóm lớp và Diễn đàn.',
        'Hoàn thành bài thực hành cuối khóa để được cấp Chứng nhận hoàn thành khóa học của Trung tâm.'
      ]
    }
  };

  function init() {
    document.body.insertAdjacentHTML('beforeend', AUTH_MODAL_HTML + ADMIN_MODAL_HTML + POLICY_MODAL_HTML);
    if (!$('toast-container')) document.body.insertAdjacentHTML('beforeend', '<div class="toast-container" id="toast-container"></div>');

    initHeader();
    initAuth();
    initPolicy();
    initAdminGate();
    renderHeaderUser();
    if (document.body.hasAttribute('data-gated')) initGate();
  }

  // ==========================================
  // HEADER NAVBAR & DROPDOWN
  // ==========================================

  function initHeader() {
    const page = document.body.dataset.page;
    document.querySelectorAll('.main-nav [data-nav]').forEach(item => {
      const current = item.dataset.nav === page;
      item.classList.toggle('is-current', current);
      const link = item.querySelector('.nav-link');
      if (link && current) link.setAttribute('aria-current', 'page');
    });

    const toggle = $('nav-toggle');
    if (toggle) toggle.addEventListener('click', () => setMobileNav(!document.body.classList.contains('nav-open')));

    // Nút mũi tên / avatar: mở-đóng dropdown bằng bấm (cảm ứng, bàn phím, mobile)
    document.addEventListener('click', e => {
      const toggler = e.target.closest('[data-dd-toggle]');
      if (toggler) {
        const item = toggler.closest('.nav-item');
        const willOpen = !item.classList.contains('open');
        closeDropdowns(item);
        setDropdown(item, willOpen);
        return;
      }
      if (!e.target.closest('.nav-item.open')) closeDropdowns();
      // Bấm 1 liên kết trong menu (kể cả anchor cùng trang) thì đóng menu mobile
      if (e.target.closest('.main-nav a[href]')) setMobileNav(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      closeDropdowns();
      setMobileNav(false);
    });

    // Rời chuột khỏi đầu mục thì đóng dropdown đã mở bằng bấm (tránh 2 dropdown cùng mở trên desktop)
    document.querySelectorAll('.site-header .nav-item').forEach(item => {
      item.addEventListener('mouseleave', () => {
        if (window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) setDropdown(item, false);
      });
    });

    const header = $('site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    window.matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setMobileNav(false); });
  }

  function setDropdown(item, open) {
    if (!item) return;
    item.classList.toggle('open', open);
    const btn = item.querySelector('[data-dd-toggle]');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function closeDropdowns(except) {
    document.querySelectorAll('.site-header .nav-item.open').forEach(item => {
      if (item !== except) setDropdown(item, false);
    });
  }

  function setMobileNav(open) {
    if (open === document.body.classList.contains('nav-open')) return;
    document.body.classList.toggle('nav-open', open);
    const toggle = $('nav-toggle');
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    toggle.innerHTML = `<i class="fa-solid ${open ? 'fa-xmark' : 'fa-bars'}"></i>`;
  }

  // Góc phải header: nút Đăng nhập hoặc avatar + menu người dùng
  function renderHeaderUser() {
    const box = $('header-user');
    if (!box) return;
    const user = Store.getUser();
    if (!user) {
      box.innerHTML = `
        <button type="button" class="header-login-btn" id="header-login-btn" data-gate-exempt>
          <i class="fa-solid fa-right-to-bracket"></i><span class="btn-label">Đăng nhập</span>
        </button>`;
      $('header-login-btn').addEventListener('click', () => openAuth());
      return;
    }
    box.innerHTML = `
      <div class="nav-item user-menu align-right">
        <div class="nav-row">
          <button type="button" class="user-chip" data-dd-toggle data-gate-exempt aria-expanded="false" aria-haspopup="true" aria-label="Tài khoản của ${esc(user.fullName)}">
            <span class="user-avatar">${esc(Store.initials(user.fullName))}</span>
            <span class="user-chip-name">${esc(user.fullName)}</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
        <ul class="nav-dropdown">
          <li class="user-menu-head">
            <strong>${esc(user.fullName)}</strong>
            <small>${esc(user.email || user.phone || '')}</small>
          </li>
          <li><a href="student.html"><span class="dd-icon"><i class="fa-solid fa-user-graduate"></i></span><span class="dd-text"><strong>Cổng học viên</strong><small>Lịch học, tiến trình, video</small></span></a></li>
          <li><button type="button" class="dropdown-action is-danger" id="btn-header-logout"><span class="dd-icon"><i class="fa-solid fa-right-from-bracket"></i></span><span class="dd-text"><strong>Đăng xuất</strong></span></button></li>
        </ul>
      </div>`;
    const item = box.querySelector('.nav-item');
    item.addEventListener('mouseleave', () => {
      if (window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) setDropdown(item, false);
    });
    $('btn-header-logout').addEventListener('click', handleLogout);
  }

  function handleLogout() {
    if (!confirm('Thầy/Cô muốn đăng xuất khỏi tài khoản?')) return;
    closeDropdowns();
    Store.logout();
    toast('Đã đăng xuất. Hẹn gặp lại Thầy/Cô!', 'info');
  }

  // ==========================================
  // MODAL ĐĂNG NHẬP & GOOGLE SIGN-IN
  // ==========================================

  function initAuth() {
    $('auth-modal-close').addEventListener('click', closeAuth);
    $('auth-modal').addEventListener('click', e => { if (e.target.id === 'auth-modal') closeAuth(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('auth-modal').classList.contains('active')) closeAuth();
    });
    $('auth-form').addEventListener('submit', handleAuthFormSubmit);
    window.addEventListener('eduai:auth', renderHeaderUser);
  }

  // Thông tin khách đã điền ở khảo sát (trước khi đăng nhập) để điền sẵn vào form
  function surveyUser() {
    try {
      const saved = JSON.parse(localStorage.getItem(SURVEY_STATE_KEY) || 'null');
      return (saved && saved.user) || {};
    } catch (e) {
      return {};
    }
  }

  function openAuth() {
    const modal = $('auth-modal');
    if (!modal || modal.classList.contains('active')) return;
    const known = surveyUser();
    const prefill = { 'auth-fullname': known.fullName, 'auth-phone': known.phone, 'auth-email': known.email };
    Object.keys(prefill).forEach(id => {
      const input = $(id);
      if (input && !input.value && prefill[id]) input.value = prefill[id];
    });
    closeDropdowns();
    setMobileNav(false);
    modal.classList.add('active');
    renderGoogleButton();
    Store.track('login_prompt');
    setTimeout(() => {
      const firstEmpty = Array.from($('auth-form').querySelectorAll('input')).find(i => !i.value);
      if (firstEmpty && window.matchMedia('(min-width: 769px)').matches) firstEmpty.focus();
    }, 80);
  }

  function closeAuth() {
    $('auth-modal').classList.remove('active');
    pendingAction = null;
  }

  function handleAuthFormSubmit(e) {
    e.preventDefault();
    const fullName = $('auth-fullname').value.trim();
    const phone = $('auth-phone').value.trim();
    const email = $('auth-email').value.trim();

    let isValid = true;
    if (fullName.length < 2) { showFieldError('auth-fullname', 'Vui lòng nhập họ và tên'); isValid = false; }
    else clearFieldError('auth-fullname');

    if (!Store.validate.phone(phone)) { showFieldError('auth-phone', 'SĐT Việt Nam không hợp lệ (10 số, VD: 0912345678)'); isValid = false; }
    else clearFieldError('auth-phone');

    if (!Store.validate.email(email)) { showFieldError('auth-email', 'Email không hợp lệ'); isValid = false; }
    else clearFieldError('auth-email');

    if (!isValid) return;
    completeLogin({ fullName, phone, email }, 'phone');
  }

  function renderGoogleButton() {
    const clientId = (window.EDUAI_CONFIG || {}).GOOGLE_CLIENT_ID;
    const target = $('google-signin-btn');
    if (!clientId || googleButtonRendered || !target) return;
    googleButtonRendered = true;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
      $('auth-google-block').hidden = false;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        ux_mode: 'popup',
        cancel_on_tap_outside: true
      });
      window.google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        locale: 'vi',
        width: Math.min(360, target.offsetWidth || 320)
      });
    };
    script.onerror = () => { googleButtonRendered = false; };
    document.head.appendChild(script);
  }

  function handleGoogleCredential(response) {
    const profile = Store.decodeGoogleCredential(response && response.credential);
    if (!profile || !profile.email) {
      toast('Không đọc được thông tin tài khoản Google, Thầy/Cô vui lòng thử lại hoặc đăng nhập bằng SĐT.', 'error');
      return;
    }
    completeLogin({
      fullName: profile.name || profile.email.split('@')[0],
      email: profile.email,
      phone: surveyUser().phone || '',
      avatarUrl: profile.picture || ''
    }, 'google');
  }

  function completeLogin(profile, method) {
    const action = pendingAction;
    closeAuth();

    // setUser phát sự kiện 'eduai:auth' → header và trang hiện tại tự cập nhật
    const user = Store.setUser(Object.assign({}, profile, { provider: method }));
    Store.upsertLead({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      provider: method,
      avatarUrl: user.avatarUrl,
      lastLoginAt: true
    });
    Store.track('login', { method });

    if (typeof sendTelegramNotification === 'function') {
      sendTelegramNotification({
        eventType: 'dang_nhap',
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        loginMethod: method,
        status: 'unpaid'
      });
    }

    toast(`Chào mừng Thầy/Cô ${user.fullName}! Đăng nhập thành công.`, 'success');

    // Tiếp tục đúng thao tác Thầy/Cô định làm trước khi đăng nhập
    if (action && document.body.contains(action)) {
      setTimeout(() => {
        if (action.tagName === 'SELECT' || action.tagName === 'TEXTAREA' || (action.tagName === 'INPUT' && !/radio|checkbox/.test(action.type))) action.focus();
        else action.click();
      }, 120);
    }
  }

  // ==========================================
  // GATED ACCESS (chỉ trang có <body data-gated>)
  // ==========================================

  function initGate() {
    document.addEventListener('click', onGatedClick, true);
    document.addEventListener('mousedown', onGatedMouseDown, true);
    document.addEventListener('submit', onGatedSubmit, true);
  }

  function isGateActive(target) {
    return !Store.getUser() && !(target && target.closest && target.closest(GATE_EXEMPT_SELECTOR));
  }

  function onGatedClick(e) {
    if (!isGateActive(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    pendingAction = e.target.closest('a[href], button, label, input, select, textarea');
    openAuth();
  }

  // Chặn dropdown <select> tự mở trước khi sự kiện click kịp chạy
  function onGatedMouseDown(e) {
    if (e.target.closest && e.target.closest('select') && isGateActive(e.target)) e.preventDefault();
  }

  function onGatedSubmit(e) {
    if (!isGateActive(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    openAuth();
  }

  // ==========================================
  // POPUP MẬT KHẨU TRANG QUẢN LÝ
  // Bấm link tới admin.html khi chưa nhập mật khẩu trong phiên → hỏi mật khẩu, đúng mới chuyển trang.
  // admin.html tự kiểm tra lại (mở thẳng URL vẫn phải nhập mật khẩu).
  // ==========================================

  function initAdminGate() {
    document.addEventListener('click', e => {
      const link = e.target.closest && e.target.closest('a[href]');
      if (!link || document.body.dataset.page === 'admin') return;
      const url = new URL(link.href, window.location.href);
      if (!/\/admin\.html$/.test(url.pathname) || Store.getAdminSession()) return;
      e.preventDefault();
      e.stopPropagation();
      adminTarget = url.pathname.split('/').pop() + url.hash;
      openAdminModal();
    }, true);

    $('admin-modal-close').addEventListener('click', closeAdminModal);
    $('admin-modal').addEventListener('click', e => { if (e.target.id === 'admin-modal') closeAdminModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && $('admin-modal').classList.contains('active')) closeAdminModal();
    });
    $('admin-modal-key').addEventListener('input', () => clearFieldError('admin-modal-key'));
    $('admin-modal-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = $('admin-modal-submit');
      btn.disabled = true;
      const result = await Store.verifyAdminKey($('admin-modal-key').value);
      btn.disabled = false;
      if (!result.ok) {
        showFieldError('admin-modal-key', result.error);
        $('admin-modal-key').select();
        return;
      }
      window.location.href = adminTarget;
    });
  }

  function openAdminModal() {
    closeDropdowns();
    setMobileNav(false);
    $('admin-modal-key').value = '';
    clearFieldError('admin-modal-key');
    $('admin-modal').classList.add('active');
    setTimeout(() => $('admin-modal-key').focus(), 80);
  }

  function closeAdminModal() {
    $('admin-modal').classList.remove('active');
  }

  // ==========================================
  // MODAL CHÍNH SÁCH & QUY ĐỊNH
  // ==========================================

  function initPolicy() {
    const modal = $('policy-modal');
    const close = () => modal.classList.remove('active');

    document.addEventListener('click', e => {
      const link = e.target.closest('[data-policy]');
      if (!link) return;
      e.preventDefault();
      openPolicy(link.dataset.policy);
    });
    $('policy-modal-close-btn').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });
  }

  function openPolicy(key) {
    const policy = POLICY_CONTENT[key];
    if (!policy) return;
    $('policy-modal-title').innerHTML = `<i class="fa-solid ${policy.icon}" style="color:var(--primary-600); margin-right:8px;"></i> ${policy.title}`;
    $('policy-modal-body').innerHTML = `
      <ul class="policy-list">
        ${policy.items.map(item => `<li><i class="fa-solid fa-circle-check"></i><span>${item}</span></li>`).join('')}
      </ul>
      <p class="policy-note">
        Cần hỗ trợ thêm? Liên hệ Hotline <a href="tel:0988123456">0988.123.456</a> hoặc Email <a href="mailto:hotro@eduai.edu.vn">hotro@eduai.edu.vn</a>.
      </p>`;
    $('policy-modal').classList.add('active');
  }

  // ==========================================
  // TIỆN ÍCH
  // ==========================================

  function showFieldError(inputId, message) {
    const input = $(inputId);
    if (!input) return;
    input.classList.add('is-invalid');
    const err = (input.closest('.form-group') || input.parentElement).querySelector('.form-error-text');
    if (err) { err.textContent = message; err.classList.add('visible'); }
  }

  function clearFieldError(inputId) {
    const input = $(inputId);
    if (!input) return;
    input.classList.remove('is-invalid');
    const err = (input.closest('.form-group') || input.parentElement).querySelector('.form-error-text');
    if (err) err.classList.remove('visible');
  }

  function toast(message, type) {
    const container = $('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    el.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${esc(message)}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }

  // Các script trang được đặt cuối <body> nên DOM đã sẵn sàng: khởi tạo ngay để trang dùng được EduSite
  init();

  window.EduSite = { openAuth, closeAuth, toast };
})();
