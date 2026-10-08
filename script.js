(() => {
  const TOTAL_FRAMES = 300;
  const FOLDER = 'ezgif-8467b69c688b8a50-jpg';
  const FRAME_PREFIX = 'ezgif-frame-';
  const FRAME_EXT = '.jpg';
  const SMOOTHING = 12; // Damping frequency for silky smooth momentum

  const canvas = document.getElementById('sequence-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const progressBar = document.getElementById('progress-bar');
  const loaderContainer = document.getElementById('loader-container');

  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let targetFrame = 0;
  let currentFrame = 0;
  let lastRenderedFrame = -1;
  let lastTime = performance.now();

  function padZero(num, size = 3) {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
  }

  function getFrameUrl(index) {
    return `${FOLDER}/${FRAME_PREFIX}${padZero(index + 1, 3)}${FRAME_EXT}`;
  }

  function setupCanvasQuality() {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    setupCanvasQuality();

    // Re-draw immediately after resize
    const frameToDraw = Math.round(currentFrame);
    render(frameToDraw, true);
  }

  function getLoadedImage(index) {
    index = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));

    if (images[index] && images[index].isLoaded) {
      return images[index];
    }

    // Bidirectional search for the closest available frame
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = index - offset;
      if (prev >= 0 && images[prev] && images[prev].isLoaded) {
        return images[prev];
      }
      const next = index + offset;
      if (next < TOTAL_FRAMES && images[next] && images[next].isLoaded) {
        return images[next];
      }
    }

    return null;
  }

  function render(frameIndex, force = false) {
    if (!force && frameIndex === lastRenderedFrame) return;

    const img = getLoadedImage(frameIndex);
    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    if (!iw || !ih) return;

    // object-fit: cover algorithm with centered offset
    const imgRatio = iw / ih;
    const canvasRatio = cw / ch;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderWidth = cw;
      renderHeight = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - renderHeight) / 2;
    } else {
      renderHeight = ch;
      renderWidth = ch * imgRatio;
      offsetX = (cw - renderWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, 0, 0, iw, ih, offsetX, offsetY, renderWidth, renderHeight);
    lastRenderedFrame = frameIndex;
  }

  function updateScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
    targetFrame = progress * (TOTAL_FRAMES - 1);
    
    // Expose for UI layer
    window.__scrollProgress = progress;
  }

  function animate(now) {
    const timestamp = now || performance.now();
    let dt = (timestamp - lastTime) / 1000;
    if (isNaN(dt) || dt <= 0) dt = 0.016; // Fallback to ~60fps dt
    dt = Math.min(dt, 0.1); // Cap dt to prevent huge jumps
    lastTime = timestamp;

    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) {
      const factor = 1 - Math.exp(-SMOOTHING * dt);
      currentFrame += diff * factor;
    } else {
      currentFrame = targetFrame;
    }

    const frameToDraw = Math.round(currentFrame) || 0;
    render(frameToDraw);

    requestAnimationFrame(animate);
  }

  function handleImageLoad(img, index) {
    if (img.isLoaded) return;
    img.isLoaded = true;
    loadedCount++;

    if (progressBar) {
      const pct = (loadedCount / TOTAL_FRAMES) * 100;
      progressBar.style.width = `${pct}%`;
    }

    // Render frame 0 immediately upon loading
    if (index === 0 && lastRenderedFrame === -1) {
      render(0);
    }

    if (loadedCount === TOTAL_FRAMES && loaderContainer) {
      setTimeout(() => {
        loaderContainer.classList.add('hidden');
      }, 200);
    }
  }

  function loadImage(i) {
    const img = new Image();
    img.isLoaded = false;
    images[i] = img;

    const onComplete = () => handleImageLoad(img, i);
    const onError = () => {
      img.isLoaded = false;
      loadedCount++;
    };

    img.onload = onComplete;
    img.onerror = onError;
    img.src = getFrameUrl(i);

    if (img.complete && img.naturalWidth !== 0) {
      onComplete();
    }
  }

  function preloadImages() {
    // 1. Prioritize frame 0
    loadImage(0);

    // 2. Load remaining frames sequentially
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      loadImage(i);
    }
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    resizeCanvas();
    updateScroll();
  }, { passive: true });

  window.addEventListener('scroll', updateScroll, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      lastTime = performance.now();
    }
  });

  // Initialization
  resizeCanvas();
  updateScroll();
  currentFrame = targetFrame;
  preloadImages();
  requestAnimationFrame(animate);
})();
