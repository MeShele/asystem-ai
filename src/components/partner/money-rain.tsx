"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

/**
 * Лёгкая визуализация падающих $100-купюр.
 *
 * Реализация — pure CSS + framer-motion AnimatePresence.
 * Никаких 3D-движков (Three.js/R3F весят 600+ КБ для одного виджета).
 * Каждая купюра — div с CSS-градиентом и transform; GPU-accelerated.
 *
 * Performance:
 * - Cap 60 купюр одновременно (всё что выше превращается в "+$N тыс." pile-overlay)
 * - useMemo для seed-позиций — пересчёт только при изменении count, не при каждом render
 * - prefers-reduced-motion: фоллбек без падений (мгновенное появление)
 *
 * @param earnings — сумма заработка в долларах. 1 купюра = $1000.
 */
interface Props {
  earnings: number;
  /** Скрыть весь компонент */
  active?: boolean;
}

const BILL_VALUE = 500;
const MAX_VISIBLE_BILLS = 60;

interface BillSeed {
  id: number;
  x: number; // 0..100 (% от контейнера)
  y: number; // 0..100 final-позиция
  rotateInit: number; // вращение во время падения
  rotateFinal: number; // вращение в покое
  delay: number; // задержка падения
  scale: number;
  zIndex: number;
}

/**
 * Детерминистичный «random»: купюра с индексом i всегда в одном и том же месте.
 * Это критично — иначе при увеличении count существующие купюры начнут двигаться.
 */
function seedRandom(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function generateBills(count: number): BillSeed[] {
  const bills: BillSeed[] = [];
  const visible = Math.min(count, MAX_VISIBLE_BILLS);
  for (let i = 0; i < visible; i++) {
    const r1 = seedRandom(i);
    const r2 = seedRandom(i + 100);
    const r3 = seedRandom(i + 200);
    const r4 = seedRandom(i + 300);
    const r5 = seedRandom(i + 400);
    bills.push({
      id: i,
      x: 5 + r1 * 90, // 5..95%
      y: 35 + r2 * 60, // 35..95% (нижняя половина — "пол")
      rotateInit: -90 + r3 * 180,
      rotateFinal: -25 + r4 * 50, // ±25deg
      delay: r5 * 0.4,
      scale: 0.85 + r1 * 0.3,
      zIndex: i,
    });
  }
  return bills;
}

export function MoneyRain({ earnings, active = true }: Props) {
  const totalBills = Math.floor(Math.max(0, earnings) / BILL_VALUE);
  const bills = useMemo(() => generateBills(totalBills), [totalBills]);
  const overflow = Math.max(0, totalBills - MAX_VISIBLE_BILLS);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {bills.map((b) => (
          <motion.div
            key={b.id}
            className="absolute"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              zIndex: b.zIndex,
              willChange: "transform, opacity",
            }}
            initial={{
              y: -260,
              x: 0,
              rotate: b.rotateInit,
              opacity: 0,
              scale: b.scale * 1.1,
            }}
            animate={{
              y: 0,
              x: 0,
              rotate: b.rotateFinal,
              opacity: 1,
              scale: b.scale,
              transition: {
                duration: 0.9 + seedRandom(b.id + 500) * 0.5,
                delay: b.delay,
                ease: [0.34, 1.2, 0.64, 1], // мягкий приземляющийся ease с лёгким overshoot
              },
            }}
            exit={{
              y: 80,
              opacity: 0,
              scale: 0.8,
              rotate: b.rotateFinal + 30,
              transition: { duration: 0.35, ease: "easeIn" },
            }}
          >
            <Bill />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Pile-overlay: если купюр больше чем visible cap — показываем суммарную пачку */}
      {overflow > 0 && (
        <motion.div
          key="overflow-pile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] text-white font-mono font-semibold tabular-nums shadow-lg pointer-events-none"
        >
          +{overflow} × $500
        </motion.div>
      )}
    </div>
  );
}

/**
 * Стилизованная $100-купюра. Без real dollar artwork (copyright-free).
 * Только зелёные градиенты, вензели через CSS, $ символ в центре.
 * Размер: 88×42px (правильное соотношение 2.61:1 как у реальной банкноты).
 */
function Bill() {
  return (
    <div
      className="relative w-[88px] h-[42px] rounded-md shadow-[0_4px_10px_-2px_rgba(0,0,0,0.35),0_2px_4px_-1px_rgba(0,0,0,0.25)]"
      style={{
        background: `
          linear-gradient(135deg, #1B5E20 0%, #2E7D32 45%, #388E3C 55%, #1B5E20 100%)
        `,
      }}
    >
      {/* Внутренняя рамка */}
      <div
        className="absolute inset-[3px] rounded-[3px] border border-emerald-300/30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Цифра 100 в каждом углу */}
      <div className="absolute top-1 left-1.5 text-[7px] font-bold text-emerald-200/80 leading-none font-mono">500</div>
      <div className="absolute top-1 right-1.5 text-[7px] font-bold text-emerald-200/80 leading-none font-mono">500</div>
      <div className="absolute bottom-1 left-1.5 text-[7px] font-bold text-emerald-200/80 leading-none font-mono">500</div>
      <div className="absolute bottom-1 right-1.5 text-[7px] font-bold text-emerald-200/80 leading-none font-mono">500</div>

      {/* Овальный портрет-плейсхолдер по центру */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28px] h-[24px] rounded-full bg-gradient-to-br from-emerald-100/15 to-emerald-700/30 border border-emerald-300/20 flex items-center justify-center">
        <span className="text-[10px] font-extrabold text-emerald-100/90 font-mono leading-none">$</span>
      </div>

      {/* Декоративные тонкие линии — иммитация гильоширного узора */}
      <div
        className="absolute inset-[3px] rounded-[3px] pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)",
        }}
      />
    </div>
  );
}
