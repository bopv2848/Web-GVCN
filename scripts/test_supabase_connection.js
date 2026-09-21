import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Tự động nạp biến môi trường từ .env.local hoặc .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
}

loadEnv();

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 ĐANG KIỂM TRA KẾT NỐI TỚI SUPABASE CLOUD...');
console.log(`🌐 Supabase URL: ${url || 'Chưa cấu hình'}`);

if (!url || !anonKey) {
  console.error('❌ Lỗi: Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong tệp .env.local!');
  process.exit(1);
}

async function testConnection() {
  try {
    const supabaseAnon = createClient(url, anonKey);

    // 1. Kiểm tra Auth service phía Client (Anon Key)
    const { data: authData, error: authError } = await supabaseAnon.auth.getSession();
    if (authError) {
      console.error('❌ Lỗi kết nối Auth:', authError.message);
    } else {
      console.log('✅ Kết nối Supabase Auth (Client/Anon) thành công!');
    }

    // 2. Kiểm tra truy vấn bảng public (Classes) qua Anon Key
    const { data: publicClasses, error: publicClassesErr } = await supabaseAnon
      .from('classes')
      .select('id, name')
      .limit(1);

    if (publicClassesErr) {
      console.log('ℹ️ Truy vấn bảng "classes" qua Anon Key:', publicClassesErr.message);
    } else {
      console.log('✅ Truy vấn bảng "classes" qua Anon Key thành công!');
    }

    // 3. Kiểm tra quyền Quản trị (Service Role Key) nếu có cấu hình trong .env.local
    if (serviceRoleKey) {
      console.log('🔐 Đã phát hiện SUPABASE_SERVICE_ROLE_KEY trong .env.local, đang kiểm tra quyền Admin...');
      const supabaseAdmin = createClient(url, serviceRoleKey);

      // Kiểm tra bảng classes với quyền Admin
      const { data: tables, error: tableError } = await supabaseAdmin
        .from('classes')
        .select('count', { count: 'exact', head: true });

      if (tableError) {
        console.log('ℹ️ Bảng "classes" chưa tồn tại trên database từ xa:', tableError.message);
      } else {
        console.log('✅ Xác thực quyền Admin (Service Role) thành công!');
      }

      // Kiểm tra Storage Buckets
      const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
      if (bucketError) {
        console.log('ℹ️ Chưa có storage buckets hoặc quyền:', bucketError.message);
      } else {
        console.log(`✅ Kết nối Storage thành công! Hiện có ${buckets.length} buckets:`, buckets.map(b => b.name));
      }
    } else {
      console.log('ℹ️ Không có SUPABASE_SERVICE_ROLE_KEY trong .env.local - Đã bỏ qua bước kiểm tra quyền Admin.');
    }

  } catch (err) {
    console.error('❌ Lỗi không xác định khi kết nối:', err);
  }
}

testConnection();
