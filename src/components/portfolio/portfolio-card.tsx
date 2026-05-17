"use client";

import Image from "next/image";
import { ArrowUpRight, Lock, Building2 } from "lucide-react";
import type { PortfolioCase, PortfolioLocale } from "@/lib/portfolio-types";
import { pickTranslation } from "@/lib/portfolio-types";

interface Props {
  case: PortfolioCase;
  locale?: PortfolioLocale;
  variant?: "wide" | "compact";
  contactLabel?: string;
}

const STATUS_LABEL: Record<PortfolioCase["status"], string> = {
  LIVE: "LIVE",
  NDA: "NDA",
  INTERNAL: "INTERNAL",
};

const STATUS_HINT: Record<PortfolioCase["status"], { ru: string; kg: string; en: string }> = {
  LIVE: { ru: "Открыть сайт", kg: "Сайтты ачуу", en: "Open site" },
  NDA: {
    ru: "Закрытый контур · доступ по запросу",
    kg: "Жабык контур · сурам боюнча",
    en: "Closed perimeter · access on request",
  },
  INTERNAL: {
    ru: "Внутренняя система · недоступна публично",
    kg: "Ички система · ачык эмес",
    en: "Internal system · not public",
  },
};

/**
 * Карточка кейса портфолио. Сам компонент всегда рендерит <div> —
 * внешнюю обёртку (Link на детальную страницу) накручивает родитель.
 * Внутри для LIVE-кейсов есть inline-ссылка «Открыть сайт» с stopPropagation,
 * чтобы клик по ней не триггерил навигацию родительского Link.
 */
export function PortfolioCard({ case: c, locale = "ru", variant = "wide", contactLabel }: Props) {
  const t = pickTranslation(c.translations, locale);
  const name = t?.name ?? c.slug;
  const tagline = t?.tagline ?? "";
  const result = t?.result ?? "";
  const statusHint = STATUS_HINT[c.status][locale] ?? STATUS_HINT[c.status].ru;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border-faint bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-500/40 ${
        variant === "wide" ? "grid grid-cols-1 lg:grid-cols-[1fr_1fr] min-h-[420px]" : "flex flex-col h-full min-h-[320px]"
      }`}
    >
      {/* Brand bg + logo */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${c.bg_color} 0%, ${shade(c.bg_color, -12)} 100%)`,
          minHeight: variant === "wide" ? 420 : 200,
        }}
      >
        {c.logo_path ? (
          <Image
            src={c.logo_path}
            alt={name}
            width={240}
            height={120}
            className="max-w-[60%] max-h-[55%] object-contain drop-shadow-2xl"
            unoptimized={c.logo_path.startsWith("data:")}
          />
        ) : (
          <span className="text-white/80 text-3xl font-bold tracking-tight">{name.slice(0, 12)}</span>
        )}

        <span
          className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-md ${
            c.status === "LIVE"
              ? "bg-white/95 text-emerald-600"
              : "bg-black/45 text-white"
          }`}
        >
          {c.status === "LIVE" ? <ArrowUpRight className="w-3 h-3" /> : c.status === "NDA" ? <Lock className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
          {STATUS_LABEL[c.status]}
        </span>

        {c.year && (
          <span className="absolute bottom-4 left-4 font-mono text-[10px] text-white/80 tracking-wider">
            {c.year}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="p-6 lg:p-8 flex flex-col">
        <div className="flex-1">
          <h3 className="text-xl lg:text-2xl font-semibold text-ink mb-2">{name}</h3>
          {tagline && (
            <p className="text-sm text-text-secondary leading-relaxed mb-4">{tagline}</p>
          )}

          {result && (
            <div className="mt-4 mb-5">
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-1">Результат</div>
              <p className="text-lg lg:text-xl font-semibold text-ink leading-tight tabular-nums">
                {result}
              </p>
            </div>
          )}

          {c.stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {c.stack.slice(0, 6).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 text-[11px] font-mono text-text-secondary border border-border-faint rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border-faint flex items-center justify-between gap-3 text-xs">
          {c.kind === "linked" ? (
            <a
              href={c.public_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-brand-500 font-medium hover:gap-2 transition-all"
            >
              {statusHint}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-text-muted">{statusHint}</span>
          )}

          {c.contact_person && (
            <span className="text-text-muted text-right">
              {contactLabel ? `${contactLabel}: ` : ""}
              <span className="text-text-secondary">{c.contact_person}</span>
              {c.contact_role && <span className="text-text-muted">, {c.contact_role}</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function shade(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  let r = (num >> 16) + Math.round((percent / 100) * 255);
  let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255);
  let b = (num & 0xff) + Math.round((percent / 100) * 255);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}
