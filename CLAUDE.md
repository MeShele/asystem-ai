# ASystem AI Dev — Project Context

## Язык
Всегда отвечай на русском языке.

## Проект
asystem.ai — Независимая AI-first IT-студия из Бишкека (16 человек, 4 production-клиента: Минобр КР, АУРВА, Red Charge, Tulpar Express).

Три портала: клиенты (квиз → личный кабинет), партнёры (партнёрка со свободной наценкой), админ (заявки/проекты/настройки).

**Stack:** Next.js 16 + Turbopack · React 19 · TypeScript · Tailwind 4 · framer-motion · shadcn/ui · PostgreSQL · Anthropic SDK · Telegram Bot · next-intl (RU/KG/EN)

## Дизайн-система (актуально на 2026-04-27)

### Палитра — Brand Blue
- `#2563EB` — **Brand Blue** (CTA, hover, точка в логотипе, accent)
- `#1D4ED8` — Deep Blue (hover-darken)
- `#0a0a0a` — Ink (текст)
- `#fafafa` — Paper (фоны секций)
- `#fff` — карточки
- `#e5e5e5` — borders
- `#10b981` — green (status «онлайн»)

**Красный полностью убран** — был `#ef4444`, заменён на blue. Чёрные backgrounds запрещены.

### Шрифт
**Inter** — единое семейство, один файл вариативный (latin + cyrillic, веса 400/500/600/700). Заменил Space Grotesk + DM Sans + JetBrains Mono. Tabular-nums + ss01 + cv11 для mono-эффекта на лейблах.

### 3D-ассеты
**3dicons.co** — open-source CC0 3D-icon library by Vijay Verma.
- 12 PNG в `clay`-стиле (white matte) сохранены в `public/services/` и `public/lab/`
- CSS-фильтр `sepia(1) hue-rotate(195deg) saturate(3.5) brightness(0.9)` тинтит в Brand Blue
- Двойной drop-shadow с blue glow (`rgba(37,99,235,0.28)`)

**Никаких:** Spline (был — убран из-за вотермарка), WebGL для иконок, платных подписок.

### Иконки UI
- `lucide-react` — UI-иконки (компас, кнопки)
- `@phosphor-icons/react` — duotone (VinylRecord, Egg, X)
- `@icons-pack/react-simple-icons` — brand-логи в Tech Stack (Next, React, TypeScript и др.)
- `@iconify/react` — Microsoft Fluent emoji в модалках сервисов (fallback)

## Структура главной страницы

`src/components/landing/works-wall.tsx` — основной layout (sidebar + grid, threejs.org-style):

1. **Sidebar** (260px sticky) — лого, scroll-progress (тонкая полоса), nav (works/company/contact/language), live timestamp `BISHKEK · ONLINE`
2. **Hero** — eyebrow убран, H1 «Независимая *AI-first студия*. Бишкек, Кыргызстан.» + KPI справа (4× / 0 сом / 24h), MeshGradient blue-mist с WebGL-fallback
3. **Clients (4)** — Минобр / АУРВА / Red Charge / Tulpar — карточки с цветными bg + логотипом + результатом + стеком, hover «VIEW CASE →»
4. **Peace of Mind (4)** — объединённая секция «Четыре обещания» с блоками: 4× быстрее / 0 сом без предоплаты / FIX лояльные цены / 24h ответ по КП
5. **Services (4)** — карточки кликабельные → модалки с расширенным контентом + 3D-объект слева. На карточке Brand Blue 3D объект (sphere/chat-bubble/gear/phone)
6. **Process (4)** — горизонтальный timeline `01 → 02 → 03 → 04` с пунктирной линией, lucide-иконки в кружках, поле «Ваше участие»
7. **Stack (TechMarquee)** — 26 технологий с brand-лого, **бесконечная лента-marquee, hover-чип → модалка с описанием/«что это»/«почему мы используем»/линк**
8. **Lab (8)** — карточки экспериментов с Brand Blue 3D-объектами (calculator, medal, zoom, mail, chart, link, computer, target). Мета: `2026-04 / TOOL` (без англицизмов-статусов)
9. **Team** — 16 фото grayscale → цвет на hover
10. **FinalCTA** — «Посчитать свой путь» с красной (теперь синей) кнопкой
11. **SubmitRow** — `28 BLOCKS · ∞`
12. **Footer wordmark + Easter egg** — гигантский ghost `asystem.ai`, точка `.` = кликабельное **Phosphor Egg duotone**, клик → модалка с **виниловым плеером** (трек «Cashflow Glitch» из Suno AI, vinyl SVG из Phosphor, центральная этикетка со spring rotation, MOOD: ПЕТУШИНЫЙ)

