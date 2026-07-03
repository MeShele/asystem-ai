"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { PenLine, X, Check, ArrowRight, Loader2 } from "lucide-react";

const inputClass =
  "w-full p-3 bg-bg-primary border border-border-faint rounded-xl text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

/** Реф-код партнёра: из ?ref= в URL или из cookie partner_ref (её ставит форма регистрации). */
function getRefCode(): string | null {
  if (typeof window === "undefined") return null;
  const fromUrl = new URLSearchParams(window.location.search).get("ref");
  if (fromUrl) return fromUrl;
  const m = document.cookie.match(/(?:^|;\s*)partner_ref=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function FloatingRequestButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  // ESC для закрытия + блок скролла фона, пока модалка открыта
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    // сброс с задержкой, чтобы не мигало во время exit-анимации
    setTimeout(() => {
      setSent(false);
      setName("");
      setPhone("");
      setDescription("");
      setErr("");
      setLoading(false);
    }, 300);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!name.trim() || !phone.trim()) {
      setErr("Укажите имя и контакт");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          description: description.trim() || null,
          ref: getRefCode(),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setSent(true);
    } catch {
      setErr("Не удалось отправить. Попробуйте ещё раз или напишите на hello@asystem.ai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Оставить заявку"
        className="fixed left-4 bottom-4 md:left-6 md:bottom-6 z-[150] inline-flex items-center gap-2.5 rounded-full pl-4 pr-5 py-3.5 text-white font-medium text-sm"
        style={{
          background: "#2563EB",
          boxShadow: "0 12px 32px -6px rgba(37,99,235,0.5)",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#2563EB")}
      >
        <PenLine size={17} />
        Оставить заявку
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="quick-request"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(10,10,10,0.72)", backdropFilter: "blur(12px)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="relative w-full max-w-md rounded-2xl border border-border-faint p-6 lg:p-7"
              style={{ background: "#fff", boxShadow: "0 40px 100px -20px rgba(0,0,0,0.5)" }}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Закрыть"
                className="absolute right-4 top-4 rounded-full w-9 h-9 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: "rgba(10,10,10,0.06)", color: "#0a0a0a" }}
              >
                <X size={17} />
              </button>

              {sent ? (
                <div className="py-6 text-center">
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(37,99,235,0.1)" }}
                  >
                    <Check size={26} style={{ color: "#2563EB" }} />
                  </div>
                  <p className="text-lg font-semibold mb-1" style={{ color: "#0a0a0a" }}>
                    Заявка отправлена
                  </p>
                  <p className="text-sm" style={{ color: "#525252" }}>
                    Свяжемся с вами в ближайшее время.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-5 text-sm font-medium"
                    style={{ color: "#2563EB" }}
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="font-mono text-[10px] flex items-center gap-2 mb-2"
                    style={{ color: "#525252", letterSpacing: "0.2em" }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "#2563EB" }}
                    />
                    БЫСТРАЯ ЗАЯВКА
                  </div>
                  <h2 className="text-xl font-bold mb-1" style={{ color: "#0a0a0a" }}>
                    Оставьте заявку
                  </h2>
                  <p className="text-sm mb-5" style={{ color: "#525252" }}>
                    Ответим в течение 24 часов — без созвонов и «перезвоним».
                  </p>

                  <form onSubmit={submit} className="space-y-3">
                    <input
                      className={inputClass}
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                    <input
                      className={inputClass}
                      placeholder="Телефон или @telegram"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      placeholder="Что нужно? (необязательно)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />

                    {err && (
                      <p className="text-xs" style={{ color: "#dc2626" }}>
                        {err}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium text-sm transition-colors disabled:opacity-60"
                      style={{ background: "#2563EB" }}
                      onMouseEnter={(e) =>
                        !loading && ((e.currentTarget as HTMLElement).style.background = "#1D4ED8")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background = "#2563EB")
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Отправляем…
                        </>
                      ) : (
                        <>
                          Отправить
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <Link
                      href="/client/request"
                      onClick={close}
                      className="text-sm font-medium hover:underline"
                      style={{ color: "#2563EB" }}
                    >
                      или пройти полный расчёт — 6 вопросов →
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
