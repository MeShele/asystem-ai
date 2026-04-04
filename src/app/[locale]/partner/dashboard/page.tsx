"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Client = {
  id: number;
  request_id: string;
  client_name: string;
  client_phone: string;
  client_company: string;
  project_type: string;
  budget: string;
  base_price: number;
  partner_price: number;
  commission: number;
  status: string;
  notes: string;
  created_at: string;
};

type Partner = {
  partner_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  ref_code: string;
  telegram_id: string | null;
  telegram_username: string | null;
  commission_rate: number;
};

type DashboardData = {
  partner: Partner;
  clients: Client[];
  stats: {
    totalClients: number;
    activeClients: number;
    totalEarned: number;
  };
};

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/10 text-blue-600" },
  discussing: { label: "Обсуждение", color: "bg-yellow-500/10 text-yellow-600" },
  in_progress: { label: "В работе", color: "bg-brand-500/10 text-brand-600" },
  review: { label: "На проверке", color: "bg-purple-500/10 text-purple-600" },
  completed: { label: "Завершён", color: "bg-green-500/10 text-green-600" },
  cancelled: { label: "Отменён", color: "bg-red-500/10 text-red-500" },
};

export default function PartnerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [tgId, setTgId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("unauthorized"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  if (error === "unauthorized" || !data) {
    return <LoginForm />;
  }

  const { partner, clients, stats } = data;
  const currentLocale = typeof window !== "undefined" ? window.location.pathname.split("/")[1] || "ru" : "ru";
  const refLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${currentLocale}/client/request?ref=${partner.ref_code}`;

  async function copyRef() {
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function linkTelegram() {
    if (!tgId.trim()) return;
    await fetch("/api/partner/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: tgId.trim() }),
    });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="fc-container">
        <div className="py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="fc-section-label">Партнёрская панель</span>
              <h1 className="text-2xl lg:text-3xl font-bold mt-1">
                Привет, {partner.name}
              </h1>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/partner/login", { method: "DELETE" });
                window.location.reload();
              }}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Выйти
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              className="p-6 rounded-xl border border-border-faint bg-surface"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-xs text-text-muted mb-1">Всего клиентов</div>
              <div className="text-3xl font-bold">{stats.totalClients}</div>
            </motion.div>
            <motion.div
              className="p-6 rounded-xl border border-border-faint bg-surface"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="text-xs text-text-muted mb-1">Активных</div>
              <div className="text-3xl font-bold text-brand-500">{stats.activeClients}</div>
            </motion.div>
            <motion.div
              className="p-6 rounded-xl border border-border-faint bg-surface"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-xs text-text-muted mb-1">Заработано</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${stats.totalEarned.toLocaleString()}
              </div>
            </motion.div>
          </div>

          {/* Ref link */}
          <motion.div
            className="p-5 rounded-xl border border-border-faint bg-surface mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="text-xs text-text-muted mb-2">Ваша реферальная ссылка</div>
            <div className="flex gap-2">
              <input
                value={refLink}
                readOnly
                className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border-faint text-sm font-mono text-text-secondary"
              />
              <button
                onClick={copyRef}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
              >
                {copied ? "Скопировано!" : "Копировать"}
              </button>
            </div>
          </motion.div>

          {/* Telegram status */}
          <motion.div
            className={`p-4 rounded-xl border mb-8 flex items-center gap-3 ${
              partner.telegram_id
                ? "border-green-500/20 bg-green-500/[0.04]"
                : "border-accent-500/20 bg-accent-500/[0.04]"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className={`w-2 h-2 rounded-full ${partner.telegram_id ? "bg-green-500" : "bg-accent-500"}`} />
            <span className={`text-sm ${partner.telegram_id ? "text-green-600 dark:text-green-400" : "text-accent-500"}`}>
              {partner.telegram_id
                ? `Telegram подключён ${partner.telegram_username ? `(@${partner.telegram_username})` : ""}`
                : "Telegram не подключён — войдите через Telegram для уведомлений"
              }
            </span>
          </motion.div>

          {/* Create project */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full p-5 rounded-xl border-2 border-dashed border-brand-500/30 bg-brand-500/[0.03] hover:bg-brand-500/[0.06] hover:border-brand-500/50 transition-all text-center group"
            >
              <span className="text-brand-500 font-semibold text-sm group-hover:underline">
                + Создать проект
              </span>
              <span className="block text-xs text-text-muted mt-1">Привели клиента? Заведите проект и отслеживайте статус</span>
            </button>
          </motion.div>

          {/* Create form modal */}
          {showCreateForm && (
            <CreateProjectForm
              onClose={() => setShowCreateForm(false)}
              onCreated={() => { setShowCreateForm(false); window.location.reload(); }}
            />
          )}

          {/* Coming soon teaser */}
          <motion.div
            className="mb-8 p-5 rounded-xl border border-border-faint bg-surface"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0">
                <span className="text-accent-500 text-lg">&#9889;</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Скоро: Авто-запуск проектов</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Для шаблонных продуктов (боты, лендинги, интеграции) — партнёр сможет запускать проекты автоматически без подтверждения.
                  Выбираете шаблон, вводите данные клиента, проект стартует мгновенно. White-label — ваш бренд, наша инженерия.
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-accent-500/10 text-accent-500 font-medium">Q2 2026</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-medium">API для агентств</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-600 font-medium">Шаблоны проектов</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Clients table */}
          <motion.div
            className="rounded-xl border border-border-faint bg-surface overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="px-5 py-4 border-b border-border-faint">
              <h2 className="text-base font-semibold">Ваши клиенты</h2>
            </div>

            {clients.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-text-muted text-sm mb-2">Пока нет клиентов</p>
                <p className="text-text-muted text-xs">Поделитесь реферальной ссылкой — заявки появятся здесь</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-faint">
                      <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Заявка</th>
                      <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Клиент</th>
                      <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Проект</th>
                      <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Статус</th>
                      <th className="px-5 py-3 text-right text-xs text-text-muted font-medium">Комиссия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => {
                      const st = statusLabels[client.status] || statusLabels.new;
                      return (
                        <tr key={client.id} className="border-b border-border-faint last:border-0 hover:bg-overlay-subtle transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-brand-500">{client.request_id}</td>
                          <td className="px-5 py-3">
                            <div className="font-medium">{client.client_name || "—"}</div>
                            <div className="text-xs text-text-muted">{client.client_phone || ""}</div>
                          </td>
                          <td className="px-5 py-3 text-text-secondary">{client.project_type || "—"}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            {client.commission > 0 ? (
                              <span className="font-semibold text-green-600 dark:text-green-400">${client.commission}</span>
                            ) : (
                              <span className="text-xs text-text-muted">Ожидает оценки</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Login / Register form ─── */
/* ─── Create Project Form ─── */
function CreateProjectForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    clientName: "", clientPhone: "", clientCompany: "",
    projectType: "website", budget: "", partnerPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const projectTypes = [
    { value: "website", label: "Веб-платформа" },
    { value: "bot", label: "AI / Бот" },
    { value: "app", label: "Мобильное приложение" },
    { value: "erp", label: "Enterprise / ERP" },
    { value: "integration", label: "Интеграция 1С" },
    { value: "other", label: "Другое" },
  ];

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

  const inputClass = "w-full p-3 bg-bg-primary border border-border-faint rounded-xl text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

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

          <select
            className={inputClass}
            value={form.projectType}
            onChange={(e) => setForm({ ...form, projectType: e.target.value })}
          >
            {projectTypes.map((pt) => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
            ))}
          </select>

          <input className={inputClass} placeholder="Цена для клиента, $ (если уже обсудили)" type="number" value={form.partnerPrice} onChange={(e) => setForm({ ...form, partnerPrice: e.target.value })} />

          <div className="p-3 rounded-lg bg-brand-500/[0.04] border border-brand-500/10 text-xs text-text-secondary leading-relaxed">
            Базовую цену мы назначим после оценки проекта. Ваша комиссия: 15% от базы + 50% от разницы между базой и вашей ценой клиенту. Вы увидите расчёт в таблице ниже.
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {loading ? "Создаём..." : "Создать проект"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Telegram Login Widget ─── */
function TelegramLoginButton() {
  useEffect(() => {
    // Define callback for Telegram widget
    (window as unknown as Record<string, unknown>).onTelegramAuth = async (user: Record<string, string>) => {
      try {
        const res = await fetch("/api/partner/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch {
        // ignore
      }
    };

    // Load Telegram widget script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "asystemai_sms_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const container = document.getElementById("tg-login-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }

    return () => {
      delete (window as unknown as Record<string, unknown>).onTelegramAuth;
    };
  }, []);

  return (
    <div id="tg-login-container" className="flex justify-center" />
  );
}

function LoginForm() {
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
        // Auto-login after register
        await fetch("/api/partner/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
      }

      window.location.reload();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full p-3 bg-bg-primary border border-border-faint rounded-xl text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

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

        {/* Telegram Login */}
        <TelegramLoginButton />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border-faint" />
          <span className="text-xs text-text-muted">или через email</span>
          <div className="flex-1 h-px bg-border-faint" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <input
                className={inputClass}
                placeholder="Ваше имя"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Телефон"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </>
          )}
          <input
            className={inputClass}
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Пароль"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-sm text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.995] transition-all disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-sm text-brand-500 hover:underline"
          >
            {mode === "login" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
