import { NextRequest, NextResponse } from "next/server";
import { getDb, initPortfolioTables } from "@/lib/db";

function slugify(input: string): string {
  const trMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return input.toLowerCase().split("").map((ch) => trMap[ch] ?? ch).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "cat";
}

export async function GET(req: NextRequest) {
  if (!req.cookies.get("admin_session")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await initPortfolioTables();
  const db = getDb();
  const rows = await db`SELECT * FROM portfolio_categories ORDER BY order_index ASC, id ASC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!req.cookies.get("admin_session")?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await initPortfolioTables();
  const db = getDb();
  const data = await req.json();

  const translations = data.translations ?? {};
  const ruName = translations.ru?.name?.trim();
  if (!ruName) return NextResponse.json({ error: "translations.ru.name required" }, { status: 400 });

  let slug = data.slug ? String(data.slug).trim() : slugify(ruName);
  const exists = await db`SELECT id FROM portfolio_categories WHERE slug = ${slug} LIMIT 1`;
  if (exists.length > 0) slug = `${slug}-${String(Date.now()).slice(-4)}`;

  const orderRow = await db`SELECT COALESCE(MAX(order_index), 0) + 1 AS next FROM portfolio_categories`;
  const orderIndex = Number(data.order_index ?? orderRow[0].next);

  const inserted = await db`
    INSERT INTO portfolio_categories (slug, translations, order_index)
    VALUES (${slug}, ${JSON.stringify(translations)}::jsonb, ${orderIndex})
    RETURNING *
  `;
  return NextResponse.json(inserted[0]);
}
