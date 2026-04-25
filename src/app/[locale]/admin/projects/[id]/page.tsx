"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Trash2, Clock, Building2, FolderKanban } from "lucide-react";
import Image from "next/image";

interface ProjectDetail {
  id: number;
  project_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  total_price: number | string;
  paid_amount: number | string;
  partner_id: string | null;
  partner_name?: string | null;
  partner_company?: string | null;
  progress_percent: number;
  status: string;
  developers?: unknown;
  created_at: string;
}

interface Stage {
  id: number;
  project_id: string;
  order_index: number;
  title: string;
  percent: number;
  comment: string | null;
  completed: boolean;
}

const statusOptions = [
  { value: "planning", label: "Планирование" },
  { value: "active", label: "В работе" },
  { value: "review", label: "На проверке" },
  { value: "completed", label: "Завершён" },
  { value: "paused", label: "На паузе" },
  { value: "cancelled", label: "Отменён" },
];

export default function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data.project || null);
        setStages(Array.isArray(data.stages) ? data.stages : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Удалить проект? Это действие нельзя отменить.")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/projects");
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
        <p className="text-text-muted text-sm">Загрузка...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push("/admin/projects")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <p className="text-text-muted">Проект не найден</p>
      </div>
    );
  }

  const total = Number(project.total_price || 0);
  const paid = Number(project.paid_amount || 0);

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <button
        onClick={() => router.push("/admin/projects")}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> К списку проектов
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {project.logo_url ? (
              <Image src={project.logo_url} alt={project.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
            ) : (
              <FolderKanban className="w-7 h-7 text-text-muted" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className="font-mono text-xs text-text-muted">{project.project_id}</span>
            </div>
            <p className="text-text-secondary text-sm max-w-xl">
              {project.description || "Описание не указано"}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Удалить
        </button>
      </div>

      {/* Top row: stats + partner + status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1">Стоимость</div>
          <div className="text-xl font-semibold">${total.toLocaleString("ru-RU")}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1">Оплачено</div>
          <div className="text-xl font-semibold text-green-500">${paid.toLocaleString("ru-RU")}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Партнёр
          </div>
          <div className="text-sm font-medium truncate">
            {project.partner_name || "Без партнёра"}
          </div>
          {project.partner_company && (
            <div className="text-xs text-text-muted truncate">{project.partner_company}</div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="p-5 rounded-xl border border-border-faint bg-surface mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Общий прогресс</h3>
          <span className="font-mono text-lg font-bold text-brand-500">
            {project.progress_percent}%
          </span>
        </div>
        <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${project.progress_percent}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-3">
          Управление этапами и редактирование процента — в Фазе 2.
        </p>
      </div>

      {/* Stages */}
      <div className="rounded-xl border border-border-faint bg-surface overflow-hidden mb-6">
        <div className="p-5 border-b border-border-faint">
          <h3 className="text-sm font-semibold">Этапы проекта</h3>
        </div>
        {stages.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            Этапов пока нет
          </div>
        ) : (
          <div className="divide-y divide-border-faint">
            {stages.map((s) => (
              <div key={s.id} className="p-4 flex items-center gap-3">
                <div className="font-mono text-xs text-text-muted w-6">{s.order_index + 1}.</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.title}</div>
                  {s.comment && <div className="text-xs text-text-muted mt-0.5">{s.comment}</div>}
                </div>
                <span className="font-mono text-xs text-text-secondary">{s.percent}%</span>
                {s.completed && (
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px]">
                    Готово
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="p-5 rounded-xl border border-border-faint bg-surface">
        <div className="text-xs text-text-muted mb-1">Текущий статус</div>
        <div className="text-sm font-medium">
          {statusOptions.find((s) => s.value === project.status)?.label || project.status}
        </div>
      </div>
    </div>
  );
}
