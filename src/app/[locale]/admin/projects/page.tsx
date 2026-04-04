"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import {
  Search,
  FolderKanban,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface Project {
  id: number;
  request_id: string;
  client_name: string;
  partner_id: string;
  partner_name: string;
  project_type: string;
  status: string;
  kp_status: string | null;
  kp_content: string | null;
  base_price: number | null;
  partner_price: number | null;
  commission: number | null;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/10 text-blue-500" },
  discussing: { label: "Обсуждение", color: "bg-yellow-500/10 text-yellow-500" },
  in_progress: { label: "В работе", color: "bg-purple-500/10 text-purple-500" },
  review: { label: "На проверке", color: "bg-orange-500/10 text-orange-500" },
  completed: { label: "Завершён", color: "bg-green-500/10 text-green-500" },
  cancelled: { label: "Отменён", color: "bg-red-500/10 text-red-500" },
};

const kpStatusConfig: Record<string, { label: string; color: string; pulse?: boolean }> = {
  none: { label: "—", color: "bg-gray-500/10 text-gray-400" },
  draft: { label: "Черновик", color: "bg-blue-500/10 text-blue-400" },
  submitted: { label: "На проверке", color: "bg-orange-500/10 text-orange-400", pulse: true },
  approved: { label: "Одобрено", color: "bg-green-500/10 text-green-500" },
  rejected: { label: "Отклонено", color: "bg-red-500/10 text-red-500" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  }, []);

  const filtered = projects.filter(
    (p) =>
      !search ||
      p.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.request_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.partner_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalProjects = projects.length;
  const pendingKp = projects.filter((p) => p.kp_status === "submitted").length;
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "discussing" || p.status === "review"
  ).length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Проекты</h1>
          <p className="text-text-secondary text-sm">
            Управление проектами партнёров
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по клиенту, ID, партнёру..."
            className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-56 lg:w-72 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего проектов", value: totalProjects, color: "text-brand-500", icon: FolderKanban },
          { label: "КП на проверке", value: pendingKp, color: "text-orange-500", icon: FileText },
          { label: "Активных", value: activeProjects, color: "text-green-500", icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border-faint bg-surface">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-text-muted">{s.label}</span>
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-faint bg-surface overflow-hidden">
        {/* Table header */}
        <div className="hidden lg:grid grid-cols-[100px_1fr_1fr_100px_110px_110px_90px_90px] gap-2 px-4 py-2.5 border-b border-border-faint text-[11px] font-medium text-text-muted uppercase tracking-wider">
          <span>ID</span>
          <span>Клиент</span>
          <span>Партнёр</span>
          <span>Тип</span>
          <span>Статус</span>
          <span>КП</span>
          <span>Комиссия</span>
          <span>Дата</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
            <p className="text-text-muted text-sm">Загрузка...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted text-sm">
              {search ? "Ничего не найдено" : "Проектов пока нет"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-faint">
            {filtered.map((project, i) => {
              const status = statusLabels[project.status] || statusLabels.new;
              const kpKey = project.kp_status || "none";
              const kp = kpStatusConfig[kpKey] || kpStatusConfig.none;

              return (
                <motion.div
                  key={project.id}
                  className="grid grid-cols-1 lg:grid-cols-[100px_1fr_1fr_100px_110px_110px_90px_90px] gap-2 px-4 py-3 hover:bg-surface-raised transition-colors cursor-pointer items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => router.push(`/admin/projects/${project.id}`)}
                >
                  {/* Request ID */}
                  <span className="font-mono text-xs text-text-secondary truncate">
                    {project.request_id || `#${project.id}`}
                  </span>

                  {/* Client */}
                  <span className="text-sm font-medium text-text-primary truncate">
                    {project.client_name || "—"}
                  </span>

                  {/* Partner */}
                  <span className="text-sm text-text-secondary truncate">
                    {project.partner_name || "—"}
                  </span>

                  {/* Type */}
                  <span className="text-xs text-text-muted truncate">
                    {project.project_type || "—"}
                  </span>

                  {/* Status */}
                  <span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </span>

                  {/* KP Status */}
                  <span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${kp.color} ${
                        kp.pulse ? "animate-pulse" : ""
                      }`}
                    >
                      {kp.label}
                    </span>
                  </span>

                  {/* Commission */}
                  <span className="text-xs font-mono text-text-secondary">
                    {project.commission != null ? `$${Number(project.commission).toLocaleString()}` : "—"}
                  </span>

                  {/* Date */}
                  <span className="text-xs text-text-muted">
                    {new Date(project.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
