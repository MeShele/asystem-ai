"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/#services", label: t("services") },
    { href: "/#cases", label: t("cases") },
  ];

  return (
    <header className={`sticky top-0 left-0 w-full z-[101] transition-all duration-300 ${
      scrolled
        ? "bg-bg-primary/80 backdrop-blur-md border-b border-border-faint shadow-sm"
        : "bg-bg-primary"
    }`}>
      <div className={`absolute bottom-0 left-0 right-0 h-px transition-opacity duration-300 bg-border-faint ${scrolled ? "opacity-0" : "opacity-100"}`} />

      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />

        <div className="flex justify-between items-center py-4 lg:py-5 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex gap-6 items-center">
            <Link href="/" className="flex items-center gap-2 relative" aria-label="asystem.ai — home">
              <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6 text-brand-500" aria-hidden="true">
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
              <span className="text-text-primary font-semibold text-sm tracking-tight">
                asystem<span className="text-brand-500">.</span>ai
              </span>
            </Link>

            <span className="text-border-muted text-xs select-none hidden lg:block">·</span>

            {/* Desktop nav */}
            <div className="hidden lg:flex gap-1">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="relative flex min-h-11 items-center group rounded-lg px-3 active:scale-[0.98] transition-all duration-[50ms]"
                >
                  <div className="overlay pointer-events-none rounded-lg transition-all scale-95 group-hover:scale-100 group-hover:bg-overlay-muted group-active:bg-overlay-strong" />
                  <span className="text-sm font-medium text-text-primary relative">{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className="flex gap-1.5 items-center">
            <ThemeToggle />
            <span className="hidden sm:block"><LanguageSwitcher /></span>

            <Link
              href="/client/request"
              className="text-sm h-10 px-4 fc-button-primary !hidden lg:!inline-flex"
            >
              <span>{t("request")}</span>
            </Link>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex flex-col gap-1 p-2 -mr-2"
              aria-expanded={mobileOpen}
              aria-label="Меню навигации"
            >
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-200 ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
              <span className={`block w-5 h-0.5 bg-text-primary transition-all duration-200 ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border-faint px-4 pb-4">
            <nav className="flex flex-col gap-1 pt-3">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-text-primary py-2.5 px-3 rounded-lg hover:bg-overlay-muted transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-faint">
                <span className="sm:hidden"><LanguageSwitcher /></span>
                <Link
                  href="/client/request"
                  onClick={() => setMobileOpen(false)}
                  className="fc-button-primary text-sm h-10 px-4"
                >
                  <span>{t("request")}</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
