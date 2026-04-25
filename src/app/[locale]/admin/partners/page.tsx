"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { Search, UserPlus, Mail, Phone, RefreshCcw } from "lucide-react";

interface Partner {
  partner_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  ref_code: string;
  commission_rate: number;
  status: string;
  telegram_username: string;
  total_clients: number;
  total_earned: number;
  created_at: string;
}

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const [resetting, setResetting] = useState<string | null>(null);

  const load = () => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((data) =>
        setPartners(Array.isArray(data) ? data : [])
      )
      .catch(() => setPartners([]));
  };

  useEffect(() => {
    load();
  }, []);

  const handleReset = async (partnerId: string, name: string) => {
    if (!confirm(`Сбросить legacy-данные партнёра «${name}»?\n\nБудут удалены: старые заявки (partner_clients), сообщения и достижения.\nНовые проекты НЕ затрагиваются.`)) return;
    setResetting(partnerId);
    const res = await fetch(`/api/admin/partners/${partnerId}/reset`, { method: "POST" });
    setResetting(null);
    if (res.ok) {
      load();
      alert("Готово. Старые данные удалены.");
    } else {
      alert("Ошибка при сбросе");
    }
  };

  const filtered = partners.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.company?.toLowerCase().includes(search.toLowerCase()) ||
      p.partner_id?.toLowerCase().includes(search.toLowerCase())
  );

  const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: "Активен", color: "bg-green-500/10 text-green-500" },
    pending: { label: "Ожидает", color: "bg-yellow-500/10 text-yellow-500" },
    blocked: { label: "Заблокирован", color: "bg-red-500/10 text-red-500" },
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Партнёры</h1>
          <p className="text-text-secondary text-sm">
            {partners.length} всего · {partners.filter((p) => p.status === "active").length} активных
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Всего", value: partners.length, color: "text-brand-500" },
          { label: "Активных", value: partners.filter((p) => p.status === "active").length, color: "text-green-500" },
          { label: "Клиентов", value: partners.reduce((sum, p) => sum + Number(p.total_clients || 0), 0), color: "text-blue-500" },
          { label: "Выплачено партнёрам", value: `$${partners.reduce((sum, p) => sum + Number(p.total_earned || 0), 0).toLocaleString("ru-RU")}`, color: "text-green-500" },
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
          </div>
        ) : (
          <div className="divide-y divide-border-faint">
            {filtered.map((partner, i) => {
              const status = statusConfig[partner.status] || statusConfig.active;
              return (
                <motion.div
                  key={partner.partner_id}
                  onClick={() => router.push(`/admin/partners/${partner.partner_id}`)}
                  className="flex items-center gap-4 p-4 hover:bg-surface-raised transition-colors cursor-pointer"
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
                      {partner.telegram_username && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-500">
                          @{partner.telegram_username}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted flex items-center gap-2">
                      <span className="font-mono">{partner.partner_id}</span>
                      <span>·</span>
                      <span>ref: {partner.ref_code}</span>
                      {partner.company && (
                        <>
                          <span>·</span>
                          <span>{partner.company}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-4 text-xs text-text-secondary">
                    <div className="text-center">
                      <div className="font-bold text-sm">{partner.total_clients}</div>
                      <div className="text-text-muted">клиентов</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm text-green-500">${Number(partner.total_earned).toLocaleString("ru-RU")}</div>
                      <div className="text-text-muted">выплачено</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-sm">{Math.round(Number(partner.commission_rate) * 100)}%</div>
                      <div className="text-text-muted">комиссия</div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
                    <button
                      onClick={() => handleReset(partner.partner_id, partner.name)}
                      disabled={resetting === partner.partner_id}
                      title="Сбросить legacy-данные (старые заявки и достижения)"
                      className="w-8 h-8 rounded-lg border border-border-faint flex items-center justify-center hover:bg-orange-500/10 hover:border-orange-500/30 transition-all disabled:opacity-50"
                    >
                      <RefreshCcw className={`w-3.5 h-3.5 text-text-muted ${resetting === partner.partner_id ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-text-muted hidden lg:block">
                    {new Date(partner.created_at).toLocaleDateString("ru-RU")}
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
