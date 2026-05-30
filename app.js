/* ── Header scroll state ─────────────────────────── */
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Hero bg load animation ──────────────────────── */
document.getElementById('heroBg').classList.add('loaded');

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

/* ── Scroll reveal (IntersectionObserver) ─────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// Trigger hero reveals immediately
setTimeout(() => {
  document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('revealed'));
}, 80);

/* ── Gallery filter ──────────────────────────────── */
const filterBtns = document.querySelectorAll('.f-btn');
const galleryGrid = document.getElementById('galleryGrid');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    document.querySelectorAll('.g-item').forEach((item, i) => {
      const show = filter === 'all' || item.dataset.type === filter;
      item.style.display = show ? '' : 'none';
      if (show) {
        item.style.animationDelay = (i * 0.05) + 's';
        item.classList.remove('revealed');
        void item.offsetWidth; // reflow
        item.classList.add('revealed');
      }
    });
  });
});

/* ── File upload ─────────────────────────────────── */
const dropZone  = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadTrigger = document.getElementById('uploadTrigger');

[dropZone, uploadTrigger].forEach(el => {
  el.addEventListener('click', e => {
    e.stopPropagation();
    fileInput.click();
  });
});

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('over');
});
['dragleave', 'dragend'].forEach(ev => {
  dropZone.addEventListener(ev, () => dropZone.classList.remove('over'));
});
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('over');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
  fileInput.value = '';
});

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
  item.dataset.type = type;
  item.style.setProperty('--d', '0s');

  const thumbClass = type === 'video' ? 'vid-style' : 'img-style';

  let mediaContent = '';
  if (type === 'video') {
    mediaContent = `
      <video src="${src}" muted preload="metadata" style="width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>
      <div class="play-ring">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </div>`;
  } else {
    mediaContent = `<img src="${src}" alt="${title}" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" />`;
  }

  item.innerHTML = `
    <div class="g-thumb ${thumbClass}">
      ${mediaContent}
      <div class="g-label">${title}</div>
      <div class="g-overlay"><span>${type === 'video' ? 'Video' : 'Image'}</span></div>
    </div>`;

  item.addEventListener('click', () => openLightbox(src, type, title));
  galleryGrid.prepend(item);

  // observe for reveal
  requestAnimationFrame(() => revealObserver.observe(item));

  // respect current filter
  const activeFilter = document.querySelector('.f-btn.active').dataset.filter;
  if (activeFilter !== 'all' && activeFilter !== type) {
    item.style.display = 'none';
  }
}

/* ── Demo card clicks ────────────────────────────── */
document.querySelectorAll('.g-item:not(.uploaded)').forEach(item => {
  item.addEventListener('click', () => {
    const type  = item.dataset.type;
    const label = item.querySelector('.g-label')?.textContent || '';
    openLightbox(null, type, label);
  });
});

/* ── Lightbox ────────────────────────────────────── */
const lightbox   = document.getElementById('lightbox');
const lbContent  = document.getElementById('lbContent');
const lbCaption  = document.getElementById('lbCaption');
const lbClose    = document.getElementById('lbClose');

function openLightbox(src, type, caption) {
  lbContent.innerHTML = '';
  lbCaption.textContent = caption || '';

  if (!src) {
    const placeholder = document.createElement('div');
    const isVideo = type === 'video';
    placeholder.style.cssText = [
      'width:700px', 'max-width:90vw', 'aspect-ratio:16/9',
      'border-radius:2px', 'display:flex', 'align-items:center',
      'justify-content:center', 'font-family:var(--serif)',
      'font-style:italic', 'letter-spacing:0.08em',
      'color:rgba(255,255,255,0.2)', 'font-size:1rem',
      isVideo
        ? 'background:linear-gradient(135deg,#1f1d1b,#141210)'
        : 'background:linear-gradient(135deg,#ccc5ba,#b8b0a4)'
    ].join(';');
    placeholder.textContent = caption || (isVideo ? 'Video' : 'Image');
    lbContent.appendChild(placeholder);
  } else if (type === 'video') {
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

/* ── Parallax on feature section ─────────────────── */
const featureBg = document.querySelector('.feature-bg');
if (featureBg) {
  window.addEventListener('scroll', () => {
    const section = featureBg.closest('.feature-section');
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const pct = rect.top / window.innerHeight;
    featureBg.style.transform = `scale(1.04) translateY(${pct * 30}px)`;
  }, { passive: true });
}
