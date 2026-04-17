"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Hash,
  Building2,
  Calendar,
} from "lucide-react";
import { useParams } from "next/navigation";
import type { Client, CalculatorConfig } from "@/types/partner";
import { statusLabels } from "@/types/partner";
import { ProjectCalculator } from "@/components/partner/project-calculator";

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

/* ─── Main Page ─── */

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const locale = getLocale();

  const [project, setProject] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [partnerPrice, setPartnerPrice] = useState(0);
  const [pricingMode, setPricingMode] = useState<"calculator" | "manual">("manual");
  const [savingDesc, setSavingDesc] = useState(false);
  const [clientRequest, setClientRequest] = useState<{name?: string; phone?: string; company?: string; services?: string[]; budget?: string; timeline?: string; description?: string} | null>(null);

  /* Fetch project */
  const fetchProject = useCallback(() => {
    if (!projectId) return;
    fetch(`/api/partner/clients/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((data: { project: Client; clientRequest?: Record<string, unknown> }) => {
        const p = data.project;
        setProject(p);
        setDescription(p.description ?? "");
        setBasePrice(p.base_price ?? 0);
        setPartnerPrice(p.partner_price ?? 0);
        setPricingMode(p.pricing_mode || "manual");
        setClientRequest(data.clientRequest as typeof clientRequest ?? null);
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

  /* Debounced calculator config save (also saves prices) */
  const debouncedCalcSave = useDebouncedCallback((config: CalculatorConfig) => {
    if (!project) return;
    fetch(`/api/partner/clients/${project.id}/calculator`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  }, 1000);

  /* Debounced manual pricing save */
  const debouncedPricingSave = useDebouncedCallback(
    (base: number, partner: number, mode: "calculator" | "manual") => {
      if (!project) return;
      fetch(`/api/partner/clients/${project.id}/calculator`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricingMode: mode, basePrice: base, partnerPrice: partner }),
      });
    },
    800,
  );

  /* Switch pricing mode */
  function switchPricingMode(mode: "calculator" | "manual") {
    setPricingMode(mode);
    if (!project) return;
    fetch(`/api/partner/clients/${project.id}/calculator`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricingMode: mode, basePrice, partnerPrice }),
    });
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

          {/* Client request data */}
          {clientRequest && (
            <motion.div
              className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-5 space-y-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <div className="text-xs text-blue-500 uppercase tracking-wider font-medium">
                Заявка от клиента
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {clientRequest.name && (
                  <div>
                    <span className="text-text-muted text-xs">Имя:</span>
                    <div className="font-medium">{clientRequest.name}</div>
                  </div>
                )}
                {clientRequest.phone && (
                  <div>
                    <span className="text-text-muted text-xs">Телефон:</span>
                    <div className="font-medium">{clientRequest.phone}</div>
                  </div>
                )}
                {clientRequest.company && (
                  <div>
                    <span className="text-text-muted text-xs">Компания:</span>
                    <div className="font-medium">{clientRequest.company}</div>
                  </div>
                )}
                {clientRequest.budget && (
                  <div>
                    <span className="text-text-muted text-xs">Бюджет:</span>
                    <div className="font-medium">{clientRequest.budget}</div>
                  </div>
                )}
                {clientRequest.timeline && (
                  <div>
                    <span className="text-text-muted text-xs">Сроки:</span>
                    <div className="font-medium">{clientRequest.timeline}</div>
                  </div>
                )}
                {clientRequest.services && Array.isArray(clientRequest.services) && clientRequest.services.length > 0 && (
                  <div>
                    <span className="text-text-muted text-xs">Услуги:</span>
                    <div className="font-medium">{clientRequest.services.join(", ")}</div>
                  </div>
                )}
              </div>
              {clientRequest.description && (
                <div>
                  <span className="text-text-muted text-xs">Описание от клиента:</span>
                  <div className="text-sm mt-1 whitespace-pre-wrap">{clientRequest.description}</div>
                </div>
              )}
            </motion.div>
          )}

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

          {/* Calculator (shown when calculator mode is active) */}
          {pricingMode === "calculator" && (
            <motion.div
              className="rounded-xl border border-border-faint bg-surface p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <ProjectCalculator
                initialConfig={project.calculator_config ?? undefined}
                onConfigChange={(config) => debouncedCalcSave(config)}
                onPriceChange={(base) => {
                  setBasePrice(base);
                  debouncedPricingSave(base, partnerPrice, "calculator");
                }}
              />
            </motion.div>
          )}

        </div>

        {/* ─── RIGHT COLUMN (40%, sticky) ─── */}
        <motion.div
          className="lg:w-[40%] shrink-0"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Pricing card */}
            <div className="rounded-xl border border-border-faint bg-surface p-5 space-y-4">
              <div className="text-xs text-text-muted uppercase tracking-wider">
                Стоимость
              </div>

              {/* Mode toggle */}
              <div className="flex rounded-lg overflow-hidden border border-border-faint">
                <button
                  type="button"
                  onClick={() => switchPricingMode("calculator")}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    pricingMode === "calculator"
                      ? "bg-brand-500 text-white"
                      : "bg-bg-secondary text-text-secondary hover:bg-overlay-subtle"
                  }`}
                >
                  Калькулятор
                </button>
                <button
                  type="button"
                  onClick={() => switchPricingMode("manual")}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    pricingMode === "manual"
                      ? "bg-brand-500 text-white"
                      : "bg-bg-secondary text-text-secondary hover:bg-overlay-subtle"
                  }`}
                >
                  Своя цена
                </button>
              </div>

              {/* Calculator mode */}
              {pricingMode === "calculator" && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-xs text-text-muted">Калькулятор — в левой колонке ниже</div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted">
                      Цена для клиента, $
                    </label>
                    <input
                      type="number"
                      value={partnerPrice || ""}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        setPartnerPrice(v);
                        debouncedPricingSave(basePrice, v, "calculator");
                      }}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-faint text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/40 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {/* Manual mode */}
              {pricingMode === "manual" && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted">
                      Себестоимость проекта, $
                    </label>
                    <input
                      type="number"
                      value={basePrice || ""}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        setBasePrice(v);
                        debouncedPricingSave(v, partnerPrice, "manual");
                      }}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-faint text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-muted">
                      Цена для клиента, $
                    </label>
                    <input
                      type="number"
                      value={partnerPrice || ""}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 0;
                        setPartnerPrice(v);
                        debouncedPricingSave(basePrice, v, "manual");
                      }}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-faint text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/40 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              {/* Commission breakdown */}
              <div className="border-t border-border-faint pt-3 space-y-2">
                <div className="text-xs text-text-muted uppercase tracking-wider">
                  Ваш заработок
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">15% от базы</span>
                    <span className="text-text-primary font-medium">
                      ${Math.round(basePrice * 0.15).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">50% от накрутки</span>
                    <span className="text-text-primary font-medium">
                      ${Math.round(Math.max(0, (partnerPrice - basePrice) * 0.5)).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-border-faint my-1" />
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-text-primary">Итого</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${commission.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
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
