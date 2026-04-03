"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

export function CursorGlowCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--glow-x", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--glow-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden cursor-glow ${className}`}
    >
      {children}
    </div>
  );
}
