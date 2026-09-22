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

> **Cập nhật lần cuối:** 2026-09-22 — Dự án đã đi từ "frontend demo" lên **bản thực chiến có tích hợp bắn thông báo Lead tự động qua Telegram**, đang chạy production trên Vercel. Vẫn thuần HTML/CSS/JS, không backend/server riêng.

### 6.1. Các tính năng ĐÃ HOÀN THÀNH

| # | Tính năng | Trạng thái & Ghi chú |
|---|---|---|
| 1 | **Giao diện Trang chủ** | Header sticky (glassmorphism), Hero Section với banner ảnh URL thật (`https://cdn.upanhlaylink.com/i/tWin7nsT.jpg`), khối "Vì sao chọn EduAI" (4 feature card), Footer. Ảnh banner dùng `aspect-ratio: 4/3` + `object-fit: cover` trong `.hero-official-img` (css/style.css) để luôn sắc nét, đúng tỷ lệ, không vỡ khung. |
| 2 | **Menu điều hướng 1 dòng, không đè chữ** | Breakpoint `@media (min-width: 993px)` không giới hạn trên (vì `.container` đã cố định `max-width:1200px`), ẩn phụ đề thương hiệu, siết gọn nút CTA. Dưới 992px dùng mobile drawer (hamburger). |
| 3 | **Luồng khảo sát trắc nghiệm 4 màn (funnel)** | Màn 0 (đăng nhập họ tên/email/SĐT có validate) → Màn 1 (7 câu hỏi tiếp cận AI) → Màn 2 (6 câu hỏi nhu cầu, tối đa 3 lựa chọn) → Màn 3 (kết quả). Có nút **Quay lại** (`btn-back-to-step0`, `btn-back-to-step1`), **Xóa & Làm lại** (`btn-reset-survey`), submit cuối **"Gửi đi và nhận lộ trình khóa học phù hợp"** (`btn-submit-survey`). Auto-save toàn bộ tiến trình vào `localStorage` (`eduai_survey_state`). **Ngay khi hoàn thành Bước 2 → tự động bắn thông báo Telegram** (xem mục 4). |
| 4 | **Gợi ý khóa học cá nhân hóa + Video học thử** | `calculateCourseRecommendations()` chấm điểm 8 khóa theo nhu cầu/môn học/mục tiêu, trả Top 3 kèm % phù hợp + lý do. Nút **"Video học thử"** mở modal video demo, có nút "X" đỏ nổi bật (`video-modal-close-btn`) để đóng. |
| 5 | **Cổng thanh toán QR + Link Zoom demo + Mở khóa Lịch học** | Modal checkout sinh **VietQR** động (`img.vietqr.io`) theo `BANK_CONFIG`, có nút copy STK/nội dung CK. Bấm **"Tôi đã chuyển khoản/Xác nhận"** (`btn-modal-confirm`) → (a) chuyển trạng thái Lead nội bộ sang `paid`, (b) **bắn thông báo Telegram** ngay lập tức, (c) hiện màn Success cấp Zoom Meeting ID + Passcode + link vào lớp, kèm Confetti, (d) hiện nút **"🔓 Xem & Mở Khóa Lịch Học Của Bạn"** tự nhảy tới đúng ngày học gần nhất trên Calendar Widget. |
| 6 | **Lịch Học Trực Tuyến (Calendar Widget)** | Section `#calendar-section` (giữa Courses và Survey). Tự phân tích chuỗi `course.nextClassSchedule` (VD: "Thứ 3 & Thứ 7 hàng tuần") qua bảng `WEEKDAY_MAP` (`js/data.js`) để tính và **tô viền/nền đỏ đậm** đúng những ngày có lớp Zoom trong tháng đang xem. Bấm vào 1 ngày sẽ hiện chi tiết khóa học + giờ học của ngày đó bên dưới lịch. |
| 7 | **Cơ chế bắn Telegram Webhook ngầm (Sales Notification)** | Khai báo trong `<script>` riêng ở **cuối `index.html`, ngay trước `</body>`**, gồm 2 hằng số `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` và hàm `sendTelegramNotification()` dùng `fetch()` gọi thẳng `https://api.telegram.org/bot<TOKEN>/sendMessage`. Được gọi ở đúng 2 thời điểm: hoàn thành khảo sát (`khao_sat_hoan_thanh`) và xác nhận thanh toán (`xac_nhan_thanh_toan`). Nội dung tin nhắn gồm đầy đủ Họ tên, SĐT, Khóa học đăng ký theo trắc nghiệm (+% phù hợp), Trạng thái thanh toán, Mã định danh giao dịch, thời gian. **Bot đã được cấu hình và test thành công** (bot `@EduAI_Sales_bot`, gửi về đúng Chat ID cá nhân). |
| 8 | **Lead Tracking âm thầm (không lộ ra giao diện)** | `upsertLead()` / `loadLeads()` / `saveLeads()` trong `js/app.js` vẫn âm thầm lưu mỗi Lead vào `localStorage` (`eduai_leads_data`) làm bản sao lưu nội bộ song song với Telegram. **Không còn Admin Dashboard hiển thị công khai trên trang** — đã gỡ bỏ hoàn toàn (HTML, CSS, JS liên quan) theo yêu cầu "giao diện sạch như web thực tế, khách không được thấy dữ liệu nội bộ". Muốn xem lại danh sách Lead: mở DevTools Console trên trang, gõ `JSON.parse(localStorage.getItem('eduai_leads_data'))`. |
| 9 | **Diễn đàn thảo luận (thay thế FAQ)** | Section `#forum`: form đăng bài (tiêu đề/nội dung/môn học), danh sách bài viết (seed mẫu + bài người dùng tự đăng), like/unlike, sidebar "Chủ đề đang sôi nổi" + nhóm Zalo hỗ trợ 1:1. |

