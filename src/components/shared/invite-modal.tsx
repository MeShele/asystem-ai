"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

export function InviteModal({
  role,
  projectId,
  onClose,
}: {
  role: "client" | "partner";
  projectId?: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        email: email || null,
        name: name || null,
        project_id: projectId || null,
      }),
    });
    setLoading(false);
    if (res.ok) {
      const inv = await res.json();
      const base = window.location.origin;
      const locale = window.location.pathname.split("/")[1] || "ru";
      const path = role === "client"
        ? `/${locale}/client/register?invite=${inv.token}`
        : `/${locale}/partner/register?invite=${inv.token}`;
      setLink(`${base}${path}`);
    }
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-faint bg-surface shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-faint">
          <h2 className="text-lg font-semibold">
            Invite-ссылка для {role === "client" ? "клиента" : "партнёра"}
            {projectId && <span className="ml-2 font-mono text-xs text-text-muted">{projectId}</span>}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!link ? (
            <>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Email (для предзаполнения)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Имя (необязательно)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Петров"
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
                />
              </div>
              <p className="text-xs text-text-muted">
                Ссылка действует 30 дней. После регистрации деактивируется.
                {projectId && " Проект автоматически привяжется к новому клиенту."}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-text-muted">
                Ссылка готова. Отправьте её {role === "client" ? "клиенту" : "партнёру"} в любом мессенджере.
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={link}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-bg-secondary border border-border-faint rounded-lg"
                />
                <button
                  onClick={copy}
                  className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm flex items-center gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border-faint">
          {!link ? (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">
                Отмена
              </button>
              <button
                onClick={create}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-medium"
              >
                {loading ? "Создаём..." : "Создать ссылку"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium"
            >
              Готово
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
