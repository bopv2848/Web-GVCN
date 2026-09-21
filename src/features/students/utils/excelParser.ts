import type { BatchImportStudentItem } from '../services/studentService';
import type { Student } from '../../../types/student';

export interface ParsedExcelResult {
  validRows: BatchImportStudentItem[];
  invalidRows: Array<{ row: number; data: Record<string, unknown>; error: string }>;
  headers: string[];
}

/**
 * Chuẩn hóa linh hoạt ngày sinh của học sinh về định dạng chuẩn ISO YYYY-MM-DD
 * Hỗ trợ mọi kiểu gõ ngày sinh phổ biến của giáo viên Việt Nam:
 * - Dạng số serial Excel: 42184 -> 2015-06-29
 * - Dạng ngày tháng năm: 15/07/2015, 15-07-2015, 15.07.2015, 5/7/2015, 05-07-2015
 * - Dạng chỉ có năm sinh: 2015, '2015' -> 2015-01-01
 * - Dạng tháng và năm: 07/2015, 7-2015 -> 2015-07-01
 * - Dạng chuẩn ISO sẵn: 2015-07-15
 * - Khoảng trắng thừa: " 15 / 07 / 2015 "
 */
export function normalizeBirthDate(
  raw: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xlsxSSF?: { parse_date_code: (val: number) => { y: number; m: number; d: number } }
): string {
  if (raw === null || raw === undefined || raw === '') return '';

  // 1. Trường hợp là JS Date object
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return '';
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, '0');
    const d = String(raw.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. Trường hợp là số number (Excel serial date hoặc Năm sinh)
  if (typeof raw === 'number') {
    // Nếu là năm sinh 4 chữ số (VD: 2010, 2014, 2015...)
    if (raw >= 1990 && raw <= 2030) {
      return `${raw}-01-01`;
    }
    // Nếu là số serial của Excel (thường từ 20000 đến 70000)
    if (xlsxSSF && raw > 20000 && raw < 70000) {
      try {
        const dateObj = xlsxSSF.parse_date_code(raw);
        if (dateObj && dateObj.y && dateObj.m && dateObj.d) {
          const y = dateObj.y;
          const m = String(dateObj.m).padStart(2, '0');
          const d = String(dateObj.d).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      } catch {
        // Bỏ qua nếu parse lỗi
      }
    }
  }

  // 3. Chuỗi ký tự (String)
  let str = String(raw).trim();
  if (!str) return '';

  // Xóa khoảng trắng thừa quanh các dấu phân cách (VD: " 15 / 07 / 2015 " -> "15/07/2015")
  str = str.replace(/\s*([/\-.,])\s*/g, '$1');

  // Trường hợp 3.1: Chỉ có 4 chữ số năm sinh (VD: "2015", "'2015")
  if (/^\d{4}$/.test(str)) {
    return `${str}-01-01`;
  }

  // Trường hợp 3.2: Đã chuẩn ISO YYYY-MM-DD hoặc YYYY/MM/DD (VD: "2015-07-15", "2015/07/15")
  const isoMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Trường hợp 3.3: Định dạng Việt Nam DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (VD: "15/07/2015", "5-7-2015", "15.7.2015")
  const vnMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (vnMatch) {
    const d = vnMatch[1].padStart(2, '0');
    const m = vnMatch[2].padStart(2, '0');
    const y = vnMatch[3];
    return `${y}-${m}-${d}`;
  }

  // Trường hợp 3.4: Định dạng Tháng/Năm MM/YYYY, MM-YYYY (VD: "07/2015", "7-2015")
  const myMatch = str.match(/^(\d{1,2})[/\-.](\d{4})$/);
  if (myMatch) {
    const m = myMatch[1].padStart(2, '0');
    const y = myMatch[2];
    return `${y}-${m}-01`;
  }

  // Trường hợp 3.5: Cố gắng parse qua Date chuẩn nếu hợp lệ
  const timestamp = Date.parse(str);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (y >= 1990 && y <= 2030) {
      return `${y}-${m}-${day}`;
    }
  }

  return str;
}

