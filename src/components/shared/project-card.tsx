"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FolderKanban, Building2 } from "lucide-react";

export interface ProjectCardData {
  id: number;
  project_id: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  total_price?: number | string | null;
  paid_amount?: number | string | null;
  partner_id?: string | null;
  partner_name?: string | null;
  partner_company?: string | null;
  partner_commission_percent?: number | null;
  progress_percent?: number | null;
  status?: string | null;
}

const statusMeta: Record<string, { label: string; color: string }> = {
  planning: { label: "Планирование", color: "bg-blue-500/10 text-blue-400" },
  active: { label: "В работе", color: "bg-brand-500/10 text-brand-500" },
  review: { label: "На проверке", color: "bg-orange-500/10 text-orange-500" },
  completed: { label: "Завершён", color: "bg-green-500/10 text-green-500" },
  paused: { label: "На паузе", color: "bg-yellow-500/10 text-yellow-500" },
  cancelled: { label: "Отменён", color: "bg-red-500/10 text-red-500" },
};

function fmt(value: number | string | null | undefined) {
  const n = Number(value || 0);
  return n.toLocaleString("ru-RU");
}

interface Props {
  project: ProjectCardData;
  onClick?: () => void;
  showPartner?: boolean;
  showPartnerCommission?: boolean;
  index?: number;
}

export function ProjectCard({
  project,
  onClick,
  showPartner = true,
  showPartnerCommission = false,
  index = 0,
}: Props) {
  const total = Number(project.total_price || 0);
  const paid = Number(project.paid_amount || 0);
  const progress = Math.max(0, Math.min(100, Number(project.progress_percent || 0)));
  const commissionPct = Number(project.partner_commission_percent || 0);
  const commissionAmount = Math.round((total * commissionPct) / 100);
  const status = statusMeta[project.status || "planning"] || statusMeta.planning;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onClick}
      className="group rounded-2xl border border-border-faint bg-surface hover:bg-surface-raised hover:border-brand-500/30 transition-all cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Top: logo + status */}
      <div className="p-5 pb-4 border-b border-border-faint/60">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {project.logo_url ? (
              <Image
                src={project.logo_url}
                alt={project.name}
                width={56}
                height={56}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <FolderKanban className="w-6 h-6 text-text-muted" />
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <h3 className="text-base font-semibold text-text-primary mb-1 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs text-text-muted line-clamp-2 min-h-[2rem]">
          {project.description || "—"}
        </p>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 border-b border-border-faint/60 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Стоимость</div>
          <div className="text-sm font-semibold text-text-primary">${fmt(total)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Оплачено</div>
          <div className="text-sm font-semibold text-green-500">${fmt(paid)}</div>
        </div>
      </div>

      {/* Partner */}
      {showPartner && (
        <div className="px-5 py-3 border-b border-border-faint/60 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <span className="text-xs text-text-secondary truncate">
            {project.partner_name
              ? `${project.partner_name}${project.partner_company ? ` · ${project.partner_company}` : ""}`
              : "Без партнёра"}
          </span>
        </div>
      )}

      {/* Partner commission (для партнёрской панели) */}
      {showPartnerCommission && (
        <div className="px-5 py-3 border-b border-border-faint/60 bg-green-500/5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">
              Ваше вознаграждение
            </div>
            <span className="text-[10px] font-mono text-green-500/80">{commissionPct}%</span>
          </div>
          <div className="text-base font-semibold text-green-500 mt-0.5">
            ${commissionAmount.toLocaleString("ru-RU")}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="px-5 py-4 mt-auto">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-text-muted">Прогресс</span>
          <span className="font-mono font-semibold text-text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