### 6.2. Các file mã nguồn chính đang làm việc

- **`index.html`** (~647 dòng) — Toàn bộ cấu trúc trang: Header, Hero, About, Courses Showcase, Calendar Widget, Survey (4 panel + stepper), Forum, 2 Modal (Video học thử, Checkout QR), Footer, và `<script>` cấu hình Telegram ở cuối file (trước `</body>`).
- **`css/style.css`** (~2338 dòng) — CSS Variables cho design tokens khớp mục 2.2. Có thêm block style cho Calendar Widget (`.calendar-widget-card`, `.calendar-day-cell.has-class`...). Khu vực responsive nằm cuối file.
- **`js/data.js`** (~685 dòng) — `BANK_CONFIG`, `COURSES_DATA` (8 khóa học), `FORUM_POSTS_DATA`, `SURVEY_QUESTIONS`, `WEEKDAY_MAP` (ánh xạ "Thứ" tiếng Việt → chỉ số ngày trong tuần dùng cho Calendar Widget), và `calculateCourseRecommendations()`.
- **`js/app.js`** (~1447 dòng) — `state`, render động câu hỏi khảo sát/grid khóa học/kết quả, xử lý modal, xử lý forum, validate form, toast, confetti, `localStorage`, **Calendar Widget** (`renderCalendarWidget`, `buildClassDayIndex`, `getCourseScheduleWeekdays`, `jumpCalendarToCourse`...), và **Lead Tracking âm thầm** (`upsertLead`, `loadLeads`, `saveLeads`) — gọi `sendTelegramNotification()` (định nghĩa trong `index.html`) tại 2 thời điểm khảo sát xong / xác nhận thanh toán.

### 6.3. Triển khai (Deployment)

- **Git:** Repo GitHub công khai tại **https://github.com/hien267/webkhoahoc** (nhánh mặc định `main`). Thư mục local `C:\webKhoaHoc` là git repo, remote `origin` đã trỏ đúng.
- **Hosting:** Vercel, project `webkhoahoc` (scope tài khoản `hien267`). **Link live: https://webkhoahoc-two.vercel.app**
- **Auto-deploy:** Đã nối GitHub ↔ Vercel Git Integration — chỉ cần `git push` lên `main` là Vercel tự build & deploy lại.
- **CLI đã cài trên máy:** GitHub CLI (`gh`, đã login `hien267`) và Vercel CLI (`vercel`, cài global qua npm).

