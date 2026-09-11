# 📋 BÁO CÁO KIỂM TOÁN TOÀN DIỆN MÃ NGUỒN HIỆN TẠI (CODE AUDIT REPORT)
**Dự án:** Web-GVCN (Hệ thống Quản lý Lớp học dành cho Giáo viên Chủ nhiệm)  
**Tệp kiểm toán chính:** `index.html` (Phiên bản nguyên mẫu Single-Page, dung lượng ~475 KB, 6.403 dòng mã)  
**Tệp đối chiếu:** `CODE GVCN CẬP NHẬT MỚI NHẤT .md`, `Bo-cau-lenh-Antigravity-Web-GVCN.md`  
**Vai trò thẩm định:** AI Lead Engineer, Product Architect & Chuyên gia An toàn Dữ liệu Giáo dục  
**Ngày thực hiện:** 11/09/2026  
**Trạng thái mã nguồn ứng dụng:** ĐÃ ĐÓNG BĂNG – CHƯA SỬA MÃ – CHỜ DUYỆT KIẾN TRÚC

---

## 1. TỔNG QUAN CẤU TRÚC DỰ ÁN VÀ NGUỒN SỰ THẬT (SINGLE SOURCE OF TRUTH)

### 1.1. Cây thư mục hiện tại của dự án
```text
d:/WEB-APP/DU-AN-GVCN/Web-GVCN/
├── .agent/                               # Cấu hình kỹ năng, quy tắc của AI Agent
├── .git/                                 # Kho lưu trữ phiên bản Git cục bộ
├── BAN-CAN-SU-LOP/                       # Tài liệu & hình ảnh phân công Ban Cán Sự
│   ├── BAN-CAN-SU-LOP-6A6.md             # Đề xuất phân công nhiệm vụ tự quản 6A6
│   ├── BCS-LOP.txt                       # Ghi chú danh sách cán sự lớp
│   └── 1789094672458_...png              # Ảnh chụp sơ đồ phân công
├── BANNER/                               # Hình ảnh banner lớp học
├── CHU-DIEM-THANG/                       # Tài liệu & hình ảnh chủ điểm thi đua tháng
├── SO-DO-LOP/                            # Hình ảnh sơ đồ chỗ ngồi mẫu
├── THEO-DOI-CHUYEN-CAN/                  # Tài liệu & hình ảnh theo dõi chuyên cần
├── Bo-cau-lenh-Antigravity-Web-GVCN.md   # Tài liệu hướng dẫn & bộ lệnh nâng cấp hệ thống
├── CODE-GVCN.md                          # Mã nguồn HTML đối chiếu (đã escape ký tự)
├── File_Mau_Nhap_Hoc_Sinh.xlsx           # File mẫu Excel nhập học sinh (đầy đủ cột)
├── File_Mau_Nhap_Hoc_Sinh_1.xlsx         # File mẫu Excel nhập học sinh (rút gọn)
├── TKB-LOP-6A6.xlsx                      # File Excel thời khóa biểu thực tế lớp 6A6
├── danh-sach-hs-6a6.xlsx                 # File Excel danh sách học sinh thực tế lớp 6A6
├── PHAT-ĐONG-THI-DUA-CAC-NGAY-LE-LON-TRONG-NAM.md # Tiêu chí thi đua ngày lễ lớn
├── TIEU-CHI-CHAM-DIEM-THI-DUA-GIUA-CAC-TO.md     # 40 tiêu chí chấm điểm chi tiết
└── index.html                            # NGUYÊN MẪU DUY NHẤT ĐANG CHẠY TRÊN TRÌNH DUYỆT (SOURCE OF TRUTH)
```

### 1.2. Xác định tệp nguồn sự thật
- **`index.html`** (475.043 bytes, 6.403 dòng code HTML + JS + CSS nhúng) là **Tệp nguồn sự thật duy nhất (Single Source of Truth)** hiện đang phản ánh mọi logic nghiệp vụ, giao diện và tương tác của phiên bản nguyên mẫu (prototype).
- **`CODE-GVCN.md`** là bản sao lưu HTML đã bị mã hóa ký tự (`&lt;`, `&gt;`, `&quot;`). Tệp này chỉ có giá trị đối chiếu lịch sử phiên bản, tuyệt đối không dùng để chạy trực tiếp hay coi là tài liệu yêu cầu độc lập.

