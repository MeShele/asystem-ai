# Architecture Document — asystem.ai

**Версия:** 1.0  
**Дата:** 28 февраля 2026  
**Автор:** Winston (Architect)  
**Статус:** Draft

---

## 1. Обзор архитектуры

### 1.1 Принципы

1. **Простота прежде всего** — минимум движущих частей, максимум результата
2. **Boring Technology** — проверенные инструменты (Next.js, PostgreSQL, Supabase)
3. **Progressive Enhancement** — MVP без over-engineering, масштабирование по мере роста
4. **Developer Productivity** — один репозиторий, один деплой, быстрые итерации
5. **Security by Default** — RLS, CSRF, rate limiting из коробки

### 1.2 Высокоуровневая архитектура

```
                    ┌──────────────────────────────────┐
                    │           Vercel (CDN + Edge)      │
                    │  ┌──────────────────────────────┐  │
                    │  │      Next.js 15 (App Router)   │  │
                    │  │                                │  │
                    │  │  ┌──────┐ ┌──────┐ ┌────────┐ │  │
                    │  │  │Public│ │Client│ │ Admin  │ │  │
                    │  │  │Pages │ │Portal│ │Dashboard│ │  │
                    │  │  │(SSG) │ │(CSR) │ │ (CSR)  │ │  │
                    │  │  └──┬───┘ └──┬───┘ └───┬────┘ │  │
                    │  │     └────────┼─────────┘      │  │
                    │  │         API Routes             │  │
                    │  │     (Server Actions + REST)    │  │
                    │  └──────────────┬─────────────────┘  │
                    └─────────────────┼────────────────────┘
                                     │
                    ┌────────────────┬┼────────────────┐
                    │                ││                │
                    ▼                ▼▼                ▼
            ┌────────────┐  ┌────────────┐   ┌────────────┐
            │  Supabase   │  │  Telegram   │   │   Resend   │
            │             │  │  Bot API    │   │  (Email)   │
            │ ┌──────────┐│  │             │   │            │
            │ │PostgreSQL ││  │ Webhooks   │   │ Templates  │
            │ │   + RLS   ││  │ Commands   │   │ Tracking   │
            │ ├──────────┤│  └────────────┘   └────────────┘
            │ │   Auth    ││
            │ ├──────────┤│
            │ │  Storage  ││
            │ ├──────────┤│
            │ │ Realtime  ││
            │ └──────────┘│
            └────────────┘
```

---

## 2. Технологический стек

### 2.1 Frontend

| Технология | Версия | Обоснование |
|------------|--------|-------------|
| **Next.js** | 15.x (App Router) | SSR/SSG для SEO, Server Components, Server Actions, один фреймворк |
| **React** | 19.x | Стандарт, широкая экосистема |
| **TypeScript** | 5.x | Типобезопасность, DX, рефакторинг |
| **Tailwind CSS** | 4.x | Utility-first, кастомная тема (брендбук), JIT |
| **shadcn/ui** | latest | Accessible компоненты, полная кастомизация |
| **Framer Motion** | 11.x | Анимации (particles, transitions, hover-effects) |
| **next-intl** | latest | i18n с prefix routing, SSR-compatible |
| **React Hook Form** | 7.x | Производительные формы (квиз) |
| **Zod** | 3.x | Валидация схем (shared client/server) |

### 2.2 Backend

| Технология | Обоснование |
|------------|-------------|
| **Next.js API Routes** | Единый деплой, Server Actions для мутаций |
| **Supabase** | PostgreSQL + Auth + Storage + Realtime в одном |
| **Supabase Auth** | Email/пароль, Google OAuth, magic link |
| **Supabase RLS** | Row Level Security — разделение данных по ролям |
| **Supabase Storage** | Файлы проектов (документы, изображения) |
| **Supabase Realtime** | Live-обновления статусов в кабинете |

### 2.3 Интеграции

| Сервис | Назначение |
|--------|------------|
| **Telegram Bot API** | Уведомления + быстрые действия |
| **Resend** | Транзакционные email |
| **Google Analytics 4** | Аналитика трафика |
| **Яндекс.Метрика** | Аналитика (СНГ-трафик) |
| **Vercel Analytics** | Web Vitals мониторинг |

### 2.4 Infrastructure

| Компонент | Сервис | Tier |
|-----------|--------|------|
| **Hosting** | Vercel | Pro ($20/мес) |
| **Database** | Supabase | Free → Pro по мере роста |
| **DNS** | Cloudflare | Free |
| **Email** | Resend | Free (3000/мес) → Pro |
| **Monitoring** | Vercel + Sentry | Free tier |

---

## 3. Структура проекта

