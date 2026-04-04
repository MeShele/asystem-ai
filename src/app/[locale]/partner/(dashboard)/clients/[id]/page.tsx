"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Hash,
  Building2,
  Calendar,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Pencil,
  Calculator,
} from "lucide-react";
import { useParams } from "next/navigation";
import type { Client, CalculatorConfig, KpStatus } from "@/types/partner";
import { statusLabels } from "@/types/partner";
import { ProjectCalculator } from "@/components/partner/project-calculator";
import { KpChat } from "@/components/partner/kp-chat";

/* ─── Helpers ─── */

function getLocale(): string {
  if (typeof window === "undefined") return "ru";
  return window.location.pathname.split("/")[1] || "ru";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ─── Debounce hook ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((...args: any[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    }) as T,
    [delay],
  );
}

/* ─── KP Status Section ─── */

function KpStatusCard({
  project,
  onSubmitKp,
  onResetToDraft,
  submitting,
}: {
  project: Client;
  onSubmitKp: () => void;
  onResetToDraft: () => void;
  submitting: boolean;
}) {
  const locale = getLocale();

  const statusMap: Record<KpStatus, React.ReactNode> = {
    none: (
      <div className="flex items-center gap-3 text-text-muted">
        <FileText className="w-5 h-5" />
        <span className="text-sm">КП не создано</span>
      </div>
    ),
    draft: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-text-secondary">
          <Pencil className="w-4 h-4" />
          <span className="text-sm font-medium">Черновик КП</span>
        </div>
        <button
          onClick={onSubmitKp}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Отправка..." : "Отправить на согласование"}
        </button>
      </div>
    ),
    submitted: (
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
        </span>
        <div>
          <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
            Ожидает проверки...
          </div>
          {project.kp_submitted_at && (
            <div className="text-xs text-text-muted mt-0.5">
              Отправлено {formatDate(project.kp_submitted_at)}
            </div>
          )}
        </div>
      </div>
    ),
    rejected: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <XCircle className="w-4 h-4" />
          <span className="text-sm font-medium">КП отклонено</span>
        </div>
        {project.kp_admin_feedback && (
          <div className="p-3 rounded-lg bg-red-500/[0.06] border border-red-500/20 text-sm text-red-600 dark:text-red-400">
            {project.kp_admin_feedback}
          </div>
        )}
        <button
          onClick={onResetToDraft}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border-faint text-sm font-medium hover:bg-overlay-subtle transition-colors disabled:opacity-50"
        >
          <Pencil className="w-4 h-4" />
          Исправить
        </button>
      </div>
    ),
    approved: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">КП одобрено</span>
        </div>
        <a
          href={`/${locale}/partner/clients/${project.id}/kp-print`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Скачать PDF
        </a>
      </div>
    ),
  };

  return statusMap[project.kp_status] ?? statusMap.none;
}

