/* ─────────────────────────────────────────────────────
   1. INTERACTIVE DOT CANVAS
   Canvas is position:fixed so it tracks the viewport.
   Mouse coords are clientX/Y (viewport-relative) — correct.
───────────────────────────────────────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('dot-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── Config ── */
  const SPACING    = 28;    // px between dot origins
  const R          = 1.2;   // dot draw radius
  const INFLUENCE  = 110;   // cursor repel radius (px)
  const PUSH       = 7;     // repel force magnitude
  const SPRING     = 0.065; // return-to-origin stiffness
  const DAMP       = 0.78;  // velocity damping per frame

  let W, H, dots = [];
  const mouse = { x: -9999, y: -9999 };

  /* ── Build grid ── */
  function build() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;

    const cols = Math.ceil(W / SPACING) + 1;
    const rows = Math.ceil(H / SPACING) + 1;
    dots = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * SPACING;
        const oy = r * SPACING;
        dots.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
  }

  /* ── Physics ── */
  function step() {
    for (const d of dots) {
      const dx   = d.x - mouse.x;
      const dy   = d.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;

      if (dist < INFLUENCE) {
        /* Quadratic falloff: strongest near cursor */
        const t = 1 - dist / INFLUENCE;
        const f = t * t * PUSH;
        d.vx += (dx / dist) * f;
        d.vy += (dy / dist) * f;
      }

      /* Spring back to origin */
      d.vx += (d.ox - d.x) * SPRING;
      d.vy += (d.oy - d.y) * SPRING;

      /* Friction */
      d.vx *= DAMP;
      d.vy *= DAMP;

      d.x += d.vx;
      d.y += d.vy;
    }
  }

  /* ── Render ── */
  function render() {
    ctx.clearRect(0, 0, W, H);

    for (const d of dots) {
      const dx   = d.x - mouse.x;
      const dy   = d.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      /* Dots near cursor glow slightly brighter */
      const glow  = Math.max(0, 1 - dist / INFLUENCE);
      const alpha = 0.10 + glow * 0.28;

      ctx.beginPath();
      ctx.arc(d.x, d.y, R, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
      ctx.fill();
    }
  }

  /* ── Loop ── */
  function loop() {
    step();
    render();
    requestAnimationFrame(loop);
  }

  /* ── Events ── */
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* Debounced resize */
  let resizeId;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(build, 150);
  });

  build();
  loop();
})();


/* ─────────────────────────────────────────────────────
   2. NAV ACTIVE STATE ON SCROLL
───────────────────────────────────────────────────── */
(function initNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-pill a[data-section]');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.remove('active'));
      const match = document.querySelector(
        `.nav-pill a[data-section="${e.target.id}"]`
      );
      if (match) match.classList.add('active');
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();


/* ─────────────────────────────────────────────────────
   3. SCROLL REVEAL
───────────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08 });

  els.forEach(el => obs.observe(el));
})();