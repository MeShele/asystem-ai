"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ProjectCalculator } from "@/components/partner/project-calculator";
import { TeamSection } from "@/components/landing/team-section";
import { CircleDollarSign, Zap, Shield, Percent, Search, HandCoins, Handshake, Globe, Bot, Smartphone, Database, Compass, PenTool, Rocket, Server } from "lucide-react";

const TECHS = [
  "Next.js", "React", "TypeScript", "PostgreSQL", "Prisma",
  "Telegram API", "Docker", "Tailwind CSS", "Redis",
  "Kubernetes", "GitHub Actions", "AI / GPT-4", "Blockchain",
  "Framer Motion", "Playwright", "REST API", "WebSocket", "Vercel",
];

/* ─── Partner Terminal (same style as main hero terminal) ─── */
type TerminalTab = "human" | "ai";

const humanLines = [
  { delay: 0,    text: "$ Привет, я ищу IT-подрядчика для клиента.", color: "text-text-secondary" },
  { delay: 700,  text: "", color: "" },
  { delay: 900,  text: "  asystem: Отлично. Что за проект?", color: "text-brand-500" },
  { delay: 1500, text: "", color: "" },
  { delay: 1700, text: "$ Корпоративный сайт. Бюджет клиента ~$1 200.", color: "text-text-secondary" },
  { delay: 2300, text: "", color: "" },
  { delay: 2500, text: "  asystem: Базовая цена — $600.", color: "text-brand-500" },
  { delay: 3000, text: "  asystem: Вы забираете $90 (15%) сразу.", color: "text-brand-500" },
  { delay: 3500, text: "  asystem: Наценку $600 делим 50/50 → +$300.", color: "text-brand-500" },
  { delay: 4100, text: "", color: "" },
  { delay: 4300, text: "  → Итого вам: $390", color: "text-green-600 dark:text-green-400" },
  { delay: 4700, text: "  → MVP без предоплаты — клиент не рискует.", color: "text-green-600 dark:text-green-400" },
  { delay: 5200, text: "", color: "" },
  { delay: 5400, text: "$ Звучит честно. Оформляем.", color: "text-text-secondary" },
];

const aiLines = [
  { delay: 0,    text: "$ curl -X POST api.asystem.ai/v1/partner/deal \\", color: "text-text-primary" },
  { delay: 400,  text: "    -d '{\"client_budget\": 1200}'", color: "text-text-muted" },
  { delay: 1200, text: "", color: "" },
  { delay: 1400, text: "  HTTP/2 200", color: "text-green-600 dark:text-green-400" },
  { delay: 1900, text: "", color: "" },
  { delay: 2100, text: "  {", color: "text-text-secondary" },
  { delay: 2300, text: "    \"base_price\":     600,", color: "text-brand-500" },
  { delay: 2500, text: "    \"commission\":     90,", color: "text-green-600 dark:text-green-400" },
  { delay: 2700, text: "    \"markup_split\":   300,", color: "text-green-600 dark:text-green-400" },
  { delay: 2900, text: "    \"partner_total\":  390,", color: "text-accent-500" },
  { delay: 3100, text: "    \"status\":         \"active\"", color: "text-green-600 dark:text-green-400" },
  { delay: 3300, text: "  }", color: "text-text-secondary" },
];

