# BÁO CÁO KIỂM TOÁN MÃ NGUỒN HIỆN TẠI (CODE AUDIT REPORT)
**Dự án:** Hệ thống Quản trị Lớp học Web-GVCN  
**Tệp nguồn thẩm định:** `Index.html` (5.788 dòng, 440 KB) & `CODE GVCN CẬP NHẬT MỚI NHẤT 23.8.md`  
**Ngày kiểm toán:** 27/08/2026  
**Chuyên gia thẩm định:** AI Lead Engineer & Education Data Security Specialist  

---

## 1. TỔNG QUAN VÀ NGUỒN SỰ THẬT (SOURCE OF TRUTH)

### 1.1. Cây thư mục hiện tại
```
d:\WEB-APP\DU-AN-GVCN\Web-GVCN/
├── .agent/                                  # Cấu hình quy tắc và kỹ năng AI Agent
├── Bo-cau-lenh-Antigravity-Web-GVCN.md     # Hướng dẫn quy trình nâng cấp sản phẩm
├── CODE GVCN CẬP NHẬT MỚI NHẤT 23.8.md     # Bản mã HTML escaped (chỉ dùng đối chiếu)
├── Index.html                              # NGUYÊN MẪU CHÍNH ĐANG CHẠY (Single-file SPA)
└── docs/                                   # [MỚI] Tài liệu kiến trúc và đặc tả sản phẩm
```

### 1.2. Xác định tệp nguồn sự thật
- **`Index.html` là nguồn sự thật duy nhất (Single Source of Truth - SSOT)**: Tệp chứa toàn bộ cấu trúc HTML, CSS (Tailwind CDN), JavaScript (khoảng 151 hàm và biến toàn cục), dữ liệu khởi tạo mặc định và cơ chế lưu trữ trình duyệt `localStorage`.
- **`CODE GVCN CẬP NHẬT MỚI NHẤT 23.8.md`**: Là bản xuất text mã nguồn đã bị escape ký tự (`&lt;`, `&gt;`). Tệp này không được dùng làm PRD hay nguồn mã thực thi độc lập, chỉ dùng làm bản sao lưu lịch sử.

---

## 2. KIỂM KÊ DANH MỤC TÍNH NĂNG VÀ TRẠNG THÁI HOẠT ĐỘNG

