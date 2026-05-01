"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

interface Notification {
  id: number;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export default function TgClientNotifications() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/notifications")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
    // mark read
    fetch("/api/client/notifications/read", { method: "POST", body: "{}" }).catch(() => {});
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh] text-text-muted text-sm">Загрузка...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Уведомления</h1>
      {items.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-border-faint text-center">
          <BellOff className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">Уведомлений пока нет</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n, i) => {
            const ageMs = Date.now() - new Date(n.created_at).getTime();
            const ageH = Math.floor(ageMs / 3600000);
            const ageStr = ageH < 1 ? "только что" : ageH < 24 ? `${ageH}ч назад` : `${Math.floor(ageH / 24)}д назад`;
            const isUnread = !n.read_at;
            const onClick = () => {
              if (n.link) {
                const path = n.link.startsWith("/client") ? n.link.replace("/client", "/client") : n.link;
                router.push(`/tg${path}` as never);
              }
            };
            return (
              <motion.button
                key={n.id}
                onClick={onClick}
                className={`w-full text-left p-3 rounded-xl border ${isUnread ? "border-brand-500/30 bg-brand-500/[0.03]" : "border-border-faint bg-surface"} active:bg-bg-secondary transition-colors`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isUnread ? "bg-brand-500/15" : "bg-bg-secondary"}`}>
                    <Bell className={`w-4 h-4 ${isUnread ? "text-brand-500" : "text-text-muted"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-0.5 truncate">{n.title}</div>
                    {n.body && <div className="text-xs text-text-secondary leading-relaxed line-clamp-2">{n.body}</div>}
                    <div className="text-[10px] text-text-muted mt-1">{ageStr}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
