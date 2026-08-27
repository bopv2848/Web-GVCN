import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with children text', () => {
    render(<Button>Bấm vào đây</Button>);
    expect(screen.getByRole('button', { name: /bấm vào đây/i })).toBeInTheDocument();
  });

  it('handles loading state properly', () => {
    render(<Button isLoading>Đang lưu</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
