const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const url = 'https://huatporucovamymegjnw.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YXRwb3J1Y292YW15bWVnam53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTA5MTY4OCwiZXhwIjoyMTA0NjY3Njg4fQ.9ZoG20OJTKaN_98BRlCm3VgO4jYD0MSS_J4CVF4_9-A';
const supabase = createClient(url, serviceRoleKey);

const classId = '66666666-6666-6666-6666-666666666666';

// Mapping giáo viên bộ môn theo chương trình THCS chuẩn
const teacherMapping = {
  'Toán': 'Thầy Phan Văn Bộ (GVCN)',
  'Ngữ Văn': 'Cô Nguyễn Thị Mai',
  'Tiếng Anh': 'Cô Hoàng Lan',
  'KHTN': 'Thầy Trần Đức',
  'Lịch sử - Địa lý': 'Cô Lê Phương',
  'Tin học': 'Thầy Vũ Bình',
  'GDTC': 'Thầy Đặng Long',
  'Nghệ thuật': 'Cô Bùi Hương',
  'Công nghệ': 'Thầy Phạm Hưng',
  'GDCD': 'Cô Đỗ Oanh',
  'GDĐP': 'Cô Nguyễn Thị Mai',
  'HĐTNHN': 'Thầy Phan Văn Bộ (GVCN)',
  'Chào cờ': 'Thầy Phan Văn Bộ (GVCN)',
  'SHL': 'Thầy Phan Văn Bộ (GVCN)'
};

// Mapping bài học tuần 1 theo phân phối chương trình lớp 6
const lessonTopics = {
  'Chào cờ': 'Lễ Khai giảng & Phát động thi đua năm học mới',
  'SHL': 'Sinh hoạt lớp tuần 1: Bầu Ban Cán Sự & Phân tổ thi đua',
  'Toán': [
    'Tiết 1: Tập hợp các số tự nhiên',
    'Tiết 2: Cách ghi số tự nhiên',
    'Tiết 3: Thứ tự trong tập hợp các số tự nhiên',
    'Tiết 4: Phép cộng và phép trừ số tự nhiên'
  ],
  'Ngữ Văn': [
    'Tiết 1: Bài học đường đời đầu tiên (Dế Mèn phiêu lưu ký)',
    'Tiết 2: Tìm hiểu nhân vật Dế Mèn và Dế Choắt',
    'Tiết 3: Thực hành tiếng Việt: Từ đơn và từ phức',
    'Tiết 4: Viết đoạn văn ghi lại cảm xúc về một bài thơ'
  ],
  'Tiếng Anh': [
    'Unit 1: My New School - Getting Started',
    'Unit 1: A Closer Look 1 (Vocabulary & Pronunciation)',
    'Unit 1: A Closer Look 2 (Grammar)'
  ],
  'KHTN': [
    'Tiết 1: Giới thiệu về Khoa học tự nhiên',
    'Tiết 2: Các lĩnh vực chủ yếu của Khoa học tự nhiên',
    'Tiết 3: Quy định an toàn trong phòng thực hành',
    'Tiết 4: Đo chiều dài, khối lượng và thời gian'
  ],
  'Lịch sử - Địa lý': [
    'Tiết 1: Lịch sử là gì? Ý nghĩa việc học lịch sử',
    'Tiết 2: Thời gian trong lịch sử',
    'Tiết 3: Vị trí của Trái Đất trong hệ Mặt Trời'
  ],
  'Tin học': [
    'Tiết 1: Thông tin và dữ liệu trong đời sống',
    'Tiết 2: Xử lý thông tin và thiết bị lưu trữ'
  ],
  'GDTC': [
    'Tiết 1: Đội hình đội ngũ - Động tác quay tại chỗ',
    'Tiết 2: Đội hình đội ngũ - Biến đổi đội hình'
  ],
  'Nghệ thuật': [
    'Tiết 1: Học hát bài Mùa khai trường',
    'Tiết 2: Nhạc cụ tiết tấu và luyện thanh'
  ],
  'Công nghệ': ['Tiết 1: Khái quát về nhà ở và đời sống gia đình'],
  'GDCD': ['Tiết 1: Tự hào về truyền thống gia đình, dòng họ'],
  'GDĐP': ['Tiết 1: Tìm hiểu văn hóa truyền thống quê hương'],
  'HĐTNHN': [
    'Tiết 1: Khám phá trường THCS mới của em',
    'Tiết 2: Xây dựng nội quy và nét đẹp học sinh 6A6'
  ]
};

