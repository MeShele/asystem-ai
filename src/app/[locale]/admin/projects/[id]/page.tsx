"use client";

import { useEffect, useState, use, useCallback } from "react";
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
  GripVertical,
  Save,
} from "lucide-react";
import Image from "next/image";

interface Developer {
  name: string;
  role?: string;
  avatar_url?: string;
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
  developers?: Developer[] | null;
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
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Local form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [totalPrice, setTotalPrice] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [partnerId, setPartnerId] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [status, setStatus] = useState("planning");
  const [developers, setDevelopers] = useState<Developer[]>([]);

  const load = useCallback(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const p: ProjectDetail | null = data.project || null;
        setProject(p);
        setStages(Array.isArray(data.stages) ? data.stages : []);
        if (p) {
          setName(p.name || "");
          setDescription(p.description || "");
          setLogoUrl(p.logo_url || "");
          setTotalPrice(String(p.total_price ?? 0));
          setPaidAmount(String(p.paid_amount ?? 0));
          setPartnerId(p.partner_id || "");
          setProgressPercent(Number(p.progress_percent || 0));
          setStatus(p.status || "planning");
          setDevelopers(Array.isArray(p.developers) ? p.developers : []);
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
  }, [load]);

  const patch = async (fields: Record<string, unknown>, label: string) => {
    setSaving(label);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject((prev) => (prev ? { ...prev, ...updated } : prev));
      }
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Удалить проект? Это действие нельзя отменить.")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/projects");
  };

  // Stages
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
    await fetch(`/api/admin/projects/${project.project_id}/stages/${stageId}`, {
      method: "DELETE",
    });
  };

  // Developers
  const addDeveloper = () => {
    const next = [...developers, { name: "Новый разработчик", role: "" }];
    setDevelopers(next);
    patch({ developers: next }, "devs");
  };
  const updateDeveloper = (i: number, fields: Partial<Developer>) => {
    const next = developers.map((d, idx) => (idx === i ? { ...d, ...fields } : d));
    setDevelopers(next);
  };
  const saveDevelopers = () => {
    patch({ developers }, "devs");
  };
  const removeDeveloper = (i: number) => {
    const next = developers.filter((_, idx) => idx !== i);
    setDevelopers(next);
    patch({ developers: next }, "devs");
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
          {saving && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3 animate-spin" /> Сохраняем...
            </span>
          )}
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
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <FolderKanban className="w-7 h-7 text-text-muted" />
          )}
        </div>
        <div className="flex-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== project.name && patch({ name }, "name")}
            className="text-2xl font-bold bg-transparent border-0 outline-none w-full focus:bg-surface focus:px-2 focus:rounded-lg transition-all"
          />
          <div className="font-mono text-xs text-text-muted">{project.project_id}</div>
        </div>
      </div>

      {/* Main fields */}
      <Section title="Основное">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Логотип (URL)">
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              onBlur={() => logoUrl !== (project.logo_url || "") && patch({ logo_url: logoUrl || null }, "logo")}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
          <Field label="Статус">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                patch({ status: e.target.value }, "status");
              }}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== (project.description || "") && patch({ description: description || null }, "desc")}
            rows={4}
            placeholder="Подробное описание проекта"
            className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none resize-none"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Стоимость, $">
            <input
              type="number"
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              onBlur={() => Number(totalPrice) !== Number(project.total_price) && patch({ total_price: Number(totalPrice) }, "total")}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
          <Field label="Оплачено, $">
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              onBlur={() => Number(paidAmount) !== Number(project.paid_amount) && patch({ paid_amount: Number(paidAmount) }, "paid")}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </Field>
          <Field label="Партнёр">
            <select
              value={partnerId}
              onChange={(e) => {
                setPartnerId(e.target.value);
                patch({ partner_id: e.target.value || null }, "partner");
              }}
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

      {/* Progress */}
      <Section title="Общий прогресс">
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={progressPercent}
            onChange={(e) => setProgressPercent(Number(e.target.value))}
            onMouseUp={() => progressPercent !== project.progress_percent && patch({ progress_percent: progressPercent }, "progress")}
            onTouchEnd={() => progressPercent !== project.progress_percent && patch({ progress_percent: progressPercent }, "progress")}
            className="flex-1 accent-brand-500"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              value={progressPercent}
              onChange={(e) => setProgressPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
              onBlur={() => progressPercent !== project.progress_percent && patch({ progress_percent: progressPercent }, "progress")}
              className="w-20 px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none text-center"
            />
            <span className="text-sm text-text-muted">%</span>
          </div>
        </div>
        <div className="mt-3 h-3 bg-bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Section>

      {/* Stages */}
      <Section
        title="Этапы проекта"
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
        title="Разработчики"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={saveDevelopers}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Сохранить
            </button>
            <button
              onClick={addDeveloper}
              className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить
            </button>
          </div>
        }
      >
        {developers.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">
            Привяжи разработчиков — увидит партнёр.
          </p>
        ) : (
          <div className="space-y-2">
            {developers.map((d, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border-faint">
                <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {d.avatar_url ? (
                    <Image src={d.avatar_url} alt={d.name} width={36} height={36} unoptimized className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs font-bold text-purple-400">
                      {(d.name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <input
                  value={d.name}
                  onChange={(e) => updateDeveloper(i, { name: e.target.value })}
                  onBlur={saveDevelopers}
                  placeholder="Имя"
                  className="flex-1 px-2 py-1 text-sm bg-transparent border-0 focus:bg-bg-secondary rounded outline-none"
                />
                <input
                  value={d.role || ""}
                  onChange={(e) => updateDeveloper(i, { role: e.target.value })}
                  onBlur={saveDevelopers}
                  placeholder="Роль"
                  className="w-32 px-2 py-1 text-sm bg-transparent border-0 focus:bg-bg-secondary rounded outline-none text-text-secondary"
                />
                <input
                  value={d.avatar_url || ""}
                  onChange={(e) => updateDeveloper(i, { avatar_url: e.target.value })}
                  onBlur={saveDevelopers}
                  placeholder="Avatar URL"
                  className="w-40 px-2 py-1 text-xs bg-transparent border-0 focus:bg-bg-secondary rounded outline-none text-text-muted"
                />
                <button
                  onClick={() => removeDeveloper(i)}
                  className="w-7 h-7 rounded hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
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
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
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
  const [completed, setCompleted] = useState(stage.completed);

  return (
    <div className="rounded-lg border border-border-faint p-3 bg-bg-secondary/40">
      <div className="flex items-center gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-text-muted flex-shrink-0" />
        <div className="font-mono text-xs text-text-muted w-6">{index + 1}.</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== stage.title && onUpdate({ title })}
          className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-0 focus:bg-surface rounded outline-none"
        />
        <button
          onClick={() => {
            const next = !completed;
            setCompleted(next);
            onUpdate({ completed: next });
          }}
          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
            completed
              ? "bg-green-500/20 text-green-500"
              : "hover:bg-surface text-text-muted hover:text-text-secondary"
          }`}
          title={completed ? "Отметить незавершённым" : "Отметить завершённым"}
        >
          <Check className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={percent}
            onChange={(e) => setPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
            onBlur={() => percent !== stage.percent && onUpdate({ percent })}
            className="w-16 px-2 py-1 text-sm bg-transparent border border-border-faint rounded focus:border-brand-500 outline-none text-center"
          />
          <span className="text-xs text-text-muted">%</span>
        </div>
        <button
          onClick={onDelete}
          className="w-7 h-7 rounded hover:bg-red-500/10 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
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
