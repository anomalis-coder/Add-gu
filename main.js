import './style.css';
import 'aos/dist/aos.css';
import AOS from 'aos';
import gsap from 'gsap';
import { initBackground } from './src/background.js';
import { initEffects } from './src/effects.js';
import { runIntro } from './src/intro.js';
import { initMusic } from './src/music.js';
import { initCursor } from './src/cursor.js';

AOS.init({ duration: 900, easing: 'ease-out-cubic', once: true, offset: 80 });

initBackground();
initEffects();
initCursor();
initMusic();

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

runIntro().then(() => {
  // Heartbeat scale on the final LOVE heart after it appears
  gsap.to('.love-final-heart', {
    scale: 1.06,
    duration: 1.4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
});
