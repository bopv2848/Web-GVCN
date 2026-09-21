/**
 * Bộ phát âm thanh thông báo thời gian thực sử dụng Web Audio API chuẩn
 * Không cần tải thêm tệp tin MP3 từ ngoài, hoạt động mượt mà và tức thì.
 */

let audioCtx: AudioContext | null = null;
let masterGainNode: GainNode | null = null;
let currentVolume = 0.8;
let isMuted = false;

// Khôi phục cấu hình âm lượng từ LocalStorage
if (typeof window !== 'undefined') {
  try {
    const savedVol = localStorage.getItem('web_gvcn_sound_volume');
    if (savedVol !== null) currentVolume = Math.max(0, Math.min(1, parseFloat(savedVol)));
    const savedMuted = localStorage.getItem('web_gvcn_sound_muted');
    if (savedMuted !== null) isMuted = savedMuted === 'true';
  } catch {
    // ignore
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {
      // Trình duyệt chặn autoplay khi chưa có tương tác
    });
  }
  return audioCtx;
}

function getMasterGain(ctx: AudioContext): GainNode {
  if (!masterGainNode || masterGainNode.context !== ctx) {
    masterGainNode = ctx.createGain();
    masterGainNode.gain.setValueAtTime(isMuted ? 0 : currentVolume, ctx.currentTime);
    masterGainNode.connect(ctx.destination);
  }
  return masterGainNode;
}

/**
 * Cập nhật mức âm lượng tổng (từ 0.0 đến 1.0)
 */
export function setMasterVolume(vol: number): void {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);
  }
  try {
    localStorage.setItem('web_gvcn_sound_volume', String(currentVolume));
  } catch {
    // ignore
  }
}

/**
 * Bật hoặc tắt âm thanh nhanh (Mute / Unmute)
 */
export function setSoundMuted(muted: boolean): void {
  isMuted = muted;
  if (masterGainNode && audioCtx) {
    masterGainNode.gain.setValueAtTime(isMuted ? 0 : currentVolume, audioCtx.currentTime);
  }
  try {
    localStorage.setItem('web_gvcn_sound_muted', String(isMuted));
  } catch {
    // ignore
  }
}

/**
 * Lấy cấu hình âm lượng hiện tại
 */
export function getSoundSettings(): { volume: number; isMuted: boolean } {
  return { volume: currentVolume, isMuted };
}

/**
 * Phát âm thanh 'Ting' nhẹ nhàng khi có điểm thi đua mới từ Ban cán sự
 */
export function playPointsChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Dùng sóng Sine cho âm trong trẻo
    osc.type = 'sine';
    // Hai nốt nhạc C6 (1046Hz) lướt lên E6 (1318Hz)
    osc.frequency.setValueAtTime(1046.5, now);
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (err) {
    // Tránh gián đoạn UI nếu thiết bị không hỗ trợ âm thanh
    console.debug('Không thể phát âm thanh:', err);
  }
}

/**
 * Phát âm thanh nhẹ khi điểm danh được cập nhật từ xa
 */
export function playAttendanceChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.debug('Không thể phát âm thanh điểm danh:', err);
  }
}

/**
 * Phát âm thanh thông báo khi giao dịch điểm bị thu hồi / hoàn tác
 */
export function playUndoChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Nốt trầm giảm dần
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(392.0, now + 0.15); // G4

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.debug('Không thể phát âm thanh thu hồi:', err);
  }
}

/**
 * Phát tiếng 'Tick' giòn giã kiểu bánh xe may mắn cơ học khi vòng quay lướt qua từng học sinh
 */
export function playTickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;

    // Bộ tạo xung gõ đanh thép (Mechanical Clicker / Woodblock)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sóng triangle kết hợp quét tần số nhanh tạo tiếng tách cơ học rõ ràng
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    // Biên độ âm thanh dứt khoát, âm lượng đủ lớn cho loa tivi phòng học
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // Không làm gián đoạn UI nếu thiết bị không bật âm thanh
  }
}

