# TỪ ĐIỂN DỮ LIỆU & ĐẶC TẢ SCHEMA SUPABASE (DATABASE SCHEMA DICTIONARY)
**Dự án:** Hệ thống Quản trị Lớp học Web-GVCN (Phase 2 Database Layer)  
**Tác giả:** AI Lead Engineer & Database Specialist  
**Ngày cập nhật:** 27/08/2026  
**Trạng thái:** Đã hoàn thiện Migration & Bật RLS 100%  

---

## 1. TỔNG QUAN HẠ TẦNG DỮ LIỆU

Hệ thống cơ sở dữ liệu được xây dựng trên nền tảng **PostgreSQL 15+ (Supabase)**, thiết kế theo mô hình **Đa thực thể (Multi-tenant Architecture)**:
- **Tầng Trường học:** `schools`, `academic_years`, `school_memberships`.
- **Tầng Lớp học & Thành viên:** `classes`, `class_memberships`, `groups`.
- **Tầng Học sinh & Gia đình:** `students`, `student_guardians`, `profiles`.
- **Tầng Sổ cái Thi đua (Append-only Ledger):** `point_categories`, `point_transactions`.
- **Tầng Chuyên cần:** `attendance_sessions`, `attendance_records`.
- **Tầng Shop Đổi quà:** `rewards`, `reward_redemptions`.
- **Tầng Tiện ích Tiết học:** `seat_layouts`, `seat_assignments`, `timetable_entries`, `tasks`, `class_milestones`.
- **Tầng Dữ liệu Nhạy cảm (Companion Vault):** `companion_cases`, `companion_updates`.
- **Tầng Kiểm toán Hệ thống:** `audit_logs`.

---

## 2. DANH MỤC CHI TIẾT 23 BẢNG DỮ LIỆU

### 2.1. Nhóm Bảng Trường & Niên Khóa
1. **`schools`**: Danh mục trường học (`id`, `name`, `code`, `address`, `logo_url`, `created_at`, `updated_at`).
2. **`academic_years`**: Niên khóa học tập (`id`, `school_id`, `name`, `start_date`, `end_date`, `is_active`).
3. **`profiles`**: Hồ sơ người dùng liên kết với `auth.users` (`id`, `full_name`, `email`, `phone`, `avatar_url`, `system_role`).
4. **`school_memberships`**: Vai trò cấp trường của giáo viên/BGH (`id`, `school_id`, `profile_id`, `role`).

### 2.2. Nhóm Bảng Lớp học & Học sinh
5. **`classes`**: Thông tin lớp học, nhận diện và cấu hình theme (`id`, `school_id`, `academic_year_id`, `name`, `grade_level`, `banner_url`, `theme_config`, `settings`, `deleted_at`).
6. **`class_memberships`**: Phân công vai trò của người dùng trong từng lớp (`id`, `class_id`, `profile_id`, `role`, `permissions`).
7. **`groups`**: 4 tổ thi đua trong lớp (`id`, `class_id`, `name`, `color_class`, `avatar_url`, `order_index`).
8. **`students`**: Danh sách học sinh (`id`, `class_id`, `group_id`, `full_name`, `gender`, `birth_date`, `class_role`, `avatar_url`, `goals`, `talents`, `boarding_type`, `code`, `deleted_at`).
9. **`student_guardians`**: Liên kết Phụ huynh - Học sinh qua Token bảo mật (`id`, `student_id`, `guardian_profile_id`, `relationship`, `invite_token`, `token_expires_at`, `status`).

### 2.3. Nhóm Bảng Điểm thi đua (Append-only Ledger)
10. **`point_categories`**: Danh mục tiêu chí cộng/trừ điểm (`id`, `class_id`, `type`, `category_group`, `title`, `default_points`, `default_stars`).
11. **`point_transactions`**: Sổ cái giao dịch điểm nối tiếp (`id`, `class_id`, `student_id`, `category_id`, `points`, `stars`, `reason`, `note`, `occurred_at`, `created_by`, `reversal_of_id`).
    - *Ràng buộc:* Cấm hoàn toàn `UPDATE` và `DELETE`. Hoàn tác bắt buộc tạo bản ghi đảo ngược dấu có liên kết `reversal_of_id`.

### 2.4. Nhóm Bảng Chuyên cần
12. **`attendance_sessions`**: Phiên điểm danh theo ngày (`id`, `class_id`, `session_date`, `session_type`, `is_locked`, `created_by`).
13. **`attendance_records`**: Chi tiết trạng thái điểm danh học sinh (`id`, `session_id`, `student_id`, `status`, `note`, `updated_by`).

### 2.5. Nhóm Bảng Shop Quà, Sơ đồ, Thời khóa biểu & Tiết học
14. **`rewards`**: Quà tặng trong shop sao (`id`, `class_id`, `name`, `star_cost`, `stock_quantity`, `image_url`, `is_active`).
15. **`reward_redemptions`**: Lịch sử đổi quà trừ sao (`id`, `class_id`, `student_id`, `reward_id`, `stars_spent`, `status`).
16. **`seat_layouts`**: Cấu hình ma trận phòng học (`id`, `class_id`, `layout_name`, `rows`, `cols`, `is_current`).
17. **`seat_assignments`**: Vị trí chỗ ngồi của học sinh (`id`, `layout_id`, `student_id`, `row_index`, `col_index`, `is_hidden`).
18. **`timetable_entries`**: Dữ liệu thời khóa biểu & lịch báo giảng (`id`, `class_id`, `day_of_week`, `period`, `subject_name`, `lesson_topic`, `teacher_name`, `notes`).
19. **`tasks`**: Nhiệm vụ/Checklist lớp học (`id`, `class_id`, `title`, `is_completed`, `priority`, `due_date`).
20. **`class_milestones`**: Cột mốc & kỷ niệm của lớp (`id`, `class_id`, `title`, `event_date`, `description`, `image_url`).

### 2.6. Nhóm Bảng Bảo mật Nhạy cảm & Kiểm toán
21. **`companion_cases`**: Hồ sơ học sinh cần hỗ trợ đặc biệt (`id`, `class_id`, `student_id`, `start_date`, `status`, `severity_level`, `primary_concern`, `action_plan`, `created_by`, `deleted_at`).
22. **`companion_updates`**: Tiến trình can thiệp & làm việc gia đình (`id`, `case_id`, `update_date`, `observation_notes`, `interaction_summary`, `created_by`).
23. **`audit_logs`**: Nhật ký bảo mật toàn hệ thống (`id`, `actor_id`, `action`, `target_resource`, `target_id`, `ip_address`, `user_agent`, `payload`).
