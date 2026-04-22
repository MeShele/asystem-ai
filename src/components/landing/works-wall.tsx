"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, useMotionValue, useScroll, useTransform, animate } from "framer-motion";
import { Compass, PenTool, Rocket, Server, ShieldCheck, Zap, Clock, Infinity as InfinityIcon } from "lucide-react";

/* ═══════════════ ACTIVE SECTION TRACKING ═══════════════ */

const ActiveSectionContext = createContext<string | null>(null);

// ID всех секций в порядке появления, для отслеживания
const TRACKED_SECTIONS = [
  "clients",
  "guarantees",
  "services",
  "process",
  "stack",
  "stats",
  "lab",
  "testimonials",
  "team",
];

function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Найти запись с максимальной intersection-ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    TRACKED_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
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

type LabTile = {
  id: string;
  title: string;
  kicker: string;
  desc: string;
  bg: string;
  text: "light" | "dark";
  pattern?: "grid" | "dots" | "lines" | "radial" | "rings" | "noise";
  accent?: string;
};

const LAB: LabTile[] = [
  {
    id: "partner-calc",
    title: "Партнёрский калькулятор",
    kicker: "TOOL",
    desc: "Партнёр считает маржу сам — базовая цена плюс свободная наценка.",
    bg: "#0a0a0a",
    text: "light",
    pattern: "grid",
    accent: "#3b82f6",
  },
  {
    id: "mvp-no-prepay",
    title: "MVP без предоплаты",
    kicker: "МОДЕЛЬ",
    desc: "Инверсия риска — сначала MVP, потом счёт. Клиент видит результат раньше денег.",
    bg: "#f5f5f5",
    text: "dark",
    pattern: "lines",
    accent: "#10b981",
  },
  {
    id: "ai-audit",
    title: "AI-аудит процесса",
    kicker: "ЭКСПЕРИМЕНТ",
    desc: "Ассистент слушает звонки клиента и находит утечки в воронке.",
    bg: "linear-gradient(135deg, #0f172a, #1e293b)",
    text: "light",
    pattern: "dots",
    accent: "#a855f7",
  },
  {
    id: "tg-bot",
    title: "Telegram-бот заявок",
    kicker: "ИНТЕГРАЦИЯ",
    desc: "Заявка из формы → Bitrix → уведомление в Telegram за 3 минуты.",
    bg: "#229ED9",
    text: "light",
    pattern: "rings",
  },
  {
    id: "realtime",
    title: "Realtime-дашборд",
    kicker: "КОНЦЕПТ",
    desc: "Клиент видит статусы своих проектов и заявок в одной панели.",
    bg: "#111827",
    text: "light",
    pattern: "radial",
    accent: "#ef4444",
  },
  {
    id: "crm-sync",
    title: "CRM-синхронизация",
    kicker: "БЭКЕНД",
    desc: "Универсальный коннектор между сайтом и Bitrix / amoCRM / Notion.",
    bg: "#fafafa",
    text: "dark",
    pattern: "grid",
    accent: "#000",
  },
  {
    id: "ascii-easter",
    title: "ASCII в DevTools",
    kicker: "ФИРМА",
    desc: "Открываешь F12 на любом нашем проекте — встречает подпись мастерской.",
    bg: "#000",
    text: "light",
    pattern: "noise",
    accent: "#22c55e",
  },
  {
    id: "inversion",
    title: "Инверсия риска",
    kicker: "ФИЛОСОФИЯ",
    desc: "Не клиент рискует, а мы. Хеджирование — продукт остаётся как актив.",
    bg: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    text: "dark",
    pattern: "lines",
    accent: "#0f172a",
  },
];

