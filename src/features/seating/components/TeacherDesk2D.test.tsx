import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeacherDesk2D } from './TeacherDesk2D';

describe('TeacherDesk2D Component', () => {
  it('hiển thị Bàn Giáo Viên ở vị trí bên phải mặc định', () => {
    render(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={vi.fn()}
      />
    );

    expect(screen.getByText('Bàn Giáo Viên')).toBeInTheDocument();
    expect(screen.getByText('(Bên Phải)')).toBeInTheDocument();
  });

  it('bấm nút mũi tên ◀ di chuyển từ Bên Phải sang Ở Giữa', () => {
    const onUpdateMock = vi.fn();
    render(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const leftBtn = screen.getByLabelText('Di chuyển Bàn Giáo Viên sang trái');
    fireEvent.click(leftBtn);

    expect(onUpdateMock).toHaveBeenCalledWith({
      teacherDeskPosition: 'center',
    });
  });

  it('bấm nút mũi tên ◀ di chuyển từ Ở Giữa sang Bên Trái', () => {
    const onUpdateMock = vi.fn();
    render(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'center',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const leftBtn = screen.getByLabelText('Di chuyển Bàn Giáo Viên sang trái');
    fireEvent.click(leftBtn);

    expect(onUpdateMock).toHaveBeenCalledWith({
      teacherDeskPosition: 'left',
    });
  });

  it('nút mũi tên ◀ bị vô hiệu hóa khi Bàn Giáo Viên đã ở ngoài cùng Bên Trái', () => {
    render(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'left',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={vi.fn()}
      />
    );

    const leftBtn = screen.getByLabelText('Di chuyển Bàn Giáo Viên sang trái');
    expect(leftBtn).toBeDisabled();
  });

  it('bấm nút mũi tên ▶ di chuyển từ Bên Trái sang Ở Giữa và từ Ở Giữa sang Bên Phải', () => {
    const onUpdateMock = vi.fn();
    const { rerender } = render(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'left',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const rightBtn = screen.getByLabelText('Di chuyển Bàn Giáo Viên sang phải');
    fireEvent.click(rightBtn);
    expect(onUpdateMock).toHaveBeenCalledWith({
      teacherDeskPosition: 'center',
    });

    rerender(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'center',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    fireEvent.click(screen.getByLabelText('Di chuyển Bàn Giáo Viên sang phải'));
    expect(onUpdateMock).toHaveBeenCalledWith({
      teacherDeskPosition: 'right',
    });
  });

  it('đã loại bỏ thanh điều khiển vị trí 3 nút bấm phía dưới và hỗ trợ phím mũi tên', () => {
    const onUpdateMock = vi.fn();
    render(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    // Thanh điều khiển cũ đã bị loại bỏ
    expect(screen.queryByLabelText('Chọn vị trí Bên Trái')).not.toBeInTheDocument();
    expect(screen.queryByText(/Vị trí bàn:/i)).not.toBeInTheDocument();

    // Hỗ trợ phím mũi tên ArrowLeft
    const deskEl = screen.getByRole('region', { name: /Bàn Giáo Viên/i });
    fireEvent.keyDown(deskEl, { key: 'ArrowLeft' });
    expect(onUpdateMock).toHaveBeenCalledWith({
      teacherDeskPosition: 'center',
    });
  });

  it('hỗ trợ kéo thả (pointer events) Bàn Giáo Viên sang vị trí khác', () => {
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
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'left',
          doorPosition: 'right',
          doorAngle: 90,
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const deskEl = screen.getByRole('region', { name: /Bàn Giáo Viên/i });
    deskEl.setPointerCapture = vi.fn();
    deskEl.releasePointerCapture = vi.fn();

    // Kéo Bàn Giáo Viên từ trái (clientX: 100) sang giữa (clientX: 500)
    fireEvent(deskEl, new MockPointerEvent('pointerdown', { bubbles: true, clientX: 100, button: 0 }));
    fireEvent(deskEl, new MockPointerEvent('pointermove', { bubbles: true, clientX: 500 }));
    fireEvent(deskEl, new MockPointerEvent('pointerup', { bubbles: true, clientX: 500 }));

    expect(onUpdateMock).toHaveBeenCalledWith({
      teacherDeskPosition: 'center',
    });
  });

  it('nhấp đúp chuột để sửa nhanh tên Bàn Giáo Viên và lưu lại khi nhấn Enter', () => {
    const onUpdateMock = vi.fn();
    render(
      <TeacherDesk2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 180,
          teacherDeskLabel: 'Bàn Giáo Viên',
        }}
        onUpdateElementsConfig={onUpdateMock}
      />
    );

    const labelText = screen.getByText('Bàn Giáo Viên');
    // Nhấp đúp chuột (Double click)
    fireEvent.doubleClick(labelText);

    const input = screen.getByLabelText('Nhập tên Bàn Giáo Viên');
    expect(input).toBeInTheDocument();

    // Nhập tên mới và nhấn Enter
    fireEvent.change(input, { target: { value: 'Bàn Giáo Viên 6A6' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onUpdateMock).toHaveBeenCalledWith({
      teacherDeskLabel: 'Bàn Giáo Viên 6A6',
    });
  });
});
