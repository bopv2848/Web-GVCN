import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClassroomFrontElements2D } from './ClassroomFrontElements2D';

describe('ClassroomFrontElements2D Component', () => {
  it('hiển thị đầy đủ Bàn Giáo Viên, Bảng Lớp Học và Mũi tên Cửa Ra Vào', () => {
    render(
      <ClassroomFrontElements2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 180,
        }}
        onUpdateElementsConfig={vi.fn()}
        cleanClassName="6A6"
      />
    );

    expect(screen.getByText('Bàn Giáo Viên')).toBeInTheDocument();
    expect(screen.getByText(/BẢNG LỚP HỌC/i)).toBeInTheDocument();
    expect(screen.getByText('Cửa ra vào')).toBeInTheDocument();
  });

  it('đã loại bỏ nút chuyển đổi góc nhìn theo yêu cầu để giao diện gọn gàng', () => {
    render(
      <ClassroomFrontElements2D
        elementsConfig={{
          teacherDeskPosition: 'right',
          doorPosition: 'right',
          doorAngle: 180,
        }}
        onUpdateElementsConfig={vi.fn()}
        cleanClassName="6A6"
      />
    );

    expect(screen.queryByLabelText('Đổi vị trí góc nhìn bục giảng')).not.toBeInTheDocument();
    expect(screen.queryByText(/Góc nhìn: Bục giảng/i)).not.toBeInTheDocument();
  });
});
