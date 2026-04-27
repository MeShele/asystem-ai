"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
  Search,
  Plus,
  Clock,
  Users,
  X,
  Mail,
  Send,
  Trash2,
} from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";

interface Developer {
  id: number;
  name: string;
  role: string | null;
  avatar_url: string | null;
  email: string | null;
  telegram: string | null;
  status: string;
  projects_count: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Активен", color: "bg-green-500/10 text-green-500" },
  vacation: { label: "В отпуске", color: "bg-yellow-500/10 text-yellow-500" },
  inactive: { label: "Неактивен", color: "bg-text-muted/10 text-text-muted" },
};

export default function AdminDevelopersPage() {
  const router = useRouter();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    fetch("/api/admin/developers")
      .then((r) => r.json())
      .then((data) => {
        setDevelopers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setDevelopers([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = developers.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.role?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Удалить разработчика «${name}»? Все привязки к проектам будут удалены.`)) return;
    const res = await fetch(`/api/admin/developers/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Разработчики</h1>
          <p className="text-text-secondary text-sm">
            Справочник разработчиков. Привязка к проектам — в карточке проекта.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-56 lg:w-72 transition-all"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Новый
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
          <p className="text-text-muted text-sm">Загрузка...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-border-faint bg-surface">
          <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm mb-3">
            {search ? "Ничего не найдено" : "Разработчиков пока нет"}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="text-brand-500 hover:text-brand-400 text-sm font-medium"
            >
              Создать первого
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border-faint bg-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_140px_140px_120px_100px_60px] gap-3 px-4 py-2.5 border-b border-border-faint text-[11px] font-medium text-text-muted uppercase tracking-wider">
            <span>Имя</span>
            <span>Роль</span>
            <span>Email</span>
            <span>Telegram</span>
            <span>Статус</span>
            <span></span>
          </div>
          <div className="divide-y divide-border-faint">
            {filtered.map((d) => {
              const status = statusLabels[d.status] || statusLabels.active;
              return (
                <div
                  key={d.id}
                  onClick={() => router.push(`/admin/developers/${d.id}`)}
                  className="grid grid-cols-1 md:grid-cols-[1fr_140px_140px_120px_100px_60px] gap-3 px-4 py-3 hover:bg-surface-raised transition-colors cursor-pointer items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {d.avatar_url ? (
                        <Image
                          src={d.avatar_url}
                          alt={d.name}
                          width={36}
                          height={36}
                          unoptimized
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-xs font-bold text-purple-400">
                          {d.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.name}</div>
                      <div className="text-[11px] text-text-muted">
                        {d.projects_count} {d.projects_count === 1 ? "проект" : "проектов"}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-text-secondary truncate">{d.role || "—"}</span>
                  <span className="text-xs text-text-muted truncate flex items-center gap-1">
                    {d.email && <Mail className="w-3 h-3 flex-shrink-0" />}
                    <span className="truncate">{d.email || "—"}</span>
                  </span>
                  <span className="text-xs text-text-muted truncate flex items-center gap-1">
                    {d.telegram && <Send className="w-3 h-3 flex-shrink-0" />}
                    <span className="truncate">{d.telegram || "—"}</span>
                  </span>
                  <span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(d.id, d.name);
                    }}
                    className="w-7 h-7 rounded hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCreate && (
        <CreateDeveloperModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateDeveloperModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [status, setStatus] = useState("active");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/developers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        role: role.trim() || null,
        email: email.trim() || null,
        telegram: telegram.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        status,
      }),
    });
    setSubmitting(false);
    if (res.ok) onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-faint bg-surface shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-faint">
          <h2 className="text-lg font-semibold">Новый разработчик</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Имя *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Петров"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Роль">
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Frontend Lead"
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
            <Field label="Статус">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              >
                <option value="active">Активен</option>
                <option value="vacation">В отпуске</option>
                <option value="inactive">Неактивен</option>
              </select>
            </Field>
          </div>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ivan@example.com"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>

          <Field label="Telegram">
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>

          <ImageUpload
            label="Аватар"
            value={avatarUrl || null}
            onChange={(v) => setAvatarUrl(v || "")}
            shape="circle"
          />
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border-faint">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || submitting}
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-medium"
          >
            {submitting ? "Создаём..." : "Создать"}
          </button>
        </div>
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
