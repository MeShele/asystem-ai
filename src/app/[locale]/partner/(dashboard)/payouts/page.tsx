"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import {
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  DollarSign,
  Award,
  Briefcase,
  Inbox,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MilestoneIcon } from "@/components/shared/level-icon";

interface PayoutRow {
  id: number;
  kind: "commission" | "milestone";
  amount: number | string;
  status: "paid" | "requested" | "rejected";
  paid_at: string | null;
  requested_at: string | null;
  created_at?: string | null;
  comment: string | null;
  rejection_comment: string | null;
  project_id?: string | null;
  project_name?: string | null;
  milestone_key?: string;
  threshold?: number | string;
}

interface ApiData {
  totals: { paid: number; requested: number; rejected: number };
  commissions: PayoutRow[];
  milestones: PayoutRow[];
}

const STATUS_META: Record<
  string,
  { label: string; icon: LucideIcon; tone: string; bg: string; border: string }
> = {
  paid: {
    label: "Выплачено",
    icon: CheckCircle2,
    tone: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  requested: {
    label: "На рассмотрении",
    icon: Clock,
    tone: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  rejected: {
    label: "Отклонено",
    icon: XCircle,
    tone: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

const MILESTONE_TITLES: Record<string, string> = {
  "5k": "Первая пятёрка",
  "10k": "Десятка",
  "20k": "Двадцатка",
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function PartnerPayoutsPage() {
  const router = useRouter();
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "requested" | "rejected">("all");

  useEffect(() => {
    fetch("/api/partner/payouts")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const all: PayoutRow[] = [...data.commissions, ...data.milestones].sort((a, b) => {
    const aDate = new Date(a.paid_at || a.requested_at || a.created_at || 0).getTime();
    const bDate = new Date(b.paid_at || b.requested_at || b.created_at || 0).getTime();
    return bDate - aDate;
  });

  const filtered = filter === "all" ? all : all.filter((r) => r.status === filter);
  const counts = {
    all: all.length,
    paid: all.filter((r) => r.status === "paid").length,
    requested: all.filter((r) => r.status === "requested").length,
    rejected: all.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-5 h-5 text-green-500" />
          <h1 className="text-2xl font-bold tracking-tight">Выплаты</h1>
        </div>
        <p className="text-sm text-text-muted">История всех ваших выплат — комиссии и мини-награды</p>
      </motion.div>

      {/* 3 KPI: paid / requested / rejected */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <KpiCard
          label="Выплачено всего"
          value={`$${data.totals.paid.toLocaleString("ru-RU")}`}
          icon={DollarSign}
          tone="green"
          big
        />
        <KpiCard
          label="В обработке"
          value={`$${data.totals.requested.toLocaleString("ru-RU")}`}
          icon={Clock}
          tone="orange"
          subtitle={`${counts.requested} запрос${counts.requested === 1 ? "" : counts.requested < 5 ? "а" : "ов"}`}
        />
        <KpiCard
          label="Отклонено"
          value={`$${data.totals.rejected.toLocaleString("ru-RU")}`}
          icon={XCircle}
          tone="red"
          subtitle={counts.rejected > 0 ? "проверьте комментарий" : "нет отклонённых"}
        />
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="Все" count={counts.all} />
        <FilterChip
          active={filter === "paid"}
          onClick={() => setFilter("paid")}
          label="Выплачено"
          count={counts.paid}
          tone="green"
        />
        <FilterChip
          active={filter === "requested"}
          onClick={() => setFilter("requested")}
          label="На рассмотрении"
          count={counts.requested}
          tone="orange"
        />
        <FilterChip
          active={filter === "rejected"}
          onClick={() => setFilter("rejected")}
          label="Отклонено"
          count={counts.rejected}
          tone="red"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-border-faint text-center">
          <Inbox className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">
            {filter === "all"
              ? "У вас пока нет выплат. Когда админ подтвердит первую — она появится здесь."
              : "В этой категории пусто."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, i) => (
            <PayoutRowCard key={`${r.kind}-${r.id}`} row={r} delay={i * 0.02} onProjectClick={(pid) => router.push(`/partner/projects/${pid}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  subtitle,
  big = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "green" | "orange" | "red";
  subtitle?: string;
  big?: boolean;
}) {
  const toneText: Record<string, string> = {
    green: "text-green-500",
    orange: "text-orange-500",
    red: "text-red-500",
  };
  const toneBg: Record<string, string> = {
    green: "bg-green-500/10",
    orange: "bg-orange-500/10",
    red: "bg-red-500/10",
  };

  return (
    <div className="p-4 rounded-xl border border-border-faint bg-surface">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wide text-text-muted truncate">{label}</div>
        <div className={`w-7 h-7 rounded-lg ${toneBg[tone]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${toneText[tone]}`} strokeWidth={2.2} />
        </div>
      </div>
      <div
        className={`font-bold font-mono tabular-nums ${big ? "text-2xl" : "text-xl"} ${
          tone === "green" ? toneText[tone] : "text-text-primary"
        }`}
      >
        {value}
      </div>
      {subtitle && <div className="text-[10px] text-text-muted mt-0.5">{subtitle}</div>}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "green" | "orange" | "red";
}) {
  const toneText: Record<string, string> = {
    green: "text-green-500",
    orange: "text-orange-500",
    red: "text-red-500",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all whitespace-nowrap ${
        active
          ? "border-brand-500 bg-brand-500/[0.06] text-text-primary font-semibold"
          : "border-border-faint bg-surface text-text-secondary hover:bg-bg-secondary/30 hover:text-text-primary"
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
          active ? "bg-brand-500 text-white" : tone ? `bg-bg-secondary ${toneText[tone]}` : "bg-bg-secondary text-text-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function PayoutRowCard({
  row,
  delay,
  onProjectClick,
}: {
  row: PayoutRow;
  delay: number;
  onProjectClick: (pid: string) => void;
}) {
  const status = STATUS_META[row.status] || STATUS_META.requested;
  const StatusIcon = status.icon;
  const amount = Number(row.amount || 0);

  const dateLabel =
    row.status === "paid" && row.paid_at
      ? `Выплачено ${fmtDate(row.paid_at)}`
      : row.requested_at
      ? `Запрошено ${fmtDate(row.requested_at)}`
      : fmtDate(row.created_at);

  return (
    <motion.div
      className="flex items-center gap-3 p-4 rounded-xl border border-border-faint bg-surface hover:bg-bg-secondary/30 transition-colors"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      {/* Иконка типа */}
      <div className="flex-shrink-0">
        {row.kind === "milestone" ? (
          <MilestoneIcon
            kind={(row.milestone_key as "5k" | "10k" | "20k") || "5k"}
            size="md"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-brand-500" strokeWidth={2.2} />
          </div>
        )}
      </div>

      {/* Текст */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold truncate">
            {row.kind === "milestone"
              ? `Награда «${MILESTONE_TITLES[row.milestone_key || ""] || row.milestone_key}»`
              : row.project_name || row.project_id || "Комиссия"}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-text-muted px-1.5 py-0.5 rounded-full bg-bg-secondary whitespace-nowrap">
            {row.kind === "milestone" ? "награда" : "комиссия"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <span>{dateLabel}</span>
          {row.kind === "commission" && row.project_id && (
            <button
              onClick={() => row.project_id && onProjectClick(row.project_id)}
              className="text-brand-500 hover:text-brand-600 inline-flex items-center gap-0.5 font-mono text-[10px]"
            >
              {row.project_id} <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
        {row.status === "rejected" && row.rejection_comment && (
          <p className="mt-1.5 text-[11px] text-red-500/80 leading-snug">
            <span className="font-semibold">Отклонено: </span>
            {row.rejection_comment}
          </p>
        )}
        {row.status === "paid" && row.comment && (
          <p className="mt-1.5 text-[11px] text-text-muted leading-snug truncate">{row.comment}</p>
        )}
      </div>

      {/* Сумма + статус */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="font-mono font-bold text-base tabular-nums">
          ${amount.toLocaleString("ru-RU")}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.tone}`}
        >
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>
    </motion.div>
  );
}
