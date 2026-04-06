"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { categories, type Category } from "@/lib/calculator-data";

/* ─── Props ─── */

export type CalculatorConfig = {
  selected: string[];
  quantities: Record<string, number>;
  discount: number;
};

type ProjectCalculatorProps = {
  initialConfig?: CalculatorConfig;
  onConfigChange?: (config: CalculatorConfig) => void;
  onPriceChange?: (basePrice: number, partnerPrice: number) => void;
};

/* ─── Animated counter ─── */
function AnimatedPrice({ value, className = "" }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.4, 0, 1] }}
      className={`tabular-nums ${className}`}
    >
      ${value.toLocaleString()}
    </motion.span>
  );
}

/* ─── Toggle switch ─── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0 ${
        on ? "bg-brand-500" : "bg-border-muted"
      }`}
    >
      <motion.div
        className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white"
        animate={{ x: on ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

/* ─── Qty stepper ─── */
function QtyStepper({
  value,
  min = 1,
  max = 50,
  unit,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Уменьшить"
        className="w-6 h-6 rounded-md border border-border-faint flex items-center justify-center text-text-muted hover:border-border-muted hover:text-text-secondary disabled:opacity-30 transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="text-sm font-medium tabular-nums w-8 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Увеличить"
        className="w-6 h-6 rounded-md border border-border-faint flex items-center justify-center text-text-muted hover:border-border-muted hover:text-text-secondary disabled:opacity-30 transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
      {unit && <span className="text-xs text-text-muted">{unit}</span>}
    </div>
  );
}

