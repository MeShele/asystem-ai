"use client";

import { useEffect, useState, use, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Trash2,
  Clock,
  Building2,
  FolderKanban,
  Plus,
  X,
  Save,
  CircleCheck,
  CheckCircle2,
  Circle,
  Percent,
  Wallet,
  Calendar,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/shared/image-upload";
import { ProjectComments } from "@/components/shared/project-comments";
import { InviteModal } from "@/components/shared/invite-modal";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";

interface Developer {
  id: number;
  name: string;
  role?: string | null;
  avatar_url?: string | null;
  email?: string | null;
}

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
  client_id: string | null;
  client_name?: string | null;
  client_email?: string | null;
  progress_percent: number;
  status: string;
  partner_commission_percent: number;
  tier: string;
  contract_signed_at: string | null;
  contract_type?: string | null;
  delivered_in_30_days: boolean;
  has_retention_bonus: boolean;
  has_churn_penalty: boolean;
  price_confirmed_at?: string | null;
  created_at: string;
}

interface ProjectPayment {
  id: number;
  amount: number | string;
  note: string | null;
  paid_at: string;
  created_at: string;
}

interface ClientLite {
  client_id: string;
  name: string;
  email: string;
}

interface CommissionBreakdown {
  base: number;
  bonuses: { label: string; pct: number }[];
  total: number;
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

interface Payout {
  id: number;
  amount: number | string;
  paid_at: string;
  comment: string | null;
}

interface Partner {
  partner_id: string;
  name: string;
  company?: string;
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
  const [originalStages, setOriginalStages] = useState<Stage[]>([]);
  const [linkedDevelopers, setLinkedDevelopers] = useState<Developer[]>([]);
  const [allDevelopers, setAllDevelopers] = useState<Developer[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [allClients, setAllClients] = useState<ClientLite[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [commissionBreakdown, setCommissionBreakdown] = useState<CommissionBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDev, setShowAddDev] = useState(false);
  const [showAddPayout, setShowAddPayout] = useState(false);
  const [showClientInvite, setShowClientInvite] = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    totalPrice: "0",
    paidAmount: "0",
    partnerId: "",
    clientId: "",
    progressPercent: 0,
    status: "planning",
    partnerCommissionPercent: 0,
    tier: "S",
    contractSignedAt: "",
    contractType: "fix",
    deliveredIn30Days: false,
    hasRetentionBonus: false,
    hasChurnPenalty: false,
  });

