-- ============================================================================
-- SUPABASE SEED DATA (CHỈ DÀNH CHO MÔI TRƯỜNG PHÁT TRIỂN & TEST NỘI BỘ)
-- TUYỆT ĐỐI KHÔNG CHẠY FILE NÀY TRÊN MÔI TRƯỜNG PRODUCTION CỦA TRƯỜNG HỌC
-- ============================================================================

-- 1. Trường học & Niên khóa
INSERT INTO public.schools (id, name, code, address)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'THCS TÂN HẢI', 'THCS-TH', 'Xã Tân Hải, Tỉnh Lâm Đồng')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.academic_years (id, school_id, name, start_date, end_date, is_active)
VALUES 
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '2026 - 2027', '2026-09-01', '2027-05-31', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Hồ sơ người dùng mẫu
INSERT INTO public.profiles (id, full_name, email, system_role)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'Thầy Phan Văn Bộ', 'phanvanbo.6a6@thcs-tanhai.edu.vn', 'teacher'),
    ('a0000000-0000-0000-0000-000000000002', 'Em Lớp Trưởng 6A6', 'lop_truong.6a6@thcs-tanhai.edu.vn', 'student'),
    ('a0000000-0000-0000-0000-000000000003', 'Thầy Hiệu Trưởng', 'hieutruong@thcs-tanhai.edu.vn', 'teacher'),
    ('a0000000-0000-0000-0000-000000000004', 'Bác Phụ Huynh Học Sinh', 'phuhuynh.6a6@gmail.com', 'parent')
ON CONFLICT (id) DO NOTHING;

-- 3. Lớp học 6A6 & Phân vai
INSERT INTO public.classes (id, school_id, academic_year_id, name, grade_level, theme_config)
VALUES 
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'LỚP 6A6', 6, '{
        "month": "CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG",
        "title": "CHUYẾN TÀU THANH XUÂN 6A6 • GVCN THẦY PHAN VĂN BỘ",
        "bannerColorClass": "from-[#1e1b4b] to-[#312e81]"
    }'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.class_memberships (class_id, profile_id, role)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000001', 'gvcn'),
    ('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000002', 'bancansu'),
    ('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000003', 'bgh_viewer')
ON CONFLICT DO NOTHING;

-- 4. 4 Tổ thi đua mặc định
INSERT INTO public.groups (id, class_id, name, color_class, order_index)
VALUES 
    ('44444444-0001-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Tổ 1', 'text-red-500', 1),
    ('44444444-0002-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Tổ 2', 'text-green-500', 2),
    ('44444444-0003-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'Tổ 3', 'text-yellow-500', 3),
    ('44444444-0004-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'Tổ 4', 'text-blueAccent', 4)
ON CONFLICT DO NOTHING;

-- 5. Học sinh mẫu
INSERT INTO public.students (id, class_id, group_id, full_name, gender, birth_date, class_role, goals)
VALUES 
    ('55555555-0001-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', '44444444-0001-0000-0000-000000000001', 'Nguyễn Văn An', 'Nam', '2008-03-15', 'Thành viên', 'Đỗ Đại học Bách Khoa'),
    ('55555555-0002-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', '44444444-0001-0000-0000-000000000001', 'Trần Thị Bình', 'Nữ', '2008-07-20', 'Tổ trưởng', 'IELTS 7.5'),
    ('55555555-0003-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', '44444444-0002-0000-0000-000000000002', 'Lê Hoàng Cường', 'Nam', '2008-11-05', 'Lớp phó', 'Giải Ba HSG Cấp Tỉnh'),
    ('55555555-0004-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', '44444444-0002-0000-0000-000000000002', 'Phạm Quỳnh Dung', 'Nữ', '2008-01-12', 'Thành viên', 'Học sinh xuất sắc')
ON CONFLICT (id) DO NOTHING;

-- 6. Tiêu chí điểm mẫu
INSERT INTO public.point_categories (id, class_id, type, category_group, title, default_points, default_stars)
VALUES 
    ('66666666-0001-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'add', 'Học tập', 'Phát biểu xây dựng bài tích cực', 2, 2),
    ('66666666-0002-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'add', 'Học tập', 'Đạt điểm 9, 10 bài kiểm tra', 5, 5),
    ('66666666-0003-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'subtract', 'Nề nếp', 'Đi học muộn không lý do', -2, 0),
    ('66666666-0004-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'subtract', 'Nề nếp', 'Không làm bài tập về nhà', -3, 0)
ON CONFLICT (id) DO NOTHING;

-- 7. Giao dịch điểm mẫu (Ledger)
INSERT INTO public.point_transactions (class_id, student_id, category_id, points, stars, reason, created_by)
VALUES 
    ('33333333-3333-3333-3333-333333333333', '55555555-0001-0000-0000-000000000001', '66666666-0001-0000-0000-000000000001', 2, 2, 'Phát biểu bài Toán tích cực', 'a0000000-0000-0000-0000-000000000001'),
    ('33333333-3333-3333-3333-333333333333', '55555555-0002-0000-0000-000000000002', '66666666-0002-0000-0000-000000000002', 5, 5, 'Điểm 10 miệng môn Văn', 'a0000000-0000-0000-0000-000000000001');

-- 8. Quà tặng mẫu trong Shop
INSERT INTO public.rewards (class_id, name, star_cost, stock_quantity)
VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Bút bi gel cao cấp', 10, 20),
    ('33333333-3333-3333-3333-333333333333', 'Sổ tay thanh xuân A5', 25, 10),
    ('33333333-3333-3333-3333-333333333333', 'Vé miễn trực nhật 1 buổi', 50, 5)
ON CONFLICT DO NOTHING;
