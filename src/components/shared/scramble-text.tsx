"use client";

import { useEffect, useState, useCallback } from "react";

const GLITCH_CHARS = "@#$%^&*+=<>?/|~0123456789АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * Text that decrypts from random characters on mount.
 * Each character resolves left-to-right with a wave effect.
 */
export function ScrambleText({
  text,
  className = "",
  delay = 0,
  duration = 2000,
}: ScrambleTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  // Start after delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  // Scramble animation
  useEffect(() => {
    if (!started) return;

    const chars = text.split("");
    const startTime = Date.now();

    // Each character has its own resolve time
    // Characters resolve in a wave from left to right
    const resolveTimings = chars.map((_, i) => {
      const base = (i / chars.length) * duration * 0.7; // spread across 70% of duration
      const jitter = Math.random() * duration * 0.3; // 30% random jitter
      return base + jitter;
    });

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed > duration + 500) {
        setDisplayed(text);
        clearInterval(interval);
        return;
      }

      const result = chars
        .map((char, i) => {
          if (char === " " || char === "\n") return char;
          if (elapsed >= resolveTimings[i]) return char;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        })
        .join("");

      setDisplayed(result);
    }, 30);

    return () => clearInterval(interval);
  }, [started, text, duration]);

  // Show glitch text immediately when started (before first interval tick)
  useEffect(() => {
    if (!started) return;
    const glitched = text
      .split("")
      .map((ch) =>
        ch === " " || ch === "\n"
          ? ch
          : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      )
      .join("");
    setDisplayed(glitched);
  }, [started, text]);

  if (!started) return <span className={className} style={{ opacity: 0 }}>{text}</span>;

  return <span className={className}>{displayed}</span>;
}
