"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Compass, PenTool, Rocket, Server } from "lucide-react";

const steps = ["1", "2", "3", "4"] as const;
const stepIcons = [
  <Compass key="1" className="w-6 h-6 text-text-muted" />,
  <PenTool key="2" className="w-6 h-6 text-text-muted" />,
  <Rocket key="3" className="w-6 h-6 text-text-muted" />,
  <Server key="4" className="w-6 h-6 text-text-muted" />,
];

export function HowItWorks() {
  const t = useTranslations("client.howItWorks");

  return (
    <section className="relative overflow-hidden">
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
            <span className="text-xs tracking-[0.2em] uppercase text-text-muted">
              {t("label")}
            </span>
            <h2 className="text-5xl md:text-7xl font-semibold leading-[1] tracking-tighter mt-4 mb-2">
              {t("title")}
            </h2>
            <p className="text-text-muted text-lg lg:text-xl max-w-lg mb-20">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* Clean numbered list */}
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group grid grid-cols-1 md:grid-cols-12 items-start gap-6 md:gap-8 rounded-[2.5rem] border border-border-faint p-8 lg:p-10 hover:bg-overlay-subtle transition-all duration-300"
              >
                {/* Big number */}
                <div className="md:col-span-2 flex items-center gap-4">
                  <span className="text-6xl lg:text-7xl font-semibold tracking-tighter text-text-primary/10">
                    {step}
                  </span>
                </div>

                {/* Icon + Title */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-overlay-subtle">
                    {stepIcons[i]}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold tracking-tight">
                    {t(`steps.${step}.title`)}
                  </h3>
                </div>

                {/* Description */}
                <div className="md:col-span-6">
                  <p className="text-sm lg:text-base text-text-secondary leading-relaxed">
                    {t(`steps.${step}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