/**
 * Phát hợp âm vui mừng Fanfare & chuông ngân khải hoàn khi tìm ra người trúng thưởng
 */
export function playWinnerFanfare(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;

    // 1. Chuỗi nốt kèn đồng khải hoàn (C5, E5, G5, C6, E6)
    const fanfareNotes = [
      { freq: 523.25, time: 0, dur: 0.12 },     // C5
      { freq: 659.25, time: 0.11, dur: 0.12 },  // E5
      { freq: 783.99, time: 0.22, dur: 0.14 },  // G5
      { freq: 1046.5, time: 0.35, dur: 0.18 },  // C6
      { freq: 1318.5, time: 0.52, dur: 0.55 },  // E6 (ngân dài)
    ];

    fanfareNotes.forEach(({ freq, time, dur }) => {
      const startTime = now + time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(getMasterGain(ctx));

      osc.start(startTime);
      osc.stop(startTime + dur);
    });

    // 2. Chùm chuông ngân lấp lánh (Sparkle Chimes) ngân vang chúc mừng
    const sparkleNotes = [1567.98, 2093.0, 2637.02]; // G6, C7, E7
    sparkleNotes.forEach((freq, idx) => {
      const sparkleStart = now + 0.58 + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, sparkleStart);

      gain.gain.setValueAtTime(0.12, sparkleStart);
      gain.gain.exponentialRampToValueAtTime(0.001, sparkleStart + 0.8);

      osc.connect(gain);
      gain.connect(getMasterGain(ctx));

      osc.start(sparkleStart);
      osc.stop(sparkleStart + 0.8);
    });
  } catch {
    // Không làm gián đoạn UI
  }
}

export type TimerAlarmSoundType = 'classic' | 'school' | 'gong' | 'fun';

/**
 * Phát chuông báo hết giờ thảo luận nhóm với nhiều giai điệu tùy chỉnh
 */
export function playTimerAlarm(soundType: TimerAlarmSoundType = 'classic'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;

    if (soundType === 'school') {
      // 1. Chuông trường học điện tử (Rrrrrring! rung nhanh)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);

      // Hiệu ứng rung lặp lại (tremolo)
      for (let i = 0; i < 16; i++) {
        const t = now + i * 0.08;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.setValueAtTime(0.02, t + 0.04);
      }
      gain.gain.setValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(getMasterGain(ctx));
      osc.start(now);
      osc.stop(now + 1.4);
    } else if (soundType === 'gong') {
      // 2. Tiếng kẻng sắt trường học truyền thống (ngân vang sâu)
      const gongFreqs = [330, 440, 660, 1100];
      gongFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const vol = idx === 0 ? 0.3 : 0.15;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(getMasterGain(ctx));
        osc.start(now);
        osc.stop(now + 1.8);
      });
    } else if (soundType === 'fun') {
      // 3. Giai điệu vui nhộn (Sol-Do-Mi-Sol-Do cao)
      const funNotes = [392, 523.25, 659.25, 783.99, 1046.5];
      funNotes.forEach((freq, idx) => {
        const startTime = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(getMasterGain(ctx));
        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } else {
      // 4. Mặc định: Chuông Ding-Dong ngân vang êm ái
      const bellNotes = [
        { freq: 880, time: 0, dur: 0.6 },
        { freq: 659.25, time: 0.35, dur: 0.7 },
        { freq: 1046.5, time: 0.75, dur: 1.0 },
      ];

      bellNotes.forEach(({ freq, time, dur }) => {
        const startTime = now + time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(getMasterGain(ctx));

        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    }
  } catch {
    // ignore
  }
}

/**
 * Phát tiếng bíp đếm ngược khẩn cấp trong 5 giây cuối cùng (00:05 -> 00:01)
 */
export function playCountdownBeep(secondsLeft: number): void {
  try {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Giây 1 (chuẩn bị hết giờ) âm cao hơn để tạo độ kịch tính dứt khoát
    const freq = secondsLeft === 1 ? 1318.5 : 880 + (5 - secondsLeft) * 80;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(getMasterGain(ctx));

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Không làm gián đoạn UI
  }
}


