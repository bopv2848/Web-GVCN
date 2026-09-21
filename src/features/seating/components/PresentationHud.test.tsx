import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PresentationHud } from './PresentationHud';

describe('PresentationHud Component', () => {
  const defaultProps = {
    cleanClassName: '6A6',
    viewMode: '3d' as const,
    onToggleViewMode: vi.fn(),
    zoomLevel: 100,
    onZoomChange: vi.fn(),
    onFitScreen: vi.fn(),
    onResetZoom: vi.fn(),
    onExitFullscreen: vi.fn(),
  };

  it('hiển thị đầy đủ thông tin tên lớp và các nút điều khiển', () => {
    render(<PresentationHud {...defaultProps} />);

    expect(screen.getByText(/TRÌNH CHIẾU 6A6/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3D/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2D/i })).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vừa Khít/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thu Nhỏ \(ESC\)/i })).toBeInTheDocument();
  });

  it('tách biệt thành 2 thanh: thanh ngang trên cùng canh giữa và thanh dọc điều khiển bên trái', () => {
    render(<PresentationHud {...defaultProps} />);

    // Thanh ngang trên cùng chứa tên lớp và các nút bốc thăm
    const topBar = screen.getByRole('banner');
    expect(topBar).toBeInTheDocument();
    expect(topBar).toHaveClass('fixed', 'top-3');

    // Thanh dọc bên trái chứa các công cụ điều khiển hệ thống
    const leftDock = screen.getByLabelText('Thanh công cụ điều khiển hệ thống');
    expect(leftDock).toBeInTheDocument();
    expect(leftDock).toHaveClass('fixed', 'left-3');
  });

  it('gọi onExitFullscreen khi nhấn nút Thu Nhỏ', () => {
    const handleExit = vi.fn();
    render(<PresentationHud {...defaultProps} onExitFullscreen={handleExit} />);

    fireEvent.click(screen.getByRole('button', { name: /Thu Nhỏ \(ESC\)/i }));
    expect(handleExit).toHaveBeenCalledTimes(1);
  });

  it('gọi onFitScreen khi bấm nút Vừa Khít', () => {
    const handleFit = vi.fn();
    render(<PresentationHud {...defaultProps} onFitScreen={handleFit} />);

    fireEvent.click(screen.getByRole('button', { name: /Vừa Khít/i }));
    expect(handleFit).toHaveBeenCalledTimes(1);
  });

  it('gọi onStartSpin khi bấm nút Bốc Thăm', () => {
    const handleSpin = vi.fn();
    render(<PresentationHud {...defaultProps} onStartSpin={handleSpin} />);

    fireEvent.click(screen.getByRole('button', { name: /Bốc Thăm/i }));
    expect(handleSpin).toHaveBeenCalledTimes(1);
  });

  it('gọi onToggleTimer khi bấm nút Đếm Giờ', () => {
    const handleTimer = vi.fn();
    render(<PresentationHud {...defaultProps} onToggleTimer={handleTimer} />);

    fireEvent.click(screen.getByRole('button', { name: /Đếm Giờ/i }));
    expect(handleTimer).toHaveBeenCalledTimes(1);
  });

  it('gọi onToggleSplitMode khi bấm nút Bảng Phụ', () => {
    const handleSplit = vi.fn();
    render(<PresentationHud {...defaultProps} onToggleSplitMode={handleSplit} />);

    fireEvent.click(screen.getByRole('button', { name: /Bảng Phụ/i }));
    expect(handleSplit).toHaveBeenCalledTimes(1);
  });

  it('mở menu bộ lọc khi nhấn nút phễu lọc bốc thăm', () => {
    const handleFilterGroup = vi.fn();
    render(
      <PresentationHud
        {...defaultProps}
        onStartSpin={vi.fn()}
        onFilterGroupChange={handleFilterGroup}
        eligibleCount={35}
      />
    );

    expect(screen.getByText(/Bốc Thăm \(35\)/i)).toBeInTheDocument();

    const filterBtn = screen.getByTitle(/Cài đặt bộ lọc nâng cao/i);
    fireEvent.click(filterBtn);

    expect(screen.getByText('🌪️ Bộ Lọc Nâng Cao')).toBeInTheDocument();
    expect(screen.getByText('Tổ học tập:')).toBeInTheDocument();
    expect(screen.getByText('Giới tính:')).toBeInTheDocument();
    expect(screen.getByText('Loại trừ bạn đã phát biểu')).toBeInTheDocument();

    // Nút đóng popover
    fireEvent.click(screen.getByLabelText('Đóng bộ lọc'));
    expect(screen.queryByText('🌪️ Bộ Lọc Nâng Cao')).not.toBeInTheDocument();
  });

  it('hỗ trợ chuyển đổi chế độ Bốc Thăm Đôi Bạn Cùng Bàn trực tiếp trên HUD', () => {
    const handlePickModeChange = vi.fn();
    render(
      <PresentationHud
        {...defaultProps}
        onStartSpin={vi.fn()}
        pickMode="pair"
        onPickModeChange={handlePickModeChange}
        eligibleCount={18}
      />
    );

    // Khi ở chế độ pair, nhãn nút đổi thành Bốc Cặp
    expect(screen.getByText(/Bốc Cặp \(18\)/i)).toBeInTheDocument();

    // Click trực tiếp nút Cá nhân trên thanh HUD
    const singleBtn = screen.getByRole('button', { name: /👤 Cá nhân/i });
    expect(singleBtn).toBeInTheDocument();

    fireEvent.click(singleBtn);
    expect(handlePickModeChange).toHaveBeenCalledWith('single');
  });

  it('hỗ trợ chuyển đổi chế độ Bốc Thăm Nhóm 4 bạn (group4) trực tiếp trên HUD', () => {
    const handlePickModeChange = vi.fn();
    render(
      <PresentationHud
        {...defaultProps}
        onStartSpin={vi.fn()}
        pickMode="single"
        onPickModeChange={handlePickModeChange}
        eligibleCount={8}
      />
    );

    // Click trực tiếp nút Nhóm 4 trên thanh HUD
    const groupBtn = screen.getByRole('button', { name: /👨‍👩‍👧‍👦 Nhóm 4/i });
    expect(groupBtn).toBeInTheDocument();

    fireEvent.click(groupBtn);
    expect(handlePickModeChange).toHaveBeenCalledWith('group4');
  });

  it('hỗ trợ chuyển đổi chế độ Bốc Thăm Đối Kháng 2 Phe (battle) trực tiếp trên HUD', () => {
    const handlePickModeChange = vi.fn();
    render(
      <PresentationHud
        {...defaultProps}
        onStartSpin={vi.fn()}
        pickMode="battle"
        onPickModeChange={handlePickModeChange}
        eligibleCount={6}
      />
    );

    // Khi ở chế độ battle, nhãn nút đổi thành Bốc 2 Đội
    expect(screen.getByText(/Bốc 2 Đội \(6\)/i)).toBeInTheDocument();

    const battleBtn = screen.getByRole('button', { name: /⚔️ Đối kháng/i });
    expect(battleBtn).toBeInTheDocument();

    fireEvent.click(battleBtn);
    expect(handlePickModeChange).toHaveBeenCalledWith('battle');
  });

  it('hỗ trợ bật tắt tùy chọn Làm mới danh sách khi đổi hình thức', () => {
    const handleToggleAutoReset = vi.fn();
    render(
      <PresentationHud
        {...defaultProps}
        onStartSpin={vi.fn()}
        autoResetOnModeChange={false}
        onToggleAutoResetOnModeChange={handleToggleAutoReset}
      />
    );

    // Mở popover bộ lọc
    const filterBtn = screen.getByTitle(/Cài đặt bộ lọc nâng cao/i);
    fireEvent.click(filterBtn);

    const checkbox = screen.getByLabelText(/Làm mới danh sách khi đổi hình thức/i);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(handleToggleAutoReset).toHaveBeenCalledTimes(1);
  });

  it('gọi onResetView khi bấm nút Toàn cảnh trên thanh HUD', () => {
    const handleResetView = vi.fn();
    render(
      <PresentationHud
        {...defaultProps}
        viewMode="3d"
        onResetView={handleResetView}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Toàn cảnh/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleResetView).toHaveBeenCalledTimes(1);
  });

  it('hỗ trợ chuyển đổi nhanh Không trùng và làm mới danh sách đã gọi', () => {
    const handleToggleExclude = vi.fn();
    const handleClearHistory = vi.fn();

    render(
      <PresentationHud
        {...defaultProps}
        onStartSpin={vi.fn()}
        excludeCalled={true}
        onToggleExcludeCalled={handleToggleExclude}
        calledCount={5}
        onClearSpinHistory={handleClearHistory}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /Không trùng/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(handleToggleExclude).toHaveBeenCalledTimes(1);

    const resetBtn = screen.getByTitle(/Làm mới danh sách đã gọi/i);
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleClearHistory).toHaveBeenCalledTimes(1);
  });

  it('hỗ trợ điều chỉnh thanh âm lượng và nút bật/tắt tiếng (Mute)', () => {
    render(<PresentationHud {...defaultProps} />);

    const muteBtn = screen.getByRole('button', { name: /Tắt âm thanh/i });
    expect(muteBtn).toBeInTheDocument();

    // Bấm tắt tiếng
    fireEvent.click(muteBtn);
    expect(screen.getByRole('button', { name: /Bật âm thanh/i })).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Kéo thanh âm lượng
    const slider = screen.getByLabelText(/Thanh điều chỉnh âm lượng/i);
    fireEvent.change(slider, { target: { value: '0.6' } });
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('gọi onOpenCalledDrawer khi bấm nút xem danh sách học sinh đã gọi', () => {
    const handleOpenDrawer = vi.fn();
    render(
      <PresentationHud
        {...defaultProps}
        onStartSpin={vi.fn()}
        calledCount={3}
        onOpenCalledDrawer={handleOpenDrawer}
      />
    );

    const drawerBtn = screen.getByTitle(/Xem danh sách chi tiết học sinh đã bốc thăm/i);
    expect(drawerBtn).toBeInTheDocument();

    fireEvent.click(drawerBtn);
    expect(handleOpenDrawer).toHaveBeenCalledTimes(1);
  });

  it('hỗ trợ bật/tắt nút Chữ Siêu To cho học sinh ngồi xa trên thanh điều khiển bên trái', () => {
    const handleToggleLarge = vi.fn();
    const { rerender } = render(
      <PresentationHud
        {...defaultProps}
        isLargeText={false}
        onToggleLargeText={handleToggleLarge}
      />
    );

    const largeBtn = screen.getByTitle(/BẬT Chữ Siêu To Rõ/i);
    expect(largeBtn).toBeInTheDocument();
    expect(screen.getByText('Cỡ Chữ')).toBeInTheDocument();

    fireEvent.click(largeBtn);
    expect(handleToggleLarge).toHaveBeenCalledTimes(1);

    // Khi đang bật
    rerender(
      <PresentationHud
        {...defaultProps}
        isLargeText={true}
        onToggleLargeText={handleToggleLarge}
      />
    );
    expect(screen.getByText('Chữ Siêu To')).toBeInTheDocument();
  });
});
