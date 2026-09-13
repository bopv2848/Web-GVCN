import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { reportsService } from '../services/reportsService';
import type { ReportFilterState, ComprehensiveClassReport, PeriodFilterType } from '../types';
import { ReportKpiCards } from '../components/ReportKpiCards';
import { GroupRankReportTable } from '../components/GroupRankReportTable';
import { HonoredAndNeedsCareStudents } from '../components/HonoredAndNeedsCareStudents';
import { StudentLedgerReportTable } from '../components/StudentLedgerReportTable';
import { ReportPrintA4View } from '../components/ReportPrintA4View';
import { pdfExportService } from '../services/pdfExportService';
import { Button } from '../../../components/common/Button';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';

export const ReportsPage: React.FC = () => {
  const { currentClass } = useAuth();
  const classId = currentClass?.id || '66666666-6666-6666-6666-666666666666';

  const today = new Date();
  const [filter, setFilter] = useState<ReportFilterState>({
    periodType: 'month',
    weekNumber: 1,
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    semester: 'I',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
  });

  const [report, setReport] = useState<ComprehensiveClassReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  // Tải dữ liệu báo cáo
  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reportsService.getComprehensiveReport(classId, filter);
      setReport(data);
    } catch (err) {
      console.error('Lỗi nạp báo cáo tổng hợp:', err);
    } finally {
      setIsLoading(false);
    }
  }, [classId, filter]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!report) return;
    const printElement = document.getElementById('report-print-a4-view');
    if (!printElement) {
      alert('Không tìm thấy nội dung báo cáo A4');
      return;
    }

    setIsExportingPdf(true);
    try {
      const cleanTitle = report.periodTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
      const fileName = `Bao_Cao_${report.className}_${cleanTitle}.pdf`;
      await pdfExportService.exportToPdf(printElement, {
        fileName,
        onProgress: (_prog, stage) => setExportStatus(stage),
      });
    } catch (err) {
      console.error('Lỗi khi xuất PDF trực tiếp:', err);
      alert('Không thể tạo file PDF. Thầy có thể sử dụng nút "In Báo Cáo A4 / Lưu PDF" để xuất qua trình duyệt.');
    } finally {
      setIsExportingPdf(false);
      setExportStatus('');
    }
  };

  const handleExportExcel = () => {
    if (!report) return;
    reportsService.exportReportToExcel(report);
  };

  const setPeriodType = (type: PeriodFilterType) => {
    setFilter((prev) => ({ ...prev, periodType: type }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Nút hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight">
              Sổ Theo Dõi & Báo Cáo Tổng Kết
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase">
              Số liệu thật 100%
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Tổng hợp sổ cái thi đua 4 tổ, chuyên cần và danh sách học sinh phục vụ họp phụ huynh và in nộp BGH
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleExportPdf}
            disabled={isExportingPdf || !report}
            size="sm"
            className="text-xs font-bold shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            {isExportingPdf ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                {exportStatus || 'Đang tạo PDF...'}
              </span>
            ) : (
              '📥 Tải File PDF (A4)'
            )}
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm" className="text-xs font-bold shadow-xs">
            🖨️ In Báo Cáo A4 / Lưu PDF
          </Button>
          <Button onClick={handleExportExcel} variant="secondary" size="sm" className="text-xs font-bold">
            📊 Xuất Excel
          </Button>
          <Button onClick={loadReport} variant="ghost" size="sm" className="text-xs font-bold">
            🔄 Làm mới
          </Button>
        </div>
      </div>

      {/* 2. Thanh lọc kỳ báo cáo */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setPeriodType('month')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              filter.periodType === 'month'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📅 Theo Tháng
          </button>
          <button
            onClick={() => setPeriodType('week')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              filter.periodType === 'week'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📆 Theo Tuần Học
          </button>
          <button
            onClick={() => setPeriodType('semester')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              filter.periodType === 'semester'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🎓 Theo Học Kỳ
          </button>
        </div>

        {/* Lựa chọn chi tiết tùy loại kỳ */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 flex-wrap text-xs">
          {filter.periodType === 'month' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Chọn tháng:</span>
              <select
                value={filter.month}
                onChange={(e) => setFilter((p) => ({ ...p, month: Number(e.target.value) }))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filter.periodType === 'week' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Chọn tuần học:</span>
              <select
                value={filter.weekNumber}
                onChange={(e) => setFilter((p) => ({ ...p, weekNumber: Number(e.target.value) }))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filter.periodType === 'semester' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Giai đoạn:</span>
              <select
                value={filter.semester}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, semester: e.target.value as 'I' | 'II' | 'full_year' }))
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                <option value="I">Học kỳ I (Tháng 9 - Tháng 1)</option>
                <option value="II">Học kỳ II (Tháng 1 - Tháng 5)</option>
                <option value="full_year">Cả Năm Học</option>
              </select>
            </div>
          )}

          {report && (
            <span className="text-[11px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-xl border border-primary/10">
              📌 {report.periodTitle} ({report.dateRangeText})
            </span>
          )}
        </div>
      </div>

      {/* 3. Nội dung báo cáo */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 print:hidden">
          <LoadingSpinner size="lg" text="Đang tổng hợp số liệu báo cáo thực tế..." />
        </div>
      ) : report ? (
        <div className="space-y-6 print:hidden">
          {/* 3.1. Thẻ KPI */}
          <ReportKpiCards kpi={report.kpi} />

          {/* 3.2. Bảng xếp hạng 4 Tổ */}
          <GroupRankReportTable groupStats={report.groupStats} />

          {/* 3.3. Top Vinh danh & Cần quan tâm */}
          <HonoredAndNeedsCareStudents
            topStudents={report.topStudents}
            studentsNeedingCare={report.studentsNeedingCare}
          />

          {/* 3.4. Bảng đối soát 47 học sinh */}
          <StudentLedgerReportTable
            students={report.allStudents}
            onExportExcel={handleExportExcel}
          />
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 print:hidden">
          <p className="text-slate-400 font-bold">Không thể tải dữ liệu báo cáo. Vui lòng thử lại.</p>
        </div>
      )}

      {/* 4. Bản in A4 Sư phạm (Tự động hiển thị khi bấm Print hoặc Ctrl+P) */}
      {report && <ReportPrintA4View report={report} />}
    </div>
  );
};
