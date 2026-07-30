import gsap from 'gsap';

// Ending: when user scrolls to bottom, reveal "Thank You" with sunflower bloom + heart rain
export function initEnding() {
  const section = document.getElementById('ending-section');
  const content = document.getElementById('ending-content');
  const sunflower = document.getElementById('ending-sunflower');
  const canvas = document.getElementById('ending-canvas');
  const ctx = canvas.getContext('2d');
  const mainPage = document.getElementById('main-page');

  let w, h, dpr;
  const hearts = [];
  const petals = [];
  let active = false;
  let rafId = null;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = section.offsetWidth;
    h = section.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function spawnHeart() {
    hearts.push({
      x: Math.random() * w,
      y: h + 20,
      vy: -(Math.random() * 1.2 + 0.5),
      vx: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 16 + 8,
      rot: (Math.random() - 0.5) * 0.5,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      life: 1,
      color: ['#ff3d8b', '#ff6fa5', '#b061ff', '#ffffff', '#ffb347'][Math.floor(Math.random() * 5)],
    });
  }

  function spawnPetal() {
    petals.push({
      x: Math.random() * w,
      y: -20,
      vy: Math.random() * 0.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 10 + 6,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      life: 1,
      sway: Math.random() * Math.PI * 2,
      color: ['#ffb347', '#ffd966', '#ff8c42'][Math.floor(Math.random() * 3)],
    });
  }

  function drawHeart(x, y, size, color, alpha, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 12;
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

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.life * 0.85;
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(0.1, p.size * 0.35), Math.max(0.1, p.size * 0.6), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Heart rain
    if (active && Math.random() < 0.35) spawnHeart();
    for (let i = hearts.length - 1; i >= 0; i--) {
      const ht = hearts[i];
      ht.x += ht.vx;
      ht.y += ht.vy;
      ht.rot += ht.rotSpeed;
      ht.life -= 0.004;
      if (ht.y < -30 || ht.life <= 0) {
        hearts.splice(i, 1);
        continue;
      }
      drawHeart(ht.x, ht.y, ht.size, ht.color, ht.life * 0.85, ht.rot);
    }

    // Falling petals
    if (active && Math.random() < 0.25) spawnPetal();
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.sway += 0.03;
      p.x += p.vx + Math.sin(p.sway) * 0.5;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.life -= 0.003;
      if (p.y > h + 30 || p.life <= 0) {
        petals.splice(i, 1);
        continue;
      }
      drawPetal(p);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    rafId = requestAnimationFrame(draw);
  }
  draw();

  // Reveal on scroll to bottom
  function checkScroll() {
    if (!mainPage) return;
    const scrollBottom = mainPage.scrollTop + mainPage.clientHeight;
    const scrollHeight = mainPage.scrollHeight;
    const nearBottom = scrollBottom >= scrollHeight - 50;

    if (nearBottom && !active) {
      active = true;
      content.classList.add('reveal');
      setTimeout(() => sunflower.classList.add('bloom'), 300);

      // GSAP title letter-by-letter glow pulse
      gsap.fromTo('.ending-title',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.5 }
      );
      gsap.fromTo('.ending-sub',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 1 }
      );

      // Burst of hearts on activation
      for (let i = 0; i < 20; i++) {
        setTimeout(spawnHeart, i * 60);
      }
    }
  }

  mainPage.addEventListener('scroll', checkScroll);
  window.addEventListener('resize', () => {
    resize();
    checkScroll();
  });
}
