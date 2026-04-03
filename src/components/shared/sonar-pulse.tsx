"use client";

import { motion } from "framer-motion";

export function SonarPulse({
  className = "",
  rings = 4,
  color = "brand-500",
  size = 300,
}: {
  className?: string;
  rings?: number;
  color?: string;
  size?: number;
}) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Center dot */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-${color}`}
        style={{ boxShadow: `0 0 20px var(--color-${color})` }}
      />

      {/* Expanding rings */}
      {Array.from({ length: rings }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-${color}`}
          style={{ width: "10%", height: "10%" }}
          animate={{
            width: ["10%", "100%"],
            height: ["10%", "100%"],
            opacity: [0.6, 0],
            borderWidth: ["2px", "1px"],
          }}
          transition={{
            duration: 3,
            delay: i * 0.75,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Sweep line */}
      <motion.div
        className="absolute top-1/2 left-1/2 origin-bottom-left"
        style={{
          width: size / 2,
          height: 2,
          background: `linear-gradient(90deg, var(--color-${color}), transparent)`,
          transformOrigin: "0% 50%",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
