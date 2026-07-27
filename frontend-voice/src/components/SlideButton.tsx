"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SlideButtonProps = {
  label: string;
  errorLabel?: string;
  href: string;
  className?: string;
  onBeforeNavigate?: () => Promise<unknown> | unknown;
};

const THUMB_SIZE = 44;
const TRACK_PADDING = 6;
const COMPLETE_THRESHOLD = 0.85;

export function SlideButton({
  label,
  errorLabel = "Algo deu errado. Tente de novo.",
  href,
  className = "",
  onBeforeNavigate,
}: SlideButtonProps) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

  const [maxX, setMaxX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const newMax = Math.max(0, track.clientWidth - THUMB_SIZE - TRACK_PADDING * 2);
      setMaxX(newMax);
      setDragX((prev) => Math.min(prev, newMax));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const complete = useCallback(() => {
    setDragX(maxX);
    setCompleted(true);
    setFailed(false);
    setTimeout(async () => {
      try {
        await onBeforeNavigate?.();
        router.push(href);
      } catch {
        setCompleted(false);
        setDragX(0);
        setFailed(true);
      }
    }, 260);
  }, [maxX, href, router, onBeforeNavigate]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (completed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setFailed(false);
    startXRef.current = e.clientX - dragX;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || completed) return;
    const next = Math.min(Math.max(0, e.clientX - startXRef.current), maxX);
    setDragX(next);
  };

  const onPointerUp = () => {
    if (completed) return;
    setDragging(false);
    if (maxX > 0 && dragX / maxX >= COMPLETE_THRESHOLD) {
      complete();
    } else {
      setDragX(0);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (completed) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
      e.preventDefault();
      complete();
    }
  };

  const progress = maxX > 0 ? Math.min(1, dragX / maxX) : 0;
  const labelOpacity = failed ? 1 : 1 - progress;
  const labelText = failed ? errorLabel : label;

  return (
    <div
      ref={trackRef}
      className={`relative flex h-14 w-full items-center overflow-hidden rounded-full bg-white p-1.5 select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-base font-semibold text-black transition-opacity duration-200"
        style={{ opacity: labelOpacity }}
      >
        {labelText}
      </span>

      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative z-10 flex h-11 w-11 shrink-0 cursor-grab items-center justify-center rounded-full bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:cursor-grabbing"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 280ms ease",
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
