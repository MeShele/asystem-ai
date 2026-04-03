"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Hotel, BarChart3, Factory, Calendar, Wifi, Key, Brain, Settings, Package, Database } from "lucide-react";

// Lucide-based icon compositions for each case
function CaseVisualHosto() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="p-5 rounded-2xl border border-brand-500/20 bg-brand-500/[0.04]">
        <Hotel className="w-12 h-12 text-brand-500/60" />
      </div>
      <motion.div className="absolute top-[15%] right-[20%] p-2.5 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }}>
        <Calendar className="w-5 h-5 text-brand-500/50" />
      </motion.div>
      <motion.div className="absolute bottom-[20%] right-[15%] p-2.5 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [3, -3, 3] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}>
        <Key className="w-5 h-5 text-accent-500/50" />
      </motion.div>
      <motion.div className="absolute top-[20%] left-[15%] p-2.5 rounded-xl border border-border-faint bg-surface shadow-sm" animate={{ y: [-4, 2, -4] }} transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}>
        <Wifi className="w-5 h-5 text-green-500/50" />
      </motion.div>
      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-border-faint pointer-events-none" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-brand-500/[0.03] blur-[30px]" />
    </div>
  );
}

function CaseVisualSceramus() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="p-4 rounded-2xl border border-accent-500/20 bg-accent-500/[0.04]">
        <BarChart3 className="w-8 h-8 text-accent-500/60" />
      </div>
      <motion.div className="absolute top-[15%] right-[10%] p-2 rounded-lg border border-border-faint bg-surface shadow-sm" animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }}>
        <Brain className="w-4 h-4 text-accent-500/50" />
      </motion.div>
      <motion.div className="absolute bottom-[15%] left-[10%] p-2 rounded-lg border border-border-faint bg-surface shadow-sm" animate={{ y: [2, -4, 2] }} transition={{ duration: 5, repeat: Infinity, delay: 0.7 }}>
        <Settings className="w-4 h-4 text-text-muted" />
      </motion.div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-accent-500/[0.03] blur-[20px]" />
    </div>
  );
}

function CaseVisualAquahimiya() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="p-4 rounded-2xl border border-green-500/20 bg-green-500/[0.04]">
        <Factory className="w-8 h-8 text-green-500/60" />
      </div>
      <motion.div className="absolute top-[15%] left-[10%] p-2 rounded-lg border border-border-faint bg-surface shadow-sm" animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }}>
        <Package className="w-4 h-4 text-green-500/50" />
      </motion.div>
      <motion.div className="absolute bottom-[15%] right-[10%] p-2 rounded-lg border border-border-faint bg-surface shadow-sm" animate={{ y: [2, -4, 2] }} transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}>
        <Database className="w-4 h-4 text-text-muted" />
      </motion.div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-green-500/[0.03] blur-[20px]" />
    </div>
  );
}

export function CasesGrid() {
  const t = useTranslations("client.cases");

  return (
    <section className="relative overflow-hidden" id="cases">
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
        <div className="h-px bg-border-faint" />

        <div className="py-32 px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs tracking-[0.2em] uppercase text-text-muted">{t("label")}</span>
            <h2 className="text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
              {t("title")}
            </h2>
            <p className="text-text-muted text-lg lg:text-xl max-w-lg mb-16">
              {t("subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Featured — HOSTO */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="lg:col-span-7">
              <motion.div
                className="group relative overflow-hidden rounded-2xl border border-border-faint bg-surface hover:border-brand-500/30 transition-all duration-500 h-full"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-56 lg:h-72 border-b border-border-faint relative overflow-hidden flex items-center justify-center p-8">
                  <CaseVisualHosto />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1.5 rounded-lg bg-brand-500/90 text-white text-xs font-medium">
                      {t("hosto.tag")}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-500 transition-colors">{t("hosto.title")}</h3>
                  <p className="text-sm lg:text-base text-text-secondary leading-relaxed mb-5">{t("hosto.desc")}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{t("hosto.result")}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Two smaller */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="flex-1">
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-border-faint bg-surface hover:border-accent-500/30 transition-all duration-500 h-full"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="w-full sm:w-44 h-36 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-border-faint relative p-4">
                      <CaseVisualSceramus />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-accent-500/[0.08] border border-accent-500/[0.12] text-[11px] text-accent-500 font-medium">{t("sceramus.tag")}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-accent-500 transition-colors">{t("sceramus.title")}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed flex-1">{t("sceramus.desc")}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{t("sceramus.result")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1">
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-border-faint bg-surface hover:border-green-500/30 transition-all duration-500 h-full"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className="w-full sm:w-44 h-36 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-border-faint relative p-4">
                      <CaseVisualAquahimiya />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-3">
                        <span className="px-2.5 py-1 rounded-md bg-green-500/[0.08] border border-green-500/[0.12] text-[11px] text-green-600 dark:text-green-400 font-medium">{t("aquahimiya.tag")}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{t("aquahimiya.title")}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed flex-1">{t("aquahimiya.desc")}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{t("aquahimiya.result")}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
