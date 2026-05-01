"use client";

import { useId } from "react";

export interface BlobBgProps {
  colors?: string[];
  colorBack?: string;
  blendMode?: "hard-light" | "soft-light" | "screen" | "overlay" | "lighten" | "multiply" | "normal";
  speed?: number;
  size?: string;
  blur?: number;
  className?: string;
}

const PRESETS = {
  blue: ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"],
};

/**
 * CSS-only анимированный background — 5 blobs двигаются по keyframes,
 * проходят через SVG GaussianBlur + mix-blend-mode. Никакого WebGL,
 * никакого RAF, только GPU compositor.
 *
 * Базовый паттерн взят с 21st.dev «Background Gradient Animation»
 * и адаптирован под Brand Blue без интерактивности.
 */
export function BlobBg({
  colors = PRESETS.blue,
  colorBack = "transparent",
  blendMode = "hard-light",
  speed = 1,
  size = "55%",
  blur = 32,
  className,
}: BlobBgProps) {
  const filterId = useId();
  const animationDuration = 18 / speed;

  return (
    <div
      className={className}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: colorBack,
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: `url(#${filterId}) blur(40px)`,
        }}
      >
        {colors.slice(0, 5).map((color, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `calc(50% - (${size}) / 2)`,
              left: `calc(50% - (${size}) / 2)`,
              width: size,
              height: size,
              background: `radial-gradient(circle at center, ${color} 0%, ${color}00 50%)`,
              mixBlendMode: blendMode,
              opacity: 0.85 - i * 0.1,
              animation: `blob${i} ${animationDuration + i * 3}s ease-in-out infinite`,
              transformOrigin: i % 2 === 0 ? "center center" : "calc(50% - 12vw) center",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes blob0 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15%, -10%) scale(1.05); }
          66% { transform: translate(-12%, 12%) scale(0.95); }
        }
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-18%, 14%) rotate(120deg); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20%, -15%) rotate(-100deg); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, -16%) scale(1.1); }
        }
        @keyframes blob4 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(18%, 8%); }
          66% { transform: translate(-8%, -14%); }
        }
      `}</style>
    </div>
  );
}
