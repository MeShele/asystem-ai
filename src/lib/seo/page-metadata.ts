import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const LOCALES = ["ru", "kg", "en"] as const;
const BASE_URL = "https://asystem.ai";

type PageKey = "home" | "startups" | "partner" | "products" | "privacy" | "terms";

const PAGE_PATHS: Record<PageKey, string> = {
  home: "",
  startups: "/startups",
  partner: "/partner",
  products: "/products",
  privacy: "/privacy",
  terms: "/terms",
};

export async function buildPageMetadata(
  locale: string,
  pageKey: PageKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `meta.${pageKey}` });
  const path = PAGE_PATHS[pageKey];

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}${path}`,
      languages: {
        ...Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`]),
        ),
        "x-default": `${BASE_URL}/ru${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}${path}`,
      siteName: "asystem.ai",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
