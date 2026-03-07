// ── INTERACTIVE DOT BACKGROUND ──
(function () {
  const canvas = document.getElementById('dot-canvas');
  const ctx    = canvas.getContext('2d');

  const SPACING     = 28;   // gap between dots
  const DOT_RADIUS  = 1.2;  // resting dot size
  const REPEL_DIST  = 90;   // how far the cursor repels
  const REPEL_FORCE = 5.5;  // push strength
  const FRICTION    = 0.82; // velocity damping (higher = snappier return)
  const DOT_COLOR   = 'rgba(255,255,255,0.13)';

  let W, H, cols, rows, dots;
  const mouse = { x: -9999, y: -9999 };

  function buildGrid() {
    W    = canvas.width  = window.innerWidth;
    H    = canvas.height = window.innerHeight;
    cols = Math.ceil(W / SPACING) + 1;
    rows = Math.ceil(H / SPACING) + 1;

    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          ox: c * SPACING,   // origin x
          oy: r * SPACING,   // origin y
          x:  c * SPACING,   // current x
          y:  r * SPACING,   // current y
          vx: 0,
          vy: 0,
        });
      }
    }
  }

  function update() {
    for (const d of dots) {
      const dx = d.x - mouse.x;
      const dy = d.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_DIST && dist > 0) {
        const force = (REPEL_DIST - dist) / REPEL_DIST;
        d.vx += (dx / dist) * force * REPEL_FORCE;
        d.vy += (dy / dist) * force * REPEL_FORCE;
      }

      // Spring back to origin
      d.vx += (d.ox - d.x) * 0.08;
      d.vy += (d.oy - d.y) * 0.08;

      // Friction
      d.vx *= FRICTION;
      d.vy *= FRICTION;

      d.x += d.vx;
      d.y += d.vy;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = DOT_COLOR;

    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Track mouse across the whole page
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', buildGrid);

  buildGrid();
  loop();
})();


// ── ACTIVE NAV HIGHLIGHT ON SCROLL ──
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-pill a[data-section]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.remove('active'));
    const active = document.querySelector(
      `.nav-pill a[data-section="${entry.target.id}"]`
    );
    if (active) active.classList.add('active');
  });
}, { threshold: 0.45 });

sections.forEach(section => navObserver.observe(section));


// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));