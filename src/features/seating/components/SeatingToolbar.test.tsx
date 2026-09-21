import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeatingToolbar } from './SeatingToolbar';
import type { SeatingMedicalAnalysis } from '../../../types/seating';

describe('SeatingToolbar Component', () => {
  const defaultMedicalAnalysis: SeatingMedicalAnalysis = {
    sickStudentIds: new Set(),
    atRiskNeighborStudentIds: new Set(),
    clusters: [],
    totalSickInSeats: 0,
  };

  const defaultProps = {
    isMedicalMode: false,
    medicalAnalysis: defaultMedicalAnalysis,
    isRotationEnabled: false,
    schoolWeekInfo: { weekNumber: 1, mode: 'odd' as const },
    schoolYearStartDate: '2026-09-01',
    activeWeekMode: 'odd' as const,
    isSavingWeek: false,
    canUndo: false,
    undoActionDescription: null,
    hasAssignments: true,
    onToggleRotation: vi.fn(),
    onSelectWeekMode: vi.fn(),
    onOpenStartDateModal: vi.fn(),
    onOpenClusterModal: vi.fn(),
    onResetLayout: vi.fn(),
    onClearLayout: vi.fn(),
    onUndo: vi.fn(),
    onSaveCurrentWeekAsBase: vi.fn(),
  };

  it('hiển thị nút "Làm Trống" và kích hoạt onClearLayout khi nhấn', () => {
    const handleClear = vi.fn();
    render(<SeatingToolbar {...defaultProps} onClearLayout={handleClear} hasAssignments={true} />);

    const clearBtn = screen.getByRole('button', { name: /Làm Trống/i });
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn).not.toBeDisabled();

    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('vô hiệu hóa nút "Làm Trống" khi sơ đồ đã trống (hasAssignments = false)', () => {
    render(<SeatingToolbar {...defaultProps} hasAssignments={false} />);

    const clearBtn = screen.getByRole('button', { name: /Làm Trống/i });
    expect(clearBtn).toBeDisabled();
  });

  it('ẩn nút "Hoàn Tác" khi canUndo = false', () => {
    render(<SeatingToolbar {...defaultProps} canUndo={false} />);

    expect(screen.queryByRole('button', { name: /Hoàn Tác/i })).not.toBeInTheDocument();
  });

  it('hiển thị nút "Hoàn Tác" khi canUndo = true và gọi onUndo khi bấm', () => {
    const handleUndo = vi.fn();
    render(
      <SeatingToolbar
        {...defaultProps}
        canUndo={true}
        undoActionDescription="làm trống sơ đồ"
        onUndo={handleUndo}
      />
    );

    const undoBtn = screen.getByRole('button', { name: /Hoàn Tác/i });
    expect(undoBtn).toBeInTheDocument();

    fireEvent.click(undoBtn);
    expect(handleUndo).toHaveBeenCalledTimes(1);
  });

  it('hiển thị nút "Bản Mẫu" kèm số lượng và gọi onOpenPresetsModal khi bấm', () => {
    const handleOpenPresets = vi.fn();
    render(
      <SeatingToolbar
        {...defaultProps}
        presetsCount={3}
        onOpenPresetsModal={handleOpenPresets}
      />
    );

    const presetsBtn = screen.getByRole('button', { name: /Bản Mẫu/i });
    expect(presetsBtn).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    fireEvent.click(presetsBtn);
    expect(handleOpenPresets).toHaveBeenCalledTimes(1);
  });

  it('không còn hiển thị nút "Máy Chiếu" trên thanh công cụ', () => {
    render(<SeatingToolbar {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /Máy Chiếu/i })).not.toBeInTheDocument();
  });

  it('hiển thị nút "Trình Chiếu" và gọi onToggleFullscreen khi bấm', () => {
    const handleToggleFullscreen = vi.fn();
    const { rerender } = render(
      <SeatingToolbar
        {...defaultProps}
        isFullscreen={false}
        onToggleFullscreen={handleToggleFullscreen}
      />
    );

    const presentationBtn = screen.getByRole('button', { name: /Trình Chiếu/i });
    expect(presentationBtn).toBeInTheDocument();
    fireEvent.click(presentationBtn);
    expect(handleToggleFullscreen).toHaveBeenCalledTimes(1);

    // Khi đang ở chế độ Fullscreen
    rerender(
      <SeatingToolbar
        {...defaultProps}
        isFullscreen={true}
        onToggleFullscreen={handleToggleFullscreen}
      />
    );
    expect(screen.getByRole('button', { name: /Thu Nhỏ/i })).toBeInTheDocument();
  });
});
