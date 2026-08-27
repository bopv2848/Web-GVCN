import * as XLSX from 'xlsx';
import type { BatchImportStudentItem } from '../services/studentService';
import type { Student } from '../../../types/student';

export interface ParsedExcelResult {
  validRows: BatchImportStudentItem[];
  invalidRows: Array<{ row: number; data: Record<string, unknown>; error: string }>;
  headers: string[];
}

export const excelParser = {
  /**
   * Đọc tệp Excel hoặc CSV và tự động ánh xạ cột tiếng Việt
   */
  async parseFile(file: File): Promise<ParsedExcelResult> {
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

      // Tìm trường Ngày sinh
      let birthDate = row['Ngày sinh'] || row['Ngay sinh'] || row['DOB'] || '';
      if (typeof birthDate === 'number') {
        // Excel serial date number
        const dateObj = XLSX.SSF.parse_date_code(birthDate);
        birthDate = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`;
      } else if (typeof birthDate === 'string' && birthDate.includes('/')) {
        const parts = birthDate.split('/');
        if (parts.length === 3) {
          // DD/MM/YYYY
          birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

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
   */
  exportToExcel(students: Student[], className = '12A1') {
    const exportData = students.map((s, index) => ({
      STT: index + 1,
      'Họ và tên': s.fullName,
      'Giới tính': s.gender,
      'Ngày sinh': s.birthDate || '',
      'Tổ thi đua': s.groupName,
      'Chức vụ': s.classRole,
      'Hình thức': s.boardingType || 'Bán trú',
      'Điểm thi đua': s.points,
      'Sao tích lũy': s.stars,
      'Mục tiêu': s.goals || '',
      'Năng khiếu': s.talents || '',
      'Trạng thái Phụ huynh': s.guardianStatus === 'active' ? 'Đã liên kết' : 'Chưa liên kết',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Danh sách ${className}`);

    // Tải tệp về máy tính
    const fileName = `Danh_Sach_Hoc_Sinh_${className}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },
};
