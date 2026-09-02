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

> **Cập nhật lần cuối:** 2026-08-31 — Dự án đang ở giai đoạn **frontend demo hoàn chỉnh** (thuần HTML/CSS/JS, không backend, không build tool), đã sẵn sàng để quay video demo giới thiệu sản phẩm.

### 6.1. Các tính năng ĐÃ HOÀN THÀNH

| # | Tính năng | Trạng thái & Ghi chú |
|---|---|---|
| 1 | **Giao diện Trang chủ** | Header sticky (glassmorphism), Hero Section với **banner ảnh URL thật** (`https://cdn.upanhlaylink.com/i/tWin7nsT.jpg` — cập nhật 2026-09-01, ảnh cũ `SpZj33E8.jpg` đã thay thế), khối "Vì sao chọn EduAI" (4 feature card), Footer đầy đủ liên hệ. Ảnh banner dùng `aspect-ratio: 4/3` + `object-fit: cover` trong `.hero-official-img` (css/style.css) để luôn sắc nét, đúng tỷ lệ, không vỡ khung dù ảnh gốc có kích thước khác. |
| 2 | **Menu điều hướng 1 dòng, không đè chữ** | Đã fix triệt để lỗi tràn/đè chữ ở mọi độ phân giải ≥993px (laptop 1280px/1366px/1440px...). Nguyên nhân gốc: `.container` giới hạn `max-width:1200px` nhưng breakpoint thu gọn cũ chỉ áp dụng đến 1200px. Đã mở rộng breakpoint `@media (min-width: 993px)` không giới hạn trên, ẩn phụ đề thương hiệu, siết gọn nút CTA. Dưới 992px dùng mobile drawer (hamburger). |
| 3 | **Luồng khảo sát trắc nghiệm 4 màn (funnel)** | Màn 0 (đăng nhập họ tên/email/SĐT có validate) → Màn 1 (7 câu hỏi tiếp cận AI) → Màn 2 (6 câu hỏi nhu cầu, giới hạn chọn tối đa 3) → Màn 3 (kết quả). Có đầy đủ nút **Quay lại** (`btn-back-to-step0`, `btn-back-to-step1`), nút **Xóa & Làm lại** (`btn-reset-survey` — xóa localStorage + reset toàn bộ state), nút submit cuối **"Gửi đi và nhận lộ trình khóa học phù hợp"** (`btn-submit-survey`). Toàn bộ tiến trình auto-save vào `localStorage` (`eduai_survey_state`). |
| 4 | **Gợi ý khóa học cá nhân hóa + Video học thử** | Thuật toán `calculateCourseRecommendations()` chấm điểm 8 khóa theo nhu cầu/môn học/mục tiêu, trả về Top 3 kèm % phù hợp + lý do. Mỗi khóa có nút **"Video học thử"** mở modal phát video demo, có **nút "X" đỏ nổi bật** (`video-modal-close-btn`) để đóng popup. |
| 5 | **Cổng thanh toán QR + Link Zoom demo** | Modal checkout sinh **VietQR** động (`img.vietqr.io`) theo `BANK_CONFIG` (MB Bank), tự tạo nội dung chuyển khoản, có nút copy STK/nội dung. Sau khi bấm "Tôi đã chuyển khoản/Xác nhận" → chuyển sang màn Success cấp **Zoom Meeting ID + Passcode + link vào lớp demo ngay**, kèm hiệu ứng Confetti. |
| 6 | **Diễn đàn thảo luận (thay thế FAQ)** | Section `#forum` thay hoàn toàn cho FAQ truyền thống: form đăng bài thảo luận mới (tiêu đề/nội dung/môn học), danh sách bài viết (seed 3 bài mẫu + bài người dùng tự đăng), like/unlike, sidebar "Chủ đề đang sôi nổi" + nhóm Zalo hỗ trợ 1:1. |

### 6.2. Các file mã nguồn chính đang làm việc

