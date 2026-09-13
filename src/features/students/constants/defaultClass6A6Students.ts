import type { Student, Group } from '../../../types/student';

export const CLASS_6A6_ID = '66666666-6666-6666-6666-666666666666';

export const DEFAULT_GROUPS_6A6: Group[] = [
  {
    id: '6a600000-0000-0000-0001-000000000001',
    classId: CLASS_6A6_ID,
    name: 'Tổ 1',
    colorClass: 'text-red-500',
    orderIndex: 1,
  },
  {
    id: '6a600000-0000-0000-0001-000000000002',
    classId: CLASS_6A6_ID,
    name: 'Tổ 2',
    colorClass: 'text-green-500',
    orderIndex: 2,
  },
  {
    id: '6a600000-0000-0000-0001-000000000003',
    classId: CLASS_6A6_ID,
    name: 'Tổ 3',
    colorClass: 'text-yellow-500',
    orderIndex: 3,
  },
  {
    id: '6a600000-0000-0000-0001-000000000004',
    classId: CLASS_6A6_ID,
    name: 'Tổ 4',
    colorClass: 'text-blueAccent',
    orderIndex: 4,
  },
];

type RawStudentTuple = [number, string, string, 'Nam' | 'Nữ', string, number];

/**
 * Danh sách 47 học sinh chính thức lớp 6A6 - THCS Tân Hải (GVCN Thầy Phan Văn Bộ)
 * Trích xuất từ tệp danh-sach-hs-6a6.xlsx và cơ cấu ban cán sự BAN-CAN-SU-LOP-6A6.md
 * Định dạng: [STT, Họ và tên, Ngày sinh (YYYY-MM-DD), Giới tính, Chức vụ, Số thứ tự Tổ]
 */
