"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { CursorGlowCard } from "./cursor-glow-card";

const cards = [
  {
    key: "partner" as const,
    icon: "🤝",
    href: "/partner" as const,
    mono: "PARTNER",
    accentColor: "group-hover:text-amber-400",
  },
  {
    key: "client" as const,
    icon: "🚀",
    href: "/client" as const,
    mono: "PROJECT",
    accentColor: "group-hover:text-brand-400",
  },
  {
    key: "products" as const,
    icon: "⚡",
    href: "/products" as const,
    mono: "PRODUCTS",
    accentColor: "group-hover:text-accent-400",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.25, 0.4, 0, 1] as const },
  }),
};

export function EntryCards() {
  const t = useTranslations("splash");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          custom={i}
          variants={cardVariant}
          initial="hidden"
          animate="show"
        >
          <Link href={card.href}>
            <CursorGlowCard className={`group bg-surface border border-border-faint rounded-xl p-6 lg:p-8 transition-all duration-300 hover:border-border-muted hover:bg-surface-raised hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand-500/[0.04] active:scale-[0.99]`}>
              {/* Mono tag */}
              <span className="absolute top-3 right-3 font-mono text-[9px] deco-text select-none relative z-10">
                {card.mono}
              </span>

              {/* Icon with scale */}
              <div className="text-3xl lg:text-4xl mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>

              {/* Title */}
              <h3 className={`text-base font-semibold mb-1.5 text-text-primary ${card.accentColor} transition-colors relative z-10`}>
                {t(`${card.key}.title`)}
              </h3>

              {/* Description */}
              <p className="text-sm text-text-secondary leading-relaxed relative z-10">
                {t(`${card.key}.desc`)}
              </p>

              {/* Arrow */}
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1 relative z-10">
                <span>Перейти</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </CursorGlowCard>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
