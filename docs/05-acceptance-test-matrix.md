# 🧪 MA TRẬN KIỂM THỬ NGHIỆM THU TOÀN DIỆN (ACCEPTANCE TEST MATRIX)
**Dự án:** Web-GVCN (Hệ thống Quản lý Lớp học dành cho Giáo viên Chủ nhiệm)  
**Tiêu chuẩn kiểm thử:** Vitest (Unit/Integration), Playwright (E2E), OWASP Top 10 (Security Audit)  
**Tác giả:** AI Lead Engineer & Product Architect  
**Ngày ban hành:** 11/09/2026  
**Trạng thái:** DỰ THẢO KIẾN TRÚC – CHỜ CHỦ DỰ ÁN DUYỆT

---

## 1. NGUYÊN TẮC NGHIỆM THU (TESTING GOVERNANCE)

Theo cam kết kỹ thuật của dự án Web-GVCN:
1. **Không khẳng định "an toàn", "hoàn thành" hoặc "production-ready" nếu chưa có bằng chứng kiểm thử đạt 100%.**
2. Mọi tính năng cốt lõi bắt buộc phải có bài kiểm thử tự động (Automated Tests) kết hợp kiểm thử hành vi thực tế trên máy tính và điện thoại.
3. Bài kiểm thử thất bại (Failed test) ở mức **Critical** hoặc **High** sẽ tự động khóa quy trình triển khai (Block Deployment).

---

## 2. MA TRẬN KIỂM THỬ THEO VAI TRÒ (ROLE-BASED TEST MATRIX)

| Mã test | Vai trò | Hành động thực hiện | Kết quả mong đợi (Expected Result) | Mức độ ưu tiên | Trạng thái |
|:---:|:---:|:---|:---|:---:|:---:|
| `TC-ROLE-01` | **GVCN** | Đăng nhập tài khoản chính chủ | Vào đúng Dashboard toàn quyền; hiển thị đầy đủ menu và dữ liệu học sinh | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-02` | **GVCN** | Mở phân hệ "Trạm Đồng Hành" | Xem được toàn bộ danh sách học sinh cá biệt và biện pháp can thiệp | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-03` | **GVCN** | Nhập danh sách học sinh từ file Excel | Thêm mới 40 học sinh vào DB, tự động chia tổ và gán ảnh mặc định thành công | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-04` | **BCS** | Đăng nhập tài khoản Ban cán sự | Chỉ thấy các menu được phân công: Điểm danh, Chấm điểm, Sơ đồ, Trợ giảng | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-05` | **BCS** | Cố tình truy cập route `/tram-dong-hanh` | Bị Route Guard chặn lại, điều hướng về trang chủ và hiện thông báo từ chối quyền | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-06` | **BCS** | Bấm xóa hồ sơ học sinh hoặc sửa cài đặt lớp | Không hiển thị nút xóa/sửa trên UI; nếu gọi API ngầm thì DB trả về `403 Forbidden` | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-07` | **BCS** | Điểm danh buổi sáng trong ngày | Lưu thành công vào cơ sở dữ liệu; hiển thị người điểm danh là "Ban cán sự" | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-08` | **BGH** | Xem báo cáo chuyên cần và sổ theo dõi | Xem được biểu đồ và danh sách thống kê; toàn bộ nút sửa/xóa/cộng điểm bị ẩn | P1 (Quan trọng) | Sẵn sàng test |
| `TC-ROLE-09` | **Phụ huynh** | Nhập Mã học sinh + Mã PIN tra cứu | Chỉ hiển thị hồ sơ, điểm nỗ lực và chuyên cần của đúng người con được liên kết | P0 (Bắt buộc) | Sẵn sàng test |
| `TC-ROLE-10` | **Khách lạ** | Mở trình duyệt ẩn danh vào hệ thống | Không xem được bất kỳ thông tin nào ngoài màn hình đăng nhập | P0 (Bắt buộc) | Sẵn sàng test |

---

## 3. BỘ KIỂM THỬ BẢO MẬT & AN TOÀN DỮ LIỆU (SECURITY TEST SUITE)

| Mã test | Loại tấn công / Kiểm tra | Kịch bản kiểm thử (Test Scenario) | Tiêu chí vượt qua (Pass Criteria) |
|:---:|:---|:---|:---|
| `SEC-01` | **Vượt quyền mức API (RLS Bypass)** | Sử dụng Token của Ban Cán Sự để gửi request `GET /rest/v1/companion_cases` trực tiếp lên Supabase PostgREST | PostgreSQL kích hoạt chính sách RLS, trả về mảng rỗng `[]` hoặc lỗi `403 Forbidden`. Không để lộ 1 byte dữ liệu nhạy cảm nào. |
| `SEC-02` | **Chèn mã độc (XSS Injection)** | Nhập tên học sinh: `<script>alert('XSS')</script>` hoặc `<img src=x onerror=alert(1)>` qua form hoặc file Excel | React tự động escape ký tự; chuỗi hiển thị nguyên văn dưới dạng text thuần, không có popup alert nào xuất hiện. |
| `SEC-03` | **Chèn mã độc SQL (SQL Injection)** | Nhập vào ô tìm kiếm: `' OR '1'='1` hoặc `'; DROP TABLE students; --` | Supabase SDK tham số hóa truy vấn an toàn; hệ thống coi chuỗi tìm kiếm là literal text, không có lỗi DB và không rò rỉ dữ liệu. |
| `SEC-04` | **Dò quét mã PIN phụ huynh (Brute-Force)** | Dùng script gửi liên tục 20 mã PIN sai trong vòng 10 giây | Hệ thống khóa IP/phiên sau 5 lần thử sai liên tiếp, yêu cầu chờ 15 phút mới được thử lại. |
| `SEC-05` | **Rò rỉ Service Role Key** | Quét toàn bộ mã nguồn frontend, git commit history và network tab trong trình duyệt | **0 phát hiện**: Không có bất kỳ dấu vết nào của `SUPABASE_SERVICE_ROLE_KEY` trong bundle phía client. |
| `SEC-06` | **Truy cập tệp riêng tư (Storage Access)** | Copy URL ảnh trong bucket `companion_attachments` và mở bằng trình duyệt ẩn danh không đăng nhập | Trả về lỗi `403 Access Denied` do bucket được thiết lập Private và yêu cầu Presigned URL có chữ ký số. |

