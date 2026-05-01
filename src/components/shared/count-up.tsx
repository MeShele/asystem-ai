"use client";

import { useInView, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}

export function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 1.6,
  className = "",
  startWhen = true,
  separator = " ",
  prefix = "",
  suffix = "",
  style,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);

  const damping = 22 + 36 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  const formatValue = useCallback(
    (latest: number) => {
      const rounded = Math.round(latest);
      const formatted = new Intl.NumberFormat("en-US", { useGrouping: !!separator }).format(rounded);
      const withSep = separator ? formatted.replace(/,/g, separator) : formatted.replace(/,/g, "");
      return `${prefix}${withSep}${suffix}`;
    },
    [separator, prefix, suffix]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === "down" ? to : from);
    }
  }, [from, to, direction, formatValue]);

  useEffect(() => {
    if (isInView && startWhen) {
      const id = setTimeout(() => motionValue.set(direction === "down" ? from : to), delay * 1000);
      return () => clearTimeout(id);
    }
  }, [isInView, startWhen, motionValue, direction, from, to, delay]);

  useEffect(() => {
    const unsub = springValue.on("change", (latest: number) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return () => unsub();
  }, [springValue, formatValue]);

  return <span ref={ref} className={className} style={style} />;
}
