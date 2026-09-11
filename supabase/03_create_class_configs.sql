-- ============================================================================
-- WEB-GVCN 2.0: BẢNG CẤU HÌNH LỚP HỌC (CLASS_CONFIGS)
-- CẬP NHẬT: THÊM TRƯỜNG SEATING_ROTATION_ENABLED VÀ SCHOOL_YEAR_START_DATE
-- Thầy mở Supabase Dashboard -> SQL Editor -> Dán toàn bộ script này và bấm RUN
-- ============================================================================

-- 1. Tạo bảng class_configs lưu trữ cấu hình riêng của từng lớp
CREATE TABLE IF NOT EXISTS public.class_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    seating_rotation_enabled BOOLEAN NOT NULL DEFAULT false,
    school_year_start_date DATE NOT NULL DEFAULT '2026-09-01',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_configs_class UNIQUE (class_id)
);

-- Nếu bảng đã tồn tại từ trước, bổ sung thêm cột school_year_start_date nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'class_configs' 
          AND column_name = 'school_year_start_date'
    ) THEN
        ALTER TABLE public.class_configs 
        ADD COLUMN school_year_start_date DATE NOT NULL DEFAULT '2026-09-01';
    END IF;
END $$;

-- 2. Tự động cập nhật trường updated_at khi có thay đổi
DROP TRIGGER IF EXISTS set_class_configs_updated_at ON public.class_configs;
CREATE TRIGGER set_class_configs_updated_at
BEFORE UPDATE ON public.class_configs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Bật bảo mật hàng (Row Level Security - RLS)
ALTER TABLE public.class_configs ENABLE ROW LEVEL SECURITY;

-- 4. Định nghĩa chính sách phân quyền an toàn
DROP POLICY IF EXISTS "Class configs select for all members" ON public.class_configs;
CREATE POLICY "Class configs select for all members"
ON public.class_configs FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Class configs manage for gvcn" ON public.class_configs;
CREATE POLICY "Class configs manage for gvcn"
ON public.class_configs FOR ALL
TO authenticated
USING (public.is_class_gvcn(class_id))
WITH CHECK (public.is_class_gvcn(class_id));

-- 5. Kích hoạt Realtime WebSockets cho bảng class_configs (an toàn, không báo lỗi nếu đã là member)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'class_configs'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.class_configs;
        END IF;
    END IF;
END $$;

ALTER TABLE public.class_configs REPLICA IDENTITY FULL;

-- 6. Khởi tạo cấu hình mặc định cho Lớp 6A6
INSERT INTO public.class_configs (class_id, seating_rotation_enabled, school_year_start_date)
VALUES ('66666666-6666-6666-6666-666666666666', true, '2026-09-01')
ON CONFLICT (class_id)
DO UPDATE SET 
    seating_rotation_enabled = EXCLUDED.seating_rotation_enabled,
    school_year_start_date = EXCLUDED.school_year_start_date;

-- 7. Đồng bộ dự phòng vào trường settings của bảng classes
UPDATE public.classes
SET settings = COALESCE(settings, '{}'::jsonb) || '{"seating_rotation_enabled": true, "school_year_start_date": "2026-09-01"}'::jsonb
WHERE id = '66666666-6666-6666-6666-666666666666';
