"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";

/* ═══════════════════════════════════════════════════════════
   Минималистичный Navbar для не-home страниц.
   Home использует WorksWall с собственным sidebar.
   ═══════════════════════════════════════════════════════════ */

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/#clients", label: "Работы" },
    { href: "/partner", label: "Партнёрам" },
    { href: "/client/request", label: "Заявка" },
  ];

  return (
    <header
      className="sticky top-0 left-0 w-full z-[101] transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.95)" : "#fff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #e5e5e5" : "1px solid transparent",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-baseline gap-1 group"
            aria-label="asystem.ai"
          >
            <span className="text-[18px] font-semibold tracking-tight">asystem</span>
            <span className="text-[18px] font-semibold" style={{ color: "#2563EB" }}>.</span>
            <span className="text-[18px] font-semibold tracking-tight">ai</span>
            <span
              className="ml-2 font-mono text-[10px]"
              style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
            >
              [r2026]
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-[13px] transition-colors duration-200"
                style={{
                  color: "#0a0a0a",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563EB")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0a0a0a")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right — language + contact */}
          <div className="flex items-center gap-6">
            <div
              className="hidden md:flex font-mono text-[12px] items-center gap-2"
              style={{ color: "#78716c", letterSpacing: "0.1em" }}
            >
              <span style={{ color: "#0a0a0a" }}>RU</span>
              <span style={{ color: "#d4d4d4" }}>·</span>
              <span className="opacity-40">KG</span>
              <span style={{ color: "#d4d4d4" }}>·</span>
              <span className="opacity-40">EN</span>
            </div>

            <a
              href="mailto:asystem.teamwork@gmail.com"
              className="hidden md:inline-flex font-mono text-[13px] transition-colors"
              style={{
                color: "#0a0a0a",
                borderBottom: "1px dotted #78716c",
                paddingBottom: "2px",
                letterSpacing: "0.05em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#2563EB";
                (e.currentTarget as HTMLElement).style.borderBottomColor = "#2563EB";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#0a0a0a";
                (e.currentTarget as HTMLElement).style.borderBottomColor = "#78716c";
              }}
            >
              asystem.teamwork@gmail.com
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center"
              aria-expanded={mobileOpen}
              aria-label="Меню"
            >
              <span
                className="block rounded-full transition-all"
                style={{
                  width: mobileOpen ? "16px" : "8px",
                  height: "8px",
                  background: "#2563EB",
                }}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden pb-6 pt-2"
            style={{ borderTop: "1px solid #e5e5e5" }}
          >
            <nav className="flex flex-col gap-4 pt-4">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-[14px]"
                  style={{ color: "#0a0a0a", letterSpacing: "0.05em" }}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="mailto:asystem.teamwork@gmail.com"
                className="font-mono text-[13px] mt-2"
                style={{ color: "#2563EB", letterSpacing: "0.05em" }}
              >
                asystem.teamwork@gmail.com →
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
