import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { getDb, initPortfolioTables } from "@/lib/db";
import {
  toPortfolioCase,
  toPortfolioCategory,
  pickTranslation,
  type PortfolioCase,
  type PortfolioCategory,
  type PortfolioLocale,
} from "@/lib/portfolio-types";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";

const HEADLINE: Record<PortfolioLocale, { eyebrow: string; title: string; subtitle: string; back: string; empty: string; contactLabel: string; all: string }> = {
  ru: {
    eyebrow: "Portfolio · Все проекты",
    title: "Работы студии",
    subtitle: "Кейсы, которые мы сделали и которые делаем сейчас. Если есть публичный сайт — открывается по клику. Если нет — рядом контактное лицо клиента.",
    back: "На главную",
    empty: "Пока пусто. Скоро здесь появятся кейсы.",
    contactLabel: "Подтвердит",
    all: "Все",
  },
  kg: {
    eyebrow: "Portfolio · Бардык долбоорлор",
    title: "Студиянын иштери",
    subtitle: "Биз жасаган жана азыр жасап жаткан кейстер. Ачык сайт болсо — басууга болот. Жок болсо — кардардын байланыш адамы.",
    back: "Башкы бетке",
    empty: "Азырынча бош. Жакында кейстер пайда болот.",
    contactLabel: "Ырастайт",
    all: "Баары",
  },
  en: {
    eyebrow: "Portfolio · All projects",
    title: "Studio work",
    subtitle: "Cases we've shipped and ones in flight. If there's a public site — open it. If not — the client contact is right next to it.",
    back: "Back to home",
    empty: "Nothing here yet. Cases are coming.",
    contactLabel: "Confirms",
    all: "All",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const h = HEADLINE[locale as PortfolioLocale] ?? HEADLINE.ru;
  return {
    title: `${h.title} · asystem.ai`,
    description: h.subtitle,
    openGraph: {
      title: `${h.title} · asystem.ai`,
      description: h.subtitle,
      url: `https://asystem.ai/${locale}/projects`,
      type: "website",
    },
    alternates: {
      canonical: `https://asystem.ai/${locale}/projects`,
      languages: {
        ru: "https://asystem.ai/ru/projects",
        kg: "https://asystem.ai/kg/projects",
        en: "https://asystem.ai/en/projects",
      },
    },
  };
}

async function loadData(): Promise<{ cases: PortfolioCase[]; categories: PortfolioCategory[] }> {
  try {
    await initPortfolioTables();
    const db = getDb();
    const rows = await db`
      SELECT pc.*, cat.slug AS category_slug
      FROM portfolio_cases pc
      LEFT JOIN portfolio_categories cat ON cat.id = pc.category_id
      ORDER BY pc.order_index ASC, pc.id ASC
    `;
    const cats = await db`SELECT * FROM portfolio_categories ORDER BY order_index ASC, id ASC`;
    return {
      cases: rows.map(toPortfolioCase),
      categories: cats.map(toPortfolioCategory),
    };
  } catch {
    return { cases: [], categories: [] };
  }
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: PortfolioLocale = ["ru", "kg", "en"].includes(rawLocale) ? (rawLocale as PortfolioLocale) : "ru";
  const h = HEADLINE[locale];
  const { cases, categories } = await loadData();

  // group by category_id (включая null = "Без категории")
  const byCategory = new Map<number | "none", PortfolioCase[]>();
  for (const c of cases) {
    const key = c.category_id ?? "none";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(c);
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#fff", color: "#0a0a0a" }}>
      {/* SIDEBAR */}
      <aside
        className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-12 lg:flex-col lg:gap-8"
        style={{ borderRight: "1px solid #e5e5e5", background: "#fff" }}
      >
        <Link href="/" className="inline-flex items-baseline gap-1 group" aria-label="asystem.ai">
          <span className="text-[22px] font-semibold tracking-tight">asystem</span>
          <span className="text-[22px] font-semibold" style={{ color: "#2563EB" }}>.</span>
          <span className="text-[22px] font-semibold tracking-tight">ai</span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> {h.back}
        </Link>

        <div className="flex flex-col gap-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">Категории</div>
          <a
            href="#all"
            className="flex items-center justify-between py-1.5 text-[13px] text-text-primary hover:text-brand-500 transition-colors"
          >
            <span>{h.all}</span>
            <span className="font-mono text-[11px] text-text-muted tabular-nums">{cases.length}</span>
          </a>
          {categories.map((cat) => {
            const count = byCategory.get(cat.id)?.length ?? 0;
            if (count === 0) return null;
            const name = pickTranslation(cat.translations, locale)?.name ?? cat.slug;
            return (
              <a
                key={cat.id}
                href={`#cat-${cat.slug}`}
                className="flex items-center justify-between py-1.5 text-[13px] text-text-secondary hover:text-brand-500 transition-colors"
              >
                <span>{name}</span>
                <span className="font-mono text-[11px] text-text-muted tabular-nums">{count}</span>
              </a>
            );
          })}
          {(byCategory.get("none")?.length ?? 0) > 0 && categories.length > 0 && (
            <a
              href="#cat-none"
              className="flex items-center justify-between py-1.5 text-[13px] text-text-secondary hover:text-brand-500 transition-colors"
            >
              <span>—</span>
              <span className="font-mono text-[11px] text-text-muted tabular-nums">{byCategory.get("none")?.length}</span>
            </a>
          )}
        </div>

        <div className="mt-auto font-mono text-[10px] uppercase tracking-wider text-text-muted">
          BISHKEK · STUDIO
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-w-0">
        {/* HERO */}
        <section
          id="all"
          className="px-6 lg:px-12 py-16 lg:py-24"
          style={{ borderBottom: "1px solid #e5e5e5" }}
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-500 mb-4">
            {h.eyebrow} · {cases.length}
          </div>
          <h1 className="text-[clamp(36px,5vw,64px)] font-semibold leading-[1.05] tracking-tight max-w-3xl">
            {h.title}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-text-secondary max-w-2xl">
            {h.subtitle}
          </p>
        </section>

        {/* LIST */}
        {cases.length === 0 ? (
          <div className="px-6 lg:px-12 py-24 text-center text-text-muted">{h.empty}</div>
        ) : (
          <div>
            {categories.map((cat) => {
              const list = byCategory.get(cat.id) ?? [];
              if (list.length === 0) return null;
              const name = pickTranslation(cat.translations, locale)?.name ?? cat.slug;
              return (
                <CategorySection key={cat.id} id={`cat-${cat.slug}`} title={name} cases={list} locale={locale} contactLabel={h.contactLabel} />
              );
            })}
            {(byCategory.get("none")?.length ?? 0) > 0 && (
              <CategorySection
                id="cat-none"
                title={locale === "ru" ? "Без категории" : locale === "kg" ? "Категориясыз" : "Uncategorized"}
                cases={byCategory.get("none") ?? []}
                locale={locale}
                contactLabel={h.contactLabel}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function CategorySection({
  id,
  title,
  cases,
  locale,
  contactLabel,
}: {
  id: string;
  title: string;
  cases: PortfolioCase[];
  locale: PortfolioLocale;
  contactLabel: string;
}) {
  return (
    <section id={id} className="px-6 lg:px-12 py-12 lg:py-16" style={{ borderBottom: "1px solid #e5e5e5" }}>
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">{title}</h2>
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted tabular-nums">
          · {cases.length}
        </span>
      </div>
      <div className="space-y-6">
        {cases.map((c) => (
          <Link key={c.id} href={`/projects/${c.slug}`} className="block">
            <PortfolioCard case={c} locale={locale} variant="wide" contactLabel={contactLabel} />
          </Link>
        ))}
      </div>
    </section>
  );
}
