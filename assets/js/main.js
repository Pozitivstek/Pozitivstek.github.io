/* Поведение страницы: печатающаяся строка, появление секций, кнопка «в PDF». */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { t } = window.I18n;

  /* ---------- печатающаяся строка в hero ---------- */

  const ROLE_KEYS = ['hero.role1', 'hero.role2', 'hero.role3', 'hero.role4'];
  const TYPE_MS = 70;
  const ERASE_MS = 35;
  const HOLD_MS = 1400;
  const PAUSE_MS = 300;
  let typedRun = 0;

  function startTyped() {
    const el = document.getElementById('typed-text');
    if (!el) return;
    typedRun += 1;
    const run = typedRun;
    const roles = ROLE_KEYS.map((key) => t(key));

    if (reduceMotion) {
      el.textContent = roles.join(' · ');
      return;
    }

    let role = 0;
    let chars = 0;
    let erasing = false;

    const tick = () => {
      if (run !== typedRun) return;
      const word = roles[role];
      chars += erasing ? -1 : 1;
      el.textContent = word.slice(0, chars);

      let delay = erasing ? ERASE_MS : TYPE_MS;
      if (!erasing && chars === word.length) {
        erasing = true;
        delay = HOLD_MS;
      } else if (erasing && chars === 0) {
        erasing = false;
        role = (role + 1) % roles.length;
        delay = PAUSE_MS;
      }
      setTimeout(tick, delay);
    };
    tick();
  }

  startTyped();
  document.addEventListener('langchange', startTyped);

  /* ---------- плавное появление секций ---------- */

  const revealTargets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('in'));
  }

  /* ---------- шапка: граница после прокрутки ---------- */

  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Кнопка «Сохранить в PDF» на странице резюме обрабатывается в terminal.js:
     сначала переключает на версию-документ, затем вызывает печать. */
})();