---

## 2. KIỂM KÊ CHỨC NĂNG, GIAO DIỆN VÀ MÃ NGUỒN HIỆN TẠI

### 2.1. Danh mục các màn hình / View chính (`state.currentTab`)
Theo bộ định tuyến dòng 476–493 trong `index.html`:

| STT | Mã Tab (`currentTab`) | Tên hiển thị trên Menu | Hàm Render tương ứng | Trạng thái kỹ thuật |
|:---:|:---|:---|:---|:---|
| 1 | `tong-quan` | Trang chủ (Tổng quan) | `renderViewTongQuan()` (Dòng 587) | Hoạt động một phần (Chứa số liệu giả `Math.sin`) |
| 2 | `hoc-sinh` | Học sinh | `renderViewHocSinh()` (Dòng 827) | Hoạt động thật (Thêm, sửa, xóa, tìm kiếm, nhập Excel) |
| 3 | `thoi-khoa-bieu` | Thời khóa biểu | `renderViewThoiKhoaBieu()` (Dòng 4565) | Hoạt động một phần (Tải ảnh/nhập Excel, hiển thị lịch) |
| 4 | `so-do-lop` | Sơ đồ lớp | `renderViewSoDoLop()` (Dòng 5084) | Hoạt động thật nhưng **nút Thu hồi bị lỗi do thiếu hàm** |
| 5 | `lich-bao-giang` | Lịch báo giảng | `renderViewLichBaoGiang()` (Dòng 5232) | Hoạt động thật (Quản lý tiết dạy, môn, tuần) |
| 6 | `tich-diem` / popup | Tích điểm (Cộng/Trừ) | Giao diện form nhúng trong trang chủ & học sinh | Hoạt động thật (Có ghi lịch sử vào từng học sinh) |
| 7 | `doi-qua` | Quà tặng (Đổi thưởng) | `renderViewDoiQua()` (Dòng 2887) | Lỗi chức năng (**Nút sửa & xóa quà thiếu hàm**) |
| 8 | `nhom-thi-dua` | Tổ thi đua | `renderViewNhomThiDua()` (Dòng 3312) | Hoạt động thật (Có hàm bị khai báo trùng `saveGroupEdit`) |
| 9 | `diem-danh` | Điểm danh | `renderViewDiemDanh()` (Dòng 1633) | Hoạt động thật (Điểm danh chuyên cần theo ngày) |
| 10 | `vong-quay` | Gọi Tên Ngẫu Nhiên | `renderViewVongQuay()` (Dòng 2043) | Hoạt động thật (Hiệu ứng Canvas, bài hát Tone.js) |
| 11 | `dong-ho` (Drawer) | Công cụ (Đồng hồ bấm giờ) | `openTimerDrawer()` (Dòng 4308 & 4361) | Lỗi (**Khai báo đè 2 lần**, nút `resetTimer()` thiếu hàm) |
| 12 | `xep-hang` | Tuyên Dương | `renderViewXepHang()` (Dòng 3699) | Hoạt động thật (Vinh danh Top sao, hiệu ứng pháo hoa) |
| 13 | `ke-hoach` | Kế hoạch tuần | `renderViewKeHoach()` (Dòng 4438) | Hoạt động thật (Nhiệm vụ, sự kiện trong tuần) |
| 14 | `bao-cao` | Sổ theo dõi (Báo cáo) | `renderViewBaoCao()` (Dòng 3804) | Hoạt động thật (Thống kê điểm danh, vi phạm, xuất PDF) |
| 15 | `tram-dong-hanh` | Trạm đồng hành | `renderViewTramDongHanh()` (Dòng 5496) | Hoạt động thật nhưng **RỦI RO BẢO MẬT CỰC CAO** |
| 16 | `cai-dat` | Cài đặt & Sao lưu | `renderViewCaiDat()` (Dòng 2935) | Hoạt động thật (Đổi tên lớp, avatar, xuất/nhập JSON) |
| 17 | `login-screen` | Đăng nhập hệ thống | `renderLoginScreen()` (Dòng 5660) | **Mô phỏng giả mạo** (Mật khẩu hard-code, bị bypass) |
| 18 | `parent-portal` | Cổng Phụ huynh tra cứu | `showParentView(studentId)` (Dòng 4093) | Mô phỏng qua popup (Mã tra cứu 5 số không an toàn) |

