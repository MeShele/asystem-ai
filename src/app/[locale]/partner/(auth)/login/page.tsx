"use client";

import { useState } from "react";
import { motion } from "framer-motion";
const inputClass =
  "w-full p-3 bg-bg-primary border border-border-faint rounded-xl text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

export default function PartnerLoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/partner/login" : "/api/partner/register";
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }

      if (mode === "register") {
        await fetch("/api/partner/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
      }

      const locale = window.location.pathname.split("/")[1] || "ru";
      window.location.href = `/${locale}/partner/dashboard`;
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="font-semibold text-lg mb-1">
            asystem<span className="text-brand-500">.</span>ai
          </div>
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Вход для партнёров" : "Регистрация партнёра"}
          </h1>
        </div>

        <p className="text-center text-xs text-text-muted mb-6">
          Telegram-уведомления можно подключить после входа в Настройках
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <input className={inputClass} placeholder="Ваше имя" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className={inputClass} placeholder="Телефон" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </>
          )}
          <input className={inputClass} placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={inputClass} placeholder="Пароль" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

          {error && <div className="text-sm text-red-500 text-center">{error}</div>}

          <button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.995] transition-all disabled:opacity-50">
            {loading ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-sm text-brand-500 hover:underline">
            {mode === "login" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
