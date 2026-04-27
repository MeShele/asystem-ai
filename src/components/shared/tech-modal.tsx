"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowSquareOut } from "@phosphor-icons/react";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiPostgresql,
  SiSupabase,
  SiPrisma,
  SiTailwindcss,
  SiShadcnui,
  SiFramer,
  SiTelegram,
  SiClaude,
  SiAnthropic,
  SiDocker,
  SiVercel,
  SiGithubactions,
  SiStripe,
  SiExpo,
  SiRedis,
  SiSocket,
  SiN8n,
  SiI18next,
} from "@icons-pack/react-simple-icons";
import type { IconType } from "@icons-pack/react-simple-icons";

export type Tech = {
  id: string;
  name: string;
  category: string;
  desc: string;
  why: string;
  url?: string;
  logo?: IconType;
  logoColor?: string;
  fallback?: string; // emoji or short text if no brand logo
};

export const TECH_STACK: Tech[] = [
  {
    id: "nextjs",
    name: "Next.js 16",
    category: "FRAMEWORK · FRONTEND",
    desc: "React-фреймворк от Vercel. App Router, React Server Components, edge-runtime, встроенный i18n и Image-оптимизация.",
    why: "Основа всех наших веб-проектов. Быстрый билд, отличный DX, production-ready из коробки.",
    url: "https://nextjs.org",
    logo: SiNextdotjs,
    logoColor: "#000000",
  },
  {
    id: "react",
    name: "React 19",
    category: "UI · LIBRARY",
    desc: "Библиотека для интерфейсов. Server Components, useOptimistic, ref as prop, улучшенная гидратация.",
    why: "Экосистема №1 для фронта. Все наши клиенты получают code-base, которую легко поддерживать любой команде.",
    url: "https://react.dev",
    logo: SiReact,
    logoColor: "#61DAFB",
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "LANGUAGE · STATIC TYPING",
    desc: "JavaScript со статической типизацией. Catch-bugs at compile-time, IDE-autocomplete, рефакторинг без страха.",
    why: "Обязательный стандарт на всех наших проектах. Нет типов — нет стабильности на масштабе.",
    url: "https://www.typescriptlang.org",
    logo: SiTypescript,
    logoColor: "#3178C6",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "DATABASE · RELATIONAL",
    desc: "Надёжнейшая реляционная СУБД с 25-летней историей. JSONB, full-text search, extensions, hot-standby replication.",
    why: "Дефолт для 90% проектов. Когда нужна надёжность, ACID и сложные запросы — берём Postgres.",
    url: "https://www.postgresql.org",
    logo: SiPostgresql,
    logoColor: "#4169E1",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "BACKEND · BaaS",
    desc: "Open-source альтернатива Firebase. Postgres + Auth + Storage + Realtime + Edge Functions в одном продукте.",
    why: "Для MVP и быстрых прототипов — готовый бэкенд за час. Если проект растёт — можно мигрировать.",
    url: "https://supabase.com",
    logo: SiSupabase,
    logoColor: "#3FCF8E",
  },
  {
    id: "prisma",
    name: "Prisma",
    category: "ORM · TYPE-SAFE",
    desc: "ORM для TypeScript/Node.js. Schema-first, автогенерация типов, миграции, Prisma Studio для визуального доступа к БД.",
    why: "Все запросы к Postgres через Prisma. Типобезопасно, быстро, не надо писать SQL руками.",
    url: "https://www.prisma.io",
    logo: SiPrisma,
    logoColor: "#2D3748",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS v4",
    category: "CSS · UTILITY-FIRST",
    desc: "Utility-first CSS-фреймворк. Классы пишешь прямо в разметке, zero runtime, JIT-компиляция, дизайн-токены в CSS-переменных.",
    why: "Скорость разработки × 3. Без отдельных CSS-файлов, без конфликтов имён, лёгкий бандл.",
    url: "https://tailwindcss.com",
    logo: SiTailwindcss,
    logoColor: "#06B6D4",
  },
  {
    id: "shadcn",
    name: "shadcn/ui",
    category: "COMPONENTS · COPY-PASTE",
    desc: "Коллекция React-компонентов на Radix UI + Tailwind. Не npm-пакет — копируются в проект, ты владеешь кодом.",
    why: "Готовый набор доступных компонентов (Dialog, Combobox, Tabs, Form) без lock-in в стороннюю библиотеку.",
    url: "https://ui.shadcn.com",
    logo: SiShadcnui,
    logoColor: "#000000",
  },
  {
    id: "framer-motion",
    name: "Framer Motion",
    category: "ANIMATION · REACT",
    desc: "Декларативная анимация для React. Spring-физика, gestures, layout-anim, scroll-triggered эффекты, shared-element transitions.",
    why: "Вся анимация на наших сайтах — на нём. Читаемый код, production-ready, хорошая работа с accessibility.",
    url: "https://motion.dev",
    logo: SiFramer,
    logoColor: "#0055FF",
  },
  {
    id: "next-intl",
    name: "next-intl",
    category: "I18N · LOCALIZATION",
    desc: "Библиотека для локализации Next.js-приложений. Server + Client компоненты, message-форматирование, date/number-локали, routing.",
    why: "Наш стандарт для мультиязычных проектов (RU/EN/KG на этом сайте). Работает с App Router нативно.",
    url: "https://next-intl.dev",
    logo: SiI18next,
    logoColor: "#26A69A",
  },
  {
    id: "telegram-bot",
    name: "Telegram Bot API",
    category: "MESSAGING · BOT",
    desc: "Официальный API Telegram для ботов. Webhooks, inline keyboards, MTProto, file-uploads до 2GB, WebApp embedding.",
    why: "90% наших клиентов хотят уведомления/запись через Telegram. Самая быстрая мессенджер-интеграция в СНГ.",
    url: "https://core.telegram.org/bots/api",
    logo: SiTelegram,
    logoColor: "#26A5E4",
  },
  {
    id: "n8n",
    name: "n8n",
    category: "AUTOMATION · WORKFLOW",
    desc: "Open-source альтернатива Zapier/Make. Self-hosted workflow-engine с 500+ интеграциями. Fair-code лицензия.",
    why: "Клеим разрозненные системы между собой без написания кода. Self-host — никаких подписок для клиента.",
    url: "https://n8n.io",
    logo: SiN8n,
    logoColor: "#EA4B71",
  },
  {
    id: "openai",
    name: "OpenAI GPT-4o",
    category: "AI · LLM",
    desc: "Флагманская мультимодальная модель OpenAI. Text, vision, voice — всё в одном API. Function calling, structured outputs.",
    why: "Базовый LLM для большинства AI-фич: чат-боты, RAG, классификация, генерация контента.",
    url: "https://openai.com",
    fallback: "AI",
  },
  {
    id: "claude",
    name: "Claude",
    category: "AI · LLM · ANTHROPIC",
    desc: "LLM от Anthropic. 200K context window, лучший reasoning для кодинга и анализа длинных документов. Artifacts, Computer Use.",
    why: "Когда нужна аккуратность, длинный контекст и вдумчивые ответы — Claude > GPT для этих задач.",
    url: "https://anthropic.com",
    logo: SiClaude,
    logoColor: "#D97757",
  },
  {
    id: "anthropic-sdk",
    name: "Anthropic SDK",
    category: "SDK · AI",
    desc: "Официальный TypeScript/Python SDK для Claude API. Streaming, tool-use, prompt-caching, batch-processing.",
    why: "Наш предпочитаемый SDK. Типы свежие, документация внятная, cache снижает стоимость в 10×.",
    url: "https://github.com/anthropics/anthropic-sdk-typescript",
    logo: SiAnthropic,
    logoColor: "#D97757",
  },
  {
    id: "whisper",
    name: "Whisper",
    category: "AI · SPEECH-TO-TEXT",
    desc: "Модель OpenAI для распознавания речи. 99 языков, robust к шуму, отлично с русским и кыргызским.",
    why: "Транскрипция звонков и голосовых сообщений. Locally-hosted версия — для конфиденциальных данных.",
    url: "https://openai.com/research/whisper",
    fallback: "🎙️",
  },
  {
    id: "pgvector",
    name: "pgvector",
    category: "DATABASE · VECTOR",
    desc: "Расширение Postgres для vector embeddings. HNSW-индексы, cosine/L2/inner-product similarity, до 16000 измерений.",
    why: "RAG-поиск без отдельной vector DB. Embeddings живут рядом с обычными данными — один Postgres на всё.",
    url: "https://github.com/pgvector/pgvector",
    logo: SiPostgresql,
    logoColor: "#4169E1",
  },
  {
    id: "docker",
    name: "Docker",
    category: "DEVOPS · CONTAINERS",
    desc: "Контейнеризация для deploy. Один Dockerfile — работает локально, на CI, в production. Docker Compose для оркестрации.",
    why: "Каждый проект упакован в контейнер. Одинаковый run-environment везде — меньше surprises.",
    url: "https://www.docker.com",
    logo: SiDocker,
    logoColor: "#2496ED",
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "HOSTING · EDGE",
    desc: "Хостинг для Next.js и любых frontend-проектов. Edge Functions в 30+ регионах, preview-deployments, встроенная аналитика.",
    why: "Дефолт для наших Next.js-проектов. Деплой — push в Git, всё остальное сделает Vercel.",
    url: "https://vercel.com",
    logo: SiVercel,
    logoColor: "#000000",
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    category: "CI/CD · AUTOMATION",
    desc: "CI/CD от GitHub. YAML-workflows, 4000+ готовых actions в marketplace, matrix-builds, self-hosted runners.",
    why: "Тесты, линт, билд, деплой — всё автоматически на каждый PR. Бесплатно для публичных repo.",
    url: "https://github.com/features/actions",
    logo: SiGithubactions,
    logoColor: "#2088FF",
  },
  {
    id: "playwright",
    name: "Playwright",
    category: "TESTING · E2E",
    desc: "E2E-тестирование от Microsoft. Chromium, Firefox, WebKit в одном API. Auto-wait, video recording, codegen.",
    why: "Критичные flow (регистрация, оплата) тестируются Playwright. Парсинг скриншотов — тоже он.",
    url: "https://playwright.dev",
    fallback: "PW",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "PAYMENTS · GLOBAL",
    desc: "Платёжная система для интернационального бизнеса. 135+ валют, subscriptions, Connect для marketplace, отличная документация.",
    why: "Для проектов с англоязычной аудиторией — дефолт. Чекаут за час, webhooks за пару часов.",
    url: "https://stripe.com",
    logo: SiStripe,
    logoColor: "#635BFF",
  },
  {
    id: "react-native",
    name: "React Native",
    category: "MOBILE · CROSS-PLATFORM",
    desc: "Framework для мобильных приложений на React. iOS + Android из одной кодовой базы. Bridge к native API.",
    why: "Для мобильных проектов — наш дефолт. Не нужно содержать iOS и Android команды отдельно.",
    url: "https://reactnative.dev",
    logo: SiReact,
    logoColor: "#61DAFB",
  },
  {
    id: "expo",
    name: "Expo",
    category: "MOBILE · TOOLING",
    desc: "Платформа поверх React Native. EAS Build в облаке, OTA-updates, встроенные модули (Camera, Location, Push).",
    why: "Билды в сторы без локального Xcode. OTA-апдейты — без rebuild-а при каждой мелкой правке.",
    url: "https://expo.dev",
    logo: SiExpo,
    logoColor: "#000020",
  },
  {
    id: "websocket",
    name: "WebSocket",
    category: "PROTOCOL · REALTIME",
    desc: "Протокол двусторонней связи поверх TCP. Low-latency обмен сообщениями между клиентом и сервером.",
    why: "Realtime-дашборды, live-уведомления, чаты. Когда polling не подходит — берём WS.",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket",
    logo: SiSocket,
    logoColor: "#010101",
  },
  {
    id: "redis",
    name: "Redis",
    category: "CACHE · IN-MEMORY",
    desc: "In-memory key-value store. Cache, rate-limiting, pub/sub, очереди (BullMQ), геоиндексы, Streams.",
    why: "Ускоряет всё: сессии, cached-ответы API, очереди фоновых задач. Обязательно на любом production-проекте.",
    url: "https://redis.io",
    logo: SiRedis,
    logoColor: "#FF4438",
  },
];

