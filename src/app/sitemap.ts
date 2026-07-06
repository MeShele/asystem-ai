import type { MetadataRoute } from "next";
import { getDb, initPortfolioTables } from "@/lib/db";

const BASE = "https://asystem.ai";
const LOCALES = ["ru", "kg", "en"] as const;
const DEFAULT_LOCALE = "ru";

type Page = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const PAGES: Page[] = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/startups", changeFrequency: "weekly", priority: 0.9 },
  { path: "/partner", changeFrequency: "weekly", priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/products", changeFrequency: "monthly", priority: 0.6 },
  { path: "/client/request", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

async function fetchProjectSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    await initPortfolioTables();
    const db = getDb();
    const rows = await db`
      SELECT slug, updated_at
      FROM portfolio_cases
      ORDER BY order_index ASC, id ASC
    `;
    return rows.map((r) => ({
      slug: String(r.slug),
      updatedAt: r.updated_at
        ? new Date(r.updated_at as string | Date).toISOString().slice(0, 10)
        : "2026-05-18",
    }));
  } catch {
    return [];
  }
}

function buildEntries(path: string, lastModified: Date | string, changeFrequency: Page["changeFrequency"], priority: number): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, `${BASE}/${l}${path}`]),
  );
  languages["x-default"] = `${BASE}/${DEFAULT_LOCALE}${path}`;

  return LOCALES.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = PAGES.flatMap((page) =>
    buildEntries(page.path, now, page.changeFrequency, page.priority),
  );

  const projectSlugs = await fetchProjectSlugs();
  const projectEntries = projectSlugs.flatMap((p) =>
    buildEntries(`/projects/${p.slug}`, p.updatedAt, "monthly", 0.7),
  );

  return [...staticEntries, ...projectEntries];
}
