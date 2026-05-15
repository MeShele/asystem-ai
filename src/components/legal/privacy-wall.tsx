"use client";

import { motion } from "framer-motion";

const sections = [
  { title: "1. Сбор данных", text: "Мы собираем только те данные, которые вы предоставляете добровольно через формы на сайте: имя, телефон, email, описание проекта." },
  { title: "2. Использование данных", text: "Ваши данные используются исключительно для связи с вами по поводу вашего проекта и не передаются третьим лицам." },
  { title: "3. Хранение", text: "Данные хранятся на защищённых серверах. Мы используем шифрование при передаче данных (HTTPS)." },
  { title: "4. Ваши права", text: "Вы можете запросить удаление ваших данных в любой момент, написав на hello@asystem.ai." },
  { title: "5. Контакты", text: "По вопросам конфиденциальности: hello@asystem.ai" },
];

export function PrivacyWall() {
  return (
    <div className="min-h-screen">
      {/* Header */}
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
                Политика конфиденциальности
              </h1>
              <p className="text-text-muted text-sm mt-4 font-mono">1 января 2026 г.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
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
