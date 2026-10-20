/**
 * BLOG_POSTS — Dữ liệu các bài viết (blog.html danh mục, post.html?p=<slug> chi tiết).
 * Mỗi bài: slug (dùng trên URL), code (mã chuyên mục [x.y]), tiêu đề, mô tả ngắn, chuyên mục,
 * màu ảnh bìa (theme), hình minh họa SVG (art — vẽ trong khung 800×450, nền gradient do blog.js thêm),
 * khóa học liên quan (courseFilter = categoryFilter trong COURSES_DATA) và nội dung HTML.
 * Trong content: mỗi <h2>/<h3> tự sinh mục lục; .prompt-box có nút Sao chép; .infographic, .mock-*, .compare, .callout là khối trình bày.
 * Thêm bài mới: thêm 1 object vào mảng (bài mới nhất đặt đầu mảng hoặc theo ngày — blog.js tự sắp theo date giảm dần).
 */
const BLOG_AUTHOR = {
  name: 'Ban Chuyên môn EduAI',
  role: 'Đội ngũ giảng viên EduAI Teacher Hub',
  initials: 'EA'
};

const BLOG_CATEGORIES = [
  { id: 'lo_trinh', label: 'Lộ trình', icon: 'fa-route' },
  { id: 'huong_dan', label: 'Hướng dẫn', icon: 'fa-screwdriver-wrench' },
  { id: 'prompt', label: 'Kỹ năng Prompt', icon: 'fa-wand-magic-sparkles' },
  { id: 'thuc_chien', label: 'Thực chiến', icon: 'fa-bolt' }
];

