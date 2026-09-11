# 📘 BẢN ĐẶC TẢ YÊU CẦU SẢN PHẨM (PRODUCT REQUIREMENTS DOCUMENT - PRD)
**Dự án:** Web-GVCN (Hệ thống Số hóa Công tác Giáo viên Chủ nhiệm)  
**Phiên bản:** 2.0 (Chuyển đổi từ Prototype Single-Page sang Hệ sinh thái Web Cloud-Native)  
**Tác giả:** AI Lead Engineer & Product Architect  
**Ngày ban hành:** 11/09/2026  
**Trạng thái:** DỰ THẢO KIẾN TRÚC – CHỜ CHỦ DỰ ÁN DUYỆT

---

## 1. TỔNG QUAN SẢN PHẨM & TẦM NHÌN (PRODUCT OVERVIEW & VISION)

### 1.1. Bối cảnh & Nỗi đau của Giáo viên Chủ nhiệm (Pain Points)
Công tác chủ nhiệm lớp tại các trường phổ thông Việt Nam (đặc biệt là THCS và THPT) đang chịu áp lực rất lớn về sổ sách, thống kê và quản lý kỷ luật học sinh:
1. **Sổ sách phân tán, thủ công:** Giáo viên phải ghi chép sổ chủ nhiệm, sổ điểm danh, sổ theo dõi nề nếp, phiếu báo giảng trên giấy hoặc nhiều file Excel rời rạc.
2. **Thiếu tính minh bạch và tức thời trong thi đua:** Điểm thi đua giữa các tổ thường bị tranh cãi vì thiếu sổ cái ghi nhận chi tiết thời gian và lý do cụ thể.
3. **Nguy cơ rò rỉ dữ liệu cá nhân học sinh:** Việc lưu trữ hồ sơ học sinh cá biệt, hoàn cảnh khó khăn hoặc vi phạm kỷ luật trên máy tính chung ở lớp rất dễ bị lộ lọt, gây tổn thương tâm lý cho các em.
4. **Kênh liên lạc với Phụ huynh thiếu đồng bộ:** Phụ huynh khó nắm bắt kịp thời nỗ lực tiến bộ hoặc vi phạm của con mình trong ngày.
5. **Nguyên mẫu hiện tại (`index.html`):** Dù có giao diện sinh động và ý tưởng xuất sắc, nhưng do lưu trữ trong `localStorage` trên một trình duyệt duy nhất, có mật khẩu cố định (hard-coded) và số liệu giả (`Math.sin`), ứng dụng **hoàn toàn chưa thể sử dụng với dữ liệu thật**.

### 1.2. Tầm nhìn sản phẩm (Product Vision)
Xây dựng **Web-GVCN** thành một **"Trợ lý số toàn năng"** của Giáo viên Chủ nhiệm:
- **Đồng bộ đa thiết bị:** Giáo viên thao tác mượt mà trên máy tính để bàn ở trường, laptop ở nhà và điện thoại di động khi đang đứng lớp.
- **Dữ liệu thật 100%:** Xóa bỏ hoàn toàn số liệu giả mạo; mọi biểu đồ, thứ hạng đều được tính toán từ sổ cái giao dịch thật.
- **Bảo mật chuẩn giáo dục:** Phân quyền theo vai trò (RBAC), kiểm soát truy cập mức hàng (Row Level Security - RLS) bảo vệ tuyệt đối thông tin học sinh và "Trạm đồng hành".
- **Lấy học sinh làm trung tâm:** Phát huy vai trò tự quản của Ban cán sự lớp, khích lệ sự tiến bộ qua hệ thống tích sao đổi quà, xây dựng lớp học hạnh phúc.

---

## 2. CHÂN DUNG NGƯỜI DÙNG & VAI TRÒ (USER PERSONAS & ROLES)

