import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
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
import { ProjectsShell, type ProjectsShellCategory } from "@/components/projects/projects-shell";
import { HeroMeshBg } from "@/components/projects/hero-mesh-bg";

const T: Record<PortfolioLocale, {
  eyebrow: string; title: string; subtitle: string;
  back: string; empty: string; contactLabel: string;
  all: string; uncategorized: string;
}> = {
  ru: {
    eyebrow: "Portfolio · Все проекты",
    title: "Работы\nстудии",
    subtitle: "Кейсы, которые мы сделали и которые делаем сейчас. Если есть публичный сайт — открывается по клику. Если нет — рядом контактное лицо клиента.",
    back: "На главную",
    empty: "Пока пусто.",
    contactLabel: "Подтвердит",
    all: "Все",
    uncategorized: "Без категории",
  },
  kg: {
    eyebrow: "Portfolio · Бардык долбоорлор",
    title: "Студиянын\nиштери",
    subtitle: "Биз жасаган жана азыр жасап жаткан кейстер. Ачык сайт болсо — басууга болот. Жок болсо — кардардын байланыш адамы.",
    back: "Башкы бетке",
    empty: "Азырынча бош.",
    contactLabel: "Ырастайт",
    all: "Баары",
    uncategorized: "Категориясыз",
  },
  en: {
    eyebrow: "Portfolio · All projects",
    title: "Studio\nwork",
    subtitle: "Cases we've shipped and ones in flight. If there's a public site — open it. If not — the client contact is right next to it.",
    back: "Back to home",
    empty: "Nothing here yet.",
    contactLabel: "Confirms",
    all: "All",
    uncategorized: "Uncategorized",
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
  const h = T[locale as PortfolioLocale] ?? T.ru;
  const title = h.title.replace("\n", " ");
  return {
    title: `${title} · asystem.ai`,
    description: h.subtitle,
    openGraph: {
      title: `${title} · asystem.ai`,
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
  const h = T[locale];
  const { cases, categories } = await loadData();

  const byCategory = new Map<number | "none", PortfolioCase[]>();
  for (const c of cases) {
    const key = c.category_id ?? "none";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(c);
  }

  const shellCategories: ProjectsShellCategory[] = categories.map((cat) => ({
    slug: cat.slug,
    name: pickTranslation(cat.translations, locale)?.name ?? cat.slug,
    count: byCategory.get(cat.id)?.length ?? 0,
  }));

  return (
    <ProjectsShell
      locale={locale}
      totalCount={cases.length}
      categories={shellCategories}
      uncategorizedCount={byCategory.get("none")?.length ?? 0}
      backLabel={h.back}
      allLabel={h.all}
      uncategorizedLabel={h.uncategorized}
    >
      {/* HERO в стиле главной — с анимированным mesh-фоном Brand Blue */}
      <header
        id="all"
        className="relative overflow-hidden px-6 lg:px-12 py-16 lg:py-24"
        style={{ borderBottom: "1px solid #e5e5e5" }}
      >
        <HeroMeshBg />
        <div className="relative z-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] mb-6" style={{ color: "#2563EB" }}>
            {h.eyebrow} · {cases.length}
          </div>
          <h1
            className="font-semibold tracking-tight whitespace-pre-line"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
          >
            {h.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] lg:text-[16px]" style={{ color: "rgba(10,10,10,0.65)", lineHeight: 1.55 }}>
            {h.subtitle}
          </p>
        </div>
      </header>

      {/* LIST по категориям */}
      {cases.length === 0 ? (
        <div className="px-6 lg:px-12 py-32 text-center text-text-muted">{h.empty}</div>
      ) : (
        <>
          {categories.map((cat) => {
            const list = byCategory.get(cat.id) ?? [];
            if (list.length === 0) return null;
            const name = pickTranslation(cat.translations, locale)?.name ?? cat.slug;
            return (
              <CategorySection
                key={cat.id}
                id={`cat-${cat.slug}`}
                kicker={`Category · ${list.length}`}
                title={name}
                cases={list}
                locale={locale}
                contactLabel={h.contactLabel}
              />
            );
          })}
          {(byCategory.get("none")?.length ?? 0) > 0 && (
            <CategorySection
              id="cat-none"
              kicker={`Category · ${byCategory.get("none")!.length}`}
              title={h.uncategorized}
              cases={byCategory.get("none") ?? []}
              locale={locale}
              contactLabel={h.contactLabel}
            />
          )}
        </>
      )}
    </ProjectsShell>
  );
}

function CategorySection({
  id,
  kicker,
  title,
  cases,
  locale,
  contactLabel,
}: {
  id: string;
  kicker: string;
  title: string;
  cases: PortfolioCase[];
  locale: PortfolioLocale;
  contactLabel: string;
}) {
  return (
    <section id={id} style={{ borderBottom: "1px solid #e5e5e5" }}>
      {/* SectionHeader в стиле главной */}
      <header className="px-6 lg:px-12 py-12 lg:py-16">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] mb-3" style={{ color: "#2563EB" }}>
          {kicker}
        </div>
        <h2 className="font-semibold tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.05 }}>
          {title}
        </h2>
      </header>
      <div className="px-6 lg:px-12 pb-12 lg:pb-16 space-y-6">
        {cases.map((c) => (
          <Link key={c.id} href={`/projects/${c.slug}`} className="block">
            <PortfolioCard case={c} locale={locale} variant="wide" contactLabel={contactLabel} />
          </Link>
        ))}
      </div>
    </section>
  );
}
