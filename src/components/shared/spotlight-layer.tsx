"use client";

import { useRef, useState } from "react";

type Pos = { x: number; y: number };

export function SpotlightLayer({
  color = "rgba(37, 99, 235, 0.18)",
  size = 380,
}: {
  color?: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      aria-hidden
      className="absolute inset-0 pointer-events-auto z-[5] transition-opacity duration-300"
      style={{
        opacity,
        background: `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 70%)`,
      }}
    />
  );
}
