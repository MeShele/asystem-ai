"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search, FolderKanban, Clock } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/shared/project-card";

export default function ClientProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/client/projects")
      .then((r) => {
        if (!r.ok) throw new Error("auth");
        return r.json();
      })
      .then((d) => {
        setProjects(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        const locale = window.location.pathname.split("/")[1] || "ru";
        window.location.href = `/${locale}/client/login`;
      });
  }, []);

  const filtered = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.project_id?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Мои проекты</h1>
          <p className="text-text-secondary text-sm">Все проекты, привязанные к вам</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg focus:border-brand-500 outline-none w-56 lg:w-72"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-border-faint bg-surface">
          <FolderKanban className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {search ? "Ничего не найдено" : "Проектов пока нет"}
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
              onClick={() => router.push(`/client/projects/${p.project_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
