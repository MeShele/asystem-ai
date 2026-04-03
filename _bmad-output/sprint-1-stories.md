# Sprint 1 — Stories Breakdown

**Sprint Goal:** Рабочий публичный сайт с Splash Screen, клиентским лендингом, квиз-формой и i18n  
**Длительность:** 1 неделя  
**Dev:** Amelia + Barry

---

## Story S1-01: Project Setup & Infrastructure

**Как** разработчик,  
**я хочу** инициализировать проект с полным стеком,  
**чтобы** команда могла начать разработку компонентов.

### Acceptance Criteria
- [ ] AC-01: Next.js 15 (App Router) + TypeScript инициализирован
- [ ] AC-02: Tailwind CSS настроен с design tokens из брендбука
- [ ] AC-03: shadcn/ui установлен и настроен с кастомной темой
- [ ] AC-04: next-intl настроен с routing /ru, /kg, /en
- [ ] AC-05: Структура папок соответствует Architecture Doc
- [ ] AC-06: ESLint + Prettier настроены
- [ ] AC-07: Базовый layout (navbar + footer) работает
- [ ] AC-08: `npm run dev` запускается без ошибок

### Tasks
1. `npx create-next-app@latest` с TypeScript + Tailwind + App Router
2. Настроить tailwind.config.ts с brand tokens
3. Установить и настроить shadcn/ui
4. Настроить next-intl (middleware + routing + messages)
5. Создать файлы переводов (ru.json, kg.json, en.json) — базовая структура
6. Создать layout.tsx с providers
7. Создать Navbar и Footer компоненты
8. Создать LanguageSwitcher компонент

**Estimate:** 3-4 часа  
**Priority:** P0 — блокирует всё остальное

---

## Story S1-02: Splash Screen (Главная страница)

**Как** посетитель сайта,  
**я хочу** увидеть 3 варианта выбора на главной странице,  
**чтобы** сразу попасть в нужный мне раздел.

### Acceptance Criteria
- [ ] AC-01: Полноэкранная страница с анимированным particles фоном
- [ ] AC-02: Логотип asystem.ai отображается по центру
- [ ] AC-03: Текст «Что привело вас к нам?» под логотипом
- [ ] AC-04: 3 glass-morphism карточки: Партнёр / Проект / Продукты
- [ ] AC-05: Hover-эффект на карточках: lift + glow
- [ ] AC-06: Клик на «Партнёр» → /partner
- [ ] AC-07: Клик на «Проект» → /client
- [ ] AC-08: Клик на «Продукты» → /products (coming soon)
- [ ] AC-09: Адаптивность: mobile (stack), tablet (row), desktop (row)
- [ ] AC-10: Работает на 3 языках

### Tasks
1. Создать ParticlesBg компонент (Canvas API)
2. Создать GlassCard компонент
3. Создать EntryCards секцию (3 карточки)
4. Собрать splash page.tsx
5. Добавить переводы для splash screen
6. Адаптивность (mobile/tablet/desktop)

**Estimate:** 4-5 часов  
**Priority:** P0

---

## Story S1-03: Client Landing Page

**Как** потенциальный клиент,  
**я хочу** увидеть услуги, процесс работы и кейсы asystem,  
**чтобы** убедиться в качестве и оставить заявку.

### Acceptance Criteria
- [ ] AC-01: Hero-секция с заголовком + подзаголовком + CTA кнопка
- [ ] AC-02: Секция услуг: 4 карточки (Сайты, Боты, Приложения, Автоматизация)
- [ ] AC-03: Каждая карточка: иконка + название + описание + «от X дней»
- [ ] AC-04: Секция «Как мы работаем»: 4 шага с нумерацией
- [ ] AC-05: Секция кейсов: сетка карточек (placeholder данные)
- [ ] AC-06: CTA-блок внизу: «Готовы обсудить проект?» + кнопка
- [ ] AC-07: Анимации: scroll-reveal для секций
- [ ] AC-08: Все тексты через i18n
- [ ] AC-09: Адаптивность

### Tasks
1. Создать HeroSection компонент
2. Создать ServicesGrid компонент
3. Создать HowItWorks компонент (4 шага)
4. Создать CasesGrid компонент (с placeholder)
5. Создать CTASection компонент
6. Собрать /client/page.tsx
7. Scroll-reveal анимации (Intersection Observer)
8. Переводы

**Estimate:** 5-6 часов  
**Priority:** P0

---

