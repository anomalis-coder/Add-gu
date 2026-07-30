import './style.css';
import 'aos/dist/aos.css';
import AOS from 'aos';
import gsap from 'gsap';
import { initBackground } from './src/background.js';
import { initEffects } from './src/effects.js';
import { runIntro } from './src/intro.js';
import { initHero } from './src/hero.js';
import { initModals } from './src/modals.js';
import { initMusic } from './src/music.js';
import { initCursor } from './src/cursor.js';
import { initEnding } from './src/ending.js';

// Smooth scrolling
document.documentElement.style.scrollBehavior = 'smooth';

// AOS scroll animations
AOS.init({
  duration: 900,
  easing: 'ease-out-cubic',
  once: true,
  offset: 80,
});

initBackground();
initEffects();
initCursor();
initModals();
initMusic();

// Ripple click effect on all interactive elements
document.addEventListener('click', (e) => {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = e.clientX + 'px';
  ripple.style.top = e.clientY + 'px';
  ripple.style.width = '30px';
  ripple.style.height = '30px';
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});

// GSAP: floating particles on hero badge + buttons entrance stagger
runIntro().then(() => {
  initHero();

  // GSAP floating animation on hero badge
  gsap.to('.hero-badge', {
    y: -6,
    duration: 2.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  // GSAP subtle float on buttons
  gsap.utils.toArray('.love-btn').forEach((btn, i) => {
    gsap.to(btn, {
      y: -5,
      duration: 2 + i * 0.3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.15,
    });
  });

  // GSAP hover scale on buttons
  gsap.utils.toArray('.love-btn').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: 1.04, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  });

  initEnding();
});
