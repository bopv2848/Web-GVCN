-- ============================================================================
-- WEB-GVCN 2.0: MIGRATION 14 - TÁCH BIỆT DỮ LIỆU TEST VÀ PRODUCTION TRÊN SUPABASE
-- Thầy mở Supabase Dashboard -> Vào mục SQL Editor -> Bấm "New Query" -> Dán đoạn mã này và bấm RUN
-- ============================================================================

-- 1. Thêm cờ is_demo vào bảng classes để phân biệt Lớp thật và Lớp thử nghiệm
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- Đánh chỉ mục (Index) trên cột is_demo để tăng tốc truy vấn lọc
CREATE INDEX IF NOT EXISTS idx_classes_is_demo ON public.classes (is_demo);

-- 2. Tự động tìm trường học & niên khóa đã có trong database để tạo Lớp Thử Nghiệm
-- (Khắc phục triệt để lỗi trùng mã code THCS-TH bằng cách tái sử dụng bản ghi thực tế)
DO $$
DECLARE
    v_school_id UUID;
    v_year_id UUID;
BEGIN
    -- Tìm trường học thực tế đã tồn tại
    SELECT id INTO v_school_id FROM public.schools WHERE code = 'THCS-TH' LIMIT 1;
    IF v_school_id IS NULL THEN
        SELECT id INTO v_school_id FROM public.schools LIMIT 1;
    END IF;
    IF v_school_id IS NULL THEN
        INSERT INTO public.schools (id, name, code, address)
        VALUES ('11111111-1111-1111-1111-111111111111', 'THCS TÂN HẢI', 'THCS-TH', 'Xã Tân Hải, Tỉnh Lâm Đồng')
        RETURNING id INTO v_school_id;
    END IF;

    -- Tìm niên khóa thực tế liên kết với trường này
    SELECT id INTO v_year_id FROM public.academic_years WHERE school_id = v_school_id LIMIT 1;
    IF v_year_id IS NULL THEN
        SELECT id INTO v_year_id FROM public.academic_years LIMIT 1;
    END IF;
    IF v_year_id IS NULL THEN
        INSERT INTO public.academic_years (id, school_id, name, start_date, end_date, is_active)
        VALUES ('22222222-2222-2222-2222-222222222222', v_school_id, '2026 - 2027', '2026-09-01', '2027-05-31', true)
        RETURNING id INTO v_year_id;
    END IF;

    -- Tạo Lớp học Thử nghiệm trên Supabase gắn với đúng trường học và niên khóa thực tế
    INSERT INTO public.classes (id, school_id, academic_year_id, name, grade_level, is_demo, theme_config, settings)
    VALUES (
        '77777777-7777-7777-7777-777777777777',
        v_school_id,
        v_year_id,
        '[THỬ NGHIỆM] LỚP 6A6',
        6,
        true,
        '{"month": "CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG", "title": "CHUYẾN TÀU THANH XUÂN 6A6 • [DỮ LIỆU THỬ NGHIỆM]", "bannerColorClass": "from-amber-700 to-amber-950"}'::jsonb,
        '{"sidebarPosition": "left", "deductStarsOnRedeem": true}'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET 
        school_id = EXCLUDED.school_id,
        academic_year_id = EXCLUDED.academic_year_id,
        is_demo = true,
        name = EXCLUDED.name,
        theme_config = EXCLUDED.theme_config;
END $$;

-- 3. HÀM DATABASE RPC: XÓA SẠCH DỮ LIỆU CỦA LỚP THỬ NGHIỆM (CLEAR DEMO)
-- BẢO VỆ TUYỆT ĐỐI: Chỉ cho phép xóa khi lớp có is_demo = true. Nếu truyền ID lớp thật sẽ chặn và báo lỗi ngay lập tức!
CREATE OR REPLACE FUNCTION public.clear_demo_class(p_demo_class_id UUID DEFAULT '77777777-7777-7777-7777-777777777777')
RETURNS JSONB AS $$
DECLARE
    v_is_demo BOOLEAN;
    v_class_name TEXT;
BEGIN
    -- Kiểm tra nghiêm ngặt cờ is_demo của lớp
    SELECT is_demo, name INTO v_is_demo, v_class_name 
    FROM public.classes 
    WHERE id = p_demo_class_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lớp học không tồn tại (ID: %)', p_demo_class_id;
    END IF;

    IF v_is_demo IS NOT TRUE THEN
        RAISE EXCEPTION 'AN TOÀN BẢO MẬT: Lớp "%" không phải là lớp thử nghiệm (is_demo = false). Hành động xóa bị hủy bỏ!', v_class_name;
    END IF;

    -- Tiến hành xóa dữ liệu con thuộc lớp demo này
    DELETE FROM public.point_transactions WHERE class_id = p_demo_class_id;
    DELETE FROM public.attendance_records WHERE session_id IN (
        SELECT id FROM public.attendance_sessions WHERE class_id = p_demo_class_id
    );
    DELETE FROM public.attendance_sessions WHERE class_id = p_demo_class_id;
    DELETE FROM public.student_guardians WHERE student_id IN (
        SELECT id FROM public.students WHERE class_id = p_demo_class_id
    );
    DELETE FROM public.students WHERE class_id = p_demo_class_id;
    DELETE FROM public.seating_presets WHERE class_id = p_demo_class_id;
    DELETE FROM public.point_categories WHERE class_id = p_demo_class_id;
    DELETE FROM public.groups WHERE class_id = p_demo_class_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Đã dọn sạch dữ liệu lớp thử nghiệm: ' || v_class_name,
        'class_id', p_demo_class_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. HÀM DATABASE RPC: TÁI TẠO DỮ LIỆU MẪU CHUẨN CHO LỚP THỬ NGHIỆM (RESET DEMO)
CREATE OR REPLACE FUNCTION public.reset_demo_class(p_demo_class_id UUID DEFAULT '77777777-7777-7777-7777-777777777777')
RETURNS JSONB AS $$
DECLARE
    v_g1 UUID := gen_random_uuid();
    v_g2 UUID := gen_random_uuid();
    v_g3 UUID := gen_random_uuid();
    v_g4 UUID := gen_random_uuid();
    v_cat1 UUID := gen_random_uuid();
    v_cat2 UUID := gen_random_uuid();
    v_cat3 UUID := gen_random_uuid();
    v_cat4 UUID := gen_random_uuid();
    v_s1 UUID := gen_random_uuid();
    v_s2 UUID := gen_random_uuid();
    v_s3 UUID := gen_random_uuid();
    v_s4 UUID := gen_random_uuid();
    v_admin_profile UUID;
BEGIN
    -- 1. Dọn dẹp trước bằng hàm clear_demo_class (đã có kiểm tra an toàn is_demo)
    PERFORM public.clear_demo_class(p_demo_class_id);

    -- 2. Lấy 1 profile ID thực tế trong database để làm người tạo giao dịch
    SELECT id INTO v_admin_profile FROM public.profiles LIMIT 1;
    IF v_admin_profile IS NULL THEN
        SELECT id INTO v_admin_profile FROM auth.users LIMIT 1;
    END IF;
    IF v_admin_profile IS NULL THEN
        v_admin_profile := 'a0000000-0000-0000-0000-000000000001';
        INSERT INTO public.profiles (id, full_name, email, system_role)
        VALUES (v_admin_profile, 'Thầy Phan Văn Bộ', 'phanvanbo.6a6@thcs-tanhai.edu.vn', 'teacher')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 3. Tạo 4 Tổ thi đua mẫu
    INSERT INTO public.groups (id, class_id, name, color_class, order_index) VALUES
        (v_g1, p_demo_class_id, 'Tổ 1 (Thử nghiệm)', 'text-red-500', 1),
        (v_g2, p_demo_class_id, 'Tổ 2 (Thử nghiệm)', 'text-green-500', 2),
        (v_g3, p_demo_class_id, 'Tổ 3 (Thử nghiệm)', 'text-yellow-500', 3),
        (v_g4, p_demo_class_id, 'Tổ 4 (Thử nghiệm)', 'text-blue-500', 4);

    -- 4. Tạo các Tiêu chí điểm mẫu
    INSERT INTO public.point_categories (id, class_id, type, category_group, title, default_points, default_stars) VALUES
        (v_cat1, p_demo_class_id, 'add', 'Học tập', 'Đạt điểm 10 kiểm tra', 10, 2),
        (v_cat2, p_demo_class_id, 'add', 'Học tập', 'Hăng hái phát biểu xây dựng bài', 2, 1),
        (v_cat3, p_demo_class_id, 'subtract', 'Nề nếp', 'Không thuộc bài cũ / chưa làm bài', -5, 0),
        (v_cat4, p_demo_class_id, 'add', 'Phong trào', 'Trực nhật lớp sạch sẽ, đúng giờ', 5, 1);

    -- 5. Tạo các học sinh mẫu đại diện
    INSERT INTO public.students (id, class_id, group_id, full_name, gender, birth_date, class_role, code, boarding_type) VALUES
        (v_s1, p_demo_class_id, v_g1, 'Nguyễn An Bình (Mẫu Test)', 'Nam', '2015-02-14', 'Lớp trưởng', 'TEST01', 'Bán trú'),
        (v_s2, p_demo_class_id, v_g1, 'Trần Bảo Châu (Mẫu Test)', 'Nữ', '2015-05-18', 'Tổ trưởng', 'TEST02', 'Bán trú'),
        (v_s3, p_demo_class_id, v_g2, 'Lê Đăng Cường (Mẫu Test)', 'Nam', '2015-08-22', 'Thành viên', 'TEST03', 'Tự túc'),
        (v_s4, p_demo_class_id, v_g3, 'Phạm Diệu Duyên (Mẫu Test)', 'Nữ', '2015-11-09', 'Thành viên', 'TEST04', 'Bán trú');

    -- 6. Tạo điểm thi đua khởi tạo
    INSERT INTO public.point_transactions (class_id, student_id, category_id, points, stars, reason, created_by) VALUES
        (p_demo_class_id, v_s1, v_cat1, 10, 2, 'Kiểm tra 15 phút Toán đạt điểm 10', v_admin_profile),
        (p_demo_class_id, v_s2, v_cat2, 2, 1, 'Xung phong giải bài tập khó trên bảng', v_admin_profile);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Đã khởi tạo thành công dữ liệu mẫu cho Lớp thử nghiệm!',
        'class_id', p_demo_class_id,
        'created_students', 4,
        'created_groups', 4
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Khởi tạo dữ liệu mẫu lần đầu cho lớp thử nghiệm 77777777-7777-7777-7777-777777777777
SELECT public.reset_demo_class('77777777-7777-7777-7777-777777777777');

-- 6. Cấp quyền thực thi hàm RPC
GRANT EXECUTE ON FUNCTION public.clear_demo_class(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reset_demo_class(UUID) TO anon, authenticated, service_role;
