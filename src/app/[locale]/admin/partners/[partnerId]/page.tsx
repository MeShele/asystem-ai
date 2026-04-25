"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Save,
  Clock,
  Mail,
  Phone,
  Send,
  RefreshCcw,
  Wallet,
  TrendingUp,
  FolderKanban,
  Copy,
  Check,
} from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/shared/project-card";

interface Partner {
  partner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  ref_code: string;
  commission_rate: number;
  status: string;
  telegram_username: string | null;
  created_at: string;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: number;
  totalPaid: number;
  totalCommission: number;
  earnedCommission: number;
}

const statusOptions = [
  { value: "active", label: "Активен" },
  { value: "pending", label: "Ожидает" },
  { value: "blocked", label: "Заблокирован" },
];

export default function AdminPartnerDetailPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = use(params);
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "active",
    commission_rate: 0.15,
  });

  const load = () => {
    fetch(`/api/admin/partners/${partnerId}`)
      .then((r) => r.json())
      .then((data) => {
        const p: Partner | null = data.partner || null;
        setPartner(p);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setStats(data.stats || null);
        if (p) {
          setForm({
            name: p.name || "",
            email: p.email || "",
            phone: p.phone || "",
            company: p.company || "",
            status: p.status || "active",
            commission_rate: Number(p.commission_rate ?? 0.15),
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [partnerId]);

  const dirty = useMemo(() => {
    if (!partner) return false;
    return (
      form.name !== (partner.name || "") ||
      form.email !== (partner.email || "") ||
      form.phone !== (partner.phone || "") ||
      form.company !== (partner.company || "") ||
      form.status !== partner.status ||
      Number(form.commission_rate) !== Number(partner.commission_rate)
    );
  }, [form, partner]);

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    const res = await fetch(`/api/admin/partners/${partnerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        company: form.company || null,
        status: form.status,
        commission_rate: Number(form.commission_rate),
      }),
    });
    setSaving(false);
    if (res.ok) load();
  };

  const handleReset = async () => {
    if (!partner) return;
    if (!confirm(`Сбросить legacy-данные «${partner.name}»? Удалит старые заявки, сообщения, достижения. Новые проекты не затрагиваются.`)) return;
    setResetting(true);
    const res = await fetch(`/api/admin/partners/${partnerId}/reset`, { method: "POST" });
    setResetting(false);
    if (res.ok) {
      alert("Legacy-данные сброшены");
      load();
    }
  };

  const copyRefLink = async () => {
    if (!partner) return;
    const link = `${window.location.origin}/ru/client/request?ref=${partner.ref_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-16 text-center">
        <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
        <p className="text-text-muted text-sm">Загрузка...</p>
      </div>
    );
  }
  if (!partner) {
    return (
      <div className="p-8">
        <button onClick={() => router.push("/admin/partners")} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <p className="text-text-muted">Партнёр не найден</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => router.push("/admin/partners")} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" /> К списку партнёров
        </button>
        <div className="flex items-center gap-2">
          {dirty && <span className="text-xs text-orange-400">● Несохранённые изменения</span>}
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {saving ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-sm transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${resetting ? "animate-spin" : ""}`} /> Сбросить legacy
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-purple-400">
            {partner.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="text-2xl font-bold bg-transparent border-0 outline-none w-full focus:bg-surface focus:px-2 focus:rounded-lg transition-all"
          />
          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
            <span className="font-mono">{partner.partner_id}</span>
            <span>·</span>
            <span>{new Date(partner.created_at).toLocaleDateString("ru-RU")}</span>
            {partner.telegram_username && (
              <>
                <span>·</span>
                <span className="text-blue-400">@{partner.telegram_username}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={FolderKanban} label="Проектов" value={stats.totalProjects} sub={`${stats.activeProjects} активных`} color="text-brand-500" bg="bg-brand-500/10" />
          <StatCard icon={Wallet} label="Объём" value={`$${stats.totalValue.toLocaleString("ru-RU")}`} sub={`оплачено $${stats.totalPaid.toLocaleString("ru-RU")}`} color="text-purple-500" bg="bg-purple-500/10" />
          <StatCard icon={TrendingUp} label="Комиссия (всего)" value={`$${stats.totalCommission.toLocaleString("ru-RU")}`} sub="по полным суммам" color="text-amber-500" bg="bg-amber-500/10" />
          <StatCard icon={TrendingUp} label="Заработано" value={`$${stats.earnedCommission.toLocaleString("ru-RU")}`} sub="по оплаченному" color="text-green-500" bg="bg-green-500/10" />
        </div>
      )}

      {/* Contacts and settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <Section title="Контакты">
          <div className="grid grid-cols-1 gap-3">
            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
            <Field label="Телефон" icon={Phone}>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+996..."
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
            <Field label="Компания">
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
          </div>
        </Section>

        <Section title="Партнёрские настройки">
          <div className="grid grid-cols-1 gap-3">
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
            <Field label="Базовая комиссия (legacy, доли)">
              <input
                type="number"
                step={0.01}
                min={0}
                max={1}
                value={form.commission_rate}
                onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
            </Field>
            <Field label="Реферальная ссылка" icon={Send}>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`/ru/client/request?ref=${partner.ref_code}`}
                  className="flex-1 px-3 py-2 text-xs bg-bg-secondary border border-border-faint rounded-lg font-mono"
                />
                <button
                  onClick={copyRefLink}
                  className="px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Скопировано" : "Копировать"}
                </button>
              </div>
            </Field>
          </div>
        </Section>
      </div>

      {/* Projects */}
      <div className="rounded-xl border border-border-faint bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Проекты партнёра ({projects.length})</h3>
          <button
            onClick={() => router.push("/admin/projects")}
            className="text-xs text-brand-500 hover:text-brand-400"
          >
            К списку всех проектов →
          </button>
        </div>
        {projects.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">
            Проектов пока нет. Привяжите проект из{" "}
            <button
              onClick={() => router.push("/admin/projects")}
              className="text-brand-500 hover:underline"
            >
              админки проектов
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                index={i}
                showPartner={false}
                onClick={() => router.push(`/admin/projects/${p.project_id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="p-4 rounded-xl border border-border-faint bg-surface">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
      {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}