const RAW_STUDENTS_6A6: RawStudentTuple[] = [
  [1, 'Đỗ Bảo An', '2015-07-15', 'Nam', 'Thành viên', 1],
  [2, 'Hà Minh Thảo An', '2015-08-02', 'Nữ', 'Thành viên', 1],
  [3, 'Lạc Cao Quế Anh', '2015-12-02', 'Nữ', 'Tổ trưởng', 2],
  [4, 'Lê Ngọc Anh', '2015-08-03', 'Nữ', 'Lớp trưởng', 1],
  [5, 'Cao Minh Ân', '2015-02-15', 'Nam', 'Tổ phó', 4],
  [6, 'Nguyễn Lê Đăng', '2015-05-29', 'Nam', 'Thành viên', 1],
  [7, 'Phạm Sỹ Đô', '2015-10-10', 'Nam', 'Thành viên', 1],
  [8, 'Nguyễn Trần Ngọc Đức', '2015-01-29', 'Nam', 'Thành viên', 1],
  [9, 'Trương Thị Kim Hằng', '2015-04-03', 'Nữ', 'Tổ phó', 1],
  [10, 'Trương Khả Hân', '2015-09-02', 'Nữ', 'Tổ trưởng', 4],
  [11, 'Dương Thế Hoàng', '2015-02-20', 'Nam', 'Thành viên', 1],
  [12, 'Nguyễn Thái Huy', '2015-08-14', 'Nam', 'Tổ phó', 3],
  [13, 'Nguyễn Vũ Huy', '2015-10-09', 'Nam', 'Thành viên', 1],
  [14, 'Lâm Hoàng Khang', '2015-11-20', 'Nam', 'Thành viên', 2],
  [15, 'Phan Trọng Khang', '2015-05-21', 'Nam', 'Thành viên', 2],
  [16, 'Nguyễn Hoàng Anh Khoa', '2015-03-28', 'Nam', 'Thành viên', 2],
  [17, 'Trần Nguyễn Minh Khoa', '2015-08-07', 'Nam', 'Thành viên', 2],
  [18, 'Huỳnh Vũ Quỳnh Liên', '2015-04-08', 'Nữ', 'Lớp phó lao động', 4],
  [19, 'Thạch Minh Luân', '2015-04-14', 'Nam', 'Thành viên', 2],
  [20, 'Nguyễn Ngọc Duy Mạnh', '2015-10-07', 'Nam', 'Thành viên', 2],
  [21, 'Phan Hiểu My', '2015-05-10', 'Nữ', 'Tổ trưởng', 3],
  [22, 'Nguyễn Thị Thanh Mỹ', '2015-07-02', 'Nữ', 'Thành viên', 1],
  [23, 'Huỳnh Na', '2015-02-16', 'Nữ', 'Tổ phó', 2],
  [24, 'Lê Hoàng Nghĩa', '2015-09-24', 'Nam', 'Thành viên', 2],
  [25, 'Trần Thị Mỹ Ngọc', '2015-04-03', 'Nữ', 'Thành viên', 1],
  [26, 'Nguyễn Phúc Nguyên', '2015-05-26', 'Nam', 'Thành viên', 3],
  [27, 'Hồ Hoàng Thảo Nhi', '2015-09-10', 'Nữ', 'Thành viên', 2],
  [28, 'Nguyễn Thị Yến Nhi', '2015-12-09', 'Nữ', 'Thành viên', 2],
  [29, 'Huỳnh Huyền Nhiên', '2015-10-12', 'Nữ', 'Tổ trưởng', 1],
  [30, 'Vũ Minh Phát', '2015-04-26', 'Nam', 'Thành viên', 3],
  [31, 'Lê Văn Phước', '2014-09-06', 'Nam', 'Thành viên', 3],
  [32, 'Nguyễn Duy Phước', '2014-12-12', 'Nam', 'Thành viên', 3],
  [33, 'Nguyễn Phúc An Phương', '2015-08-22', 'Nữ', 'Thành viên', 2],
  [34, 'Lê Bảo Quang', '2015-11-08', 'Nam', 'Thành viên', 3],
  [35, 'Huỳnh Võ Minh Sang', '2013-11-26', 'Nam', 'Thành viên', 3],
  [36, 'Lê Thanh Thảo', '2015-12-09', 'Nữ', 'Thành viên', 3],
  [37, 'Trần Thị Bích Thắm', '2015-05-22', 'Nữ', 'Thành viên', 3],
  [38, 'Phan Hoàng Thiện', '2015-10-19', 'Nam', 'Thành viên', 4],
  [39, 'Nguyễn Đức Thịnh', '2015-02-28', 'Nam', 'Thành viên', 4],
  [40, 'Nguyễn Ngọc Anh Thơ', '2015-06-06', 'Nữ', 'Thành viên', 3],
  [41, 'Trần Thanh Tiến', '2015-12-17', 'Nam', 'Thành viên', 4],
  [42, 'Nguyễn Thanh Toàn', '2015-05-30', 'Nam', 'Thành viên', 4],
  [43, 'Nguyễn Thị Bích Trâm', '2015-07-14', 'Nữ', 'Thành viên', 4],
  [44, 'Phan Ngọc Trinh', '2015-05-13', 'Nữ', 'Thành viên', 4],
  [45, 'Nguyễn Ngọc Ánh Tuyết', '2015-09-27', 'Nữ', 'Lớp phó học tập', 3],
  [46, 'Nguyễn Thị Thu Vân', '2014-06-26', 'Nữ', 'Thành viên', 4],
  [47, 'Châu Minh Thiện', '2015-09-28', 'Nam', 'Thành viên', 4],
];

const GROUP_COLORS: Record<number, string> = {
  1: 'text-red-500',
  2: 'text-green-500',
  3: 'text-yellow-500',
  4: 'text-blueAccent',
};

export const DEFAULT_CLASS_6A6_STUDENTS: Student[] = RAW_STUDENTS_6A6.map(
  ([stt, fullName, birthDate, gender, classRole, groupNum]) => {
    const sttHex = stt.toString(16).padStart(4, '0');
    return {
      id: `6a600000-0000-0000-0002-00000000${sttHex}`,
      classId: CLASS_6A6_ID,
      groupId: `6a600000-0000-0000-0001-00000000000${groupNum}`,
      fullName,
      gender,
      birthDate,
      classRole,
      boardingType: 'Bán trú',
      code: `6A6${String(stt).padStart(2, '0')}`,
      points: 15 + (stt % 7) * 2,
      stars: 10 + (stt % 5) * 2,
      groupName: `Tổ ${groupNum}`,
      groupColorClass: GROUP_COLORS[groupNum] || 'text-blue-500',
      guardianToken: `token_6a6_${sttHex}_${stt}`,
      guardianStatus: stt % 2 === 0 ? 'active' : 'pending',
      createdAt: '2026-09-01T00:00:00.000Z',
    };
  }
);
