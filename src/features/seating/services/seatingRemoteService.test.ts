import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seatingRemoteService } from './seatingRemoteService';
import { supabase } from '../../../services/supabaseClient';

vi.mock('../../../services/supabaseClient', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
  };

  return {
    supabase: {
      channel: vi.fn().mockReturnValue(mockChannel),
    },
  };
});

describe('seatingRemoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('getOrCreateSession', () => {
    it('tạo session mới với sessionId, pin 4 số và thời gian hợp lệ', () => {
      const classId = 'test-class-123';
      const session = seatingRemoteService.getOrCreateSession(classId);

      expect(session.classId).toBe(classId);
      expect(session.sessionId).toHaveLength(6);
      expect(session.pin).toMatch(/^\d{4}$/);
      expect(session.createdAt).toBeGreaterThan(0);
    });

    it('tái sử dụng session đã lưu nếu còn trong thời hạn 12 giờ', () => {
      const classId = 'test-class-reuse';
      const initialSession = seatingRemoteService.getOrCreateSession(classId);
      const secondCallSession = seatingRemoteService.getOrCreateSession(classId);

      expect(secondCallSession.sessionId).toBe(initialSession.sessionId);
      expect(secondCallSession.pin).toBe(initialSession.pin);
    });
  });

  describe('initHostChannel & initClientChannel', () => {
    it('khởi tạo host channel với đúng tên kênh classroom_remote_{classId}_{sessionId}', () => {
      const classId = 'class-abc';
      const sessionId = 'SES123';
      const pin = '4567';

      const channel = seatingRemoteService.initHostChannel(classId, sessionId, pin, {});

      expect(supabase.channel).toHaveBeenCalledWith(`classroom_remote_${classId}_${sessionId}`, expect.any(Object));
      expect(channel.on).toHaveBeenCalled();
      expect(channel.subscribe).toHaveBeenCalled();
    });

    it('khởi tạo client channel và đăng ký các sự kiện broadcast', () => {
      const classId = 'class-xyz';
      const sessionId = 'SES789';
      const pin = '9999';

      const channel = seatingRemoteService.initClientChannel(classId, sessionId, pin, {});

      expect(supabase.channel).toHaveBeenCalledWith(`classroom_remote_${classId}_${sessionId}`, expect.any(Object));
      expect(channel.on).toHaveBeenCalled();
      expect(channel.subscribe).toHaveBeenCalled();
    });
  });

  describe('Broadcast & Message methods', () => {
    it('broadcastSpinResult gửi sự kiện SPIN_RESULT với thông tin người chiến thắng', () => {
      const mockChannel = { send: vi.fn() } as any;
      const winnerPayload = {
        student: { id: 'st-1', fullName: 'Nguyễn Văn A', gender: 'Nam' },
        isPair: false,
      };

      seatingRemoteService.broadcastSpinResult(mockChannel, winnerPayload);

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'SPIN_RESULT',
        payload: winnerPayload,
      });
    });

    it('broadcastSpinStarted gửi sự kiện SPIN_STARTED kèm mode', () => {
      const mockChannel = { send: vi.fn() } as any;
      seatingRemoteService.broadcastSpinStarted(mockChannel, 'group4');

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'SPIN_STARTED',
        payload: expect.objectContaining({ mode: 'group4' }),
      });
    });

    it('broadcastTimerUpdate gửi trạng thái đồng hồ đếm ngược', () => {
      const mockChannel = { send: vi.fn() } as any;
      const timerState = { remainingSeconds: 150, isRunning: true, totalSeconds: 300 };

      seatingRemoteService.broadcastTimerUpdate(mockChannel, timerState);

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'TIMER_UPDATE',
        payload: timerState,
      });
    });

    it('sendTriggerSpin gửi lệnh quay với mã PIN xác thực', () => {
      const mockChannel = { send: vi.fn() } as any;
      seatingRemoteService.sendTriggerSpin(mockChannel, '1234', 'battle');

      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: 'TRIGGER_SPIN',
        payload: { pin: '1234', mode: 'battle', timestamp: expect.any(Number) },
      });
    });
  });

  describe('triggerHaptic', () => {
    it('gọi navigator.vibrate khi trình duyệt hỗ trợ', () => {
      const vibrateMock = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: vibrateMock,
        configurable: true,
        writable: true,
      });

      seatingRemoteService.triggerHaptic(50);
      expect(vibrateMock).toHaveBeenCalledWith(50);
    });
  });
});