---

## 4. BỘ KIỂM THỬ TÍNH TOÀN VẸN DỮ LIỆU (DATA INTEGRITY SUITE)

| Mã test | Hạng mục kiểm tra | Điều kiện ban đầu & Thao tác | Tiêu chí toàn vẹn (Integrity Assertion) |
|:---:|:---|:---|:---|
| `INT-01` | **Sổ cái điểm bất biến (Append-Only)** | Thực hiện cộng 10 điểm cho học sinh A, sau đó bấm hoàn tác giao dịch này | Bảng `point_transactions` có đúng 2 bản ghi: +10đ và -10đ (trỏ `reversal_of_id`). Tổng điểm học sinh trở về chính xác số điểm ban đầu. Không có bản ghi nào bị xóa (`DELETE`). |
| `INT-02` | **Khử hoàn toàn số liệu giả (`Math.sin`)** | Kiểm tra biểu đồ tiến bộ tuần và bảng xếp hạng tổ thi đua tại trang chủ | 100% số liệu hiển thị phải khớp chính xác với kết quả câu lệnh SQL `SUM(points)` của các giao dịch trong tuần đó. Khi chưa có điểm, hiển thị trạng thái rỗng (0 điểm). |
| `INT-03` | **Khóa sổ Điểm danh chống trùng lặp** | Thao tác điểm danh lớp 6A6 buổi Sáng ngày 15/09/2026 lần thứ 2 | Hệ thống nhận diện phiên điểm danh đã tồn tại; cho phép cập nhật trạng thái học sinh vắng trong phiên cũ, không tạo thêm phiên trùng lặp. |
| `INT-04` | **Tính duy nhất của chỗ ngồi Sơ đồ lớp** | Kéo học sinh B vào ghế số 5 đã có học sinh C đang ngồi | Hệ thống thực hiện tráo đổi vị trí (Swap) giữa B và C, đảm bảo mỗi ghế có tối đa 1 học sinh và 1 học sinh không thể ngồi 2 ghế cùng lúc. |
| `INT-05` | **Khôi phục xóa mềm (Soft Delete)** | Bấm xóa học sinh Lê Ngọc Anh, sau đó vào mục Lưu trữ bấm "Khôi phục" | Hồ sơ học sinh xuất hiện trở lại danh sách lớp; toàn bộ lịch sử điểm và chuyên cần cũ vẫn được bảo tồn nguyên vẹn 100%. |

---

## 5. BỘ KIỂM THỬ DI ĐỘNG, TRẢI NGHIỆM & HIỆU NĂNG (MOBILE & UX SUITE)

| Mã test | Thiết bị / Môi trường kiểm thử | Thao tác kiểm thử | Tiêu chí đạt chuẩn |
|:---:|:---|:---|:---|
| `UX-01` | iPhone SE (Màn hình siêu nhỏ 375px) | Mở trang chủ, danh sách học sinh và giao diện điểm danh | Không bị tràn viền ngang (Không xuất hiện thanh cuộn ngang trang ngoài ý muốn); cỡ chữ dễ đọc (≥ 14px); không bị đè chữ. |
| `UX-02` | Điện thoại cảm ứng (Touch Targets) | Bấm các nút: Điểm danh (P, KP, T), Cộng điểm (+5, +10), Quay số | Vùng bấm (Touch target area) đạt tối thiểu **44x44 pixel**, bấm chính xác không bị nhầm nút bên cạnh. |
| `UX-03` | Chế độ mất mạng ngoại tuyến (Offline) | Tắt Wifi/4G khi đang mở ứng dụng và thao tác điểm danh | Hiển thị biểu tượng "Ngoại tuyến" màu vàng thân thiện; không bị crash màn hình trắng; thao tác được lưu vào hàng đợi chờ gửi. |
| `UX-04` | Kiểm tra đồng hồ đếm ngược có chuông | Chỉnh 1 phút và bấm "Bắt đầu", sau đó bấm "Tạm dừng" rồi "Đặt lại" | Đồng hồ chạy chính xác từng giây, nút đặt lại hoạt động hoàn hảo (đã sửa lỗi `resetTimer`), chuông Tone.js reo vang khi hết giờ. |
| `UX-05` | Kiểm tra nút "Thu hồi" trong Sơ đồ lớp | Bấm nút "Thu hồi" trên thanh công cụ sơ đồ lớp | Tất cả học sinh được đưa về danh sách chưa xếp chỗ, không phát sinh lỗi `clearAllSeats is not defined`. |
| `UX-06` | Điểm hiệu năng Lighthouse | Chạy kiểm thử tự động trên Google Chrome DevTools (Mobile Profile) | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. |

