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

// B2B-релевантные keywords для СНГ-таргета. Не транслируются — содержат бренды и термины.
const PAGE_KEYWORDS: Record<PageKey, string[]> = {
  home: [
    "AI-разработка", "AI-first студия", "веб-разработка СНГ",
    "Next.js разработка", "AI-агенты для бизнеса", "Telegram-боты",
    "интеграции CRM", "автоматизация бизнес-процессов",
    "разработка SaaS", "AI-консалтинг", "Бишкек", "Кыргызстан",
    "разработка под ключ", "fix-price разработка",
  ],
  startups: [
    "MVP за 4 недели", "AI для стартапов", "запуск стартапа без CTO",
    "MVP без команды", "стартап СНГ", "B2B SaaS MVP",
    "AI-замена команды разработчиков", "технический партнёр стартапа",
    "no-code MVP", "AI-разработка для фаундеров",
  ],
  partner: [
    "партнёрская программа IT", "реферальная программа разработка",
    "заработок на IT-проектах", "комиссия за клиентов IT",
    "партнёрка для маркетологов", "IT-партнёрство", "белая партнёрка",
    "passive income IT", "agency reseller", "white-label разработка",
  ],
  products: [
    "SaaS-продукты asystem", "AI-ассистент для бизнеса",
    "автосинхронизация данных", "KPI-дашборды", "ранний доступ SaaS",
  ],
  privacy: ["политика конфиденциальности", "GDPR", "обработка данных asystem.ai"],
  terms: ["пользовательское соглашение", "условия использования asystem.ai"],
};

export async function buildPageMetadata(
  locale: string,
  pageKey: PageKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `meta.${pageKey}` });
  const path = PAGE_PATHS[pageKey];

  const title = t("title");
  const description = t("description");
  const canonical = `${BASE_URL}/${locale}${path}`;

  return {
    title,
    description,
    keywords: PAGE_KEYWORDS[pageKey],
    alternates: {
      canonical,
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
      url: canonical,
      siteName: "asystem.ai",
      locale,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "asystem.ai — Независимая AI-first IT-студия",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
