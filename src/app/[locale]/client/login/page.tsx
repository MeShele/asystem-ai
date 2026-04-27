"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/client/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/client/dashboard");
    } else {
      const e = await res.json().catch(() => ({}));
      setErr(e.error || "Ошибка входа");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-faint bg-surface p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-1">Вход в кабинет</h1>
        <p className="text-sm text-text-secondary mb-6">Только для клиентов с зарегистрированным аккаунтом</p>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-semibold mt-4"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
          <p className="text-center text-xs text-text-muted mt-3">
            Получили invite-ссылку? Откройте её для регистрации.
          </p>
        </form>
      </div>
    </div>
  );
}
