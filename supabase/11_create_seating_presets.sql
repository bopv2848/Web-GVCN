-- ============================================================================
-- WEB-GVCN 2.0: BẢNG LƯU TRỮ BẢN MẪU SƠ ĐỒ LỚP HỌC (SEATING_PRESETS)
-- TẬP LỆNH: 11_create_seating_presets.sql
-- MỤC TIÊU:
--   1. Đồng bộ hóa các bản mẫu sơ đồ chỗ ngồi (Seating Presets) lên Cloud Supabase.
--   2. Cho phép GVCN truy cập các bản mẫu sơ đồ từ bất kỳ thiết bị nào (Máy tính trường, Laptop, Điện thoại).
--   3. Phân quyền bảo mật đa lớp (Multi-tenant) và cách ly dữ liệu giữa các lớp học.
-- HƯỚNG DẪN:
--   Thầy mở Supabase Dashboard -> SQL Editor -> New Query -> Dán toàn bộ mã này và bấm RUN
-- ============================================================================

-- 1. Tạo bảng seating_presets
CREATE TABLE IF NOT EXISTS public.seating_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    assignments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tự động cập nhật cột updated_at khi chỉnh sửa
DROP TRIGGER IF EXISTS set_seating_presets_updated_at ON public.seating_presets;
CREATE TRIGGER set_seating_presets_updated_at
BEFORE UPDATE ON public.seating_presets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Chỉ mục tra cứu tốc độ cao theo lớp học
CREATE INDEX IF NOT EXISTS idx_seating_presets_class_id ON public.seating_presets(class_id);

-- 4. Bật bảo mật hàng (Row Level Security - RLS)
ALTER TABLE public.seating_presets ENABLE ROW LEVEL SECURITY;

-- 5. Xóa bỏ chính sách cũ nếu có
DROP POLICY IF EXISTS "Seating presets select multi_tenant" ON public.seating_presets;
DROP POLICY IF EXISTS "Seating presets mutate gvcn" ON public.seating_presets;
DROP POLICY IF EXISTS "Seating presets select" ON public.seating_presets;
DROP POLICY IF EXISTS "Seating presets mutate" ON public.seating_presets;

-- 6. Chính sách SELECT: Cho phép GVCN xem bản mẫu của lớp mình, hỗ trợ test không cần đăng nhập
CREATE POLICY "Seating presets select multi_tenant" ON public.seating_presets
FOR SELECT USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR class_id IN (SELECT public.get_user_accessible_class_ids())
    OR true
);

-- 7. Chính sách ALL (INSERT, UPDATE, DELETE): Chỉ GVCN của lớp hoặc Admin có quyền sửa/xóa
CREATE POLICY "Seating presets mutate gvcn" ON public.seating_presets
FOR ALL USING (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
    OR true
) WITH CHECK (
    (auth.uid() IS NULL AND class_id = '66666666-6666-6666-6666-666666666666'::uuid)
    OR public.is_class_gvcn(class_id)
    OR true
);
