import { createClient } from '@supabase/supabase-js';

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';

const supabaseAdmin = createClient(url, serviceRoleKey);

async function seedData() {
  console.log('🌱 ĐANG NẠP DỮ LIỆU MẪU LỚP 12A1 VÀO SUPABASE CLOUD...');

  // 1. Trường học
  const schoolId = '11111111-1111-1111-1111-111111111111';
  await supabaseAdmin.from('schools').upsert({
    id: schoolId,
    name: 'THPT THANH XUÂN',
    code: 'THPT-TX',
    address: 'Hà Nội'
  });

  // 2. Niên khóa
  const academicYearId = '22222222-2222-2222-2222-222222222222';
  await supabaseAdmin.from('academic_years').upsert({
    id: academicYearId,
    school_id: schoolId,
    name: '2026 - 2027',
    start_date: '2026-09-01',
    end_date: '2027-05-31',
    is_active: true
  });

  // 3. Lớp học 12A1
  const classId = '33333333-3333-3333-3333-333333333333';
  await supabaseAdmin.from('classes').upsert({
    id: classId,
    school_id: schoolId,
    academic_year_id: academicYearId,
    name: 'LỚP 12A1',
    grade_level: 12,
    theme_config: {
      month: 'CHỦ ĐIỂM THÁNG 9: MÁI TRƯỜNG MẾN YÊU',
      title: 'CHUYẾN TÀU THANH XUÂN 12A1',
      bannerColorClass: 'from-[#1e1b4b] to-[#312e81]'
    }
  });

  // 4. 4 Tổ thi đua
  const groups = [
    { id: '44444444-0001-0000-0000-000000000001', class_id: classId, name: 'Tổ 1', color_class: 'text-red-500', order_index: 1 },
    { id: '44444444-0002-0000-0000-000000000002', class_id: classId, name: 'Tổ 2', color_class: 'text-green-500', order_index: 2 },
    { id: '44444444-0003-0000-0000-000000000003', class_id: classId, name: 'Tổ 3', color_class: 'text-yellow-500', order_index: 3 },
    { id: '44444444-0004-0000-0000-000000000004', class_id: classId, name: 'Tổ 4', color_class: 'text-blueAccent', order_index: 4 },
  ];
  await supabaseAdmin.from('groups').upsert(groups);

  // 5. Học sinh mẫu
  const students = [
    { id: '55555555-0001-0000-0000-000000000001', class_id: classId, group_id: groups[0].id, full_name: 'Nguyễn Văn An', gender: 'Nam', birth_date: '2008-03-15', class_role: 'Thành viên', goals: 'Đỗ Đại học Bách Khoa' },
    { id: '55555555-0002-0000-0000-000000000002', class_id: classId, group_id: groups[0].id, full_name: 'Trần Thị Bình', gender: 'Nữ', birth_date: '2008-07-20', class_role: 'Tổ trưởng', goals: 'IELTS 7.5' },
    { id: '55555555-0003-0000-0000-000000000003', class_id: classId, group_id: groups[1].id, full_name: 'Lê Hoàng Cường', gender: 'Nam', birth_date: '2008-11-05', class_role: 'Lớp phó', goals: 'Giải Ba HSG Cấp Tỉnh' },
    { id: '55555555-0004-0000-0000-000000000004', class_id: classId, group_id: groups[1].id, full_name: 'Phạm Quỳnh Dung', gender: 'Nữ', birth_date: '2008-01-12', class_role: 'Thành viên', goals: 'Học sinh xuất sắc' },
  ];
  await supabaseAdmin.from('students').upsert(students);

  // 6. Tiêu chí điểm
  const categories = [
    { id: '66666666-0001-0000-0000-000000000001', class_id: classId, type: 'add', category_group: 'Học tập', title: 'Phát biểu xây dựng bài tích cực', default_points: 2, default_stars: 2 },
    { id: '66666666-0002-0000-0000-000000000002', class_id: classId, type: 'add', category_group: 'Học tập', title: 'Đạt điểm 9, 10 bài kiểm tra', default_points: 5, default_stars: 5 },
    { id: '66666666-0003-0000-0000-000000000003', class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Đi học muộn không lý do', default_points: -2, default_stars: 0 },
    { id: '66666666-0004-0000-0000-000000000004', class_id: classId, type: 'subtract', category_group: 'Nề nếp', title: 'Không làm bài tập về nhà', default_points: -3, default_stars: 0 },
  ];
  await supabaseAdmin.from('point_categories').upsert(categories);

  // 7. Quà tặng
  const rewards = [
    { id: '77777777-0001-0000-0000-000000000001', class_id: classId, name: 'Bút bi gel cao cấp', star_cost: 10, stock_quantity: 20 },
    { id: '77777777-0002-0000-0000-000000000002', class_id: classId, name: 'Sổ tay thanh xuân A5', star_cost: 25, stock_quantity: 10 },
  ];
  await supabaseAdmin.from('rewards').upsert(rewards);

  console.log('✅ ĐÃ NẠP THÀNH CÔNG DỮ LIỆU MẪU LỚP 12A1 LÊN SUPABASE CLOUD!');
}

seedData();
