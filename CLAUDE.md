# ASystem AI Dev — Project Context

## Язык
Всегда отвечай на русском языке.

## Проект
B2B SaaS платформа IT-компании в Кыргызстане. Три портала: клиенты, партнёры, админ.
Tech: Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, PostgreSQL, Claude API, Telegram Bot, next-intl (ru/kg/en).

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

## Правила
- Визуальные изменения делать инкрементально, по одному шагу с проверкой
- Не менять палитру, компоненты и библиотеки одновременно