| Vai trò | Người dùng đại diện | Mục tiêu chính | Nỗi lo lớn nhất | Môi trường sử dụng |
|:---|:---|:---|:---|:---|
| **GVCN** *(Giáo viên chủ nhiệm)* | Thầy/Cô chủ nhiệm lớp | Quản lý toàn diện lớp học, tiết kiệm thời gian sổ sách, động viên học sinh tiến bộ. | Mất dữ liệu, lộ hồ sơ học sinh nhạy cảm, số liệu thi đua thiếu chính xác. | Laptop cá nhân, điện thoại thông minh, máy tính phòng giáo viên. |
| **BCS** *(Ban cán sự lớp)* | Lớp trưởng, Lớp phó, Tổ trưởng | Điểm danh nhanh, chấm điểm thi đua tổ, hỗ trợ thầy cô quản lý nề nếp. | Bị nghi ngờ thiếu công bằng, bị bạn bè phản ứng tiêu cực nếu chỉ "săm soi bắt lỗi". | Điện thoại di động, máy tính bảng của lớp. |
| **BGH** *(Ban giám hiệu)* | Hiệu trưởng, Phó Hiệu trưởng | Giám sát tình hình nền nếp chung, theo dõi chuyên cần, duyệt kế hoạch tuần. | Dữ liệu báo cáo chậm trễ, không đồng nhất giữa các lớp. | Máy tính văn phòng, tablet. |
| **Học sinh** | Học sinh trong lớp | Theo dõi điểm tích lũy của mình, đổi quà tặng, xem thời khóa biểu và sơ đồ lớp. | Bị so sánh điểm công khai gây áp lực, lộ thông tin cá nhân. | Điện thoại của phụ huynh, máy tính gia đình. |
| **Phụ huynh** | Cha mẹ / Người giám hộ | Nắm bắt nề nếp, chuyên cần và sự tiến bộ của con để phối hợp giáo dục cùng nhà trường. | Quy trình đăng nhập phức tạp, lộ thông tin gia đình. | Điện thoại thông minh (giao diện di động tối ưu). |
| **Quản trị viên** *(System Admin)* | Đội ngũ kỹ thuật | Vận hành hệ thống, quản lý sao lưu, giám sát an toàn thông tin và tài nguyên cloud. | Hệ thống bị tấn công mạng, vượt quyền truy cập cơ sở dữ liệu. | Bàn điều khiển quản trị (Supabase Dashboard, Vercel). |

---

## 3. MỤC TIÊU ĐO LƯỜNG ĐƯỢC (MEASURABLE OKRs & KPIs)

### 3.1. Mục tiêu Nghiệp vụ (Business OKRs)
- **OKR 1 (Tiết kiệm thời gian):** Giảm **70%** thời gian làm báo cáo tuần và điểm danh hàng ngày của GVCN (điểm danh toàn bộ 40 học sinh hoàn tất dưới **45 giây**).
- **OKR 2 (Tính trung thực 100%):** Loại bỏ hoàn toàn 100% số liệu giả mạo; 100% chỉ số tiến bộ, xếp hạng tổ được truy xuất từ cơ sở dữ liệu giao dịch thật.
- **OKR 3 (Bảo vệ quyền riêng tư):** Đạt **0%** sự cố rò rỉ dữ liệu nhạy cảm của học sinh diện cá biệt (Trạm đồng hành).

### 3.2. Chỉ số Kỹ thuật & Hiệu năng (Technical KPIs)
- **First Contentful Paint (FCP):** < 1.2 giây trên mạng 4G thông thường.
- **Time to Interactive (TTI):** < 2.0 giây.
- **Lighthouse Score:** Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- **Độ sẵn sàng (Uptime):** 99.9% trên hạ tầng Vercel Edge + Supabase Cloud.
- **RPO (Recovery Point Objective):** < 1 giờ (dữ liệu phục hồi không mất quá 1 giờ).
- **RTO (Recovery Time Objective):** < 15 phút khi cần hoàn tác phiên bản triển khai.

---

## 4. PHÂN ĐỊNH PHẠM VI TÍNH NĂNG (FEATURE SCOPE)

### 4.1. Phạm vi MVP (Phase 1 - Sản phẩm Khả dụng Tối thiểu)
*Mục tiêu: Đưa vào sử dụng thật ngay cho một lớp học của GVCN, hoạt động tin cậy trên máy tính và điện thoại.*

1. **Xác thực & Phân quyền thật (Real Auth & RBAC):**
   - Đăng nhập bằng Email/Password qua Supabase Auth cho GVCN và BGH.
   - Tài khoản phân quyền cho Ban cán sự lớp (chỉ thao tác trong quyền hạn được GVCN cấu hình).
   - Đăng xuất an toàn, tự động hết hạn phiên, bảo vệ toàn diện bằng PostgreSQL Row Level Security.
2. **Quản lý Hồ sơ Học sinh:**
   - Danh sách học sinh đầy đủ: Họ tên, Giới tính, Ngày sinh, Tổ, Chức vụ, Năng khiếu, Mục tiêu.
   - Upload ảnh đại diện lưu trực tiếp trên Supabase Storage (thay vì Base64 trong localStorage).
   - Nhập danh sách tự động từ Excel (tương thích các file mẫu có sẵn trong dự án).
