import { useEffect, useRef, useCallback } from 'react';

interface AnalogClockProps {
  taskName?: string;
  taskTime?: string;
  isLightTheme: boolean;
}

export function AnalogClock({ taskName, taskTime, isLightTheme }: AnalogClockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const sizeRef = useRef(300);
  const dprRef = useRef(1);

  const calculateSize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isLandscape = vw > vh;
    const maxSize = Math.min(
      isLandscape ? vh * 0.8 : vw * 0.82,
      isLandscape ? vw * 0.52 : vh * 0.56,
      480
    );
    return Math.floor(maxSize);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    dprRef.current = window.devicePixelRatio || 1;
    sizeRef.current = calculateSize();

    canvas.style.width = `${sizeRef.current}px`;
    canvas.style.height = `${sizeRef.current}px`;
    canvas.width = sizeRef.current * dprRef.current;
    canvas.height = sizeRef.current * dprRef.current;
  }, [calculateSize]);

  const drawClock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    const secAngle = ((s + ms / 1000) / 60) * Math.PI * 2 - Math.PI / 2;
    const minAngle = ((m + (s + ms / 1000) / 60) / 60) * Math.PI * 2 - Math.PI / 2;
    const hourAngle = ((h + (m + s / 60) / 60) / 12) * Math.PI * 2 - Math.PI / 2;

    const size = sizeRef.current;
    const dpr = dprRef.current;
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.44;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    // Face gradient
    const gradient = ctx.createRadialGradient(cx - R * 0.15, cy - R * 0.15, 0, cx, cy, R);
    gradient.addColorStop(0, isLightTheme ? '#e8e8ed' : '#1c1c1e');
    gradient.addColorStop(1, isLightTheme ? '#ffffff' : '#080808');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Border
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = isLightTheme ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.11)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Minute markers
    for (let i = 0; i < 60; i++) {
      const ang = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const major = i % 5 === 0;
      const outer = R * 0.92;
      const inner = outer - (major ? R * 0.11 : R * 0.05);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -outer);
      ctx.lineTo(0, -inner);
      ctx.strokeStyle = major
        ? (isLightTheme ? 'rgba(0,0,0,0.76)' : 'rgba(255,255,255,0.86)')
        : (isLightTheme ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.24)');
      ctx.lineWidth = major ? 2.4 : 1;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // Numbers
    ctx.font = `300 ${Math.round(R * 0.155)}px -apple-system, Helvetica Neue, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isLightTheme ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.78)';

    [12, 3, 6, 9].forEach(n => {
      const angle = (n / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.fillText(String(n), cx + Math.cos(angle) * R * 0.7, cy + Math.sin(angle) * R * 0.7);
    });

    const shadowColor = isLightTheme ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.60)';

    const drawHand = (angle: number, length: number, width: number, color: string) => {
      ctx.save();
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.translate(cx, cy);
      ctx.rotate(angle + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, length * 0.16);
      ctx.lineTo(0, -length);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    };

    // Hour hand
    drawHand(hourAngle, R * 0.5, R * 0.055, isLightTheme ? '#1c1c1e' : '#ffffff');
    // Minute hand
    drawHand(minAngle, R * 0.7, R * 0.038, isLightTheme ? '#1c1c1e' : '#ffffff');

    // Second hand
    ctx.save();
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 6;
    ctx.translate(cx, cy);
    ctx.rotate(secAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, R * 0.22);
    ctx.lineTo(0, -R * 0.74);
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = R * 0.018;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Second hand circle
    ctx.beginPath();
    ctx.arc(0, R * 0.16, R * 0.044, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3b30';
    ctx.fill();
    ctx.restore();

    // Center circles
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.062, 0, Math.PI * 2);
    ctx.fillStyle = isLightTheme ? '#c8c8cc' : '#2c2c30';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.024, 0, Math.PI * 2);
    ctx.fillStyle = '#b0b0b8';
    ctx.fill();

    animationRef.current = requestAnimationFrame(drawClock);
  }, [isLightTheme]);

  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(drawClock);

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas, drawClock]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 0 40px rgba(255,255,255,0.03)'
        }}
      />
      {taskName && taskTime && (
        <div className="absolute top-8 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none z-50">
          <span className="text-lg md:text-2xl font-bold text-amber-300 text-center max-w-[88vw] truncate"
            style={{ textShadow: '0 0 14px rgba(255, 190, 0, 0.8)' }}>
            {taskName}
          </span>
          <span className="text-base md:text-xl font-semibold text-amber-400/80">{taskTime}</span>
        </div>
      )}
    </div>
  );
}
