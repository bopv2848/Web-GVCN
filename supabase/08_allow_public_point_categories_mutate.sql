-- ============================================================================
-- WEB-GVCN 2.0: CẤP QUYỀN RLS THÊM, SỬA, XÓA TIÊU CHÍ THI ĐUA (point_categories)
-- Giúp giáo viên có thể tùy chỉnh điểm cộng, điểm trừ, số sao của các tiêu chí
-- ============================================================================

-- 1. Xóa các chính sách cũ (nếu có)
DROP POLICY IF EXISTS "Point categories select public" ON public.point_categories;
DROP POLICY IF EXISTS "Point categories mutate public" ON public.point_categories;
DROP POLICY IF EXISTS "Point categories manage" ON public.point_categories;
DROP POLICY IF EXISTS "Point categories select" ON public.point_categories;

-- 2. Cho phép mọi người dùng đọc danh mục tiêu chí
CREATE POLICY "Point categories select public" 
ON public.point_categories 
FOR SELECT 
USING (true);

-- 3. Cho phép thêm, cập nhật điểm số, số sao và xóa tiêu chí
CREATE POLICY "Point categories mutate public" 
ON public.point_categories 
FOR ALL 
USING (true) 
WITH CHECK (true);