| STT | Phân hệ / Màn hình | Tính năng cụ thể | Trạng thái hiện tại | Chi tiết kỹ thuật / Bằng chứng trong `Index.html` |
|---|---|---|---|---|
| 1 | **Xác thực & Phân quyền** | Màn hình đăng nhập (`renderLoginScreen`) | **Lỗi / Không được gọi** | Hàm được định nghĩa (Dòng 5327, 5511) nhưng luồng `startApp()` (Dòng 5729) tự động nạp dữ liệu và gọi thẳng `renderLayout()`, bỏ qua màn hình đăng nhập. |
| 2 | | Mật khẩu xác thực | **Mô phỏng / Lỗ hổng** | Mật khẩu hard-coded trực tiếp trong JS (Dòng 5697-5699): GVCN (`123456`), BCS (`123`), BGH (`12A1`). |
| 3 | | Trạng thái phiên | **Mô phỏng** | Mặc định `state.auth = { loggedIn: true, role: 'gvcn' }` (Dòng 142). Thay đổi role chỉ là gán lại biến trong RAM. |
| 4 | | Phân quyền vai trò (RBAC) | **Hoạt động một phần** | Chỉ lọc menu hiển thị (Dòng 366-368, 411-413). Không bảo vệ dữ liệu ở tầng truy cập; người dùng gọi trực tiếp hàm JS đều thực thi được. |
| 5 | **Tổng quan (Trang chủ)** | Thống kê số lượng, chuyên cần, sao | **Hoạt động thật** | Tính toán tổng hợp từ mảng `state.students` và `state.attendanceRecords`. |
| 6 | | Tuyên dương Top học sinh | **Hoạt động thật** | Sắp xếp `state.students` theo điểm giảm dần và hiển thị danh hiệu, huy hiệu. |
| 7 | | Biểu đồ tiến bộ tuần | **Mô phỏng (Dữ liệu giả)** | Điểm tiến bộ tuần tạo bằng `Math.sin(s.id * 10)` (Dòng 599, 617, 2026), không phải dữ liệu giao dịch thật. |
| 8 | | Nhiệm vụ & Hành trình lớp | **Hoạt động thật** | Thêm/xóa task checklist và mốc sự kiện lưu vào `state.tasks`, `state.journeys`. |
| 9 | **Quản lý học sinh** | Danh sách, lọc tổ, tìm kiếm | **Hoạt động thật** | Hiển thị danh sách thẻ/dòng, lọc theo tổ 1-4, tìm kiếm theo tên. |
| 10 | | Thêm, sửa, xóa học sinh | **Hoạt động thật** | Cập nhật mảng `state.students`, có tạo mã tra cứu 5 số ngẫu nhiên (`generateUniqueCode`). |
| 11 | | Nhập dữ liệu từ Excel / Dán bảng | **Hoạt động thật** | Sử dụng thư viện SheetJS đọc file `.xlsx` hoặc parse văn bản tab-separated. Có nguy cơ XSS khi render. |
| 12 | | Hồ sơ học sinh & Nhận xét GV | **Hoạt động thật** | Modal chi tiết, lưu nhận xét vào mảng `comments` của học sinh. |
| 13 | **Tích điểm & Khen thưởng** | Form cộng/trừ điểm (HS, Tổ, Cả lớp) | **Hoạt động thật** | Ghi nhận điểm vào `student.points`, `student.stars` và mảng `student.history`. |
| 14 | | Tiêu chí điểm nhanh | **Hoạt động thật** | Danh mục tiêu chí định sẵn và cho phép thêm tiêu chí mới. |
| 15 | | Hoàn tác / Xóa lịch sử điểm | **Lỗi logic** | `deleteHistoryRecord` (Dòng 5763) dùng `splice` xóa trực tiếp bản ghi và trừ điểm, làm mất vết kiểm toán (Audit Trail). |
| 16 | **Đổi quà (Shop Sao)** | Danh mục quà tặng | **Hoạt động thật** | Thêm, sửa, xóa quà tặng kèm hình ảnh, số lượng và giá sao (`state.rewards`). |
| 17 | | Đổi quà cho học sinh | **Hoạt động thật** | Kiểm tra số dư sao, trừ sao nếu cấu hình `deductStarsOnRedeem = true`. |
| 18 | **Tổ thi đua & Xếp hạng** | Bảng điểm tổ, xếp hạng | **Hoạt động thật** | Tính tổng điểm của các thành viên trong tổ và xếp thứ hạng 1 đến 4. |
| 19 | **Điểm danh** | Điểm danh theo ngày (Có mặt, Muộn, Phép, K.Phép) | **Hoạt động thật** | Lưu trạng thái vào `state.attendanceRecords[dateKey][studentId]`. |
| 20 | | Điểm danh nhanh cả lớp | **Hoạt động thật** | Đánh dấu tất cả học sinh là "Có mặt" chỉ với 1 click. |
| 21 | **Vòng quay & Gọi tên** | Vòng quay ngẫu nhiên 3D / Thẻ bài | **Hoạt động thật** | Hiệu ứng Canvas/CSS, chọn ngẫu nhiên học sinh trong lớp, theo tổ hoặc 1 bạn từ mỗi tổ. |
| 22 | | Âm thanh & Pháo hoa (Confetti) | **Hoạt động thật** | Tích hợp Tone.js phát âm thanh và hiệu ứng Canvas Confetti. |
| 23 | **Công cụ hỗ trợ tiết dạy** | Đồng hồ đếm ngược / Bấm giờ | **Lỗi một phần** | Bộ đếm hoạt động nhưng nút "Đặt lại" gọi `resetTimer()` (Dòng 3880) bị thiếu định nghĩa hàm (phải gọi `window.endTimer`). |
| 24 | | Chuông báo tiết học | **Hoạt động thật** | Tạo âm thanh synthesizer qua Tone.js với các mẫu chuông vào lớp, hết giờ. |
| 25 | **Thời khóa biểu** | Xem TKB tuần, nhập Excel TKB | **Hoạt động một phần** | Hiển thị bảng TKB các thứ trong tuần; parse Excel có cấu trúc nhưng lưu trữ thô. |
| 26 | **Sơ đồ chỗ ngồi** | Sơ đồ kéo thả (Drag & Drop) | **Lỗi một phần** | Xếp chỗ học sinh vào bàn học bằng HTML5 Drag & Drop; tuy nhiên nút "Thu hồi tất cả chỗ ngồi" gọi `clearAllSeats()` (Dòng 4645) không có code xử lý. |
| 27 | **Lịch báo giảng** | Lập lịch dạy theo tuần và tiết | **Lỗi xung đột mã** | Có đến **03 hàm `renderViewLichBaoGiang` trùng tên** (Dòng 4706, 4837, 4968). Hàm sau ghi đè hàm trước gây lãng phí bộ nhớ và khó bảo trì. |
| 28 | **Sổ theo dõi & Báo cáo** | Tổng hợp tuần, tháng, học kỳ & Xuất PDF | **Hoạt động một phần** | Render bảng báo cáo và xuất PDF qua `html2pdf.bundle.js`; tuy nhiên dữ liệu tuần bị phụ thuộc một phần vào Math.sin. |
| 29 | **Trạm đồng hành** | Theo dõi học sinh khó khăn, vi phạm, biện pháp | **Hoạt động thật / RỦI RO BẢO MẬT CAO** | Lưu các thông tin cực kỳ nhạy cảm (hút thuốc, bạo lực, yếu kém...) dạng văn bản trần không mã hóa vào `localStorage`. Nút "Hoàn thành" xóa vĩnh viễn không lưu lịch sử. |
| 30 | **Cài đặt & Sao lưu** | Đổi màu chủ đề, banner, avatar | **Hoạt động thật** | Nén ảnh base64 lưu vào state (dễ làm tràn bộ nhớ 5MB của localStorage). |
| 31 | | Sao lưu / Phục hồi JSON | **Rủi ro XSS** | Phục hồi chỉ parse JSON và gán thẳng vào state, không có schema validation (Zod) hay lọc dữ liệu độc hại. |
| 32 | **Cổng tra cứu Phụ huynh** | Tra cứu kết quả học sinh bằng mã 5 số | **Rủi ro rò rỉ dữ liệu** | Tra cứu bằng mã 5 số (`generateUniqueCode`) không có cơ chế Rate-limit, mã ngắn dễ dò quét (Brute-force) để xem trộm thông tin học sinh khác. |

