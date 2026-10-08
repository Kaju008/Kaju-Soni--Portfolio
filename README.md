# Kaju Soni - Creative Portfolio

A premium, highly interactive, and scroll-driven portfolio for Kaju Soni, showcasing end-to-end video production, visual storytelling, and motion graphics. 

## Features
- **Cinematic Scroll Sequence**: A high-performance, 60fps frame-sequence scrubber serving as the interactive living background for the Hero and About sections.
- **Glassmorphic UI**: Beautiful, dark-themed frosted glass panels with dynamic animated glowing borders.
- **My Journey Timeline**: A scroll-linked animated timeline detailing an 8-year creative career across 6 companies.
- **My Works 3D Carousel**: A mathematically precise, infinitely looping 3D carousel with scroll-velocity skew physics, custom cursor interactions, and active-card dynamic lighting.
- **Ambient Lighting**: An extremely subtle, multi-layered background featuring drifting orbs, an octagonal grid, and traveling canvas pulses that strictly pause when off-screen.
- **Zero-Dependency Architecture**: Built purely with vanilla HTML, CSS, and JavaScript. No bulky frameworks, extremely lightweight, and heavily optimized with `requestAnimationFrame` physics loops and `IntersectionObserver` memory culling.

## Local Setup
This project runs purely in the browser but must be served over a local web server to avoid CORS constraints when loading images onto the canvas.

1. Clone the repository
2. Run a local web server in the root directory. For example, using Python:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000/` in your browser.

## Technologies Used
- **Vanilla HTML5 & CSS3** (Custom properties, clamp scaling, conic-gradients, XOR masking, prefers-reduced-motion)
- **Vanilla JavaScript (ES6)** (requestAnimationFrame 3D physics loops, IntersectionObservers, hardware-accelerated transforms)
