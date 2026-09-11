-- ============================================================================
-- WEB-GVCN 2.0: BỔ SUNG CHÍNH SÁCH CẬP NHẬT TRƯỜNG HỌC (SCHOOLS) VÀ LOGO
-- Thầy mở Supabase -> SQL Editor -> Tạo New Query -> Dán đoạn mã này và bấm RUN
-- ============================================================================

-- 1. Bổ sung chính sách cho phép Giáo viên / Ban Giám Hiệu cập nhật tên trường, địa chỉ và logo trường
DROP POLICY IF EXISTS "Schools update authenticated" ON public.schools;
CREATE POLICY "Schools update authenticated" ON public.schools
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Cập nhật thông tin chính thức Trường THCS Tân Hải
UPDATE public.schools
SET 
  name = 'TRƯỜNG THCS TÂN HẢI',
  code = 'THCS-TH',
  address = 'Xã Tân Hải, Tỉnh Lâm Đồng',
  logo_url = '/logo-truong-thcs-Tan-Hai.jpg'
WHERE id = '6a600000-0000-0000-0000-000000000001'
   OR code = 'THCS-NVT'
   OR name ILIKE '%NGUYỄN VĂN TRỖI%'
   OR name ILIKE '%TÂN HẢI%';
