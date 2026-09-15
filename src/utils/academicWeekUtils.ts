export interface AcademicWeekCustomConfig {
  startDate?: string; // e.g. "2026-09-07" (ngày Thứ Hai của tuần 1)
  weekOffset?: number; // Độ lệch tuần: +1, -1, 0 (bù / nghỉ lễ)
  semester1Weeks?: number; // Số tuần thực học HK1 (mặc định: 18)
}

export interface AcademicWeekInfo {
  weekNumber: number; // Tuần thứ mấy trong năm học (1, 2, ..., 35)
  semester: 'I' | 'II' | 'Hè' | 'Chuẩn bị'; // Học kỳ hiện tại
  semesterWeekNumber: number; // Tuần thứ mấy trong học kỳ hiện tại (HK1: 1-18, HK2: 1-17)
  weekLabel: string; // Chuỗi hiển thị chuẩn (ví dụ: "Tuần 2 - Học kỳ I")
  academicYear: string; // Niên khóa (ví dụ: "2026 - 2027")
  weekStartDate: string; // Ngày Thứ Hai của tuần (DD/MM/YYYY)
  weekEndDate: string; // Ngày Chủ Nhật của tuần (DD/MM/YYYY)
}

export const ACADEMIC_WEEK_STORAGE_KEY = 'gvcn_academic_week_config';

export function getStoredAcademicWeekConfig(): AcademicWeekCustomConfig {
  try {
    const raw = localStorage.getItem(ACADEMIC_WEEK_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Bỏ qua lỗi truy cập localStorage
  }
  return {};
}

export function saveStoredAcademicWeekConfig(config: AcademicWeekCustomConfig): void {
  try {
    localStorage.setItem(ACADEMIC_WEEK_STORAGE_KEY, JSON.stringify(config));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('academic-week-config-changed'));
    }
  } catch {
    // Bỏ qua lỗi ghi localStorage
  }
}

/**
 * Tính toán tuần học hiện tại và học kỳ theo quy chuẩn trường học THCS Việt Nam,
 * có hỗ trợ cấu hình tùy biến ngày bắt đầu và độ lệch tuần bù/nghỉ lễ.
 */
export function getAcademicWeekInfo(
  currentDate: Date = new Date(),
  customConfig?: AcademicWeekCustomConfig
): AcademicWeekInfo {
  const d = new Date(currentDate.getTime());
  const year = d.getFullYear();
  const month = d.getMonth(); // 0 - 11

  // Lấy cấu hình tùy biến nếu không truyền vào
  const config = customConfig || (typeof window !== 'undefined' ? getStoredAcademicWeekConfig() : {});

  // Quy ước năm học: Tháng 8 trở đi tính là năm học mới (year - year+1)
  const startYear = month >= 7 ? year : year - 1;
  const endYear = startYear + 1;
  const academicYear = `${startYear} - ${endYear}`;

  // Xác định ngày Thứ Hai của Tuần 1
  let startMonday: Date;
  if (config.startDate && /^\d{4}-\d{2}-\d{2}$/.test(config.startDate)) {
    const parts = config.startDate.split('-').map(Number);
    startMonday = new Date(parts[0], parts[1] - 1, parts[2]);
    startMonday.setHours(0, 0, 0, 0);
  } else {
    // Mặc định: Thứ Hai đầu tiên sau ngày khai giảng 05/09
    const sept5 = new Date(startYear, 8, 5);
    const daySept5 = sept5.getDay();
    const daysUntilMonday = daySept5 === 1 ? 0 : (8 - daySept5) % 7;
    startMonday = new Date(
      startYear,
      8,
      5 + (daysUntilMonday === 0 && daySept5 !== 1 ? 7 : daysUntilMonday)
    );
    startMonday.setHours(0, 0, 0, 0);
  }

  // Tìm ngày Thứ Hai của tuần hiện tại
  const currentMonday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const curDay = currentMonday.getDay();
  const diffToMonday = curDay === 0 ? -6 : 1 - curDay;
  currentMonday.setDate(currentMonday.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  // Ngày Chủ Nhật của tuần hiện tại
  const currentSunday = new Date(currentMonday);
  currentSunday.setDate(currentSunday.getDate() + 6);

  const formatSimpleDate = (dt: Date) => {
    const day = String(dt.getDate()).padStart(2, '0');
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return `${day}/${m}/${dt.getFullYear()}`;
  };

  const weekStartDate = formatSimpleDate(currentMonday);
  const weekEndDate = formatSimpleDate(currentSunday);

  // Tính số ngày và số tuần chênh lệch kèm độ lệch cấu hình (weekOffset)
  const diffMs = currentMonday.getTime() - startMonday.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const rawWeekNumber = Math.floor(diffDays / 7) + 1;
  const offset = Number(config.weekOffset) || 0;
  const weekNumber = rawWeekNumber + offset;

  const s1Weeks = Number(config.semester1Weeks) || 18;

  let semester: 'I' | 'II' | 'Hè' | 'Chuẩn bị' = 'I';
  let semesterWeekNumber = weekNumber;
  let weekLabel = '';

  if (weekNumber < 1) {
    semester = 'Chuẩn bị';
    semesterWeekNumber = 0;
    weekLabel = 'Chuẩn bị năm học mới';
  } else if (weekNumber <= s1Weeks) {
    semester = 'I';
    semesterWeekNumber = weekNumber;
    weekLabel = `Tuần ${weekNumber} - Học kỳ I`;
  } else if (weekNumber <= s1Weeks + 17) {
    semester = 'II';
    semesterWeekNumber = weekNumber - s1Weeks;
    weekLabel = `Tuần ${weekNumber} - Học kỳ II`;
  } else {
    semester = 'Hè';
    semesterWeekNumber = 0;
    weekLabel = 'Kỳ nghỉ hè';
  }

  return {
    weekNumber,
    semester,
    semesterWeekNumber,
    weekLabel,
    academicYear,
    weekStartDate,
    weekEndDate,
  };
}
