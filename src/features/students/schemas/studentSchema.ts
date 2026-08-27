import { z } from 'zod';

export const studentSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ và tên học sinh phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự'),
  gender: z.enum(['Nam', 'Nữ'], {
    errorMap: () => ({ message: 'Vui lòng chọn giới tính Nam hoặc Nữ' }),
  }),
  birthDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Ngày sinh không đúng định dạng YYYY-MM-DD'
    ),
  groupId: z.string().uuid('Tổ thi đua không hợp lệ').optional().nullable(),
  classRole: z.string().optional().default('Thành viên'),
  boardingType: z.enum(['Bán trú', 'Ngoại trú', 'Nội trú']).optional().default('Bán trú'),
  goals: z.string().max(500, 'Mục tiêu không vượt quá 500 ký tự').optional().default(''),
  talents: z.string().max(500, 'Năng khiếu không vượt quá 500 ký tự').optional().default(''),
  avatarUrl: z.string().url('Đường dẫn ảnh không hợp lệ').optional().nullable(),
  code: z.string().optional().nullable(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