- **`index.html`** — Toàn bộ cấu trúc trang: Header, Hero, About, Courses Showcase, Survey (4 panel + stepper), Forum, 2 Modal (Video học thử, Checkout QR), Footer. Không chia component/partial, tất cả nằm trong 1 file.
- **`css/style.css`** (~2040+ dòng) — Toàn bộ style, dùng CSS Variables cho design tokens (`--primary-900`, `--emerald-500`, `--amber-500`...) khớp bảng màu ở mục 2.2. Khu vực responsive nằm cuối file, phần header/nav vừa được cập nhật ở dòng ~1993–2040.
- **`js/data.js`** (~673 dòng) — Toàn bộ dữ liệu tĩnh: `BANK_CONFIG` (thông tin ngân hàng nhận CK), `COURSES_DATA` (8 khóa học đầy đủ thông tin: giá, mô tả, video demo, Zoom ID...), `FORUM_POSTS_DATA` (bài thảo luận mẫu), `SURVEY_QUESTIONS` (câu hỏi Bước 1 & Bước 2), và hàm `calculateCourseRecommendations()` (thuật toán chấm điểm/đề xuất khóa học).
- **`js/app.js`** (~1120 dòng) — Toàn bộ logic ứng dụng: quản lý `state`, render động các câu hỏi khảo sát, render grid khóa học, render kết quả, xử lý modal (video học thử, checkout QR), xử lý forum (đăng bài, like), validate form, toast notification, hiệu ứng confetti, lưu/đọc `localStorage`.

### 6.3. Ghi chú để tiếp tục ngay ở phiên làm việc sau

**Việc vừa hoàn thành gần nhất:** Sửa lỗi menu điều hướng đè chữ ở độ phân giải trung bình/laptop (xem mục 6.1 #2, chi tiết kỹ thuật trong `css/style.css` dòng ~1993–2040).

**Các điểm còn là dữ liệu giả lập/demo (chưa có backend thật) — cần lưu ý khi làm việc tiếp:**
- Video học thử: mỗi khóa có `videoDemoUrl` riêng trong `data.js` nhưng hiện tất cả đang trỏ chung 1 file mẫu (`w3schools mov_bbb.mp4`) — cần thay bằng video thật riêng cho từng khóa trước khi public chính thức.
- `zoomDemoUrl` của tất cả khóa học đang dùng chung 1 link placeholder (`zoom.us/j/demo-ai-teacher-class`) — cần thay bằng phòng Zoom thật.
- Thanh toán VietQR chỉ tạo mã QR + copy thông tin CK; việc "xác nhận đã chuyển khoản" là **nút bấm giả lập** (không có webhook/backend đối soát giao dịch thật).
- Diễn đàn thảo luận: bài đăng mới chỉ lưu trong biến `state` JS, **KHÔNG persist vào `localStorage`** (khác với survey) → mất khi tải lại trang. Nếu cần giữ bài đăng qua các lần load, phải bổ sung lưu vào `localStorage` tương tự `saveState()`.
- `phoneRegex` trong `app.js` (`/(84|0[3|5|7|8|9])+([0-9]{8})\b/`) dùng cú pháp character-class `[3|5|7|8|9]` có ký tự `|` dư thừa (không phải OR logic chuẩn) — vẫn chạy đúng nhờ trùng lặp ký tự nhưng nên viết lại cho chuẩn nếu sửa validate số điện thoại sau này.

**Khi mở phiên mới:** Đọc file này (`claude.md`) trước để nắm bảng màu/design system (mục 2) và trạng thái hiện tại (mục 6) trước khi đọc code, sau đó đối chiếu nhanh với `index.html`/`app.js`/`data.js` để xác nhận các ghi chú trên vẫn còn đúng (có thể đã được xử lý ở phiên trước nếu chưa cập nhật lại mục này).

---
*Tài liệu này là kim chỉ nam xuyên suốt quá trình thiết kế, lập trình và nâng cấp nền tảng EduAI Teacher Hub.*
