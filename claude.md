# TRUNG TÂM ĐÀO TẠO AI DÀNH CHO GIÁO VIÊN (EduAI Teacher Hub)

> **Sứ mệnh:** Tiên phong phổ cập và ứng dụng Trí tuệ nhân tạo (AI) thực chiến vào giáo dục Việt Nam, giúp hơn 1.000.000 giáo viên tiết kiệm 70% thời gian soạn bài, nâng cao chất lượng bài giảng và giảm tải áp lực nghề nghiệp.

---

## 1. THÔNG TIN DỰ ÁN & ĐỊNH HƯỚNG TỔNG QUAN

- **Tên dự án:** Trung tâm Đào tạo AI dành cho Giáo viên (EduAI Teacher Hub).
- **Mục tiêu sản phẩm:** Cung cấp hệ sinh thái khảo sát đánh giá năng lực AI cá nhân hóa và đề xuất lộ trình đào tạo, khóa học thực hành AI phù hợp nhất với từng môn học, cấp học và nhu cầu thực tiễn của mỗi thầy cô giáo.
- **Đối tượng người dùng chính:** Giáo viên Mầm non, Tiểu học, THCS, THPT, Giảng viên, Giáo viên Trung tâm, Gia sư và Cán bộ quản lý giáo dục.

---

## 2. PHONG CÁCH THIẾT KẾ & UI/UX DESIGN SYSTEM

### 2.1. Triết lý Thiết kế
- **Tối giản (Minimalism) & Tinh tế:** Không gian thoáng đãng, các khối thông tin rõ ràng, giảm thiểu nhận thức quá tải cho giáo viên.
- **Thân thiện & Tận tâm (Teacher-Friendly):** Ngôn từ sư phạm ấm áp, biểu tượng trực quan, hướng dẫn từng bước rõ ràng, dễ tiếp cận kể cả với thầy cô ít tiếp xúc công nghệ.
- **Hiện đại & Công nghệ Giáo dục (EdTech Modern):** Kết hợp các đường nét bo tròn mềm mại, hiệu ứng chuyển động mượt mà (smooth micro-interactions), thẻ kính nhẹ (glassmorphism), tạo cảm giác tiên tiến và truyền cảm hứng.

### 2.2. Bảng màu Chủ đạo (Color Palette)
- **Primary Color (Xanh Giáo Dục & Công Nghệ):** 
  - Deep Navy: `#1E3A8A` (Header, tiêu đề chính, tạo sự uy tín vững chãi)
  - Tech Blue: `#2563EB` & `#3B82F6` (Nút bấm chính, điểm nhấn, thanh tiến trình)
- **Secondary / Accent Colors:**
  - Cyan Glow: `#06B6D4` / `#0EA5E9` (Hiệu ứng ánh sáng, badge nổi bật)
  - Emerald Green: `#10B981` (Thành công, điểm mạnh, đánh giá cao)
  - Amber Orange: `#F59E0B` (Ưu đãi, cảnh báo, tag giá trị)
- **Neutral Backgrounds:**
  - Light Slate: `#F8FAFC` (Nền toàn trang)
  - Surface White: `#FFFFFF` (Thẻ nội dung, form input)
  - Border & Dividers: `#E2E8F0` / `#CBD5E1`
  - Text Primary: `#0F172A` (Chữ đen than sang trọng, dễ đọc)
  - Text Secondary: `#475569` (Mô tả, ghi chú phụ)

### 2.3. Typography (Phông chữ)
- **Phông chữ chủ đạo:** `Be Vietnam Pro` và `Plus Jakarta Sans` (Google Fonts).
- **Đặc điểm:** Tối ưu hóa hoàn hảo cho tiếng Việt có dấu, khoảng cách ký tự thoáng, không bị lỗi dấu thanh điệu, tỷ lệ tương phản chuẩn WCAG 2.1 AA.

### 2.4. Nguyên tắc Tương tác & Micro-Animations
- **Hover Effects:** Nút bấm nâng nhẹ (`transform: translateY(-2px)`), đổi bóng mờ (`box-shadow`), đổi màu gradient nhẹ nhàng.
- **Card Selection:** Viền phát sáng (`border-color: #2563EB`, `ring: 2px #93C5FD`), biểu tượng check đánh dấu trực quan.
- **Transition:** Chuyển đổi giữa các bước mượt mà trong 0.3s - 0.4s (fade & slide-in).
- **Mobile-Friendly (100% Responsive):** Thiết kế chuẩn Touch-Friendly với kích thước nút bấm tối thiểu 44px, hỗ trợ vuốt chạm trên màn hình điện thoại từ 360px trở lên.

