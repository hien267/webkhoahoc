/**
 * Dữ liệu Hệ thống Khóa học, Diễn đàn & Bộ quy tắc Đề xuất cho EduAI Teacher Hub
 */

const BANK_CONFIG = {
  bankName: "MB Bank (Ngân hàng Quân Đội)",
  accountNumber: "0988123456",
  accountHolder: "TRUNG TAM DAO TAO EDUAI VIET NAM",
  branch: "Chi nhánh Cầu Giấy, Hà Nội"
};

const COURSES_DATA = [
  {
    id: "giao_an_5512",
    code: "GIAOAN5512",
    title: "Soạn Kế Hoạch Bài Dạy (Giáo Án) Thông Minh Chuẩn Công Văn 5512",
    shortTitle: "Soạn Giáo Án Chuẩn CV 5512 với AI",
    badge: "Khuyên dùng cho Mọi Giáo viên",
    categoryFilter: "giao_an",
    category: "Chuyên môn & Giảng dạy",
    price: 499000,
    originalPrice: 1199000,
    duration: "6 buổi (12 giờ) + Bộ Khung Prompt Môn học",
    format: "Online tương tác chuyên sâu từng môn",
    zoomMeetingId: "877 5512 2026",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: AI tự động soạn Kế hoạch bài dạy chuẩn 5512 trong 5 phút",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "19:30 - Thứ 3 & Thứ 7 hàng tuần",
    icon: "fa-solid fa-book-open-reader",
    color: "#6366F1",
    gradient: "linear-gradient(135deg, #4338CA 0%, #6366F1 100%)",
    targetAudience: "Giáo viên Tiểu học, THCS, THPT các môn Toán, Văn, Anh, KHTN, Sử Địa...",
    description: "Phương pháp độc quyền viết Prompt sư phạm tạo giáo án 4 bước theo CV 5512, tích hợp dạy học tích cực và phân hóa học sinh.",
    outcomes: [
      "Soạn giáo án chuẩn 5512 (Mục tiêu, Thiết bị, 4 hoạt động) chỉ trong 15 phút",
      "Thiết kế hoạt động Khởi động - Khám phá - Luyện tập - Vận dụng cuốn hút",
      "Tự động tạo phiếu học tập (Worksheet) phân hóa theo 3 mức độ nhận thức",
      "Tích hợp các phương pháp dạy học dự án, trạm, khăn trải bàn dễ dàng"
    ],
    tools: ["Claude 3.5 Sonnet", "ChatGPT 4o", "Gemini 1.5 Pro"],
    tags: ["soan_giao_an", "soan_bai", "tiet_kiem_thoi_gian", "nang_cao_hieu_qua"],
    matchKeywords: ["soạn giáo án", "5512", "kế hoạch bài dạy", "soạn bài", "phiếu học tập", "hoạt động dạy học"]
  },
  {
    id: "slide_hoclieu",
    code: "SLIDEAI",
    title: "Thiết Kế Slide Tương Tác, Infographic & Học Liệu Trực Quan Đỉnh Cao",
    shortTitle: "Thiết Kế Slide & Học Liệu Trực Quan",
    badge: "Khóa học Bán chạy Nhất",
    categoryFilter: "slide_hoclieu",
    category: "Học liệu & Trình chiếu",
    price: 399000,
    originalPrice: 899000,
    duration: "5 buổi (10 giờ) + Kho 1000+ Template",
    format: "Thực hành trực tiếp trên máy tính",
    zoomMeetingId: "845 6231 8899",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: Tạo 20 Slide bài giảng cực đẹp với Gamma App & Canva AI",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "20:00 - Thứ 2 & Thứ 4 hàng tuần",
    icon: "fa-solid fa-wand-magic-sparkles",
    color: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
    targetAudience: "Giáo viên tất cả các môn mong muốn bài giảng cuốn hút, hình ảnh sinh động",
    description: "Biến nội dung bài học thành slide trình chiếu tuyệt đẹp, infographic sắc nét chỉ với câu lệnh prompt, học sinh hứng thú 100%.",
    outcomes: [
      "Tạo slide bài dạy hoàn chỉnh từ giáo án chỉ trong 3-5 phút với Gamma & Canva",
      "Thiết kế Infographic, sơ đồ tư duy minh họa kiến thức phức tạp cực dễ hiểu",
      "Tạo hình ảnh minh họa độc quyền phù hợp văn hóa Việt Nam bằng DALL-E 3",
      "Sở hữu kho tài nguyên 1.000+ mẫu thiết kế sư phạm hiện đại"
    ],
    tools: ["Gamma App", "Canva Magic Studio", "Midjourney", "DALL-E 3", "Curipod"],
    tags: ["lam_slide", "tao_hinh_anh", "lam_hoc_lieu", "slide_dep_hon", "bai_day_sinh_dong"],
    matchKeywords: ["làm slide", "tạo hình ảnh", "slide đẹp", "học liệu", "infographic", "hình ảnh minh họa"]
  },
  {
    id: "matran_dethi",
    code: "DETHIAI",
    title: "Thiết Kế Ma Trận Đề Kiểm Tra, Ngân Hàng Câu Hỏi & Đánh Giá Năng Lực",
    shortTitle: "Ma Trận Đề & Đánh Giá Năng Lực AI",
    badge: "Chuẩn Chương trình GDPT 2018",
    categoryFilter: "khao_thi",
    category: "Khảo thí & Đánh giá",
    price: 449000,
    originalPrice: 999000,
    duration: "5 buổi (10 giờ) + Kho Đề mẫu",
    format: "Thực hành tạo đề kiểm tra trực tiếp",
    zoomMeetingId: "855 3399 1122",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: AI tự động sinh ma trận đề và câu hỏi trắc nghiệm đúng/sai",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "20:00 - Thứ 4 & Thứ 6 hàng tuần",
    icon: "fa-solid fa-list-check",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #A78BFA 100%)",
    targetAudience: "Giáo viên cần ra đề kiểm tra định kỳ, ôn thi học sinh giỏi, ôn thi tốt nghiệp",
    description: "Tự động hóa quy trình xây dựng ma trận đề, đặc tả đề kiểm tra và sinh ngân hàng câu hỏi trắc nghiệm đúng/sai, trả lời ngắn chuẩn Bộ GD&ĐT.",
    outcomes: [
      "Lập Ma trận & Bản đặc tả đề kiểm tra theo cấu trúc mới của Bộ GD&ĐT",
      "Sinh hàng trăm câu hỏi trắc nghiệm đa dạng: 4 lựa chọn, Đúng/Sai, Điền khuyết",
      "Tạo đáp án chi tiết, hướng dẫn giải từng bước và barem chấm tự luận",
      "Trộn đề nhanh chóng, xuất ra file Word/PDF đẹp mắt chuẩn in ấn"
    ],
    tools: ["ChatGPT Advanced Analysis", "Claude 3.5", "Quiz Maker AI"],
    tags: ["tao_de_kiem_tra", "cham_bai", "kiem_tra_danh_gia", "nang_cao_hieu_qua"],
    matchKeywords: ["tạo đề kiểm tra", "ma trận đề", "chấm bài", "ngân hàng câu hỏi", "trắc nghiệm", "đánh giá năng lực"]
  },
  {
    id: "video_ai",
    code: "VIDEOAI",
    title: "Sáng Tạo Video Bài Giảng Số Hóa, Lồng Tiếng AI & Nhân Vật Hoạt Hình",
    shortTitle: "Video Bài Giảng & MC Ảo AI",
    badge: "Hot Trend E-Learning",
    categoryFilter: "video_ai",
    category: "Video & Đa phương tiện",
    price: 549000,
    originalPrice: 1299000,
    duration: "6 buổi (12 giờ) + Bản quyền công cụ thử nghiệm",
    format: "Cầm tay chỉ việc làm video hoàn chỉnh",
    zoomMeetingId: "866 2211 4455",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: Tạo MC ảo thuyết trình bài giảng lồng tiếng AI tiếng Việt",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "20:00 - Thứ 2 & Thứ 5 hàng tuần",
    icon: "fa-solid fa-clapperboard",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #BE185D 0%, #F472B6 100%)",
    targetAudience: "Giáo viên dự thi bài giảng E-Learning, làm kênh Youtube giáo dục, dạy học trực tuyến",
    description: "Biến bài giảng truyền thống thành video hoạt hình sinh động với MC ảo thuyết trình giọng đọc truyền cảm chuẩn tiếng Việt 3 miền.",
    outcomes: [
      "Tạo nhân vật MC ảo đại diện giáo viên giảng bài tự nhiên với HeyGen, D-ID",
      "Lồng tiếng AI giọng đọc chuẩn truyền cảm (Bắc - Trung - Nam) không cần thu âm",
      "Tạo video hoạt hình minh họa thí nghiệm, câu chuyện lịch sử, ngữ văn sinh động",
      "Dựng và chỉnh sửa video bài giảng chuẩn E-Learning với CapCut AI có phụ đề tự động"
    ],
    tools: ["HeyGen", "ElevenLabs", "CapCut Pro AI", "Vids AI", "Runway Gen-2"],
    tags: ["tao_video", "tao_hinh_anh", "bai_day_sinh_dong", "phat_trien_ky_nang"],
    matchKeywords: ["tạo video", "lồng tiếng", "video bài giảng", "mc ảo", "hoạt hình", "e-learning"]
  },
  {
    id: "skkn_ai",
    code: "SKKNAI",
    title: "Trợ Lý AI Viết Sáng Kiến Kinh Nghiệm & Nghiên Cứu Khoa Học Sư Phạm",
    shortTitle: "Sáng Kiến Kinh Nghiệm & NCKH với AI",
    badge: "Xếp loại Xuất sắc",
    categoryFilter: "skkn",
    category: "Nghiên cứu & Danh hiệu",
    price: 599000,
    originalPrice: 1499000,
    duration: "5 buổi (10 giờ) + Hướng dẫn 1:1",
    format: "Online chuyên sâu + Chữa đề tài mẫu",
    zoomMeetingId: "833 9988 7766",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: AI phân tích số liệu thực nghiệm và trau chuốt đề tài SKKN",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "20:00 - Thứ 7 & Chủ Nhật",
    icon: "fa-solid fa-award",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #B45309 0%, #FBBF24 100%)",
    targetAudience: "Giáo viên phấn đấu đạt Chiến sĩ thi đua, Giáo viên dạy giỏi, Nâng ngạch giáo viên",
    description: "Phương pháp tư duy khoa học kết hợp AI để phát triển ý tưởng đột phá, cấu trúc bài viết chuẩn chỉnh và tổng hợp minh chứng thuyết phục.",
    outcomes: [
      "Tìm kiếm và phát triển đề tài SKKN mới mẻ, bám sát thực tiễn đổi mới",
      "Xây dựng đề cương chi tiết, cơ sở lý luận và khảo sát thực trạng khoa học",
      "Trợ lý AI phân tích số liệu thực nghiệm, vẽ biểu đồ so sánh kết quả",
      "Biên tập, trau chuốt câu từ văn phong học thuật, chuẩn trích dẫn"
    ],
    tools: ["Claude 3.5 Sonnet", "Consensus AI", "ChatGPT 4o", "Elicit"],
    tags: ["sang_kien_kinh_nghiem", "viet_y_tuong", "phat_trien_ky_nang", "tang_thu_nhap"],
    matchKeywords: ["sáng kiến kinh nghiệm", "skkn", "nghiên cứu khoa học", "chiến sĩ thi đua", "ý tưởng sư phạm"]
  },
  {
    id: "game_app",
    code: "GAMEAI",
    title: "Xây Dựng Trò Chơi Học Tập Tương Tác, Web App Mini & Gamification",
    shortTitle: "Trò Chơi Học Tập & Gamification Lớp Học",
    badge: "Học sinh Mê say",
    categoryFilter: "game_app",
    category: "Game hóa & Tương tác",
    price: 499000,
    originalPrice: 1099000,
    duration: "5 buổi (10 giờ) + 50+ Game có sẵn",
    format: "Thực hành không cần biết lập trình",
    zoomMeetingId: "899 4433 2211",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: Tạo Game vòng quay may mắn & giải đố tương tác trong 2 phút",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "20:00 - Thứ 3 & Thứ 6 hàng tuần",
    icon: "fa-solid fa-gamepad",
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #0E7490 0%, #22D3EE 100%)",
    targetAudience: "Giáo viên muốn lớp học bùng nổ năng lượng, học mà chơi - chơi mà học",
    description: "Tạo trò chơi tương tác như Vòng quay may mắn, Ai là triệu phú, Rung chuông vàng, Web app tự chấm điểm mà không cần biết viết code.",
    outcomes: [
      "Tạo trò chơi tương tác theo từng bài học trên Quizizz, Kahoot, Wordwall siêu tốc",
      "Dùng AI viết Prompt tạo Game Mini HTML5 chạy trực tiếp trên máy chiếu lớp học",
      "Xây dựng hệ thống bảng xếp hạng, huy hiệu khen thưởng kích thích học sinh",
      "Tạo ứng dụng lật thẻ bài (Flashcard), vòng quay gọi tên ngẫu nhiên vui nhộn"
    ],
    tools: ["Claude AI Artifacts", "Wayground AI", "Wordwall AI", "Quizizz AI", "v0.dev"],
    tags: ["tao_tro_choi", "trong_lop", "bai_day_sinh_dong", "tat_ca"],
    matchKeywords: ["tạo trò chơi", "game", "trò chơi học tập", "tương tác", "gamification", "khởi động"]
  },
  {
    id: "chu_nhiem_ai",
    code: "CHUNHIEMAI",
    title: "Ứng Dụng AI Trong Công Tác Chủ Nhiệm, Sổ Sách & Nhận Xét Học Sinh",
    shortTitle: "Chủ Nhiệm & Nhận Xét Học Sinh AI",
    badge: "Đặc thù Giáo viên Việt Nam",
    categoryFilter: "chu_nhiem",
    category: "Chủ nhiệm & Đánh giá",
    price: 349000,
    originalPrice: 799000,
    duration: "4 buổi (8 giờ) + Bộ Prompt mẫu",
    format: "Online tương tác + Cầm tay chỉ việc",
    zoomMeetingId: "812 7744 3322",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: Viết 50 nhận xét học bạ theo Thông tư 27 không trùng lặp",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "20:00 - Thứ 6 & Chủ Nhật",
    icon: "fa-solid fa-user-graduate",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #059669 0%, #34D399 100%)",
    targetAudience: "Giáo viên Chủ nhiệm các cấp Mầm non, Tiểu học, THCS, THPT",
    description: "Giải phóng hoàn toàn gánh nặng viết nhận xét học bạ cuối kỳ theo Thông tư 22/27/26, kế hoạch hoạt động sinh hoạt lớp và kết nối phụ huynh.",
    outcomes: [
      "Viết hàng trăm lời nhận xét học bạ cá nhân hóa, đúng chuẩn quy định",
      "Thiết kế kế hoạch sinh hoạt lớp, chủ đề trải nghiệm sáng tạo và gắn kết",
      "Soạn thông báo, thư ngỏ gửi phụ huynh khéo léo trong các tình huống nhạy cảm",
      "Quản lý hồ sơ theo dõi sự tiến bộ học sinh bằng bảng tính thông minh AI"
    ],
    tools: ["ChatGPT", "Claude 3.5", "Google Sheets AI", "Canva Forms"],
    tags: ["cham_bai", "hanh_chinh", "giam_ap_luc", "nhan_xet", "chu_nhiem"],
    matchKeywords: ["chủ nhiệm", "nhận xét", "học bạ", "sổ sách", "thông tư", "phụ huynh"]
  },
  {
    id: "quan_ly_hanhchinh",
    code: "HANHCHINHAI",
    title: "Quản Lý Tài Liệu, Trợ Lý Ảo & Tự Động Hóa Công Việc Hành Chính",
    shortTitle: "Quản Lý Tài Liệu & Hành Chính AI",
    badge: "Tiết kiệm 70% thời gian",
    categoryFilter: "hanh_chinh",
    category: "Hành chính & Trợ lý",
    price: 299000,
    originalPrice: 799000,
    duration: "4 buổi (8 giờ) + Hỗ trợ trọn đời",
    format: "Online qua Zoom + Video xem lại trọn đời",
    zoomMeetingId: "892 4110 5512",
    zoomPasscode: "EDUAI2026",
    zoomDemoUrl: "https://zoom.us/j/demo-ai-teacher-class",
    videoDemoTitle: "Demo: Tạo Trợ lý AI riêng tóm tắt văn bản chỉ đạo của Sở GD&ĐT",
    videoDemoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    videoDemoPoster: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    nextClassSchedule: "20:00 - Thứ 3 & Thứ 5 hàng tuần",
    icon: "fa-solid fa-folder-tree",
    color: "#2563EB",
    gradient: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
    targetAudience: "Giáo viên, Tổ trưởng chuyên môn, Cán bộ quản lý cơ sở giáo dục",
    description: "Làm chủ công cụ AI để tự động hóa công việc sự vụ: soạn công văn, tóm tắt văn bản pháp quy, phân loại hồ sơ minh chứng.",
    outcomes: [
      "Xây dựng Trợ lý AI cá nhân chuyên hỗ trợ công việc trường lớp",
      "Tự động trích xuất dữ liệu từ các văn bản chỉ đạo của Bộ/Sở chỉ trong 30 giây",
      "Quản lý, sắp xếp tài liệu giảng dạy, hồ sơ kiểm định chất lượng số hóa",
      "Soạn thảo email, báo cáo tuần/tháng và biên bản họp chuẩn phong cách sư phạm"
    ],
    tools: ["ChatGPT Plus", "Gemini Advanced", "Claude 3.5 Sonnet", "Notion AI"],
    tags: ["quan_ly_cong_viec", "hanh_chinh", "viet_y_tuong", "tat_ca"],
    matchKeywords: ["quản lý công việc", "hành chính", "sắp xếp tài liệu", "tự động hóa", "soạn thảo"]
  }
];

