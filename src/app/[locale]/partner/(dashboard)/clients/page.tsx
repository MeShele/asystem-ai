"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import type { Client } from "@/types/partner";
import { statusLabels } from "@/types/partner";
import { CreateProjectModal } from "@/components/partner/create-project-modal";

export default function PartnerClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetch("/api/partner/clients")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((data) => setClients(data.clients || []))
      .catch(() => {
        const locale = window.location.pathname.split("/")[1] || "ru";
        window.location.href = `/${locale}/partner/login`;
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.request_id?.toLowerCase().includes(search.toLowerCase()) ||
      c.project_type?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Мои клиенты</h1>
          <p className="text-text-secondary text-sm">{clients.length} всего</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-9 pr-4 py-2 text-sm bg-surface border border-border-faint rounded-lg text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none w-48 lg:w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Создать</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border-faint bg-surface overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted text-sm mb-2">
              {clients.length === 0 ? "Пока нет клиентов" : "Ничего не найдено"}
            </p>
            {clients.length === 0 && (
              <p className="text-text-muted text-xs">Поделитесь реферальной ссылкой или создайте проект вручную</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-faint bg-bg-secondary">
                  <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Заявка</th>
                  <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Клиент</th>
                  <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Проект</th>
                  <th className="px-5 py-3 text-left text-xs text-text-muted font-medium">Статус</th>
                  <th className="px-5 py-3 text-right text-xs text-text-muted font-medium">Комиссия</th>
                  <th className="px-5 py-3 text-right text-xs text-text-muted font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, i) => {
                  const st = statusLabels[client.status] || statusLabels.new;
                  return (
                    <motion.tr
                      key={client.id}
                      onClick={() => {
                        const locale = window.location.pathname.split("/")[1] || "ru";
                        router.push(`/${locale}/partner/clients/${client.id}`);
                      }}
                      className="border-b border-border-faint last:border-0 hover:bg-surface-raised transition-colors cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-brand-500">{client.request_id}</td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{client.client_name || "—"}</div>
                        {client.client_phone && <div className="text-xs text-text-muted">{client.client_phone}</div>}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">{client.project_type || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {client.commission > 0 ? (
                          <span className="font-semibold text-green-600 dark:text-green-400">${client.commission}</span>
                        ) : (
                          <span className="text-xs text-text-muted">Ожидает оценки</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-xs text-text-muted">
                        {new Date(client.created_at).toLocaleDateString("ru-RU")}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateProjectModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => { setShowCreateForm(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}