---

## 3. CẤU TRÚC LUỒNG TRẢI NGHIỆM NGƯỜI DÙNG (USER FLOW)

```
[ Màn hình Đăng nhập / Khởi đầu ]
    │
    ▼ (Nhập: Họ tên, Gmail, Số điện thoại)
[ Màn 1: Thông tin nghề nghiệp & Mức độ tiếp cận AI ]
    │ (Cấp học, Môn dạy, Nhóm trường, Kinh nghiệm, Tình trạng dùng AI, Công cụ, Tự đánh giá)
    ▼
[ Màn 2: Nhu cầu học & Mong muốn ứng dụng AI ]
    │ (Nhu cầu hỗ trợ tối đa 3, Ứng dụng chính, Mục tiêu lớn nhất, Khó khăn, Hình thức học, Mức độ sẵn sàng)
    ▼
[ Màn 3: Báo cáo Năng lực & Đề xuất Khóa học Cá nhân hóa ]
    │ (Radar/Badge phân tích AI Profile + Danh sách Top 3 đề xuất + Xem 8 khóa học + Đăng ký nhận ưu đãi)
```

---

## 4. DANH MỤC 8 KHÓA HỌC THỰC CHIẾN CỦA TRUNG TÂM

| Mã | Tên Khóa Học | Học Phí Ưu Đãi | Trọng Tâm Đào Tạo |
|---|---|---|---|
| **KH01** | **Quản lý Tài liệu, Trợ lý Ảo & Tự động hóa Công việc Hành chính** | **299.000 đ** | Quản trị học liệu số, email tự động, phân loại tài liệu, tóm tắt văn bản pháp quy |
| **KH02** | **Thiết kế Slide Tương tác, Infographic & Học liệu Trực quan Đỉnh cao** | **399.000 đ** | Gamma AI, Canva Magic Studio, Curipod, tạo slide bài giảng chuẩn sư phạm trong 5 phút |
| **KH03** | **Ứng dụng AI trong Công tác Chủ nhiệm, Sổ sách & Nhận xét Học sinh** | **349.000 đ** | Nhận xét học bạ cá nhân hóa theo Thông tư 22/27/26, kế hoạch chủ nhiệm, kết nối phụ huynh |
| **KH04** | **Soạn Kế hoạch Bài dạy (Giáo án) Thông minh Chuẩn Công văn 5512** | **499.000 đ** | Prompt Master cho giáo án 4 bước, phiếu học tập phân hóa, tích hợp phương pháp dạy học tích cực |
| **KH05** | **Thiết kế Ma trận Đề kiểm tra, Ngân hàng Câu hỏi & Đánh giá Năng lực** | **449.000 đ** | Xây dựng ma trận - đặc tả đề, trắc nghiệm đúng/sai/nhiều lựa chọn, rubrics chấm tự luận |
| **KH06** | **Sáng tạo Video Bài giảng Số hóa, Lồng tiếng AI & Nhân vật Hoạt hình** | **549.000 đ** | HeyGen, CapCut AI, D-ID, ElevenLabs tạo MC ảo, lồng tiếng chuẩn, video bài giảng hấp dẫn |
| **KH07** | **Trợ lý AI Viết Sáng kiến Kinh nghiệm & Nghiên cứu Khoa học Sư phạm** | **599.000 đ** | Cấu trúc SKKN chuẩn Sở, phát triển ý tưởng giải pháp mới, tổng hợp minh chứng và trích dẫn |
| **KH08** | **Xây dựng Trò chơi Học tập Tương tác, Web App Mini & Gamification** | **499.000 đ** | Tạo game tương tác (Quizizz/Kahoot/Wayground AI), mô phỏng thí nghiệm ảo, web học tập |

---

## 5. QUY TẮC PHÁT TRIỂN & CHẤT LƯỢNG MÃ NGUỒN

1. **Mã nguồn sạch (Clean Code):** Sử dụng HTML5 ngữ nghĩa, CSS3 hiện đại (Flexbox, Grid, CSS Variables) và JavaScript thuần (ES6+) không phụ thuộc thư viện cồng kềnh để đảm bảo tốc độ tải trang dưới 0.5s.
2. **Không lỗi thời gian thực (Zero Console Error):** Kiểm tra kỹ các sự kiện DOM, biểu thức chính quy số điện thoại/email, và các trường hợp người dùng thao tác nhanh.
3. **Bảo mật & Lưu trữ:** Tự động lưu tiến trình khảo sát vào `localStorage` để giáo viên không bị mất dữ liệu khi vô tình tải lại trang.
4. **Trải nghiệm Đăng ký mượt mà:** Modal đăng ký thông minh, xác nhận học phí ưu đãi, kèm hiệu ứng chúc mừng (Confetti) và liên kết Zalo/Hotline hỗ trợ nhanh.

