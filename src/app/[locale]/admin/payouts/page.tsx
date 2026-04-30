"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Wallet, Trophy, Check, Clock, FolderKanban, Calendar, X, Ban, Network } from "lucide-react";

interface Payout {
  id: number;
  project_id: string;
  partner_id: string;
  amount: number | string;
  status: "requested" | "paid" | "rejected";
  requested_at: string | null;
  paid_at: string;
  comment: string | null;
  rejection_comment: string | null;
  partner_name?: string;
  project_name?: string;
}

interface MilestoneClaim {
  id: number;
  partner_id: string;
  milestone_key: string;
  threshold: number | string;
  amount: number | string;
  status: "requested" | "paid" | "rejected";
  requested_at: string | null;
  paid_at: string | null;
  rejection_comment: string | null;
  partner_name?: string;
}

type RejectTarget = { kind: "payout" | "milestone"; id: number; amount: number; partnerName?: string };

interface OverrideRow {
  id: number;
  referrer_partner_id: string;
  referrer_name: string | null;
  sub_partner_id: string;
  sub_partner_name: string | null;
  project_id: string;
  project_name: string | null;
  sub_commission_amount: number | string;
  override_pct: number;
  override_amount: number | string;
  sub_level: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [milestones, setMilestones] = useState<MilestoneClaim[]>([]);
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "paid" | "rejected" | "all">("pending");
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [payingOverride, setPayingOverride] = useState<number | null>(null);

  const load = () => {
    Promise.all([
      fetch("/api/admin/payouts").then((r) => r.json()),
      fetch("/api/admin/overrides").then((r) => (r.ok ? r.json() : { items: [] })),
    ])
      .then(([d, ov]) => {
        setPayouts(Array.isArray(d.payouts) ? d.payouts : []);
        setMilestones(Array.isArray(d.milestones) ? d.milestones : []);
        setOverrides(Array.isArray(ov.items) ? ov.items : []);
      })
      .finally(() => setLoading(false));
  };

