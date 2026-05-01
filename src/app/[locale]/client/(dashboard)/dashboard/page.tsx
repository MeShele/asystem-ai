"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { FolderKanban, Clock, CheckCircle2, Wallet } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/shared/project-card";
import { ClientTelegramBind } from "@/components/shared/client-telegram-bind";

export default function ClientDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [client, setClient] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/me")
      .then((r) => {
        if (!r.ok) throw new Error("auth");
        return r.json();
      })
      .then((d) => setClient(d.client))
      .catch(() => {
        const locale = window.location.pathname.split("/")[1] || "ru";
        window.location.href = `/${locale}/client/login`;
      });

    fetch("/api/client/projects")
      .then((r) => r.json())
      .then((d) => {
        setProjects(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!client) return null;

  const totalValue = projects.reduce((s, p) => s + Number(p.total_price || 0), 0);
  const totalPaid = projects.reduce((s, p) => s + Number(p.paid_amount || 0), 0);
  const active = projects.filter((p) => p.status === "active" || p.status === "review").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <ClientTelegramBind />
      <motion.div
        className="mb-6 rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-500/[0.06] to-brand-700/[0.04] p-6 lg:p-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">
          Здравствуйте, {client.name}
        </h1>
        <p className="text-text-secondary text-sm">
          Здесь вы видите свои проекты, прогресс и можете оставлять комментарии команде
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-4 h-4 text-brand-500" />
            <span className="text-xs text-text-muted">Проектов</span>
          </div>
          <div className="text-2xl font-bold">{projects.length}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-text-muted">В работе</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{active}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs text-text-muted">Завершено</span>
          </div>
          <div className="text-2xl font-bold text-green-500">{completed}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-text-muted">Стоимость</span>
          </div>
          <div className="text-xl font-bold">${totalValue.toLocaleString("ru-RU")}</div>
          <div className="text-[10px] text-text-muted mt-0.5">оплачено ${totalPaid.toLocaleString("ru-RU")}</div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
          <p className="text-text-muted text-sm">Загрузка...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-border-faint bg-surface">
          <FolderKanban className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Проектов пока нет. Они появятся здесь, когда команда привяжет вас к проекту.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
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