---

## 6. TRẠNG THÁI DỰ ÁN HIỆN TẠI

> **Cập nhật lần cuối:** 2026-09-30 — Dự án là **Multi-page Application (MPA) gồm 3 file trang độc lập**: **`index.html`** (Trang chủ / Khám phá), **`student.html`** (Cổng học viên), **`admin.html`** (Trang quản lý). Chuyển trang là tải trang thật (URL trên thanh địa chỉ đổi). Điều hướng bằng **Header Navbar ngang** có dropdown khi rê chuột (sidebar dọc & router hash `#/...` đã bỏ). Có Gated Access (bắt đăng nhập ở `index.html`), khung GA4 trong `<head>` cả 3 trang, và 1 Vercel Serverless Function **`/api/leads`** (Upstash Redis) để Trang quản lý xem Lead từ mọi thiết bị. Frontend vẫn thuần HTML/CSS/JS.

### 6.1. Các tính năng ĐÃ HOÀN THÀNH

| # | Tính năng | Trạng thái & Ghi chú |
|---|---|---|
| 1 | **Giao diện Trang chủ** (`index.html`) | Hero Section với banner ảnh URL thật (`https://cdn.upanhlaylink.com/i/tWin7nsT.jpg`), khối "Vì sao chọn EduAI" (4 feature card), Khóa học (lọc 8 nhóm, gồm cả "Hành chính & Tài liệu"), Khảo sát, Diễn đàn, Footer. **Chỉ có DUY NHẤT 1 nút "Làm bài Test AI"** (nút cam lớn ở Hero, `.btn-test-ai-hero`) — đã bỏ nút "Khám phá Khóa học" ở Hero và nút Test AI trên sidebar; footer ghi "Khảo sát & Lộ trình". Ảnh banner dùng `aspect-ratio: 4/3` + `object-fit: cover` trong `.hero-official-img`. |
| 2 | **Header Navbar ngang + dropdown** | Markup header lặp lại y hệt trong 3 file HTML (`#site-header`), hành vi trong `js/site.js`. Đầu mục chính: **Trang chủ** (dropdown: Giới thiệu / Khảo sát & Lộ trình / Diễn đàn / Liên hệ → `index.html#about`, `#survey-section`, `#forum`, `#contact`), **Khóa học** (dropdown 2 cột: tất cả + 8 nhóm → `index.html?loc=<categoryFilter>#courses`, `app.js` đọc `?loc=` để lọc sẵn), **Cổng học viên** (Lịch học / Tiến trình / Kho video → `student.html#schedule-panel|#progress-panel|#video-panel`), **Quản lý** 🔒 (`admin.html#hoc-vien`, `admin.html#doanh-thu`). Góc phải: nút Đăng nhập hoặc avatar + menu (Cổng học viên, Đăng xuất). **≥1024px** có chuột: rê chuột xổ dropdown (CSS `:hover`, fade + slide 0.25–0.3s); bấm mũi tên `.nav-caret` (`data-dd-toggle`) cũng mở được. **<1024px**: nút ☰ (`#nav-toggle`) mở bảng menu dọc, mục con mở/đóng bằng mũi tên. Trang hiện tại tô sáng theo `<body data-page="home|student|admin">` ↔ `.nav-item[data-nav]`. Lưu ý: ở mobile header phải dùng nền đặc, KHÔNG `backdrop-filter` (sẽ làm `.main-nav` fixed bị co theo header). |
| 3 | **Luồng khảo sát trắc nghiệm 4 màn (funnel)** | Màn 0 (đăng nhập họ tên/email/SĐT có validate) → Màn 1 (7 câu hỏi tiếp cận AI) → Màn 2 (6 câu hỏi nhu cầu, tối đa 3 lựa chọn) → Màn 3 (kết quả). Có nút **Quay lại** (`btn-back-to-step0`, `btn-back-to-step1`), **Xóa & Làm lại** (`btn-reset-survey`), submit cuối **"Gửi đi và nhận lộ trình khóa học phù hợp"** (`btn-submit-survey`). Auto-save toàn bộ tiến trình vào `localStorage` (`eduai_survey_state`). **Ngay khi hoàn thành Bước 2 → tự động bắn thông báo Telegram** (xem mục 4). |
| 4 | **Gợi ý khóa học cá nhân hóa + Video học thử** | `calculateCourseRecommendations()` chấm điểm 8 khóa theo nhu cầu/môn học/mục tiêu, trả Top 3 kèm % phù hợp + lý do. Nút **"Video học thử"** mở modal video demo, có nút "X" đỏ nổi bật (`video-modal-close-btn`) để đóng. |
| 5 | **Cổng thanh toán QR + Link Zoom demo** | Modal checkout sinh **VietQR** động (`img.vietqr.io`) theo `BANK_CONFIG`, có nút copy STK/nội dung CK. Bấm **"Tôi đã chuyển khoản/Xác nhận"** (`btn-modal-confirm`) → (a) ghi khóa học vào Lead với trạng thái **`pending` (Chờ xác nhận)** — KHÔNG tự thành `paid`, (b) **bắn thông báo Telegram** ngay lập tức, (c) hiện màn Success cấp Zoom Meeting ID + Passcode + nút "Vào Cổng Học Viên" (`student.html`), kèm Confetti. Chỉ quản trị viên bấm "Xác nhận đã nhận tiền" trong Trang quản lý mới chuyển sang `paid` và được tính doanh thu. |
| 6 | **Cơ chế bắn Telegram Webhook ngầm (Sales Notification)** | Khai báo trong file **`js/telegram.js`** (nạp ở cả 3 trang, trước `site.js`), gồm 2 hằng số `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` và hàm `sendTelegramNotification()` dùng `fetch()` gọi thẳng `https://api.telegram.org/bot<TOKEN>/sendMessage`. Được gọi ở 3 thời điểm: đăng nhập (`dang_nhap`), hoàn thành khảo sát (`khao_sat_hoan_thanh`) và khách báo đã chuyển khoản (`xac_nhan_thanh_toan`, trạng thái `pending`). Nội dung tin nhắn gồm đầy đủ Họ tên, SĐT, Khóa học đăng ký theo trắc nghiệm (+% phù hợp), Trạng thái thanh toán, Mã định danh giao dịch, thời gian. **Bot đã được cấu hình và test thành công** (bot `@EduAI_Sales_bot`, gửi về đúng Chat ID cá nhân). |
| 7 | **Lead Tracking (localStorage + cloud)** | `EduStore.upsertLead()` (`js/store.js`) lưu Lead vào `localStorage` (`eduai_leads_data`) VÀ đẩy lên `/api/leads` (tự bỏ qua khi chạy `file://`/localhost). Mô hình Lead + gộp dữ liệu dùng chung client/server trong `js/lead-model.js`: Lead khóa theo `e:<email>` (hoặc `p:<sđt>`), có mảng `enrollments[{courseId, amount, status: pending|paid, paidAt...}]`. Khách không thể tự đặt `paid` (server chặn). |
| 8 | **Diễn đàn thảo luận (thay thế FAQ)** | Section `#forum`: form đăng bài (tiêu đề/nội dung/môn học), danh sách bài viết (seed mẫu + bài người dùng tự đăng), like/unlike, sidebar "Chủ đề đang sôi nổi" + nhóm Zalo hỗ trợ 1:1. |
| 9 | **Gated Access — Modal đăng nhập** | Toàn bộ trong `js/site.js` (`window.EduSite`): tự chèn `#auth-modal` + `#policy-modal` vào mọi trang. Chỉ trang có **`<body data-gated>`** (`index.html`) bật gate: chưa đăng nhập thì mọi click/submit (capture phase) mở modal; đăng nhập xong tự **chạy tiếp thao tác dang dở** (vd. bấm "Đăng ký" → mở luôn checkout; bấm menu "Cổng học viên" → sang luôn `student.html`). **Không chặn** (`GATE_EXEMPT_SELECTOR`): modal đăng nhập/chính sách, toast, phần tử có `data-gate-exempt` (nút ☰, mũi tên dropdown, nút Đăng nhập, avatar, mục "Quản lý" + mục con). `student.html` mở khi chưa đăng nhập → hiện khung khóa `#student-locked` + tự bật modal, đăng nhập xong hiện portal ngay. Đăng nhập bằng **Google** (chỉ hiện khi điền `GOOGLE_CLIENT_ID` trong `js/config.js`) hoặc **Họ tên + SĐT + Email**. Phiên lưu ở `localStorage` `eduai_auth_user`; mọi thay đổi phát sự kiện window **`eduai:auth`** (detail = user hoặc `null` khi đăng xuất) — `app.js`/`student.js` lắng nghe sự kiện này. Đã đăng nhập có SĐT thì khảo sát bỏ qua Màn 0. |
| 10 | **Trang quản lý** (`admin.html`, `noindex`) | `js/admin.js`, khởi động khi tải trang. Hash `#hoc-vien` / `#doanh-thu` chọn tab (bấm tab cũng đổi hash). **Bảo vệ bằng mật khẩu:** bấm mục "Quản lý" (hoặc mục con) trên header ở bất kỳ trang nào → popup `#admin-modal` (`js/site.js`) hỏi mật khẩu, sai thì báo lỗi và không chuyển trang; mở thẳng `admin.html` cũng chỉ thấy form mật khẩu, dashboard chỉ render sau khi đúng. Mật khẩu mặc định **`abc`** (chế độ Cục bộ, lưu dạng SHA-256 trong `ADMIN_PASSWORD_SHA256` của `js/config.js`); chế độ Cloud dùng `ADMIN_KEY` trên Vercel (máy chủ kiểm tra). Hàm chung `EduStore.verifyAdminKey()`; đúng thì nhớ trong `sessionStorage` `eduai_admin_key` (đóng tab là mất), có nút Đăng xuất quản trị. KPI (tổng học viên, đã thanh toán, doanh thu tháng này, tổng doanh thu); tab **Quản lý học viên** (Họ tên, SĐT, Email, Khóa quan tâm, Tình trạng TT, Số tiền; tìm kiếm không dấu, lọc trạng thái, cột "Chi tiết" ghim phải khi bảng cuộn ngang, modal chi tiết: xác nhận/hủy xác nhận thanh toán, ghi nhận thanh toán thủ công, xóa; xuất CSV cho Excel); tab **Báo cáo doanh thu** (biểu đồ cột 12 tháng, doanh thu theo khóa từng tháng, bảng tổng hợp + % so tháng trước; tính theo `paidAt`, giờ VN). 2 chế độ: **Cloud** (khi `/api/leads` đã cấu hình — đăng nhập bằng `ADMIN_KEY`, tự làm mới 30s khi tab trình duyệt đang hiển thị) và **Cục bộ** (chỉ thấy Lead trên chính trình duyệt đó, có banner cảnh báo). Mục "Quản lý" hiện công khai trên header (có icon khóa) nhưng dữ liệu cloud chỉ trả về khi đúng `ADMIN_KEY`. |
| 11 | **Cổng học viên** (`student.html`, cần đăng nhập) | `js/student.js`, nạp dữ liệu khi tải trang và mỗi lần `eduai:auth`. Hồ sơ (bổ sung SĐT nếu đăng nhập Google), thẻ buổi học kế tiếp + đếm ngược + nút Zoom, lịch tháng tô nổi bật ngày có lớp, danh sách buổi, tiến trình từng khóa, kho video xem lại (chỉ mở khi `paid`). Lịch buổi học **sinh tự động** từ `nextClassSchedule` + `duration` (dùng lại `WEEKDAY_MAP`), bắt đầu từ ngày sau khi đăng ký. Đồng bộ trạng thái `paid` từ cloud qua `GET /api/leads?id=`. Đăng xuất khi đang ở trang này → tự về `index.html`. |
| 12 | **Google Analytics 4** | Snippet trong `<head>` của **cả 3 trang** (`index.html`, `student.html`, `admin.html`), đọc `GA4_MEASUREMENT_ID` từ `js/config.js` — **ĐÃ BẬT, ID thật `G-49M4E4BW3G`** (tài sản GA4 **"Website EduAI"**, luồng web "Website chính", múi giờ VN, tiền VND; đã tắt "thay đổi trang dựa trên sự kiện lịch sử duyệt web"; đã xác minh site live gửi `page_view` về đúng ID). ⚠️ Cùng tài khoản Google còn tài sản cũ **`mobile-app-b5966`** (Firebase, không liên quan) — xem số liệu phải chọn đúng "Website EduAI" ở góc trên bên trái GA4. Mỗi trang là 1 lượt tải thật nên `gtag('config')` tự gửi `page_view` (không còn page_view ảo). Event: `login_prompt`, `login`, `generate_lead`, `begin_checkout`, `add_payment_info`, `join_zoom`, `watch_recording` qua `EduStore.track()`. |

