-- ============================================================================
-- WEB-GVCN 2.0: LƯU CẤU HÌNH VỊ TRÍ BÀN GIÁO VIÊN & CỬA RA VÀO THEO TỪNG LỚP
-- File migration: 12_add_classroom_elements_config.sql
-- Thầy mở Supabase Dashboard -> SQL Editor -> Dán toàn bộ script này và bấm RUN
-- ============================================================================

-- 1. Bổ sung cột elements_config (JSONB) vào bảng classes nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'classes' 
          AND column_name = 'elements_config'
    ) THEN
        ALTER TABLE public.classes 
        ADD COLUMN elements_config JSONB NOT NULL DEFAULT '{
            "teacherDeskPosition": "right",
            "doorPosition": "right",
            "doorAngle": 180
        }'::jsonb;
    END IF;
END $$;

-- 2. Cập nhật giá trị mặc định cho các lớp học hiện có nếu trường này đang rỗng (NULL)
UPDATE public.classes
SET elements_config = '{
    "teacherDeskPosition": "right",
    "doorPosition": "right",
    "doorAngle": 180
}'::jsonb
WHERE elements_config IS NULL;

-- 3. Tạo chỉ mục GIN để tăng tốc độ truy vấn trường JSONB
CREATE INDEX IF NOT EXISTS idx_classes_elements_config 
ON public.classes USING GIN (elements_config);

-- 4. Đồng bộ dự phòng vào bảng class_configs nếu bảng này đang tồn tại
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'class_configs'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'class_configs' 
              AND column_name = 'elements_config'
        ) THEN
            ALTER TABLE public.class_configs 
            ADD COLUMN elements_config JSONB NOT NULL DEFAULT '{
                "teacherDeskPosition": "right",
                "doorPosition": "right",
                "doorAngle": 180
            }'::jsonb;
        END IF;
    END IF;
END $$;

-- 5. Kích hoạt phát sóng Realtime WebSockets cho bảng classes (để laptop & điện thoại đồng bộ tức thì)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'classes'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
        END IF;
    END IF;
END $$;

ALTER TABLE public.classes REPLICA IDENTITY FULL;

-- 6. Chú thích tài liệu cho cột mới
COMMENT ON COLUMN public.classes.elements_config IS 'Cấu hình không gian phòng học: vị trí bàn giáo viên (left/center/right), cửa ra vào (left/right) và góc xoay mũi tên 360 độ';
