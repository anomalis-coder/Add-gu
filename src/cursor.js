// Custom glowing cursor: dot + ring that follow mouse
export function initCursor() {
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(follow);
  }
  follow();

  // Grow ring on hover over interactive elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.love-btn, .music-btn, .modal-close, .volume-slider, .music-progress')) {
      ring.style.width = '52px';
      ring.style.height = '52px';
      dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.love-btn, .music-btn, .modal-close, .volume-slider, .music-progress')) {
      ring.style.width = '36px';
      ring.style.height = '36px';
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });
}
