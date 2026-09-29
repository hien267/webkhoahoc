/**
 * CẤU HÌNH DÙNG CHUNG CHO index.html, student.html, admin.html
 * Điền các giá trị thật trước khi vận hành. Không đặt bí mật (secret) vào file này —
 * mọi thứ ở đây đều công khai với người xem View Source.
 */
window.EDUAI_CONFIG = {
  // Google Analytics 4: Admin GA4 → Data Streams → Web → "Measurement ID" (dạng G-ABC123XYZ).
  // Để nguyên 'G-XXXXXXXXXX' thì GA4 không tải (không phát sinh request/lỗi).
  GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX',

  // Đăng nhập Google: Google Cloud Console → APIs & Services → Credentials →
  // OAuth client ID (Web application) → thêm Authorized JavaScript origins:
  //   https://webkhoahoc-two.vercel.app  (và http://localhost:5500 nếu chạy thử máy nhà)
  // Để trống '' thì ẩn nút Google, chỉ còn đăng nhập bằng Số điện thoại.
  GOOGLE_CLIENT_ID: '',

  // Endpoint Vercel Serverless lưu Lead lên cloud (api/leads.js). Tự bỏ qua khi chạy file:// hoặc localhost.
  LEADS_API_URL: '/api/leads',

  // Mật khẩu vào Trang quản lý (admin.html) khi chạy chế độ Cục bộ — lưu dạng SHA-256, KHÔNG lưu chữ thật.
  // Mặc định là mã băm của "abc". Đổi mật khẩu: mở Console trình duyệt, chạy
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('matkhaumoi')).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')))
  // rồi dán kết quả vào đây. Khi đã bật cloud (Upstash + ADMIN_KEY trên Vercel), mật khẩu là giá trị ADMIN_KEY.
  ADMIN_PASSWORD_SHA256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
};
