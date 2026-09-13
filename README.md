# 🏫 Web-GVCN: Hệ Thống Quản Lý Giáo Viên Chủ Nhiệm Thông Minh

[![CI/CD Pipeline](https://github.com/bopv2848/Web-GVCN/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/bopv2848/Web-GVCN/actions/workflows/test.yml)
[![Version](https://img.shields.io/badge/Phiên_bản-v2.2.0-blue.svg)](https://github.com/bopv2848/Web-GVCN)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0_Passed-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Zod Validated](https://img.shields.io/badge/Zod-Schema_Safe-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)

> Ứng dụng trợ lý số toàn diện hỗ trợ Giáo viên chủ nhiệm quản lý học sinh, chuyên cần, sơ đồ chỗ ngồi thông minh, sổ cái thi đua minh bạch và kết nối phụ huynh trực tuyến.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. 🪑 Sơ Đồ Chỗ Ngồi Thông Minh 4 Dãy
- Hiển thị trực quan 4 dãy bàn học theo chuẩn phòng học THCS Tân Hải.
- **Hoán đổi chỗ ngồi 1 chạm**: Kéo thả hoặc chọn 2 học sinh để đổi chỗ tức thì.
- **Tự động xoay chỗ tuần chẵn/lẻ**: Hỗ trợ xoay bàn chống cận thị và lệch cột sống theo chu kỳ thời gian.
- **Xem nhanh bệnh án y tế**: Biểu tượng cảnh báo bệnh lý (cận thị, tim mạch, dị ứng) trực tiếp trên ghế ngồi.

### 2. 📅 Điểm Danh Chuyên Cần & Cảnh Báo Dịch Tễ
- Hỗ trợ điểm danh 2 buổi Sáng / Chiều mỗi ngày.
- Ghi chú lý do vắng (có phép / không phép / đi trễ) và triệu chứng sức khỏe.
- **Cảnh báo dịch tễ thông minh**: Tự động phát hiện khi có nhiều học sinh cùng lớp sốt/nghỉ ốm để GVCN kịp thời xử lý.
- Sổ tổng hợp chuyên cần theo tháng chuẩn hóa.

### 3. ⭐ Sổ Cái Thi Đua 40 Tiêu Chí Minh Bạch
- 40 tiêu chí cộng/trừ điểm toàn diện (học tập, nề nếp, đạo đức, phong trào).
- Cơ chế sổ cái Append-only (chỉ ghi thêm, không xóa cứng) chống chỉnh sửa gian lận điểm số.
- Vinh danh Top 5 học sinh xuất sắc và Top tổ tiêu biểu theo tuần/tháng.

### 4. 👨‍👩‍👧 Cổng Tra Cứu Phục Vụ Phụ Huynh (Parent Portal)
- Phụ huynh tra cứu tiến độ học tập và rèn luyện của con bằng mã định danh bảo mật.
- Mã hóa tên học sinh khác (`N*** A***`) để bảo vệ quyền riêng tư trong lớp học.

### 5. 💾 Sao Lưu & Phục Hồi Dữ Liệu An Toàn Tuyệt Đối
- **Xuất toàn bộ dữ liệu ra 1 file JSON**: 47 học sinh, sơ đồ lớp, điểm danh và sổ điểm thi đua.
- **Kiểm định an toàn Zod Schema**: Ngăn chặn 100% tệp rác, file sai cấu trúc hoặc file giả mạo.
- **Phục hồi có chọn lọc (Selective Restore)**: Tự do chọn nạp lại riêng từng phân hệ theo Checkbox.
- **Tự động chụp bản sao lưu dự phòng (Pre-restore Auto-Backup) kèm nút "Hoàn tác" (Undo)**: Không bao giờ sợ mất dữ liệu khi lỡ nạp nhầm file cũ.

---

## 🛡️ Quy Trình CI/CD Tự Động (GitHub Actions)

Dự án được bảo vệ bằng hệ thống **Cổng kiểm định chất lượng (Quality Gate)**:
- **Tự động kiểm tra cú pháp (Linting)**: Đảm bảo 0 lỗi ESLint và chuẩn hóa Clean Code.
- **Tự động kiểm thử đơn vị (19 bộ tests - 59 test cases)**: Xác thực các thuật toán điểm danh, xoay chỗ ngồi, thẩm định schema và sao lưu dự phòng.
- **Tự động biên dịch (TypeScript & Vite Build)**: Đảm bảo ứng dụng đóng gói hoàn hảo trước khi phát hành.
- **Continuous Deployment**: Chỉ triển khai lên Hosting (Vercel / Netlify) khi toàn bộ bài test đạt `100% PASS`.

---

## 💻 Cài Đặt & Chạy Cục Bộ (Local Development)

### Yêu cầu môi trường
- Node.js >= 20.x
- npm >= 10.x

### Các bước cài đặt
```bash
# 1. Clone kho lưu trữ
git clone https://github.com/bopv2848/Web-GVCN.git
cd Web-GVCN

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Khởi chạy máy chủ phát triển (Dev Server)
npm run dev

# 4. Chạy kiểm thử tự động
npm test

# 5. Đóng gói sản phẩm cho môi trường Production
npm run build
```

---

## 📐 Kiến Trúc Dự Án (Clean Architecture)

- Tuân thủ **14 Nguyên tắc thiết kế code** của dự án.
- Giới hạn độ dài tệp tin: **100% các tệp mã nguồn đều < 300 dòng**.
- Phân tách theo Tính năng (Feature-based structure):
  - `src/features/students`: Quản lý hồ sơ 47 học sinh & các tổ
  - `src/features/seating`: Quản lý sơ đồ lớp học & xoay chỗ ngồi
  - `src/features/attendance`: Điểm danh chuyên cần & dịch tễ
  - `src/features/points`: Sổ cái thi đua & xếp hạng học sinh
  - `src/features/settings`: Cấu hình lớp & Hệ thống Sao lưu / Phục hồi JSON
  - `src/features/parent-portal`: Cổng phụ huynh tra cứu bảo mật

---

## 📄 Bản Quyền & Giấy Phép

Phát triển bởi Thầy & Hệ thống Hỗ trợ Trợ lý AI GVCN - Trường THCS Tân Hải.