const TEAM: Array<{ key: string; photo: string }> = [
  { key: "member1", photo: "/team/asylbek.png" },
  { key: "member2", photo: "/team/urmat.png" },
  { key: "member3", photo: "/team/nasip.png" },
  { key: "member4", photo: "/team/dastan.png" },
  { key: "member5", photo: "/team/saadat.png" },
  { key: "member6", photo: "/team/suimonkul.png" },
  { key: "member7", photo: "/team/akylay.png" },
  { key: "member8", photo: "/team/ermek.png" },
  { key: "member9", photo: "/team/ruslan.png" },
  { key: "member10", photo: "/team/emir.png" },
  { key: "member11", photo: "/team/alan.png" },
  { key: "member12", photo: "/team/alinur.png" },
  { key: "member13", photo: "/team/nerses.png" },
  { key: "member14", photo: "/team/azamat.png" },
  { key: "member15", photo: "/team/ivan.png" },
  { key: "member16", photo: "/team/asel.png" },
];

export function WorksWall() {
  const activeSection = useActiveSection();
  return (
    <ActiveSectionContext.Provider value={activeSection}>
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
      className="lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto px-6 lg:px-8 py-8 lg:py-12 flex flex-col gap-10"
      style={{
        borderRight: "1px solid #e5e5e5",
        background: "#fff",
      }}
    >
      <Link href="/" className="inline-flex items-baseline gap-1 group" aria-label="asystem.ai">
        <span className="text-[22px] font-semibold tracking-tight">asystem</span>
        <span className="text-[22px] font-semibold" style={{ color: "#ef4444" }}>.</span>
        <span className="text-[22px] font-semibold tracking-tight">ai</span>
        <span
          className="ml-2 font-mono text-[10px]"
          style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
        >
          [r2026]
        </span>
      </Link>

      <SidebarGroup title="Works">
        <SidebarLink href="#clients">клиенты · 4</SidebarLink>
        <SidebarLink href="#guarantees">гарантии · 4</SidebarLink>
        <SidebarLink href="#services">услуги · 4</SidebarLink>
        <SidebarLink href="#process">процесс · 4</SidebarLink>
        <SidebarLink href="#stack">стек</SidebarLink>
        <SidebarLink href="#stats">цифры</SidebarLink>
        <SidebarLink href="#lab">лаборатория · 8</SidebarLink>
        <SidebarLink href="#testimonials">отзывы</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Company">
        <SidebarLink href="#team">команда · 16</SidebarLink>
        <SidebarLink href="/partner">партнёрам</SidebarLink>
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
        color: isActive ? "#ef4444" : "#0a0a0a",
        transform: isActive ? "translateX(4px)" : "translateX(0)",
      }}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active-dot"
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.6)" }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = "#ef4444";
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

function LiveTimestamp() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Almaty",
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
      СЕЙЧАС · {time} · ALMATY · ONLINE
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */

function Main() {
  return (
    <main id="main-content" className="flex-1 min-w-0">
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
        id="stats"
        kicker="Numbers"
        title="В цифрах"
        subtitle="Что мы измеряем в наших проектах."
      />
      <StatsStrip />

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
        id="testimonials"
        kicker="Proof"
        title="Говорят клиенты"
        subtitle="Что пишут те, кто уже прошёл этот путь с нами."
      />
      <Testimonials />

      <SectionHeader
        id="team"
        kicker="Team · 16"
        title="Команда"
        subtitle="Дизайн, код, маркетинг, аналитика — внутри. Без субподряда."
      />
      <TeamGrid />

      <FinalCTA />

      <SubmitRow />
    </main>
  );
}

