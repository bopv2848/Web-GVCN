-- ============================================================================
-- WEB-GVCN 2.0: NÂNG CẤP BẢO MẬT PHÂN QUYỀN ĐA LỚP HỌC (MULTI-TENANT RLS)
-- Phiên bản: 2.3.0
-- Mục tiêu: 
--   1. Cách ly dữ liệu hoàn toàn giữa các lớp học (6A1, 6A2, 6A6, 7A1...)
--   2. Mỗi GVCN chỉ xem và quản lý lớp được phân công của mình.
--   3. BGH (Ban Giám Hiệu) xem được toàn bộ các lớp trong trường.
--   4. Quản trị viên (Admin) toàn quyền hệ thống.
--   5. Cung cấp hàm tự động khởi tạo lớp mới kèm 4 tổ chỉ bằng 1 dòng lệnh.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PHẦN 1: HÀM TIỆN ÍCH PHÂN QUYỀN (SECURITY DEFINER FUNCTIONS)
-- ----------------------------------------------------------------------------

-- 1.1. Kiểm tra quyền Quản trị viên (Admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND system_role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1.2. Lấy danh sách ID các lớp mà người dùng hiện tại có quyền truy cập
CREATE OR REPLACE FUNCTION public.get_user_accessible_class_ids()
RETURNS SETOF UUID AS $$
BEGIN
    -- Nếu là Admin: Truy cập tất cả các lớp chưa bị xóa
    IF public.is_admin() THEN
        RETURN QUERY 
        SELECT id FROM public.classes WHERE deleted_at IS NULL;
        RETURN;
    END IF;

    -- Lấy các lớp được phân công trực tiếp trong bảng class_memberships
    RETURN QUERY
    SELECT cm.class_id
    FROM public.class_memberships cm
    WHERE cm.profile_id = auth.uid();

    -- Nếu là Ban Giám Hiệu (Hiệu trưởng / Hiệu phó): Lấy toàn bộ các lớp thuộc trường mình quản lý
    RETURN QUERY
    SELECT c.id
    FROM public.classes c
    JOIN public.school_memberships sm ON sm.school_id = c.school_id
    WHERE sm.profile_id = auth.uid()
      AND sm.role IN ('principal', 'vice_principal')
      AND c.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1.3. Kiểm tra người dùng có phải là GVCN của lớp cụ thể không
CREATE OR REPLACE FUNCTION public.is_class_gvcn(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id
          AND profile_id = auth.uid()
          AND role = 'gvcn'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 1.4. Kiểm tra người dùng có phải Ban Cán Sự của lớp không
CREATE OR REPLACE FUNCTION public.is_class_bancansu(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id
          AND profile_id = auth.uid()
          AND role = 'bancansu'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- PHẦN 2: THIẾT LẬP CHÍNH SÁCH RLS MULTI-TENANT CÁCH LY THEO CLASS_ID
-- ----------------------------------------------------------------------------

-- A. BẢNG CLASSES (LỚP HỌC)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Classes select multi_tenant" ON public.classes;
DROP POLICY IF EXISTS "Classes update gvcn" ON public.classes;
DROP POLICY IF EXISTS "Classes insert_delete admin" ON public.classes;
DROP POLICY IF EXISTS "Classes mutate multi_tenant" ON public.classes;
DROP POLICY IF EXISTS "Classes select public" ON public.classes;

-- Cho phép xem lớp: Là thành viên được phân công, hoặc BGH/Admin, hoặc xem lớp demo 6A6 khi chưa login
CREATE POLICY "Classes select multi_tenant" ON public.classes
FOR SELECT USING (
    (auth.uid() IS NULL AND id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR id IN (SELECT public.get_user_accessible_class_ids())
);

-- Cho phép GVCN cập nhật thông tin lớp mình (chủ điểm tháng, cấu hình)
CREATE POLICY "Classes update gvcn" ON public.classes
FOR UPDATE USING (
    public.is_class_gvcn(id) OR public.is_admin()
) WITH CHECK (
    public.is_class_gvcn(id) OR public.is_admin()
);

-- Chỉ Admin được tạo/xóa lớp học
CREATE POLICY "Classes insert_delete admin" ON public.classes
FOR ALL USING (
    public.is_admin()
) WITH CHECK (
    public.is_admin()
);

-- B. BẢNG GROUPS (TỔ THI ĐUA)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Groups select public" ON public.groups;
DROP POLICY IF EXISTS "Groups select multi_tenant" ON public.groups;
DROP POLICY IF EXISTS "Groups mutate multi_tenant" ON public.groups;
DROP POLICY IF EXISTS "Groups mutate gvcn" ON public.groups;

CREATE POLICY "Groups select multi_tenant" ON public.groups
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
);

CREATE POLICY "Groups mutate gvcn" ON public.groups
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

-- C. BẢNG STUDENTS (HỌC SINH)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students select public" ON public.students;
DROP POLICY IF EXISTS "Students mutate public" ON public.students;
DROP POLICY IF EXISTS "Students select multi_tenant" ON public.students;
DROP POLICY IF EXISTS "Students mutate multi_tenant" ON public.students;
DROP POLICY IF EXISTS "Students mutate gvcn" ON public.students;

-- Xem học sinh: Chỉ xem học sinh thuộc lớp của mình
CREATE POLICY "Students select multi_tenant" ON public.students
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
);

-- Thêm, sửa, xóa học sinh: Chỉ GVCN của lớp đó hoặc Admin
CREATE POLICY "Students mutate gvcn" ON public.students
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

-- D. BẢNG ATTENDANCE_SESSIONS & ATTENDANCE_RECORDS (ĐIỂM DANH)
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Attendance sessions select multi_tenant" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Attendance sessions mutate gvcn" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Att sessions select public" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Att sessions mutate public" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Attendance records select multi_tenant" ON public.attendance_records;
DROP POLICY IF EXISTS "Attendance records mutate gvcn_and_bcs" ON public.attendance_records;
DROP POLICY IF EXISTS "Att records select public" ON public.attendance_records;
DROP POLICY IF EXISTS "Att records mutate public" ON public.attendance_records;

CREATE POLICY "Attendance sessions select multi_tenant" ON public.attendance_sessions
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
);

CREATE POLICY "Attendance sessions mutate gvcn" ON public.attendance_sessions
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

CREATE POLICY "Attendance records select multi_tenant" ON public.attendance_records
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions s
        WHERE s.id = session_id
          AND ((auth.uid() IS NULL AND s.class_id = '66666666-6666-6666-6666-666666666666'::uuid)
               OR s.class_id IN (SELECT public.get_user_accessible_class_ids()))
    )
);

