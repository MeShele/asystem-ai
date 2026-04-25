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
  Check,
  Save,
  CircleCheck,
  Circle,
  Percent,
} from "lucide-react";
import Image from "next/image";

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
  const [linkedDevelopers, setLinkedDevelopers] = useState<Developer[]>([]);
  const [allDevelopers, setAllDevelopers] = useState<Developer[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDev, setShowAddDev] = useState(false);

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
  });

  const load = useCallback(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p: ProjectDetail | null = data.project || null;
        setProject(p);
        setStages(Array.isArray(data.stages) ? data.stages : []);
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
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
    fetch("/api/partners")
      .then((r) => r.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]));
    fetch("/api/admin/developers")
      .then((r) => r.json())
      .then((data) => setAllDevelopers(Array.isArray(data) ? data : []))
      .catch(() => setAllDevelopers([]));
  }, [load]);

  const dirty = useMemo(() => {
    if (!project) return false;
    return (
      form.name !== (project.name || "") ||
      form.description !== (project.description || "") ||
      form.logoUrl !== (project.logo_url || "") ||
      Number(form.totalPrice) !== Number(project.total_price) ||
      Number(form.paidAmount) !== Number(project.paid_amount) ||
      form.partnerId !== (project.partner_id || "") ||
      form.progressPercent !== Number(project.progress_percent || 0) ||
      form.status !== project.status ||
      form.partnerCommissionPercent !== Number(project.partner_commission_percent || 0)
    );
  }, [form, project]);

  const save = async () => {
    if (!project || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
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
        }),
      });
      if (res.ok) load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Удалить проект? Это действие нельзя отменить.")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/projects");
  };

  // Stages — autosave (мелкий стейт, не часть проекта)
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
    }
  };
  const updateStage = async (stageId: number, fields: Partial<Stage>) => {
    if (!project) return;
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, ...fields } : s)));
    await fetch(`/api/admin/projects/${project.project_id}/stages/${stageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  };
  const removeStage = async (stageId: number) => {
    if (!project) return;
    setStages((prev) => prev.filter((s) => s.id !== stageId));
    await fetch(`/api/admin/projects/${project.project_id}/stages/${stageId}`, { method: "DELETE" });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Логотип (URL)">
            <input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
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
                onUpdate={(fields) => updateStage(s.id, fields)}
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
  const [title, setTitle] = useState(stage.title);
  const [percent, setPercent] = useState(stage.percent);
  const [comment, setComment] = useState(stage.comment || "");

  const toggleCompleted = () => {
    const next = !stage.completed;
    if (next) {
      // mark as 100% when completing
      setPercent(100);
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== stage.title && onUpdate({ title })}
          placeholder="Название этапа"
          className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-0 focus:bg-surface rounded outline-none"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
            onBlur={() => percent !== stage.percent && onUpdate({ percent })}
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
          style={{ width: `${percent}%` }}
        />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onBlur={() => comment !== (stage.comment || "") && onUpdate({ comment: comment || null })}
        placeholder="Комментарий к этапу (увидит партнёр)"
        rows={2}
        className="w-full px-2 py-1.5 text-xs bg-transparent border border-border-faint rounded focus:border-brand-500 outline-none resize-none text-text-secondary"
      />
    </div>
  );
}
