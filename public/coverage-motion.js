/** Brief, progressive-enhancement motion. Content never depends on animation. */
export function selectCoverageDetail(root, id) {
  const panels = [...root.querySelectorAll('[data-detail]')];
  if (!panels.some(panel => panel.dataset.detail === id)) return false;
  panels.forEach(panel => { panel.hidden = panel.dataset.detail !== id; });
  root.querySelectorAll('[data-focus]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.focus === id));
  });
  root.querySelectorAll('[data-art]').forEach(art => {
    art.classList.toggle('is-selected', art.dataset.art === id);
  });
  return true;
}
export function initializeCoverageMotion(doc, env = window) {
  const preference = env.matchMedia('(prefers-reduced-motion: reduce)');
  const activeAnimations = new Set();
  function animateOnce(node, frames, options) {
    if (preference.matches || !node?.animate) return;
    const animation = node.animate(frames, options);
    activeAnimations.add(animation);
    animation.onfinish = animation.oncancel = () => activeAnimations.delete(animation);
  }
  doc.querySelectorAll('[data-coverage-moment]').forEach(root => {
    root.querySelectorAll('[data-focus]').forEach(button => {
      button.addEventListener('click', () => {
        // Repeated clicks on the current topic do not replay motion.
        if (button.getAttribute('aria-pressed') === 'true') return;
        selectCoverageDetail(root, button.dataset.focus);
        animateOnce(root.querySelector(`[data-detail="${button.dataset.focus}"]`),
          [{ opacity: .6, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    });
    root.querySelector('[data-focus-controls]').hidden = false;
    selectCoverageDetail(root, root.querySelector('[data-focus]').dataset.focus);
    root.classList.add('is-enhanced');
  });
  let observer;
  if (!preference.matches && env.IntersectionObserver) {
    observer = new env.IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        if (entry.target.hasAttribute('data-care-art')) {
          entry.target.classList.add('is-drawn');
        } else {
          animateOnce(entry.target,
            [{ opacity: .45, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' });
        }
      }
    }, { threshold: .12 });
    doc.querySelectorAll('[data-reveal], [data-care-art]').forEach(node => observer.observe(node));
  }
  function stopMotion() {
    observer?.disconnect();
    [...activeAnimations].forEach(animation => animation.cancel());
    doc.querySelectorAll('[data-care-art]').forEach(node => node.classList.remove('is-drawn'));
  }
  preference.addEventListener?.('change', () => { if (preference.matches) stopMotion(); });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) stopMotion(); });
  return { stopMotion };
}
