"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Phone,
  Building2,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Filter,
  ChevronDown,
} from "lucide-react";

interface Lead {
  request_id: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  services: string[] | null;
  budget: string | null;
  timeline: string | null;
  description: string | null;
  ref_code: string | null;
  status: string | null;
  lead_status: "new" | "contacted" | "qualified" | "won" | "lost" | null;
  partner_note: string | null;
  created_at: string;
}

interface Counts {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  won: number;
  lost: number;
}

const BUDGET_LABEL: Record<string, string> = {
  range1: "до 30 000 сом",
  range2: "30 000 – 100 000 сом",
  range3: "100 000 – 500 000 сом",
  range4: "500 000+ сом",
};
const TIMELINE_LABEL: Record<string, string> = {
  asap: "Срочно",
  weeks: "1–2 недели",
  month: "Месяц",
  noRush: "Не срочно",
};

const STATUS_META: Record<string, { label: string; tone: string; bg: string; ring: string }> = {
  new: { label: "Новая", tone: "text-blue-600", bg: "bg-blue-500/10", ring: "ring-blue-500/30" },
  contacted: { label: "Связались", tone: "text-amber-600", bg: "bg-amber-500/10", ring: "ring-amber-500/30" },
  qualified: { label: "Готова к сделке", tone: "text-purple-600", bg: "bg-purple-500/10", ring: "ring-purple-500/30" },
  won: { label: "Закрыта", tone: "text-green-600", bg: "bg-green-500/10", ring: "ring-green-500/30" },
  lost: { label: "Потеряна", tone: "text-red-600", bg: "bg-red-500/10", ring: "ring-red-500/30" },
};

export default function PartnerLeadsPage() {
  const [data, setData] = useState<{ items: Lead[]; counts: Counts } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Lead["lead_status"]>("all");

  const load = async () => {
    const res = await fetch("/api/partner/leads");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data.items;
    return data.items.filter((l) => (l.lead_status || "new") === filter);
  }, [data, filter]);

  if (loading || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
        <div className="h-32 flex items-center justify-center text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const c = data.counts;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Inbox className="w-5 h-5 text-brand-500" />
          <h1 className="text-2xl font-bold tracking-tight">Лиды</h1>
        </div>
        <p className="text-sm text-text-muted">Заявки которые админ назначил на вас. Свяжитесь с клиентом и обновите статус.</p>
      </motion.div>

      {/* KPI */}
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <Kpi label="Всего" value={c.total} tone="default" />
        <Kpi label="Новые" value={c.new} tone="blue" />
        <Kpi label="Связались" value={c.contacted} tone="amber" />
        <Kpi label="Закрыто" value={c.won} tone="green" />
        <Kpi label="Потеряно" value={c.lost} tone="red" />
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="Все" count={c.total} />
        <FilterChip active={filter === "new"} onClick={() => setFilter("new")} label="Новые" count={c.new} tone="blue" />
        <FilterChip active={filter === "contacted"} onClick={() => setFilter("contacted")} label="Связались" count={c.contacted} tone="amber" />
        <FilterChip active={filter === "qualified"} onClick={() => setFilter("qualified")} label="Готовы" count={c.qualified} tone="purple" />
        <FilterChip active={filter === "won"} onClick={() => setFilter("won")} label="Закрыто" count={c.won} tone="green" />
        <FilterChip active={filter === "lost"} onClick={() => setFilter("lost")} label="Потеряно" count={c.lost} tone="red" />
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-border-faint text-center">
          <Inbox className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">
            {data.items.length === 0
              ? "Пока нет назначенных заявок. Когда админ передаст лид — он появится здесь."
              : "В этой категории пусто."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l, i) => (
            <LeadCard key={l.request_id} lead={l} delay={i * 0.02} onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: "default" | "blue" | "amber" | "green" | "red" }) {
  const colors: Record<string, string> = {
    default: "text-text-primary",
    blue: "text-blue-600",
    amber: "text-amber-600",
    green: "text-green-600",
    red: "text-red-600",
  };
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-3">
      <div className={`text-xl font-bold font-mono tabular-nums ${colors[tone]}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-text-muted mt-0.5 leading-tight truncate">{label}</div>
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
  tone?: string;
}) {
  const toneCls: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    green: "bg-green-500/10 text-green-600 border-green-500/30",
    red: "bg-red-500/10 text-red-600 border-red-500/30",
  };
  const activeCls = active
    ? tone
      ? toneCls[tone]
      : "bg-brand-500 text-white border-brand-500"
    : "bg-surface text-text-secondary border-border-faint hover:bg-bg-secondary";
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${activeCls}`}
    >
      {label}
      <span className={`text-[10px] font-mono ${active && !tone ? "opacity-80" : "opacity-60"}`}>{count}</span>
    </button>
  );
}

