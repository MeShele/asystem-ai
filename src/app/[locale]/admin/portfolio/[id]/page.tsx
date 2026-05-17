"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Save, Trash2, Globe, Lock, Building2, X, Plus, Star } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import {
  toPortfolioCase,
  toPortfolioCategory,
  type PortfolioCase,
  type PortfolioCategory,
  type PortfolioLocale,
  type PortfolioStatus,
  type PortfolioTranslation,
  type PortfolioTranslations,
  type PortfolioGalleryItem,
} from "@/lib/portfolio-types";

const LOCALES: PortfolioLocale[] = ["ru", "kg", "en"];
const LOCALE_LABEL: Record<PortfolioLocale, string> = { ru: "🇷🇺 RU", kg: "🇰🇬 KG", en: "🇬🇧 EN" };

interface EditableCase {
  id: number;
  slug: string;
  category_id: number | null;
  status: PortfolioStatus;
  public_url: string;
  is_featured: boolean;
  order_index: number;
  year: number | null;
  stack: string[];
  bg_color: string;
  logo_path: string | null;
  cover_path: string | null;
  gallery: PortfolioGalleryItem[];
  translations: PortfolioTranslations;
  contact_person: string;
  contact_role: string;
}

export default function PortfolioEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<EditableCase | null>(null);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLocale, setActiveLocale] = useState<PortfolioLocale>("ru");
  const [stackInput, setStackInput] = useState("");

  useEffect(() => {
    fetch(`/api/admin/portfolio/${id}`)
      .then((r) => r.json())
      .then((row) => {
        if (row.error) {
          router.push("/admin/portfolio");
          return;
        }
        const c = toPortfolioCase(row);
        setData({
          id: c.id,
          slug: c.slug,
          category_id: c.category_id,
          status: c.status,
          public_url: c.public_url ?? "",
          is_featured: c.is_featured,
          order_index: c.order_index,
          year: c.year,
          stack: c.stack,
          bg_color: c.bg_color,
          logo_path: c.logo_path,
          cover_path: c.cover_path,
          gallery: c.gallery,
          translations: c.translations,
          contact_person: c.contact_person ?? "",
          contact_role: c.contact_role ?? "",
        });
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/portfolio");
      });

    fetch("/api/admin/portfolio-categories")
      .then((r) => r.json())
      .then((rows) => setCategories(Array.isArray(rows) ? rows.map((r) => toPortfolioCategory(r)) : []))
      .catch(() => setCategories([]));
  }, [id, router]);

  const previewCase: PortfolioCase | null = useMemo(() => {
    if (!data) return null;
    return toPortfolioCase({
      id: data.id,
      slug: data.slug,
      category_id: data.category_id,
      status: data.status,
      public_url: data.status === "LIVE" && data.public_url.trim() ? data.public_url.trim() : null,
      is_featured: data.is_featured,
      order_index: data.order_index,
      year: data.year,
      stack: data.stack,
      bg_color: data.bg_color,
      logo_path: data.logo_path,
      cover_path: data.cover_path,
      gallery: data.gallery,
      translations: data.translations,
      contact_person: data.contact_person || null,
      contact_role: data.contact_role || null,
    });
  }, [data]);

  const updateTranslation = (locale: PortfolioLocale, patch: Partial<PortfolioTranslation>) => {
    setData((d) => d ? { ...d, translations: { ...d.translations, [locale]: { ...d.translations[locale], name: d.translations[locale]?.name ?? "", ...patch } as PortfolioTranslation } } : d);
  };

  const addStack = () => {
    const v = stackInput.trim();
    if (!v) return;
    setData((d) => d ? { ...d, stack: [...d.stack, v] } : d);
    setStackInput("");
  };
  const removeStack = (i: number) => setData((d) => d ? { ...d, stack: d.stack.filter((_, idx) => idx !== i) } : d);

  const addTask = (locale: PortfolioLocale) => {
    setData((d) => {
      if (!d) return d;
      const t = d.translations[locale] ?? { name: "" };
      return { ...d, translations: { ...d.translations, [locale]: { ...t, tasks: [...(t.tasks ?? []), ""] } as PortfolioTranslation } };
    });
  };
  const updateTask = (locale: PortfolioLocale, i: number, value: string) => {
    setData((d) => {
      if (!d) return d;
      const t = d.translations[locale] ?? { name: "" };
      const tasks = [...(t.tasks ?? [])];
      tasks[i] = value;
      return { ...d, translations: { ...d.translations, [locale]: { ...t, tasks } as PortfolioTranslation } };
    });
  };
  const removeTask = (locale: PortfolioLocale, i: number) => {
    setData((d) => {
      if (!d) return d;
      const t = d.translations[locale] ?? { name: "" };
      const tasks = (t.tasks ?? []).filter((_, idx) => idx !== i);
      return { ...d, translations: { ...d.translations, [locale]: { ...t, tasks } as PortfolioTranslation } };
    });
  };

  const addGalleryImage = (dataUrl: string | null) => {
    if (!dataUrl) return;
    setData((d) => d ? { ...d, gallery: [...d.gallery, { path: dataUrl }] } : d);
  };
  const removeGalleryImage = (i: number) => setData((d) => d ? { ...d, gallery: d.gallery.filter((_, idx) => idx !== i) } : d);

  const save = async () => {
    if (!data || saving) return;
    setSaving(true);
    const res = await fetch(`/api/admin/portfolio/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: data.slug,
        category_id: data.category_id,
        status: data.status,
        public_url: data.public_url,
        is_featured: data.is_featured,
        order_index: data.order_index,
        year: data.year,
        stack: data.stack,
        bg_color: data.bg_color,
        logo_path: data.logo_path,
        cover_path: data.cover_path,
        gallery: data.gallery,
        translations: data.translations,
        contact_person: data.contact_person,
        contact_role: data.contact_role,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const updated = await res.json();
      const c = toPortfolioCase(updated);
      setData((d) => d ? { ...d, slug: c.slug, logo_path: c.logo_path, cover_path: c.cover_path, gallery: c.gallery } : d);
    } else {
      const err = await res.json().catch(() => ({ error: "unknown" }));
      alert(err.error ?? "Не удалось сохранить");
    }
  };

  const remove = async () => {
    if (!data) return;
    if (!confirm("Удалить кейс безвозвратно?")) return;
    const res = await fetch(`/api/admin/portfolio/${data.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/portfolio");
  };

  if (loading || !data) {
    return <div className="p-8 text-text-muted">Загрузка...</div>;
  }

  const currentT = data.translations[activeLocale] ?? { name: "" };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <button onClick={() => router.push("/admin/portfolio")} className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> К списку портфолио
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {data.translations.ru?.name || data.slug}
          </h1>
          <div className="font-mono text-xs text-text-muted">/{data.slug}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={remove} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/5 text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" /> Удалить
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" /> {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* FORM */}
        <div className="space-y-6">
          {/* Block: status & URL */}
          <Block title="Статус и публичная ссылка">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(["LIVE", "NDA", "INTERNAL"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setData((d) => d ? { ...d, status: s } : d)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                    data.status === s ? "bg-brand-500 text-white border-brand-500" : "bg-bg-secondary text-text-secondary border-border-faint hover:border-brand-500/40"
                  }`}
                >
                  {s === "LIVE" ? <Globe className="w-3.5 h-3.5" /> : s === "NDA" ? <Lock className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                  {s}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mb-3">
              <strong>LIVE</strong> — есть публичный сайт · <strong>NDA</strong> — закрытый контур · <strong>INTERNAL</strong> — внутренняя система клиента
            </p>
            {data.status === "LIVE" && (
              <Field label="URL сайта (обязательно для LIVE)">
                <input
                  type="url"
                  value={data.public_url}
                  onChange={(e) => setData((d) => d ? { ...d, public_url: e.target.value } : d)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
              </Field>
            )}

            <label className="flex items-center gap-2 mt-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={data.is_featured}
                onChange={(e) => setData((d) => d ? { ...d, is_featured: e.target.checked } : d)}
                className="w-4 h-4 accent-brand-500"
              />
              <Star className={`w-4 h-4 ${data.is_featured ? "text-orange-500 fill-orange-500" : "text-text-muted"}`} />
              <span className="text-sm text-text-primary">Показывать на главной (максимум 4)</span>
            </label>
          </Block>

          {/* Block: translations */}
          <Block title="Тексты">
            <div className="flex items-center gap-1 mb-4 border-b border-border-faint">
              {LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLocale(l)}
                  className={`px-3 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
                    activeLocale === l ? "border-brand-500 text-brand-500" : "border-transparent text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {LOCALE_LABEL[l]}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Field label="Название клиента / продукта *">
                <input
                  value={currentT.name ?? ""}
                  onChange={(e) => updateTranslation(activeLocale, { name: e.target.value })}
                  placeholder={activeLocale === "ru" ? "Fiatex" : activeLocale === "kg" ? "Fiatex" : "Fiatex"}
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
              </Field>
              <Field label="Подзаголовок (1 строка)">
                <input
                  value={currentT.tagline ?? ""}
                  onChange={(e) => updateTranslation(activeLocale, { tagline: e.target.value })}
                  placeholder={activeLocale === "ru" ? "OTC Desk для криптообменника" : "OTC Desk"}
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
              </Field>
              <Field label="Результат (одна сильная строка)">
                <input
                  value={currentT.result ?? ""}
                  onChange={(e) => updateTranslation(activeLocale, { result: e.target.value })}
                  placeholder={activeLocale === "ru" ? "Снизили обработку на 47%" : "−47% processing time"}
                  maxLength={80}
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
                <p className="text-[11px] text-text-muted mt-1">Это крупная цифра/факт на карточке. Максимум 80 символов.</p>
              </Field>
              <Field label="Описание проекта (для детальной страницы)">
                <textarea
                  value={currentT.description ?? ""}
                  onChange={(e) => updateTranslation(activeLocale, { description: e.target.value })}
                  rows={5}
                  placeholder="2-3 абзаца о проекте — что это, для кого, какую задачу решает."
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none resize-y"
                />
              </Field>

              {/* Tasks bullets */}
              <Field label="Что сделали (буллеты)">
                <div className="space-y-2">
                  {(currentT.tasks ?? []).map((task, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-brand-500 text-xs">→</span>
                      <input
                        value={task}
                        onChange={(e) => updateTask(activeLocale, i, e.target.value)}
                        placeholder="Запустили систему KYC через SumSub"
                        className="flex-1 px-3 py-1.5 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                      />
                      <button onClick={() => removeTask(activeLocale, i)} className="text-text-muted hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addTask(activeLocale)} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400">
                    <Plus className="w-3.5 h-3.5" /> Добавить буллет
                  </button>
                </div>
              </Field>
            </div>
          </Block>

          {/* Block: meta */}
          <Block title="Категория и метаданные">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Категория">
                <select
                  value={data.category_id ?? ""}
                  onChange={(e) => setData((d) => d ? { ...d, category_id: e.target.value ? Number(e.target.value) : null } : d)}
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                >
                  <option value="">— Без категории —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.translations.ru?.name ?? c.slug}</option>
                  ))}
                </select>
              </Field>
              <Field label="Год">
                <input
                  type="number"
                  value={data.year ?? ""}
                  onChange={(e) => setData((d) => d ? { ...d, year: e.target.value ? Number(e.target.value) : null } : d)}
                  placeholder="2026"
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
              </Field>
              <Field label="Порядок (меньше = выше)">
                <input
                  type="number"
                  value={data.order_index}
                  onChange={(e) => setData((d) => d ? { ...d, order_index: Number(e.target.value) || 0 } : d)}
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
              </Field>
              <Field label="Цвет фона карточки">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.bg_color}
                    onChange={(e) => setData((d) => d ? { ...d, bg_color: e.target.value } : d)}
                    className="w-10 h-10 rounded-lg border border-border-faint cursor-pointer"
                  />
                  <input
                    value={data.bg_color}
                    onChange={(e) => setData((d) => d ? { ...d, bg_color: e.target.value } : d)}
                    className="flex-1 px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg font-mono focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                  />
                </div>
              </Field>
            </div>

            <Field label="Стек технологий">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.stack.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-bg-secondary border border-border-faint rounded-full">
                    {s}
                    <button onClick={() => removeStack(i)} className="text-text-muted hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStack())}
                  placeholder="React, Next.js, PostgreSQL..."
                  className="flex-1 px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
                <button onClick={addStack} className="px-3 py-2 text-sm rounded-lg bg-brand-500 hover:bg-brand-400 text-white">Добавить</button>
              </div>
            </Field>
          </Block>

          {/* Block: images */}
          <Block title="Изображения">
            <ImageUpload
              label="Логотип клиента (квадратный, прозрачный фон)"
              value={data.logo_path}
              onChange={(v) => setData((d) => d ? { ...d, logo_path: v } : d)}
              maxSize={512}
            />
            <div className="mt-4">
              <ImageUpload
                label="Обложка для детальной страницы (16:9)"
                value={data.cover_path}
                onChange={(v) => setData((d) => d ? { ...d, cover_path: v } : d)}
                maxSize={1600}
              />
            </div>

            <div className="mt-6">
              <label className="block text-xs font-medium text-text-secondary mb-2">Галерея скриншотов</label>
              {data.gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {data.gallery.map((g, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-border-faint aspect-video bg-bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.path} alt={g.alt ?? ""} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ImageUpload
                label=""
                value={null}
                onChange={addGalleryImage}
                maxSize={1600}
                hint="Добавь скриншот в галерею"
              />
            </div>
          </Block>

          {/* Block: contact */}
          <Block title="Контактное лицо клиента (для NDA-карточек)">
            <p className="text-[11px] text-text-muted mb-3">
              Когда нет публичной ссылки — имя живого человека, готового подтвердить кейс, ценнее логотипа.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Имя">
                <input
                  value={data.contact_person}
                  onChange={(e) => setData((d) => d ? { ...d, contact_person: e.target.value } : d)}
                  placeholder="Айбек К."
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
              </Field>
              <Field label="Должность">
                <input
                  value={data.contact_role}
                  onChange={(e) => setData((d) => d ? { ...d, contact_role: e.target.value } : d)}
                  placeholder="CTO АУРВА"
                  className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
                />
              </Field>
            </div>
          </Block>
        </div>

        {/* PREVIEW (sticky) */}
        <div>
          <div className="sticky top-6 space-y-3">
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider px-1">Превью карточки</div>
            {previewCase && <PortfolioCard case={previewCase} locale={activeLocale} variant="compact" contactLabel="Подтвердит" />}
            <p className="text-[11px] text-text-muted px-1">
              Так карточка выглядит на странице <code className="font-mono">/projects</code>. Превью обновляется на каждый ввод и переключается между языками вместе с табом «Тексты» выше.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>}
      {children}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-5">
      <h2 className="text-sm font-semibold text-text-primary mb-4">{title}</h2>
      {children}
    </div>
  );
}
