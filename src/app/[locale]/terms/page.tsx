"use client";

import { motion } from "framer-motion";

const sections = [
  { title: "1. Общие положения", text: "Используя сайт asystem.ai, вы соглашаетесь с настоящими условиями. Сайт предоставляет информацию об IT-услугах компании ASYSTEM." },
  { title: "2. Услуги", text: "Стоимость, сроки и объём работ определяются индивидуально для каждого проекта и фиксируются в договоре." },
  { title: "3. Интеллектуальная собственность", text: "Весь код и результаты работы передаются клиенту в полном объёме после оплаты. IP принадлежит клиенту." },
  { title: "4. Ограничение ответственности", text: "Компания не несёт ответственности за убытки, вызванные использованием информации на сайте в целях, не предусмотренных договором." },
  { title: "5. Контакты", text: "hello@asystem.ai | Бишкек, Кыргызстан" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="fc-container relative">
          <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
          <div className="pt-32 pb-16 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="fc-section-label mb-4 block">Legal</span>
              <h1 className="text-4xl lg:text-[56px] font-extrabold tracking-[-0.03em] leading-tight">
                Условия использования
              </h1>
              <p className="text-text-muted text-sm mt-4 font-mono">1 января 2026 г.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="fc-container">
          <div className="py-16 px-4 max-w-2xl">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                className="mb-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <h2 className="text-lg font-bold mb-2">{s.title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
