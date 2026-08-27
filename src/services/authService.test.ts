import { describe, it, expect } from 'vitest';
import { authService } from './authService';

describe('AuthService Invite Token Validation', () => {
  it('rejects empty or short invite token with formatted error', async () => {
    const result = await authService.verifyInviteToken('123');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Mã liên kết không đúng định dạng');
  });

  it('rejects undefined token', async () => {
    const result = await authService.verifyInviteToken('');
    expect(result.isValid).toBe(false);
  });
});
