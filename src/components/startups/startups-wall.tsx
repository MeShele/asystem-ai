"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useInView, MotionConfig } from "framer-motion";
import {
  FileText,
  Palette,
  Code2,
  ClipboardCheck,
  RotateCcw,
  Check,
  X,
  Building2,
  Search,
  Zap,
  Rocket,
  Bot,
  ShieldCheck,
  Calculator,
  Scale,
  TrendingUp,
  BarChart3,
  Wrench,
  Settings2,
  Layers,
  Activity,
  Cpu,
  Network,
  Gavel,
  Plus,
  ArrowDownRight,
  Coffee,
  CalendarOff,
  XCircle,
  Sparkles,
  Infinity as InfinityIcon,
  User,
  Hourglass,
  AlertTriangle,
  UserPlus,
  MoveRight,
  CornerDownRight,
  ArrowRight,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import { MeshGradient, Warp, GrainGradient, Swirl, NeuroNoise, DotOrbit, PulsingBorder, Spiral, SmokeRing, PerlinNoise } from "@paper-design/shaders-react";
import { LiquidSpline } from "@/components/landing/liquid-spline";
import { LabCanvas } from "@/components/landing/lab-3d";
import { CountUp } from "@/components/shared/count-up";
import { SpotlightLayer } from "@/components/shared/spotlight-layer";
import { RadialOrbitalTimeline } from "@/components/shared/radial-orbital-timeline";
import { SplineScene } from "@/components/shared/spline-scene";
import { MobileTopBar } from "@/components/shared/mobile-topbar";
import { BlobBg } from "@/components/shared/blob-bg";

const STARTUPS_MOBILE_NAV = [
  {
    title: "Startups",
    items: [
      { label: "проблема", href: "#pain" },
      { label: "процесс · 4", href: "#steps" },
      { label: "путь · 2", href: "#choice" },
      { label: "ai-сотрудник", href: "#ai-staff" },
      { label: "рост", href: "#growth" },
      { label: "faq · 6", href: "#faq" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "← на главную", href: "/" },
      { label: "заявка", href: "/client/request" },
    ],
  },
  {
    title: "Contact",
    items: [
      { label: "asystem.teamwork@gmail.com", href: "mailto:asystem.teamwork@gmail.com", external: true },
      { label: "Telegram", href: "https://t.me/asystem_studio", external: true },
      { label: "WhatsApp", href: "https://wa.me/996500115133", external: true },
    ],
  },
];

/* ═══════════════ ACTIVE SECTION TRACKING ═══════════════ */

const ActiveSectionContext = createContext<string | null>(null);

const TRACKED_SECTIONS = [
  "pain",
  "steps",
  "choice",
  "ai-staff",
  "growth",
  "faq",
];

function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const compute = () => {
      rafId = null;
      const anchor = window.innerHeight * 0.3;
      let current: string | null = null;

      for (const id of TRACKED_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - anchor <= 0 && rect.bottom > anchor) {
          current = id;
          break;
        }
      }

      if (!current) {
        const first = document.getElementById(TRACKED_SECTIONS[0]);
        if (first) {
          const r = first.getBoundingClientRect();
          if (r.top > anchor) {
            setActive(null);
            return;
          }
        }
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

/* ═══════════════ ROOT ═══════════════ */

export function StartupsWall() {
  const activeSection = useActiveSection();
  return (
    <ActiveSectionContext.Provider value={activeSection}>
      <MobileTopBar groups={STARTUPS_MOBILE_NAV} />
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

      <SidebarGroup title="Startups">
        <SidebarLink href="#pain">проблема</SidebarLink>
        <SidebarLink href="#steps">процесс · 4</SidebarLink>
        <SidebarLink href="#choice">путь · 2</SidebarLink>
        <SidebarLink href="#ai-staff">ai-сотрудник</SidebarLink>
        <SidebarLink href="#growth">рост</SidebarLink>
        <SidebarLink href="#faq">faq · 6</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Company">
        <SidebarLink href="/">← на главную</SidebarLink>
        <SidebarLink href="/client/request">заявка</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Contact">
        <SidebarLink href="mailto:asystem.teamwork@gmail.com" external>asystem.teamwork@gmail.com</SidebarLink>
        <SidebarLink href="https://t.me/asystem_studio" external>Telegram</SidebarLink>
        <SidebarLink href="https://wa.me/996500115133" external>WhatsApp</SidebarLink>
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
          layoutId="startups-sidebar-active-dot"
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
      <style>{`
        @keyframes painLiveBg {
          0%, 100% {
            background-position: 0% 0%, 100% 100%, 50% 50%;
          }
          33% {
            background-position: 100% 0%, 0% 100%, 30% 70%;
          }
          66% {
            background-position: 50% 100%, 70% 0%, 70% 30%;
          }
        }
      `}</style>
      <HeroBar />
      <PainTimeline />
      <StepsProcess />
      <PathChoice />
      <AIEmployee />
      {/* spawn только на desktop — Spline тяжёлый для телефонов */}
      <div className="hidden lg:block">
        <RobotSpawnSection />
      </div>
      <GrowthCycle />
      <StartupsFAQ />
      <FinalCTA />
      <SubmitRow />
      <FooterWordmark />
    </main>
  );
}

function RobotSpawnSection() {
  return (
    <section
      style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}
    >
      <SectionHeader
        id="spawn"
        kicker="● ПОТРОГАЙ САМ"
        kickerColor="#10b981"
        title="Соберите команду — по одному клику"
      />

      <div className="px-4 lg:px-8 pb-7 lg:pb-10 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
          style={{
            height: "clamp(440px, 56vh, 620px)",
          }}
        >
          <div
            className="relative w-full h-full overflow-hidden flex flex-col"
            style={{
              background: "#fff",
              border: "1px solid rgba(10,10,10,0.08)",
              borderRadius: "12px",
              boxShadow:
                "0 24px 60px rgba(37,99,235,0.18), 0 8px 20px rgba(10,10,10,0.06)",
            }}
          >
            {/* Title bar — Mac traffic lights + URL */}
            <div
              className="relative flex items-center gap-3 px-4 py-3 shrink-0"
              style={{
                background: "linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)",
                borderBottom: "1px solid rgba(10,10,10,0.08)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
              </div>
              <div
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-md"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(10,10,10,0.08)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#10b981" }}
                />
                <span
                  className="font-mono text-[10.5px] truncate"
                  style={{ color: "#525252", letterSpacing: "0.05em" }}
                >
                  asystem.ai/spawn
                </span>
              </div>
              <Sparkles size={12} strokeWidth={1.7} style={{ color: "#2563EB" }} />
            </div>

            {/* Viewport — robot spawner с живым фоном */}
            <div
              className="relative flex-1 overflow-hidden"
              style={{
                background: "linear-gradient(180deg, #f5f9ff 0%, #e0eaff 100%)",
              }}
            >
              {/* animated radial blobs (CSS-only) */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 25% 30%, rgba(96,165,250,0.42) 0%, transparent 45%), radial-gradient(circle at 75% 25%, rgba(147,197,253,0.4) 0%, transparent 45%), radial-gradient(circle at 65% 80%, rgba(37,99,235,0.32) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(59,130,246,0.28) 0%, transparent 45%)",
                  backgroundSize: "200% 200%, 220% 220%, 180% 180%, 200% 200%",
                  animation: "spawnBgFlow 22s ease-in-out infinite",
                }}
              />
              {/* fine grid overlay для текстуры */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-[0.18]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(37,99,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  maskImage:
                    "radial-gradient(ellipse at 50% 50%, black 0%, black 60%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at 50% 50%, black 0%, black 60%, transparent 100%)",
                }}
              />
              <HeroRobotSpawner />
              <style>{`
                @keyframes spawnBgFlow {
                  0%, 100% {
                    background-position: 0% 0%, 100% 0%, 100% 100%, 0% 100%;
                  }
                  25% {
                    background-position: 30% 10%, 70% 20%, 70% 80%, 30% 90%;
                  }
                  50% {
                    background-position: 60% 30%, 40% 40%, 40% 60%, 60% 70%;
                  }
                  75% {
                    background-position: 20% 60%, 80% 50%, 80% 30%, 20% 40%;
                  }
                }
              `}</style>
            </div>

            {/* Status footer */}
            <div
              className="relative flex items-center justify-between px-4 py-2 shrink-0 gap-3"
              style={{
                background: "#fafafa",
                borderTop: "1px solid rgba(10,10,10,0.06)",
              }}
            >
              <div
                className="inline-flex items-center gap-2 font-mono text-[9.5px]"
                style={{ color: "#525252", letterSpacing: "0.18em" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                ONLINE · ИНТЕРАКТИВ
              </div>
              <span
                className="font-mono text-[9.5px]"
                style={{ color: "#9ca3af", letterSpacing: "0.18em" }}
              >
                CLICK · TO · SPAWN
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const SPAWN_SCENE_URL =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

function HeroRobotSpawner() {
  const [count, setCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showRevealBtn, setShowRevealBtn] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const max = 2;

  // preload Spline scene + runtime в кеш чтобы первый клик не моргал
  useEffect(() => {
    if (typeof window === "undefined") return;
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);
    if (desktop) {
      fetch(SPAWN_SCENE_URL).catch(() => {});
      import("@splinetool/react-spline").catch(() => {});
    }
  }, []);

  // Задержка появления провокационной кнопки — 4.5с после полного спавна
  useEffect(() => {
    if (count >= max && !revealed) {
      const t = setTimeout(() => setShowRevealBtn(true), 4500);
      return () => clearTimeout(t);
    }
    setShowRevealBtn(false);
  }, [count, revealed]);

  const handleClick = () => {
    if (count < max) {
      setCount((c) => c + 1);
    } else if (showRevealBtn) {
      setRevealed(true);
    }
  };

  // FINAL state — клиент нажал «ОНИ ЖЕ НИЧЕГО НЕ ДЕЛАЮТ»
  // → Spline выгружается полностью → показывается текст-объяснение.
  // Без кнопки возврата: повторный mount Spline снова добавил бы WebGL-контексты.
  if (revealed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center px-6 lg:px-12 py-8 text-center"
        style={{
          animation: "spawnFinaleIn 0.6s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <p
          className="font-semibold tracking-tight"
          style={{
            fontSize: "clamp(20px, 2.4vw, 34px)",
            lineHeight: 1.2,
            color: "#0a0a0a",
            letterSpacing: "-0.02em",
            maxWidth: "32ch",
          }}
        >
          Да, вы правы — <span style={{ color: "#2563EB" }}>это лишь макет</span>.
          <br />
          Но наши клиенты уже работают с <span style={{ fontStyle: "italic" }}>настоящими AI-сотрудниками</span>.
        </p>

        <style>{`
          @keyframes spawnFinaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ACTIVE state: пустые слоты + кнопка спавна
  return (
    <div className="absolute inset-0 flex flex-col px-5 lg:px-8 pt-5 lg:pt-7 pb-5 lg:pb-7 gap-4 lg:gap-6">
      {/* 2 робота в ряд — роботы заходят ногами под нижнюю границу мокапа */}
      <div
        className="grid grid-cols-2 gap-4 lg:gap-7 flex-1 min-h-0"
        style={{ maxHeight: "clamp(280px, 40vh, 460px)" }}
      >
        {[0, 1].map((i) => {
          const visible = i < count;
          return (
            <div
              key={i}
              className="relative w-full h-full flex items-center justify-center min-h-0"
            >
              {visible && isDesktop && (
                <div
                  style={{
                    position: "absolute",
                    top: "8%",
                    left: "-15%",
                    right: "-15%",
                    bottom: "-50%",
                    animation: "robotPop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    filter:
                      "hue-rotate(195deg) saturate(1.6) brightness(1.05)",
                  }}
                >
                  <SplineScene
                    scene={SPAWN_SCENE_URL}
                    className="w-full h-full"
                  />
                </div>
              )}
              {visible && !isDesktop && (
                <div
                  style={{
                    position: "absolute",
                    top: "10%",
                    bottom: "-25%",
                    left: "10%",
                    right: "10%",
                    animation: "robotPop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <Image
                    src="/services/robot.png"
                    alt=""
                    fill
                    sizes="160px"
                    style={{
                      objectFit: "contain",
                      filter:
                        "brightness(0) saturate(100%) invert(28%) sepia(95%) saturate(2700%) hue-rotate(216deg) brightness(96%) contrast(96%) drop-shadow(0 8px 16px rgba(37,99,235,0.4))",
                    }}
                  />
                </div>
              )}
              {!visible && (
                <div
                  className="w-full h-full rounded-2xl border border-dashed flex items-center justify-center"
                  style={{
                    borderColor: "rgba(37,99,235,0.18)",
                    background: "rgba(37,99,235,0.04)",
                  }}
                >
                  <span
                    className="font-mono text-[10.5px] lg:text-[12px]"
                    style={{
                      color: "rgba(37,99,235,0.45)",
                      letterSpacing: "0.22em",
                    }}
                  >
                    СЛОТ {i + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопка / индикатор ожидания — приклеена к низу */}
      {count < max ? (
        <button
          type="button"
          onClick={handleClick}
          className="self-center shrink-0 relative inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full font-mono font-bold text-[12px] lg:text-[14px] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: "linear-gradient(160deg, #2563EB, #1d4ed8)",
            color: "#fff",
            border: "none",
            letterSpacing: "0.18em",
            boxShadow:
              "0 12px 28px -8px rgba(37,99,235,0.6), 0 0 0 6px rgba(37,99,235,0.1)",
            animation: "spawnBtnPulse 1.6s ease-in-out infinite",
          }}
        >
          <span>НУЖЕН СОТРУДНИК +1</span>
          <span
            className="inline-flex items-center justify-center rounded-full font-bold text-[11px]"
            style={{
              width: 24,
              height: 24,
              background: "rgba(255,255,255,0.22)",
              border: "1px solid rgba(255,255,255,0.45)",
              letterSpacing: 0,
            }}
          >
            {count}/{max}
          </span>
        </button>
      ) : showRevealBtn ? (
        <button
          type="button"
          onClick={handleClick}
          className="self-center shrink-0 relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-mono font-bold text-[12px] lg:text-[14px] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: "linear-gradient(160deg, #ef4444, #b91c1c)",
            color: "#fff",
            border: "none",
            letterSpacing: "0.18em",
            boxShadow:
              "0 12px 28px -8px rgba(239,68,68,0.55), 0 0 0 6px rgba(239,68,68,0.12)",
            animation: "revealBtnIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), spawnBtnPulse 1.8s ease-in-out infinite 0.5s",
          }}
        >
          ОНИ ЖЕ НИЧЕГО НЕ ДЕЛАЮТ →
        </button>
      ) : (
        <div
          className="self-center shrink-0 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-mono text-[10.5px] lg:text-[12px]"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(37,99,235,0.18)",
            color: "#525252",
            letterSpacing: "0.22em",
            backdropFilter: "blur(6px)",
          }}
        >
          <span className="dot-typing" />
          <span className="dot-typing" style={{ animationDelay: "0.15s" }} />
          <span className="dot-typing" style={{ animationDelay: "0.3s" }} />
          <span className="ml-1">КОМАНДА АНАЛИЗИРУЕТ ЗАДАЧУ…</span>
        </div>
      )}

      <style>{`
        @keyframes robotPop {
          0% { opacity: 0; transform: scale(0.3) translateY(20px) rotate(-8deg); }
          50% { opacity: 1; transform: scale(1.15) translateY(-4px) rotate(2deg); }
          80% { transform: scale(0.96) translateY(2px) rotate(-1deg); }
          100% { opacity: 1; transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes spawnBtnPulse {
          0%, 100% {
            box-shadow:
              0 12px 28px -8px rgba(37,99,235,0.55),
              0 0 0 6px rgba(37,99,235,0.1);
          }
          50% {
            box-shadow:
              0 16px 36px -8px rgba(37,99,235,0.7),
              0 0 0 10px rgba(37,99,235,0.18);
          }
        }
        @keyframes revealBtnIn {
          0% { opacity: 0; transform: scale(0.7) translateY(8px); }
          70% { opacity: 1; transform: scale(1.06) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

type ChatMsg = { from: "user" | "bot"; text: string };

const CHAT_FLOWS: ChatMsg[][] = [
  [
    { from: "user", text: "Хочу MVP за неделю" },
    { from: "bot", text: "Принято. Один экран. Один сценарий. $500." },
    { from: "user", text: "А если не зашло?" },
    { from: "bot", text: "Расходимся друзьями. Без неустоек." },
  ],
  [
    { from: "user", text: "Нужен AI-сотрудник" },
    { from: "bot", text: "$100/мес. Compliance, бухгалтер, продажник." },
    { from: "user", text: "Когда стартуем?" },
    { from: "bot", text: "На этой неделе — диагностика. Бесплатно." },
  ],
  [
    { from: "user", text: "Команды нет, бюджета мало" },
    { from: "bot", text: "16 инженеров в Бишкеке. Без найма с вашей стороны." },
    { from: "user", text: "Цена фиксируется?" },
    { from: "bot", text: "До старта. Без счетов задним числом." },
  ],
];

function HeroChatMock() {
  const [flowIdx, setFlowIdx] = useState(0);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s < CHAT_FLOWS[flowIdx].length) return s + 1;
        return s;
      });
    }, 1300);
    return () => window.clearInterval(id);
  }, [flowIdx]);

  const flow = CHAT_FLOWS[flowIdx];
  const visible = flow.slice(0, step);

  const cycleFlow = () => {
    setFlowIdx((i) => (i + 1) % CHAT_FLOWS.length);
    setStep(1);
  };

  return (
    <div className="absolute inset-0 flex flex-col gap-1.5 p-3 lg:p-4 overflow-hidden">
      {visible.map((msg, i) => (
        <div
          key={`${flowIdx}-${i}`}
          className={`max-w-[78%] ${msg.from === "user" ? "self-end" : "self-start"}`}
          style={{
            animation: "chatBubbleIn 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div
            className="px-3 py-1.5 text-[11.5px] lg:text-[12.5px] leading-snug rounded-2xl"
            style={{
              background:
                msg.from === "user"
                  ? "linear-gradient(160deg, #2563EB, #1D4ED8)"
                  : "rgba(255,255,255,0.95)",
              color: msg.from === "user" ? "#fff" : "#0a0a0a",
              border:
                msg.from === "user"
                  ? "none"
                  : "1px solid rgba(37,99,235,0.18)",
              boxShadow:
                msg.from === "user"
                  ? "0 8px 20px -8px rgba(37,99,235,0.4)"
                  : "0 4px 14px -4px rgba(10,10,10,0.08)",
            }}
          >
            {msg.text}
          </div>
        </div>
      ))}

      {step < flow.length && (
        <div className="self-start max-w-[40%]">
          <div
            className="px-3.5 py-2 rounded-2xl flex items-center gap-1.5"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(37,99,235,0.18)",
            }}
          >
            <span className="dot-typing" />
            <span className="dot-typing" style={{ animationDelay: "0.15s" }} />
            <span className="dot-typing" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      )}

      {step === flow.length && (
        <button
          type="button"
          onClick={cycleFlow}
          className="self-center mt-auto shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[9.5px] lg:text-[10.5px] transition-all hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.95)",
            border: "1px solid rgba(37,99,235,0.3)",
            color: "#1d4ed8",
            letterSpacing: "0.18em",
            boxShadow: "0 4px 12px -4px rgba(37,99,235,0.25)",
          }}
        >
          ↺ ЕЩЁ ОДИН СЦЕНАРИЙ
        </button>
      )}

      <style>{`
        @keyframes chatBubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dot-typing {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #2563EB;
          animation: dotPulse 1.1s infinite ease-in-out;
          display: inline-block;
        }
        @keyframes dotPulse {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
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

function shadersAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (window.innerWidth < 1024) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return detectWebGL();
}

/* ═══════════════ HERO ═══════════════ */

function HeroBar() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.01, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  const showShader = heroInView && hasWebGL;

  return (
    <div
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ borderBottom: "1px solid #e5e5e5" }}
    >
      {showShader && (
        <MeshGradient
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.6,
            pointerEvents: "none",
          }}
          colors={["#ffffff", "#DBEAFE", "#2563EB", "#FAFAFA", "#F5F5F4"]}
          distortion={0.85}
          swirl={0.25}
          speed={0.35}
        />
      )}
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

      {/* Decorative grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0a0a0a 1px, transparent 1px), linear-gradient(to bottom, #0a0a0a 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 px-6 lg:px-12 py-8 lg:py-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
        <div className="max-w-3xl">
          <div
            className="font-mono text-[11px] mb-5 inline-flex items-center gap-2 px-3 py-1.5"
            style={{
              color: "#2563EB",
              letterSpacing: "0.3em",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(37,99,235,0.2)",
              backdropFilter: "blur(6px)",
              borderRadius: "999px",
            }}
          >
            <Sparkles size={12} strokeWidth={1.6} />
            ОСНОВАТЕЛЯМ БЕЗ КОМАНДЫ
          </div>
          <h1
            className="tracking-tight"
            style={{
              fontSize: "clamp(44px, 6vw, 88px)",
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              color: "#0a0a0a",
              fontWeight: 600,
            }}
          >
            Нет команды для стартапа?
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 400, color: "#1a1a1a" }}>
              Встречайте свою AI команду
            </span>
            <span style={{ color: "#2563EB" }}>.</span>
          </h1>
        </div>

        {/* Browser-mockup wrapper — Spline-сцена живёт внутри «окна» */}
        <motion.div
          className="relative shrink-0 self-center"
          style={{
            width: "clamp(280px, 26vw, 400px)",
            height: "clamp(320px, 40vh, 460px)",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative w-full h-full overflow-hidden flex flex-col"
            style={{
              background: "#fff",
              border: "1px solid rgba(10,10,10,0.08)",
              borderRadius: "12px",
              boxShadow:
                "0 24px 60px rgba(37,99,235,0.18), 0 8px 20px rgba(10,10,10,0.06)",
            }}
          >
            {/* Title bar — Mac traffic lights + URL */}
            <div
              className="relative flex items-center gap-3 px-4 py-3 shrink-0"
              style={{
                background: "linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)",
                borderBottom: "1px solid rgba(10,10,10,0.08)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
              </div>
              <div
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1 rounded-md"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(10,10,10,0.08)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#10b981" }}
                />
                <span
                  className="font-mono text-[10.5px] truncate"
                  style={{ color: "#525252", letterSpacing: "0.05em" }}
                >
                  asystem.ai/команда
                </span>
              </div>
              <Sparkles size={12} strokeWidth={1.7} style={{ color: "#2563EB" }} />
            </div>

            {/* Viewport — интерактивный AI-чат-мокап (без WebGL) */}
            <div
              className="relative flex-1 overflow-hidden"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(96,165,250,0.18) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(37,99,235,0.18) 0%, transparent 55%), linear-gradient(180deg, #f5f9ff 0%, #e8f0ff 100%)",
              }}
            >
              <HeroChatMock />
            </div>

            {/* Status footer */}
            <div
              className="relative flex items-center justify-between px-4 py-2 shrink-0 gap-3"
              style={{
                background: "#fafafa",
                borderTop: "1px solid rgba(10,10,10,0.06)",
              }}
            >
              <div
                className="inline-flex items-center gap-2 font-mono text-[9.5px]"
                style={{ color: "#525252", letterSpacing: "0.18em" }}
              >
                <span
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{ background: "#2563EB" }}
                />
                ONLINE · BISHKEK
              </div>
              <span
                className="font-mono text-[9.5px]"
                style={{ color: "#9ca3af", letterSpacing: "0.15em" }}
              >
                AI-TEAM v1.0
              </span>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

/* ═══════════════ SECTION HEADER ═══════════════ */

function SectionHeader({
  id,
  kicker,
  kickerColor,
  title,
  subtitle,
}: {
  id: string;
  kicker?: string;
  kickerColor?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.header
      id={id}
      className="px-6 lg:px-12 py-7 lg:py-10"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {kicker && (
        <div
          className="font-mono font-semibold text-[12px] mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            color: kickerColor ?? "#2563EB",
            letterSpacing: "0.25em",
            background:
              kickerColor === "#ef4444"
                ? "rgba(239,68,68,0.08)"
                : kickerColor === "#10b981"
                ? "rgba(16,185,129,0.08)"
                : "rgba(37,99,235,0.08)",
            border:
              kickerColor === "#ef4444"
                ? "1px solid rgba(239,68,68,0.25)"
                : kickerColor === "#10b981"
                ? "1px solid rgba(16,185,129,0.25)"
                : "1px solid rgba(37,99,235,0.2)",
          }}
        >
          {kicker}
        </div>
      )}
      <h2
        className="font-semibold tracking-tight max-w-4xl"
        style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="mt-5 max-w-2xl text-[16px] lg:text-[17px]"
          style={{ color: "rgba(10,10,10,0.6)", lineHeight: 1.55 }}
        >
          {subtitle}
        </p>
      )}
    </motion.header>
  );
}

/* ═══════════════ §1 PAIN TIMELINE — Halftone-dots cards Brand Blue ═══════════════ */

type PainShaderCfg = {
  shape: "wave" | "dots" | "truchet" | "corners" | "ripple" | "blob" | "sphere";
  speed: number;
  noise: number;
  intensity: number;
  softness: number;
  colors: string[];
  colorBack: string;
};

type PainStat = {
  id: string;
  step: string;
  tag: string;
  metric: string;
  metricUnit?: string;
  metricLabel: string;
  countTo?: number;
  countPrefix?: string;
  title: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  shader: PainShaderCfg;
};

const PAIN_STATS: PainStat[] = [
  {
    id: "money",
    step: "01",
    tag: "БЮДЖЕТ",
    metric: "$200",
    metricUnit: "K",
    countTo: 200,
    countPrefix: "$",
    metricLabel: "СГОРАЕТ ВПУСТУЮ",
    title: "Тратим бюджет",
    icon: CircleDollarSign,
    shader: {
      shape: "blob",
      speed: 0.25,
      noise: 0.55,
      intensity: 0.6,
      softness: 0.3,
      colorBack: "#2d0a0a",
      colors: ["#7f1d1d", "#b91c1c", "#dc2626"],
    },
  },
  {
    id: "time",
    step: "02",
    tag: "ВРЕМЯ",
    metric: "6",
    metricUnit: "мес",
    countTo: 6,
    metricLabel: "ДО ПЕРВОГО ЭКРАНА",
    title: "Теряем время",
    icon: Hourglass,
    shader: {
      shape: "ripple",
      speed: 0.55,
      noise: 0.6,
      intensity: 0.75,
      softness: 0.25,
      colorBack: "#3f0a0a",
      colors: ["#991b1b", "#dc2626", "#ef4444"],
    },
  },
  {
    id: "death",
    step: "03",
    tag: "ИТОГ",
    metric: "70",
    metricUnit: "%",
    countTo: 70,
    metricLabel: "СТАРТАПОВ УМИРАЮТ ТУТ",
    title: "В конце — ноль",
    icon: XCircle,
    shader: {
      shape: "blob",
      speed: 0.4,
      noise: 0.7,
      intensity: 0.85,
      softness: 0.2,
      colorBack: "#3a0a0a",
      colors: ["#7f1d1d", "#b91c1c", "#dc2626", "#ef4444"],
    },
  },
];

function PainTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.05, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  // perf: GrainGradient ×3 → static gradient (Mac жалуется на лаги)
  const canRender = false;
  void sectionInView;
  void hasWebGL;

  return (
    <section ref={sectionRef} style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}>
      <SectionHeader
        id="pain"
        kicker="● ВАША ОШИБКА"
        kickerColor="#ef4444"
        title="Ваша проблема — старая школа!"
      />

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 px-4 lg:px-8 pb-7 lg:pb-10"
      >
        {PAIN_STATS.map((s, i) => (
          <PainStatCell key={s.id} s={s} index={i} canRender={canRender} />
        ))}
      </div>
    </section>
  );
}

function PainStatCell({
  s,
  index,
  canRender,
}: {
  s: PainStat;
  index: number;
  canRender: boolean;
}) {
  const Icon = s.icon;
  const cfg = s.shader;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        minHeight: "clamp(280px, 32vh, 380px)",
        boxShadow: "0 18px 44px -16px rgba(37,99,235,0.4), 0 4px 12px -4px rgba(37,99,235,0.2)",
      }}
    >
      <div className="absolute inset-0" style={{ background: cfg.colorBack }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${cfg.colors[0]} 0%, transparent 55%), radial-gradient(circle at 75% 75%, ${cfg.colors[1] ?? cfg.colors[0]} 0%, transparent 55%), radial-gradient(circle at 50% 50%, ${cfg.colors[2] ?? cfg.colors[0]} 0%, transparent 65%)`,
            backgroundSize: "180% 180%, 220% 220%, 200% 200%",
            animation: `painLiveBg ${10 + index * 2}s ease-in-out infinite`,
            opacity: 0.95,
          }}
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(11,42,94,0.18) 60%, rgba(11,42,94,0.32) 100%)",
        }}
      />


      <div className="relative z-10 flex flex-col h-full p-7 lg:p-9 pointer-events-none">
        <div className="flex items-start justify-between gap-4 mb-auto">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <Icon size={18} strokeWidth={1.5} style={{ color: "#fff" }} />
          </div>
          <div
            className="font-mono text-[10px]"
            style={{
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.25em",
              textShadow: "0 1px 4px rgba(0,0,0,0.45)",
            }}
          >
            {s.tag}
          </div>
        </div>

        <div className="mt-12 lg:mt-16 flex items-baseline gap-2">
          {s.countTo !== undefined ? (
            <CountUp
              to={s.countTo}
              prefix={s.countPrefix ?? ""}
              duration={1.6}
              className="font-semibold tracking-tight"
              style={{
                fontSize: "clamp(72px, 8vw, 120px)",
                lineHeight: 0.9,
                color: "#fff",
                letterSpacing: "-0.045em",
                textShadow: "0 4px 18px rgba(0,0,0,0.4)",
              }}
            />
          ) : (
            <div
              className="font-semibold tracking-tight"
              style={{
                fontSize: "clamp(72px, 8vw, 120px)",
                lineHeight: 0.9,
                color: "#fff",
                letterSpacing: "-0.045em",
                textShadow: "0 4px 18px rgba(0,0,0,0.4)",
              }}
            >
              {s.metric}
            </div>
          )}
          {s.metricUnit && (
            <div
              className="font-semibold"
              style={{
                fontSize: "clamp(36px, 4vw, 56px)",
                lineHeight: 1,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: "-0.03em",
                textShadow: "0 2px 10px rgba(0,0,0,0.35)",
              }}
            >
              {s.metricUnit}
            </div>
          )}
        </div>
        <div
          className="font-mono text-[11px] mt-3"
          style={{
            color: "rgba(255,255,255,0.78)",
            letterSpacing: "0.18em",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {s.metricLabel}
        </div>

        <div
          className="mt-10 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.22)" }}
        >
          <h3
            className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
            style={{
              fontSize: "clamp(1.125rem, 1.4vw, 1.375rem)",
              lineHeight: 1.25,
              color: "#fff",
              letterSpacing: "-0.015em",
              textShadow: "0 2px 10px rgba(0,0,0,0.35)",
            }}
          >
            {s.title}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ §2 PATH CHOICE — fight-card scoreboard ═══════════════ */

