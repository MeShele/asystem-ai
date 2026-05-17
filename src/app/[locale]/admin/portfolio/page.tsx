"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Plus, Search, Briefcase, Clock, X, Tags, Star, Lock, Globe, Building2, GripVertical } from "lucide-react";
import { toPortfolioCase, toPortfolioCategory, type PortfolioCase, type PortfolioCategory } from "@/lib/portfolio-types";

export default function AdminPortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioCase[]>([]);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "LIVE" | "NDA" | "INTERNAL">("all");

  const load = () => {
    fetch("/api/admin/portfolio")
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data.map((r) => toPortfolioCase(r)) : []);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
    fetch("/api/admin/portfolio-categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data.map((r) => toPortfolioCategory(r)) : []))
      .catch(() => setCategories([]));
  };

  useEffect(load, []);

  const filtered = items.filter((it) => {
    if (filterStatus !== "all" && it.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      it.slug.toLowerCase().includes(q) ||
      it.translations.ru?.name?.toLowerCase().includes(q) ||
      it.translations.en?.name?.toLowerCase().includes(q)
    );
  });

  const total = items.length;
  const live = items.filter((i) => i.status === "LIVE").length;
  const featured = items.filter((i) => i.is_featured).length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Портфолио</h1>
          <p className="text-text-secondary text-sm">
            Публичная витрина проектов на главной и странице <code className="font-mono text-xs">/projects</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или slug..."
              className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-56 lg:w-72 transition-all"
            />
          </div>
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-secondary hover:bg-surface-raised border border-border-faint text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
          >
            <Tags className="w-4 h-4" />
            Категории
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Новый кейс
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Всего кейсов", value: total, color: "text-brand-500" },
          { label: "LIVE (с ссылкой)", value: live, color: "text-emerald-500" },
          { label: "На главной", value: `${featured} / 4`, color: featured === 4 ? "text-orange-500" : "text-brand-500" },
          { label: "Категорий", value: categories.length, color: "text-text-primary" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border-faint bg-surface">
            <div className="text-xs text-text-muted mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["all", "LIVE", "NDA", "INTERNAL"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === s ? "bg-brand-500 text-white" : "bg-surface border border-border-faint text-text-secondary hover:text-text-primary"
            }`}
          >
            {s === "all" ? "Все" : s}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="p-16 text-center">
          <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
          <p className="text-text-muted text-sm">Загрузка...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center rounded-xl border border-border-faint bg-surface">
          <Briefcase className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm mb-3">
            {search || filterStatus !== "all" ? "Ничего не найдено" : "Кейсов пока нет"}
          </p>
          {!search && filterStatus === "all" && (
            <button
              onClick={() => setShowCreate(true)}
              className="text-brand-500 hover:text-brand-400 text-sm font-medium"
            >
              Создать первый кейс
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border-faint bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-secondary border-b border-border-faint text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left w-10"></th>
                <th className="px-4 py-3 text-left">Кейс</th>
                <th className="px-4 py-3 text-left">Категория</th>
                <th className="px-4 py-3 text-left">Статус</th>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-center">Главная</th>
                <th className="px-4 py-3 text-right">Год</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr
                  key={it.id}
                  onClick={() => router.push(`/admin/portfolio/${it.id}`)}
                  className="border-b border-border-faint last:border-0 hover:bg-bg-secondary cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-text-muted"><GripVertical className="w-4 h-4" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: it.bg_color }}
                      >
                        {it.logo_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.logo_path} alt="" className="max-w-[80%] max-h-[80%] object-contain" />
                        ) : (
                          (it.translations.ru?.name ?? it.slug).slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary truncate">{it.translations.ru?.name ?? it.slug}</div>
                        <div className="font-mono text-[11px] text-text-muted truncate">{it.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {it.category_slug ? <span className="px-2 py-0.5 text-[11px] bg-bg-secondary border border-border-faint rounded-full">{it.category_slug}</span> : <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={it.status} />
                  </td>
                  <td className="px-4 py-3">
                    {it.kind === "linked" ? (
                      <a href={it.public_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-brand-500 hover:underline truncate inline-block max-w-[200px]">
                        {it.public_url.replace(/^https?:\/\//, "")}
                      </a>
                    ) : <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {it.is_featured ? <Star className="w-4 h-4 text-orange-500 inline-block fill-orange-500" /> : <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary tabular-nums">{it.year ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateCaseModal
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            router.push(`/admin/portfolio/${id}`);
          }}
        />
      )}

      {showCategories && (
        <CategoriesModal
          categories={categories}
          onClose={() => {
            setShowCategories(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: PortfolioCase["status"] }) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600">
        <Globe className="w-3 h-3" /> LIVE
      </span>
    );
  }
  if (status === "NDA") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-text-muted/10 text-text-secondary">
        <Lock className="w-3 h-3" /> NDA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-text-muted/10 text-text-secondary">
      <Building2 className="w-3 h-3" /> INTERNAL
    </span>
  );
}

function CreateCaseModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: number) => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim() || undefined,
        translations: { ru: { name: name.trim() } },
        status: "NDA",
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      const created = await res.json();
      onCreated(Number(created.id));
    } else {
      alert("Не удалось создать кейс");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border-faint bg-surface shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-faint">
          <h2 className="text-lg font-semibold">Новый кейс</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Название (RU) *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Fiatex"
              autoFocus
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
            />
          </Field>
          <Field label="Slug (опционально, авто из названия)">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="fiatex"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg font-mono text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
            />
          </Field>
          <p className="text-[11px] text-text-muted">Кейс создаётся со статусом NDA. Все остальные поля заполнишь в редакторе.</p>
        </div>
        <div className="flex items-center justify-end gap-2 p-5 border-t border-border-faint">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">Отмена</button>
          <button
            onClick={submit}
            disabled={!name.trim() || submitting}
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {submitting ? "Создаём..." : "Создать и редактировать →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriesModal({ categories, onClose }: { categories: PortfolioCategory[]; onClose: () => void }) {
  const [list, setList] = useState(categories);
  const [newRu, setNewRu] = useState("");
  const [newKg, setNewKg] = useState("");
  const [newEn, setNewEn] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async () => {
    if (!newRu.trim() || busy) return;
    setBusy(true);
    const res = await fetch("/api/admin/portfolio-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        translations: {
          ru: { name: newRu.trim() },
          kg: newKg.trim() ? { name: newKg.trim() } : undefined,
          en: newEn.trim() ? { name: newEn.trim() } : undefined,
        },
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setList((prev) => [...prev, toPortfolioCategory(created)]);
      setNewRu("");
      setNewKg("");
      setNewEn("");
    }
    setBusy(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Удалить категорию? Кейсы останутся, но потеряют привязку.")) return;
    const res = await fetch(`/api/admin/portfolio-categories/${id}`, { method: "DELETE" });
    if (res.ok) setList((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border-faint bg-surface shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-faint">
          <h2 className="text-lg font-semibold">Категории портфолио</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-raised flex items-center justify-center">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {list.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Категорий пока нет.</p>
          ) : (
            <div className="space-y-2">
              {list.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border-faint bg-bg-secondary">
                  <div>
                    <div className="text-sm font-medium text-text-primary">{c.translations.ru?.name ?? c.slug}</div>
                    <div className="font-mono text-[11px] text-text-muted">{c.slug}</div>
                  </div>
                  <button onClick={() => remove(c.id)} className="text-text-muted hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-border-faint">
            <div className="text-xs font-medium text-text-secondary mb-2">Добавить категорию</div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input value={newRu} onChange={(e) => setNewRu(e.target.value)} placeholder="RU · Финтех"
                className="px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none" />
              <input value={newKg} onChange={(e) => setNewKg(e.target.value)} placeholder="KG · Финтех"
                className="px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none" />
              <input value={newEn} onChange={(e) => setNewEn(e.target.value)} placeholder="EN · Fintech"
                className="px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none" />
            </div>
            <button onClick={create} disabled={!newRu.trim() || busy}
              className="w-full px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {busy ? "Добавляем..." : "Добавить"}
            </button>
          </div>
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
