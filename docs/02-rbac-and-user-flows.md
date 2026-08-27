# MA TRẬN PHÂN QUYỀN & LUỒNG THAO TÁC NGƯỜI DÙNG (RBAC & USER FLOWS)
**Dự án:** Hệ thống Quản trị Lớp học Web-GVCN (Bản Production)  
**Tác giả:** AI Lead Engineer & Product Architect  
**Trạng thái:** Chờ chủ dự án duyệt kiến trúc  

---

## 1. MA TRẬN PHÂN QUYỀN TOÀN DIỆN (RBAC MATRIX)

Ký hiệu:
- ✅ **Toàn quyền / Có phép**
- 🔶 **Phép có điều kiện / Phạm vi giới hạn** (vd: chỉ sửa của mình tạo, chỉ xem con mình)
- ❌ **Cấm tuyệt đối**

| Tài nguyên / Nghiệp vụ | Thao tác | 1. GVCN (Chủ nhiệm) | 2. BCS (Ban cán sự) | 3. BGH (Ban giám hiệu) | 4. Học sinh | 5. Phụ huynh | 6. Quản trị viên (Admin) |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Hồ sơ lớp & Nhận diện** | Xem cấu hình | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| (Banner, Tên lớp, Slogan) | Cập nhật / Tải ảnh | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Danh sách học sinh** | Xem danh sách | ✅ | ✅ | ✅ | 🔶 (Công khai lớp) | 🔶 (Chỉ xem con) | ✅ |
| (Tên, ngày sinh, tổ, avatar)| Thêm / Sửa / Nhập Excel | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Xóa mềm / Khôi phục | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Giao dịch Điểm thi đua** | Xem sổ điểm | ✅ | ✅ | ✅ | 🔶 (Chỉ điểm mình) | 🔶 (Chỉ điểm con) | ✅ |
| (Cộng/Trừ điểm, Đổi quà) | Ghi nhận điểm mới | ✅ | 🔶 (Nếu GV cấp quyền) | ❌ | ❌ | ❌ | ❌ |
| | Hoàn tác (Tạo Reversal)| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Điểm danh Chuyên cần** | Xem bảng điểm danh | ✅ | ✅ | ✅ | 🔶 (Chỉ ngày mình) | 🔶 (Chỉ ngày con) | ✅ |
| | Điểm danh theo ngày | ✅ | 🔶 (Nếu GV cấp quyền) | ❌ | ❌ | ❌ | ❌ |
| **Sơ đồ chỗ ngồi & TKB** | Xem sơ đồ, TKB | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Xếp chỗ, Kéo thả, Sửa TKB| ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Lịch báo giảng** | Xem lịch dạy | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| | Lập / Sửa lịch dạy | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Báo cáo & Xuất PDF** | Xem tổng hợp tuần/tháng| ✅ | 🔶 (Xem bảng điểm) | ✅ | ❌ | ❌ | ✅ |
| | Xuất file PDF / Excel | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Trạm đồng hành (Nhạy cảm)**| Xem hồ sơ hỗ trợ | ✅ | ❌ CẤM | 🔶 (Nếu được duyệt)| ❌ CẤM | ❌ CẤM | ❌ CẤM (Trừ Audit) |
| (Vi phạm, can thiệp, tâm lý) | Tạo mới / Cập nhật ca | ✅ | ❌ CẤM | ❌ CẤM | ❌ CẤM | ❌ CẤM | ❌ CẤM |
| | Đóng hồ sơ (Completed) | ✅ | ❌ CẤM | ❌ CẤM | ❌ CẤM | ❌ CẤM | ❌ CẤM |
| **Liên kết Phụ huynh** | Tạo mã mời / QR Code | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| | Kích hoạt liên kết | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 2. SITEMAP ĐIỀU HƯỚNG THEO TỪNG VAI TRÒ (ROLE-BASED SITEMAP)

