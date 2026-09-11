-- ============================================================================
-- WEB-GVCN 2.0: BỔ SUNG CHÍNH SÁCH RLS POLICIES CHO SUPABASE CLOUD
-- Thầy mở Supabase -> SQL Editor -> Tạo New Query -> Dán đoạn mã này và bấm RUN
-- ============================================================================

-- 1. Bổ sung quyền đọc bảng phân công lớp (class_memberships) cho người dùng đăng nhập
DROP POLICY IF EXISTS Class memberships select own ON public.class_memberships;
CREATE POLICY Class memberships select own ON public.class_memberships
FOR SELECT TO authenticated
USING (profile_id = auth.uid() OR public.is_class_gvcn(class_id));

-- 2. Bổ sung quyền đọc thông tin Trường học (schools)
DROP POLICY IF EXISTS Schools select all authenticated ON public.schools;
CREATE POLICY Schools select all authenticated ON public.schools
FOR SELECT TO authenticated
USING (true);

-- 3. Bổ sung quyền đọc Niên khóa (academic_years)
DROP POLICY IF EXISTS Academic years select all authenticated ON public.academic_years;
CREATE POLICY Academic years select all authenticated ON public.academic_years
FOR SELECT TO authenticated
USING (true);

-- 4. Bổ sung quyền đọc Tiêu chí thi đua (point_categories)
DROP POLICY IF EXISTS Point categories select ON public.point_categories;
CREATE POLICY Point categories select ON public.point_categories
FOR SELECT TO authenticated
USING (true);

-- 5. Bổ sung quyền đọc Mã liên kết phụ huynh (student_guardians) cho GVCN và thành viên lớp
DROP POLICY IF EXISTS Student guardians select ON public.student_guardians;
CREATE POLICY Student guardians select ON public.student_guardians
FOR SELECT TO authenticated
USING (
    guardian_profile_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = student_id AND (public.is_class_member(s.class_id) OR public.is_school_bgh(s.class_id))
    )
);
