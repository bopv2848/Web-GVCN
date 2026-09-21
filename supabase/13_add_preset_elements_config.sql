-- ============================================================================
-- WEB-GVCN 2.0: LƯU KÍCH THƯỚC BÀN & CỬA RIÊNG BIỆT CHO TỪNG BẢN MẪU SƠ ĐỒ (PRESETS)
-- File migration: 13_add_preset_elements_config.sql
-- Thầy mở Supabase Dashboard -> SQL Editor -> Dán toàn bộ script này và bấm RUN
-- ============================================================================

-- 1. Bổ sung cột elements_config (JSONB) vào bảng seating_presets nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'seating_presets' 
          AND column_name = 'elements_config'
    ) THEN
        ALTER TABLE public.seating_presets 
        ADD COLUMN elements_config JSONB DEFAULT NULL;
    END IF;
END $$;

-- 2. Tạo chỉ mục GIN để tăng tốc độ truy vấn trường JSONB trên các bản mẫu
CREATE INDEX IF NOT EXISTS idx_seating_presets_elements_config 
ON public.seating_presets USING GIN (elements_config);

-- 3. Đảm bảo cấu hình Realtime lắng nghe thay đổi của bảng seating_presets
ALTER PUBLICATION supabase_realtime ADD TABLE public.seating_presets;