// Dữ liệu Diễn đàn Thảo luận Giáo viên (Community Forum)
const FORUM_POSTS_DATA = [
  {
    id: "post_1",
    author: "Cô Nguyễn Thu Hà",
    role: "Giáo viên Ngữ văn THCS - Hà Nội",
    avatar: "TH",
    avatarBg: "#2563EB",
    time: "10 phút trước",
    subjectTag: "Ngữ văn",
    tagColor: "#3B82F6",
    title: "Mẹo viết prompt tạo phiếu học tập phân hóa 3 mức độ môn Ngữ văn cực chuẩn",
    content: "Chào các thầy cô! Hôm trước em áp dụng cấu trúc Prompt 4 bước học từ EduAI vào bài 'Bếp lửa' (Ngữ văn 9). Kết quả AI sinh ra 3 phiếu học tập tương ứng cho học sinh Trung bình - Khá - Giỏi cực kỳ sát với định hướng của Phòng GD. Thầy cô nào cần bộ prompt này thì comment em gửi nhé!",
    likes: 42,
    commentsCount: 18,
    isLiked: false,
    comments: [
      { author: "Thầy Lê Hoàng Long (TP.HCM)", text: "Tuyệt vời quá cô Hà ơi, cho mình xin prompt với ạ!", time: "8 phút trước" },
      { author: "Cô Mai Anh (Đà Nẵng)", text: "Em cũng vừa áp dụng cho bài 'Đoàn thuyền đánh cá', học sinh hào hứng lắm!", time: "5 phút trước" }
    ]
  },
  {
    id: "post_2",
    author: "Thầy Đặng Minh Trí",
    role: "Tổ trưởng Toán - KHTN - Cần Thơ",
    avatar: "MT",
    avatarBg: "#10B981",
    time: "35 phút trước",
    subjectTag: "Toán học & KHTN",
    tagColor: "#059669",
    title: "Đã thầy cô nào thử trộn đề trắc nghiệm Đúng/Sai môn Toán bằng AI chưa?",
    content: "Kỳ thi giữa kỳ 2 này trường em áp dụng cấu trúc đề mới của Bộ GD&ĐT. Nhờ công cụ AI trong khóa Ma trận đề của EduAI, em đưa file PDF chuyên đề Hàm số vào và trong 3 phút AI sinh ra 40 câu Đúng/Sai kèm lời giải từng bước cực kỳ chuẩn xác, không bị lỗi công thức LaTeX.",
    likes: 67,
    commentsCount: 24,
    isLiked: false,
    comments: [
      { author: "Cô Phương Thảo (Hải Phòng)", text: "Thầy Trí dùng ChatGPT 4o hay Claude 3.5 vậy ạ? Em dùng Claude thấy công thức toán chuẩn hơn hẳn.", time: "20 phút trước" }
    ]
  },
  {
    id: "post_3",
    author: "Cô Lê Thị Thanh Mai",
    role: "Giáo viên Tiểu học - Nghệ An",
    avatar: "TM",
    avatarBg: "#EC4899",
    time: "1 giờ trước",
    subjectTag: "Tiểu học & Mầm non",
    tagColor: "#DB2777",
    title: "Chia sẻ kinh nghiệm làm Video hoạt hình và lồng tiếng AI cho tiết Khởi động",
    content: "Các bé lớp 2 rất thích nhân vật hoạt hình chú ong chăm chỉ chào đón vào đầu giờ học. Em dùng Canva kết hợp CapCut AI lồng tiếng giọng Bắc trong trẻo, chỉ mất đúng 10 phút là xong một video 45 giây. Tiết học sôi nổi hẳn lên các thầy cô ạ!",
    likes: 89,
    commentsCount: 31,
    isLiked: false,
    comments: [
      { author: "Cô Bích Ngọc (Nam Định)", text: "Cách làm hay quá cô Mai ơi, các bé lớp 1 của mình cũng mê tít!", time: "45 phút trước" }
    ]
  }
];

