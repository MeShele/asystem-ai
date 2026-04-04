"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  Handshake,
  FileText,
  Loader2,
} from "lucide-react";

interface Project {
  id: number;
  request_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  partner_id: string;
  project_type: string;
  status: string;
  kp_status: string | null;
  kp_content: string | null;
  kp_admin_feedback: string | null;
  kp_reviewed_at: string | null;
  base_price: number | null;
  partner_price: number | null;
  commission: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Partner {
  name: string;
  telegram_id: string | null;
}

interface KpMessage {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

const statusOptions = [
  { value: "new", label: "Новая" },
  { value: "discussing", label: "Обсуждение" },
  { value: "in_progress", label: "В работе" },
  { value: "review", label: "На проверке" },
  { value: "completed", label: "Завершён" },
  { value: "cancelled", label: "Отменён" },
];

const kpStatusConfig: Record<string, { label: string; color: string }> = {
  none: { label: "Нет КП", color: "bg-gray-500/10 text-gray-400" },
  draft: { label: "Черновик", color: "bg-blue-500/10 text-blue-400" },
  submitted: { label: "На проверке", color: "bg-orange-500/10 text-orange-400" },
  approved: { label: "Одобрено", color: "bg-green-500/10 text-green-500" },
  rejected: { label: "Отклонено", color: "bg-red-500/10 text-red-500" },
};

function calcCommission(base: number, partnerPrice: number): number {
  const platformFee = base * 0.15;
  const surplusShare = Math.max(0, (partnerPrice - base) * 0.5);
  return platformFee + surplusShare;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [kpMessages, setKpMessages] = useState<KpMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [status, setStatus] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [kpActionLoading, setKpActionLoading] = useState(false);

  const fetchProject = useCallback(() => {
    fetch(`/api/admin/clients/${projectId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          setPartner(data.partner || null);
          setKpMessages(data.kpMessages || []);
          setStatus(data.project.status || "new");
          setBasePrice(data.project.base_price != null ? String(data.project.base_price) : "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    setSaved(false);

    await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: project.id,
        status,
        basePrice: basePrice ? Number(basePrice) : undefined,
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetchProject();
  };

  const handleKpAction = async (action: "approve" | "reject") => {
    setKpActionLoading(true);
    await fetch(`/api/admin/clients/${projectId}/kp/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        feedback: action === "reject" ? rejectFeedback : undefined,
      }),
    });
    setKpActionLoading(false);
    setShowRejectForm(false);
    setRejectFeedback("");
    fetchProject();
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 lg:p-8">
        <p className="text-text-muted">Проект не найден</p>
      </div>
    );
  }

  const partnerPrice = project.partner_price ?? 0;
  const basePriceNum = basePrice ? Number(basePrice) : 0;
  const commissionPreview = basePriceNum > 0 ? calcCommission(basePriceNum, partnerPrice) : 0;
  const kpKey = project.kp_status || "none";
  const kpBadge = kpStatusConfig[kpKey] || kpStatusConfig.none;

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/projects")}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к проектам
      </button>

      {/* Header */}
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-5 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold mb-1">
              {project.request_id || `Проект #${project.id}`}
            </h1>
            <p className="text-text-secondary text-sm">
              Создан {new Date(project.created_at).toLocaleDateString("ru-RU")} · Обновлён{" "}
              {new Date(project.updated_at).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${kpBadge.color}`}>
            КП: {kpBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-text-muted flex-shrink-0" />
            <div>
              <div className="text-xs text-text-muted">Клиент</div>
              <div className="text-sm font-medium">{project.client_name || "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-text-muted flex-shrink-0" />
            <div>
              <div className="text-xs text-text-muted">Партнёр</div>
              <div className="text-sm font-medium">{partner?.name || "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
            <div>
              <div className="text-xs text-text-muted">Тип</div>
              <div className="text-sm font-medium">{project.project_type || "—"}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Editable fields */}
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-5 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-sm font-semibold mb-4 text-text-primary">Управление</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Status */}
          <div>
            <label className="text-xs text-text-muted mb-1 block">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Base Price */}
          <div>
            <label className="text-xs text-text-muted mb-1 block">Базовая цена ($)</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Price summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 p-3 rounded-lg bg-surface-raised border border-border-faint">
          <div>
            <div className="text-xs text-text-muted mb-0.5">Базовая цена</div>
            <div className="text-sm font-bold text-text-primary">
              {basePriceNum > 0 ? `$${basePriceNum.toLocaleString()}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-0.5">Цена партнёра</div>
            <div className="text-sm font-bold text-text-primary">
              {partnerPrice > 0 ? `$${partnerPrice.toLocaleString()}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-0.5 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Комиссия (превью)
            </div>
            <div className="text-sm font-bold text-green-500">
              {commissionPreview > 0 ? `$${commissionPreview.toLocaleString()}` : "—"}
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Сохранение..." : saved ? "Сохранено" : "Сохранить"}
        </button>
      </motion.div>

      {/* KP Section */}
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-5 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-sm font-semibold mb-4 text-text-primary flex items-center gap-2">
          <FileText className="w-4 h-4 text-text-muted" />
          Коммерческое предложение
        </h2>

        {/* KP Status Badge */}
        <div className="mb-4">
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${kpBadge.color}`}>
            {kpBadge.label}
          </span>
          {project.kp_reviewed_at && (
            <span className="text-xs text-text-muted ml-2">
              Проверено: {new Date(project.kp_reviewed_at).toLocaleDateString("ru-RU")}
            </span>
          )}
        </div>

        {/* KP Content for submitted */}
        {project.kp_status === "submitted" && project.kp_content && (
          <>
            <div className="p-4 rounded-lg bg-surface-raised border border-border-faint mb-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
                {project.kp_content}
              </pre>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleKpAction("approve")}
                disabled={kpActionLoading}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-500 text-sm font-medium hover:bg-green-500/20 transition-colors border border-green-500/20 disabled:opacity-50"
              >
                {kpActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Одобрить
              </button>

              {!showRejectForm ? (
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  <XCircle className="w-4 h-4" />
                  Отклонить
                </button>
              ) : (
                <div className="flex-1 space-y-2">
                  <textarea
                    value={rejectFeedback}
                    onChange={(e) => setRejectFeedback(e.target.value)}
                    placeholder="Причина отклонения / комментарий..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none transition-all resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleKpAction("reject")}
                      disabled={kpActionLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {kpActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Отклонить КП
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectFeedback("");
                      }}
                      className="px-4 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Approved/Rejected state */}
        {project.kp_status === "approved" && (
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              КП одобрено
            </div>
          </div>
        )}

        {project.kp_status === "rejected" && (
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium mb-1">
              <XCircle className="w-4 h-4" />
              КП отклонено
            </div>
            {project.kp_admin_feedback && (
              <p className="text-sm text-text-secondary mt-1">
                Комментарий: {project.kp_admin_feedback}
              </p>
            )}
          </div>
        )}

        {/* No KP */}
        {(!project.kp_status || project.kp_status === "none" || project.kp_status === "draft") &&
          !project.kp_content && (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">КП ещё не отправлено партнёром</p>
            </div>
          )}

        {/* KP Content for approved/rejected (read-only) */}
        {(project.kp_status === "approved" || project.kp_status === "rejected") &&
          project.kp_content && (
            <div className="mt-4 p-4 rounded-lg bg-surface-raised border border-border-faint max-h-96 overflow-y-auto">
              <div className="text-xs text-text-muted mb-2">Содержание КП:</div>
              <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
                {project.kp_content}
              </pre>
            </div>
          )}

        {/* KP Messages history */}
        {kpMessages.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-text-muted mb-2">История сообщений КП:</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {kpMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === "admin"
                      ? "bg-brand-500/5 border border-brand-500/20"
                      : "bg-surface-raised border border-border-faint"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-medium text-text-muted uppercase">
                      {msg.role === "admin" ? "Админ" : "Партнёр"}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(msg.created_at).toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <p className="text-text-primary whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
