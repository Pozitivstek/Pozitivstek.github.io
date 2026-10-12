/* Интерактивное резюме: «терминал» с командами help, about, skills, projects, …
   Данные берутся из data.js, тексты — из i18n.js. Всё выводится через textContent (без innerHTML). */
(() => {
  'use strict';

  const mount = document.getElementById('term');
  if (!mount || !window.SITE || !window.I18n) return;

  const { profile, skills, projects, experience, education } = window.SITE;
  const { t, pick } = window.I18n;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = {
    main: document.getElementById('r-main'),
    screen: document.getElementById('term-screen'),
    out: document.getElementById('term-out'),
    form: document.getElementById('term-form'),
    input: document.getElementById('term-input'),
    chips: document.getElementById('term-chips'),
  };

  const CHIP_COMMANDS = ['help', 'about', 'skills', 'projects', 'contact', 'neofetch', 'doc'];
  const SITE_URL = profile.site || 'https://pozitivstek.github.io';
  const MAX_SUGGEST_DISTANCE = 2;
  const BOOT_STEP_MS = 260;
  const HISTORY_LIMIT = 50;

  /* ---------- DOM ---------- */

  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined || value === null || value === false) continue;
      el.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return el;
  }

  const span = (text, cls) => h('span', cls ? { class: cls } : {}, text);
  const row = (...parts) => h('div', { class: 'row' }, parts);
  const fmt = (template, vars) => template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');

  function link(href, text) {
    return h('a', { href, target: '_blank', rel: 'noopener noreferrer', class: 'c-cyan' }, text);
  }

  function scrollDown() {
    els.screen.scrollTop = els.screen.scrollHeight;
  }

  function print(...rows) {
    els.out.append(h('div', { class: 'block' }, rows));
    scrollDown();
  }

  const statusBadge = (status) => span(`[${t(`status.${status}`)}]`, `c-${status}`);

  /* ---------- вспомогательное ---------- */

  function distance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j += 1) dp[0][j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[a.length][b.length];
  }

  function closest(word, candidates) {
    let best = null;
    let bestDistance = Infinity;
    for (const candidate of candidates) {
      const d = distance(word, candidate);
      if (d < bestDistance) { best = candidate; bestDistance = d; }
    }
    return bestDistance <= MAX_SUGGEST_DISTANCE ? best : null;
  }

  const findProject = (id) => projects.find((p) => p.id === id.toLowerCase());

  function technologyUsage() {
    const counts = new Map();
    for (const project of projects.filter((p) => p.status !== 'soon')) {
      for (const tag of project.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8);
  }

  function contactRows() {
    const rows = [row(span(t('t.contact.title'), 'c-muted'))];
    rows.push(row(span('github    ', 'c-lime'), link(profile.github, profile.github.replace('https://', ''))));
    if (profile.telegram) {
      rows.push(row(span('telegram  ', 'c-lime'), link(`https://t.me/${profile.telegram}`, `@${profile.telegram}`)));
    }
    if (profile.email) {
      rows.push(row(span('email     ', 'c-lime'), link(`mailto:${profile.email}`, profile.email)));
    }
    rows.push(row(span('site      ', 'c-lime'), link(SITE_URL, SITE_URL.replace('https://', ''))));
    return rows;
  }

  const unknownProject = (id) => print(row(span(fmt(t('t.project.unknown'), { id }), 'c-danger')));

  /* ---------- команды ---------- */

  const COMMANDS = {
    help() {
      print(row(span(t('t.help.title'), 'c-muted')),
        ...Object.keys(COMMANDS).map((name) => row(span(name.padEnd(12), 'c-lime'), span(t(`t.cmd.${name}`), 'c-muted'))));
    },

    about() {
      print(row(span(profile.name, 'c-lime c-big')),
        row(span(t('r.role'), 'c-cyan')),
        row(span(t('r.summary'))));
    },

    skills() {
      const groups = skills.map((group) => h('div', { class: 'group' },
        row(span(t(`skills.${group.id}`), 'c-cyan')),
        h('div', { class: 'tags' }, group.items.map((item) => span(item, 'tag')))));
      const usage = technologyUsage();
      const widest = Math.max(...usage.map(([name]) => name.length), 0) + 2;
      print(...groups,
        row(span(t('t.skills.usage'), 'c-muted')),
        ...usage.map(([name, count]) => row(
          span(name.padEnd(widest)), span('█'.repeat(count * 3), 'c-lime'), span(` ${count}`, 'c-muted'))));
    },

    projects() {
      print(...projects.flatMap((p) => [
        row(statusBadge(p.status), span(` ${pick(p.title)}`, 'c-strong')),
        row(span(`   ${pick(p.desc)}`, 'c-muted')),
        row(span('   '), ...p.tags.map((tag) => span(`${tag} `, 'c-violet')), span(`· project ${p.id}`, 'c-muted')),
        row(span(' ')),
      ]));
    },

    project(args) {
      if (!args[0]) { print(row(span(t('t.usage.project'), 'c-muted'))); return; }
      const project = findProject(args[0]);
      if (!project) { unknownProject(args[0]); return; }
      const rows = [
        row(statusBadge(project.status), span(` ${pick(project.title)}`, 'c-strong')),
        row(span(pick(project.desc))),
        row(...project.tags.map((tag) => span(`${tag} `, 'c-violet'))),
      ];
      if (project.repo) rows.push(row(span('repo  ', 'c-lime'), link(project.repo, project.repo.replace('https://', ''))));
      else rows.push(row(span(t('t.project.norepo'), 'c-muted')));
      if (project.demo) rows.push(row(span('demo  ', 'c-lime'), link(project.demo, project.demo.replace('https://', ''))));
      print(...rows);
    },

    open(args) {
      if (!args[0]) { print(row(span(t('t.usage.open'), 'c-muted'))); return; }
      const project = findProject(args[0]);
      if (!project) { unknownProject(args[0]); return; }
      if (!project.repo) { print(row(span(t('t.project.norepo'), 'c-muted'))); return; }
      print(row(span(t('t.project.opening'), 'c-muted')));
      window.open(project.repo, '_blank', 'noopener,noreferrer');
    },

    experience() {
      if (!experience.length) { print(row(span(t('t.exp.empty'), 'c-muted'))); return; }
      print(...experience.flatMap((item) => [
        row(span(pick(item.title), 'c-cyan'), span(`  ${item.period ?? ''}`, 'c-muted')),
        item.org ? row(span(item.org, 'c-muted')) : null,
        item.text ? row(span(pick(item.text))) : null,
      ].filter(Boolean)));
    },

    education() {
      if (!education.length) { print(row(span(t('t.edu.empty'), 'c-muted'))); return; }
      print(...education.flatMap((item) => [
        row(span(pick(item.title), 'c-cyan'), span(`  ${item.period ?? ''}`, 'c-muted')),
        item.org ? row(span(item.org, 'c-muted')) : null,
      ].filter(Boolean)));
    },

    contact() {
      print(...contactRows());
    },

    lang(args) {
      const target = (args[0] || '').toLowerCase();
      if (target !== 'ru' && target !== 'en') { print(row(span(t('t.lang.usage'), 'c-muted'))); return; }
      window.I18n.set(target);
      print(row(span(t('t.lang.set'), 'c-lime')));
    },

    neofetch() {
      const art = [
        '      ·  ·  ·  ·      ',
        '   ·  ·  ·  ·  ·  ·   ',
        ' ·  ·  ·  ·  ·  ·  ·  ',
        '   ·  ·  ·  ·  ·  ·   ',
        '      ·  ·  ·  ·      ',
      ].join('\n');
      const top = technologyUsage().slice(0, 4).map(([name]) => name).join(', ');
      const info = [
        row(span('pozitiv', 'c-lime'), span('@', 'c-muted'), span('resume', 'c-lime')),
        row(span('─────────────', 'c-muted')),
        row(span('os      ', 'c-cyan'), span(t('t.neofetch.os'))),
        row(span('focus   ', 'c-cyan'), span(t('t.neofetch.focus'))),
        row(span('stack   ', 'c-cyan'), span(top)),
        row(span('repos   ', 'c-cyan'), span(String(projects.filter((p) => p.repo).length))),
        row(span('status  ', 'c-cyan'), span(t('t.neofetch.status'), 'c-lime')),
      ];
      print(h('div', { class: 'neofetch' }, h('pre', { class: 'art c-lime' }, art), h('div', {}, info)));
    },

    doc() {
      setView('doc');
    },

    clear() {
      els.out.replaceChildren();
    },
  };

  const ALIASES = { whoami: 'about', ls: 'help', cv: 'doc', resume: 'doc', '?': 'help', cls: 'clear' };

  function echo(command) {
    els.out.append(h('div', { class: 'block echo' }, row(span('$ ', 'c-lime'), span(command))));
  }

  function run(raw) {
    const line = raw.trim();
    if (!line) return;
    echo(line);
    const [first, ...args] = line.split(/\s+/);
    const name = first.toLowerCase();

    if (name === 'sudo' && args.join('').toLowerCase().replace(/[-_]/g, '') === 'hireme') {
      print(row(span(t('t.sudo.password'), 'c-muted')), row(span(t('t.sudo.ok'), 'c-lime')), ...contactRows());
      return;
    }
    const command = COMMANDS[ALIASES[name] ?? name];
    if (command) {
      command(args);
      return;
    }
    const suggestion = closest(name, [...Object.keys(COMMANDS), ...Object.keys(ALIASES)]);
    print(row(span(fmt(t('t.notfound'), { cmd: first }), 'c-danger')),
      suggestion ? row(span(fmt(t('t.didyoumean'), { cmd: suggestion }), 'c-muted')) : null);
  }

  /* ---------- ввод: история и автодополнение ---------- */

  const commandHistory = [];
  let historyIndex = 0;

  function complete() {
    const parts = els.input.value.split(/\s+/);
    const word = parts[parts.length - 1].toLowerCase();
    const head = parts[0].toLowerCase();
    let pool;
    if (parts.length === 1) pool = Object.keys(COMMANDS);
    else if (head === 'project' || head === 'open') pool = projects.map((p) => p.id);
    else if (head === 'lang') pool = ['ru', 'en'];
    else return;

    const matches = pool.filter((name) => name.startsWith(word));
    if (matches.length === 1) {
      els.input.value = [...parts.slice(0, -1), matches[0]].join(' ');
    } else if (matches.length > 1) {
      print(row(span(matches.join('   '), 'c-muted')));
    }
  }

  els.input.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      complete();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (commandHistory.length) {
        historyIndex = Math.max(0, historyIndex - 1);
        els.input.value = commandHistory[historyIndex] ?? '';
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.min(commandHistory.length, historyIndex + 1);
      els.input.value = commandHistory[historyIndex] ?? '';
    } else if (event.key.toLowerCase() === 'l' && event.ctrlKey) {
      event.preventDefault();
      COMMANDS.clear();
    }
  });

  els.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = els.input.value;
    if (value.trim()) {
      commandHistory.push(value);
      if (commandHistory.length > HISTORY_LIMIT) commandHistory.shift();
    }
    historyIndex = commandHistory.length;
    els.input.value = '';
    run(value);
  });

  els.screen.addEventListener('click', () => {
    if (!window.getSelection().toString()) els.input.focus();
  });

  /* ---------- подсказки-кнопки ---------- */

  function renderChips() {
    const buttons = CHIP_COMMANDS.map((name) => {
      const button = h('button', { class: 'term-chip', type: 'button' }, name);
      button.addEventListener('click', () => {
        run(name);
        els.input.focus({ preventScroll: true });
      });
      return button;
    });
    els.chips.replaceChildren(...buttons);
    els.input.setAttribute('placeholder', t('t.placeholder'));
  }

  document.addEventListener('langchange', renderChips);

  /* ---------- режимы «терминал / документ» ---------- */

  function syncHash(view) {
    const url = view === 'doc' ? '#doc' : window.location.pathname + window.location.search;
    try {
      window.history.replaceState(null, '', url);
    } catch (_) { /* file:// и т. п. */ }
  }

  function setView(view) {
    const next = view === 'doc' ? 'doc' : 'term';
    els.main.dataset.view = next;
    document.querySelectorAll('[data-view-btn]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.viewBtn === next));
    });
    syncHash(next);
    if (next === 'term') els.input.focus({ preventScroll: true });
    else window.scrollTo({ top: 0 });
  }

  document.querySelectorAll('[data-view-btn]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewBtn));
  });

  const printButton = document.getElementById('print-btn');
  if (printButton) {
    printButton.addEventListener('click', () => {
      setView('doc');
      requestAnimationFrame(() => window.print());
    });
  }

  /* ---------- загрузка ---------- */

  let skipBoot = reduceMotion;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function boot() {
    const lines = [
      [span('[ ok ] ', 'c-lime'), span(`${t('t.boot.profile')}  `, 'c-muted'), span(profile.name)],
      [span('[ ok ] ', 'c-lime'), span(fmt(t('t.boot.projects'), { n: projects.length }), 'c-muted')],
      [span('[ ok ] ', 'c-lime'), span(t('t.boot.ready'), 'c-cyan')],
    ];
    for (const parts of lines) {
      els.out.append(h('div', { class: 'block' }, row(...parts)));
      if (!skipBoot) await sleep(BOOT_STEP_MS);
    }
    scrollDown();
  }

  function readRequested() {
    try {
      return decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
    } catch (_) {
      return '';
    }
  }

  async function init() {
    const requested = readRequested();   // setView() перезапишет адрес — читаем до него
    renderChips();
    const skip = () => { skipBoot = true; };
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    await boot();
    window.removeEventListener('keydown', skip);
    window.removeEventListener('pointerdown', skip);
    setView(requested === 'doc' ? 'doc' : 'term');
    const known = requested && requested !== 'doc' && requested !== 'term' && COMMANDS[requested];
    run(known ? requested : 'about');
  }

  window.ResumeTerminal = { run, setView, commands: Object.keys(COMMANDS) };
  init();
})();
