import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RoleBadge } from './RoleBadge';

describe('RoleBadge Component Tests', () => {
  it('hiển thị huy hiệu Lớp trưởng màu vàng đồng với icon vương miện 👑', () => {
    render(<RoleBadge role="Lớp trưởng" />);
    const badge = screen.getByTestId('role-badge-lop-truong');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Lớp Trưởng');
    expect(badge.className).toContain('bg-amber-100');
    expect(badge.className).toContain('text-amber-900');
  });

  it('hiển thị huy hiệu Phó học tập màu xanh dương với icon sách 📘', () => {
    render(<RoleBadge role="Lớp phó học tập" />);
    const badge = screen.getByTestId('role-badge-pho-hoc-tap');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Phó Học Tập');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-900');
  });

  it('hiển thị huy hiệu Tổ trưởng màu xanh lục với icon cờ 🚩', () => {
    render(<RoleBadge role="Tổ trưởng tổ 1" />);
    const badge = screen.getByTestId('role-badge-to-truong');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Tổ trưởng tổ 1');
    expect(badge.className).toContain('bg-emerald-100');
    expect(badge.className).toContain('text-emerald-900');
  });

  it('hiển thị huy hiệu Tổ phó màu xanh ngọc với icon mầm cây 🌱', () => {
    render(<RoleBadge role="Tổ phó tổ 2" />);
    const badge = screen.getByTestId('role-badge-to-pho');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Tổ phó tổ 2');
    expect(badge.className).toContain('bg-teal-100');
    expect(badge.className).toContain('text-teal-900');
  });

  it('hiển thị huy hiệu trung tính cho Thành viên bình thường', () => {
    render(<RoleBadge role="Thành viên" />);
    const badge = screen.getByTestId('role-badge-thanh-vien');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Thành viên');
    expect(badge.className).toContain('bg-slate-100');
  });

  it('gọi hàm onClick khi người dùng nhấp vào huy hiệu', () => {
    let clicked = false;
    render(<RoleBadge role="Lớp trưởng" onClick={() => { clicked = true; }} />);
    const badge = screen.getByTestId('role-badge-lop-truong');
    badge.click();
    expect(clicked).toBe(true);
  });
});