// Dữ liệu câu hỏi khảo sát Màn 1 & Màn 2
const SURVEY_QUESTIONS = {
  step1: [
    {
      id: "gradeLevel",
      title: "1. Cấp học Thầy/Cô đang công tác:",
      icon: "fa-solid fa-school",
      type: "radio",
      options: [
        { label: "Mầm non", value: "mam_non", icon: "fa-solid fa-shapes" },
        { label: "Tiểu học", value: "tieu_hoc", icon: "fa-solid fa-child-reaching" },
        { label: "THCS", value: "thcs", icon: "fa-solid fa-graduation-cap" },
        { label: "THPT", value: "thpt", icon: "fa-solid fa-university" },
        { label: "Khác (Đại học/CĐ/TT)", value: "khac", icon: "fa-solid fa-chalkboard-user" }
      ]
    },
    {
      id: "subject",
      title: "2. Môn học Thầy/Cô phụ trách chính:",
      icon: "fa-solid fa-book",
      type: "select",
      options: [
        { label: "-- Vui lòng chọn môn dạy --", value: "" },
        { label: "Toán học", value: "toan" },
        { label: "Ngữ văn", value: "ngu_van" },
        { label: "Tiếng Anh", value: "tieng_anh" },
        { label: "Khoa học tự nhiên (Lý - Hóa - Sinh)", value: "khtn" },
        { label: "Lịch sử & Địa lý", value: "lich_su_dia_ly" },
        { label: "Tin học / Công nghệ", value: "tin_hoc" },
        { label: "Ngoại ngữ khác (Pháp, Trung, Nhật, Hàn...)", value: "ngoai_ngu_khac" },
        { label: "Giáo dục thể chất / QPAN", value: "gdtc" },
        { label: "Nghệ thuật (Âm nhạc, Mỹ thuật)", value: "nghe_thuat" },
        { label: "Chủ nhiệm / Giáo viên Tổng phụ trách", value: "chu_nhiem_tpt" },
        { label: "Môn học khác", value: "mon_khac" }
      ]
    },
    {
      id: "institutionType",
      title: "3. Nhóm trường / Cơ sở đào tạo:",
      icon: "fa-solid fa-building-columns",
      type: "radio",
      options: [
        { label: "Công lập", value: "cong_lap" },
        { label: "Tư thục / Song ngữ / Quốc tế", value: "tu_thuc" },
        { label: "Trung tâm GDNN - GDTX / Kỹ năng", value: "trung_tam" },
        { label: "Gia sư tự do", value: "gia_su" },
        { label: "Chủ lớp dạy thêm / Khác", value: "chu_lop_them" }
      ]
    },
    {
      id: "experienceYears",
      title: "4. Số năm kinh nghiệm giảng dạy:",
      icon: "fa-solid fa-calendar-check",
      type: "radio",
      options: [
        { label: "Dưới 1 năm (Mới vào nghề)", value: "under_1" },
        { label: "1 - 3 năm", value: "1_3" },
        { label: "4 - 10 năm (Vững vàng)", value: "4_10" },
        { label: "11 - 20 năm (Giàu kinh nghiệm)", value: "11_20" },
        { label: "Trên 20 năm (Cây đa cây đề)", value: "over_20" }
      ]
    },
    {
      id: "aiUsageStatus",
      title: "5. Mức độ tiếp cận AI của Thầy/Cô:",
      icon: "fa-solid fa-robot",
      type: "radio",
      options: [
        { label: "Chưa từng dùng (Chỉ mới nghe nói)", value: "never" },
        { label: "Biết nhưng chưa dùng vào công việc", value: "know_only" },
        { label: "Đã dùng thử vài lần tò mò", value: "tried" },
        { label: "Thỉnh thoảng dùng khi cần hỗ trợ", value: "sometimes" },
        { label: "Thường xuyên ứng dụng hàng ngày", value: "regular" }
      ]
    },
    {
      id: "aiToolsUsed",
      title: "6. Thầy/Cô đã từng trải nghiệm công cụ nào dưới đây?",
      subtitle: "(Có thể chọn nhiều mục)",
      icon: "fa-solid fa-toolbox",
      type: "checkbox",
      options: [
        { label: "ChatGPT", value: "chatgpt", icon: "fa-solid fa-comment-dots" },
        { label: "Google Gemini", value: "gemini", icon: "fa-solid fa-sparkles" },
        { label: "Claude AI", value: "claude", icon: "fa-solid fa-brain" },
        { label: "Canva AI / Magic", value: "canva", icon: "fa-solid fa-palette" },
        { label: "Gamma App (Slide)", value: "gamma", icon: "fa-solid fa-file-powerpoint" },
        { label: "AI Video (HeyGen/CapCut)", value: "video_ai", icon: "fa-solid fa-video" },
        { label: "AI Vẽ ảnh (Midjourney/DALL-E)", value: "image_ai", icon: "fa-solid fa-image" },
        { label: "Công cụ khác", value: "other_tool", icon: "fa-solid fa-cube" },
        { label: "Chưa dùng công cụ nào", value: "none", icon: "fa-solid fa-ban" }
      ]
    },
    {
      id: "aiSelfRating",
      title: "7. Tự đánh giá khả năng ứng dụng AI của bản thân:",
      icon: "fa-solid fa-star-half-stroke",
      type: "rating",
      levels: [
        { score: 1, title: "Mức 1: Người mới bắt đầu", desc: "Chưa biết gì về AI hoặc còn rất lúng túng khi mở app." },
        { score: 2, title: "Mức 2: Người làm quen", desc: "Biết đặt câu hỏi đơn giản nhưng chưa có kết quả ưng ý." },
        { score: 3, title: "Mức 3: Người ứng dụng cơ bản", desc: "Đã tạo được một số slide, giáo án ngắn nhưng mất thời gian sửa." },
        { score: 4, title: "Mức 4: Người dùng thành thạo", desc: "Biết viết Prompt theo cấu trúc, kết hợp 2-3 công cụ." },
        { score: 5, title: "Mức 5: Chuyên gia ứng dụng", desc: "Tự tạo quy trình tự động, đào tạo và chia sẻ lại cho đồng nghiệp." }
      ]
    }
  ],
  step2: [
    {
      id: "aiSupportNeeds",
      title: "1. Thầy/Cô mong muốn AI hỗ trợ nhất việc gì hiện nay?",
      subtitle: "⚡ Hãy chọn TỐI ĐA 3 nhu cầu cấp thiết nhất",
      maxSelect: 3,
      icon: "fa-solid fa-bullseye",
      type: "checkbox_limit",
      options: [
        { label: "Soạn kế hoạch bài dạy (Giáo án 5512)", value: "soan_giao_an", icon: "fa-solid fa-book", courseMatch: "giao_an_5512" },
        { label: "Làm Slide bài giảng sinh động", value: "lam_slide", icon: "fa-solid fa-file-powerpoint", courseMatch: "slide_hoclieu" },
        { label: "Tạo Video bài giảng & MC ảo", value: "tao_video", icon: "fa-solid fa-video", courseMatch: "video_ai" },
        { label: "Tạo Hình ảnh & Tranh minh họa", value: "tao_hinh_anh", icon: "fa-solid fa-image", courseMatch: "slide_hoclieu" },
        { label: "Tạo Đề kiểm tra & Ma trận đề", value: "tao_de_kiem_tra", icon: "fa-solid fa-list-check", courseMatch: "matran_dethi" },
        { label: "Chấm bài & Viết nhận xét học bạ", value: "cham_bai", icon: "fa-solid fa-pen-fancy", courseMatch: "chu_nhiem_ai" },
        { label: "Tạo Trò chơi học tập tương tác", value: "tao_tro_choi", icon: "fa-solid fa-gamepad", courseMatch: "game_app" },
        { label: "Viết ý tưởng, kịch bản ngoại khóa", value: "viet_y_tuong", icon: "fa-solid fa-lightbulb", courseMatch: "quan_ly_hanhchinh" },
        { label: "Viết Sáng kiến kinh nghiệm (SKKN)", value: "sang_kien_kinh_nghiem", icon: "fa-solid fa-award", courseMatch: "skkn_ai" },
        { label: "Quản lý công việc & Sắp xếp tài liệu", value: "quan_ly_cong_viec", icon: "fa-solid fa-folder-open", courseMatch: "quan_ly_hanhchinh" },
        { label: "Marketing tuyển sinh & Làm nội dung", value: "marketing_tuyen_sinh", icon: "fa-solid fa-bullhorn", courseMatch: "video_ai" },
        { label: "Nhu cầu chuyên môn khác", value: "khac_need", icon: "fa-solid fa-ellipsis", courseMatch: "quan_ly_hanhchinh" }
      ]
    },
    {
      id: "primaryApplicationArea",
      title: "2. Thầy/Cô dự định ứng dụng AI chủ yếu vào phần việc nào?",
      icon: "fa-solid fa-briefcase",
      type: "radio",
      options: [
        { label: "Khâu chuẩn bị & Soạn bài ở nhà", value: "soan_bai" },
        { label: "Trực tiếp tương tác trong giờ học trên lớp", value: "trong_lop" },
        { label: "Khâu kiểm tra, đánh giá & Tổng kết điểm", value: "kiem_tra_danh_gia" },
        { label: "Làm học liệu số, đồ dùng dạy học tự làm", value: "lam_hoc_lieu" },
        { label: "Công việc hành chính, sổ sách & Báo cáo", value: "hanh_chinh" },
        { label: "Tất cả các khâu trên (Chuyển đổi toàn diện)", value: "tat_ca" }
      ]
    },
    {
      id: "primaryGoal",
      title: "3. Mục tiêu quan trọng nhất của Thầy/Cô khi học AI là gì?",
      icon: "fa-solid fa-flag-checkered",
      type: "radio",
      options: [
        { label: "Tiết kiệm thời gian (Có thêm giờ nghỉ ngơi cùng gia đình)", value: "tiet_kiem_thoi_gian" },
        { label: "Slide bài giảng đẹp và chuyên nghiệp hơn", value: "slide_dep_hon" },
        { label: "Tiết học sinh động, cuốn hút học sinh hơn", value: "bai_day_sinh_dong" },
        { label: "Nâng cao hiệu quả chuyên môn và kết quả thi", value: "nang_cao_hieu_qua" },
        { label: "Giảm áp lực sổ sách, giáo án và nhận xét cuối kỳ", value: "giam_ap_luc" },
        { label: "Tăng thu nhập từ việc dạy học số / Bán tài liệu", value: "tang_thu_nhap" },
        { label: "Phát triển kỹ năng tương lai, không bị tụt lại phía sau", value: "phat_trien_ky_nang" }
      ]
    },
    {
      id: "challenges",
      title: "4. Khó khăn lớn nhất Thầy/Cô đang gặp phải khi tìm hiểu AI:",
      icon: "fa-solid fa-triangle-exclamation",
      type: "radio",
      options: [
        { label: "Không biết bắt đầu từ đâu, thấy nhiều thông tin quá ngợp", value: "dont_know_start" },
        { label: "Không biết cách viết câu lệnh (Prompt) chuẩn để ra kết quả đúng", value: "prompt_difficulty" },
        { label: "Chưa biết chọn công cụ nào phù hợp với môn học của mình", value: "tool_selection" },
        { label: "AI trả lời chung chung, thiếu kiến thức sư phạm thực tế", value: "generic_response" },
        { label: "Không có nhiều thời gian tự mày mò nghiên cứu", value: "no_time" },
        { label: "Đã biết dùng sơ sơ nhưng chưa khai thác sâu được", value: "shallow_knowledge" },
        { label: "Chưa gặp khó khăn gì đáng kể", value: "no_challenge" }
      ]
    },
    {
      id: "preferredLearningStyle",
      title: "5. Hình thức học tập mà Thầy/Cô cảm thấy phù hợp nhất:",
      icon: "fa-solid fa-graduation-cap",
      type: "radio",
      options: [
        { label: "Bài bản từ cơ bản đến nâng cao (Đi từng bước vững chắc)", value: "step_by_step" },
        { label: "Thực chiến ngắn gọn, giải quyết ngay bài toán cụ thể", value: "fast_practical" },
        { label: "Học theo từng chuyên đề công việc (Soạn bài / Làm slide / Ra đề)", value: "by_task" },
        { label: "Học chuyên sâu 1 công cụ mạnh nhất trước (ChatGPT / Claude)", value: "deep_single" },
        { label: "Học phối hợp nhiều công cụ AI trong một quy trình khép kín", value: "multi_tool_workflow" }
      ]
    },
    {
      id: "readinessLevel",
      title: "6. Mức độ sẵn sàng tham gia học tập của Thầy/Cô:",
      icon: "fa-solid fa-bolt",
      type: "radio",
      options: [
        { label: "Chưa biết nhiều nhưng rất háo hức muốn bắt đầu ngay", value: "ready_beginner" },
        { label: "Muốn học nhưng cần tư vấn xem môn mình học gì hiệu quả nhất", value: "need_consultation" },
        { label: "Đã dùng rồi, sẵn sàng đầu tư để nâng tầm kỹ năng chuyên sâu", value: "ready_upgrade" },
        { label: "Quyết tâm trở thành giáo viên tiên phong ứng dụng AI tại trường", value: "ready_master" }
      ]
    }
  ]
};

