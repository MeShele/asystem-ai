"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, ExternalLink, Sparkles, X } from "lucide-react";

interface PairResp {
  code: string;
  url: string;
  expires_in: number;
}

/**
 * Баннер «Привязать Telegram» для клиента.
 * Показывается на /client/dashboard если у клиента нет telegram_id.
 * После клика генерирует deep-link на бота и поллит статус привязки.
 */
export function ClientTelegramBind() {
  const [linked, setLinked] = useState<boolean | null>(null);
  const [tgUsername, setTgUsername] = useState<string | null>(null);
  const [pair, setPair] = useState<PairResp | null>(null);
  const [pairLoading, setPairLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkStatus = async () => {
    const res = await fetch("/api/client/telegram/status");
    if (!res.ok) return;
    const data = await res.json();
    setLinked(!!data.linked);
    setTgUsername(data.telegram_username || null);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Polling статуса пока генерируется ссылка
  useEffect(() => {
    if (!pair) return;
    const interval = setInterval(async () => {
      const res = await fetch("/api/client/telegram/status");
      if (!res.ok) return;
      const data = await res.json();
      if (data.linked) {
        setLinked(true);
        setTgUsername(data.telegram_username || null);
        setPair(null);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pair]);

  const startPair = async () => {
    setPairLoading(true);
    try {
      const res = await fetch("/api/client/telegram/start-pair", { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as PairResp;
        setPair(data);
      } else {
        alert("Не удалось сгенерировать ссылку. Попробуйте позже.");
      }
    } finally {
      setPairLoading(false);
    }
  };

  if (linked === null) return null;

  // Уже привязан — показываем подтверждение (и кнопку отвязать)
  if (linked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-xl border border-green-500/30 bg-green-500/[0.04] p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-green-700">Telegram подключён</div>
          <div className="text-xs text-text-muted truncate">
            {tgUsername ? `@${tgUsername}` : "Уведомления приходят в Telegram"}
          </div>
        </div>
        <button
          onClick={async () => {
            if (!confirm("Отвязать Telegram?")) return;
            await fetch("/api/client/telegram/unlink", { method: "POST" });
            setLinked(false);
            setTgUsername(null);
          }}
          className="text-[11px] text-text-muted hover:text-text-primary px-2 py-1"
        >
          Отвязать
        </button>
      </motion.div>
    );
  }

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/[0.06] via-surface to-surface p-5 relative"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-bg-secondary hover:bg-border-faint flex items-center justify-center text-text-muted"
        aria-label="Скрыть"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence mode="wait">
        {!pair ? (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 text-brand-500" strokeWidth={2.2} />
              </div>
              <div className="flex-1 pr-8">
                <h3 className="text-base font-bold tracking-tight mb-1">Получайте обновления в Telegram</h3>
                <p className="text-sm text-text-muted leading-snug">
                  Привяжите Telegram — и не пропустите ни одного этапа. Команда будет писать о ходе работы прямо в боте.
                </p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-4 ml-1">
              <Bullet text="Смена статуса проекта" />
              <Bullet text="Новый комментарий от команды" />
              <Bullet text="Готовность результата к проверке" />
            </ul>

            <button
              onClick={startPair}
              disabled={pairLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              {pairLoading ? "Генерация ссылки..." : "Привязать через Telegram-бота"}
            </button>
          </motion.div>
        ) : (
          <motion.div key="pair" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 text-brand-500" strokeWidth={2.2} />
              </div>
              <div className="flex-1 pr-8">
                <h3 className="text-base font-bold tracking-tight mb-1">Откройте бота в Telegram</h3>
                <p className="text-sm text-text-muted leading-snug">
                  Перейдите по ссылке и нажмите <b>Start</b>. Аккаунт привяжется автоматически — эта страница обновится сама.
                </p>
              </div>
            </div>

            <a
              href={pair.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-between gap-2 px-5 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
            >
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Открыть бота
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="text-[11px] text-text-muted text-center mt-3 leading-relaxed">
              Код живёт 10 минут. После Start страница обновится автоматически.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-xs text-text-secondary">
      <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" />
      {text}
    </li>
  );
}
