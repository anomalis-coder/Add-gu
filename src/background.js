// Background canvas: stars, glowing particles, matrix code rain (pink/white/purple)
export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  const stars = [];
  const particles = [];
  const matrixCols = [];

  const matrixChars = '01♥♡✿❀❤∞{}[]<>/\\=+;:'.split('');
  const colors = ['#ff3d8b', '#ffffff', '#b061ff', '#ff6fa5'];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initLayers();
  }

  function initLayers() {
    stars.length = 0;
    const starCount = Math.floor((w * h) / 6000);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.02 + 0.005,
        depth: Math.random() * 0.8 + 0.2,
      });
    }

    particles.length = 0;
    const pCount = Math.floor((w * h) / 18000);
    for (let i = 0; i < pCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    matrixCols.length = 0;
    const colWidth = 18;
    const numCols = Math.floor(w / colWidth);
    for (let i = 0; i < numCols; i++) {
      matrixCols.push({
        x: i * colWidth + colWidth / 2,
        y: Math.random() * h,
        speed: Math.random() * 1.5 + 0.5,
        chars: [],
        len: Math.floor(Math.random() * 15) + 8,
      });
    }
  }

  let mx = w / 2, my = h / 2;
  let parallaxX = 0, parallaxY = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
  });

  let t = 0;
  function draw() {
    t += 0.016;
    parallaxX += ((mx - w / 2) * 0.01 - parallaxX) * 0.05;
    parallaxY += ((my - h / 2) * 0.01 - parallaxY) * 0.05;

    ctx.fillStyle = 'rgba(5, 2, 8, 0.25)';
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (const s of stars) {
      s.tw += s.tws;
      const a = (Math.sin(s.tw) * 0.5 + 0.5) * 0.8 + 0.2;
      const px = s.x - parallaxX * s.depth;
      const py = s.y - parallaxY * s.depth;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 245, 251, ${a * s.depth})`;
      ctx.fill();
    }

    // Matrix code rain
    ctx.font = '13px "Fira Code", monospace';
    ctx.textAlign = 'center';
    for (const col of matrixCols) {
      col.y += col.speed;
      if (col.y - col.len * 18 > h) {
        col.y = -col.len * 18;
        col.speed = Math.random() * 1.5 + 0.5;
      }
      for (let j = 0; j < col.len; j++) {
        const cy = col.y - j * 18;
        if (cy < 0 || cy > h) continue;
        const ch = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const fade = 1 - j / col.len;
        const c = colors[j % colors.length];
        ctx.globalAlpha = fade * 0.35;
        ctx.fillStyle = j === 0 ? '#ffffff' : c;
        ctx.fillText(ch, col.x - parallaxX * 0.3, cy);
      }
    }
    ctx.globalAlpha = 1;

    // Glowing particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.03;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const pulse = Math.sin(p.pulse) * 0.3 + 0.7;
      const px = p.x - parallaxX * 0.5;
      const py = p.y - parallaxY * 0.5;
      const r = Math.max(0.1, p.r * pulse);
      const grad = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = p.alpha * pulse;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}
