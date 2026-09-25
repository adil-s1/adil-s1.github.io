// ==========================================================
// Adil Slim — Portfolio v2 scripts (vanilla JavaScript)
// ==========================================================

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

// ---------- 1. Intro loader ----------
document.body.classList.add('loading');
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
    document.body.classList.remove('loading');
    startHero();
  }, reduceMotion ? 0 : 1100);
});

// ---------- 2. Hero: split the name into letters and animate them in ----------
document.querySelectorAll('[data-split]').forEach(word => {
  word.innerHTML = [...word.textContent].map(ch => `<span class="char">${ch}</span>`).join('');
});

// fade in the other hero items one after another
const heroItems = ['.hero-tag', '.hero-role', '.hero-lead', '.hero-actions'].map(s => document.querySelector(s));
heroItems.forEach(el => el.classList.add('fade-up'));

function startHero() {
  const title = document.querySelector('.hero-title');
  title.querySelectorAll('.char').forEach((c, i) => { c.style.transitionDelay = `${i * 45}ms`; });
  requestAnimationFrame(() => title.classList.add('in'));
  heroItems.forEach((el, i) => setTimeout(() => el.classList.add('in'), 350 + i * 140));
  setTimeout(typeLoop, 900);
}

// ---------- 3. Typing effect for the role line ----------
const roles = ['Junior Software Developer', 'Front-end builder', 'SQL & data problem-solver', 'Always learning, always shipping'];
const typedEl = document.getElementById('typed');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const word = roles[roleIndex];
  typedEl.textContent = word.slice(0, charIndex);
  if (!deleting && charIndex < word.length) { charIndex++; return setTimeout(typeLoop, 70); }
  if (!deleting) { deleting = true; return setTimeout(typeLoop, 1600); }
  if (charIndex > 0) { charIndex--; return setTimeout(typeLoop, 35); }
  deleting = false;
  roleIndex = (roleIndex + 1) % roles.length;
  setTimeout(typeLoop, 300);
}

// ---------- 4. Hero particle network (Canvas API) ----------
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let particles = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
const mouse = { x: -9999, y: -9999 };

function resizeCanvas() {
  W = canvas.offsetWidth; H = canvas.offsetHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(90, Math.floor((W * H) / 16000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.6 + .6,
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    // particles drift gently away from the mouse
    const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
    if (d < 120) { p.x += dx / d; p.y += dy / d; }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180, 170, 255, .7)';
    ctx.fill();
  }
  // lines between nearby particles, and to the mouse
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(124, 92, 255, ${(1 - d / 130) * .35})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    const a = particles[i], dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
    if (dm < 180) {
      ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - dm / 180) * .5})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
  }
  heroRAF = requestAnimationFrame(drawParticles);
}

let heroRAF = null;
resizeCanvas();
if (!reduceMotion) drawParticles();
window.addEventListener('resize', resizeCanvas);

// pause the particles when the hero is off-screen (saves battery)
new IntersectionObserver(([entry]) => {
  if (reduceMotion) return;
  if (entry.isIntersecting && !heroRAF) drawParticles();
  if (!entry.isIntersecting && heroRAF) { cancelAnimationFrame(heroRAF); heroRAF = null; }
}).observe(canvas);

canvas.parentElement.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
});
canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

// ---------- 5. Cursor glow, nav background and scroll progress ----------
const glow = document.getElementById('cursorGlow');
if (!isTouch && !reduceMotion) {
  window.addEventListener('mousemove', e => {
    glow.style.opacity = 1;
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const timelineFill = document.getElementById('timelineFill');
const timeline = document.querySelector('.timeline');

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 30);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  // the timeline line "draws" itself as you scroll through it
  const t = timeline.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (innerHeight * .7 - t.top) / t.height));
  timelineFill.style.transform = `scaleY(${pct})`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- 6. Mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', false);
  document.body.style.overflow = '';
}));

// ---------- 7. Scroll reveal + animated counters ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    entry.target.querySelectorAll('[data-count]').forEach(countUp);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .15 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`; // small stagger in grids
  revealObserver.observe(el);
});

function countUp(el) {
  const target = +el.dataset.count;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  if (reduceMotion) { el.textContent = prefix + target + suffix; return; }
  const start = performance.now(), duration = 1400;
  (function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  })(start);
}

