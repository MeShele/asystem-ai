"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, AlertCircle } from "lucide-react";

interface KpMessage {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

interface KpChatProps {
  projectId: number;
  kpMessages: KpMessage[];
  onKpGenerated?: () => void;
}

export function KpChat({ projectId, kpMessages, onKpGenerated }: KpChatProps) {
  const [messages, setMessages] = useState<KpMessage[]>(kpMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Sync external messages */
  useEffect(() => {
    setMessages(kpMessages);
  }, [kpMessages]);

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: KpMessage = {
      id: Date.now(),
      role: "user",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/partner/clients/${projectId}/kp/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.error ?? "Ошибка при отправке сообщения";
        if (errMsg.includes("not configured")) {
          setError("AI не настроен. Обратитесь к администратору.");
        } else {
          setError(errMsg);
        }
        return;
      }

      const data = await res.json();

      if (data.message) {
        const content = typeof data.message === "string" ? data.message : data.message.content ?? "";
        const assistantMsg: KpMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }

      if (data.kpExtracted && onKpGenerated) {
        onKpGenerated();
      }
    } catch {
      setError("Не удалось отправить сообщение. Проверьте подключение.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  /* Empty state */
  if (messages.length === 0 && !loading) {
    return (
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-6 flex flex-col items-center text-center space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-brand-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            AI-ассистент для КП
          </h3>
          <p className="text-sm text-text-muted mt-1">
            Помогу составить коммерческое предложение на основе данных проекта
          </p>
        </div>
        <button
          onClick={() =>
            sendMessage("Привет! Давай создадим КП для этого проекта.")
          }
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Начать создание КП
        </button>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-xl border border-border-faint bg-surface flex flex-col"
      style={{ height: "480px" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border-faint shrink-0">
        <Sparkles className="w-4 h-4 text-brand-500" />
        <span className="text-sm font-semibold text-text-primary">
          AI-ассистент для КП
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    isUser
                      ? "bg-brand-500 text-white rounded-br-sm"
                      : "bg-bg-secondary border border-border-faint text-text-primary rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-[10px] mt-1 ${
                      isUser ? "text-white/60" : "text-text-muted"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-bg-secondary border border-border-faint rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-text-muted"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-text-muted"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-text-muted"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Error display */}
        {error && (
          <motion.div
            className="flex items-center gap-2 text-sm text-red-500 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border-faint shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-bg-secondary border border-border-faint text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500/40 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="shrink-0 w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
