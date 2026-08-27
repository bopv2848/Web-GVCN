import { createClient } from '@supabase/supabase-js';

const url = 'https://invvygrwbhkwcwvoeabk.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludnZ5Z3J3Ymhrd2N3dm9lYWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTA2NTQsImV4cCI6MjEwMzM4NjY1NH0.YQcZ1Ey-ILFY5cQy5A4b6gTyd5vERX1MVWcsbdNt_vo';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludnZ5Z3J3Ymhrd2N3dm9lYWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgxMDY1NCwiZXhwIjoyMTAzMzg2NjU0fQ.zRzPBfOvXq3hvsv1ehADPS7RBrVzMTTHUjAA98YnxVU';

console.log('🚀 ĐANG KIỂM TRA KẾT NỐI TỚI SUPABASE CLOUD...');

async function testConnection() {
  try {
    const supabaseAdmin = createClient(url, serviceRoleKey);
    const supabaseAnon = createClient(url, anonKey);

    // 1. Kiểm tra Auth service
    const { data: authData, error: authError } = await supabaseAnon.auth.getSession();
    if (authError) {
      console.error('❌ Lỗi kết nối Auth:', authError.message);
    } else {
      console.log('✅ Kết nối Supabase Auth thành công!');
    }

    // 2. Kiểm tra các bảng đã tồn tại chưa
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('classes')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      console.log('ℹ️ Bảng "classes" chưa tồn tại trên database từ xa (Cần chạy Migration):', tableError.message);
    } else {
      console.log('✅ Bảng "classes" đã tồn tại trên Supabase!');
    }

    // 3. Kiểm tra Storage Buckets
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
    if (bucketError) {
      console.log('ℹ️ Chưa có storage buckets hoặc quyền:', bucketError.message);
    } else {
      console.log(`✅ Kết nối Storage thành công! Hiện có ${buckets.length} buckets:`, buckets.map(b => b.name));
    }

  } catch (err) {
    console.error('❌ Lỗi không xác định khi kết nối:', err);
  }
}

testConnection();
