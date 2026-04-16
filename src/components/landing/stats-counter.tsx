"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";

function Counter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const startTime = performance.now();
    function frame(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) { raf = requestAnimationFrame(frame); } else { setCount(end); }
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration]);

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
}

const stats = [
  { value: 500, suffix: "+", key: "transactions" },
  { value: 98, suffix: "%", key: "accuracy" },
  { value: 4, suffix: "×", key: "speed" },
  { value: 100, suffix: "%", key: "noDeposit" },
];

export function StatsCounter() {
  const t = useTranslations("client.stats");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative overflow-hidden" ref={ref}>
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
        <div className="h-px bg-border-faint" />

        <div className="py-12 lg:py-16 px-4">
          <div className="flex flex-wrap justify-center lg:justify-between items-center gap-10 lg:gap-0">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.key}
                className="flex items-center gap-10"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.4, 0, 1] }}
              >
                <div className="text-center lg:text-left">
                  <div className="text-4xl lg:text-5xl font-semibold tracking-tighter text-text-primary">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs tracking-[0.2em] uppercase text-text-muted mt-3">{t(stat.key)}</div>
                </div>
                {i < stats.length - 1 && (
                  <div className="hidden lg:block h-16 w-px bg-border-faint" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
