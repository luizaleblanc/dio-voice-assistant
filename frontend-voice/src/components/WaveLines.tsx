"use client";

import { useEffect, useRef } from "react";

type WaveLinesProps = {
  className?: string;
  height?: number;
};

type Strand = {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  yOffset: number;
  width: number;
  alpha: number;
};

const STRANDS: Strand[] = [
  { amplitude: 0.22, frequency: 6, speed: 0.9, phase: 0, yOffset: 0, width: 2, alpha: 0.9 },
  { amplitude: 0.16, frequency: 8, speed: -0.6, phase: 1.4, yOffset: 14, width: 1.4, alpha: 0.55 },
  { amplitude: 0.12, frequency: 10, speed: 0.7, phase: 3.1, yOffset: -18, width: 1.2, alpha: 0.4 },
  { amplitude: 0.09, frequency: 13, speed: -0.5, phase: 2.0, yOffset: 26, width: 1, alpha: 0.3 },
];

export function WaveLines({ className = "", height = 260 }: WaveLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let frame = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      canvas.width = w * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.clientWidth;
      const h = height;
      ctx.clearRect(0, 0, w, h);

      const midY = h / 2;
      const step = Math.max(2, Math.floor(w / 220));

      for (const strand of STRANDS) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += step) {
          const t = x / w;
          const edgeFade = Math.sin(t * Math.PI);
          const y =
            midY +
            strand.yOffset +
            Math.sin(t * strand.frequency + frame * 0.01 * strand.speed + strand.phase) * (h * strand.amplitude) * edgeFade;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(125, 211, 252, ${strand.alpha})`;
        ctx.lineWidth = strand.width;
        ctx.shadowColor = "rgba(34, 211, 238, 0.85)";
        ctx.shadowBlur = 8;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [height]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none ${className}`}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
