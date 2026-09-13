import React from 'react';

export interface RoleBadgeProps {
  role?: string;
  className?: string;
}

/**
 * Huy hiệu cán sự lớp 6A6 với màu sắc và biểu tượng đặc trưng
 * - Lớp trưởng: Màu vàng đồng hoàng kim (Crown 👑)
 * - Lớp phó học tập: Màu xanh dương tri thức (Book 📘)
 * - Lớp phó lao động / Lớp phó: Màu xanh biển năng động (Tools/Shield 🧹/🛡️)
 * - Tổ trưởng: Màu xanh lục tươi sáng (Flag 🚩)
 * - Tổ phó: Màu xanh ngọc dịu mát (Sprout 🌱)
 * - Thành viên: Màu trung tính tinh gọn
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const rawRole = role || 'Thành viên';
  const normalized = rawRole.trim().toLowerCase();

  // 1. Lớp trưởng: Màu vàng đồng đặc trưng
  if (normalized.includes('lớp trưởng') || normalized === 'lt') {
    return (
      <span
        data-testid="role-badge-lop-truong"
        className={`inline-flex items-center gap-1 text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs ${className}`}
        title="Ban cán sự: Lớp trưởng điều hành chung toàn lớp"
      >
        <span className="text-xs">👑</span>
        <span>Lớp Trưởng</span>
      </span>
    );
  }

  // 2. Lớp phó học tập: Màu xanh dương đặc trưng
  if (normalized.includes('học tập')) {
    return (
      <span
        data-testid="role-badge-pho-hoc-tap"
        className={`inline-flex items-center gap-1 text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs ${className}`}
        title="Ban cán sự: Lớp phó phụ trách học tập & nề nếp"
      >
        <span className="text-xs">📘</span>
        <span>Phó Học Tập</span>
      </span>
    );
  }

  // 3. Lớp phó lao động / Lớp phó khác: Màu xanh lam/biển
  if (normalized.includes('lao động') || (normalized.includes('phó') && !normalized.includes('tổ'))) {
    const isLaoDong = normalized.includes('lao động');
    return (
      <span
        data-testid="role-badge-lop-pho"
        className={`inline-flex items-center gap-1 text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-900 border border-sky-300 shadow-2xs ${className}`}
        title={`Ban cán sự: ${rawRole}`}
      >
        <span className="text-xs">{isLaoDong ? '🧹' : '🛡️'}</span>
        <span>{rawRole}</span>
      </span>
    );
  }

  // 4. Tổ trưởng: Màu xanh lục đặc trưng
  if (normalized.includes('tổ trưởng') || normalized === 'tt') {
    return (
      <span
        data-testid="role-badge-to-truong"
        className={`inline-flex items-center gap-1 text-[10.5px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs ${className}`}
        title="Ban cán sự: Tổ trưởng tự quản tổ"
      >
        <span className="text-xs">🚩</span>
        <span>{rawRole.includes('Tổ') ? rawRole : 'Tổ Trưởng'}</span>
      </span>
    );
  }

  // 5. Tổ phó: Màu xanh ngọc (Teal)
  if (normalized.includes('tổ phó') || normalized === 'tp') {
    return (
      <span
        data-testid="role-badge-to-pho"
        className={`inline-flex items-center gap-1 text-[10.5px] font-bold uppercase px-2 py-0.5 rounded-lg bg-teal-100 text-teal-900 border border-teal-300 shadow-2xs ${className}`}
        title="Ban cán sự: Tổ phó hỗ trợ tổ trưởng"
      >
        <span className="text-xs">🌱</span>
        <span>{rawRole.includes('Tổ') ? rawRole : 'Tổ Phó'}</span>
      </span>
    );
  }

  // 6. Thành viên thông thường
  return (
    <span
      data-testid="role-badge-thanh-vien"
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/70 ${className}`}
    >
      {rawRole}
    </span>
  );
};