3. **Sổ cái Điểm thi đua Minh bạch (Point Ledger - Append-Only):**
   - Chấm điểm cộng/trừ theo 40 tiêu chí chuẩn nề nếp.
   - Cơ chế ghi sổ cái bất biến: Không bao giờ sửa đè số điểm; mọi điều chỉnh/hoàn tác phải sinh giao dịch đảo.
   - Tự động cộng dồn điểm tổ và xếp hạng thi đua thực tế.
4. **Điểm danh Chuyên cần Thông minh:**
   - Điểm danh nhanh theo ngày với 4 trạng thái: Có mặt, Đi học trễ, Vắng có phép, Vắng không phép.
   - Ghi nhận chính xác người điểm danh và thời gian điểm danh.
5. **Sơ đồ Lớp học Trực quan:**
   - Hiển thị bản đồ lớp học chuẩn (Bàn GV, Bảng từ, Cửa ra vào).
   - Kéo thả đổi chỗ học sinh, tự động xếp ngẫu nhiên chỗ ngồi cho các bạn chưa có chỗ.
   - Sửa lỗi nút "Thu hồi" (`clearAllSeats`) hoạt động chuẩn xác.
6. **Bảo mật Trạm Đồng Hành:**
   - Hồ sơ học sinh cá biệt được bảo vệ bởi chính sách RLS khắt khe: **Chỉ GVCN lớp đó mới có quyền truy cập**.
   - Ban cán sự, học sinh và phụ huynh tuyệt đối không thể đọc dữ liệu này qua bất kỳ API nào.
7. **Công cụ Trợ giảng Trực tiếp:**
   - Đồng hồ đếm ngược có chuông báo (sửa triệt để các hàm bị trùng và thiếu).
   - Vòng quay gọi tên ngẫu nhiên phục vụ kiểm tra bài cũ và hoạt động lớp.
8. **Báo cáo & Xuất dữ liệu:**
   - Thống kê tuần/tháng dựa trên dữ liệu thật.
   - Xuất báo cáo PDF chuẩn, xuất dữ liệu ra Excel.

### 4.2. Giai đoạn sau (Phase 2 & Phase 3 - Backlog)
1. **Cổng Phụ huynh bảo mật cấp cao (Phase 2):** Xác thực phụ huynh bằng mã mời OTP hoặc số điện thoại, liên kết 1-1 với hồ sơ học sinh, chống hoàn toàn nguy cơ quét mã brute-force.
2. **Hệ sinh thái Quà tặng & Tích sao (Phase 2):** Đổi sao lấy phần thưởng, phê duyệt đổi quà, lịch sử trừ sao.
3. **Lịch báo giảng nâng cao (Phase 2):** Trích xuất tự động lịch báo giảng từ phân phối chương trình, đồng bộ thời khóa biểu.
4. **Hỗ trợ Đa lớp & Đa trường (Multi-class / Multi-school - Phase 3):** Mở rộng kiến trúc cho phép một giáo viên quản lý nhiều lớp dạy bộ môn, nhà trường quản lý toàn bộ các khối lớp.
5. **Trợ lý AI Giáo viên Chủ nhiệm (Phase 3):** AI gợi ý nhận xét học bạ định kỳ, AI phát hiện sớm dấu hiệu sa sút của học sinh để giáo viên kịp thời can thiệp.

### 4.3. Ngoài phạm vi sản phẩm (Out of Scope)
- Không xây dựng hệ thống kế toán thu chi học phí chuyên sâu (chỉ ghi nhận quỹ lớp đơn giản).
- Không làm hệ thống thi trắc nghiệm trực tuyến hoặc chấm bài tập lớn phức tạp (tránh biến Web-GVCN thành LMS nặng nề làm mất đi tính nhanh gọn của công tác chủ nhiệm).

---

## 5. QUY TẮC NGHIỆP VỤ BẮT BUỘC (CORE BUSINESS RULES)

### 5.1. Quy tắc Sổ cái Điểm thi đua (Point Ledger Invariants)
- **Quy tắc BR-01 (Append-Only):** Mọi thao tác cộng điểm, trừ điểm đều được lưu thành một dòng riêng biệt trong bảng `point_transactions`. Không bao giờ thực hiện câu lệnh `UPDATE` lên trường số điểm tích lũy cũ.
- **Quy tắc BR-02 (Hoàn tác minh bạch - Reversal):** Khi giáo viên hoặc cán sự bấm "Xóa" một lần chấm điểm sai, hệ thống sẽ tạo một bản ghi đối ứng có số điểm đảo ngược (dấu ngược lại), kèm mã tham chiếu `reversed_transaction_id` và lý do hoàn tác.
- **Quy tắc BR-03 (Toàn vẹn số dư):** Điểm hiện tại của học sinh hoặc tổ tại bất kỳ thời điểm nào luôn bằng:  
  $$\text{Tổng điểm} = \sum \text{Giao dịch điểm hợp lệ}$$