export const excelParser = {
  /**
   * Đọc tệp Excel hoặc CSV và tự động ánh xạ cột tiếng Việt
   * Tối ưu: Chỉ tải động thư viện xlsx khi người dùng chọn tải tệp lên (Code-Splitting)
   */
  async parseFile(file: File): Promise<ParsedExcelResult> {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (rawData.length === 0) {
      throw new Error('Tệp Excel trống hoặc không có dòng dữ liệu nào.');
    }

    const headers = Object.keys(rawData[0]);
    const validRows: BatchImportStudentItem[] = [];
    const invalidRows: Array<{ row: number; data: Record<string, unknown>; error: string }> = [];

    // Ánh xạ linh hoạt các tiêu đề cột tiếng Việt
    rawData.forEach((row, index) => {
      const rowNum = index + 2; // Dòng 1 là tiêu đề

      // Tìm trường Họ và tên
      const fullName =
        row['Họ và tên'] ||
        row['Họ tên'] ||
        row['Tên'] ||
        row['Ho va ten'] ||
        row['Họ và Tên'] ||
        row['Full Name'];

      // Tìm trường Giới tính
      const rawGender =
        row['Giới tính'] || row['Gioi tinh'] || row['Phái'] || row['Gender'] || 'Nam';
      const gender: 'Nam' | 'Nữ' =
        String(rawGender).toLowerCase().includes('nữ') || String(rawGender).toLowerCase().includes('female')
          ? 'Nữ'
          : 'Nam';

      // Tìm trường Ngày sinh linh hoạt với nhiều tiêu đề
      const rawBirthDate =
        row['Ngày sinh'] ??
        row['Ngay sinh'] ??
        row['Ngày Sinh'] ??
        row['NGÀY SINH'] ??
        row['DOB'] ??
        row['Date of Birth'] ??
        row['BirthDate'] ??
        row['Năm sinh'] ??
        row['Nam sinh'] ??
        '';

      const birthDate = normalizeBirthDate(rawBirthDate, XLSX.SSF);

      // Tổ
      const groupName = row['Tổ'] || row['To'] || row['Group'] || '';
      // Chức vụ
      const classRole = row['Chức vụ'] || row['Vai trò'] || row['Chuc vu'] || 'Thành viên';
      // Bán trú
      const boardingType = row['Bán trú'] || row['Lưu trú'] || row['Ban tru'] || 'Bán trú';
      // Mục tiêu & Năng khiếu
      const goals = row['Mục tiêu'] || row['Muc tieu'] || '';
      const talents = row['Năng khiếu'] || row['Nang khieu'] || '';

      if (!fullName || String(fullName).trim().length < 2) {
        invalidRows.push({
          row: rowNum,
          data: row,
          error: 'Thiếu hoặc tên học sinh quá ngắn (tối thiểu 2 ký tự)',
        });
      } else {
        validRows.push({
          fullName: String(fullName).trim(),
          gender,
          birthDate: String(birthDate).trim() || undefined,
          groupName: String(groupName).trim() || undefined,
          classRole: String(classRole).trim(),
          boardingType: String(boardingType).trim(),
          goals: String(goals).trim() || undefined,
          talents: String(talents).trim() || undefined,
        });
      }
    });

    return { validRows, invalidRows, headers };
  },

  /**
   * Xuất danh sách học sinh ra file Excel .xlsx chuẩn
   * Theo yêu cầu nghiệp vụ: Chỉ xuất 4 trường thông tin cơ bản: STT, Họ và tên, Giới tính, Ngày sinh.
   * Các thông tin Tổ, Chức vụ, Điểm... giáo viên chủ nhiệm sẽ bổ sung trực tiếp trên ứng dụng.
   */
  async exportToExcel(students: Student[], className = '6A6'): Promise<void> {
    const XLSX = await import('xlsx');
    const exportData = students.map((s, index) => ({
      STT: index + 1,
      'Họ và tên': s.fullName,
      'Giới tính': s.gender,
      'Ngày sinh': s.birthDate || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Danh sách ${className}`);

    // Tải tệp về máy tính
    const fileName = `Danh_Sach_Hoc_Sinh_${className}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },

  /**
   * Tải tệp mẫu Excel chuẩn 4 cột (STT, Họ và tên, Giới tính, Ngày sinh) để giáo viên nhập liệu
   */
  async downloadTemplate(className = 'Mẫu'): Promise<void> {
    const XLSX = await import('xlsx');
    const sampleData = [
      {
        STT: 1,
        'Họ và tên': 'Nguyễn Văn An',
        'Giới tính': 'Nam',
        'Ngày sinh': '2015-05-15',
      },
      {
        STT: 2,
        'Họ và tên': 'Trần Thị Bình',
        'Giới tính': 'Nữ',
        'Ngày sinh': '2015-08-20',
      },
      {
        STT: 3,
        'Họ và tên': 'Lê Hoàng Cường',
        'Giới tính': 'Nam',
        'Ngày sinh': '2015-11-02',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Mau_Hoc_Sinh`);

    const fileName = `Mau_Nhap_Hoc_Sinh_${className}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },
};