---

## 3. BẢNG PHÂN LOẠI LỖI VÀ RỦI RO BẢO MẬT (RISK & DEFECT MATRIX)

Chúng tôi phân loại các lỗ hổng và khuyết tật theo 4 cấp độ quốc tế:
- 🔴 **CRITICAL (Nghiêm trọng):** Nguy cơ rò rỉ dữ liệu trẻ em, mất kiểm soát phân quyền hoặc mất sạch dữ liệu.
- 🟠 **HIGH (Cao):** Tính năng bị sập (crash) do thiếu hàm hoặc số liệu giả đánh lừa giáo viên.
- 🟡 **MEDIUM (Trung bình):** Code trùng lặp, kiến trúc đơn khối (monolithic), nguy cơ tràn bộ nhớ.
- 🟢 **LOW (Thấp):** Giao diện chưa responsive trên màn hình siêu nhỏ, text hard-code.

| Cấp độ | Mã lỗi | Hiện tượng & Lỗ hổng | Bằng chứng mã nguồn (Tệp & Dòng) | Tác động thực tế |
|:---|:---:|:---|:---|:---|
| 🔴 **CRITICAL** | `CRIT-01` | **Mật khẩu hard-code & Xác thực phía Trình duyệt** | `index.html: Dòng 5820-5825`<br>```js const passwords = { 'gvcn': '12345', 'bcs': '123', 'bgh': '1234' };``` | Bất kỳ ai nhấn F12 hoặc xem mã nguồn đều thấy mật khẩu. Mọi người đều có thể mạo danh GVCN hoặc BGH. |
| 🔴 **CRITICAL** | `CRIT-02` | **Giao diện đăng nhập bị vượt qua dễ dàng (Client State Bypass)** | `index.html: Dòng 143, Dòng 5870-5872`<br>State lưu `auth.loggedIn` thẳng vào localStorage. | Chỉ cần mở Console gõ `state.auth.loggedIn = true; renderLayout();` là truy cập toàn bộ hệ thống mà không cần đăng nhập. |
| 🔴 **CRITICAL** | `CRIT-03` | **Toàn bộ cơ sở dữ liệu phụ thuộc vào `localStorage`** | `index.html: Dòng 5870, Dòng 5875`<br>`localStorage.setItem('classManagerData', ...)` | Dữ liệu không được đồng bộ giữa máy tính giáo viên và điện thoại; khi xóa cache trình duyệt là **mất sạch dữ liệu cả năm học**. |
| 🔴 **CRITICAL** | `CRIT-04` | **Phân quyền hình thức (Cosmetic RBAC)** | `index.html: Dòng 341-345, Dòng 381-385`<br>Phân quyền chỉ là `activeMenuItems = menuItems.filter(...)` | BCS hay Học sinh đều có sẵn toàn bộ dữ liệu trong bộ nhớ JS client; người dùng sửa biến JS là chiếm toàn quyền sửa/xóa học sinh. |
| 🔴 **CRITICAL** | `CRIT-05` | **Lộ lọt thông tin nhạy cảm của học sinh tại "Trạm Đồng Hành"** | `index.html: Dòng 5494-5655`<br>Lưu hành vi vi phạm (hút thuốc, đánh nhau...) dạng văn bản rõ (plaintext). | Dữ liệu học sinh diện cá biệt, vi phạm kỉ luật lưu trần trụi trong máy tính dùng chung ở lớp, vi phạm nghiêm trọng quyền riêng tư trẻ em. |
| 🔴 **CRITICAL** | `CRIT-06` | **Lỗ hổng Cross-Site Scripting (XSS Injection)** | 36 vị trí dùng `innerHTML` trực tiếp (VD: `Dòng 471, 3889, 4340, 4364, 5889...`) | Khi nhập file Excel có chứa mã script độc hại trong tên học sinh hoặc ghi chú vi phạm, mã độc sẽ tự động thực thi trên máy GVCN. |
| 🟠 **HIGH** | `HIGH-01` | **Dashboard hiển thị số liệu tiến độ tuần GIẢ MẠO (`Math.sin`)** | `index.html: Dòng 599, 617, 2376`<br>`Math.floor((Math.sin(s.id * 10) + 1) * 5) + 2` | Điểm tiến bộ tuần của học sinh không tính từ dữ liệu thật mà sinh bằng hàm lượng giác toán học! Đánh lừa nhận định của GVCN. |
| 🟠 **HIGH** | `HIGH-02` | **Gọi hàm không tồn tại gây sập ứng dụng (Runtime Crash): `clearAllSeats`** | `index.html: Dòng 5172`<br>`<button onclick="clearAllSeats()">` | Khi GVCN bấm nút "Thu hồi" trong Sơ đồ lớp, trình duyệt báo lỗi `Uncaught ReferenceError: clearAllSeats is not defined`. |
| 🟠 **HIGH** | `HIGH-03` | **Gọi hàm không tồn tại: `resetTimer`** | `index.html: Dòng 4329`<br>`<button onclick="resetTimer()">` | Khi bấm nút đặt lại đồng hồ bấm giờ, ứng dụng ném lỗi `ReferenceError: resetTimer is not defined`. |
| 🟠 **HIGH** | `HIGH-04` | **Gọi hàm không tồn tại trong quản lý Quà tặng: `openEditRewardModal`, `deleteReward`** | `index.html: Dòng 2990, 2991`<br>`onclick="openEditRewardModal('${r.id}')"`<br>`onclick="deleteReward('${r.id}')"` | Không thể sửa hoặc xóa phần quà trong danh mục đổi quà. Bấm vào nút bị đứng và báo lỗi đỏ console. |
| 🟠 **HIGH** | `HIGH-05` | **Gọi hàm không tồn tại khi xóa lịch sử điểm: `deleteHistoryRecord`** | `index.html: Dòng 4009`<br>`onclick="deleteHistoryRecord(${student.id}, ${h.id})"` | GVCN muốn hoàn tác/xóa một dòng chấm điểm sai trong Sổ theo dõi thì không thể thực hiện được. |
| 🟠 **HIGH** | `HIGH-06` | **Mã tra cứu phụ huynh chỉ 5 chữ số ngẫu nhiên không có Rate-limit** | `index.html: Dòng 221-224, 5778, 5840`<br>`code = Math.floor(10000 + Math.random() * 90000)` | 90.000 khả năng có thể bị dò quét (brute-force) bằng script chỉ trong 30 giây để xem toàn bộ danh sách điểm và thông tin học sinh. |
| 🟡 **MEDIUM** | `MED-01` | **7 cặp hàm bị khai báo trùng lặp (Duplicate Overrides)** | `index.html:`<br>- `executeQuickPoint`: Dòng 1197 & 4908<br>- `isDateInFilter`: Dòng 1758 & 1952<br>- `saveGroupEdit`: Dòng 3421 & 3636<br>- `openTimerDrawer`: Dòng 4308 & 4361<br>- `closeTimerDrawer`: Dòng 4339 & 4424<br>- `logBCSAction`: Dòng 5857 & 5904<br>- `openAuditLogModal`: Dòng 5878 & 5922 | Gây xung đột logic không thể kiểm soát; logic phía dưới đè bẹp logic phía trên khiến lập trình viên sửa một đằng chạy một nẻo. |
| 🟡 **MEDIUM** | `MED-02` | **Nguy cơ tràn bộ nhớ `localStorage` do nén ảnh sang Base64** | `index.html: Dòng 228-245, 4285, 5810`<br>`canvas.toDataURL('image/jpeg', quality)` | Khi GVCN tải nhiều ảnh học sinh, ảnh bìa lớp, dung lượng sẽ vượt ngưỡng 5MB của trình duyệt, gây ra lỗi `QuotaExceededError` khiến toàn bộ việc lưu dữ liệu thất bại. |
| 🟡 **MEDIUM** | `MED-03` | **Phục hồi dữ liệu JSON thiếu cơ chế kiểm tra Schema (Schema Blind Restore)** | `index.html: Dòng 3080-3095`<br>`state = JSON.parse(e.target.result)` | Nếu người dùng tải lên tệp JSON sai định dạng hoặc cố tình sửa trường dữ liệu, ứng dụng sẽ hỏng hoàn toàn trạng thái (State corruption). |
| 🟡 **MEDIUM** | `MED-04` | **Phụ thuộc 100% vào các thư viện CDN bên ngoài** | `index.html: Dòng 9-14`<br>Tailwind CDN, Phosphor Icons, SheetJS, Tone.js, html2pdf, Mammoth | Khi mất mạng Internet ở trường học hoặc CDN bên thứ ba gặp sự cố, ứng dụng không thể khởi động hoặc mất toàn bộ giao diện. |
| 🟢 **LOW** | `LOW-01` | **Menu điều hướng trên thiết bị di động chưa hoàn thiện** | `index.html: Dòng 445-450` | Nút hamburger menu trên di động hiển thị thông báo "đang phát triển" hoặc giao diện bảng bị tràn ngang khó thao tác. |
| 🟢 **LOW** | `LOW-02` | **Tuyên bố bảo mật sai lệch (False Security Claim)** | `index.html: Dòng 5784`<br>`Phiên đăng nhập được mã hóa an toàn` | Giao diện ghi cam kết mã hóa nhưng bên dưới không có bất kỳ thuật toán băm (hashing) hay mã hóa nào. |

