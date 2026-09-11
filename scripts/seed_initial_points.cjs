const { createClient } = require('@supabase/supabase-js');

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';
const supabase = createClient(url, serviceRoleKey);

const classId = '66666666-6666-6666-6666-666666666666';
const gvcnId = '601dce7f-13e4-4680-b2f9-f86ed1a17079';

async function seedPointsAndWeekAttendance() {
  console.log('🚀 Nạp dữ liệu thi đua tuần đầu năm học 2026-2027 cho lớp 6A6...');

  // 1. Lấy danh sách học sinh theo từng tổ
  const { data: students, error: errStd } = await supabase
    .from('students')
    .select('id, full_name, group_id')
    .eq('class_id', classId)
    .is('deleted_at', null);

  if (errStd || !students || students.length === 0) {
    console.error('Không tìm thấy học sinh:', errStd);
    return;
  }

  // 2. Lấy danh sách tiêu chí
  const { data: categories } = await supabase
    .from('point_categories')
    .select('id, title, type, default_points, default_stars')
    .eq('class_id', classId);

  const catMap = new Map();
  categories?.forEach(c => catMap.set(c.title, c));

  // Phân nhóm học sinh theo Tổ
  const studentsByGroup = {};
  students.forEach(s => {
    if (!studentsByGroup[s.group_id]) studentsByGroup[s.group_id] = [];
    studentsByGroup[s.group_id].push(s);
  });

  const groupIds = Object.keys(studentsByGroup);

  // 3. Chuẩn bị danh sách giao dịch điểm từ Thứ 2 (2026-09-07) đến Thứ 6 (2026-09-11)
  const transactions = [];

  // Thứ 2 (2026-09-07): Khai giảng & Nề nếp đầu tuần
  const sT1_1 = studentsByGroup[groupIds[0]]?.[0];
  const sT2_1 = studentsByGroup[groupIds[1]]?.[0];
  const sT3_1 = studentsByGroup[groupIds[2]]?.[0];
  const sT4_1 = studentsByGroup[groupIds[3]]?.[0];

  if (sT1_1) {
    transactions.push({
      class_id: classId,
      student_id: sT1_1.id,
      category_id: catMap.get('Buổi học tốt, trật tự')?.id,
      points: 5,
      stars: 5,
      reason: 'Buổi học tốt, trật tự đầu tuần',
      note: 'Tập thể Tổ 1 nghiêm túc trong tiết Chào cờ',
      occurred_at: '2026-09-07T08:30:00+07:00',
      created_by: gvcnId
    });
  }
  if (sT2_1) {
    transactions.push({
      class_id: classId,
      student_id: sT2_1.id,
      category_id: catMap.get('Vệ sinh lớp học sạch sẽ')?.id,
      points: 3,
      stars: 3,
      reason: 'Vệ sinh lớp học sạch sẽ',
      note: 'Trực nhật đầu tuần chu đáo',
      occurred_at: '2026-09-07T11:45:00+07:00',
      created_by: gvcnId
    });
  }

  // Thứ 3 (2026-09-08): Học tập & Phát biểu
  const sT1_2 = studentsByGroup[groupIds[0]]?.[1];
  const sT3_2 = studentsByGroup[groupIds[2]]?.[1];
  if (sT1_2) {
    transactions.push({
      class_id: classId,
      student_id: sT1_2.id,
      category_id: catMap.get('Đạt điểm 9, 10 kiểm tra miệng')?.id,
      points: 5,
      stars: 5,
      reason: 'Đạt điểm 10 kiểm tra bài cũ môn Toán',
      note: 'Làm bài nhanh và chính xác',
      occurred_at: '2026-09-08T09:15:00+07:00',
      created_by: gvcnId
    });
  }
  if (sT3_2) {
    transactions.push({
      class_id: classId,
      student_id: sT3_2.id,
      category_id: catMap.get('Phát biểu xây dựng bài sôi nổi')?.id,
      points: 2,
      stars: 2,
      reason: 'Phát biểu sôi nổi môn Ngữ văn',
      note: 'Đóng góp ý kiến hay',
      occurred_at: '2026-09-08T14:20:00+07:00',
      created_by: gvcnId
    });
  }

  // Thứ 4 (2026-09-09): Soạn bài & Giúp đỡ bạn bè
  const sT2_2 = studentsByGroup[groupIds[1]]?.[1];
  const sT4_2 = studentsByGroup[groupIds[3]]?.[1];
  if (sT2_2) {
    transactions.push({
      class_id: classId,
      student_id: sT2_2.id,
      category_id: catMap.get('Soạn bài và làm bài tập đầy đủ')?.id,
      points: 3,
      stars: 3,
      reason: 'Vở ghi chép sạch đẹp, soạn bài chu đáo',
      note: 'Tuyên dương trước lớp',
      occurred_at: '2026-09-09T10:00:00+07:00',
      created_by: gvcnId
    });
  }
  if (sT4_2) {
    transactions.push({
      class_id: classId,
      student_id: sT4_2.id,
      category_id: catMap.get('Giúp đỡ bạn bè cùng tiến bộ')?.id,
      points: 3,
      stars: 3,
      reason: 'Hỗ trợ bạn cùng bàn giải bài tập khó',
      note: 'Tinh thần tương thân tương ái',
      occurred_at: '2026-09-09T15:30:00+07:00',
      created_by: gvcnId
    });
  }

  // Thứ 5 (2026-09-10): Hoạt động phong trào Đội & Nhắc nhở
  const sT1_3 = studentsByGroup[groupIds[0]]?.[2];
  const sT3_3 = studentsByGroup[groupIds[2]]?.[2];
  if (sT1_3) {
    transactions.push({
      class_id: classId,
      student_id: sT1_3.id,
      category_id: catMap.get('Tích cực tham gia phong trào Đội')?.id,
      points: 5,
      stars: 5,
      reason: 'Tích cực tham gia tập luyện nghi thức Đội',
      note: 'Chuẩn bị đại hội chi đội',
      occurred_at: '2026-09-10T08:45:00+07:00',
      created_by: gvcnId
    });
  }
  if (sT3_3) {
    transactions.push({
      class_id: classId,
      student_id: sT3_3.id,
      category_id: catMap.get('Nói chuyện riêng, mất trật tự')?.id,
      points: -2,
      stars: 0,
      reason: 'Nói chuyện riêng trong giờ Sinh học',
      note: 'Đã nhắc nhở rút kinh nghiệm',
      occurred_at: '2026-09-10T14:10:00+07:00',
      created_by: gvcnId
    });
  }

  // Thứ 6 (2026-09-11 Hôm nay): Tổng kết tuần & Điểm tốt
  const sT2_3 = studentsByGroup[groupIds[1]]?.[2];
  const sT4_3 = studentsByGroup[groupIds[3]]?.[2];
  if (sT2_3) {
    transactions.push({
      class_id: classId,
      student_id: sT2_3.id,
      category_id: catMap.get('Đi học đầy đủ cả tuần')?.id,
      points: 5,
      stars: 5,
      reason: 'Chuyên cần xuất sắc trọn vẹn tuần 1',
      note: 'Gương mẫu đi học đúng giờ',
      occurred_at: '2026-09-11T09:30:00+07:00',
      created_by: gvcnId
    });
  }
  if (sT4_3) {
    transactions.push({
      class_id: classId,
      student_id: sT4_3.id,
      category_id: catMap.get('Buổi học tốt, trật tự')?.id,
      points: 5,
      stars: 5,
      reason: 'Buổi học tốt môn Tiếng Anh',
      note: 'Hăng hái phát âm chuẩn',
      occurred_at: '2026-09-11T14:00:00+07:00',
      created_by: gvcnId
    });
  }

  // Ghi vào database
  const { error: errTx } = await supabase.from('point_transactions').insert(transactions);
  if (errTx) {
    console.error('Lỗi chèn giao dịch điểm:', errTx.message);
  } else {
    console.log(`✅ Đã nạp thành công ${transactions.length} giao dịch thi đua thực tế cho tuần khai giảng!`);
  }

  // 4. Tạo các phiên điểm danh từ Thứ 2 đến Thứ 5
  const weekDays = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'];
  for (const date of weekDays) {
    for (const type of ['morning', 'afternoon']) {
      const { data: existing } = await supabase
        .from('attendance_sessions')
        .select('id')
        .eq('class_id', classId)
        .eq('session_date', date)
        .eq('session_type', type)
        .maybeSingle();

      if (!existing) {
        const { data: newSess } = await supabase
          .from('attendance_sessions')
          .insert({
            class_id: classId,
            session_date: date,
            session_type: type,
            is_locked: true,
            created_by: gvcnId
          })
          .select()
          .single();

        if (newSess) {
          // Tạo bản ghi điểm danh cho 47 học sinh
          const records = students.map((st, idx) => {
            let status = 'present';
            let note = null;
            if (date === '2026-09-08' && idx === 10) {
              status = 'excused';
              note = 'Nghỉ ốm nhẹ có đơn xin phép';
            } else if (date === '2026-09-09' && idx === 25) {
              status = 'late';
              note = 'Hỏng xe đi muộn 10 phút';
            }
            return {
              session_id: newSess.id,
              student_id: st.id,
              status,
              note
            };
          });

          await supabase.from('attendance_records').insert(records);
        }
      }
    }
  }
  console.log('✅ Đã tạo các phiên điểm danh đầy đủ từ Thứ 2 đến Thứ 6 cho lớp 6A6!');
}

seedPointsAndWeekAttendance();
