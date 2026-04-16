"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

export function CTASection() {
  const t = useTranslations("client.cta");

  return (
    <section className="relative overflow-hidden">
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />

        <motion.div
          className="relative overflow-hidden rounded-t-[3rem] -mt-10 bg-bg-card border border-border-faint border-b-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-500/[0.05] blur-[150px] pointer-events-none" />

          <div className="relative z-10 py-20 lg:py-28 px-6 lg:px-16">
            <div className="max-w-2xl">
              <span className="text-xs tracking-[0.2em] uppercase text-text-muted">
                {t("label")}
              </span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tighter mt-4 mb-2 leading-[1]">
                {t("title")}
              </h2>
              <p className="text-text-muted text-lg lg:text-xl mb-10 max-w-md">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/client/request"
                  className="relative inline-flex items-center justify-center h-14 px-10 rounded-xl text-white font-bold text-base overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 group-hover:from-brand-500 group-hover:to-accent-500 transition-all duration-500" />
                  <span className="relative z-10 flex items-center gap-2">
                    {t("button")}
                    <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <a
                  href="mailto:hello@asystem.ai"
                  className="text-sm text-text-muted hover:text-text-secondary transition-colors h-14 inline-flex items-center underline underline-offset-4 decoration-border-faint hover:decoration-text-muted"
                >
                  hello@asystem.ai →
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
