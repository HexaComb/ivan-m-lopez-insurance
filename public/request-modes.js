/** Display-only mode choice. Disabled fields are never read, enabled, or submitted. */
export function selectRequestMode(root, mode) {
  const panels = [...root.querySelectorAll('[data-request-panel]')];
  if (!panels.some(panel => panel.dataset.requestPanel === mode)) return false;
  panels.forEach(panel => { panel.hidden = panel.dataset.requestPanel !== mode; });
  root.querySelectorAll('[data-request-mode]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.requestMode === mode));
  });
  return true;
}
export function initializeRequestModes(root) {
  root.querySelectorAll('[data-request-mode]').forEach(button => {
    button.addEventListener('click', () => selectRequestMode(root, button.dataset.requestMode));
  });
  selectRequestMode(root, 'medicare');
  root.querySelector('[data-request-controls]').hidden = false;
}
