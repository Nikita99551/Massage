const observer = new IntersectionObserver((entries) => entries.forEach(({ isIntersecting, target }) => {
  if (isIntersecting) { target.classList.add('is-visible'); observer.unobserve(target); }
}), { threshold: 0.16 });

document.querySelectorAll('.reveal, .service-grid article, .process-grid article, .journal-grid article').forEach((element, index) => {
  element.style.setProperty('--delay', `${Math.min(index, 4) * 80}ms`);
  observer.observe(element);
});

const massageField = document.querySelector('.massage-field');
if (massageField) {
  const trigger = massageField.querySelector('.massage-select__trigger');
  const menu = massageField.querySelector('.massage-select__menu');
  const closeMenu = () => { massageField.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); menu.hidden = true; };
  trigger.addEventListener('click', () => {
    const opening = !massageField.classList.contains('is-open');
    massageField.classList.toggle('is-open', opening);
    trigger.setAttribute('aria-expanded', String(opening));
    menu.hidden = !opening;
  });
  menu.querySelectorAll('button').forEach((option) => option.addEventListener('click', () => {
    trigger.childNodes[0].nodeValue = `${option.textContent.trim()} `;
    trigger.classList.remove('is-placeholder');
    menu.querySelectorAll('button').forEach((item) => item.classList.toggle('is-selected', item === option));
    closeMenu();
  }));
  document.addEventListener('click', (event) => { if (!massageField.contains(event.target)) closeMenu(); });
}

const bookingForm = document.querySelector('[data-booking-form]');
if (bookingForm) {
  const telegramLink = bookingForm.querySelector('[data-telegram-link]');
  const bookingHint = bookingForm.querySelector('.booking-hint');
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const massageTrigger = bookingForm.querySelector('.massage-select__trigger');
    if (massageTrigger.classList.contains('is-placeholder')) {
      bookingHint.textContent = 'Сначала выберите вид массажа';
      bookingHint.classList.add('is-error');
      massageTrigger.focus();
      return;
    }
    const formData = new FormData(bookingForm);
    const massage = massageTrigger.childNodes[0].nodeValue.trim();
    const message = `Здравствуйте, хочу записаться на массаж\n\nИмя: ${formData.get('name')}\nТелефон: ${formData.get('phone')}\nМассаж: ${massage}`;
    telegramLink.href = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
    bookingHint.textContent = 'Открываю Telegram с вашей заявкой';
    bookingHint.classList.remove('is-error');
    window.open(telegramLink.href, '_blank', 'noopener');
  });
}

const heroMedia = document.querySelector('.hero-media img');
const parallaxMedia = document.querySelectorAll('.parallax-media');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let ticking = false;
window.addEventListener('scroll', () => {
  if (reduceMotion || ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    if (heroMedia) heroMedia.style.transform = `translateY(${Math.min(window.scrollY * 0.035, 26)}px) scale(1.04)`;
    parallaxMedia.forEach((image) => {
      const position = image.parentElement.getBoundingClientRect();
      const shift = Math.max(-18, Math.min(18, (window.innerHeight * 0.5 - position.top) * 0.035));
      image.style.transform = `translateY(${shift}px) scale(1.06)`;
    });
    ticking = false;
  });
}, { passive: true });

document.querySelectorAll('.service-card__main').forEach((trigger) => trigger.addEventListener('click', () => {
  const card = trigger.closest('.service-card');
  const opening = !card.classList.contains('is-open');
  card.classList.toggle('is-open', opening);
  trigger.setAttribute('aria-expanded', String(opening));
}));

document.querySelectorAll('.journal-card__main').forEach((trigger) => trigger.addEventListener('click', () => {
  const card = trigger.closest('.journal-card');
  const opening = !card.classList.contains('is-open');
  card.classList.toggle('is-open', opening);
  trigger.setAttribute('aria-expanded', String(opening));
}));

const materialsDialog = document.querySelector('[data-materials-dialog]');
const materialsList = materialsDialog?.querySelector('.materials-list');
const materialsFilter = materialsDialog?.querySelector('.materials-filter');
const materialReading = materialsDialog?.querySelector('[data-material-reading]');
const materialContent = {
  prepare: {
    section: 'ПОДХОД', title: 'Как подготовиться к массажу дома',
    text: 'Подготовка занимает несколько минут и помогает провести сеанс спокойно',
    steps: ['Выберите тихое место, где поместится стол', 'Освободите проход к месту сеанса', 'Не ешьте плотно за 60–90 минут до визита', 'Сообщите заранее о самочувствии и зонах, которые беспокоят']
  },
  rest: {
    section: 'ВОССТАНОВЛЕНИЕ', title: 'Когда телу особенно нужен отдых',
    text: 'Массаж может быть полезен, когда усталость накапливается, а тело не успевает восстановиться',
    steps: ['Плечи и шея постоянно напряжены', 'Поясница устаёт от сидячей работы', 'После тренировки тяжесть в мышцах держится дольше обычного', 'Сон не возвращает привычную лёгкость']
  },
  home: {
    section: 'ОПЫТ', title: 'Почему выездной формат экономит силы',
    text: 'Главное преимущество — после сеанса вы остаётесь дома и сохраняете состояние отдыха',
    steps: ['Не нужно ехать через город до и после массажа', 'Стол, масла и полотенца привожу сам', 'Можно сразу принять душ, отдохнуть или лечь спать', 'Время на дорогу остаётся вашим']
  }
};

const showMaterialsList = () => {
  materialsList.hidden = false;
  materialsFilter.hidden = false;
  materialReading.hidden = true;
};

document.querySelector('[data-materials-open]')?.addEventListener('click', () => {
  showMaterialsList();
  materialsDialog.showModal();
});
document.querySelector('[data-materials-close]')?.addEventListener('click', () => materialsDialog.close());
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  materialsDialog.querySelectorAll('.materials-list [data-material]').forEach((item) => { item.hidden = filter !== 'all' && item.dataset.topic !== filter; });
  document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
}));

materialsDialog?.querySelectorAll('[data-material]').forEach((item) => item.addEventListener('click', () => {
  const material = materialContent[item.dataset.material];
  materialReading.innerHTML = `<button type="button" class="material-reading__back" data-materials-back>← ВСЕ МАТЕРИАЛЫ</button><p>${material.section}</p><h3>${material.title}</h3><span>${material.text}</span><ol>${material.steps.map((step) => `<li>${step}</li>`).join('')}</ol>`;
  materialsList.hidden = true;
  materialsFilter.hidden = true;
  materialReading.hidden = false;
  materialReading.querySelector('[data-materials-back]').addEventListener('click', showMaterialsList);
}));
