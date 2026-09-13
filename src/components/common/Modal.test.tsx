import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal Component Tests', () => {
  it('không hiển thị khi isOpen là false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Tiêu đề test">
        <p>Nội dung modal</p>
      </Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('hiển thị tiêu đề, nội dung và thanh kéo vuốt di động khi isOpen là true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Bảng Thông Báo 6A6" size="lg">
        <p>Nội dung kiểm thử</p>
      </Modal>
    );

    expect(screen.getByText('Bảng Thông Báo 6A6')).toBeInTheDocument();
    expect(screen.getByText('Nội dung kiểm thử')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-drag-handle')).toBeInTheDocument();
  });

  it('gọi hàm onClose khi người dùng nhấn nút đóng ✕', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Tiêu đề test">
        <p>Nội dung</p>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: /Đóng/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('gọi hàm onClose khi người dùng nhấp ra ngoài nền mờ (backdrop)', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Tiêu đề test">
        <p>Nội dung</p>
      </Modal>
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('hỗ trợ thao tác vuốt kéo xuống trên thanh kéo di động để đóng modal', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Bảng Trượt Bottom Sheet">
        <p>Nội dung</p>
      </Modal>
    );

    const dragHandle = screen.getByTestId('mobile-drag-handle');

    // Giả lập cử chỉ vuốt kéo xuống 90px (> 70px ngưỡng đóng)
    fireEvent.touchStart(dragHandle, {
      touches: [{ clientY: 100 }],
    });
    fireEvent.touchEnd(dragHandle, {
      changedTouches: [{ clientY: 190 }],
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
