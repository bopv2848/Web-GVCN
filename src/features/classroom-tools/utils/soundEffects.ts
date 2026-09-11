/**
 * Hệ thống âm thanh Web Audio API thuần túy, không phụ thuộc file âm thanh bên ngoài,
 * hoạt động ổn định ngoại tuyến trên mọi trình duyệt hiện đại.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Âm thanh "tích tắc" cơ học nhẹ nhàng khi vòng quay lướt qua từng cung tên học sinh
   */
  public playTick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Bỏ qua lỗi audio policy
    }
  }

  /**
   * Khúc nhạc reo vui mừng chiến thắng (Fanfare) khi vòng quay dừng lại tại học sinh trúng thưởng
   */
  public playWinnerFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Hợp âm Đô trưởng thăng hoa: C5, E5, G5, C6
      const notes = [
        { freq: 523.25, time: 0, dur: 0.12 },     // C5
        { freq: 659.25, time: 0.12, dur: 0.12 },  // E5
        { freq: 783.99, time: 0.24, dur: 0.15 },  // G5
        { freq: 1046.5, time: 0.39, dur: 0.45 },  // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.25, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {
      // Bỏ qua nếu audio context bị khóa
    }
  }

  /**
   * Chuông báo hết giờ làm bài tập (Tiếng chuông trường học Ding-Dong ấm áp)
   */
  public playTimerChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Hai nốt Ding - Dong kinh điển: 880Hz (A5) -> 587.33Hz (D5)
      const chimes = [
        { freq: 880, time: 0, dur: 0.8 },
        { freq: 587.33, time: 0.6, dur: 1.2 },
      ];

      chimes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.3, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {
      // Bỏ qua lỗi audio
    }
  }
}

export const soundEffects = new SoundEffects();
