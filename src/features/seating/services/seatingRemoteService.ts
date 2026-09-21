import { supabase } from '../../../services/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RemoteSessionInfo {
  sessionId: string;
  pin: string;
  classId: string;
  createdAt: number;
}

export interface RemoteWinnerPayload {
  student: {
    id: string;
    fullName: string;
    gender: string;
    groupName?: string;
    classRole?: string;
    avatarUrl?: string;
  };
  isPair?: boolean;
  partnerStudent?: {
    id: string;
    fullName: string;
    gender: string;
    groupName?: string;
    classRole?: string;
    avatarUrl?: string;
  };
  isGroup4?: boolean;
  groupStudents?: Array<{
    id: string;
    fullName: string;
    groupName?: string;
  }>;
  isBattle?: boolean;
  battleInfo?: {
    label: string;
    teamAName: string;
    teamBName: string;
  };
}

export interface RemoteHostCallbacks {
  onClientConnected?: (deviceInfo: { userAgent?: string; timestamp: number }) => void;
  onTriggerSpin?: (mode: 'single' | 'pair' | 'group4' | 'battle') => void;
  onTriggerTimer?: (action: 'start' | 'pause' | 'reset' | 'set_preset', durationSeconds?: number) => void;
  onAwardPoints?: (payload: { studentId?: string; points: number; reason: string; team?: 'teamA' | 'teamB' | 'both' }) => void;
  onToggleViewMode?: (mode: '2d' | '3d') => void;
  onToggleFullscreen?: () => void;
}

export interface RemoteClientCallbacks {
  onTvConnected?: (tvState: any) => void;
  onSpinStarted?: (mode: string) => void;
  onSpinResult?: (winner: RemoteWinnerPayload) => void;
  onTimerUpdate?: (timerState: { remainingSeconds: number; isRunning: boolean; totalSeconds: number }) => void;
  onPointsAwardedSuccess?: (result: { studentName: string; points: number }) => void;
}

