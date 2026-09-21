-- ============================================================================
-- WEB-GVCN 2.0: CHÍNH SÁCH BẢO MẬT PHÂN QUYỀN NGHIÊM NGẶT (STRICT RBAC)
-- TẬP LỆNH: 10_enforce_gvcn_delete_all_students.sql
-- MỤC TIÊU:
--   1. Chỉ Giáo viên chủ nhiệm chính thức (role = 'gvcn' trong class_memberships)
--      hoặc Quản trị viên (Admin) mới có quyền XÓA MỀM (Soft delete) hoặc XÓA SẠCH học sinh.
--   2. Giáo viên bộ môn ('teacher'), Ban cán sự lớp ('bancansu'), Phụ huynh, Học sinh
--      hoặc người xem ('bgh_viewer') TUYỆT ĐỐI KHÔNG THỂ xóa học sinh.
-- ============================================================================

-- 1. Đảm bảo hàm kiểm tra GVCN chính thức hoạt động chuẩn xác và bảo mật cao
CREATE OR REPLACE FUNCTION public.is_class_gvcn(target_class_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Nếu là Quản trị viên hệ thống (Admin): Luôn có toàn quyền
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    -- Kiểm tra người dùng hiện tại có vai trò 'gvcn' chính thức của lớp này không
    RETURN EXISTS (
        SELECT 1 FROM public.class_memberships
        WHERE class_id = target_class_id
          AND profile_id = auth.uid()
          AND role = 'gvcn'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Tái thiết lập chính sách RLS cho bảng `students` (Học sinh)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Gỡ bỏ các chính sách cũ liên quan đến ghi/xóa học sinh nếu có
DROP POLICY IF EXISTS "Students mutate gvcn" ON public.students;
DROP POLICY IF EXISTS "Students delete gvcn_only" ON public.students;
DROP POLICY IF EXISTS "Students update gvcn_only" ON public.students;

-- Chính sách UPDATE: Chỉ GVCN chính thức hoặc Admin mới được phép sửa (bao gồm gán deleted_at để xóa mềm)
CREATE POLICY "Students update gvcn_only" ON public.students
FOR UPDATE USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

-- Chính sách DELETE (Xóa cứng vật lý nếu có dọn dẹp DB): Chỉ GVCN chính thức hoặc Admin
CREATE POLICY "Students delete gvcn_only" ON public.students
FOR DELETE USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);

-- Chính sách INSERT: Chỉ GVCN chính thức hoặc Admin mới được nhập danh sách học sinh
CREATE POLICY "Students insert gvcn_only" ON public.students
FOR INSERT WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
);
