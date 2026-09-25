// ==========================================================
// Adil Slim — Portfolio scripts
// ==========================================================

// 1. Footer year — always shows the current year
document.getElementById('year').textContent = new Date().getFullYear();

// 2. Mobile menu — open/close the nav on small screens
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', isOpen);
});

// Close the menu after tapping a link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// 3. Light / dark mode — remembers the visitor's choice
const themeBtn = document.getElementById('themeBtn');
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked */ }
}

let saved = null;
try { saved = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(saved || (prefersDark ? 'dark' : 'light'));

themeBtn.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// 4. Typing effect — cycles through the roles I'm applying for
const roles = [
  'Junior Software Developer',
  'Web Developer (HTML, CSS, JS)',
  'QA & Software Testing',
  'Always learning'
];
const typed = document.getElementById('typed');
let roleIndex = 0;
let charIndex = roles[0].length;
let deleting = true;

function typeLoop() {
  const current = roles[roleIndex];
  typed.textContent = current.slice(0, charIndex);

  if (deleting) {
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  } else {
    charIndex++;
    if (charIndex === roles[roleIndex].length) {
      deleting = true;
      setTimeout(typeLoop, 1800); // pause on the full word
      return;
    }
  }
  setTimeout(typeLoop, deleting ? 40 : 80);
}
setTimeout(typeLoop, 2200);

// 5. Project filters — show only projects that match the chosen tag
const chips = document.querySelectorAll('.chip');
const projects = document.querySelectorAll('.project');

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const filter = chip.dataset.filter;
    projects.forEach(project => {
      const types = project.dataset.type.split(' ');
      const show = filter === 'all' || types.includes(filter);
      project.classList.toggle('hide', !show);
    });
  });
});

// 6. Scroll reveal — sections fade in as you scroll down
const revealItems = document.querySelectorAll('.section-title, .skill-card, .project, .timeline li, .edu');
revealItems.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach(el => observer.observe(el));
