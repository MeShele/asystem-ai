import type { MetadataRoute } from "next";

const BASE = "https://asystem.ai";
const locales = ["ru", "en", "kg"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/client/request", "/products", "/partner"];

  return pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page === "" ? 1 : 0.8,
    }))
  );
}