function SectionHeader({
  id,
  kicker,
  title,
  subtitle,
}: {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.header
      id={id}
      className="px-6 lg:px-12 py-16 lg:py-20"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="font-mono text-[11px] mb-4 inline-flex items-center gap-2"
        style={{ color: "#9ca3af", letterSpacing: "0.2em", textTransform: "uppercase" }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
        {kicker}
      </div>
      <h1
        className="font-semibold tracking-tight"
        style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
      >
        {title}
      </h1>
      <p className="mt-3 text-[15px] max-w-xl" style={{ color: "#6b7280", lineHeight: 1.5 }}>
        {subtitle}
      </p>
    </motion.header>
  );
}

/* ═══════════════ CLIENT TILE — информативная ═══════════════ */

function ClientCell({ c, index }: { c: ClientTile; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  // Parallax: логотип плавно едет вверх на 30px по мере прокрутки карточки через viewport (desktop)
  const logoY = useTransform(scrollYProgress, [0, 1], ["15%", "-15%"]);
  // Noise-оверлей едет в противоположную сторону на 10% для глубины
  const bgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <motion.a
      ref={cardRef}
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

        <motion.div
          className="transition-transform duration-500 group-hover:scale-105 will-change-transform"
          style={{
            maxWidth: "60%",
            maxHeight: "70%",
            y: logoY,
          }}
        >
          <Image
            src={c.logo}
            alt={c.name}
            width={c.logoW}
            height={c.logoH}
            className="object-contain w-full h-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </motion.div>

        {/* Noise texture с parallax */}
        <motion.div
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay will-change-transform"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            y: bgY,
          }}
        />
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

        <div className="font-mono text-[11px]" style={{ color: "#9ca3af", letterSpacing: "0.1em" }}>
          {c.stack}
        </div>
      </div>
    </motion.a>
  );
}

/* ═══════════════ LAB TILE ═══════════════ */

