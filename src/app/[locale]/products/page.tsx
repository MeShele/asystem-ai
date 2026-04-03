"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { RotatingCube } from "@/components/shared/rotating-cube";

const teasers = [
  { label: "Автосинхронизация", icon: "⚡", desc: "Данные обновляются в реальном времени между всеми системами" },
  { label: "Аналитика", icon: "◎", desc: "Дашборды с KPI, воронки, отчёты — всё автоматически" },
  { label: "AI-ассистент", icon: "◇", desc: "Встроенный GPT для анализа данных и автоматизации рутины" },
];

export default function ProductsPage() {
  const t = useTranslations("products");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // best effort
    }
    setSubscribed(true);
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/[0.04] blur-[120px] pointer-events-none" />

        <div className="fc-container relative z-10 w-full">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />

          <div className="py-32 lg:py-40 px-4 flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="fc-section-label mb-4 block">Coming Soon</span>
              <h1 className="text-4xl lg:text-[64px] font-extrabold tracking-[-0.03em] leading-[0.95] mb-5">
                {t("title")}
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-md">{t("subtitle")}</p>

              {subscribed ? (
                <motion.div className="flex items-center gap-2 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 dark:text-green-400 font-medium">{t("thanks")}</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-3 w-full max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="flex-1 p-3.5 bg-bg-primary border border-border-faint rounded-xl text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted"
                    aria-label={t("emailPlaceholder")}
                  />
                  <button type="submit" className="fc-button-primary h-[46px] px-6 text-sm">
                    <span>{t("subscribe")}</span>
                  </button>
                </form>
              )}
            </motion.div>

            {/* 3D Cube */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <RotatingCube size={200} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature teaser cards */}
      <section className="relative -mt-16 z-10">
        <div className="fc-container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teasers.map((teaser, i) => (
              <motion.div
                key={i}
                className="group p-8 rounded-2xl border border-border-faint bg-surface hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/[0.04] transition-all duration-500"
                initial={{ opacity: 0, y: 40, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.12 }}
                style={{ perspective: 800 }}
              >
                <span className="text-3xl mb-4 block">{teaser.icon}</span>
                <h3 className="text-lg font-bold mb-2 group-hover:text-brand-500 transition-colors">{teaser.label}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{teaser.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal-style roadmap */}
      <section className="relative">
        <div className="fc-container px-4">
          <div className="py-24 lg:py-32">
            <motion.div
              className="max-w-2xl mx-auto rounded-2xl border border-border-faint bg-surface overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border-faint bg-bg-secondary">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                <span className="ml-3 text-xs text-text-muted font-mono">product-roadmap.md</span>
              </div>
              <div className="p-6 font-mono text-sm leading-8 text-text-secondary">
                <div><span className="text-brand-500">##</span> Q2 2026 — Запуск платформы</div>
                <div className="text-text-muted">- [ ] Авто-создание проектов из шаблонов</div>
                <div className="text-text-muted">- [ ] API для партнёрских интеграций</div>
                <div className="text-text-muted">- [ ] AI-ассистент v1</div>
                <div className="mt-4"><span className="text-accent-500">##</span> Q3 2026 — Расширение</div>
                <div className="text-text-muted">- [ ] Маркетплейс шаблонов</div>
                <div className="text-text-muted">- [ ] Аналитические дашборды</div>
                <div className="text-text-muted">- [ ] White-label модуль</div>
                <div className="mt-4"><span className="text-green-500">##</span> 2027 — Экосистема</div>
                <div className="text-text-muted">- [ ] SaaS-продукты</div>
                <div className="text-text-muted">- [ ] 100+ партнёров</div>
                <div className="mt-4"><span className="inline-block w-2 h-4 bg-brand-500 animate-pulse rounded-sm" /></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
