import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ClassroomFrontElements } from './ClassroomFrontElements';
import type { ClassroomElementsConfig } from '../../../types/seating';

describe('ClassroomFrontElements Component', () => {
  const mockUpdateConfig = vi.fn();

  const defaultConfig: ClassroomElementsConfig = {
    teacherDeskPosition: 'right',
    doorPosition: 'right',
    doorAngle: 180,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('xóa bỏ hoàn toàn Bục Giảng và Dãy Cửa Sổ khỏi giao diện', () => {
    render(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    // Không tồn tại Bục Giảng và Dãy Cửa Sổ
    expect(screen.queryByText(/Bục Giảng/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dãy Cửa Sổ/i)).not.toBeInTheDocument();
  });

  it('hiển thị Bàn Giáo Viên 3D gọn gàng, loại bỏ các nút điều hướng thừa', () => {
    render(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    expect(screen.getByText('Bàn Giáo Viên')).toBeInTheDocument();

    // Xác nhận không còn thanh công cụ nút bấm thừa dưới Bàn Giáo Viên
    expect(screen.queryByTitle('Dời Bàn Giáo Viên sang bên Trái')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Đặt Bàn Giáo Viên ở Giữa')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Dời Bàn Giáo Viên sang bên Phải')).not.toBeInTheDocument();
  });

  it('hiển thị Cửa Ra Vào Mũi Tên như sơ đồ 2D, hỗ trợ click xoay góc hoặc nút xoay và loại bỏ thanh công cụ nút bấm thừa', () => {
    render(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    expect(screen.getByText('Cửa ra vào')).toBeInTheDocument();
    const rotateBtn = screen.getByLabelText('Xoay hướng mũi tên');
    expect(rotateBtn).toBeInTheDocument();

    // Bấm vào nút xoay hoặc mũi tên để đổi hướng (Trái ↔ Phải)
    fireEvent.click(rotateBtn);
    expect(mockUpdateConfig).toHaveBeenCalledWith({ doorAngle: 0 });

    // Xác nhận không còn thanh công cụ nút bấm thừa dưới Cửa Ra Vào
    expect(screen.queryByRole('button', { name: /Qua Trái/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Qua Phải/i })).not.toBeInTheDocument();
  });

  it('bố cục 2 tầng: Bàn Giáo Viên ở phía trên (Tầng 1) và Cửa Ra Vào ở phía dưới (Tầng 2) hơi lệch so le', () => {
    // 1. Trường hợp cả 2 ở bên Trái
    const { rerender } = render(
      <ClassroomFrontElements
        config={{ teacherDeskPosition: 'left', doorPosition: 'left', doorAngle: 90 }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const deskElement = screen.getByText('Bàn Giáo Viên');
    const doorElement = screen.getByText(/Cửa Ra Vào/i);

    // Bàn giáo viên nằm trong tầng trên lệch so le (có pl-8 sm:pl-16)
    const deskContainer = deskElement.closest('.justify-start');
    expect(deskContainer).not.toBeNull();
    expect(deskContainer?.className).toContain('pl-8');

    // Cửa ra vào nằm trong tầng dưới (justify-start)
    const doorContainer = doorElement.closest('.justify-start');
    expect(doorContainer).not.toBeNull();

    // 2. Trường hợp cả 2 ở bên Phải
    rerender(
      <ClassroomFrontElements
        config={{ teacherDeskPosition: 'right', doorPosition: 'right', doorAngle: 90 }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const deskRightContainer = screen.getByText('Bàn Giáo Viên').closest('.justify-end');
    expect(deskRightContainer?.className).toContain('pr-8');
  });

  it('hỗ trợ nhấp đúp chuột để đổi nhãn tên Bàn Giáo Viên (ví dụ: Bàn Cô Lan)', () => {
    render(
      <ClassroomFrontElements
        config={{ ...defaultConfig, teacherDeskLabel: 'Bàn Giáo Viên' }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const deskLabelSpan = screen.getByText('Bàn Giáo Viên');
    expect(deskLabelSpan).toBeInTheDocument();

    // Nhấp đúp chuột vào nhãn tên bàn
    fireEvent.doubleClick(deskLabelSpan);

    // Xuất hiện ô input chỉnh sửa
    const input = screen.getByDisplayValue('Bàn Giáo Viên');
    expect(input).toBeInTheDocument();

    // Nhập tên mới: 'Bàn Cô Lan'
    fireEvent.change(input, { target: { value: 'Bàn Cô Lan' } });

    // Nhấn Enter hoặc blur ra ngoài
    fireEvent.keyDown(input, { key: 'Enter' });

    // Kích hoạt onUpdateConfig lưu nhãn mới
    expect(mockUpdateConfig).toHaveBeenCalledWith({ teacherDeskLabel: 'Bàn Cô Lan' });
  });

  it('hỗ trợ kéo thả trực tiếp (Direct Drag-and-Drop) cho Bàn Giáo Viên', () => {
    // Polyfill PointerEvent cho jsdom nếu môi trường chưa hỗ trợ
    class MockPointerEvent extends MouseEvent {
      pointerId: number;
      pointerType: string;
      constructor(type: string, props: PointerEventInit = {}) {
        super(type, props);
        this.pointerId = props.pointerId || 1;
        this.pointerType = props.pointerType || 'mouse';
      }
    }
    window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

    // Mock getBoundingClientRect trong jsdom
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1000,
      width: 1000,
      top: 0,
      bottom: 200,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    render(
      <ClassroomFrontElements
        config={{ teacherDeskPosition: 'right', doorPosition: 'right', doorAngle: 180 }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const deskBlock = screen.getByText('Bàn Giáo Viên').closest('.touch-none');
    expect(deskBlock).not.toBeNull();

    if (deskBlock) {
      deskBlock.setPointerCapture = vi.fn();
      deskBlock.releasePointerCapture = vi.fn();

      // Bắt đầu chạm giữ kéo từ bên phải (clientX = 800)
      fireEvent(deskBlock, new MockPointerEvent('pointerdown', { bubbles: true, clientX: 800, button: 0 }));

      // Di chuyển chuột/ngón tay sang trái (clientX = 100 < 350 tương ứng vùng 'left')
      fireEvent(deskBlock, new MockPointerEvent('pointermove', { bubbles: true, clientX: 100 }));

      // Nhả tay hoàn tất kéo
      fireEvent(deskBlock, new MockPointerEvent('pointerup', { bubbles: true, clientX: 100 }));

      // Kiểm tra hàm onUpdateConfig được kích hoạt với vị trí 'left'
      expect(mockUpdateConfig).toHaveBeenCalledWith({ teacherDeskPosition: 'left' });
    }
  });

  it('hỗ trợ kéo thả trực tiếp (Direct Drag-and-Drop) cho Cửa Ra Vào', () => {
    class MockPointerEvent extends MouseEvent {
      pointerId: number;
      pointerType: string;
      constructor(type: string, props: PointerEventInit = {}) {
        super(type, props);
        this.pointerId = props.pointerId || 1;
        this.pointerType = props.pointerType || 'mouse';
      }
    }
    window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent;

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1000,
      width: 1000,
      top: 0,
      bottom: 200,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    render(
      <ClassroomFrontElements
        config={{ teacherDeskPosition: 'right', doorPosition: 'right', doorAngle: 180 }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const doorBlock = screen.getByText(/Cửa Ra Vào/i).closest('.touch-none');
    expect(doorBlock).not.toBeNull();

    if (doorBlock) {
      doorBlock.setPointerCapture = vi.fn();
      doorBlock.releasePointerCapture = vi.fn();

      // Bắt đầu chạm giữ kéo từ bên phải (clientX = 800)
      fireEvent(doorBlock, new MockPointerEvent('pointerdown', { bubbles: true, clientX: 800, button: 0 }));

      // Di chuyển chuột/ngón tay sang trái (clientX = 100 < 500 tương ứng vùng 'left')
      fireEvent(doorBlock, new MockPointerEvent('pointermove', { bubbles: true, clientX: 100 }));

      // Nhả tay hoàn tất kéo
      fireEvent(doorBlock, new MockPointerEvent('pointerup', { bubbles: true, clientX: 100 }));

      // Kiểm tra hàm onUpdateConfig được kích hoạt với vị trí 'left'
      expect(mockUpdateConfig).toHaveBeenCalledWith({ doorPosition: 'left' });
    }
  });

  it('xóa bỏ hoàn toàn 2 nút Khóa Kích Thước và Chỉnh Kích Thước Bàn & Cửa khỏi giao diện', () => {
    render(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    // Xác nhận không còn 2 nút trên thanh công cụ và không có popup bảng trượt
    expect(screen.queryByRole('button', { name: /Khóa Kích Thước/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Đã Khóa Cỡ/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Chỉnh Kích Thước Bàn & Cửa/i })).not.toBeInTheDocument();
    expect(screen.queryByText('TÙY CHỈNH KÍCH THƯỚC')).not.toBeInTheDocument();
  });

  it('đảm bảo chữ "Bàn Giáo Viên" luôn hiển thị đầy đủ, không bị cắt ngắn (truncate) khi co hẹp kích thước', () => {
    render(
      <ClassroomFrontElements
        config={{
          ...defaultConfig,
          teacherDeskWidth: 240,
        }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const deskLabel = screen.getByText('Bàn Giáo Viên');
    expect(deskLabel).toBeInTheDocument();
    // Đảm bảo không còn class truncate gây ra chữ bị cắt thành "Bàn Giá..."
    expect(deskLabel.className).not.toContain('truncate');
    expect(deskLabel.className).toContain('whitespace-nowrap');
    expect(deskLabel.textContent).toBe('Bàn Giáo Viên');
  });

  it('cho phép kéo giãn độ rộng và chiều dài trực tiếp của Bàn Giáo Viên', () => {
    render(
      <ClassroomFrontElements
        config={{
          ...defaultConfig,
          teacherDeskWidth: 384,
          teacherDeskScale: 100,
        }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    // Có các tay nắm kéo giãn kích thước trực tiếp
    const rightHandle = screen.getByRole('slider', { name: /Kéo dài bàn sang phải/i });
    const leftHandle = screen.getByRole('slider', { name: /Kéo dài bàn sang trái/i });
    const bottomHandle = screen.getByRole('slider', { name: /Kéo độ rộng bàn/i });

    expect(rightHandle).toBeInTheDocument();
    expect(leftHandle).toBeInTheDocument();
    expect(bottomHandle).toBeInTheDocument();

    // Kéo tay nắm bên phải sang phải (+50px)
    fireEvent.pointerDown(rightHandle, { clientX: 300, clientY: 100 });
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 350, clientY: 100 }));
    });
    expect(mockUpdateConfig).toHaveBeenCalledWith({ teacherDeskWidth: 434 });
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
    });

    // Kéo tay nắm bên dưới xuống (+20px)
    fireEvent.pointerDown(bottomHandle, { clientX: 200, clientY: 100 });
    act(() => {
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 200, clientY: 120 }));
    });
    expect(mockUpdateConfig).toHaveBeenCalledWith({ teacherDeskScale: 116 });
    act(() => {
      window.dispatchEvent(new PointerEvent('pointerup'));
    });
  });

  it('hiển thị Cửa Ra Vào dạng hình mũi tên SVG chuẩn học đường như 2D thay vì các thanh trượt kích thước phức tạp', () => {
    render(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    // Cửa ra vào là hình mũi tên SVG với nhãn rõ ràng
    expect(screen.getByText('Cửa ra vào')).toBeInTheDocument();
    // Không còn thanh trượt co giãn vụng về cho cửa ra vào
    expect(screen.queryByRole('slider', { name: /Kéo dài cửa sang phải/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('slider', { name: /Kéo độ rộng cửa/i })).not.toBeInTheDocument();
  });

  it('hỗ trợ thao tác chụm 2 ngón tay (Pinch-to-zoom) để phóng to thu nhỏ bàn giáo viên', () => {
    render(
      <ClassroomFrontElements
        config={{
          ...defaultConfig,
          teacherDeskWidth: 380,
          isDimensionsLocked: false,
        }}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const deskBlock = screen.getByText('Bàn Giáo Viên').closest('.touch-none');
    expect(deskBlock).not.toBeNull();

    if (deskBlock) {
      // Bắt đầu chạm 2 ngón tay: khoảng cách 100px
      fireEvent.touchStart(deskBlock, {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 100 },
        ],
      });

      // Kéo giãn 2 ngón tay: khoảng cách 150px (tăng 1.5 lần -> 380 * 1.5 = 570, clamp 560)
      fireEvent.touchMove(deskBlock, {
        touches: [
          { clientX: 75, clientY: 100 },
          { clientX: 225, clientY: 100 },
        ],
      });

      // Kết thúc thao tác
      fireEvent.touchEnd(deskBlock, { touches: [] });

      // onUpdateConfig được kích hoạt để thay đổi kích thước bàn
      expect(mockUpdateConfig).toHaveBeenCalled();
    }
  });

  it('tay nắm ở chế độ tàng hình (opacity-0) và chỉ xuất hiện khi rê chuột vào bàn học (group-hover:opacity-100)', () => {
    render(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
      />
    );

    const deskRightHandle = screen.getByRole('slider', { name: /Kéo dài bàn sang phải/i });
    const deskBottomHandle = screen.getByRole('slider', { name: /Kéo độ rộng bàn/i });

    // Kiểm tra các tay nắm có class tàng hình opacity-0 mặc định
    expect(deskRightHandle.className).toContain('opacity-0');
    expect(deskBottomHandle.className).toContain('opacity-0');

    // Kiểm tra có class xuất hiện khi hover: group-hover:opacity-100
    expect(deskRightHandle.className).toContain('group-hover:opacity-100');
    expect(deskBottomHandle.className).toContain('group-hover:opacity-100');
  });

  it('tự động đổi màu viền tay nắm sang màu vàng đồng khi ở chế độ ban ngày và màu dạ quang phản quang khi ở chế độ ban đêm', () => {
    // 1. Chế độ ban ngày (Day mode - Viền vàng đồng)
    const { rerender } = render(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
        isDarkMode={false}
      />
    );

    const dayDeskHandle = screen.getByRole('slider', { name: /Kéo dài bàn sang phải/i });

    // Viền vàng đồng ban ngày
    expect(dayDeskHandle.className).toContain('border-[#fef08a]');
    expect(dayDeskHandle.title).toContain('Viền vàng đồng');

    // 2. Chế độ ban đêm / màn hình tối (Night mode - Dạ quang phản quang)
    rerender(
      <ClassroomFrontElements
        config={defaultConfig}
        onUpdateConfig={mockUpdateConfig}
        isInteractive={true}
        isDarkMode={true}
      />
    );

    const nightDeskHandle = screen.getByRole('slider', { name: /Kéo dài bàn sang phải/i });

    // Dạ quang phản quang ban đêm
    expect(nightDeskHandle.className).toContain('border-[#a7f3d0]');
    expect(nightDeskHandle.className).toContain('animate-pulse');
    expect(nightDeskHandle.title).toContain('Dạ quang ban đêm');
  });
});




