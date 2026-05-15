const BASE_URL = "https://asystem.ai";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${BASE_URL}/#organization`,
  name: "asystem.ai",
  alternateName: "ASYSTEM",
  url: BASE_URL,
  logo: `${BASE_URL}/brand/A_logo_blue.svg`,
  image: `${BASE_URL}/brand/A_logo_blue.svg`,
  description:
    "Независимая AI-first IT-студия из Бишкека. Разработка AI-решений, веб-платформ, интеграций и Telegram-ботов для бизнеса в странах СНГ.",
  foundingDate: "2024",
  email: "hello@asystem.ai",
  areaServed: [
    { "@type": "Country", name: "Кыргызстан" },
    { "@type": "Country", name: "Казахстан" },
    { "@type": "Country", name: "Россия" },
    { "@type": "Country", name: "Узбекистан" },
    { "@type": "Country", name: "Беларусь" },
    { "@type": "Country", name: "Армения" },
    { "@type": "Country", name: "Азербайджан" },
    { "@type": "Country", name: "Таджикистан" },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Бишкек",
    addressRegion: "Chüy Region",
    addressCountry: "KG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 42.8746,
    longitude: 74.5698,
  },
  knowsAbout: [
    "AI-разработка",
    "Веб-разработка",
    "Next.js",
    "React",
    "TypeScript",
    "PostgreSQL",
    "Telegram Bot API",
    "Anthropic Claude",
    "OpenAI",
    "Финтех-платформы",
    "CRM-интеграции",
    "Автоматизация бизнес-процессов",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Услуги asystem.ai",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AI-сайты и веб-разработка",
          description:
            "Современные веб-платформы с адаптивным контентом, конверсионным дизайном и AI-оптимизацией пользовательского опыта.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AI-ассистенты для бизнеса",
          description:
            "Чат-боты и AI-агенты на базе Claude и GPT для автоматизации поддержки, продаж и внутренних процессов.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "CRM и интеграции",
          description:
            "Кастомные CRM-системы и интеграции с существующими сервисами через API.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AI-дизайн и брендинг",
          description: "AI-ассистированный дизайн интерфейсов, брендинг и айдентика.",
        },
      },
    ],
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: "asystem.ai",
  description:
    "Независимая AI-first IT-студия. Разработка AI-решений и веб-платформ для бизнеса СНГ.",
  publisher: { "@id": `${BASE_URL}/#organization` },
  inLanguage: ["ru", "kg", "en"],
};

export const partnerFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Сколько можно заработать в партнёрской программе asystem.ai?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Партнёр получает от 15% комиссии от стоимости проекта плюс возможность 50/50 split с маржи при свободной наценке. На проектах от $1500 это даёт от $225 базовой комиссии и потенциально кратно больше при правильном позиционировании клиенту.",
      },
    },
    {
      "@type": "Question",
      name: "Кто может стать партнёром asystem.ai?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Партнёрская программа создана для маркетологов, коучей, бизнес-консультантов и блогеров, у которых есть аудитория из предпринимателей и фаундеров. Технические навыки не нужны — вся разработка, документация и коммуникация остаются на стороне asystem.ai.",
      },
    },
    {
      "@type": "Question",
      name: "Нужно ли вкладывать свои деньги, чтобы стать партнёром?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Нет. Партнёрство бесплатное, без обязательств и без жёстких KPI. Партнёр не оплачивает разработку и не несёт финансовых рисков перед клиентом.",
      },
    },
    {
      "@type": "Question",
      name: "Как происходят выплаты?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Выплаты прозрачные — после получения оплаты от клиента партнёр видит свою долю в личном кабинете и получает выплату на удобный реквизит (банк, USDT, КЫРГЫЗ-карта). Никаких задержек или скрытых удержаний.",
      },
    },
    {
      "@type": "Question",
      name: "Какие проекты можно приводить?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Любые IT-проекты, которые делает asystem.ai: веб-разработка, AI-ассистенты, CRM и интеграции, мобильные приложения, Telegram-боты, дизайн интерфейсов. Если у клиента запрос за пределами компетенций — обсудим индивидуально.",
      },
    },
    {
      "@type": "Question",
      name: "Что отличает asystem.ai от других IT-студий?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Скорость (работаем в 4× быстрее рынка за счёт AI-инструментов), отсутствие предоплаты на старте, FIX-цена без скрытых доплат и публичные кейсы с Минобразования КР, АУРВА, Red Charge и Tulpar Express.",
      },
    },
  ],
};
