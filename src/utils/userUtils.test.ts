import { describe, it, expect } from 'vitest';
import { getUserInitial } from './userUtils';

describe('getUserInitial Unit Tests', () => {
  it('trả về B cho Thầy Phan Văn Bộ', () => {
    expect(getUserInitial('Thầy Phan Văn Bộ')).toBe('B');
  });

  it('trả về B cho Phan Văn Bộ', () => {
    expect(getUserInitial('Phan Văn Bộ')).toBe('B');
  });

  it('trả về A cho Nguyễn Văn An', () => {
    expect(getUserInitial('Nguyễn Văn An')).toBe('A');
  });

  it('trả về B khi không truyền tên hoặc chuỗi rỗng', () => {
    expect(getUserInitial('')).toBe('B');
    expect(getUserInitial(undefined)).toBe('B');
  });
});
