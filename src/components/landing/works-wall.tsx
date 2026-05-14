"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import {
  Compass,
  PenTool,
  Rocket,
  Server,
  Gauge,
  Wallet,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { VinylEasterEgg } from "@/components/shared/vinyl-easter-egg";
import { ServiceModal } from "@/components/shared/service-modal";
import { TechModal, TECH_STACK, type Tech } from "@/components/shared/tech-modal";
import { MobileTopBar } from "@/components/shared/mobile-topbar";

const HOME_MOBILE_NAV = [
  {
    title: "Works",
    items: [
      { label: "клиенты · 4", href: "#clients" },
      { label: "обещания · 4", href: "#guarantees" },
      { label: "услуги · 4", href: "#services" },
      { label: "процесс · 4", href: "#process" },
      { label: "стек", href: "#stack" },
      { label: "лаборатория · 8", href: "#lab" },
      { label: "команда · 16", href: "#team" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "основателям", href: "/startups" },
      { label: "заявка", href: "/client/request" },
    ],
  },
  {
    title: "Contact",
    items: [
      { label: "hello@asystem.ai", href: "mailto:hello@asystem.ai", external: true },
      { label: "Telegram", href: "https://t.me/asystem_ai", external: true },
      { label: "WhatsApp", href: "https://wa.me/996", external: true },
    ],
  },
];
import { Icon } from "@iconify/react";
import { LiquidSpline, type SplineKind } from "./liquid-spline";
import { LabCanvas, type LabShape } from "./lab-3d";
import { MeshGradient } from "@paper-design/shaders-react";

/* ═══════════════ ACTIVE SECTION TRACKING ═══════════════ */

const ActiveSectionContext = createContext<string | null>(null);

// ID всех секций в порядке появления, для отслеживания
const TRACKED_SECTIONS = [
  "clients",
  "guarantees",
  "services",
  "process",
  "stack",
  "lab",
  "team",
];

function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const compute = () => {
      rafId = null;
      // Якорь — строка на 30% высоты viewport. Активна та секция,
      // чей top ближе к этой строке сверху (но уже прошёл её).
      const anchor = window.innerHeight * 0.3;
      let current: string | null = null;

      for (const id of TRACKED_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Секция уже вошла (её верх выше или на уровне якоря)
        if (rect.top - anchor <= 0 && rect.bottom > anchor) {
          current = id;
          break;
        }
      }

      // Если мы выше первой секции — active = null (до скролла)
      // Если ниже последней — остаётся последняя видимая
      if (!current) {
        const first = document.getElementById(TRACKED_SECTIONS[0]);
        if (first) {
          const r = first.getBoundingClientRect();
          if (r.top > anchor) {
            setActive(null);
            return;
          }
        }
        // Ниже последней — берём последнюю
        const last = document.getElementById(TRACKED_SECTIONS[TRACKED_SECTIONS.length - 1]);
        if (last) {
          const r = last.getBoundingClientRect();
          if (r.bottom < anchor) {
            setActive(TRACKED_SECTIONS[TRACKED_SECTIONS.length - 1]);
            return;
          }
        }
        return;
      }

      setActive(current);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return active;
}

/* ═══════════════════════════════════════════════════════════
   WorksWall — минималистичный layout в стиле threejs.org
   Sidebar слева + сетка работ/лаборатории справа + команда
   ═══════════════════════════════════════════════════════════ */

type ClientTile = {
  id: string;
  name: string;
  tag: string;
  desc: string;
  result: string;
  stack: string;
  year: string;
  logo: string;
  logoW: number;
  logoH: number;
  bg: string;
};

const CLIENTS: ClientTile[] = [
  {
    id: "minobr",
    name: "Минобр КР",
    tag: "ГОСЗАКАЗ",
    desc: "Платформа для Министерства образования. Архитектура ПО, госстандарты, безопасность для тысяч пользователей.",
    result: "Запуск за 6 недель вместо 6 месяцев",
    stack: "Next.js · PostgreSQL · S3",
    year: "2024",
    logo: "/logos/minobr.png",
    logoW: 140,
    logoH: 140,
    bg: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
  },
  {
    id: "aurva",
    name: "АУРВА",
    tag: "АГРО · КРИПТО",
    desc: "Сервис для агро-сектора и ассоциации виртуальных активов. Управление членством, AML и криптокомплаенс.",
    result: "100% заявок доходят до CRM автоматически",
    stack: "Next.js · Telegram · Bitrix24",
    year: "2025",
    logo: "/logos/aurva.svg",
    logoW: 180,
    logoH: 90,
    bg: "linear-gradient(135deg, #581c87 0%, #7e22ce 100%)",
  },
  {
    id: "redcharge",
    name: "Red Charge",
    tag: "ЭНЕРГЕТИКА",
    desc: "Сайт и OCPP-бэкенд для электрозарядных станций. Интеграция с RedPay. Отказоустойчивое ядро.",
    result: "Первые 40 лидов — до открытия первой станции",
    stack: "Next.js · OCPP · Go",
    year: "2025",
    logo: "/logos/red-charge.png",
    logoW: 200,
    logoH: 80,
    bg: "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
  },
  {
    id: "tulpar",
    name: "Tulpar Express",
    tag: "ЛОГИСТИКА",
    desc: "Модернизация клиентского сервиса. ПО для регистрации, веб-сайт, мобильное приложение, фирменный стиль.",
    result: "Среднее время ответа менеджера — 3 минуты",
    stack: "Next.js · Bitrix · React Native",
    year: "2025",
    logo: "/logos/tulpar-express.png",
    logoW: 220,
    logoH: 90,
    bg: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
  },
];