---

## 3. PHÂN TÍCH LỖ HỔNG VÀ RỦI RO KỸ THUẬT (THEO MỨC ĐỘ)

### 3.1. RỦI RO NGHIÊM TRỌNG (CRITICAL)

#### 🔴 SEC-01: Bỏ qua hoàn toàn cổng đăng nhập (Bypass Authentication)
- **Vị trí:** `Index.html:5729-5747` (`window.startApp`), `Index.html:142` (`state.auth`).
- **Hiện tượng:** Mặc định khởi tạo `state.auth = { loggedIn: true, role: 'gvcn' }`. Khi tải trang, `window.startApp()` nạp dữ liệu và trực tiếp kích hoạt `renderLayout()`, không bao giờ hiển thị `renderLoginScreen()`. Bất kỳ ai mở URL đều có toàn quyền Quản trị viên (GVCN).
- **Hậu quả:** Mất an toàn toàn bộ dữ liệu lớp học, bất kỳ ai truy cập máy tính hoặc web tĩnh đều thao tác được.

#### 🔴 SEC-02: Mật khẩu tĩnh hard-coded và phân quyền Client-side giả tạo
- **Vị trí:** `Index.html:5690-5700` (`window.processLogin`).
- **Bằng chứng:**
  ```javascript
  if (role === 'gvcn' && pass === '123456') isValid = true;
  else if (role === 'bancansu' && pass === '123') isValid = true;
  else if (role === 'bgh' && pass === '12A1') isValid = true;
  ```
- **Hậu quả:** Mật khẩu lộ hoàn toàn khi View Source. Phân quyền chỉ là ẩn/hiện class CSS menu; người dùng mở DevTools đổi `state.auth.role = 'gvcn'` là chiếm quyền.

#### 🔴 SEC-03: Lưu trữ toàn bộ dữ liệu nghiệp vụ và dữ liệu nhạy cảm trong `localStorage`
- **Vị trí:** `Index.html:5731, 5751` (`localStorage.setItem('chuyen_tau_data', ...)`).
- **Hậu quả:** Dữ liệu không được đồng bộ giữa máy tính và điện thoại. Dọn dẹp trình duyệt (Clear Cache) làm mất sạch dữ liệu của cả năm học. Dung lượng bị giới hạn ~5MB dẫn đến lỗi crash khi tải nhiều ảnh đại diện base64.

