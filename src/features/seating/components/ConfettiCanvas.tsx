import React, { useEffect, useRef } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', // amber
  '#10b981', // emerald
  '#38bdf8', // sky
  '#f43f5e', // rose
  '#fbbf24', // yellow
  '#fb923c', // orange
  '#6366f1', // indigo
];

export const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext ? canvas.getContext('2d') : null;
    } catch {
      return;
    }
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    // Khởi tạo 90 mảnh pháo hoa giấy tung bay
    const particles: ConfettiParticle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height * 0.8,
      width: Math.random() * 8 + 6,
      height: Math.random() * 6 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 3 + 2.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      opacity: 1,
    }));

    const startTime = Date.now();
    const duration = 5500; // Hiệu ứng kéo dài 5.5 giây

    const render = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Lắc lư nhẹ nhàng theo gió
        p.speedX += Math.sin(p.y * 0.02) * 0.05;

        // Mờ dần ở 1.5 giây cuối
        if (elapsed > duration - 1500) {
          p.opacity = Math.max(0, (duration - elapsed) / 1500);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      aria-hidden="true"
    />
  );
};