type LabStatus = "active" | "shipped" | "exploration" | "concept";
type LabTile = {
  id: string;
  title: string;
  kicker: string;
  date: string;
  status: LabStatus;
  desc: string;
  shape: LabShape;
  color: string;
};

const LAB_STATUS_COLOR: Record<LabStatus, string> = {
  active: "#10b981",
  shipped: "#3b82f6",
  exploration: "#a855f7",
  concept: "#f59e0b",
};

const LAB: LabTile[] = [
  {
    id: "partner-calc",
    title: "Партнёрский калькулятор",
    kicker: "TOOL",
    date: "2026-04",
    status: "active",
    desc: "Партнёр считает маржу сам — базовая цена плюс свободная наценка.",
    shape: "/lab/partner-calc.png",
    color: "#2563EB",
  },
  {
    id: "mvp-no-prepay",
    title: "MVP без предоплаты",
    kicker: "МОДЕЛЬ",
    date: "2026-03",
    status: "shipped",
    desc: "Инверсия риска — сначала MVP, потом счёт. Клиент видит результат раньше денег.",
    shape: "/lab/mvp-no-prepay.png",
    color: "#93C5FD",
  },
  {
    id: "ai-audit",
    title: "AI-аудит процесса",
    kicker: "ЭКСПЕРИМЕНТ",
    date: "2026-04",
    status: "exploration",
    desc: "Ассистент слушает звонки клиента и находит утечки в воронке.",
    shape: "/lab/ai-audit.png",
    color: "#2563EB",
  },
  {
    id: "tg-bot",
    title: "Telegram-бот заявок",
    kicker: "ИНТЕГРАЦИЯ",
    date: "2026-02",
    status: "shipped",
    desc: "Заявка из формы → Bitrix → уведомление в Telegram за 3 минуты.",
    shape: "/lab/tg-bot.png",
    color: "#93C5FD",
  },
  {
    id: "realtime",
    title: "Realtime-дашборд",
    kicker: "КОНЦЕПТ",
    date: "2026-04",
    status: "concept",
    desc: "Клиент видит статусы своих проектов и заявок в одной панели.",
    shape: "/lab/realtime.png",
    color: "#2563EB",
  },
  {
    id: "crm-sync",
    title: "CRM-синхронизация",
    kicker: "БЭКЕНД",
    date: "2026-01",
    status: "shipped",
    desc: "Универсальный коннектор между сайтом и Bitrix / amoCRM / Notion.",
    shape: "/lab/crm-sync.png",
    color: "#93C5FD",
  },
  {
    id: "ascii-easter",
    title: "ASCII в DevTools",
    kicker: "ФИРМА",
    date: "2025-12",
    status: "shipped",
    desc: "Открываешь F12 на любом нашем проекте — встречает подпись мастерской.",
    shape: "/lab/ascii-easter.png",
    color: "#525252",
  },
  {
    id: "inversion",
    title: "Инверсия риска",
    kicker: "ФИЛОСОФИЯ",
    date: "2025-11",
    status: "active",
    desc: "Не клиент рискует, а мы. Хеджирование — продукт остаётся как актив.",
    shape: "/lab/inversion.png",
    color: "#2563EB",
  },
];

const TEAM: Array<{ key: string; photo: string }> = [
  { key: "member1", photo: "/team/asylbek.png" },
  { key: "member2", photo: "/team/urmat.png" },
  { key: "member3", photo: "/team/asel.png" },
  { key: "member4", photo: "/team/nasip.png" },
  { key: "member5", photo: "/team/dastan.png" },
  { key: "member6", photo: "/team/akylay.png" },
  { key: "member7", photo: "/team/ruslan.png" },
  { key: "member8", photo: "/team/ermek.png" },
  { key: "member9", photo: "/team/suimonkul.png" },
  { key: "member10", photo: "/team/ivan.png" },
  { key: "member11", photo: "/team/saadat.png" },
  { key: "member12", photo: "/team/azamat.png" },
  { key: "member13", photo: "/team/alan.png" },
  { key: "member14", photo: "/team/emir.png" },
  { key: "member15", photo: "/team/alinur.png" },
  { key: "member16", photo: "/team/nerses.png" },
];

export function WorksWall() {
  const activeSection = useActiveSection();
  return (
    <ActiveSectionContext.Provider value={activeSection}>
      <MobileTopBar groups={HOME_MOBILE_NAV} />
      <div
        className="min-h-screen flex flex-col lg:flex-row"
        style={{ background: "#fff", color: "#0a0a0a" }}
      >
        <Sidebar />
        <Main />
      </div>
    </ActiveSectionContext.Provider>
  );
}

/* ═══════════════ SIDEBAR ═══════════════ */

