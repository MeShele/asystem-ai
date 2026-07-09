"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

export function Footer() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Bishkek",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer
      className="relative"
      style={{
        background: "#fafafa",
        color: "#0a0a0a",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-20 lg:pt-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand + meta */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-baseline gap-1 group">
              <span className="text-[32px] font-semibold tracking-tight">asystem</span>
              <span className="text-[32px] font-semibold" style={{ color: "#2563EB" }}>.</span>
              <span className="text-[32px] font-semibold tracking-tight">ai</span>
            </Link>
            <p
              className="mt-5 max-w-sm"
              style={{
                fontSize: "14px",
                lineHeight: 1.55,
                color: "rgba(10,10,10,0.55)",
              }}
            >
              Независимая AI-first студия · Бишкек, Кыргызстан.
              <br />
              16 человек · 4 клиента в production · без предоплаты · фикс-цена.
            </p>

            {time && (
              <div
                className="mt-8 font-mono text-[11px] flex items-center gap-2"
                style={{ color: "rgba(10,10,10,0.45)", letterSpacing: "0.1em" }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}
                />
                СЕЙЧАС · {time} · BISHKEK · ONLINE
              </div>
            )}
          </div>

          {/* Works */}
          <div className="md:col-span-3">
            <div
              className="font-mono text-[10px] mb-5"
              style={{ color: "rgba(10,10,10,0.4)", letterSpacing: "0.2em" }}
            >
              WORKS
            </div>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/#clients", label: "клиенты" },
                { href: "/#lab", label: "лаборатория" },
                { href: "/#team", label: "команда" },
                { href: "/partner", label: "партнёрам" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors"
                    style={{ fontSize: "14px", color: "#0a0a0a" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563EB")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0a0a0a")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <div
              className="font-mono text-[10px] mb-5"
              style={{ color: "rgba(10,10,10,0.4)", letterSpacing: "0.2em" }}
            >
              CONTACT
            </div>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:asystem.teamwork@gmail.com"
                  className="transition-colors"
                  style={{ fontSize: "14px", color: "#0a0a0a" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563EB")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0a0a0a")}
                >
                  asystem.teamwork@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/asystem_studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ fontSize: "14px", color: "#0a0a0a" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563EB")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0a0a0a")}
                >
                  Telegram · @asystem_studio
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/996500115133"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ fontSize: "14px", color: "#0a0a0a" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#2563EB")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#0a0a0a")}
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wordmark — full viewport width, ghost */}
      <div
        aria-hidden
        className="select-none overflow-hidden mt-16 lg:mt-24"
        style={{ lineHeight: 0.82 }}
      >
        <div
          className="font-semibold tracking-tighter whitespace-nowrap"
          style={{
            fontFamily: "var(--font-display, 'Space Grotesk'), sans-serif",
            fontSize: "clamp(120px, 24vw, 420px)",
            color: "rgba(10,10,10,0.08)",
            paddingLeft: "clamp(16px, 3vw, 48px)",
            paddingRight: "clamp(16px, 3vw, 48px)",
          }}
        >
          asystem<span style={{ color: "rgba(37, 99, 235,0.5)" }}>.</span>ai
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pb-12 lg:pb-16">
        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: "1px solid #e5e5e5" }}
        >
          <div
            className="font-mono text-[11px]"
            style={{ color: "rgba(10,10,10,0.4)", letterSpacing: "0.1em" }}
          >
            © 2026 asystem.ai · BISHKEK, KG · 42.87°N 74.57°E
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "rgba(10,10,10,0.4)",
                letterSpacing: "0.1em",
              }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "rgba(10,10,10,0.4)",
                letterSpacing: "0.1em",
              }}
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
