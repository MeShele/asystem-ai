export type PortfolioLocale = "ru" | "kg" | "en";
export type PortfolioStatus = "LIVE" | "NDA" | "INTERNAL";

export interface PortfolioTranslation {
  name: string;
  tagline?: string;
  result?: string;
  description?: string;
  tasks?: string[];
}

export type PortfolioTranslations = Partial<Record<PortfolioLocale, PortfolioTranslation>>;

export interface PortfolioGalleryItem {
  path: string;
  alt?: string;
}

export interface PortfolioCategory {
  id: number;
  slug: string;
  translations: Partial<Record<PortfolioLocale, { name: string }>>;
  order_index: number;
}

interface PortfolioCaseBase {
  id: number;
  slug: string;
  category_id: number | null;
  category_slug?: string | null;
  status: PortfolioStatus;
  is_featured: boolean;
  order_index: number;
  year: number | null;
  stack: string[];
  bg_color: string;
  logo_path: string | null;
  cover_path: string | null;
  gallery: PortfolioGalleryItem[];
  translations: PortfolioTranslations;
  contact_person: string | null;
  contact_role: string | null;
}

export type PortfolioCaseLinked = PortfolioCaseBase & {
  kind: "linked";
  public_url: string;
};

export type PortfolioCaseStatic = PortfolioCaseBase & {
  kind: "static";
  public_url: null;
};

export type PortfolioCase = PortfolioCaseLinked | PortfolioCaseStatic;

/** Превращает сырую строку из БД в типизированный union. */
export function toPortfolioCase(row: Record<string, unknown>): PortfolioCase {
  const publicUrl = typeof row.public_url === "string" && row.public_url.trim() ? row.public_url : null;
  const base: PortfolioCaseBase = {
    id: Number(row.id),
    slug: String(row.slug),
    category_id: row.category_id == null ? null : Number(row.category_id),
    category_slug: (row.category_slug as string | undefined) ?? null,
    status: (row.status as PortfolioStatus) ?? "NDA",
    is_featured: Boolean(row.is_featured),
    order_index: Number(row.order_index ?? 0),
    year: row.year == null ? null : Number(row.year),
    stack: Array.isArray(row.stack) ? (row.stack as string[]) : [],
    bg_color: typeof row.bg_color === "string" ? row.bg_color : "#2563EB",
    logo_path: (row.logo_path as string | null) ?? null,
    cover_path: (row.cover_path as string | null) ?? null,
    gallery: Array.isArray(row.gallery)
      ? (row.gallery as PortfolioGalleryItem[])
      : [],
    translations: (row.translations as PortfolioTranslations) ?? {},
    contact_person: (row.contact_person as string | null) ?? null,
    contact_role: (row.contact_role as string | null) ?? null,
  };
  return publicUrl
    ? { ...base, kind: "linked", public_url: publicUrl }
    : { ...base, kind: "static", public_url: null };
}

export function toPortfolioCategory(row: Record<string, unknown>): PortfolioCategory {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    translations: (row.translations as PortfolioCategory["translations"]) ?? {},
    order_index: Number(row.order_index ?? 0),
  };
}

/** Локализованное поле с фолбэком ru → en → kg → пусто. */
export function pickTranslation<T extends PortfolioTranslation | { name: string }>(
  translations: Partial<Record<PortfolioLocale, T>>,
  locale: PortfolioLocale,
): T | null {
  return translations[locale] ?? translations.ru ?? translations.en ?? translations.kg ?? null;
}
