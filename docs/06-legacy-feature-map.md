# BẢNG ÁNH XẠ TÍNH NĂNG NGUYÊN MẪU SANG KIẾN TRÚC MỚI (LEGACY FEATURE MAP)
**Dự án:** Hệ thống Quản trị Lớp học Web-GVCN  
**Phiên bản:** 2.0 (Phase 1 Foundation)  
**Tác giả:** AI Lead Engineer & Product Architect  
**Trạng thái:** Đã hoàn thành Giai đoạn 1  

---

## 1. BẢNG TỔNG HỢP ÁNH XẠ TÍNH NĂNG (FEATURE TRACEABILITY MATRIX)

| STT | Tính năng trong `Index.html` cũ | Module / Route trong Kiến trúc mới (React + TS) | File Component mới | Trạng thái hiện tại | Kế hoạch hoàn thành |
|---|---|---|---|:---:|:---:|
| 1 | **Khởi tạo & App Shell** | Layout chính, Sidebar, Header, Mobile Drawer, Bottom Nav | `src/components/layout/AppLayout.tsx` | ✅ Đã dựng xong App Shell | Phase 1 (Hiện tại) |
| 2 | **Xác thực & Mật khẩu** | Supabase Auth, JWT Session, Protected Route | `src/features/auth/pages/LoginPage.tsx` | 🟡 Giao diện mẫu, sẵn sàng kết nối DB | Phase 3 (Supabase Auth) |
| 3 | **Trang chủ & Tổng quan** | Dashboard thống kê thực, thẻ KPI, nhiệm vụ tuần | `src/features/dashboard/pages/DashboardPage.tsx` | 🟡 App Shell + Empty State | Phase 4 & Phase 5 |
| 4 | **Quản lý Học sinh & Tổ** | Danh sách HS, modal hồ sơ, import Excel preview | `src/features/students/pages/StudentsPage.tsx` | 🟡 App Shell + Empty State | Phase 4 (Students CRUD) |
| 5 | **Tích điểm & Khen thưởng** | Form tích điểm đa năng, Sổ cái Append-only, Reversal | `src/features/points/pages/PointsPage.tsx` | 🟡 App Shell + Empty State | Phase 5 (Point Ledger) |
| 6 | **Shop Quà tặng & Đổi sao** | Catalog quà, trừ tồn kho, trừ sao minh bạch | `src/features/rewards/pages/RewardsPage.tsx` | 🟡 App Shell + Empty State | Phase 5 (Rewards) |
| 7 | **Điểm danh Chuyên cần** | Điểm danh theo ngày, 1 chạm cả lớp, thống kê chuyên cần | `src/features/attendance/pages/AttendancePage.tsx` | 🟡 App Shell + Empty State | Phase 5 (Attendance) |
| 8 | **Sơ đồ Chỗ ngồi** | Bố trí bàn học, kéo thả touch/mouse, xếp nam nữ | `src/features/seating/pages/SeatingPage.tsx` | 🟡 App Shell + Empty State | Phase 7 (Seating Tools) |
| 9 | **Thời khóa biểu** | TKB tuần, parse Excel thời khóa biểu có cấu trúc | `src/features/timetable/pages/TimetablePage.tsx` | 🟡 App Shell + Empty State | Phase 7 (Timetable) |
| 10 | **Lịch Báo giảng** | Lịch dạy tuần hợp nhất (loại bỏ 3 hàm trùng lặp) | `src/features/teaching-plan/pages/TeachingPlanPage.tsx` | 🟡 App Shell + Empty State | Phase 7 (Teaching Plan) |
| 11 | **Công cụ Tiết học** | Vòng quay 3D, Chuông Tone.js, Timer đếm ngược (đã sửa) | `src/features/classroom-tools/pages/ClassroomToolsPage.tsx` | 🟡 App Shell + Empty State | Phase 7 (Interactive Tools)|
| 12 | **Sổ theo dõi & Báo cáo** | Tổng hợp tuần/tháng/kỳ (số liệu thật), xuất PDF | `src/features/reports/pages/ReportsPage.tsx` | 🟡 App Shell + Empty State | Phase 5 (Reports & PDF) |
| 13 | **Trạm Đồng hành (Bảo mật)**| Hồ sơ học sinh nhạy cảm, RLS chặn BCS/PH, Audit log | `src/features/companion/pages/CompanionPage.tsx` | 🟡 Route Guard + Shell | Phase 6 (Companion Vault) |
| 14 | **Cổng Phụ huynh** | Tra cứu kết quả học sinh qua Token bảo mật | `src/features/parent-portal/pages/ParentPortalPage.tsx` | 🟡 App Shell + Empty State | Phase 6 (Parent Portal) |
| 15 | **Cài đặt & Di chuyển** | Đổi màu theme, banner, tool nhập JSON cũ | `src/features/settings/pages/SettingsPage.tsx` | 🟡 App Shell + Empty State | Phase 4 & Phase 8 |

---

## 2. KẾ TOÁN BẢO TOÀN NGUYÊN MẪU (PRESERVATION RECORD)
- Bản gốc `Index.html` (5.788 dòng) và `CODE GVCN CẬP NHẬT MỚI NHẤT 23.8.md` đã được sao lưu nguyên vẹn 100% vào thư mục `legacy/`.
- Không có bất kỳ logic nghiệp vụ cũ nào bị xóa bỏ khỏi lộ trình; toàn bộ tính năng đều có vị trí module và route định danh rõ ràng trong cấu trúc mới.
