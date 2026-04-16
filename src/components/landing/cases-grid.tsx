"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";

export function CasesGrid() {
  const t = useTranslations("client.cases");

  return (
    <section className="relative overflow-hidden" id="cases">
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
        <div className="h-px bg-border-faint" />

        <div className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs tracking-[0.2em] uppercase text-text-muted">{t("label")}</span>
            <h2 className="text-4xl md:text-5xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
              {t("title")}
            </h2>
            <p className="text-text-muted text-lg lg:text-xl max-w-lg mb-16">
              {t("subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Featured — Министерство образования */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="lg:col-span-7">
              <motion.div
                className="group relative overflow-hidden rounded-2xl border border-border-faint bg-surface hover:border-brand-500/30 transition-all duration-500 h-full"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-56 lg:h-72 border-b border-border-faint relative overflow-hidden flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-bg-secondary">
                  <Image src="/logos/minobr.png" alt="Министерство образования КР" width={160} height={160} className="object-contain drop-shadow-md" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1.5 rounded-lg bg-brand-500/90 text-white text-xs font-medium">
                      {t("minobr.tag")}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-500 transition-colors">{t("minobr.title")}</h3>
                  <p className="text-sm lg:text-base text-text-secondary leading-relaxed mb-5">{t("minobr.desc")}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{t("minobr.result")}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* АУРВА + Red Charge */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1">
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-border-faint bg-surface hover:border-purple-500/30 transition-all duration-500 h-full"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="w-full sm:w-44 h-36 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-border-faint relative p-6 flex items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-bg-secondary">
                      <Image src="/logos/aurva.svg" alt="АУРВА" width={120} height={60} className="object-contain" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-purple-500/[0.08] border border-purple-500/[0.12] text-[11px] text-purple-500 font-medium">{t("aurva.tag")}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-purple-500 transition-colors">{t("aurva.title")}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed flex-1">{t("aurva.desc")}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{t("aurva.result")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1">
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-border-faint bg-surface hover:border-red-500/30 transition-all duration-500 h-full"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="w-full sm:w-44 h-36 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-border-faint relative p-6 flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-bg-secondary">
                      <Image src="/logos/red-charge.png" alt="Red Charge" width={120} height={48} className="object-contain" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-red-500/[0.08] border border-red-500/[0.12] text-[11px] text-red-500 font-medium">{t("redcharge.tag")}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-red-500 transition-colors">{t("redcharge.title")}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed flex-1">{t("redcharge.desc")}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{t("redcharge.result")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Tulpar Express — full width */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-4">
            <motion.div
              className="group relative overflow-hidden rounded-2xl border border-border-faint bg-surface hover:border-amber-500/30 transition-all duration-500"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-56 h-44 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-border-faint relative p-6 flex items-center justify-center bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-bg-secondary">
                  <Image src="/logos/tulpar-express.png" alt="Tulpar Express" width={160} height={65} className="object-contain" />
                </div>
                <div className="p-8 flex-1">
                  <div className="mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/[0.08] border border-amber-500/[0.12] text-[11px] text-amber-600 dark:text-amber-400 font-medium">{t("tulpar.tag")}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{t("tulpar.title")}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{t("tulpar.desc")}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{t("tulpar.result")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
