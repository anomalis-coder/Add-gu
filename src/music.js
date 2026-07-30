// Music player: plays "HARRA. - Celah Hati" via the YouTube IFrame API.
// No autoplay — user must press Play once (browser policy). The existing UI
// (play/pause, power, volume, spinning disc, progress bar) is wired to the
// hidden YouTube player so the real song plays through the page.

const YOUTUBE_VIDEO_ID = '-VbTutfRYuM'; // HARRA. - Celah Hati (Official Music Video)

let ytReady = null;
let ytApiLoading = false;

function loadYouTubeAPI() {
  if (ytReady) return ytReady;
  if (!ytApiLoading) {
    ytApiLoading = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
  ytReady = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
  return ytReady;
}

export function initMusic() {
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

  const trackName = 'HARRA. - Celah Hati';
  titleEl.textContent = trackName;

  let ytPlayer = null;
  let isPlaying = false;
  let isPowered = true;
  let ready = false;
  let duration = 0;
  let rafId = null;

  function formatTime(s) {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  function buildPlayer() {
    const host = document.getElementById('yt-host');
    if (!host || ytPlayer) return;
    const inner = document.createElement('div');
    inner.id = 'yt-player';
    host.appendChild(inner);
    ytPlayer = new YT.Player('yt-player', {
      videoId: YOUTUBE_VIDEO_ID,
      width: '1',
      height: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          ready = true;
          duration = ytPlayer.getDuration() || 0;
          timeTotal.textContent = formatTime(duration);
          try {
            ytPlayer.setVolume(parseInt(volumeSlider.value, 10));
          } catch (e) {}
          statusEl.textContent = 'press play';
        },
        onStateChange: (e) => {
          const YTS = YT.PlayerState;
          if (e.data === YTS.PLAYING) {
            isPlaying = true;
            playIcon.classList.add('playing');
            disc.classList.add('spinning');
            statusEl.textContent = 'now playing';
            if (!duration) {
              duration = ytPlayer.getDuration() || 0;
              timeTotal.textContent = formatTime(duration);
            }
            updateProgress();
          } else if (e.data === YTS.PAUSED) {
            isPlaying = false;
            playIcon.classList.remove('playing');
            disc.classList.remove('spinning');
            statusEl.textContent = 'paused';
          } else if (e.data === YTS.ENDED) {
            isPlaying = false;
            playIcon.classList.remove('playing');
            disc.classList.remove('spinning');
            statusEl.textContent = 'replay';
            progressFill.style.width = '100%';
          } else if (e.data === YTS.BUFFERING) {
            statusEl.textContent = 'loading...';
          } else if (e.data === YTS.CUED) {
            statusEl.textContent = 'press play';
          }
        },
      },
    });
  }

  loadYouTubeAPI().then(buildPlayer);

  function updateProgress() {
    if (rafId) cancelAnimationFrame(rafId);
    function tick() {
      if (!ready || !ytPlayer || !isPlaying) return;
      const cur = ytPlayer.getCurrentTime() || 0;
      if (!duration) duration = ytPlayer.getDuration() || 0;
      const pct = duration ? Math.min(100, (cur / duration) * 100) : 0;
      progressFill.style.width = pct + '%';
      timeCurrent.textContent = formatTime(cur);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (!isPowered || !ready || !ytPlayer) {
      statusEl.textContent = !ready ? 'loading...' : 'powered off';
      return;
    }
    ytPlayer.playVideo();
  }

  function pause() {
    if (ytPlayer && ready) ytPlayer.pauseVideo();
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
    }
    if (isPowered && ytPlayer && ready) {
      try {
        ytPlayer.setVolume(parseInt(volumeSlider.value, 10));
        ytPlayer.unMute();
      } catch (e) {}
    } else if (!isPowered && ytPlayer && ready) {
      try {
        ytPlayer.mute();
      } catch (e) {}
    }
  });
  powerBtn.classList.add('active');

  volumeSlider.addEventListener('input', () => {
    if (ytPlayer && ready) {
      try {
        ytPlayer.setVolume(parseInt(volumeSlider.value, 10));
      } catch (e) {}
    }
  });

  progressBar.addEventListener('click', (e) => {
    if (!ytPlayer || !ready || !duration) return;
    const rect = progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * duration;
    ytPlayer.seekTo(t, true);
    progressFill.style.width = pct * 100 + '%';
    timeCurrent.textContent = formatTime(t);
  });
}