### 6.2. Các file mã nguồn chính đang làm việc

- **`index.html`** — Trang chủ (`<body data-page="home" data-gated>`): header navbar, `<main>` gồm Hero/About/Courses/Survey/Forum, Footer `#contact`, modal Video học thử + Checkout QR. Script nhỏ đầu `<head>` chuyển link cũ `/#/hoc-vien`, `/#/quan-ly` sang trang mới. **`student.html`** (`data-page="student"`): khung khóa + portal, modal Xem lại video. **`admin.html`** (`data-page="admin"`): form mật khẩu quản trị, KPI, 2 tab, modal Chi tiết học viên. Thứ tự script cả 3 trang: `data.js` → `lead-model.js` → `store.js` → `telegram.js` → `site.js` → (`app.js` | `student.js` | `admin.js`). **Sửa header thì phải sửa giống nhau ở cả 3 file.**
- **`css/style.css`** — CSS Variables cho design tokens khớp mục 2.2; nội dung Trang chủ; nút CTA Hero; cuối file là khối **HEADER NAVBAR NGANG** (`.site-header`, `.nav-item`, `.nav-dropdown`, `.dd-wide`, `.user-menu`, mobile <1024px) và **thanh tiêu đề trang** (`.page-titlebar`, `.mini-footer`, `.locked-card`). **`css/portal.css`** — giao diện `student.html` & `admin.html` (KPI, bảng, biểu đồ, lịch, video...), chỉ nạp ở 2 trang đó.
- **`js/data.js`** (~685 dòng) — `BANK_CONFIG`, `COURSES_DATA` (8 khóa học), `FORUM_POSTS_DATA`, `SURVEY_QUESTIONS`, `WEEKDAY_MAP` (được `student.js` dùng để sinh lịch học), và `calculateCourseRecommendations()`.
- **`js/config.js`** — `GA4_MEASUREMENT_ID`, `GOOGLE_CLIENT_ID`, `LEADS_API_URL`, `ADMIN_PASSWORD_SHA256` (mã băm mật khẩu admin chế độ Cục bộ; hướng dẫn đổi mật khẩu ghi ngay trong file).
- **`js/lead-model.js`** (UMD, dùng cả trình duyệt lẫn `api/leads.js`), **`js/store.js`** (`window.EduStore`: phiên đăng nhập, Lead, cloud sync, GA4, tiện ích).
- **`js/site.js`** (`window.EduSite`: header/dropdown/menu mobile, thẻ người dùng, modal đăng nhập + Google, Gated Access, modal Chính sách, toast), **`js/telegram.js`** (`sendTelegramNotification()`), **`js/admin.js`** (`admin.html`), **`js/student.js`** (`student.html`).
- **`api/leads.js`** — Vercel Serverless Function (Upstash Redis REST, hash `eduai:leads`). **`vercel.json`** — chuyển hướng đường dẫn ngắn `/admin`, `/quan-ly` → `/admin.html` và `/student`, `/hoc-vien` → `/student.html`.
- **`js/app.js`** — Trang chủ: `state`, render động câu hỏi khảo sát/grid khóa học/kết quả, modal, forum, validate form, toast, confetti, `localStorage`; đọc `?loc=` để lọc khóa học; lắng nghe `eduai:auth` để đồng bộ thông tin khảo sát; gọi `EduStore.upsertLead()` và `sendTelegramNotification()` (trong `js/telegram.js`).

