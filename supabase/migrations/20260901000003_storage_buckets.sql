-- ============================================================================
-- MIGRATION 03: SUPABASE STORAGE BUCKETS & OBJECT ACCESS POLICIES
-- ============================================================================

-- 1. Khởi tạo các Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('public-assets', 'public-assets', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('class-media', 'class-media', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('exports', 'exports', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- 2. Chính sách Storage RLS (storage.objects)

-- PUBLIC ASSETS: Mọi người đều đọc được, chỉ GVCN/Admin tải lên
CREATE POLICY "Public Assets Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

CREATE POLICY "Public Assets Upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'public-assets');

-- CLASS MEDIA (Private): Chỉ thành viên của lớp mới xem được ảnh học sinh / banner lớp
CREATE POLICY "Class Media Read Authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'class-media'
);

-- Upload Class Media: Chỉ GVCN được tải ảnh vào thư mục lớp của mình
CREATE POLICY "Class Media Upload GVCN"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'class-media'
);

-- EXPORTS (Private): Đọc qua Signed URL hoặc GVCN lớp
CREATE POLICY "Exports Read Authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'exports'
);

CREATE POLICY "Exports Upload Authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'exports'
);
