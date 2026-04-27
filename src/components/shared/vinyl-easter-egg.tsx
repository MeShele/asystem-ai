"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Egg, EggCrack, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { VinylPlayer } from "./vinyl-player";

export function VinylEasterEgg() {
  const [cracking, setCracking] = useState(false);
  const [open, setOpen] = useState(false);

  const trigger = () => {
    if (open || cracking) return;
    setCracking(true);
    setTimeout(() => {
      setOpen(true);
      setTimeout(() => setCracking(false), 100);
    }, 700);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Wordmark — full viewport width, ghost, egg в позиции точки */}
      <div
        aria-hidden
        className="select-none overflow-hidden"
        style={{
          lineHeight: 0.82,
          background: "#fafafa",
          paddingTop: "clamp(20px, 4vh, 56px)",
          paddingBottom: "clamp(24px, 5vh, 72px)",
        }}
      >
        <div
          className="font-semibold tracking-tighter whitespace-nowrap text-center flex items-center justify-center"
          style={{
            fontSize: "clamp(56px, 14vw, 220px)",
            color: "rgba(10,10,10,0.18)",
            paddingLeft: "clamp(16px, 3vw, 48px)",
            paddingRight: "clamp(16px, 3vw, 48px)",
          }}
        >
          <span>asystem</span>
          <button
            type="button"
            onClick={trigger}
            aria-label="Пасхалка — открыть трек"
            className="group relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-110 focus:outline-none cursor-pointer"
            style={{
              width: "0.7em",
              height: "0.7em",
              margin: "0 0.06em",
              color: cracking ? "#2563EB" : "rgba(37, 99, 235,0.75)",
              verticalAlign: "baseline",
              lineHeight: 1,
              pointerEvents: "auto",
            }}
          >
            <motion.span
              animate={
                cracking
                  ? { rotate: [0, -10, 12, -14, 10, 0], scale: [1, 1.1, 1.15, 0.95, 1.05, 1] }
                  : { rotate: 0, scale: 1 }
              }
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {cracking ? (
                <EggCrack weight="fill" style={{ width: "100%", height: "100%" }} />
              ) : (
                <Egg
                  weight="fill"
                  className="transition-colors duration-300 group-hover:text-[#2563EB]"
                  style={{ width: "100%", height: "100%" }}
                />
              )}
            </motion.span>
          </button>
          <span>ai</span>
        </div>
        <div
          className="font-mono text-[10px] text-center mt-8"
          style={{ color: "#9ca3af", letterSpacing: "0.3em", pointerEvents: "none" }}
        >
          ● НАЖМИ ЯЙЦО
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="vinyl-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10"
            style={{ background: "rgba(10,10,10,0.72)", backdropFilter: "blur(12px)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="relative w-full max-w-5xl rounded-none overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
              style={{ background: "#fafafa" }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="absolute right-5 top-5 z-10 rounded-full transition-all hover:scale-110 active:scale-95"
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(10,10,10,0.06)",
                  color: "#0a0a0a",
                }}
              >
                <X size={18} className="mx-auto" />
              </button>
              <div className="max-h-[92vh] overflow-y-auto">
                <VinylPlayer />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
