/* ─── Calculator Data ─── */

export type ServiceItem = {
  name: string;
  price: number;          // fixed price per unit
  unit?: string;          // "стр." | "язык" | "мес." | null (= штука)
  qtyEditable?: boolean;  // can user change qty?
  defaultQty: number;     // default quantity
  minQty?: number;
  maxQty?: number;
  defaultOn?: boolean;
};

export type Category = {
  name: string;
  icon: string;
  accent: string;
  items: ServiceItem[];
};

export const categories: Category[] = [
  {
    name: "Подготовка",
    icon: "01",
    accent: "text-brand-500",
    items: [
      { name: "Прототип в Figma", price: 120, defaultQty: 1 },
      { name: "Архитектура платформы", price: 150, defaultQty: 1, defaultOn: true },
      { name: "Техническое задание", price: 200, defaultQty: 1, defaultOn: true },
      { name: "Копирайтинг контента", price: 60, defaultQty: 1, defaultOn: true },
    ],
  },
  {
    name: "Дизайн",
    icon: "02",
    accent: "text-accent-500",
    items: [
      { name: "Дизайн главной страницы", price: 80, defaultQty: 1 },
      { name: "UX/UI внутренних страниц", price: 50, unit: "стр.", qtyEditable: true, defaultQty: 3, minQty: 1, maxQty: 30 },
    ],
  },
  {
    name: "Вёрстка и разработка",
    icon: "03",
    accent: "text-brand-500",
    items: [
      { name: "Вёрстка страницы (фронтенд)", price: 80, unit: "стр.", qtyEditable: true, defaultQty: 5, minQty: 1, maxQty: 50 },
      { name: "Бэкенд (серверная логика)", price: 100, unit: "стр.", qtyEditable: true, defaultQty: 5, minQty: 1, maxQty: 50 },
      { name: "Личный кабинет", price: 350, defaultQty: 1 },
      { name: "Админ-панель", price: 250, defaultQty: 1 },
      { name: "Настройка сервера", price: 30, defaultQty: 1 },
      { name: "Мультиязычность", price: 100, unit: "язык", qtyEditable: true, defaultQty: 1, minQty: 1, maxQty: 5 },
    ],
  },
  {
    name: "Доп. функции",
    icon: "04",
    accent: "text-accent-500",
    items: [
      { name: "Скоринг сервис", price: 350, defaultQty: 1 },
      { name: "ElasticSearch поиск", price: 150, defaultQty: 1 },
      { name: "Отчёты (простые)", price: 60, defaultQty: 1 },
      { name: "Отчёты (подробные)", price: 200, defaultQty: 1 },
      { name: "Защита данных / безопасность", price: 200, defaultQty: 1 },
      { name: "Форма заявки", price: 30, defaultQty: 1 },
      { name: "Квиз / Калькулятор", price: 120, defaultQty: 1 },
      { name: "Базовая SEO оптимизация", price: 60, defaultQty: 1, defaultOn: true },
    ],
  },
  {
    name: "Обслуживание",
    icon: "05",
    accent: "text-green-500",
    items: [
      { name: "Обслуживание сайта", price: 60, unit: "мес.", qtyEditable: true, defaultQty: 12, minQty: 1, maxQty: 24 },
      { name: "Обучение + видеоуроки", price: 80, defaultQty: 1 },
      { name: "Техобслуживание", price: 30, unit: "мес.", qtyEditable: true, defaultQty: 12, minQty: 1, maxQty: 24 },
      { name: "Хостинг", price: 5, unit: "мес.", qtyEditable: true, defaultQty: 12, minQty: 1, maxQty: 24 },
      { name: "Домен .COM", price: 10, defaultQty: 1 },
      { name: "Домен .KG", price: 30, defaultQty: 1 },
    ],
  },
];
