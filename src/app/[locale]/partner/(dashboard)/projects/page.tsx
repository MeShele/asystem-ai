"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search, FolderKanban, Clock } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/shared/project-card";

export default function PartnerProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/partner/projects")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  }, []);

  const filtered = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.project_id?.toLowerCase().includes(q);
  });

  const totalProjects = projects.length;
  const inProgress = projects.filter((p) => p.status === "active" || p.status === "review").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Проекты</h1>
          <p className="text-text-secondary text-sm">
            Проекты, привязанные к вам администратором
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-56 lg:w-72 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего", value: totalProjects, color: "text-brand-500" },
          { label: "В работе", value: inProgress, color: "text-orange-500" },
          { label: "Завершено", value: completed, color: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border-faint bg-surface">
            <div className="text-xs text-text-muted mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
          <p className="text-text-muted text-sm">Загрузка...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-border-faint bg-surface">
          <FolderKanban className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {search
              ? "Ничего не найдено"
              : "Проектов пока нет. Они появятся здесь, когда администратор привяжет их к вашему аккаунту."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              showPartner={false}
              onClick={() => router.push(`/partner/projects/${p.project_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
