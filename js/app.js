/**
 * ỨNG DỤNG EDUAI TEACHER HUB - E-COMMERCE, SURVEY, VIETQR & FORUM
 * Core Application Logic, Video Trial Modal, Payment & Community Forum
 */

(function () {
  'use strict';

  // Application State
  const state = {
    currentStep: 0, // 0: Login, 1: Step 1, 2: Step 2, 3: Result
    user: {
      fullName: "",
      email: "",
      phone: ""
    },
    step1Data: {
      gradeLevel: "",
      subject: "",
      institutionType: "",
      experienceYears: "",
      aiUsageStatus: "",
      aiToolsUsed: [],
      aiSelfRating: "1"
    },
    step2Data: {
      aiSupportNeeds: [],
      primaryApplicationArea: "",
      primaryGoal: "",
      challenges: "",
      preferredLearningStyle: "",
      readinessLevel: ""
    },
    recommendations: [],
    selectedCourseForCheckout: null,
    forumPosts: [...FORUM_POSTS_DATA],
    leads: [],
    calendarViewDate: new Date(),
    selectedCalendarDate: null,
    currentCalendarDayMap: {},
    unlockedCourseId: null
  };

  const LEADS_STORAGE_KEY = 'eduai_leads_data';

  // DOM Cache
  const DOM = {
    panels: {
      step0: document.getElementById('panel-step-0'),
      step1: document.getElementById('panel-step-1'),
      step2: document.getElementById('panel-step-2'),
      step3: document.getElementById('panel-step-3')
    },
    stepper: {
      section: document.getElementById('stepper-section'),
      fill: document.getElementById('stepper-fill'),
      items: document.querySelectorAll('.step-item')
    },
    forms: {
      loginForm: document.getElementById('login-form'),
      step1Form: document.getElementById('step-1-form'),
      step2Form: document.getElementById('step-2-form'),
      forumCreateForm: document.getElementById('forum-create-form')
    },
    containers: {
      ecomCoursesGrid: document.getElementById('ecom-courses-grid'),
      step1Questions: document.getElementById('step-1-questions-container'),
      step2Questions: document.getElementById('step-2-questions-container'),
      resultProfile: document.getElementById('result-profile-card'),
      topRecommendations: document.getElementById('top-recommendations-container'),
      forumPostsList: document.getElementById('forum-posts-list'),
      calendarDaysGrid: document.getElementById('calendar-days-grid'),
      calendarMonthLabel: document.getElementById('calendar-month-label'),
      calendarDayDetail: document.getElementById('calendar-day-detail')
    },
    buttons: {
      backToStep0: document.getElementById('btn-back-to-step0'),
      backToStep1: document.getElementById('btn-back-to-step1'),
      retakeSurvey: document.getElementById('btn-retake-survey'),
      resetSurvey: document.getElementById('btn-reset-survey'),
      mobileMenuToggle: document.getElementById('mobile-menu-toggle')
    },
    modals: {
      checkout: {
        backdrop: document.getElementById('checkout-modal'),
        closeBtn: document.getElementById('modal-close-btn'),
        checkoutView: document.getElementById('modal-checkout-view'),
        successView: document.getElementById('modal-success-view')
      },
      trialVideo: {
        backdrop: document.getElementById('trial-video-modal'),
        closeBtn: document.getElementById('video-modal-close-btn'),
        title: document.getElementById('video-modal-title-text'),
        videoElement: document.getElementById('trial-video-player')
      }
    },
    toastContainer: document.getElementById('toast-container')
  };

  function init() {
    loadSavedState();
    loadLeads();
    renderEcomCoursesGrid("all");
    renderStep1Questions();
    renderStep2Questions();
    renderForumPosts();
    renderCalendarWidget();
    attachEventListeners();
    updateUIForStep(state.currentStep);
  }

  function loadSavedState() {
    try {
      const saved = localStorage.getItem('eduai_survey_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.user.fullName) {
          state.user = parsed.user;
          const nameInput = document.getElementById('input-fullname');
          const emailInput = document.getElementById('input-email');
          const phoneInput = document.getElementById('input-phone');
          if (nameInput) nameInput.value = state.user.fullName || '';
          if (emailInput) emailInput.value = state.user.email || '';
          if (phoneInput) phoneInput.value = state.user.phone || '';
        }
        if (parsed.step1Data) state.step1Data = { ...state.step1Data, ...parsed.step1Data };
        if (parsed.step2Data) state.step2Data = { ...state.step2Data, ...parsed.step2Data };
      }
    } catch (e) {
      console.warn("Could not load local storage", e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem('eduai_survey_state', JSON.stringify({
        user: state.user,
        step1Data: state.step1Data,
        step2Data: state.step2Data
      }));
    } catch (e) {
      console.warn("Could not save to local storage", e);
    }
  }

  function resetAllSurveyData() {
    if (confirm("Thầy/Cô có chắc chắn muốn xóa toàn bộ dữ liệu khảo sát và làm lại từ đầu không?")) {
      localStorage.removeItem('eduai_survey_state');
      state.user = { fullName: "", email: "", phone: "" };
      state.step1Data = { gradeLevel: "", subject: "", institutionType: "", experienceYears: "", aiUsageStatus: "", aiToolsUsed: [], aiSelfRating: "1" };
      state.step2Data = { aiSupportNeeds: [], primaryApplicationArea: "", primaryGoal: "", challenges: "", preferredLearningStyle: "", readinessLevel: "" };
      state.recommendations = [];

      if (DOM.forms.loginForm) DOM.forms.loginForm.reset();
      renderStep1Questions();
      renderStep2Questions();
      updateUIForStep(0);
      showToast("Đã làm mới toàn bộ dữ liệu khảo sát!", "info");
    }
  }

  function updateUIForStep(stepIndex) {
    state.currentStep = stepIndex;

    Object.keys(DOM.panels).forEach((key, idx) => {
      const panel = DOM.panels[key];
      if (panel) {
        if (idx === stepIndex) panel.classList.add('active');
        else panel.classList.remove('active');
      }
    });

    if (DOM.stepper.section) {
      if (stepIndex === 0) DOM.stepper.fill.style.width = '0%';
      else if (stepIndex === 1) DOM.stepper.fill.style.width = '33%';
      else if (stepIndex === 2) DOM.stepper.fill.style.width = '66%';
      else if (stepIndex === 3) DOM.stepper.fill.style.width = '100%';

      DOM.stepper.items.forEach((item, idx) => {
        item.classList.remove('active', 'completed');
        if (idx < stepIndex) item.classList.add('completed');
        else if (idx === stepIndex) item.classList.add('active');
      });
    }
  }

  // ==========================================
  // RENDER SHOWCASE KHÓA HỌC (KHÔNG CÓ SỐ THỨ TỰ)
  // ==========================================

  function renderEcomCoursesGrid(filterCategory) {
    const container = DOM.containers.ecomCoursesGrid;
    if (!container) return;

    let courses = COURSES_DATA;
    if (filterCategory && filterCategory !== "all") {
      courses = COURSES_DATA.filter(c => c.categoryFilter === filterCategory);
    }

    let html = '';

    courses.forEach(course => {
      html += `
        <div class="ecom-course-card">
          <div class="ecom-card-badge">${course.badge}</div>
          <div class="ecom-card-header" style="background: ${course.gradient};">
            <i class="${course.icon} ecom-course-icon"></i>
            <span class="ecom-card-category">${course.category}</span>
            <h4 class="ecom-card-title">${course.title}</h4>
          </div>

          <div class="ecom-card-body">
            <div class="ecom-schedule-tag">
              <i class="fa-regular fa-clock"></i> ${course.nextClassSchedule}
            </div>
            <p class="ecom-desc">${course.description}</p>
            <div class="ecom-tools-list">
              ${course.tools.map(t => `<span class="ecom-tool-chip">${t}</span>`).join('')}
            </div>
          </div>

          <div class="ecom-card-footer">
            <div class="ecom-price-row">
              <span class="ecom-price-current">${formatCurrency(course.price)}</span>
              <span class="ecom-price-old">${formatCurrency(course.originalPrice)}</span>
            </div>
            <div class="card-actions-dual">
              <button class="btn btn-trial-video btn-sm btn-open-trial" data-course-id="${course.id}">
                <i class="fa-solid fa-circle-play"></i> Học thử
              </button>
              <button class="btn btn-primary btn-sm btn-checkout-trigger" data-course-id="${course.id}">
                <i class="fa-solid fa-cart-shopping"></i> Đăng ký
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Gắn sự kiện nút checkout và video học thử
    container.querySelectorAll('.btn-checkout-trigger').forEach(btn => {
      btn.addEventListener('click', function () {
        openCheckoutModal(this.getAttribute('data-course-id'));
      });
    });

    container.querySelectorAll('.btn-open-trial').forEach(btn => {
      btn.addEventListener('click', function () {
        openTrialVideoModal(this.getAttribute('data-course-id'));
      });
    });
  }

  // ==========================================
  // RENDER DYNAMIC QUESTIONS (STEP 1 & STEP 2)
  // ==========================================

  function renderStep1Questions() {
    const container = DOM.containers.step1Questions;
    if (!container) return;

    let html = '';
    SURVEY_QUESTIONS.step1.forEach(q => {
      html += `
        <div class="survey-question-block" id="block-${q.id}">
          <div class="question-title-area">
            <div class="question-icon"><i class="${q.icon}"></i></div>
            <div class="question-text-wrap">
              <h3>${q.title}</h3>
              ${q.subtitle ? `<div class="question-subtitle">${q.subtitle}</div>` : ''}
            </div>
          </div>
      `;

      if (q.type === 'select') {
        html += `
          <div class="form-group mb-0">
            <select class="form-control form-select" name="${q.id}" id="select-${q.id}" style="padding-left:14px;" required>
              ${q.options.map(opt => `<option value="${opt.value}" ${state.step1Data[q.id] === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (q.type === 'radio') {
        const gridCols = q.options.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';
        html += `<div class="options-grid ${gridCols}">`;
        q.options.forEach(opt => {
          const isChecked = state.step1Data[q.id] === opt.value;
          html += `
            <label class="choice-card ${isChecked ? 'selected' : ''}">
              <input type="radio" name="${q.id}" value="${opt.value}" ${isChecked ? 'checked' : ''} style="display:none;" required>
              <div class="choice-indicator"><i class="fa-solid fa-check"></i></div>
              ${opt.icon ? `<i class="${opt.icon} choice-icon"></i>` : ''}
              <span class="choice-label-text">${opt.label}</span>
            </label>
          `;
        });
        html += `</div>`;
      } else if (q.type === 'checkbox') {
        html += `<div class="options-grid grid-cols-3">`;
        q.options.forEach(opt => {
          const isChecked = (state.step1Data.aiToolsUsed || []).includes(opt.value);
          html += `
            <label class="choice-card ${isChecked ? 'selected' : ''}">
              <input type="checkbox" name="${q.id}" value="${opt.value}" ${isChecked ? 'checked' : ''} style="display:none;">
              <div class="choice-indicator"><i class="fa-solid fa-check"></i></div>
              ${opt.icon ? `<i class="${opt.icon} choice-icon"></i>` : ''}
              <span class="choice-label-text">${opt.label}</span>
            </label>
          `;
        });
        html += `</div>`;
      } else if (q.type === 'rating') {
        html += `<div class="rating-levels-container">`;
        q.levels.forEach(lvl => {
          const isChecked = String(state.step1Data.aiSelfRating) === String(lvl.score);
          let starIcons = '';
          for (let s = 1; s <= 5; s++) {
            starIcons += s <= lvl.score ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
          }
          html += `
            <label class="rating-level-card ${isChecked ? 'selected' : ''}">
              <input type="radio" name="${q.id}" value="${lvl.score}" ${isChecked ? 'checked' : ''} style="display:none;">
              <div class="rating-stars">${starIcons}</div>
              <div class="rating-info">
                <h4>${lvl.title}</h4>
                <p>${lvl.desc}</p>
              </div>
            </label>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
    });

    container.innerHTML = html;
  }

  function renderStep2Questions() {
    const container = DOM.containers.step2Questions;
    if (!container) return;

    let html = '';
    SURVEY_QUESTIONS.step2.forEach(q => {
      html += `
        <div class="survey-question-block" id="block-${q.id}">
          <div class="question-title-area">
            <div class="question-icon"><i class="${q.icon}"></i></div>
            <div class="question-text-wrap">
              <h3>${q.title}</h3>
              ${q.subtitle ? `<div class="question-subtitle" id="subtitle-${q.id}">${q.subtitle}</div>` : ''}
            </div>
          </div>
      `;

      if (q.type === 'checkbox_limit') {
        html += `<div class="options-grid grid-cols-3">`;
        q.options.forEach(opt => {
          const isChecked = (state.step2Data.aiSupportNeeds || []).includes(opt.value);
          html += `
            <label class="choice-card ${isChecked ? 'selected' : ''}">
              <input type="checkbox" name="${q.id}" value="${opt.value}" ${isChecked ? 'checked' : ''} style="display:none;">
              <div class="choice-indicator"><i class="fa-solid fa-check"></i></div>
              ${opt.icon ? `<i class="${opt.icon} choice-icon"></i>` : ''}
              <span class="choice-label-text">${opt.label}</span>
            </label>
          `;
        });
        html += `</div>`;
      } else if (q.type === 'radio') {
        html += `<div class="options-grid grid-cols-2">`;
        q.options.forEach(opt => {
          const isChecked = state.step2Data[q.id] === opt.value;
          html += `
            <label class="choice-card ${isChecked ? 'selected' : ''}">
              <input type="radio" name="${q.id}" value="${opt.value}" ${isChecked ? 'checked' : ''} style="display:none;" required>
              <div class="choice-indicator"><i class="fa-solid fa-check"></i></div>
              <span class="choice-label-text">${opt.label}</span>
            </label>
          `;
        });
        html += `</div>`;
      }

      html += `</div>`;
    });

    container.innerHTML = html;
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  function attachEventListeners() {
    // 1. Mobile Menu Toggle
    if (DOM.buttons.mobileMenuToggle) {
      DOM.buttons.mobileMenuToggle.addEventListener('click', function () {
        const nav = document.getElementById('nav-menu');
        if (nav) nav.classList.toggle('mobile-open');
      });
    }

    // 2. Filter Buttons for Courses
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.getAttribute('data-filter');
        renderEcomCoursesGrid(filter);
      });
    });

    // 3. Form Login / Step 0 Submit
    if (DOM.forms.loginForm) {
      DOM.forms.loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const fullName = document.getElementById('input-fullname').value.trim();
        const email = document.getElementById('input-email').value.trim();
        const phone = document.getElementById('input-phone').value.trim();

        let isValid = true;
        if (!fullName) { showFieldError('input-fullname', 'Vui lòng nhập họ và tên'); isValid = false; }
        else clearFieldError('input-fullname');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) { showFieldError('input-email', 'Gmail không hợp lệ'); isValid = false; }
        else clearFieldError('input-email');

        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phone || !phoneRegex.test(phone.replace(/\s+/g, ''))) { showFieldError('input-phone', 'SĐT Việt Nam không hợp lệ (10 số)'); isValid = false; }
        else clearFieldError('input-phone');

        if (!isValid) return;

        state.user = { fullName, email, phone };
        saveState();
        showToast(`Xin chào Thầy/Cô ${fullName}! Bắt đầu khảo sát.`, 'success');
        updateUIForStep(1);

        document.getElementById('survey-section').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 4. Input Changes (Radios, Checkboxes, Limits)
    document.addEventListener('change', function (e) {
      const target = e.target;

      if (target.type === 'radio') {
        const name = target.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
          const card = input.closest('.choice-card') || input.closest('.rating-level-card');
          if (card) card.classList.remove('selected');
        });
        const currentCard = target.closest('.choice-card') || target.closest('.rating-level-card');
        if (currentCard) currentCard.classList.add('selected');

        const block = target.closest('.survey-question-block');
        if (block) block.classList.remove('error-highlight');
      }

      if (target.name === 'aiToolsUsed') {
        const card = target.closest('.choice-card');
        if (target.checked) {
          card.classList.add('selected');
          if (target.value === 'none') {
            document.querySelectorAll('input[name="aiToolsUsed"]').forEach(cb => {
              if (cb.value !== 'none') {
                cb.checked = false;
                cb.closest('.choice-card').classList.remove('selected');
              }
            });
          } else {
            const noneCb = document.querySelector('input[name="aiToolsUsed"][value="none"]');
            if (noneCb && noneCb.checked) {
              noneCb.checked = false;
              noneCb.closest('.choice-card').classList.remove('selected');
            }
          }
        } else {
          card.classList.remove('selected');
        }
      }

      if (target.name === 'aiSupportNeeds') {
        const checkedBoxes = Array.from(document.querySelectorAll('input[name="aiSupportNeeds"]:checked'));
        const max = 3;

        if (checkedBoxes.length > max) {
          target.checked = false;
          target.closest('.choice-card').classList.remove('selected');
          showToast(`Thầy/Cô chỉ được chọn tối đa ${max} nhu cầu cấp thiết nhất!`, 'error');
          return;
        }

        const card = target.closest('.choice-card');
        if (target.checked) card.classList.add('selected');
        else card.classList.remove('selected');

        const subtitle = document.getElementById('subtitle-aiSupportNeeds');
        if (subtitle) {
          subtitle.innerHTML = `⚡ Hãy chọn TỐI ĐA 3 nhu cầu cấp thiết nhất <strong style="color:var(--primary-600)">(Đã chọn ${checkedBoxes.length}/3)</strong>`;
        }

        const block = target.closest('.survey-question-block');
        if (block) block.classList.remove('error-highlight');
      }
    });

    // 5. Submit Step 1
    if (DOM.forms.step1Form) {
      DOM.forms.step1Form.addEventListener('submit', function (e) {
        e.preventDefault();

        const gradeLevelInput = document.querySelector('input[name="gradeLevel"]:checked');
        const subjectSelect = document.getElementById('select-subject');
        const institutionInput = document.querySelector('input[name="institutionType"]:checked');
        const experienceInput = document.querySelector('input[name="experienceYears"]:checked');
        const aiUsageInput = document.querySelector('input[name="aiUsageStatus"]:checked');
        const ratingInput = document.querySelector('input[name="aiSelfRating"]:checked');
        const selectedTools = Array.from(document.querySelectorAll('input[name="aiToolsUsed"]:checked')).map(cb => cb.value);

        let isValid = true;
        if (!gradeLevelInput) { highlightBlockError('block-gradeLevel', 'Vui lòng chọn Cấp học'); isValid = false; }
        if (!subjectSelect || !subjectSelect.value) { highlightBlockError('block-subject', 'Vui lòng chọn Môn dạy chính'); isValid = false; }
        if (!institutionInput) { highlightBlockError('block-institutionType', 'Vui lòng chọn Nhóm trường'); isValid = false; }
        if (!experienceInput) { highlightBlockError('block-experienceYears', 'Vui lòng chọn Số năm kinh nghiệm'); isValid = false; }
        if (!aiUsageInput) { highlightBlockError('block-aiUsageStatus', 'Vui lòng chọn Mức độ tiếp cận AI'); isValid = false; }
        if (!ratingInput) { highlightBlockError('block-aiSelfRating', 'Vui lòng tự đánh giá năng lực AI (1 - 5 sao)'); isValid = false; }

        if (!isValid) {
          showToast('Vui lòng hoàn thành tất cả các câu hỏi bắt buộc ở Bước 1!', 'error');
          return;
        }

        state.step1Data.gradeLevel = gradeLevelInput.value;
        state.step1Data.subject = subjectSelect.value;
        state.step1Data.institutionType = institutionInput.value;
        state.step1Data.experienceYears = experienceInput.value;
        state.step1Data.aiUsageStatus = aiUsageInput.value;
        state.step1Data.aiToolsUsed = selectedTools;
        state.step1Data.aiSelfRating = ratingInput.value;

        saveState();
        updateUIForStep(2);
        document.getElementById('survey-section').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 6. Submit Step 2 & Nút "Gửi đi và nhận lộ trình khóa học phù hợp"
    if (DOM.forms.step2Form) {
      DOM.forms.step2Form.addEventListener('submit', function (e) {
        e.preventDefault();

        const selectedNeeds = Array.from(document.querySelectorAll('input[name="aiSupportNeeds"]:checked')).map(cb => cb.value);
        const primaryAreaInput = document.querySelector('input[name="primaryApplicationArea"]:checked');
        const primaryGoalInput = document.querySelector('input[name="primaryGoal"]:checked');
        const challengesInput = document.querySelector('input[name="challenges"]:checked');
        const learningStyleInput = document.querySelector('input[name="preferredLearningStyle"]:checked');
        const readinessInput = document.querySelector('input[name="readinessLevel"]:checked');

        let isValid = true;
        if (selectedNeeds.length === 0) { highlightBlockError('block-aiSupportNeeds', 'Vui lòng chọn ít nhất 1 nhu cầu AI (tối đa 3)'); isValid = false; }
        if (!primaryAreaInput) { highlightBlockError('block-primaryApplicationArea', 'Vui lòng chọn Phần việc ứng dụng chủ yếu'); isValid = false; }
        if (!primaryGoalInput) { highlightBlockError('block-primaryGoal', 'Vui lòng chọn Mục tiêu quan trọng nhất'); isValid = false; }
        if (!challengesInput) { highlightBlockError('block-challenges', 'Vui lòng chọn Khó khăn lớn nhất đang gặp'); isValid = false; }
        if (!learningStyleInput) { highlightBlockError('block-preferredLearningStyle', 'Vui lòng chọn Hình thức học tập phù hợp'); isValid = false; }
        if (!readinessInput) { highlightBlockError('block-readinessLevel', 'Vui lòng chọn Mức độ sẵn sàng'); isValid = false; }

        if (!isValid) {
          showToast('Vui lòng hoàn thành các lựa chọn nhu cầu ở Bước 2!', 'error');
          return;
        }

        state.step2Data.aiSupportNeeds = selectedNeeds;
        state.step2Data.primaryApplicationArea = primaryAreaInput.value;
        state.step2Data.primaryGoal = primaryGoalInput.value;
        state.step2Data.challenges = challengesInput.value;
        state.step2Data.preferredLearningStyle = learningStyleInput.value;
        state.step2Data.readinessLevel = readinessInput.value;

        saveState();
        state.recommendations = calculateCourseRecommendations(state.user, state.step1Data, state.step2Data);
        renderResultScreen();
        updateUIForStep(3);
        createConfetti();

        const topCourse = state.recommendations[0];
        upsertLead({
          fullName: state.user.fullName,
          phone: state.user.phone,
          email: state.user.email,
          courseId: topCourse ? topCourse.id : null,
          courseTitle: topCourse ? topCourse.title : 'Chưa xác định',
          matchRate: topCourse ? topCourse.matchRate : null,
          status: 'unpaid'
        });

        if (typeof sendTelegramNotification === 'function') {
          sendTelegramNotification({
            eventType: 'khao_sat_hoan_thanh',
            fullName: state.user.fullName,
            phone: state.user.phone,
            courseTitle: topCourse ? topCourse.title : 'Chưa xác định',
            matchRate: topCourse ? topCourse.matchRate : null,
            status: 'unpaid'
          });
        }

        document.getElementById('survey-section').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 7. Navigation Buttons
    if (DOM.buttons.backToStep0) DOM.buttons.backToStep0.addEventListener('click', () => updateUIForStep(0));
    if (DOM.buttons.backToStep1) DOM.buttons.backToStep1.addEventListener('click', () => updateUIForStep(1));
    if (DOM.buttons.resetSurvey) DOM.buttons.resetSurvey.addEventListener('click', resetAllSurveyData);

    // 8. Checkout Modal Close
    if (DOM.modals.checkout.closeBtn) DOM.modals.checkout.closeBtn.addEventListener('click', closeCheckoutModal);
    if (DOM.modals.checkout.backdrop) {
      DOM.modals.checkout.backdrop.addEventListener('click', function (e) {
        if (e.target === DOM.modals.checkout.backdrop) closeCheckoutModal();
      });
    }

    // 9. Trial Video Modal Close (Nút X đỏ/trắng)
    if (DOM.modals.trialVideo.closeBtn) {
      DOM.modals.trialVideo.closeBtn.addEventListener('click', closeTrialVideoModal);
    }
    if (DOM.modals.trialVideo.backdrop) {
      DOM.modals.trialVideo.backdrop.addEventListener('click', function (e) {
        if (e.target === DOM.modals.trialVideo.backdrop) closeTrialVideoModal();
      });
    }

    // 10. Forum Form Submit (Đăng bài thảo luận mới)
    if (DOM.forms.forumCreateForm) {
      DOM.forms.forumCreateForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const titleInput = document.getElementById('forum-input-title');
        const contentInput = document.getElementById('forum-input-content');
        const subjectSelect = document.getElementById('forum-input-subject');

        if (!titleInput.value.trim() || !contentInput.value.trim()) {
          showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung thảo luận!', 'error');
          return;
        }

        const newPost = {
          id: `post_${Date.now()}`,
          author: state.user.fullName || "Thầy/Cô Giáo Viên",
          role: "Thành viên Cộng đồng EduAI",
          avatar: (state.user.fullName || "GV").slice(0, 2).toUpperCase(),
          avatarBg: "#8B5CF6",
          time: "Vừa xong",
          subjectTag: subjectSelect.value || "Kinh nghiệm AI",
          tagColor: "#6D28D9",
          title: titleInput.value.trim(),
          content: contentInput.value.trim(),
          likes: 1,
          commentsCount: 0,
          isLiked: true,
          comments: []
        };

        state.forumPosts.unshift(newPost);
        renderForumPosts();
        DOM.forms.forumCreateForm.reset();
        showToast('Đã gửi bài thảo luận lên diễn đàn thành công!', 'success');
      });
    }

    // 11. Lịch Học Trực Tuyến: Điều hướng Tháng trước / Tháng sau
    const btnCalendarPrev = document.getElementById('calendar-prev-month');
    const btnCalendarNext = document.getElementById('calendar-next-month');
    if (btnCalendarPrev) {
      btnCalendarPrev.addEventListener('click', function () {
        state.calendarViewDate = new Date(state.calendarViewDate.getFullYear(), state.calendarViewDate.getMonth() - 1, 1);
        renderCalendarWidget();
      });
    }
    if (btnCalendarNext) {
      btnCalendarNext.addEventListener('click', function () {
        state.calendarViewDate = new Date(state.calendarViewDate.getFullYear(), state.calendarViewDate.getMonth() + 1, 1);
        renderCalendarWidget();
      });
    }
  }

  // ==========================================
  // RENDER RESULT SCREEN (STEP 3) - WHITE TEXT
  // ==========================================

  function renderResultScreen() {
    renderProfileHeader();
    renderTopRecommendations();
  }

  function renderProfileHeader() {
    const container = DOM.containers.resultProfile;
    if (!container) return;

    const ratingScore = parseInt(state.step1Data.aiSelfRating || "1", 10);
    const ratingLabels = [
      "",
      "Mức 1: Khởi động & Làm quen AI",
      "Mức 2: Người thực hành cơ bản",
      "Mức 3: Người ứng dụng thường xuyên",
      "Mức 4: Người dùng thành thạo",
      "Mức 5: Chuyên gia chuyển đổi số"
    ];
    const topCourse = state.recommendations[0];

    container.innerHTML = `
      <div class="result-hero-box">
        <div class="teacher-profile-header">
          <div class="teacher-meta-left">
            <div class="teacher-avatar-circle"><i class="fa-solid fa-chalkboard-user"></i></div>
            <div class="teacher-info">
              <h2>Lộ Trình AI Dành Riêng Cho: <span>${escapeHtml(state.user.fullName || 'Thầy/Cô Giáo Viên')}</span></h2>
              <div class="teacher-badges">
                <span class="profile-tag"><i class="fa-solid fa-book-open"></i> Môn ${getSubjectName(state.step1Data.subject)}</span>
                <span class="profile-tag"><i class="fa-solid fa-school"></i> Cấp ${getGradeName(state.step1Data.gradeLevel)}</span>
                <span class="profile-tag"><i class="fa-solid fa-clock-rotate-left"></i> ${getExperienceText(state.step1Data.experienceYears)}</span>
              </div>
            </div>
          </div>
          <div>
            <button class="btn btn-outline" style="border-color: rgba(255,255,255,0.6); color:#fff;" id="btn-retake-survey">
              <i class="fa-solid fa-arrow-rotate-right"></i> Khảo sát lại
            </button>
          </div>
        </div>

        <div class="ai-diagnosis-grid">
          <div class="diagnosis-stat-card">
            <div class="stat-label"><i class="fa-solid fa-chart-pie"></i> Năng lực AI Hiện tại</div>
            <div class="stat-value" style="color: #38BDF8;">${ratingScore}/5 Sao</div>
            <div class="stat-desc">${ratingLabels[ratingScore]}</div>
          </div>
          <div class="diagnosis-stat-card">
            <div class="stat-label"><i class="fa-solid fa-bullseye"></i> Lộ trình Tối ưu Nhất</div>
            <div class="stat-value" style="color: #FDE047;">${topCourse ? topCourse.shortTitle : 'Chuyên sâu'}</div>
            <div class="stat-desc">Độ tương thích đạt ${topCourse ? topCourse.matchRate : 98}%</div>
          </div>
          <div class="diagnosis-stat-card">
            <div class="stat-label"><i class="fa-solid fa-gift"></i> Học bổng Chuyển đổi số</div>
            <div class="stat-value" style="color: #4ADE80;">Ưu đãi tới 65%</div>
            <div class="stat-desc">Áp dụng trực tiếp vào học phí hôm nay</div>
          </div>
        </div>
      </div>
    `;

    const btnRetake = document.getElementById('btn-retake-survey');
    if (btnRetake) btnRetake.addEventListener('click', () => updateUIForStep(1));
  }

  function renderTopRecommendations() {
    const container = DOM.containers.topRecommendations;
    if (!container) return;

    const top3 = state.recommendations.slice(0, 3);
    let html = '';

    top3.forEach((course, index) => {
      const rank = index + 1;
      const isTop1 = rank === 1;

      html += `
        <div class="course-card ${isTop1 ? 'is-top-1' : ''}">
          <div class="match-ribbon top-${rank}">
            <i class="fa-solid fa-sparkles"></i> Phù hợp ${course.matchRate}%
          </div>
          <div class="course-card-banner">
            <div class="course-icon-badge" style="background: ${course.gradient};">
              <i class="${course.icon}"></i>
            </div>
            <span class="course-category-tag">${course.category}</span>
            <h4 class="course-card-title">${course.title}</h4>
          </div>
          <div class="course-card-body">
            <div class="match-reason-box">
              <i class="fa-solid fa-circle-check"></i>
              <span><strong>Vì sao phù hợp:</strong> ${course.matchReasons[0] || 'Lộ trình tối ưu cho môn học của Thầy/Cô.'}</span>
            </div>
            <p class="course-desc">${course.description}</p>
            <ul class="course-outcomes-list">
              ${course.outcomes.slice(0, 3).map(out => `<li><i class="fa-solid fa-check-circle"></i> <span>${out}</span></li>`).join('')}
            </ul>
            <div class="tools-stack-wrap">
              ${course.tools.map(tool => `<span class="tool-chip">${tool}</span>`).join('')}
            </div>
          </div>
          <div class="course-card-footer">
            <div class="price-wrap">
              <span class="current-price">${formatCurrency(course.price)}</span>
              <span class="original-price">${formatCurrency(course.originalPrice)}</span>
            </div>
            <div class="card-actions-dual">
              <button class="btn btn-trial-video btn-sm btn-open-trial" data-course-id="${course.id}">
                <i class="fa-solid fa-circle-play"></i> Video học thử
              </button>
              <button class="btn ${isTop1 ? 'btn-primary' : 'btn-outline'} btn-sm btn-checkout-trigger" data-course-id="${course.id}">
                <i class="fa-solid fa-credit-card"></i> Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-checkout-trigger').forEach(btn => {
      btn.addEventListener('click', function () {
        openCheckoutModal(this.getAttribute('data-course-id'));
      });
    });

    container.querySelectorAll('.btn-open-trial').forEach(btn => {
      btn.addEventListener('click', function () {
        openTrialVideoModal(this.getAttribute('data-course-id'));
      });
    });
  }

  // ==========================================
  // MODAL VIDEO HỌC THỬ (VỚI NÚT "X" ĐỎ NỔI BẬT)
  // ==========================================

  function openTrialVideoModal(courseId) {
    const course = COURSES_DATA.find(c => c.id === courseId) || COURSES_DATA[0];
    
    if (DOM.modals.trialVideo.title) {
      DOM.modals.trialVideo.title.innerHTML = `<i class="fa-solid fa-circle-play"></i> ${course.videoDemoTitle || 'Trải nghiệm Bài Giảng AI'}`;
    }

    if (DOM.modals.trialVideo.videoElement) {
      DOM.modals.trialVideo.videoElement.src = course.videoDemoUrl;
      DOM.modals.trialVideo.videoElement.poster = course.videoDemoPoster;
      DOM.modals.trialVideo.videoElement.play().catch(() => {});
    }

    DOM.modals.trialVideo.backdrop.classList.add('active');
  }

  function closeTrialVideoModal() {
    if (DOM.modals.trialVideo.videoElement) {
      DOM.modals.trialVideo.videoElement.pause();
    }
    DOM.modals.trialVideo.backdrop.classList.remove('active');
  }

  // ==========================================
  // CHECKOUT MODAL & VIETQR PAYMENT
  // ==========================================

  function openCheckoutModal(courseId) {
    const course = COURSES_DATA.find(c => c.id === courseId) || COURSES_DATA[0];
    state.selectedCourseForCheckout = course;

    DOM.modals.checkout.checkoutView.style.display = 'block';
    DOM.modals.checkout.successView.style.display = 'none';

    const phone = state.user.phone || "0988888888";
    const transferContent = `EDUAI ${course.code} ${phone.slice(-4)}`;
    const qrUrl = `https://img.vietqr.io/image/MB-${BANK_CONFIG.accountNumber}-compact2.png?amount=${course.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountHolder)}`;

    DOM.modals.checkout.checkoutView.innerHTML = `
      <div class="checkout-grid">
        <div class="qr-box-wrap">
          <img src="${qrUrl}" alt="Mã QR Chuyển khoản" class="vietqr-image">
          <div class="qr-scan-guide">
            <i class="fa-solid fa-qrcode"></i> Quét mã qua bất kỳ App Ngân hàng nào
          </div>
          <div style="margin-top:8px; font-size:0.75rem; color:var(--emerald-600); font-weight:700;">
            <i class="fa-solid fa-shield-check"></i> Tự động khớp lệnh & cấp link Zoom
          </div>
        </div>

        <div>
          <div style="background:var(--primary-50); border:1px solid var(--primary-100); padding:10px 14px; border-radius:var(--radius-md); margin-bottom:1rem;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--primary-700); text-transform:uppercase;">${course.category}</div>
            <div style="font-weight:700; color:var(--slate-900); font-size:1.05rem;">${course.title}</div>
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:4px;">
              <span style="font-size:1.35rem; font-weight:800; color:var(--rose-500);">${formatCurrency(course.price)}</span>
              <span style="font-size:0.8rem; color:var(--slate-400); text-decoration:line-through;">${formatCurrency(course.originalPrice)}</span>
            </div>
          </div>

          <div class="bank-info-details">
            <div class="bank-row">
              <span class="bank-row-label">Ngân hàng:</span>
              <span class="bank-row-val">${BANK_CONFIG.bankName}</span>
            </div>
            <div class="bank-row">
              <span class="bank-row-label">Số tài khoản:</span>
              <span class="bank-row-val">
                <span>${BANK_CONFIG.accountNumber}</span>
                <button class="btn-copy" onclick="navigator.clipboard.writeText('${BANK_CONFIG.accountNumber}'); alert('Đã sao chép số tài khoản!');">Copy</button>
              </span>
            </div>
            <div class="bank-row">
              <span class="bank-row-label">Chủ tài khoản:</span>
              <span class="bank-row-val">${BANK_CONFIG.accountHolder}</span>
            </div>
            <div class="bank-row">
              <span class="bank-row-label">Nội dung CK:</span>
              <span class="bank-row-val" style="color:var(--rose-600);">
                <span>${transferContent}</span>
                <button class="btn-copy" onclick="navigator.clipboard.writeText('${transferContent}'); alert('Đã sao chép nội dung chuyển khoản!');">Copy</button>
              </span>
            </div>
          </div>

          <div style="margin-top:1.25rem;">
            <button class="btn btn-success btn-lg btn-block" id="btn-modal-confirm">
              <i class="fa-solid fa-circle-check"></i> TÔI ĐÃ CHUYỂN KHOẢN / XÁC NHẬN
            </button>
          </div>
        </div>
      </div>
    `;

    const btnConfirm = document.getElementById('btn-modal-confirm');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', renderSuccessZoomScreen);
    }

    DOM.modals.checkout.backdrop.classList.add('active');
  }

  function closeCheckoutModal() {
    DOM.modals.checkout.backdrop.classList.remove('active');
  }

  function renderSuccessZoomScreen() {
    const course = state.selectedCourseForCheckout || COURSES_DATA[0];
    const studentId = `EDUAI-${Math.floor(10000 + Math.random() * 90000)}`;

    DOM.modals.checkout.checkoutView.style.display = 'none';
    DOM.modals.checkout.successView.style.display = 'block';

    DOM.modals.checkout.successView.innerHTML = `
      <div class="success-zoom-card">
        <div class="success-badge-icon"><i class="fa-solid fa-check"></i></div>
        <h3 style="font-size:1.5rem; color:var(--primary-900); margin-bottom:4px;">Đăng Ký & Kích Hoạt Thành Công!</h3>
        <p style="color:var(--slate-600); font-size:0.92rem; margin-bottom:1rem;">
          Chào mừng Thầy/Cô <strong>${escapeHtml(state.user.fullName || 'Giáo viên')}</strong> đã kích hoạt thành công khóa học!
        </p>

        <div class="student-id-pill">
          <i class="fa-solid fa-id-badge"></i> Mã học viên của Thầy/Cô: <strong>${studentId}</strong>
        </div>

        <div class="zoom-classroom-box">
          <div class="zoom-box-header">
            <div>
              <div style="font-size:0.75rem; color:var(--cyan-400); font-weight:700; text-transform:uppercase;">Phòng Học Trực Tuyến Zoom Demo</div>
              <div style="font-size:1.15rem; font-weight:800; color:var(--white);">${course.title}</div>
            </div>
            <span class="badge-tag" style="background:#10B981; color:#fff; border:none;">
              <i class="fa-solid fa-video"></i> Sẵn sàng
            </span>
          </div>

          <div class="zoom-info-grid">
            <div>
              <div class="zoom-item-label">Zoom Meeting ID:</div>
              <div class="zoom-item-val">${course.zoomMeetingId}</div>
            </div>
            <div>
              <div class="zoom-item-label">Mật khẩu (Passcode):</div>
              <div class="zoom-item-val">${course.zoomPasscode}</div>
            </div>
            <div>
              <div class="zoom-item-label">Lịch học trực tiếp:</div>
              <div style="font-size:0.95rem; color:var(--primary-100); font-weight:600;">${course.nextClassSchedule}</div>
            </div>
            <div>
              <div class="zoom-item-label">Thời lượng:</div>
              <div style="font-size:0.95rem; color:var(--primary-100); font-weight:600;">${course.duration}</div>
            </div>
          </div>

          <a href="${course.zoomDemoUrl}" target="_blank" class="btn btn-success btn-lg btn-block" style="font-size:1.1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> 👉 VÀO LỚP ZOOM DEMO NGAY BÂY GIỜ
          </a>
        </div>

        <button class="btn btn-success btn-lg btn-block" id="btn-view-my-calendar" style="margin-top:12px; background:var(--rose-500); border-color:var(--rose-500);">
          <i class="fa-solid fa-calendar-check"></i> 🔓 Xem & Mở Khóa Lịch Học Của Bạn
        </button>

        <div style="display:flex; gap:10px; margin-top:1rem;">
          <a href="https://zalo.me/g/eduai_teacher" target="_blank" class="btn btn-secondary" style="flex:1;">
            <i class="fa-solid fa-comments"></i> Tham gia Nhóm Zalo Hỗ Trợ 1:1
          </a>
          <button class="btn btn-outline" style="flex:1;" onclick="document.getElementById('checkout-modal').classList.remove('active');">
            Đóng cửa sổ
          </button>
        </div>
      </div>
    `;

    upsertLead({
      fullName: state.user.fullName,
      phone: state.user.phone,
      email: state.user.email,
      courseId: course.id,
      courseTitle: course.title,
      matchRate: (state.recommendations.find(r => r.id === course.id) || {}).matchRate || null,
      status: 'paid'
    });

    if (typeof sendTelegramNotification === 'function') {
      sendTelegramNotification({
        eventType: 'xac_nhan_thanh_toan',
        fullName: state.user.fullName,
        phone: state.user.phone,
        courseTitle: course.title,
        matchRate: (state.recommendations.find(r => r.id === course.id) || {}).matchRate || null,
        status: 'paid',
        transactionId: studentId
      });
    }
    showToast('Đã xác nhận thanh toán và gửi thông báo tới đội Sales qua Telegram!', 'success');
    state.unlockedCourseId = course.id;

    const btnViewCalendar = document.getElementById('btn-view-my-calendar');
    if (btnViewCalendar) {
      btnViewCalendar.addEventListener('click', function () {
        closeCheckoutModal();
        jumpCalendarToCourse(course);
      });
    }

    createConfetti();
  }

  // ==========================================
  // DIỄN ĐÀN THẢO LUẬN GIÁO VIÊN (COMMUNITY FORUM)
  // ==========================================

  function renderForumPosts() {
    const container = DOM.containers.forumPostsList;
    if (!container) return;

    let html = '';
    state.forumPosts.forEach(post => {
      html += `
        <div class="forum-post-card" id="card-${post.id}">
          <div class="forum-author-bar">
            <div class="author-meta-wrap">
              <div class="forum-avatar" style="background: ${post.avatarBg};">${post.avatar}</div>
              <div class="author-text-info">
                <h5>${post.author}</h5>
                <span>${post.role} &bull; ${post.time}</span>
              </div>
            </div>
            <span class="profile-tag" style="background:${post.tagColor}; color:#fff; font-size:0.75rem;">
              ${post.subjectTag}
            </span>
          </div>

          <h4 class="forum-post-title">${post.title}</h4>
          <p class="forum-post-content">${post.content}</p>

          <div class="forum-post-actions">
            <button class="btn-forum-action ${post.isLiked ? 'liked' : ''}" onclick="window.toggleForumLike('${post.id}')">
              <i class="${post.isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              <span>${post.likes} Yêu thích</span>
            </button>
            <button class="btn-forum-action" onclick="alert('Thầy/Cô vui lòng đăng nhập để bình luận bài viết này!');">
              <i class="fa-regular fa-comment"></i>
              <span>${post.commentsCount} Bình luận</span>
            </button>
            <button class="btn-forum-action" onclick="navigator.clipboard.writeText(window.location.href); alert('Đã sao chép link bài thảo luận!');">
              <i class="fa-solid fa-share-nodes"></i>
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  window.toggleForumLike = function (postId) {
    const post = state.forumPosts.find(p => p.id === postId);
    if (post) {
      if (post.isLiked) {
        post.likes -= 1;
        post.isLiked = false;
      } else {
        post.likes += 1;
        post.isLiked = true;
      }
      renderForumPosts();
    }
  };

  // ==========================================
  // LỊCH HỌC TRỰC TUYẾN (ZOOM CALENDAR WIDGET)
  // ==========================================

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getCourseScheduleWeekdays(course) {
    const text = (course.nextClassSchedule || '').toLowerCase();
    const timeMatch = text.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : '';
    const weekdays = [];
    Object.keys(WEEKDAY_MAP).forEach(key => {
      if (text.includes(key)) weekdays.push(WEEKDAY_MAP[key]);
    });
    return { time, weekdays };
  }

  function buildClassDayIndex(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dayMap = {};

    COURSES_DATA.forEach(course => {
      const { time, weekdays } = getCourseScheduleWeekdays(course);
      if (!weekdays.length) return;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        if (weekdays.includes(dateObj.getDay())) {
          const key = formatDateKey(dateObj);
          if (!dayMap[key]) dayMap[key] = [];
          dayMap[key].push({
            courseId: course.id,
            courseTitle: course.shortTitle,
            time: time,
            gradient: course.gradient
          });
        }
      }
    });

    return dayMap;
  }

  function findNextClassDate(course) {
    const { weekdays } = getCourseScheduleWeekdays(course);
    if (!weekdays.length) return null;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      if (weekdays.includes(d.getDay())) return d;
    }
    return null;
  }

  function renderCalendarWidget() {
    const grid = DOM.containers.calendarDaysGrid;
    const label = DOM.containers.calendarMonthLabel;
    if (!grid || !label) return;

    const viewDate = state.calendarViewDate;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    label.textContent = `Tháng ${month + 1} / ${year}`;

    state.currentCalendarDayMap = buildClassDayIndex(viewDate);
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = formatDateKey(new Date());

    let html = '';
    for (let i = 0; i < firstDayOfWeek; i++) {
      html += `<div class="calendar-day-cell empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const key = formatDateKey(dateObj);
      const classesToday = state.currentCalendarDayMap[key] || [];
      const hasClass = classesToday.length > 0;
      const isToday = key === todayKey;
      const isSelected = key === state.selectedCalendarDate;

      html += `
        <button type="button" class="calendar-day-cell ${hasClass ? 'has-class' : ''} ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}" data-date-key="${key}">
          <span class="calendar-day-number">${d}</span>
          ${hasClass ? `<span class="calendar-day-dot">${classesToday.length}</span>` : ''}
        </button>
      `;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.calendar-day-cell:not(.empty)').forEach(cell => {
      cell.addEventListener('click', function () {
        selectCalendarDay(this.getAttribute('data-date-key'));
      });
    });

    renderCalendarDayDetail();
  }

  function selectCalendarDay(key) {
    state.selectedCalendarDate = key;
    const grid = DOM.containers.calendarDaysGrid;
    if (grid) {
      grid.querySelectorAll('.calendar-day-cell').forEach(cell => cell.classList.remove('is-selected'));
      const cell = grid.querySelector(`[data-date-key="${key}"]`);
      if (cell) cell.classList.add('is-selected');
    }
    renderCalendarDayDetail();
  }

  function renderCalendarDayDetail() {
    const container = DOM.containers.calendarDayDetail;
    if (!container) return;

    const key = state.selectedCalendarDate || formatDateKey(new Date());
    const classesToday = state.currentCalendarDayMap[key] || [];
    const [y, m, d] = key.split('-');
    const dateLabel = `${d}/${m}/${y}`;

    if (classesToday.length === 0) {
      container.innerHTML = `
        <div class="calendar-detail-empty">
          <i class="fa-regular fa-calendar-xmark"></i>
          <span>Ngày ${dateLabel} không có lớp học Zoom nào.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <h4 class="calendar-detail-title"><i class="fa-solid fa-calendar-check"></i> Lịch học ngày ${dateLabel}</h4>
      <div class="calendar-detail-list">
        ${classesToday.map(c => `
          <div class="calendar-detail-item">
            <div class="calendar-detail-badge" style="background:${c.gradient};"><i class="fa-solid fa-video"></i></div>
            <div class="calendar-detail-info">
              <strong>${escapeHtml(c.courseTitle)}</strong>
              <span>${c.time ? `Giờ vào lớp: ${c.time}` : 'Xem giờ chi tiết trong email xác nhận'}</span>
            </div>
            ${c.courseId === state.unlockedCourseId ? '<span class="calendar-unlocked-tag"><i class="fa-solid fa-unlock"></i> Lớp của bạn</span>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function jumpCalendarToCourse(course) {
    const nextDate = findNextClassDate(course);
    state.unlockedCourseId = course.id;

    if (nextDate) {
      state.calendarViewDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
      renderCalendarWidget();
      selectCalendarDay(formatDateKey(nextDate));
    } else {
      renderCalendarDayDetail();
    }

    const calendarSection = document.getElementById('calendar-section');
    if (calendarSection) calendarSection.scrollIntoView({ behavior: 'smooth' });
    showToast('Đã mở khóa Lịch học & Link Zoom cho khóa học của Thầy/Cô!', 'success');
  }

  // ==========================================
  // BẢNG QUẢN LÝ LEAD (MINI ADMIN DASHBOARD) & WEBHOOK SALES
  // ==========================================

  function loadLeads() {
    try {
      const saved = localStorage.getItem(LEADS_STORAGE_KEY);
      state.leads = saved ? JSON.parse(saved) : [];
    } catch (e) {
      state.leads = [];
    }
  }

  function saveLeads() {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(state.leads));
    } catch (e) {
      console.warn('Không thể lưu danh sách Lead vào localStorage:', e);
    }
  }

  function upsertLead(data) {
    const phoneKey = (data.phone || '').replace(/\s+/g, '');
    let lead = phoneKey ? state.leads.find(l => (l.phone || '').replace(/\s+/g, '') === phoneKey) : null;
    const now = new Date().toISOString();

    if (lead) {
      lead.fullName = data.fullName || lead.fullName;
      lead.email = data.email || lead.email;
      lead.courseId = data.courseId;
      lead.courseTitle = data.courseTitle;
      lead.matchRate = data.matchRate;
      lead.updatedAt = now;
      if (data.status === 'paid') {
        lead.status = 'paid';
        lead.paidAt = now;
      } else if (!lead.status) {
        lead.status = 'unpaid';
      }
    } else {
      lead = {
        id: `lead_${Date.now()}`,
        fullName: data.fullName || 'Chưa cung cấp',
        phone: data.phone || 'Chưa cung cấp',
        email: data.email || '',
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        matchRate: data.matchRate,
        status: data.status || 'unpaid',
        createdAt: now,
        updatedAt: now,
        paidAt: data.status === 'paid' ? now : null
      };
      state.leads.unshift(lead);
    }

    saveLeads();
    return lead;
  }

  // Lưu ý: Lead được lưu âm thầm vào localStorage (`eduai_leads_data`) làm bản sao lưu nội bộ,
  // không hiển thị công khai trên giao diện. Thông báo thời gian thực cho đội Sales đi qua
  // Telegram (xem hàm sendTelegramNotification, khai báo trong <script> riêng ở cuối index.html).

  // Lưu ý: hàm gửi thông báo Telegram thực tế (sendTelegramNotification) được khai báo
  // trong <script> riêng ở cuối file index.html, ngay dưới 2 biến cấu hình
  // TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID, để bạn dễ tìm và điền thông tin Bot của mình.

  // ==========================================
  // HELPERS
  // ==========================================

  function getSubjectName(val) {
    const map = { toan: "Toán", ngu_van: "Ngữ văn", tieng_anh: "Tiếng Anh", khtn: "KHTN", lich_su_dia_ly: "Sử - Địa", tin_hoc: "Tin học", ngoai_ngu_khac: "Ngoại ngữ", gdtc: "GDTC", nghe_thuat: "Nghệ thuật", chu_nhiem_tpt: "Chủ nhiệm", mon_khac: "Chuyên môn" };
    return map[val] || "Giáo viên";
  }

  function getGradeName(val) {
    const map = { mam_non: "Mầm non", tieu_hoc: "Tiểu học", thcs: "THCS", thpt: "THPT", khac: "Cơ sở Đào tạo" };
    return map[val] || "Toàn cấp";
  }

  function getExperienceText(val) {
    const map = { under_1: "< 1 năm KN", "1_3": "1 - 3 năm KN", "4_10": "4 - 10 năm KN", "11_20": "11 - 20 năm KN", over_20: "> 20 năm KN" };
    return map[val] || "Giáo viên";
  }

  function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('is-invalid');
    let err = input.parentElement.querySelector('.form-error-text');
    if (err) { err.textContent = message; err.classList.add('visible'); }
  }

  function clearFieldError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove('is-invalid');
    let err = input.parentElement.querySelector('.form-error-text');
    if (err) err.classList.remove('visible');
  }

  function highlightBlockError(blockId, message) {
    const block = document.getElementById(blockId);
    if (block) {
      block.classList.add('error-highlight');
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (message) showToast(message, 'error');
  }

  function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    let icon = type === 'error' ? 'fa-solid fa-circle-exclamation' : (type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info');
    toast.innerHTML = `<i class="${icon}"></i> <span>${escapeHtml(message)}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function createConfetti() {
    const colors = ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.style.position = 'fixed';
      p.style.zIndex = '99999';
      p.style.width = Math.random() * 8 + 6 + 'px';
      p.style.height = Math.random() * 8 + 6 + 'px';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.top = '-20px';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.opacity = '1';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      p.style.transition = `top ${Math.random() * 2 + 1.5}s ease-out, transform ${Math.random() * 2 + 1.5}s ease-out, opacity 1s ease-out`;

      document.body.appendChild(p);
      setTimeout(() => {
        p.style.top = Math.random() * 60 + 30 + 'vh';
        p.style.transform = `rotate(${Math.random() * 720}deg) scale(1.2)`;
      }, 50);
      setTimeout(() => {
        p.style.opacity = '0';
        setTimeout(() => p.remove(), 1000);
      }, 2000);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
