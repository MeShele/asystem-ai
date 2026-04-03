"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  ru: "RU",
  kg: "KG",
  en: "EN",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale as "ru" | "kg" | "en" });
  }

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      {routing.locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-text-muted">|</span>}
          <button
            onClick={() => switchLocale(loc)}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              locale === loc
                ? "text-brand-400"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {labels[loc]}
          </button>
        </span>
      ))}
    </div>
  );
}