const BLOG_POSTS = [
  // ==========================================================================
  // BÀI 1 — [4.1] Lộ trình 4 tuần
  // ==========================================================================
  {
    slug: 'lo-trinh-4-tuan-lam-quen-ai',
    code: '4.1',
    title: 'Lộ trình 4 tuần làm quen AI cho giáo viên mới bắt đầu',
    excerpt: 'Giảm rào cản tâm lý, giúp giáo viên mới xác định điểm bắt đầu.',
    category: 'lo_trinh',
    format: 'Bài lộ trình kèm infographic',
    date: '2026-10-06',
    tags: ['Người mới bắt đầu', 'ChatGPT', 'Giáo án', 'Slide'],
    theme: ['#1E3A8A', '#2563EB'],
    courseFilter: 'giao_an',
    art: `
      <path d="M90 365 C 210 365, 220 262, 320 262 S 455 330, 530 240 S 640 118, 712 112" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="7" stroke-dasharray="2 16" stroke-linecap="round"/>
      <g font-family="Plus Jakarta Sans, Be Vietnam Pro, sans-serif" text-anchor="middle">
        <g transform="translate(110 362)"><circle r="34" fill="#fff"/><text y="10" font-size="28" font-weight="800" fill="#1E3A8A">1</text><text y="66" font-size="19" font-weight="700" fill="#fff">Làm quen</text></g>
        <g transform="translate(320 262)"><circle r="34" fill="#fff"/><text y="10" font-size="28" font-weight="800" fill="#1E3A8A">2</text><text y="66" font-size="19" font-weight="700" fill="#fff">Viết yêu cầu</text></g>
        <g transform="translate(530 240)"><circle r="34" fill="#fff"/><text y="10" font-size="28" font-weight="800" fill="#1E3A8A">3</text><text y="66" font-size="19" font-weight="700" fill="#fff">Giáo án</text></g>
        <g transform="translate(712 112)"><circle r="40" fill="#F59E0B"/><text y="11" font-size="30" font-weight="800" fill="#fff">4</text><text y="72" font-size="19" font-weight="700" fill="#fff">Slide &amp; Bài tập</text></g>
      </g>
      <path d="M712 72 V 18" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M714 20 L 760 32 L 714 46 Z" fill="#FBBF24"/>
      <g font-family="Plus Jakarta Sans, sans-serif" fill="#fff"><text x="60" y="92" font-size="44" font-weight="800">4 tuần</text><text x="60" y="130" font-size="20" font-weight="600" opacity=".85">Từ chưa biết gì đến dùng AI trên lớp</text></g>`,
    content: `
<p class="lead">Nhiều thầy cô nghe đồng nghiệp nói "AI soạn bài nhanh lắm" nhưng mở ChatGPT ra lại không biết gõ gì, hoặc thử một lần thấy kết quả chung chung rồi bỏ. Bài viết này đưa ra một lộ trình <strong>4 tuần, mỗi ngày khoảng 20–30 phút</strong>, đi từ việc làm quen giao diện đến khi tự tạo được giáo án, slide và phiếu bài tập dùng thật trên lớp. Mỗi tuần gắn với <strong>một sản phẩm đầu ra cụ thể</strong> để thầy cô biết mình đã tiến bộ đến đâu.</p>

<h2>Vì sao nhiều thầy cô ngại bắt đầu với AI?</h2>
<p>Qua các buổi chia sẻ với giáo viên ở nhiều cấp học, chúng tôi nhận thấy rào cản lớn nhất thường không nằm ở công nghệ mà nằm ở tâm lý. Có ba nỗi lo hay gặp nhất:</p>
<ul>
  <li><strong>"Tôi không giỏi máy tính."</strong> Thực tế, dùng ChatGPT chỉ cần biết gõ chữ và bấm nút gửi, giống hệt nhắn tin Zalo. Không cần cài đặt phần mềm hay học lập trình.</li>
  <li><strong>"Sợ AI viết sai, không đúng chuẩn chuyên môn."</strong> Nỗi lo này hoàn toàn chính đáng. AI là <em>trợ lý soạn nháp</em>, còn thầy cô vẫn là người kiểm duyệt và quyết định cuối cùng. Biết cách kiểm tra lại chính là một kỹ năng trong lộ trình.</li>
  <li><strong>"Không biết bắt đầu từ đâu."</strong> Có quá nhiều công cụ, quá nhiều video hướng dẫn. Lộ trình dưới đây chỉ chọn những việc thiết yếu nhất, sắp xếp theo thứ tự từ dễ đến khó.</li>
</ul>
<div class="callout tip"><i class="fa-solid fa-lightbulb"></i><div><strong>Tinh thần của lộ trình:</strong> Không cần học hết, chỉ cần làm đều. Mỗi ngày một việc nhỏ, cuối mỗi tuần có một sản phẩm thật để dùng ngay trong công việc.</div></div>

<h2>Tổng quan lộ trình 4 tuần</h2>
<p>Bảng dưới đây tóm tắt toàn bộ hành trình. Thầy cô có thể lưu lại hoặc chụp màn hình để theo dõi tiến độ của mình.</p>
<div class="infographic" role="img" aria-label="Infographic lộ trình 4 tuần làm quen AI">
  <div class="info-head"><span class="info-badge"><i class="fa-solid fa-route"></i> Lộ trình EduAI</span><strong>4 tuần làm quen AI · 20–30 phút mỗi ngày</strong></div>
  <ol class="info-steps">
    <li style="--c:#2563EB"><span class="info-num">Tuần 1</span><i class="fa-solid fa-comments info-ic"></i><h4>Làm quen ChatGPT</h4><p>Tạo tài khoản, hiểu giao diện, hỏi đáp những câu đầu tiên.</p><span class="info-out"><i class="fa-solid fa-flag-checkered"></i> Tài khoản + ghi chú "5 câu hỏi đầu tiên"</span></li>
    <li style="--c:#0891B2"><span class="info-num">Tuần 2</span><i class="fa-solid fa-pen-nib info-ic"></i><h4>Viết yêu cầu đơn giản</h4><p>Áp dụng công thức 4 phần cho việc nhỏ hằng ngày.</p><span class="info-out"><i class="fa-solid fa-flag-checkered"></i> Sổ tay 10 câu lệnh cá nhân</span></li>
    <li style="--c:#059669"><span class="info-num">Tuần 3</span><i class="fa-solid fa-book-open info-ic"></i><h4>Soạn giáo án</h4><p>Dựng khung kế hoạch bài dạy theo 5512, rồi tự hoàn thiện.</p><span class="info-out"><i class="fa-solid fa-flag-checkered"></i> 1 kế hoạch bài dạy hoàn chỉnh</span></li>
    <li style="--c:#D97706"><span class="info-num">Tuần 4</span><i class="fa-solid fa-display info-ic"></i><h4>Tạo slide &amp; bài tập</h4><p>Chuyển giáo án thành slide, phiếu bài tập và câu hỏi trắc nghiệm.</p><span class="info-out"><i class="fa-solid fa-flag-checkered"></i> Bộ slide + phiếu bài tập dùng trên lớp</span></li>
  </ol>
</div>

<h2>Tuần 1: Làm quen ChatGPT</h2>
<p><strong>Mục tiêu:</strong> Hết cảm giác "lạ lẫm", biết cách mở, hỏi và đọc câu trả lời của AI.</p>
<h3>Việc cần làm trong tuần</h3>
<ol>
  <li><strong>Ngày 1–2:</strong> Vào trang <em>chatgpt.com</em> bằng trình duyệt Chrome hoặc Edge, đăng ký bằng Gmail. Cài thêm ứng dụng ChatGPT trên điện thoại để có thể hỏi mọi lúc.</li>
  <li><strong>Ngày 3–4:</strong> Làm quen giao diện: ô nhập câu hỏi ở dưới cùng, lịch sử trò chuyện ở cột bên trái, nút tạo cuộc trò chuyện mới. Hỏi thử những câu đời thường như "Gợi ý 5 trò chơi khởi động 5 phút cho học sinh lớp 4".</li>
  <li><strong>Ngày 5–6:</strong> Tập "hỏi tiếp" thay vì hỏi lại từ đầu: "Ngắn gọn hơn", "Viết lại cho học sinh lớp 2 dễ hiểu", "Thêm ví dụ gần gũi với học sinh nông thôn".</li>
  <li><strong>Ngày 7:</strong> Tổng kết những điều thấy hữu ích và những chỗ AI trả lời chưa đúng.</li>
</ol>
<div class="output-box"><span><i class="fa-solid fa-flag-checkered"></i> Sản phẩm đầu ra Tuần 1</span><p>Một tài khoản ChatGPT đã dùng quen và một trang ghi chú <strong>"5 câu hỏi đầu tiên"</strong>: câu đã hỏi, điều AI làm tốt, điều AI làm chưa tốt.</p></div>

<h2>Tuần 2: Viết yêu cầu đơn giản</h2>
<p><strong>Mục tiêu:</strong> Hiểu rằng câu trả lời tốt đến từ câu hỏi tốt, và biết viết yêu cầu có cấu trúc.</p>
<p>Tuần này thầy cô áp dụng <strong>công thức prompt 4 phần</strong>: <em>Bối cảnh – Nhiệm vụ – Tiêu chí đầu ra – Định dạng</em> (xem chi tiết trong bài <a href="post.html?p=cong-thuc-viet-prompt-co-ban">[2.3] Công thức viết prompt cơ bản cho giáo viên</a>). Hãy tập với những việc nhỏ, quen thuộc:</p>
<ul>
  <li>Viết tin nhắn Zalo thông báo lịch họp phụ huynh, giọng lịch sự, dưới 80 chữ.</li>
  <li>Tóm tắt một công văn dài thành 5 ý chính cần làm.</li>
  <li>Gợi ý 3 câu hỏi khởi động cho bài học ngày mai.</li>
  <li>Viết lời nhắc nhở nhẹ nhàng cho học sinh hay quên làm bài tập.</li>
</ul>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Câu lệnh mẫu Tuần 2</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Tôi là giáo viên chủ nhiệm lớp 5. Hãy viết tin nhắn Zalo gửi nhóm phụ huynh để thông báo họp phụ huynh cuối học kì I vào [thời gian, địa điểm].
Yêu cầu: giọng văn lịch sự, ấm áp; dưới 80 chữ; nêu rõ nội dung chính của buổi họp và đề nghị phụ huynh xác nhận tham dự.
Trình bày thành 1 đoạn ngắn, có lời chào đầu và lời cảm ơn cuối.</pre></div>
<div class="output-box"><span><i class="fa-solid fa-flag-checkered"></i> Sản phẩm đầu ra Tuần 2</span><p>Một <strong>sổ tay 10 câu lệnh cá nhân</strong> (file Word hoặc ghi chú điện thoại) cho những việc lặp lại hằng tuần, mỗi câu đã chạy thử và chỉnh cho vừa ý.</p></div>

<h2>Tuần 3: Soạn giáo án với AI</h2>
<p><strong>Mục tiêu:</strong> Dùng AI dựng khung kế hoạch bài dạy theo Công văn 5512, sau đó tự hoàn thiện bằng chuyên môn của mình.</p>
<h3>Cách làm từng bước</h3>
<ol>
  <li><strong>Chọn một bài sắp dạy</strong> trong tuần tới, ưu tiên bài thầy cô đã dạy nhiều năm để dễ đánh giá chất lượng bản nháp AI.</li>
  <li><strong>Cung cấp đủ thông tin:</strong> môn, lớp, tên bài, bộ sách, thời lượng, đặc điểm học sinh, yêu cầu cần đạt trong chương trình.</li>
  <li><strong>Yêu cầu AI dựng khung</strong> gồm mục tiêu (phẩm chất, năng lực), thiết bị dạy học và 4 hoạt động: Mở đầu – Hình thành kiến thức – Luyện tập – Vận dụng. Mỗi hoạt động có mục tiêu, nội dung, sản phẩm, tổ chức thực hiện.</li>
  <li><strong>Hỏi tiếp để làm sâu:</strong> "Thiết kế lại hoạt động Mở đầu thành trò chơi 5 phút", "Bổ sung câu hỏi phân hóa cho học sinh khá giỏi".</li>
  <li><strong>Rà soát và chỉnh sửa:</strong> đối chiếu với sách giáo khoa, kiểm tra kiến thức, điều chỉnh thời gian phù hợp lớp mình.</li>
</ol>
<div class="callout warn"><i class="fa-solid fa-triangle-exclamation"></i><div><strong>Lưu ý chuyên môn:</strong> AI có thể nhầm kiến thức, nhầm tên bài giữa các bộ sách hoặc tự "bịa" nội dung. Thầy cô luôn là người chịu trách nhiệm cuối cùng về giáo án. Hãy coi bản AI viết là bản nháp đầu tiên, không phải bản nộp.</div></div>
<div class="output-box"><span><i class="fa-solid fa-flag-checkered"></i> Sản phẩm đầu ra Tuần 3</span><p><strong>Một kế hoạch bài dạy hoàn chỉnh</strong> đã được thầy cô chỉnh sửa, sẵn sàng dùng cho tiết dạy thật, kèm câu lệnh đã dùng để lần sau tái sử dụng.</p></div>

<h2>Tuần 4: Tạo slide và bài tập</h2>
<p><strong>Mục tiêu:</strong> Biến giáo án ở Tuần 3 thành học liệu trực quan và bài tập cho học sinh.</p>
<h3>Từ giáo án đến slide</h3>
<p>Dán giáo án vào ChatGPT và yêu cầu: "Chuyển thành dàn ý slide, mỗi slide gồm tiêu đề, tối đa 4 ý ngắn và gợi ý hình minh họa". Sau đó đưa dàn ý này vào các công cụ tạo slide bằng AI như <strong>Gamma</strong> hoặc <strong>Canva Magic Studio</strong> để có bản thiết kế đẹp trong vài phút, rồi chỉnh màu sắc, hình ảnh cho phù hợp lứa tuổi.</p>
<h3>Phiếu bài tập và câu hỏi trắc nghiệm</h3>
<ul>
  <li>Phiếu bài tập <strong>phân hóa 3 mức</strong>: cơ bản – vận dụng – nâng cao, mỗi mức 2–3 bài.</li>
  <li><strong>10 câu trắc nghiệm</strong> 4 lựa chọn có đáp án và giải thích ngắn, dùng để củng cố cuối tiết hoặc đưa lên Quizizz, Kahoot.</li>
  <li>Một câu hỏi mở để học sinh liên hệ thực tế.</li>
</ul>
<div class="output-box"><span><i class="fa-solid fa-flag-checkered"></i> Sản phẩm đầu ra Tuần 4</span><p><strong>Một bộ slide bài giảng và một phiếu bài tập</strong> đi kèm giáo án Tuần 3, dùng được ngay trên lớp. Đây là "bộ học liệu AI" hoàn chỉnh đầu tiên của thầy cô.</p></div>

<h2>Mẹo duy trì thói quen sau 4 tuần</h2>
<ul>
  <li><strong>Cố định khung giờ:</strong> ví dụ 20 phút sau giờ dạy buổi chiều, hoặc trước khi soạn bài buổi tối.</li>
  <li><strong>Lưu lại câu lệnh hay:</strong> mỗi câu lệnh cho kết quả tốt là một "tài sản" có thể dùng lại cả năm học.</li>
  <li><strong>Học cùng đồng nghiệp:</strong> rủ thêm một người trong tổ chuyên môn cùng đi lộ trình, chia sẻ kết quả mỗi cuối tuần.</li>
  <li><strong>Chia sẻ lên cộng đồng:</strong> đăng câu lệnh hiệu quả lên <a href="index.html#forum">Diễn đàn EduAI</a> để nhận góp ý.</li>
  <li><strong>Không nhập thông tin cá nhân của học sinh</strong> (họ tên đầy đủ, số điện thoại, địa chỉ) vào công cụ AI công cộng.</li>
</ul>

<h2>Nhận bộ prompt miễn phí của EduAI</h2>
<p>Để rút ngắn thời gian mày mò, EduAI chia sẻ miễn phí các câu lệnh mẫu đã được kiểm chứng trong lớp học thật:</p>
<ul>
  <li><strong>Trợ lý AI Sư phạm của EduAI:</strong> bấm nút robot ở góc phải màn hình, chọn một trong các nút gợi ý nhanh (Giáo án 5512, Slide &amp; Kịch bản, Ma trận &amp; Trắc nghiệm, SKKN, Nhận xét học bạ). Câu lệnh mẫu được điền sẵn, thầy cô chỉ cần sửa phần trong [ngoặc vuông].</li>
  <li><strong>Bộ mẫu câu lệnh chủ nhiệm:</strong> xem bài <a href="post.html?p=ai-chu-nhiem-nhan-xet-hoc-luc">[4.4] Ứng dụng AI tối ưu hóa thời gian chủ nhiệm và nhận xét học lực</a>.</li>
  <li><strong>Lộ trình riêng cho từng thầy cô:</strong> làm <a href="index.html#survey-section">bài Test AI</a> (khoảng 3 phút) để nhận gợi ý khóa học phù hợp với môn dạy và nhu cầu của mình.</li>
</ul>
<div class="cta-inline"><div><strong>Sẵn sàng bắt đầu Tuần 1?</strong><p>Mở Trợ lý AI Sư phạm và thử ngay câu lệnh đầu tiên.</p></div><button type="button" class="btn btn-primary" data-open-ai><i class="fa-solid fa-robot"></i> Mở Trợ lý AI</button></div>
`
  },

  // ==========================================================================
  // BÀI 2 — [4.2] Hướng dẫn thao tác ChatGPT cơ bản
  // ==========================================================================
  {
    slug: 'huong-dan-chatgpt-co-ban',
    code: '4.2',
    title: 'Hướng dẫn thao tác ChatGPT cơ bản: tải tài liệu, lưu kết quả và xử lý lỗi',
    excerpt: 'Tháo gỡ khó khăn kỹ thuật cho giáo viên chưa thành thạo công nghệ.',
    category: 'huong_dan',
    format: 'Bài hướng dẫn từng bước',
    date: '2026-10-10',
    tags: ['ChatGPT', 'Tải tệp PDF/Word', 'Xử lý lỗi'],
    theme: ['#0E7490', '#06B6D4'],
    courseFilter: 'hanh_chinh',
    art: `
      <g transform="translate(150 62)">
        <rect width="500" height="320" rx="22" fill="#fff"/>
        <rect width="500" height="44" rx="22" fill="#E0F2FE"/><rect y="24" width="500" height="20" fill="#E0F2FE"/>
        <circle cx="26" cy="22" r="7" fill="#F43F5E"/><circle cx="48" cy="22" r="7" fill="#F59E0B"/><circle cx="70" cy="22" r="7" fill="#10B981"/>
        <rect x="200" y="66" width="270" height="44" rx="14" fill="#DBEAFE"/><rect x="216" y="80" width="200" height="8" rx="4" fill="#2563EB" opacity=".5"/><rect x="216" y="94" width="140" height="7" rx="3.5" fill="#2563EB" opacity=".3"/>
        <rect x="30" y="126" width="300" height="70" rx="14" fill="#F1F5F9"/><rect x="46" y="142" width="250" height="8" rx="4" fill="#94A3B8"/><rect x="46" y="158" width="220" height="8" rx="4" fill="#CBD5E1"/><rect x="46" y="174" width="160" height="8" rx="4" fill="#CBD5E1"/>
        <g transform="translate(30 210)"><rect width="190" height="42" rx="12" fill="#fff" stroke="#CBD5E1" stroke-width="2"/><rect x="10" y="8" width="26" height="26" rx="6" fill="#2563EB"/><text x="23" y="27" font-size="14" font-weight="800" fill="#fff" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif">W</text><text x="46" y="27" font-size="15" font-weight="600" fill="#334155" font-family="Be Vietnam Pro, sans-serif">Giao-an-Toan6.docx</text></g>
        <rect x="24" y="264" width="452" height="42" rx="21" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
        <circle cx="48" cy="285" r="15" fill="#fff" stroke="#F59E0B" stroke-width="4"/><text x="48" y="292" font-size="22" font-weight="700" fill="#D97706" text-anchor="middle" font-family="sans-serif">+</text>
        <rect x="76" y="281" width="210" height="8" rx="4" fill="#CBD5E1"/>
        <circle cx="452" cy="285" r="15" fill="#0F172A"/><path d="M452 293 V 278 M445 284 L452 277 L459 284" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g font-family="Plus Jakarta Sans, sans-serif"><circle cx="160" cy="330" r="22" fill="#F59E0B"/><text x="160" y="338" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">1</text></g>
      <g font-family="Plus Jakarta Sans, sans-serif"><circle cx="668" cy="330" r="22" fill="#F59E0B"/><text x="668" y="338" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">2</text></g>`,
    content: `
<p class="lead">Bài viết dành cho thầy cô mới dùng ChatGPT hoặc chưa quen thao tác máy tính. Chúng ta sẽ đi qua <strong>3 thao tác cốt lõi</strong>: nhập yêu cầu, tải tệp PDF/Word lên để AI đọc, lưu và xuất kết quả. Cuối bài là bảng <strong>xử lý các lỗi thường gặp</strong> để thầy cô tự gỡ rối khi gặp sự cố.</p>
<div class="callout note"><i class="fa-solid fa-circle-info"></i><div>Giao diện ChatGPT được cập nhật thường xuyên nên vị trí nút có thể thay đổi đôi chút so với hình minh họa. Các thao tác chính vẫn giống nhau, thầy cô chỉ cần tìm biểu tượng tương ứng.</div></div>

<h2>Chuẩn bị trước khi bắt đầu</h2>
<ul>
  <li><strong>Thiết bị:</strong> máy tính có trình duyệt Chrome hoặc Edge (dễ thao tác với tệp nhất), hoặc điện thoại đã cài ứng dụng ChatGPT.</li>
  <li><strong>Tài khoản:</strong> đăng nhập tại <em>chatgpt.com</em> bằng Gmail. Gói miễn phí đủ dùng cho hầu hết công việc soạn bài, nhưng có giới hạn số lượt và số tệp tải lên mỗi ngày.</li>
  <li><strong>Tài liệu mẫu:</strong> chuẩn bị sẵn 1 file Word (ví dụ giáo án cũ) và 1 file PDF (ví dụ công văn) để thực hành.</li>
</ul>

<h2>Bước 1: Nhập yêu cầu đúng cách</h2>
<div class="mock-window" aria-label="Minh họa ô nhập yêu cầu của ChatGPT">
  <div class="mock-bar"><i></i><i></i><i></i><span>chatgpt.com</span></div>
  <div class="mock-body">
    <div class="mock-msg ai">Tôi có thể giúp gì cho thầy cô hôm nay?</div>
    <div class="mock-input"><span class="mock-plus">+</span><span class="mock-text">Tôi là giáo viên Toán lớp 6. Hãy gợi ý 3 hoạt động khởi động cho bài "Phân số bằng nhau"...</span><span class="mock-send mock-mark" data-n="2"><i class="fa-solid fa-arrow-up"></i></span></div>
    <span class="mock-note mock-mark" data-n="1">Ô nhập yêu cầu</span>
  </div>
</div>
<ol class="steps">
  <li>Bấm vào <strong>ô nhập</strong> ở cuối màn hình (số <b>1</b>) và gõ yêu cầu bằng tiếng Việt có dấu.</li>
  <li>Muốn xuống dòng mà <em>chưa gửi</em>: nhấn <kbd>Shift</kbd> + <kbd>Enter</kbd>. Nhấn <kbd>Enter</kbd> hoặc bấm <strong>nút mũi tên</strong> (số <b>2</b>) để gửi.</li>
  <li>Đợi AI viết xong (nút gửi chuyển lại hình mũi tên). Muốn dừng giữa chừng, bấm nút <strong>hình vuông</strong>.</li>
  <li>Chưa vừa ý? <strong>Hỏi tiếp ngay bên dưới</strong> ("Ngắn gọn hơn", "Thêm ví dụ") thay vì mở cuộc trò chuyện mới. AI nhớ nội dung trước đó trong cùng cuộc trò chuyện.</li>
  <li>Mỗi chủ đề mới (bài khác, lớp khác) nên bấm <strong>"Đoạn chat mới"</strong> ở cột bên trái để AI không bị lẫn thông tin.</li>
</ol>
<div class="callout tip"><i class="fa-solid fa-lightbulb"></i><div>Soạn yêu cầu dài trong Word hoặc ghi chú trước rồi dán vào (<kbd>Ctrl</kbd> + <kbd>V</kbd>) để không bị gửi nhầm khi đang gõ dở.</div></div>

<h2>Bước 2: Tải tệp PDF/Word lên để AI đọc</h2>
<p>Thay vì gõ lại cả trang tài liệu, thầy cô có thể đưa tệp lên để AI tóm tắt, trích ý hoặc chỉnh sửa.</p>
<div class="mock-window" aria-label="Minh họa tải tệp lên ChatGPT">
  <div class="mock-bar"><i></i><i></i><i></i><span>chatgpt.com</span></div>
  <div class="mock-body">
    <div class="mock-menu"><span class="mock-mark" data-n="2"><i class="fa-solid fa-paperclip"></i> Thêm ảnh và tệp</span><span><i class="fa-regular fa-image"></i> Ảnh</span></div>
    <div class="mock-file"><i class="fa-solid fa-file-pdf"></i><div><strong>CV-huong-dan-KTDG.pdf</strong><small>PDF · đã tải lên</small></div><span class="mock-mark" data-n="3"></span></div>
    <div class="mock-input"><span class="mock-plus mock-mark" data-n="1">+</span><span class="mock-text">Tóm tắt công văn đính kèm thành 5 việc giáo viên cần làm, kèm thời hạn.</span><span class="mock-send"><i class="fa-solid fa-arrow-up"></i></span></div>
  </div>
</div>
<ol class="steps">
  <li>Bấm <strong>dấu "+"</strong> (hoặc biểu tượng kẹp giấy) ở đầu ô nhập (số <b>1</b>).</li>
  <li>Chọn <strong>"Thêm ảnh và tệp"</strong> / "Tải lên từ máy tính" (số <b>2</b>), tìm tệp trong máy và bấm <strong>Open/Mở</strong>. Trên máy tính, thầy cô cũng có thể <strong>kéo thả tệp</strong> thẳng vào cửa sổ chat.</li>
  <li>Đợi tệp hiện thành một thẻ nhỏ phía trên ô nhập (số <b>3</b>), khi biểu tượng xoay vòng biến mất là tải xong.</li>
  <li>Gõ yêu cầu cụ thể cho tệp đó rồi bấm gửi. Ví dụ: "Dựa vào giáo án đính kèm, bổ sung phiếu học tập cho Hoạt động 2".</li>
</ol>
<h3>Những định dạng tệp nên dùng</h3>
<ul>
  <li><strong>Word (.docx), PDF có chữ chọn được, Excel (.xlsx), ảnh chụp (.jpg, .png)</strong>: AI đọc tốt.</li>
  <li><strong>PDF dạng ảnh scan</strong>: AI có thể đọc sai hoặc thiếu, nhất là chữ tiếng Việt mờ. Nên chụp ảnh rõ nét từng trang hoặc chuyển sang Word trước.</li>
  <li><strong>Tệp quá dài</strong> (sách, tài liệu hàng trăm trang): nên tách ra từng chương, từng bài để AI xử lý chính xác hơn.</li>
</ul>

<h2>Bước 3: Lưu và xuất kết quả</h2>
<h3>Cách 1: Sao chép vào Word</h3>
<ol class="steps">
  <li>Di chuột xuống cuối câu trả lời, bấm biểu tượng <strong>Sao chép</strong> (hai ô vuông chồng nhau).</li>
  <li>Mở Word, nhấn <kbd>Ctrl</kbd> + <kbd>V</kbd>. Nếu chữ bị lệch font hoặc nền xám, dùng <strong>Dán đặc biệt → Chỉ giữ văn bản</strong> (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> trên bản Word mới) rồi định dạng lại font Times New Roman.</li>
  <li>Bảng biểu thường dán sang Word vẫn giữ dạng bảng. Nếu bị vỡ, yêu cầu AI "trình bày lại dưới dạng bảng" rồi sao chép lần nữa.</li>
</ol>
<h3>Cách 2: Yêu cầu AI tạo tệp tải về</h3>
<p>Thầy cô có thể yêu cầu: <em>"Xuất nội dung trên thành file Word (.docx) để tôi tải về"</em>. Khi AI tạo xong sẽ có đường link tải tệp ngay trong câu trả lời. Tính năng này phụ thuộc gói tài khoản và đôi khi không khả dụng; nếu không được, quay lại Cách 1.</p>
<div class="callout tip"><i class="fa-solid fa-lightbulb"></i><div>Trợ lý AI Sư phạm của EduAI (nút robot góc phải màn hình) có sẵn nút <strong>"Tải file Word"</strong> dưới mỗi câu trả lời, bấm một lần là có tệp .doc giữ nguyên bảng và định dạng.</div></div>
<h3>Cách 3: Quản lý lịch sử trò chuyện</h3>
<ul>
  <li>Mọi cuộc trò chuyện được lưu ở cột bên trái. Di chuột vào tên cuộc trò chuyện, bấm dấu <strong>"…"</strong> để <strong>Đổi tên</strong> (ví dụ "Giáo án Toán 6 – Phân số") cho dễ tìm lại.</li>
  <li>Dùng ô <strong>Tìm kiếm</strong> trong cột bên trái để tìm lại nội dung cũ.</li>
  <li>Xóa những cuộc trò chuyện có thông tin nhạy cảm sau khi dùng xong.</li>
</ul>

<h2>Xử lý các lỗi thường gặp</h2>
<div class="table-wrap">
<table>
  <thead><tr><th>Hiện tượng</th><th>Nguyên nhân thường gặp</th><th>Cách xử lý</th></tr></thead>
  <tbody>
    <tr><td><strong>Báo lỗi "Something went wrong" / "Đã xảy ra lỗi"</strong></td><td>Mạng chập chờn hoặc máy chủ quá tải</td><td>Bấm nút <strong>Thử lại</strong> (mũi tên vòng tròn), tải lại trang (<kbd>F5</kbd>). Câu hỏi cũ vẫn còn trong lịch sử.</td></tr>
    <tr><td><strong>Câu trả lời bị cắt ngang</strong></td><td>Nội dung quá dài so với một lượt trả lời</td><td>Gõ <em>"Viết tiếp"</em> hoặc yêu cầu chia nhỏ: "Viết Hoạt động 1 và 2 trước".</td></tr>
    <tr><td><strong>Không tải được tệp</strong></td><td>Tệp quá lớn, sai định dạng hoặc hết lượt tải của gói miễn phí</td><td>Nén/tách tệp, lưu lại thành .docx hoặc .pdf, chờ sang ngày hôm sau hoặc dán trực tiếp nội dung chữ.</td></tr>
    <tr><td><strong>AI đọc sai nội dung tệp PDF</strong></td><td>PDF dạng ảnh scan, chữ mờ</td><td>Chụp ảnh rõ từng trang, hoặc chuyển PDF sang Word rồi tải lên lại.</td></tr>
    <tr><td><strong>Lỗi font, mất dấu tiếng Việt khi dán vào Word</strong></td><td>Định dạng web đi kèm khi dán</td><td>Dán đặc biệt <strong>Chỉ giữ văn bản</strong>, chọn lại font Unicode (Times New Roman, Arial).</td></tr>
    <tr><td><strong>Báo hết lượt dùng / chuyển sang mô hình khác</strong></td><td>Gói miễn phí giới hạn lượt theo khung giờ</td><td>Chờ vài giờ để được dùng lại, hoặc dùng tạm Trợ lý AI của EduAI.</td></tr>
    <tr><td><strong>AI trả lời sai kiến thức, "bịa" số liệu, văn bản</strong></td><td>Đặc điểm chung của mô hình AI</td><td>Luôn đối chiếu sách giáo khoa, văn bản gốc. Yêu cầu AI "chỉ dựa vào tài liệu tôi đính kèm".</td></tr>
    <tr><td><strong>AI trả lời bằng tiếng Anh</strong></td><td>Yêu cầu có nhiều từ tiếng Anh</td><td>Thêm câu <em>"Trả lời bằng tiếng Việt"</em> ở cuối yêu cầu.</td></tr>
  </tbody>
</table>
</div>

<h2>Lưu ý an toàn dữ liệu</h2>
<ul>
  <li><strong>Không tải lên</strong> danh sách học sinh có họ tên đầy đủ, ngày sinh, số điện thoại phụ huynh, địa chỉ. Hãy thay bằng mã (HS01, HS02...).</li>
  <li>Không đưa đề thi chưa tổ chức, tài liệu nội bộ có đóng dấu "Mật" lên công cụ AI công cộng.</li>
  <li>Trong phần <strong>Cài đặt → Kiểm soát dữ liệu</strong> của ChatGPT, thầy cô có thể tắt tùy chọn cho phép dùng dữ liệu để cải thiện mô hình.</li>
</ul>

<h2>Tóm tắt nhanh</h2>
<ul class="checklist">
  <li>Gõ yêu cầu vào ô nhập, <kbd>Shift</kbd> + <kbd>Enter</kbd> để xuống dòng, <kbd>Enter</kbd> để gửi.</li>
  <li>Bấm "+" để tải tệp Word/PDF/ảnh, chờ tải xong rồi mới gửi yêu cầu.</li>
  <li>Sao chép kết quả vào Word, dán "Chỉ giữ văn bản" nếu lỗi font.</li>
  <li>Đổi tên cuộc trò chuyện để dễ tìm lại.</li>
  <li>Gặp lỗi: thử lại, tải lại trang, chia nhỏ yêu cầu.</li>
</ul>
<div class="cta-inline"><div><strong>Muốn quản lý tài liệu và tự động hóa việc hành chính bằng AI?</strong><p>Khóa học "Quản lý Tài liệu, Trợ lý Ảo &amp; Tự động hóa Công việc Hành chính" hướng dẫn cầm tay chỉ việc.</p></div><a class="btn btn-primary" href="index.html?loc=hanh_chinh#courses"><i class="fa-solid fa-folder-open"></i> Xem khóa học</a></div>
`
  },

  // ==========================================================================
  // BÀI 3 — [2.3] Công thức viết prompt cơ bản
  // ==========================================================================
  {
    slug: 'cong-thuc-viet-prompt-co-ban',
    code: '2.3',
    title: 'Công thức viết prompt cơ bản cho giáo viên',
    excerpt: 'Hình thành tư duy viết prompt nền tảng.',
    category: 'prompt',
    format: 'Bài giải thích kèm ví dụ trước – sau',
    date: '2026-10-14',
    tags: ['Prompt', 'Ví dụ trước – sau', 'Toán 6'],
    theme: ['#1E3A8A', '#0EA5E9'],
    courseFilter: 'giao_an',
    art: `
      <g font-family="Plus Jakarta Sans, Be Vietnam Pro, sans-serif">
        <g transform="translate(70 70)">
          <rect width="380" height="64" rx="16" fill="#fff"/><rect x="12" y="12" width="40" height="40" rx="10" fill="#2563EB"/><text x="32" y="40" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">1</text><text x="70" y="41" font-size="24" font-weight="800" fill="#0F172A">Bối cảnh</text>
          <g transform="translate(0 80)"><rect width="380" height="64" rx="16" fill="#fff"/><rect x="12" y="12" width="40" height="40" rx="10" fill="#06B6D4"/><text x="32" y="40" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">2</text><text x="70" y="41" font-size="24" font-weight="800" fill="#0F172A">Nhiệm vụ</text></g>
          <g transform="translate(0 160)"><rect width="380" height="64" rx="16" fill="#fff"/><rect x="12" y="12" width="40" height="40" rx="10" fill="#10B981"/><text x="32" y="40" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">3</text><text x="70" y="41" font-size="24" font-weight="800" fill="#0F172A">Tiêu chí đầu ra</text></g>
          <g transform="translate(0 240)"><rect width="380" height="64" rx="16" fill="#fff"/><rect x="12" y="12" width="40" height="40" rx="10" fill="#F59E0B"/><text x="32" y="40" font-size="22" font-weight="800" fill="#fff" text-anchor="middle">4</text><text x="70" y="41" font-size="24" font-weight="800" fill="#0F172A">Định dạng</text></g>
        </g>
        <path d="M480 225 H 545" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M535 205 L 560 225 L 535 245" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <g transform="translate(580 110)">
          <rect width="160" height="210" rx="16" fill="#fff"/><rect x="20" y="28" width="120" height="10" rx="5" fill="#1E3A8A"/><rect x="20" y="56" width="110" height="8" rx="4" fill="#CBD5E1"/><rect x="20" y="74" width="120" height="8" rx="4" fill="#CBD5E1"/><rect x="20" y="92" width="90" height="8" rx="4" fill="#CBD5E1"/>
          <rect x="20" y="118" width="120" height="56" rx="8" fill="#DBEAFE"/><path d="M34 160 L 58 138 L 76 152 L 98 130 L 126 150" stroke="#2563EB" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <path d="M748 96 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6z" fill="#FBBF24"/>
      </g>`,
    content: `
<p class="lead">Cùng một công cụ AI, có thầy cô nhận được bản giáo án gần như dùng ngay, có thầy cô chỉ nhận được vài dòng chung chung. Sự khác biệt nằm ở <strong>câu lệnh (prompt)</strong>. Bài viết giới thiệu <strong>công thức 4 phần</strong> dễ nhớ nhất cho giáo viên và so sánh <strong>trước – sau</strong> trên cùng một bài học để thầy cô thấy rõ hiệu quả.</p>

<h2>Prompt là gì và vì sao cần công thức?</h2>
<p><strong>Prompt</strong> là câu yêu cầu thầy cô gửi cho AI. Hãy hình dung AI như một <em>trợ giảng mới vào nghề</em>: rất chăm chỉ, đọc nhiều, viết nhanh, nhưng <strong>không biết gì về lớp học của thầy cô</strong>: học sinh lớp mấy, học lực ra sao, dạy bộ sách nào, cần nộp theo mẫu nào. Nếu giao việc mơ hồ, trợ giảng sẽ làm theo kiểu "an toàn", tức là chung chung.</p>
<p>Một công thức cố định giúp thầy cô <strong>không quên thông tin quan trọng</strong>, đồng thời rèn tư duy giao việc rõ ràng. Đây cũng chính là kỹ năng giao nhiệm vụ học tập mà thầy cô vẫn dùng hằng ngày với học sinh.</p>

<h2>Công thức 4 phần: Bối cảnh – Nhiệm vụ – Tiêu chí – Định dạng</h2>
<div class="formula-grid">
  <div class="formula-card" style="--c:#2563EB"><span class="formula-num">1</span><h4>Bối cảnh</h4><p class="formula-q">Ai đang hỏi? Cho đối tượng nào?</p><p>Vai trò của thầy cô, môn học, lớp, bộ sách, đặc điểm học sinh.</p><code>Tôi là giáo viên Toán lớp 6, dạy bộ sách Kết nối tri thức. Lớp có 40 học sinh, học lực không đồng đều.</code></div>
  <div class="formula-card" style="--c:#0891B2"><span class="formula-num">2</span><h4>Nhiệm vụ</h4><p class="formula-q">Cần AI làm việc gì?</p><p>Một động từ rõ ràng: soạn, thiết kế, tóm tắt, nhận xét, chuyển đổi...</p><code>Hãy soạn phiếu bài tập cho bài "Phân số bằng nhau".</code></div>
  <div class="formula-card" style="--c:#059669"><span class="formula-num">3</span><h4>Tiêu chí đầu ra</h4><p class="formula-q">Thế nào là đạt yêu cầu?</p><p>Số lượng, mức độ, thời lượng, yêu cầu cần đạt, điều cần tránh.</p><code>Gồm 6 bài, chia 3 mức: nhận biết, thông hiểu, vận dụng; làm trong 15 phút; có ví dụ gần gũi đời sống.</code></div>
  <div class="formula-card" style="--c:#D97706"><span class="formula-num">4</span><h4>Định dạng</h4><p class="formula-q">Trình bày ra sao?</p><p>Bảng, danh sách, đoạn văn, độ dài, có đáp án hay không, giọng văn.</p><code>Trình bày dạng phiếu in được, đánh số bài, cuối phiếu có đáp án và hướng dẫn chấm.</code></div>
</div>
<div class="callout tip"><i class="fa-solid fa-lightbulb"></i><div><strong>Mẹo ghi nhớ:</strong> <em>"Tôi là ai – Cần gì – Tốt là thế nào – Trình bày ra sao"</em>. Chỉ cần trả lời đủ 4 câu hỏi này, prompt của thầy cô đã tốt hơn phần lớn người dùng phổ thông.</div></div>

<h2>Ví dụ trước – sau trên cùng một bài học</h2>
<p>Bài học dùng để so sánh: <strong>"Phân số bằng nhau" (Toán 6)</strong>. Cả hai câu lệnh được gửi cho cùng một công cụ AI.</p>
<div class="compare">
  <div class="compare-col before">
    <span class="compare-tag"><i class="fa-solid fa-xmark"></i> Trước: câu lệnh đơn giản</span>
    <div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Prompt</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Soạn bài tập về phân số bằng nhau.</pre></div>
  </div>
  <div class="compare-col after">
    <span class="compare-tag"><i class="fa-solid fa-check"></i> Sau: câu lệnh đầy đủ 4 phần</span>
    <div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Prompt</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>[Bối cảnh] Tôi là giáo viên Toán lớp 6. Lớp tôi có 40 học sinh, khoảng một phần ba các em còn yếu về phép nhân, chia.
[Nhiệm vụ] Hãy soạn phiếu bài tập cho bài "Phân số bằng nhau", dùng ở phần Luyện tập.
[Tiêu chí] 6 bài, chia 3 mức: 2 bài nhận biết, 2 bài thông hiểu, 2 bài vận dụng gắn với tình huống đời sống (chia bánh, chia đồ ăn...). Học sinh làm trong 15 phút. Số liệu nhỏ, dễ tính nhẩm.
[Định dạng] Trình bày như phiếu in được, có ô ghi họ tên lớp, đánh số bài. Cuối phiếu có đáp án ngắn gọn và 1 lỗi sai học sinh hay mắc kèm cách sửa.</pre></div>
  </div>
</div>
<h3>Kết quả của câu lệnh đơn giản</h3>
<div class="result-box weak">
  <p>1. Thế nào là hai phân số bằng nhau? Cho ví dụ.<br>2. Tìm x biết x/4 = 6/8.<br>3. Rút gọn phân số 24/36.<br>4. Các cặp phân số sau có bằng nhau không: 3/5 và 9/15; 2/7 và 5/14?<br>5. Viết 3 phân số bằng phân số 2/3.</p>
  <p class="result-note"><i class="fa-solid fa-circle-exclamation"></i> Đúng kiến thức nhưng <strong>không phân mức</strong>, không có tình huống thực tế, không có đáp án, có câu (rút gọn phân số) lệch trọng tâm bài. Thầy cô phải sửa nhiều.</p>
</div>
<h3>Kết quả của câu lệnh đầy đủ</h3>
<div class="result-box strong">
  <p><strong>PHIẾU BÀI TẬP – PHÂN SỐ BẰNG NHAU</strong> &nbsp;·&nbsp; Họ tên: ............ Lớp: ......</p>
  <p><strong>Mức 1 – Nhận biết</strong><br>Bài 1. Điền dấu "=" hoặc "≠": 1/2 ... 3/6; &nbsp; 2/5 ... 3/5.<br>Bài 2. Khoanh vào phân số bằng 1/3: 2/6; 3/6; 3/9; 1/6.</p>
  <p><strong>Mức 2 – Thông hiểu</strong><br>Bài 3. Điền số thích hợp: 2/3 = .../9; &nbsp; 4/... = 8/10.<br>Bài 4. Giải thích vì sao 3/4 = 6/8 bằng hai cách.</p>
  <p><strong>Mức 3 – Vận dụng</strong><br>Bài 5. Lan ăn 2/8 cái bánh, Minh ăn 1/4 cái bánh cùng loại. Ai ăn nhiều hơn? Vì sao?<br>Bài 6. ...</p>
  <p><strong>Đáp án &amp; lỗi sai thường gặp:</strong> ... Học sinh hay chỉ nhân tử số mà quên nhân mẫu số. Cách sửa: nhắc quy tắc "nhân cả tử và mẫu với cùng một số khác 0".</p>
  <p class="result-note"><i class="fa-solid fa-circle-check"></i> Bám sát trọng tâm bài, phân mức rõ ràng, số liệu nhẹ cho học sinh yếu, có tình huống thực tế và đáp án. Thầy cô chỉ cần rà soát rồi in.</p>
</div>
<h3>So sánh nhanh</h3>
<div class="table-wrap">
<table>
  <thead><tr><th>Tiêu chí</th><th>Câu lệnh đơn giản</th><th>Câu lệnh 4 phần</th></tr></thead>
  <tbody>
    <tr><td>Bám sát đối tượng học sinh</td><td>Không</td><td>Có (số liệu nhỏ, học sinh yếu)</td></tr>
    <tr><td>Phân mức độ</td><td>Không</td><td>3 mức rõ ràng</td></tr>
    <tr><td>Gắn đời sống</td><td>Không</td><td>Có tình huống chia bánh</td></tr>
    <tr><td>Đáp án, hướng dẫn</td><td>Không</td><td>Có, kèm lỗi sai thường gặp</td></tr>
    <tr><td>Thời gian thầy cô chỉnh sửa</td><td>Nhiều</td><td>Ít, chủ yếu rà soát</td></tr>
  </tbody>
</table>
</div>

<h2>Các lỗi thường gặp khi viết prompt</h2>
<ul>
  <li><strong>Quá ngắn, thiếu bối cảnh:</strong> "Soạn giáo án Văn 8". AI không biết bài nào, bộ sách nào, mấy tiết.</li>
  <li><strong>Gộp quá nhiều việc trong một lần:</strong> vừa giáo án, vừa slide, vừa đề kiểm tra. Hãy chia thành từng bước, làm xong bước này mới sang bước khác.</li>
  <li><strong>Không nói điều cần tránh:</strong> ví dụ "không dùng từ ngữ khó với học sinh lớp 2", "không quá 1 trang A4".</li>
  <li><strong>Bỏ cuộc sau lần đầu:</strong> prompt tốt thường hình thành sau 2–3 lượt hỏi tiếp. Hãy góp ý cho AI như góp ý cho đồng nghiệp.</li>
</ul>

<h2>Mẫu prompt khung để dùng ngay</h2>
<p>Sao chép khung dưới đây, thay nội dung trong [ngoặc vuông] cho phù hợp với bài dạy của thầy cô:</p>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Khung prompt 4 phần</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Bối cảnh: Tôi là giáo viên [môn] lớp [lớp], dạy bộ sách [tên bộ sách]. Học sinh lớp tôi [đặc điểm: học lực, sở thích, điều kiện].
Nhiệm vụ: Hãy [soạn / thiết kế / tóm tắt / nhận xét] [sản phẩm] cho bài "[tên bài]".
Tiêu chí đầu ra: [số lượng], [mức độ], [thời lượng], [yêu cầu cần đạt], tránh [điều không mong muốn].
Định dạng: Trình bày dạng [bảng / danh sách / phiếu in được], độ dài [khoảng ... chữ / 1 trang A4], [có / không] đáp án. Trả lời bằng tiếng Việt.</pre></div>

<h2>Bước tiếp theo</h2>
<p>Khi đã quen công thức 4 phần, thầy cô có thể nâng cấp với các kỹ thuật như cho AI <strong>ví dụ mẫu</strong>, yêu cầu AI <strong>đặt câu hỏi ngược lại</strong> trước khi làm, hoặc <strong>chia nhỏ nhiệm vụ</strong> theo chuỗi. Những kỹ thuật này được thực hành sâu trong khóa <strong>Soạn Kế hoạch Bài dạy (Giáo án) Thông minh Chuẩn Công văn 5512</strong>.</p>
<p>Nếu mới bắt đầu, thầy cô có thể đi theo <a href="post.html?p=lo-trinh-4-tuan-lam-quen-ai">[4.1] Lộ trình 4 tuần làm quen AI</a>: công thức trong bài này chính là nội dung của Tuần 2.</p>
<div class="cta-inline"><div><strong>Thử ngay công thức 4 phần</strong><p>Trợ lý AI Sư phạm có sẵn câu lệnh mẫu, thầy cô chỉ cần sửa phần trong [ngoặc vuông].</p></div><button type="button" class="btn btn-primary" data-open-ai><i class="fa-solid fa-robot"></i> Mở Trợ lý AI</button></div>
`
  },

  // ==========================================================================
  // BÀI 4 — [4.4] AI cho công tác chủ nhiệm & nhận xét học lực
  // ==========================================================================
  {
    slug: 'ai-chu-nhiem-nhan-xet-hoc-luc',
    code: '4.4',
    title: 'Ứng dụng AI tối ưu hóa thời gian chủ nhiệm và nhận xét học lực',
    excerpt: 'Giải pháp giúp thầy cô viết nhận xét học bạ nhanh chóng, chuẩn mực.',
    category: 'thuc_chien',
    format: 'Bài thực chiến kèm bộ mẫu câu lệnh',
    date: '2026-10-18',
    tags: ['Chủ nhiệm', 'Nhận xét học bạ', 'Phụ huynh', 'Bộ mẫu câu lệnh'],
    theme: ['#065F46', '#10B981'],
    courseFilter: 'chu_nhiem',
    art: `
      <g font-family="Plus Jakarta Sans, Be Vietnam Pro, sans-serif">
        <g transform="translate(90 60)">
          <rect width="300" height="330" rx="20" fill="#fff"/>
          <rect x="110" y="-14" width="80" height="30" rx="10" fill="#065F46"/>
          <text x="30" y="58" font-size="22" font-weight="800" fill="#0F172A">Nhận xét học bạ</text>
          <g transform="translate(30 88)"><rect width="24" height="24" rx="6" fill="#D1FAE5"/><path d="M6 12 l5 5 9 -10" stroke="#059669" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="38" y="8" width="150" height="9" rx="4.5" fill="#CBD5E1"/><rect x="200" y="0" width="44" height="24" rx="12" fill="#D1FAE5"/><text x="222" y="17" font-size="13" font-weight="800" fill="#059669" text-anchor="middle">Tốt</text></g>
          <g transform="translate(30 140)"><rect width="24" height="24" rx="6" fill="#D1FAE5"/><path d="M6 12 l5 5 9 -10" stroke="#059669" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="38" y="8" width="130" height="9" rx="4.5" fill="#CBD5E1"/><rect x="200" y="0" width="44" height="24" rx="12" fill="#DBEAFE"/><text x="222" y="17" font-size="13" font-weight="800" fill="#2563EB" text-anchor="middle">Khá</text></g>
          <g transform="translate(30 192)"><rect width="24" height="24" rx="6" fill="#D1FAE5"/><path d="M6 12 l5 5 9 -10" stroke="#059669" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="38" y="8" width="160" height="9" rx="4.5" fill="#CBD5E1"/><rect x="200" y="0" width="44" height="24" rx="12" fill="#D1FAE5"/><text x="222" y="17" font-size="13" font-weight="800" fill="#059669" text-anchor="middle">Tốt</text></g>
          <g transform="translate(30 244)"><rect width="24" height="24" rx="6" fill="#FEF3C7"/><rect x="38" y="8" width="120" height="9" rx="4.5" fill="#CBD5E1"/><rect x="200" y="0" width="44" height="24" rx="12" fill="#FEF3C7"/><text x="222" y="17" font-size="13" font-weight="800" fill="#D97706" text-anchor="middle">Đạt</text></g>
        </g>
        <g transform="translate(450 120)">
          <rect width="270" height="120" rx="22" fill="#fff"/><path d="M40 118 L 30 150 L 72 118 Z" fill="#fff"/>
          <circle cx="44" cy="44" r="20" fill="#10B981"/><path d="M36 44 a8 8 0 0 1 16 0 M44 30 v0" stroke="#fff" stroke-width="3" fill="none"/>
          <text x="76" y="40" font-size="17" font-weight="800" fill="#0F172A">Gửi phụ huynh</text>
          <rect x="76" y="54" width="160" height="8" rx="4" fill="#CBD5E1"/><rect x="24" y="80" width="220" height="8" rx="4" fill="#E2E8F0"/><rect x="24" y="96" width="150" height="8" rx="4" fill="#E2E8F0"/>
        </g>
        <g transform="translate(560 300)"><circle r="48" fill="#F59E0B"/><path d="M0 -26 V 0 L 18 12" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
        <text x="560" y="385" font-size="20" font-weight="800" fill="#fff" text-anchor="middle">Tiết kiệm thời gian</text>
      </g>`,
    content: `
<p class="lead">Cuối mỗi kỳ, giáo viên chủ nhiệm phải tổng hợp điểm, viết hàng chục lời nhận xét không trùng lặp, liên lạc với phụ huynh và lập kế hoạch cho kỳ sau. Bài viết này chia sẻ <strong>bộ mẫu câu lệnh thực chiến</strong> giúp thầy cô làm những việc đó nhanh hơn mà vẫn <strong>chuẩn mực, cá nhân hóa</strong> và <strong>an toàn dữ liệu học sinh</strong>.</p>

<h2>Nguyên tắc vàng: bảo vệ dữ liệu học sinh</h2>
<div class="callout warn"><i class="fa-solid fa-user-shield"></i><div><strong>Trước khi dùng bất kỳ mẫu nào dưới đây:</strong> thay họ tên học sinh bằng <strong>mã số (HS01, HS02...)</strong>; không nhập ngày sinh, số điện thoại, địa chỉ, hoàn cảnh gia đình. Giữ bảng đối chiếu "mã ↔ họ tên" trên máy của thầy cô, sau khi AI viết xong mới ghép lại tên thật.</div></div>
<ul>
  <li><strong>AI soạn nháp, giáo viên quyết định:</strong> lời nhận xét trong học bạ là văn bản chính thức, thầy cô phải đọc lại từng lời trước khi ghi.</li>
  <li><strong>Mô tả bằng dữ kiện thật:</strong> AI chỉ viết tốt khi thầy cô cung cấp quan sát cụ thể (tiến bộ ở đâu, cần cố gắng gì). Không có dữ kiện, AI sẽ viết chung chung giống nhau.</li>
  <li><strong>Bám đúng quy định đánh giá:</strong> Tiểu học theo Thông tư 27/2020/TT-BGDĐT; THCS, THPT theo Thông tư 22/2021/TT-BGDĐT. Hãy dán tiêu chí, mức đánh giá trường đang áp dụng vào câu lệnh để AI không tự suy diễn.</li>
</ul>

<h2>Mẫu 1: Tổng hợp và phân tích điểm số</h2>
<p>AI rất giỏi <strong>phân tích, nhận xét xu hướng</strong> nhưng có thể <strong>tính toán sai</strong> khi bảng điểm dài. Cách làm an toàn: dùng Excel để tính, dùng AI để <em>viết công thức</em> và <em>phân tích kết quả</em>.</p>
<h3>1a. Nhờ AI viết công thức Excel</h3>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 1a – Công thức Excel</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Tôi có bảng điểm Excel: cột A là mã học sinh, cột B đến cột F là điểm các bài kiểm tra thường xuyên, cột G là điểm giữa kì, cột H là điểm cuối kì. Dữ liệu từ dòng 2 đến dòng 41.
Hãy viết công thức Excel để:
1) Tính điểm trung bình môn ở cột I theo cách: [dán quy định cách tính điểm trung bình trường đang áp dụng].
2) Ở cột J, ghi mức đánh giá theo ngưỡng: [dán ngưỡng các mức].
3) Đếm số học sinh ở mỗi mức.
Giải thích từng công thức ngắn gọn, từng bước cho người mới dùng Excel.</pre></div>
<h3>1b. Phân tích kết quả học tập của lớp</h3>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 1b – Phân tích kết quả</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Tôi là giáo viên chủ nhiệm lớp [lớp]. Dưới đây là bảng tổng hợp kết quả học kì [I/II] (đã ẩn tên, chỉ có mã học sinh):
[dán bảng: mã HS | điểm TB các môn | mức đánh giá]
Hãy phân tích:
1) Tỉ lệ học sinh ở từng mức và so sánh với học kì trước: [dán số liệu kì trước nếu có].
2) Các môn lớp mạnh, các môn cần cải thiện.
3) Nhóm học sinh cần quan tâm đặc biệt (liệt kê theo mã) và lý do.
4) Đề xuất 3–5 giải pháp cụ thể cho học kì tới.
Trình bày bằng bảng và gạch đầu dòng, dùng được cho báo cáo sơ kết.</pre></div>

<h2>Mẫu 2: Viết nhận xét định tính cá nhân hóa</h2>
<p>Đây là việc tốn thời gian nhất. Bí quyết là cung cấp cho AI <strong>2–3 quan sát thật</strong> về mỗi học sinh, AI sẽ chuyển thành lời nhận xét trọn vẹn, tích cực, không trùng lặp.</p>
<h3>2a. Nhận xét từng học sinh</h3>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 2a – Nhận xét 1 học sinh</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Tôi là giáo viên [chủ nhiệm / bộ môn ...] lớp [lớp]. Hãy viết lời nhận xét [môn học / phẩm chất – năng lực / rèn luyện] cuối học kì cho học sinh HS07 dựa trên quan sát:
- Điểm mạnh: [ví dụ: tích cực phát biểu, trình bày vở sạch đẹp]
- Tiến bộ: [ví dụ: kỹ năng đọc hiểu tiến bộ rõ so với giữa kì]
- Cần cố gắng: [ví dụ: còn chậm khi làm bài tính, chưa mạnh dạn hỏi bài]
Yêu cầu: theo tinh thần đánh giá vì sự tiến bộ của [Thông tư 27/2020 / Thông tư 22/2021]; khen trước, góp ý sau, góp ý nhẹ nhàng, cụ thể, có hướng khắc phục; tối đa [40] chữ; không dùng từ ngữ tiêu cực, không so sánh với bạn khác.
Viết 3 phương án để tôi chọn.</pre></div>
<h3>2b. Nhận xét cả lớp trong một lần</h3>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 2b – Nhận xét hàng loạt</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Dưới đây là bảng quan sát học sinh lớp [lớp] (đã ẩn tên):
| Mã HS | Mức đánh giá | Điểm mạnh | Cần cố gắng |
[dán khoảng 10–15 học sinh mỗi lần]
Hãy viết lời nhận xét cho từng học sinh, mỗi lời tối đa [40] chữ, khen trước góp ý sau, giọng văn ấm áp, chuẩn mực.
Yêu cầu quan trọng: các lời nhận xét KHÔNG được lặp lại cùng một câu mở đầu, dùng từ ngữ đa dạng.
Trả kết quả dạng bảng 2 cột: Mã HS | Lời nhận xét, để tôi dán thẳng vào Excel.</pre></div>
<div class="callout tip"><i class="fa-solid fa-lightbulb"></i><div>Mỗi lần chỉ gửi <strong>10–15 học sinh</strong> để AI không bị "đuối" ở cuối danh sách. Sau khi có bảng, dán vào Excel cạnh cột mã và dùng hàm dò tìm (VLOOKUP/XLOOKUP) để ghép với họ tên thật.</div></div>

<h2>Mẫu 3: Thông báo phối hợp với phụ huynh</h2>
<h3>3a. Tin nhắn Zalo trao đổi riêng với phụ huynh</h3>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 3a – Tin nhắn phụ huynh</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Tôi là giáo viên chủ nhiệm lớp [lớp]. Hãy viết tin nhắn Zalo gửi riêng phụ huynh của một học sinh để trao đổi về tình hình: [mô tả ngắn: ví dụ gần đây hay quên làm bài tập về nhà, điểm kiểm tra môn ... giảm].
Yêu cầu: mở đầu bằng điểm tích cực của con; nêu vấn đề khách quan, không phán xét; đề xuất 2 cách phối hợp cụ thể tại nhà; mời phụ huynh trao đổi thêm; giọng văn tôn trọng, chân thành; dưới 120 chữ.</pre></div>
<h3>3b. Thông báo chung cho nhóm phụ huynh cả lớp</h3>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 3b – Thông báo chung</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Viết thông báo gửi nhóm Zalo phụ huynh lớp [lớp] về [nội dung: lịch kiểm tra cuối kì / kết quả học kì / kế hoạch tham quan / nhắc nhở an toàn ngày nghỉ].
Thông tin cần có: [thời gian, địa điểm, việc phụ huynh cần làm, hạn phản hồi].
Trình bày: tiêu đề in hoa ngắn, các ý chính gạch đầu dòng, có lời cảm ơn cuối, dưới 150 chữ, có thể dùng 1–2 biểu tượng cảm xúc phù hợp.</pre></div>
<h3>3c. Nội dung họp phụ huynh cuối kì</h3>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 3c – Kịch bản họp phụ huynh</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Dựa trên phần phân tích kết quả học tập của lớp ở trên, hãy soạn nội dung buổi họp phụ huynh cuối học kì [I/II] lớp [lớp], thời lượng [60] phút, gồm: chương trình họp có phân bổ thời gian; tóm tắt tình hình học tập – rèn luyện (chỉ nêu số liệu chung, không nêu tên học sinh yếu); khen ngợi tập thể; kế hoạch học kì tới; các nội dung cần phụ huynh phối hợp; gợi ý 3 câu hỏi phụ huynh hay hỏi kèm cách trả lời.</pre></div>

<h2>Mẫu 4: Kế hoạch chủ nhiệm và sinh hoạt lớp</h2>
<div class="prompt-box"><div class="prompt-head"><span><i class="fa-solid fa-terminal"></i> Mẫu 4 – Tiết sinh hoạt lớp</span><button type="button" class="prompt-copy" data-copy><i class="fa-regular fa-copy"></i> Sao chép</button></div><pre>Tôi chủ nhiệm lớp [lớp], lớp có đặc điểm: [ví dụ: sôi nổi nhưng hay mất trật tự, nề nếp chưa đều]. Hãy thiết kế kế hoạch tiết sinh hoạt lớp tuần [số tuần] với chủ đề [chủ đề, ví dụ: "Tình bạn và sự tôn trọng"], gồm: sơ kết tuần (khung nhận xét để cán sự lớp tự báo cáo), 1 hoạt động trải nghiệm 15 phút, phương hướng tuần tới. Trình bày dạng bảng: Thời gian | Hoạt động | Người phụ trách | Chuẩn bị.</pre></div>

<h2>Quy trình 30 phút hoàn thành nhận xét cả lớp</h2>
<ol class="steps">
  <li><strong>5 phút – Chuẩn bị dữ liệu:</strong> tạo bảng Excel gồm mã HS, mức đánh giá, 1 dòng điểm mạnh, 1 dòng cần cố gắng (ghi nhanh từ sổ theo dõi).</li>
  <li><strong>10 phút – Chạy Mẫu 2b</strong> theo từng nhóm 10–15 học sinh.</li>
  <li><strong>10 phút – Rà soát:</strong> đọc từng lời nhận xét, sửa chỗ chưa đúng thực tế, kiểm tra không trùng lặp, đúng mức đánh giá.</li>
  <li><strong>5 phút – Ghép tên và nhập hệ thống:</strong> dùng hàm dò tìm ghép mã với họ tên, sao chép vào phần mềm quản lý hoặc học bạ điện tử.</li>
</ol>
<div class="callout note"><i class="fa-solid fa-circle-info"></i><div>Thời gian thực tế phụ thuộc sĩ số và mức độ quen tay. Lần đầu có thể lâu hơn, nhưng từ lần thứ hai trở đi thầy cô chỉ cần thay dữ liệu vào câu lệnh đã có.</div></div>

<h2>Học sâu hơn cùng EduAI</h2>
<p>Các mẫu trên là phiên bản rút gọn. Trong khóa <strong>Ứng dụng AI trong Công tác Chủ nhiệm, Sổ sách &amp; Nhận xét Học sinh</strong>, thầy cô được thực hành trọn bộ câu lệnh theo từng cấp học, nhận xét học bạ theo Thông tư 22/27, kế hoạch chủ nhiệm cả năm và kỹ năng kết nối phụ huynh, có giảng viên hỗ trợ trực tiếp.</p>
<p>Ngoài ra, nút <strong>"Nhận xét học bạ"</strong> trong Trợ lý AI Sư phạm (nút robot góc phải) có sẵn câu lệnh mẫu để thử ngay.</p>
<div class="cta-inline"><div><strong>Khóa học Chủ nhiệm &amp; Nhận xét Học sinh</strong><p>Học phí ưu đãi 349.000đ, học Online qua Zoom, xem lại video trọn đời.</p></div><a class="btn btn-primary" href="index.html?loc=chu_nhiem#courses"><i class="fa-solid fa-user-pen"></i> Xem khóa học</a></div>
`
  }
];
