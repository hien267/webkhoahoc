/**
 * TÍCH HỢP TELEGRAM WEBHOOK NGẦM (SALES NOTIFICATION) — dùng chung cho index.html, student.html, admin.html.
 * - Điền TOKEN Bot và CHAT ID vào 2 hằng số ngay bên dưới.
 * - ⚠️ File này công khai (repo Public + trang web): xem claude.md mục 6.4 về rủi ro lộ Token.
 */
const TELEGRAM_BOT_TOKEN = '8837037344:AAHLohgSbQ9oJ-oDAe8NNX32sKe1pYuGVnE';
const TELEGRAM_CHAT_ID = '8910857318';

/**
 * Gửi thông báo Lead/Thanh toán về nhóm Telegram của đội Sales qua Telegram Bot API.
 * @param {Object} info
 * @param {string} info.eventType - 'dang_nhap' | 'khao_sat_hoan_thanh' | 'xac_nhan_thanh_toan' | ...
 * @param {string} info.fullName - Họ tên khách hàng
 * @param {string} info.phone - Số điện thoại khách hàng
 * @param {string} [info.email] - Email khách hàng
 * @param {string} [info.loginMethod] - 'google' | 'phone' (chỉ với sự kiện đăng nhập)
 * @param {string} [info.courseTitle] - Khóa học đăng ký (theo kết quả trắc nghiệm)
 * @param {number} [info.matchRate] - % độ phù hợp (nếu có, từ thuật toán trắc nghiệm)
 * @param {number} [info.amount] - Số tiền khóa học
 * @param {string} info.status - 'unpaid' | 'pending' | 'paid'
 * @param {string} [info.transactionId] - Mã định danh giao dịch (VD: EDUAI-12345)
 */
async function sendTelegramNotification(info) {
  if (
    !TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'DIEN_TOKEN_BOT_VAO_DAY' ||
    !TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === 'DIEN_CHAT_ID_VAO_DAY'
  ) {
    console.info('[Telegram] Chưa cấu hình TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID nên bỏ qua gửi. Dữ liệu sự kiện:', info);
    return;
  }

  const eventTitleMap = {
    dang_nhap: '🔑 KHÁCH MỚI ĐĂNG NHẬP WEBSITE',
    khao_sat_hoan_thanh: '📝 KHÁCH VỪA HOÀN THÀNH BÀI KHẢO SÁT',
    xac_nhan_thanh_toan: '💰 KHÁCH BÁO ĐÃ CHUYỂN KHOẢN — CẦN ĐỐI SOÁT',
    xac_nhan_thanh_toan_thu_cong: '✅ SALES VỪA XÁC NHẬN THANH TOÁN THỦ CÔNG',
    huy_thanh_toan_thu_cong: '⚠️ SALES VỪA HỦY TRẠNG THÁI THANH TOÁN'
  };
  const eventTitle = eventTitleMap[info.eventType] || '🔔 THÔNG BÁO TỪ EDUAI TEACHER HUB';
  const statusTextMap = {
    paid: '✅ ĐÃ THANH TOÁN (đã đối soát)',
    pending: '🕒 Khách báo đã chuyển khoản — vào admin.html để xác nhận',
    unpaid: '⏳ Chưa thanh toán'
  };
  const statusText = statusTextMap[info.status] || statusTextMap.unpaid;

  const messageLines = [
    eventTitle,
    '',
    `👤 Họ tên: ${info.fullName || 'Chưa cung cấp'}`,
    `📞 Số điện thoại: ${info.phone || 'Chưa cung cấp'}`,
    `📧 Email: ${info.email || 'Chưa cung cấp'}`
  ];
  if (info.loginMethod) {
    messageLines.push(`🔐 Đăng nhập bằng: ${info.loginMethod === 'google' ? 'Tài khoản Google' : 'Số điện thoại'}`);
  }
  if (info.courseTitle) {
    messageLines.push(`🎓 Khóa học: ${info.courseTitle}${info.matchRate ? ` — Phù hợp ${info.matchRate}%` : ''}`);
  }
  if (info.amount) {
    messageLines.push(`💵 Số tiền: ${new Intl.NumberFormat('vi-VN').format(info.amount)} đ`);
  }
  if (info.transactionId) {
    messageLines.push(`🔖 Mã định danh giao dịch: ${info.transactionId}`);
  }
  messageLines.push(`💳 Trạng thái thanh toán: ${statusText}`);
  messageLines.push(`🕐 Thời gian: ${new Date().toLocaleString('vi-VN')}`);

  const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageLines.join('\n')
      })
    });
    console.info('[Telegram] Đã gửi thông báo Sales thành công.');
  } catch (err) {
    console.warn('[Telegram] Gửi thông báo thất bại (kiểm tra lại TOKEN/CHAT_ID hoặc kết nối mạng):', err);
  }
}