  const load = useCallback(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p: ProjectDetail | null = data.project || null;
        setProject(p);
        const ss = Array.isArray(data.stages) ? data.stages : [];
        setStages(ss);
        setOriginalStages(ss);
        setLinkedDevelopers(Array.isArray(data.developers) ? data.developers : []);
        setCommissionBreakdown(data.commissionBreakdown || null);
        if (p) {
          setForm({
            name: p.name || "",
            description: p.description || "",
            logoUrl: p.logo_url || "",
            totalPrice: String(p.total_price ?? 0),
            paidAmount: String(p.paid_amount ?? 0),
            partnerId: p.partner_id || "",
            clientId: p.client_id || "",
            progressPercent: Number(p.progress_percent || 0),
            status: p.status || "planning",
            partnerCommissionPercent: Number(p.partner_commission_percent || 0),
            tier: (() => {
              const raw = p.tier || "S";
              // Backward compat: T1 → S, T2 → L
              if (raw === "T1") return "S";
              if (raw === "T2") return "L";
              if (raw === "T4") return "L";
              return raw;
            })(),
            contractSignedAt: p.contract_signed_at ? String(p.contract_signed_at).slice(0, 10) : "",
            contractType: p.contract_type || "fix",
            deliveredIn30Days: Boolean(p.delivered_in_30_days),
            hasRetentionBonus: Boolean(p.has_retention_bonus),
            hasChurnPenalty: Boolean(p.has_churn_penalty),
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const loadPayouts = useCallback(() => {
    fetch(`/api/admin/projects/${id}/payouts`)
      .then((r) => r.json())
      .then((data) => setPayouts(Array.isArray(data) ? data : []))
      .catch(() => setPayouts([]));
  }, [id]);

  const loadPayments = useCallback(() => {
    fetch(`/api/admin/projects/${id}/payments`)
      .then((r) => r.json())
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]));
  }, [id]);

  useEffect(() => {
    load();
    loadPayouts();
    loadPayments();
    fetch("/api/partners")
      .then((r) => r.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]));
    fetch("/api/admin/developers")
      .then((r) => r.json())
      .then((data) => setAllDevelopers(Array.isArray(data) ? data : []))
      .catch(() => setAllDevelopers([]));
    fetch("/api/admin/clients-list")
      .then((r) => r.json())
      .then((data) => setAllClients(Array.isArray(data) ? data : []))
      .catch(() => setAllClients([]));
  }, [load, loadPayouts, loadPayments]);

  const stagesDirty = useMemo(() => {
    if (stages.length !== originalStages.length) return false;
    for (const cur of stages) {
      const orig = originalStages.find((s) => s.id === cur.id);
      if (!orig) return true;
      if (
        cur.title !== orig.title ||
        cur.percent !== orig.percent ||
        (cur.comment || "") !== (orig.comment || "") ||
        cur.completed !== orig.completed
      ) {
        return true;
      }
    }
    return false;
  }, [stages, originalStages]);

  const dirty = useMemo(() => {
    if (!project) return false;
    const origContractDate = project.contract_signed_at ? String(project.contract_signed_at).slice(0, 10) : "";
    const fieldsDirty =
      form.name !== (project.name || "") ||
      form.description !== (project.description || "") ||
      form.logoUrl !== (project.logo_url || "") ||
      Number(form.totalPrice) !== Number(project.total_price) ||
      form.partnerId !== (project.partner_id || "") ||
      form.clientId !== (project.client_id || "") ||
      form.progressPercent !== Number(project.progress_percent || 0) ||
      form.status !== project.status ||
      form.tier !== (project.tier === "T1" ? "S" : project.tier === "T2" || project.tier === "T4" ? "L" : project.tier || "S") ||
      form.contractSignedAt !== origContractDate ||
      form.contractType !== (project.contract_type || "fix") ||
      form.deliveredIn30Days !== Boolean(project.delivered_in_30_days) ||
      form.hasRetentionBonus !== Boolean(project.has_retention_bonus);
    return fieldsDirty || stagesDirty;
  }, [form, project, stagesDirty]);

  const save = async () => {
    if (!project || saving) return;
    setSaving(true);
    try {
      // 1. Project fields
      await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          logo_url: form.logoUrl || null,
          total_price: Number(form.totalPrice),
          partner_id: form.partnerId || null,
          client_id: form.clientId || null,
          progress_percent: Number(form.progressPercent),
          status: form.status,
          tier: form.tier,
          contract_signed_at: form.contractSignedAt || null,
          contract_type: form.contractType,
          delivered_in_30_days: form.deliveredIn30Days,
          has_retention_bonus: form.hasRetentionBonus,
        }),
      });

      // 2. Changed stages (diff vs originalStages)
      const stageUpdates: Promise<unknown>[] = [];
      for (const cur of stages) {
        const orig = originalStages.find((s) => s.id === cur.id);
        if (!orig) continue;
        const changed: Record<string, unknown> = {};
        if (cur.title !== orig.title) changed.title = cur.title;
        if (cur.percent !== orig.percent) changed.percent = cur.percent;
        if ((cur.comment || "") !== (orig.comment || "")) changed.comment = cur.comment || null;
        if (cur.completed !== orig.completed) changed.completed = cur.completed;
        if (Object.keys(changed).length > 0) {
          stageUpdates.push(
            fetch(`/api/admin/projects/${project.project_id}/stages/${cur.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(changed),
            })
          );
        }
      }
      await Promise.all(stageUpdates);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Удалить проект? Это действие нельзя отменить.")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/projects");
  };

  // Stages — добавление/удаление instant (явные действия), редактирование полей — через "Сохранить"
  const addStage = async () => {
    if (!project) return;
    const res = await fetch(`/api/admin/projects/${project.project_id}/stages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Новый этап", percent: 0 }),
    });
    if (res.ok) {
      const stage = await res.json();
      setStages((prev) => [...prev, stage]);
      setOriginalStages((prev) => [...prev, stage]);
    }
  };
  const updateStageLocal = (stageId: number, fields: Partial<Stage>) => {
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, ...fields } : s)));
  };
  const removeStage = async (stageId: number) => {
    if (!project) return;
    if (!confirm("Удалить этап?")) return;
    setStages((prev) => prev.filter((s) => s.id !== stageId));
    setOriginalStages((prev) => prev.filter((s) => s.id !== stageId));
    await fetch(`/api/admin/projects/${project.project_id}/stages/${stageId}`, { method: "DELETE" });
  };

  // Payouts
  const addPayout = async (amount: number, paidAt: string, comment: string) => {
    if (!project) return;
    const res = await fetch(`/api/admin/projects/${project.project_id}/payouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, paid_at: paidAt, comment: comment || null }),
    });
    if (res.ok) {
      loadPayouts();
      setShowAddPayout(false);
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Не удалось добавить выплату");
    }
  };
  const removePayout = async (payoutId: number) => {
    if (!project) return;
    if (!confirm("Удалить эту выплату?")) return;
    setPayouts((prev) => prev.filter((p) => p.id !== payoutId));
    await fetch(`/api/admin/projects/${project.project_id}/payouts/${payoutId}`, { method: "DELETE" });
  };

  // Developers
  const linkDeveloper = async (devId: number) => {
    if (!project) return;
    await fetch(`/api/admin/projects/${project.project_id}/developers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ developer_id: devId }),
    });
    const dev = allDevelopers.find((d) => d.id === devId);
    if (dev) setLinkedDevelopers((prev) => [...prev, dev]);
    setShowAddDev(false);
  };
  const unlinkDeveloper = async (devId: number) => {
    if (!project) return;
    setLinkedDevelopers((prev) => prev.filter((d) => d.id !== devId));
    await fetch(`/api/admin/projects/${project.project_id}/developers?developer_id=${devId}`, {
      method: "DELETE",
    });
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

  const total = Number(form.totalPrice || 0);
  const partnerCommissionAmount = Math.round((total * form.partnerCommissionPercent) / 100);
  const totalPayouts = payouts.reduce((s, p) => s + Number(p.amount || 0), 0);
  const remaining = Math.max(0, partnerCommissionAmount - totalPayouts);
  const linkedIds = new Set(linkedDevelopers.map((d) => d.id));
  const availableDevs = allDevelopers.filter((d) => !linkedIds.has(d.id));

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/admin/projects")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> К списку проектов
        </button>
        <div className="flex items-center gap-2">
          {dirty && !saving && (
            <span className="text-xs text-orange-400 flex items-center gap-1">
              ● Несохранённые изменения
            </span>
          )}
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Удалить
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
          {form.logoUrl ? (
            <Image src={form.logoUrl} alt={form.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
          ) : (
            <FolderKanban className="w-7 h-7 text-text-muted" />
          )}
        </div>
        <div className="flex-1">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Название проекта"
            className="text-2xl font-bold bg-transparent border-0 outline-none w-full focus:bg-surface focus:px-2 focus:rounded-lg transition-all"
          />
          <div className="font-mono text-xs text-text-muted">{project.project_id}</div>
        </div>
      </div>

      {/* Main */}
      <Section title="Основное" accent="brand">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <ImageUpload
            label="Логотип проекта"
            value={form.logoUrl || null}
            onChange={(v) => setForm({ ...form, logoUrl: v || "" })}
          />
          <Field label="Статус">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={FIELD_INPUT_CLASS}
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Описание">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Подробное описание проекта"
            className="w-full px-3 py-2 text-sm bg-surface border border-border-faint rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 outline-none resize-none transition-all"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Стоимость, $">
            <input
              type="number"
              value={form.totalPrice}
              onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
              className={`${FIELD_INPUT_CLASS} font-mono tabular-nums`}
            />
          </Field>
          <Field label="Оплачено, $ (авто из журнала)">
            <input
              type="text"
              readOnly
              value={`$${Number(form.paidAmount || 0).toLocaleString("ru-RU")}`}
              className={`${FIELD_INPUT_CLASS} font-mono tabular-nums opacity-70 cursor-not-allowed`}
            />
          </Field>
          <Field label="Партнёр">
            <select
              value={form.partnerId}
              onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
              className={FIELD_INPUT_CLASS}
            >
              <option value="">— Без партнёра —</option>
              {partners.map((p) => (
                <option key={p.partner_id} value={p.partner_id}>
                  {p.name}
                  {p.company ? ` · ${p.company}` : ""}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Подтверждение суммы (price_confirmed_at) */}
        {(() => {
          const totalNum = Number(form.totalPrice) || 0;
          const confirmedAt = project?.price_confirmed_at;
          if (confirmedAt) {
            return (
              <div className="p-3 rounded-lg bg-green-500/[0.06] border border-green-500/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-green-700">
                    Сумма $ {totalNum.toLocaleString("ru-RU")} согласована
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Подтверждена: {new Date(confirmedAt).toLocaleString("ru-RU", { dateStyle: "long", timeStyle: "short" })}
                  </div>
                </div>
              </div>
            );
          }
          return (
            <button
              type="button"
              onClick={async () => {
                if (totalNum <= 0) {
                  alert("Сначала задайте стоимость проекта (>0) и сохраните");
                  return;
                }
                if (Number(project?.total_price ?? 0) !== totalNum) {
                  alert("Сначала сохраните проект с новой стоимостью, потом подтверждайте");
                  return;
                }
                if (!confirm(`Подтвердить сумму $${totalNum.toLocaleString("ru-RU")} и запустить проект? Партнёру и клиенту уйдёт уведомление.`)) return;
                setConfirming(true);
                const res = await fetch(`/api/admin/projects/${id}/confirm-price`, { method: "POST" });
                setConfirming(false);
                if (res.ok) {
                  load();
                } else {
                  const e = await res.json().catch(() => ({}));
                  alert(e.error || "Не удалось подтвердить");
                }
              }}
              disabled={confirming || totalNum <= 0}
              className="w-full p-3 rounded-lg border-2 border-dashed border-brand-500/40 bg-brand-500/[0.05] hover:bg-brand-500/[0.1] text-brand-600 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {confirming ? "Подтверждаем..." : totalNum > 0 ? `✓ Подтвердить сумму $${totalNum.toLocaleString("ru-RU")} и запустить проект` : "Задайте стоимость для подтверждения"}
            </button>
          );
        })()}

        {/* Авто-расчёт выплаты партнёру (read-only) */}
        {form.partnerId && (() => {
          const total = Number(form.totalPrice) || 0;
          const paid = Number(form.paidAmount) || 0;
          const pct = Number(form.partnerCommissionPercent) || 0;
          const totalDue = Math.round((total * pct) / 100);
          const paidDue = Math.round((paid * pct) / 100);
          const remaining = Math.max(0, totalDue - paidDue);
          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-green-500/[0.04] border border-green-500/20">
              <ReadOnlyValue
                label={`К выплате (от оплаченного)`}
                value={`$${paidDue.toLocaleString("ru-RU")}`}
                hint={`${paid.toLocaleString("ru-RU")} × ${pct}%`}
                tone="green"
              />
              <ReadOnlyValue
                label="Потенциал (от полной)"
                value={`$${totalDue.toLocaleString("ru-RU")}`}
                hint={`${total.toLocaleString("ru-RU")} × ${pct}%`}
                tone="neutral"
              />
              <ReadOnlyValue
                label="Осталось дозаплатить"
                value={`$${remaining.toLocaleString("ru-RU")}`}
                hint={remaining > 0 ? "по мере оплаты клиентом" : "проект полностью закрыт"}
                tone={remaining > 0 ? "amber" : "muted"}
              />
            </div>
          );
        })()}

        {/* Журнал оплат */}
        <PaymentsJournal
          payments={payments}
          totalPrice={Number(form.totalPrice) || 0}
          paidAmount={Number(form.paidAmount) || 0}
          onAdd={() => setShowAddPayment(true)}
          onDelete={async (paymentId) => {
            if (!confirm("Удалить эту оплату? Будет пересчитана общая сумма оплат проекта.")) return;
            const res = await fetch(`/api/admin/projects/${id}/payments/${paymentId}`, { method: "DELETE" });
            if (res.ok) {
              loadPayments();
              load();
            } else {
              alert("Не удалось удалить");
            }
          }}
        />

        {showAddPayment && (
          <AddPaymentModal
            maxAmount={Math.max(0, (Number(form.totalPrice) || 0) - (Number(form.paidAmount) || 0))}
            onClose={() => setShowAddPayment(false)}
            onAdded={() => {
              setShowAddPayment(false);
              loadPayments();
              load();
            }}
            projectId={id}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <Field label="Клиент">
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className={FIELD_INPUT_CLASS}
            >
              <option value="">— Без клиента —</option>
              {allClients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.name} · {c.email}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={() => setShowClientInvite(true)}
            className="h-10 px-3 text-xs rounded-lg border border-border-faint bg-surface hover:bg-bg-secondary/40 hover:border-brand-500/40 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Пригласить клиента
          </button>
        </div>

        {project.partner_name && (
          <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
            <Building2 className="w-3 h-3" />
            <span>
              Привязан: <span className="text-text-secondary">{project.partner_name}</span>
              {project.partner_company ? ` · ${project.partner_company}` : ""}
            </span>
          </div>
        )}
      </Section>

      {/* Class + contract */}
      <Section
        title="Класс проекта и договор"
        subtitle="Класс — вес проекта по бюджету. L и XL ($30K+) засчитываются как T2 в acceptance L3-уровня партнёра."
        accent="purple"
      >
        <Field label="Класс проекта">
          <TierPicker value={form.tier} onChange={(v) => setForm({ ...form, tier: v })} />
        </Field>

        <Field label="Тип контракта">
          <ContractTypePicker value={form.contractType} onChange={(v) => setForm({ ...form, contractType: v })} />
        </Field>

        <Field label="Подписание договора">
          <ContractSignBlock
            value={form.contractSignedAt}
            onChange={(v) => setForm({ ...form, contractSignedAt: v })}
          />
        </Field>
      </Section>

      {/* Multipliers */}
      <Section
        title="Множители комиссии"
        subtitle="Применяются поверх базовой ставки уровня. Включаются при реальном событии. Влияет только на этот проект."
        accent="amber"
      >
        <div className="space-y-2">
          <CheckboxField
            label="Быстрая сделка"
            hint="Договор подписан за <30 дней с первого контакта партнёра"
            checked={form.deliveredIn30Days}
            onChange={(v) => setForm({ ...form, deliveredIn30Days: v })}
            color="brand"
            pct="+10%"
          />
          <CheckboxField
            label="Retention 12 месяцев"
            hint="Клиент остался — авто-флаг при 3 сделках партнёра за 60 дней"
            checked={form.hasRetentionBonus}
            onChange={(v) => setForm({ ...form, hasRetentionBonus: v })}
            color="green"
            pct="+5%"
          />
        </div>
        <div className="mt-3 p-3 rounded-lg bg-bg-secondary/40 border border-border-faint/60">
          <p className="text-[11px] text-text-muted leading-relaxed">
            <span className="font-semibold text-text-secondary">Штраф за неактивность</span> применяется автоматически через понижение уровня (60+ дней без сделок → уровень −1). Это вычитает 4-5% от базы автоматически — отдельного %-штрафа нет.
          </p>
        </div>
      </Section>

      {/* Partner commission — auto-calculated, read-only with breakdown */}
      <Section
        title="Вознаграждение партнёра"
        subtitle="Считается автоматически: уровень партнёра + множители + founding-бонус. Сохраняется при изменении уровня или флагов."
      >
        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-wider text-text-muted">Партнёр получит со всего проекта</div>
            <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 text-xs font-mono font-semibold">
              {form.partnerCommissionPercent}%
            </span>
          </div>
          <div className="text-2xl font-bold text-green-500 mb-1">
            ${partnerCommissionAmount.toLocaleString("ru-RU")}
          </div>
          <div className="text-xs text-text-muted">
            ${total.toLocaleString("ru-RU")} × {form.partnerCommissionPercent}%
          </div>

          {/* Breakdown */}
          {commissionBreakdown && (
            <div className="mt-4 pt-4 border-t border-green-500/20">
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-2">Из чего складывается:</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Базовая ставка по уровню</span>
                  <span className="font-mono font-semibold">{commissionBreakdown.base}%</span>
                </div>
                {commissionBreakdown.bonuses.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className={b.pct > 0 ? "text-green-500" : "text-red-500"}>
                      {b.pct > 0 ? "+ " : ""}{b.label}
                    </span>
                    <span className={`font-mono font-semibold ${b.pct > 0 ? "text-green-500" : "text-red-500"}`}>
                      {b.pct > 0 ? "+" : ""}{b.pct}%
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-green-500/20 text-sm font-semibold">
                  <span>Итого</span>
                  <span className="font-mono text-green-500">{commissionBreakdown.total}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Payouts */}
      <Section
        title="Выплаты партнёру"
        subtitle={
          form.partnerId
            ? "Фиксируйте каждую выплату с датой. Можно платить до начала проекта (предоплата по договору) или частями."
            : "Привяжите проект к партнёру, чтобы фиксировать выплаты."
        }
        action={
          form.partnerId ? (
            <button
              onClick={() => setShowAddPayout(true)}
              disabled={!project?.partner_id}
              title={!project?.partner_id ? "Сохраните партнёра в проекте перед добавлением выплат" : ""}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить выплату
            </button>
          ) : null
        }
      >
        {form.partnerId && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg border border-border-faint bg-bg-secondary/40">
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">К получению (всего)</div>
              <div className="text-lg font-bold text-text-primary">
                ${partnerCommissionAmount.toLocaleString("ru-RU")}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">{form.partnerCommissionPercent}% от ${total.toLocaleString("ru-RU")}</div>
            </div>
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5">
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">Выплачено</div>
              <div className="text-lg font-bold text-green-500">
                ${totalPayouts.toLocaleString("ru-RU")}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">{payouts.length} {payouts.length === 1 ? "выплата" : "выплат"}</div>
            </div>
            <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5">
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">Остаток к выплате</div>
              <div className="text-lg font-bold text-orange-500">
                ${remaining.toLocaleString("ru-RU")}
              </div>
            </div>
          </div>
        )}

        {form.partnerId && payouts.length === 0 && (
          <p className="text-text-muted text-sm py-4 text-center">
            Выплат пока не было. Добавьте первую — партнёр увидит её в своей панели.
          </p>
        )}

        {payouts.length > 0 && (
          <div className="space-y-2">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border-faint hover:bg-surface-raised transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-green-500">
                    ${Number(p.amount).toLocaleString("ru-RU")}
                  </div>
                  {p.comment && <div className="text-xs text-text-muted truncate">{p.comment}</div>}
                </div>
                <div className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  {new Date(p.paid_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <button
                  onClick={() => removePayout(p.id)}
                  className="w-7 h-7 rounded hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                  title="Удалить выплату"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddPayout && (
          <AddPayoutForm
            maxSuggestion={remaining}
            onCancel={() => setShowAddPayout(false)}
            onSubmit={addPayout}
          />
        )}
      </Section>

      {/* Progress */}
      <Section title="Общий прогресс проекта">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={form.progressPercent}
            onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })}
            className="flex-1 accent-brand-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={form.progressPercent}
              onChange={(e) =>
                setForm({
                  ...form,
                  progressPercent: Math.max(0, Math.min(100, Number(e.target.value))),
                })
              }
              className="w-20 px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none text-center"
            />
            <span className="text-sm text-text-muted">%</span>
          </div>
        </div>
        <LiveProgressBar
          value={form.progressPercent}
          tone={form.status === "completed" ? "green" : "brand"}
          live={form.status !== "completed" && form.status !== "cancelled"}
          height="h-3"
          className="mt-3"
        />
      </Section>

      {/* Stages */}
      <Section
        title="Этапы проекта"
        subtitle="Этапы видит партнёр в своей панели. Завершённые отображаются зелёным."
        action={
          <button
            onClick={addStage}
            className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Добавить этап
          </button>
        }
      >
        {stages.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">
            Этапов пока нет. Добавь первый — он отобразится у партнёра.
          </p>
        ) : (
          <div className="space-y-2">
            {stages.map((s, i) => (
              <StageRow
                key={s.id}
                stage={s}
                index={i}
                onUpdate={(fields) => updateStageLocal(s.id, fields)}
                onDelete={() => removeStage(s.id)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Developers */}
      <Section
        title="Команда проекта"
        subtitle="Привязка из справочника разработчиков. Создавать новых — в разделе «Разработчики»."
        action={
          <button
            onClick={() => setShowAddDev(!showAddDev)}
            className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        }
      >
        {showAddDev && (
          <div className="mb-3 p-3 rounded-lg border border-border-faint bg-bg-secondary/40">
            {availableDevs.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-2">
                Все разработчики уже привязаны или справочник пуст.{" "}
                <a href="/ru/admin/developers" className="text-brand-500 hover:underline">
                  Создать разработчика
                </a>
              </p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {availableDevs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => linkDeveloper(d.id)}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-surface text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {d.avatar_url ? (
                        <Image src={d.avatar_url} alt={d.name} width={32} height={32} unoptimized className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-xs font-bold text-purple-400">
                          {d.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{d.name}</div>
                      {d.role && <div className="text-xs text-text-muted truncate">{d.role}</div>}
                    </div>
                    <Plus className="w-4 h-4 text-text-muted" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {linkedDevelopers.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">
            Разработчики не привязаны
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {linkedDevelopers.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-border-faint"
              >
                <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {d.avatar_url ? (
                    <Image src={d.avatar_url} alt={d.name} width={36} height={36} unoptimized className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs font-bold text-purple-400">
                      {d.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  {d.role && <div className="text-xs text-text-muted truncate">{d.role}</div>}
                </div>
                <button
                  onClick={() => unlinkDeveloper(d.id)}
                  className="w-7 h-7 rounded hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                  title="Отвязать от проекта"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Comments */}
      <ProjectComments projectId={project.project_id} />

      {showClientInvite && (
        <InviteModal
          role="client"
          projectId={project.project_id}
          onClose={() => setShowClientInvite(false)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
  accent,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Цветной accent на левой границе для выделения секции */
  accent?: "brand" | "amber" | "green" | "purple";
}) {
  const accentClass: Record<string, string> = {
    brand: "border-l-4 border-l-brand-500",
    amber: "border-l-4 border-l-amber-500",
    green: "border-l-4 border-l-green-500",
    purple: "border-l-4 border-l-purple-500",
  };
  return (
    <div className={`rounded-xl border border-border-faint bg-surface p-5 mb-4 ${accent ? accentClass[accent] : ""}`}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-1 leading-relaxed">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

const FIELD_INPUT_CLASS =
  "w-full h-10 px-3 text-sm bg-surface border border-border-faint rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 outline-none transition-all";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-text-muted mt-1">{hint}</p>}
    </div>
  );
}

function CheckboxField({
  label,
  hint,
  checked,
  onChange,
  color = "brand",
  pct,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: "brand" | "green" | "red" | "amber";
  pct?: string;
}) {
  const toneText: Record<string, string> = {
    brand: "text-brand-500",
    green: "text-green-500",
    red: "text-red-500",
    amber: "text-amber-500",
  };
  const toneBorder: Record<string, string> = {
    brand: "border-brand-500/40 bg-brand-500/[0.04]",
    green: "border-green-500/40 bg-green-500/[0.04]",
    red: "border-red-500/40 bg-red-500/[0.04]",
    amber: "border-amber-500/40 bg-amber-500/[0.04]",
  };

  return (
    <label
      className={`group flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        checked ? toneBorder[color] : "border-border-faint bg-surface hover:border-text-muted/30 hover:bg-bg-secondary/20"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
            checked
              ? `${toneText[color]} bg-current`
              : "bg-surface border border-border-muted/40 group-hover:border-text-muted/40"
          }`}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none">
              <path d="M2 6.5L5 9.5L10 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium leading-tight">{label}</div>
          {hint && <div className="text-[11px] text-text-muted mt-0.5 leading-snug">{hint}</div>}
        </div>
      </div>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="hidden" />
      {pct && (
        <span className={`font-mono font-bold text-sm tabular-nums flex-shrink-0 ${checked ? toneText[color] : "text-text-muted"}`}>
          {pct}
        </span>
      )}
    </label>
  );
}

/**
 * Класс проекта по бюджету (вес).
 * - S: MVP/прототип ($500–5K, 1–2 нед) → как T1 в документах
 * - M: кастомизация ($5K–30K, 2–6 нед) → новая категория
 * - L: полная упаковка ($30K–100K, 1–3 мес) → как T2 в документах, засчитывается в L3
 * - XL: enterprise ($100K+, 3+ мес) → топовые контракты, тоже L3
 */
const TIER_OPTIONS = [
  {
    value: "S",
    title: "S",
    label: "MVP",
    range: "$500–5K",
    duration: "1–2 нед",
    description: "Прототип, лендинг, рабочий MVP",
    tone: "blue" as const,
  },
  {
    value: "M",
    title: "M",
    label: "Кастом",
    range: "$5K–30K",
    duration: "2–6 нед",
    description: "Кастомизация, доработки, средние фичи",
    tone: "brand" as const,
  },
  {
    value: "L",
    title: "L",
    label: "Полная упаковка",
    range: "$30K–100K",
    duration: "1–3 мес",
    description: "Архитектура, дизайн, разработка, запуск",
    tone: "purple" as const,
  },
  {
    value: "XL",
    title: "XL",
    label: "Enterprise",
    range: "$100K+",
    duration: "3+ мес",
    description: "Стратегические контракты, продукт под ключ",
    tone: "amber" as const,
  },
] as const;

const TONE_CLASSES_TIER: Record<string, { ring: string; bg: string; text: string; chip: string }> = {
  blue: { ring: "border-blue-500", bg: "bg-blue-500/[0.05]", text: "text-blue-500", chip: "bg-blue-500/15 text-blue-500" },
  brand: { ring: "border-brand-500", bg: "bg-brand-500/[0.05]", text: "text-brand-500", chip: "bg-brand-500/15 text-brand-500" },
  purple: { ring: "border-purple-500", bg: "bg-purple-500/[0.05]", text: "text-purple-500", chip: "bg-purple-500/15 text-purple-500" },
  amber: { ring: "border-amber-500", bg: "bg-amber-500/[0.05]", text: "text-amber-500", chip: "bg-amber-500/15 text-amber-500" },
};

function TierPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {TIER_OPTIONS.map((t) => {
        const isSelected = value === t.value;
        const tone = TONE_CLASSES_TIER[t.tone];
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`relative text-left p-3 rounded-xl border transition-all ${
              isSelected
                ? `${tone.ring} ${tone.bg} shadow-sm`
                : "border-border-faint bg-surface hover:border-text-muted/30 hover:bg-bg-secondary/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center justify-center min-w-[28px] px-1.5 h-6 rounded-md text-[11px] font-bold font-mono ${tone.chip}`}>
                {t.title}
              </span>
              {isSelected && (
                <div className={`w-4 h-4 rounded-full ${tone.text} bg-current flex items-center justify-center`}>
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none">
                    <path d="M2 6.5L5 9.5L10 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-sm font-bold mb-0.5">{t.label}</div>
            <div className="text-[11px] mb-1 flex items-center gap-1.5">
              <span className={`font-mono font-semibold ${tone.text}`}>{t.range}</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-muted">{t.duration}</span>
            </div>
            <p className="text-[11px] text-text-muted leading-snug">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}

const CONTRACT_TYPES = [
  { value: "fix", label: "Fix-price", hint: "Фиксированная сумма за scope" },
  { value: "hourly", label: "Time & material", hint: "Почасовая оплата" },
  { value: "retainer", label: "Retainer", hint: "Ежемесячная подписка" },
  { value: "equity", label: "Equity / токены", hint: "Доля или токены вместо денег" },
] as const;

function ContractTypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {CONTRACT_TYPES.map((c) => {
        const isSelected = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={`relative text-left p-3 rounded-xl border transition-all ${
              isSelected
                ? "border-brand-500 bg-brand-500/[0.05] shadow-sm"
                : "border-border-faint bg-surface hover:border-text-muted/30 hover:bg-bg-secondary/20"
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center">
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none">
                  <path d="M2 6.5L5 9.5L10 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className="text-sm font-bold mb-1 pr-6">{c.label}</div>
            <p className="text-[11px] text-text-muted leading-snug">{c.hint}</p>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Большой визуальный блок «Сделка засчитана» с переключателем.
 * Когда дата заполнена — зелёный «Засчитана», иначе серый «Не засчитана» + кнопка проставить сегодня.
 */
function ContractSignBlock({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isSigned = !!value;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className={`rounded-xl border-2 transition-all ${
      isSigned
        ? "border-green-500/40 bg-green-500/[0.04]"
        : "border-dashed border-amber-500/40 bg-amber-500/[0.03]"
    }`}>
      <div className="p-4 flex items-start gap-4 flex-wrap">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          isSigned ? "bg-green-500/15" : "bg-amber-500/15"
        }`}>
          {isSigned ? (
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-500" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-500" fill="none">
              <path d="M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className={`text-sm font-bold mb-0.5 ${isSigned ? "text-green-600" : "text-amber-600"}`}>
            {isSigned ? "Сделка засчитана" : "Сделка не засчитана"}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isSigned
              ? "Идёт в acceptance уровня партнёра и в окно retention (3 сделки/60 дней)."
              : "Не учитывается в уровне партнёра. Подтвердите подписание договора чтобы засчитать."}
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-2">
          {!isSigned && (
            <button
              type="button"
              onClick={() => onChange(today)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-1.5"
            >
              <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                <path d="M2 6.5L5 9.5L10 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Подтвердить сегодня
            </button>
          )}
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 px-2 text-xs bg-surface border border-border-faint rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 outline-none transition-all max-w-[150px]"
          />
          {isSigned && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-text-muted hover:text-red-500 transition-colors px-2"
              title="Снять подтверждение"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AddPayoutForm({
  maxSuggestion,
  onCancel,
  onSubmit,
}: {
  maxSuggestion: number;
  onCancel: () => void;
  onSubmit: (amount: number, paidAt: string, comment: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(today);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      alert("Введите положительную сумму");
      return;
    }
    setSubmitting(true);
    onSubmit(num, paidAt, comment);
    setSubmitting(false);
  };

  return (
    <div className="mt-4 p-4 rounded-lg border-2 border-brand-500/30 bg-brand-500/5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">Новая выплата</h4>
        <button onClick={onCancel} className="w-6 h-6 rounded hover:bg-surface flex items-center justify-center text-text-muted">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Сумма, $</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={maxSuggestion > 0 ? `до ${maxSuggestion}` : "0"}
            className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
          />
          {maxSuggestion > 0 && (
            <button
              type="button"
              onClick={() => setAmount(String(maxSuggestion))}
              className="mt-1 text-[11px] text-brand-500 hover:underline"
            >
              Подставить остаток ${maxSuggestion.toLocaleString("ru-RU")}
            </button>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Дата выплаты</label>
          <input
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
          />
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-xs font-medium text-text-secondary mb-1.5">Комментарий (необязательно)</label>
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Например: предоплата по договору, 1-й транш и т.п."
          className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary">
          Отмена
        </button>
        <button
          onClick={submit}
          disabled={submitting || !amount}
          className="px-4 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white text-sm font-medium"
        >
          Добавить выплату
        </button>
      </div>
    </div>
  );
}

function StageRow({
  stage,
  index,
  onUpdate,
  onDelete,
}: {
  stage: Stage;
  index: number;
  onUpdate: (fields: Partial<Stage>) => void;
  onDelete: () => void;
}) {
  const toggleCompleted = () => {
    const next = !stage.completed;
    if (next) {
      onUpdate({ completed: true, percent: 100 });
    } else {
      onUpdate({ completed: false });
    }
  };

  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        stage.completed
          ? "border-green-500/30 bg-green-500/5"
          : "border-border-faint bg-bg-secondary/40"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="font-mono text-xs text-text-muted w-6">{index + 1}.</div>
        <input
          value={stage.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Название этапа"
          className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-0 focus:bg-surface rounded outline-none"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={stage.percent}
            onChange={(e) => onUpdate({ percent: Math.max(0, Math.min(100, Number(e.target.value))) })}
            disabled={stage.completed}
            className="w-16 px-2 py-1 text-sm bg-transparent border border-border-faint rounded focus:border-brand-500 outline-none text-center disabled:opacity-50"
          />
          <span className="text-xs text-text-muted">%</span>
        </div>
        <button
          onClick={toggleCompleted}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            stage.completed
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-bg-secondary text-text-muted hover:bg-surface hover:text-text-primary border border-border-faint"
          }`}
          title={stage.completed ? "Снять отметку «Завершён»" : "Отметить как завершённый"}
        >
          {stage.completed ? (
            <>
              <CircleCheck className="w-3.5 h-3.5" />
              Завершён
            </>
          ) : (
            <>
              <Circle className="w-3.5 h-3.5" />
              В работе
            </>
          )}
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
          title="Удалить этап"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <LiveProgressBar
        value={stage.percent}
        tone={stage.completed ? "green" : "brand"}
        live={!stage.completed}
        variant="solid"
        height="h-1"
        className="mb-2"
      />
      <textarea
        value={stage.comment || ""}
        onChange={(e) => onUpdate({ comment: e.target.value || null })}
        placeholder="Комментарий к этапу (увидит партнёр)"
        rows={2}
        className="w-full px-2 py-1.5 text-xs bg-transparent border border-border-faint rounded focus:border-brand-500 outline-none resize-none text-text-secondary"
      />
    </div>
  );
}

function ReadOnlyValue({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "green" | "amber" | "neutral" | "muted";
}) {
  const toneClasses: Record<typeof tone, string> = {
    green: "text-green-600",
    amber: "text-amber-600",
    neutral: "text-text-primary",
    muted: "text-text-muted",
  };
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">{label}</div>
      <div className={`text-base font-mono font-bold tabular-nums ${toneClasses[tone]}`}>{value}</div>
      {hint && <div className="text-[10px] text-text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

function PaymentsJournal({
  payments,
  totalPrice,
  paidAmount,
  onAdd,
  onDelete,
}: {
  payments: ProjectPayment[];
  totalPrice: number;
  paidAmount: number;
  onAdd: () => void;
  onDelete: (id: number) => void;
}) {
  const remaining = Math.max(0, totalPrice - paidAmount);
  const percent = totalPrice > 0 ? Math.min(100, (paidAmount / totalPrice) * 100) : 0;

  return (
    <div className="p-4 rounded-xl border border-border-faint bg-surface space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-bold">Журнал оплат</h3>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Добавить оплату
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-text-muted">Оплачено</span>
          <span className="font-mono font-bold tabular-nums">
            ${paidAmount.toLocaleString("ru-RU")}{" "}
            <span className="text-text-muted">/ ${totalPrice.toLocaleString("ru-RU")}</span>
            <span className="text-green-600 ml-1">({Math.round(percent)}%)</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-[11px] text-text-muted">
          Остаток: <span className="font-mono">${remaining.toLocaleString("ru-RU")}</span>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-6 text-xs text-text-muted">
          Оплат пока нет. Зафиксируйте первую через «+ Добавить оплату».
        </div>
      ) : (
        <div className="divide-y divide-border-faint border-t border-border-faint pt-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-2 group">
              <div className="text-[11px] text-text-muted font-mono w-20 shrink-0">
                {new Date(p.paid_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono font-bold text-green-600 tabular-nums">
                  +${Number(p.amount).toLocaleString("ru-RU")}
                </div>
                {p.note && <div className="text-[11px] text-text-muted truncate">{p.note}</div>}
              </div>
              <button
                onClick={() => onDelete(p.id)}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded text-text-muted hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all"
                title="Удалить оплату"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddPaymentModal({
  maxAmount,
  onClose,
  onAdded,
  projectId,
}: {
  maxAmount: number;
  onClose: () => void;
  onAdded: () => void;
  projectId: string;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl border border-border-faint p-5 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold">Добавить оплату</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted block mb-1">
              Сумма, $ {maxAmount > 0 && <span>· макс ${maxAmount.toLocaleString("ru-RU")}</span>}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">Заметка (необязательно)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Первый транш / по договору / и т.д."
              maxLength={200}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">Дата</label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </div>

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-700">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border-faint hover:bg-bg-secondary transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={async () => {
                setError(null);
                const n = Number(amount);
                if (!Number.isFinite(n) || n <= 0) {
                  setError("Сумма должна быть положительным числом");
                  return;
                }
                setSaving(true);
                const res = await fetch(`/api/admin/projects/${projectId}/payments`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: n, note: note || undefined, paid_at: paidAt }),
                });
                setSaving(false);
                if (res.ok) {
                  onAdded();
                } else {
                  const e = await res.json().catch(() => ({}));
                  setError(e.error || "Ошибка сохранения");
                }
              }}
              disabled={saving || !amount}
              className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Зафиксировать"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