function Sidebar() {
  return (
    <aside
      className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-12 lg:flex-col lg:gap-10"
      style={{
        borderRight: "1px solid #e5e5e5",
        background: "#fff",
      }}
    >
      <Link href="/" className="inline-flex items-baseline gap-1 group" aria-label="asystem.ai">
        <span className="text-[22px] font-semibold tracking-tight">asystem</span>
        <span className="text-[22px] font-semibold" style={{ color: "#2563EB" }}>.</span>
        <span className="text-[22px] font-semibold tracking-tight">ai</span>
      </Link>

      <ScrollProgress />

      <SidebarGroup title="Works">
        <SidebarLink href="#clients">клиенты · 4</SidebarLink>
        <SidebarLink href="#guarantees">обещания · 4</SidebarLink>
        <SidebarLink href="#services">услуги · 4</SidebarLink>
        <SidebarLink href="#process">процесс · 4</SidebarLink>
        <SidebarLink href="#stack">стек</SidebarLink>
        <SidebarLink href="#lab">лаборатория · 8</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Company">
        <SidebarLink href="#team">команда · 16</SidebarLink>
        <SidebarLink href="/startups">основателям</SidebarLink>
        <SidebarLink href="/client/request">заявка</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Contact">
        <SidebarLink href="mailto:hello@asystem.ai" external>hello@asystem.ai</SidebarLink>
        <SidebarLink href="https://t.me/asystem_ai" external>Telegram</SidebarLink>
        <SidebarLink href="https://wa.me/996" external>WhatsApp</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Language">
        <div className="flex items-center gap-3 font-mono text-[12px]" style={{ color: "#0a0a0a" }}>
          <span>RU</span>
          <span style={{ color: "#d4d4d4" }}>·</span>
          <span style={{ color: "#9ca3af" }}>KG</span>
          <span style={{ color: "#d4d4d4" }}>·</span>
          <span style={{ color: "#9ca3af" }}>EN</span>
        </div>
      </SidebarGroup>

      <div className="mt-auto pt-10">
        <LiveTimestamp />
        <div className="mt-4 font-mono text-[10px]" style={{ color: "#9ca3af", letterSpacing: "0.1em" }}>
          © 2026 · BISHKEK, KG
        </div>
      </div>
    </aside>
  );
}

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav>
      <div
        className="font-mono text-[10px] mb-3"
        style={{ color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}
      >
        {title}
      </div>
      <ul className="flex flex-col gap-2">{children}</ul>
    </nav>
  );
}

function SidebarLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const activeSection = useContext(ActiveSectionContext);
  const targetId = href.startsWith("#") ? href.slice(1) : null;
  const isActive = targetId !== null && targetId === activeSection;

  const inner = (
    <span
      className="text-[14px] transition-all duration-300 inline-flex items-center gap-2 relative"
      style={{
        color: isActive ? "#2563EB" : "#0a0a0a",
        transform: isActive ? "translateX(4px)" : "translateX(0)",
      }}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active-dot"
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#2563EB", boxShadow: "0 0 8px rgba(37, 99, 235,0.6)" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = "#2563EB";
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = "#0a0a0a";
        }}
        style={{ color: "inherit" }}
      >
        {children}
      </span>
    </span>
  );
  if (external) {
    return (
      <li>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      </li>
    );
  }
  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return (
      <li>
        <a href={href}>{inner}</a>
      </li>
    );
  }
  return (
    <li>
      <Link href={href}>{inner}</Link>
    </li>
  );
}

function ScrollProgress() {
  const activeSection = useContext(ActiveSectionContext);
  const total = TRACKED_SECTIONS.length;
  const idx = activeSection ? TRACKED_SECTIONS.indexOf(activeSection) : -1;
  const pct = idx >= 0 ? Math.round(((idx + 1) / total) * 100) : 0;

  return (
    <div className="-mt-4">
      <div className="relative h-[2px] w-full overflow-hidden" style={{ background: "#f0f0f0" }}>
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ background: "#2563EB" }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 24, mass: 0.6 }}
        />
      </div>
    </div>
  );
}

function LiveTimestamp() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Bishkek",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);
  if (!time) return null;
  return (
    <div className="font-mono text-[10px] flex items-center gap-2" style={{ color: "#6b7280", letterSpacing: "0.1em" }}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}
      />
      СЕЙЧАС · {time} · BISHKEK · ONLINE
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */

function Main() {
  return (
    <main id="main-content" className="flex-1 min-w-0">
      <HeroBar />

      <SectionHeader
        id="clients"
        kicker="Clients · 4"
        title="Работы"
        subtitle="Что делали, что убрали, что стало."
      />
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2"
        style={{ borderTop: "1px solid #e5e5e5", borderLeft: "1px solid #e5e5e5" }}
      >
        {CLIENTS.map((c, i) => (
          <ClientCell key={c.id} c={c} index={i} />
        ))}
      </div>

      <PeaceOfMind />

      <SectionHeader
        id="services"
        kicker="Services · 4"
        title="Что умеем"
        subtitle="Четыре направления. Фикс-цена, без предоплаты."
      />
      <ServicesGrid />

      <SectionHeader
        id="process"
        kicker="Process · 4 steps"
        title="Как работаем"
        subtitle="От первого звонка до production. Прозрачно, без сюрпризов."
      />
      <ProcessSteps />

      <SectionHeader
        id="stack"
        kicker="Stack"
        title="Чем работаем"
        subtitle="Инструменты, которые мы проверили на production."
      />
      <TechMarquee />

      <SectionHeader
        id="lab"
        kicker="Lab · 8"
        title="Лаборатория"
        subtitle="Эксперименты, модели, концепты asystem — то что делает нас asystem."
      />
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        style={{ borderTop: "1px solid #e5e5e5", borderLeft: "1px solid #e5e5e5" }}
      >
        {LAB.map((l, i) => (
          <LabCell key={l.id} l={l} i={i} />
        ))}
      </div>

      <SectionHeader
        id="team"
        kicker="Team · 16"
        title="Команда"
        subtitle="Дизайн, код, маркетинг, аналитика — внутри. Без субподряда."
      />
      <TeamGrid />

      <FinalCTA />

      <SubmitRow />

      {/* Footer wordmark + easter egg (egg в позиции точки) */}
      <VinylEasterEgg />
    </main>
  );
}

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

