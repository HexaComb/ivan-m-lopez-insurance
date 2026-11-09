/** Decorative, first-party stock footage. A still image is the default experience. */
export function canAutoplayHero({ reducedMotion, saveData, mobile, hidden }) {
  return !reducedMotion && !saveData && !mobile && !hidden;
}
export function initializeHeroVideo(root, env = window) {
  const video = root.querySelector('video');
  const button = root.querySelector('[data-video-toggle]');
  const status = root.querySelector('[data-video-status]');
  const motion = env.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = env.matchMedia('(max-width: 600px)');
  const connection = env.navigator.connection;
  let wantsPlayback = false;
  let timer;
  function syncButton() {
    button.textContent = wantsPlayback ? button.dataset.pause : button.dataset.play;
    button.setAttribute('aria-pressed', String(wantsPlayback));
  }
  function pause() {
    wantsPlayback = false;
    env.clearTimeout(timer);
    video.pause();
    syncButton();
  }
  function fail() {
    pause();
    root.classList.remove('video-playing');
    button.disabled = true;
    status.textContent = status.dataset.unavailable;
  }
  async function play() {
    if (button.disabled) return;
    wantsPlayback = true;
    syncButton();
    video.muted = true;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    env.clearTimeout(timer);
    timer = env.setTimeout(fail, 8000);
    try {
      await video.play();
      if (!wantsPlayback) video.pause();
    } catch {
      // Autoplay can be denied by the browser. Keep the still and allow manual play.
      pause();
    }
  }
  button.addEventListener('click', () => wantsPlayback ? pause() : play());
  video.addEventListener('playing', () => {
    if (!wantsPlayback) { video.pause(); return; }
    env.clearTimeout(timer);
    root.classList.add('video-playing');
  });
  video.addEventListener('pause', () => {
    wantsPlayback = false;
    syncButton();
  });
  video.addEventListener('error', fail);
  env.document.addEventListener('visibilitychange', () => { if (env.document.hidden) pause(); });
  motion.addEventListener?.('change', () => { if (motion.matches) pause(); });
  mobile.addEventListener?.('change', () => { if (mobile.matches) pause(); });
  connection?.addEventListener?.('change', () => { if (connection.saveData) pause(); });
  if (env.IntersectionObserver) {
    const observer = new env.IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) pause();
    });
    observer.observe(root);
  }
  button.hidden = false;
  syncButton();
  if (canAutoplayHero({ reducedMotion: motion.matches, saveData: connection?.saveData, mobile: mobile.matches, hidden: env.document.hidden })) play();
  return { play, pause };
}
