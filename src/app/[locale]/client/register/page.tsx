"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Clock, Check } from "lucide-react";

function ClientRegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const inviteToken = params.get("invite") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteState, setInviteState] = useState<"valid" | "invalid" | "loading" | "no-invite">("loading");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!inviteToken) {
      setInviteState("no-invite");
      return;
    }
    fetch(`/api/invites/${inviteToken}`)
      .then((r) => {
        if (!r.ok) throw new Error("invalid");
        return r.json();
      })
      .then((d) => {
        if (d.role !== "client") {
          setInviteState("invalid");
        } else {
          if (d.email) setEmail(d.email);
          if (d.name) setName(d.name);
          setInviteState("valid");
        }
      })
      .catch(() => setInviteState("invalid"));
  }, [inviteToken]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/client/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        password,
        invite_token: inviteToken || null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/client/dashboard"), 1500);
    } else {
      const e = await res.json().catch(() => ({}));
      setErr(e.error || "Ошибка регистрации");
    }
  };

  if (inviteState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Clock className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-faint bg-surface p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-1">Регистрация клиента</h1>
        <p className="text-sm text-text-secondary mb-6">
          {inviteState === "valid"
            ? "✅ Invite-ссылка действительна. После регистрации вы увидите свой проект."
            : inviteState === "invalid"
            ? "❌ Invite-ссылка недействительна или истекла"
            : "ℹ️ Регистрация без invite-ссылки"}
        </p>

        {success ? (
          <div className="p-6 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold mb-1">Готово!</p>
            <p className="text-sm text-text-muted">Перенаправляем в ваш кабинет...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Field label="ФИО *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Петров"
                required
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
            <Field label="Email *">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
            <Field label="Телефон">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996..."
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
            <Field label="Пароль *">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>

            {err && <p className="text-xs text-red-500">{err}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-semibold mt-4"
            >
              {loading ? "Регистрируем..." : "Зарегистрироваться"}
            </button>
            <p className="text-center text-xs text-text-muted mt-3">
              Уже есть аккаунт?{" "}
              <button
                type="button"
                onClick={() => router.push("/client/login")}
                className="text-brand-500 hover:underline"
              >
                Войти
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function ClientRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ClientRegisterForm />
    </Suspense>
  );
}
