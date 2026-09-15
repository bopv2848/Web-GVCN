import { useState, useEffect, useCallback } from 'react';
import { sandboxService } from '../services/sandboxService';
import type { SandboxStats } from '../types/sandboxTypes';

export function useSandbox() {
  const [isSandbox, setIsSandbox] = useState<boolean>(() => sandboxService.isSandboxActive());
  const [stats, setStats] = useState<SandboxStats>(() => sandboxService.getStats());

  const refreshState = useCallback(() => {
    setIsSandbox(sandboxService.isSandboxActive());
    setStats(sandboxService.getStats());
  }, []);

  useEffect(() => {
    const handleSandboxChange = () => {
      refreshState();
    };

    window.addEventListener('gvcn:sandbox_change', handleSandboxChange);
    return () => {
      window.removeEventListener('gvcn:sandbox_change', handleSandboxChange);
    };
  }, [refreshState]);

  const enableSandbox = useCallback((forceReset = false) => {
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

  return {
    isSandbox,
    stats,
    enableSandbox,
    disableSandbox,
    toggleSandbox,
    resetSandbox,
    clearSandbox,
    refreshState,
  };
}
