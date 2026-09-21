import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassroomDoor2D } from './ClassroomDoor2D';

describe('ClassroomDoor2D Component', () => {
  it('hiển thị mũi tên Cửa Ra Vào với nhãn text chính xác và đã loại bỏ nút chuyển đổi cũ', () => {
    render(
      <ClassroomDoor2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 180,
        }}
        onUpdateElementsConfig={vi.fn()}
      />
    );

    expect(screen.getByText('Cửa ra vào')).toBeInTheDocument();
    // Nút điều khiển cũ đã được loại bỏ theo yêu cầu
    expect(screen.queryByLabelText('Đổi bên Cửa Ra Vào')).not.toBeInTheDocument();
  });

  it('bấm vào mũi tên hoặc nút xoay sẽ đảo chiều hướng mũi tên (Trái ↔ Phải)', () => {
    const onUpdateMock = vi.fn();
    render(
      <ClassroomDoor2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 180, // Đang hướng sang Trái
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const rotateBtn = screen.getByLabelText('Xoay hướng mũi tên');
    fireEvent.click(rotateBtn);

    expect(onUpdateMock).toHaveBeenCalledWith({
      doorAngle: 0, // Đổi sang hướng Phải
    });
  });

  it('hỗ trợ điều hướng phím mũi tên chuyển vị trí Cửa Ra Vào giữa Trái và Phải', () => {
    const onUpdateMock = vi.fn();
    render(
      <ClassroomDoor2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 180,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const doorEl = screen.getByRole('button', { name: /Cửa ra vào đang ở bên Phải/i });
    fireEvent.keyDown(doorEl, { key: 'ArrowLeft' });

    expect(onUpdateMock).toHaveBeenCalledWith({
      doorPosition: 'left',
    });
  });

  it('hỗ trợ kéo thả (pointer events) để di chuyển Cửa Ra Vào sang phía đối diện', () => {
    class MockPointerEvent extends MouseEvent {
      pointerId: number;
      pointerType: string;
      constructor(type: string, props: PointerEventInit = {}) {
        super(type, props);
        this.pointerId = props.pointerId || 1;
        this.pointerType = props.pointerType || 'mouse';
      }
    }

    const onUpdateMock = vi.fn();
    render(
      <ClassroomDoor2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'left',
          doorAngle: 180,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const doorEl = screen.getByRole('button', { name: /Cửa ra vào đang ở bên Trái/i });
    doorEl.setPointerCapture = vi.fn();
    doorEl.releasePointerCapture = vi.fn();

    // Giả lập thao tác kéo từ trái (clientX: 100) sang phải (clientX: 700)
    fireEvent(doorEl, new MockPointerEvent('pointerdown', { bubbles: true, clientX: 100, button: 0 }));
    fireEvent(doorEl, new MockPointerEvent('pointermove', { bubbles: true, clientX: 700 }));
    fireEvent(doorEl, new MockPointerEvent('pointerup', { bubbles: true, clientX: 700 }));

    expect(onUpdateMock).toHaveBeenCalledWith({
      doorPosition: 'right',
    });
  });
});
