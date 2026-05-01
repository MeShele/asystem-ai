"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, Users, DollarSign, TrendingUp, Copy, CheckCheck, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { LevelIcon } from "@/components/shared/level-icon";

interface SubPartner {
  partner_id: string;
  name: string;
  email: string;
  company: string | null;
  level: number;
  is_founding: boolean;
  last_activity_at: string | null;
  created_at: string;
  deals_count: number;
  revenue: number | string;
  earned: number | string;
  my_override: number | string;
  level_meta: { title: string; base_pct: number };
}

interface OverrideRow {
  id: number;
  project_id: string;
  project_name: string | null;
  sub_partner_id: string;
  sub_partner_name: string | null;
  sub_commission_amount: number | string;
  override_pct: number;
  override_amount: number | string;
  sub_level: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
}

interface NetworkData {
  subPartners: SubPartner[];
  overrides: OverrideRow[];
  totals: { paid: number; pending: number; total: number };
  counts: { total: number; active: number };
  monthly: { month: string; amount: number | string }[];
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

function isActive(s: SubPartner): boolean {
  if (!s.last_activity_at) return false;
  const days = (Date.now() - new Date(s.last_activity_at).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 90 && s.deals_count > 0;
}

export default function PartnerNetworkPage() {
  const router = useRouter();
  const [data, setData] = useState<NetworkData | null>(null);
  const [refLink, setRefLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/network")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
    fetch("/api/partner/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.partner?.ref_code) {
          const locale = window.location.pathname.split("/")[1] || "ru";
          setRefLink(`${window.location.origin}/${locale}/partner/register?ref=${d.partner.ref_code}`);
        }
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const copy = async () => {
    if (!refLink) return;
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-5 h-5 text-purple-500" />
          <h1 className="text-2xl font-bold tracking-tight">Мои партнёры</h1>
        </div>
        <p className="text-sm text-text-muted">
          Партнёры приглашённые по твоей реф-ссылке. Ты получаешь менторскую комиссию с их сделок.
        </p>
      </motion.div>

      {/* Реф-ссылка */}
      <motion.div
        className="rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-500/[0.05] via-surface to-surface p-5 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-purple-500" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight mb-0.5">Поделись реф-ссылкой</h3>
            <p className="text-xs text-text-muted">
              Любой кто зарегистрируется по ней станет твоим sub-partner. Ты получаешь % с его комиссий — всю жизнь, пока он активен.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={refLink}
            readOnly
            className="min-w-0 flex-1 px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg font-mono text-text-secondary truncate"
          />
          <button
            onClick={copy}
            className="shrink-0 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Скопировано" : "Копировать"}
          </button>
        </div>
      </motion.div>

      {/* KPI */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Kpi label="Партнёров" value={String(data.counts.total)} icon={Users} tone="purple" />
        <Kpi label="Активных" value={`${data.counts.active}/${data.counts.total}`} icon={TrendingUp} tone="green" hint="за 90 дней" />
        <Kpi label="Override (выплачено)" value={`$${data.totals.paid.toLocaleString("ru-RU")}`} icon={DollarSign} tone="green" big />
        <Kpi label="Override (ожидается)" value={`$${data.totals.pending.toLocaleString("ru-RU")}`} icon={DollarSign} tone="amber" hint="будет выплачено" />
      </motion.div>

      {/* Краткое объяснение со ссылкой на базу знаний */}
      <motion.button
        onClick={() => router.push("/partner/knowledge")}
        className="group w-full text-left rounded-xl border border-border-faint bg-surface hover:border-purple-500/40 hover:bg-purple-500/[0.03] p-4 mb-5 transition-all flex items-center gap-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <Network className="w-4 h-4 text-purple-500" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold mb-0.5">3-8% от комиссии каждого партнёра</div>
          <p className="text-[11px] text-text-muted leading-snug">
            Студия доплачивает тебе сверху. Sub-partner ничего не теряет. Подробно с примерами — в Базе знаний.
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </motion.button>

      {/* Список sub-партнёров */}
      <section className="mb-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted mb-3">Приглашённые партнёры</h3>
        {data.subPartners.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border-faint text-center">
            <Users className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-text-muted">
              Пока нет sub-партнёров. Поделись реф-ссылкой выше — приглашай тех кто хочет работать в IT-партнёрстве.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.subPartners.map((sub, i) => (
              <SubPartnerCard key={sub.partner_id} sub={sub} delay={i * 0.03} />
            ))}
          </div>
        )}
      </section>

      {/* История override */}
      {data.overrides.length > 0 && (
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted mb-3">История начислений</h3>
          <div className="space-y-2">
            {data.overrides.map((o, i) => (
              <OverrideRow key={o.id} row={o} delay={i * 0.02} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
  hint,
  big = false,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  tone: "purple" | "green" | "amber";
  hint?: string;
  big?: boolean;
}) {
  const toneText: Record<string, string> = {
    purple: "text-purple-500",
    green: "text-green-500",
    amber: "text-amber-500",
  };
  const toneBg: Record<string, string> = {
    purple: "bg-purple-500/10",
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
  };

  return (
    <div className="p-4 rounded-xl border border-border-faint bg-surface">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wide text-text-muted truncate">{label}</div>
        <div className={`w-7 h-7 rounded-lg ${toneBg[tone]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${toneText[tone]}`} strokeWidth={2.2} />
        </div>
      </div>
      <div className={`font-bold font-mono tabular-nums ${big ? "text-2xl" : "text-xl"} ${tone === "green" ? toneText[tone] : "text-text-primary"}`}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

function SubPartnerCard({ sub, delay }: { sub: SubPartner; delay: number }) {
  const active = isActive(sub);
  const myOverride = Number(sub.my_override || 0);
  const subEarned = Number(sub.earned || 0);
  const subRevenue = Number(sub.revenue || 0);

  return (
    <motion.div
      className="p-4 rounded-xl border border-border-faint bg-surface"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <div className="flex items-start gap-3 mb-3">
        <LevelIcon level={sub.level} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold truncate">{sub.name}</span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-medium">
              L{sub.level}
            </span>
            {sub.is_founding && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                founding
              </span>
            )}
            {active ? (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                <span className="w-1 h-1 rounded-full bg-green-500 live-pulse" />
                активен
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-bg-secondary text-text-muted font-medium">
                спит
              </span>
            )}
          </div>
          <div className="text-[11px] text-text-muted">
            {sub.email}
            {sub.company && <span> · {sub.company}</span>}
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">С {fmtDate(sub.created_at)}</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Мой override</div>
          <div className="text-base font-bold text-purple-500 font-mono tabular-nums">
            ${myOverride.toLocaleString("ru-RU")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-faint text-xs">
        <div>
          <div className="text-text-muted text-[10px] uppercase tracking-wider">Сделок</div>
          <div className="font-semibold font-mono">{sub.deals_count}</div>
        </div>
        <div>
          <div className="text-text-muted text-[10px] uppercase tracking-wider">Выручка</div>
          <div className="font-semibold font-mono tabular-nums">${subRevenue.toLocaleString("ru-RU")}</div>
        </div>
        <div>
          <div className="text-text-muted text-[10px] uppercase tracking-wider">Заработал</div>
          <div className="font-semibold font-mono tabular-nums text-green-600">${subEarned.toLocaleString("ru-RU")}</div>
        </div>
      </div>
    </motion.div>
  );
}

function OverrideRow({ row, delay }: { row: OverrideRow; delay: number }) {
  const amt = Number(row.override_amount || 0);
  const isPending = row.status === "pending";

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-lg border border-border-faint bg-surface"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isPending ? "bg-amber-500/10" : "bg-green-500/10"
      }`}>
        <DollarSign className={`w-4 h-4 ${isPending ? "text-amber-500" : "text-green-500"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {row.project_name || row.project_id} · {row.sub_partner_name}
        </div>
        <div className="text-[11px] text-text-muted">
          {row.override_pct}% от ${Number(row.sub_commission_amount).toLocaleString("ru-RU")} · L{row.sub_level} · {fmtDate(row.created_at)}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`font-mono font-bold text-sm tabular-nums ${isPending ? "text-amber-600" : "text-green-600"}`}>
          +${amt.toLocaleString("ru-RU")}
        </div>
        <div className="text-[10px] text-text-muted">{isPending ? "ожидает" : "выплачено"}</div>
      </div>
    </motion.div>
  );
}
