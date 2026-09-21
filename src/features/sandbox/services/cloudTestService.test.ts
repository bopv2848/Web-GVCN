import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cloudTestService } from './cloudTestService';
import { sandboxService } from './sandboxService';
import { CLOUD_TEST_CLASS_ID, CLOUD_TEST_CLASS_INFO } from '../constants/cloudTestConstants';

describe('cloudTestService (Môi trường Test Supabase cách ly)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('1. Mặc định Chế độ Cloud Test chưa kích hoạt', () => {
    expect(cloudTestService.isCloudTestActive()).toBe(false);
  });

  it('2. Kích hoạt Cloud Test sẽ lưu cờ và tự động tắt Sandbox máy tính', () => {
    // Bật sandbox máy tính trước
    sandboxService.enableSandbox();
    expect(sandboxService.isSandboxActive()).toBe(true);

    // Kích hoạt Cloud Test
    cloudTestService.enableCloudTest();
    expect(cloudTestService.isCloudTestActive()).toBe(true);
    // Sandbox máy tính phải tự động tắt để không gây xung đột
    expect(sandboxService.isSandboxActive()).toBe(false);
  });

  it('3. Tắt Cloud Test sẽ chuyển cờ về false', () => {
    cloudTestService.enableCloudTest();
    expect(cloudTestService.isCloudTestActive()).toBe(true);

    cloudTestService.disableCloudTest();
    expect(cloudTestService.isCloudTestActive()).toBe(false);
  });

  it('4. Hằng số ID và Thông tin Lớp Thử Nghiệm cách ly chính xác', () => {
    expect(CLOUD_TEST_CLASS_ID).toBe('77777777-7777-7777-7777-777777777777');
    expect(CLOUD_TEST_CLASS_INFO.id).toBe(CLOUD_TEST_CLASS_ID);
    expect(CLOUD_TEST_CLASS_INFO.isDemo).toBe(true);
    expect(CLOUD_TEST_CLASS_INFO.name).toContain('[THỬ NGHIỆM]');
  });
});
