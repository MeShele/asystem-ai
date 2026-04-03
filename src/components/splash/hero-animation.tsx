"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TabMode = "human" | "ai";

const humanLines = [
  { delay: 0, text: "  Нам нужна система учёта для склада.", color: "text-text-secondary" },
  { delay: 700, text: "", color: "" },
  { delay: 900, text: "  asystem: Понял. Какие интеграции?", color: "text-brand-500" },
  { delay: 1500, text: "", color: "" },
  { delay: 1700, text: "  1С:Бухгалтерия + Excel-отчёты.", color: "text-text-secondary" },
  { delay: 2300, text: "", color: "" },
  { delay: 2500, text: "  asystem: Базовая архитектура:", color: "text-brand-500" },
  { delay: 2900, text: "  - PostgreSQL + Prisma ORM", color: "text-brand-500" },
  { delay: 3200, text: "  - REST API для 1С обмена", color: "text-brand-500" },
  { delay: 3500, text: "  - Next.js дашборд", color: "text-brand-500" },
  { delay: 3900, text: "", color: "" },
  { delay: 4200, text: "  MVP готов через 3 недели.", color: "text-green-600 dark:text-green-400" },
  { delay: 4600, text: "  Без предоплаты — сначала результат.", color: "text-green-600 dark:text-green-400" },
];

const aiLines = [
  { delay: 0, text: "  Task: Оптимизировать API эндпоинты", color: "text-text-primary" },
  { delay: 600, text: "", color: "" },
  { delay: 800, text: "  Анализ узких мест...", color: "text-text-secondary" },
  { delay: 1400, text: "  - /api/inventory: 420ms (N+1 queries)", color: "text-accent-500" },
  { delay: 1800, text: "  - /api/reports: 380ms (no cache)", color: "text-accent-500" },
  { delay: 2200, text: "", color: "" },
  { delay: 2500, text: "  Рефакторинг:", color: "text-text-primary" },
  { delay: 2900, text: "  - Batch queries + Redis cache", color: "text-brand-500" },
  { delay: 3200, text: "  - Response time: 420ms → 85ms", color: "text-green-600 dark:text-green-400" },
  { delay: 3600, text: "  - 234 тестов пройдено", color: "text-green-600 dark:text-green-400" },
  { delay: 4000, text: "  - PR #47 создан → ready for review", color: "text-green-600 dark:text-green-400" },
];

export function HeroAnimation() {
  const [activeTab, setActiveTab] = useState<TabMode>("human");
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [started, setStarted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const lines = activeTab === "human" ? humanLines : aiLines;

  function handleTabSwitch(tab: TabMode) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setVisibleLines(0);
    setStarted(false);
    setTimeout(() => setStarted(true), 100);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById("hero-terminal");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [visibleLines]);

  useEffect(() => {
    if (!started) return;
    setVisibleLines(0);
    const timers = lines.map((line, i) =>
      setTimeout(() => setVisibleLines(i + 1), line.delay)
    );
    const lastDelay = lines[lines.length - 1]?.delay ?? 0;
    const resetTimer = setTimeout(() => {
      setVisibleLines(0);
      setStarted(false);
      setTimeout(() => setStarted(true), 800);
    }, lastDelay + 3000);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(resetTimer);
    };
  }, [started, lines]);

  return (
    <motion.div
      id="hero-terminal"
      className="mt-16 lg:mt-20 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="fc-code-block">
        <div className="fc-code-header">
          <div className="fc-code-dot bg-red-500/60" />
          <div className="fc-code-dot bg-yellow-500/60" />
          <div className="fc-code-dot bg-green-500/60" />
          <span className="ml-3 text-xs text-text-primary font-medium tracking-tight">
            asystem.ai
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-faint bg-bg-secondary/50">
          {(["human", "ai"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              className={`flex-1 py-2.5 text-xs tracking-wide transition-all duration-200 relative ${
                activeTab === tab
                  ? "text-text-primary font-medium"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab === "human" ? "Для бизнеса" : "Для разработчиков"}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-500"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Terminal body — fixed height, scrolls */}
        <div ref={bodyRef} className="fc-code-body h-[280px] overflow-y-auto scroll-smooth" style={{ scrollbarWidth: "thin" }}>
          <AnimatePresence mode="popLayout">
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={`${activeTab}-${i}-${started}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`${line.color} text-[13px] leading-7`}
              >
                {line.text || "\u00A0"}
                {i === visibleLines - 1 && (
                  <span className="terminal-cursor" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {visibleLines === 0 && (
            <div className="text-text-muted text-[13px]">
              <span className="terminal-cursor" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
