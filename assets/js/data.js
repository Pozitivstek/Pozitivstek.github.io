/* Всё содержимое портфолио в одном месте: правишь здесь — меняется на сайте и в резюме. */
window.SITE = Object.freeze({
  profile: {
    name: 'Pozitiv',
    github: 'https://github.com/Pozitivstek',
    telegram: 'lkd_Pozitiv', // ник без @; пусто — ссылка не показывается
    email: 'pozitivstek@gmail.com', // пусто — ссылка не показывается
  },

  skills: [
    { id: 'backend', items: ['Python', 'asyncio', 'aiogram 3', 'SQLite', 'REST API'] },
    { id: 'ai', items: ['Claude API', 'OpenCV', 'ONNX Runtime', 'MediaPipe', 'CLIP'] },
    { id: 'front', items: ['HTML5', 'CSS3', 'JavaScript', 'Canvas', 'PWA'] },
    { id: 'tools', items: ['Linux', 'SSH / VPS', 'Git & GitHub', 'PySide6'] },
  ],

  // status: 'live' | 'wip' | 'soon'. Нет repo — кнопка не показывается.
  projects: [
    {
      id: 'pozitiv-vpn',
      glyph: 'VPN',
      hue: 150,
      status: 'live',
      repo: '',
      demo: '',
      tags: ['HTML5', 'Canvas', 'PWA', 'JavaScript'],
      title: { ru: 'Pozitiv VPN — фронт', en: 'Pozitiv VPN — front end' },
      desc: {
        ru: 'Интерфейс VPN-сервиса: интерактивный глобус из точек, выбор региона, подписка по регионам, PWA. Чистый HTML/CSS/JS без сборки.',
        en: 'Front end of a VPN service: an interactive dotted globe, region picker, per-region subscription, PWA. Plain HTML/CSS/JS, no build step.',
      },
    },
    {
      id: 'ai-admin',
      glyph: 'AI',
      hue: 265,
      status: 'wip',
      repo: '',
      demo: '',
      tags: ['Python', 'aiogram', 'Claude API', 'SQLite'],
      title: { ru: 'ИИ-администратор записи', en: 'AI booking assistant' },
      desc: {
        ru: 'Telegram-бот на aiogram и Claude: ведёт диалог с клиентом, подбирает услугу, мастера и время и оформляет запись.',
        en: 'A Telegram bot on aiogram and Claude: talks to the client, picks a service, a specialist and a time slot, and books it.',
      },
    },
    {
      id: 'people-vision',
      glyph: 'CV',
      hue: 190,
      status: 'live',
      repo: 'https://github.com/Pozitivstek/people-vision',
      demo: '',
      tags: ['Python', 'PySide6', 'OpenCV', 'ONNX', 'MediaPipe'],
      title: { ru: 'People Vision', en: 'People Vision' },
      desc: {
        ru: 'Мак-приложение компьютерного зрения: камера и видео, лица, поза тела, предметы в руках, база людей. Неоновый HUD на PySide6.',
        en: 'A computer-vision Mac app: camera and video, faces, body pose, held objects and a people database. A neon HUD built with PySide6.',
      },
    },
    {
      id: 'doc-chat',
      glyph: 'RAG',
      hue: 80,
      status: 'wip',
      repo: 'https://github.com/Pozitivstek/doc-chat',
      demo: '',
      tags: ['Python', 'FastAPI', 'RAG', 'Claude API', 'BM25', 'SSE'],
      title: { ru: 'DocChat: чат с документами (RAG)', en: 'DocChat: chat with your documents (RAG)' },
      desc: {
        ru: 'Загрузил PDF — задал вопрос. Поиск BM25 по русским и английским текстам, ответ Claude только по найденным фрагментам со ссылками на страницы, стриминг, защита от prompt injection.',
        en: 'Upload a PDF, ask a question. BM25 retrieval over Russian and English text, a Claude answer grounded in retrieved passages with page citations, streaming and prompt-injection defence.',
      },
    },
    {
      id: 'coffee-shop-bot',
      glyph: 'BOT',
      hue: 35,
      status: 'live',
      repo: 'https://github.com/Pozitivstek/coffee-shop-bot',
      demo: '',
      tags: ['Python', 'aiogram 3', 'SQLite', 'Telegram Payments'],
      title: { ru: 'Бот кофейни: заказы, оплата, админка', en: 'Coffee shop bot: orders, payments, admin' },
      desc: {
        ru: 'Меню, корзина, оплата картой (тестовый режим) или при получении. Админка прямо в Telegram: статусы заказов, стоп-лист, цены, выручка за день.',
        en: 'Menu, cart, card payments (test mode) or pay-on-pickup. An admin panel inside Telegram: order statuses, stop-list, prices, daily revenue.',
      },
    },
    {
      id: 'daily-digest-bot',
      glyph: 'RSS',
      hue: 330,
      status: 'live',
      repo: 'https://github.com/Pozitivstek/daily-digest-bot',
      demo: '',
      tags: ['Python', 'aiogram 3', 'aiohttp', 'asyncio', 'RSS'],
      title: { ru: 'Бот-агрегатор: ежедневный дайджест', en: 'Aggregator bot: daily digest' },
      desc: {
        ru: 'Погода, курсы ЦБ РФ и новости из RSS одним сообщением по расписанию. Часовые пояса, общий кэш, устойчивость к отказам источников, без API-ключей.',
        en: 'Weather, Central Bank rates and RSS news in one scheduled message. Time zones, shared cache, resilient to source outages, no API keys.',
      },
    },
  ],

  // Заполни — и блоки «Опыт» / «Образование» появятся в резюме. Пусто — блок скрыт.
  // Формат: { title: {ru, en}, org: 'Компания', period: '2024 — 2026', text: {ru, en} }
  experience: [],
  education: [],
});
