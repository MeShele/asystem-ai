"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Mail, Phone } from "lucide-react";

interface Partner {
  name: string;
  field: string;
  audience: string;
  phone: string;
  email: string;
  status?: string;
  createdAt: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('/api/partners')
      .then(r => r.json())
      .then(data => setPartners(Array.isArray(data) ? data.map((pp: Partner) => ({ ...pp, status: pp.status || "pending" })) : []))
      .catch(() => setPartners([]));
  }, []);

  function updateStatus(index: number, status: string) {
    const updated = [...partners];
    updated[index] = { ...updated[index], status };
    setPartners(updated);
    const partner = updated[index];
    fetch(`/api/partners/${index}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, name: partner.name }),
    }).catch(() => {});
  }

  const filtered = partners.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.field?.toLowerCase().includes(search.toLowerCase())
  );

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "Ожидает", color: "bg-yellow-500/10 text-yellow-500" },
    approved: { label: "Активен", color: "bg-green-500/10 text-green-500" },
    rejected: { label: "Отклонён", color: "bg-red-500/10 text-red-500" },
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Партнёры</h1>
          <p className="text-text-secondary text-sm">
            {partners.length} всего · {partners.filter((p) => p.status === "pending").length} ожидают одобрения
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-48 lg:w-64 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Всего", value: partners.length, color: "text-brand-500", bg: "bg-brand-500/10" },
          { label: "Активных", value: partners.filter((p) => p.status === "approved").length, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Ожидают", value: partners.filter((p) => p.status === "pending").length, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border border-border-faint bg-surface">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-faint bg-surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted text-sm">Партнёров пока нет</p>
            <p className="text-text-muted text-xs mt-1">Заявки появятся здесь после заполнения формы партнёра</p>
          </div>
        ) : (
          <div className="divide-y divide-border-faint">
            {filtered.map((partner, i) => {
              const status = statusConfig[partner.status || "pending"];
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 p-4 hover:bg-surface-raised transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-500">{partner.name?.charAt(0)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{partner.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-3">
                      <span>{partner.field}</span>
                      {partner.audience && (
                        <>
                          <span>·</span>
                          <span>Аудитория: {partner.audience}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="hidden sm:flex items-center gap-2">
                    {partner.phone && (
                      <a href={`tel:${partner.phone}`} className="w-8 h-8 rounded-lg border border-border-faint flex items-center justify-center hover:bg-brand-500/10 hover:border-brand-500/30 transition-all">
                        <Phone className="w-3.5 h-3.5 text-text-muted" />
                      </a>
                    )}
                    {partner.email && (
                      <a href={`mailto:${partner.email}`} className="w-8 h-8 rounded-lg border border-border-faint flex items-center justify-center hover:bg-brand-500/10 hover:border-brand-500/30 transition-all">
                        <Mail className="w-3.5 h-3.5 text-text-muted" />
                      </a>
                    )}
                  </div>

                  {/* Status actions */}
                  <select
                    value={partner.status || "pending"}
                    onChange={(e) => updateStatus(i, e.target.value)}
                    className="px-2 py-1 rounded-md text-xs font-medium bg-surface border border-border-faint text-text-primary focus:outline-none focus:border-brand-500"
                  >
                    <option value="pending">Ожидает</option>
                    <option value="approved">Одобрить</option>
                    <option value="rejected">Отклонить</option>
                  </select>

                  {/* Date */}
                  <span className="text-xs text-text-muted hidden lg:block">
                    {new Date(partner.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