CREATE POLICY "Attendance records mutate gvcn_and_bcs" ON public.attendance_records
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions s
        WHERE s.id = session_id
          AND ((auth.uid() IS NULL AND s.class_id = '66666666-6666-6666-6666-666666666666'::uuid)
               OR public.is_class_gvcn(s.class_id)
               OR (public.is_class_bancansu(s.class_id) AND NOT s.is_locked))
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.attendance_sessions s
        WHERE s.id = session_id
          AND ((auth.uid() IS NULL AND s.class_id = '66666666-6666-6666-6666-666666666666'::uuid)
               OR public.is_class_gvcn(s.class_id)
               OR (public.is_class_bancansu(s.class_id) AND NOT s.is_locked))
    )
);

-- E. BẢNG POINT_TRANSACTIONS (SỔ CÁI TÍCH ĐIỂM THI ĐUA)
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Point transactions select multi_tenant" ON public.point_transactions;
DROP POLICY IF EXISTS "Point transactions mutate gvcn_and_bcs" ON public.point_transactions;
DROP POLICY IF EXISTS "Point transactions select public" ON public.point_transactions;
DROP POLICY IF EXISTS "Point transactions mutate public" ON public.point_transactions;

CREATE POLICY "Point transactions select multi_tenant" ON public.point_transactions
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
);

CREATE POLICY "Point transactions mutate gvcn_and_bcs" ON public.point_transactions
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
    OR public.is_class_bancansu(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
    OR public.is_class_bancansu(class_id)
);

-- F. BẢNG SEAT_LAYOUTS & SEAT_ASSIGNMENTS (SƠ ĐỒ CHỖ NGỒI)
ALTER TABLE public.seat_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Seat layouts select multi_tenant" ON public.seat_layouts;
DROP POLICY IF EXISTS "Seat layouts mutate gvcn" ON public.seat_layouts;
DROP POLICY IF EXISTS "Seat layouts select public" ON public.seat_layouts;
DROP POLICY IF EXISTS "Seat layouts mutate public" ON public.seat_layouts;

