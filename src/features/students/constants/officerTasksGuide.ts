export interface OfficerTaskGuide {
  roleTitle: string;
  badgeLabel: string;
  icon: string;
  themeColor: 'amber' | 'blue' | 'sky' | 'emerald' | 'teal' | 'slate';
  motto: string;
  coreTasks: string[];
  weeklyFocus: string;
  handlingTip: string;
}

/**
 * Cẩm nang phân công nhiệm vụ tự quản cho Ban Cán Sự Lớp 6A6
 * Biên soạn dựa trên tài liệu BAN-CAN-SU-LOP-6A6.md và Quy trình xử lý tình huống 7 bước
 */
export function getOfficerTaskGuide(role?: string, studentName?: string): OfficerTaskGuide {
  const normalized = (role || '').trim().toLowerCase();
  const name = studentName || 'em';

  // 1. LỚP TRƯỞNG
  if (normalized.includes('lớp trưởng') || normalized === 'lt') {
    return {
      roleTitle: `Nhiệm Vụ Lớp Trưởng - ${name}`,
      badgeLabel: '👑 Lớp Trưởng',
      icon: '👑',
      themeColor: 'amber',
      motto: 'Không làm thay các bạn mà hướng dẫn, nhắc nhở và tạo động lực để cùng tiến bộ.',
      coreTasks: [
        'Điều hành và nắm sĩ số, nề nếp chung của toàn thể 47 học sinh trong lớp.',
        'Chủ trì cuộc họp Ban cán sự lớp 5–10 phút cuối tuần để tổng hợp việc tốt và việc cần khắc phục.',
        'Phối hợp với Phó học tập, Phó lao động và 4 Tổ trưởng giữ nhịp sinh hoạt tích cực.',
        'Báo cáo nhanh với Thầy Phan Văn Bộ những khó khăn hoặc đề xuất tuyên dương trong tuần.',
      ],
      weeklyFocus: 'Tập trung duy trì trật tự 15 phút đầu giờ, đôn đốc các tổ truy bài nghiêm túc và tạo không khí học tập vui vẻ.',
      handlingTip: 'Khi bạn chưa nghe lời nhắc: Nhắc ngắn gọn, cho bạn cơ hội sửa. Tuyệt đối không đôi co, nếu căng thẳng hãy dừng lại và báo Thầy.',
    };
  }

  // 2. LỚP PHÓ HỌC TẬP
  if (normalized.includes('học tập')) {
    return {
      roleTitle: `Nhiệm Vụ Phó Học Tập - ${name}`,
      badgeLabel: '📘 Phó Học Tập',
      icon: '📘',
      themeColor: 'blue',
      motto: 'Xây dựng phong trào "Bạn giúp bạn – cùng nhau tiến bộ".',
      coreTasks: [
        'Theo dõi tình hình chuẩn bị bài tập về nhà và đồ dùng học tập trước giờ vào lớp.',
        'Phối hợp 4 Tổ trưởng phát hiện bạn gặp khó khăn trong môn học để phân công đôi bạn cùng tiến.',
        'Đề xuất với GVCN tuyên dương các bạn có hoa điểm tốt hoặc có tiến bộ rõ rệt trong tuần.',
        'Thay mặt Lớp trưởng điều hành lớp khi Lớp trưởng vắng mặt.',
      ],
      weeklyFocus: 'Khảo sát nhanh các bạn còn vướng bài tập Toán và Văn trong tuần để hỗ trợ kịp thời.',
      handlingTip: 'Học tập là hỗ trợ, không phải kiểm tra bắt lỗi. Hãy hỏi: "Bạn có cần tớ giảng lại bài này không?" thay vì chỉ trích bạn.',
    };
  }

  // 3. LỚP PHÓ LAO ĐỘNG
  if (normalized.includes('lao động')) {
    return {
      roleTitle: `Nhiệm Vụ Phó Lao Động - ${name}`,
      badgeLabel: '🧹 Phó Lao Động',
      icon: '🧹',
      themeColor: 'sky',
      motto: 'Giữ cho lớp học luôn "Sạch – Gọn – Đẹp – An toàn" mỗi ngày.',
      coreTasks: [
        'Phụ trách vệ sinh lớp học và khu vực hành lang được nhà trường phân công.',
        'Đôn đốc tổ trực nhật hoàn thành nhiệm vụ trước 7h15 sáng và sau giờ tan học.',
        'Kiểm tra việc kê bàn ghế ngay ngắn, lau bảng sạch sẽ, đóng cửa và tắt điện quạt khi ra về.',
        'Chủ động đề xuất các sáng kiến giữ lớp sạch đẹp mà không cần đợi thầy cô nhắc nhở.',
      ],
      weeklyFocus: 'Đôn đốc tổ trực nhật tuần đổ rác đúng nơi quy định và giữ gìn góc cây xanh của lớp tươi tốt.',
      handlingTip: 'Cùng làm với bạn trực nhật trong những buổi đầu để hướng dẫn quy trình sạch - gọn thay vì chỉ đứng chỉ đạo.',
    };
  }

  // PHÓ VĂN THỂ MỸ
  if (normalized.includes('văn thể')) {
    return {
      roleTitle: `Nhiệm Vụ Phó Văn Thể Mỹ - ${name}`,
      badgeLabel: '🎨 Phó Văn Thể Mỹ',
      icon: '🎨',
      themeColor: 'sky',
      motto: 'Khuấy động phong trào, mang niềm vui và năng lượng tích cực đến từng tiết học.',
      coreTasks: [
        'Phụ trách tổ chức các bài hát đầu giờ, quản ca và thể dục giữa giờ của lớp.',
        'Lên kế hoạch tập luyện các tiết mục văn nghệ chào mừng ngày lễ lớn (20/11, 26/3, 8/3...).',
        'Phối hợp trang trí lớp học, bảng tin và báo tường theo chủ điểm tháng.',
        'Động viên các bạn tham gia câu lạc bộ thể thao, vẽ tranh và văn nghệ của trường.',
      ],
      weeklyFocus: 'Duy trì thói quen hát 1 bài hát vui tươi đầu mỗi buổi học để tạo tinh thần hứng khởi.',
      handlingTip: 'Tôn trọng sự rụt rè của bạn, khích lệ từng bước nhỏ thay vì ép buộc bạn biểu diễn trước đông người.',
    };
  }

  // THỦ QUỸ
  if (normalized.includes('thủ quỹ')) {
    return {
      roleTitle: `Nhiệm Vụ Thủ Quỹ - ${name}`,
      badgeLabel: '💰 Thủ Quỹ',
      icon: '💰',
      themeColor: 'amber',
      motto: 'Công khai, minh bạch, giữ gìn quỹ lớp cẩn thận đến từng đồng.',
      coreTasks: [
        'Thu và quản lý các khoản quỹ tự nguyện của lớp theo thống nhất của GVCN và Ban đại diện cha mẹ học sinh.',
        'Ghi chép sổ sách thu - chi rõ ràng, chi tiết từng khoản (photo tài liệu, thăm hỏi ốm đau, phần thưởng nề nếp...).',
        'Báo cáo công khai tài chính định kỳ vào tiết sinh hoạt lớp cuối tháng cho GVCN và cả lớp.',
        'Giữ tiền cẩn thận, không để tại lớp học sau giờ tan trường.',
      ],
      weeklyFocus: 'Rà soát sổ thu chi, lưu trữ đầy đủ hóa đơn/biên nhận các khoản chi phục vụ học tập của lớp.',
      handlingTip: 'Nguyên tắc vàng: Chỉ chi tiền khi có sự phê duyệt của Thầy GVCN hoặc Lớp trưởng.',
    };
  }

  // SAO ĐỎ / ĐỘI CỜ ĐỎ
  if (normalized.includes('sao đỏ') || normalized.includes('cờ đỏ')) {
    return {
      roleTitle: `Nhiệm Vụ Đội Sao Đỏ - ${name}`,
      badgeLabel: '⭐ Đội Sao Đỏ',
      icon: '⭐',
      themeColor: 'emerald',
      motto: 'Gương mẫu, công tâm, giữ vững nề nếp kỷ cương của lớp và toàn trường.',
      coreTasks: [
        'Tham gia làm nhiệm vụ trực cờ đỏ theo lịch phân công của Liên đội nhà trường.',
        'Theo dõi, chấm điểm nề nếp lớp được phân công trực (đồng phục, khăn quàng, vệ sinh, trật tự).',
        'Gương mẫu tuyệt đối trong việc chấp hành nội quy trường lớp để làm gương cho các bạn.',
        'Báo cáo kết quả trực tuần với GVCN và Liên đội một cách khách quan, trung thực.',
      ],
      weeklyFocus: 'Đi trực đúng giờ quy định của Liên đội, nhắc nhở nụ cười thân thiện trước khi ghi nhận lỗi.',
      handlingTip: 'Mục đích của Sao đỏ là giúp bạn tốt lên, không phải săm soi bắt bẻ. Luôn cư xử đúng mực và tôn trọng bạn.',
    };
  }

  // 4. TỔ TRƯỞNG
  if (normalized.includes('tổ trưởng') || normalized === 'tt') {
    return {
      roleTitle: `Nhiệm Vụ Tổ Trưởng - ${name}`,
      badgeLabel: '🚩 Tổ Trưởng',
      icon: '🚩',
      themeColor: 'emerald',
      motto: 'Tổ chức tự quản trách nhiệm, tinh thần xây dựng, không phê bình cá nhân.',
      coreTasks: [
        'Quản lý và nắm chắc nề nếp, chuẩn bị sách vở và ý thức học tập của các thành viên trong tổ.',
        'Phân công lịch trực nhật công bằng giữa các thành viên, tránh để 1 bạn làm thay nhiều bạn.',
        'Bình bầu học sinh xuất sắc tiêu biểu và ghi nhận các bạn có tiến bộ vào tiết sinh hoạt cuối tuần.',
        'Báo cáo ngắn gọn tình hình tổ với Lớp phó học tập và Lớp trưởng theo tinh thần xây dựng.',
      ],
      weeklyFocus: 'Động viên các thành viên trong tổ mạnh dạn giơ tay phát biểu xây dựng bài để giành điểm thi đua cho tổ.',
      handlingTip: 'Khen ngợi công khai trước tổ khi bạn làm tốt; nhắc nhở riêng nhẹ nhàng khi bạn chưa hoàn thành nhiệm vụ.',
    };
  }

  // 5. TỔ PHÓ
  if (normalized.includes('tổ phó') || normalized === 'tp') {
    return {
      roleTitle: `Nhiệm Vụ Tổ Phó - ${name}`,
      badgeLabel: '🌱 Tổ Phó',
      icon: '🌱',
      themeColor: 'teal',
      motto: 'Cánh tay đắc lực, đồng hành và hỗ trợ Tổ trưởng điều hành tổ.',
      coreTasks: [
        'Hỗ trợ Tổ trưởng kiểm tra việc chuẩn bị sách vở, bài tập về nhà và đồ dùng học tập.',
        'Thay mặt Tổ trưởng điều hành tổ tự quản khi Tổ trưởng vắng mặt hoặc bận việc.',
        'Đồng hành và giúp đỡ trực tiếp các thành viên còn yếu hoặc chưa theo kịp bài giảng.',
        'Cùng Tổ trưởng xây dựng tinh thần thi đua đoàn kết, lành mạnh trong tổ.',
      ],
      weeklyFocus: 'Hỗ trợ kiểm tra chéo vở bài tập đầu giờ và đồng hành trực nhật cùng thành viên tổ.',
      handlingTip: 'Nhắc nhở nhẹ nhàng, tích cực, không gắn nhãn bạn lười. Báo ngay cho Tổ trưởng nếu gặp việc khó giải quyết.',
    };
  }

  // 6. THÀNH VIÊN
  return {
    roleTitle: `Trách Nhiệm Thành Viên - ${name}`,
    badgeLabel: 'Thành Viên',
    icon: '🎒',
    themeColor: 'slate',
    motto: 'Chủ động học tập - Kỷ luật tự giác - Đoàn kết cùng nhau tiến bộ.',
    coreTasks: [
      'Đi học đúng giờ, mặc đồng phục đúng quy định và giữ gìn vệ sinh chung của lớp.',
      'Soạn bài và làm bài tập về nhà đầy đủ trước khi tới trường.',
      'Tích cực phát biểu xây dựng bài, hợp tác vui vẻ trong các hoạt động nhóm của tổ.',
      'Chấp hành sự phân công trực nhật của Tổ trưởng và hỗ trợ bạn bè khi gặp khó khăn.',
    ],
    weeklyFocus: 'Phấn đấu đạt ít nhất 3 hoa điểm tốt hoặc lời khen ngợi từ thầy cô bộ môn trong tuần.',
    handlingTip: 'Mỗi ngày làm một việc tốt giúp đỡ bạn bè để cùng xây dựng tập thể 6A6 vững mạnh.',
  };
}
