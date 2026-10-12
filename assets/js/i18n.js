/* Двуязычность RU / EN. Тексты страницы помечаются data-i18n="ключ". */
(() => {
  'use strict';

  const STORAGE_KEY = 'pozitiv.lang';
  const FALLBACK = 'ru';

  const DICT = {
    ru: {
      'meta.title': 'Pozitiv — Python & Full-Stack разработчик',
      'nav.label': 'Навигация',
      'nav.about': 'Обо мне',
      'nav.projects': 'Проекты',
      'nav.resume': 'Резюме',
      'nav.contact': 'Контакты',
      'lang.label': 'Сменить язык на английский',

      'hero.title': 'Делаю ботов, сайты и AI-продукты, которыми приятно пользоваться.',
      'hero.role1': 'Telegram-боты',
      'hero.role2': 'Веб-сайты и интерфейсы',
      'hero.role3': 'AI-сервисы на Claude',
      'hero.role4': 'Софт и автоматизация',
      'hero.cta.projects': 'Смотреть проекты',
      'hero.cta.resume': 'Резюме',
      'hero.hint': 'Двигай курсором или пальцем — частицы реагируют. Клик меняет форму.',
      'hero.shapes': 'Форма частиц',
      'shape.sphere': 'Сфера',
      'shape.word': 'Pozitiv',
      'shape.knot': 'Узел',
      'shape.helix': 'ДНК',
      'shape.cube': 'Куб',

      'about.title': 'Обо мне',
      'about.lead': 'Я Python-разработчик с full-stack уклоном.',
      'about.text': 'Люблю доводить идею до рабочего продукта: от Telegram-бота и сервера до интерфейса, на который приятно смотреть. Последние проекты — ИИ-администратор на Claude, программа компьютерного зрения и фронт VPN-сервиса.',
      'skills.backend': 'Бэкенд и боты',
      'skills.ai': 'AI и зрение',
      'skills.front': 'Фронтенд',
      'skills.tools': 'Инструменты',

      'projects.title': 'Проекты',
      'projects.sub': 'Избранное. Каждый проект — отдельный репозиторий на GitHub.',
      'status.live': 'Готово',
      'status.wip': 'В работе',
      'status.soon': 'Скоро',
      'link.repo': 'Код на GitHub',
      'link.demo': 'Демо',

      'resume.title': 'Резюме',
      'resume.text': 'Короткая версия — здесь, полная — на отдельной странице. Её можно сохранить в PDF одной кнопкой.',
      'resume.cta': 'Открыть резюме',

      'contact.title': 'Контакты',
      'contact.lead': 'Открыт к предложениям: работа в команде и фриланс-проекты.',

      'footer.text': 'Сделано на чистом HTML, CSS и JS — без сборки.',

      'r.meta.title': 'Pozitiv — Резюме',
      'r.back': '← На главную',
      'r.print': 'Сохранить в PDF',
      'r.role': 'Python-разработчик · Full-Stack',
      'r.summary.title': 'Обо мне',
      'r.summary': 'Python-разработчик с full-stack уклоном. Делаю Telegram-ботов, сайты, AI-сервисы и десктоп-софт — от идеи до работающего продукта. Ищу работу в команде и открыт к фриланс-проектам.',
      'r.skills.title': 'Навыки',
      'r.projects.title': 'Проекты',
      'r.exp.title': 'Опыт',
      'r.edu.title': 'Образование',
      'r.links.title': 'Ссылки',
    },

    en: {
      'meta.title': 'Pozitiv — Python & Full-Stack developer',
      'nav.label': 'Navigation',
      'nav.about': 'About',
      'nav.projects': 'Projects',
      'nav.resume': 'Résumé',
      'nav.contact': 'Contact',
      'lang.label': 'Switch language to Russian',

      'hero.title': 'I build bots, websites and AI products that are a joy to use.',
      'hero.role1': 'Telegram bots',
      'hero.role2': 'Websites & interfaces',
      'hero.role3': 'AI services on Claude',
      'hero.role4': 'Software & automation',
      'hero.cta.projects': 'See projects',
      'hero.cta.resume': 'Résumé',
      'hero.hint': 'Move the cursor or your finger — particles react. Click to morph.',
      'hero.shapes': 'Particle shape',
      'shape.sphere': 'Sphere',
      'shape.word': 'Pozitiv',
      'shape.knot': 'Knot',
      'shape.helix': 'Helix',
      'shape.cube': 'Cube',

      'about.title': 'About',
      'about.lead': 'I am a Python developer with a full-stack streak.',
      'about.text': 'I like taking an idea all the way to a working product: from a Telegram bot and a server to an interface that is pleasant to look at. Recent work: an AI booking assistant on Claude, a computer-vision desktop app and the front end of a VPN service.',
      'skills.backend': 'Backend & bots',
      'skills.ai': 'AI & vision',
      'skills.front': 'Frontend',
      'skills.tools': 'Tools',

      'projects.title': 'Projects',
      'projects.sub': 'Selected work. Every project lives in its own GitHub repository.',
      'status.live': 'Ready',
      'status.wip': 'In progress',
      'status.soon': 'Coming soon',
      'link.repo': 'Code on GitHub',
      'link.demo': 'Demo',

      'resume.title': 'Résumé',
      'resume.text': 'The short version is here, the full one lives on its own page. One button saves it as a PDF.',
      'resume.cta': 'Open résumé',

      'contact.title': 'Contact',
      'contact.lead': 'Open to offers: team roles and freelance projects.',

      'footer.text': 'Built with plain HTML, CSS and JS — no build step.',

      'r.meta.title': 'Pozitiv — Résumé',
      'r.back': '← Home',
      'r.print': 'Save as PDF',
      'r.role': 'Python Developer · Full-Stack',
      'r.summary.title': 'Summary',
      'r.summary': 'Python developer with a full-stack streak. I build Telegram bots, websites, AI services and desktop software — from idea to a working product. Looking for a team role and open to freelance projects.',
      'r.skills.title': 'Skills',
      'r.projects.title': 'Projects',
      'r.exp.title': 'Experience',
      'r.edu.title': 'Education',
      'r.links.title': 'Links',
    },
  };

  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function writeStored(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {
      /* приватный режим — язык просто не запомнится */
    }
  }

  function detect() {
    const stored = readStored();
    if (stored && DICT[stored]) return stored;
    const browser = (navigator.language || '').toLowerCase();
    return browser.startsWith('ru') ? 'ru' : 'en';
  }

  let current = detect();

  const t = (key) => DICT[current][key] ?? DICT[FALLBACK][key] ?? key;

  function apply(root = document) {
    document.documentElement.lang = current;
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = current === 'ru' ? 'EN' : 'RU';
  }

  function set(lang) {
    if (!DICT[lang] || lang === current) return;
    current = lang;
    writeStored(lang);
    apply();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function toggle() {
    set(current === 'ru' ? 'en' : 'ru');
  }

  apply();
  const toggleButton = document.getElementById('lang-toggle');
  if (toggleButton) toggleButton.addEventListener('click', toggle);

  window.I18n = {
    t,
    set,
    toggle,
    apply,
    get lang() {
      return current;
    },
    /** Выбирает нужный язык из объекта вида { ru: '…', en: '…' }. */
    pick(value) {
      if (value && typeof value === 'object') return value[current] ?? value[FALLBACK] ?? '';
      return value ?? '';
    },
  };
})();
