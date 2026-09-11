import { createClient } from '@supabase/supabase-js';

const url = 'https://huatporucovamymegjnw.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTE2ODgsImV4cCI6MjEwNDY2NzY4OH0.GIlMZ0GOu-kriT90ztwW1hXDL_e5DssRO5Pjxf0J1aM';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';

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
