import { z } from 'zod';

export const classConfigSchema = z.object({
  name: z.string().min(2, 'Tên lớp phải có ít nhất 2 ký tự').max(50),
  schoolName: z.string().min(2, 'Tên trường phải có ít nhất 2 ký tự').max(100),
  academicYear: z.string().min(4, 'Niên khóa không hợp lệ').max(30),
  gradeLevel: z.number().int().min(1).max(12),
  themeMonth: z.string().min(2, 'Chủ điểm tháng không được để trống').max(100),
  themeTitle: z.string().min(2, 'Khẩu hiệu/Chủ đề lớp không được để trống').max(100),
  bannerColorClass: z.string().default('from-[#1e1b4b] to-[#312e81]'),
  bannerUrl: z.string().url('Đường dẫn banner không hợp lệ').optional().nullable(),
  logoUrl: z.string().url('Đường dẫn logo không hợp lệ').optional().nullable(),
});

export type ClassConfigFormData = z.infer<typeof classConfigSchema>;
