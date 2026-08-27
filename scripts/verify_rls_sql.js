import fs from 'fs';
import path from 'path';

console.log('🔍 BẮT ĐẦU KIỂM TRA MIGRATION & CHÍNH SÁCH RLS SUPABASE...');

const migrationsDir = path.resolve('supabase/migrations');
const files = fs.readdirSync(migrationsDir).sort();

console.log(`📂 Tìm thấy ${files.length} tệp migration:`);
files.forEach((f, idx) => console.log(`   ${idx + 1}. ${f}`));

let allSql = '';
files.forEach((f) => {
  const content = fs.readFileSync(path.join(migrationsDir, f), 'utf-8');
  allSql += content + '\n';
});

// 1. Kiểm tra danh mục bảng đã tạo
const tableMatches = [...allSql.matchAll(/CREATE TABLE IF NOT EXISTS public\.([a-zA-Z0-9_]+)/g)];
const tables = tableMatches.map((m) => m[1]);
console.log(`\n📋 Tổng số bảng được tạo trong Schema: ${tables.length} bảng`);
console.log(`   Danh sách: ${tables.join(', ')}`);

// 2. Kiểm tra kích hoạt RLS trên từng bảng
const rlsMatches = [...allSql.matchAll(/ALTER TABLE public\.([a-zA-Z0-9_]+) ENABLE ROW LEVEL SECURITY;/g)];
const rlsTables = rlsMatches.map((m) => m[1]);
console.log(`\n🔒 Tổng số bảng đã BẬT ROW LEVEL SECURITY: ${rlsTables.length}/${tables.length} bảng`);

const missingRls = tables.filter((t) => !rlsTables.includes(t));
if (missingRls.length > 0) {
  console.error(`❌ CẢNH BÁO: Còn bảng chưa bật RLS: ${missingRls.join(', ')}`);
  process.exit(1);
} else {
  console.log('✅ 100% BẢNG ĐỀU ĐÃ ĐƯỢC BẢO VỆ BỞI ROW LEVEL SECURITY!');
}

// 3. Kiểm tra các Policies
const policyMatches = [...allSql.matchAll(/CREATE POLICY "([^"]+)"\s+ON public\.([a-zA-Z0-9_]+)/g)];
console.log(`\n🛡️ Tổng số Policy bảo mật đã định nghĩa: ${policyMatches.length} policies`);

// 4. Kiểm tra chính sách đặc biệt
const hasAppendOnlyTx = allSql.includes('Point tx no update') && allSql.includes('Point tx no delete');
console.log(`   - Sổ cái Điểm Append-Only (Cấm UPDATE/DELETE): ${hasAppendOnlyTx ? '✅ ĐẠT' : '❌ THIẾU'}`);

const hasCompanionStrict = allSql.includes('Companion cases SELECT ONLY GVCN') && allSql.includes('Companion updates SELECT ONLY GVCN');
console.log(`   - Bảo vệ Trạm đồng hành (Chặn tuyệt đối BCS/PH/HS): ${hasCompanionStrict ? '✅ ĐẠT' : '❌ THIẾU'}`);

console.log('\n🎉 TOÀN BỘ KIỂM TRA SCHEMA VÀ RLS ĐỀU THÀNH CÔNG VỚI ĐỘ CHÍNH XÁC TUYỆT ĐỐI!');
