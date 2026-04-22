"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

export function Footer() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Almaty",
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
        background: "#0a0a0a",
        color: "#fff",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand + meta */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-baseline gap-1 group">
              <span className="text-[32px] font-semibold tracking-tight">asystem</span>
              <span className="text-[32px] font-semibold" style={{ color: "#ef4444" }}>.</span>
              <span className="text-[32px] font-semibold tracking-tight">ai</span>
            </Link>
            <p
              className="mt-5 max-w-sm"
              style={{
                fontSize: "14px",
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Independent AI-first IT studio · Bishkek, KG.
              <br />
              16 people · 4 production clients · no prepay · fixed price.
            </p>

            {time && (
              <div
                className="mt-8 font-mono text-[11px] flex items-center gap-2"
                style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}
                />
                СЕЙЧАС · {time} · ALMATY · ONLINE
              </div>
            )}
          </div>

          {/* Works */}
          <div className="md:col-span-3">
            <div
              className="font-mono text-[10px] mb-5"
              style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}
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
                    style={{ fontSize: "14px", color: "#fff" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
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
              style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}
            >
              CONTACT
            </div>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:hello@asystem.ai"
                  className="transition-colors"
                  style={{ fontSize: "14px", color: "#fff" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                >
                  hello@asystem.ai
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/asystem_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ fontSize: "14px", color: "#fff" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                >
                  Telegram · @asystem_ai
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/996"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ fontSize: "14px", color: "#fff" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-20 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="font-mono text-[11px]"
            style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}
          >
            © 2026 asystem.ai · BISHKEK, KG · 42.87°N 74.57°E
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
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
                color: "rgba(255,255,255,0.4)",
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
