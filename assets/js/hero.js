/* «Вау»-экран: облако частиц, которое перетекает между 3D-формами и реагирует на курсор.
   Чистый Canvas 2D, без библиотек — работает и с file://, и на GitHub Pages. */
(() => {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  const hero = document.getElementById('hero');
  if (!canvas || !hero) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCompact = matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;

  const COUNT = isCompact ? 1800 : 3400;
  const FOV = 3.2;
  const TAU = Math.PI * 2;
  const AUTO_CYCLE_MS = 7000;
  const USER_PAUSE_MS = 14000;
  const WORD_ZOOM_MAX = 1.45;
  const SHAPE_ORDER = ['sphere', 'word', 'knot', 'helix', 'cube'];

  /* лайм, циан, фиолетовый; 3 уровня глубины → 9 «вёдер» цвета */
  const PALETTE = [
    [184, 255, 74],
    [61, 224, 255],
    [139, 92, 255],
  ];
  const PALETTE_CUMULATIVE = [0.5, 0.84, 1];
  const DEPTH_ALPHA = [0.28, 0.55, 0.9];
  const BUCKET_STYLES = PALETTE.flatMap(([r, g, b]) =>
    DEPTH_ALPHA.map((a) => `rgba(${r},${g},${b},${a})`)
  );
  const TRAIL_STYLE = 'rgba(7,8,12,0.24)';

  /* детерминированный генератор — форма одна и та же при каждой загрузке */
  function mulberry32(seed) {
    let a = seed;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(20261012);

  /* ---------- формы: Float32Array [x,y,z, x,y,z, …] в единицах ~[-1.2 … 1.2] ---------- */

  function buildSphere() {
    const out = new Float32Array(COUNT * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i += 1) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const ring = Math.sqrt(1 - y * y);
      const angle = golden * i;
      out[i * 3] = Math.cos(angle) * ring * 1.05;
      out[i * 3 + 1] = y * 1.05;
      out[i * 3 + 2] = Math.sin(angle) * ring * 1.05;
    }
    return out;
  }

  function buildWord() {
    const W = 900;
    const H = 260;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const c = off.getContext('2d', { willReadFrequently: true });
    const FONT = '"Arial Black", Impact, "Helvetica Neue", Arial, sans-serif';
    const TEXT = 'POZITIV';

    c.fillStyle = '#fff';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `900 200px ${FONT}`;
    const fitted = Math.floor(200 * Math.min(1, (W - 40) / c.measureText(TEXT).width));
    c.font = `900 ${fitted}px ${FONT}`;
    c.fillText(TEXT, W / 2, H / 2);

    const data = c.getImageData(0, 0, W, H).data;
    const inside = (x, y) =>
      x >= 0 && y >= 0 && x < W && y < H && data[(y * W + x) * 4 + 3] > 128;

    /* контур букв + немного заливки: буквы остаются читаемыми при малом числе частиц */
    const edge = [];
    const fill = [];
    const EDGE_REACH = 4;
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (!inside(x, y)) continue;
        const onEdge =
          !inside(x - EDGE_REACH, y) ||
          !inside(x + EDGE_REACH, y) ||
          !inside(x, y - EDGE_REACH) ||
          !inside(x, y + EDGE_REACH);
        (onEdge ? edge : fill).push(x, y);
      }
    }
    if (edge.length === 0) return buildSphere();

    const out = new Float32Array(COUNT * 3);
    const EDGE_SHARE = 0.72;
    const unit = 1.55 / (W / 2);
    for (let i = 0; i < COUNT; i += 1) {
      const source = rand() < EDGE_SHARE || fill.length === 0 ? edge : fill;
      const k = Math.floor((rand() * source.length) / 2) * 2;
      out[i * 3] = (source[k] - W / 2) * unit + (rand() - 0.5) * 0.015;
      out[i * 3 + 1] = (source[k + 1] - H / 2) * unit + (rand() - 0.5) * 0.015;
      out[i * 3 + 2] = (rand() - 0.5) * 0.12;
    }
    return out;
  }

  function buildKnot() {
    const out = new Float32Array(COUNT * 3);
    const scale = 0.31;
    for (let i = 0; i < COUNT; i += 1) {
      const t = rand() * TAU;
      const radius = 2 + Math.cos(3 * t);
      out[i * 3] = (radius * Math.cos(2 * t) + (rand() - 0.5) * 0.6) * scale;
      out[i * 3 + 1] = (radius * Math.sin(2 * t) + (rand() - 0.5) * 0.6) * scale;
      out[i * 3 + 2] = (Math.sin(3 * t) * 1.3 + (rand() - 0.5) * 0.6) * scale;
    }
    return out;
  }

  function buildHelix() {
    const out = new Float32Array(COUNT * 3);
    const radius = 0.62;
    for (let i = 0; i < COUNT; i += 1) {
      const y = (rand() * 2 - 1) * 1.25;
      const angle = y * 3.6;
      const pick = rand();
      let x;
      let z;
      if (pick < 0.36) {
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      } else if (pick < 0.72) {
        x = Math.cos(angle + Math.PI) * radius;
        z = Math.sin(angle + Math.PI) * radius;
      } else {
        const u = rand() * 2 - 1;
        x = Math.cos(angle) * radius * u;
        z = Math.sin(angle) * radius * u;
      }
      out[i * 3] = x + (rand() - 0.5) * 0.06;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = z + (rand() - 0.5) * 0.06;
    }
    return out;
  }

  function buildCube() {
    const out = new Float32Array(COUNT * 3);
    const s = 0.68;
    const sign = () => (rand() < 0.5 ? -s : s);
    for (let i = 0; i < COUNT; i += 1) {
      const v = [sign(), sign(), sign()];
      const axis = Math.floor(rand() * 3);
      if (rand() < 0.55) {
        v[axis] = (rand() * 2 - 1) * s; // ребро: свободна одна ось
      } else {
        const other = (axis + 1) % 3;
        const third = (axis + 2) % 3;
        v[other] = (rand() * 2 - 1) * s; // грань: свободны две оси
        v[third] = (rand() * 2 - 1) * s;
      }
      out[i * 3] = v[0] + (rand() - 0.5) * 0.02;
      out[i * 3 + 1] = v[1] + (rand() - 0.5) * 0.02;
      out[i * 3 + 2] = v[2] + (rand() - 0.5) * 0.02;
    }
    return out;
  }

  const SHAPES = {
    sphere: buildSphere(),
    word: buildWord(),
    knot: buildKnot(),
    helix: buildHelix(),
    cube: buildCube(),
  };

  /* ---------- состояние частиц ---------- */

  const pos = new Float32Array(COUNT * 3);
  for (let j = 0; j < pos.length; j += 1) pos[j] = (rand() - 0.5) * 6; // старт — «взрыв», собирается в сферу
  const speed = new Float32Array(COUNT);
  const phase = new Float32Array(COUNT);
  const group = new Uint8Array(COUNT);
  for (let i = 0; i < COUNT; i += 1) {
    speed[i] = 0.022 + rand() * 0.06;
    phase[i] = rand() * TAU;
    const r = rand();
    group[i] = r < PALETTE_CUMULATIVE[0] ? 0 : r < PALETTE_CUMULATIVE[1] ? 1 : 2;
  }

  const screenX = new Float32Array(COUNT);
  const screenY = new Float32Array(COUNT);
  const screenSize = new Float32Array(COUNT);
  const BUCKETS = BUCKET_STYLES.length;
  const bucketIndex = new Uint16Array(BUCKETS * COUNT);
  const bucketCount = new Int32Array(BUCKETS);

  let currentShape = 'sphere';
  let target = SHAPES.sphere;

  /* ---------- размеры и указатель ---------- */

  let dpr = 1;
  let W = 1;
  let H = 1;
  let cx = 0;
  let cy = 0;
  let scale = 100;
  let repelRadius = 80;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width * dpr));
    H = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = W;
    canvas.height = H;
    scale = Math.min(H * (isCompact ? 0.2 : 0.22), W * (isCompact ? 0.3 : 0.22));
    cx = W / 2;
    cy = H * (isCompact ? 0.31 : 0.37);
    repelRadius = Math.min(W, H) * 0.14;
  }

  let pointerX = 0; // -1…1, сглаженный
  let pointerY = 0;
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let mouseX = 0; // пиксели canvas
  let mouseY = 0;
  let mouseActive = false;

  function onPointerMove(event) {
    const rect = hero.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    pointerTargetX = px * 2 - 1;
    pointerTargetY = py * 2 - 1;
    mouseX = px * W;
    mouseY = py * H;
    mouseActive = true;
  }

  function onPointerLeave() {
    mouseActive = false;
    pointerTargetX = 0;
    pointerTargetY = 0;
  }

  /* ---------- смена формы ---------- */

  const pickers = Array.from(document.querySelectorAll('.shape-picker [data-shape]'));
  let pausedUntil = 0;

  function setShape(name, byUser) {
    if (!SHAPES[name]) return;
    if (byUser) pausedUntil = performance.now() + USER_PAUSE_MS;
    if (name === currentShape) return;
    currentShape = name;
    target = SHAPES[name];
    for (let j = 0; j < pos.length; j += 1) pos[j] += (rand() - 0.5) * 1.4; // «встряска» перед перестроением
    pickers.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.shape === name));
    });
  }

  function nextShape(byUser) {
    const index = SHAPE_ORDER.indexOf(currentShape);
    setShape(SHAPE_ORDER[(index + 1) % SHAPE_ORDER.length], byUser);
  }

  pickers.forEach((button) => {
    button.addEventListener('click', () => setShape(button.dataset.shape, true));
  });
  canvas.addEventListener('click', () => nextShape(true));
  hero.addEventListener('pointermove', onPointerMove);
  hero.addEventListener('pointerleave', onPointerLeave);
  hero.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'touch') onPointerLeave();
  });

  if (!reduceMotion) {
    setInterval(() => {
      if (document.hidden || performance.now() < pausedUntil) return;
      nextShape(false);
    }, AUTO_CYCLE_MS);
  }

  /* ---------- кадр ---------- */

  let time = 0;
  let zoom = 1;
  let lastTime = 0;
  let rafId = 0;
  let visible = true;

  function frame(now) {
    rafId = 0;
    const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 0.016);
    lastTime = now;
    time += dt;

    const follow = 1 - Math.pow(0.0015, dt);
    pointerX += (pointerTargetX - pointerX) * follow;
    pointerY += (pointerTargetY - pointerY) * follow;

    /* слово шире остальных форм: приближаем его, пока помещается в экран */
    const wordZoom = Math.min(WORD_ZOOM_MAX, Math.max(1, (W * 0.46) / (1.6 * scale)));
    zoom += ((currentShape === 'word' ? wordZoom : 1) - zoom) * follow;
    const drawScale = scale * zoom;

    const spin = reduceMotion ? 0.05 : 0.32;
    const yaw =
      currentShape === 'word'
        ? Math.sin(time * 0.55) * 0.32 + pointerX * 0.45
        : time * spin + pointerX * 0.7;
    const pitch = pointerY * 0.38 + (currentShape === 'word' ? 0 : 0.28);
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const catchUp = dt * 60;
    const sizeBase = (isCompact ? 0.3 : 0.38) * dpr;
    const sizeGain = (isCompact ? 0.85 : 1.05) * dpr;
    const repelR2 = repelRadius * repelRadius;

    bucketCount.fill(0);

    for (let i = 0; i < COUNT; i += 1) {
      const j = i * 3;
      const k = Math.min(1, speed[i] * catchUp);
      pos[j] += (target[j] - pos[j]) * k;
      pos[j + 1] += (target[j + 1] - pos[j + 1]) * k;
      pos[j + 2] += (target[j + 2] - pos[j + 2]) * k;

      const breathe = Math.sin(time * 1.4 + phase[i]) * 0.012;
      const x0 = pos[j] + breathe;
      const y0 = pos[j + 1] + breathe * 0.7;
      const z0 = pos[j + 2];

      const x1 = x0 * cosY + z0 * sinY;
      const z1 = -x0 * sinY + z0 * cosY;
      const y2 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;

      const p = FOV / (FOV + z2);
      let sx = cx + x1 * p * drawScale;
      let sy = cy + y2 * p * drawScale;

      if (mouseActive) {
        const dx = sx - mouseX;
        const dy = sy - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < repelR2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const falloff = 1 - d / repelRadius;
          const push = falloff * falloff * repelRadius * 0.55;
          sx += (dx / d) * push;
          sy += (dy / d) * push;
        }
      }

      const level = z2 < -0.4 ? 2 : z2 > 0.4 ? 0 : 1;
      const bucket = group[i] * 3 + level;
      bucketIndex[bucket * COUNT + bucketCount[bucket]] = i;
      bucketCount[bucket] += 1;
      screenX[i] = sx;
      screenY[i] = sy;
      screenSize[i] = sizeBase + sizeGain * p;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = TRAIL_STYLE;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (let b = 0; b < BUCKETS; b += 1) {
      ctx.fillStyle = BUCKET_STYLES[b];
      const base = b * COUNT;
      for (let n = 0; n < bucketCount[b]; n += 1) {
        const i = bucketIndex[base + n];
        const s = screenSize[i];
        ctx.fillRect(screenX[i] - s * 0.5, screenY[i] - s * 0.5, s, s);
      }
    }

    schedule();
  }

  function schedule() {
    if (rafId || !visible || document.hidden) return;
    rafId = requestAnimationFrame(frame);
  }

  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        lastTime = 0;
        schedule();
      }
    },
    { threshold: 0 }
  ).observe(hero);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastTime = 0;
      schedule();
    }
  });

  new ResizeObserver(resize).observe(hero);
  resize();
  ctx.fillStyle = '#07080c';
  ctx.fillRect(0, 0, W, H);
  schedule();
})();
