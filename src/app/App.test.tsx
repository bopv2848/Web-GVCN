import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

describe('App Component Root', () => {
  it('renders app shell with header and class title after auth initialization', async () => {
    render(<App />);

    await waitFor(() => {
      const classHeadings = screen.getAllByText(/LỚP 12A1/i);
      expect(classHeadings.length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/CHỦ ĐIỂM THÁNG 9/i)).toBeInTheDocument();
  });
});
