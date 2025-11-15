
import React, { useRef, useEffect } from 'react';

interface ParticlesProps {
    isOn: boolean;
}

export const Particles: React.FC<ParticlesProps> = ({ isOn }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let motes: any[] = [];
    let animationFrameId: number;

    const reset = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      motes = Array.from({ length: 60 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        s: Math.random() * 0.3 + 0.05,
        a: Math.random() * Math.PI * 2,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.a += 0.002;
        m.x += Math.cos(m.a) * m.s;
        m.y += Math.sin(m.a) * m.s * 0.6 - 0.04;

        if (m.x < -10) m.x = W + 10;
        if (m.x > W + 10) m.x = -10;
        if (m.y < -10) m.y = H + 10;
        if (m.y > H + 10) m.y = -10;

        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6);
        g.addColorStop(0, 'rgba(255,222,180,.15)');
        g.addColorStop(1, 'rgba(120,82,44,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    reset();
    tick();

    window.addEventListener('resize', reset);

    return () => {
      window.removeEventListener('resize', reset);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
        ref={canvasRef} 
        aria-hidden="true" 
        className={`fixed inset-0 -z-10 transition-opacity duration-1000 ${isOn ? 'opacity-25' : 'opacity-0'}`} 
    />
  );
};
