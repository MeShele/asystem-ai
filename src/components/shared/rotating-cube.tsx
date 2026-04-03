"use client";

import { motion } from "framer-motion";

export function RotatingCube({
  className = "",
  size = 200,
}: {
  className?: string;
  size?: number;
}) {
  const half = size / 2;

  const faces = [
    { transform: `rotateY(0deg) translateZ(${half}px)`, label: "NEXT.JS" },
    { transform: `rotateY(90deg) translateZ(${half}px)`, label: "AI" },
    { transform: `rotateY(180deg) translateZ(${half}px)`, label: "LARAVEL" },
    { transform: `rotateY(-90deg) translateZ(${half}px)`, label: "BLOCKCHAIN" },
    { transform: `rotateX(90deg) translateZ(${half}px)`, label: "DOCKER" },
    { transform: `rotateX(-90deg) translateZ(${half}px)`, label: "DEPLOY" },
  ];

  return (
    <div className={`${className}`} style={{ perspective: 800 }}>
      <motion.div
        className="relative"
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {faces.map((face, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center border border-brand-500/20 bg-brand-500/[0.03] backdrop-blur-sm"
            style={{
              transform: face.transform,
              backfaceVisibility: "hidden",
            }}
          >
            <span className="font-mono text-xs tracking-widest text-brand-500/50">
              {face.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