### 6.4. ⚠️ LƯU Ý BẢO MẬT QUAN TRỌNG — TOKEN TELEGRAM ĐANG NẰM TRONG CODE CÔNG KHAI

- File `index.html` hiện đang chứa **TELEGRAM_BOT_TOKEN thật** (dạng `8837037344:AAHL...`) và **TELEGRAM_CHAT_ID thật** viết thẳng (hard-code) trong `<script>` phía client.
- Vì repo GitHub là **Public** và trang Vercel cũng công khai, **bất kỳ ai xem View Source hoặc mở repo đều lấy được Token này** — có thể dùng token để giả mạo bot gửi tin nhắn rác vào đúng Chat ID đó, hoặc chiếm quyền điều khiển bot (đổi webhook, đọc tin nhắn...).
- Đây là giới hạn cố hữu của kiến trúc "gọi thẳng Telegram Bot API từ trình duyệt" (không có backend) — người dùng đã chủ động chọn cách này để đơn giản, không cần server.
- **Khuyến nghị nếu vận hành thật, có doanh thu:** chuyển lời gọi `fetch()` sang một **Vercel Serverless Function** (thư mục `/api/notify.js`), lưu Token/Chat ID trong **Environment Variables** của Vercel (không lộ ra client), rồi cho `index.html` gọi vào endpoint nội bộ đó thay vì gọi thẳng `api.telegram.org`. Đây là việc CẦN LÀM trước khi thu tiền thật quy mô lớn, nhưng chưa bắt buộc cho giai đoạn demo/thử nghiệm.
- Nếu nghi ngờ token bị lộ/lạm dụng: vào lại **@BotFather** → `/mybots` → chọn bot → **API Token** → **Revoke current token** để cấp token mới, rồi cập nhật lại vào `index.html`.

### 6.5. Ghi chú để tiếp tục ngay ở phiên làm việc sau

**Việc vừa hoàn thành gần nhất (2026-09-22):** Tích hợp Telegram Webhook ngầm thay cho webhook Make.com placeholder trước đó, gỡ bỏ hoàn toàn Admin Dashboard khỏi giao diện, giữ nguyên Calendar Widget + luồng khảo sát/thanh toán. Đã điền Token/Chat ID thật và test gửi thành công qua `curl` trực tiếp tới Telegram API.

**Các điểm còn là dữ liệu giả lập/demo (chưa có backend thật) — cần lưu ý khi làm việc tiếp:**
- Video học thử: mỗi khóa có `videoDemoUrl` riêng trong `data.js` nhưng hiện tất cả đang trỏ chung 1 file mẫu (`w3schools mov_bbb.mp4`) — cần thay bằng video thật riêng cho từng khóa trước khi public chính thức.
- `zoomDemoUrl` của tất cả khóa học đang dùng chung 1 link placeholder (`zoom.us/j/demo-ai-teacher-class`) — cần thay bằng phòng Zoom thật.
- Thanh toán VietQR chỉ tạo mã QR + copy thông tin CK; "xác nhận đã chuyển khoản" vẫn là **nút bấm giả lập** (không có đối soát giao dịch ngân hàng thật tự động — Telegram chỉ báo "khách BẤM xác nhận", không phải "ngân hàng đã ghi có").
- Diễn đàn thảo luận: bài đăng mới chỉ lưu trong biến `state` JS, KHÔNG persist vào `localStorage` → mất khi tải lại trang.
- `phoneRegex` trong `app.js` (`/(84|0[3|5|7|8|9])+([0-9]{8})\b/`) có cú pháp character-class dư ký tự `|` — vẫn chạy đúng nhờ trùng lặp ký tự nhưng nên viết lại chuẩn nếu sửa validate SĐT sau này.
- **Bảo mật Token Telegram** — xem mục 6.4, cần xử lý bằng Serverless Function trước khi vận hành thật quy mô lớn.

**Khi mở phiên mới:** Đọc file này (`claude.md`) trước để nắm bảng màu/design system (mục 2) và trạng thái hiện tại (mục 6), đặc biệt mục 6.4 về bảo mật Token, trước khi đọc code.

---
*Tài liệu này là kim chỉ nam xuyên suốt quá trình thiết kế, lập trình và nâng cấp nền tảng EduAI Teacher Hub.*