async function seedTimetable() {
  console.log('📖 ĐỌC TỆP EXCEL TKB-LOP-6A6.xlsx...');
  const wb = XLSX.readFile('d:/WEB-APP/DU-AN-GVCN/Web-GVCN/TKB-LOP-6A6.xlsx');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const dayColumns = [
    { col: 3, day: 2, label: 'Thứ 2' },
    { col: 4, day: 3, label: 'Thứ 3' },
    { col: 5, day: 4, label: 'Thứ 4' },
    { col: 6, day: 5, label: 'Thứ 5' },
    { col: 7, day: 6, label: 'Thứ 6' }
  ];

  const morningRows = [
    { row: 4, period: 1, time: '07:00 - 07:45' },
    { row: 5, period: 2, time: '07:50 - 08:35' },
    { row: 7, period: 3, time: '09:05 - 09:50' },
    { row: 8, period: 4, time: '09:55 - 10:40' },
    { row: 9, period: 5, time: '10:45 - 11:30' }
  ];

  const afternoonRows = [
    { row: 11, period: 6, time: '14:00 - 14:45' },
    { row: 12, period: 7, time: '14:50 - 15:35' },
    { row: 14, period: 8, time: '16:05 - 16:50' }
  ];

  const subjectCounters = {};
  const entries = [];

  // Parse Buổi Sáng
  morningRows.forEach(m => {
    const r = rows[m.row];
    if (!r) return;
    dayColumns.forEach(d => {
      const subj = r[d.col];
      if (subj && String(subj).trim()) {
        const subjectName = String(subj).trim();
        subjectCounters[subjectName] = (subjectCounters[subjectName] || 0) + 1;
        const count = subjectCounters[subjectName];

        let lessonTopic = null;
        if (Array.isArray(lessonTopics[subjectName])) {
          lessonTopic = lessonTopics[subjectName][count - 1] || `${subjectName} tiết ${count}`;
        } else if (lessonTopics[subjectName]) {
          lessonTopic = lessonTopics[subjectName];
        } else {
          lessonTopic = `${subjectName} tiết ${count}`;
        }

        entries.push({
          class_id: classId,
          day_of_week: d.day,
          period: m.period,
          subject_name: subjectName,
          teacher_name: teacherMapping[subjectName] || 'Giáo viên bộ môn',
          lesson_topic: lessonTopic,
          notes: `Thời gian: ${m.time} • Phòng học: Lớp 6A6`
        });
      }
    });
  });

  // Parse Buổi Chiều
  afternoonRows.forEach(a => {
    const r = rows[a.row];
    if (!r) return;
    dayColumns.forEach(d => {
      const subj = r[d.col];
      if (subj && String(subj).trim()) {
        const subjectName = String(subj).trim();
        subjectCounters[subjectName] = (subjectCounters[subjectName] || 0) + 1;
        const count = subjectCounters[subjectName];

        let lessonTopic = null;
        if (Array.isArray(lessonTopics[subjectName])) {
          lessonTopic = lessonTopics[subjectName][count - 1] || `${subjectName} tiết ${count}`;
        } else if (lessonTopics[subjectName]) {
          lessonTopic = lessonTopics[subjectName];
        } else {
          lessonTopic = `${subjectName} tiết ${count}`;
        }

        entries.push({
          class_id: classId,
          day_of_week: d.day,
          period: a.period,
          subject_name: subjectName,
          teacher_name: teacherMapping[subjectName] || 'Giáo viên bộ môn',
          lesson_topic: lessonTopic,
          notes: `Thời gian: ${a.time} • Phòng học: Lớp 6A6`
        });
      }
    });
  });

  console.log(`Đã trích xuất ${entries.length} tiết học từ file Excel. Tiến hành lưu vào Supabase...`);

  // Xóa dữ liệu cũ nếu có
  await supabase.from('timetable_entries').delete().eq('class_id', classId);

  // Ghi dữ liệu mới
  const { data, error } = await supabase.from('timetable_entries').insert(entries).select();
  if (error) {
    console.error('Lỗi nạp TKB vào Supabase:', error.message);
  } else {
    console.log(`🎉 NẠP THÀNH CÔNG ${data.length} TIẾT HỌC THỜI KHÓA BIỂU & LỊCH BÁO GIẢNG VÀO CLOUD!`);
  }
}

seedTimetable();
