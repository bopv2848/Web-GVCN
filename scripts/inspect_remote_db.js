import { createClient } from '@supabase/supabase-js';

const url = 'https://invvygrwbhkwcwvoeabk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludnZ5Z3J3Ymhrd2N3dm9lYWJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgxMDY1NCwiZXhwIjoyMTAzMzg2NjU0fQ.zRzPBfOvXq3hvsv1ehADPS7RBrVzMTTHUjAA98YnxVU';

const supabaseAdmin = createClient(url, serviceRoleKey);

const requiredTables = [
  'schools', 'academic_years', 'profiles', 'school_memberships',
  'classes', 'class_memberships', 'groups', 'students', 'student_guardians',
  'point_categories', 'point_transactions', 'attendance_sessions',
  'attendance_records', 'rewards', 'reward_redemptions', 'seat_layouts',
  'seat_assignments', 'timetable_entries', 'tasks', 'class_milestones',
  'companion_cases', 'companion_updates', 'audit_logs'
];

async function inspectTables() {
  console.log('🔍 KIỂM TRA TRẠNG THÁI CÁC BẢNG TRÊN SUPABASE CLOUD:');
  const existingTables = [];
  const missingTables = [];

  for (const table of requiredTables) {
    const { error } = await supabaseAdmin.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      missingTables.push({ table, error: error.message });
    } else {
      existingTables.push(table);
    }
  }

  console.log(`\n✅ Các bảng ĐÃ TỒN TẠI (${existingTables.length}/${requiredTables.length}):`);
  console.log(existingTables.join(', '));

  if (missingTables.length > 0) {
    console.log(`\n⚠️ Các bảng CHƯA TẠO (${missingTables.length}):`);
    missingTables.forEach(t => console.log(`   - ${t.table}: ${t.error}`));
  } else {
    console.log('\n🎉 TOÀN BỘ 23 BẢNG ĐÃ TỒN TẠI ĐẦY ĐỦ TRÊN SUPABASE CLOUD!');
  }
}

inspectTables();
