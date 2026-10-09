const works = [
  {"p":"ig","id":"DCEfvYUiYe9"},
  {"p":"ig","id":"Db24hswSfbG"},
  {"p":"ig","id":"DC1lBhtsQk6"},
  {"p":"ig","id":"DDMwNQxss8K"},
  {"p":"ig","id":"DD9kqEUPKWM"},
  {"p":"yt","id":"zwfJ59lWU-c"},
  {"p":"ig","id":"DUC1HsjgFBH"},
  {"p":"ig","id":"DLFTWlNqHia"},
  {"p":"yt","id":"bDu0V3EN9NQ"},
  {"p":"ig","id":"DI_ZNHNImIM"},
  {"p":"ig","id":"DH8Ve8lyTbJ"},
  {"p":"yt","id":"eCBXzG-Lm94"},
  {"p":"ig","id":"DHTO9BEog-S"},
  {"p":"ig","id":"DGf_FtkBQh_"},
  {"p":"ig","id":"DFcnD-Dzw03"},
  {"p":"yt","id":"8FIJk805P9c"},
  {"p":"ig","id":"DFVOS6xvOoL"},
  {"p":"ig","id":"DEXQ7CvNEFf"},
  {"p":"yt","id":"JE0odxiU6gE"},
  {"p":"ig","id":"Dcp0awSBlYS"},
  {"p":"ig","id":"DV23JYXiKlx"}
];


