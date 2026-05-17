// Portfolio upload helpers.
//
// Изначально картинки сохранялись в /public/uploads/portfolio/ как файлы,
// но Coolify volume + non-root контейнер дают конфликт прав (root-owned mount,
// nextjs-uid 1001 не может писать). Поэтому пока храним base64 data URL прямо
// в БД (logo_path / cover_path / gallery[].path). Для 11 кейсов это ~3 MB total —
// терпимо. Когда вырастет — мигрировать на S3 / R2.

import type { PortfolioGalleryItem } from "./portfolio-types";

/** Возвращает значение как есть (data URL или уже сохранённый путь). */
export async function persistImage(
  value: string | null | undefined,
  _slug: string,
  _suffix: string,
): Promise<string | null> {
  if (!value) return null;
  return value;
}

/** Нормализует gallery: строки → {path}, объекты — как есть. */
export async function persistGallery(
  items: Array<string | { path?: string; alt?: string } | null> | undefined,
  _slug: string,
): Promise<Array<{ path: string; alt?: string }>> {
  if (!items?.length) return [];
  const out: PortfolioGalleryItem[] = [];
  for (const it of items) {
    if (!it) continue;
    if (typeof it === "string") {
      out.push({ path: it });
      continue;
    }
    if (it.path) out.push({ path: it.path, alt: it.alt });
  }
  return out;
}
