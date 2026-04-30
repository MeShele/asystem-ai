"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Inbox, X } from "lucide-react";

export type BellRole = "partner" | "admin" | "client";

interface NotificationItem {
  id: number;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

const KIND_TONE: Record<string, string> = {
  payout_paid: "bg-green-500",
  payout_rejected: "bg-red-500",
  milestone_unlocked: "bg-amber-500",
  milestone_paid: "bg-green-500",
  milestone_rejected: "bg-red-500",
  level_up: "bg-purple-500",
  level_down: "bg-orange-500",
  project_created: "bg-brand-500",
  project_status_changed: "bg-brand-500",
  stage_updated: "bg-brand-500",
  comment_added: "bg-blue-500",
  lead_assigned: "bg-purple-500",
  request_assigned: "bg-purple-500",
  review_received: "bg-amber-500",
  duplicate_lead: "bg-red-500",
};

function fmtAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${hr === 1 ? "час" : hr < 5 ? "часа" : "часов"} назад`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d} ${d === 1 ? "день" : d < 5 ? "дня" : "дней"} назад`;
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
}

interface Props {
  role: BellRole;
  collapsed?: boolean;
}

export function NotificationBell({ role, collapsed = false }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const apiBase = `/api/${role}/notifications`;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(apiBase);
      if (!res.ok) return;
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setUnread(Number(data.unread || 0));
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // Initial load + polling каждые 30 сек
  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  // Click outside для закрытия
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) await load();
  };

  const markAllRead = async () => {
    await fetch(`${apiBase}/read`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await load();
  };

  const onItemClick = async (item: NotificationItem) => {
    if (!item.read_at) {
      await fetch(`${apiBase}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [item.id] }),
      });
      load();
    }
    if (item.link) {
      const locale = window.location.pathname.split("/")[1] || "ru";
      const href = item.link.startsWith("/") ? `/${locale}${item.link}` : item.link;
      window.location.href = href;
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleOpen}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all w-full ${
          open
            ? "bg-bg-secondary text-text-primary"
            : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
        } ${collapsed ? "justify-center" : ""}`}
        title="Уведомления"
      >
        <div className="relative flex-shrink-0">
          <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-[9px] text-white font-bold font-mono flex items-center justify-center leading-none">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
        {!collapsed && <span>Уведомления</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="fixed top-16 right-2 left-2 sm:left-auto sm:absolute sm:top-0 sm:left-full sm:right-auto sm:ml-3 sm:w-[360px] z-50 rounded-xl border border-border-faint bg-surface shadow-2xl overflow-hidden max-w-[calc(100vw-1rem)]"
            style={{ transformOrigin: "top left" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border-faint bg-bg-secondary/40">
              <div className="flex items-center gap-2 min-w-0">
                <Bell className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Уведомления</span>
                {unread > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-500 flex-shrink-0">
                    {unread} новых
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-600 transition-colors px-2 py-1 rounded-md hover:bg-brand-500/10"
                    title="Отметить все прочитанными"
                  >
                    <CheckCheck className="w-3 h-3" /> прочитать
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                  title="Закрыть"
                  aria-label="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="max-h-[420px] overflow-y-auto">
              {loading && items.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">Загрузка...</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center">
                  <Inbox className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-xs text-text-muted">Пока нет уведомлений</p>
                </div>
              ) : (
                <div className="divide-y divide-border-faint">
                  {items.map((item) => {
                    const tone = KIND_TONE[item.kind] || "bg-text-muted";
                    return (
                      <button
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className={`w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-bg-secondary/30 ${
                          !item.read_at ? "bg-brand-500/[0.03]" : ""
                        }`}
                      >
                        <div className="relative flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 rounded-full ${tone}`} />
                          {!item.read_at && (
                            <div className={`absolute inset-0 w-2 h-2 rounded-full ${tone} animate-ping opacity-50`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm leading-snug ${!item.read_at ? "font-semibold" : ""}`}>
                            {item.title}
                          </div>
                          {item.body && (
                            <p className="text-[11px] text-text-muted mt-0.5 leading-snug line-clamp-2">{item.body}</p>
                          )}
                          <div className="text-[10px] text-text-muted mt-1 font-mono">{fmtAgo(item.created_at)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
