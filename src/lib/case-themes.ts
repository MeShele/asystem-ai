// Пер-кейсовая визуальная тематизация страниц портфолио.
// Значения сняты с реальных сайтов проектов (цвета, дисплейные шрифты) —
// каждая страница дышит брендом своего проекта, но каркас студии (sidebar,
// Inter, Paper) остаётся неизменным. Тёмный фон разрешён ТОЛЬКО внутри
// hero-«канваса» как цитата продукта.

export type CaseArchetype = "terminal" | "formal" | "soft" | "energy";
export type CasePattern = "grid" | "dots" | "rules" | "glow" | "none";
// Дисплейный шрифт hero-заголовка (грузится через next/font/google).
export type CaseFont = "grotesk" | "rajdhani" | "plexmono" | "jetbrains" | "inter";

export interface CaseTheme {
  archetype: CaseArchetype;
  /** Начало градиента hero-канваса. */
  heroFrom: string;
  /** Конец градиента hero-канваса. */
  heroTo: string;
  /** Цвет текста на hero (обычно #fff или светлый бренд-тон). */
  onHero: string;
  /** Акцент на тёмном hero (значение «Результата», активные элементы). */
  accent: string;
  /** Акцент, читаемый на светлом Paper (маркеры «О проекте»/«Что сделали»), WCAG AA. */
  accentInk: string;
  /** Дисплейный шрифт заголовка. */
  displayFont: CaseFont;
  /** Фоновый паттерн hero. */
  pattern: CasePattern;
  /** Цвет нижней границы hero. */
  heroBorder: string;
}

// Соответствие CaseFont → CSS-переменная (объявляется в layout через next/font).
// Inter в fallback: латинские дисплейные шрифты не имеют кириллицы —
// кириллические заголовки (АУРВА и т.п.) корректно падают на Inter.
export const FONT_VAR: Record<CaseFont, string> = {
  grotesk: "var(--font-grotesk), var(--font-inter), sans-serif",
  rajdhani: "var(--font-rajdhani), var(--font-inter), sans-serif",
  plexmono: "var(--font-plexmono), var(--font-inter), monospace",
  jetbrains: "var(--font-jetbrains), var(--font-inter), monospace",
  inter: "var(--font-inter), Inter, sans-serif",
};

export const CASE_THEMES: Record<string, CaseTheme> = {
  // --- Кейсы с живыми сайтами (бренд снят напрямую) ---
  hosto: {
    archetype: "soft",
    heroFrom: "#0F172B", heroTo: "#1D293D", onHero: "#ffffff",
    accent: "#8B95FF", accentInk: "#4F46E5",
    displayFont: "grotesk", pattern: "glow", heroBorder: "rgba(255,255,255,0.08)",
  },
  aku: {
    archetype: "soft",
    heroFrom: "#2D2438", heroTo: "#3C3350", onHero: "#FBF3EA",
    accent: "#FFAB7A", accentInk: "#B45309",
    displayFont: "grotesk", pattern: "dots", heroBorder: "rgba(255,255,255,0.10)",
  },
  orgon: {
    archetype: "formal",
    heroFrom: "#14110F", heroTo: "#201B17", onHero: "#F5F3EF",
    accent: "#E0564B", accentInk: "#9C1825",
    displayFont: "plexmono", pattern: "rules", heroBorder: "rgba(255,255,255,0.08)",
  },
  "steam-helper": {
    archetype: "terminal",
    heroFrom: "#05080C", heroTo: "#0B1018", onHero: "#C7D5E0",
    accent: "#8CC63F", accentInk: "#4D7C0F",
    displayFont: "rajdhani", pattern: "grid", heroBorder: "rgba(140,198,63,0.16)",
  },
  twinbridge: {
    archetype: "terminal",
    heroFrom: "#0B0E14", heroTo: "#12161F", onHero: "#E6EDF3",
    accent: "#B6FF1B", accentInk: "#4D7C0F",
    displayFont: "grotesk", pattern: "grid", heroBorder: "rgba(182,255,27,0.16)",
  },
  twinwallet: {
    archetype: "terminal",
    heroFrom: "#0A0A0A", heroTo: "#151515", onHero: "#ffffff",
    accent: "#9E9EFF", accentInk: "#4F46E5",
    displayFont: "jetbrains", pattern: "grid", heroBorder: "rgba(255,255,255,0.08)",
  },
  // --- NDA/внутренние кейсы (сайта нет) — архетип по категории ---
  "minobr-kr": {
    archetype: "formal",
    heroFrom: "#16233A", heroTo: "#243550", onHero: "#ffffff",
    accent: "#8FB4E8", accentInk: "#1D4ED8",
    displayFont: "inter", pattern: "rules", heroBorder: "rgba(255,255,255,0.08)",
  },
  aurva: {
    archetype: "terminal",
    heroFrom: "#0E1420", heroTo: "#172232", onHero: "#ffffff",
    accent: "#2DD4BF", accentInk: "#0D9488",
    displayFont: "inter", pattern: "grid", heroBorder: "rgba(45,212,191,0.16)",
  },
  "red-charge": {
    archetype: "energy",
    heroFrom: "#1C0A0A", heroTo: "#2E0F0C", onHero: "#ffffff",
    accent: "#FF5A3C", accentInk: "#DC2626",
    displayFont: "grotesk", pattern: "glow", heroBorder: "rgba(255,90,60,0.18)",
  },
  fiatex: {
    archetype: "terminal",
    heroFrom: "#0A0E14", heroTo: "#141B26", onHero: "#ffffff",
    accent: "#38BDF8", accentInk: "#0284C7",
    displayFont: "grotesk", pattern: "grid", heroBorder: "rgba(56,189,248,0.16)",
  },
  "asystem-core": {
    archetype: "terminal",
    heroFrom: "#0A0F1E", heroTo: "#121A38", onHero: "#ffffff",
    accent: "#5B8CFF", accentInk: "#2563EB",
    displayFont: "grotesk", pattern: "grid", heroBorder: "rgba(91,140,255,0.16)",
  },
};

export function getCaseTheme(slug: string): CaseTheme | null {
  return CASE_THEMES[slug] ?? null;
}
