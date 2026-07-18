export type CaseArchetype = "terminal" | "formal" | "soft" | "energy";
export interface CaseTheme {
  archetype: CaseArchetype;
  heroSurface: string; // hero background
  accent: string;      // accent on dark background
  accentInk: string;   // accent readable on light Paper background (WCAG AA >=4.5:1)
  pattern: "grid" | "dots" | "rules" | "none";
}
export const CASE_THEMES: Record<string, CaseTheme> = {
  twinwallet: { archetype: "terminal", heroSurface: "#0a0a0a", accent: "#6f9bff", accentInk: "#2563EB", pattern: "grid" },
};
export function getCaseTheme(slug: string): CaseTheme | null {
  return CASE_THEMES[slug] ?? null;
}
