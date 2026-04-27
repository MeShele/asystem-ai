"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Shield, Handshake, User } from "lucide-react";

interface Comment {
  id: number;
  project_id: string;
  author_role: "admin" | "partner" | "client";
  author_id: string;
  author_name: string;
  message: string;
  created_at: string;
}

const roleMeta: Record<string, { label: string; color: string; bg: string; Icon: typeof Shield }> = {
  admin: { label: "Администратор", color: "text-purple-500", bg: "bg-purple-500/10", Icon: Shield },
  partner: { label: "Партнёр", color: "text-brand-500", bg: "bg-brand-500/10", Icon: Handshake },
  client: { label: "Клиент", color: "text-green-500", bg: "bg-green-500/10", Icon: User },
};

interface Props {
  projectId: string;
}

export function ProjectComments({ projectId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => {
    fetch(`/api/projects/${projectId}/comments`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => {
        setComments(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/projects/${projectId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setText("");
      load();
    }
  };

  return (
    <div className="rounded-xl border border-border-faint bg-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-text-muted" />
        <h3 className="text-sm font-semibold">Обсуждение проекта</h3>
        <span className="text-xs text-text-muted">{comments.length}</span>
      </div>

      {loading ? (
        <p className="text-text-muted text-sm py-4 text-center">Загрузка...</p>
      ) : comments.length === 0 ? (
        <p className="text-text-muted text-sm py-4 text-center">
          Сообщений пока нет — напишите первый комментарий
        </p>
      ) : (
        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
          {comments.map((c) => {
            const meta = roleMeta[c.author_role] || roleMeta.admin;
            const { Icon } = meta;
            return (
              <div key={c.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium">{c.author_name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(c.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary whitespace-pre-line">{c.message}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Написать комментарий... (Cmd/Ctrl+Enter — отправить)"
          rows={2}
          className="flex-1 px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none resize-none"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 disabled:opacity-40 text-white text-sm font-medium transition-colors flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
          {sending ? "..." : "Отправить"}
        </button>
      </div>
    </div>
  );
}