// Thuật toán Matching & Đề xuất thông minh
function calculateCourseRecommendations(profile, step1Data, step2Data) {
  const scores = {};
  
  COURSES_DATA.forEach(course => {
    scores[course.id] = {
      course: course,
      score: 50,
      reasons: []
    };
  });

  const selectedNeeds = step2Data.aiSupportNeeds || [];
  const primaryArea = step2Data.primaryApplicationArea;
  const primaryGoal = step2Data.primaryGoal;
  const subject = step1Data.subject;
  const gradeLevel = step1Data.gradeLevel;

  selectedNeeds.forEach(need => {
    if (need === "soan_giao_an") {
      scores["giao_an_5512"].score += 35;
      scores["giao_an_5512"].reasons.push("Đúng với mong muốn tối ưu Kế hoạch bài dạy chuẩn 5512 của Thầy/Cô.");
    }
    if (need === "lam_slide" || need === "tao_hinh_anh") {
      scores["slide_hoclieu"].score += 35;
      scores["slide_hoclieu"].reasons.push("Giải quyết trọn vẹn mong muốn tạo Slide & Học liệu trực quan đẹp mắt.");
    }
    if (need === "tao_video") {
      scores["video_ai"].score += 38;
      scores["video_ai"].reasons.push("Học đúng kỹ năng sáng tạo Video bài giảng và MC ảo số hóa.");
    }
    if (need === "tao_de_kiem_tra") {
      scores["matran_dethi"].score += 36;
      scores["matran_dethi"].reasons.push("Chuyên sâu về Ma trận đề, Ngân hàng câu hỏi và Đánh giá năng lực.");
    }
    if (need === "cham_bai") {
      scores["chu_nhiem_ai"].score += 32;
      scores["matran_dethi"].score += 20;
      scores["chu_nhiem_ai"].reasons.push("Giúp giảm tải 80% công đoạn nhận xét học bạ và nhận xét định kỳ.");
    }
    if (need === "tao_tro_choi") {
      scores["game_app"].score += 35;
      scores["game_app"].reasons.push("Cung cấp kho công cụ tạo Trò chơi học tập sinh động tức thì.");
    }
    if (need === "sang_kien_kinh_nghiem") {
      scores["skkn_ai"].score += 38;
      scores["skkn_ai"].reasons.push("Trợ lý đắc lực hoàn thành đề tài Sáng kiến kinh nghiệm đạt loại Giỏi.");
    }
    if (need === "quan_ly_cong_viec" || need === "viet_y_tuong") {
      scores["quan_ly_hanhchinh"].score += 34;
      scores["quan_ly_hanhchinh"].reasons.push("Tối ưu hóa quản lý tài liệu, công việc hành chính và trợ lý thông minh.");
    }
    if (need === "marketing_tuyen_sinh") {
      scores["video_ai"].score += 25;
      scores["slide_hoclieu"].score += 20;
    }
  });

  if (primaryArea === "soan_bai") {
    scores["giao_an_5512"].score += 15;
    scores["slide_hoclieu"].score += 10;
  } else if (primaryArea === "trong_lop") {
    scores["game_app"].score += 18;
    scores["slide_hoclieu"].score += 12;
  } else if (primaryArea === "kiem_tra_danh_gia") {
    scores["matran_dethi"].score += 20;
    scores["chu_nhiem_ai"].score += 15;
  } else if (primaryArea === "lam_hoc_lieu") {
    scores["slide_hoclieu"].score += 20;
    scores["video_ai"].score += 15;
  } else if (primaryArea === "hanh_chinh") {
    scores["quan_ly_hanhchinh"].score += 25;
    scores["chu_nhiem_ai"].score += 20;
  } else if (primaryArea === "tat_ca") {
    scores["giao_an_5512"].score += 15;
    scores["slide_hoclieu"].score += 15;
    scores["quan_ly_hanhchinh"].score += 10;
  }

  if (subject === "ngu_van" || subject === "lich_su_dia_ly") {
    scores["giao_an_5512"].score += 10;
    scores["video_ai"].score += 10;
    scores["skkn_ai"].reasons.push(`Rất phù hợp để viết SKKN và phân tích ngữ liệu môn ${subject === "ngu_van" ? "Ngữ văn" : "Sử - Địa"}.`);
  } else if (subject === "toan" || subject === "khtn") {
    scores["matran_dethi"].score += 12;
    scores["game_app"].score += 10;
    scores["matran_dethi"].reasons.push("Đặc biệt tối ưu cho việc soạn đề trắc nghiệm và ma trận đề Toán / Tự nhiên.");
  } else if (subject === "tieng_anh" || subject === "ngoai_ngu_khac") {
    scores["video_ai"].score += 15;
    scores["game_app"].score += 12;
    scores["video_ai"].reasons.push("Hỗ trợ lồng tiếng chuẩn bản xứ và làm học liệu ngoại ngữ cực đỉnh.");
  } else if (subject === "mam_non" || gradeLevel === "mam_non" || gradeLevel === "tieu_hoc") {
    scores["slide_hoclieu"].score += 12;
    scores["game_app"].score += 14;
    scores["chu_nhiem_ai"].score += 10;
  } else if (subject === "chu_nhiem_tpt") {
    scores["chu_nhiem_ai"].score += 25;
    scores["quan_ly_hanhchinh"].score += 15;
  }

  if (primaryGoal === "tiet_kiem_thoi_gian") {
    scores["giao_an_5512"].score += 10;
    scores["quan_ly_hanhchinh"].score += 10;
  } else if (primaryGoal === "slide_dep_hon" || primaryGoal === "bai_day_sinh_dong") {
    scores["slide_hoclieu"].score += 15;
    scores["game_app"].score += 10;
  } else if (primaryGoal === "giam_ap_luc") {
    scores["chu_nhiem_ai"].score += 12;
    scores["giao_an_5512"].score += 10;
  }

  const results = Object.values(scores).map(item => {
    let matchRate = Math.min(99, Math.max(75, Math.round(item.score)));
    if (item.reasons.length === 0) {
      item.reasons.push("Khóa học trang bị nền tảng AI vững chắc nâng cao kỹ năng sư phạm số.");
    }
    return {
      ...item.course,
      matchRate: matchRate,
      matchReasons: item.reasons
    };
  });

  results.sort((a, b) => b.matchRate - a.matchRate);
  return results;
}
