"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

// === DIVERSE scroll-triggered animations ===

// 1. Gravity drop — falls from above with bounce
export function GravityDrop({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: -60, rotate: -3 }}
      animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        type: "spring",
        stiffness: 120,
        damping: 14,
      }}
    >
      {children}
    </motion.div>
  );
}

// 2. Slide & scale — slides in from side with scale up
export function SlideScale({
  children,
  className = "",
  from = "left",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  from?: "left" | "right";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: from === "left" ? -80 : 80, scale: 0.9 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.4, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

// 3. Flip reveal — 3D flip into view
export function FlipReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={className} style={{ perspective: 1000 }}>
      <motion.div
        initial={{ opacity: 0, rotateX: -30, y: 40 }}
        animate={isInView ? { opacity: 1, rotateX: 0, y: 0 } : {}}
        transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0, 1] }}
        style={{ transformOrigin: "bottom center" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// 4. Stagger children — parent that staggers child animations
export function StaggerGroup({
  children,
  className = "",
  staggerDelay = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay, delayChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.4, 0, 1] as const } },
};

// 5. Parallax scroll item — moves at different speed
export function ParallaxItem({
  children,
  className = "",
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// 6. Zoom burst — scales from 0 to full
export function ZoomBurst({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 200, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}

// 7. Clip reveal — unmasks from direction
export function ClipReveal({
  children,
  className = "",
  from = "bottom",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  from?: "bottom" | "left" | "right" | "top";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const clipPaths = {
    bottom: { hidden: "inset(100% 0 0 0)", visible: "inset(0 0 0 0)" },
    top: { hidden: "inset(0 0 100% 0)", visible: "inset(0 0 0 0)" },
    left: { hidden: "inset(0 100% 0 0)", visible: "inset(0 0 0 0)" },
    right: { hidden: "inset(0 0 0 100%)", visible: "inset(0 0 0 0)" },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: clipPaths[from].hidden, opacity: 0 }}
      animate={isInView ? { clipPath: clipPaths[from].visible, opacity: 1 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.4, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

// === Parallax overlay section ===
export function ParallaxOverlay({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative z-10 ${className}`}>
      <div
        className="relative bg-bg-primary dark:bg-[#0a0a0a] rounded-t-[32px] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.5)]"
        style={{ marginTop: "-48px" }}
      >
        {children}
      </div>
    </div>
  );
}

// === Floating particles that drift down like rain ===
export function ParticleRain({
  count = 30,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  // Use deterministic values to avoid hydration mismatch
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: ((i * 37 + 13) % 100),
    delay: ((i * 23 + 7) % 50) / 10,
    duration: 4 + ((i * 17 + 3) % 60) / 10,
    size: 2 + ((i * 11 + 5) % 40) / 10,
    opacity: 0.1 + ((i * 19 + 9) % 20) / 100,
    char: ["·", "○", "◇", "+", "×", "▪", "//", "{}", "[]", "<>"][i % 10],
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-brand-500 font-mono select-none"
          style={{
            left: `${p.x}%`,
            fontSize: p.size + 8,
            opacity: 0,
          }}
          animate={{
            y: ["-10vh", "110vh"],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  );
}