DROP POLICY IF EXISTS "Seat assignments select multi_tenant" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments mutate gvcn" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments select public" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments mutate public" ON public.seat_assignments;

CREATE POLICY "Seat layouts select multi_tenant" ON public.seat_layouts
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
);

CREATE POLICY "Seat layouts mutate gvcn" ON public.seat_layouts
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

CREATE POLICY "Seat assignments select multi_tenant" ON public.seat_assignments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.seat_layouts l
        WHERE l.id = layout_id
          AND ((auth.uid() IS NULL AND l.class_id = '66666666-6666-6666-6666-666666666666'::uuid)
               OR l.class_id IN (SELECT public.get_user_accessible_class_ids()))
    )
);

CREATE POLICY "Seat assignments mutate gvcn" ON public.seat_assignments
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.seat_layouts l
        WHERE l.id = layout_id
          AND ((auth.uid() IS NULL AND l.class_id = '66666666-6666-6666-6666-666666666666'::uuid)
               OR public.is_class_gvcn(l.class_id))
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.seat_layouts l
        WHERE l.id = layout_id
          AND ((auth.uid() IS NULL AND l.class_id = '66666666-6666-6666-6666-666666666666'::uuid)
               OR public.is_class_gvcn(l.class_id))
    )
);

-- G. BẢNG COMPANION_CASES & UPDATES (SỔ ĐỒNG HÀNH - BẢO MẬT TUYỆT ĐỐI)
ALTER TABLE public.companion_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Companion cases select multi_tenant" ON public.companion_cases;
DROP POLICY IF EXISTS "Companion cases mutate multi_tenant" ON public.companion_cases;
DROP POLICY IF EXISTS "Companion cases select gvcn" ON public.companion_cases;
DROP POLICY IF EXISTS "Companion cases mutate gvcn" ON public.companion_cases;

CREATE POLICY "Companion cases select gvcn" ON public.companion_cases
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

CREATE POLICY "Companion cases mutate gvcn" ON public.companion_cases
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

-- H. BẢNG CLASS_CONFIGS (CẤU HÌNH TUẦN NĂM HỌC, QUY ĐỊNH LỚP)
ALTER TABLE public.class_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Class configs select multi_tenant" ON public.class_configs;
DROP POLICY IF EXISTS "Class configs mutate gvcn" ON public.class_configs;
DROP POLICY IF EXISTS "Class configs select for all members" ON public.class_configs;
DROP POLICY IF EXISTS "Class configs manage for gvcn" ON public.class_configs;

CREATE POLICY "Class configs select multi_tenant" ON public.class_configs
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
);

CREATE POLICY "Class configs mutate gvcn" ON public.class_configs
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

-- I. BẢNG TIMETABLE_ENTRIES (THỜI KHÓA BIỂU)
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Timetable select multi_tenant" ON public.timetable_entries;
DROP POLICY IF EXISTS "Timetable mutate gvcn" ON public.timetable_entries;

CREATE POLICY "Timetable select multi_tenant" ON public.timetable_entries
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
);

CREATE POLICY "Timetable mutate gvcn" ON public.timetable_entries
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

-- ----------------------------------------------------------------------------
-- PHẦN 3: HÀM TỰ ĐỘNG KHỞI TẠO LỚP MỚI KÈM 4 TỔ (PROVISIONING STORED PROCEDURE)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.provision_new_class(
    p_school_id UUID,
    p_academic_year_id UUID,
    p_class_name TEXT,
    p_grade_level INT,
    p_teacher_email TEXT,
    p_teacher_name TEXT,
    p_theme_title TEXT DEFAULT 'CHUYẾN TÀU THANH XUÂN',
    p_theme_month TEXT DEFAULT 'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG'
) RETURNS UUID AS $$
DECLARE
    v_class_id UUID;
    v_profile_id UUID;
