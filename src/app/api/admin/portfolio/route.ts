import { NextRequest, NextResponse } from "next/server";
import { getDb, initPortfolioTables } from "@/lib/db";
import { persistImage, persistGallery } from "@/lib/portfolio-upload";
import type { PortfolioStatus, PortfolioTranslations, PortfolioGalleryItem } from "@/lib/portfolio-types";

const VALID_STATUSES: PortfolioStatus[] = ["LIVE", "NDA", "INTERNAL"];

function slugify(input: string): string {
  const trMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return input
    .toLowerCase()
    .split("")
    .map((ch) => trMap[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "case";
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPortfolioTables();
  const db = getDb();
  const rows = await db`
    SELECT pc.*, cat.slug AS category_slug
    FROM portfolio_cases pc
    LEFT JOIN portfolio_categories cat ON cat.id = pc.category_id
    ORDER BY pc.order_index ASC, pc.id ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPortfolioTables();
  const db = getDb();
  const data = await req.json();

  const translations = (data.translations ?? {}) as PortfolioTranslations;
  const ruName = translations.ru?.name?.trim();
  if (!ruName) return NextResponse.json({ error: "translations.ru.name required" }, { status: 400 });

  let slug = (data.slug ? String(data.slug) : slugify(ruName)).trim();
  if (!slug) slug = slugify(ruName);

  // ensure unique
  const exists = await db`SELECT id FROM portfolio_cases WHERE slug = ${slug} LIMIT 1`;
  if (exists.length > 0) slug = `${slug}-${String(Date.now()).slice(-4)}`;

  const status: PortfolioStatus = VALID_STATUSES.includes(data.status) ? data.status : "NDA";
  const publicUrl = status === "LIVE" && typeof data.public_url === "string" && data.public_url.trim()
    ? data.public_url.trim()
    : null;

  // Featured cap: максимум 4 на главной
  let isFeatured = Boolean(data.is_featured);
  if (isFeatured) {
    const featuredCount = await db`SELECT COUNT(*)::int AS n FROM portfolio_cases WHERE is_featured = TRUE`;
    if (Number(featuredCount[0].n) >= 4) isFeatured = false;
  }

  const logoPath = await persistImage(data.logo_path ?? null, slug, "logo");
  const coverPath = await persistImage(data.cover_path ?? null, slug, "cover");
  const gallery = await persistGallery(data.gallery as PortfolioGalleryItem[] | string[] | undefined, slug);

  const orderRow = await db`SELECT COALESCE(MAX(order_index), 0) + 1 AS next FROM portfolio_cases`;
  const orderIndex = Number(data.order_index ?? orderRow[0].next);

  const stack = Array.isArray(data.stack) ? (data.stack as unknown[]).map(String) : [];
  const categoryId = data.category_id ? Number(data.category_id) : null;
  const year = data.year ? Number(data.year) : null;
  const bgColor = typeof data.bg_color === "string" && /^#[0-9a-f]{6}$/i.test(data.bg_color) ? data.bg_color : "#2563EB";

  const inserted = await db`
    INSERT INTO portfolio_cases
      (slug, category_id, status, public_url, is_featured, order_index, year, stack, bg_color,
       logo_path, cover_path, gallery, translations, contact_person, contact_role)
    VALUES
      (${slug}, ${categoryId}, ${status}, ${publicUrl}, ${isFeatured}, ${orderIndex}, ${year}, ${stack}, ${bgColor},
       ${logoPath}, ${coverPath}, ${JSON.stringify(gallery)}::jsonb, ${JSON.stringify(translations)}::jsonb,
       ${data.contact_person ?? null}, ${data.contact_role ?? null})
    RETURNING *
  `;
  return NextResponse.json(inserted[0]);
}
