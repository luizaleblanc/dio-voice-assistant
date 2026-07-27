"use client";

import { useEffect, useRef } from "react";

type BrandKnotProps = {
  size?: number;
  className?: string;
};

type Ring = {
  lobes: number;
  amplitude: number;
  radius: number;
  speed: number;
  phase: number;
  width: number;
  alpha: number;
};

const RINGS: Ring[] = [
  { lobes: 3, amplitude: 0.24, radius: 0.62, speed: 0.55, phase: 0, width: 2.2, alpha: 0.95 },
  { lobes: 4, amplitude: 0.17, radius: 0.74, speed: -0.4, phase: 1.3, width: 1.6, alpha: 0.55 },
  { lobes: 5, amplitude: 0.12, radius: 0.48, speed: 0.5, phase: 2.6, width: 1.2, alpha: 0.4 },
];

export function BrandKnot({ size = 240, className = "" }: BrandKnotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let frame = 0;
    const cx = size / 2;
    const cy = size / 2;
    const steps = 180;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      for (const ring of RINGS) {
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const wobble = 1 + ring.amplitude * Math.sin(ring.lobes * theta + ring.phase + frame * 0.008 * ring.speed);
          const r = (size * ring.radius * wobble) / 2;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r * 0.88;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(125, 211, 252, ${ring.alpha})`;
        ctx.lineWidth = ring.width;
        ctx.shadowColor = "rgba(34, 211, 238, 0.9)";
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [size]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
