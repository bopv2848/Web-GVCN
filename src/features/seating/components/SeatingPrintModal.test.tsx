import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeatingPrintModal } from './SeatingPrintModal';

describe('SeatingPrintModal Component', () => {
  const mockConfig = {
    schoolName: 'TRƯỜNG THCS TÂN HẢI',
    className: 'LỚP 6A6',
    teacherName: 'Thầy Phan Văn Bộ',
    academicYear: '2026 - 2027',
    title: 'SƠ ĐỒ CHỖ NGỒI HỌC SINH',
    appliedDate: '18/09/2026',
    modeNote: 'Chế độ: Chỗ ngồi cố định',
    colorMode: 'color' as const,
  };

  it('hiển thị đầy đủ form nhập liệu và xem trước tiêu đề khi modal mở', () => {
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={vi.fn()}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
      />
    );

    expect(screen.getByText('Tùy Chỉnh Tiêu Đề Văn Bản Hành Chính & In Sơ Đồ A4')).toBeInTheDocument();
    expect(screen.getByDisplayValue('TRƯỜNG THCS TÂN HẢI')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Thầy Phan Văn Bộ')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18/09/2026')).toBeInTheDocument();
    expect(screen.getAllByText(/In Màu Rực Rỡ/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('In Đen Trắng Nét Đậm')).toBeInTheDocument();
    expect(screen.getByText(/XUẤT FILE PDF A4/i)).toBeInTheDocument();
    expect(screen.getByText(/IN NGAY/i)).toBeInTheDocument();
  });

  it('gọi hàm onUpdateHeaderConfig khi người dùng chuyển sang chế độ đen trắng', () => {
    const onUpdate = vi.fn();
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={onUpdate}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
      />
    );

    const monoBtn = screen.getByText(/In Đen Trắng Nét Đậm/i);
    fireEvent.click(monoBtn);

    expect(onUpdate).toHaveBeenCalledWith({
      colorMode: 'monochrome',
    });
  });

  it('gọi hàm onUpdateHeaderConfig khi người dùng nhập thông tin', () => {
    const onUpdate = vi.fn();
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={onUpdate}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
      />
    );

    const schoolInput = screen.getByDisplayValue('TRƯỜNG THCS TÂN HẢI');
    fireEvent.change(schoolInput, {
      target: { value: 'TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026' },
    });

    expect(onUpdate).toHaveBeenCalledWith({
      schoolName: 'TRƯỜNG THCS TÂN HẢI - NĂM HỌC 2025-2026',
    });
  });

  it('gọi onClose và kích hoạt window.print sau thời gian chờ khi nhấn nút IN NGAY', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={onClose}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={vi.fn()}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
      />
    );

    const printBtn = screen.getByText(/IN NGAY/i);
    fireEvent.click(printBtn);

    // Modal phải được đóng ngay lập tức để không che sơ đồ
    expect(onClose).toHaveBeenCalledTimes(1);

    // Chạy qua timeout 150ms
    vi.advanceTimersByTime(150);
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
    vi.useRealTimers();
  });

  it('áp dụng thuộc tính ẩn khi in trên modal để tránh che sơ đồ khi bấm Ctrl+P', () => {
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={vi.fn()}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('data-print-hidden', 'true');
    expect(dialog.className).toContain('print:hidden');
  });

  it('gọi onUpdateHeaderConfig khi người dùng chọn cỡ chữ in 12pt, 13pt hoặc 14pt', () => {
    const onUpdate = vi.fn();
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={onUpdate}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
      />
    );

    const btn12 = screen.getByText('12pt');
    fireEvent.click(btn12);
    expect(onUpdate).toHaveBeenCalledWith({ fontSize: 12 });

    const btn13 = screen.getByText('13pt');
    fireEvent.click(btn13);
    expect(onUpdate).toHaveBeenCalledWith({ fontSize: 13 });
  });

  it('gọi onUpdateHeaderConfig khi người dùng chọn kiểu chữ VIẾT HOA và bật/tắt tự động co chữ', () => {
    const onUpdate = vi.fn();
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={onUpdate}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
      />
    );

    const upperBtn = screen.getByText('VIẾT HOA');
    fireEvent.click(upperBtn);
    expect(onUpdate).toHaveBeenCalledWith({ nameCase: 'uppercase' });

    const checkbox = screen.getByLabelText('Tự động co nhỏ 1 cỡ cho tên dài');
    fireEvent.click(checkbox);
    expect(onUpdate).toHaveBeenCalledWith({ autoFitLongNames: false });
  });

  it('cho phép bật/tắt và tùy chỉnh nội dung Sĩ số lớp', () => {
    const onUpdate = vi.fn();
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={onUpdate}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
        totalStudents={42}
        femaleStudents={22}
      />
    );

    // Kiểm tra hiển thị mặc định
    expect(screen.getByText(/In kèm Sĩ số lớp cạnh tên phòng học/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\(Sĩ số: 42\/Nữ: 22\)/i).length).toBeGreaterThanOrEqual(1);

    // Bật tắt checkbox Sĩ số
    const sizeCheckbox = screen.getByLabelText('In kèm Sĩ số lớp');
    fireEvent.click(sizeCheckbox);
    expect(onUpdate).toHaveBeenCalledWith({ showClassSize: false });

    // Thay đổi nội dung tùy chỉnh
    const inputCustom = screen.getByPlaceholderText('(Sĩ số: 42/Nữ: 22)');
    fireEvent.change(inputCustom, { target: { value: '(Sĩ số: 42/nữ)' } });
    expect(onUpdate).toHaveBeenCalledWith({ classSizeText: '(Sĩ số: 42/nữ)' });
  });

  it('cho phép bật/tắt hiển thị Mũi tên Cửa Ra Vào trên bản in', () => {
    const onUpdate = vi.fn();
    render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={{ ...mockConfig, showDoorArrow: true }}
        onUpdateHeaderConfig={onUpdate}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
        elementsConfig={{
          doorPosition: 'right',
          doorAngle: 180,
          teacherDeskPosition: 'right',
        }}
      />
    );

    expect(screen.getByText(/In kèm Mũi tên Cửa Ra Vào/i)).toBeInTheDocument();
    expect(screen.getByText(/Hành lang Phải/i)).toBeInTheDocument();

    const doorCheckbox = screen.getByLabelText('In kèm Mũi tên Cửa Ra Vào');
    fireEvent.click(doorCheckbox);
    expect(onUpdate).toHaveBeenCalledWith({ showDoorArrow: false });
  });

  it('đồng bộ chính xác vị trí Bàn Giáo Viên (Trái, Giữa, Phải) và Cửa Ra Vào trên bản xem trước in', () => {
    const { rerender } = render(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={vi.fn()}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
        elementsConfig={{
          doorPosition: 'left',
          doorAngle: 180,
          teacherDeskPosition: 'left',
          teacherDeskLabel: 'Bàn Giáo Viên 6A6',
        }}
      />
    );

    // Kiểm tra Bàn Giáo Viên và Cửa đều ở bên Trái
    expect(screen.getByText(/Bàn Giáo Viên 6A6/i)).toBeInTheDocument();
    expect(screen.getByText('Cửa ra vào')).toBeInTheDocument();
    expect(screen.getByLabelText(/Mũi tên Cửa Ra Vào hướng Trái/i)).toBeInTheDocument();

    // Rerender với Bàn Giáo Viên ở CHÍNH GIỮA và Cửa ở bên Phải
    rerender(
      <SeatingPrintModal
        isOpen={true}
        onClose={vi.fn()}
        headerConfig={mockConfig}
        onUpdateHeaderConfig={vi.fn()}
        onResetHeaderConfig={vi.fn()}
        onExportPdf={vi.fn()}
        isExportingPdf={false}
        elementsConfig={{
          doorPosition: 'right',
          doorAngle: 0,
          teacherDeskPosition: 'center',
          teacherDeskLabel: 'Bàn GV Giữa',
        }}
      />
    );

    expect(screen.getByText(/Bàn GV Giữa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mũi tên Cửa Ra Vào hướng Phải/i)).toBeInTheDocument();
  });
});
