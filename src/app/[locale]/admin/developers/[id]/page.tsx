"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Trash2, Clock, FolderKanban } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";

interface Developer {
  id: number;
  name: string;
  role: string | null;
  avatar_url: string | null;
  email: string | null;
  telegram: string | null;
  status: string;
  created_at: string;
}

interface ProjectLite {
  project_id: string;
  name: string;
  status: string;
  total_price: number | string;
  progress_percent: number;
}

export default function DeveloperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    telegram: "",
    avatarUrl: "",
    status: "active",
  });

  useEffect(() => {
    fetch(`/api/admin/developers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const d: Developer | null = data.developer || null;
        setDeveloper(d);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        if (d) {
          setForm({
            name: d.name || "",
            role: d.role || "",
            email: d.email || "",
            telegram: d.telegram || "",
            avatarUrl: d.avatar_url || "",
            status: d.status || "active",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const dirty = useMemo(() => {
    if (!developer) return false;
    return (
      form.name !== (developer.name || "") ||
      form.role !== (developer.role || "") ||
      form.email !== (developer.email || "") ||
      form.telegram !== (developer.telegram || "") ||
      form.avatarUrl !== (developer.avatar_url || "") ||
      form.status !== developer.status
    );
  }, [form, developer]);

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    const res = await fetch(`/api/admin/developers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        role: form.role || null,
        email: form.email || null,
        telegram: form.telegram || null,
        avatar_url: form.avatarUrl || null,
        status: form.status,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      setDeveloper(updated);
    }
  };

  const handleDelete = async () => {
    if (!developer) return;
    if (!confirm(`Удалить «${developer.name}»? Все привязки к проектам будут удалены.`)) return;
    const res = await fetch(`/api/admin/developers/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/developers");
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
        <p className="text-text-muted text-sm">Загрузка...</p>
      </div>
    );
  }
  if (!developer) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push("/admin/developers")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <p className="text-text-muted">Разработчик не найден</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/admin/developers")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> К списку
        </button>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="text-xs text-orange-400">● Несохранённые изменения</span>
          )}
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Удалить
          </button>
        </div>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {form.avatarUrl ? (
            <Image src={form.avatarUrl} alt={form.name} width={64} height={64} unoptimized className="object-cover w-full h-full" />
          ) : (
            <span className="text-xl font-bold text-purple-400">
              {(form.name || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="text-2xl font-bold bg-transparent border-0 outline-none w-full focus:bg-surface focus:px-2 focus:rounded-lg transition-all"
          />
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Роль"
            className="text-sm text-text-secondary bg-transparent border-0 outline-none w-full focus:bg-surface focus:px-2 focus:rounded-lg transition-all mt-0.5"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border-faint bg-surface p-5 mb-5">
        <h3 className="text-sm font-semibold mb-4">Контакты и статус</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ivan@example.com"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
          <Field label="Telegram">
            <input
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              placeholder="@username"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
          <ImageUpload
            label="Аватар"
            value={form.avatarUrl || null}
            onChange={(v) => setForm({ ...form, avatarUrl: v || "" })}
            shape="circle"
          />
          <Field label="Статус">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            >
              <option value="active">Активен</option>
              <option value="vacation">В отпуске</option>
              <option value="inactive">Неактивен</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-border-faint bg-surface p-5">
        <h3 className="text-sm font-semibold mb-4">Проекты разработчика</h3>
        {projects.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">
            Не привязан ни к одному проекту
          </p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <button
                key={p.project_id}
                onClick={() => router.push(`/admin/projects/${p.project_id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border-faint hover:bg-surface-raised text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
                  <FolderKanban className="w-4 h-4 text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-text-muted font-mono">{p.project_id}</div>
                </div>
                <div className="text-xs text-text-secondary">{p.progress_percent}%</div>
              </button>
            ))}
          </div>
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
