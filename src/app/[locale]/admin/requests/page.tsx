"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronRight,
  Phone,
  Mail,
  X,
  Clock,
} from "lucide-react";

interface Request {
  id: number;
  request_id: string;
  services: string[];
  name: string;
  phone: string;
  email?: string;
  company?: string;
  budget?: string;
  timeline?: string;
  description?: string;
  status?: string;
  created_at: string;
}

const columns = [
  { id: "new", label: "Новые", color: "bg-blue-500", emoji: "📥" },
  { id: "review", label: "На рассмотрении", color: "bg-yellow-500", emoji: "👀" },
  { id: "estimate", label: "Оценка", color: "bg-purple-500", emoji: "💰" },
  { id: "progress", label: "В работе", color: "bg-brand-500", emoji: "⚙️" },
  { id: "completed", label: "Готово", color: "bg-green-500", emoji: "✅" },
];

const serviceLabels: Record<string, { label: string; icon: string }> = {
  website: { label: "Сайт", icon: "🌐" },
  bot: { label: "Бот", icon: "🤖" },
  app: { label: "Приложение", icon: "📱" },
  automation: { label: "Автоматизация", icon: "⚙️" },
  custom: { label: "Другое", icon: "📋" },
};

const budgetLabels: Record<string, string> = {
  range1: "до 30К",
  range2: "30-100К",
  range3: "100-500К",
  range4: "500К+",
  undefined: "Не определён",
};

