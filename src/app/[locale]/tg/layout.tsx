"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Wallet,
  Network,
  Trophy,
  BookOpen,
} from "lucide-react";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string } };
  ready: () => void;
  expand: () => void;
  close: () => void;
  themeParams?: Record<string, string>;
  colorScheme?: "light" | "dark";
  platform?: string;
  version?: string;
  isExpanded?: boolean;
  viewportHeight?: number;
  viewportStableHeight?: number;
  contentSafeAreaInset?: { top: number; bottom: number; left: number; right: number };
  safeAreaInset?: { top: number; bottom: number; left: number; right: number };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  requestFullscreen?: () => void;
  BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

const tgNavItems = [
  { href: "/tg/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/tg/projects", label: "Проекты", icon: FolderKanban },
  { href: "/tg/network", label: "Сеть", icon: Network },
  { href: "/tg/payouts", label: "Выплаты", icon: Wallet },
  { href: "/tg/achievements", label: "Уровни", icon: Trophy },
  { href: "/tg/knowledge", label: "Знания", icon: BookOpen },
];

type AuthStatus = "loading" | "ok" | "not_linked" | "error";

export default function TmaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [tgUser, setTgUser] = useState<{ first_name?: string } | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Polling: ждём пока Telegram WebApp script загрузится (макс 5 сек)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.Telegram?.WebApp) {
        clearInterval(interval);
        setScriptReady(true);
      } else if (attempts > 50) {
        clearInterval(interval);
        // Скрипт не загрузился — возможно открыто вне Telegram
        setScriptReady(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auth flow — запускается после загрузки скрипта
  useEffect(() => {
    if (!scriptReady) return;
    if (typeof window === "undefined") return;
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev) {
        setStatus("ok"); // в dev пропускаем
        return;
      }
      setStatus("error");
      setErrorMsg("Откройте Mini App через Telegram бота");
      return;
    }

    tg.ready();
    tg.expand();
    // Запрашиваем fullscreen где доступен (Bot API 8.0+) — иначе TG-кнопки накрывают контент
    try { tg.requestFullscreen?.(); } catch {}
    try { tg.disableVerticalSwipes?.(); } catch {}

    // Прокидываем safe-area insets в CSS-переменные (Bot API 8.0+)
    const applyInsets = () => {
      const top = tg.contentSafeAreaInset?.top ?? tg.safeAreaInset?.top ?? 0;
      const bottom = tg.contentSafeAreaInset?.bottom ?? tg.safeAreaInset?.bottom ?? 0;
      // Минимальный отступ сверху на старых клиентах где safe-area не приходит
      const fallbackTop = !tg.isExpanded || (tg.platform && /android|ios/i.test(tg.platform)) ? 8 : 0;
      document.documentElement.style.setProperty("--tg-safe-top", `${Math.max(top, fallbackTop)}px`);
      document.documentElement.style.setProperty("--tg-safe-bottom", `${bottom}px`);
    };
    applyInsets();
    window.addEventListener("resize", applyInsets);

    setTgUser(tg.initDataUnsafe?.user || null);

    if (!tg.initData) {
      setStatus("error");
      setErrorMsg("Telegram не передал данные авторизации");
      return;
    }

    fetch("/api/tg/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData }),
    })
      .then(async (r) => {
        if (r.ok) {
          setStatus("ok");
          if (pathname === "/tg" || pathname === "/tg/") {
            router.replace("/tg/dashboard");
          }
        } else if (r.status === 404) {
          setStatus("not_linked");
        } else {
          const err = await r.json().catch(() => ({}));
          setStatus("error");
          setErrorMsg(err.reason || err.error || "Ошибка авторизации");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Сетевая ошибка при авторизации");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptReady]);

  return (
    <>
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />

      {status === "loading" && (
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            <div className="text-xs text-text-muted">Проверка авторизации...</div>
          </div>
        </div>
      )}

      {status === "not_linked" && (
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary p-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-amber-500" fill="none">
                <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Доступ закрыт</h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              {tgUser?.first_name ? `${tgUser.first_name}, ваш` : "Ваш"} Telegram ещё не привязан к партнёрскому аккаунту.
              Зарегистрируйтесь на сайте и привяжите Telegram в настройках.
            </p>
            <a
              href={`${typeof window !== "undefined" ? window.location.origin : ""}/ru/partner/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors"
            >
              Открыть сайт
            </a>
            <p className="text-[11px] text-text-muted mt-4 leading-relaxed">
              После регистрации вернитесь сюда — Mini App автоматически подхватит ваш аккаунт.
            </p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary p-6">
          <div className="max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-500" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2">Ошибка</h1>
            <p className="text-sm text-text-secondary leading-relaxed">{errorMsg || "Что-то пошло не так"}</p>
          </div>
        </div>
      )}

      {status === "ok" && (
        <div
          className="min-h-[100dvh] bg-bg-primary flex flex-col"
          style={{
            paddingTop: "var(--tg-safe-top, env(safe-area-inset-top, 0px))",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <main className="flex-1 pb-24">{children}</main>

          <nav
            className="fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border-faint flex items-stretch"
            style={{
              paddingBottom: "var(--tg-safe-bottom, 0px)",
              minHeight: "calc(64px + var(--tg-safe-bottom, 0px))",
            }}
          >
            {tgNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href as never)}
                  className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-2 px-1 transition-colors ${
                    isActive ? "text-brand-500" : "text-text-muted"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.4 : 2} />
                  <span className="text-[9px] font-medium leading-none truncate max-w-full">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
