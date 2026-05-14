"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";

function LightboxModal({
  member, index, total, t, onClose, onPrev, onNext,
}: {
  member: (typeof teamMembers)[number]; index: number; total: number;
  t: ReturnType<typeof useTranslations>; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const name = t(`${member.key}.name`);
  const role = t(`${member.key}.role`);
  const bio = t(`${member.key}.bio`);
  const scrambledName = useScrambleText(name, true);
  const scrambledRole = useScrambleText(role, true);
  const scrambledBio = useScrambleText(bio, true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }} onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 max-w-2xl w-full mx-4"
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute -top-2 -right-2 sm:top-0 sm:right-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors z-20" aria-label="Close">✕</button>
        <div className="relative w-44 h-56 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
          <Image src={member.photo} alt={name} fill className="object-cover object-top" sizes="280px" priority />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <motion.h3 className="text-2xl sm:text-3xl font-bold text-white font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>{scrambledName}</motion.h3>
          <motion.p className="text-sm text-brand-400 font-mono mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{scrambledRole}</motion.p>
          <motion.div className="mt-4 h-px bg-white/10 w-full" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.4 }} style={{ transformOrigin: "left" }} />
          <motion.p className="text-sm text-white/70 leading-relaxed mt-4 font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{scrambledBio}</motion.p>
          <motion.div className="flex items-center gap-4 mt-8 justify-center sm:justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <button onClick={onPrev} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors" aria-label="Previous">←</button>
            <span className="text-xs text-white/40 tabular-nums font-mono">{index + 1} / {total}</span>
            <button onClick={onNext} className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors" aria-label="Next">→</button>
          </motion.div>
          <p className="text-[10px] text-white/20 mt-4 font-mono">esc — close · ← → — navigate</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function useScrambleText(text: string, trigger: boolean) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!trigger || !text) { setDisplay(text); return; }
    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const revealed = Math.floor(progress * text.length);
      setDisplay(text.split("").map((char, i) => {
        if (i < revealed) return char;
        if (char === " ") return " ";
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join(""));
      if (frame >= totalFrames) { clearInterval(interval); setDisplay(text); }
    }, 30);
    return () => clearInterval(interval);
  }, [text, trigger]);
  return display;
}

const teamMembers = [
  { key: "asylbek" as const, photo: "/team/asylbek.png" },
  { key: "urmat" as const, photo: "/team/urmat.png" },
  { key: "asel" as const, photo: "/team/asel.png" },
  { key: "nasip" as const, photo: "/team/nasip.png" },
  { key: "dastan" as const, photo: "/team/dastan.png" },
  { key: "akylay" as const, photo: "/team/akylay.png" },
  { key: "ruslan" as const, photo: "/team/ruslan.png" },
  { key: "ermek" as const, photo: "/team/ermek.png" },
  { key: "suimonkul" as const, photo: "/team/suimonkul.png" },
  { key: "ivan" as const, photo: "/team/ivan.png" },
  { key: "saadat" as const, photo: "/team/saadat.png" },
  { key: "azamat" as const, photo: "/team/azamat.png" },
  { key: "alan" as const, photo: "/team/alan.png" },
  { key: "emir" as const, photo: "/team/emir.png" },
  { key: "alinur" as const, photo: "/team/alinur.png" },
  { key: "nerses" as const, photo: "/team/nerses.png" },
];

export function TeamSection() {
  const t = useTranslations("client.team");
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden" id="team">
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
            <p className="text-text-muted text-lg lg:text-xl max-w-lg mb-20">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* Team grid */}
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group text-center cursor-pointer"
                onClick={() => setActive(i)}
              >
                <div className="relative w-36 lg:w-44 aspect-square rounded-3xl overflow-hidden mb-4 bg-bg-secondary border border-border-faint group-hover:border-brand-500/40 group-hover:shadow-xl group-hover:shadow-brand-500/[0.08] transition-all duration-500">
                  <Image src={member.photo} alt={t(`${member.key}.name`)} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-700" sizes="176px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-white/80 font-mono">View →</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-0.5">{t(`${member.key}.name`)}</h3>
                <p className="text-xs text-brand-500 font-medium">{t(`${member.key}.role`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {active !== null && (
          <LightboxModal
            member={teamMembers[active]} index={active} total={teamMembers.length} t={t}
            onClose={() => setActive(null)}
            onPrev={() => setActive(active > 0 ? active - 1 : teamMembers.length - 1)}
            onNext={() => setActive(active < teamMembers.length - 1 ? active + 1 : 0)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
