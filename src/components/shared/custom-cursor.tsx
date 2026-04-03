"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/theme-provider";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<"default" | "link" | "cta" | "card">("default");
  const [visible, setVisible] = useState(false);
  const mouse = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const { theme } = useTheme();

  // Theme-aware colors
  const dotColor = theme === "dark" ? "#e2e8f0" : "#0f172a";
  const ringColor = theme === "dark" ? "rgba(226,232,240,0.6)" : "rgba(15,23,42,0.5)";
  const ctaColor = theme === "dark" ? "#3b82f6" : "#1d4ed8";
  const ctaRingColor = theme === "dark" ? "rgba(59,130,246,0.5)" : "rgba(29,78,216,0.4)";

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target.closest?.("[data-cursor], a, button, .fc-button-primary, .fc-button-secondary, .fc-feature-card, .cursor-glow");
      if (!el) { setVariant("default"); return; }

      if (el.classList.contains("fc-button-primary") || el.classList.contains("fc-button-secondary") || el.getAttribute("data-cursor") === "cta") {
        setVariant("cta");
      } else if (el.classList.contains("fc-feature-card") || el.classList.contains("cursor-glow") || el.getAttribute("data-cursor") === "card") {
        setVariant("card");
      } else {
        setVariant("link");
      }
    };

    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related?.closest?.("a, button, .fc-button-primary, .fc-button-secondary, .fc-feature-card, .cursor-glow")) {
        setVariant("default");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.addEventListener("mouseleave", () => setVisible(false));
    document.addEventListener("mouseenter", () => setVisible(true));

    let raf: number;
    function animate() {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.15;
      pos.current.y += (mouse.current.y - pos.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [visible]);

  const ringSize = { default: 40, link: 50, cta: 70, card: 60 }[variant];
  const isCta = variant === "cta";
  const currentDot = isCta ? ctaColor : dotColor;
  const currentRing = isCta ? ctaRingColor : ringColor;

  return (
    <>
      <style>{`@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) { * { cursor: none !important; } }`}</style>
      <div ref={dotRef} className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s" }}>
        <div
          className="rounded-full transition-[width,height,background-color] duration-200"
          style={{
            width: variant === "default" ? 6 : 4,
            height: variant === "default" ? 6 : 4,
            backgroundColor: currentDot,
          }}
        />
      </div>
      <div ref={ringRef} className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s" }}>
        <div
          className="rounded-full flex items-center justify-center transition-[width,height,border-color] duration-200"
          style={{
            width: ringSize,
            height: ringSize,
            border: `1px solid ${currentRing}`,
          }}
        >
          {isCta && <span style={{ color: currentDot, fontSize: "14px" }}>→</span>}
        </div>
      </div>
    </>
  );
}
