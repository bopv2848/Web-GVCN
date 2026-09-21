import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeatingZoomControl } from './SeatingZoomControl';

describe('SeatingZoomControl Component', () => {
  it('hiển thị mức zoom hiện tại và gọi onZoomChange khi bấm nút phóng to / thu nhỏ', () => {
    const handleZoomChange = vi.fn();
    render(
      <SeatingZoomControl
        zoomLevel={70}
        onZoomChange={handleZoomChange}
        variant="toolbar"
      />
    );

    expect(screen.getByText(/70%/i)).toBeInTheDocument();

    const zoomInBtn = screen.getByRole('button', { name: /Phóng to/i });
    fireEvent.click(zoomInBtn);
    expect(handleZoomChange).toHaveBeenCalledWith(80);

    const zoomOutBtn = screen.getByRole('button', { name: /Thu nhỏ/i });
    fireEvent.click(zoomOutBtn);
    expect(handleZoomChange).toHaveBeenCalledWith(60);
  });

  it('gọi onFitScreen khi bấm nút "Vừa Màn Hình"', () => {
    const handleFit = vi.fn();
    render(
      <SeatingZoomControl
        zoomLevel={100}
        onZoomChange={vi.fn()}
        onFitScreen={handleFit}
        variant="toolbar"
      />
    );

    const fitBtn = screen.getByRole('button', { name: /Vừa Màn Hình/i });
    fireEvent.click(fitBtn);
    expect(handleFit).toHaveBeenCalledTimes(1);
  });

  it('hiển thị nút 100% khi zoomLevel khác 100 và gọi onResetZoom khi bấm', () => {
    const handleReset = vi.fn();
    render(
      <SeatingZoomControl
        zoomLevel={75}
        onZoomChange={vi.fn()}
        onResetZoom={handleReset}
        variant="toolbar"
      />
    );

    const resetBtn = screen.getByRole('button', { name: '100%' });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('hiển thị đúng ở chế độ floating widget', () => {
    render(
      <SeatingZoomControl
        zoomLevel={85}
        onZoomChange={vi.fn()}
        variant="floating"
      />
    );

    expect(screen.getByRole('complementary', { name: /Thanh điều khiển thu phóng nổi/i })).toBeInTheDocument();
    expect(screen.getByText(/85%/i)).toBeInTheDocument();
  });
});