function HeroBar() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.01 });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(detectWebGL());
  }, []);

  const showShader = heroInView && hasWebGL;

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden px-6 lg:px-12 py-12 lg:py-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
      style={{ borderBottom: "1px solid #e5e5e5" }}
    >
      {/* Animated editorial gradient — только если WebGL поддерживается + hero в viewport */}
      {showShader && (
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
      )}
      {/* Статичный fallback-фон когда шейдер выключен или WebGL недоступен */}
      {!showShader && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, rgba(37, 99, 235,0.12), rgba(219,234,254,0.4) 45%, transparent 75%)",
          }}
        />
      )}

      <div className="relative z-10 max-w-3xl">
        <h1
          className="tracking-tight"
          style={{
            fontFamily: "var(--font-display, 'Space Grotesk'), sans-serif",
            fontSize: "clamp(44px, 6vw, 88px)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            color: "#0a0a0a",
            fontWeight: 600,
          }}
        >
          Независимая
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 400, color: "#1a1a1a" }}>
            AI-first студия
          </span>
          <span style={{ color: "#2563EB" }}>.</span>
        </h1>
      </div>

      <div className="relative z-10 flex flex-col gap-4 shrink-0 self-end lg:self-center">
        <div className="flex flex-col items-start lg:items-end">
          <div
            className="font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-display, 'Space Grotesk'), sans-serif",
              fontSize: "clamp(72px, 7.5vw, 128px)",
              lineHeight: 0.9,
              color: "#0a0a0a",
              letterSpacing: "-0.04em",
            }}
          >
            4×
          </div>
          <div
            className="font-mono text-[10px] mt-1"
            style={{ color: "#525252", letterSpacing: "0.2em" }}
          >
            быстрее рынка
          </div>
        </div>
        <div className="flex items-baseline gap-6 lg:gap-8">
          {[
            { num: "0 сом", label: "предоплаты" },
            { num: "24h", label: "ответ по КП" },
          ].map((kpi) => (
            <div key={kpi.label} className="flex flex-col">
              <div
                className="font-semibold tracking-tight"
                style={{
                  fontFamily: "var(--font-display, 'Space Grotesk'), sans-serif",
                  fontSize: "clamp(24px, 2.4vw, 36px)",
                  lineHeight: 1,
                  color: "#0a0a0a",
                }}
              >
                {kpi.num}
              </div>
              <div
                className="font-mono text-[10px] mt-2"
                style={{ color: "#525252", letterSpacing: "0.15em" }}
              >
                {kpi.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FooterWordmark() {
  return (
    <div
      aria-hidden
      className="select-none overflow-hidden"
      style={{
        background: "#fafafa",
        lineHeight: 0.82,
        borderTop: "1px solid #e5e5e5",
        paddingTop: "clamp(40px, 8vh, 96px)",
        paddingBottom: "clamp(16px, 3vh, 32px)",
      }}
    >
      <div
        className="font-semibold tracking-tighter whitespace-nowrap text-center"
        style={{
          fontSize: "clamp(56px, 14vw, 220px)",
          color: "rgba(10,10,10,0.18)",
          paddingLeft: "clamp(16px, 3vw, 48px)",
          paddingRight: "clamp(16px, 3vw, 48px)",
        }}
      >
        asystem<span style={{ color: "rgba(37, 99, 235,0.5)" }}>.</span>ai
      </div>
    </div>
  );
}

function SectionHeader({
  id,
  title,
}: {
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.header
      id={id}
      className="px-6 lg:px-12 py-12 lg:py-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1
        className="font-semibold tracking-tight"
        style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
      >
        {title}
      </h1>
    </motion.header>
  );
}

/* ═══════════════ CLIENT TILE — информативная ═══════════════ */

function ClientCell({ c, index }: { c: ClientTile; index: number }) {
  return (
    <motion.a
      href={`#case-${c.id}`}
      className="group relative flex flex-col transition-colors"
      style={{
        borderRight: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
        background: "#fff",
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* TOP — цветной с логотипом */}
      <div
        className="relative aspect-[16/9] overflow-hidden flex items-center justify-center p-10"
        style={{ background: c.bg }}
      >
        <div className="absolute top-5 left-5 z-10">
          <span
            className="font-mono text-[10px]"
            style={{
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
            }}
          >
            {c.tag}
          </span>
        </div>
        <div className="absolute top-5 right-5 z-10">
          <span
            className="font-mono text-[10px]"
            style={{
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.1em",
            }}
          >
            {c.year}
          </span>
        </div>

        <div
          className="flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
          style={{
            height: "clamp(72px, 11vw, 110px)",
            maxWidth: "70%",
          }}
        >
          <Image
            src={c.logo}
            alt={c.name}
            width={c.logoW}
            height={c.logoH}
            className="object-contain"
            style={{
              width: "auto",
              height: "100%",
              maxWidth: "100%",
              filter: "brightness(0) invert(1)",
            }}
          />
        </div>

      </div>

      {/* BOTTOM — белый с инфой */}
      <div className="p-6 lg:p-8 flex flex-col gap-3 flex-1">
        <h3 className="text-[22px] font-semibold tracking-tight" style={{ color: "#0a0a0a" }}>
          {c.name}
        </h3>
        <p className="text-[14.5px]" style={{ color: "#525252", lineHeight: 1.55 }}>
          {c.desc}
        </p>

        <div className="flex items-start gap-3 pt-3 mt-auto" style={{ borderTop: "1px solid #f0f0f0" }}>
          <div
            className="w-2 h-2 rounded-full shrink-0 mt-[6px]"
            style={{ background: "#10b981" }}
          />
          <div className="flex-1">
            <div className="font-mono text-[10px] mb-1" style={{ color: "#9ca3af", letterSpacing: "0.15em" }}>
              РЕЗУЛЬТАТ
            </div>
            <div className="text-[14px] font-medium" style={{ color: "#0a0a0a" }}>
              {c.result}
            </div>
          </div>
        </div>

        <div
          className="font-mono text-[11px] flex items-center justify-between"
          style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
        >
          <span>{c.stack}</span>
          <span
            className="inline-flex items-center gap-1 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
            style={{ color: "#2563EB", letterSpacing: "0.2em" }}
          >
            VIEW CASE <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </motion.a>
  );
}

/* ═══════════════ LAB TILE ═══════════════ */

function LabCell({ l, i }: { l: LabTile; i: number }) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden flex flex-col"
      style={{
        background: "#fafafa",
        borderRight: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      {/* 3D canvas — upper portion (square) */}
      <div className="relative aspect-square overflow-hidden">
        <LabCanvas shape={l.shape} color={l.color} />
        {/* subtle gradient fade at bottom for smooth text blend */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, #fafafa)",
          }}
        />
      </div>

      {/* Content — lower portion */}
      <div className="relative flex flex-col gap-2.5 p-5 pt-0">
        <div
          className="font-mono text-[10px] flex items-center gap-2 flex-wrap"
          style={{
            color: "rgba(10,10,10,0.55)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>{l.date}</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span>{l.kicker}</span>
        </div>

        <div
          className="font-semibold tracking-tight leading-tight transition-transform duration-500 group-hover:translate-x-1"
          style={{ color: "#0a0a0a", fontSize: "clamp(1rem, 1.4vw, 1.25rem)" }}
        >
          {l.title}
        </div>
        <p
          className="text-[12.5px] leading-snug"
          style={{ color: "rgba(10,10,10,0.55)" }}
        >
          {l.desc}
        </p>
      </div>
    </motion.a>
  );
}


/* ═══════════════ TEAM GRID ═══════════════ */

function TeamGrid() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4"
      style={{
        borderTop: "1px solid #e5e5e5",
        borderLeft: "1px solid #e5e5e5",
      }}
    >
      {TEAM.map((m) => (
        <TeamCell key={m.key} member={m} />
      ))}
    </div>
  );
}

function TeamCell({ member }: { member: (typeof TEAM)[number] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="group relative aspect-square overflow-hidden"
      style={{
        borderRight: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
        background: "#fafafa",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src={member.photo}
        alt=""
        width={400}
        height={400}
        loading="lazy"
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        style={{ filter: hovered ? "grayscale(0)" : "grayscale(1) contrast(0.95)" }}
      />
      <TeamLabel memberKey={member.key} visible={hovered} />
    </div>
  );
}

function TeamLabel({ memberKey, visible }: { memberKey: string; visible: boolean }) {
  const t = useTranslations("client.team");
  return (
    <div
      className="absolute inset-x-0 bottom-0 p-4 transition-all duration-300"
      style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
      }}
    >
      <div className="text-[13px] font-semibold text-white leading-tight">
        {t(`${memberKey}.name`)}
      </div>
      <div
        className="font-mono text-[10px] mt-1"
        style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em" }}
      >
        {t(`${memberKey}.role`)}
      </div>
    </div>
  );
}

/* ═══════════════ PEACE OF MIND ═══════════════ */

const GUARANTEES = [
  { Icon: Gauge,       value: "4×",    label: "БЫСТРЕЕ РЫНКА",  sub: "MVP за 3-4 недели — не 3-4 месяца" },
  { Icon: Wallet,      value: "0 сом", label: "БЕЗ ПРЕДОПЛАТЫ", sub: "Сначала MVP — потом счёт" },
  { Icon: ShieldCheck, value: "FIX",   label: "ЛОЯЛЬНЫЕ ЦЕНЫ",  sub: "Бишкек-rate, не Москва-rate. Базовая цена известна до старта." },
  { Icon: Timer,       value: "24h",   label: "ОТВЕТ ПО КП",    sub: "Шесть вопросов — и у вас цифры" },
];

function PeaceOfMind() {
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);
  const headerInView = revealed;

  return (
    <section
      ref={sectionRef}
      id="guarantees"
      className="relative px-6 lg:px-12 py-16 lg:py-24 overflow-hidden"
      style={{ background: "#fafafa", color: "#0a0a0a", borderTop: "1px solid #e5e5e5" }}
    >
      <div className="relative">
        {/* Mask-reveal header */}
        <div className="max-w-3xl mb-12 lg:mb-16 overflow-hidden">
          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={headerInView ? { clipPath: "inset(0% 0 0 0)" } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", lineHeight: 1.1 }}
            >
              Четыре обещания.
              <br />
              И <span style={{ color: "#2563EB" }}>четыре клиента</span>, которые их проверили.
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(10,10,10,0.08)" }}>
          {GUARANTEES.map((g, i) => (
            <GuaranteeCell key={i} g={g} index={i} parentRevealed={revealed} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-10 flex items-center gap-3 font-mono text-[11px]"
          style={{ color: "rgba(10,10,10,0.45)", letterSpacing: "0.15em" }}
        >
          <span className="inline-block w-8 h-px" style={{ background: "rgba(10,10,10,0.3)" }} />
          ПОДТВЕРЖДАЮТ · МИНОБР КР · АУРВА · RED CHARGE · TULPAR EXPRESS
        </motion.div>
      </div>
    </section>
  );
}

function GuaranteeCell({
  g,
  index,
  parentRevealed,
}: {
  g: (typeof GUARANTEES)[number];
  index: number;
  parentRevealed: boolean;
}) {
  return (
    <motion.div
      initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
      animate={parentRevealed ? { clipPath: "inset(0% 0 0 0)", opacity: 1 } : {}}
      transition={{
        duration: 0.8,
        delay: 0.2 + index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="p-6 lg:p-8 flex flex-col gap-4 group"
      style={{ background: "#fff" }}
    >
      <g.Icon
        aria-hidden
        strokeWidth={1}
        className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-3deg]"
        style={{ width: 28, height: 28, color: "#0a0a0a", opacity: 0.92 }}
      />
      <span aria-hidden className="block w-8 h-px" style={{ background: "#2563EB" }} />
      <div
        className="font-semibold tracking-tight"
        style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", lineHeight: 1 }}
      >
        {g.value}
      </div>
      <div>
        <div
          className="font-mono text-[11px] mb-2"
          style={{ color: "#2563EB", letterSpacing: "0.15em" }}
        >
          {g.label}
        </div>
        <div className="text-[13px]" style={{ color: "rgba(10,10,10,0.55)", lineHeight: 1.45 }}>
          {g.sub}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ PROCESS ═══════════════ */

const PROCESS: Array<{
  id: string;
  step: string;
  title: string;
  desc: string;
  participation: string;
  duration: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}> = [
  {
    id: "discovery",
    step: "01",
    title: "Discovery",
    desc: "30-минутный созвон. Слушаем реальную боль, не пишем ТЗ на 14 страниц.",
    participation: "30 мин созвон",
    duration: "1-2 дня",
    icon: Compass,
  },
  {
    id: "design",
    step: "02",
    title: "Проектирование",
    desc: "Архитектура, UX, прототип. Один цикл правок перед стартом. Фикс-цена после этого.",
    participation: "1 ревью макетов",
    duration: "3-7 дней",
    icon: PenTool,
  },
  {
    id: "build",
    step: "03",
    title: "Разработка MVP",
    desc: "Спринты по неделе. Прогресс в реальном времени через Telegram + превью.",
    participation: "еженедельный демо",
    duration: "3-6 недель",
    icon: Rocket,
  },
  {
    id: "production",
    step: "04",
    title: "Production",
    desc: "Деплой, мониторинг, передача кода и доступов. Только после этого — счёт.",
    participation: "приёмка + оплата",
    duration: "+ поддержка",
    icon: Server,
  },
];

function ProcessSteps() {
  return (
    <div
      className="relative grid grid-cols-1 md:grid-cols-4"
      style={{ borderTop: "1px solid #e5e5e5", background: "#fff" }}
    >
      {/* Horizontal connector line — only desktop, sits at icon row */}
      <div
        aria-hidden
        className="hidden md:block absolute left-0 right-0 pointer-events-none"
        style={{
          top: "calc(clamp(56px, 5.5vw, 80px) + 44px)",
          height: "1px",
          background:
            "repeating-linear-gradient(to right, #e5e5e5 0 6px, transparent 6px 12px)",
        }}
      />
      {PROCESS.map((p, i) => (
        <ProcessStep key={p.id} p={p} index={i} />
      ))}
    </div>
  );
}

function ProcessStep({
  p,
  index,
}: {
  p: (typeof PROCESS)[number];
  index: number;
}) {
  const Icon = p.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col gap-5 px-6 lg:px-8 py-10 lg:py-12 transition-colors"
      style={{
        borderRight: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div className="flex items-baseline gap-3">
        <span
          className="font-semibold tracking-tight select-none transition-colors duration-500 group-hover:text-[#2563EB]"
          style={{
            fontSize: "clamp(56px, 5.5vw, 80px)",
            lineHeight: 1,
            color: "#e5e5e5",
            letterSpacing: "-0.03em",
          }}
        >
          {p.step}
        </span>
      </div>

      {/* Icon node on timeline */}
      <div
        className="relative self-start flex items-center justify-center transition-transform duration-500 group-hover:scale-110 w-[56px] h-[56px] rounded-full"
        style={{
          background: "#fff",
          border: "1px solid #e5e5e5",
          zIndex: 1,
        }}
      >
        <Icon size={24} strokeWidth={1.25} className="text-[#0a0a0a]" />
      </div>

      <div className="flex flex-col gap-2">
        <h3
          className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
          style={{ fontSize: "clamp(1.125rem, 1.3vw, 1.375rem)", lineHeight: 1.2, color: "#0a0a0a" }}
        >
          {p.title}
        </h3>
        <p className="text-[13.5px]" style={{ color: "#525252", lineHeight: 1.55 }}>
          {p.desc}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-5" style={{ borderTop: "1px solid #f0f0f0" }}>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9px]" style={{ color: "#9ca3af", letterSpacing: "0.2em" }}>
            ВАШЕ УЧАСТИЕ
          </div>
          <div className="text-[13px]" style={{ color: "#0a0a0a" }}>
            {p.participation}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-mono text-[9px]" style={{ color: "#9ca3af", letterSpacing: "0.2em" }}>
            DURATION
          </div>
          <div className="font-mono text-[13px]" style={{ color: "#0a0a0a" }}>
            {p.duration}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ TECH MARQUEE ═══════════════ */

function TechMarquee() {
  const [active, setActive] = useState<Tech | null>(null);
  const items = [...TECH_STACK, ...TECH_STACK];
  const reversed = [...TECH_STACK].reverse();
  const itemsReversed = [...reversed, ...reversed];

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div
        className="relative py-12 lg:py-16 overflow-hidden"
        style={{
          borderTop: "1px solid #e5e5e5",
          borderBottom: "1px solid #e5e5e5",
          background: "#fafafa",
        }}
      >
        {/* Edge fades */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #fafafa, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #fafafa, transparent)" }}
        />

        <div className="flex gap-3 mb-4 marquee-row">
          {items.map((tech, i) => (
            <TechPill key={`a-${i}`} tech={tech} onOpen={() => setActive(tech)} />
          ))}
        </div>
        <div className="flex gap-3 marquee-row-reverse">
          {itemsReversed.map((tech, i) => (
            <TechPill key={`b-${i}`} tech={tech} onOpen={() => setActive(tech)} />
          ))}
        </div>

        <style jsx>{`
          .marquee-row {
            animation: marquee 50s linear infinite;
            width: max-content;
          }
          .marquee-row-reverse {
            animation: marquee-reverse 50s linear infinite;
            width: max-content;
          }
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes marquee-reverse {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
          }
          .marquee-row:hover,
          .marquee-row-reverse:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
      <TechModal tech={active} onClose={() => setActive(null)} />
    </>
  );
}

function TechPill({ tech, onOpen }: { tech: Tech; onOpen: () => void }) {
  const Logo = tech.logo;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${tech.name} — подробнее`}
      className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 whitespace-nowrap transition-colors duration-300 font-mono cursor-pointer"
      style={{
        fontSize: "12px",
        letterSpacing: "0.05em",
        color: "#525252",
        border: "1px solid #e5e5e5",
        background: "#fff",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#2563EB";
        (e.currentTarget as HTMLElement).style.borderColor = "#2563EB";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#525252";
        (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5";
      }}
    >
      {Logo ? (
        <Logo size={12} color={tech.logoColor} />
      ) : tech.fallback ? (
        <span style={{ fontSize: "11px" }}>{tech.fallback}</span>
      ) : null}
      {tech.name}
    </button>
  );
}

/* ═══════════════ SERVICES ═══════════════ */

const SERVICES: Array<{
  id: string;
  title: string;
  desc: string;
  details: string;
  includes: string[];
  price: string;
  time: string;
  stack: string;
  fluentIcon: string;
  splineKind: SplineKind;
}> = [
  {
    id: "web",
    title: "Сайты и веб-платформы",
    desc: "Лендинги, корпоративные сайты, enterprise-платформы. Next.js, интеграции, SEO, аналитика.",
    details:
      "От быстрых лендингов до enterprise-платформ с десятками интеграций. Next.js 16 + React 19 — стек, который одобрит ваш тех-директор. SEO-оптимизация, адаптив и аналитика — из коробки, не отдельным пунктом в смете.",
    includes: [
      "Дизайн-прототип в Figma — превью за 7 дней",
      "Адаптив: mobile · tablet · desktop",
      "Интеграции: CRM, почта, платежи, Bitrix",
      "SEO + метатеги + OpenGraph + sitemap",
      "Аналитика: Yandex.Metrika + GA4 + heatmap",
      "Хостинг Vercel + CDN по миру",
    ],
    price: "от $1 500",
    time: "от 1 месяца",
    stack: "Next.js · React · Postgres",
    fluentIcon: "fluent-emoji:globe-showing-europe-africa",
    splineKind: "globe",
  },
  {
    id: "bots",
    title: "Боты и AI-ассистенты",
    desc: "Telegram, WhatsApp, web-чат. AI-ассистенты обучаем на ваших данных — отвечают 24/7.",
    details:
      "Боты в Telegram, WhatsApp, веб-чате — плюс AI-ассистенты, обученные на вашем каталоге, FAQ и базе знаний. Отвечают 24/7 на типовые вопросы, ведут предзапись, передают горячих лидов оператору.",
    includes: [
      "Telegram · WhatsApp · web-widget",
      "GPT-4 · Claude · локальные LLM на выбор",
      "RAG — обучение на ваших данных",
      "Сценарии + fallback на живого оператора",
      "Аналитика диалогов + тепловая карта вопросов",
      "API-интеграция с Bitrix · amoCRM · 1С",
    ],
    price: "от $900",
    time: "от 2 недель",
    stack: "Python · GPT-4 · aiogram",
    fluentIcon: "fluent-emoji:robot",
    splineKind: "robot",
  },
  {
    id: "automation",
    title: "Автоматизация и CRM",
    desc: "Скоринг лидов, синхронизация с Bitrix/amoCRM/1С, автоворонки, отчётность.",
    details:
      "Связываем разрозненные системы в единый поток. Лиды сами скорятся и распределяются, автоворонки закрывают рутину, отчёты приходят сами. Работаем с Bitrix24, amoCRM, 1С и n8n.",
    includes: [
      "Скоринг лидов по 10+ признакам",
      "Синхронизация CRM ↔ сайт ↔ почта",
      "Автоворонки + reminder-серии",
      "Интеграции с 1С, бухгалтерией, складом",
      "Дашборды с KPI в реальном времени",
      "SLA-оповещения в Telegram",
    ],
    price: "от $1 200",
    time: "от 3 недель",
    stack: "Python · n8n · Bitrix24",
    fluentIcon: "fluent-emoji:gear",
    splineKind: "gear",
  },
  {
    id: "mobile",
    title: "Мобильные приложения",
    desc: "React Native для iOS и Android. Один код — две платформы. Push, in-app, аналитика.",
    details:
      "React Native + Expo — одна кодовая база, iOS и Android одновременно. Публикуем в App Store и Google Play, интегрируем push-уведомления, in-app покупки, геолокацию, offline-режим.",
    includes: [
      "iOS + Android одновременно",
      "React Native · Expo SDK · TypeScript",
      "Push-уведомления + in-app purchases",
      "Offline-first архитектура",
      "Публикация в App Store + Google Play",
      "Интеграция с вашим бэкендом",
    ],
    price: "от $3 500",
    time: "от 6 недель",
    stack: "React Native · Expo",
    fluentIcon: "fluent-emoji:mobile-phone",
    splineKind: "phone",
  },
];

function ServicesGrid() {
  const [active, setActive] = useState<(typeof SERVICES)[number] | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        style={{ borderTop: "1px solid #e5e5e5", borderLeft: "1px solid #e5e5e5" }}
      >
        {SERVICES.map((s, i) => (
          <ServiceCell key={s.id} s={s} i={i} onOpen={() => setActive(s)} />
        ))}
      </div>
      <ServiceModal service={active} onClose={() => setActive(null)} />
    </>
  );
}

function ServiceCell({
  s,
  i,
  onOpen,
}: {
  s: (typeof SERVICES)[number];
  i: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col aspect-square overflow-hidden transition-colors text-left cursor-pointer"
      style={{
        borderRight: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
        background: "#fff",
      }}
    >
      {/* Spline canvas — заполняет верхнюю часть карточки */}
      <div className="relative flex-1 min-h-0">
        <LiquidSpline kind={s.splineKind} />
        {/* Fade-out снизу для плавного перехода к тексту */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #fff)" }}
        />
        <span
          className="absolute top-4 right-4 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#2563EB", letterSpacing: "0.2em" }}
        >
          OPEN →
        </span>
      </div>

      {/* Текст внизу */}
      <div className="relative px-6 lg:px-8 pb-6 lg:pb-8 flex flex-col gap-2.5 shrink-0">
        <h3
          className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
          style={{ fontSize: "clamp(1.05rem, 1.3vw, 1.25rem)", lineHeight: 1.2, color: "#0a0a0a" }}
        >
          {s.title}
        </h3>
        <p className="text-[13px]" style={{ color: "#525252", lineHeight: 1.45 }}>
          {s.desc}
        </p>
        <div
          className="flex items-center justify-between pt-2.5"
          style={{ borderTop: "1px solid #f0f0f0" }}
        >
          <span className="font-mono text-[10.5px]" style={{ color: "#0a0a0a", letterSpacing: "0.1em" }}>
            {s.time}
          </span>
          <span className="font-mono text-[9.5px]" style={{ color: "#9ca3af", letterSpacing: "0.1em" }}>
            {s.stack}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════ FINAL CTA ═══════════════ */

function FinalCTA() {
  return (
    <section
      className="px-6 lg:px-12 py-20 lg:py-32 relative overflow-hidden"
      style={{ background: "#fafafa", color: "#0a0a0a", borderTop: "1px solid #e5e5e5" }}
    >
      <div className="relative max-w-3xl">
        <div
          className="font-mono text-[11px] mb-6"
          style={{ color: "#2563EB", letterSpacing: "0.3em" }}
        >
          START
        </div>
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)", lineHeight: 1, letterSpacing: "-0.03em" }}
        >
          Посчитать
          <br />
          свой путь.
        </h2>
        <p
          className="mt-6 max-w-xl text-[16px]"
          style={{ color: "rgba(10,10,10,0.65)", lineHeight: 1.55 }}
        >
          Шесть вопросов за 3 минуты. Получите оценку по времени и цене — без созвонов,
          без «оставьте номер — мы перезвоним».
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/client/request"
            className="inline-flex items-center gap-3 px-7 py-4 font-medium transition-colors"
            style={{
              background: "#2563EB",
              color: "#fff",
              fontSize: "15px",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#2563EB")}
          >
            Начать — 6 вопросов
            <span>→</span>
          </Link>
          <a
            href="mailto:hello@asystem.ai"
            className="inline-flex items-center gap-3 px-7 py-4 font-medium transition-colors"
            style={{
              border: "1px solid rgba(10,10,10,0.2)",
              color: "#0a0a0a",
              fontSize: "15px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(10,10,10,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            hello@asystem.ai
          </a>
        </div>

        <div
          className="mt-16 flex items-center gap-8 font-mono text-[11px]"
          style={{ color: "rgba(10,10,10,0.4)", letterSpacing: "0.15em" }}
        >
          <span>✓ БЕЗ ПРЕДОПЛАТЫ</span>
          <span>✓ ФИКС-ЦЕНА</span>
          <span>✓ ОТВЕТ ЗА 24 ЧАСА</span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ SUBMIT ROW ═══════════════ */

function SubmitRow() {
  return (
    <div
      className="flex items-center justify-between px-6 lg:px-12 py-8"
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      <div className="font-mono text-[11px]" style={{ color: "#9ca3af", letterSpacing: "0.2em" }}>
        {CLIENTS.length + LAB.length + TEAM.length} BLOCKS · ∞
      </div>
      <Link
        href="/client/request"
        className="font-mono text-[12px] transition-colors"
        style={{ color: "#0a0a0a", letterSpacing: "0.1em" }}
      >
        начать проект →
      </Link>
    </div>
  );
}
