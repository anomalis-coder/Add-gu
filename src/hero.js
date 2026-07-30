import { typewriter, sleep } from './intro.js';

// Hero: neon typewriter title + rotating romantic subtitle
export async function initHero() {
  const titleEl = document.getElementById('hero-title');
  const subtitleEl = document.getElementById('hero-subtitle');

  await typewriter(titleEl, 'Dear, You Are My Everything', 75);

  const subtitles = [
    'In every line of code, I find a reason to love you.',
    'You are the syntax that makes my heart compile.',
    'If love is a loop, I want to run it forever with you.',
    'You are the only variable I never want to reassign.',
    'My heart runs an infinite loop, and it only returns you.',
  ];

  let idx = 0;
  while (true) {
    const text = subtitles[idx];
    subtitleEl.style.opacity = '0';
    await sleep(400);
    subtitleEl.textContent = text;
    subtitleEl.style.opacity = '1';
    await sleep(3500);
    idx = (idx + 1) % subtitles.length;
  }
}