#### 🔴 SEC-04: Rò rỉ dữ liệu nhạy cảm của học sinh tại "Trạm đồng hành"
- **Vị trí:** `Index.html:5163-5317` (`state.companions`).
- **Nội dung lưu:** Ghi chép chi tiết về các hành vi vi phạm, học lực yếu kém, hoàn cảnh cá nhân phức tạp ("Thường xuyên hút thuốc trong NVS", "Đánh nhau",...).
- **Hậu quả:** Vi phạm nghiêm trọng quyền riêng tư của trẻ em theo Luật Trẻ em 2016 và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Không có nhật ký truy cập, không phân quyền riêng biệt, ai mở máy cũng đọc được.

#### 🔴 SEC-05: Cổng tra cứu phụ huynh dùng mã 5 số không an toàn (Brute-force IDOR)
- **Vị trí:** `Index.html:220` (`generateUniqueCode`), `Index.html:5713-5728` (`performDirectLookup`).
- **Hậu quả:** Mã 5 chữ số ngẫu nhiên ($10^5$ khả năng). Không có Rate Limit (giới hạn tần suất gọi) hay Captcha; một vòng lặp JS đơn giản có thể quét toàn bộ mã học sinh của trường trong 2 giây.

---

### 3.2. RỦI RO CAO (HIGH)

#### 🟠 CODE-01: Định nghĩa hàm trùng lặp 3 lần (`renderViewLichBaoGiang`)
- **Vị trí:** `Index.html:4706-4836`, `Index.html:4837-4967`, `Index.html:4968-5162`.
- **Hậu quả:** 3 khối mã giao diện lịch báo giảng gần như giống hệt nhau (~450 dòng mã dư thừa), hàm sau ghi đè hàm trước, làm tăng dung lượng tải trang và tạo xung đột khi bảo trì.

#### 🟠 CODE-02: Nút bấm gọi hàm không tồn tại (`resetTimer`, `clearAllSeats`)
- **Vị trí:**
  - `Index.html:3880`: `<button onclick="resetTimer()" ...>` -> Không có hàm `resetTimer`, gây lỗi `Uncaught ReferenceError`.
  - `Index.html:4645`: `<button onclick="clearAllSeats()" ...>` -> Không có hàm `clearAllSeats`, người dùng bấm nút xóa sơ đồ lớp không có phản hồi.

#### 🟠 DATA-01: Dữ liệu thống kê tiến bộ tuần tạo bằng thuật toán giả `Math.sin`
- **Vị trí:** `Index.html:599, 617, 2026`.
- **Bằng chứng:**
  ```javascript
  const weekProg = s.points > 0 ? Math.floor((Math.sin(s.id * 10) + 1) * 5) + 2 : 0;
  ```
- **Hậu quả:** Biểu đồ và chỉ số tiến bộ trên Dashboard là số liệu bịa đặt toán học, không phản ánh đúng quá trình rèn luyện thực tế của học sinh.

#### 🟠 SEC-06: Nguy cơ tấn công XSS (Cross-Site Scripting) từ dữ liệu nhập
- **Vị trí:** `Index.html:214-215` (`escapeHtmlAttr`), các hàm render bảng điểm, học sinh, nhiệm vụ.
- **Bằng chứng:** `escapeHtmlAttr` chỉ replace ký tự `"` thành `&quot;`, không escape `<`, `>`, `&`. Dữ liệu tải lên từ file Excel (tên học sinh, lý do cộng điểm) được ghép chuỗi trực tiếp vào `innerHTML`. Kẻ xấu có thể chèn mã độc `<script>` hoặc `<img src=x onerror=...>` để đánh cắp phiên làm việc.

#### 🟠 ARCH-01: Kiến trúc Monolithic Spaghetti File (> 5.700 dòng)
- **Hiện trạng:** 1 tệp `Index.html` chứa tất cả HTML, CSS, JavaScript logic, State, Render, Event listeners, Thư viện CDN.
- **Hậu quả:** Không thể phân công nhóm phát triển, không thể viết Unit Test tự động, cực kỳ rủi ro khi refactor.

---

### 3.3. RỦI RO TRUNG BÌNH (MEDIUM)

#### 🟡 PERF-01: Lưu trữ ảnh đại diện dạng Base64 trong LocalStorage
- **Vị trí:** `Index.html:224-245` (`compressImage`), `handleBannerUpload`, `handleStudentAvatarUpload`.
- **Hậu quả:** Chuỗi Base64 làm phình to dung lượng bộ nhớ. Khi lớp có 45 học sinh kèm banner lớp, LocalStorage sẽ chạm ngưỡng quota và ném ngoại lệ `QuotaExceededError`.