```mermaid
graph TD
    subgraph GVCN_NAV [1. Navigation Dành cho GVCN]
        GV1[🏠 Trang chủ Tổng quan]
        GV2[👥 Học sinh & Phân tổ]
        GV3[⭐ Tích điểm & Thi đua]
        GV4[🎁 Shop Sao Đổi quà]
        GV5[📅 Điểm danh Chuyên cần]
        GV6[🪑 Sơ đồ Chỗ ngồi]
        GV7[🗓️ Thời khóa biểu & Báo giảng]
        GV8[🎲 Bộ công cụ Tiết học - Vòng quay, Chuông, Timer]
        GV9[📊 Sổ theo dõi & Xuất Báo cáo]
        GV10[🛡️ Trạm Đồng hành - Bảo mật cao]
        GV11[⚙️ Cài đặt Lớp & Sao lưu]
    end

    subgraph BCS_NAV [2. Navigation Dành cho Ban Cán Sự]
        BCS1[🏠 Trang chủ Tổng quan - Rút gọn]
        BCS2[👥 Danh sách Học sinh - Chỉ xem]
        BCS3[⭐ Ghi điểm nhiệm vụ - Được cấp quyền]
        BCS4[📅 Điểm danh Tổ/Lớp - Được cấp quyền]
        BCS5[🪑 Sơ đồ lớp & TKB - Chỉ xem]
        BCS6[🎲 Vòng quay gọi tên]
    end

    subgraph PARENT_NAV [3. Cổng Phụ huynh / Học sinh]
        P1[🏠 Hồ sơ Học sinh - Con mình]
        P2[📅 Lịch sử Chuyên cần của Con]
        P3[⭐ Bảng thành tích & Lịch sử Điểm]
        P4[🎁 Đăng ký Đổi quà từ Sao]
        P5[💬 Sổ liên lạc - Nhận xét từ GVCN]
    end
```

---

## 3. LUỒNG THAO TÁC NGƯỜI DÙNG CHI TIẾT (USER FLOWS)

### 3.1. Luồng Xác thực & Đăng nhập Hệ thống (Auth Flow)
```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as Frontend (React App)
    participant Guard as Auth / Route Guard
    participant Supabase as Supabase Auth & DB
    
    User->>App: Mở trang web ứng dụng
    App->>Supabase: Kiểm tra Session Token (JWT)
    alt Chưa đăng nhập hoặc Hết phiên
        Supabase-->>App: Không có Session hợp lệ
        App->>User: Hiển thị Màn hình Đăng nhập (Email/Password hoặc Magic Link)
        User->>App: Nhập thông tin xác thực
        App->>Supabase: supabase.auth.signInWithPassword(...)
        Supabase-->>App: Trả về Session + User Profile + Class Memberships
        App->>Guard: Xác định vai trò (Role: GVCN, BCS, BGH, PH)
        Guard-->>App: Nạp Theme và Menu theo Role
        App->>User: Điều hướng vào Dashboard tương ứng
    else Đã có Session hợp lệ
        Supabase-->>App: Session hợp lệ
        App->>User: Vào thẳng Dashboard với Role đã cấp
    end
```

---

### 3.2. Luồng Quản lý Học sinh & Nhập danh sách từ Excel
```mermaid
sequenceDiagram
    autonumber
    actor GVCN as Giáo viên Chủ nhiệm
    participant UI as Giao diện Học sinh
    participant Parser as Excel Parser (SheetJS + Zod)
    participant Storage as Supabase Storage
    participant DB as PostgreSQL Database

    GVCN->>UI: Bấm "Nhập danh sách Excel" & Kéo thả file .xlsx
    UI->>Parser: Đọc dữ liệu file thô
    Parser->>Parser: Ánh xạ cột & Validate bằng Zod Schema
    alt Dữ liệu có lỗi (Sai định dạng ngày, thiếu tên, tổ không hợp lệ)
        Parser-->>UI: Báo đỏ danh sách dòng lỗi chi tiết
        UI-->>GVCN: Hiển thị cảnh báo để GVCN sửa hoặc bỏ qua dòng lỗi
    else Dữ liệu hợp lệ
        Parser-->>UI: Hiển thị bảng Xem trước (Preview Grid)
        GVCN->>UI: Kiểm tra và bấm "Xác nhận ghi vào Lớp"
        UI->>DB: Bulk Insert vào bảng `students` (kèm `class_id`)
        DB-->>UI: Ghi thành công 45 học sinh
        UI->>GVCN: Thông báo thành công và cập nhật ngay danh sách
    end
```

---

### 3.3. Luồng Tích điểm & Hoàn tác Giao dịch (Point Ledger & Reversal Flow)
```mermaid
sequenceDiagram
    autonumber
    actor User as GVCN / BCS được ủy quyền
    participant UI as Form Tích điểm
    participant DB as Database (Point Transactions)
    
    User->>UI: Chọn đối tượng (Học sinh/Tổ/Cả lớp), chọn Tiêu chí, nhập Lý do
    UI->>DB: INSERT INTO point_transactions (student_id, points, stars, reason, created_by)
    DB-->>UI: Giao dịch được lưu (Status: Active)
    UI->>User: Phát âm thanh Ting-Ting & Bắn pháo hoa Confetti (nếu điểm cộng)
    
    opt Khi phát hiện nhập sai cần Hoàn tác
        GVCN->>UI: Mở lịch sử điểm của học sinh -> Bấm nút "Hoàn tác"
        UI->>User: Yêu cầu xác nhận hoàn tác giao dịch gốc #101
        User->>UI: Xác nhận
        UI->>DB: INSERT INTO point_transactions (points = -gốc, stars = -gốc, reversal_of_id = #101, reason = 'Hoàn tác giao dịch #101')
        DB-->>UI: Bản ghi đảo được ghi nhận
        UI->>User: Cập nhật tổng điểm đã khấu trừ, hiển thị gạch ngang bản ghi cũ
    end
```

