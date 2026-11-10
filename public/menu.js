/** A disclosure, not a modal: native links, ordinary Tab order, and no scroll lock. */
export function initializeMenu(header) {
  const doc = header.ownerDocument;
  const view = doc.defaultView;
  const toggle = header.querySelector('[data-menu-toggle]');
  const panel = header.querySelector('[data-menu-panel]');
  const label = toggle?.querySelector('[data-menu-label]');
  if (!toggle || !panel || !label || !view?.matchMedia) return;
  const mobile = view.matchMedia('(max-width: 1024px)');
  const reduced = view.matchMedia('(prefers-reduced-motion: reduce)');
  let open = false;
  let animation;
  let revision = 0;

  function stopAnimation() {
    revision += 1;
    animation?.cancel();
    animation = undefined;
  }
  function setExpanded(value) {
    open = value;
    toggle.setAttribute('aria-expanded', String(value));
    label.textContent = value ? toggle.dataset.closeLabel : toggle.dataset.openLabel;
  }
  function transition(expanding) {
    stopAnimation();
    if (reduced.matches || typeof panel.animate !== 'function') {
      panel.hidden = !expanding;
      return;
    }
    const current = revision;
    animation = panel.animate(
      expanding
        ? [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0)' }]
        : [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }],
      { duration: expanding ? 240 : 160, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
    );
    animation.finished.then(() => {
      if (current !== revision) return;
      if (!expanding) panel.hidden = true;
      animation?.cancel();
      animation = undefined;
    }).catch(() => {}); // Cancellation is expected on repeated clicks or preference changes.
  }
  function close(restoreFocus = false) {
    if (!mobile.matches || !open) return;
    if (restoreFocus) toggle.focus({ preventScroll: true });
    setExpanded(false);
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    transition(false);
  }
  function show() {
    if (!mobile.matches || open) return;
    setExpanded(true);
    panel.hidden = false;
    panel.inert = false;
    panel.removeAttribute('aria-hidden');
    transition(true);
  }
  function syncViewport() {
    stopAnimation();
    if (mobile.matches && panel.contains(doc.activeElement)) {
      toggle.hidden = false;
      toggle.focus({ preventScroll: true });
    }
    const focusFirstLink = !mobile.matches && doc.activeElement === toggle;
    setExpanded(false);
    toggle.hidden = !mobile.matches;
    panel.hidden = mobile.matches;
    panel.inert = mobile.matches;
    if (mobile.matches) panel.setAttribute('aria-hidden', 'true');
    else panel.removeAttribute('aria-hidden');
    if (focusFirstLink) panel.querySelector('a')?.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => open ? close() : show());
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      close(true);
    }
  });
  doc.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) close(panel.contains(doc.activeElement));
  });
  header.addEventListener('focusout', () => {
    view.setTimeout(() => {
      if (!header.contains(doc.activeElement)) close();
    }, 0);
  });
  panel.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !mobile.matches) return;
    close();
    const href = link.getAttribute('href');
    const target = href?.startsWith('#') ? doc.getElementById(href.slice(1)) : null;
    if (target) {
      const existing = target.hasAttribute('tabindex');
      if (!existing) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (!existing) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    } else {
      // Telephone links may leave this document open; never leave focus in hidden content.
      toggle.focus({ preventScroll: true });
    }
  });
  mobile.addEventListener('change', syncViewport);
  reduced.addEventListener('change', () => {
    stopAnimation();
    if (mobile.matches) panel.hidden = !open;
  });
  header.classList.add('menu-ready');
  syncViewport();
}
