/**
 * Rút gọn chức vụ ban cán sự lớp để hiển thị gọn gàng trên thẻ sơ đồ bàn học,
 * tránh che khuất avatar khi chiều ngang bàn học hạn chế.
 *
 * Ví dụ:
 * - Lớp trưởng -> LT
 * - Lớp phó học tập -> PHT
 * - Lớp phó lao động -> PLĐ
 * - Lớp phó văn thể mỹ -> PVTM
 * - Lớp phó -> LP
 * - Cờ đỏ -> CĐ
 * - Tổ trưởng tổ 1 -> TTt1
 * - Tổ trưởng tổ 2 -> TTt2
 * - Tổ trưởng tổ 3 -> TTt3
 * - Tổ trưởng tổ 4 -> TTt4
 * - Tổ phó tổ 1 -> TPt1
 * - Tổ phó tổ 2 -> TPt2
 * - Tổ phó tổ 3 -> TPt3
 * - Tổ phó tổ 4 -> TPt4
 * - Thủ quỹ -> TQ
 * - Bí thư -> BT
 */
export const getShortRole = (role?: string): string => {
  if (!role) return '';
  const trimmed = role.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'học sinh' || lower === 'thành viên') return '';

  // Lớp trưởng
  if (lower.includes('lớp trưởng') || lower === 'lt') return 'LT';

  // Lớp phó học tập
  if (lower.includes('phó') && lower.includes('học tập')) return 'PHT';
  // Lớp phó lao động
  if (lower.includes('phó') && lower.includes('lao động')) return 'PLĐ';
  // Lớp phó văn thể
  if (lower.includes('phó') && (lower.includes('văn thể') || lower.includes('văn nghệ'))) return 'PVTM';
  // Lớp phó chung
  if (lower === 'lớp phó' || lower === 'lp') return 'LP';

  // Cờ đỏ
  if (lower.includes('cờ đỏ') || lower === 'cđ') return 'CĐ';

  // Tổ trưởng tổ X (TTt1, TTt2, TTt3, TTt4)
  if (lower.includes('tổ trưởng') || lower.startsWith('tt')) {
    const match = lower.match(/\d+/);
    if (match) {
      return `TTt${match[0]}`;
    }
    return 'TT';
  }

  // Tổ phó tổ X (TPt1, TPt2, TPt3, TPt4)
  if (lower.includes('tổ phó') || lower.startsWith('tp')) {
    const match = lower.match(/\d+/);
    if (match) {
      return `TPt${match[0]}`;
    }
    return 'TP';
  }

  // Thủ quỹ
  if (lower.includes('thủ quỹ') || lower === 'tq') return 'TQ';

  // Bí thư
  if (lower.includes('bí thư') || lower === 'bt') return 'BT';

  // Các chức vụ tuỳ biến khác: nếu dài hơn 5 ký tự thì lấy các chữ cái đầu
  if (trimmed.length > 5) {
    return trimmed
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }

  return trimmed;
};

/**
 * Cấu hình huy hiệu chức vụ in ấn với màu sắc rực rỡ và biểu tượng nhận diện,
 * tối ưu tuyệt đẹp khi in ra máy in phun màu (Epson / HP / Canon Color)
 * và vẫn giữ độ tương phản viền sắc nét khi in máy laser đơn sắc (Canon LBP2900).
 */
export interface PrintRoleBadgeStyle {
  label: string;
  className: string;
  icon?: string;
}

