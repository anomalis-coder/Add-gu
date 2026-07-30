// Effects canvas: mouse trail glow, floating hearts, sparkles, lens flare, sunflowers, cursor light
export function initEffects() {
  const canvas = document.getElementById('fx-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  const trail = [];
  const hearts = [];
  const sparkles = [];
  let mx = -100, my = -100;
  let mouseActive = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    mouseActive = true;
    trail.push({ x: mx, y: my, life: 1, r: Math.random() * 4 + 3 });
    if (trail.length > 40) trail.shift();

    if (Math.random() < 0.15) {
      sparkles.push({
        x: mx + (Math.random() - 0.5) * 40,
        y: my + (Math.random() - 0.5) * 40,
        life: 1,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      mx = e.touches[0].clientX;
      my = e.touches[0].clientY;
      mouseActive = true;
      trail.push({ x: mx, y: my, life: 1, r: Math.random() * 4 + 3 });
      if (trail.length > 40) trail.shift();
    }
  }, { passive: true });

  function spawnHeart() {
    hearts.push({
      x: Math.random() * w,
      y: h + 20,
      vy: -(Math.random() * 0.8 + 0.4),
      vx: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 14 + 8,
      rot: (Math.random() - 0.5) * 0.4,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      life: 1,
      color: ['#ff3d8b', '#ff6fa5', '#b061ff', '#ffffff'][Math.floor(Math.random() * 4)],
      type: Math.random() < 0.7 ? 'heart' : 'flower',
    });
  }

  function drawHeart(x, y, size, color, alpha, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size / 16;
    ctx.moveTo(0, 4 * s);
    ctx.bezierCurveTo(-8 * s, -4 * s, -16 * s, 4 * s, 0, 14 * s);
    ctx.bezierCurveTo(16 * s, 4 * s, 8 * s, -4 * s, 0, 4 * s);
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(x, y, size, color, alpha, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 12;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    const petals = 6;
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate((i / petals) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.5, size * 0.3, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#fff5fb';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  let t = 0;
  function draw() {
    t += 0.016;
    ctx.clearRect(0, 0, w, h);

    // Cursor light (lens flare following cursor)
    if (mouseActive) {
      const lr = 180;
      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, lr);
      grad.addColorStop(0, 'rgba(255, 61, 139, 0.18)');
      grad.addColorStop(0.4, 'rgba(176, 97, 255, 0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(mx - lr, my - lr, lr * 2, lr * 2);

      // Lens flare streaks
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = 'rgba(255, 111, 165, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mx - 60, my);
      ctx.lineTo(mx + 60, my);
      ctx.moveTo(mx, my - 60);
      ctx.lineTo(mx, my + 60);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Mouse trail glow
    for (let i = 0; i < trail.length; i++) {
      const tr = trail[i];
      tr.life -= 0.04;
      if (tr.life <= 0) continue;
      const r = Math.max(0.1, tr.r * tr.life);
      const grad = ctx.createRadialGradient(tr.x, tr.y, 0, tr.x, tr.y, r * 3);
      grad.addColorStop(0, `rgba(255, 61, 139, ${tr.life * 0.6})`);
      grad.addColorStop(0.5, `rgba(176, 97, 255, ${tr.life * 0.3})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, r * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    while (trail.length && trail[0].life <= 0) trail.shift();

    // Floating hearts & flowers
    if (Math.random() < 0.04) spawnHeart();
    for (let i = hearts.length - 1; i >= 0; i--) {
      const h2 = hearts[i];
      h2.x += h2.vx;
      h2.y += h2.vy;
      h2.rot += h2.rotSpeed;
      h2.life -= 0.003;
      if (h2.y < -30 || h2.life <= 0) {
        hearts.splice(i, 1);
        continue;
      }
      if (h2.type === 'heart') {
        drawHeart(h2.x, h2.y, h2.size, h2.color, h2.life * 0.8, h2.rot);
      } else {
        drawFlower(h2.x, h2.y, h2.size, h2.color, h2.life * 0.7, h2.rot);
      }
    }

    // Sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life -= 0.02;
      if (sp.life <= 0) {
        sparkles.splice(i, 1);
        continue;
      }
      const r = Math.max(0.1, sp.r * sp.life);
      ctx.globalAlpha = sp.life;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
      ctx.fill();
      // 4-point star
      ctx.strokeStyle = 'rgba(255, 245, 251, ' + sp.life + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(sp.x - r * 3, sp.y);
      ctx.lineTo(sp.x + r * 3, sp.y);
      ctx.moveTo(sp.x, sp.y - r * 3);
      ctx.lineTo(sp.x, sp.y + r * 3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}
