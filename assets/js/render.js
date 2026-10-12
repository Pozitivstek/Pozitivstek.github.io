/* Отрисовка блоков из data.js. Без innerHTML — только textContent. */
(() => {
  'use strict';

  const { profile, skills, projects, experience, education } = window.SITE;
  const { t, pick } = window.I18n;

  /** Мини-конструктор DOM: h('a', { href }, 'текст', child). */
  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'class') el.className = value;
      else if (key === 'style') el.setAttribute('style', value);
      else el.setAttribute(key, value === true ? '' : String(value));
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return el;
  }

  const externalLink = (href, label, cls = 'link') =>
    h('a', { class: cls, href, target: '_blank', rel: 'noopener noreferrer' }, label);

  const tag = (text) => h('span', { class: 'tag' }, text);

  function fill(container, nodes) {
    container.replaceChildren(...nodes);
  }

  function renderSkills(container) {
    fill(
      container,
      skills.map((group) =>
        h(
          'div',
          { class: 'skill-group' },
          h('h3', {}, t(`skills.${group.id}`)),
          h('div', { class: 'tags' }, group.items.map(tag))
        )
      )
    );
  }

  function projectCard(project) {
    const links = [
      project.repo && externalLink(project.repo, t('link.repo') + ' →'),
      project.demo && externalLink(project.demo, t('link.demo') + ' →'),
    ].filter(Boolean);

    return h(
      'article',
      { class: `card is-${project.status}`, style: `--hue:${project.hue}` },
      h(
        'div',
        { class: 'card-art', 'aria-hidden': 'true' },
        project.glyph,
        h('span', { class: `badge badge-${project.status}` }, t(`status.${project.status}`))
      ),
      h(
        'div',
        { class: 'card-body' },
        h('h3', {}, pick(project.title)),
        h('p', {}, pick(project.desc)),
        h('div', { class: 'tags' }, project.tags.map(tag)),
        links.length ? h('div', { class: 'card-links' }, links) : null
      )
    );
  }

  function renderProjects(container) {
    fill(container, projects.map(projectCard));
  }

  /** Контакты, у которых есть значение; GitHub есть всегда. */
  function contactLinks() {
    return [
      { label: 'GitHub', href: profile.github, text: profile.github.replace('https://', '') },
      profile.telegram && {
        label: 'Telegram',
        href: `https://t.me/${profile.telegram}`,
        text: `@${profile.telegram}`,
      },
      profile.email && { label: 'Email', href: `mailto:${profile.email}`, text: profile.email },
    ].filter(Boolean);
  }

  function renderContacts(container) {
    fill(
      container,
      contactLinks().map((item) =>
        h(
          'li',
          {},
          h('span', { class: 'contact-label' }, item.label),
          externalLink(item.href, item.text, 'link big')
        )
      )
    );
  }

  /* ---------- резюме ---------- */

  function renderResumeProjects(container) {
    fill(
      container,
      projects
        .filter((p) => p.status !== 'soon')
        .map((p) =>
          h(
            'div',
            { class: 'r-item' },
            h(
              'div',
              { class: 'r-item-head' },
              h('h3', {}, pick(p.title)),
              p.repo ? externalLink(p.repo, p.repo.replace('https://', ''), 'link mono') : null
            ),
            h('p', {}, pick(p.desc)),
            h('div', { class: 'tags' }, p.tags.map(tag))
          )
        )
    );
  }

  function renderTimeline(container, items) {
    const section = container.closest('section');
    if (section) section.hidden = items.length === 0;
    fill(
      container,
      items.map((item) =>
        h(
          'div',
          { class: 'r-item' },
          h(
            'div',
            { class: 'r-item-head' },
            h('h3', {}, pick(item.title)),
            h('span', { class: 'mono muted' }, item.period)
          ),
          item.org ? h('p', { class: 'muted' }, item.org) : null,
          item.text ? h('p', {}, pick(item.text)) : null
        )
      )
    );
  }

  const MOUNTS = [
    ['skills', renderSkills],
    ['projects-grid', renderProjects],
    ['contacts', renderContacts],
    ['r-skills', renderSkills],
    ['r-projects', renderResumeProjects],
    ['r-contacts', renderContacts],
    ['r-exp-list', (el) => renderTimeline(el, experience)],
    ['r-edu-list', (el) => renderTimeline(el, education)],
  ]
    .map(([id, render]) => ({ el: document.getElementById(id), render }))
    .filter((mount) => mount.el);

  function renderAll() {
    MOUNTS.forEach(({ el, render }) => render(el));
  }

  renderAll();
  document.addEventListener('langchange', renderAll);
})();