---

## 4. CHI TIẾT BẰNG CHỨNG KIỂM TOÁN TỪNG PHÂN HỆ NGHIỆP VỤ

### 4.1. Phân hệ Điểm & Thi đua (Points & Ledger)
- **Điểm mạnh:** Đã có ý tưởng tách mảng `s.history` trong từng học sinh để ghi lại lý do, số điểm, ngày giờ (`Dòng 270`). Có danh mục tiêu chí cộng/trừ điểm đa dạng theo học tập, nề nếp, phong trào (`Dòng 273-285`).
- **Khuyết tật nghiêm trọng:**
  1. `executeQuickPoint` bị định nghĩa trùng 2 lần tại dòng 1197 và dòng 4908.
  2. Nút xóa bản ghi lịch sử `deleteHistoryRecord` tại dòng 4009 không có hàm cài đặt.
  3. Cơ chế điểm vẫn lưu theo kiểu thuộc tính tích lũy sẵn `s.points` và `s.stars`. Khi có xung đột hoặc chỉnh sửa trực tiếp, không thể kiểm toán (audit) được tính toán đúng hay sai.

### 4.2. Phân hệ Sơ đồ lớp (Seating Chart)
- **Điểm mạnh:** Giao diện đồ họa giả lập phòng học rất trực quan với Bàn Giáo Viên, Bảng từ xanh, Cửa ra vào (`Dòng 5183-5196`). Hỗ trợ mở rộng dãy trái/phải (`addColumnLeft`, `addColumnRight`) và tự động xếp chỗ ngẫu nhiên (`autoArrangeSeats`).
- **Khuyết tật nghiêm trọng:**
  1. Nút "Thu hồi" chỗ ngồi (`Dòng 5172`) gọi `clearAllSeats()` nhưng hàm này **hoàn toàn không được viết trong mã nguồn**, bấm vào phát sinh lỗi đỏ console.
  2. Tọa độ ghế phụ thuộc vào `state.gridCols` và key chuỗi `'seat-'+i`, dễ bị lỗi lệch hàng cột khi co giãn kích thước màn hình điện thoại.