const timelineLabels: Record<string, string> = {
  asap: "ASAP",
  weeks: "1-2 нед",
  month: "Месяц",
  noRush: "Не срочно",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    fetch('/api/requests')
      .then(r => r.json())
      .then(data => setRequests(Array.isArray(data) ? data.map((req: Request) => ({ ...req, status: req.status || "new" })) : []))
      .catch(() => setRequests([]));
  }, []);

  function updateStatus(requestId: string, newStatus: string) {
    const updated = requests.map((r) =>
      r.request_id === requestId ? { ...r, status: newStatus } : r
    );
    setRequests(updated);
    fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch((e) => console.error("Failed to update status:", e));
    if (selectedRequest?.request_id === requestId) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  }

  const filtered = requests.filter(
    (r) =>
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.request_id?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(r.services) && r.services.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="p-6 lg:p-8 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Заявки</h1>
          <p className="text-text-secondary text-sm">{requests.length} всего · {requests.filter((r) => r.status === "new").length} новых</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-48 lg:w-64 transition-all"
            />
          </div>
          {/* View toggle */}
          <div className="flex rounded-lg border border-border-faint overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={`p-2 transition-colors ${view === "kanban" ? "bg-brand-500/10 text-brand-500" : "text-text-muted hover:text-text-primary"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2 transition-colors ${view === "table" ? "bg-brand-500/10 text-brand-500" : "text-text-muted hover:text-text-primary"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colRequests = filtered.filter((r) => r.status === col.id);
            return (
              <div key={col.id} className="min-w-[260px] w-[260px] flex-shrink-0">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2 h-2 rounded-full ${col.color}`} />
                  <span className="text-sm font-medium">{col.label}</span>
                  <span className="text-xs text-text-muted ml-auto">{colRequests.length}</span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {colRequests.map((req) => {
                    const service = serviceLabels[req.services?.[0]] || serviceLabels.custom;
                    return (
                      <motion.div
                        key={req.request_id}
                        layoutId={req.request_id}
                        className="p-4 rounded-xl border border-border-faint bg-surface hover:bg-surface-raised hover:border-border-muted transition-all cursor-pointer group"
                        onClick={() => setSelectedRequest(req)}
                        whileHover={{ y: -2 }}
                      >
                        {/* Service type badge */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-500/[0.08] border border-brand-500/[0.12]">
                            <span className="text-xs">{service.icon}</span>
                            <span className="font-mono text-[10px] text-brand-400">{service.label}</span>
                          </div>
                          <span className="font-mono text-[10px] text-text-muted">{req.request_id}</span>
                        </div>

                        {/* Client name */}
                        <h4 className="font-medium text-sm mb-1 group-hover:text-brand-400 transition-colors">
                          {req.name || "Без имени"}
                        </h4>
                        {req.company && (
                          <p className="text-xs text-text-muted mb-2">{req.company}</p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-[11px] text-text-muted">
                          {req.budget && (
                            <span>{budgetLabels[req.budget] || req.budget}</span>
                          )}
                          {req.timeline && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timelineLabels[req.timeline] || req.timeline}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Date */}
                        <div className="mt-2 pt-2 border-t border-border-faint text-[10px] text-text-muted">
                          {new Date(req.created_at).toLocaleString("ru-RU", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </motion.div>
                    );
                  })}

                  {colRequests.length === 0 && (
                    <div className="p-6 rounded-xl border border-dashed border-border-faint text-center">
                      <p className="text-xs text-text-muted">Пусто</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="rounded-xl border border-border-faint bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-faint bg-bg-secondary">
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-xs">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-xs">Клиент</th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-xs">Тип</th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-xs">Бюджет</th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-xs">Срок</th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-xs">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-text-muted text-xs">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-faint">
                {filtered.map((req, i) => {
                  const service = serviceLabels[req.services?.[0]] || serviceLabels.custom;
                  const col = columns.find((c) => c.id === req.status) || columns[0];
                  return (
                    <tr
                      key={req.id || i}
                      className="hover:bg-surface-raised transition-colors cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-text-muted">{req.request_id}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{req.name || "—"}</div>
                        {req.company && <div className="text-xs text-text-muted">{req.company}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5">
                          <span>{service.icon}</span>
                          <span className="text-text-secondary">{service.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{budgetLabels[req.budget || ""] || "—"}</td>
                      <td className="py-3 px-4 text-text-secondary">{timelineLabels[req.timeline || ""] || "—"}</td>
                      <td className="py-3 px-4">
                        <select
                          value={req.status}
                          onChange={(e) => { e.stopPropagation(); updateStatus(req.request_id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-1 rounded-md text-xs font-medium bg-surface border border-border-faint text-text-primary focus:outline-none focus:border-brand-500"
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-text-muted text-xs">
                        {new Date(req.created_at).toLocaleDateString("ru-RU")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center">
              <p className="text-text-muted text-sm">Заявок не найдено</p>
            </div>
          )}
        </div>
      )}

      {/* Request Detail Drawer */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[150]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-md bg-bg-primary border-l border-border-faint z-[151] overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-bg-primary border-b border-border-faint p-5 flex items-center justify-between z-10">
                <div>
                  <div className="font-mono text-xs text-text-muted mb-0.5">{selectedRequest.request_id}</div>
                  <h2 className="text-lg font-bold">{selectedRequest.name || "Без имени"}</h2>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-8 h-8 rounded-lg border border-border-faint flex items-center justify-center hover:bg-surface-raised transition-colors"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Status changer */}
                <div>
                  <label className="text-xs text-text-muted block mb-2">Статус</label>
                  <div className="flex flex-wrap gap-2">
                    {columns.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => updateStatus(selectedRequest.request_id, col.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedRequest.status === col.id
                            ? "border-brand-500 bg-brand-500/10 text-brand-500"
                            : "border-border-faint text-text-secondary hover:border-border-muted"
                        }`}
                      >
                        {col.emoji} {col.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service info */}
                <div>
                  <label className="text-xs text-text-muted block mb-2">Услуга</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border-faint bg-surface">
                    <span>{(serviceLabels[selectedRequest.services?.[0]] || serviceLabels.custom).icon}</span>
                    <span className="font-medium text-sm">{(serviceLabels[selectedRequest.services?.[0]] || serviceLabels.custom).label}</span>
                  </div>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-text-muted block mb-2">Бюджет</label>
                    <div className="px-3 py-2.5 rounded-lg border border-border-faint bg-surface text-sm">
                      {budgetLabels[selectedRequest.budget || ""] || "Не указан"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-text-muted block mb-2">Сроки</label>
                    <div className="px-3 py-2.5 rounded-lg border border-border-faint bg-surface text-sm">
                      {timelineLabels[selectedRequest.timeline || ""] || "Не указан"}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div>
                  <label className="text-xs text-text-muted block mb-2">Контакты</label>
                  <div className="space-y-2">
                    {selectedRequest.phone && (
                      <a href={`tel:${selectedRequest.phone}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border-faint bg-surface hover:bg-surface-raised transition-colors">
                        <Phone className="w-4 h-4 text-text-muted" />
                        <span className="text-sm">{selectedRequest.phone}</span>
                      </a>
                    )}
                    {selectedRequest.email && (
                      <a href={`mailto:${selectedRequest.email}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border-faint bg-surface hover:bg-surface-raised transition-colors">
                        <Mail className="w-4 h-4 text-text-muted" />
                        <span className="text-sm">{selectedRequest.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedRequest.description && (
                  <div>
                    <label className="text-xs text-text-muted block mb-2">Описание проекта</label>
                    <div className="px-3 py-2.5 rounded-lg border border-border-faint bg-surface text-sm">
                      {selectedRequest.description}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <label className="text-xs text-text-muted block mb-2">История</label>
                  <div className="relative pl-4 border-l border-border-faint space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-bg-primary" />
                      <div className="text-sm font-medium">Заявка создана</div>
                      <div className="text-xs text-text-muted">
                        {new Date(selectedRequest.created_at).toLocaleString("ru-RU")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
