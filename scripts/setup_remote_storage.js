import { createClient } from '@supabase/supabase-js';

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';

const supabaseAdmin = createClient(url, serviceRoleKey);

async function setupBuckets() {
  console.log('📦 ĐANG KHỞI TẠO STORAGE BUCKETS TRÊN SUPABASE CLOUD...');

  const buckets = [
    { id: 'public-assets', public: true, fileSizeLimit: 2097152, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'] },
    { id: 'class-media', public: false, fileSizeLimit: 5242880, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    { id: 'exports', public: false, fileSizeLimit: 10485760, allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] }
  ];

  for (const b of buckets) {
    const { data, error } = await supabaseAdmin.storage.createBucket(b.id, {
      public: b.public,
      fileSizeLimit: b.fileSizeLimit,
      allowedMimeTypes: b.allowedMimeTypes
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Bucket "${b.id}" đã tồn tại.`);
      } else {
        console.log(`ℹ️ Bucket "${b.id}": ${error.message}`);
      }
    } else {
      console.log(`✅ Đã tạo thành công bucket: "${b.id}" (Public: ${b.public})`);
    }
  }

  const { data: list } = await supabaseAdmin.storage.listBuckets();
  console.log('\n📋 Danh sách Buckets hiện có:', list?.map(item => item.name));
}

setupBuckets();
