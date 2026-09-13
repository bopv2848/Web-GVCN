import QRCode from 'qrcode';

export interface VerificationPayload {
  docId: string;
  className: string;
  schoolName: string;
  teacherName: string;
  periodTitle: string;
  totalStudents: number;
  attendanceRate: number;
  totalPoints: number;
  signedAt: string;
}

export const reportVerificationService = {
  /**
   * Tạo URL xác thực điện tử công khai cho văn bản báo cáo
   */
  generateVerificationUrl(payload: VerificationPayload): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://web-gvcn.vercel.app';
    const params = new URLSearchParams({
      docId: payload.docId,
      cls: payload.className,
      sch: payload.schoolName,
      tea: payload.teacherName,
      prd: payload.periodTitle,
      stu: String(payload.totalStudents),
      rate: String(payload.attendanceRate),
      pts: String(payload.totalPoints),
      sig: payload.signedAt,
    });

    return `${origin}/verify-report?${params.toString()}`;
  },

  /**
   * Tạo hình ảnh mã QR Code dạng Data URL (PNG) để nhúng vào văn bản A4
   */
  async generateQrCodeDataUrl(verificationUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(verificationUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
    } catch (err) {
      console.warn('Lỗi tạo mã QR xác thực:', err);
      return '';
    }
  },

  /**
   * Trích xuất và kiểm định dữ liệu xác thực từ URL Search Params
   */
  parseVerificationParams(searchParams: URLSearchParams): VerificationPayload | null {
    const docId = searchParams.get('docId');
    const className = searchParams.get('cls');
    const teacherName = searchParams.get('tea');

    if (!docId || !className || !teacherName) {
      return null;
    }

    return {
      docId,
      className,
      schoolName: searchParams.get('sch') || 'TRƯỜNG THCS TÂN HẢI',
      teacherName,
      periodTitle: searchParams.get('prd') || 'Báo cáo tổng kết',
      totalStudents: Number(searchParams.get('stu')) || 47,
      attendanceRate: Number(searchParams.get('rate')) || 100,
      totalPoints: Number(searchParams.get('pts')) || 0,
      signedAt: searchParams.get('sig') || new Date().toISOString(),
    };
  },
};