  const payOverride = async (id: number) => {
    if (!confirm("Отметить override как выплачено? Партнёр получит уведомление.")) return;
    setPayingOverride(id);
    try {
      const res = await fetch(`/api/admin/overrides/${id}/pay`, { method: "POST" });
      if (res.ok) load();
      else alert((await res.json().catch(() => ({}))).error || "Ошибка");
    } finally {
      setPayingOverride(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approvePayout = async (id: number) => {
    await fetch(`/api/admin/payouts/${id}/approve`, { method: "POST" });
    load();
  };
  const approveMilestone = async (id: number) => {
    await fetch(`/api/admin/milestones/${id}/approve`, { method: "POST" });
    load();
  };
  const rejectConfirm = async (comment: string) => {
    if (!rejectTarget) return;
    const url = rejectTarget.kind === "payout"
      ? `/api/admin/payouts/${rejectTarget.id}/reject`
      : `/api/admin/milestones/${rejectTarget.id}/reject`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    if (res.ok) {
      setRejectTarget(null);
      load();
    } else {
      alert((await res.json().catch(() => ({}))).error || "Ошибка");
    }
  };

  const matchFilter = (status: string) => {
    if (filter === "all") return true;
    if (filter === "pending") return status === "requested";
    if (filter === "paid") return status === "paid";
    if (filter === "rejected") return status === "rejected";
    return true;
  };
  const filteredPayouts = payouts.filter((p) => matchFilter(p.status));
  const filteredMilestones = milestones.filter((m) => matchFilter(m.status));
  const filteredOverrides = overrides.filter((o) => {
    if (filter === "all") return true;
    if (filter === "pending") return o.status === "pending";
    if (filter === "paid") return o.status === "paid";
    return false; // rejected — у override нет такого статуса
  });

  const pendingCount =
    payouts.filter((p) => p.status === "requested").length +
    milestones.filter((m) => m.status === "requested").length +
    overrides.filter((o) => o.status === "pending").length;
  const pendingAmount =
    payouts.filter((p) => p.status === "requested").reduce((s, p) => s + Number(p.amount), 0) +
    milestones.filter((m) => m.status === "requested").reduce((s, m) => s + Number(m.amount), 0) +
    overrides.filter((o) => o.status === "pending").reduce((s, o) => s + Number(o.override_amount), 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Оплаты партнёрам</h1>
        <p className="text-text-secondary text-sm">
          Запросы на выплату от партнёров — комиссии по проектам и мини-награды
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-text-muted">Ожидают оплаты</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{pendingCount}</div>
          <div className="text-xs text-text-muted mt-0.5">
            на сумму ${pendingAmount.toLocaleString("ru-RU")}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-brand-500" />
            <span className="text-xs text-text-muted">Запросов по проектам</span>
          </div>
          <div className="text-2xl font-bold">{payouts.filter((p) => p.status === "requested").length}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-text-muted">Запросов наград</span>
          </div>
          <div className="text-2xl font-bold">{milestones.filter((m) => m.status === "requested").length}</div>
        </div>
        <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-xs text-text-muted">Уже оплачено</span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            ${payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0).toLocaleString("ru-RU")}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-bg-secondary border border-border-faint w-fit">
        {(["pending", "paid", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === f ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {f === "pending" ? "Ожидают" : f === "paid" ? "Оплачено" : f === "rejected" ? "Отклонено" : "Все"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted text-sm">
          <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" /> Загрузка...
        </div>
      ) : filteredPayouts.length === 0 && filteredMilestones.length === 0 && filteredOverrides.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-border-faint bg-surface">
          <Wallet className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {filter === "pending" ? "Нет запросов в ожидании" : "Записей нет"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Project payouts */}
          {filteredPayouts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-brand-500" />
                Выплаты по проектам ({filteredPayouts.length})
              </h2>
              <div className="rounded-xl border border-border-faint bg-surface divide-y divide-border-faint overflow-hidden">
                {filteredPayouts.map((p) => {
                  const tone = p.status === "requested" ? "orange" : p.status === "paid" ? "green" : "red";
                  const toneBg = tone === "orange" ? "bg-orange-500/10 text-orange-500" : tone === "green" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";
                  const statusLabel = p.status === "requested" ? "Ожидает" : p.status === "paid" ? "Оплачено" : "Отклонено";
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-surface-raised transition-colors">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${toneBg}`}>
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">${Number(p.amount).toLocaleString("ru-RU")}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${toneBg}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          <button onClick={() => router.push(`/admin/partners/${p.partner_id}`)} className="hover:text-brand-500">
                            {p.partner_name || p.partner_id}
                          </button>
                          {" · "}
                          <button onClick={() => router.push(`/admin/projects/${p.project_id}`)} className="hover:text-brand-500">
                            {p.project_name || p.project_id}
                          </button>
                        </div>
                        {p.comment && <div className="text-xs text-text-muted mt-1">{p.comment}</div>}
                        {p.status === "rejected" && p.rejection_comment && (
                          <div className="text-xs text-red-500 mt-1">Причина отказа: {p.rejection_comment}</div>
                        )}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {p.status === "requested" && p.requested_at
                          ? `запрос ${new Date(p.requested_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`
                          : p.status === "paid"
                          ? new Date(p.paid_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
                          : ""}
                      </div>
                      {p.status === "requested" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approvePayout(p.id)}
                            className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Оплатить
                          </button>
                          <button
                            onClick={() => setRejectTarget({ kind: "payout", id: p.id, amount: Number(p.amount), partnerName: p.partner_name })}
                            className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" /> Отклонить
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Milestone claims */}
          {filteredMilestones.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Мини-награды ({filteredMilestones.length})
              </h2>
              <div className="rounded-xl border border-border-faint bg-surface divide-y divide-border-faint overflow-hidden">
                {filteredMilestones.map((m) => {
                  const tone = m.status === "requested" ? "amber" : m.status === "paid" ? "green" : "red";
                  const toneBg = tone === "amber" ? "bg-amber-500/10 text-amber-500" : tone === "green" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500";
                  const statusLabel = m.status === "requested" ? "Ожидает" : m.status === "paid" ? "Оплачено" : "Отклонено";
                  return (
                    <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-surface-raised transition-colors">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${toneBg}`}>
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">${Number(m.amount).toLocaleString("ru-RU")}</span>
                          <span className="text-xs text-text-muted">
                            (за заработок ${Number(m.threshold).toLocaleString("ru-RU")})
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${toneBg}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <button
                          onClick={() => router.push(`/admin/partners/${m.partner_id}`)}
                          className="text-xs text-text-muted hover:text-brand-500 mt-0.5"
                        >
                          {m.partner_name || m.partner_id}
                        </button>
                        {m.status === "rejected" && m.rejection_comment && (
                          <div className="text-xs text-red-500 mt-1">Причина отказа: {m.rejection_comment}</div>
                        )}
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {m.status === "requested" && m.requested_at
                          ? `запрос ${new Date(m.requested_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`
                          : m.paid_at
                          ? new Date(m.paid_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </div>
                      {m.status === "requested" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveMilestone(m.id)}
                            className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Оплатить
                          </button>
                          <button
                            onClick={() => setRejectTarget({ kind: "milestone", id: m.id, amount: Number(m.amount), partnerName: m.partner_name })}
                            className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" /> Отклонить
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sub-partner overrides */}
          {filteredOverrides.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-500" />
                Sub-partner override ({filteredOverrides.length})
              </h2>
              <div className="rounded-xl border border-border-faint bg-surface divide-y divide-border-faint overflow-hidden">
                {filteredOverrides.map((o) => {
                  const isPending = o.status === "pending";
                  const toneBg = isPending ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500";
                  const statusLabel = isPending ? "К выплате" : "Выплачено";
                  return (
                    <div key={o.id} className="flex items-center gap-3 p-4 hover:bg-surface-raised transition-colors flex-wrap">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${toneBg}`}>
                        <Network className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold font-mono">+${Number(o.override_amount).toLocaleString("ru-RU")}</span>
                          <span className="text-xs text-text-muted font-mono">
                            ({o.override_pct}% × ${Number(o.sub_commission_amount).toLocaleString("ru-RU")})
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${toneBg}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          <button
                            onClick={() => router.push(`/admin/partners/${o.referrer_partner_id}`)}
                            className="hover:text-brand-500 font-medium text-text-secondary"
                          >
                            {o.referrer_name || o.referrer_partner_id}
                          </button>
                          {" ← "}
                          <button
                            onClick={() => router.push(`/admin/partners/${o.sub_partner_id}`)}
                            className="hover:text-purple-500"
                          >
                            sub: {o.sub_partner_name || o.sub_partner_id}
                          </button>
                          {" · "}
                          <button
                            onClick={() => router.push(`/admin/projects/${o.project_id}`)}
                            className="hover:text-brand-500"
                          >
                            {o.project_name || o.project_id}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        {isPending
                          ? `создано ${new Date(o.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`
                          : o.paid_at
                          ? new Date(o.paid_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </div>
                      {isPending && (
                        <button
                          onClick={() => payOverride(o.id)}
                          disabled={payingOverride === o.id}
                          className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {payingOverride === o.id ? "..." : "Выплатить"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {rejectTarget && (
        <RejectModal target={rejectTarget} onCancel={() => setRejectTarget(null)} onConfirm={rejectConfirm} />
      )}
    </div>
  );
}

function RejectModal({
  target,
  onCancel,
  onConfirm,
}: {
  target: RejectTarget;
  onCancel: () => void;
  onConfirm: (comment: string) => void;
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => {
    if (!comment.trim()) {
      alert("Укажите причину отказа");
      return;
    }
    setSubmitting(true);
    onConfirm(comment.trim());
    setSubmitting(false);
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-faint bg-surface shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-faint">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Ban className="w-4 h-4 text-red-400" /> Отклонить запрос
          </h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-text-secondary">
            {target.kind === "payout" ? "Выплата" : "Награда"} ${target.amount.toLocaleString("ru-RU")}
            {target.partnerName ? ` · ${target.partnerName}` : ""}
          </p>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Причина отказа *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Например: подожди 2-го транша / превышен лимит на месяц / нет реквизитов"
              rows={3}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none resize-none"
              autoFocus
            />
            <p className="text-[11px] text-text-muted mt-1">
              Партнёр увидит этот комментарий в своей панели
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-border-faint">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary">
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!comment.trim() || submitting}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium"
          >
            {submitting ? "Отклоняем..." : "Отклонить"}
          </button>
        </div>
      </div>
    </div>
  );
}