### 6.3. Triển khai (Deployment)

- **Git:** Repo GitHub công khai tại **https://github.com/hien267/webkhoahoc** (nhánh mặc định `main`). **Thư mục làm việc chính: `C:\Users\Admin\Documents\GitHub\webkhoahoc`** (remote `origin` đúng). ⚠️ `C:\webKhoaHoc` là bản sao CŨ (22/09/2026), KHÔNG sửa ở đó.
- **Hosting:** Vercel, project `webkhoahoc` (scope tài khoản `hien267`). **Link live: https://webkhoahoc-two.vercel.app** (`/student.html`, `/admin.html`; link ngắn `/hoc-vien`, `/quan-ly`).
- **Deploy: KHÔNG tự động khi push.** Git Integration GitHub ↔ Vercel đang không hoạt động (các commit 22–28/09 đã push nhưng Vercel không build). Cách deploy hiện tại: `git push` (lưu lên GitHub) rồi chạy **`vercel deploy --prod --yes`** trong thư mục làm việc chính (đã `vercel link` vào project `webkhoahoc`, có `.vercel/`, đã `.gitignore`). Muốn tự deploy khi push: `vercel git connect` (chưa làm, chờ người dùng đồng ý). Sau deploy nên `curl` các trang / `js/config.js` trên link live để xác nhận.
- **CLI đã cài trên máy:** GitHub CLI (`gh`, đã login `hien267`) và Vercel CLI (`vercel`, cài global qua npm).
- **Cấu hình cần làm 1 lần để Trang quản lý thấy học viên từ MỌI thiết bị** (chưa làm thì chạy chế độ Cục bộ):
  1. Vercel → project `webkhoahoc` → **Storage / Marketplace → Upstash (Redis)** → Create & Connect (tự thêm `KV_REST_API_URL`, `KV_REST_API_TOKEN`).
  2. Settings → Environment Variables → thêm **`ADMIN_KEY`** = mật khẩu admin tự đặt (dài, khó đoán).
  3. Redeploy. Mở `https://webkhoahoc-two.vercel.app/admin.html` (hoặc `/quan-ly`) → nhập `ADMIN_KEY`.
