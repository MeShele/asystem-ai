"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Wallet, Trophy, Check, Clock, FolderKanban, Calendar } from "lucide-react";

interface Payout {
  id: number;
  project_id: string;
  partner_id: string;
  amount: number | string;
  status: "requested" | "paid";
  requested_at: string | null;
  paid_at: string;
  comment: string | null;
  partner_name?: string;
  project_name?: string;
}

interface MilestoneClaim {
  id: number;
  partner_id: string;
  milestone_key: string;
  threshold: number | string;
  amount: number | string;
  status: "requested" | "paid";
  requested_at: string | null;
  paid_at: string | null;
  partner_name?: string;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [milestones, setMilestones] = useState<MilestoneClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "paid" | "all">("pending");

  const load = () => {
    fetch("/api/admin/payouts")
      .then((r) => r.json())
      .then((d) => {
        setPayouts(Array.isArray(d.payouts) ? d.payouts : []);
        setMilestones(Array.isArray(d.milestones) ? d.milestones : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  const filteredPayouts = payouts.filter((p) => filter === "all" || p.status === (filter === "pending" ? "requested" : "paid"));
  const filteredMilestones = milestones.filter((m) => filter === "all" || m.status === (filter === "pending" ? "requested" : "paid"));

  const pendingCount =
    payouts.filter((p) => p.status === "requested").length +
    milestones.filter((m) => m.status === "requested").length;
  const pendingAmount =
    payouts.filter((p) => p.status === "requested").reduce((s, p) => s + Number(p.amount), 0) +
    milestones.filter((m) => m.status === "requested").reduce((s, m) => s + Number(m.amount), 0);

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
        {(["pending", "paid", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === f ? "bg-surface text-text-primary shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {f === "pending" ? "Ожидают" : f === "paid" ? "Оплачено" : "Все"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted text-sm">
          <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" /> Загрузка...
        </div>
      ) : filteredPayouts.length === 0 && filteredMilestones.length === 0 ? (
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
                {filteredPayouts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-surface-raised transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${p.status === "requested" ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"}`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">${Number(p.amount).toLocaleString("ru-RU")}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${p.status === "requested" ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"}`}>
                          {p.status === "requested" ? "Ожидает" : "Оплачено"}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        <button
                          onClick={() => router.push(`/admin/partners/${p.partner_id}`)}
                          className="hover:text-brand-500"
                        >
                          {p.partner_name || p.partner_id}
                        </button>
                        {" · "}
                        <button
                          onClick={() => router.push(`/admin/projects/${p.project_id}`)}
                          className="hover:text-brand-500"
                        >
                          {p.project_name || p.project_id}
                        </button>
                      </div>
                      {p.comment && <div className="text-xs text-text-muted mt-1">{p.comment}</div>}
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {p.status === "requested" && p.requested_at
                        ? `запрос ${new Date(p.requested_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}`
                        : new Date(p.paid_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    {p.status === "requested" && (
                      <button
                        onClick={() => approvePayout(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Оплатить
                      </button>
                    )}
                  </div>
                ))}
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
                {filteredMilestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-4 hover:bg-surface-raised transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${m.status === "requested" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}`}>
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">${Number(m.amount).toLocaleString("ru-RU")}</span>
                        <span className="text-xs text-text-muted">
                          (за заработок ${Number(m.threshold).toLocaleString("ru-RU")})
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${m.status === "requested" ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"}`}>
                          {m.status === "requested" ? "Ожидает" : "Оплачено"}
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/partners/${m.partner_id}`)}
                        className="text-xs text-text-muted hover:text-brand-500 mt-0.5"
                      >
                        {m.partner_name || m.partner_id}
                      </button>
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
                      <button
                        onClick={() => approveMilestone(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Оплатить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