```
asystem.ai/
├── src/
│   ├── app/
│   │   ├── [locale]/           # i18n routing
│   │   │   ├── page.tsx        # Splash screen (3 cards)
│   │   │   ├── layout.tsx      # Root layout + providers
│   │   │   │
│   │   │   ├── client/
│   │   │   │   ├── page.tsx           # Client landing
│   │   │   │   ├── services/page.tsx  # Services detail
│   │   │   │   ├── cases/page.tsx     # Portfolio
│   │   │   │   ├── request/page.tsx   # Quiz form
│   │   │   │   └── dashboard/        # Client portal (auth)
│   │   │   │       ├── page.tsx
│   │   │   │       └── [requestId]/page.tsx
│   │   │   │
│   │   │   ├── partner/
│   │   │   │   ├── page.tsx           # Partner landing
│   │   │   │   ├── program/page.tsx   # Program details
│   │   │   │   ├── apply/page.tsx     # Partner application
│   │   │   │   └── dashboard/        # Partner portal (auth)
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── products/
│   │   │   │   └── page.tsx           # Coming soon
│   │   │   │
│   │   │   └── admin/                 # Admin panel (auth + RBAC)
│   │   │       ├── page.tsx           # Dashboard overview
│   │   │       ├── requests/page.tsx  # Kanban pipeline
│   │   │       ├── clients/page.tsx   # Client management
│   │   │       └── partners/page.tsx  # Partner management
│   │   │
│   │   └── api/
│   │       ├── requests/route.ts      # CRUD заявок
│   │       ├── partners/route.ts      # Партнёрские операции
│   │       ├── telegram/
│   │       │   └── webhook/route.ts   # Telegram bot webhook
│   │       ├── email/route.ts         # Email sending
│   │       └── upload/route.ts        # File uploads
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── language-switcher.tsx
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   ├── services-grid.tsx
│   │   │   ├── cases-carousel.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   └── cta-section.tsx
│   │   ├── splash/
│   │   │   ├── entry-cards.tsx
│   │   │   └── particles-bg.tsx
│   │   ├── quiz/
│   │   │   ├── quiz-form.tsx
│   │   │   ├── step-service-type.tsx
│   │   │   ├── step-details.tsx
│   │   │   ├── step-timeline.tsx
│   │   │   ├── step-budget.tsx
│   │   │   └── step-contact.tsx
│   │   ├── dashboard/
│   │   │   ├── request-card.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── status-badge.tsx
│   │   │   └── stats-widget.tsx
│   │   └── shared/
│   │       ├── glass-card.tsx
│   │       ├── section-header.tsx
│   │       └── animated-counter.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser client
│   │   │   ├── server.ts        # Server client
│   │   │   └── middleware.ts    # Auth middleware
│   │   ├── telegram/
│   │   │   ├── bot.ts           # Bot instance
│   │   │   ├── commands.ts      # Command handlers
│   │   │   └── notifications.ts # Notification helpers
│   │   ├── email/
│   │   │   ├── resend.ts        # Resend client
│   │   │   └── templates.ts     # Email templates
│   │   ├── validations/
│   │   │   ├── request.ts       # Zod schemas
│   │   │   ├── partner.ts
│   │   │   └── auth.ts
│   │   └── utils.ts             # Helpers
│   │
│   ├── hooks/
│   │   ├── use-requests.ts
│   │   ├── use-auth.ts
│   │   └── use-realtime.ts
│   │
│   ├── types/
│   │   ├── database.ts          # Supabase generated types
│   │   ├── request.ts
│   │   └── partner.ts
│   │
│   ├── messages/                # i18n translations
│   │   ├── ru.json
│   │   ├── kg.json
│   │   └── en.json
│   │
│   └── styles/
│       └── globals.css          # Tailwind + custom properties
│
├── public/
│   ├── images/
│   ├── fonts/
│   └── og/                      # Open Graph images
│
├── supabase/
│   ├── migrations/              # Database migrations
│   │   ├── 001_users.sql
│   │   ├── 002_requests.sql
│   │   ├── 003_partners.sql
│   │   ├── 004_documents.sql
│   │   ├── 005_notifications.sql
│   │   └── 006_rls_policies.sql
│   └── seed.sql                 # Test data
│
├── .env.local                   # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. База данных

### 4.1 Схема (PostgreSQL / Supabase)

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'partner', 'admin')),
    language TEXT NOT NULL DEFAULT 'ru' CHECK (language IN ('ru', 'kg', 'en')),
    telegram_id BIGINT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Requests (заявки)
CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id),
    partner_id UUID REFERENCES public.profiles(id),
    referral_code TEXT,
    type TEXT NOT NULL CHECK (type IN ('website', 'bot', 'mobile_app', 'automation', 'custom')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'discussing', 'in_progress', 'review', 'completed', 'cancelled')),
    details JSONB NOT NULL DEFAULT '{}',
    budget TEXT,
    deadline TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    preferred_contact TEXT DEFAULT 'phone',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Status log (история изменений)
CREATE TABLE public.status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partners (расширение профиля для партнёров)
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    field TEXT NOT NULL,
    audience_size TEXT,
    commission_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
    total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents (файлы проектов)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email subscribers (продукты coming soon)
CREATE TABLE public.email_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'products_coming_soon',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_requests_client ON public.requests(client_id);
CREATE INDEX idx_requests_partner ON public.requests(partner_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_status_logs_request ON public.status_logs(request_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_partners_referral ON public.partners(referral_code);
```

