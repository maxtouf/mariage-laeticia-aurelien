// === Compte à rebours ===
const countdown = document.getElementById('countdown');
const weddingDate = new Date('2025-06-15T15:00:00');
function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;
  if (diff <= 0) {
    countdown.textContent = "C'est le grand jour !";
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  countdown.textContent = `${days}j ${hours}h ${mins}m ${secs}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// === Menu hamburger ===
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// === Scroll progress bar ===
const scrollProgress = document.querySelector('.scroll-progress');
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  const height = document.body.scrollHeight - window.innerHeight;
  scrollProgress.style.width = `${(scroll / height) * 100}%`;
});

// === Retour en haut ===
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) backToTop.classList.add('visible');
  else backToTop.classList.remove('visible');
});
backToTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

// === Mode jour/nuit ===
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
function setTheme(dark) {
  if (dark) body.classList.add('dark');
  else body.classList.remove('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  themeToggle.textContent = dark ? '☀️' : '🌙';
}
themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark')));
setTheme(localStorage.getItem('theme') === 'dark');

// === Timeline interactive ===
fetch('data/timeline.json').then(r=>r.json()).then(timeline => {
  const container = document.getElementById('timeline');
  timeline.forEach((event, i) => {
    const div = document.createElement('div');
    div.className = 'timeline-event';
    div.innerHTML = `
      <img src="${event.photo}" alt="${event.title}" class="timeline-photo" loading="lazy">
      <div class="timeline-content">
        <div class="timeline-date">${event.date}</div>
        <h3>${event.title}</h3>
        <p>${event.text}</p>
      </div>
    `;
    div.querySelector('.timeline-photo').onclick = () => openLightbox(event.photo, event.title);
    container.appendChild(div);
  });
  // Animation au scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.2 });
  document.querySelectorAll('.timeline-event').forEach(el => observer.observe(el));
});

// === Lightbox générique ===
function openLightbox(src, alt) {
  const lightbox = document.getElementById('lightbox');
  lightbox.innerHTML = `<button class='close' aria-label='Fermer'>&times;</button><img src='${src}' alt='${alt}'>`;
  lightbox.classList.add('open');
  lightbox.querySelector('.close').onclick = () => lightbox.classList.remove('open');
  lightbox.onclick = e => { if (e.target === lightbox) lightbox.classList.remove('open'); };
}

// === Carte interactive (Leaflet) ===
if (document.getElementById('map')) {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = () => {
    const map = L.map('map').setView([48.858, 2.294], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map);
    L.marker([48.8566, 2.3522]).addTo(map).bindPopup('Église Saint-Martin, Paris');
    L.marker([48.8049, 2.1204]).addTo(map).bindPopup('Château de la Forêt, Versailles');
  };
  document.head.appendChild(script);
  const leafletCSS = document.createElement('link');
  leafletCSS.rel = 'stylesheet';
  leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(leafletCSS);
}

// === RSVP interactif ===
const rsvpForm = document.getElementById('rsvp-form');
const rsvpConfirmation = document.getElementById('rsvp-confirmation');
rsvpForm.onsubmit = e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(rsvpForm));
  localStorage.setItem('rsvp_' + data.email, JSON.stringify(data));
  rsvpConfirmation.textContent = data.attendance === 'yes' ?
    `Merci ${data.name}, votre présence est confirmée !` :
    `Merci ${data.name}, nous sommes tristes que vous ne puissiez pas venir.`;
  rsvpForm.reset();
};

// === Galerie masonry, filtres, lightbox ===
fetch('data/gallery.json').then(r=>r.json()).then(gallery => {
  const filters = [...new Set(gallery.map(img => img.category))];
  const filtersDiv = document.getElementById('gallery-filters');
  filtersDiv.innerHTML = `<button class='active' data-cat='all'>Toutes</button>` +
    filters.map(cat => `<button data-cat='${cat}'>${cat.charAt(0).toUpperCase()+cat.slice(1)}</button>`).join('');
  const masonry = document.getElementById('gallery-masonry');
  function render(cat) {
    masonry.innerHTML = '';
    gallery.filter(img => cat==='all'||img.category===cat).forEach(img => {
      const div = document.createElement('div');
      div.className = 'gallery-item';
      div.innerHTML = `<img src='${img.src}' alt='${img.alt}' loading='lazy'><div class='gallery-cat'>${img.category}</div>`;
      div.onclick = () => openLightbox(img.src, img.alt);
      masonry.appendChild(div);
    });
  }
  render('all');
  filtersDiv.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      filtersDiv.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.cat);
    };
  });
});

// === Liste de mariage ===
fetch('data/gifts.json').then(r=>r.json()).then(gifts => {
  const list = document.getElementById('gifts-list');
  function render() {
    list.innerHTML = '';
    gifts.forEach((gift, i) => {
      const div = document.createElement('div');
      div.className = 'gift-item' + (gift.bought ? ' bought' : '');
      div.innerHTML = `<div>${gift.name}</div>
        <a class='gift-link' href='${gift.link}' target='_blank'>Voir / Participer</a>
        <button class='gift-buy'>${gift.bought ? 'Déjà acheté' : 'Je l\'ai acheté'}</button>`;
      div.querySelector('.gift-buy').onclick = () => {
        if (!gift.bought) { gift.bought = true; render(); }
      };
      list.appendChild(div);
    });
  }
  render();
});

// === Livre d'or numérique ===
const guestbookForm = document.getElementById('guestbook-form');
const guestbookWall = document.getElementById('guestbook-wall');
function renderGuestbook() {
  guestbookWall.innerHTML = '';
  const entries = JSON.parse(localStorage.getItem('guestbook')||'[]');
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'guestbook-polaroid';
    if (entry.photo) div.innerHTML += `<img src='${entry.photo}' alt='photo'>`;
    div.innerHTML += `<div class='guestbook-name'>${entry.name}</div><div class='guestbook-message'>${entry.message}</div>`;
    guestbookWall.appendChild(div);
  });
}
renderGuestbook();
guestbookForm.onsubmit = e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(guestbookForm));
  const reader = new FileReader();
  reader.onload = function(ev) {
    const entries = JSON.parse(localStorage.getItem('guestbook')||'[]');
    entries.unshift({name:data.guestname,message:data.guestmessage,photo:ev.target.result});
    localStorage.setItem('guestbook', JSON.stringify(entries));
    renderGuestbook();
    guestbookForm.reset();
  };
  if (guestbookForm.guestphoto.files[0]) reader.readAsDataURL(guestbookForm.guestphoto.files[0]);
  else {
    const entries = JSON.parse(localStorage.getItem('guestbook')||'[]');
    entries.unshift({name:data.guestname,message:data.guestmessage});
    localStorage.setItem('guestbook', JSON.stringify(entries));
    renderGuestbook();
    guestbookForm.reset();
  }
};

// === Lazy loading images ===
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.onerror = () => { img.style.opacity = 0.2; };
});

// === Micro-animations décoratives ===
// (exemple : coeurs flottants sur la page d'accueil)
function spawnHeart() {
  const heart = document.createElement('div');
  heart.className = 'heart-anim';
  heart.style.left = Math.random()*90+5+'vw';
  heart.style.top = (Math.random()*30+60)+'vh';
  document.body.appendChild(heart);
  setTimeout(()=>heart.remove(), 2500);
}
setInterval(spawnHeart, 3500); 