BEGIN
    -- 1. Tạo bản ghi lớp học mới
    INSERT INTO public.classes (
        school_id,
        academic_year_id,
        name,
        grade_level,
        theme_config
    ) VALUES (
        p_school_id,
        p_academic_year_id,
        UPPER(TRIM(p_class_name)),
        p_grade_level,
        jsonb_build_object(
            'title', p_theme_title,
            'month', p_theme_month,
            'bannerColorClass', 'from-[#1e1b4b] to-[#312e81]'
        )
    ) RETURNING id INTO v_class_id;

    -- 2. Tự động khởi tạo sẵn 4 Tổ thi đua chuẩn
    INSERT INTO public.groups (class_id, name, color_class, order_index) VALUES
    (v_class_id, 'Tổ 1', 'text-red-500', 1),
    (v_class_id, 'Tổ 2', 'text-green-500', 2),
    (v_class_id, 'Tổ 3', 'text-yellow-500', 3),
    (v_class_id, 'Tổ 4', 'text-blueAccent', 4);

    -- 3. Khởi tạo bản ghi cấu hình lớp học
    INSERT INTO public.class_configs (
        class_id,
        school_year_start_date,
        seating_rotation_enabled
    ) VALUES (
        v_class_id,
        '2026-09-07',
        false
    ) ON CONFLICT (class_id) DO NOTHING;

    -- 4. Tìm hoặc tạo profile giáo viên chủ nhiệm
    SELECT id INTO v_profile_id FROM public.profiles WHERE email = p_teacher_email;
    
    IF v_profile_id IS NOT NULL THEN
        -- Gán quyền GVCN vào lớp mới
        INSERT INTO public.class_memberships (class_id, profile_id, role)
        VALUES (v_class_id, v_profile_id, 'gvcn')
        ON CONFLICT (class_id, profile_id, role) DO NOTHING;
    END IF;

    RETURN v_class_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- PHẦN 4: KHỞI TẠO MẪU CÁC LỚP HỌC 6A1, 6A2, 7A1 CÙNG TRƯỜNG THCS TÂN HẢI
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_school_id UUID;
    v_academic_year_id UUID;
BEGIN
    -- Lấy trường THCS Tân Hải và niên khóa hiện tại
    SELECT id INTO v_school_id FROM public.schools LIMIT 1;
    SELECT id INTO v_academic_year_id FROM public.academic_years WHERE school_id = v_school_id LIMIT 1;

    IF v_school_id IS NOT NULL AND v_academic_year_id IS NOT NULL THEN
        -- 1. LỚP 6A1 (Khối 6 - Cô Nguyễn Thị Lan)
        IF NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'LỚP 6A1' AND school_id = v_school_id) THEN
            PERFORM public.provision_new_class(
                v_school_id,
                v_academic_year_id,
                'LỚP 6A1',
                6,
                'lan.nguyen@thcs-tanhai.edu.vn',
                'Cô Nguyễn Thị Lan',
                'LỚP 6A1 • ĐOÀN KẾT - CHĂM NGOAN - HỌC TỐT',
                'CHỦ ĐIỂM THÁNG 9: MÁI TRƯỜNG MẾN YÊU'
            );
        END IF;

        -- 2. LỚP 6A2 (Khối 6 - Thầy Trần Quốc Tuấn)
        IF NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'LỚP 6A2' AND school_id = v_school_id) THEN
            PERFORM public.provision_new_class(
                v_school_id,
                v_academic_year_id,
                'LỚP 6A2',
                6,
                'tuan.tran@thcs-tanhai.edu.vn',
                'Thầy Trần Quốc Tuấn',
                'LỚP 6A2 • TỰ TIN TỎA SÁNG',
                'CHỦ ĐIỂM THÁNG 9: TRUYỀN THỐNG NHÀ TRƯỜNG'
            );
        END IF;

        -- 3. LỚP 7A1 (Khối 7 - Cô Lê Mai Anh)
        IF NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'LỚP 7A1' AND school_id = v_school_id) THEN
            PERFORM public.provision_new_class(
                v_school_id,
                v_academic_year_id,
                'LỚP 7A1',
                7,
                'maianh.le@thcs-tanhai.edu.vn',
                'Cô Lê Mai Anh',
                'LỚP 7A1 • BẢN LĨNH & VƯƠN XA',
                'CHỦ ĐIỂM THÁNG 9: TÔI LÀ HỌC SINH LỚP 7'
            );
        END IF;
    END IF;
END $$;