## Story S1-04: Quiz Request Form

**Как** клиент,  
**я хочу** пройти квиз из 5 шагов и оставить заявку,  
**чтобы** описать свой проект и получить обратную связь.

### Acceptance Criteria
- [ ] AC-01: Шаг 1 — Тип услуги (radio cards): Сайт/Бот/Приложение/Автоматизация/Другое
- [ ] AC-02: Шаг 2 — Детали (динамические поля в зависимости от типа)
- [ ] AC-03: Шаг 3 — Сроки (radio): ASAP / 1-2 нед / месяц / не срочно
- [ ] AC-04: Шаг 4 — Бюджет (radio): <30K / 30-100K / 100-500K / 500K+ / не определён
- [ ] AC-05: Шаг 5 — Контакты: имя*, компания, телефон*, email, способ связи
- [ ] AC-06: Прогресс-бар сверху (визуальный, animated)
- [ ] AC-07: Кнопки «Назад» / «Далее» с валидацией
- [ ] AC-08: На последнем шаге — кнопка «Отправить заявку»
- [ ] AC-09: После отправки — success screen с анимацией
- [ ] AC-10: Данные сохраняются (пока в localStorage, потом в Supabase)
- [ ] AC-11: Zod валидация на каждом шаге
- [ ] AC-12: Slide-анимация между шагами

### Tasks
1. Создать Zod-схемы валидации (src/lib/validations/request.ts)
2. Создать QuizForm контейнер (React Hook Form + state machine)
3. Создать StepServiceType компонент
4. Создать StepDetails компонент (conditional fields)
5. Создать StepTimeline компонент
6. Создать StepBudget компонент
7. Создать StepContact компонент
8. Создать ProgressBar компонент
9. Создать SuccessScreen компонент
10. Slide-анимации между шагами
11. Переводы

**Estimate:** 6-8 часов  
**Priority:** P0

---

## Story S1-05: Partner Landing Page

**Как** потенциальный партнёр,  
**я хочу** увидеть условия партнёрской программы и подать заявку,  
**чтобы** начать зарабатывать вместе с asystem.

### Acceptance Criteria
- [ ] AC-01: Hero: «Зарабатывайте вместе с asystem»
- [ ] AC-02: Секция бенефитов: 3-4 карточки (комиссия, поддержка, материалы, свобода)
- [ ] AC-03: Секция «Как это работает»: 3 шага
- [ ] AC-04: Форма заявки на партнёрство: имя, сфера, аудитория, контакты
- [ ] AC-05: Все тексты i18n
- [ ] AC-06: Адаптивность

### Tasks
1. Создать Partner Hero секцию
2. Создать Benefits Grid
3. Создать Partner Steps (как это работает)
4. Создать Partner Apply форму
5. Собрать /partner/page.tsx
6. Переводы

**Estimate:** 4-5 часов  
**Priority:** P0

---

## Story S1-06: Products Coming Soon Page

**Как** посетитель,  
**я хочу** увидеть что у asystem будут готовые продукты,  
**чтобы** подписаться на уведомления о запуске.

### Acceptance Criteria
- [ ] AC-01: Красивая страница с тизер-карточками (blur-эффект)
- [ ] AC-02: Текст «Скоро здесь появятся наши готовые решения»
- [ ] AC-03: Форма подписки (email)
- [ ] AC-04: Email сохраняется (localStorage → потом Supabase)
- [ ] AC-05: i18n, адаптивность

### Tasks
1. Создать Coming Soon страницу
2. Тизер-карточки с blur
3. Email форма подписки
4. Переводы

**Estimate:** 2-3 часа  
**Priority:** P1

---

## Sprint 1 Summary

| Story | Estimate | Priority | Dependencies |
|-------|----------|----------|-------------|
| S1-01: Setup | 3-4h | P0 | — |
| S1-02: Splash | 4-5h | P0 | S1-01 |
| S1-03: Client Landing | 5-6h | P0 | S1-01 |
| S1-04: Quiz Form | 6-8h | P0 | S1-01, S1-03 |
| S1-05: Partner Landing | 4-5h | P0 | S1-01 |
| S1-06: Products Coming Soon | 2-3h | P1 | S1-01 |

**Total Estimate:** ~24-31 часов  
**Sprint Capacity:** 40 часов  
**Buffer:** ~30% на код-ревью, баги, полировку

---

*Stories подготовлены Bob (Scrum Master)*  
*Review: John (PM), Amelia (Dev)*
