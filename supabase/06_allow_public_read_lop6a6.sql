-- ============================================================================
-- WEB-GVCN 2.0: CẤP QUYỀN RLS CHO PHÉP TRUY VẤN DỮ LIỆU THỰC TẾ LỚP 6A6
-- Thầy mở Supabase Dashboard -> Vào mục SQL Editor -> Bấm "New Query" -> Dán đoạn mã này và bấm RUN
-- ============================================================================

-- 1. Cho phép đọc thông tin trường học, niên khóa và lớp học
DROP POLICY IF EXISTS "Schools select public" ON public.schools;
CREATE POLICY "Schools select public" ON public.schools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Academic years select public" ON public.academic_years;
CREATE POLICY "Academic years select public" ON public.academic_years FOR SELECT USING (true);

DROP POLICY IF EXISTS "Classes select public" ON public.classes;
CREATE POLICY "Classes select public" ON public.classes FOR SELECT USING (true);

-- 2. Cho phép đọc 4 Tổ thi đua và 47 Học sinh Lớp 6A6
DROP POLICY IF EXISTS "Groups select public" ON public.groups;
CREATE POLICY "Groups select public" ON public.groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students select public" ON public.students;
CREATE POLICY "Students select public" ON public.students FOR SELECT USING (true);

-- 3. Cho phép thêm, sửa, xóa học sinh cho người dùng
DROP POLICY IF EXISTS "Students mutate public" ON public.students;
CREATE POLICY "Students mutate public" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- 4. Cho phép đọc tiêu chí thi đua, quà tặng và lịch sử điểm
DROP POLICY IF EXISTS "Point categories select public" ON public.point_categories;
CREATE POLICY "Point categories select public" ON public.point_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Rewards select public" ON public.rewards;
CREATE POLICY "Rewards select public" ON public.rewards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Point transactions select public" ON public.point_transactions;
CREATE POLICY "Point transactions select public" ON public.point_transactions FOR SELECT USING (true);
