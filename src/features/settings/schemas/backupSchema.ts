import { z } from 'zod';

export const backupMetaSchema = z.object({
  app: z.literal('Web-GVCN', {
    errorMap: () => ({ message: 'Tệp không phải là bản sao lưu của hệ thống Web-GVCN.' }),
  }),
  version: z.string().min(1, 'Thiếu thông tin phiên bản phần mềm trong tệp sao lưu.'),
  exportedAt: z.string(),
  classId: z.string().optional(),
  className: z.string().optional(),
  schoolName: z.string().optional(),
  totalStudents: z.number().optional(),
  totalGroups: z.number().optional(),
  totalAttendanceSessions: z.number().optional(),
  totalPointTransactions: z.number().optional(),
});

export const backupDataSchema = z.object({
  classConfig: z.record(z.unknown()).optional().default({}),
  students: z.array(z.record(z.unknown())).optional().default([]),
  groups: z.array(z.record(z.unknown())).optional().default([]),
  seating: z
    .object({
      layout: z.unknown().optional(),
      assignments: z.array(z.record(z.unknown())).optional().default([]),
      rotationConfig: z
        .object({
          rotationEnabled: z.boolean().optional(),
          schoolYearStartDate: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  attendance: z
    .object({
      sessions: z.array(z.record(z.unknown())).optional().default([]),
    })
    .optional(),
  points: z
    .object({
      categories: z.array(z.record(z.unknown())).optional().default([]),
      transactions: z.array(z.record(z.unknown())).optional().default([]),
    })
    .optional(),
});

export const classBackupSchema = z.object({
  meta: backupMetaSchema,
  data: backupDataSchema,
});

export type ClassBackupSchemaType = z.infer<typeof classBackupSchema>;
