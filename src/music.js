// Music player: generates a romantic ambient melody via Web Audio API (no external file needed).
// No autoplay — user must press Play once. Power toggle, progress bar, volume slider, spinning disc.

export function initMusic() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const titleEl = document.getElementById('music-title');
  const statusEl = document.getElementById('music-status');
  const playBtn = document.getElementById('music-play');
  const playIcon = document.getElementById('play-icon');
  const powerBtn = document.getElementById('music-power');
  const disc = document.getElementById('music-disc');
  const progressFill = document.getElementById('music-progress-fill');
  const progressBar = document.getElementById('music-progress');
  const timeCurrent = document.getElementById('music-time-current');
  const timeTotal = document.getElementById('music-time-total');
  const volumeSlider = document.getElementById('music-volume');
  const player = document.getElementById('music-player');

  let masterGain;
  let isPlaying = false;
  let isPowered = true;
  let schedulerId = null;
  let nextNoteTime = 0;
  let currentStep = 0;
  let startTime = 0;
  let elapsed = 0;
  let duration = 0;

  const trackName = 'Lullaby of Code';
  titleEl.textContent = trackName;

  // Romantic melody in A minor / C major feel
  // Each step: [freq, dur in steps]. 0 = rest.
  const melody = [
    [523.25, 2], [587.33, 1], [659.25, 1], [783.99, 2],
    [659.25, 1], [587.33, 1], [523.25, 2], [0, 1],
    [659.25, 1], [783.99, 1], [880.00, 2], [783.99, 1], [659.25, 1],
    [587.33, 2], [523.25, 2], [0, 1],
    [523.25, 1], [659.25, 1], [783.99, 2], [880.00, 1], [783.99, 1],
    [659.25, 2], [587.33, 2], [0, 2],
  ];
  // Bass line
  const bass = [
    [130.81, 4], [0, 1], [130.81, 1], [196.00, 4],
    [174.61, 4], [130.81, 4], [196.00, 4],
  ];

  const stepDur = 0.32; // seconds per step
  const totalSteps = melody.reduce((s, n) => s + n[1], 0);
  duration = totalSteps * stepDur;
  timeTotal.textContent = formatTime(duration);

  function setupMaster() {
    masterGain = audioCtx.createGain();
    masterGain.gain.value = (volumeSlider.value / 100) * 0.5;
    // Soft reverb-ish via convolver alternative: use a feedback delay for warmth
    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.22;
    const fb = audioCtx.createGain();
    fb.gain.value = 0.28;
    const wet = audioCtx.createGain();
    wet.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
    masterGain.connect(delay);
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(audioCtx.destination);
  }
  setupMaster();

  function playNote(freq, time, dur, type = 'sine', vol = 0.3) {
    if (freq === 0) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    // gentle attack/release envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function scheduleMelody() {
    if (!isPlaying) return;
    const lookAhead = 0.2;
    while (nextNoteTime < audioCtx.currentTime + lookAhead) {
      const note = melody[currentStep % melody.length];
      const [freq, steps] = note;
      playNote(freq, nextNoteTime, steps * stepDur * 0.9, 'sine', 0.28);
      // harmony a third up occasionally
      if (freq > 0 && currentStep % 4 === 0) {
        playNote(freq * 1.25, nextNoteTime, steps * stepDur * 0.8, 'triangle', 0.12);
      }
      nextNoteTime += steps * stepDur;
      currentStep++;
    }
    schedulerId = setTimeout(scheduleMelody, 60);
  }

  function scheduleBass() {
    // simple: schedule bass alongside
    let t = audioCtx.currentTime;
    for (const [freq, steps] of bass) {
      if (freq > 0) playNote(freq, t, steps * stepDur * 0.95, 'sine', 0.18);
      t += steps * stepDur;
    }
  }

  let bassTimer = null;
  function loopBass() {
    if (!isPlaying) return;
    scheduleBass();
    bassTimer = setTimeout(loopBass, bass.reduce((s, n) => s + n[1], 0) * stepDur * 1000);
  }

  function play() {
    if (!isPowered) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    isPlaying = true;
    startTime = audioCtx.currentTime - elapsed;
    nextNoteTime = audioCtx.currentTime + 0.05;
    currentStep = 0;
    playIcon.classList.add('playing');
    disc.classList.add('spinning');
    statusEl.textContent = 'now playing';
    scheduleMelody();
    loopBass();
    updateProgress();
  }

  function pause() {
    isPlaying = false;
    elapsed = audioCtx.currentTime - startTime;
    if (schedulerId) clearTimeout(schedulerId);
    if (bassTimer) clearTimeout(bassTimer);
    playIcon.classList.remove('playing');
    disc.classList.remove('spinning');
    statusEl.textContent = 'paused';
  }

  function updateProgress() {
    if (!isPlaying) return;
    const e = audioCtx.currentTime - startTime;
    elapsed = e;
    const pct = Math.min(100, (e / duration) * 100);
    progressFill.style.width = pct + '%';
    timeCurrent.textContent = formatTime(e);
    if (e >= duration) {
      // loop
      elapsed = 0;
      startTime = audioCtx.currentTime;
      currentStep = 0;
      nextNoteTime = audioCtx.currentTime + 0.05;
    }
    requestAnimationFrame(updateProgress);
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  playBtn.addEventListener('click', () => {
    if (isPlaying) pause();
    else play();
  });

  powerBtn.addEventListener('click', () => {
    isPowered = !isPowered;
    powerBtn.classList.toggle('active', isPowered);
    player.classList.toggle('off', !isPowered);
    if (!isPowered && isPlaying) {
      pause();
      statusEl.textContent = 'powered off';
    } else if (isPowered && !isPlaying) {
      statusEl.textContent = 'press play';
    }
  });
  // start powered on
  powerBtn.classList.add('active');

  volumeSlider.addEventListener('input', () => {
    if (masterGain) {
      masterGain.gain.value = (volumeSlider.value / 100) * 0.5;
    }
  });

  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    elapsed = pct * duration;
    if (isPlaying) startTime = audioCtx.currentTime - elapsed;
    progressFill.style.width = (pct * 100) + '%';
    timeCurrent.textContent = formatTime(elapsed);
  });
}
