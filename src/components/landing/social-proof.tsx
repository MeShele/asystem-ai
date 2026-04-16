"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const clients = [
  { name: "HOSTO", tag: "Channel Manager", country: "\u{1F1F0}\u{1F1EC}" },
  { name: "Sceramus", tag: "Corp. Portal", country: "\u{1F1F0}\u{1F1EC}" },
  { name: "AQUAHIMIYA", tag: "ERP System", country: "\u{1F1F0}\u{1F1EC}" },
];

const testimonials = [
  { text: "testimonial1", author: "HOSTO", role: "testimonialRole1", metric: "testimonialMetric1" },
  { text: "testimonial2", author: "AQUAHIMIYA", role: "testimonialRole2", metric: "testimonialMetric2" },
];

export function SocialProof() {
  const t = useTranslations("client.socialProof");

  return (
    <section className="relative overflow-hidden">
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
        <div className="h-px bg-border-faint" />

        <div className="py-20 px-4">
          {/* Client logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24"
          >
            <p className="text-xs text-text-muted tracking-[0.2em] uppercase mb-8">
              {t("workWith")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6">
              {clients.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-border-faint bg-bg-card hover:border-brand-500/30 transition-all duration-300"
                >
                  <span className="text-lg">{c.country}</span>
                  <div>
                    <div className="text-sm font-bold text-text-primary">{c.name}</div>
                    <div className="text-xs text-text-muted">{c.tag}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials — bigger quote text, more whitespace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((item, i) => (
              <motion.blockquote
                key={i}
                className="relative overflow-hidden p-10 rounded-3xl border border-border-faint bg-bg-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <div className="absolute top-6 right-8 text-7xl font-display text-brand-500/[0.06] leading-none select-none">&ldquo;</div>
                <p className="text-lg lg:text-xl text-text-secondary leading-relaxed mb-8 relative z-10">
                  &ldquo;{t(item.text)}&rdquo;
                </p>
                <footer className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-text-primary">{item.author}</div>
                    <div className="text-xs text-text-muted">{t(item.role)}</div>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg font-medium">
                    {t(item.metric)}
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
