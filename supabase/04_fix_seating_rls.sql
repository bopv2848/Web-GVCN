-- ============================================================================
-- WEB-GVCN 2.0: BỔ SUNG CHÍNH SÁCH BẢO MẬT RLS CHO SƠ ĐỒ CHỖ NGỒI
-- Áp dụng cho: Bảng seat_layouts và bảng seat_assignments
-- Hướng dẫn: Thầy mở Supabase Cloud -> SQL Editor -> New Query -> Dán mã này và bấm RUN
-- ============================================================================

-- 1. Bổ sung quyền đọc và quản lý cho bảng seat_layouts (Sơ đồ bàn học lớp)
DROP POLICY IF EXISTS "Seat layouts read" ON public.seat_layouts;
DROP POLICY IF EXISTS "Seat layouts select" ON public.seat_layouts;
DROP POLICY IF EXISTS "Class tools read by class members" ON public.seat_layouts;
DROP POLICY IF EXISTS "Class tools manage by GVCN" ON public.seat_layouts;

CREATE POLICY "Seat layouts read" ON public.seat_layouts
FOR SELECT TO authenticated
USING (public.is_class_member(class_id) OR public.is_class_gvcn(class_id));

CREATE POLICY "Seat layouts manage GVCN" ON public.seat_layouts
FOR ALL TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

-- 2. Bổ sung quyền đọc và quản lý cho bảng seat_assignments (Phân công chỗ ngồi học sinh)
DROP POLICY IF EXISTS "Seat assignments read" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments select" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments read by class members" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments manage by GVCN" ON public.seat_assignments;
DROP POLICY IF EXISTS "Seat assignments manage" ON public.seat_assignments;

CREATE POLICY "Seat assignments select" ON public.seat_assignments
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Seat assignments manage" ON public.seat_assignments
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.seat_layouts l
        WHERE l.id = layout_id AND (public.is_class_gvcn(l.class_id) OR public.is_class_bancansu(l.class_id))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.seat_layouts l
        WHERE l.id = layout_id AND (public.is_class_gvcn(l.class_id) OR public.is_class_bancansu(l.class_id))
    )
);
