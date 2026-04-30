"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search, FolderKanban, Plus, Clock, X } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/shared/project-card";
import { ImageUpload } from "@/components/shared/image-upload";

interface Partner {
  partner_id: string;
  name: string;
  company?: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProjects([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    fetch("/api/partners")
      .then((r) => r.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]));
  }, []);

  const filtered = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.project_id?.toLowerCase().includes(q) ||
      p.partner_name?.toLowerCase().includes(q)
    );
  });

  const totalProjects = projects.length;
  const inProgress = projects.filter((p) => p.status === "active" || p.status === "review").length;
  const completed = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Проекты</h1>
          <p className="text-text-secondary text-sm">
            Управление проектами и привязка к партнёрам
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию, ID, партнёру..."
              className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-56 lg:w-72 transition-all"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Новый проект
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего проектов", value: totalProjects, color: "text-brand-500" },
          { label: "В работе", value: inProgress, color: "text-orange-500" },
          { label: "Завершено", value: completed, color: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border-faint bg-surface">
            <div className="text-xs text-text-muted mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
          <p className="text-text-muted text-sm">Загрузка...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-border-faint bg-surface">
          <FolderKanban className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm mb-3">
            {search ? "Ничего не найдено" : "Проектов пока нет"}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreate(true)}
              className="text-brand-500 hover:text-brand-400 text-sm font-medium"
            >
              Создать первый проект
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              onClick={() => router.push(`/admin/projects/${p.project_id}`)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          partners={partners}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateProjectModal({
  partners,
  onClose,
  onCreated,
}: {
  partners: Partner[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [tier, setTier] = useState("S");
  const [status, setStatus] = useState("planning");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim() || null,
        logo_url: logoUrl.trim() || null,
        total_price: Number(totalPrice) || 0,
        paid_amount: Number(paidAmount) || 0,
        partner_id: partnerId || null,
        tier,
        status,
      }),
    });
    setSubmitting(false);
    if (res.ok) onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-faint bg-surface shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-faint">
          <h2 className="text-lg font-semibold">Новый проект</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Название проекта *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Корпоративный портал"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
            />
          </Field>

          <Field label="Описание">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание проекта"
              rows={3}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none resize-none"
            />
          </Field>

          <ImageUpload
            label="Логотип"
            value={logoUrl || null}
            onChange={(v) => setLogoUrl(v || "")}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Стоимость, $">
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
              />
            </Field>
            <Field label="Оплачено, $">
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Партнёр">
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
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
            <Field label="Тир">
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
              >
                <option value="S">S · MVP ($500–5K, 1–2 нед)</option>
                <option value="M">M · Кастом ($5K–30K, 2–6 нед)</option>
                <option value="L">L · Полная упаковка ($30K–100K, 1–3 мес)</option>
                <option value="XL">XL · Enterprise ($100K+, 3+ мес)</option>
              </select>
            </Field>
          </div>
          <p className="text-[11px] text-text-muted">
            Процент партнёра вычислится автоматически из его текущего уровня.
          </p>

          <Field label="Статус">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
            >
              <option value="planning">Планирование</option>
              <option value="active">В работе</option>
              <option value="review">На проверке</option>
              <option value="completed">Завершён</option>
              <option value="paused">На паузе</option>
              <option value="cancelled">Отменён</option>
            </select>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-border-faint">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || submitting}
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {submitting ? "Создаём..." : "Создать"}
          </button>
        </div>
      </div>
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
