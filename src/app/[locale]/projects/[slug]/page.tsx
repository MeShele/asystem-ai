import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowUpRight, Lock, Building2, Calendar, Layers, User } from "lucide-react";
import { getDb, initPortfolioTables } from "@/lib/db";
import {
  toPortfolioCase,
  toPortfolioCategory,
  pickTranslation,
  type PortfolioCase,
  type PortfolioCategory,
  type PortfolioLocale,
} from "@/lib/portfolio-types";

const T: Record<PortfolioLocale, {
  back: string; about: string; tasks: string; gallery: string;
  stack: string; year: string; category: string; contact: string;
  openSite: string; ndaHint: string; internalHint: string;
}> = {
  ru: {
    back: "Все проекты",
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
  },
  kg: {
    back: "Бардык долбоорлор",
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
  },
  en: {
    back: "All projects",
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
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function loadCase(slug: string): Promise<{ case: PortfolioCase; category: PortfolioCategory | null } | null> {
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
    const c = toPortfolioCase(rows[0]);
    let category: PortfolioCategory | null = null;
    if (c.category_id) {
      const catRows = await db`SELECT * FROM portfolio_categories WHERE id = ${c.category_id} LIMIT 1`;
      if (catRows.length > 0) category = toPortfolioCategory(catRows[0]);
    }
    return { case: c, category };
  } catch {
    return null;
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
  return {
    title: `${name} · asystem.ai`,
    description: desc,
    openGraph: {
      title: `${name} · asystem.ai`,
      description: desc,
      url: `https://asystem.ai/${locale}/projects/${slug}`,
      type: "article",
      images: data.case.cover_path ? [{ url: `https://asystem.ai${data.case.cover_path}` }] : [],
    },
    alternates: {
      canonical: `https://asystem.ai/${locale}/projects/${slug}`,
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
  const tr = pickTranslation(c.translations, locale);
  const name = tr?.name ?? c.slug;
  const tagline = tr?.tagline ?? "";
  const result = tr?.result ?? "";
  const description = tr?.description ?? "";
  const tasks = tr?.tasks ?? [];
  const labels = T[locale];
  const categoryName = category ? pickTranslation(category.translations, locale)?.name ?? category.slug : null;

  // JSON-LD CreativeWork
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    description: description || tagline,
    inLanguage: locale,
    creator: {
      "@type": "Organization",
      name: "asystem.ai",
      url: "https://asystem.ai",
    },
    ...(c.kind === "linked" ? { url: c.public_url } : {}),
    ...(c.year ? { dateCreated: String(c.year) } : {}),
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <header
        className="relative px-6 lg:px-12 py-12 lg:py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${c.bg_color} 0%, ${shadeHex(c.bg_color, -15)} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> {labels.back}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <StatusBadge status={c.status} />
              <h1 className="mt-4 text-[clamp(40px,6vw,76px)] font-semibold leading-[1.02] tracking-tight text-white">
                {name}
              </h1>
              {tagline && (
                <p className="mt-4 text-[17px] lg:text-[20px] text-white/85 max-w-2xl leading-relaxed">
                  {tagline}
                </p>
              )}
              {result && (
                <div className="mt-8 inline-block">
                  <div className="font-mono text-[10px] text-white/60 uppercase tracking-wider mb-1">Результат</div>
                  <div className="text-2xl lg:text-3xl font-semibold text-white tabular-nums">{result}</div>
                </div>
              )}
            </div>
            {c.logo_path && (
              <div className="flex items-center justify-center lg:justify-end">
                <Image
                  src={c.logo_path}
                  alt={name}
                  width={200}
                  height={120}
                  className="max-w-[200px] max-h-[120px] object-contain drop-shadow-2xl"
                  unoptimized={c.logo_path.startsWith("data:")}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* META BAR */}
      <div className="px-6 lg:px-12 py-5 border-y border-border-faint bg-[#fafafa]">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          {c.year && (
            <MetaItem icon={<Calendar className="w-3.5 h-3.5" />} label={labels.year} value={String(c.year)} />
          )}
          {categoryName && (
            <MetaItem icon={<Layers className="w-3.5 h-3.5" />} label={labels.category} value={categoryName} />
          )}
          {c.stack.length > 0 && (
            <MetaItem icon={<Layers className="w-3.5 h-3.5" />} label={labels.stack} value={c.stack.join(" · ")} />
          )}
          {c.kind === "linked" && (
            <a
              href={c.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 text-brand-500 hover:text-brand-400 font-medium transition-colors"
            >
              {labels.openSite}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* BODY */}
      <main className="px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* About */}
          {description && (
            <section>
              <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-muted mb-4">{labels.about}</h2>
              <div className="prose prose-lg text-[16px] leading-[1.75] text-text-secondary whitespace-pre-wrap">
                {description}
              </div>
            </section>
          )}

          {/* Tasks */}
          {tasks.filter(Boolean).length > 0 && (
            <section>
              <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-muted mb-4">{labels.tasks}</h2>
              <ul className="space-y-3">
                {tasks.filter(Boolean).map((task, i) => (
                  <li key={i} className="flex items-start gap-3 text-[16px] text-text-primary leading-relaxed">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Status hint */}
          {c.kind === "static" && (
            <section className="rounded-2xl border border-border-faint bg-[#fafafa] p-5 text-sm text-text-secondary">
              {c.status === "NDA" ? labels.ndaHint : labels.internalHint}
              {c.contact_person && (
                <div className="mt-3 flex items-center gap-2 text-text-primary">
                  <User className="w-4 h-4 text-brand-500" />
                  <strong>{labels.contact}:</strong>
                  <span>{c.contact_person}</span>
                  {c.contact_role && <span className="text-text-muted">· {c.contact_role}</span>}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Gallery */}
        {c.gallery.length > 0 && (
          <section className="max-w-6xl mx-auto mt-16">
            <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-text-muted mb-6">{labels.gallery}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {c.gallery.map((g, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border-faint bg-bg-secondary">
                  <Image
                    src={g.path}
                    alt={g.alt ?? `${name} screenshot ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized={g.path.startsWith("data:")}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted">{icon}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">{label}</span>
      <span className="text-text-primary">{value}</span>
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${conf.bg}`}>
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
