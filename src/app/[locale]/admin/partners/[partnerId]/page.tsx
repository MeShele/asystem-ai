"use client";

import { useEffect, useState, use, useMemo, useCallback } from "react";
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
  level: number;
  is_founding: boolean;
  last_activity_at: string | null;
}

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: number;
  totalPaid: number;
  totalCommission: number;
  totalPayouts: number;
  remainingCommission: number;
  foundingCount: number;
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
    level: 1,
    is_founding: false,
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
            level: Number(p.level || 1),
            is_founding: Boolean(p.is_founding),
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
      Number(form.commission_rate) !== Number(partner.commission_rate) ||
      form.level !== Number(partner.level || 1) ||
      form.is_founding !== Boolean(partner.is_founding)
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
        level: form.level,
        is_founding: form.is_founding,
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
          <StatCard icon={Wallet} label="Комиссия (всего)" value={`$${stats.totalCommission.toLocaleString("ru-RU")}`} sub="по полным суммам" color="text-amber-500" bg="bg-amber-500/10" />
          <StatCard icon={TrendingUp} label="Выплачено" value={`$${stats.totalPayouts.toLocaleString("ru-RU")}`} sub="фактические выплаты" color="text-green-500" bg="bg-green-500/10" />
          <StatCard icon={TrendingUp} label="Остаток" value={`$${stats.remainingCommission.toLocaleString("ru-RU")}`} sub="к выплате" color="text-orange-500" bg="bg-orange-500/10" />
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
            <Field label="Уровень партнёра (manual override)">
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              >
                <option value={1}>L1 🌱 Введённый — 15%</option>
                <option value={2}>L2 🚀 Активный — 20%</option>
                <option value={3}>L3 ⭐ Эксклюзив — 25%</option>
                <option value={4}>L4 🏆 Лидер ниши — 30%</option>
                <option value={5}>L5 👑 Стратегический — 40%</option>
              </select>
              <p className="text-[11px] text-text-muted mt-1">
                Авто-расчёт по acceptance работает при изменении проектов. Здесь можно вручную повысить/понизить.
              </p>
            </Field>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_founding}
                  onChange={(e) => setForm({ ...form, is_founding: e.target.checked })}
                  className="w-4 h-4 mt-0.5 accent-amber-500 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">⭐ Founding partner</span>
                    {stats && (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-mono font-semibold">
                        в системе: {stats.foundingCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Статус для тех, кто согласился работать в самом начале программы. Включает:
                  </p>
                  <ul className="text-[11px] text-text-secondary mt-1 space-y-0.5">
                    <li>• <span className="text-amber-600">+5%</span> к комиссии пожизненно</li>
                    <li>• Case-study rights — публикация опыта первым</li>
                    <li>• 6-мес гарантия возврата prepaid fees при 0 deals</li>
                  </ul>
                  <p className="text-[10px] text-text-muted mt-1.5 italic">
                    Авто-флаг ставится при регистрации первым 5 партнёрам. Сейчас {stats?.foundingCount ?? 0} {(stats?.foundingCount ?? 0) === 1 ? "партнёр" : "партнёров"} с этим статусом. Можно вручную изменить здесь.
                  </p>
                </div>
              </label>
            </div>
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

      {/* Sub-partners network */}
      <NetworkSection partnerId={partnerId} />
    </div>
  );
}

interface NetworkSubPartner {
  partner_id: string;
  name: string;
  email: string;
  level: number;
  is_founding: boolean;
  last_activity_at: string | null;
  created_at: string;
  status: string;
  deals_count: number;
  revenue: number | string;
  earned: number | string;
  my_override: number | string;
}

interface NetworkOverride {
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
  referrer: { partner_id: string; name: string } | null;
  subPartners: NetworkSubPartner[];
  overrides: NetworkOverride[];
  totals: { paid: number; pending: number; total: number };
}

function NetworkSection({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/partners/${partnerId}/network`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [partnerId]);

  useEffect(() => {
    load();
  }, [load]);

  const payOverride = async (id: number) => {
    if (!confirm("Отметить как выплачено? Партнёр получит уведомление.")) return;
    setPaying(id);
    try {
      const res = await fetch(`/api/admin/overrides/${id}/pay`, { method: "POST" });
      if (res.ok) {
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Ошибка");
      }
    } finally {
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border-faint bg-surface p-5">
        <div className="text-sm text-text-muted">Загрузка сети...</div>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Referrer (если есть) */}
      {data.referrer && (
        <div className="rounded-xl border border-purple-500/25 bg-purple-500/[0.04] p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-purple-500">
                {data.referrer.name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-purple-500 font-semibold">Этого партнёра пригласил</div>
              <button
                onClick={() => router.push(`/admin/partners/${data.referrer!.partner_id}`)}
                className="text-sm font-semibold hover:text-purple-500 transition-colors"
              >
                {data.referrer.name}
              </button>
            </div>
            <button
              onClick={() => router.push(`/admin/partners/${data.referrer!.partner_id}`)}
              className="text-xs text-purple-500 hover:text-purple-600 transition-colors"
            >
              открыть →
            </button>
          </div>
        </div>
      )}

      {/* Network section */}
      <div className="rounded-xl border border-border-faint bg-surface p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Sub-partners ({data.subPartners.length})</h3>
            {data.totals.pending > 0 && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-medium">
                ${data.totals.pending.toLocaleString("ru-RU")} к выплате
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span>выплачено: <span className="font-mono font-semibold text-green-600">${data.totals.paid.toLocaleString("ru-RU")}</span></span>
            <span>·</span>
            <span>всего: <span className="font-mono font-semibold">${data.totals.total.toLocaleString("ru-RU")}</span></span>
          </div>
        </div>

        {data.subPartners.length === 0 ? (
          <div className="p-6 rounded-lg border border-dashed border-border-faint text-center">
            <p className="text-xs text-text-muted">У партнёра пока нет sub-partners</p>
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {data.subPartners.map((s) => {
              const isActive =
                s.last_activity_at &&
                Date.now() - new Date(s.last_activity_at).getTime() <= 90 * 24 * 3600 * 1000 &&
                s.deals_count > 0;
              return (
                <button
                  key={s.partner_id}
                  onClick={() => router.push(`/admin/partners/${s.partner_id}`)}
                  className="w-full text-left p-3 rounded-lg border border-border-faint bg-bg-secondary/30 hover:bg-bg-secondary/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate">{s.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">L{s.level}</span>
                      {s.is_founding && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">founding</span>
                      )}
                      {isActive ? (
                        <span className="text-[10px] inline-flex items-center gap-1 text-green-600">
                          <span className="w-1 h-1 rounded-full bg-green-500" /> активен
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted">спит</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] flex-shrink-0">
                      <span className="text-text-muted">{s.deals_count} {s.deals_count === 1 ? "сделка" : "сделок"}</span>
                      <span className="font-mono text-green-600">${Number(s.earned).toLocaleString("ru-RU")} → партнёру</span>
                      <span className="font-mono font-bold text-purple-500">+${Number(s.my_override).toLocaleString("ru-RU")} override</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Override history */}
        {data.overrides.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted mb-2 mt-4">
              Override-начисления
            </div>
            <div className="space-y-1.5">
              {data.overrides.map((o) => {
                const isPending = o.status === "pending";
                return (
                  <div
                    key={o.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isPending ? "border-amber-500/30 bg-amber-500/[0.04]" : "border-border-faint bg-surface"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {o.project_name || o.project_id} ·{" "}
                        <span className="text-text-secondary">{o.sub_partner_name}</span>
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {o.override_pct}% от ${Number(o.sub_commission_amount).toLocaleString("ru-RU")} · L{o.sub_level} ·{" "}
                        {new Date(o.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-mono font-bold ${isPending ? "text-amber-600" : "text-green-600"}`}>
                        +${Number(o.override_amount).toLocaleString("ru-RU")}
                      </div>
                      <div className="text-[10px] text-text-muted">{isPending ? "ожидает" : "выплачено"}</div>
                    </div>
                    {isPending && (
                      <button
                        onClick={() => payOverride(o.id)}
                        disabled={paying === o.id}
                        className="px-2.5 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {paying === o.id ? "..." : "Выплатить"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
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
