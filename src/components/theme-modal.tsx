"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeModal() {
  const [show, setShow] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const hasChosen = localStorage.getItem("asystem_theme");
    if (!hasChosen) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleChoose(chosen: "light" | "dark") {
    setTheme(chosen);
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => handleChoose("light")}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-border-faint bg-surface p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-3xl mb-3">
                {theme === "light" ? "☀️" : "🌙"}
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1">
                Выберите тему
              </h2>
              <p className="text-sm text-text-secondary">
                Мы используем светлую тему по умолчанию, но если вам не нравится — включите тёмную
              </p>
            </div>

            {/* Theme options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Light */}
              <button
                onClick={() => handleChoose("light")}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                  theme === "light"
                    ? "border-brand-500 bg-brand-500/5"
                    : "border-border-faint hover:border-border-muted"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <Sun className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-sm font-semibold text-text-primary">Светлая</span>
                {theme === "light" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />
                )}
              </button>

              {/* Dark */}
              <button
                onClick={() => handleChoose("dark")}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                  theme === "dark"
                    ? "border-brand-500 bg-brand-500/5"
                    : "border-border-faint hover:border-border-muted"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center shadow-sm">
                  <Moon className="w-6 h-6 text-blue-300" />
                </div>
                <span className="text-sm font-semibold text-text-primary">Тёмная</span>
                {theme === "dark" && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />
                )}
              </button>
            </div>

            {/* Hint */}
            <p className="text-center text-xs text-text-muted">
              Вы сможете изменить тему в любой момент
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
