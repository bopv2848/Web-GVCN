import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EpidemicAlertBanner } from './EpidemicAlertBanner';
import type { EpidemicAlert } from '../../../types/attendance';

describe('EpidemicAlertBanner Component', () => {
  it('không hiển thị khi số ca ốm dưới ngưỡng (< 3 em)', () => {
    const safeAlert: EpidemicAlert = {
      level: 'none',
      sickStudentCount: 1,
      threshold: { warning: 3, critical: 4 },
      windowDays: 7,
      startDate: '2026-09-05',
      endDate: '2026-09-11',
      sickStudents: [
        {
          studentId: 'hs-1',
          studentName: 'Nguyễn Văn An',
          groupName: 'Tổ 1',
          dates: ['2026-09-10'],
          reasons: ['Ốm sốt nhẹ'],
        },
      ],
      dominantSymptoms: [{ symptom: 'Ốm sốt / Cảm cúm', count: 1 }],
    };

    const { container } = render(
      <EpidemicAlertBanner alert={safeAlert} onOpenReport={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('hiển thị Cảnh báo Vàng khi có 3 học sinh nghỉ ốm', () => {
    const warningAlert: EpidemicAlert = {
      level: 'warning',
      sickStudentCount: 3,
      threshold: { warning: 3, critical: 4 },
      windowDays: 7,
      startDate: '2026-09-05',
      endDate: '2026-09-11',
      sickStudents: [
        { studentId: 'hs-1', studentName: 'Nguyễn Văn An', groupName: 'Tổ 1', dates: ['2026-09-08'], reasons: ['Sốt cao'] },
        { studentId: 'hs-2', studentName: 'Trần Thị Bích', groupName: 'Tổ 2', dates: ['2026-09-09'], reasons: ['Cảm cúm'] },
        { studentId: 'hs-3', studentName: 'Lê Hoàng Cường', groupName: 'Tổ 3', dates: ['2026-09-10'], reasons: ['Đau họng'] },
      ],
      dominantSymptoms: [{ symptom: 'Ốm sốt / Cảm cúm', count: 3 }],
    };

    render(<EpidemicAlertBanner alert={warningAlert} onOpenReport={vi.fn()} />);

    expect(screen.getByText(/Cảnh Báo Sớm Dịch Bệnh/i)).toBeInTheDocument();
    expect(screen.getByText(/3 Học Sinh Nghỉ Ốm Sốt \/ Cảm Cúm Trong Tuần!/i)).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn An')).toBeInTheDocument();
  });

  it('hiển thị Báo Động Đỏ khi có từ 4 học sinh ốm trở lên và mở báo cáo khi bấm nút', () => {
    const handleOpenReport = vi.fn();
    const criticalAlert: EpidemicAlert = {
      level: 'critical',
      sickStudentCount: 4,
      threshold: { warning: 3, critical: 4 },
      windowDays: 7,
      startDate: '2026-09-05',
      endDate: '2026-09-11',
      sickStudents: [
        { studentId: 'hs-1', studentName: 'Nguyễn Văn An', groupName: 'Tổ 1', dates: ['2026-09-07'], reasons: ['Sốt xuất huyết'] },
        { studentId: 'hs-2', studentName: 'Trần Thị Bích', groupName: 'Tổ 2', dates: ['2026-09-08'], reasons: ['Sốt virus'] },
        { studentId: 'hs-3', studentName: 'Lê Hoàng Cường', groupName: 'Tổ 3', dates: ['2026-09-09'], reasons: ['Cảm cúm'] },
        { studentId: 'hs-4', studentName: 'Phạm Thu Dung', groupName: 'Tổ 4', dates: ['2026-09-10'], reasons: ['Khám viện Nhi'] },
      ],
      dominantSymptoms: [{ symptom: 'Ốm sốt / Cảm cúm', count: 4 }],
    };

    render(<EpidemicAlertBanner alert={criticalAlert} onOpenReport={handleOpenReport} />);

    expect(screen.getByText(/Báo Động Đỏ Y Tế/i)).toBeInTheDocument();
    expect(screen.getByText(/4 Học Sinh Nghỉ Ốm Sốt \/ Cảm Cúm Trong Tuần!/i)).toBeInTheDocument();

    // Bấm nút báo cáo y tế
    const reportBtn = screen.getByRole('button', { name: /BÁO CÁO Y TẾ & KHỬ KHUẨN/i });
    fireEvent.click(reportBtn);
    expect(handleOpenReport).toHaveBeenCalledTimes(1);

    // Bấm nút mở quy trình khử khuẩn
    const procedureBtn = screen.getByRole('button', { name: /Xem Quy Trình Khử Khuẩn/i });
    fireEvent.click(procedureBtn);
    expect(screen.getByText(/Bước 4: Phun Khử Khuẩn/i)).toBeInTheDocument();
  });
});
