"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { MagneticButton } from "@/components/ui/magnetic-button";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.4, 0, 1] as const },
  },
};

export function SplashHero() {
  const t = useTranslations("splash");
  const locale = useLocale();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="text-center"
    >
      {/* Live badge */}
      <motion.div variants={item} className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-border-faint bg-surface/80 backdrop-blur-sm text-sm shadow-lg shadow-brand-500/[0.03]">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-text-secondary">Принимаем заявки</span>
          <span className="text-brand-400 font-semibold">24/7</span>
        </div>
      </motion.div>

      {/* Heading with shimmer */}
      <motion.h1
        variants={item}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold leading-[1.02] tracking-tight mb-5"
      >
        <span className="text-text-primary">
          {t("question").split("к нам").length > 1 ? (
            <>
              Что привело вас{" "}
              <br className="hidden lg:block" />
              к нам?
            </>
          ) : (
            t("question")
          )}
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={item}
        className="text-base lg:text-lg text-text-secondary max-w-2xl mx-auto mb-6 leading-relaxed"
      >
        Создаём сайты, ботов, приложения и автоматизируем бизнес-процессы.
      </motion.p>

      {/* Stats with stagger */}
      <motion.div variants={item} className="flex justify-center gap-8 lg:gap-12 mb-14">
        {[
          { value: "50+", label: "проектов" },
          { value: "<1ч", label: "ответ" },
          { value: "98%", label: "довольны" },
        ].map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-8 lg:gap-12">
            {i > 0 && <div className="w-px h-10 bg-border-faint -ml-8 lg:-ml-12" />}
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-brand-500">{stat.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* CTA buttons with magnetic effect */}
      <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <MagneticButton href={`/${locale}/client/request`} className="fc-button-primary h-12 px-8 text-base">
          <span>Оставить заявку</span>
        </MagneticButton>
        <MagneticButton href={`/${locale}/client`} className="fc-button-secondary h-12 px-8 text-base">
          Наши кейсы →
        </MagneticButton>
      </motion.div>
    </motion.div>
  );
}
