import { describe, it, expect } from 'vitest';
import { reportVerificationService, VerificationPayload } from './reportVerificationService';

describe('reportVerificationService Unit Tests', () => {
  const samplePayload: VerificationPayload = {
    docId: 'DOC-2026-6A6-001',
    className: '6A6',
    schoolName: 'TRƯỜNG THCS TÂN HẢI',
    teacherName: 'Thầy Phan Văn Bộ',
    periodTitle: 'Báo cáo Tuần 24',
    totalStudents: 47,
    attendanceRate: 98.5,
    totalPoints: 120,
    signedAt: '2026-09-13T10:00:00.000Z',
  };

  it('sinh URL xác thực chính xác chứa các tham số truy vấn', () => {
    const url = reportVerificationService.generateVerificationUrl(samplePayload);
    expect(url).toContain('/verify-report?');
    expect(url).toContain('docId=DOC-2026-6A6-001');
    expect(url).toContain('cls=6A6');
    expect(url).toContain('tea=Th%E1%BA%A7y+Phan+V%C4%83n+B%E1%BB%99');
    expect(url).toContain('stu=47');
    expect(url).toContain('rate=98.5');
  });

  it('tạo thành công chuỗi Data URL hình ảnh mã QR Code', async () => {
    const testUrl = 'https://web-gvcn.vercel.app/verify-report?docId=TEST-123';
    const qrDataUrl = await reportVerificationService.generateQrCodeDataUrl(testUrl);
    expect(qrDataUrl).toBeDefined();
    expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('phân tích chính xác dữ liệu từ URLSearchParams hợp lệ', () => {
    const searchParams = new URLSearchParams({
      docId: 'DOC-999',
      cls: '6A6',
      tea: 'Thầy Phan Văn Bộ',
      sch: 'THCS Tân Hải',
      prd: 'Báo cáo Tuần 25',
      stu: '45',
      rate: '99',
      pts: '150',
      sig: '2026-09-13T12:00:00.000Z',
    });

    const parsed = reportVerificationService.parseVerificationParams(searchParams);
    expect(parsed).not.toBeNull();
    expect(parsed?.docId).toBe('DOC-999');
    expect(parsed?.className).toBe('6A6');
    expect(parsed?.teacherName).toBe('Thầy Phan Văn Bộ');
    expect(parsed?.schoolName).toBe('THCS Tân Hải');
    expect(parsed?.totalStudents).toBe(45);
    expect(parsed?.attendanceRate).toBe(99);
    expect(parsed?.totalPoints).toBe(150);
  });

  it('trả về null nếu thiếu các trường thông tin bắt buộc', () => {
    const searchParams = new URLSearchParams({
      cls: '6A6',
      // thiếu docId và tea
    });

    const parsed = reportVerificationService.parseVerificationParams(searchParams);
    expect(parsed).toBeNull();
  });
});
