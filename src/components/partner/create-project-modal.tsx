"use client";

import { useState } from "react";
import { motion } from "framer-motion";


const inputClass =
  "w-full p-3 bg-bg-primary border border-border-faint rounded-xl text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

export function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientCompany: "",
    projectType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/partner/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Ошибка сервера");
      onCreated();
    } catch {
      setError("Не удалось создать проект. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 w-full max-w-md bg-surface rounded-2xl border border-border-faint p-6 shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Создать проект</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-lg" aria-label="Закрыть">&#10005;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input className={inputClass} placeholder="Имя клиента *" required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          <input className={inputClass} placeholder="Телефон клиента" type="tel" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
          <input className={inputClass} placeholder="Компания клиента" value={form.clientCompany} onChange={(e) => setForm({ ...form, clientCompany: e.target.value })} />

          <input className={inputClass} placeholder="Тип проекта (например: сайт, бот, приложение, CRM...)" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} />

          <div className="p-3 rounded-lg bg-brand-500/[0.04] border border-brand-500/10 text-xs text-text-secondary leading-relaxed">
            Цену проекта можно настроить после создания — через калькулятор или вручную.
          </div>

          {error && <div className="text-sm text-red-500 text-center">{error}</div>}

          <button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 transition-all disabled:opacity-50">
            {loading ? "Создаём..." : "Создать проект"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
