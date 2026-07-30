// Typewriter helper
export function typewriter(element, text, speed = 70) {
  return new Promise((resolve) => {
    element.textContent = '';
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
        setTimeout(tick, speed + (Math.random() * 30 - 15));
      } else {
        resolve();
      }
    };
    tick();
  });
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Intro sequence: loading -> countdown -> "You Are My Love" -> 7s hold -> LOVE final
export async function runIntro() {
  const loading = document.getElementById('loading-screen');
  const loaderText = loading.querySelector('.loader-text');
  const countdownScreen = document.getElementById('countdown-screen');
  const countdownNum = document.getElementById('countdown-number');
  const loveReveal = document.getElementById('love-reveal');
  const loveText = document.getElementById('love-text');
  const loveFinal = document.getElementById('love-final');

  // Loading typewriter
  await typewriter(loaderText, 'Initializing love protocol...', 45);
  await sleep(600);

  // Fade out loading
  loading.classList.add('fade-out');
  await sleep(800);
  loading.classList.add('hidden');

  // Countdown 3..2..1
  countdownScreen.classList.remove('hidden');
  for (let n = 3; n >= 1; n--) {
    countdownNum.textContent = n;
    countdownNum.classList.remove('glitch');
    void countdownNum.offsetWidth; // reflow
    countdownNum.classList.add('glitch');
    await sleep(900);
  }

  // "You Are My Love"
  countdownScreen.classList.add('hidden');
  loveReveal.classList.remove('hidden');
  await typewriter(loveText, 'You Are My Love', 90);
  await sleep(7000);

  // Transition to final LOVE screen
  loveReveal.style.transition = 'opacity 0.8s ease, filter 0.8s ease';
  loveReveal.style.opacity = '0';
  loveReveal.style.filter = 'blur(20px)';
  await sleep(500);
  loveReveal.classList.add('hidden');

  // Reveal the final LOVE screen
  loveFinal.classList.remove('hidden');
  await sleep(80);
  loveFinal.classList.add('show');
}