function LeadCard({ lead, delay, onUpdated }: { lead: Lead; delay: number; onUpdated: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(lead.partner_note || "");
  const [saving, setSaving] = useState(false);
  const status = (lead.lead_status || "new") as keyof typeof STATUS_META;
  const meta = STATUS_META[status];

  const setStatus = async (s: Lead["lead_status"]) => {
    setSaving(true);
    await fetch(`/api/partner/leads/${lead.request_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_status: s }),
    });
    setSaving(false);
    onUpdated();
  };

  const saveNote = async () => {
    setSaving(true);
    await fetch(`/api/partner/leads/${lead.request_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner_note: note }),
    });
    setSaving(false);
  };

  const ageMs = Date.now() - new Date(lead.created_at).getTime();
  const ageH = Math.floor(ageMs / 3600000);
  const ageStr = ageH < 1 ? "только что" : ageH < 24 ? `${ageH}ч назад` : `${Math.floor(ageH / 24)}д назад`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl border bg-surface ${open ? `${meta.ring} ring-1` : "border-border-faint"} transition-all`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
          <Inbox className={`w-5 h-5 ${meta.tone}`} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold truncate">{lead.name || "Без имени"}</span>
            <span className="text-[10px] font-mono text-text-muted shrink-0">{lead.request_id}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${meta.bg} ${meta.tone}`}>
              {meta.label}
            </span>
            {lead.budget && BUDGET_LABEL[lead.budget] && (
              <span className="text-[10px] text-text-muted truncate">{BUDGET_LABEL[lead.budget]}</span>
            )}
            <span className="text-[10px] text-text-muted ml-auto">{ageStr}</span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 mt-2 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border-faint">
              {/* Контакт */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-500/[0.06] text-brand-600 text-sm font-semibold border border-brand-500/20"
                  >
                    <PhoneCall className="w-4 h-4" /> {lead.phone}
                  </a>
                )}
                {lead.company && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-secondary text-text-secondary text-sm">
                    <Building2 className="w-4 h-4" /> {lead.company}
                  </div>
                )}
              </div>

              {/* Бюджет / срок / услуги */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {lead.budget && (
                  <Field icon={DollarSign} label="Бюджет" value={BUDGET_LABEL[lead.budget] || lead.budget} />
                )}
                {lead.timeline && (
                  <Field icon={Clock} label="Срок" value={TIMELINE_LABEL[lead.timeline] || lead.timeline} />
                )}
              </div>
              {lead.services && lead.services.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {lead.services.map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-secondary text-text-secondary">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {lead.description && (
                <div className="rounded-lg bg-bg-secondary p-3 text-sm leading-relaxed text-text-secondary">
                  {lead.description}
                </div>
              )}

              {/* Note */}
              <div>
                <div className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Ваша заметка</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={saveNote}
                  placeholder="Что обсудили, какие договорённости..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {(["new", "contacted", "qualified", "won", "lost"] as const).map((s) => {
                  const m = STATUS_META[s];
                  const isActive = status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      disabled={saving}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        isActive ? `${m.bg} ${m.tone} ring-1 ${m.ring}` : "bg-surface text-text-secondary border-border-faint hover:bg-bg-secondary"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-text-muted leading-tight">{label}</div>
        <div className="text-text-primary truncate">{value}</div>
      </div>
    </div>
  );
}