export function TechModal({
  tech,
  onClose,
}: {
  tech: Tech | null;
  onClose: () => void;
}) {
  const Logo = tech?.logo;

  return (
    <AnimatePresence>
      {tech && (
        <motion.div
          key="tech-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10"
          style={{ background: "rgba(10,10,10,0.72)", backdropFilter: "blur(12px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="relative w-full max-w-2xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]"
            style={{ background: "#fafafa" }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-5 top-5 z-10 rounded-full transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                background: "rgba(10,10,10,0.06)",
                color: "#0a0a0a",
              }}
            >
              <X size={16} />
            </button>

            <div className="p-8 lg:p-10 flex flex-col gap-6">
              <div className="flex items-center gap-5">
                <div
                  className="shrink-0 flex items-center justify-center rounded-lg"
                  style={{
                    width: 80,
                    height: 80,
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  {Logo ? (
                    <Logo size={44} color={tech.logoColor} />
                  ) : (
                    <span
                      className="font-semibold tracking-tight"
                      style={{
                        fontSize: tech.fallback && tech.fallback.length <= 2 ? 28 : 22,
                        color: "#0a0a0a",
                      }}
                    >
                      {tech.fallback ?? tech.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <div
                    className="font-mono text-[10px]"
                    style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
                  >
                    {tech.category}
                  </div>
                  <h3
                    className="font-semibold tracking-tight"
                    style={{
                      fontSize: "clamp(22px, 2.5vw, 32px)",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "#0a0a0a",
                    }}
                  >
                    {tech.name}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div
                    className="font-mono text-[10px] mb-2"
                    style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
                  >
                    ЧТО ЭТО
                  </div>
                  <p
                    className="text-[14.5px]"
                    style={{ color: "#0a0a0a", lineHeight: 1.6 }}
                  >
                    {tech.desc}
                  </p>
                </div>

                <div>
                  <div
                    className="font-mono text-[10px] mb-2"
                    style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
                  >
                    ПОЧЕМУ МЫ ИСПОЛЬЗУЕМ
                  </div>
                  <p
                    className="text-[14.5px]"
                    style={{ color: "#525252", lineHeight: 1.6 }}
                  >
                    {tech.why}
                  </p>
                </div>
              </div>

              {tech.url && (
                <a
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start px-5 py-2.5 font-mono transition-colors"
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                    border: "1px solid #0a0a0a",
                    color: "#0a0a0a",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "#0a0a0a";
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#0a0a0a";
                  }}
                >
                  ОФИЦИАЛЬНЫЙ САЙТ
                  <ArrowSquareOut size={14} />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