#### 🟡 DATA-02: Xóa lịch sử điểm làm hỏng tính toàn vẹn dữ liệu (Silent Splicing)
- **Vị trí:** `Index.html:5763-5785` (`window.deleteHistoryRecord`).
- **Hậu quả:** Thao tác xóa `student.history.splice(idx, 1)` làm biến mất lịch sử mà không để lại vết kiểm toán ai đã xóa, lúc nào và vì lý do gì.

#### 🟡 EXT-01: Phụ thuộc hoàn toàn vào các CDN công cộng
- **Vị trí:** `Index.html:9-13` (Tailwind, Phosphor Icons, SheetJS, Tone.js, html2pdf).
- **Hậu quả:** Khi mạng trường học chập chờn hoặc các CDN bị chặn/lỗi phân giải DNS, toàn bộ giao diện và chức năng của ứng dụng bị sụp đổ.

#### 🟡 UX-01: Trải nghiệm di động (Mobile Responsive) chưa hoàn thiện
- **Vị trí:** Menu di động có thông báo "Tính năng đang phát triển", bảng thời khóa biểu và sơ đồ lớp bị tràn màn hình ngang (overflow).

#### 🟡 DATA-03: Nhập dữ liệu JSON phục hồi không có Schema Validation
- **Vị trí:** `Index.html:2780-2810` (`window.importData`).
- **Hậu quả:** Ứng dụng chỉ gọi `JSON.parse` rồi gán đè vào `state`. File JSON sai định dạng sẽ làm ứng dụng treo vĩnh viễn.

---

### 3.4. RỦI RO THẤP (LOW)

#### 🟢 I18N-01: Thiếu cấu hình năm học, học kỳ và múi giờ chuẩn
- Mặc định ngày tháng lấy theo giờ trình duyệt của client, có thể sai lệch nếu thiết bị sai giờ.

#### 🟢 CODE-03: Cú pháp biến toàn cục không nhất quán (`window.*` vs biến cục bộ)
- Nhiều hàm gán vào `window`, nhiều hàm khai báo bằng `function`, gây ô nhiễm Global Scope.

#### 🟢 CODE-04: Xóa hồ sơ Trạm đồng hành không lưu trữ trạng thái đóng (Close Case)
- Khi bấm "Hoàn thành", bản ghi bị xóa hẳn (`filter`) thay vì chuyển trạng thái `status: 'completed'`.

---

## 4. DANH SÁCH TÍNH NĂNG BẮT BUỘC PHẢI BẢO TỒN KHI LÊN KIẾN TRÚC MỚI

Toàn bộ các giá trị cốt lõi làm nên sự tiện dụng của Web-GVCN phải được giữ nguyên vẹn và nâng cấp lên chuẩn chất lượng cao:

1. **Nhận diện lớp học:** Banner chủ đề tháng, slogan lớp, tên trường, chi đội, avatar GVCN và lớp.
2. **Quản lý học sinh thông minh:** Thông tin học sinh đa chiều (tổ, chức vụ, năng khiếu, mục tiêu, hoàn cảnh, ghi chú của GVCN).
3. **Nhập dữ liệu linh hoạt:** Nhập danh sách học sinh từ file Excel (.xlsx) và dán văn bản trực tiếp.
4. **Hệ thống Điểm thi đua & Shop Đổi quà:** Cơ chế cộng/trừ điểm đa đối tượng (Cá nhân, Tổ, Cả lớp) theo danh mục tiêu chí; đổi quà tiêu sao.
5. **Điểm danh chuyên cần đa trạng thái:** Có mặt, Đi muộn, Vắng có phép, Vắng không phép; hỗ trợ điểm danh nhanh 1 chạm.
6. **Công cụ tương tác lớp học sống động:** Vòng quay ngẫu nhiên 3D/Thẻ bài, Đồng hồ đếm ngược/Bấm giờ, Chuông báo tiết học (Tone.js synthesizer), Pháo hoa chúc mừng.
7. **Sơ đồ chỗ ngồi tương tác:** Bố trí bàn học theo sơ đồ trực quan, hỗ trợ kéo thả học sinh vào chỗ ngồi.
8. **Thời khóa biểu & Lịch báo giảng:** Quản lý tiết dạy tuần, môn học, bài dạy và ghi chú giáo viên.
9. **Sổ theo dõi & Xuất báo cáo chuyên nghiệp:** Báo cáo tuần/tháng/kỳ, xuất PDF định dạng in ấn sạch đẹp.
10. **Trạm đồng hành (Nâng cấp bảo mật):** Hồ sơ hỗ trợ cá nhân hóa học sinh với phân quyền bảo mật cấp cao nhất.
