"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Clock, Mail, Phone, Trash2, FolderKanban } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/shared/project-card";

interface Client {
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export default function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/clients-list/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setClient(d.client || null);
        setProjects(Array.isArray(d.projects) ? d.projects : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!client) return;
    if (!confirm(`Удалить клиента «${client.name}»? Привязки проектов будут отвязаны.`)) return;
    const res = await fetch(`/api/admin/clients-list/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/clients");
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
      </div>
    );
  }
  if (!client) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push("/admin/clients")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <p className="text-text-muted">Клиент не найден</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/admin/clients")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> К списку
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Удалить
        </button>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-green-500">{client.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">{client.name}</h1>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="font-mono">{client.client_id}</span>
            <span>·</span>
            <span>{new Date(client.created_at).toLocaleDateString("ru-RU")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Email
          </div>
          <div className="text-sm">{client.email}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
            <Phone className="w-3 h-3" /> Телефон
          </div>
          <div className="text-sm">{client.phone || "—"}</div>
        </div>
      </div>

      <div className="rounded-xl border border-border-faint bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold">Проекты клиента ({projects.length})</h3>
          </div>
        </div>
        {projects.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">
            Проектов нет. Привяжите клиента к проекту в карточке проекта.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                onClick={() => router.push(`/admin/projects/${p.project_id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
