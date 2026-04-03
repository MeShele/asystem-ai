"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-overlay-muted active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-text-secondary" />
      ) : (
        <Sun className="w-4 h-4 text-text-secondary" />
      )}
    </button>
  );
}
