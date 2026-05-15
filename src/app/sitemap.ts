import type { MetadataRoute } from "next";

const BASE = "https://asystem.ai";
const LOCALES = ["ru", "kg", "en"] as const;
const DEFAULT_LOCALE = "ru";

type Page = {
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const PAGES: Page[] = [
  { path: "", lastModified: "2026-05-15", changeFrequency: "weekly", priority: 1.0 },
  { path: "/startups", lastModified: "2026-05-15", changeFrequency: "weekly", priority: 0.9 },
  { path: "/partner", lastModified: "2026-05-15", changeFrequency: "weekly", priority: 0.9 },
  { path: "/products", lastModified: "2026-05-15", changeFrequency: "monthly", priority: 0.6 },
  { path: "/client/request", lastModified: "2026-05-15", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", lastModified: "2026-01-01", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", lastModified: "2026-01-01", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) => {
    const languages: Record<string, string> = Object.fromEntries(
      LOCALES.map((l) => [l, `${BASE}/${l}${page.path}`]),
    );
    languages["x-default"] = `${BASE}/${DEFAULT_LOCALE}${page.path}`;

    return LOCALES.map((locale) => ({
      url: `${BASE}/${locale}${page.path}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    }));
  });
}
