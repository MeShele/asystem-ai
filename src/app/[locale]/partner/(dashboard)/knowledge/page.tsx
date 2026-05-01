"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Download, Pin, FileSpreadsheet, FileImage, FileVideo, FileArchive, File as FileIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProgramGuide } from "@/components/partner/program-guide";

interface KnowledgeDoc {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number;
  mime_type: string | null;
  category: string;
  pinned: boolean;
  created_at: string;
}

interface TierLevel {
  level: number;
  title: string;
  icon: string;
  base_pct: number;
  color: string;
  requirement: string;
}

interface AcceptanceStats {
  totalDeals: number;
  dealsLast60Days: number;
  dealsLast90Days: number;
  dealsLast6Months: number;
  totalRevenue: number;
  hasT2Project: boolean;
  totalEarned: number;
}

interface MeData {
  partner: { is_founding: boolean };
  tierSystem: { levels: TierLevel[]; currentLevel: number; acceptanceStats: AcceptanceStats };
}

const CATEGORIES: Record<string, { label: string; tone: string }> = {
  general: { label: "Общее", tone: "bg-bg-secondary text-text-secondary" },
  pitch: { label: "Презентации", tone: "bg-brand-500/10 text-brand-500" },
  legal: { label: "Юридическое", tone: "bg-purple-500/10 text-purple-500" },
  marketing: { label: "Маркетинг", tone: "bg-amber-500/10 text-amber-500" },
  faq: { label: "FAQ", tone: "bg-green-500/10 text-green-500" },
};

function fileIcon(mime: string | null, name: string | null): LucideIcon {
  const ext = (name || "").split(".").pop()?.toLowerCase() || "";
  if (mime?.includes("pdf") || ext === "pdf") return FileText;
  if (mime?.includes("sheet") || ["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (mime?.includes("image") || ["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return FileImage;
  if (mime?.includes("video") || ["mp4", "mov", "webm"].includes(ext)) return FileVideo;
  if (["zip", "rar", "tar", "gz"].includes(ext)) return FileArchive;
  return FileIcon;
}

function fmtSize(bytes: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PartnerKnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/partner/knowledge").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/partner/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([d, m]) => {
        setDocs(Array.isArray(d) ? d : []);
        setMe(m);
      })
      .finally(() => setLoading(false));
  }, []);

  const pinned = docs.filter((d) => d.pinned);
  const rest = docs.filter((d) => !d.pinned);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-brand-500" />
          <h1 className="text-2xl font-bold">База знаний</h1>
        </div>
        <p className="text-sm text-text-muted">
          Документы, презентации и материалы для работы с клиентами
        </p>
      </motion.div>

      {/* Program guide — как работает партнёрская программа */}
      {me && (
        <ProgramGuide
          levels={me.tierSystem.levels}
          currentLevel={me.tierSystem.currentLevel}
          isFounding={Boolean(me.partner.is_founding)}
          stats={me.tierSystem.acceptanceStats}
        />
      )}

      {/* Pinned docs */}
      {pinned.length > 0 && (
        <section className="mb-8">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted mb-3">
            <Pin className="w-3.5 h-3.5" /> Закреплено
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinned.map((d, i) => (
              <DocCard key={d.id} doc={d} delay={i * 0.04} />
            ))}
          </div>
        </section>
      )}

      {/* All docs */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted mb-3">Все материалы</h3>
        {loading ? (
          <div className="text-center py-8 text-sm text-text-muted">Загрузка...</div>
        ) : rest.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border-faint text-center">
            <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-text-muted">
              Документов пока нет. Админ загрузит сюда презентации, шаблоны и FAQ.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rest.map((d, i) => (
              <DocCard key={d.id} doc={d} delay={i * 0.03} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DocCard({ doc, delay = 0 }: { doc: KnowledgeDoc; delay?: number }) {
  const Icon = fileIcon(doc.mime_type, doc.file_name);
  const cat = CATEGORIES[doc.category] || CATEGORIES.general;

  return (
    <motion.a
      href={doc.file_url}
      target="_blank"
      rel="noopener noreferrer"
      download={doc.file_name || true}
      className="group relative flex items-start gap-3 p-4 rounded-2xl border border-border-faint bg-surface hover:border-brand-500/40 hover:bg-bg-secondary/30 transition-all"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/15 transition-colors">
        <Icon className="w-5 h-5 text-brand-500" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${cat.tone}`}>
            {cat.label}
          </span>
          {doc.pinned && (
            <span className="text-[10px] text-amber-500 inline-flex items-center gap-1">
              <Pin className="w-2.5 h-2.5" /> закреп
            </span>
          )}
        </div>
        <div className="text-sm font-semibold mb-0.5 truncate">{doc.title}</div>
        {doc.description && <p className="text-xs text-text-muted line-clamp-2 mb-2">{doc.description}</p>}
        <div className="flex items-center gap-2 text-[11px] text-text-muted font-mono">
          {doc.file_name && <span className="truncate">{doc.file_name}</span>}
          {doc.file_size > 0 && <span>· {fmtSize(doc.file_size)}</span>}
        </div>
      </div>
      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-bg-secondary group-hover:bg-brand-500 group-hover:text-white flex items-center justify-center text-text-muted transition-colors">
        <Download className="w-3.5 h-3.5" />
      </div>
    </motion.a>
  );
}
