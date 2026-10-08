document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('#journey, #work');
  if (!sections.length) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  const isMobile = window.innerWidth < 768;
  const CELL_SIZE = isMobile ? 60 : 40;
  const MAX_FPS = isMobile ? 20 : 30;
  const FRAME_MIN_TIME = 1000 / MAX_FPS;
  
  const MAX_PULSES = isMobile ? 2 : 4;

  sections.forEach(section => {
    const canvas = section.querySelector('.ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const isWork = section.id === 'work';
    const baseOpacity = isWork ? 0.25 : 0.35;
    
    let width = 0;
    let height = 0;
    let gridNodes = [];
    let pulses = [];
    let lastTime = 0;
    let lastSpawnTime = 0;
    let isRunning = false;
    let rafId = null;

    function resize() {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      // 0.5 dpr for performance and soft look
      const dpr = 0.5;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      // Build grid nodes
      gridNodes = [];
      const cols = Math.ceil(width / CELL_SIZE) + 1;
      const rows = Math.ceil(height / CELL_SIZE) + 1;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          gridNodes.push({
            x: x * CELL_SIZE,
            y: y * CELL_SIZE,
            col: x, row: y
          });
        }
      }
    }

    function spawnPulse(time) {
      if (pulses.length >= MAX_PULSES) return;
      const spawnDelay = 600 + Math.random() * 800; // Slower spawn
      if (time - lastSpawnTime < spawnDelay) return;
      
      lastSpawnTime = time;
      
      const startNode = gridNodes[Math.floor(Math.random() * gridNodes.length)];
      if (!startNode) return;
      
      const isHorizontal = Math.random() > 0.5;
      const dir = Math.random() > 0.5 ? 1 : -1;
      
      pulses.push({
        x: startNode.x,
        y: startNode.y,
        vx: isHorizontal ? dir * (20 + Math.random() * 20) : 0, // Slower speed
        vy: !isHorizontal ? dir * (20 + Math.random() * 20) : 0,
        length: 40 + Math.random() * 30,
        age: 0,
        lifeSpan: 3 + Math.random() * 3, // seconds
        color: Math.random() > 0.5 ? '#FF5A36' : '#EC4899',
        opacity: baseOpacity * (0.8 + Math.random() * 0.4)
      });
    }

    function render(time) {
      if (!isRunning) return;
      rafId = requestAnimationFrame(render);
      
      const dt = time - lastTime;
      if (dt < FRAME_MIN_TIME) return;
      lastTime = time;
      
      const dtSec = dt / 1000;
      ctx.clearRect(0, 0, width, height);
      
      spawnPulse(time);
      
      ctx.globalCompositeOperation = 'lighter';
      
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.age += dtSec;
        if (p.age >= p.lifeSpan) {
          pulses.splice(i, 1);
          continue;
        }
        
        p.x += p.vx * dtSec;
        p.y += p.vy * dtSec;
        
        // fade in out
        let alpha = p.opacity;
        if (p.age < 0.5) alpha *= (p.age / 0.5);
        if (p.lifeSpan - p.age < 0.5) alpha *= ((p.lifeSpan - p.age) / 0.5);
        
        // trail
        const tailX = p.x - (p.vx * p.length * 0.01);
        const tailY = p.y - (p.vy * p.length * 0.01);
        
        const grad = ctx.createLinearGradient(tailX, tailY, p.x, p.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.8, p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#FF5A36', `rgba(255,90,54,${alpha})`).replace('#EC4899', `rgba(236,72,153,${alpha})`));
        grad.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          if (!isRunning) {
            isRunning = true;
            resize();
            lastTime = performance.now();
            rafId = requestAnimationFrame(render);
          }
        } else {
          isRunning = false;
          if (rafId) cancelAnimationFrame(rafId);
        }
      });
    }, { threshold: 0 });
    
    obs.observe(section);
    window.addEventListener('resize', () => { if (isRunning) resize(); }, {passive: true});
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) isRunning = false;
      else if (section.getBoundingClientRect().top < window.innerHeight && section.getBoundingClientRect().bottom > 0) {
        isRunning = true;
        lastTime = performance.now();
        requestAnimationFrame(render);
      }
    });
  });
  
  // Journey line pulse
  const timelineProgress = document.getElementById('journey-line-progress');
  const journeyPulse = document.getElementById('journey-line-pulse');
  if (timelineProgress && journeyPulse) {
    const dots = document.querySelectorAll('.journey-dot');
    const dotObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'class' && m.target.classList.contains('revealed')) {
          // Trigger line pulse
          journeyPulse.style.animation = 'none';
          journeyPulse.offsetHeight; // reflow
          journeyPulse.style.animation = 'linePulse 1s ease-out';
        }
      });
    });
    document.querySelectorAll('.journey-entry').forEach(e => dotObserver.observe(e, {attributes: true}));
  }
});
