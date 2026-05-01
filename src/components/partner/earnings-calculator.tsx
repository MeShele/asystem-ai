"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Calculator, Sparkles, RotateCcw, ChevronDown, Zap, Repeat, Star, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MeshGradient } from "@paper-design/shaders-react";
import { LevelIcon } from "@/components/shared/level-icon";
import { MoneyRain } from "./money-rain";

interface TierLevel {
  level: number;
  title: string;
  icon: string;
  base_pct: number;
}

interface Props {
  levels: TierLevel[];
  currentLevel: number;
  isFounding: boolean;
  retentionQualified?: boolean;
  partnerId: string;
}

interface SavedState {
  amount: number;
  level: number;
  fast: boolean;
  retention: boolean;
  founding: boolean;
}

const STORAGE_KEY = "asystem.partner.calc.v2";

function loadSaved(partnerId: string): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}.${partnerId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function persistSaved(partnerId: string, s: SavedState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY}.${partnerId}`, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

function detectWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export function EarningsCalculator({ levels, currentLevel, isFounding, retentionQualified = false, partnerId }: Props) {
  // Всегда закрыт при загрузке страницы — состояние не сохраняется
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(40000);
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [fast, setFast] = useState(false);
  const [retention, setRetention] = useState(retentionQualified);
  const [founding, setFounding] = useState(isFounding);
  const [hydrated, setHydrated] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(false);

  const containerRef = useRef<HTMLElement | null>(null);
  const inView = useInView(containerRef, { amount: 0.05 });

  useEffect(() => {
    setHasWebGL(detectWebGL());
  }, []);

  useEffect(() => {
    const saved = loadSaved(partnerId);
    if (saved) {
      setAmount(saved.amount);
      setSelectedLevel(saved.level);
      setFast(saved.fast);
      setRetention(saved.retention);
      setFounding(saved.founding);
    } else {
      setSelectedLevel(currentLevel);
      setRetention(retentionQualified);
      setFounding(isFounding);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  useEffect(() => {
    if (!hydrated) return;
    persistSaved(partnerId, { amount, level: selectedLevel, fast, retention, founding });
  }, [hydrated, partnerId, amount, selectedLevel, fast, retention, founding]);

  const meta = useMemo(() => levels.find((l) => l.level === selectedLevel) || levels[0], [levels, selectedLevel]);
  const base = meta?.base_pct ?? 15;

  const bonuses: { label: string; pct: number }[] = [];
  if (founding) bonuses.push({ label: "Founding partner", pct: 5 });
  if (retention) bonuses.push({ label: "Retention (3 сделки/60 дн)", pct: 5 });
  if (fast) bonuses.push({ label: "Быстрая сдача (<30 дн)", pct: 10 });
  const bonusSum = bonuses.reduce((s, b) => s + b.pct, 0);
  const totalPct = Math.max(0, base + bonusSum);
  const earnings = (amount * totalPct) / 100;

  const reset = () => {
    setAmount(40000);
    setSelectedLevel(currentLevel);
    setFast(false);
    setRetention(retentionQualified);
    setFounding(isFounding);
  };

  const showShader = inView && hasWebGL;

  return (
    <motion.section
      ref={containerRef}
      className="relative rounded-2xl border border-border-faint bg-surface mb-6 overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Editorial mesh-gradient ВОЛНЫ как в hero — мягкие, на фоне всей секции */}
      {showShader && (
        <MeshGradient
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.4,
            pointerEvents: "none",
          }}
          colors={["#ffffff", "#DBEAFE", "#2563EB", "#FAFAFA", "#F5F5F4"]}
          distortion={0.85}
          swirl={0.25}
          speed={0.35}
        />
      )}
      {!showShader && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 30%, rgba(37,99,235,0.08), rgba(219,234,254,0.3) 50%, transparent 80%)",
          }}
        />
      )}

      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-full flex items-center justify-between p-5 lg:p-6 text-left transition-colors hover:bg-white/30 group z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Calculator className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">Калькулятор заработка</h3>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-500/12 text-brand-500 font-mono uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-brand-500 live-pulse" />
                live
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {open
                ? "Прикинь, сколько получишь с проекта при разных условиях"
                : "Открыть и посчитать сколько заработаешь с проекта"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!open && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-brand-500 text-white font-semibold group-hover:bg-brand-600 transition-colors shadow-sm">
              Открыть
            </span>
          )}
          <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border-faint relative z-10"
          >
            <div className="p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)] gap-5">
              {/* ── Левая колонка ── */}
              <div className="space-y-4">
                {/* Сумма проекта */}
                <Block
                  title="Сумма проекта"
                  right={
                    <motion.span
                      key={amount}
                      initial={{ scale: 0.96, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-lg font-bold tracking-tight text-brand-500"
                    >
                      ${amount.toLocaleString("ru-RU")}
                    </motion.span>
                  }
                >
                  <input
                    type="range"
                    min={5000}
                    max={200000}
                    step={1000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-text-muted mt-1.5 font-mono">
                    <span>$5K</span>
                    <span>$50K</span>
                    <span>$100K</span>
                    <span>$200K</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[10000, 25000, 40000, 75000, 150000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmount(v)}
                        className={`flex-1 text-xs py-1.5 rounded-lg font-mono border transition-all ${
                          amount === v
                            ? "bg-brand-500 border-brand-500 text-white"
                            : "bg-surface border-border-faint hover:border-brand-500/40 hover:bg-brand-500/[0.04]"
                        }`}
                      >
                        ${(v / 1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>
                </Block>

                {/* Уровень партнёра */}
                <Block
                  title="Уровень партнёра"
                  right={<span className="text-[10px] text-text-muted">кликни — проверь L4 или L5</span>}
                >
                  <div className="flex gap-1.5 -mx-1 px-1 overflow-x-auto sm:overflow-visible sm:grid sm:grid-cols-5 sm:gap-2 snap-x snap-mandatory scrollbar-thin">
                    {levels.map((lvl) => {
                      const isCurrent = lvl.level === currentLevel;
                      const isSelected = lvl.level === selectedLevel;
                      return (
                        <button
                          key={lvl.level}
                          onClick={() => setSelectedLevel(lvl.level)}
                          className={`group shrink-0 w-[19%] min-w-[64px] sm:w-auto sm:min-w-0 snap-start relative px-1.5 py-2 rounded-lg border text-center transition-all duration-200 ${
                            isSelected
                              ? "border-brand-500 bg-brand-500/10 shadow-sm shadow-brand-500/10"
                              : "border-border-faint bg-surface hover:border-brand-500/30"
                          }`}
                        >
                          {isCurrent && (
                            <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-brand-500 flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                          )}
                          <div className={`mx-auto mb-1 w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? "bg-brand-500 text-white" : "bg-brand-500/10 text-brand-500"}`}>
                            <span className="text-[11px] font-bold font-mono">L{lvl.level}</span>
                          </div>
                          <div className={`text-xs font-bold transition-colors ${isSelected ? "text-brand-500" : "text-text-secondary"}`}>
                            {lvl.base_pct}%
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Block>

                {/* Множители */}
                <Block
                  title="Множители комиссии"
                  right={<span className="font-mono text-xs text-brand-500 font-semibold tabular-nums">+{bonusSum}%</span>}
                >
                  <div className="space-y-2">
                    <BonusToggle
                      label="Быстрая сдача"
                      hint="Проект сдан за <30 дней"
                      pct={10}
                      tone="brand"
                      icon={Zap}
                      checked={fast}
                      onChange={setFast}
                    />
                    <BonusToggle
                      label="Retention 12 месяцев"
                      hint={retentionQualified ? "Авто: 3 сделки за 60 дней" : "3 сделки за 60 дней → +5%"}
                      pct={5}
                      tone="green"
                      icon={Repeat}
                      checked={retention}
                      onChange={setRetention}
                      autoActive={retentionQualified}
                    />
                    <BonusToggle
                      label="Founding partner"
                      hint={isFounding ? "Активирован пожизненно" : "Только первые 5 партнёров"}
                      pct={5}
                      tone="amber"
                      icon={Star}
                      checked={founding}
                      onChange={setFounding}
                      autoActive={isFounding}
                      disabled={!isFounding}
                    />
                  </div>
                </Block>

                <div className="flex items-center justify-end px-1">
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Сбросить к моим значениям
                  </button>
                </div>
              </div>

              {/* ── Правая колонка — результат ── */}
              <div className="lg:sticky lg:top-4 lg:self-start">
                <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white relative overflow-hidden shadow-xl shadow-brand-500/25">
                  <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15 blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-white/8 blur-3xl pointer-events-none" />

                  {/* Зона дождя купюр — фиксированная высота сверху */}
                  <div className="relative h-[180px] overflow-hidden border-b border-white/15">
                    <MoneyRain earnings={earnings} active={open} />
                    {/* Лёгкий fade в нижней части — купюры мягко уходят в фон под текстом */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-brand-700/60 pointer-events-none" />
                    {/* Метка-bills counter */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider">
                      <span className="w-1 h-1 rounded-full bg-emerald-300 live-pulse" />
                      {Math.floor(earnings / 500)} × $500
                    </div>
                  </div>

                  <div className="relative p-6">
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider opacity-85 mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      Твой заработок
                    </div>
                    <motion.div
                      key={earnings}
                      initial={{ scale: 0.96, opacity: 0.6 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="text-4xl lg:text-5xl font-extrabold tracking-tight font-mono"
                    >
                      ${earnings.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                    </motion.div>
                    <div className="text-sm opacity-90 mt-1 mb-5">
                      {totalPct}% от ${amount.toLocaleString("ru-RU")}
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-white/20">
                      <Row label={`Базовая ставка ${meta?.title ?? ""}`} value={`${base}%`} />
                      {bonuses.map((b) => (
                        <Row key={b.label} label={b.label} value={`+${b.pct}%`} accent />
                      ))}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/20">
                        <span className="text-xs uppercase opacity-80 tracking-wider">Итого</span>
                        <span className="font-mono font-bold text-lg">{totalPct}%</span>
                      </div>
                    </div>

                    {selectedLevel < 5 && (
                      <div className="mt-5 p-3 rounded-xl bg-white/12 backdrop-blur-md border border-white/15">
                        <div className="text-[10px] uppercase tracking-wider opacity-80 mb-1">При L{selectedLevel + 1}</div>
                        <div className="text-sm font-semibold">
                          + ${calcDelta(amount, levels, selectedLevel, bonusSum).toLocaleString("ru-RU")} с этой же сделки
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-text-muted mt-3 leading-relaxed text-center">
                  Это оценка для мотивации, не оферта. Финальная комиссия фиксируется при подписании договора.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/**
 * Чистая карточка-секция. Сплошной surface-фон, тонкая граница — цельный блок поверх волн.
 */
function Block({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.12em]">{title}</span>
        {right}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="opacity-80 truncate pr-2">{label}</span>
      <span className={`font-mono font-semibold ${accent ? "text-emerald-200" : ""}`}>{value}</span>
    </div>
  );
}

function BonusToggle({
  label,
  hint,
  pct,
  tone,
  icon: Icon,
  checked,
  onChange,
  autoActive = false,
  disabled = false,
}: {
  label: string;
  hint: string;
  pct: number;
  tone: "brand" | "green" | "amber";
  icon: LucideIcon;
  checked: boolean;
  onChange: (v: boolean) => void;
  autoActive?: boolean;
  disabled?: boolean;
}) {
  const toneText: Record<string, string> = {
    brand: "text-brand-500",
    green: "text-green-500",
    amber: "text-amber-500",
  };
  const toneIconBg: Record<string, string> = {
    brand: "bg-brand-500/10",
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
  };
  const toneActiveBorder: Record<string, string> = {
    brand: "border-brand-500/40 bg-brand-500/[0.04]",
    green: "border-green-500/40 bg-green-500/[0.04]",
    amber: "border-amber-500/40 bg-amber-500/[0.04]",
  };

  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`group w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left ${
        checked ? toneActiveBorder[tone] : "border-border-faint bg-surface hover:border-text-muted/30 hover:bg-bg-secondary/30"
      } ${disabled ? "opacity-55 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-lg ${toneIconBg[tone]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${toneText[tone]}`} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{label}</span>
            {autoActive && (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/12 text-green-600 font-medium uppercase tracking-wider whitespace-nowrap">
                <span className="w-1 h-1 rounded-full bg-green-500 live-pulse" />
                авто
              </span>
            )}
          </div>
          <div className="text-[10px] text-text-muted truncate mt-0.5">{hint}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
        <span className={`font-mono font-bold text-sm tabular-nums transition-colors ${checked ? toneText[tone] : "text-text-muted"}`}>
          +{pct}%
        </span>
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            checked
              ? `${toneText[tone]} bg-current`
              : "bg-surface border border-border-muted/40 group-hover:border-text-muted/40"
          }`}
        >
          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );
}

function calcDelta(amount: number, levels: TierLevel[], currentLvl: number, bonusSum: number): number {
  const cur = levels.find((l) => l.level === currentLvl);
  const next = levels.find((l) => l.level === currentLvl + 1);
  if (!cur || !next) return 0;
  const curEarn = (amount * (cur.base_pct + bonusSum)) / 100;
  const nextEarn = (amount * (next.base_pct + bonusSum)) / 100;
  return Math.max(0, Math.round(nextEarn - curEarn));
}
