import { useState, useEffect, useCallback } from 'react';
import { sandboxService } from '../services/sandboxService';
import { cloudTestService } from '../services/cloudTestService';
import type { SandboxStats, CloudTestStats, AppDataMode } from '../types/sandboxTypes';

export function useSandbox() {
  const [isSandbox, setIsSandbox] = useState<boolean>(() => sandboxService.isSandboxActive());
  const [stats, setStats] = useState<SandboxStats>(() => sandboxService.getStats());

  const [isCloudTest, setIsCloudTest] = useState<boolean>(() => cloudTestService.isCloudTestActive());
  const [cloudStats, setCloudStats] = useState<CloudTestStats>({
    totalStudents: 0,
    totalGroups: 0,
    totalPointTransactions: 0,
    totalAttendanceSessions: 0,
    isLoading: false,
    error: null,
    lastCheckedAt: null,
  });

  const refreshCloudStats = useCallback(async () => {
    setCloudStats((prev) => ({ ...prev, isLoading: true }));
    const result = await cloudTestService.getCloudTestStats();
    setCloudStats(result);
  }, []);

  const refreshState = useCallback(() => {
    setIsSandbox(sandboxService.isSandboxActive());
    setStats(sandboxService.getStats());
    setIsCloudTest(cloudTestService.isCloudTestActive());
  }, []);

  useEffect(() => {
    const handleSandboxChange = () => {
      refreshState();
    };
    const handleCloudTestChange = () => {
      refreshState();
      refreshCloudStats();
    };

    window.addEventListener('gvcn:sandbox_change', handleSandboxChange);
    window.addEventListener('gvcn:cloud_test_change', handleCloudTestChange);

    return () => {
      window.removeEventListener('gvcn:sandbox_change', handleSandboxChange);
      window.removeEventListener('gvcn:cloud_test_change', handleCloudTestChange);
    };
  }, [refreshState, refreshCloudStats]);

  // Tự động tải thống kê Cloud Test khi mount hoặc khi ở chế độ Cloud Test
  useEffect(() => {
    if (isCloudTest) {
      refreshCloudStats();
    }
  }, [isCloudTest, refreshCloudStats]);

  // --- HÀM CHO OFFLINE SANDBOX ---
  const enableSandbox = useCallback((forceReset = false) => {
    if (cloudTestService.isCloudTestActive()) {
      cloudTestService.disableCloudTest();
    }
    sandboxService.enableSandbox(forceReset);
    refreshState();
  }, [refreshState]);

  const disableSandbox = useCallback(() => {
    sandboxService.disableSandbox();
    refreshState();
  }, [refreshState]);

  const toggleSandbox = useCallback(() => {
    if (sandboxService.isSandboxActive()) {
      disableSandbox();
    } else {
      enableSandbox();
    }
  }, [disableSandbox, enableSandbox]);

  const resetSandbox = useCallback(() => {
    sandboxService.resetSandbox();
    refreshState();
  }, [refreshState]);

  const clearSandbox = useCallback(() => {
    sandboxService.clearSandbox();
    refreshState();
  }, [refreshState]);

  // --- HÀM CHO CLOUD TEST (SUPABASE DEMO CLASS) ---
  const enableCloudTest = useCallback(async () => {
    if (sandboxService.isSandboxActive()) {
      sandboxService.disableSandbox();
    }
    await cloudTestService.enableCloudTest();
    refreshState();
    await refreshCloudStats();
  }, [refreshState, refreshCloudStats]);

  const disableCloudTest = useCallback(() => {
    cloudTestService.disableCloudTest();
    refreshState();
  }, [refreshState]);

  const resetCloudTest = useCallback(async () => {
    setCloudStats((prev) => ({ ...prev, isLoading: true }));
    const res = await cloudTestService.resetCloudTestData();
    await refreshCloudStats();
    return res;
  }, [refreshCloudStats]);

  const clearCloudTest = useCallback(async () => {
    setCloudStats((prev) => ({ ...prev, isLoading: true }));
    const res = await cloudTestService.clearCloudTestData();
    await refreshCloudStats();
    return res;
  }, [refreshCloudStats]);

  const currentMode: AppDataMode = isCloudTest
    ? 'cloud_test'
    : isSandbox
      ? 'offline_sandbox'
      : 'production';

  return {
    // Mode chung
    currentMode,
    isAnyTestActive: isSandbox || isCloudTest,

    // Offline Sandbox
    isSandbox,
    stats,
    enableSandbox,
    disableSandbox,
    toggleSandbox,
    resetSandbox,
    clearSandbox,

    // Cloud Test (Supabase)
    isCloudTest,
    cloudStats,
    enableCloudTest,
    disableCloudTest,
    resetCloudTest,
    clearCloudTest,
    refreshCloudStats,

    refreshState,
  };
}