### 4.2 Row Level Security (RLS)

```sql
-- Profiles: users see only their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Requests: clients see own, partners see referred, admins see all
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients see own requests"
    ON public.requests FOR SELECT
    USING (client_id = auth.uid());
CREATE POLICY "Partners see referred requests"
    ON public.requests FOR SELECT
    USING (partner_id = auth.uid());
CREATE POLICY "Admins see all requests"
    ON public.requests FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Public insert for new requests (no auth required)
CREATE POLICY "Anyone can create request"
    ON public.requests FOR INSERT
    WITH CHECK (true);
```

---

## 5. API Design

### 5.1 Server Actions (рекомендуемый подход)

```typescript
// src/app/actions/requests.ts
'use server'

export async function createRequest(data: RequestFormData) { ... }
export async function updateRequestStatus(id: string, status: Status) { ... }
export async function getMyRequests() { ... }
```

### 5.2 REST API (для Telegram Bot + внешние интеграции)

| Method | Endpoint | Auth | Описание |
|--------|----------|------|----------|
| POST | `/api/requests` | Public | Создать заявку |
| GET | `/api/requests` | Auth | Список заявок (по роли) |
| PATCH | `/api/requests/[id]` | Admin | Обновить статус |
| POST | `/api/partners/apply` | Public | Заявка на партнёрство |
| POST | `/api/telegram/webhook` | Webhook Secret | Входящие от Telegram |
| POST | `/api/email/send` | Internal | Отправка email |
| POST | `/api/upload` | Auth | Загрузка файлов |
| POST | `/api/subscribe` | Public | Подписка на продукты |

---

## 6. Telegram Bot

### 6.1 Архитектура

```
Telegram API ──webhook──▶ /api/telegram/webhook
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              /start      /status     Callbacks
              (bind)    (list reqs)  (accept/call)
                               │
                          Supabase DB
```

### 6.2 Формат уведомления

```
🆕 Новая заявка #A-0042

📋 Тип: Telegram бот
👤 Контакт: Айбек Мамбетов
📞 +996 555 123 456
🏢 Кофейня "Бариста"
⏰ Срок: 1-2 недели
💰 Бюджет: 30-100K KGS

[✅ Принять] [📞 Позвонить] [👁 Подробнее]
```

---

## 7. Деплой и CI/CD

### 7.1 Environments

| Среда | URL | Branch | Назначение |
|-------|-----|--------|------------|
| Production | asystem.ai | main | Продакшен |
| Preview | *.vercel.app | PR branches | Превью для ревью |
| Local | localhost:3000 | — | Разработка |

### 7.2 CI/CD Pipeline (GitHub Actions)

```yaml
# На каждый PR:
- Lint (ESLint)
- Type check (tsc)
- Unit tests (Vitest)
- Build check
- Preview deploy (Vercel)

# На merge в main:
- Всё вышеперечисленное
- E2E tests (Playwright)
- Production deploy (Vercel)
- Supabase migrations (если есть)
```

### 7.3 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_ADMIN_CHAT_ID=

# Email
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_YM_ID=

# App
NEXT_PUBLIC_APP_URL=https://asystem.ai
```

---

## 8. Решения и обоснования (ADR)

### ADR-001: Next.js вместо отдельного backend

**Контекст:** Нужен SSR для SEO + API для бота и кабинетов.  
**Решение:** Единый Next.js проект с API Routes и Server Actions.  
**Обоснование:** Один деплой, один репо, быстрее итерации. Supabase берёт на себя тяжёлый backend (auth, storage, realtime). Разделять на микросервисы — overkill для текущего масштаба.

### ADR-002: Supabase вместо custom backend

**Контекст:** Нужна БД, аутентификация, хранение файлов, realtime.  
**Решение:** Supabase как Backend-as-a-Service.  
**Обоснование:** PostgreSQL с RLS, встроенная auth (Google, email), Storage для файлов, Realtime для live-обновлений. Бесплатный тир для старта, масштабирование одной кнопкой.

### ADR-003: next-intl для i18n

**Контекст:** 3 языка, SSR-compatible, SEO (hreflang).  
**Решение:** next-intl с prefix-based routing.  
**Обоснование:** Лучшая интеграция с App Router, автоматический hreflang, SSR/SSG support, type-safe переводы.

### ADR-004: Telegram Bot на webhooks

**Контекст:** Нужны уведомления и быстрые действия.  
**Решение:** Webhook через API Route, без long-polling.  
**Обоснование:** Serverless-compatible (Vercel), не нужен отдельный процесс, масштабируется автоматически.

---

## 9. Мониторинг и Observability

| Аспект | Инструмент |
|--------|------------|
| Errors | Sentry (free tier) |
| Performance | Vercel Analytics + Web Vitals |
| Uptime | Vercel (встроенный) |
| DB monitoring | Supabase Dashboard |
| Logs | Vercel Logs |

---

*Документ подготовлен Winston (Architect) на основе PRD v1.0*  
*Tech Stack утверждён для Phase 1-2. Пересмотр перед Phase 3.*