/* ─── Main Page ─── */

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const locale = getLocale();

  const [project, setProject] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [kpContent, setKpContent] = useState("");
  const [editingKp, setEditingKp] = useState(false);
  const [basePrice, setBasePrice] = useState(0);
  const [partnerPrice, setPartnerPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savingDesc, setSavingDesc] = useState(false);
  const [savingKp, setSavingKp] = useState(false);
  const [kpMessages, setKpMessages] = useState<Array<{id: number; role: string; content: string; created_at: string}>>([]);

  /* Fetch project */
  const fetchProject = useCallback(() => {
    if (!projectId) return;
    fetch(`/api/partner/clients/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((data: Client & { kpMessages?: Array<{id: number; role: string; content: string; created_at: string}> }) => {
        setProject(data);
        setDescription(data.description ?? "");
        setKpContent(data.kp_content ?? "");
        setBasePrice(data.base_price ?? 0);
        setPartnerPrice(data.partner_price ?? 0);
        setKpMessages(data.kpMessages ?? []);
      })
      .catch(() => {
        window.location.href = `/${locale}/partner/login`;
      })
      .finally(() => setLoading(false));
  }, [projectId, locale]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  /* Save description */
  async function saveDescription() {
    if (!project) return;
    setSavingDesc(true);
    try {
      await fetch(`/api/partner/clients/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
    } finally {
      setSavingDesc(false);
    }
  }

  /* Save KP content */
  async function saveKpContent() {
    if (!project) return;
    setSavingKp(true);
    try {
      const res = await fetch(`/api/partner/clients/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kp_content: kpContent }),
      });
      if (res.ok) {
        setProject((prev) =>
          prev
            ? {
                ...prev,
                kp_content: kpContent,
                kp_status: prev.kp_status === "none" ? "draft" : prev.kp_status,
              }
            : prev,
        );
        setEditingKp(false);
      }
    } finally {
      setSavingKp(false);
    }
  }

  /* Debounced calculator save */
  const debouncedCalcSave = useDebouncedCallback((config: CalculatorConfig) => {
    if (!project) return;
    fetch(`/api/partner/clients/${project.id}/calculator`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  }, 1000);

  /* Submit KP */
  async function submitKp() {
    if (!project) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/partner/clients/${project.id}/kp/submit`,
        { method: "POST" },
      );
      if (res.ok) {
        setProject((prev) =>
          prev ? { ...prev, kp_status: "submitted" as KpStatus } : prev,
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* Reset to draft (after rejection) */
  async function resetToDraft() {
    if (!project) return;
    setSubmitting(true);
    try {
      setProject((prev) =>
        prev ? { ...prev, kp_status: "draft" as KpStatus } : prev,
      );
      setEditingKp(true);
    } finally {
      setSubmitting(false);
    }
  }

  /* Commission formula */
  function calcCommission(base: number, partner: number): number {
    return Math.round(base * 0.15 + Math.max(0, (partner - base) * 0.5));
  }

  /* Loading state */
  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const status = statusLabels[project.status] ?? {
    label: project.status,
    color: "bg-gray-500/10 text-gray-500",
  };
  const commission = calcCommission(basePrice, partnerPrice);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ─── LEFT COLUMN (60%) ─── */}
        <div className="flex-1 lg:w-[60%] min-w-0 space-y-6">
          {/* Back link */}
          <motion.a
            href={`/${locale}/partner/clients`}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Все проекты
          </motion.a>

          {/* Project header */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-bg-secondary text-xs text-text-muted font-mono">
                <Hash className="w-3 h-3" />
                {project.request_id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
              >
                {status.label}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold">{project.client_name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              {project.client_company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-text-muted" />
                  {project.client_company}
                </span>
              )}
              {project.project_type && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 text-xs font-medium">
                  {project.project_type}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-text-muted text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(project.created_at)}
              </span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            className="rounded-xl border border-border-faint bg-surface p-5 space-y-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-text-muted uppercase tracking-wider">
                Описание проекта
              </div>
              {savingDesc && (
                <span className="text-xs text-text-muted">Сохранение...</span>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription}
              placeholder="Добавьте описание проекта..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-faint text-sm text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-brand-500/40 transition-colors"
            />
          </motion.div>

          {/* Calculator */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-text-muted" />
              <h2 className="text-lg font-semibold">Калькулятор проекта</h2>
            </div>
            <ProjectCalculator
              initialConfig={project.calculator_config ?? undefined}
              onConfigChange={(config) => debouncedCalcSave(config)}
              onPriceChange={(base, partner) => {
                setBasePrice(base);
                setPartnerPrice(partner);
              }}
            />
          </motion.div>

          {/* KP Editor */}
          <motion.div
            className="rounded-xl border border-border-faint bg-surface p-5 space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-text-muted" />
                <h2 className="text-lg font-semibold">
                  Коммерческое предложение
                </h2>
              </div>
              {savingKp && (
                <span className="text-xs text-text-muted">Сохранение...</span>
              )}
            </div>

            {(!project.kp_content && !editingKp) || editingKp ? (
              <div className="space-y-3">
                <textarea
                  value={kpContent}
                  onChange={(e) => setKpContent(e.target.value)}
                  onBlur={saveKpContent}
                  placeholder="Опишите коммерческое предложение..."
                  rows={8}
                  className="w-full px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-faint text-sm text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-brand-500/40 transition-colors"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-faint text-sm text-text-primary whitespace-pre-wrap min-h-[80px]">
                  {project.kp_content}
                </div>
                <button
                  onClick={() => setEditingKp(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-faint text-xs text-text-secondary hover:bg-overlay-subtle transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Редактировать
                </button>
              </div>
            )}
          </motion.div>

          {/* KP AI Chat */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <KpChat
              projectId={project.id}
              kpMessages={kpMessages}
              onKpGenerated={() => {
                fetchProject();
              }}
            />
          </motion.div>
        </div>

        {/* ─── RIGHT COLUMN (40%, sticky) ─── */}
        <motion.div
          className="lg:w-[40%] shrink-0"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Price card */}
            <div className="rounded-xl border border-border-faint bg-surface p-5 space-y-4">
              <div className="text-xs text-text-muted uppercase tracking-wider">
                Стоимость
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-text-secondary">
                    Базовая цена
                  </span>
                  <span className="text-xl font-bold text-text-primary">
                    ${basePrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-text-secondary">
                    Партнёрская наценка
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    ${partnerPrice.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-border-faint pt-3">
                  <div className="flex justify-between items-baseline">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">
                        Ваша комиссия
                      </div>
                      <div className="text-[10px] text-text-muted">
                        15% от базы + 50% от наценки
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${commission.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KP Status card */}
            <div className="rounded-xl border border-border-faint bg-surface p-5 space-y-3">
              <div className="text-xs text-text-muted uppercase tracking-wider">
                Статус КП
              </div>
              <KpStatusCard
                project={project}
                onSubmitKp={submitKp}
                onResetToDraft={resetToDraft}
                submitting={submitting}
              />
            </div>

            {/* Project info card */}
            <div className="rounded-xl border border-border-faint bg-surface p-5 space-y-3">
              <div className="text-xs text-text-muted uppercase tracking-wider">
                Информация
              </div>
              <div className="space-y-2 text-sm">
                {project.client_phone && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Телефон</span>
                    <span className="text-text-secondary">
                      {project.client_phone}
                    </span>
                  </div>
                )}
                {project.budget && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Бюджет</span>
                    <span className="text-text-secondary">
                      {project.budget}
                    </span>
                  </div>
                )}
                {project.notes && (
                  <div className="pt-2 border-t border-border-faint">
                    <div className="text-text-muted text-xs mb-1">Заметки</div>
                    <div className="text-text-secondary text-xs whitespace-pre-wrap">
                      {project.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
