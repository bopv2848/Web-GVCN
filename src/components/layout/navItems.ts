import type { MenuItem } from '../../types';

export const allNavItems: MenuItem[] = [
  { id: 'dashboard', path: '/', label: 'Tổng quan', iconName: '🏠', roles: ['gvcn', 'bancansu', 'bgh', 'admin'] },
  { id: 'students', path: '/students', label: 'Học sinh & Tổ', iconName: '👥', roles: ['gvcn', 'bancansu', 'bgh', 'admin'] },
  { id: 'points-award', path: '/points?action=award', label: 'Chấm điểm thi đua', iconName: '⭐', roles: ['gvcn', 'bancansu', 'admin'], badge: 'Tác vụ' },
  { id: 'points-ledger', path: '/points', label: 'Tích điểm & Sổ cái thi đua', iconName: '📜', roles: ['gvcn', 'bancansu', 'admin'] },
  { id: 'rewards', path: '/rewards', label: 'Shop Đổi quà', iconName: '🎁', roles: ['gvcn', 'bancansu', 'student', 'parent', 'admin'] },
  { id: 'attendance', path: '/attendance', label: 'Điểm danh', iconName: '📅', roles: ['gvcn', 'bancansu', 'bgh', 'admin'] },
  { id: 'seating', path: '/seating', label: 'Sơ đồ chỗ ngồi', iconName: '🪑', roles: ['gvcn', 'bancansu', 'bgh', 'admin'] },
  { id: 'timetable', path: '/timetable', label: 'Thời khóa biểu', iconName: '🗓️', roles: ['gvcn', 'bancansu', 'bgh', 'student', 'parent', 'admin'] },
  { id: 'teaching-plan', path: '/teaching-plan', label: 'Lịch báo giảng', iconName: '📖', roles: ['gvcn', 'bgh', 'admin'] },
  { id: 'classroom-tools', path: '/classroom-tools', label: 'Vòng quay & Công cụ', iconName: '🎲', roles: ['gvcn', 'bancansu', 'admin'] },
  { id: 'reports', path: '/reports', label: 'Sổ theo dõi & Báo cáo', iconName: '📊', roles: ['gvcn', 'bgh', 'admin'] },
  { id: 'companion', path: '/companion', label: 'Trạm đồng hành', iconName: '🛡️', roles: ['gvcn'], badge: 'Bảo mật' },
  { id: 'parent-portal', path: '/parent-portal', label: 'Cổng Phụ huynh', iconName: '👨‍👩‍👦', roles: ['parent', 'gvcn', 'admin'] },
  { id: 'settings', path: '/settings', label: 'Cài đặt lớp', iconName: '⚙️', roles: ['gvcn', 'admin'] },
];
