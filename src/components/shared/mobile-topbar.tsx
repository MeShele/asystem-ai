"use client";

import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

export type MobileNavGroup = {
  title?: string;
  items: Array<{ label: string; href: string; external?: boolean }>;
};

interface MobileTopBarProps {
  groups: MobileNavGroup[];
}

export function MobileTopBar({ groups }: MobileTopBarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-3"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <Link href="/" className="inline-flex items-baseline gap-1">
          <span className="text-[18px] font-semibold tracking-tight">asystem</span>
          <span className="text-[18px] font-semibold" style={{ color: "#2563EB" }}>.</span>
          <span className="text-[18px] font-semibold tracking-tight">ai</span>
        </Link>

        <button
          type="button"
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            background: open ? "#2563EB" : "transparent",
            border: open ? "none" : "1px solid #e5e5e5",
            transition: "background 0.2s",
          }}
        >
          {open ? (
            <X size={18} strokeWidth={2.2} style={{ color: "#fff" }} />
          ) : (
            <Menu size={18} strokeWidth={2} style={{ color: "#0a0a0a" }} />
          )}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-50"
            style={{ background: "rgba(10,10,10,0.45)" }}
            onClick={() => setOpen(false)}
          >
            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-0 h-full w-[88%] max-w-[340px] flex flex-col"
              style={{ background: "#fff", boxShadow: "-12px 0 36px rgba(0,0,0,0.18)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: "1px solid #e5e5e5" }}
              >
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-baseline gap-1"
                >
                  <span className="text-[18px] font-semibold tracking-tight">asystem</span>
                  <span className="text-[18px] font-semibold" style={{ color: "#2563EB" }}>
                    .
                  </span>
                  <span className="text-[18px] font-semibold tracking-tight">ai</span>
                </Link>
                <button
                  type="button"
                  aria-label="Закрыть меню"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, background: "#2563EB" }}
                >
                  <X size={18} strokeWidth={2.2} style={{ color: "#fff" }} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-7">
                {groups.map((g, gi) => (
                  <div key={gi} className="flex flex-col gap-2.5">
                    {g.title && (
                      <div
                        className="font-mono text-[10px] font-semibold uppercase"
                        style={{ color: "#9ca3af", letterSpacing: "0.22em" }}
                      >
                        {g.title}
                      </div>
                    )}
                    {g.items.map((it) =>
                      it.external ? (
                        <a
                          key={it.href + it.label}
                          href={it.href}
                          target={it.href.startsWith("http") ? "_blank" : undefined}
                          rel={it.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          onClick={() => setOpen(false)}
                          className="text-[16px] py-1.5"
                          style={{ color: "#0a0a0a", letterSpacing: "-0.005em" }}
                        >
                          {it.label}
                        </a>
                      ) : it.href.startsWith("#") ? (
                        <a
                          key={it.href + it.label}
                          href={it.href}
                          onClick={() => setOpen(false)}
                          className="text-[16px] py-1.5"
                          style={{ color: "#0a0a0a", letterSpacing: "-0.005em" }}
                        >
                          {it.label}
                        </a>
                      ) : (
                        <Link
                          key={it.href + it.label}
                          href={it.href}
                          onClick={() => setOpen(false)}
                          className="text-[16px] py-1.5"
                          style={{ color: "#0a0a0a", letterSpacing: "-0.005em" }}
                        >
                          {it.label}
                        </Link>
                      )
                    )}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
