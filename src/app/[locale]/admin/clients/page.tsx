"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Search,
  Clock,
  User,
  Mail,
  Phone,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import { InviteModal } from "@/components/shared/invite-modal";

interface Client {
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  projects_count: number;
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const load = () => {
    fetch("/api/admin/clients-list")
      .then((r) => r.json())
      .then((d) => {
        setClients(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const handleDelete = async (clientId: string, name: string) => {
    if (!confirm(`Удалить клиента «${name}»? Привязки проектов будут отвязаны.`)) return;
    const res = await fetch(`/api/admin/clients-list/${clientId}`, { method: "DELETE" });
    if (res.ok) load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Клиенты</h1>
          <p className="text-text-secondary text-sm">
            Зарегистрированные клиенты — видят свои проекты, прогресс и могут писать в обсуждение
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg focus:border-brand-500 outline-none w-56 lg:w-72"
            />
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Invite-ссылка
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
          <User className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm mb-3">
            {search ? "Ничего не найдено" : "Клиентов пока нет"}
          </p>
          {!search && (
            <button
              onClick={() => setShowInvite(true)}
              className="text-brand-500 hover:text-brand-400 text-sm font-medium"
            >
              Создать invite-ссылку для первого
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border-faint bg-surface overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_180px_140px_100px_80px_60px] gap-3 px-4 py-2.5 border-b border-border-faint text-[11px] font-medium text-text-muted uppercase tracking-wider">
            <span>Имя</span>
            <span>Email</span>
            <span>Телефон</span>
            <span>Проектов</span>
            <span>Дата</span>
            <span></span>
          </div>
          <div className="divide-y divide-border-faint">
            {filtered.map((c) => (
              <div
                key={c.client_id}
                className="grid grid-cols-1 md:grid-cols-[1fr_180px_140px_100px_80px_60px] gap-3 px-4 py-3 hover:bg-surface-raised transition-colors cursor-pointer items-center"
                onClick={() => router.push(`/admin/clients/${c.client_id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-green-500">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    <div className="text-[11px] text-text-muted font-mono">{c.client_id}</div>
                  </div>
                </div>
                <span className="text-xs text-text-secondary truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  {c.email}
                </span>
                <span className="text-xs text-text-muted truncate flex items-center gap-1">
                  {c.phone && <Phone className="w-3 h-3 flex-shrink-0" />}
                  {c.phone || "—"}
                </span>
                <span className="text-xs font-mono text-brand-500">
                  {c.projects_count} {Number(c.projects_count) === 1 ? "проект" : "проектов"}
                </span>
                <span className="text-[11px] text-text-muted">
                  {new Date(c.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.client_id, c.name);
                  }}
                  className="w-7 h-7 rounded hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInvite && <InviteModal role="client" onClose={() => setShowInvite(false)} />}
    </div>
  );
}