export const getPrintRoleBadge = (role?: string, isMonochrome?: boolean): PrintRoleBadgeStyle | null => {
  const short = getShortRole(role);
  if (!short) return null;

  if (isMonochrome) {
    return {
      label: short,
      icon: short === 'LT' ? '👑' : short.startsWith('TT') ? '🚩' : undefined,
      className: 'bg-black text-white border border-black font-black',
    };
  }

  const lower = (role || '').toLowerCase();

  // Lớp trưởng: Vàng Kim Hoàng Gia
  if (short === 'LT' || lower.includes('lớp trưởng')) {
    return {
      label: short,
      icon: '👑',
      className: 'bg-amber-100 text-amber-950 border-amber-400 font-black shadow-xs',
    };
  }
  // Lớp phó học tập: Xanh Dương Tri Thức
  if (short === 'PHT' || (lower.includes('phó') && lower.includes('học'))) {
    return {
      label: short,
      icon: '📘',
      className: 'bg-blue-100 text-blue-950 border-blue-400 font-black shadow-xs',
    };
  }
  // Lớp phó lao động: Xanh Ngọc Cần Cù
  if (short === 'PLĐ' || (lower.includes('phó') && lower.includes('lao động'))) {
    return {
      label: short,
      icon: '🧹',
      className: 'bg-teal-100 text-teal-950 border-teal-400 font-black shadow-xs',
    };
  }
  // Lớp phó văn thể mỹ: Hồng Nghệ Thuật
  if (short === 'PVTM' || (lower.includes('phó') && (lower.includes('văn') || lower.includes('thể')))) {
    return {
      label: short,
      icon: '🎨',
      className: 'bg-pink-100 text-pink-950 border-pink-400 font-black shadow-xs',
    };
  }
  // Tổ trưởng: Đỏ Cờ Tiên Phong
  if (short.startsWith('TT') || lower.includes('tổ trưởng')) {
    return {
      label: short,
      icon: '🚩',
      className: 'bg-rose-100 text-rose-950 border-rose-400 font-black shadow-xs',
    };
  }
  // Tổ phó: Xanh Lá Mầm Non
  if (short.startsWith('TP') || lower.includes('tổ phó')) {
    return {
      label: short,
      icon: '🌱',
      className: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-black shadow-xs',
    };
  }
  // Cờ đỏ: Đỏ Tươi
  if (short === 'CĐ' || lower.includes('cờ đỏ')) {
    return {
      label: short,
      icon: '⭐',
      className: 'bg-red-100 text-red-950 border-red-400 font-black shadow-xs',
    };
  }
  // Thủ quỹ: Vàng Cam
  if (short === 'TQ' || lower.includes('thủ quỹ')) {
    return {
      label: short,
      icon: '💰',
      className: 'bg-yellow-100 text-yellow-950 border-yellow-400 font-black shadow-xs',
    };
  }
  // Bí thư: Xanh Đậm Đoàn
  if (short === 'BT' || lower.includes('bí thư')) {
    return {
      label: short,
      icon: '🎖️',
      className: 'bg-indigo-100 text-indigo-950 border-indigo-400 font-black shadow-xs',
    };
  }

  // Mặc định
  return {
    label: short,
    className: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
  };
};

/**
 * Cấu hình chấm tròn màu phân biệt Tổ ở viền Avatar:
 * - Tổ 1: Xanh dương
 * - Tổ 2: Xanh lá
 * - Tổ 3: Cam
 * - Tổ 4: Tím
 */
export interface GroupColorDotConfig {
  bgClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  badgeBorderClass: string;
  title: string;
  shortLabel: string;
}

export const getGroupColorDot = (groupName?: string): GroupColorDotConfig => {
  if (!groupName) {
    return {
      bgClass: 'bg-slate-400',
      badgeBgClass: 'bg-slate-100',
      badgeTextClass: 'text-slate-600',
      badgeBorderClass: 'border-slate-200/80',
      title: 'Chưa phân tổ',
      shortLabel: 'T?',
    };
  }

  const lower = groupName.toLowerCase().trim();

  // Tổ 1: Xanh dương
  if (lower.includes('1')) {
    return {
      bgClass: 'bg-blue-500',
      badgeBgClass: 'bg-blue-50',
      badgeTextClass: 'text-blue-700',
      badgeBorderClass: 'border-blue-200',
      title: 'Tổ 1 (Màu Xanh dương)',
      shortLabel: 'T1',
    };
  }

  // Tổ 2: Xanh lá
  if (lower.includes('2')) {
    return {
      bgClass: 'bg-emerald-500',
      badgeBgClass: 'bg-emerald-50',
      badgeTextClass: 'text-emerald-700',
      badgeBorderClass: 'border-emerald-200',
      title: 'Tổ 2 (Màu Xanh lá)',
      shortLabel: 'T2',
    };
  }

  // Tổ 3: Cam
  if (lower.includes('3')) {
    return {
      bgClass: 'bg-amber-500',
      badgeBgClass: 'bg-amber-50',
      badgeTextClass: 'text-amber-800',
      badgeBorderClass: 'border-amber-200',
      title: 'Tổ 3 (Màu Cam)',
      shortLabel: 'T3',
    };
  }

  // Tổ 4: Tím
  if (lower.includes('4')) {
    return {
      bgClass: 'bg-purple-500',
      badgeBgClass: 'bg-purple-50',
      badgeTextClass: 'text-purple-700',
      badgeBorderClass: 'border-purple-200',
      title: 'Tổ 4 (Màu Tím)',
      shortLabel: 'T4',
    };
  }

  return {
    bgClass: 'bg-slate-400',
    badgeBgClass: 'bg-slate-100',
    badgeTextClass: 'text-slate-600',
    badgeBorderClass: 'border-slate-200/80',
    title: groupName,
    shortLabel: groupName,
  };
};