function PartnerTerminal() {
  const [tab, setTab] = useState<TerminalTab>("human");
  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const lines = tab === "human" ? humanLines : aiLines;

  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [visibleLines]);
  const switchTab = useCallback((t: TerminalTab) => { if (t === tab) return; setTab(t); setVisibleLines(0); setStarted(false); setTimeout(() => setStarted(true), 100); }, [tab]);
  useEffect(() => { const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 }); const el = document.getElementById("partner-terminal"); if (el) observer.observe(el); return () => observer.disconnect(); }, [started]);
  useEffect(() => { if (!started) return; const timers = lines.map((l, i) => setTimeout(() => setVisibleLines(i + 1), l.delay)); const reset = setTimeout(() => { setVisibleLines(0); setStarted(false); setTimeout(() => setStarted(true), 800); }, (lines[lines.length - 1]?.delay ?? 0) + 2500); return () => { timers.forEach(clearTimeout); clearTimeout(reset); }; }, [started, lines]);

  return (
    <motion.div id="partner-terminal" className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
      <div className="fc-code-block">
        <div className="fc-code-header">
          <div className="fc-code-dot bg-red-500/60" /><div className="fc-code-dot bg-yellow-500/60" /><div className="fc-code-dot bg-green-500/60" />
          <span className="ml-3 text-xs text-text-primary font-medium tracking-tight flex-1">asystem.ai — partner</span>
          <span className="flex items-center gap-1.5 text-[10px] text-orange-500"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> beta</span>
        </div>
        <div className="flex border-b border-border-faint bg-bg-secondary/50">
          {(["human", "ai"] as const).map((t) => (
            <button key={t} onClick={() => switchTab(t)} className={`flex-1 py-2.5 text-xs tracking-wide transition-all duration-200 relative ${tab === t ? "text-text-primary font-medium" : "text-text-muted hover:text-text-secondary"}`}>
              {t === "human" ? "For Human" : "For AI"}
              {tab === t && <motion.div layoutId="partner-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-500" transition={{ duration: 0.2 }} />}
            </button>
          ))}
        </div>
        <div ref={bodyRef} className="fc-code-body h-[280px] overflow-y-auto scroll-smooth" style={{ scrollbarWidth: "thin" }}>
          <AnimatePresence mode="popLayout">
            {lines.slice(0, visibleLines).map((line, i) => (
              <motion.div key={`${tab}-${i}-${started}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className={`${line.color} text-[13px] leading-7`}>
                {line.text || "\u00A0"}{i === visibleLines - 1 && <span className="terminal-cursor" />}
              </motion.div>
            ))}
          </AnimatePresence>
          {visibleLines === 0 && <div className="text-text-muted text-[13px]"><span className="terminal-cursor" /></div>}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Hero visual — Lucide icon composition ─── */
function HeroVisual() {
  return (
    <div className="relative w-full aspect-square max-w-[260px] mx-auto overflow-hidden">
      {/* Central hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-2xl border-2 border-brand-500/30 bg-brand-500/[0.06] flex items-center justify-center">
        <Handshake className="w-9 h-9 text-brand-500/70" />
      </div>

      {/* Orbiting ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-border-faint"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-border-faint"
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating icon nodes */}
      <motion.div className="absolute top-[8%] left-[45%] p-3 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity }}>
        <CircleDollarSign className="w-6 h-6 text-green-500/70" />
      </motion.div>
      <motion.div className="absolute top-[30%] right-[8%] p-3 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [3, -5, 3] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}>
        <Zap className="w-6 h-6 text-accent-500/70" />
      </motion.div>
      <motion.div className="absolute bottom-[30%] right-[12%] p-3 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [-3, 5, -3] }} transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}>
        <Shield className="w-6 h-6 text-brand-500/70" />
      </motion.div>
      <motion.div className="absolute bottom-[10%] left-[40%] p-3 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [4, -4, 4] }} transition={{ duration: 5.5, repeat: Infinity, delay: 0.8 }}>
        <Percent className="w-6 h-6 text-accent-500/70" />
      </motion.div>
      <motion.div className="absolute top-[35%] left-[5%] p-3 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [-5, 3, -5] }} transition={{ duration: 4.2, repeat: Infinity, delay: 1.5 }}>
        <Globe className="w-6 h-6 text-brand-500/70" />
      </motion.div>
      <motion.div className="absolute bottom-[25%] left-[8%] p-3 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [3, -3, 3] }} transition={{ duration: 3.8, repeat: Infinity, delay: 0.3 }}>
        <Bot className="w-6 h-6 text-green-500/70" />
      </motion.div>

      {/* Connecting dashed lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
        <motion.line x1="150" y1="130" x2="145" y2="45" className="stroke-border-faint" strokeWidth="1" strokeDasharray="4 4" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.line x1="170" y1="140" x2="245" y2="105" className="stroke-border-faint" strokeWidth="1" strokeDasharray="4 4" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} />
        <motion.line x1="170" y1="160" x2="240" y2="200" className="stroke-border-faint" strokeWidth="1" strokeDasharray="4 4" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
        <motion.line x1="150" y1="170" x2="140" y2="255" className="stroke-border-faint" strokeWidth="1" strokeDasharray="4 4" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
        <motion.line x1="130" y1="140" x2="50" y2="115" className="stroke-border-faint" strokeWidth="1" strokeDasharray="4 4" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 0.8 }} />
        <motion.line x1="130" y1="160" x2="55" y2="210" className="stroke-border-faint" strokeWidth="1" strokeDasharray="4 4" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, delay: 1.3 }} />
      </svg>

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-brand-500/[0.04] blur-[60px]" />
    </div>
  );
}

/* ─── Main page ─── */
export default function PartnerPage() {
  const t = useTranslations("partner");

  return (
    <div className="min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="overflow-hidden relative">
        {/* Ambient glow orbs */}
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-brand-500/[0.04] blur-[180px] pointer-events-none" />
        <div className="absolute top-[50%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent-500/[0.03] blur-[140px] pointer-events-none" />

        <div className="fc-container relative z-10 w-full">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />

          <div className="pt-40 lg:pt-52 pb-12 px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
              <div className="flex-1 text-center lg:text-left">
                <motion.div className="mb-8" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-500 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" /> Closed Beta
                  </span>
                </motion.div>
                <motion.h1 className="text-6xl md:text-[8rem] font-semibold leading-[0.9] tracking-tighter mb-8" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                  <span className="text-text-primary">Зарабатывай</span><br />
                  <span className="text-text-primary">на IT</span>{" "}
                  <span className="text-text-muted">без</span><br />
                  <span className="text-text-muted">разработчиков.</span>
                </motion.h1>
                <motion.p className="text-lg lg:text-xl text-text-secondary max-w-xl mb-14 leading-relaxed" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                  Приводи клиентов — мы делаем. Ты забираешь 15% с базы и половину наценки. MVP без предоплаты.
                </motion.p>
              </div>
              <motion.div className="hidden lg:block w-full max-w-[280px] shrink-0" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
                <HeroVisual />
              </motion.div>
            </div>
          </div>

          <div className="px-4 pb-32"><PartnerTerminal /></div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="relative overflow-hidden">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="h-px bg-border-faint" />
          <div className="py-20 lg:py-24 px-4">
            <div className="flex flex-wrap justify-center lg:justify-between items-center gap-10 lg:gap-0">
              {[
                { value: "15%", label: "комиссия с базы" },
                { value: "50/50", label: "делим наценку" },
                { value: "$0", label: "предоплата для клиента" },
                { value: "24ч", label: "ответ на заявку" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-10"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <div className="text-center lg:text-left">
                    <div className="text-5xl lg:text-7xl font-semibold tracking-tighter text-text-primary">{stat.value}</div>
                    <div className="text-xs tracking-[0.2em] uppercase text-text-muted mt-3">{stat.label}</div>
                  </div>
                  {i < 3 && <div className="hidden lg:block h-16 w-px bg-border-faint" />}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative overflow-hidden">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="h-px bg-border-faint" />
          <div className="py-32 px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-xs tracking-[0.2em] uppercase text-text-muted">{t("howItWorks.title")}</span>
              <h2 className="text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
                15% ваши + делим наценку
              </h2>
              <p className="text-text-muted text-lg lg:text-xl max-w-lg mb-20">
                Вы получаете 15% от базовой цены. Сверху можете накинуть сколько хотите — наценку делим 50/50.
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                { num: "01", title: "Узнайте базовую цену", desc: "Мы оцениваем проект и называем фиксированную цену. Это наш минимум.", icon: <Search className="w-6 h-6 text-text-muted" /> },
                { num: "02", title: "Продайте с наценкой", desc: "15% от базы — ваши сразу. Сверху — любая цена, наценку делим 50/50.", icon: <HandCoins className="w-6 h-6 text-text-muted" /> },
                { num: "03", title: "Клиент платит — делим", desc: "MVP без предоплаты. Клиент платит по результату. Все довольны.", icon: <Handshake className="w-6 h-6 text-text-muted" /> },
              ].map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-0 rounded-[2.5rem] border border-border-faint p-6 md:p-8 hover:bg-overlay-subtle transition-all duration-300"
                >
                  {/* Number — 2 cols */}
                  <div className="md:col-span-2 flex items-center gap-4">
                    <span className="text-6xl lg:text-7xl font-semibold tracking-tighter text-text-primary/10">
                      {s.num}
                    </span>
                  </div>

                  {/* Icon + Title — 4 cols */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-overlay-subtle">
                      {s.icon}
                    </div>
                    <h3 className="text-xl lg:text-2xl font-semibold tracking-tight">
                      {s.title}
                    </h3>
                  </div>

                  {/* Description — 6 cols */}
                  <div className="md:col-span-6">
                    <p className="text-sm lg:text-base text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CALCULATOR ═══ */}
      <section className="relative overflow-hidden">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="h-px bg-border-faint" />
          <div className="py-32 px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-xs tracking-[0.2em] uppercase text-text-muted">Калькулятор проекта</span>
              <h2 className="text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
                Соберите проект
              </h2>
              <p className="text-text-muted text-lg lg:text-xl max-w-2xl mb-20">
                Выберите нужные услуги — стоимость и ваша комиссия считаются в реальном времени.
              </p>
            </motion.div>
            <ProjectCalculator />
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="relative overflow-hidden">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="h-px bg-border-faint" />
          <div className="py-32 px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-xs tracking-[0.2em] uppercase text-text-muted">{t("benefits.title")}</span>
              <h2 className="text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
                Вам не стыдно
              </h2>
              <p className="text-text-muted text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mb-6">
                рекомендовать
              </p>
            </motion.div>

            <div className="mt-16 space-y-4">
              {[
                { title: "MVP без предоплаты", desc: "Мы начинаем работу до оплаты. Клиент видит результат, потом платит. Нулевой риск для репутации.", icon: <CircleDollarSign className="w-10 h-10" />, accent: "text-brand-500", bg: "bg-brand-500/[0.06]" },
                { title: "Быстрее рынка в 4x", desc: "Пока конкуренты обещают 6 месяцев — мы делаем за 4. Современный стек, AI-ускорение.", icon: <Zap className="w-10 h-10" />, accent: "text-accent-500", bg: "bg-accent-500/[0.06]" },
                { title: "Качество = визитка", desc: "Next.js, TypeScript, чистый код. Каждый проект — на уровне. Даже разработчик одобрит.", icon: <Shield className="w-10 h-10" />, accent: "text-brand-500", bg: "bg-brand-500/[0.06]" },
                { title: "15% + свободная наценка", desc: "15% от базы — гарантированно ваши. Продали дороже — наценку делим 50/50.", icon: <Percent className="w-10 h-10" />, accent: "text-accent-500", bg: "bg-accent-500/[0.06]" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-0 rounded-[2.5rem] border border-border-faint p-6 md:p-8 hover:bg-overlay-subtle transition-all duration-300"
                >
                  {/* Title — 4 cols */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <span className="text-xs text-text-muted font-mono">0{i + 1}</span>
                    <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">
                      {item.title}
                    </h3>
                  </div>

                  {/* Visual center — 4 cols */}
                  <div className="md:col-span-4 flex items-center justify-center">
                    <div className={`${item.bg} ${item.accent} rounded-3xl p-6 transition-transform duration-300 group-hover:scale-110`}>
                      {item.icon}
                    </div>
                  </div>

                  {/* Description — 4 cols */}
                  <div className="md:col-span-4">
                    <p className="text-sm lg:text-base text-text-secondary leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="relative overflow-hidden">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="h-px bg-border-faint" />
          <div className="py-32 px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-xs tracking-[0.2em] uppercase text-text-muted">Услуги</span>
              <h2 className="text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
                Что мы делаем
              </h2>
              <p className="text-text-muted text-lg lg:text-xl max-w-lg mb-6">
                Enterprise IT-решения с AI и блокчейн-технологиями
              </p>
            </motion.div>

            <div className="mt-16 space-y-4">
              {[
                { num: "01", title: "Веб-платформы", desc: "SaaS системы на PHP/Laravel + Next.js. Channel Manager для отелей, корпоративные порталы.", time: "от 1 месяца", accent: "text-brand-500", bg: "bg-brand-500/[0.06]", icon: <Globe className="w-10 h-10" /> },
                { num: "02", title: "AI и боты", desc: "Telegram/WhatsApp боты, AI-интеграции, автоматизация процессов.", time: "от 2 недель", accent: "text-accent-500", bg: "bg-accent-500/[0.06]", icon: <Bot className="w-10 h-10" /> },
                { num: "03", title: "Мобильные приложения", desc: "Flutter приложения для iOS/Android. Кроссплатформенные решения.", time: "от 1 месяца", accent: "text-brand-500", bg: "bg-brand-500/[0.06]", icon: <Smartphone className="w-10 h-10" /> },
                { num: "04", title: "Интеграции 1С", desc: "Автоматизация учёта, интеграция с 1С:Бухгалтерия. API обмен данными.", time: "от 3 недель", accent: "text-accent-500", bg: "bg-accent-500/[0.06]", icon: <Database className="w-10 h-10" /> },
              ].map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-0 rounded-[2.5rem] border border-border-faint p-6 md:p-8 hover:bg-overlay-subtle transition-all duration-300"
                >
                  {/* Title — 4 cols */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <span className="text-xs text-text-muted font-mono">{s.num}</span>
                    <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">
                      {s.title}
                    </h3>
                  </div>

                  {/* Visual center — 4 cols */}
                  <div className="md:col-span-4 flex items-center justify-center">
                    <div className={`${s.bg} ${s.accent} rounded-3xl p-6 transition-transform duration-300 group-hover:scale-110`}>
                      {s.icon}
                    </div>
                  </div>

                  {/* Description — 4 cols */}
                  <div className="md:col-span-4">
                    <p className="text-sm lg:text-base text-text-secondary leading-relaxed">
                      {s.desc}
                    </p>
                    <span className="inline-block mt-3 text-xs text-text-muted font-mono bg-overlay-subtle px-3 py-1 rounded-full">
                      {s.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className="relative overflow-hidden">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="h-px bg-border-faint" />
          <div className="py-32 px-4">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-xs tracking-[0.2em] uppercase text-text-muted">Процесс</span>
              <h2 className="text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
                Как мы работаем
              </h2>
              <p className="text-text-muted text-lg lg:text-xl max-w-lg mb-20">
                От идеи до production за 4 этапа
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                { step: "1", title: "Discovery", desc: "Анализируем бизнес-процесс, определяем архитектуру и стек", icon: <Compass className="w-6 h-6 text-text-muted" /> },
                { step: "2", title: "Проектирование", desc: "PRD, API, база данных и интеграции. Согласовываем с вами", icon: <PenTool className="w-6 h-6 text-text-muted" /> },
                { step: "3", title: "Разработка", desc: "Agile-спринты, CI/CD, автоматические тесты. Полная прозрачность", icon: <Rocket className="w-6 h-6 text-text-muted" /> },
                { step: "4", title: "Production", desc: "Docker-деплой, мониторинг, security audit. Документация и поддержка", icon: <Server className="w-6 h-6 text-text-muted" /> },
              ].map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group grid grid-cols-1 md:grid-cols-12 items-start gap-6 md:gap-8 rounded-[2.5rem] border border-border-faint p-8 lg:p-10 hover:bg-overlay-subtle transition-all duration-300"
                >
                  {/* Big number */}
                  <div className="md:col-span-2 flex items-center gap-4">
                    <span className="text-6xl lg:text-7xl font-semibold tracking-tighter text-text-primary/10">
                      {s.step}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-overlay-subtle">
                      {s.icon}
                    </div>
                    <h3 className="text-xl lg:text-2xl font-semibold tracking-tight">
                      {s.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-6">
                    <p className="text-sm lg:text-base text-text-secondary leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TECH MARQUEE ═══ */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="h-px bg-border-faint" />
          <div className="text-center mb-10 pt-2">
            <span className="text-xs tracking-[0.2em] uppercase text-text-muted">Tech Stack</span>
          </div>
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
        <div className="flex gap-4 mb-4 animate-marquee">
          {[...TECHS, ...TECHS].map((tech, i) => (
            <span key={`a-${i}`} className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-border-faint bg-surface text-sm text-text-secondary hover:text-brand-500 hover:border-brand-500/30 transition-all duration-300 whitespace-nowrap font-medium">{tech}</span>
          ))}
        </div>
        <div className="flex gap-4 animate-marquee-reverse">
          {[...TECHS, ...TECHS].reverse().map((tech, i) => (
            <span key={`b-${i}`} className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-border-faint bg-surface text-sm text-text-secondary hover:text-accent-500 hover:border-accent-500/30 transition-all duration-300 whitespace-nowrap font-medium">{tech}</span>
          ))}
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <TeamSection />

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden">
        <div className="fc-container">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />

          <motion.div
            className="relative overflow-hidden rounded-t-[3rem] -mt-10 bg-bg-card border border-border-faint border-b-0"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent-500/[0.05] blur-[150px] pointer-events-none" />

            <div className="relative z-10 py-32 lg:py-40 px-6 lg:px-16">
              <div className="max-w-2xl">
                <span className="text-xs tracking-[0.2em] uppercase text-text-muted">
                  Начните сейчас
                </span>
                <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter mt-4 mb-2 leading-[1]">
                  Готовы зарабатывать?
                </h2>
                <p className="text-text-muted text-lg lg:text-xl mb-10 max-w-md">
                  Зарегистрируйтесь, получите реферальную ссылку и начните привлекать клиентов уже сегодня.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <a
                    href="./dashboard"
                    className="relative inline-flex items-center justify-center h-14 px-10 rounded-xl text-white font-bold text-base overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 group-hover:from-brand-500 group-hover:to-accent-500 transition-all duration-500" />
                    <span className="relative z-10 flex items-center gap-2">
                      Зарегистрироваться
                      <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </a>
                  <a
                    href="https://t.me/asystem_ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-muted hover:text-text-secondary transition-colors h-14 inline-flex items-center underline underline-offset-4 decoration-border-faint hover:decoration-text-muted"
                  >
                    Telegram: @asystem_ai →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
