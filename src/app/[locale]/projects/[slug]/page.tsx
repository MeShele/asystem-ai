import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Lock, Building2, Calendar, Layers, User } from "lucide-react";
import { getCaseTheme, FONT_VAR, type CaseTheme } from "@/lib/case-themes";
import { getDb, initPortfolioTables } from "@/lib/db";
import {
  toPortfolioCase,
  toPortfolioCategory,
  pickTranslation,
  type PortfolioCase,
  type PortfolioCategory,
  type PortfolioLocale,
} from "@/lib/portfolio-types";
import { ProjectsShell, type ProjectsShellCategory } from "@/components/projects/projects-shell";

const T: Record<PortfolioLocale, {
  back: string; allProjects: string; about: string; tasks: string; gallery: string;
  stack: string; year: string; category: string; contact: string;
  openSite: string; ndaHint: string; internalHint: string;
  all: string; uncategorized: string;
}> = {
  ru: {
    back: "На главную",
    allProjects: "Все проекты",
    about: "О проекте",
    tasks: "Что сделали",
    gallery: "Скриншоты",
    stack: "Стек",
    year: "Год",
    category: "Категория",
    contact: "Подтвердит кейс",
    openSite: "Открыть сайт",
    ndaHint: "Проект под NDA — публичная ссылка недоступна.",
    internalHint: "Внутренняя система клиента — публично не открывается.",
    all: "Все",
    uncategorized: "Без категории",
  },
  kg: {
    back: "Башкы бетке",
    allProjects: "Бардык долбоорлор",
    about: "Долбоор жөнүндө",
    tasks: "Эмне жасадык",
    gallery: "Скриншоттор",
    stack: "Стек",
    year: "Жыл",
    category: "Категория",
    contact: "Кейсти ырастайт",
    openSite: "Сайтты ачуу",
    ndaHint: "NDA астында — ачык шилтеме жок.",
    internalHint: "Ички система — ачык эмес.",
    all: "Баары",
    uncategorized: "Категориясыз",
  },
  en: {
    back: "Back to home",
    allProjects: "All projects",
    about: "About",
    tasks: "What we did",
    gallery: "Screenshots",
    stack: "Stack",
    year: "Year",
    category: "Category",
    contact: "Confirms this case",
    openSite: "Open site",
    ndaHint: "Under NDA — no public link.",
    internalHint: "Internal client system — not public.",
    all: "All",
    uncategorized: "Uncategorized",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

function buildProjectOgImage(c: PortfolioCase): string {
  const hasPublicCover = c.cover_path && !c.cover_path.startsWith("data:");
  return hasPublicCover
    ? `https://asystem.ai${c.cover_path}`
    : "/opengraph-image";
}

function toAbsoluteAsystemUrl(url: string): string {
  return url.startsWith("http") ? url : `https://asystem.ai${url}`;
}

function toSchemaDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

async function loadCase(slug: string): Promise<{ case: PortfolioCase; category: PortfolioCategory | null; updatedAt: unknown } | null> {
  try {
    await initPortfolioTables();
    const db = getDb();
    const rows = await db`
      SELECT pc.*, cat.slug AS category_slug
      FROM portfolio_cases pc
      LEFT JOIN portfolio_categories cat ON cat.id = pc.category_id
      WHERE pc.slug = ${slug}
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    const c = toPortfolioCase(row);
    let category: PortfolioCategory | null = null;
    if (c.category_id) {
      const catRows = await db`SELECT * FROM portfolio_categories WHERE id = ${c.category_id} LIMIT 1`;
      if (catRows.length > 0) category = toPortfolioCategory(catRows[0]);
    }
    return { case: c, category, updatedAt: row.updated_at };
  } catch {
    return null;
  }
}

async function loadCategoriesForShell(): Promise<{ shellCategories: ProjectsShellCategory[]; totalCount: number; uncategorizedCount: number }> {
  try {
    await initPortfolioTables();
    const db = getDb();
    const cats = (await db`SELECT * FROM portfolio_categories ORDER BY order_index ASC, id ASC`).map(toPortfolioCategory);
    const counts = await db`SELECT category_id, COUNT(*)::int AS n FROM portfolio_cases GROUP BY category_id`;
    const totals = await db`SELECT COUNT(*)::int AS n FROM portfolio_cases`;
    const countMap = new Map<number | null, number>(counts.map((r) => [r.category_id == null ? null : Number(r.category_id), Number(r.n)]));
    return {
      shellCategories: cats.map((c) => ({ slug: c.slug, name: c.translations.ru?.name ?? c.slug, count: countMap.get(c.id) ?? 0 })),
      totalCount: Number(totals[0]?.n ?? 0),
      uncategorizedCount: countMap.get(null) ?? 0,
    };
  } catch {
    return { shellCategories: [], totalCount: 0, uncategorizedCount: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: PortfolioLocale = ["ru", "kg", "en"].includes(rawLocale) ? (rawLocale as PortfolioLocale) : "ru";
  const data = await loadCase(slug);
  if (!data) return { title: "Проект · asystem.ai" };
  const t = pickTranslation(data.case.translations, locale);
  const name = t?.name ?? data.case.slug;
  const desc = t?.tagline ?? t?.description?.slice(0, 160) ?? "";

  // Используем cover как OG, только если это публичный URL (не base64).
  // Иначе падаем на корневой /opengraph-image (auto-generated через ImageResponse).
  const ogImage = buildProjectOgImage(data.case);
  const canonical = `https://asystem.ai/${locale}/projects/${slug}`;

  return {
    title: `${name} · asystem.ai`,
    description: desc,
    keywords: [name, "кейс", "портфолио", "проект", "asystem.ai"],
    openGraph: {
      title: `${name} · asystem.ai`,
      description: desc,
      url: canonical,
      type: "article",
      siteName: "asystem.ai",
      locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} · asystem.ai`,
      description: desc,
      images: [ogImage],
    },
    alternates: {
      canonical,
      languages: {
        ru: `https://asystem.ai/ru/projects/${slug}`,
        kg: `https://asystem.ai/kg/projects/${slug}`,
        en: `https://asystem.ai/en/projects/${slug}`,
        "x-default": `https://asystem.ai/ru/projects/${slug}`,
      },
    },
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale: PortfolioLocale = ["ru", "kg", "en"].includes(rawLocale) ? (rawLocale as PortfolioLocale) : "ru";
  const data = await loadCase(slug);
  if (!data) notFound();
  const { case: c, category } = data;
  const theme = getCaseTheme(slug);
  const accentInk = theme?.accentInk ?? "#2563EB";
  const { shellCategories, totalCount, uncategorizedCount } = await loadCategoriesForShell();
  const tr = pickTranslation(c.translations, locale);
  const name = tr?.name ?? c.slug;
  const tagline = tr?.tagline ?? "";
  const result = tr?.result ?? "";
  const description = tr?.description ?? "";
  const tasks = tr?.tasks ?? [];
  const labels = T[locale];
  const categoryName = category ? pickTranslation(category.translations, locale)?.name ?? category.slug : null;
  const ogImage = buildProjectOgImage(c);
  const dateModified = toSchemaDate(data.updatedAt);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description: description || tagline,
    image: toAbsoluteAsystemUrl(ogImage),
    inLanguage: locale,
    creator: { "@type": "Organization", name: "asystem.ai", url: "https://asystem.ai" },
    ...(c.kind === "linked" ? { url: c.public_url } : {}),
    ...(c.year ? { dateCreated: String(c.year) } : {}),
    ...(dateModified ? { dateModified } : {}),
  };

  return (
    <ProjectsShell
      locale={locale}
      totalCount={totalCount}
      categories={shellCategories}
      uncategorizedCount={uncategorizedCount}
      backLabel={labels.back}
      allLabel={labels.all}
      uncategorizedLabel={labels.uncategorized}
      categoryHrefBase="/projects"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* HERO — брендированный канвас проекта (см. case-themes.ts) */}
      {theme ? (
        <header
          className="relative px-6 lg:px-12 py-16 lg:py-24 overflow-hidden"
          style={{
            background: `linear-gradient(150deg, ${theme.heroFrom} 0%, ${theme.heroTo} 100%)`,
            borderBottom: `1px solid ${theme.heroBorder}`,
          }}
        >
          {theme.pattern !== "none" && (
            <div className="absolute inset-0 z-0 pointer-events-none" style={patternStyle(theme)} />
          )}

          <div className="relative z-10">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] uppercase opacity-70 hover:opacity-100 transition-opacity mb-10"
              style={{ color: theme.onHero }}
            >
              ← {labels.allProjects}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-end">
              <div>
                <StatusBadge status={c.status} />
                <h1
                  className="mt-5 leading-[0.95] tracking-tight"
                  style={{ fontFamily: FONT_VAR[theme.displayFont], color: theme.onHero, fontSize: "clamp(2.75rem, 7vw, 5.5rem)", letterSpacing: "-0.03em", fontWeight: 700 }}
                >
                  {name}
                </h1>
                {tagline && (
                  <p className="mt-5 text-[18px] lg:text-[22px] max-w-2xl leading-relaxed" style={{ color: hexToRgba(theme.onHero, 0.72) }}>
                    {tagline}
                  </p>
                )}
                {result && (
                  <div className="mt-10 inline-block">
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: hexToRgba(theme.onHero, 0.45) }}>Результат</div>
                    <div className="text-2xl lg:text-4xl font-semibold tabular-nums leading-[1.1]" style={{ color: theme.accent }}>{result}</div>
                  </div>
                )}
              </div>
              {c.logo_path && (
                <div className="flex items-center justify-center lg:justify-end">
                  <Image
                    src={c.logo_path}
                    alt={name}
                    width={220}
                    height={140}
                    className="max-w-[220px] max-h-[140px] object-contain drop-shadow-2xl"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        </header>
      ) : (
        <header
          className="relative px-6 lg:px-12 py-16 lg:py-24 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${c.bg_color} 0%, ${shadeHex(c.bg_color, -15)} 100%)`,
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] uppercase text-white/70 hover:text-white transition-colors mb-10"
          >
            ← {labels.allProjects}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-end">
            <div>
              <StatusBadge status={c.status} />
              <h1 className="mt-5 font-semibold leading-[0.95] tracking-tight text-white" style={{ fontSize: "clamp(2.75rem, 7vw, 5.5rem)", letterSpacing: "-0.03em" }}>
                {name}
              </h1>
              {tagline && (
                <p className="mt-5 text-[18px] lg:text-[22px] text-white/85 max-w-2xl leading-relaxed">
                  {tagline}
                </p>
              )}
              {result && (
                <div className="mt-10 inline-block">
                  <div className="font-mono text-[10px] text-white/55 uppercase tracking-[0.25em] mb-2">Результат</div>
                  <div className="text-2xl lg:text-4xl font-semibold text-white tabular-nums leading-[1.1]">{result}</div>
                </div>
              )}
            </div>
            {c.logo_path && (
              <div className="flex items-center justify-center lg:justify-end">
                <Image
                  src={c.logo_path}
                  alt={name}
                  width={220}
                  height={140}
                  className="max-w-[220px] max-h-[140px] object-contain drop-shadow-2xl"
                  unoptimized
                />
              </div>
            )}
          </div>
        </header>
      )}

      {/* META */}
      <div className="px-6 lg:px-12 py-5" style={{ borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          {c.year && <MetaItem icon={<Calendar className="w-3.5 h-3.5" />} label={labels.year} value={String(c.year)} />}
          {categoryName && <MetaItem icon={<Layers className="w-3.5 h-3.5" />} label={labels.category} value={categoryName} />}
          {c.stack.length > 0 && <MetaItem icon={<Layers className="w-3.5 h-3.5" />} label={labels.stack} value={c.stack.join(" · ")} />}
          {c.kind === "linked" && (
            <a
              href={c.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[#1D4ED8]"
              style={{ color: accentInk }}
            >
              {labels.openSite}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="px-6 lg:px-12 py-16 lg:py-24" style={{ borderBottom: "1px solid #e5e5e5" }}>
        <div className="max-w-3xl space-y-14">
          {description && (
            <section>
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] mb-4" style={{ color: accentInk }}>{labels.about}</div>
              <div className="text-[17px] leading-[1.75] whitespace-pre-wrap" style={{ color: "rgba(10,10,10,0.75)" }}>
                {description}
              </div>
            </section>
          )}

          {tasks.filter(Boolean).length > 0 && (
            <section>
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] mb-4" style={{ color: accentInk }}>{labels.tasks}</div>
              <ul className="space-y-3">
                {tasks.filter(Boolean).map((task, i) => (
                  <li key={i} className="flex items-start gap-3 text-[17px] leading-relaxed" style={{ color: "#0a0a0a" }}>
                    <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentInk }} />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {c.kind === "static" && (
            <section className="rounded-2xl p-6" style={{ border: "1px solid #e5e5e5", background: "#fafafa" }}>
              <p className="text-[15px]" style={{ color: "rgba(10,10,10,0.7)" }}>
                {c.status === "NDA" ? labels.ndaHint : labels.internalHint}
              </p>
              {c.contact_person && (
                <div className="mt-4 flex items-center gap-2 text-[14px]" style={{ color: "#0a0a0a" }}>
                  <User className="w-4 h-4" style={{ color: accentInk }} />
                  <strong>{labels.contact}:</strong>
                  <span>{c.contact_person}</span>
                  {c.contact_role && <span style={{ color: "#9ca3af" }}>· {c.contact_role}</span>}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* GALLERY */}
      {c.gallery.length > 0 && (
        <div className="px-6 lg:px-12 py-16 lg:py-24" style={{ borderBottom: "1px solid #e5e5e5" }}>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] mb-6" style={{ color: accentInk }}>{labels.gallery}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.gallery.map((g, i) => (
              <div key={i} className="relative aspect-video rounded-xl overflow-hidden" style={{ border: "1px solid #e5e5e5", background: "#fafafa" }}>
                <Image
                  src={g.path}
                  alt={g.alt ?? `${name} screenshot ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </ProjectsShell>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "#9ca3af" }}>{icon}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: "#9ca3af" }}>{label}</span>
      <span style={{ color: "#0a0a0a" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: PortfolioCase["status"] }) {
  const map = {
    LIVE: { bg: "bg-white/95 text-emerald-600", icon: <ArrowUpRight className="w-3 h-3" /> },
    NDA: { bg: "bg-black/40 text-white backdrop-blur-md", icon: <Lock className="w-3 h-3" /> },
    INTERNAL: { bg: "bg-black/40 text-white backdrop-blur-md", icon: <Building2 className="w-3 h-3" /> },
  };
  const conf = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] ${conf.bg}`}>
      {conf.icon}
      {status}
    </span>
  );
}

function shadeHex(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  let r = (num >> 16) + Math.round((percent / 100) * 255);
  let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255);
  let b = (num & 0xff) + Math.round((percent / 100) * 255);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Фоновый паттерн hero-канваса под архетип темы (чистый CSS).
function patternStyle(theme: CaseTheme): React.CSSProperties {
  const line = hexToRgba(theme.onHero, 0.05);
  switch (theme.pattern) {
    case "grid":
      return {
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: "44px 44px",
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(${hexToRgba(theme.onHero, 0.09)} 1.5px, transparent 1.5px)`,
        backgroundSize: "26px 26px",
      };
    case "rules":
      return {
        backgroundImage: `linear-gradient(to bottom, ${hexToRgba(theme.onHero, 0.06)} 1px, transparent 1px)`,
        backgroundSize: "100% 34px",
      };
    case "glow":
      return {
        backgroundImage: `radial-gradient(60% 60% at 15% 10%, ${hexToRgba(theme.accent, 0.18)} 0%, transparent 60%), radial-gradient(55% 55% at 90% 95%, ${hexToRgba(theme.accent, 0.14)} 0%, transparent 60%)`,
      };
    default:
      return {};
  }
}
