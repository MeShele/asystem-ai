"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HandCoins,
  Rocket,
  Percent,
  ShieldCheck,
  Users,
  Mic,
  Briefcase,
  Globe,
  ArrowRight,
} from "lucide-react";
import { MobileTopBar } from "@/components/shared/mobile-topbar";

const PARTNER_MOBILE_NAV = [
  {
    title: "Partner",
    items: [
      { label: "модель", href: "#hero" },
      { label: "как это работает", href: "#how" },
      { label: "математика", href: "#math" },
      { label: "кому подходит", href: "#who" },
      { label: "условия", href: "#terms" },
      { label: "faq · 6", href: "#faq" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "← на главную", href: "/" },
      { label: "оставить заявку (клиент)", href: "/client/request" },
    ],
  },
  {
    title: "Contact",
    items: [
      { label: "asystem.teamwork@gmail.com", href: "mailto:asystem.teamwork@gmail.com", external: true },
      { label: "Telegram", href: "https://t.me/asystem_studio", external: true },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   Партнёрский лендинг — в стиле sidebar+grid главной.
   ═══════════════════════════════════════════════════════════ */

export function PartnerWall() {
  return (
    <>
      <MobileTopBar groups={PARTNER_MOBILE_NAV} />
      <div
        className="min-h-screen flex flex-col lg:flex-row"
        style={{ background: "#fff", color: "#0a0a0a" }}
      >
        <PartnerSidebar />
        <PartnerMain />
      </div>
    </>
  );
}

/* ═══════════════ SIDEBAR ═══════════════ */

function PartnerSidebar() {
  return (
    <aside
      className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-12 lg:flex-col lg:gap-10"
      style={{ borderRight: "1px solid #e5e5e5", background: "#fff" }}
    >
      <Link href="/" className="inline-flex items-baseline gap-1">
        <span className="text-[22px] font-semibold tracking-tight">asystem</span>
        <span className="text-[22px] font-semibold" style={{ color: "#2563EB" }}>.</span>
        <span className="text-[22px] font-semibold tracking-tight">ai</span>
        <span
          className="ml-2 font-mono text-[10px]"
          style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
        >
          / partner
        </span>
      </Link>

      <SidebarGroup title="Partner">
        <SidebarLink href="#hero">модель</SidebarLink>
        <SidebarLink href="#how">как это работает</SidebarLink>
        <SidebarLink href="#math">математика</SidebarLink>
        <SidebarLink href="#who">кому подходит</SidebarLink>
        <SidebarLink href="#terms">условия</SidebarLink>
        <SidebarLink href="#faq">faq · 6</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Company">
        <SidebarLink href="/">← на главную</SidebarLink>
        <SidebarLink href="/client/request">оставить заявку (клиент)</SidebarLink>
      </SidebarGroup>

      <SidebarGroup title="Contact">
        <SidebarLink href="mailto:asystem.teamwork@gmail.com" external>
          asystem.teamwork@gmail.com
        </SidebarLink>
        <SidebarLink href="https://t.me/asystem_studio" external>
          Telegram
        </SidebarLink>
      </SidebarGroup>

      <div className="mt-auto pt-10">
        <LiveTimestamp />
        <div
          className="mt-4 font-mono text-[10px]"
          style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
        >
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
  const inner = (
    <span
      className="text-[14px] transition-colors"
      style={{ color: "#0a0a0a" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563EB")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0a0a0a")}
    >
      {children}
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
    <div
      className="font-mono text-[10px] flex items-center gap-2"
      style={{ color: "#6b7280", letterSpacing: "0.1em" }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}
      />
      ONLINE · {time} · BISHKEK
    </div>
  );
}

/* ═══════════════ MAIN ═══════════════ */

function PartnerMain() {
  return (
    <main className="flex-1 min-w-0">
      <HeroSection />
      <HowSection />
      <MathSection />
      <WhoSection />
      <TermsSection />
      <FAQSection />
      <FinalCTA />
    </main>
  );
}

/* ═══════════════ HERO ═══════════════ */

function HeroSection() {
  return (
    <section id="hero" className="px-6 lg:px-12 py-20 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl"
      >
        <div
          className="font-mono text-[11px] mb-6 inline-flex items-center gap-2"
          style={{ color: "#2563EB", letterSpacing: "0.2em" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
          PARTNER · CLOSED BETA
        </div>

        <h1
          className="font-semibold tracking-tight"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.03em",
          }}
        >
          Зарабатывай на&nbsp;IT{" "}
          <span style={{ color: "#9ca3af" }}>без разработчиков</span>.
        </h1>

        <p
          className="mt-8 max-w-2xl"
          style={{
            fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
            lineHeight: 1.5,
            color: "#525252",
          }}
        >
          Приводи клиентов — мы делаем. Ты забираешь{" "}
          <strong style={{ color: "#0a0a0a" }}>от 10% с базы</strong> (растёт до 30% по уровням) и{" "}
          <strong style={{ color: "#0a0a0a" }}>половину наценки</strong> сверху.
          MVP без предоплаты — клиент не рискует, ты не объясняешь.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <a
            href="#apply"
            className="inline-flex items-center gap-3 px-7 py-4 transition-colors"
            style={{
              background: "#2563EB",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#2563EB")}
          >
            Стать партнёром
            <ArrowRight size={16} />
          </a>
          <a
            href="#math"
            className="inline-flex items-center gap-3 px-7 py-4 transition-colors"
            style={{
              border: "1px solid #e5e5e5",
              color: "#0a0a0a",
              fontSize: "15px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#fafafa")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            Посчитать — пример
          </a>
        </div>

        {/* Quick stats strip */}
        <div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: "#e5e5e5" }}
        >
          {[
            { v: "10–30%", l: "с базы по уровням" },
            { v: "50/50", l: "наценки" },
            { v: "0 с", l: "предоплата" },
            { v: "24h", l: "ответ по КП" },
          ].map((s, i) => (
            <div
              key={i}
              className="p-5 lg:p-6 flex flex-col gap-2"
              style={{ background: "#fff" }}
            >
              <div
                className="font-semibold tracking-tight"
                style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", lineHeight: 1 }}
              >
                {s.v}
              </div>
              <div
                className="font-mono text-[10px]"
                style={{ color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ═══════════════ HOW IT WORKS ═══════════════ */

const STEPS = [
  {
    n: "01",
    icon: HandCoins,
    title: "Приводишь клиента",
    desc: "Рекомендуешь asystem своему клиенту — через ссылку, устно или в переписке. Мы разговариваем сами.",
  },
  {
    n: "02",
    icon: Rocket,
    title: "Мы делаем MVP",
    desc: "Без предоплаты, по нашей базовой цене. Твой клиент видит результат раньше счёта.",
  },
  {
    n: "03",
    icon: Percent,
    title: "Ты забираешь маржу",
    desc: "От 10% от базы (растёт по уровням до 30%) — сразу после оплаты клиентом. Плюс 50% от любой наценки, которую ты сам назначил.",
  },
];

function HowSection() {
  return (
    <section
      id="how"
      className="px-6 lg:px-12 py-16 lg:py-24"
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      <SectionHeader kicker="How · 3 steps" title="Три шага" subtitle="От звонка клиента до твоей комиссии." />
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "#e5e5e5" }}>
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="p-8 lg:p-10 flex flex-col gap-4"
            style={{ background: "#fff" }}
          >
            <div
              className="flex items-center justify-between"
              style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}
            >
              <span
                className="font-mono text-[11px]"
                style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
              >
                {s.n}
              </span>
              <s.icon size={22} strokeWidth={1.5} style={{ color: "#2563EB" }} />
            </div>
            <h3
              className="font-semibold tracking-tight"
              style={{ fontSize: "1.25rem", lineHeight: 1.2, color: "#0a0a0a" }}
            >
              {s.title}
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#525252" }}>
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════ MATH ═══════════════ */

function MathSection() {
  return (
    <section
      id="math"
      className="px-6 lg:px-12 py-16 lg:py-24"
      style={{ background: "#fafafa", color: "#0a0a0a", borderTop: "1px solid #e5e5e5" }}
    >
      <SectionHeader
        kicker="Math · example"
        title="Математика сделки"
        subtitle="Пример: клиент готов платить $1 200. Вот как делится."
      />

      <div className="mt-12 max-w-4xl">
        <div className="font-mono text-sm lg:text-[15px] leading-loose">
          {[
            { l: "Бюджет клиента", v: "$1 200", c: "rgba(10,10,10,0.6)" },
            { l: "Наша базовая цена", v: "$600", c: "#0a0a0a" },
            { l: "├─ 10% база L1 — тебе сразу", v: "+$60", c: "#10b981" },
            { l: "└─ остаётся у asystem", v: "$540", c: "rgba(10,10,10,0.6)" },
            { l: "", v: "", c: "" },
            { l: "Наценка (твоя, свободная)", v: "$600", c: "#0a0a0a" },
            { l: "├─ 50% тебе", v: "+$300", c: "#10b981" },
            { l: "└─ 50% asystem", v: "$300", c: "rgba(10,10,10,0.6)" },
            { l: "", v: "", c: "" },
            { l: "ИТОГО ТЕБЕ", v: "$360", c: "#2563EB", big: true },
          ].map((r, i) =>
            r.l === "" ? (
              <div key={i} className="h-4" />
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-baseline justify-between gap-4"
                style={{
                  fontSize: r.big ? "clamp(1.5rem, 3vw, 2.25rem)" : undefined,
                  fontWeight: r.big ? 600 : 400,
                  paddingTop: r.big ? "16px" : "4px",
                  paddingBottom: r.big ? "16px" : "4px",
                  borderTop: r.big ? "1px solid rgba(10,10,10,0.15)" : undefined,
                }}
              >
                <span style={{ color: r.c, whiteSpace: "nowrap" }}>{r.l}</span>
                <span
                  className="tabular-nums"
                  style={{ color: r.c, fontWeight: r.big ? 600 : 500 }}
                >
                  {r.v}
                </span>
              </motion.div>
            )
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 p-6 font-mono text-[13px]"
          style={{
            background: "rgba(37, 99, 235,0.08)",
            border: "1px solid rgba(37, 99, 235,0.25)",
            lineHeight: 1.55,
            color: "rgba(10,10,10,0.8)",
          }}
        >
          <strong style={{ color: "#2563EB" }}>НАЦЕНКА — ТВОЯ</strong>. Назначаешь сам.
          Клиенту показываешь финальную цену. Нашу базовую (`$600` в примере) он
          никогда не видит.
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════ WHO ═══════════════ */

const WHO = [
  {
    icon: Mic,
    title: "Блогер · инфлюенсер",
    desc: "У тебя аудитория предпринимателей. Они спрашивают «где сайт делал?». Теперь есть ответ.",
  },
  {
    icon: Briefcase,
    title: "Консультант · коуч",
    desc: "Помогаешь бизнесу расти — и клиенту нужен сайт/бот/автоматизация. Не отправляй его в никуда.",
  },
  {
    icon: Globe,
    title: "Маркетолог · агентство",
    desc: "Берёшь клиента в work — нужен продакшн. Мы white-label. Твой бренд, наш код.",
  },
];

function WhoSection() {
  return (
    <section
      id="who"
      className="px-6 lg:px-12 py-16 lg:py-24"
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      <SectionHeader kicker="Who · 3 profiles" title="Кому подходит" subtitle="Если ты — один из этих трёх, партнёрка для тебя." />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "#e5e5e5" }}>
        {WHO.map((w, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="p-8 lg:p-10 flex flex-col gap-4"
            style={{ background: "#fff" }}
          >
            <w.icon size={28} strokeWidth={1.25} style={{ color: "#0a0a0a" }} />
            <h3
              className="font-semibold tracking-tight"
              style={{ fontSize: "1.25rem", lineHeight: 1.2 }}
            >
              {w.title}
            </h3>
            <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#525252" }}>
              {w.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════ TERMS ═══════════════ */

const TERMS_ROWS = [
  { they: "Приведёт клиента", we: "Сделаем MVP без предоплаты" },
  { they: "Назначит наценку", we: "Отдадим 50% с неё" },
  { they: "Проконтролирует связь", we: "Ответим клиенту за 24 часа" },
  { they: "Не разбирается в коде — и не надо", we: "Даём код, доступы, документы" },
  { they: "Может привести хоть десять", we: "Каждый — по той же модели" },
];

function TermsSection() {
  return (
    <section
      id="terms"
      className="px-6 lg:px-12 py-16 lg:py-24"
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      <SectionHeader kicker="Terms" title="Условия на пальцах" subtitle="Что делает партнёр — что делаем мы. Без юридического крыжа." />
      <div className="mt-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "#e5e5e5" }}>
          {/* Headers */}
          <div className="p-5 lg:p-6 flex items-center gap-2" style={{ background: "#f5f5f5" }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#2563EB" }}
            />
            <div
              className="font-mono text-[11px]"
              style={{ color: "#0a0a0a", letterSpacing: "0.25em", fontWeight: 600 }}
            >
              ТЫ
            </div>
            <span
              className="font-mono text-[10px] ml-2"
              style={{ color: "#9ca3af", letterSpacing: "0.15em" }}
            >
              — партнёр
            </span>
          </div>
          <div className="p-5 lg:p-6 flex items-center gap-2" style={{ background: "#f5f5f5" }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#10b981" }}
            />
            <div
              className="font-mono text-[11px]"
              style={{ color: "#0a0a0a", letterSpacing: "0.25em", fontWeight: 600 }}
            >
              МЫ
            </div>
            <span
              className="font-mono text-[10px] ml-2"
              style={{ color: "#9ca3af", letterSpacing: "0.15em" }}
            >
              — asystem
            </span>
          </div>

          {/* Rows: чередуем THEY и WE попарно чтобы grid 2-cols правильно разложил */}
          {TERMS_ROWS.flatMap((r, i) => [
            <motion.div
              key={`they-${i}`}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-5 lg:p-6"
              style={{ background: "#fff" }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="font-mono text-[10px] mt-[3px] shrink-0"
                  style={{ color: "#2563EB", letterSpacing: "0.15em", fontWeight: 600 }}
                >
                  0{i + 1}
                </span>
                <span style={{ fontSize: "14.5px", lineHeight: 1.5, color: "#0a0a0a" }}>
                  {r.they}
                </span>
              </div>
            </motion.div>,
            <motion.div
              key={`we-${i}`}
              initial={{ opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.05 + 0.08 }}
              className="p-5 lg:p-6"
              style={{ background: "#fff" }}
            >
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={14}
                  strokeWidth={2}
                  style={{ color: "#10b981", marginTop: "5px", flexShrink: 0 }}
                />
                <span style={{ fontSize: "14.5px", lineHeight: 1.5, color: "#0a0a0a" }}>
                  {r.we}
                </span>
              </div>
            </motion.div>,
          ])}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ FAQ ═══════════════ */

const FAQ = [
  {
    q: "Откуда 10–30% с базы? Это честно?",
    a: "Мы закладываем комиссию в маржу с самого начала. Базовые проценты растут по уровням: L1 — 10%, L2 — 14%, L3 — 19%, L4 — 24%, L5 — 30%. Плюс множители: Founding +5%, Retention +5%, Быстрая сдача +10%. На крупных чеках процент мягко урезается (tier-decay), но абсолютный $$ всё равно растёт. Без партнёров мы не нашли бы этого клиента.",
  },
  {
    q: "Я могу назначить любую наценку?",
    a: "Любую. Клиент видит одну финальную цену от тебя — нашу базовую никогда. Типичная партнёрская наценка — 50-150% от базы. 50% от твоей наценки идут тебе, 50% нам за исполнение.",
  },
  {
    q: "Что, если клиент недоволен результатом?",
    a: "У нас MVP без предоплаты — клиент сначала видит работу, потом платит. Если работа не взлетела и клиент не платит — ни ты, ни он не теряете денег. Риск на нас.",
  },
  {
    q: "Когда я получу комиссию?",
    a: "Базовая комиссия приходит в течение 3 рабочих дней после оплаты клиентом. 50% наценки — через 5 рабочих дней после полной оплаты проекта. На карту, USDT или наличными.",
  },
  {
    q: "Нужен ли договор?",
    a: "Для первой сделки — нет. Простая переписка в Telegram. Для сделок от $5 000 — подписываем партнёрское соглашение за 24 часа.",
  },
  {
    q: "Сколько партнёров вы берёте?",
    a: "Сейчас программа в closed beta. Берём 20 партнёров в первой волне. После этого — по рекомендации активных.",
  },
];

function FAQSection() {
  return (
    <section
      id="faq"
      className="px-6 lg:px-12 py-16 lg:py-24"
      style={{ borderTop: "1px solid #e5e5e5" }}
    >
      <SectionHeader kicker="FAQ · 6" title="Частые вопросы" subtitle="Страхи, которые возникают первыми. Разбираем." />
      <div className="mt-12 max-w-4xl">
        {FAQ.map((f, i) => (
          <FAQItem key={i} item={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FAQItem({
  item,
  index,
}: {
  item: (typeof FAQ)[number];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.details
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group py-6 cursor-pointer"
      style={{ borderTop: "1px solid #e5e5e5" }}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary
        className="flex items-start justify-between gap-6 list-none"
        style={{ cursor: "pointer" }}
      >
        <div className="flex items-start gap-4 flex-1">
          <span
            className="font-mono text-[11px] mt-[4px]"
            style={{ color: "#9ca3af", letterSpacing: "0.15em" }}
          >
            0{index + 1}
          </span>
          <span
            className="font-semibold tracking-tight transition-colors"
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
              lineHeight: 1.3,
              color: open ? "#2563EB" : "#0a0a0a",
            }}
          >
            {item.q}
          </span>
        </div>
        <span
          className="shrink-0 transition-transform"
          style={{
            transform: open ? "rotate(45deg)" : "rotate(0)",
            fontSize: "24px",
            lineHeight: 1,
            color: open ? "#2563EB" : "#9ca3af",
          }}
        >
          +
        </span>
      </summary>
      <div
        className="mt-4 pl-[34px]"
        style={{
          fontSize: "14.5px",
          lineHeight: 1.55,
          color: "#525252",
          maxWidth: "720px",
        }}
      >
        {item.a}
      </div>
    </motion.details>
  );
}

/* ═══════════════ FINAL CTA ═══════════════ */

function FinalCTA() {
  return (
    <section
      id="apply"
      className="px-6 lg:px-12 py-20 lg:py-32 relative overflow-hidden"
      style={{ background: "#fafafa", color: "#0a0a0a", borderTop: "1px solid #e5e5e5" }}
    >
      <div className="relative max-w-3xl">
        <div
          className="font-mono text-[11px] mb-6"
          style={{ color: "#2563EB", letterSpacing: "0.3em" }}
        >
          APPLY
        </div>
        <h2
          className="font-semibold tracking-tight"
          style={{
            fontSize: "clamp(2rem, 5vw, 4rem)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          Напиши нам.
          <br />
          <span style={{ color: "#525252" }}>Одна переписка в Telegram —</span>
          <br />
          и начинаем.
        </h2>
        <p
          className="mt-6 max-w-xl"
          style={{
            fontSize: "16px",
            lineHeight: 1.55,
            color: "rgba(10,10,10,0.65)",
          }}
        >
          Без анкет на 40 вопросов, без Zoom-интервью.
          Расскажи о своей аудитории — дальше разбираемся на ходу.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <a
            href="https://t.me/asystem_studio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-7 py-4 transition-colors"
            style={{
              background: "#2563EB",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#2563EB")}
          >
            Написать в Telegram
            <ArrowRight size={16} />
          </a>
          <a
            href="mailto:asystem.teamwork@gmail.com"
            className="inline-flex items-center gap-3 px-7 py-4 transition-colors"
            style={{
              border: "1px solid rgba(10,10,10,0.2)",
              color: "#0a0a0a",
              fontSize: "15px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(10,10,10,0.05)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            asystem.teamwork@gmail.com
          </a>
        </div>

        <div
          className="mt-16 flex flex-wrap items-center gap-6 font-mono text-[11px]"
          style={{ color: "rgba(10,10,10,0.4)", letterSpacing: "0.15em" }}
        >
          <span>✓ CLOSED BETA · 20 СЛОТОВ</span>
          <span>✓ ПЕРВАЯ СДЕЛКА — БЕЗ ДОГОВОРА</span>
          <span>✓ ОТВЕТ ЗА 24 ЧАСА</span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ SECTION HEADER ═══════════════ */

function SectionHeader({
  kicker,
  title,
  subtitle,
  onDark = false,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  onDark?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="font-mono text-[11px] mb-4 inline-flex items-center gap-2"
        style={{
          color: onDark ? "#2563EB" : "#2563EB",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
        {kicker}
      </div>
      <h2
        className="font-semibold tracking-tight"
        style={{
          fontSize: "clamp(2rem, 4vw, 3.25rem)",
          lineHeight: 1.05,
          color: onDark ? "#fff" : "#0a0a0a",
        }}
      >
        {title}
      </h2>
      <p
        className="mt-3 max-w-xl"
        style={{
          fontSize: "15px",
          lineHeight: 1.5,
          color: onDark ? "rgba(255,255,255,0.55)" : "#6b7280",
        }}
      >
        {subtitle}
      </p>
    </motion.div>
  );
}
