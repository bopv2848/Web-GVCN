import { useState, useEffect, useCallback, useMemo } from 'react';
import { attendanceService } from '../services/attendanceService';
import type { MonthlyAttendanceReport } from '../../../types/attendance';

export const useMonthlyAttendance = (
  classId: string,
  initialYear: number,
  initialMonth: number
) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyAttendanceReport | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState<boolean>(false);
  const [searchQueryMonthly, setSearchQueryMonthly] = useState<string>('');
  const [selectedGroupMonthly, setSelectedGroupMonthly] = useState<string>('all');

  const loadMonthlyReport = useCallback(async () => {
    setIsLoadingMonthly(true);
    try {
      const rep = await attendanceService.getMonthlyAttendanceReport(
        classId,
        selectedYear,
        selectedMonth
      );
      setMonthlyReport(rep);
    } catch (err) {
      console.error('Lỗi tải báo cáo chuyên cần tháng:', err);
    } finally {
      setIsLoadingMonthly(false);
    }
  }, [classId, selectedYear, selectedMonth]);

  useEffect(() => {
    loadMonthlyReport();
  }, [loadMonthlyReport]);

  const filteredStudentsMonthly = useMemo(() => {
    if (!monthlyReport) return [];
    return monthlyReport.studentSummaries.filter((s) => {
      const matchSearch = s.fullName.toLowerCase().includes(searchQueryMonthly.toLowerCase().trim());
      const matchGroup = selectedGroupMonthly === 'all' || s.groupName === selectedGroupMonthly;
      return matchSearch && matchGroup;
    });
  }, [monthlyReport, searchQueryMonthly, selectedGroupMonthly]);

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    monthlyReport,
    isLoadingMonthly,
    searchQueryMonthly,
    setSearchQueryMonthly,
    selectedGroupMonthly,
    setSelectedGroupMonthly,
    filteredStudentsMonthly,
    reloadMonthlyReport: loadMonthlyReport,
  };
};