// ---------- 8. 3D tilt + spotlight on cards ----------
if (!isTouch && !reduceMotion) {
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 6}deg)`;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // ---------- 9. Magnetic buttons ----------
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .25}px, ${y * .35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// ---------- 10. "About me" code card types itself out ----------
const codeLines = [
  ['tk-k', 'const '], ['tk-v', 'adil'], ['', ' = {\n'],
  ['tk-p', '  role'], ['', ': '], ['tk-s', '"Junior Software Developer"'], ['', ',\n'],
  ['tk-p', '  stack'], ['', ': ['], ['tk-s', '"HTML"'], ['', ', '], ['tk-s', '"CSS"'], ['', ', '], ['tk-s', '"JS"'], ['', ', '], ['tk-s', '"SQL"'], ['', '],\n'],
  ['tk-p', '  degree'], ['', ': '], ['tk-s', '"BA (Hons) International Marketing, 2:1"'], ['', ',\n'],
  ['tk-p', '  learning'], ['', ': ['], ['tk-s', '"JavaScript"'], ['', ', '], ['tk-s', '"Git"'], ['', '],\n'],
  ['tk-p', '  lookingFor'], ['', ': '], ['tk-s', '"junior dev / QA / apprenticeship"'], ['', ',\n'],
  ['tk-p', '  superpower'], ['', ': '], ['tk-s', '"fixing what\'s broken"'], ['', ',\n'],
  ['', '};\n\n'],
  ['tk-c', '// currently shipping: portfolio ✓  snake game ✓  to-do app …'],
];
const codeEl = document.getElementById('codeType');
let codeStarted = false;

function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function typeCode() {
  if (reduceMotion) {
    codeEl.innerHTML = codeLines.map(([c, t]) => `<span class="${c}">${escapeHtml(t)}</span>`).join('');
    return;
  }
  let seg = 0, pos = 0, html = '';
  (function step() {
    if (seg >= codeLines.length) return;
    const [cls, text] = codeLines[seg];
    pos++;
    const done = html + `<span class="${cls}">${escapeHtml(text.slice(0, pos))}</span>`;
    codeEl.innerHTML = done;
    if (pos >= text.length) { html = done; seg++; pos = 0; }
    setTimeout(step, 18);
  })();
}

new IntersectionObserver(([entry], obs) => {
  if (entry.isIntersecting && !codeStarted) { codeStarted = true; typeCode(); obs.disconnect(); }
}, { threshold: .3 }).observe(document.querySelector('.code-card'));

// ---------- 11. Auto-playing Snake demo in the featured card ----------
(function snakeDemo() {
  const c = document.getElementById('snakeDemo');
  const g = c.getContext('2d');
  const N = 18, S = c.width / N;
  let snake = [{ x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 }];
  let food = { x: 12, y: 9 };
  let running = false, timer = null;

  const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  const hits = (p) => p.x < 0 || p.y < 0 || p.x >= N || p.y >= N || snake.some(s => s.x === p.x && s.y === p.y);

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  // simple "AI": pick the safe move that gets closest to the food
  function step() {
    const head = snake[0];
    const options = dirs
      .map(d => ({ x: head.x + d.x, y: head.y + d.y }))
      .filter(p => !hits(p))
      .sort((a, b) => (Math.abs(a.x - food.x) + Math.abs(a.y - food.y)) - (Math.abs(b.x - food.x) + Math.abs(b.y - food.y)));
    if (!options.length || snake.length > 60) { snake = [{ x: 5, y: 9 }, { x: 4, y: 9 }, { x: 3, y: 9 }]; placeFood(); return draw(); }
    const next = options[0];
    snake.unshift(next);
    if (next.x === food.x && next.y === food.y) placeFood(); else snake.pop();
    draw();
  }

  function draw() {
    g.fillStyle = '#0b0b12'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#1b1b27';
    for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) g.fillRect(x * S + S / 2 - 1, y * S + S / 2 - 1, 2, 2);
    g.shadowColor = '#22d3ee'; g.shadowBlur = 14;
    g.fillStyle = '#f4f4f6';
    g.beginPath(); g.arc(food.x * S + S / 2, food.y * S + S / 2, S / 3, 0, Math.PI * 2); g.fill();
    g.shadowBlur = 0;
    snake.forEach((p, i) => {
      const t = i / snake.length;
      g.fillStyle = `rgba(${124 - t * 90}, ${92 + t * 119}, ${255 - t * 17}, ${1 - t * .55})`;
      g.beginPath(); g.roundRect(p.x * S + 1.5, p.y * S + 1.5, S - 3, S - 3, 5); g.fill();
    });
  }

  draw();
  if (reduceMotion) return;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) { running = true; timer = setInterval(step, 110); }
    if (!entry.isIntersecting && running) { running = false; clearInterval(timer); }
  }).observe(c);
})();

// ---------- 12. Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
