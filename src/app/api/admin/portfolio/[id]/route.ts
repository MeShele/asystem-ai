import { NextRequest, NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { getDb, initPortfolioTables } from "@/lib/db";
import { persistImage, persistGallery } from "@/lib/portfolio-upload";
import type { PortfolioStatus, PortfolioGalleryItem } from "@/lib/portfolio-types";

const VALID_STATUSES: PortfolioStatus[] = ["LIVE", "NDA", "INTERNAL"];

function authed(req: NextRequest) {
  return Boolean(req.cookies.get("admin_session")?.value);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPortfolioTables();
  const db = getDb();
  const { id } = await params;
  const rows = await db`
    SELECT pc.*, cat.slug AS category_slug
    FROM portfolio_cases pc
    LEFT JOIN portfolio_categories cat ON cat.id = pc.category_id
    WHERE pc.id = ${Number(id)}
    LIMIT 1
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPortfolioTables();
  const db = getDb();
  const { id } = await params;
  const caseId = Number(id);

  const existing = await db`SELECT * FROM portfolio_cases WHERE id = ${caseId} LIMIT 1`;
  if (existing.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const cur = existing[0];

  const data = await req.json();
  const slug = data.slug ? String(data.slug).trim() : String(cur.slug);

  const status: PortfolioStatus = VALID_STATUSES.includes(data.status) ? data.status : (cur.status as PortfolioStatus);
  const publicUrl = status === "LIVE" && typeof data.public_url === "string" && data.public_url.trim()
    ? data.public_url.trim()
    : null;

  // Featured cap: при включении проверяем что не больше 4
  const isFeatured = data.is_featured !== undefined ? Boolean(data.is_featured) : Boolean(cur.is_featured);
  if (isFeatured && !cur.is_featured) {
    const featuredCount = await db`SELECT COUNT(*)::int AS n FROM portfolio_cases WHERE is_featured = TRUE AND id != ${caseId}`;
    if (Number(featuredCount[0].n) >= 4) {
      return NextResponse.json({ error: "Максимум 4 проекта могут быть на главной" }, { status: 400 });
    }
  }

  const logoPath = data.logo_path !== undefined
    ? await persistImage(data.logo_path, slug, "logo")
    : (cur.logo_path as string | null);
  const coverPath = data.cover_path !== undefined
    ? await persistImage(data.cover_path, slug, "cover")
    : (cur.cover_path as string | null);
  const gallery = data.gallery !== undefined
    ? await persistGallery(data.gallery as PortfolioGalleryItem[] | string[], slug)
    : (cur.gallery as PortfolioGalleryItem[]);

  const translations = data.translations ?? cur.translations;
  const stack = data.stack !== undefined ? (Array.isArray(data.stack) ? (data.stack as unknown[]).map(String) : []) : (cur.stack as string[]);
  const categoryId = data.category_id !== undefined ? (data.category_id ? Number(data.category_id) : null) : (cur.category_id as number | null);
  const year = data.year !== undefined ? (data.year ? Number(data.year) : null) : (cur.year as number | null);
  const bgColor = data.bg_color !== undefined && typeof data.bg_color === "string" && /^#[0-9a-f]{6}$/i.test(data.bg_color)
    ? data.bg_color
    : String(cur.bg_color ?? "#2563EB");
  const orderIndex = data.order_index !== undefined ? Number(data.order_index) : Number(cur.order_index ?? 0);
  const contactPerson = data.contact_person !== undefined ? (data.contact_person || null) : (cur.contact_person as string | null);
  const contactRole = data.contact_role !== undefined ? (data.contact_role || null) : (cur.contact_role as string | null);

  const updated = await db`
    UPDATE portfolio_cases SET
      slug = ${slug},
      category_id = ${categoryId},
      status = ${status},
      public_url = ${publicUrl},
      is_featured = ${isFeatured},
      order_index = ${orderIndex},
      year = ${year},
      stack = ${stack},
      bg_color = ${bgColor},
      logo_path = ${logoPath},
      cover_path = ${coverPath},
      gallery = ${JSON.stringify(gallery)}::jsonb,
      translations = ${JSON.stringify(translations)}::jsonb,
      contact_person = ${contactPerson},
      contact_role = ${contactRole},
      updated_at = NOW()
    WHERE id = ${caseId}
    RETURNING *
  `;
  return NextResponse.json(updated[0]);
}

async function tryUnlinkPublic(maybePath: unknown) {
  if (typeof maybePath !== "string") return;
  if (!maybePath.startsWith("/uploads/portfolio/")) return;
  const abs = path.join(process.cwd(), "public", maybePath.replace(/^\//, ""));
  await unlink(abs).catch(() => {});
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPortfolioTables();
  const db = getDb();
  const { id } = await params;
  const caseId = Number(id);

  const rows = await db`SELECT logo_path, cover_path, gallery FROM portfolio_cases WHERE id = ${caseId} LIMIT 1`;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db`DELETE FROM portfolio_cases WHERE id = ${caseId}`;

  // cleanup files (best-effort)
  await tryUnlinkPublic(rows[0].logo_path);
  await tryUnlinkPublic(rows[0].cover_path);
  const gal = (rows[0].gallery as PortfolioGalleryItem[]) ?? [];
  for (const g of gal) await tryUnlinkPublic(g.path);

  return NextResponse.json({ ok: true });
}
