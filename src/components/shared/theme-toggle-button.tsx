"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleButton({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all w-full ${
        collapsed ? "justify-center" : ""
      }`}
      title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
    >
      {theme === "dark" ? (
        <Sun className="w-[18px] h-[18px] flex-shrink-0" />
      ) : (
        <Moon className="w-[18px] h-[18px] flex-shrink-0" />
      )}
      {!collapsed && <span>{theme === "dark" ? "Светлая тема" : "Тёмная тема"}</span>}
    </button>
  );
}