## Партнёрская страница (`/partner`)

`src/components/partner/partner-wall.tsx` — отдельная страница партнёрской программы:
- HeroSection — «Зарабатывай на IT без разработчиков»
- HowSection — как работает
- MathSection — математика сделки (15% + 50/50 split)
- WhoSection — 3 ICP (блогер, коуч, маркетолог)
- TermsSection — таблица «ТЫ — партнёр» / «МЫ — asystem» (5 пар строк)
- FAQSection — 6 вопросов
- FinalCTA — «Стать партнёром»

## Sidebar progress + active section

В `works-wall.tsx`:
- `useActiveSection()` — scroll-based детектор (rAF throttle), якорь на 30% высоты viewport
- `ScrollProgress` — тонкая полоса 2px без текста
- TRACKED_SECTIONS: clients, guarantees, services, process, stack, lab, team

## Производительность

- MeshGradient (`@paper-design/shaders-react`) рендерится только когда hero в viewport + WebGL detected
- ClientCell parallax удалён (было 4 useScroll × 2 useTransform = 8 listeners)
- 3D-иконки — статичные PNG (не WebGL/Spline runtime)
- Iconify иконки — bundle locally через @iconify-json/fluent-emoji
- Native bindings: `@swc/core-darwin-arm64`, `@next/swc-darwin-arm64`, `lightningcss-darwin-arm64` доустановлены вручную

## Deployment

- **Домен:** https://dev.asystem.kg
- **Coolify:** https://c.asystem.kg
- **App UUID:** `dicggi803q5g6mp8t4crfyle`
- **Сервер:** VM 132 (10.30.30.132) на proximus

### GitHub
- Repo: https://github.com/MeShele/asystem-ai (приватный)
- Ветка: main
- PAT: хранится в memory (не коммитить в репо)

### Coolify API
Token: хранится в memory (не коммитить в репо)

### Env (production)
Хранится в Coolify — не коммитить в репо.

### Деплой (после push в main)
```bash
curl -s -X POST -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
  https://c.asystem.kg/api/v1/applications/dicggi803q5g6mp8t4crfyle/deploy
```

### Рестарт без пересборки
```bash
curl -s -X POST -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
  https://c.asystem.kg/api/v1/applications/dicggi803q5g6mp8t4crfyle/restart
```

### Проверка
```bash
curl -sL -o /dev/null -w '%{http_code}' https://dev.asystem.kg
```

### Цепочка трафика
Cloudflare → nginx proximus (116.202.171.29) → Traefik VM 132 → Docker (порт 3000)

### SSH
- К серверу приложения — только через Coolify API
- К proximus: `ssh proximus`

## Dev

- `npm run dev` — Turbopack (НЕ webpack — `--webpack` флаг сломан на этой машине из-за SWC native bindings)
- `next.config.mjs` (не `.ts` — TS-config требует `@swc/core` который иногда не подтягивает darwin-arm64 binary)
- `transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"]` — оставлено для совместимости (Spline удалён из карточек, но компонент `liquid-spline.tsx` оставлен с PNG-имплементацией)

## Скрипты screenshot

В `scripts/`:
- `capture-refs.mjs` — снимает 5 эталонных сайтов в `_refs/` (Locomotive, Ueno, Instrument, threejs, immersive-garden)
- `screenshot-local.mjs` — full-page screenshot localhost
- `screenshot-viewport.mjs` — viewport screenshot с заданным scrollY
- `screenshot-fresh.mjs` — без cache, для проверки PNG-обновлений
- `screenshot-hover.mjs`, `screenshot-tech-modal.mjs`, `screenshot-service-modal.mjs`, `screenshot-spline.mjs` — специфичные сценарии

## Правила

- Визуальные изменения — инкрементально, по одному шагу с проверкой через скриншот
- Не менять палитру, компоненты и библиотеки одновременно
- 3D-ассеты только из CC0/MIT источников (3dicons.co)
- Чёрные фоны запрещены (фолбэк — `#fafafa` светлый)
- Англицизмы-статусы (active/shipped/exploration/concept) убраны из UI — оставить только русский kicker