---

### 3.4. Luồng Điểm danh Chuyên cần theo ngày
```mermaid
flowchart TD
    Start([Bắt đầu ngày học]) --> OpenAtt[GVCN / BCS mở Tab Điểm danh]
    OpenAtt --> CheckDate{Hôm nay đã có Session chưa?}
    CheckDate -- Chưa --> InitSession[Khởi tạo Session ngày hôm nay]
    CheckDate -- Đã có --> LoadSession[Tải trạng thái hiện tại]
    
    InitSession --> ChoiceAction{Chọn cách điểm danh}
    LoadSession --> ChoiceAction
    
    ChoiceAction -- Điểm danh nhanh --> QuickAll[Bấm 'Tất cả Có mặt']
    QuickAll --> BulkSave[Cập nhật 100% Present vào DB]
    
    ChoiceAction -- Điểm danh từng bạn --> SelectStatus[Chọn từng HS: Vắng phép / Không phép / Đi muộn]
    SelectStatus --> SingleSave[Lưu bản ghi `attendance_records`]
    
    BulkSave --> StatCompute[Header cập nhật: Sĩ số 45/45 - Hiện diện 100%]
    SingleSave --> StatCompute
    StatCompute --> End([Hoàn thành điểm danh])
```

---

### 3.5. Luồng Cổng Phụ huynh Liên kết & Tra cứu (Secure Parent Flow)
```mermaid
sequenceDiagram
    autonumber
    actor GVCN as Giáo viên Chủ nhiệm
    actor PH as Phụ huynh Học sinh
    participant Web as Web-GVCN App
    participant DB as Supabase DB

    GVCN->>Web: Tạo "Mã mời / QR Code liên kết" cho Học sinh A (Token thời hạn 7 ngày)
    Web-->>GVCN: Trả về link hoặc QR code mời phụ huynh
    GVCN->>PH: Gửi mã QR qua Zalo/Giấy báo đầu năm
    PH->>Web: Quét mã QR / Truy cập link mời
    Web->>PH: Yêu cầu Đăng nhập tài khoản Phụ huynh (hoặc xác thực SĐT OTP)
    PH->>Web: Hoàn tất xác thực
    Web->>DB: INSERT INTO student_guardians (guardian_id, student_id, status = 'verified')
    DB-->>Web: Liên kết thành công
    Web->>PH: Mở bảng tổng hợp: Điểm thi đua, chuyên cần, nhận xét của riêng con
    PH-->>Web: Không thể xem dữ liệu của bất kỳ học sinh nào khác trong lớp (RLS enforce)
```

---

### 3.6. Luồng Xử lý Ngoại lệ, Mất mạng & Lỗi Phiên (Error & Resilience Flows)

1. **Mất kết nối Internet khi đang trên lớp (Offline Resilience):**
   - Khi mất mạng, giao diện hiển thị thanh Banner vàng cảnh báo: *"Đang mất kết nối Internet. Thao tác điểm danh tạm thời được lưu cục bộ trên bộ nhớ đệm an toàn (IndexedDB)."*
   - Khi có kết nối trở lại, hệ thống tự động đẩy hàng đợi (Sync Queue) lên Supabase và hiển thị Toast xanh thông báo hoàn tất.
2. **Hết hạn phiên đăng nhập (Session Expired):**
   - Supabase SDK tự động làm mới JWT qua Refresh Token ở chế độ nền.
   - Nếu Refresh Token hết hạn (quá 30 ngày), modal nhỏ yêu cầu nhập lại mật khẩu hiện lên ngay trên màn hình hiện tại mà không làm mất dữ liệu form đang nhập dở.
3. **Cố tình truy cập trái phép đường dẫn URL (Unauthorized Route Access):**
   - Nếu tài khoản BCS hoặc PH gõ trực tiếp URL `/companion` (Trạm đồng hành), `PermissionGuard` chặn ngay lập tức và điều hướng về `/403-forbidden` kèm thông báo: *"Bạn không có quyền truy cập khu vực này. Sự việc đã được ghi nhận vào nhật ký kiểm toán."*
