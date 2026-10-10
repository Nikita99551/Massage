// Сайт Дениса: меню на телефоне, подсветка текущего раздела, появление блоков, липкая полоса мессенджеров.

// Меню на телефоне
const burger = document.querySelector('[data-burger]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
if (burger && mobileMenu) {
  const setMenu = (open) => {
    mobileMenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  burger.addEventListener('click', () => setMenu(mobileMenu.hidden));
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
}

// Текущий раздел в навигации
const navLinks = [...document.querySelectorAll('.nav a')];
const sectionObserver = new IntersectionObserver((entries) => entries.forEach(({ isIntersecting, target }) => {
  if (!isIntersecting) return;
  navLinks.forEach((link) => link.classList.toggle('is-current', link.getAttribute('href') === `#${target.id}`));
}), { rootMargin: '-35% 0px -60% 0px' });
navLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

// Блоки появляются один раз при прокрутке
const revealObserver = new IntersectionObserver((entries) => entries.forEach(({ isIntersecting, target }) => {
  if (!isIntersecting) return;
  target.classList.add('is-visible');
  revealObserver.unobserve(target);
}), { threshold: 0.12 });
document.querySelectorAll('.section__head, .card, .step, .how, .review, .panel, .about__photo, .about__text').forEach((block, index) => {
  block.classList.add('reveal');
  block.style.transitionDelay = `${(index % 4) * 60}ms`;
  revealObserver.observe(block);
});

// Липкая полоса мессенджеров: появляется после первого экрана, прячется у блока записи
const mobileBar = document.querySelector('[data-mobile-bar]');
const hero = document.querySelector('.hero');
const contact = document.querySelector('#contact');
if (mobileBar && hero && contact) {
  let pastHero = false;
  let atContact = false;
  const sync = () => {
    const show = pastHero && !atContact;
    mobileBar.classList.toggle('is-shown', show);
    mobileBar.setAttribute('aria-hidden', String(!show));
  };
  new IntersectionObserver(([entry]) => { pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom < 0; sync(); }).observe(hero);
  new IntersectionObserver(([entry]) => { atContact = entry.isIntersecting; sync(); }, { threshold: 0.15 }).observe(contact);
}