- **Quy tắc BR-04 (Phân định người thao tác - Actor):** Mỗi giao dịch điểm phải ghi rõ ai là người thực hiện (`created_by`) và vai trò lúc đó (GVCN hay BCS).

### 5.2. Quy tắc Điểm danh Chuyên cần (Attendance Rules)
- **Quy tắc BR-05 (Một phiên mỗi buổi):** Mỗi lớp chỉ có tối đa một phiên điểm danh chính thức cho mỗi buổi học (Sáng / Chiều) trong một ngày.
- **Quy tắc BR-06 (Thời hạn khóa sổ):** Ban cán sự chỉ được phép sửa điểm danh trong ngày. Sau khi ngày học kết thúc hoặc sau khi GVCN duyệt, chỉ có GVCN mới có quyền điều chỉnh trạng thái điểm danh.

### 5.3. Quy tắc Bảo mật Trạm Đồng Hành (Companion Privacy Rules)
- **Quy tắc BR-07 (Tối mật):** Mọi thông tin về lý do đưa vào trạm (`issue`), biện pháp can thiệp (`measures`) và nhật ký tiến trình (`logs`) là thông tin bảo mật cấp cao.
- **Quy tắc BR-08 (Không hiển thị cho Ban cán sự):** Bảng điều khiển của Ban cán sự lớp hoàn toàn không có đường dẫn (route) và không nhận được bất kỳ payload JSON nào liên quan đến Trạm đồng hành.
- **Quy tắc BR-09 (Chỉ định rõ ràng):** Chỉ có GVCN trực tiếp quản lý lớp mới có quyền tạo, sửa, kết thúc hồ sơ đồng hành.

---

## 6. TIÊU CHÍ NGHIỆM THU QUAN SÁT ĐƯỢC (OBSERVABLE ACCEPTANCE CRITERIA)

Mọi tính năng khi hoàn thành đều phải được kiểm chứng qua các kịch bản kiểm thử hành vi (Behavioral Driven Development - Given/When/Then):

### Kịch bản 1: Đăng nhập an toàn & Phân quyền đúng
- **Given:** Người dùng truy cập vào trang web trên thiết bị mới.
- **When:** Người dùng chưa thực hiện đăng nhập.
- **Then:** Hệ thống **bắt buộc** hiển thị màn hình đăng nhập; không tải ngầm bất kỳ dữ liệu học sinh nào về trình duyệt; việc can thiệp vào biến JavaScript trên Console không thể mở khóa giao diện quản trị.

### Kịch bản 2: Ghi nhận điểm thi đua không thể bị gian lận
- **Given:** Học sinh Nguyễn Văn A đang có 50 điểm.
- **When:** Lớp phó học tập chấm +5 điểm vì "Phát biểu xây dựng bài".
- **Then:** Bảng điều khiển cập nhật điểm học sinh thành 55 điểm; một bản ghi giao dịch mới xuất hiện trong lịch sử điểm với người thực hiện là "Phó Học tập"; điểm của Tổ tương ứng được cộng thêm 5 điểm ngay lập tức trên máy tính của GVCN.

### Kịch bản 3: Hoàn tác điểm sai bằng giao dịch đảo
- **Given:** Một bản ghi trừ 10 điểm bị ghi nhầm cho học sinh B.
- **When:** GVCN bấm nút "Hoàn tác" bản ghi đó.
- **Then:** Hệ thống không xóa dòng lịch sử cũ, mà tạo thêm một dòng mới ghi nhận: "+10 điểm (Hoàn tác giao dịch #1234)"; tổng điểm của học sinh B được hồi lại chính xác; lịch sử kiểm toán lưu vết đầy đủ cả 2 sự kiện.

### Kịch bản 4: Bảo mật tuyệt đối Trạm Đồng Hành
- **Given:** Tài khoản Ban cán sự lớp đăng nhập vào hệ thống.
- **When:** Cán sự mở tab Network trong F12 Console hoặc cố tình gửi request đến endpoint `/rest/v1/companion_cases`.
- **Then:** Supabase PostgreSQL trả về mã lỗi `403 Forbidden` hoặc trả về mảng rỗng `[]` do chính sách RLS chặn đứng; giao diện của cán sự hoàn toàn không có menu Trạm đồng hành.

---
*Bản đặc tả yêu cầu sản phẩm này là cơ sở ký kết kỹ thuật giữa Chủ dự án và AI Lead Engineer trước khi thiết kế Kiến trúc Dữ liệu & Phân quyền tại `docs/02-rbac-and-user-flows.md`.*
