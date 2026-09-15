import type { Group } from '../../../types/student';
import type { PointCategory } from '../../../types/points';

export const SANDBOX_CLASS_ID = '66666666-6666-6666-6666-666666666666';

export const MOCK_GROUPS: Group[] = [
  {
    id: 'group-sandbox-1',
    classId: SANDBOX_CLASS_ID,
    name: 'Tổ 1',
    colorClass: 'text-red-500',
    orderIndex: 1,
  },
  {
    id: 'group-sandbox-2',
    classId: SANDBOX_CLASS_ID,
    name: 'Tổ 2',
    colorClass: 'text-green-500',
    orderIndex: 2,
  },
  {
    id: 'group-sandbox-3',
    classId: SANDBOX_CLASS_ID,
    name: 'Tổ 3',
    colorClass: 'text-yellow-500',
    orderIndex: 3,
  },
  {
    id: 'group-sandbox-4',
    classId: SANDBOX_CLASS_ID,
    name: 'Tổ 4',
    colorClass: 'text-blue-500',
    orderIndex: 4,
  },
];

export const MOCK_POINT_CATEGORIES: PointCategory[] = [
  { id: 'cat-1', type: 'add', categoryGroup: 'Học tập', title: 'Đạt điểm 10 kiểm tra', defaultPoints: 10, defaultStars: 2 },
  { id: 'cat-2', type: 'add', categoryGroup: 'Học tập', title: 'Hăng hái phát biểu xây dựng bài', defaultPoints: 2, defaultStars: 1 },
  { id: 'cat-3', type: 'add', categoryGroup: 'Học tập', title: 'Vở sạch chữ đẹp, làm bài tập đầy đủ', defaultPoints: 5, defaultStars: 1 },
  { id: 'cat-4', type: 'subtract', categoryGroup: 'Học tập', title: 'Không thuộc bài cũ', defaultPoints: 5, defaultStars: 0 },
  { id: 'cat-5', type: 'subtract', categoryGroup: 'Học tập', title: 'Không làm bài tập về nhà', defaultPoints: 5, defaultStars: 0 },

  { id: 'cat-6', type: 'add', categoryGroup: 'Nề nếp', title: 'Trực nhật lớp sạch sẽ, nghiêm túc', defaultPoints: 5, defaultStars: 1 },
  { id: 'cat-7', type: 'add', categoryGroup: 'Nề nếp', title: 'Đúng giờ, trang phục chuẩn mực', defaultPoints: 2, defaultStars: 0 },
  { id: 'cat-8', type: 'subtract', categoryGroup: 'Nề nếp', title: 'Đi học trễ', defaultPoints: 5, defaultStars: 0 },
  { id: 'cat-9', type: 'subtract', categoryGroup: 'Nề nếp', title: 'Mất trật tự trong giờ học', defaultPoints: 3, defaultStars: 0 },
  { id: 'cat-10', type: 'subtract', categoryGroup: 'Nề nếp', title: 'Không đeo khăn quàng / thiếu phù hiệu', defaultPoints: 2, defaultStars: 0 },

  { id: 'cat-11', type: 'add', categoryGroup: 'Phong trào', title: 'Tham gia văn nghệ / Hội thao', defaultPoints: 10, defaultStars: 3 },
  { id: 'cat-12', type: 'add', categoryGroup: 'Phong trào', title: 'Đóng góp phong trào Kế hoạch nhỏ xuất sắc', defaultPoints: 5, defaultStars: 2 },

  { id: 'cat-13', type: 'add', categoryGroup: 'Đột xuất', title: 'Nhặt được của rơi trả người đánh mất', defaultPoints: 15, defaultStars: 5 },
  { id: 'cat-14', type: 'add', categoryGroup: 'Đột xuất', title: 'Giúp đỡ bạn học tiến bộ vượt khó', defaultPoints: 10, defaultStars: 3 },
];

interface RawMockStudent {
  id: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string;
  classRole: string;
  groupId: string;
  groupName: string;
  goals: string;
  talents: string;
}

