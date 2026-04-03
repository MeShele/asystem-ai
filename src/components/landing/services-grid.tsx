"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Globe, Bot, Smartphone, Database } from "lucide-react";

const services = [
  { key: "website" as const, accent: "text-brand-500", bg: "bg-brand-500/[0.06]", icon: <Globe className="w-10 h-10" /> },
  { key: "bot" as const, accent: "text-accent-500", bg: "bg-accent-500/[0.06]", icon: <Bot className="w-10 h-10" /> },
  { key: "app" as const, accent: "text-brand-500", bg: "bg-brand-500/[0.06]", icon: <Smartphone className="w-10 h-10" /> },
  { key: "automation" as const, accent: "text-accent-500", bg: "bg-accent-500/[0.06]", icon: <Database className="w-10 h-10" /> },
];

export function ServicesGrid() {
  const t = useTranslations("client.services");

  return (
    <section className="relative overflow-hidden" id="services">
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
            <p className="text-text-muted text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mb-6">
              {t("subtitle")}
            </p>
          </motion.div>

          <div className="mt-16 space-y-4">
            {services.map((service, i) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-0 rounded-[2.5rem] border border-border-faint p-6 md:p-8 hover:bg-overlay-subtle transition-all duration-300"
              >
                {/* Title — 4 cols */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <span className="text-xs text-text-muted font-mono">0{i + 1}</span>
                  <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">
                    {t(`${service.key}.title`)}
                  </h3>
                </div>

                {/* Visual center — 4 cols */}
                <div className="md:col-span-4 flex items-center justify-center">
                  <div className={`${service.bg} ${service.accent} rounded-3xl p-6 transition-transform duration-300 group-hover:scale-110`}>
                    {service.icon}
                  </div>
                </div>

                {/* Description — 4 cols */}
                <div className="md:col-span-4">
                  <p className="text-sm lg:text-base text-text-secondary leading-relaxed">
                    {t(`${service.key}.desc`)}
                  </p>
                  <span className="inline-block mt-3 text-xs text-text-muted font-mono bg-overlay-subtle px-3 py-1 rounded-full">
                    {t(`${service.key}.time`)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