### 4.3. Phân hệ Trạm Đồng Hành (Special Companion Station)
- **Điểm mạnh:** Ý tưởng giáo dục nhân văn sâu sắc, dành riêng cho học sinh cần can thiệp hành vi hoặc học sinh có hoàn cảnh đặc biệt. Có các trường: `startDate`, `issue` (vấn đề vi phạm), `measures` (biện pháp giáo dục).
- **Khuyết tật nghiêm trọng:**
  1. Toàn bộ hồ sơ vi phạm (ví dụ hút thuốc, đánh nhau, nợ học phí) được lưu thẳng vào `localStorage` dạng văn bản rõ.
  2. Quyền xem ở dòng 5973 cấp cho cả Ban Giám Hiệu nhưng không hề có kiểm tra phiên đăng nhập an toàn. Ai mượn máy GVCN vào giờ ra chơi đều có thể đọc được thông tin này.

### 4.4. Phân hệ Báo cáo & Thống kê (Reports & Analytics)
- **Điểm mạnh:** Hỗ trợ xem thống kê chuyên cần theo tuần, thống kê vi phạm, tích hợp thư viện `html2pdf.js` để xuất báo cáo PDF nộp BGH (`Dòng 4071`).
- **Khuyết tật:** Chỉ số "tiến bộ tuần" tại trang chủ dùng `Math.sin(s.id * 10)` để ngẫu nhiên hóa dữ liệu (`Dòng 599`). Báo cáo PDF dựng trực tiếp từ DOM HTML nên dễ bị vỡ layout trên các thiết bị khác nhau.

