"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="relative">
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
        <div className="h-px bg-border-faint" />

        <div className="py-12 lg:py-16 px-4 lg:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <svg viewBox="0 0 48 48" fill="none" className="w-5 h-5 text-brand-500" aria-hidden="true">
                  <circle cx="24" cy="12" r="5" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="12" cy="36" r="5" stroke="currentColor" strokeWidth="2.5" />
                  <circle cx="36" cy="36" r="5" stroke="currentColor" strokeWidth="2.5" />
                  <line x1="24" y1="17" x2="14" y2="32" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                  <line x1="24" y1="17" x2="34" y2="32" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                  <line x1="17" y1="36" x2="31" y2="36" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                  <circle cx="24" cy="12" r="2.5" fill="currentColor" />
                  <circle cx="12" cy="36" r="2.5" fill="currentColor" />
                  <circle cx="36" cy="36" r="2.5" fill="currentColor" />
                </svg>
                <span className="text-text-primary text-sm font-semibold">
                  asystem<span className="text-brand-500">.</span>ai
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Enterprise IT, AI & Blockchain.<br />Bishkek, Kyrgyzstan.
              </p>
            </div>

            {/* Services */}
            <div>
              <div className="text-xs text-text-muted font-medium tracking-wider uppercase mb-4">{nav("services").toUpperCase()}</div>
              <ul className="space-y-2.5">
                <li><a href="/#services" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Fintech</a></li>
                <li><a href="/#services" className="text-sm text-text-secondary hover:text-text-primary transition-colors">AI</a></li>
                <li><a href="/#services" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Blockchain</a></li>
                <li><a href="/#services" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Enterprise</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-xs text-text-muted font-medium tracking-wider uppercase mb-4">{t("company")}</div>
              <ul className="space-y-2.5">
                <li><a href="/#cases" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{nav("cases")}</a></li>
                <li><Link href="/products" className="text-sm text-text-secondary hover:text-text-primary transition-colors">{t("products")}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div className="text-xs text-text-muted font-medium tracking-wider uppercase mb-4">{t("contact")}</div>
              <ul className="space-y-2.5">
                <li><a href="mailto:hello@asystem.ai" className="text-sm text-text-secondary hover:text-text-primary transition-colors">hello@asystem.ai</a></li>
                <li><a href="https://t.me/asystem_ai" target="_blank" rel="noopener noreferrer" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Telegram</a></li>
                <li><Link href="/client/request" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">{nav("request")} →</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border-faint pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-text-muted">© {new Date().getFullYear()} asystem.ai — {t("rights")}</span>
            <div className="flex gap-4 text-xs text-text-muted">
              <Link href="/privacy" className="hover:text-text-secondary transition-colors">{t("privacy")}</Link>
              <Link href="/terms" className="hover:text-text-secondary transition-colors">{t("terms")}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