function LabCell({ l, i }: { l: LabTile; i: number }) {
  const textColor = l.text === "light" ? "#fff" : "#0a0a0a";
  const subtleColor = l.text === "light" ? "rgba(255,255,255,0.55)" : "rgba(10,10,10,0.55)";

  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (i % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative aspect-square overflow-hidden flex flex-col justify-between p-5"
      style={{
        background: l.bg,
        borderRight: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <LabPattern pattern={l.pattern} text={l.text} accent={l.accent} />

      <div className="relative z-10 flex flex-col h-full">
        <div
          className="font-mono text-[10px]"
          style={{
            color: subtleColor,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          {l.kicker}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div
            className="font-semibold tracking-tight leading-tight transition-transform duration-500 group-hover:translate-x-1"
            style={{ color: textColor, fontSize: "clamp(1rem, 1.4vw, 1.25rem)" }}
          >
            {l.title}
          </div>
          <p
            className="text-[12.5px] leading-snug"
            style={{ color: subtleColor }}
          >
            {l.desc}
          </p>
        </div>
      </div>
    </motion.a>
  );
}

function LabPattern({
  pattern,
  text,
  accent,
}: {
  pattern?: LabTile["pattern"];
  text: "light" | "dark";
  accent?: string;
}) {
  if (!pattern) return null;
  const strokeMain = text === "light" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const strokeAccent = accent ?? strokeMain;

  switch (pattern) {
    case "grid":
      return (
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none"
          style={{
            opacity: 0.45,
            backgroundImage: `linear-gradient(${strokeMain} 1px, transparent 1px), linear-gradient(90deg, ${strokeMain} 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      );
    case "dots":
      return (
        <div
          className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80 pointer-events-none"
          style={{
            opacity: 0.6,
            backgroundImage: `radial-gradient(${strokeMain} 1.5px, transparent 1.6px)`,
            backgroundSize: "20px 20px",
          }}
        />
      );
    case "lines":
      return (
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:-translate-x-2 pointer-events-none"
          style={{
            opacity: 0.5,
            backgroundImage: `repeating-linear-gradient(45deg, ${strokeMain} 0 1px, transparent 1px 14px)`,
          }}
        />
      );
    case "radial":
      return (
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${strokeAccent} 0%, transparent 50%)`,
            opacity: 0.35,
          }}
        />
      );
    case "rings":
      return (
        <svg
          className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          {[20, 45, 72, 100, 130].map((r) => (
            <circle key={r} cx="100" cy="180" r={r} stroke={strokeMain} strokeWidth="1" />
          ))}
        </svg>
      );
    case "noise":
      return (
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      );
    default:
      return null;
  }
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
        loading="eager"
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
  { icon: ShieldCheck, value: "0 с", label: "БЕЗ ПРЕДОПЛАТЫ", sub: "Сначала MVP — потом счёт" },
  { icon: Zap, value: "FIX", label: "ФИКС-ЦЕНА", sub: "Базовая цена известна заранее" },
  { icon: Clock, value: "24h", label: "ОТВЕТ ПО КП", sub: "Шесть вопросов — и у вас цифры" },
  { icon: InfinityIcon, value: "∞", label: "КОД ВАШ", sub: "Репозиторий и доступы с первого дня" },
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
      style={{ background: "#0a0a0a", color: "#fff", borderTop: "1px solid #e5e5e5" }}
    >
      {/* Subtle grid pattern с легким parallax */}
      <motion.div
        className="absolute inset-0 opacity-25 pointer-events-none will-change-transform"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        initial={{ scale: 1.05, opacity: 0 }}
        animate={headerInView ? { scale: 1, opacity: 0.25 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative">
        {/* Mask-reveal header */}
        <div className="max-w-3xl mb-12 lg:mb-16 overflow-hidden">
          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={headerInView ? { clipPath: "inset(0% 0 0 0)" } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="font-mono text-[11px] mb-4 inline-flex items-center gap-2"
              style={{ color: "#ef4444", letterSpacing: "0.2em" }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
              PEACE OF MIND
            </div>
            <h2
              className="font-semibold tracking-tight"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", lineHeight: 1.1 }}
            >
              Четыре обещания.
              <br />
              И <span style={{ color: "#ef4444" }}>четыре клиента</span>, которые их проверили.
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.08)" }}>
          {GUARANTEES.map((g, i) => (
            <GuaranteeCell key={i} g={g} index={i} parentRevealed={revealed} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-10 flex items-center gap-3 font-mono text-[11px]"
          style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.15em" }}
        >
          <span className="inline-block w-8 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
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
  const Icon = g.icon;

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
      style={{ background: "#0a0a0a" }}
    >
      <Icon
        className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-3deg]"
        size={24}
        strokeWidth={1.5}
        style={{ color: "#ef4444" }}
      />
      <div
        className="font-semibold tracking-tight"
        style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", lineHeight: 1 }}
      >
        {g.value}
      </div>
      <div>
        <div
          className="font-mono text-[11px] mb-2"
          style={{ color: "#ef4444", letterSpacing: "0.15em" }}
        >
          {g.label}
        </div>
        <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
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
  duration: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}> = [
  {
    id: "discovery",
    step: "01",
    title: "Discovery",
    desc: "30-минутный созвон. Слушаем реальную боль, не пишем ТЗ на 14 страниц. Определяем бизнес-цель.",
    duration: "1-2 дня",
    icon: Compass,
  },
  {
    id: "design",
    step: "02",
    title: "Проектирование",
    desc: "Архитектура, UX, прототип. Один цикл правок перед стартом разработки. Фикс-цена после этого шага.",
    duration: "3-7 дней",
    icon: PenTool,
  },
  {
    id: "build",
    step: "03",
    title: "Разработка MVP",
    desc: "Спринты по неделе. Вы видите прогресс в режиме реального времени через Telegram + превью.",
    duration: "3-6 недель",
    icon: Rocket,
  },
  {
    id: "production",
    step: "04",
    title: "Production",
    desc: "Деплой, мониторинг, передача кода и доступов. Только после этого выставляем счёт.",
    duration: "+ поддержка",
    icon: Server,
  },
];

function ProcessSteps() {
  return (
    <div
      className="flex flex-col"
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      {PROCESS.map((p, i) => (
        <ProcessRow key={p.id} p={p} index={i} />
      ))}
    </div>
  );
}

function ProcessRow({
  p,
  index,
}: {
  p: (typeof PROCESS)[number];
  index: number;
}) {
  const Icon = p.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group grid grid-cols-1 md:grid-cols-[120px_80px_1fr_140px] items-start gap-4 md:gap-8 px-6 lg:px-12 py-8 lg:py-10 transition-colors"
      style={{
        borderBottom: "1px solid #e5e5e5",
        background: "#fff",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fafafa")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}
    >
      <div
        className="font-semibold tracking-tight select-none transition-colors duration-500 group-hover:text-[#ef4444]"
        style={{
          fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
          lineHeight: 1,
          color: "#e5e5e5",
        }}
      >
        {p.step}
      </div>

      <div className="flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
        <Icon size={32} strokeWidth={1.25} className="text-[#0a0a0a]" />
      </div>

      <div className="flex flex-col gap-2">
        <h3
          className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
          style={{ fontSize: "clamp(1.25rem, 1.8vw, 1.75rem)", lineHeight: 1.15, color: "#0a0a0a" }}
        >
          {p.title}
        </h3>
        <p className="text-[14.5px] max-w-xl" style={{ color: "#525252", lineHeight: 1.55 }}>
          {p.desc}
        </p>
      </div>

      <div className="md:text-right">
        <div className="font-mono text-[10px]" style={{ color: "#9ca3af", letterSpacing: "0.2em" }}>
          DURATION
        </div>
        <div className="font-mono text-[13px] mt-1" style={{ color: "#0a0a0a", letterSpacing: "0.05em" }}>
          {p.duration}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ TECH MARQUEE ═══════════════ */

const TECH_ITEMS = [
  "Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Supabase",
  "Prisma", "Tailwind CSS v4", "shadcn/ui", "Framer Motion", "next-intl",
  "Telegram Bot API", "Bitrix24", "amoCRM", "1C", "n8n",
  "OpenAI GPT-4o", "Claude", "Anthropic SDK", "Whisper", "pgvector",
  "Docker", "Vercel", "GitHub Actions", "Playwright", "Stripe",
  "OCPP", "React Native", "Expo", "WebSocket", "Redis",
];

function TechMarquee() {
  const items = [...TECH_ITEMS, ...TECH_ITEMS];
  const reversed = [...TECH_ITEMS].reverse();
  const itemsReversed = [...reversed, ...reversed];

  return (
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
          <TechPill key={`a-${i}`} tech={tech} />
        ))}
      </div>
      <div className="flex gap-3 marquee-row-reverse">
        {itemsReversed.map((tech, i) => (
          <TechPill key={`b-${i}`} tech={tech} />
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
  );
}

function TechPill({ tech }: { tech: string }) {
  return (
    <span
      className="flex-shrink-0 px-4 py-2 whitespace-nowrap transition-colors duration-300 font-mono"
      style={{
        fontSize: "12px",
        letterSpacing: "0.05em",
        color: "#525252",
        border: "1px solid #e5e5e5",
        background: "#fff",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#ef4444";
        (e.currentTarget as HTMLElement).style.borderColor = "#ef4444";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "#525252";
        (e.currentTarget as HTMLElement).style.borderColor = "#e5e5e5";
      }}
    >
      {tech}
    </span>
  );
}

/* ═══════════════ SERVICES ═══════════════ */

const SERVICES: Array<{
  id: string;
  title: string;
  desc: string;
  time: string;
  stack: string;
  icon: string;
}> = [
  {
    id: "web",
    title: "Сайты и веб-платформы",
    desc: "Лендинги, корпоративные сайты, enterprise-платформы. Next.js, интеграции, SEO, аналитика.",
    time: "от 1 месяца",
    stack: "Next.js · React · Postgres",
    icon: "↗",
  },
  {
    id: "bots",
    title: "Боты и AI-ассистенты",
    desc: "Telegram, WhatsApp, web-чат. AI-ассистенты обучаем на ваших данных — отвечают 24/7.",
    time: "от 2 недель",
    stack: "Python · GPT-4 · aiogram",
    icon: "◐",
  },
  {
    id: "automation",
    title: "Автоматизация и CRM",
    desc: "Скоринг лидов, синхронизация с Bitrix/amoCRM/1С, автоворонки, отчётность.",
    time: "от 3 недель",
    stack: "Python · n8n · Bitrix24",
    icon: "⚡",
  },
  {
    id: "mobile",
    title: "Мобильные приложения",
    desc: "React Native для iOS и Android. Один код — две платформы. Push, in-app, аналитика.",
    time: "от 6 недель",
    stack: "React Native · Expo",
    icon: "◱",
  },
];

function ServicesGrid() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
      style={{ borderTop: "1px solid #e5e5e5", borderLeft: "1px solid #e5e5e5" }}
    >
      {SERVICES.map((s, i) => (
        <ServiceCell key={s.id} s={s} i={i} />
      ))}
    </div>
  );
}

function ServiceCell({ s, i }: { s: (typeof SERVICES)[number]; i: number }) {
  return (
    <motion.a
      href="/client/request"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col justify-between p-6 lg:p-8 aspect-square transition-colors"
      style={{
        borderRight: "1px solid #e5e5e5",
        borderBottom: "1px solid #e5e5e5",
        background: "#fff",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fafafa")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#fff")}
    >
      <div className="flex items-start justify-between">
        <div
          className="font-mono text-[10px]"
          style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
        >
          0{i + 1} / SERVICE
        </div>
        <span
          className="font-display"
          style={{ fontSize: "28px", color: "#ef4444", lineHeight: 1 }}
        >
          {s.icon}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h3
          className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
          style={{ fontSize: "clamp(1.125rem, 1.4vw, 1.375rem)", lineHeight: 1.2, color: "#0a0a0a" }}
        >
          {s.title}
        </h3>
        <p className="text-[13.5px]" style={{ color: "#525252", lineHeight: 1.5 }}>
          {s.desc}
        </p>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #f0f0f0" }}>
          <span className="font-mono text-[11px]" style={{ color: "#0a0a0a", letterSpacing: "0.1em" }}>
            {s.time}
          </span>
          <span className="font-mono text-[10px]" style={{ color: "#9ca3af", letterSpacing: "0.1em" }}>
            {s.stack}
          </span>
        </div>
      </div>
    </motion.a>
  );
}

/* ═══════════════ STATS ═══════════════ */

const STATS: Array<{ value: string; label: string; sub?: string }> = [
  { value: "4×", label: "БЫСТРЕЕ РЫНКА", sub: "Средний срок запуска" },
  { value: "0 с", label: "БЕЗ ПРЕДОПЛАТЫ", sub: "MVP — потом счёт" },
  { value: "99.2%", label: "ТОЧНОСТЬ AI", sub: "На парсинге и скоринге" },
  { value: "3 мин", label: "ОТВЕТ МЕНЕДЖЕРА", sub: "Среднее по проектам" },
];

function StatsStrip() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4"
      style={{
        borderTop: "1px solid #e5e5e5",
        borderLeft: "1px solid #e5e5e5",
        background: "#0a0a0a",
        color: "#fff",
      }}
    >
      {STATS.map((s, i) => (
        <StatCell key={i} s={s} i={i} />
      ))}
    </div>
  );
}

function StatCell({ s, i }: { s: (typeof STATS)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="p-8 lg:p-10 flex flex-col gap-3 group"
      style={{
        borderRight: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="font-mono text-[10px] flex items-center gap-2"
        style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.2em" }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: "#10b981", boxShadow: "0 0 8px #10b981" }}
        />
        {String(i + 1).padStart(2, "0")} / STAT
      </div>
      <div
        className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
        style={{ fontSize: "clamp(2.25rem, 4vw, 3.75rem)", lineHeight: 1 }}
      >
        <AnimatedStatValue value={s.value} inView={isInView} delay={i * 0.1} />
      </div>
      <div className="mt-auto">
        <div
          className="font-mono text-[11px]"
          style={{ color: "#ef4444", letterSpacing: "0.15em" }}
        >
          {s.label}
        </div>
        {s.sub && (
          <div className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            {s.sub}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AnimatedStatValue({ value, inView, delay }: { value: string; inView: boolean; delay: number }) {
  // Extract numeric part if exists: "4×" → 4 + "×", "99.2%" → 99.2 + "%", "3 мин" → 3 + " мин", "0 с" → 0 + " ₸"
  const match = value.match(/^([\d.]+)(.*)$/);
  const [display, setDisplay] = useState(() => (match ? "0" + (match[2] ?? "") : value));
  const mv = useMotionValue(0);

  useEffect(() => {
    if (!inView || !match) return;
    const target = parseFloat(match[1]);
    const suffix = match[2] ?? "";
    const controls = animate(mv, target, {
      duration: 1.2,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const formatted =
          target % 1 === 0 ? Math.round(v).toString() : v.toFixed(1);
        setDisplay(formatted + suffix);
      },
    });
    return () => controls.stop();
  }, [inView, match, mv, delay]);

  if (!match) return <>{value}</>;
  return <>{display}</>;
}

/* ═══════════════ TESTIMONIALS ═══════════════ */

const TESTIMONIALS: Array<{
  quote: string;
  author: string;
  role: string;
  metric: string;
}> = [
  {
    quote:
      "Сделали за 3 недели то, что другие обещали за 3 месяца. Реально без предоплаты — сначала увидел результат, потом платил.",
    author: "Директор",
    role: "Tulpar Express",
    metric: "−68% времени на синхронизацию",
  },
  {
    quote:
      "Интеграция с 1С прошла без единой ошибки в учёте. Команда знает что делает. И — отвечают в Telegram в 3 минуты.",
    author: "Руководитель IT",
    role: "Red Petroleum",
    metric: "100% автоматизация склада",
  },
];

function Testimonials() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{ borderTop: "1px solid #e5e5e5", borderLeft: "1px solid #e5e5e5" }}
    >
      {TESTIMONIALS.map((t, i) => (
        <blockquote
          key={i}
          className="p-8 lg:p-12 flex flex-col gap-8"
          style={{
            borderRight: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
            background: i === 0 ? "#fff" : "#fafafa",
          }}
        >
          <div
            className="font-mono text-[11px]"
            style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
          >
            TESTIMONIAL · 0{i + 1}
          </div>

          <p
            className="font-display"
            style={{
              fontSize: "clamp(1.15rem, 1.6vw, 1.5rem)",
              lineHeight: 1.4,
              color: "#0a0a0a",
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: "#ef4444" }}>&ldquo;</span>
            {t.quote}
            <span style={{ color: "#ef4444" }}>&rdquo;</span>
          </p>

          <div className="mt-auto flex items-end justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold" style={{ color: "#0a0a0a" }}>
                {t.author}
              </div>
              <div className="text-[13px]" style={{ color: "#6b7280" }}>
                {t.role}
              </div>
            </div>
            <div
              className="font-mono text-[11px] text-right"
              style={{ color: "#10b981", letterSpacing: "0.1em" }}
            >
              {t.metric}
            </div>
          </div>
        </blockquote>
      ))}
    </div>
  );
}

/* ═══════════════ FINAL CTA ═══════════════ */

function FinalCTA() {
  return (
    <section
      className="px-6 lg:px-12 py-20 lg:py-32 relative overflow-hidden"
      style={{ background: "#0a0a0a", color: "#fff", borderTop: "1px solid #e5e5e5" }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-3xl">
        <div
          className="font-mono text-[11px] mb-6"
          style={{ color: "#ef4444", letterSpacing: "0.3em" }}
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
          style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}
        >
          Шесть вопросов за 3 минуты. Получите оценку по времени и цене — без созвонов,
          без «оставьте номер — мы перезвоним».
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/client/request"
            className="inline-flex items-center gap-3 px-7 py-4 font-medium transition-colors"
            style={{
              background: "#ef4444",
              color: "#fff",
              fontSize: "15px",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#dc2626")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#ef4444")}
          >
            Начать — 6 вопросов
            <span>→</span>
          </Link>
          <a
            href="mailto:hello@asystem.ai"
            className="inline-flex items-center gap-3 px-7 py-4 font-medium transition-colors"
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: "15px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
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
          style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}
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