---

## 6. KỊCH BẢN KIỂM THỬ HÀNH VI CHI TIẾT (GIVEN - WHEN - THEN SCENARIOS)

### Kịch bản BDD 1: Điểm danh nhanh đầu giờ học của Ban Cán Sự
```gherkin
Feature: Điểm danh chuyên cần lớp học
  As a Lớp trưởng hoặc Phó học tập (Ban cán sự lớp)
  I want to điểm danh nhanh các bạn vắng đầu giờ
  So that Giáo viên chủ nhiệm nắm bắt sĩ số ngay trên điện thoại

  Scenario: Cán sự điểm danh một bạn vắng có phép và một bạn đi trễ
    Given Cán sự lớp đăng nhập vào hệ thống Web-GVCN lúc 07:15 sáng
    And Hôm nay là ngày học Thứ Hai, buổi Sáng
    When Cán sự chọn học sinh "Trần Tuấn Kiệt" và chuyển trạng thái sang "Vắng có phép (P)"
    And Cán sự chọn học sinh "Ngô Gia Bảo" và chuyển trạng thái sang "Đi học trễ (T)" kèm ghi chú "Trễ 10 phút"
    And Cán sự bấm nút "Lưu điểm danh buổi sáng"
    Then Hệ thống hiển thị thông báo thành công: "Đã lưu điểm danh (Sĩ số: 38/40)"
    And Trên điện thoại của GVCN ngay lập tức hiển thị sĩ số 38/40 qua kết nối thời gian thực
    And Bản ghi được lưu vết với người tạo là "Lớp trưởng"
```

### Kịch bản BDD 2: Chấm điểm thi đua và bảo vệ tính bất biến của sổ cái
```gherkin
Feature: Tích điểm thi đua tổ
  As a Giáo viên Chủ nhiệm
  I want to cộng điểm cho học sinh đạt thành tích tốt
  So that khuyến khích nỗ lực học tập của các em

  Scenario: Cộng điểm phát biểu xây dựng bài cho học sinh
    Given Học sinh "Huỳnh Huyền Nhiên" thuộc Tổ 1 đang có 85 điểm
    When GVCN chọn tiêu chí "Phát biểu xây dựng bài (+3đ)" cho Huyền Nhiên
    And GVCN bấm "Xác nhận cộng điểm"
    Then Tổng điểm cá nhân của Huyền Nhiên tăng lên thành 88 điểm
    And Tổng điểm của Tổ 1 tự động cộng thêm 3 điểm
    And Bảng point_transactions ghi nhận 1 bản ghi mới với số điểm +3
    And Không có trường tổng điểm nào bị cập nhật đè thủ công
```

### Kịch bản BDD 3: Bảo vệ tuyệt đối thông tin Trạm Đồng Hành
```gherkin
Feature: Bảo mật thông tin học sinh cá biệt tại Trạm Đồng Hành
  As an Hệ thống An toàn Dữ liệu Giáo dục
  I want to ngăn chặn triệt để Ban cán sự và Phụ huynh khác xem thông tin vi phạm
  So that bảo vệ quyền riêng tư và danh dự của học sinh

  Scenario: Tài khoản Ban cán sự lớp tìm cách truy xuất hồ sơ Trạm Đồng Hành
    Given Tài khoản "Lớp trưởng" đã đăng nhập vào hệ thống
    When Lớp trưởng mở công cụ lập trình F12 và gửi request trực tiếp:
      """
      fetch('/rest/v1/companion_cases', { headers: { Authorization: 'Bearer <BCS_TOKEN>' } })
      """
    Then Supabase PostgreSQL thực thi chính sách RLS "companion_gvcn_only"
    And Máy chủ trả về mã trạng thái HTTP 200 kèm nội dung là mảng rỗng []
    And Không có bất kỳ thông tin nào về lỗi vi phạm hay biện pháp can thiệp bị rò rỉ
    And Hệ thống tự động ghi nhật ký cảnh báo vào bảng audit_logs
```

---
*Ma trận kiểm thử nghiệm thu này là bản cam kết chất lượng của đội ngũ kỹ sư. Hệ thống chỉ được bàn giao khi 100% các bài kiểm thử trên đều đạt kết quả "PASS".*
