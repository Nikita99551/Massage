// Сайт Дениса: вход первого экрана, расхождение слова при прокрутке (экран закреплён, страница наезжает),
// появления секций, этапы курса, вкладки услуг, меню на телефоне, шапка, липкая полоса мессенджеров.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-ready')));

const header = document.querySelector('[data-header]');
const hero = document.querySelector('[data-hero]');
const halfL = document.querySelector('.hero__half--l');
const halfR = document.querySelector('.hero__half--r');
const figure = document.querySelector('.hero__figure');
const mobileBar = document.querySelector('[data-mobile-bar]');
const contact = document.querySelector('#contact');
let atContact = false;

// Липкая полоса мессенджеров: после первого экрана, прячется у блока записи
const syncBar = () => {
  if (!mobileBar || !hero) return;
  const show = window.scrollY > hero.offsetHeight * 0.85 && !atContact;
  mobileBar.classList.toggle('is-shown', show);
  mobileBar.setAttribute('aria-hidden', String(!show));
};
if (contact) new IntersectionObserver(([e]) => { atContact = e.isIntersecting; syncBar(); }, { threshold: 0.15 }).observe(contact);

// Прокрутка: фон шапки, половины слова расходятся за первые полэкрана, фигура чуть приближается
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (hero && !reduceMotion) {
      const p = Math.min(1, y / (hero.offsetHeight * 0.55));
      if (halfL) halfL.style.transform = `translateX(${-p * 18}vw)`;
      if (halfR) halfR.style.transform = `translateX(${p * 18}vw)`;
      if (figure) figure.style.transform = `translateX(-50%) scale(${1 + p * 0.06})`;
    }
    syncBar();
    ticking = false;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Появление секций один раз: у каждой своя анимация в CSS
const revealObserver = new IntersectionObserver((entries) => entries.forEach(({ isIntersecting, target }) => {
  if (!isIntersecting) return;
  target.classList.add('is-visible');
  revealObserver.unobserve(target);
}), { threshold: 0.18 });
document.querySelectorAll('.story, [data-why], [data-course], .bento, [data-how], [data-terms]').forEach((el) => revealObserver.observe(el));

// Этапы курса: нажатие, наведение или прокрутка мимо этапа меняет фото
const stages = [...document.querySelectorAll('.stage')];
const stageImgs = [...document.querySelectorAll('[data-stage-img]')];
const setStage = (index) => {
  stages.forEach((stage, i) => {
    stage.classList.toggle('is-active', i === index);
    stage.querySelector('.stage__btn').setAttribute('aria-pressed', String(i === index));
  });
  stageImgs.forEach((img, i) => img.classList.toggle('is-active', i === index));
};
stages.forEach((stage, i) => {
  const btn = stage.querySelector('.stage__btn');
  btn.addEventListener('click', () => setStage(i));
  btn.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches) setStage(i); });
});
const stageObserver = new IntersectionObserver((entries) => entries.forEach(({ isIntersecting, target }) => {
  if (isIntersecting) setStage(stages.indexOf(target));
}), { rootMargin: '-48% 0px -48% 0px' });
stages.forEach((stage) => stageObserver.observe(stage));

// Вкладки услуг: фото-сетка или состав курса
const tabs = [...document.querySelectorAll('[role="tab"]')];
const selectTab = (tab) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
};
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next); next.focus();
  });
});

// Меню на телефоне
const burger = document.querySelector('[data-burger]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
if (burger && mobileMenu) {
  const setMenu = (open) => {
    mobileMenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (open) header.classList.add('is-scrolled'); else onScroll();
  };
  burger.addEventListener('click', () => setMenu(mobileMenu.hidden));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
}

// Текущий раздел в навигации
const navLinks = [...document.querySelectorAll('.nav a')];
const sectionObserver = new IntersectionObserver((entries) => entries.forEach(({ isIntersecting, target }) => {
  if (!isIntersecting) return;
  navLinks.forEach((link) => link.classList.toggle('is-current', link.getAttribute('href') === `#${target.id}`));
}), { rootMargin: '-35% 0px -60% 0px' });
navLinks.forEach((link) => { const s = document.querySelector(link.getAttribute('href')); if (s) sectionObserver.observe(s); });

// Отзывы: карусель на scroll-snap, стрелки листают на ширину карточки, полоска показывает положение
const track = document.querySelector('[data-track]');
if (track) {
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const bar = document.querySelector('[data-bar]');
  const step = () => (track.querySelector('.review')?.offsetWidth || 300) + 14;
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft > max - 4;
    if (bar) {
      const w = Math.max(.08, track.clientWidth / track.scrollWidth);
      bar.style.width = `${w * 100}%`;
      bar.style.transform = `translateX(${(track.scrollLeft / Math.max(1, max)) * (100 / w - 100)}%)`;
    }
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step() * 2, behavior: reduceMotion ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step() * 2, behavior: reduceMotion ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
}
