import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "portfolio");
const PUBLIC_PREFIX = "/uploads/portfolio";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

/**
 * Если value — data URL (`data:image/...;base64,...`), пишет файл и возвращает публичный путь.
 * Если value — уже путь `/uploads/...` или null/undefined — возвращает как есть.
 */
export async function persistImage(
  value: string | null | undefined,
  slug: string,
  suffix: string,
): Promise<string | null> {
  if (!value) return null;
  if (!value.startsWith("data:")) return value;

  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(value);
  if (!match) return null;

  const mime = match[1].toLowerCase();
  const b64 = match[2];
  const ext = MIME_TO_EXT[mime] ?? "bin";
  const safeSlug = slug.replace(/[^a-z0-9_-]/gi, "-").toLowerCase() || "case";
  const hash = crypto.createHash("sha1").update(b64).digest("hex").slice(0, 8);
  const filename = `${safeSlug}-${suffix}-${hash}.${ext}`;

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, filename), Buffer.from(b64, "base64"));

  return `${PUBLIC_PREFIX}/${filename}`;
}

/** Массив data URL → массив путей; элементы которые уже пути, сохраняются. */
export async function persistGallery(
  items: Array<string | { path?: string; alt?: string } | null> | undefined,
  slug: string,
): Promise<Array<{ path: string; alt?: string }>> {
  if (!items?.length) return [];
  const out: Array<{ path: string; alt?: string }> = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it) continue;
    if (typeof it === "string") {
      const p = await persistImage(it, slug, `gal${i}`);
      if (p) out.push({ path: p });
      continue;
    }
    const p = await persistImage(it.path ?? null, slug, `gal${i}`);
    if (p) out.push({ path: p, alt: it.alt });
  }
  return out;
}
