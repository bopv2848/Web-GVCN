import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
  icon?: string;
}

const FIREWORK_COLORS = [
  '#10b981', // emerald
  '#34d399', // light emerald
  '#f59e0b', // amber
  '#fbbf24', // warm gold
  '#06b6d4', // cyan
  '#38bdf8', // sky
  '#f43f5e', // rose
  '#a855f7', // purple-violet accent
  '#ffffff', // bright white
];

const GLITTER_ICONS = ['✨', '🌟', '💥', '⭐', '💫', '🎉'];

export const Desk3DFireworks: React.FC = () => {
  const [isActive, setIsActive] = useState(true);

  // Tạo các hạt pháo hoa 3D cho 3 loạt bắn liên tiếp (Trái - Giữa - Phải)
  const bursts = React.useMemo(() => {
    return [
      { id: 'burst-center', xOffset: 0, height: 160, delayMs: 0 },
      { id: 'burst-left', xOffset: -60, height: 140, delayMs: 220 },
      { id: 'burst-right', xOffset: 60, height: 150, delayMs: 420 },
    ].map((b) => {
      const particles: Particle[] = Array.from({ length: 18 }, (_, i) => {
        const angle = (i * 360) / 18;
        const distance = 45 + Math.random() * 50;
        const color = FIREWORK_COLORS[i % FIREWORK_COLORS.length];
        const size = 5 + Math.random() * 5;
        const isIcon = i % 3 === 0;
        return {
          id: i,
          angle,
          distance,
          color,
          size,
          delay: Math.random() * 0.08,
          icon: isIcon ? GLITTER_ICONS[i % GLITTER_ICONS.length] : undefined,
        };
      });
      return { ...b, particles };
    });
  }, []);

  // Tự động kết thúc hiệu ứng sau 4.5 giây để tối ưu GPU
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  if (!isActive) return null;

  return (
    <div
      className="absolute inset-x-0 bottom-full pointer-events-none z-50 flex justify-center overflow-visible select-none"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      aria-hidden="true"
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute bottom-0"
          style={{
            transform: `translateX(${burst.xOffset}px)`,
            animation: `fireworkLaunch 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) ${burst.delayMs}ms forwards`,
          }}
        >
          {/* Vệt pháo sáng phóng vút từ mặt bàn lên cao */}
          <div
            className="w-1.5 rounded-full bg-gradient-to-t from-transparent via-amber-300 to-white shadow-[0_0_12px_#34d399]"
            style={{
              height: `${burst.height}px`,
              animation: `fireworkRocket 0.6s ease-out ${burst.delayMs}ms forwards`,
            }}
          />

          {/* Điểm nổ bùng chùm tia sáng 3D ở đỉnh quỹ đạo */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              animation: `fireworkBurstFade 1.6s ease-out ${burst.delayMs + 500}ms forwards`,
              opacity: 0,
            }}
          >
            {/* Vòng hào quang chớp sáng tức thì tại tâm vụ nổ */}
            <div
              className="absolute -inset-8 rounded-full bg-radial from-white/90 via-emerald-400/40 to-transparent blur-xs"
              style={{
                animation: `fireworkFlash 0.4s ease-out ${burst.delayMs + 500}ms forwards`,
              }}
            />

            {/* Các tia sáng và hạt ánh sao nở bung tròn theo không gian 3 chiều */}
            {burst.particles.map((p) => {
              return (
                <div
                  key={p.id}
                  className="absolute left-0 top-0 flex items-center justify-center"
                  style={{
                    animation: `particleSpread-${burst.id}-${p.id} 1.4s cubic-bezier(0.1, 0.9, 0.2, 1) ${burst.delayMs + 550 + p.delay * 1000}ms forwards`,
                    opacity: 0,
                  }}
                >
                  {p.icon ? (
                    <span
                      className="text-xs filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                      style={{ color: p.color }}
                    >
                      {p.icon}
                    </span>
                  ) : (
                    <div
                      className="rounded-full shadow-lg"
                      style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        boxShadow: `0 0 10px ${p.color}, 0 0 18px ${p.color}`,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Style động cho các quỹ đạo nổ tia sáng 3D */}
      <style>{`
        @keyframes fireworkLaunch {
          0% { transform: translate3d(var(--x, 0), 20px, 0); opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes fireworkRocket {
          0% { height: 0; opacity: 1; transform: translateY(0); }
          60% { height: 120px; opacity: 1; }
          100% { height: 160px; opacity: 0; transform: translateY(-160px); }
        }
        @keyframes fireworkBurstFade {
          0% { opacity: 1; transform: translate3d(-50%, -160px, 40px) scale(0.6); }
          15% { opacity: 1; transform: translate3d(-50%, -160px, 40px) scale(1.2); }
          100% { opacity: 0; transform: translate3d(-50%, -130px, 60px) scale(1.5); }
        }
        @keyframes fireworkFlash {
          0% { transform: scale(0.2); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        ${bursts
          .map((b) =>
            b.particles
              .map(
                (p) => {
                  const rad = (p.angle * Math.PI) / 180;
                  const tx = Math.cos(rad) * p.distance;
                  const ty = Math.sin(rad) * p.distance + 20;
                  return `
                    @keyframes particleSpread-${b.id}-${p.id} {
                      0% { transform: translate3d(0, 0, 0) scale(1.4); opacity: 1; }
                      70% { opacity: 0.9; }
                      100% { transform: translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 30px) scale(0.2); opacity: 0; }
                    }
                  `;
                }
              )
              .join('\n')
          )
          .join('\n')}
      `}</style>
    </div>
  );
};
