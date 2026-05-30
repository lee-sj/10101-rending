/* ── Header scroll ────────────────────────────────── */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Hero image load animation ───────────────────── */
const heroBgImg = document.getElementById('heroBgImg');
if (heroBgImg) {
  heroBgImg.addEventListener('load', () => heroBgImg.classList.add('loaded'));
  if (heroBgImg.complete) heroBgImg.classList.add('loaded');
}

/* ── Mobile menu ─────────────────────────────────── */
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('[data-close]').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Scroll reveal ───────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// Hero reveals on load
setTimeout(() => {
  document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('revealed'));
}, 100);

/* ── Gallery filter ──────────────────────────────── */
const filterBtns  = document.querySelectorAll('.f-btn');
const galleryGrid = document.getElementById('galleryGrid');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    let idx = 0;
    document.querySelectorAll('.g-item').forEach(item => {
      const show = filter === 'all' || item.dataset.type === filter;
      item.style.display = show ? '' : 'none';
      if (show) {
        item.style.setProperty('--d', (idx * 0.05) + 's');
        item.classList.remove('revealed');
        void item.offsetWidth;
        item.classList.add('revealed');
        idx++;
      }
    });
  });
});

/* ── Gallery item clicks (pre-loaded images) ─────── */
document.querySelectorAll('.g-item[data-src]').forEach(item => {
  item.addEventListener('click', () => {
    openLightbox(item.dataset.src, item.dataset.type, item.dataset.caption);
  });
});

/* ── Product & shampoo card clicks ───────────────── */
document.querySelectorAll('.product-card, .shampoo-card').forEach(card => {
  card.addEventListener('click', () => {
    const imgSrc = card.dataset.img || null;
    const name   = card.querySelector('.product-name, .shampoo-name')?.textContent || '';
    const note   = card.querySelector('.product-note, .shampoo-desc')?.textContent || '';
    openProductModal(imgSrc, name, note);
  });
});

/* ── File upload ─────────────────────────────────── */
const dropZone     = document.getElementById('dropZone');
const fileInput    = document.getElementById('fileInput');
const uploadTrigger = document.getElementById('uploadTrigger');

[dropZone, uploadTrigger].forEach(el => {
  el.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
});

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
dropZone.addEventListener('dragend',   () => dropZone.classList.remove('over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('over');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => { handleFiles(fileInput.files); fileInput.value = ''; });

function handleFiles(files) {
  Array.from(files).forEach((file, i) => {
    const isVideo = file.type.startsWith('video/');
    const url  = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^.]+$/, '');
    setTimeout(() => addGalleryItem(url, name, isVideo ? 'video' : 'image'), i * 80);
  });
}

function addGalleryItem(src, title, type) {
  const item = document.createElement('div');
  item.className = 'g-item uploaded reveal';
  item.dataset.type    = type;
  item.dataset.src     = src;
  item.dataset.caption = title;
  item.style.setProperty('--d', '0s');

  let mediaEl = '';
  if (type === 'video') {
    mediaEl = `
      <video src="${src}" muted preload="metadata" style="width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>
      <div class="play-ring">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>`;
  } else {
    mediaEl = `<img src="${src}" alt="${title}" />`;
  }

  item.innerHTML = `
    <div class="g-thumb">
      ${mediaEl}
      <div class="g-label">${title}</div>
      <div class="g-overlay"><span>${type === 'video' ? 'Video' : 'Image'}</span></div>
    </div>`;

  item.addEventListener('click', () => openLightbox(src, type, title));
  galleryGrid.prepend(item);
  requestAnimationFrame(() => revealObserver.observe(item));

  const activeFilter = document.querySelector('.f-btn.active').dataset.filter;
  if (activeFilter !== 'all' && activeFilter !== type) item.style.display = 'none';
}

/* ── Lightbox ────────────────────────────────────── */
const lightbox  = document.getElementById('lightbox');
const lbContent = document.getElementById('lbContent');
const lbCaption = document.getElementById('lbCaption');
const lbClose   = document.getElementById('lbClose');

function openLightbox(src, type, caption) {
  lbContent.innerHTML = '';
  lbCaption.textContent = caption || '';

  if (type === 'video') {
    const v = document.createElement('video');
    v.src = src; v.controls = true; v.autoplay = true;
    lbContent.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = src; img.alt = caption || '';
    lbContent.appendChild(img);
  }

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  const v = lbContent.querySelector('video');
  if (v) v.pause();
  lbContent.innerHTML = '';
}

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ── Product modal (simple info overlay) ─────────── */
function openProductModal(imgSrc, name, note) {
  lbContent.innerHTML = '';
  lbCaption.textContent = '';

  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;gap:0;max-width:800px;width:100%;border-radius:4px;overflow:hidden;background:#faf8f5;';

  if (imgSrc) {
    const imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'width:340px;flex-shrink:0;';
    const img = document.createElement('img');
    img.src = imgSrc; img.alt = name;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;object-position:center top;';
    imgWrap.appendChild(img);
    wrap.appendChild(imgWrap);
  }

  const info = document.createElement('div');
  info.style.cssText = 'padding:48px 40px;display:flex;flex-direction:column;justify-content:center;flex:1;';
  info.innerHTML = `
    <p style="font-size:0.68rem;font-weight:500;letter-spacing:0.2em;color:#b09a7a;text-transform:uppercase;margin-bottom:12px;">10101 PROFESSIONAL</p>
    <h3 style="font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:300;color:#111010;margin-bottom:16px;line-height:1.3;">${name}</h3>
    <p style="font-size:0.88rem;color:#9a9088;line-height:1.8;">${note}</p>
    <a href="https://www.10101pro.shop" target="_blank"
       style="display:inline-block;margin-top:32px;padding:12px 28px;border:1px solid #111010;font-size:0.72rem;font-weight:500;letter-spacing:0.15em;color:#111010;width:fit-content;transition:background 0.2s,color 0.2s;"
       onmouseover="this.style.background='#111010';this.style.color='#fff';"
       onmouseout="this.style.background='';this.style.color='#111010';">
      온라인 스토어 →
    </a>`;
  wrap.appendChild(info);
  lbContent.appendChild(wrap);

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Feature parallax ────────────────────────────── */
const featureImg = document.querySelector('.feature-img');
if (featureImg) {
  window.addEventListener('scroll', () => {
    const section = featureImg.closest('.feature-section');
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const pct = rect.top / window.innerHeight;
    featureImg.style.transform = `scale(1.06) translateY(${pct * 24}px)`;
  }, { passive: true });
}