- **Đăng nhập Google:** tạo OAuth Client ID (Web) ở Google Cloud Console, thêm origin `https://webkhoahoc-two.vercel.app`, dán vào `GOOGLE_CLIENT_ID` trong `js/config.js`. Lưu ý: ID token Google hiện chỉ được giải mã phía trình duyệt, chưa xác minh chữ ký ở server.
- **GA4:** đã cấu hình xong (`G-49M4E4BW3G`, xem mục 6.1 #12). Người dùng xem thống kê tại **analytics.google.com** → chọn tài sản "Website EduAI" → Báo cáo (Thời gian thực: tức thì; các báo cáo khác: sau 24–48 giờ). Việc tùy chọn chưa làm: tắt GA4 trên `admin.html` để không tính lượt quản trị viên; đánh dấu Key events (`generate_lead`, `login`, `add_payment_info`); tạo custom dimensions `course_id`, `match_rate`, `method`.

### 6.4. ⚠️ LƯU Ý BẢO MẬT QUAN TRỌNG — TOKEN TELEGRAM ĐANG NẰM TRONG CODE CÔNG KHAI

- File `js/telegram.js` hiện đang chứa **TELEGRAM_BOT_TOKEN thật** (dạng `8837037344:AAHL...`) và **TELEGRAM_CHAT_ID thật** viết thẳng (hard-code) trong code phía client.
- Vì repo GitHub là **Public** và trang Vercel cũng công khai, **bất kỳ ai xem View Source hoặc mở repo đều lấy được Token này** — có thể dùng token để giả mạo bot gửi tin nhắn rác vào đúng Chat ID đó, hoặc chiếm quyền điều khiển bot (đổi webhook, đọc tin nhắn...).
- Đây là giới hạn cố hữu của kiến trúc "gọi thẳng Telegram Bot API từ trình duyệt" (không có backend) — người dùng đã chủ động chọn cách này để đơn giản, không cần server.
- **Khuyến nghị nếu vận hành thật, có doanh thu:** chuyển lời gọi `fetch()` sang một **Vercel Serverless Function** (thư mục `/api/notify.js`), lưu Token/Chat ID trong **Environment Variables** của Vercel (không lộ ra client), rồi cho `js/telegram.js` gọi vào endpoint nội bộ đó thay vì gọi thẳng `api.telegram.org`. Đây là việc CẦN LÀM trước khi thu tiền thật quy mô lớn, nhưng chưa bắt buộc cho giai đoạn demo/thử nghiệm.
- Nếu nghi ngờ token bị lộ/lạm dụng: vào lại **@BotFather** → `/mybots` → chọn bot → **API Token** → **Revoke current token** để cấp token mới, rồi cập nhật lại vào `js/telegram.js`.

### 6.5. Ghi chú để tiếp tục ngay ở phiên làm việc sau

**Việc vừa hoàn thành gần nhất (2026-09-30):** Deploy toàn bộ bản đa trang lên Vercel bằng CLI (kèm các sửa trang chủ 22–28/09 trước đó chưa lên web), bật GA4 `G-49M4E4BW3G` và xác minh dữ liệu gửi về từ cả 3 trang. Người dùng mới làm web bằng AI, chưa quen thuật ngữ — hướng dẫn thao tác Google/Vercel cần từng bước, dùng đúng tên nút trên giao diện tiếng Việt (vd. GA4 gọi Property là "Tài sản").

**Trước đó (2026-09-29, lần 2):** (1) Bỏ mọi con số "8 khóa học" / "70%" trên web (menu "Tất cả các khóa học", footer "Các khóa học thực chiến", "giảm tải áp lực sổ sách", badge KH01 trong `data.js`) — **không đưa lại con số cụ thể vào nội dung**. (2) Trang quản lý bắt mật khẩu (popup khi bấm "Quản lý" + form khi mở thẳng URL), mặc định `abc`. Test Chrome headless 58/58 đạt (kể cả không tràn ngang 360–1440px).

**Trước đó (2026-09-29):** Chuyển từ SPA sang **Multi-page thực thụ**: tách lại `index.html` / `student.html` / `admin.html`; bỏ sidebar dọc + `js/router.js`, thay bằng **Header Navbar ngang có dropdown khi hover** (`js/site.js`); gom modal đăng nhập, Gated Access, modal Chính sách vào `site.js`; chuyển Telegram sang `js/telegram.js`; Trang chủ chỉ còn **1 nút "Làm bài Test AI"** ở Hero; thêm nút lọc "Hành chính & Tài liệu" (KH01 trước đó thiếu trên thanh lọc); vercel.json bỏ redirect `/admin.html`, `/student.html` (tránh vòng lặp). Đã chạy test Chrome headless: gate, chuyển trang đổi URL, dropdown hover, menu mobile 375px, không lỗi console.

**Trước đó (2026-09-28):** Chuyển dự án sang Single Page App (3 view trong `index.html`, sidebar + `js/router.js`) — nay đã thay thế bằng bản đa trang ở trên.

**Trước đó (2026-09-28):** Gated Access + đăng nhập Google/SĐT, `admin.html`, `student.html`, GA4, `/api/leads`. Sửa kèm: header mobile ≤600px từng tràn làm mất nút hamburger (nay ẩn nút Test trên header ở mobile, CTA lớn ở Hero vẫn còn); thông báo lỗi form trước đây không hiện (`showFieldError` tìm sai phần tử); `phoneRegex` cũ đã thay bằng `EduStore.validate.phone` (`/^0(3|5|7|8|9)\d{8}$/`, tự chuẩn hóa +84).

**Trước đó (2026-09-22):** Gỡ bỏ hoàn toàn section Lịch Học Trực Tuyến (Calendar Widget, `#calendar-section`) khỏi giao diện theo yêu cầu người dùng — xoá HTML, CSS và toàn bộ hàm JS liên quan, cùng nút "Xem & Mở Khóa Lịch Học Của Bạn" trong modal thanh toán thành công (nút này chỉ dùng để nhảy tới lịch, nay không còn tác dụng nên gỡ theo). Các phần khác (khảo sát, thanh toán, forum, Telegram webhook, Lead tracking) giữ nguyên không đổi.

**Trước đó (2026-09-22):** Tích hợp Telegram Webhook ngầm thay cho webhook Make.com placeholder, gỡ bỏ hoàn toàn Admin Dashboard khỏi giao diện. Đã điền Token/Chat ID thật và test gửi thành công qua `curl` trực tiếp tới Telegram API.

**Các điểm còn là dữ liệu giả lập/demo (chưa có backend thật) — cần lưu ý khi làm việc tiếp:**
- Video học thử: mỗi khóa có `videoDemoUrl` riêng trong `data.js` nhưng hiện tất cả đang trỏ chung 1 file mẫu (`w3schools mov_bbb.mp4`) — cần thay bằng video thật riêng cho từng khóa trước khi public chính thức.
- `zoomDemoUrl` của tất cả khóa học đang dùng chung 1 link placeholder (`zoom.us/j/demo-ai-teacher-class`) — cần thay bằng phòng Zoom thật.
- Thanh toán VietQR chỉ tạo mã QR + copy thông tin CK; "xác nhận đã chuyển khoản" vẫn là **nút bấm giả lập** (không có đối soát giao dịch ngân hàng thật tự động — Telegram chỉ báo "khách BẤM xác nhận", không phải "ngân hàng đã ghi có").
- Diễn đàn thảo luận: bài đăng mới chỉ lưu trong biến `state` JS, KHÔNG persist vào `localStorage` → mất khi tải lại trang.
- Kho video xem lại trong Cổng học viên phát `videoDemoUrl` của khóa (đang là video mẫu) cho mọi buổi — cần nối bản ghi Zoom thật theo từng buổi.
- `POST /api/leads` là công khai (không có rate limit/captcha); ai biết email của học viên có thể xem trạng thái khóa học của họ qua `GET ?id=` (chỉ trả courseId/status).
- **Bảo mật Token Telegram** (`js/telegram.js`) — xem mục 6.4, cần xử lý bằng Serverless Function trước khi vận hành thật quy mô lớn.

**Khi mở phiên mới:** Đọc file này (`claude.md`) trước để nắm bảng màu/design system (mục 2) và trạng thái hiện tại (mục 6), đặc biệt mục 6.4 về bảo mật Token, trước khi đọc code.

---
*Tài liệu này là kim chỉ nam xuyên suốt quá trình thiết kế, lập trình và nâng cấp nền tảng EduAI Teacher Hub.*
