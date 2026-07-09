"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Check } from "@phosphor-icons/react";
import Link from "next/link";
import { LiquidSpline, type SplineKind } from "@/components/landing/liquid-spline";

export type Service = {
  id: string;
  title: string;
  desc: string;
  details: string;
  includes: string[];
  price: string;
  time: string;
  stack: string;
  fluentIcon: string;
  splineKind: SplineKind;
};

export function ServiceModal({
  service,
  onClose,
}: {
  service: Service | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {service && (
        <motion.div
          key="service-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10"
          style={{ background: "rgba(10,10,10,0.72)", backdropFilter: "blur(12px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="relative w-full max-w-5xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
            style={{ background: "#fafafa" }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-5 top-5 z-10 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                background: "rgba(10,10,10,0.06)",
                color: "#0a0a0a",
              }}
            >
              <X size={18} />
            </button>

            <div className="max-h-[92vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 lg:p-12">
                {/* Spline liquid 3D-сцена */}
                <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-[420px]">
                  <LiquidSpline kind={service.splineKind} />
                </div>

                {/* Контент */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div
                    className="font-mono text-[10px] flex items-center gap-3"
                    style={{ color: "#525252", letterSpacing: "0.25em" }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "#2563EB" }}
                    />
                    SERVICE · {service.id.toUpperCase()}
                  </div>

                  <h2
                    className="font-semibold tracking-tight"
                    style={{
                      fontFamily: "var(--font-display, 'Space Grotesk'), sans-serif",
                      fontSize: "clamp(28px, 3.5vw, 48px)",
                      lineHeight: 1.05,
                      letterSpacing: "-0.025em",
                      color: "#0a0a0a",
                    }}
                  >
                    {service.title}
                  </h2>

                  <p
                    className="text-[15px] lg:text-[16px]"
                    style={{ color: "#525252", lineHeight: 1.6 }}
                  >
                    {service.details}
                  </p>

                  <div className="flex flex-col gap-3">
                    <div
                      className="font-mono text-[10px]"
                      style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
                    >
                      ЧТО ВХОДИТ
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {service.includes.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-[14px]"
                          style={{ color: "#0a0a0a", lineHeight: 1.5 }}
                        >
                          <Check
                            size={14}
                            weight="bold"
                            style={{ color: "#10b981", marginTop: 5, flexShrink: 0 }}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="grid grid-cols-3 gap-4 pt-5"
                    style={{ borderTop: "1px solid #e5e5e5" }}
                  >
                    <div className="flex flex-col gap-1">
                      <div
                        className="font-mono text-[9px]"
                        style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
                      >
                        ЦЕНА
                      </div>
                      <div
                        className="font-semibold"
                        style={{ fontSize: "16px", color: "#0a0a0a" }}
                      >
                        {service.price}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div
                        className="font-mono text-[9px]"
                        style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
                      >
                        СРОК
                      </div>
                      <div
                        className="font-semibold"
                        style={{ fontSize: "16px", color: "#0a0a0a" }}
                      >
                        {service.time}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div
                        className="font-mono text-[9px]"
                        style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
                      >
                        СТЕК
                      </div>
                      <div
                        className="font-mono text-[11px]"
                        style={{ color: "#0a0a0a", letterSpacing: "0.05em" }}
                      >
                        {service.stack}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      href="/client/request"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-medium transition-colors"
                      style={{
                        background: "#2563EB",
                        color: "#fff",
                        fontSize: "14px",
                        letterSpacing: "0.02em",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#2563EB")
                      }
                    >
                      Оставить заявку →
                    </Link>
                    <a
                      href="mailto:asystem.teamwork@gmail.com"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 font-medium transition-colors"
                      style={{
                        border: "1px solid rgba(10,10,10,0.2)",
                        color: "#0a0a0a",
                        fontSize: "14px",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "rgba(10,10,10,0.05)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "transparent")
                      }
                    >
                      asystem.teamwork@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