export const MOCK_STUDENTS_BASE: RawMockStudent[] = [
  // TỔ 1 (10 học sinh)
  { id: 'stu-mock-01', fullName: 'Lê Ngọc Anh', gender: 'Nữ', birthDate: '2015-08-03', classRole: 'Lớp trưởng', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Học sinh Giỏi toàn diện', talents: 'Thuyết trình, Quản lý' },
  { id: 'stu-mock-02', fullName: 'Đỗ Bảo An', gender: 'Nam', birthDate: '2015-07-15', classRole: 'Tổ trưởng', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Tiến bộ môn Toán', talents: 'Cờ vua' },
  { id: 'stu-mock-03', fullName: 'Hà Minh Thảo An', gender: 'Nữ', birthDate: '2015-08-02', classRole: 'Tổ phó', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Chăm ngoan, giữ vở sạch', talents: 'Vẽ tranh' },
  { id: 'stu-mock-04', fullName: 'Nguyễn Lê Đăng', gender: 'Nam', birthDate: '2015-05-29', classRole: 'Thành viên', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Tập trung chú ý nghe giảng', talents: 'Bóng đá' },
  { id: 'stu-mock-05', fullName: 'Phạm Sỹ Đô', gender: 'Nam', birthDate: '2015-10-10', classRole: 'Thành viên', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Đạt điểm cao môn Lịch sử', talents: 'Đọc sách' },
  { id: 'stu-mock-06', fullName: 'Nguyễn Trần Ngọc Đức', gender: 'Nam', birthDate: '2015-01-29', classRole: 'Thành viên', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Rèn luyện chữ đẹp', talents: 'Bơi lội' },
  { id: 'stu-mock-07', fullName: 'Trương Thị Kim Hằng', gender: 'Nữ', birthDate: '2015-04-03', classRole: 'Thủ quỹ', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Tính toán cẩn thận, chi tiêu rõ ràng', talents: 'Múa dân gian' },
  { id: 'stu-mock-08', fullName: 'Dương Thế Hoàng', gender: 'Nam', birthDate: '2015-02-20', classRole: 'Thành viên', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Khắc phục việc đi học trễ', talents: 'Cầu lông' },
  { id: 'stu-mock-09', fullName: 'Nguyễn Vũ Huy', gender: 'Nam', birthDate: '2015-10-09', classRole: 'Thành viên', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Học tốt môn Tin học', talents: 'Lập trình Scratch' },
  { id: 'stu-mock-10', fullName: 'Võ Thị Mỹ Duyên', gender: 'Nữ', birthDate: '2015-06-18', classRole: 'Thành viên', groupId: 'group-sandbox-1', groupName: 'Tổ 1', goals: 'Tự tin phát biểu trước lớp', talents: 'Hát đơn ca' },

  // TỔ 2 (10 học sinh)
  { id: 'stu-mock-11', fullName: 'Lạc Cao Quế Anh', gender: 'Nữ', birthDate: '2015-12-02', classRole: 'Lớp phó học tập', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Đạt giải học sinh giỏi Ngữ Văn', talents: 'Viết văn, Kể chuyện' },
  { id: 'stu-mock-12', fullName: 'Lâm Hoàng Khang', gender: 'Nam', birthDate: '2015-11-20', classRole: 'Tổ trưởng', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Dẫn dắt Tổ 2 đứng đầu thi đua', talents: 'Bóng rổ' },
  { id: 'stu-mock-13', fullName: 'Phan Trọng Khang', gender: 'Nam', birthDate: '2015-05-21', classRole: 'Tổ phó', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Học tốt môn Tiếng Anh', talents: 'Guitar' },
  { id: 'stu-mock-14', fullName: 'Nguyễn Hoàng Anh Khoa', gender: 'Nam', birthDate: '2015-03-28', classRole: 'Thành viên', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Cải thiện điểm môn Toán', talents: 'Robotics' },
  { id: 'stu-mock-15', fullName: 'Trần Nguyễn Minh Khoa', gender: 'Nam', birthDate: '2015-08-07', classRole: 'Thành viên', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Làm bài tập đầy đủ đúng hạn', talents: 'Hội họa' },
  { id: 'stu-mock-16', fullName: 'Bùi Thị Tuyết Mai', gender: 'Nữ', birthDate: '2015-09-14', classRole: 'Thành viên', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Rèn tính cẩn thận, chỉn chu', talents: 'Thêu thùa' },
  { id: 'stu-mock-17', fullName: 'Hoàng Quốc Nam', gender: 'Nam', birthDate: '2015-04-12', classRole: 'Thành viên', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Trực nhật đúng giờ', talents: 'Chạy điền kinh' },
  { id: 'stu-mock-18', fullName: 'Nguyễn Thị Bích Ngọc', gender: 'Nữ', birthDate: '2015-01-19', classRole: 'Sao đỏ', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Theo dõi nề nếp công tâm', talents: 'Diễn kịch' },
  { id: 'stu-mock-19', fullName: 'Trần Đăng Quang', gender: 'Nam', birthDate: '2015-11-05', classRole: 'Thành viên', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Nâng cao khả năng giao tiếp', talents: 'Đàn Piano' },
  { id: 'stu-mock-20', fullName: 'Đặng Thảo Vy', gender: 'Nữ', birthDate: '2015-07-23', classRole: 'Thành viên', groupId: 'group-sandbox-2', groupName: 'Tổ 2', goals: 'Điểm tổng kết trên 8.5', talents: 'Aerobic' },

  // TỔ 3 (10 học sinh)
  { id: 'stu-mock-21', fullName: 'Nguyễn Thái Huy', gender: 'Nam', birthDate: '2015-08-14', classRole: 'Lớp phó kỷ luật', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Giữ vững nề nếp lớp', talents: 'Võ Taekwondo' },
  { id: 'stu-mock-22', fullName: 'Đoàn Gia Hân', gender: 'Nữ', birthDate: '2015-03-30', classRole: 'Tổ trưởng', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Hỗ trợ bạn yếu trong tổ', talents: 'Nấu ăn' },
  { id: 'stu-mock-23', fullName: 'Vũ Đức Minh', gender: 'Nam', birthDate: '2015-10-17', classRole: 'Tổ phó', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Chăm chỉ học thuộc bài', talents: 'Bóng bàn' },
  { id: 'stu-mock-24', fullName: 'Lý Kim Ngân', gender: 'Nữ', birthDate: '2015-05-11', classRole: 'Thành viên', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Phát biểu nhiều hơn', talents: 'Cắm hoa' },
  { id: 'stu-mock-25', fullName: 'Phạm Minh Quân', gender: 'Nam', birthDate: '2015-09-08', classRole: 'Thành viên', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Hoàn thành bài tập nâng cao', talents: 'Toán tư duy' },
  { id: 'stu-mock-26', fullName: 'Tô Hồng Sơn', gender: 'Nam', birthDate: '2015-02-14', classRole: 'Thành viên', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Không nói chuyện trong lớp', talents: 'Lắp ráp Lego' },
  { id: 'stu-mock-27', fullName: 'Dương Yến Nhi', gender: 'Nữ', birthDate: '2015-12-25', classRole: 'Thành viên', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Đạt danh hiệu Vở sạch chữ đẹp', talents: 'Viết thư pháp' },
  { id: 'stu-mock-28', fullName: 'Huỳnh Gia Bảo', gender: 'Nam', birthDate: '2015-06-03', classRole: 'Thành viên', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Học tốt các môn Khoa học tự nhiên', talents: 'Khoa học vui' },
  { id: 'stu-mock-29', fullName: 'Lê Mai Trâm', gender: 'Nữ', birthDate: '2015-04-29', classRole: 'Thành viên', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Rèn luyện tính kiên nhẫn', talents: 'Thủ công mỹ nghệ' },
  { id: 'stu-mock-30', fullName: 'Nguyễn Tấn Đạt', gender: 'Nam', birthDate: '2015-07-09', classRole: 'Thành viên', groupId: 'group-sandbox-3', groupName: 'Tổ 3', goals: 'Nghiêm túc khi chào cờ', talents: 'Bóng đá' },

  // TỔ 4 (10 học sinh)
  { id: 'stu-mock-31', fullName: 'Trương Khả Hân', gender: 'Nữ', birthDate: '2015-09-02', classRole: 'Lớp phó văn thể', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Phát triển phong trào văn nghệ lớp', talents: 'Múa, Dẫn chương trình' },
  { id: 'stu-mock-32', fullName: 'Cao Minh Ân', gender: 'Nam', birthDate: '2015-02-15', classRole: 'Tổ trưởng', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Xây dựng tinh thần đoàn kết', talents: 'Chạy tiếp sức' },
  { id: 'stu-mock-33', fullName: 'Mai Thanh Trúc', gender: 'Nữ', birthDate: '2015-08-16', classRole: 'Tổ phó', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Học đều tất cả các môn', talents: 'Chơi đàn organ' },
  { id: 'stu-mock-34', fullName: 'Hoàng Gia Huy', gender: 'Nam', birthDate: '2015-01-05', classRole: 'Thành viên', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Khắc phục việc quên sách vở', talents: 'Đá cầu' },
  { id: 'stu-mock-35', fullName: 'Đinh Phương Linh', gender: 'Nữ', birthDate: '2015-10-22', classRole: 'Thành viên', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Đạt điểm 10 môn Tiếng Anh', talents: 'Giao tiếp tiếng Anh' },
  { id: 'stu-mock-36', fullName: 'Vũ Hải Đăng', gender: 'Nam', birthDate: '2015-03-18', classRole: 'Thành viên', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Tập trung trong giờ tự học', talents: 'Thiết kế đồ họa' },
  { id: 'stu-mock-37', fullName: 'Bùi Kim Oanh', gender: 'Nữ', birthDate: '2015-11-12', classRole: 'Thành viên', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Tích cực tham gia vệ sinh lớp', talents: 'Vẽ phong cảnh' },
  { id: 'stu-mock-38', fullName: 'Trịnh Quốc Bảo', gender: 'Nam', birthDate: '2015-05-04', classRole: 'Thành viên', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Rèn luyện tác phong nhanh nhẹn', talents: 'Bơi ngửa' },
  { id: 'stu-mock-39', fullName: 'Lê Thị Thu Cúc', gender: 'Nữ', birthDate: '2015-06-27', classRole: 'Thành viên', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Đọc nhiều sách hay', talents: 'Viết tản văn' },
  { id: 'stu-mock-40', fullName: 'Nguyễn Trường Giang', gender: 'Nam', birthDate: '2015-12-19', classRole: 'Thành viên', groupId: 'group-sandbox-4', groupName: 'Tổ 4', goals: 'Giúp tổ giành hạng Nhất tuần', talents: 'Hùng biện' },
];
