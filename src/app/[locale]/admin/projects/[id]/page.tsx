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
  Circle,
  Percent,
  Wallet,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/shared/image-upload";

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
  progress_percent: number;
  status: string;
  partner_commission_percent: number;
  tier: string;
  contract_signed_at: string | null;
  delivered_in_30_days: boolean;
  has_retention_bonus: boolean;
  has_churn_penalty: boolean;
  created_at: string;
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
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDev, setShowAddDev] = useState(false);
  const [showAddPayout, setShowAddPayout] = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    totalPrice: "0",
    paidAmount: "0",
    partnerId: "",
    progressPercent: 0,
    status: "planning",
    partnerCommissionPercent: 0,
    tier: "T1",
    contractSignedAt: "",
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
        if (p) {
          setForm({
            name: p.name || "",
            description: p.description || "",
            logoUrl: p.logo_url || "",
            totalPrice: String(p.total_price ?? 0),
            paidAmount: String(p.paid_amount ?? 0),
            partnerId: p.partner_id || "",
            progressPercent: Number(p.progress_percent || 0),
            status: p.status || "planning",
            partnerCommissionPercent: Number(p.partner_commission_percent || 0),
            tier: p.tier || "T1",
            contractSignedAt: p.contract_signed_at ? String(p.contract_signed_at).slice(0, 10) : "",
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

  useEffect(() => {
    load();
    loadPayouts();
    fetch("/api/partners")
      .then((r) => r.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]));
    fetch("/api/admin/developers")
      .then((r) => r.json())
      .then((data) => setAllDevelopers(Array.isArray(data) ? data : []))
      .catch(() => setAllDevelopers([]));
  }, [load, loadPayouts]);

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
      Number(form.paidAmount) !== Number(project.paid_amount) ||
      form.partnerId !== (project.partner_id || "") ||
      form.progressPercent !== Number(project.progress_percent || 0) ||
      form.status !== project.status ||
      form.partnerCommissionPercent !== Number(project.partner_commission_percent || 0) ||
      form.tier !== (project.tier || "T1") ||
      form.contractSignedAt !== origContractDate ||
      form.deliveredIn30Days !== Boolean(project.delivered_in_30_days) ||
      form.hasRetentionBonus !== Boolean(project.has_retention_bonus) ||
      form.hasChurnPenalty !== Boolean(project.has_churn_penalty);
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
          paid_amount: Number(form.paidAmount),
          partner_id: form.partnerId || null,
          progress_percent: Number(form.progressPercent),
          status: form.status,
          partner_commission_percent: Number(form.partnerCommissionPercent),
          tier: form.tier,
          contract_signed_at: form.contractSignedAt || null,
          delivered_in_30_days: form.deliveredIn30Days,
          has_retention_bonus: form.hasRetentionBonus,
          has_churn_penalty: form.hasChurnPenalty,
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
      <Section title="Основное">
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
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
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
            className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none resize-none"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Стоимость, $">
            <input
              type="number"
              value={form.totalPrice}
              onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
          <Field label="Оплачено, $">
            <input
              type="number"
              value={form.paidAmount}
              onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
          <Field label="Партнёр">
            <select
              value={form.partnerId}
              onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
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

      {/* Tier + contract */}
      <Section title="Тип проекта и договор" subtitle="Тир определяет acceptance criteria для уровня партнёра. Дата договора фиксирует «сделку» в зачёт уровня.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Тир проекта">
            <select
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            >
              <option value="T1">T1 — MVP ($500–2 000, 1–2 нед)</option>
              <option value="T2">T2 — Полная упаковка ($30–100K, 1–2 мес)</option>
              <option value="T4">T4 — Equity / токены</option>
            </select>
          </Field>
          <Field label="Дата подписания договора">
            <input
              type="date"
              value={form.contractSignedAt}
              onChange={(e) => setForm({ ...form, contractSignedAt: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
        </div>
      </Section>

      {/* Multipliers */}
      <Section title="Множители комиссии" subtitle="Применяются поверх базовой ставки уровня. Сохраняются вместе с проектом.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <CheckboxField
            label="+10% быстрая сдача (<30 дней)"
            checked={form.deliveredIn30Days}
            onChange={(v) => setForm({ ...form, deliveredIn30Days: v })}
            color="green"
          />
          <CheckboxField
            label="+5% retention 12 мес"
            checked={form.hasRetentionBonus}
            onChange={(v) => setForm({ ...form, hasRetentionBonus: v })}
            color="green"
          />
          <CheckboxField
            label="−5% churn (60 дн неактивности)"
            checked={form.hasChurnPenalty}
            onChange={(v) => setForm({ ...form, hasChurnPenalty: v })}
            color="red"
          />
        </div>
      </Section>

      {/* Partner commission */}
      <Section title="Вознаграждение партнёра">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Field label="Процент партнёра">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={form.partnerCommissionPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    partnerCommissionPercent: Math.max(0, Math.min(100, Number(e.target.value))),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
              <Percent className="w-4 h-4 text-text-muted flex-shrink-0" />
            </div>
          </Field>
          <div className="md:col-span-2 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">
              Партнёр получит со всего проекта
            </div>
            <div className="text-xl font-semibold text-green-500">
              ${partnerCommissionAmount.toLocaleString("ru-RU")}
              <span className="text-sm text-text-muted font-normal ml-2">
                = ${total.toLocaleString("ru-RU")} × {form.partnerCommissionPercent}%
              </span>
            </div>
          </div>
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
        <div className="mt-3 h-3 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all duration-300"
            style={{ width: `${form.progressPercent}%` }}
          />
        </div>
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
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-5 mb-5">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  color = "brand",
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: "brand" | "green" | "red";
}) {
  const accent = color === "green" ? "border-green-500/40 bg-green-500/5" : color === "red" ? "border-red-500/40 bg-red-500/5" : "border-brand-500/40 bg-brand-500/5";
  return (
    <label
      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
        checked ? accent : "border-border-faint hover:bg-bg-secondary/40"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-brand-500"
      />
      <span className="text-xs">{label}</span>
    </label>
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
      <div className="h-1 bg-bg-secondary rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${
            stage.completed ? "bg-green-500" : "bg-brand-500"
          }`}
          style={{ width: `${stage.percent}%` }}
        />
      </div>
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
