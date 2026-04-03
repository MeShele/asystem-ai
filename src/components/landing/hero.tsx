"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { HeroAnimation } from "@/components/splash/hero-animation";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0, 1] as const } },
};

export function Hero() {
  const t = useTranslations("client.hero");
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={ref}
      className="overflow-hidden relative"
      id="client-hero"
    >
      {/* Subtle ambient glow orbs only */}
      <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-brand-500/[0.04] blur-[180px] pointer-events-none" />
      <div className="absolute top-[50%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent-500/[0.03] blur-[140px] pointer-events-none" />

      {/* Content */}
      <div className="fc-container relative z-10 w-full">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />

        {/* Text — parallaxes away */}
        <motion.div
          style={{ y: textY, opacity: textOpacity, scale: textScale }}
          className="pt-40 lg:pt-52 pb-12 relative px-4"
        >
          <motion.div variants={stagger} initial="hidden" animate="show" className="text-center">
            <motion.div variants={fadeUp} className="mb-8 lg:mb-10 flex flex-wrap items-center justify-center gap-3">
              <span className="text-[13px] font-medium tracking-[0.2em] uppercase text-brand-500">
                Enterprise IT
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                {t("badge")}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-[8rem] font-semibold leading-[0.9] tracking-tighter mb-8"
            >
              <span className="text-text-primary">{t("title")}</span>
              <br />
              <span className="text-text-muted">
                {t("titleAccent")}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-14">
              <MagneticButton className="relative h-14 px-10 text-base font-bold rounded-xl text-white overflow-hidden">
                <Link href="/client/request" className="relative z-10 flex items-center gap-2">
                  <span>{t("cta")}</span>
                  <span className="text-lg">→</span>
                </Link>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </MagneticButton>
              <MagneticButton className="fc-button-secondary h-14 px-10 text-base">
                <a href="#cases">{t("secondary")}</a>
              </MagneticButton>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Terminal */}
        <div className="relative px-4 pb-24 lg:pb-32">
          <HeroAnimation />
        </div>
      </div>
    </section>
  );
}