class SeatingRemoteService {
  /**
   * Tạo hoặc lấy phiên kết nối điều khiển từ xa hiện tại
   */
  public getOrCreateSession(classId: string): RemoteSessionInfo {
    const storageKey = `web_gvcn_remote_session_${classId}`;
    try {
      const saved = sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
      if (saved) {
        const parsed: RemoteSessionInfo = JSON.parse(saved);
        // Phiên có hiệu lực trong 12 tiếng
        if (Date.now() - parsed.createdAt < 12 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const session: RemoteSessionInfo = {
      sessionId,
      pin,
      classId,
      createdAt: Date.now(),
    };

    try {
      sessionStorage.setItem(storageKey, JSON.stringify(session));
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      // ignore
    }

    return session;
  }

  /**
   * Khởi tạo kênh Broadcast trên TV (Host)
   */
  public initHostChannel(
    classId: string,
    sessionId: string,
    pin: string,
    callbacks: RemoteHostCallbacks
  ): RealtimeChannel {
    const channelName = `classroom_remote_${classId}_${sessionId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    channel
      .on('broadcast', { event: 'CLIENT_CONNECTED' }, ({ payload }) => {
        if (payload?.pin === pin) {
          callbacks.onClientConnected?.(payload);
        }
      })
      .on('broadcast', { event: 'TRIGGER_SPIN' }, ({ payload }) => {
        if (payload?.pin === pin) {
          callbacks.onTriggerSpin?.(payload.mode || 'single');
        }
      })
      .on('broadcast', { event: 'TRIGGER_TIMER' }, ({ payload }) => {
        if (payload?.pin === pin) {
          callbacks.onTriggerTimer?.(payload.action, payload.durationSeconds);
        }
      })
      .on('broadcast', { event: 'AWARD_POINTS' }, ({ payload }) => {
        if (payload?.pin === pin) {
          callbacks.onAwardPoints?.(payload);
        }
      })
      .on('broadcast', { event: 'TOGGLE_VIEW_MODE' }, ({ payload }) => {
        if (payload?.pin === pin) {
          callbacks.onToggleViewMode?.(payload.mode);
        }
      })
      .on('broadcast', { event: 'TOGGLE_FULLSCREEN' }, ({ payload }) => {
        if (payload?.pin === pin) {
          callbacks.onToggleFullscreen?.();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.debug(`[Remote Host] Đã kết nối kênh Broadcast ${channelName}`);
        }
      });

    return channel;
  }

  /**
   * TV gửi kết quả học sinh trúng thưởng về điện thoại
   */
  public broadcastSpinResult(channel: RealtimeChannel, winner: RemoteWinnerPayload): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'SPIN_RESULT',
        payload: winner,
      });
    } catch (err) {
      console.warn('[Remote Host] Không thể phát SPIN_RESULT:', err);
    }
  }

  /**
   * TV thông báo bắt đầu quay
   */
  public broadcastSpinStarted(channel: RealtimeChannel, mode: string): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'SPIN_STARTED',
        payload: { mode, timestamp: Date.now() },
      });
    } catch (err) {
      console.warn('[Remote Host] Không thể phát SPIN_STARTED:', err);
    }
  }

  /**
   * TV đồng bộ đồng hồ đếm ngược với điện thoại
   */
  public broadcastTimerUpdate(
    channel: RealtimeChannel,
    timerState: { remainingSeconds: number; isRunning: boolean; totalSeconds: number }
  ): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'TIMER_UPDATE',
        payload: timerState,
      });
    } catch (err) {
      console.warn('[Remote Host] Không thể phát TIMER_UPDATE:', err);
    }
  }

  /**
   * TV gửi xác nhận đã cộng điểm
   */
  public broadcastPointsAwarded(channel: RealtimeChannel, result: { studentName: string; points: number }): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'POINTS_AWARDED',
        payload: result,
      });
    } catch (err) {
      console.warn('[Remote Host] Không thể phát POINTS_AWARDED:', err);
    }
  }

  /**
   * Khởi tạo kênh phía Điện thoại (Client Controller)
   */
  public initClientChannel(
    classId: string,
    sessionId: string,
    pin: string,
    callbacks: RemoteClientCallbacks
  ): RealtimeChannel {
    const channelName = `classroom_remote_${classId}_${sessionId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    channel
      .on('broadcast', { event: 'SPIN_STARTED' }, ({ payload }) => {
        callbacks.onSpinStarted?.(payload?.mode || 'single');
      })
      .on('broadcast', { event: 'SPIN_RESULT' }, ({ payload }) => {
        callbacks.onSpinResult?.(payload as RemoteWinnerPayload);
      })
      .on('broadcast', { event: 'TIMER_UPDATE' }, ({ payload }) => {
        callbacks.onTimerUpdate?.(payload);
      })
      .on('broadcast', { event: 'POINTS_AWARDED' }, ({ payload }) => {
        callbacks.onPointsAwardedSuccess?.(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Báo cho TV biết điện thoại đã kết nối
          channel.send({
            type: 'broadcast',
            event: 'CLIENT_CONNECTED',
            payload: {
              pin,
              userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
              timestamp: Date.now(),
            },
          });
        }
      });

    return channel;
  }

  /**
   * Điện thoại gửi lệnh bốc thăm lên TV
   */
  public sendTriggerSpin(channel: RealtimeChannel, pin: string, mode: 'single' | 'pair' | 'group4' | 'battle'): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'TRIGGER_SPIN',
        payload: { pin, mode, timestamp: Date.now() },
      });
    } catch (err) {
      console.warn('[Remote Client] Không thể gửi TRIGGER_SPIN:', err);
    }
  }

  /**
   * Điện thoại gửi lệnh đếm ngược lên TV
   */
  public sendTriggerTimer(
    channel: RealtimeChannel,
    pin: string,
    action: 'start' | 'pause' | 'reset' | 'set_preset',
    durationSeconds?: number
  ): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'TRIGGER_TIMER',
        payload: { pin, action, durationSeconds },
      });
    } catch (err) {
      console.warn('[Remote Client] Không thể gửi TRIGGER_TIMER:', err);
    }
  }

  /**
   * Điện thoại gửi lệnh cộng điểm thi đua lên TV
   */
  public sendAwardPoints(
    channel: RealtimeChannel,
    pin: string,
    payload: { studentId?: string; points: number; reason: string; team?: 'teamA' | 'teamB' | 'both' }
  ): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'AWARD_POINTS',
        payload: { ...payload, pin },
      });
    } catch (err) {
      console.warn('[Remote Client] Không thể gửi AWARD_POINTS:', err);
    }
  }

  /**
   * Điện thoại chuyển chế độ xem 2D / 3D
   */
  public sendToggleViewMode(channel: RealtimeChannel, pin: string, mode: '2d' | '3d'): void {
    try {
      channel.send({
        type: 'broadcast',
        event: 'TOGGLE_VIEW_MODE',
        payload: { pin, mode },
      });
    } catch (err) {
      console.warn('[Remote Client] Không thể gửi TOGGLE_VIEW_MODE:', err);
    }
  }

  /**
   * Haptic vibration hỗ trợ trên điện thoại
   */
  public triggerHaptic(pattern: number | number[] = 50): void {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // ignore
    }
  }
}

export const seatingRemoteService = new SeatingRemoteService();