document.addEventListener("DOMContentLoaded", () => {
  const pin = document.getElementById('tl-pin');
  if (!pin) return;

  const N = works.length;
  const $ = (id) => document.getElementById(id);
  const strip = $('tl-strip'), viewport = $('tl-viewport');
  const v1 = $('tl-v1'), v2 = $('tl-v2'), a1 = $('tl-a1'), ruler = $('tl-ruler');
  const monitor = $('tl-monitor'), frame = $('tl-frame');
  const imgs = frame.querySelectorAll('.tl-img');
  const tc1 = $('tl-tc'), tc2 = $('tl-tc2');
  const countCur = $('tl-count-cur'), meta = $('tl-meta'), clipName = $('tl-clipname');
  $('tl-count-total').textContent = String(N).padStart(2, '0');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const thumb = (w) => w.p === 'yt' ? `https://i.ytimg.com/vi/${w.id}/hqdefault.jpg` : `assets/thumbs/${w.id}.webp`;
  const label = (i) => `Work ${String(i + 1).padStart(2, '0')}`;
  const platform = (w) => w.p === 'yt' ? 'YouTube Short' : 'Instagram Reel';

  // Deterministic pseudo-random so the timeline looks the same every visit
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---- Build the timeline ----
  const clipEls = [];
  works.forEach((w, i) => {
    const clip = document.createElement('button');
    clip.className = `tl-clip tl-${w.p}`;
    clip.style.setProperty('--thumb', `url("${thumb(w)}")`);
    clip.setAttribute('aria-label', `${label(i)}, ${platform(w)}`);
    clip.innerHTML = `<span class="tl-clip-name">${label(i)}</span><span class="tl-clip-fx">${w.p === 'yt' ? 'YT' : 'IG'}</span>`;
    clip.addEventListener('click', () => {
      if (i === active) openLightbox(i);
      else goTo(i);
    });
    v1.appendChild(clip);
    clipEls.push(clip);

    // V2: occasional title / graphics layers above the clip
    const g = document.createElement('span');
    g.className = 'tl-gfx';
    if (rand() > 0.35) {
      const kinds = ['TITLE', 'GFX', 'LOWER 3RD', 'CAPTIONS', 'ADJ'];
      g.dataset.kind = kinds[Math.floor(rand() * kinds.length)];
      g.style.setProperty('--l', `${8 + rand() * 30}%`);
      g.style.setProperty('--w', `${30 + rand() * 50}%`);
    } else {
      g.classList.add('empty');
    }
    v2.appendChild(g);

    // A1: waveform
    const wave = document.createElement('span');
    wave.className = 'tl-wave';
    const bars = 36;
    let svg = `<svg viewBox="0 0 ${bars * 4} 40" preserveAspectRatio="none">`;
    for (let b = 0; b < bars; b++) {
      const env = Math.sin((b / bars) * Math.PI) * 0.6 + 0.4;
      const h = Math.max(2, (0.25 + rand() * 0.75) * env * 36);
      svg += `<rect x="${b * 4 + 0.5}" y="${20 - h / 2}" width="2.4" height="${h}" rx="1"/>`;
    }
    wave.innerHTML = svg + '</svg>';
    a1.appendChild(wave);

    // Ruler label at each clip start
    const r = document.createElement('span');
    r.className = 'tl-ruler-mark';
    r.textContent = timecode(i * 30 * 25);
    ruler.appendChild(r);
  });

  // ---- Lightbox (unchanged behaviour) ----
  const lightbox = $('lightbox');
  const lightboxContainer = $('lightbox-iframe-container');
  const externalLink = $('lightbox-external-link');
  let isLightboxOpen = false;
  let lbIndex = 0;

  function openLightbox(index) {
    lbIndex = index;
    const work = works[index];
    isLightboxOpen = true;
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    const iframe = document.createElement('iframe');
    iframe.allowFullscreen = true;
    iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.title = "Video player";
    const tapHint = $('lightbox-tap-hint');
    if (work.p === 'yt') {
      iframe.src = `https://www.youtube-nocookie.com/embed/${work.id}?autoplay=1&rel=0&playsinline=1`;
      externalLink.href = `https://www.youtube.com/shorts/${work.id}`;
      externalLink.textContent = "Open on YouTube";
      if (tapHint) tapHint.style.display = 'none';
    } else {
      iframe.src = `https://www.instagram.com/reel/${work.id}/embed`;
      externalLink.href = `https://www.instagram.com/reel/${work.id}/`;
      externalLink.textContent = "Open on Instagram";
      if (tapHint) tapHint.style.display = 'block';
    }
    lightboxContainer.innerHTML = '';
    lightboxContainer.appendChild(iframe);
  }
  function closeLightbox() {
    isLightboxOpen = false;
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxContainer.innerHTML = '';
  }
  function changeLightbox(dir) {
    if (!isLightboxOpen) return;
    openLightbox((lbIndex + dir + N) % N);
  }
  $('lightbox-close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
  $('lightbox-prev').addEventListener('click', () => changeLightbox(-1));
  $('lightbox-next').addEventListener('click', () => changeLightbox(1));
  $('lightbox-fullscreen').addEventListener('click', () => {
    const iframe = lightboxContainer.querySelector('iframe');
    if (iframe && iframe.requestFullscreen) iframe.requestFullscreen();
  });
  document.addEventListener('keydown', e => {
    if (!isLightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
  });

  // ---- Scroll-driven playhead ----
  const PER_CLIP_VH = 22; // scroll distance per clip
  let clipW = 0, extra = 0;
  function layout() {
    const vh = window.innerHeight;
    extra = Math.round((N - 1) * PER_CLIP_VH / 100 * vh);
    pin.style.height = `${vh + extra}px`;
    window.__worksPinExtra = extra; // lets the hero animation ignore this extra length
    clipW = clipEls[0].getBoundingClientRect().width || 160;
  }

  let target = 0, current = 0, active = -1, inView = false;

  function progress() {
    const r = pin.getBoundingClientRect();
    return Math.min(Math.max(-r.top / Math.max(1, extra), 0), 1);
  }

  function goTo(i) {
    const top = pin.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / (N - 1)) * extra + 1, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function timecode(frames) {
    const f = Math.floor(frames % 25), s = Math.floor(frames / 25);
    const p = (n) => String(n).padStart(2, '0');
    return `00:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}:${p(f)}`;
  }

  let glitchTimer;
  function setActive(i) {
    if (i === active) return;
    active = i;
    const w = works[i];
    imgs.forEach(img => { img.src = thumb(w); });
    countCur.textContent = String(i + 1).padStart(2, '0');
    meta.textContent = platform(w);
    clipName.textContent = label(i);
    monitor.classList.toggle('is-yt', w.p === 'yt');
    clipEls.forEach((c, k) => c.classList.toggle('active', k === i));
    // preload neighbours
    [i - 1, i + 1].forEach(k => { if (works[k]) { const im = new Image(); im.src = thumb(works[k]); } });
    if (!reduceMotion) {
      frame.classList.remove('glitch');
      void frame.offsetWidth;
      frame.classList.add('glitch');
      clearTimeout(glitchTimer);
      glitchTimer = setTimeout(() => frame.classList.remove('glitch'), 420);
    }
  }

  function tick() {
    if (inView) {
      target = progress();
      current += (target - current) * (reduceMotion ? 1 : 0.18);
      if (Math.abs(target - current) < 0.0002) current = target;
      const pos = (current * (N - 1) + 0.5) * clipW; // playhead position along the strip
      const center = viewport.clientWidth / 2;
      strip.style.transform = `translate3d(${center - pos}px,0,0)`;
      setActive(Math.min(N - 1, Math.max(0, Math.round(current * (N - 1)))));
      const t = timecode((current * (N - 1) + 0.5) * 30 * 25);
      tc1.textContent = t; tc2.textContent = t;
    }
    requestAnimationFrame(tick);
  }

  monitor.addEventListener('click', () => openLightbox(active));
  monitor.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(active); } });
  $('tl-watch').addEventListener('click', () => openLightbox(active));
  $('tl-prev').addEventListener('click', () => goTo(Math.max(0, active - 1)));
  $('tl-next').addEventListener('click', () => goTo(Math.min(N - 1, active + 1)));

  const workSection = $('work');
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      inView = e.isIntersecting;
      if (e.isIntersecting) workSection.classList.add('in-view');
    });
  }, { threshold: 0 }).observe(workSection);

  layout();
  setActive(0);
  window.addEventListener('resize', layout, { passive: true });
  requestAnimationFrame(tick);
});
