import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App Component Root', () => {
  it('renders app shell with header and class title', () => {
    render(<App />);
    const classHeadings = screen.getAllByText(/LỚP 12A1/i);
    expect(classHeadings.length).toBeGreaterThan(0);
    expect(screen.getByText(/CHUYẾN TÀU THANH XUÂN/i)).toBeInTheDocument();
  });
});
