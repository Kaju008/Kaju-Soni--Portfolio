(() => {
  // Elements
  const header = document.getElementById('main-header');
  const heroText = document.querySelector('.hero-content');
  const scrollCue = document.getElementById('scroll-cue');
  const canvasDim = document.getElementById('canvas-dim');
  const heroScrim = document.getElementById('hero-scrim');
  const aboutPanel = document.getElementById('about-panel');
  const aboutImageWrapper = document.getElementById('about-image-wrapper');
  const aboutImage = document.getElementById('about-image');
  const aboutTextCol = document.getElementById('about-text-col');
  const lightSweep = document.getElementById('light-sweep');
  const loaderContainer = document.getElementById('loader-container');
  const hero = document.getElementById('hero');

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // Interpolation helpers
  function lerp(start, end, t) { return start * (1 - t) + end * t; }
  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
  function mapRange(val, inMin, inMax, outMin, outMax) {
    const t = clamp((val - inMin) / (inMax - inMin), 0, 1);
    return lerp(outMin, outMax, t);
  }

  // --- Loader & Initial Intro ---
  let isReady = false;
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('hidden')) {
        setTimeout(() => {
          header.classList.add('visible');
          hero.classList.add('hero-revealed');
          
          setTimeout(() => {
            aboutImageWrapper.classList.add('levitate');
            aboutImage.classList.add('levitate-tilt');
            document.getElementById('contact-shadow').classList.add('levitate');
          }, 1000);
          
          isReady = true;
          observer.disconnect();
        }, 300);
      }
    });
  });
  if (loaderContainer) {
    observer.observe(loaderContainer, { attributes: true, attributeFilter: ['class'] });
  }

  // --- Role Rotator ---
  const rotatorWords = document.querySelectorAll('.role-word');
  let currentWordIdx = 0;
  function rotateRoles() {
    if (!rotatorWords.length) return;
    const current = rotatorWords[currentWordIdx];
    const nextIdx = (currentWordIdx + 1) % rotatorWords.length;
    const next = rotatorWords[nextIdx];
    
    current.classList.remove('active');
    current.classList.add('exiting');
    next.classList.remove('exiting');
    next.classList.add('active');
    
    setTimeout(() => { current.classList.remove('exiting'); }, 450);
    currentWordIdx = nextIdx;
  }
  setInterval(rotateRoles, 2850);

  // --- Nav Links (Smooth Scroll) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // For about, scroll to top. For others, scroll to element
        if (targetId === '#about') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // --- Stats Counter ---
  let statsAnimated = false;
  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;
    
    document.querySelectorAll('.counter').forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const duration = 1400; 
      let startTime = null;
      
      function updateCounter(now) {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        const current = target * ease;
        counter.textContent = Math.floor(current);
        
        if (t < 1) requestAnimationFrame(updateCounter);
        else counter.textContent = target;
      }
      requestAnimationFrame(updateCounter);
    });
  }

  // --- Pointer Parallax ---
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  let pointerX = 0.5, pointerY = 0.5;
  let targetPointerX = 0.5, targetPointerY = 0.5;
  
  if (!isReducedMotion && hasFinePointer) {
    document.addEventListener('mousemove', (e) => {
      targetPointerX = e.clientX / window.innerWidth;
      targetPointerY = e.clientY / window.innerHeight;
    });
  }

  // --- Copy to Clipboard ---
  const copyBtns = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toast');
  let toastTimeout;
  
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(text).then(() => {
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
      });
    });
  });

  // --- Main Animation Loop ---
  let lastProgress = -1;
  let textRevealed = false;
  
  function uiLoop() {
    const progress = window.__scrollProgress || 0;
    const pointerChanged = Math.abs(pointerX - targetPointerX) > 0.001 || Math.abs(pointerY - targetPointerY) > 0.001;
    
    if (Math.abs(progress - lastProgress) > 0.0001 || pointerChanged) {
      lastProgress = progress;
      
      pointerX += (targetPointerX - pointerX) * 0.08;
      pointerY += (targetPointerY - pointerY) * 0.08;
      
      // 1. Header Background
      if (progress > 0.02) header.classList.add('has-bg');
      else header.classList.remove('has-bg');

      // 2. Hero Exit (0.00 to 0.10)
      const heroExitT = clamp(mapRange(progress, 0.00, 0.10, 0, 1), 0, 1);
      const heroY = mapRange(heroExitT, 0, 1, 0, -60);
      const heroOpacity = 1 - heroExitT;
      
      heroText.style.transform = `translateY(calc(-52% + ${heroY}px))`;
      heroText.style.opacity = heroOpacity;
      if (scrollCue) scrollCue.style.opacity = 1 - mapRange(progress, 0.0, 0.05, 0, 1);
      heroScrim.style.opacity = heroOpacity;

      // 3. Canvas Dimming & Panel Rise (0.10 to 0.25)
      const dimOpacity = mapRange(progress, 0.10, 0.25, 0, 0.5);
      canvasDim.style.opacity = dimOpacity;

      const panelRiseT = clamp(mapRange(progress, 0.10, 0.25, 0, 1), 0, 1);
      const panelY = mapRange(panelRiseT, 0, 1, window.innerHeight, 0);
      const panelScale = mapRange(panelRiseT, 0, 1, 0.92, 1);
      const panelOpacity = mapRange(panelRiseT, 0, 1, 0, 1);
      
      aboutPanel.style.transform = `translateY(${panelY}px) scale(${panelScale})`;
      aboutPanel.style.opacity = panelOpacity;

      let imgY = mapRange(panelRiseT, 0, 1, 160, 0);
      let imgRot = mapRange(panelRiseT, 0, 1, -3, 0);
      
      // Pointer Parallax
      if (!isReducedMotion && hasFinePointer && panelRiseT === 1) {
        const pX = (pointerX - 0.5) * 2;
        const pY = (pointerY - 0.5) * 2;
        imgY -= pY * 10;
        imgRot += pX * 3;
        const glows = document.querySelector('.panel-glows');
        if (glows) glows.style.transform = `translate(${pX * -10}px, ${pY * -20}px)`;
      }
      aboutImageWrapper.style.transform = `translateY(${imgY}px) rotate(${imgRot}deg)`;
      lightSweep.style.transform = `translateX(${mapRange(progress, 0.10, 0.35, 0, 100)}%)`;

      // 4. About Text Entrance
      if (progress >= 0.20 && !textRevealed) {
        textRevealed = true;
        aboutTextCol.classList.add('revealed');
        animateStats();
      } else if (progress < 0.18 && textRevealed) {
        textRevealed = false;
        aboutTextCol.classList.remove('revealed');
        statsAnimated = false;
      }
    }
    requestAnimationFrame(uiLoop);
  }

  requestAnimationFrame(uiLoop);
})();

// Active Nav Highlight
document.addEventListener('DOMContentLoaded', () => {
  const sections = ['about', 'journey', 'work', 'contact'];
  function updateActiveNav() {
    let currentId = '';
    const windowH = window.innerHeight;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i] === 'about') continue;
      const el = document.getElementById(sections[i]);
      if (el && el.getBoundingClientRect().top < windowH * 0.35) {
        currentId = sections[i];
        break;
      }
    }
    if (!currentId && window.__scrollProgress > 0.4) currentId = 'about';
    
    document.querySelectorAll('.nav-link, .nav-item, .mobile-nav-link').forEach(link => {
      link.style.color = '';
      if (currentId && link.getAttribute('href') === `#${currentId}`) {
        link.style.color = '#FF5A36';
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, {passive: true});
});
