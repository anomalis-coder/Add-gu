// Interactive buttons with unique popup animations
const modalContents = {
  heart: {
    emoji: '❤️',
    title: 'My Heart Says...',
    body: 'Every beat of my heart whispers your name. You are the rhythm that keeps me alive, the pulse that gives meaning to every moment I breathe.',
    code: `while (true) {\n  heart.beat(for: "you");\n  love++; // infinite\n}`,
    anim: 'anim-heart',
  },
  surprise: {
    emoji: '🎉',
    title: 'Surprise!',
    body: 'Ta-da! The surprise is... there is no gift greater than having you in my life. But here is a little burst of joy, just because you deserve it.',
    code: `const surprise = () => {\n  return "You" + "are" + "my" + "joy";\n};`,
    anim: 'anim-surprise',
  },
  secret: {
    emoji: '🔐',
    title: 'Secret Message',
    body: 'psst... I was never good at keeping secrets from you. Here it is: I fell for you the moment our paths crossed, and I never stopped falling.',
    code: `decrypt("aGFwcHkgYmlydGhkYXk=")\n// -> "i love you, always"`,
    anim: 'anim-secret',
  },
  letter: {
    emoji: '💌',
    title: 'A Love Letter',
    body: 'My dearest,\n\nIf I could write the way I feel about you, the ink would run out before the words ever did. You are my morning light and my midnight star.\n\nForever yours,\n— Me',
    code: `Dear you,\n  I love you in\n  every language\n  including C++.\nSincerely, me.`,
    anim: 'anim-letter',
  },
};

export function initModals() {
  const overlay = document.getElementById('modal-overlay');
  const card = document.getElementById('modal-card');
  const content = document.getElementById('modal-content');
  const closeBtn = document.getElementById('modal-close');

  document.querySelectorAll('.love-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--my', `${e.clientY - rect.top}px`);
    });
    btn.addEventListener('click', () => open(btn.dataset.modal));
  });

  function open(key) {
    const m = modalContents[key];
    if (!m) return;
    card.className = 'modal-card ' + m.anim;
    content.innerHTML = `
      <span class="modal-emoji">${m.emoji}</span>
      <h3 class="modal-title">${m.title}</h3>
      <p class="modal-body">${m.body}</p>
      <pre class="modal-code">${m.code}</pre>
    `;
    overlay.classList.add('active');
  }

  function close() {
    overlay.classList.remove('active');
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
