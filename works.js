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
  const trackInner = document.getElementById('carousel-track-inner');
  if (!trackInner) return;

  const lightbox = document.getElementById('lightbox');
  const lightboxContainer = document.getElementById('lightbox-iframe-container');
  const closeBtn = document.getElementById('lightbox-close');
  const backdrop = document.querySelector('.lightbox-backdrop');
  const externalLink = document.getElementById('lightbox-external-link');
  const fullscreenBtn = document.getElementById('lightbox-fullscreen');
  const counterEl = document.getElementById('works-counter');
  const worksBgGlow = document.querySelector('.works-bg-glow');
  const workSection = document.getElementById('work');
  const customCursor = document.getElementById('custom-cursor');
  const titleImg = document.querySelector('.my-works-header');
  
  let isLightboxOpen = false;
  let activeIndex = 0;
  
  const cardsElements = [];
  const totalOriginalCards = works.length;
  // Duplicate EXACTLY once = 42 cards
  const fullArray = [...works, ...works]; 
  
  fullArray.forEach((work, i) => {
    const realIndex = i % totalOriginalCards;
    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.dataset.index = realIndex;
    card.tabIndex = 0;
    
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    
    const border = document.createElement('div');
    border.className = 'card-border';
    
    // Flipped gradient mask reflection
    const reflection = document.createElement('div');
    reflection.className = 'card-reflection';
    const refImg = document.createElement('img');
    const thumbSrc = work.p === 'yt' ? `https://i.ytimg.com/vi/${work.id}/hqdefault.jpg` : `assets/thumbs/${work.id}.webp`;
    refImg.alt = "";
    refImg.loading = "lazy";
    refImg.decoding = "async";
    refImg.src = thumbSrc;
    reflection.appendChild(refImg);
    
    const img = document.createElement('img');
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = thumbSrc;
    
    const fallbackHTML = `<div class="ig-fallback"><svg viewBox="0 0 24 24"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.555.556.9 1.11 1.152 1.772.248.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.556.555-1.11.9-1.772 1.152-.637.248-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.152-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg><span>Work ${String(realIndex + 1).padStart(2, '0')}</span></div>`;
    img.onerror = () => { img.outerHTML = fallbackHTML; refImg.outerHTML = fallbackHTML; };
    
    // Play button
    const playBtn = document.createElement('div');
    playBtn.className = 'play-overlay';
    playBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#FF5A36"/></svg>`;
    
    const chip = document.createElement('div');
    chip.className = 'card-chip';
    chip.textContent = work.p === 'yt' ? 'YouTube Shorts' : 'Instagram';
    
    const titleBar = document.createElement('div');
    titleBar.className = 'card-title-bar';
    titleBar.innerHTML = `<span class="card-title">Work ${String(realIndex + 1).padStart(2, '0')}</span>
      <div class="sound-wave"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>`;
      
    const sheen = document.createElement('div');
    sheen.className = 'card-sheen';
    
    const darkOverlay = document.createElement('div');
    darkOverlay.className = 'card-overlay-dark';
    
    inner.appendChild(border);
    inner.appendChild(img);
    inner.appendChild(darkOverlay);
    inner.appendChild(sheen);
    inner.appendChild(playBtn);
    inner.appendChild(chip);
    inner.appendChild(titleBar);
    
    card.appendChild(inner);
    card.appendChild(reflection);
    
    // Desktop hover tilt (delegated to CSS logic or fast inline)
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const tiltX = (y / rect.height - 0.5) * -8;
      const tiltY = (x / rect.width - 0.5) * 8;
      inner.style.transform = `scale(1.08) translateY(-10px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      sheen.style.transform = `translateX(${x}px) translateY(${y}px)`;
      if (customCursor) {
        customCursor.style.opacity = '1';
        customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    });
    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
      sheen.style.transform = '';
      if (customCursor) {
        customCursor.style.opacity = '0';
        customCursor.style.transform = 'translate(-50%, -50%) scale(0)';
      }
    });
    
    cardsElements.push(card);
    trackInner.appendChild(card);
  });
  
  // Custom cursor follow
  if (customCursor) {
    window.addEventListener('mousemove', e => {
      customCursor.style.left = e.clientX + 'px';
      customCursor.style.top = e.clientY + 'px';
    });
  }
  
  // --- CAROUSEL LOGIC ---
  const isMobile = window.innerWidth < 768;
  const cardWidth = isMobile ? window.innerWidth * 0.6 : 320;
  const cardSpacing = cardWidth + (isMobile ? 24 : 60);
  const singleTrackWidth = totalOriginalCards * cardSpacing;
  
  // Start at exactly index 0 centered
  let currentOffset = (window.innerWidth / 2) - (cardWidth / 2); 
  let targetOffset = currentOffset;
  
  let isHovered = false;
  let isSectionVisible = false;
  let scrollVelocitySkew = 0;
  
  // Delegate Drag/Click logic
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let isPointerDown = false;
  let pointerDownTime = 0;
  const carouselContainer = document.getElementById('carousel-container');
  
  carouselContainer.addEventListener('pointerdown', e => {
    isPointerDown = true;
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    pointerDownTime = Date.now();
    carouselContainer.style.cursor = 'grabbing';
  });
  window.addEventListener('pointermove', e => {
    if (!isPointerDown) return;
    const diffX = e.clientX - startX;
    const diffY = e.clientY - startY;
    if (!isDragging && (Math.abs(diffX) > 6 || Math.abs(diffY) > 6)) {
      isDragging = true;
      carouselContainer.setPointerCapture(e.pointerId);
    }
    if (isDragging) {
      targetOffset += diffX * 1.5;
      startX = e.clientX;
      startY = e.clientY;
    }
  });
  const handlePointerUp = e => {
    isPointerDown = false;
    carouselContainer.style.cursor = '';
    if (!isDragging) {
      // It's a click
      const card = e.target.closest('.carousel-card');
      if (card) {
        openLightbox(parseInt(card.dataset.index));
      }
    }
    isDragging = false;
  };
  window.addEventListener('pointerup', handlePointerUp);
  carouselContainer.addEventListener('pointercancel', handlePointerUp);
  
  carouselContainer.addEventListener('mouseenter', () => isHovered = true);
  carouselContainer.addEventListener('mouseleave', () => isHovered = false);
  
  function updateCarousel() {
    if (!isSectionVisible || document.hidden) {
      requestAnimationFrame(updateCarousel);
      return;
    }
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!isHovered && !isDragging && !isLightboxOpen && !prefersReducedMotion) {
      targetOffset -= 0.8; // smooth drift
    }
    
    // Scroll velocity skew
    scrollVelocitySkew *= 0.9;
    targetOffset -= scrollVelocitySkew * 0.5;
    
    currentOffset += (targetOffset - currentOffset) * 0.1;
    
    // Infinite looping wrap for exactly ONE duplicate
    if (currentOffset <= -singleTrackWidth) {
      currentOffset += singleTrackWidth;
      targetOffset += singleTrackWidth;
    } else if (currentOffset > 0) {
      currentOffset -= singleTrackWidth;
      targetOffset -= singleTrackWidth;
    }
    
    trackInner.style.transform = `translate3d(${currentOffset}px, 0, 0)`;
    
    let closestIndex = 0;
    let closestCardNode = null;
    let minDiff = Infinity;
    const viewportCenter = window.innerWidth / 2;
    
    cardsElements.forEach((card, i) => {
      const cardLeft = i * cardSpacing;
      const absoluteCenter = currentOffset + cardLeft + (cardWidth / 2);
      const distFromCenter = absoluteCenter - viewportCenter;
      
      // Culling logic: if card is way outside viewport, hide it.
      if (Math.abs(distFromCenter) > window.innerWidth) {
        card.style.visibility = 'hidden';
        return;
      }
      card.style.visibility = 'visible';
      
      const normalizedDist = distFromCenter / viewportCenter;
      
      if (Math.abs(distFromCenter) < minDiff) {
        minDiff = Math.abs(distFromCenter);
        closestIndex = parseInt(card.dataset.index);
        closestCardNode = card;
      }
      
      // 3D Curve Math relative to individual card
      const maxRotate = isMobile ? 18 : 38;
      const rotateY = Math.max(-maxRotate, Math.min(maxRotate, normalizedDist * 40)); 
      // Add scroll skew
      const finalRotateY = rotateY + Math.max(-6, Math.min(6, scrollVelocitySkew));
      
      const scale = 1 - Math.min(Math.abs(normalizedDist) * 0.18, 0.18);
      const translateZ = -Math.abs(normalizedDist) * 200;
      
      const opacity = 1 - Math.min(Math.abs(normalizedDist) * 0.5, 0.8);
      
      card.style.left = `${cardLeft}px`;
      card.style.transform = `translate3d(0, 0, ${translateZ}px) rotateY(${finalRotateY}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = Math.round(100 - Math.abs(normalizedDist) * 100);
      
      if (isHovered && !card.matches(':hover')) {
        card.style.opacity = '0.55';
      }
    });

    cardsElements.forEach(card => {
      if (card === closestCardNode) {
        if (!card.classList.contains('active-card')) card.classList.add('active-card');
      } else {
        if (card.classList.contains('active-card')) card.classList.remove('active-card');
      }
    });
    
    counterEl.textContent = `${String(closestIndex + 1).padStart(2, '0')} / ${totalOriginalCards}`;
    
    // Change ambient glow based on hovered card or center
    const activeColor = works[closestIndex].p === 'yt' ? 'rgba(255, 0, 0, 0.05)' : 'rgba(255, 90, 54, 0.05)';
    worksBgGlow.style.setProperty('--glow-color', activeColor);
    
    // Update progress line
    const progressEl = document.querySelector('.carousel-progress-line-fill');
    if (progressEl) {
      const pct = (closestIndex / (totalOriginalCards - 1)) * 100;
      progressEl.style.width = `${pct}%`;
    }
    
    requestAnimationFrame(updateCarousel);
  }
  requestAnimationFrame(updateCarousel);
  
  // Section entrance observer
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      isSectionVisible = e.isIntersecting;
      if (e.isIntersecting && !workSection.classList.contains('in-view')) {
        workSection.classList.add('in-view');
        titleImg.classList.add('revealed');
        cardsElements.forEach((c, i) => {
          c.style.animation = `cardEnter 0.6s ease-out ${i * 0.05}s forwards`;
        });
      }
    });
  }, { threshold: 0.1 });
  observer.observe(workSection);
  
  // Scroll velocity
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    scrollVelocitySkew = delta * 0.2;
    lastScrollY = window.scrollY;
  }, {passive: true});
  
  // --- LIGHTBOX LOGIC ---
  function openLightbox(index) {
    activeIndex = index;
    const work = works[activeIndex];
    
    isLightboxOpen = true;
    lightbox.classList.remove('hidden');
    
    const iframe = document.createElement('iframe');
    iframe.allowFullscreen = true;
    iframe.allow = "autoplay; fullscreen";
    
    const tapHint = document.getElementById('lightbox-tap-hint');
    
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
    lightboxContainer.innerHTML = '';
  }
  
  function changeLightbox(dir) {
    if (!isLightboxOpen) return;
    activeIndex = (activeIndex + dir + totalOriginalCards) % totalOriginalCards;
    openLightbox(activeIndex);
  }
  
  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => changeLightbox(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => changeLightbox(1));
  
  fullscreenBtn.addEventListener('click', () => {
    const iframe = lightboxContainer.querySelector('iframe');
    if (iframe && iframe.requestFullscreen) iframe.requestFullscreen();
  });
  
  document.addEventListener('keydown', e => {
    if (!isLightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightbox(-1);
    if (e.key === 'ArrowRight') changeLightbox(1);
  });
  
});