type ScoreRow = {
  criterion: string;
  oldValue: string;
  oldNote?: string;
  newValue: string;
  newNote?: string;
};

const SCORE_ROWS: ScoreRow[] = [
  { criterion: "Бюджет", oldValue: "$200 000", newValue: "$500" },
  { criterion: "До первого экрана", oldValue: "6 месяцев", newValue: "1 неделя" },
  { criterion: "Обратная связь", oldValue: "через год", newValue: "через 7 дней" },
  { criterion: "Цена ошибки", oldValue: "вся ставка", newValue: "$500" },
  { criterion: "Шанс на продукт", oldValue: "30%", newValue: "100%" },
];

const SCORE_TOTALS = [
  { metric: "24×", label: "БЫСТРЕЕ" },
  { metric: "400×", label: "ДЕШЕВЛЕ" },
  { metric: "0", label: "ШТРАФОВ" },
];

function PathChoice() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.05, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  const canRender = sectionInView && hasWebGL;

  return (
    <section ref={sectionRef} style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}>
      <SectionHeader
        id="choice"
        title="Старая школа против новой AI школы"
      />

      <div className="px-4 lg:px-8 pb-7 lg:pb-10">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            boxShadow: "0 30px 60px -28px rgba(37,99,235,0.55), 0 4px 12px -4px rgba(37,99,235,0.25)",
          }}
        >
          {/* SWIRL SHADER BG */}
          <div className="absolute inset-0">
            {canRender ? (
              <Swirl
                style={{ width: "100%", height: "100%" }}
                colorBack="#0b1740"
                colors={["#1e40af", "#2563eb", "#60a5fa"]}
                bandCount={5}
                twist={0.35}
                center={0.5}
                proportion={0.4}
                softness={0.5}
                noise={0.45}
                noiseFrequency={0.6}
                speed={0.28}
                scale={1.2}
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: "linear-gradient(160deg, #0b1740 0%, #1e40af 50%, #2563eb 100%)" }}
              />
            )}
          </div>

          {/* dark overlay for text legibility */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,15,40,0.42) 0%, rgba(7,15,40,0.28) 50%, rgba(7,15,40,0.45) 100%)",
            }}
          />

          {/* CONTENT */}
          <div className="relative z-10 flex flex-col">
            {/* TOP RIBBON */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 px-5 md:px-7 lg:px-12 pt-5 md:pt-6 lg:pt-8 pb-4 md:pb-5 lg:pb-7">
              <div className="inline-flex items-center gap-3">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: "#fff", boxShadow: "0 0 14px rgba(255,255,255,0.85)" }}
                />
                <span
                  className="font-mono font-semibold text-[14px] lg:text-[16px]"
                  style={{
                    color: "#fff",
                    letterSpacing: "0.28em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  5 РАУНДОВ · ОДНОСТОРОННИЙ БОЙ
                </span>
              </div>

              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.42)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <span
                  className="font-mono text-[13px] lg:text-[15px] font-semibold"
                  style={{
                    color: "#fff",
                    letterSpacing: "0.22em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  AI 5 · OLD 0
                </span>
              </div>
            </div>

            {/* BIG SHOWDOWN TITLE — стек на mobile, ряд на md+ ровно над KO-row колонками */}
            <div
              className="px-5 md:px-6 lg:px-8 pb-5 lg:pb-7 flex flex-col md:grid md:items-center gap-3 md:gap-4 lg:gap-7"
              style={{
                gridTemplateColumns:
                  "minmax(64px, auto) minmax(0, 1.4fr) minmax(0, 1.2fr) auto minmax(0, 1.2fr)",
                borderBottom: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <div className="hidden md:block" aria-hidden />
              <div className="hidden md:block" aria-hidden />

              <div
                className="text-center md:text-right font-semibold tracking-tight"
                style={{
                  fontSize: "clamp(28px, 4vw, 56px)",
                  lineHeight: 0.95,
                  color: "rgba(255,255,255,0.9)",
                  letterSpacing: "-0.04em",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(239,68,68,0.7)",
                  textDecorationThickness: "3px",
                  textShadow: "0 4px 18px rgba(0,0,0,0.45)",
                }}
              >
                До AI
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
                className="rounded-full flex items-center justify-center shrink-0 justify-self-center"
                style={{
                  width: "clamp(64px, 5.5vw, 88px)",
                  height: "clamp(64px, 5.5vw, 88px)",
                  background: "rgba(255,255,255,0.95)",
                  border: "3px solid rgba(255,255,255,0.85)",
                  boxShadow: "0 14px 32px rgba(0,0,0,0.4), 0 0 0 4px rgba(255,255,255,0.08)",
                }}
              >
                <span
                  className="font-semibold tracking-tight leading-none"
                  style={{
                    fontSize: "clamp(20px, 2vw, 28px)",
                    color: "#0b1740",
                    letterSpacing: "-0.04em",
                  }}
                >
                  VS
                </span>
              </motion.div>

              <div
                className="text-center md:text-left font-semibold tracking-tight"
                style={{
                  fontSize: "clamp(28px, 4vw, 56px)",
                  lineHeight: 0.95,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  textShadow: "0 4px 22px rgba(0,0,0,0.5)",
                }}
              >
                На AI
              </div>
            </div>

            {/* 5 KO ROUNDS */}
            <div className="flex flex-col px-3 lg:px-6 py-3 lg:py-4">
              {SCORE_ROWS.map((r, i) => (
                <KORound key={i} row={r} index={i} />
              ))}
            </div>

            {/* BOTTOM RIBBON */}
            <div
              className="flex items-center justify-center gap-3 px-7 lg:px-12 py-5 lg:py-7"
              style={{ borderTop: "1px solid rgba(255,255,255,0.22)" }}
            >
              <Check size={20} strokeWidth={2.8} style={{ color: "#fff" }} />
              <span
                className="font-bold tracking-tight"
                style={{
                  fontSize: "clamp(16px, 1.8vw, 24px)",
                  color: "#fff",
                  letterSpacing: "0.04em",
                  textShadow: "0 2px 14px rgba(147,197,253,0.4), 0 4px 22px rgba(0,0,0,0.5)",
                }}
              >
                AI WINS · ВСЕ 5 / 5 РАУНДОВ
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KORound({ row, index }: { row: ScoreRow; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col md:grid md:items-center gap-3 md:gap-4 lg:gap-7 px-5 md:px-6 lg:px-8 py-3.5 md:py-4 lg:py-5"
      style={{
        gridTemplateColumns:
          "minmax(64px, auto) minmax(0, 1.4fr) minmax(0, 1.2fr) auto minmax(0, 1.2fr)",
        borderTop: index === 0 ? "none" : "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {/* Mobile: round + criterion in one row · Desktop: contents → grid */}
      <div className="flex items-center gap-3 md:contents">
        <div
          className="font-mono font-bold text-[16px] lg:text-[20px] shrink-0"
          style={{
            color: "#93c5fd",
            letterSpacing: "0.12em",
            textShadow: "0 0 12px rgba(147,197,253,0.5), 0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          R{index + 1}
        </div>
        <div
          className="font-mono font-semibold text-[11.5px] lg:text-[14px]"
          style={{
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "0.2em",
            textShadow: "0 1px 6px rgba(0,0,0,0.55)",
          }}
        >
          {row.criterion.toUpperCase()}
        </div>
      </div>

      {/* Mobile: old + arrow + new in one row · Desktop: contents → grid */}
      <div className="flex items-baseline justify-between gap-3 md:contents">
        <div
          className="md:text-right font-semibold tracking-tight whitespace-nowrap"
          style={{
            fontSize: "clamp(18px, 2.2vw, 30px)",
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "-0.025em",
            textDecoration: "line-through",
            textDecorationColor: "rgba(239,68,68,0.9)",
            textDecorationThickness: "2.5px",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {row.oldValue}
        </div>

        <ArrowRight
          size={20}
          strokeWidth={2.4}
          className="md:!w-[24px] md:!h-[24px] transition-transform duration-500 group-hover:translate-x-1.5 shrink-0"
          style={{
            color: "#fff",
            filter: "drop-shadow(0 1px 6px rgba(0,0,0,0.5))",
          }}
        />

        <div
          className="text-right md:text-left font-bold tracking-tight whitespace-nowrap"
          style={{
            fontSize: "clamp(22px, 2.8vw, 38px)",
            color: "#fff",
            letterSpacing: "-0.03em",
            textShadow: "0 2px 16px rgba(147,197,253,0.5), 0 4px 22px rgba(0,0,0,0.55)",
          }}
        >
          {row.newValue}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ §3 STEPS PROCESS — Warp shader cards Brand Blue ═══════════════ */

type StepShaderCfg = {
  proportion: number;
  softness: number;
  distortion: number;
  swirl: number;
  swirlIterations: number;
  shape: "checks" | "stripes" | "edge";
  shapeScale: number;
  colors: string[];
};

type StepStat = {
  id: string;
  step: string;
  tag: string;
  metric: string;
  metricUnit?: string;
  metricLabel: string;
  duration: string;
  title: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  badge?: string;
  shader: StepShaderCfg;
};

const STEPS: StepStat[] = [
  {
    id: "intro",
    step: "01",
    tag: "ШАГ · ЗНАКОМСТВО",
    metric: "30",
    metricUnit: "мин",
    metricLabel: "С ИНЖЕНЕРОМ · БЕСПЛАТНО",
    duration: "уже на этой неделе",
    title: "Слушаем идею",
    icon: Search,
    badge: "БЕСПЛАТНО",
    shader: {
      proportion: 0.42, softness: 1.05, distortion: 0.16, swirl: 0.7, swirlIterations: 6,
      shape: "edge", shapeScale: 0.11,
      colors: ["hsl(160, 60%, 25%)", "hsl(160, 70%, 50%)", "hsl(150, 70%, 35%)", "hsl(155, 80%, 65%)"],
    },
  },
  {
    id: "mvp",
    step: "02",
    tag: "ШАГ · ПРОТОТИП",
    metric: "$500",
    metricLabel: "СТАРТОВАЯ НЕДЕЛЯ",
    duration: "1–2 недели",
    title: "MVP за неделю",
    icon: Zap,
    shader: {
      proportion: 0.32, softness: 0.85, distortion: 0.18, swirl: 0.7, swirlIterations: 5,
      shape: "checks", shapeScale: 0.08,
      colors: ["hsl(155, 65%, 22%)", "hsl(160, 70%, 45%)", "hsl(150, 75%, 32%)", "hsl(155, 80%, 60%)"],
    },
  },
  {
    id: "build",
    step: "03",
    tag: "ШАГ · РАЗРАБОТКА",
    metric: "$30",
    metricUnit: "K+",
    metricLabel: "ФИКС-ЦЕНА ДО СТАРТА",
    duration: "1–2 месяца",
    title: "Полная разработка",
    icon: Rocket,
    shader: {
      proportion: 0.36, softness: 0.95, distortion: 0.22, swirl: 0.85, swirlIterations: 7,
      shape: "checks", shapeScale: 0.09,
      colors: ["hsl(150, 70%, 18%)", "hsl(155, 75%, 38%)", "hsl(145, 80%, 28%)", "hsl(150, 85%, 55%)"],
    },
  },
  {
    id: "agents",
    step: "04",
    tag: "ШАГ · AI-СОТРУДНИКИ",
    metric: "$100",
    metricUnit: "/мес",
    metricLabel: "РАБОТАЮТ 24/7",
    duration: "постоянно",
    title: "StafOS-агенты",
    icon: Bot,
    shader: {
      proportion: 0.44, softness: 1.0, distortion: 0.19, swirl: 0.8, swirlIterations: 6,
      shape: "edge", shapeScale: 0.12,
      colors: ["hsl(155, 70%, 25%)", "hsl(160, 75%, 48%)", "hsl(150, 80%, 35%)", "hsl(155, 85%, 65%)"],
    },
  },
];

function StepsProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.05, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  // perf: Warp ×4 → static gradient (Mac жалуется на лаги)
  const canRender = false;
  void sectionInView;
  void hasWebGL;

  return (
    <section ref={sectionRef} style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}>
      <SectionHeader
        id="steps"
        kicker="● А ВОТ РЕШЕНИЕ"
        kickerColor="#10b981"
        title="От разговора до AI-сотрудника"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 px-4 lg:px-8 pb-7 lg:pb-10">
        {STEPS.map((p, i) => (
          <StepCell key={p.id} p={p} index={i} canRender={canRender} />
        ))}
      </div>
    </section>
  );
}

function StepCell({
  p,
  index,
  canRender,
}: {
  p: StepStat;
  index: number;
  canRender: boolean;
}) {
  const Icon = p.icon;
  const cfg = p.shader;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        minHeight: "clamp(280px, 30vh, 360px)",
        boxShadow: "0 18px 44px -16px rgba(37,99,235,0.45), 0 4px 12px -4px rgba(37,99,235,0.2)",
      }}
    >
      <div className="absolute inset-0" style={{ background: cfg.colors[0] }}>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 25% 30%, ${cfg.colors[1] ?? cfg.colors[0]} 0%, transparent 55%), radial-gradient(circle at 75% 70%, ${cfg.colors[2] ?? cfg.colors[0]} 0%, transparent 55%), radial-gradient(circle at 50% 50%, ${cfg.colors[3] ?? cfg.colors[0]} 0%, transparent 65%)`,
            backgroundSize: "200% 200%, 240% 240%, 220% 220%",
            animation: `painLiveBg ${11 + index * 1.5}s ease-in-out infinite`,
            opacity: 0.95,
          }}
        />
      </div>

      {p.badge && (
        <div
          className="absolute top-5 right-5 z-20 inline-flex items-center px-2.5 py-1 font-mono text-[9px]"
          style={{
            background: "#10b981",
            color: "#fff",
            letterSpacing: "0.18em",
            boxShadow: "0 4px 12px rgba(16,185,129,0.45)",
          }}
        >
          {p.badge}
        </div>
      )}


      <div className="relative z-10 flex flex-col h-full p-6 lg:p-7 pointer-events-none">
        <div className="flex items-start justify-between gap-3 mb-auto">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <Icon size={18} strokeWidth={1.5} style={{ color: "#fff" }} />
          </div>
          {!p.badge && (
            <div
              className="font-mono text-[10px] text-right max-w-[55%]"
              style={{
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.22em",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}
            >
              {p.tag}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-baseline gap-1.5">
          <div
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(40px, 5vw, 68px)",
              lineHeight: 0.9,
              color: "#fff",
              letterSpacing: "-0.04em",
              textShadow: "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            {p.metric}
          </div>
          {p.metricUnit && (
            <div
              className="font-semibold"
              style={{
                fontSize: "clamp(18px, 2vw, 28px)",
                lineHeight: 1,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "-0.03em",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {p.metricUnit}
            </div>
          )}
        </div>
        <div
          className="font-mono text-[9.5px] mt-2"
          style={{
            color: "rgba(255,255,255,0.78)",
            letterSpacing: "0.18em",
            textShadow: "0 1px 4px rgba(0,0,0,0.35)",
          }}
        >
          {p.metricLabel}
        </div>

        <div
          className="mt-auto pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.22)" }}
        >
          <h3
            className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
            style={{
              fontSize: "clamp(0.875rem, 1.05vw, 1.05rem)",
              lineHeight: 1.25,
              color: "#fff",
              letterSpacing: "-0.015em",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              minHeight: "2.4em",
            }}
          >
            {p.title}
          </h3>
          <div
            className="inline-flex items-center gap-1.5 mt-2.5 font-mono text-[9.5px]"
            style={{
              color: "rgba(255,255,255,0.85)",
              letterSpacing: "0.18em",
              textShadow: "0 1px 4px rgba(0,0,0,0.35)",
            }}
          >
            <Clock size={10} strokeWidth={1.7} />
            {p.duration.toUpperCase()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ §4 AI EMPLOYEE — 2 stat-banner карточки HUMAN vs AI ═══════════════ */

type EmpRow = { metric: string; human: string; ai: string };

const EMP_ROWS: EmpRow[] = [
  { metric: "Часы", human: "8 ч/день", ai: "24/7" },
  { metric: "Больничные", human: "Регулярно", ai: "Никогда" },
  { metric: "Масштаб", human: "Новый найм", ai: "Одна кнопка" },
];

type EmpCard = {
  id: "human" | "ai";
  step: string;
  tag: string;
  role: string;
  metric: string;
  metricUnit: string;
  metricLabel: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  shape: string;
  bg: string;
  isDark: boolean;
  accent: string;
  rows: Array<{ k: string; v: string }>;
};

const EMP_CARDS: EmpCard[] = [
  {
    id: "human",
    step: "01",
    tag: "СТАРАЯ ШКОЛА",
    role: "Штатный сотрудник",
    metric: "$1 500",
    metricUnit: "/мес",
    metricLabel: "+ НАЛОГИ + ОТПУСК + БОЛЬНИЧНЫЕ",
    title: "Один сотрудник — один процесс",
    desc: "Уходит в отпуск, болеет, выгорает, увольняется. Чтобы масштабироваться — нанимать ещё.",
    icon: User,
    shape: "/lab/inversion.png",
    bg: "linear-gradient(160deg, #0a0a0a 0%, #1f2937 100%)",
    isDark: true,
    accent: "#2563EB",
    rows: EMP_ROWS.map((r) => ({ k: r.metric, v: r.human })),
  },
  {
    id: "ai",
    step: "02",
    tag: "НОВАЯ AI ШКОЛА",
    role: "StafOS Worker",
    metric: "$100",
    metricUnit: "/мес",
    metricLabel: "БЕЗ НАЛОГОВ · БЕЗ ОТПУСКА · БЕЗ БОЛЬНИЧНЫХ",
    title: "15× дешевле, не теряет темп",
    desc: "Compliance, бухгалтер, юрист, продажи, аналитика — на StafOS. Работает, пока сервер включён.",
    icon: Bot,
    shape: "/lab/tg-bot.png",
    bg: "linear-gradient(160deg, #2563EB 0%, #1D4ED8 100%)",
    isDark: true,
    accent: "#fff",
    rows: EMP_ROWS.map((r) => ({ k: r.metric, v: r.ai })),
  },
];

const EMP_ROLES = [
  { name: "Compliance", icon: ShieldCheck },
  { name: "Бухгалтер", icon: Calculator },
  { name: "Юрист", icon: Scale },
  { name: "Продажи", icon: TrendingUp },
  { name: "Аналитик", icon: BarChart3 },
];

function AIEmployee() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.05, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  const canRender = sectionInView && hasWebGL;

  return (
    <section ref={sectionRef} style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}>
      <SectionHeader
        id="ai-staff"
        title="$100 в месяц вместо $1 500 зарплаты"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 px-4 lg:px-8 pb-7 lg:pb-10">
        {EMP_CARDS.map((c, i) => (
          <EmpCardCell key={c.id} c={c} index={i} canRender={canRender} />
        ))}
      </div>

    </section>
  );
}

const EMP_NEURO_CFG = {
  human: {
    colorFront: "#1e3a8a",
    colorMid: "#1e40af",
    colorBack: "#06112a",
    brightness: 0.05,
    contrast: 0.35,
    speed: 0.4,
    fallback: "linear-gradient(160deg, #06112a 0%, #1e3a8a 100%)",
  },
  ai: {
    colorFront: "#dbeafe",
    colorMid: "#60a5fa",
    colorBack: "#1e40af",
    brightness: 0.18,
    contrast: 0.55,
    speed: 0.9,
    fallback: "linear-gradient(160deg, #1e40af 0%, #2563eb 100%)",
  },
} as const;

function EmpCardCell({
  c,
  index,
  canRender,
}: {
  c: EmpCard;
  index: number;
  canRender: boolean;
}) {
  const Icon = c.icon;
  const cfg = EMP_NEURO_CFG[c.id];
  const textColor = "#fff";
  const dimColor = "rgba(255,255,255,0.78)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        minHeight: "clamp(340px, 38vh, 440px)",
        boxShadow: "0 24px 48px -20px rgba(37,99,235,0.5), 0 4px 12px -4px rgba(37,99,235,0.2)",
      }}
    >
      <div className="absolute inset-0">
        {canRender ? (
          c.id === "ai" ? (
            <Spiral
              style={{ width: "100%", height: "100%" }}
              colorBack="#052e16"
              colorFront="#34d399"
              density={1.1}
              distortion={0.35}
              strokeWidth={0.42}
              strokeTaper={0.4}
              strokeCap={0.4}
              noise={0.25}
              noiseFrequency={0.5}
              softness={0.3}
              speed={0.85}
            />
          ) : (
            <Spiral
              style={{ width: "100%", height: "100%" }}
              colorBack="#1a0606"
              colorFront="#991b1b"
              density={0.95}
              distortion={0.55}
              strokeWidth={0.5}
              strokeTaper={0.25}
              strokeCap={0.35}
              noise={0.4}
              noiseFrequency={0.6}
              softness={0.3}
              speed={0.55}
            />
          )
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                c.id === "ai"
                  ? "linear-gradient(160deg, #047857 0%, #052e16 100%)"
                  : "linear-gradient(160deg, #1a0606 0%, #5a1010 100%)",
            }}
          />
        )}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            c.id === "ai"
              ? "linear-gradient(180deg, rgba(7,15,40,0.32) 0%, rgba(7,15,40,0.18) 50%, rgba(7,15,40,0.45) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            c.id === "ai"
              ? "linear-gradient(180deg, rgba(7,15,40,0.32) 0%, rgba(7,15,40,0.18) 50%, rgba(7,15,40,0.45) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* RIBBON — крупный ярлык СТАРАЯ vs НОВАЯ */}
      <div
        className="relative z-20 flex items-center justify-between gap-3 px-7 lg:px-10 py-4 lg:py-5"
        style={{
          background:
            c.id === "ai" ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.65)",
          borderBottom:
            c.id === "ai"
              ? "1px solid rgba(255,255,255,0.55)"
              : "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <div className="inline-flex items-center gap-2.5">
          {c.id === "ai" ? (
            <Sparkles size={16} strokeWidth={2} style={{ color: "#fff" }} />
          ) : (
            <CalendarOff size={16} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.92)" }} />
          )}
          <span
            className="font-mono text-[12.5px] lg:text-[14px] font-bold"
            style={{
              color: "#fff",
              letterSpacing: "0.24em",
              textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            }}
          >
            {c.tag}
          </span>
        </div>
        <span
          className="font-mono text-[11px] lg:text-[12px] font-semibold"
          style={{
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "0.2em",
            textShadow: "0 1px 6px rgba(0,0,0,0.6)",
          }}
        >
          {c.id === "ai" ? "ТАК РАБОТАЕМ МЫ" : "ТАК ДЕЛАЛИ ДО AI"}
        </span>
      </div>

      <div className="relative z-10 flex flex-col h-full p-7 lg:p-10">
        <div className="flex flex-col items-center text-center gap-4 mb-auto">
          <div
            className="rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{
              width: "clamp(96px, 9vw, 128px)",
              height: "clamp(96px, 9vw, 128px)",
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.32)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            <Icon
              size={56}
              strokeWidth={1.4}
              style={{ color: "#fff", width: "clamp(48px, 4.5vw, 64px)", height: "clamp(48px, 4.5vw, 64px)" }}
            />
          </div>
          <div>
            <div
              className="font-mono font-semibold text-[12px] lg:text-[13px]"
              style={{
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.28em",
                textShadow: "0 1px 6px rgba(0,0,0,0.5)",
              }}
            >
              {c.id === "ai" ? "AI-АГЕНТ" : "ЧЕЛОВЕК"}
            </div>
            <div
              className="text-[20px] lg:text-[24px] font-bold mt-2"
              style={{
                color: "#fff",
                letterSpacing: "-0.015em",
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {c.role}
            </div>
          </div>
        </div>

        {/* Big metric */}
        <div className="mt-10 flex items-baseline gap-2">
          <div
            className="font-semibold tracking-tight"
            style={{
              fontSize: "clamp(72px, 8vw, 120px)",
              lineHeight: 0.9,
              color: textColor,
              letterSpacing: "-0.045em",
              textShadow: "0 4px 22px rgba(0,0,0,0.55)",
            }}
          >
            {c.metric}
          </div>
          <div
            className="font-semibold"
            style={{
              fontSize: "clamp(28px, 3vw, 44px)",
              lineHeight: 1,
              color: c.id === "ai" ? "#fff" : "#93c5fd",
              letterSpacing: "-0.03em",
              textShadow: "0 2px 14px rgba(0,0,0,0.45)",
            }}
          >
            {c.metricUnit}
          </div>
        </div>
        <div
          className="font-mono text-[10.5px] mt-3 max-w-[36ch] font-semibold"
          style={{
            color: dimColor,
            letterSpacing: "0.18em",
            lineHeight: 1.6,
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          {c.metricLabel}
        </div>

        <ul
          className="mt-8 flex flex-col rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.18)" }}
        >
          {c.rows.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
              style={{
                background:
                  i % 2 === 0
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,255,255,0.03)",
                borderBottom:
                  i < c.rows.length - 1
                    ? "1px solid rgba(255,255,255,0.1)"
                    : undefined,
              }}
            >
              <span
                className="font-mono font-semibold text-[12px] lg:text-[13px]"
                style={{
                  color: "rgba(255,255,255,0.78)",
                  letterSpacing: "0.22em",
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                {r.k.toUpperCase()}
              </span>
              <span
                className="text-[15px] lg:text-[17px] font-bold"
                style={{
                  color: "#fff",
                  letterSpacing: "-0.005em",
                  textShadow: "0 1px 6px rgba(0,0,0,0.45)",
                }}
              >
                {r.v}
              </span>
            </li>
          ))}
        </ul>

      </div>
    </motion.div>
  );
}

/* ═══════════════ §5 GROWTH CYCLE — 4 stat-banner stages ═══════════════ */

type GrowthStage = {
  id: string;
  step: string;
  tag: string;
  metric: string;
  metricUnit?: string;
  metricLabel: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  shape: string;
  bg: string;
  isDark: boolean;
  accent: string;
};

const GROWTH_STAGES: GrowthStage[] = [
  {
    id: "launch",
    step: "01",
    tag: "ВИТОК · ЗАПУСК",
    metric: "1",
    metricUnit: "нед",
    metricLabel: "MVP → ТЕСТ → ПОЛИРОВКА",
    title: "Запустили MVP",
    desc: "Первая версия в проде. Реальные пользователи. Первая обратная связь, первые баги.",
    icon: Zap,
    shape: "/lab/mvp-no-prepay.png",
    bg: "#fff",
    isDark: false,
    accent: "#2563EB",
  },
  {
    id: "adapt",
    step: "02",
    tag: "ВИТОК · АДАПТАЦИЯ",
    metric: "2-4",
    metricUnit: "нед",
    metricLabel: "ИТЕРАЦИИ ПО ДАННЫМ",
    title: "Доработка по фактам",
    desc: "Меняем то, что мешает. Усиливаем то, что работает. Не интуиция — пользовательские метрики.",
    icon: Wrench,
    shape: "/lab/ai-audit.png",
    bg: "linear-gradient(160deg, #2563EB 0%, #1D4ED8 100%)",
    isDark: true,
    accent: "#fff",
  },
  {
    id: "ai",
    step: "03",
    tag: "ВИТОК · AI-СЛОЙ",
    metric: "5+",
    metricUnit: "агентов",
    metricLabel: "АВТОМАТИЗАЦИЯ ПРОЦЕССОВ",
    title: "Подключаем AI-агентов",
    desc: "Compliance, бухгалтер, продажи. Рутина уходит к роботам, команда занимается продуктом.",
    icon: Bot,
    shape: "/lab/tg-bot.png",
    bg: "linear-gradient(160deg, #0a0a0a 0%, #1f2937 100%)",
    isDark: true,
    accent: "#2563EB",
  },
  {
    id: "scale",
    step: "04",
    tag: "ВИТОК · МАСШТАБ",
    metric: "∞",
    metricLabel: "НОВЫЕ МОДУЛИ · НОВЫЕ ВИТКИ",
    title: "Растём вместе",
    desc: "Новые модули, новые рынки, новый MVP внутри продукта. Цикл начинается заново на новом уровне.",
    icon: Activity,
    shape: "/lab/crm-sync.png",
    bg: "#fff",
    isDark: false,
    accent: "#2563EB",
  },
];

const CYCLE_NODES: Array<{ label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }> }> = [
  { label: "MVP", icon: Zap },
  { label: "Запуск", icon: Rocket },
  { label: "Тест", icon: ClipboardCheck },
  { label: "Не зашло", icon: X },
  { label: "Гипотеза", icon: Sparkles },
  { label: "Итерация", icon: Wrench },
];

function CycleVisual() {
  const cx = 280;
  const cy = 280;
  const r = 180;

  return (
    <div className="relative w-full max-w-[640px] aspect-square mx-auto">
      <svg viewBox="0 0 560 560" className="w-full h-full">
        <defs>
          <linearGradient id="cycleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#2563EB" stopOpacity="1" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(37,99,235,0.18)" />
            <stop offset="100%" stopColor="rgba(37,99,235,0)" />
          </radialGradient>
        </defs>

        {/* Outer ghost ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 36}
          fill="none"
          stroke="rgba(37,99,235,0.12)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Center glow */}
        <circle cx={cx} cy={cy} r={r - 30} fill="url(#centerGlow)" />

        {/* Main animated ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#cycleGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />

        {/* Orbiting pulse dot — CSS-driven вместо framer-motion для экономии RAF */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "spinOrbit 18s linear infinite" }}>
          <circle cx={cx} cy={cy - r} r="14" fill="rgba(37,99,235,0.25)" />
          <circle cx={cx} cy={cy - r} r="7" fill="#2563EB" />
        </g>
        <style>{`@keyframes spinOrbit { to { transform: rotate(360deg); } }`}</style>

        {/* Nodes around the ring */}
        {CYCLE_NODES.map((node, i) => {
          const angle = (i / CYCLE_NODES.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const lx = cx + Math.cos(angle) * (r + 76);
          const ly = cy + Math.sin(angle) * (r + 76);
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.5, type: "spring", stiffness: 180 }}
            >
              <circle cx={x} cy={y} r="28" fill="#fff" stroke="#2563EB" strokeWidth="1.5" />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                fontSize="11"
                fill="#0a0a0a"
                fontFamily="var(--font-mono, monospace)"
                letterSpacing="0.12em"
                fontWeight="600"
                dy=".35em"
              >
                {node.label.toUpperCase()}
              </text>
            </motion.g>
          );
        })}

        {/* Foreground icons on top of nodes (not as SVG children, layered via foreignObject) */}
        {CYCLE_NODES.map((node, i) => {
          const angle = (i / CYCLE_NODES.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          const Icon = node.icon;
          return (
            <foreignObject key={`icon-${i}`} x={x - 12} y={y - 12} width="24" height="24">
              <Icon size={24} strokeWidth={1.6} color="#2563EB" />
            </foreignObject>
          );
        })}

        {/* Center ∞ symbol — точно по центру */}
        <motion.text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="160"
          fontWeight="700"
          fill="#0a0a0a"
          letterSpacing="-0.06em"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 1.2, duration: 0.6, type: "spring", stiffness: 160 }}
        >
          ∞
        </motion.text>
        {/* Blue dot — period, нижне-правее ∞ */}
        <motion.circle
          cx={cx + 90}
          cy={cy + 32}
          r="10"
          fill="#2563EB"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 1.6, duration: 0.4, type: "spring", stiffness: 220 }}
        />
      </svg>
    </div>
  );
}

type CycleStep = {
  num: string;
  label: string;
  icon: React.ElementType;
  tone: "neutral" | "fail" | "win";
};

const CYCLE_STEPS_NEW: CycleStep[] = [
  { num: "01", label: "MVP", icon: Zap, tone: "neutral" },
  { num: "02", label: "Запуск", icon: Rocket, tone: "neutral" },
  { num: "03", label: "Тест", icon: ClipboardCheck, tone: "neutral" },
  { num: "04", label: "Не зашло", icon: X, tone: "fail" },
  { num: "05", label: "Гипотеза", icon: Sparkles, tone: "neutral" },
  { num: "06", label: "Итерация", icon: Wrench, tone: "win" },
];

function CycleStrip() {
  return (
    <div className="relative z-10 px-6 lg:px-12 pb-8 lg:pb-12">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(37,99,235,0.18), transparent 60%), radial-gradient(circle at 80% 50%, rgba(147,197,253,0.12), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        {/* Track line */}
        <div
          aria-hidden
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, rgba(147,197,253,0.15) 0%, rgba(147,197,253,0.45) 50%, rgba(147,197,253,0.15) 100%)",
          }}
        />

        {/* Pulsing runner-dot */}
        <div
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: 0,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#60a5fa",
            boxShadow: "0 0 0 6px rgba(96,165,250,0.18), 0 0 24px 4px rgba(96,165,250,0.7)",
            animation: "cycleRunner 14s linear infinite",
          }}
        />

        <ol className="relative z-10 grid grid-cols-3 md:grid-cols-6 gap-0">
          {CYCLE_STEPS_NEW.map((step, i) => {
            const Icon = step.icon;
            const ringColor =
              step.tone === "fail"
                ? "rgba(239,68,68,0.65)"
                : step.tone === "win"
                ? "rgba(52,211,153,0.7)"
                : "rgba(147,197,253,0.65)";
            const numColor =
              step.tone === "fail"
                ? "#fca5a5"
                : step.tone === "win"
                ? "#86efac"
                : "#93c5fd";
            return (
              <li
                key={step.num}
                className="flex flex-col items-center justify-center gap-3 py-8 lg:py-10 px-2 text-center"
                style={{
                  borderRight:
                    i < CYCLE_STEPS_NEW.length - 1
                      ? "1px solid rgba(255,255,255,0.08)"
                      : undefined,
                }}
              >
                <div
                  className="font-mono font-bold text-[11px] lg:text-[13px]"
                  style={{
                    color: numColor,
                    letterSpacing: "0.22em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  {step.num}
                </div>
                <div className="relative">
                  {/* Sonar-ping ring — расходится когда runner-dot подходит к узлу */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      border: `2px solid ${ringColor}`,
                      animation: `cycleSonar 14s ease-out infinite`,
                      animationDelay: `${1.05 + i * 2.33}s`,
                      transformOrigin: "center",
                    }}
                  />
                  <div
                    className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center bg-[#0a1330]"
                    style={{
                      border: `2px solid ${ringColor}`,
                      boxShadow: `0 0 18px ${ringColor.replace("0.65)", "0.45)").replace("0.7)", "0.45)")}`,
                    }}
                  >
                    <Icon size={20} strokeWidth={1.8} style={{ color: numColor }} />
                  </div>
                </div>
                <div
                  className="font-semibold text-[12.5px] lg:text-[14px] leading-tight"
                  style={{
                    color: "#fff",
                    letterSpacing: "-0.005em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                  }}
                >
                  {step.label}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Loop-back indicator */}
        <div
          className="flex items-center justify-center gap-2 py-3"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <span
            className="font-mono text-[10.5px] lg:text-[11.5px]"
            style={{
              color: "rgba(147,197,253,0.85)",
              letterSpacing: "0.28em",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          >
            ⤴ И ОБРАТНО НА MVP
          </span>
        </div>
      </div>

      <style>{`
        @keyframes cycleRunner {
          0% { left: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { left: calc(100% - 16px); opacity: 0; }
        }
        @keyframes cycleSonar {
          0% { transform: scale(1); opacity: 0; }
          1% { opacity: 0.85; }
          12% { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function GrowthCycle() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.05, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  // perf: SmokeRing → static gradient (Mac: лагает GrowthCycle)
  const showShader = false;
  void sectionInView;
  void hasWebGL;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: "#06112a",
        color: "#fff",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div className="absolute inset-0">
        {showShader ? (
          <SmokeRing
            style={{ width: "100%", height: "100%" }}
            colorBack="#06112a"
            colors={["#1d4ed8", "#3b82f6", "#93c5fd"]}
            noiseScale={1.8}
            noiseIterations={3}
            radius={0.32}
            thickness={0.68}
            innerShape={0.55}
            speed={0.32}
            scale={1.1}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.38), transparent 55%), linear-gradient(160deg, #06112a 0%, #0b1740 60%, #0a1330 100%)",
            }}
          />
        )}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,17,42,0.45) 0%, rgba(6,17,42,0.25) 50%, rgba(6,17,42,0.5) 100%)",
        }}
      />

      {/* TOP RIBBON */}
      <div
        className="relative z-10 flex items-center justify-between gap-4 px-6 lg:px-12 py-5 lg:py-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.14)" }}
      >
        <div className="inline-flex items-center gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: "#fff", boxShadow: "0 0 14px rgba(255,255,255,0.85)" }}
          />
          <span
            className="font-mono font-semibold text-[14px] lg:text-[16px]"
            style={{
              color: "#fff",
              letterSpacing: "0.28em",
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            ASYSTEM CYCLE · 6 ШАГОВ · ∞
          </span>
        </div>
        <span
          className="font-mono font-semibold text-[13px] lg:text-[15px]"
          style={{
            color: "rgba(147,197,253,0.95)",
            letterSpacing: "0.22em",
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          NO DEAD-END
        </span>
      </div>

      <motion.header
        id="growth"
        className="relative z-10 px-6 lg:px-12 py-6 lg:py-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2
          className="font-semibold tracking-tight"
          style={{
            fontSize: "clamp(1.75rem, 3.6vw, 3.25rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "#fff",
            textShadow: "0 4px 22px rgba(0,0,0,0.5)",
          }}
        >
          Не получилось — <span style={{ color: "#93c5fd" }}>ничего страшного</span>. Делаем ещё.
        </h2>
      </motion.header>

      <CycleStrip />

      <div className="relative z-10 px-4 lg:px-8 pb-4 lg:pb-6" style={{ display: "none" }}>
        {/* старая orbital — оставлена не используется, можно удалить позже */}
      </div>

      {/* BOTTOM STATS RIBBON */}
      <div
        className="relative z-10 grid grid-cols-3 px-3 lg:px-8 pb-8 lg:pb-12"
        style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }}
      >
        {[
          { metric: "3-5", label: "ИТЕРАЦИЙ В СРЕДНЕМ" },
          { metric: "60", unit: "дн", label: "ОДИН ПОЛНЫЙ КРУГ" },
          { metric: "∞", label: "ЦИКЛ НЕ ЗАКАНЧИВАЕТСЯ" },
        ].map((s, i) => (
          <div
            key={i}
            className="px-4 lg:px-6 py-6 lg:py-7 flex flex-col items-center text-center gap-2"
            style={{
              borderRight:
                i < 2 ? "1px solid rgba(255,255,255,0.14)" : undefined,
            }}
          >
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-bold tracking-tight"
                style={{
                  fontSize: "clamp(36px, 4.2vw, 64px)",
                  lineHeight: 0.9,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                }}
              >
                {s.metric}
              </span>
              {s.unit && (
                <span
                  className="font-bold"
                  style={{
                    fontSize: "clamp(18px, 1.8vw, 26px)",
                    color: "#93c5fd",
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {s.unit}
                </span>
              )}
            </div>
            <span
              className="font-mono font-semibold text-[10.5px] lg:text-[12px]"
              style={{
                color: "rgba(255,255,255,0.78)",
                letterSpacing: "0.2em",
                textShadow: "0 1px 6px rgba(0,0,0,0.5)",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════ §6 CASES — горизонтальный «БЫЛО → СТАЛО» ═══════════════ */

type CaseLine = { value: string; label: string };

type Case = {
  id: string;
  tag: string;
  year: string;
  delta: string;
  title: string;
  shape: string;
  before: CaseLine[];
  after: CaseLine[];
};

const CASES: Case[] = [
  {
    id: "startup",
    tag: "СТАРТАП · MVP",
    year: "2026",
    delta: "8 дней",
    title: "Раунд закрыт после демо",
    shape: "/lab/mvp-no-prepay.png",
    before: [
      { value: "0", label: "инвестиций" },
      { value: "0", label: "пользователей" },
      { value: "—", label: "продукта" },
    ],
    after: [
      { value: "$1.2M", label: "раунд закрыт" },
      { value: "MVP", label: "в проде" },
      { value: "8 дн", label: "от старта" },
    ],
  },
  {
    id: "vasp",
    tag: "VASP-ОПЕРАТОР · COMPLIANCE",
    year: "2026",
    delta: "−$18K / год",
    title: "AI-агент закрыл compliance",
    shape: "/lab/ai-audit.png",
    before: [
      { value: "40 ч/нед", label: "на отчётность" },
      { value: "$1 600", label: "/мес специалист" },
      { value: "3", label: "пропуска / квартал" },
    ],
    after: [
      { value: "5 ч/нед", label: "на отчётность" },
      { value: "$100", label: "/мес AI-агент" },
      { value: "0", label: "пропусков" },
    ],
  },
];

function CasesGrid() {
  return (
    <section style={{ background: "#fff", borderTop: "1px solid #e5e5e5" }}>
      <SectionHeader id="cases" title="Разные точки. Одна логика." />

      <div
        className="flex flex-col"
        style={{ borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5" }}
      >
        {CASES.map((c, i) => (
          <CaseRow key={c.id} c={c} index={i} />
        ))}
      </div>
    </section>
  );
}

function CaseRow({ c, index }: { c: Case; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      style={{
        borderTop: index > 0 ? "1px solid #e5e5e5" : "none",
      }}
    >
      {/* Top meta bar */}
      <div
        className="px-6 lg:px-12 py-4 flex items-center justify-between gap-4"
        style={{ background: "#fafafa", borderBottom: "1px solid #e5e5e5" }}
      >
        <div className="inline-flex items-center gap-2.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: "#2563EB" }}
          />
          <span
            className="font-mono text-[10.5px] font-semibold"
            style={{ color: "#0a0a0a", letterSpacing: "0.25em" }}
          >
            {c.tag}
          </span>
        </div>
        <span
          className="font-mono text-[10.5px]"
          style={{ color: "#9ca3af", letterSpacing: "0.18em" }}
        >
          {c.year}
        </span>
      </div>

      {/* Body — 3 col grid (BEFORE / TRANSFORMATION / AFTER) */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr]"
        style={{ minHeight: "clamp(360px, 42vh, 460px)" }}
      >
        {/* BEFORE — dark */}
        <div
          className="relative overflow-hidden p-7 lg:p-10 flex flex-col gap-5"
          style={{
            background: "linear-gradient(160deg, #0a0a0a 0%, #1f2937 100%)",
            borderRight: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <div
            className="font-mono text-[11px] inline-flex items-center gap-2"
            style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.25em" }}
          >
            <CalendarOff size={13} strokeWidth={1.7} style={{ color: "rgba(239,68,68,0.85)" }} />
            БЫЛО
          </div>
          <ul className="flex flex-col gap-4 mt-auto">
            {c.before.map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-baseline gap-3"
              >
                <span
                  className="font-semibold tracking-tight"
                  style={{
                    fontSize: "clamp(28px, 3vw, 42px)",
                    lineHeight: 1,
                    color: "rgba(255,255,255,0.45)",
                    letterSpacing: "-0.025em",
                    textDecoration: "line-through",
                    textDecorationColor: "rgba(239,68,68,0.55)",
                    textDecorationThickness: "2px",
                    minWidth: "30%",
                  }}
                >
                  {line.value}
                </span>
                <span
                  className="text-[13px] lg:text-[14px]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {line.label}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* TRANSFORMATION — center column with delta + arrow */}
        <div
          className="relative flex flex-col items-center justify-center px-6 lg:px-10 py-8 gap-4"
          style={{
            background: "#fafafa",
            borderRight: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
            minWidth: "clamp(160px, 18vw, 260px)",
          }}
        >
          <div
            className="font-mono text-[10px]"
            style={{ color: "#2563EB", letterSpacing: "0.22em" }}
          >
            ДЕЛЬТА
          </div>
          <div
            className="font-semibold tracking-tight text-center"
            style={{
              fontSize: "clamp(28px, 3vw, 44px)",
              lineHeight: 0.95,
              color: "#0a0a0a",
              letterSpacing: "-0.035em",
            }}
          >
            {c.delta}
          </div>
          <motion.div
            initial={{ x: -16, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 180 }}
            className="rounded-full flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              background: "#2563EB",
              boxShadow: "0 12px 24px rgba(37,99,235,0.3)",
            }}
          >
            <ArrowRight size={20} strokeWidth={2} style={{ color: "#fff" }} />
          </motion.div>
        </div>

        {/* AFTER — Brand Blue */}
        <div
          className="relative overflow-hidden p-7 lg:p-10 flex flex-col gap-5"
          style={{
            background: "linear-gradient(160deg, #2563EB 0%, #1D4ED8 100%)",
            borderRight: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <div
            aria-hidden
            className="absolute -right-10 -bottom-12 w-[200px] h-[200px] pointer-events-none"
            style={{ opacity: 0.32 }}
          >
            <LabCanvas shape={c.shape} color="#ffffff" />
          </div>

          <div
            className="font-mono text-[11px] inline-flex items-center gap-2 z-10"
            style={{ color: "rgba(255,255,255,0.65)", letterSpacing: "0.25em" }}
          >
            <Sparkles size={13} strokeWidth={1.8} style={{ color: "#fff" }} />
            СТАЛО
          </div>
          <ul className="flex flex-col gap-4 mt-auto z-10">
            {c.after.map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="flex items-baseline gap-3"
              >
                <span
                  className="font-semibold tracking-tight"
                  style={{
                    fontSize: "clamp(28px, 3vw, 42px)",
                    lineHeight: 1,
                    color: "#fff",
                    letterSpacing: "-0.025em",
                    minWidth: "40%",
                  }}
                >
                  {line.value}
                </span>
                <span
                  className="text-[13px] lg:text-[14px]"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {line.label}
                </span>
              </motion.li>
            ))}
          </ul>
          <div
            className="text-[14.5px] lg:text-[16px] font-semibold mt-2 z-10"
            style={{ color: "#fff", letterSpacing: "-0.01em" }}
          >
            {c.title} →
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ §7 PILLARS — big stat banners с тёмным аккомпанементом ═══════════════ */

type Pillar = {
  id: string;
  step: string;
  tag: string;
  metric: string;
  metricUnit?: string;
  metricLabel: string;
  countTo?: number;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
  shape: string;
  bg: string;
  isDark?: boolean;
};

const PILLARS: Pillar[] = [
  {
    id: "regulator",
    step: "01",
    tag: "РЕГУЛЯТОР",
    metric: "126",
    metricUnit: "+",
    countTo: 126,
    metricLabel: "VASP в портфеле",
    title: "7+ лет в крипто-регулировании",
    desc: "AURVA — прямой доступ. Compliance изнутри, а не из учебника.",
    icon: Gavel,
    shape: "/lab/inversion.png",
    bg: "linear-gradient(160deg, #0a0a0a 0%, #1f2937 100%)",
    isDark: true,
  },
  {
    id: "ai-pipeline",
    step: "02",
    tag: "AI-КОНВЕЙЕР",
    metric: "1-2",
    metricLabel: "недели до MVP",
    title: "AI-first, не AI-because-trendy",
    desc: "Берём AI, когда он реально сокращает время или стоимость в разы.",
    icon: Cpu,
    shape: "/lab/tg-bot.png",
    bg: "linear-gradient(160deg, #2563EB 0%, #1D4ED8 100%)",
    isDark: true,
  },
  {
    id: "ecosystem",
    step: "03",
    tag: "ЭКОСИСТЕМА",
    metric: "9",
    countTo: 9,
    metricLabel: "продуктов финтех-инфры",
    title: "Инструменты, которые работают",
    desc: "Сделали для себя — теперь работают и на ваши проекты тоже.",
    icon: Network,
    shape: "/lab/crm-sync.png",
    bg: "#fff",
    isDark: false,
  },
];

type PillarShaderCfg = {
  colors: string[];
  colorBack: string;
  size: number;
  sizeRange: number;
  spreading: number;
  stepsPerColor: number;
  speed: number;
  fallback: string;
};

const PILLAR_DOT_CFG: Record<string, PillarShaderCfg> = {
  regulator: {
    colorBack: "#0a1330",
    colors: ["#1e3a8a", "#2563eb", "#1e40af", "#0b1740"],
    size: 0.85,
    sizeRange: 0.4,
    spreading: 0.85,
    stepsPerColor: 3,
    speed: 0.6,
    fallback: "linear-gradient(160deg, #0a1330 0%, #1e3a8a 100%)",
  },
  "ai-pipeline": {
    colorBack: "#1d4ed8",
    colors: ["#dbeafe", "#93c5fd", "#60a5fa", "#3b82f6"],
    size: 1.1,
    sizeRange: 0.5,
    spreading: 0.95,
    stepsPerColor: 2,
    speed: 0.7,
    fallback: "linear-gradient(160deg, #2563EB 0%, #1D4ED8 100%)",
  },
  ecosystem: {
    colorBack: "#1e40af",
    colors: ["#bfdbfe", "#60a5fa", "#2563eb", "#1d4ed8"],
    size: 0.95,
    sizeRange: 0.5,
    spreading: 0.95,
    stepsPerColor: 3,
    speed: 0.85,
    fallback: "linear-gradient(160deg, #1e40af 0%, #2563EB 100%)",
  },
};

function PillarsRow() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.05, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  const canRender = sectionInView && hasWebGL;

  return (
    <section ref={sectionRef} style={{ background: "#fafafa", borderTop: "1px solid #e5e5e5" }}>
      <SectionHeader
        id="pillars"
        title="Не пишем код. Перепроектируем бизнес."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 px-4 lg:px-8 pb-7 lg:pb-10">
        {PILLARS.map((p, i) => (
          <PillarCell key={p.id} p={p} index={i} canRender={canRender} />
        ))}
      </div>
    </section>
  );
}

function PillarCell({
  p,
  index,
  canRender,
}: {
  p: Pillar;
  index: number;
  canRender: boolean;
}) {
  const Icon = p.icon;
  const cfg = PILLAR_DOT_CFG[p.id] ?? PILLAR_DOT_CFG.regulator;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        minHeight: "clamp(280px, 32vh, 380px)",
        boxShadow: "0 20px 44px -18px rgba(37,99,235,0.45), 0 4px 12px -4px rgba(37,99,235,0.2)",
      }}
    >
      <div className="absolute inset-0">
        {canRender ? (
          <DotOrbit
            style={{ width: "100%", height: "100%" }}
            colorBack={cfg.colorBack}
            colors={cfg.colors}
            size={cfg.size}
            sizeRange={cfg.sizeRange}
            spreading={cfg.spreading}
            stepsPerColor={cfg.stepsPerColor}
            speed={cfg.speed}
          />
        ) : (
          <div className="w-full h-full" style={{ background: cfg.fallback }} />
        )}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,15,40,0.4) 0%, rgba(7,15,40,0.22) 50%, rgba(7,15,40,0.5) 100%)",
        }}
      />

      <div
        className="absolute -top-2 -left-1 select-none pointer-events-none font-semibold tracking-tight"
        style={{
          fontSize: "clamp(140px, 16vw, 220px)",
          lineHeight: 0.9,
          color: "rgba(255,255,255,0.12)",
          letterSpacing: "-0.05em",
          textShadow: "0 2px 16px rgba(0,0,0,0.25)",
        }}
      >
        {p.step}
      </div>

      <div className="relative z-10 flex flex-col h-full p-7 lg:p-9 pointer-events-none">
        <div className="flex items-start justify-between gap-4 mb-auto">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <Icon size={18} strokeWidth={1.5} style={{ color: "#fff" }} />
          </div>
          <div
            className="font-mono text-[10.5px] font-semibold"
            style={{
              color: "rgba(255,255,255,0.92)",
              letterSpacing: "0.25em",
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            {p.tag}
          </div>
        </div>

        {/* Big metric */}
        <div className="mt-12 lg:mt-16 flex items-baseline gap-2">
          {p.countTo !== undefined ? (
            <CountUp
              to={p.countTo}
              duration={1.6}
              className="font-semibold tracking-tight"
              style={{
                fontSize: "clamp(72px, 8vw, 120px)",
                lineHeight: 0.9,
                color: "#fff",
                letterSpacing: "-0.045em",
                textShadow: "0 4px 22px rgba(0,0,0,0.55)",
              }}
            />
          ) : (
            <div
              className="font-semibold tracking-tight"
              style={{
                fontSize: "clamp(72px, 8vw, 120px)",
                lineHeight: 0.9,
                color: "#fff",
                letterSpacing: "-0.045em",
                textShadow: "0 4px 22px rgba(0,0,0,0.55)",
              }}
            >
              {p.metric}
            </div>
          )}
          {p.metricUnit && (
            <div
              className="font-semibold"
              style={{
                fontSize: "clamp(36px, 4vw, 56px)",
                lineHeight: 1,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.03em",
                textShadow: "0 2px 14px rgba(0,0,0,0.5)",
              }}
            >
              {p.metricUnit}
            </div>
          )}
        </div>
        <div
          className="font-mono text-[11.5px] mt-3 font-semibold"
          style={{
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.18em",
            textShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          {p.metricLabel.toUpperCase()}
        </div>

        {/* Title + desc — bottom */}
        <div
          className="mt-10 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.22)" }}
        >
          <h3
            className="font-semibold tracking-tight transition-transform duration-500 group-hover:translate-x-1"
            style={{
              fontSize: "clamp(1.125rem, 1.4vw, 1.375rem)",
              lineHeight: 1.25,
              color: "#fff",
              letterSpacing: "-0.015em",
              textShadow: "0 2px 12px rgba(0,0,0,0.45)",
            }}
          >
            {p.title}
          </h3>
          <p
            className="text-[13.5px] mt-3 max-w-[24ch]"
            style={{
              color: "rgba(255,255,255,0.85)",
              lineHeight: 1.55,
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            {p.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ §8 FAQ — нумерованный design accordion ═══════════════ */

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Что такое «бесплатная диагностика» — это про звонок продаж?",
    a: "Нет. Это 30 минут разговора с инженером, а не с продажником. Без презентаций и «оставьте номер». Цель — понять, есть ли смысл делать MVP, и если есть — какой именно. Если на диагностике становится ясно, что мы не подходим, так и говорим.",
  },
  {
    q: "Почему MVP всего за $500? В чём подвох?",
    a: "Подвоха нет. $500 — это узкая стартовая неделя: один сценарий, один пользовательский путь, рабочий прототип. Не вся платформа. Дальше вы решаете, продолжать или нет — на основе MVP, а не презентации.",
  },
  {
    q: "Что если MVP не зашёл — деньги вернёте?",
    a: "$500 за стартовую неделю остаются у нас — нам же надо чем-то платить инженеру за неделю работы. Но вы не должны нам ничего сверху. Без неустоек, без подписок, без «дожима менеджером».",
  },
  {
    q: "Кто пишет код — вы или подрядчики?",
    a: "Код пишет наша команда — 16 человек в Бишкеке. Без субподряда. Список людей с ролями есть на главной странице — все на фото с настоящими именами.",
  },
  {
    q: "Сколько занимает «полная разработка» после MVP?",
    a: "От 1 до 2 месяцев в зависимости от объёма. Цена фиксируется ДО старта, после демо MVP. Никаких «выявили доп. требования по ходу» и счётов задним числом.",
  },
  {
    q: "AI-сотрудники — это бот или что-то другое?",
    a: "Это AI-агенты на нашей платформе StafOS. Выполняют конкретные задачи — звонят, считают, проверяют документы, отвечают клиентам в Telegram. Не «умный чат», а сотрудник с пайплайном и метриками.",
  },
];

function StartupsFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section style={{ background: "#fff", borderTop: "1px solid #e5e5e5" }}>
      <SectionHeader id="faq" title="Частые вопросы" />

      <div className="px-6 lg:px-12 pb-10 lg:pb-14">
        <div className="flex flex-col" style={{ borderTop: "1px solid #e5e5e5" }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
                style={{
                  borderBottom: "1px solid #e5e5e5",
                  borderLeft: isOpen
                    ? "3px solid #2563EB"
                    : "3px solid transparent",
                  paddingLeft: isOpen ? "21px" : "24px",
                  background: isOpen ? "#fafafa" : "transparent",
                  transition: "all 0.3s ease",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group w-full flex items-center justify-between gap-6 py-6 lg:py-7 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-5 lg:gap-7 flex-1 min-w-0">
                    <span
                      className="font-mono text-[12px] shrink-0 transition-colors"
                      style={{
                        color: isOpen ? "#2563EB" : "#9ca3af",
                        letterSpacing: "0.15em",
                      }}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className="font-semibold tracking-tight"
                      style={{
                        fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
                        lineHeight: 1.3,
                        color: "#0a0a0a",
                      }}
                    >
                      {f.q}
                    </span>
                  </div>
                  <span
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isOpen ? "#2563EB" : "transparent",
                      border: isOpen ? "none" : "1px solid #e5e5e5",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <Plus
                      size={16}
                      strokeWidth={1.8}
                      style={{ color: isOpen ? "#fff" : "#0a0a0a" }}
                    />
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="pl-12 lg:pl-16 pr-12 pb-7">
                    <p
                      className="text-[14.5px] lg:text-[15px] max-w-3xl"
                      style={{ color: "#525252", lineHeight: 1.65 }}
                    >
                      {f.a}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ FINAL CTA — split с гарантией ═══════════════ */

function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { amount: 0.05, once: true });
  const [hasWebGL, setHasWebGL] = useState(false);

  useEffect(() => {
    setHasWebGL(shadersAllowed());
  }, []);

  const canRender = sectionInView && hasWebGL;

  return (
    <section
      ref={sectionRef}
      className="relative grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 px-4 lg:px-8 py-7 lg:py-10"
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      <style>{`
        .cta-edge-glow-blue {
          box-shadow:
            0 0 0 1px rgba(147,197,253,0.4),
            0 0 32px 4px rgba(59,130,246,0.35),
            0 24px 48px -20px rgba(37,99,235,0.55);
          animation: ctaEdgeGlowBlue 3.6s ease-in-out infinite;
        }
        @keyframes ctaEdgeGlowBlue {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(147,197,253,0.35),
              0 0 32px 4px rgba(59,130,246,0.32),
              0 24px 48px -20px rgba(37,99,235,0.5);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(147,197,253,0.7),
              0 0 56px 12px rgba(59,130,246,0.55),
              0 28px 60px -20px rgba(37,99,235,0.7);
          }
        }
        .cta-edge-glow-dark {
          box-shadow:
            0 0 0 1px rgba(59,130,246,0.3),
            0 0 28px 4px rgba(16,185,129,0.18),
            0 24px 48px -20px rgba(0,0,0,0.55);
          animation: ctaEdgeGlowDark 4.2s ease-in-out infinite;
        }
        @keyframes ctaEdgeGlowDark {
          0%, 100% {
            box-shadow:
              0 0 0 1px rgba(59,130,246,0.28),
              0 0 28px 4px rgba(16,185,129,0.14),
              0 24px 48px -20px rgba(0,0,0,0.55);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(59,130,246,0.55),
              0 0 48px 10px rgba(16,185,129,0.32),
              0 28px 60px -22px rgba(0,0,0,0.65);
          }
        }
      `}</style>
      {/* LEFT — CSS edge-glow CTA */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex flex-col overflow-hidden rounded-2xl cta-edge-glow-blue"
        style={{
          minHeight: "clamp(340px, 38vh, 440px)",
          background: "#1D4ED8",
        }}
      >
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 30% 25%, #3b82f6 0%, transparent 55%), radial-gradient(circle at 75% 75%, #60a5fa 0%, transparent 55%), radial-gradient(circle at 50% 50%, #2563EB 0%, transparent 65%)",
            backgroundSize: "180% 180%, 220% 220%, 200% 200%",
            animation: "painLiveBg 12s ease-in-out infinite",
            opacity: 0.95,
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,15,40,0.28) 0%, rgba(7,15,40,0.14) 50%, rgba(7,15,40,0.4) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-between text-center h-full p-7 lg:p-10 gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-8"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.42)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <Sparkles size={20} strokeWidth={1.6} style={{ color: "#fff" }} />
          </div>

          <div className="flex items-baseline justify-center gap-2">
            <div
              className="font-bold tracking-tight"
              style={{
                fontSize: "clamp(80px, 9vw, 132px)",
                lineHeight: 0.9,
                color: "#fff",
                letterSpacing: "-0.05em",
                textShadow: "0 4px 28px rgba(0,0,0,0.5)",
              }}
            >
              30
            </div>
            <div
              className="font-bold"
              style={{
                fontSize: "clamp(28px, 3.2vw, 44px)",
                lineHeight: 1,
                color: "#fff",
                letterSpacing: "-0.03em",
                textShadow: "0 2px 14px rgba(0,0,0,0.4)",
              }}
            >
              минут
            </div>
          </div>

          <h3
            className="font-semibold tracking-tight max-w-[20ch]"
            style={{
              fontSize: "clamp(1.65rem, 2.4vw, 2.4rem)",
              lineHeight: 1.15,
              color: "#fff",
              letterSpacing: "-0.025em",
              textShadow: "0 4px 22px rgba(0,0,0,0.45)",
            }}
          >
            Поговорим — это бесплатно.
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-center">
              <Link
                href="/client/request"
                className="inline-flex items-center gap-3 px-6 py-3.5 font-semibold transition-all rounded-md"
                style={{
                  background: "#fff",
                  color: "#1d4ed8",
                  fontSize: "14.5px",
                  letterSpacing: "0.01em",
                  boxShadow: "0 12px 28px -8px rgba(0,0,0,0.35)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 36px -10px rgba(0,0,0,0.45)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 28px -8px rgba(0,0,0,0.35)";
                }}
              >
                Получить команду
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <a
                href="mailto:asystem.teamwork@gmail.com"
                className="inline-flex items-center gap-3 px-6 py-3.5 font-medium transition-colors"
                style={{
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "#fff",
                  fontSize: "14.5px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                asystem.teamwork@gmail.com
              </a>
            </div>
        </div>
      </motion.div>

      {/* RIGHT — calmer guarantee PulsingBorder */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex flex-col overflow-hidden rounded-2xl cta-edge-glow-dark"
        style={{
          minHeight: "clamp(340px, 38vh, 440px)",
          background: "#052e16",
        }}
      >
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 30% 25%, #047857 0%, transparent 55%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 55%), radial-gradient(circle at 50% 50%, #064e3b 0%, transparent 65%)",
            backgroundSize: "200% 200%, 240% 240%, 220% 220%",
            animation: "painLiveBg 14s ease-in-out infinite",
            opacity: 0.95,
          }}
        />

        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0.42) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-between text-center h-full p-7 lg:p-10 gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(16,185,129,0.22)",
              border: "1px solid rgba(16,185,129,0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <ShieldCheck size={20} strokeWidth={1.6} style={{ color: "#34d399" }} />
          </div>

          <div className="flex items-baseline justify-center gap-2">
            <div
              className="font-bold tracking-tight"
              style={{
                fontSize: "clamp(80px, 9vw, 132px)",
                lineHeight: 0.9,
                color: "#fff",
                letterSpacing: "-0.05em",
                textShadow: "0 4px 28px rgba(0,0,0,0.55)",
              }}
            >
              $500
            </div>
            <div
              className="font-bold"
              style={{
                fontSize: "clamp(28px, 3.2vw, 44px)",
                lineHeight: 1,
                color: "#34d399",
                letterSpacing: "-0.03em",
                textShadow: "0 2px 14px rgba(0,0,0,0.5)",
              }}
            >
              за неделю
            </div>
          </div>

          <h3
            className="font-semibold tracking-tight max-w-[24ch]"
            style={{
              fontSize: "clamp(1.65rem, 2.4vw, 2.4rem)",
              lineHeight: 1.15,
              color: "#fff",
              letterSpacing: "-0.025em",
              textShadow: "0 4px 22px rgba(0,0,0,0.5)",
            }}
          >
            Не зашло — ничего сверху не должны.
          </h3>

          {/* placeholder для выравнивания с LEFT карточкой где есть кнопки */}
          <div className="h-[44px]" aria-hidden />
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════ SUBMIT ROW + FOOTER WORDMARK ═══════════════ */

function SubmitRow() {
  return (
    <div
      className="flex items-center justify-between px-6 lg:px-12 py-8"
      style={{ borderTop: "1px solid #e5e5e5", background: "#fff" }}
    >
      <div className="font-mono text-[11px]" style={{ color: "#9ca3af", letterSpacing: "0.2em" }}>
        8 SECTIONS · ∞
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
