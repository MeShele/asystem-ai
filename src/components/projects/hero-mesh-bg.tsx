"use client";

import { useEffect, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Анимированный Brand Blue mesh-фон для hero — те же параметры, что HeroBar на главной.
 * Если WebGL недоступен — статичный radial-fallback, страница не падает.
 */
export function HeroMeshBg() {
  const [hasWebGL, setHasWebGL] = useState(false);
  useEffect(() => {
    setHasWebGL(detectWebGL());
  }, []);

  if (hasWebGL) {
    return (
      <MeshGradient
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.55,
          pointerEvents: "none",
        }}
        colors={["#ffffff", "#DBEAFE", "#2563EB", "#FAFAFA", "#F5F5F4"]}
        distortion={0.85}
        swirl={0.25}
        speed={0.35}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at 60% 40%, rgba(37, 99, 235,0.12), rgba(219,234,254,0.4) 45%, transparent 75%)",
      }}
    />
  );
}
