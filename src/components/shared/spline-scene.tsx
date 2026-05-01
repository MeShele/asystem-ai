"use client";

import { Suspense, lazy, useEffect, useState } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function shouldRenderSpline(): boolean {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < 1024) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

/**
 * Spline-сцена — Brand-Blue WebGL робот.
 * Чтобы не было лага при первом рендере — монтаж отложен на 700мс
 * после mount компонента. К этому моменту LCP уже зафиксирован,
 * остальной контент отрисован, и WebGL-инициализация не блокирует main thread.
 */
export function SplineScene({ scene, className }: SplineSceneProps) {
  const [allowed, setAllowed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!shouldRenderSpline()) return;
    setAllowed(true);
    const id = window.setTimeout(() => setMounted(true), 700);
    return () => window.clearTimeout(id);
  }, []);

  if (!allowed || !mounted) {
    // Прозрачный плейсхолдер — без gradient/анимации, чтобы filter:hue-rotate
    // на родителе не давал жёлтую обёртку до загрузки Spline
    return (
      <div
        className={className}
        aria-hidden
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(37,99,235,0.25)", borderTopColor: "#2563EB" }}
          />
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
