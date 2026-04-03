"use client";

import { useEffect, useRef } from "react";

const CODE_CHARS = "01{}[]<>=/;:$@#%&*+アイウエオカキクケコサシスセソ";
const COLUMN_WIDTH = 20;

export function CodeRain({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let columns: number[] = [];

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      canvas!.width = rect.width;
      canvas!.height = rect.height;
      const count = Math.floor(rect.width / COLUMN_WIDTH);
      columns = Array.from({ length: count }, () => Math.random() * -50);
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!ctx || !canvas) return;

      // Slower fade — trails last longer
      ctx.fillStyle = "rgba(6, 6, 18, 0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "13px 'JetBrains Mono', monospace";

      for (let i = 0; i < columns.length; i++) {
        const char = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
        const x = i * COLUMN_WIDTH;
        const y = columns[i] * 16;

        // Head — bright green/cyan
        ctx.fillStyle = `rgba(51, 200, 255, ${0.5 + Math.random() * 0.4})`;
        ctx.fillText(char, x, y);

        // Trail chars — dimmer blue
        for (let t = 1; t <= 5; t++) {
          if (columns[i] > t) {
            const trailChar = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
            const fade = 0.25 - t * 0.04;
            if (fade > 0) {
              ctx.fillStyle = `rgba(51, 129, 255, ${fade})`;
              ctx.fillText(trailChar, x, y - t * 16);
            }
          }
        }

        columns[i] += 0.3 + Math.random() * 0.4;

        if (y > canvas.height && Math.random() > 0.975) {
          columns[i] = Math.random() * -30;
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
}
