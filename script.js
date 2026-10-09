(() => {
  // Each entry points at the image file for that frame. Repeated numbers are
  // duplicate frames from the original export, so they are only downloaded once.
  const FRAME_MAP = [1, 2, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 14, 15, 16, 17, 17, 19, 20, 21, 22, 22, 24, 25, 26, 27, 27, 29, 30, 31, 32, 32, 34, 35, 36, 37, 37, 39, 40, 41, 42, 42, 44, 45, 46, 47, 47, 49, 50, 51, 52, 52, 54, 55, 56, 57, 57, 59, 60, 61, 62, 62, 64, 65, 66, 67, 67, 69, 70, 71, 72, 72, 74, 75, 76, 77, 77, 79, 80, 81, 82, 82, 84, 85, 86, 87, 87, 89, 90, 91, 92, 92, 94, 95, 96, 97, 97, 99, 100, 101, 102, 102, 104, 105, 106, 107, 107, 109, 110, 111, 112, 112, 114, 115, 116, 117, 117, 119, 120, 121, 122, 122, 124, 125, 126, 127, 127, 129, 130, 131, 132, 132, 134, 135, 136, 137, 137, 139, 140, 141, 142, 142, 144, 145, 146, 147, 147, 149, 150, 151, 152, 152, 154, 155, 156, 157, 157, 159, 160, 161, 162, 162, 164, 165, 166, 167, 167, 169, 170, 171, 172, 172, 174, 175, 176, 177, 177, 179, 180, 181, 182, 182, 184, 185, 186, 187, 187, 189, 190, 191, 192, 192, 194, 195, 196, 197, 197, 199, 200, 201, 202, 202, 204, 205, 206, 207, 207, 209, 210, 211, 212, 212, 214, 215, 216, 217, 217, 219, 220, 221, 222, 222, 224, 225, 226, 227, 227, 229, 230, 231, 232, 232, 234, 235, 236, 237, 237, 239, 240, 241, 242, 242, 244, 245, 246, 247, 247, 249, 250, 251, 252, 252, 254, 255, 256, 257, 257, 259, 260, 261, 262, 262, 264, 265, 266, 267, 267, 269, 270, 271, 272, 272, 274, 275, 276, 277, 277, 279, 280, 281, 282, 282, 284, 285, 286, 287, 287, 289, 290, 291, 292, 292, 294, 295, 296, 297, 297, 299, 300];
  const TOTAL_FRAMES = FRAME_MAP.length;
  const UNIQUE_FILES = [...new Set(FRAME_MAP)];
  const SMOOTHING = 12; // Damping frequency for silky smooth momentum
  const MAX_PARALLEL = 6;

  const canvas = document.getElementById('sequence-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const progressBar = document.getElementById('progress-bar');
  const loaderContainer = document.getElementById('loader-container');

  // Portrait screens (phones) get a lighter, pre-cropped frame set.
  const isPortrait = () => window.innerWidth / window.innerHeight < 1;
  let frameSet = isPortrait() ? 'mobile' : 'desktop';

  let images = new Map(); // file number -> Image
  let doneCount = 0;
  let loaderHidden = false;
  let targetFrame = 0;
  let currentFrame = 0;
  let lastRenderedFrame = -1;
  let lastTime = performance.now();
  let loadToken = 0;

  const pad = (n) => String(n).padStart(3, '0');
  const fileUrl = (file) => `frames/${frameSet}/${pad(file)}.webp`;

  function hideLoader() {
    if (loaderHidden || !loaderContainer) return;
    loaderHidden = true;
    loaderContainer.classList.add('hidden');
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    render(Math.round(currentFrame), true);
  }

  function getLoadedImage(index) {
    index = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    const exact = images.get(FRAME_MAP[index]);
    if (exact && exact.isLoaded) return exact;
    // Nearest frame that has arrived so far
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = images.get(FRAME_MAP[index - offset]);
      if (prev && prev.isLoaded) return prev;
      const next = images.get(FRAME_MAP[index + offset]);
      if (next && next.isLoaded) return next;
    }
    return null;
  }

  function render(frameIndex, force = false) {
    if (!force && frameIndex === lastRenderedFrame) return;
    const img = getLoadedImage(frameIndex);
    if (!img) return;

    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;

    // object-fit: cover, centred
    const scale = Math.max(cw / iw, ch / ih);
    const rw = iw * scale, rh = ih * scale;
    ctx.drawImage(img, (cw - rw) / 2, (ch - rh) / 2, rw, rh);
    lastRenderedFrame = frameIndex;
  }

  function updateScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // The Work section adds extra scroll length for its timeline; leave it out so
    // the hero/About timing stays the same.
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight - (window.__worksPinExtra || 0);
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
    targetFrame = progress * (TOTAL_FRAMES - 1);
    window.__scrollProgress = progress; // read by ui.js
  }

  function animate(now) {
    let dt = (now - lastTime) / 1000;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.1);
    lastTime = now;

    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) currentFrame += diff * (1 - Math.exp(-SMOOTHING * dt));
    else currentFrame = targetFrame;

    render(Math.round(currentFrame) || 0);
    requestAnimationFrame(animate);
  }

  // Load order: first frame, then a coarse pass across the whole animation so
  // scrubbing works early, then progressively fill in the gaps.
  function buildQueue() {
    const order = [];
    const seen = new Set();
    for (const step of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < UNIQUE_FILES.length; i += step) {
        const f = UNIQUE_FILES[i];
        if (!seen.has(f)) { seen.add(f); order.push(f); }
      }
    }
    return order;
  }

  function startLoading() {
    const token = ++loadToken;
    images = new Map();
    doneCount = 0;
    lastRenderedFrame = -1;
    const queue = buildQueue();
    const total = queue.length;
    let active = 0;

    const finishOne = () => {
      doneCount++;
      if (progressBar) progressBar.style.width = `${(doneCount / total) * 100}%`;
      if (doneCount === total) setTimeout(hideLoader, 200);
    };

    const pump = () => {
      if (token !== loadToken) return;
      while (active < MAX_PARALLEL && queue.length) {
        const file = queue.shift();
        const img = new Image();
        img.decoding = 'async';
        img.isLoaded = false;
        images.set(file, img);
        active++;
        img.onload = () => {
          if (token !== loadToken) return;
          img.isLoaded = true;
          active--;
          finishOne();
          if (file === UNIQUE_FILES[0]) {
            render(Math.round(currentFrame), true);
            hideLoader(); // first frame is on screen: start the intro
          } else if (lastRenderedFrame === -1) {
            render(Math.round(currentFrame), true);
          }
          pump();
        };
        img.onerror = () => {
          if (token !== loadToken) return;
          active--;
          finishOne();
          pump();
        };
        img.src = fileUrl(file);
      }
    };
    pump();
  }

  window.addEventListener('resize', () => {
    const wanted = isPortrait() ? 'mobile' : 'desktop';
    if (wanted !== frameSet) {
      frameSet = wanted;
      startLoading();
    }
    resizeCanvas();
    updateScroll();
  }, { passive: true });

  window.addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) lastTime = performance.now();
  });

  // Never leave the page waiting on the animation: reveal the intro anyway.
  setTimeout(hideLoader, 4000);

  resizeCanvas();
  updateScroll();
  currentFrame = targetFrame;
  startLoading();
  requestAnimationFrame(animate);
})();