---

## 5. DANH SÁCH TÍNH NĂNG NGUYÊN MẪU BẮT BUỘC PHẢI BẢO TỒN (PRESERVATION LIST)

Khi tái cấu trúc sang kiến trúc mới (React + TypeScript + Supabase), **tuyệt đối không được làm mất linh hồn nghiệp vụ của sản phẩm**. Sau đây là danh mục tính năng cốt lõi bắt buộc bảo tồn 100%:

1. **Quản lý học sinh:**
   - Danh sách học sinh kèm ảnh đại diện, tổ, chức vụ (Lớp trưởng, Phó học tập, Bí thư, Tổ trưởng...), mục tiêu cá nhân, năng khiếu, sở thích.
   - Nhập danh sách tự động từ tệp Excel chuẩn và xuất danh sách học sinh.
2. **Hệ thống Điểm thi đua & Ngôi sao:**
   - Cộng/Trừ điểm cho từng học sinh, cho từng tổ thi đua hoặc cho cả lớp.
   - Bảng 40 tiêu chí chấm điểm thi đua chi tiết (Học tập, Nề nếp, Phong trào...).
   - Đổi sao lấy quà tặng với cơ chế trừ sao tích lũy.
3. **Điểm danh chuyên cần:**
   - Điểm danh nhanh theo ngày với các trạng thái: Có mặt, Vắng có phép, Vắng không phép, Đi trễ.
   - Thống kê tỷ lệ chuyên cần hằng tuần và cảnh báo vắng nhiều.
4. **Sơ đồ lớp học thông minh:**
   - Hiển thị trực quan vị trí bục giảng, bảng từ xanh, bàn giáo viên, cửa lớp.
   - Kéo thả đổi chỗ học sinh, thêm dãy ghế linh hoạt, tự động xếp chỗ ngẫu nhiên.
5. **Công cụ hỗ trợ tiết học trực tiếp (Trợ giảng số):**
   - Vòng quay gọi tên ngẫu nhiên với âm thanh cổ vũ, hiệu ứng pháo hoa chúc mừng.
   - Đồng hồ đếm ngược với âm thanh chuông báo hiệu khi hết giờ làm bài.
6. **Thời khóa biểu & Lịch báo giảng:**
   - Đọc thời khóa biểu từ Excel, hiển thị lịch học hôm nay.
   - Lịch báo giảng theo từng tiết học trong tuần.
7. **Sổ theo dõi & Báo cáo:**
   - Báo cáo tổng kết tuần, bảng xếp hạng tổ thi đua.
   - Xuất phiếu đánh giá, báo cáo PDF định dạng chuẩn để in ấn.
8. **Trạm Đồng Hành (Tái cấu trúc bảo mật):**
   - Hồ sơ theo dõi học sinh cần biện pháp giáo dục đặc biệt (nhưng phải chuyển sang lưu trữ mã hóa và phân quyền riêng tư tuyệt đối).
9. **Cổng Phụ huynh / Học sinh (Tái cấu trúc bảo mật):**
   - Phụ huynh tra cứu điểm số, nề nếp, lời phê của con mà không xem được thông tin của học sinh khác.

---
*Báo cáo kiểm toán được lập bởi AI Lead Engineer để làm căn cứ thiết kế Kiến trúc Sản phẩm tại `docs/01-product-requirements.md`.*