/* ─── Category accordion ─── */
function CategorySection({
  category,
  selected,
  quantities,
  onToggle,
  onQtyChange,
}: {
  category: Category;
  selected: Set<string>;
  quantities: Record<string, number>;
  onToggle: (name: string) => void;
  onQtyChange: (name: string, qty: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = category.items.filter((i) => selected.has(i.name)).length;
  const categoryTotal = category.items
    .filter((i) => selected.has(i.name))
    .reduce((sum, i) => sum + i.price * (quantities[i.name] ?? i.defaultQty), 0);

  return (
    <div className="border border-border-faint rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 hover:bg-overlay-subtle transition-colors text-left"
      >
        <span className={`font-mono text-sm ${category.accent} opacity-60`}>
          {category.icon}
        </span>
        <span className="text-base font-semibold flex-1">{category.name}</span>
        {activeCount > 0 && (
          <span className="text-xs bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full font-medium">
            {activeCount} · ${categoryTotal.toLocaleString()}
          </span>
        )}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-1">
              {category.items.map((item) => {
                const isOn = selected.has(item.name);
                const qty = quantities[item.name] ?? item.defaultQty;
                const total = item.price * qty;
                return (
                  <div
                    key={item.name}
                    className={`flex items-center gap-3 py-3 px-3 rounded-lg transition-colors ${
                      isOn ? "bg-brand-500/[0.04]" : "hover:bg-overlay-subtle"
                    }`}
                  >
                    <Toggle on={isOn} onToggle={() => onToggle(item.name)} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${isOn ? "text-text-primary font-medium" : "text-text-secondary"}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        ${item.price}{item.unit ? ` / ${item.unit}` : ""}
                      </div>
                    </div>
                    {item.qtyEditable && isOn && (
                      <QtyStepper
                        value={qty}
                        min={item.minQty}
                        max={item.maxQty}
                        unit={item.unit}
                        onChange={(v) => onQtyChange(item.name, v)}
                      />
                    )}
                    <span className={`text-sm tabular-nums shrink-0 min-w-[60px] text-right ${isOn ? "text-text-primary font-semibold" : "text-text-muted"}`}>
                      ${total.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Partner markup calculator ─── */
function PartnerMarkup({ basePrice }: { basePrice: number }) {
  const [retailPrice, setRetailPrice] = useState(Math.round(basePrice * 1.3));
  const clampedRetail = Math.max(retailPrice, basePrice);

  const commission = Math.round(basePrice * 0.15);
  const markup = clampedRetail - basePrice;
  const partnerMarkupShare = Math.round(markup * 0.5);
  const partnerTotal = commission + partnerMarkupShare;
  const partnerPercent = clampedRetail > 0 ? Math.round((partnerTotal / clampedRetail) * 100) : 0;

  // Update retail when base changes
  const effectiveRetail = Math.max(clampedRetail, basePrice);

  return (
    <div className="space-y-4">
      <div className="text-xs text-text-muted uppercase tracking-wider">
        Ваша наценка
      </div>

      {/* Retail price slider */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs text-text-secondary">Вы продаёте клиенту за</span>
          <span className="text-base font-bold text-accent-500">${effectiveRetail.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={basePrice}
          max={Math.max(basePrice * 3, basePrice + 500)}
          step={50}
          value={effectiveRetail}
          onChange={(e) => setRetailPrice(Number(e.target.value))}
          className="w-full accent-accent-500"
          aria-label="Цена для клиента"
        />
        <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
          <span>= база</span><span>×3</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Комиссия 15%</span>
          <span className="text-green-600 dark:text-green-400 font-medium">+${commission.toLocaleString()}</span>
        </div>
        {markup > 0 && (
          <div className="flex justify-between">
            <span className="text-text-secondary">50% наценки (${markup.toLocaleString()})</span>
            <span className="text-green-600 dark:text-green-400 font-medium">+${partnerMarkupShare.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-baseline pt-3 border-t border-border-faint">
        <div>
          <div className="text-sm font-semibold text-text-primary">Итого вам</div>
          <div className="text-[10px] text-text-muted">{partnerPercent}% от цены клиента</div>
        </div>
        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
          <AnimatedPrice value={partnerTotal} />
        </span>
      </div>

      {/* Visual bar */}
      <div className="relative h-8 rounded-lg overflow-hidden border border-border-faint">
        <div
          className="absolute inset-y-0 left-0 w-full bg-brand-500/15 flex items-center justify-center origin-left transition-transform duration-300"
          style={{ transform: `scaleX(${(basePrice - commission) / effectiveRetail})` }}
        >
          <span className="text-[10px] text-brand-500 font-medium" style={{ transform: `scaleX(${effectiveRetail / (basePrice - commission || 1)})` }}>asystem</span>
        </div>
        <div
          className="absolute inset-y-0 right-0 w-full bg-green-500/15 flex items-center justify-center origin-right transition-transform duration-300"
          style={{ transform: `scaleX(${partnerTotal / effectiveRetail})` }}
        >
          <span className="text-[10px] text-green-600 dark:text-green-400 font-medium" style={{ transform: `scaleX(${effectiveRetail / (partnerTotal || 1)})` }}>${partnerTotal}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main calculator ─── */
export function ProjectCalculator({
  initialConfig,
  onConfigChange,
  onPriceChange,
}: ProjectCalculatorProps) {
  const defaultSelected = new Set(
    initialConfig
      ? initialConfig.selected
      : categories.flatMap((c) => c.items.filter((i) => i.defaultOn).map((i) => i.name))
  );

  const [selected, setSelected] = useState<Set<string>>(defaultSelected);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    initialConfig?.quantities ?? {}
  );
  const [discount, setDiscount] = useState(initialConfig?.discount ?? 0);

  const notifyConfigChange = useCallback(
    (sel: Set<string>, qty: Record<string, number>, disc: number) => {
      onConfigChange?.({
        selected: Array.from(sel),
        quantities: qty,
        discount: disc,
      });
    },
    [onConfigChange]
  );

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      notifyConfigChange(next, quantities, discount);
      return next;
    });
  }

  function setQty(name: string, qty: number) {
    setQuantities((prev) => {
      const next = { ...prev, [name]: qty };
      notifyConfigChange(selected, next, discount);
      return next;
    });
  }

  function handleDiscountChange(d: number) {
    setDiscount(d);
    notifyConfigChange(selected, quantities, d);
  }

  const subtotal = useMemo(
    () =>
      categories
        .flatMap((c) => c.items)
        .filter((i) => selected.has(i.name))
        .reduce((sum, i) => sum + i.price * (quantities[i.name] ?? i.defaultQty), 0),
    [selected, quantities]
  );

  const discountAmount = Math.round(subtotal * (discount / 100));
  const total = subtotal - discountAmount;

  // Notify parent when base price changes
  useEffect(() => {
    onPriceChange?.(total, 0);
  }, [total, onPriceChange]);

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Left: categories */}
      <div className="flex-1 min-w-0 space-y-2">
        {categories.map((cat) => (
          <CategorySection
            key={cat.name}
            category={cat}
            selected={selected}
            quantities={quantities}
            onToggle={toggle}
            onQtyChange={setQty}
          />
        ))}
      </div>

      {/* Right: sticky summary */}
      <div className="lg:sticky lg:top-24 lg:w-[340px] shrink-0">
        <div className="rounded-2xl border border-border-faint bg-bg-card p-6 space-y-5">
          {/* Subtotal */}
          <div>
            <div className="text-xs text-text-muted mb-1">Стоимость проекта</div>
            <div className="text-3xl font-bold text-text-primary">
              <AnimatedPrice value={subtotal} />
            </div>
          </div>

          {/* Discount */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm text-text-secondary">Скидка</span>
              <span className="text-sm font-semibold text-accent-500">{discount}%</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 5, 10, 15, 20, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDiscountChange(d)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                    discount === d
                      ? "border-accent-500 bg-accent-500/10 text-accent-500 font-medium"
                      : "border-border-faint text-text-muted hover:border-border-muted"
                  }`}
                >
                  {d === 0 ? "—" : `${d}%`}
                </button>
              ))}
            </div>
            {discount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-accent-500 mt-2"
              >
                Экономия: ${discountAmount.toLocaleString()}
              </motion.div>
            )}
          </div>

          {/* Total after discount */}
          <div className="border-t border-border-faint pt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-text-primary">Базовая цена</span>
              <span className="text-2xl font-bold text-text-primary">
                <AnimatedPrice value={total} />
              </span>
            </div>
          </div>

          {/* Selected count */}
          <div className="text-xs text-text-muted text-center pt-1">
            {selected.size} услуг выбрано
          </div>
        </div>
      </div>
    </div>
  );
}
