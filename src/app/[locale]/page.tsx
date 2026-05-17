import type { Metadata } from "next";
import { WorksWall } from "@/components/landing/works-wall";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { getDb, initPortfolioTables } from "@/lib/db";
import { toPortfolioCase, pickTranslation, type PortfolioLocale } from "@/lib/portfolio-types";
import type { FeaturedFromDb } from "@/components/landing/works-wall";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "home");
}

async function loadHomePortfolio(locale: PortfolioLocale): Promise<{ featured: FeaturedFromDb[]; totalCount: number }> {
  try {
    await initPortfolioTables();
    const db = getDb();
    const rows = await db`
      SELECT pc.*, cat.translations AS category_translations
      FROM portfolio_cases pc
      LEFT JOIN portfolio_categories cat ON cat.id = pc.category_id
      WHERE pc.is_featured = TRUE
      ORDER BY pc.order_index ASC, pc.id ASC
      LIMIT 4
    `;
    const totalRow = await db`SELECT COUNT(*)::int AS n FROM portfolio_cases`;
    const featured: FeaturedFromDb[] = rows.map((r) => {
      const c = toPortfolioCase(r);
      const tr = pickTranslation(c.translations, locale);
      const catTr = r.category_translations
        ? pickTranslation(r.category_translations as Record<PortfolioLocale, { name: string }>, locale)
        : null;
      return {
        id: c.slug,
        slug: c.slug,
        name: tr?.name ?? c.slug,
        tag: (catTr?.name ?? "").toUpperCase(),
        desc: tr?.tagline ?? "",
        result: tr?.result ?? "",
        stack: c.stack.join(" · "),
        year: c.year ? String(c.year) : "",
        logoPath: c.logo_path,
        bgColor: c.bg_color,
        publicUrl: c.kind === "linked" ? c.public_url : null,
      };
    });
    return { featured, totalCount: Number(totalRow[0]?.n ?? 0) };
  } catch {
    return { featured: [], totalCount: 0 };
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: PortfolioLocale = ["ru", "kg", "en"].includes(rawLocale) ? (rawLocale as PortfolioLocale) : "ru";
  const { featured, totalCount } = await loadHomePortfolio(locale);
  return <WorksWall featured={featured} totalCount={totalCount} />;
}
