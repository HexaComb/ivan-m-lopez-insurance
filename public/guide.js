import { initializeHeroVideo } from './hero-video.js';
/** Page-only state. No network calls, storage, tracking, or personal-data entry. */
export function toggleQuestion(selected, id, text) {
  const next = new Map(selected);
  if (next.has(id)) next.delete(id); else next.set(id, text);
  return next;
}
export function questionCountLabel(count, pluralLabel, lang = 'en') {
  if (count === 1) return lang.startsWith('es') ? '1 pregunta seleccionada' : '1 question selected';
  return `${count} ${pluralLabel}`;
}
export function selectTopic(root, id) {
  const panels = [...root.querySelectorAll('[data-panel]')];
  if (!panels.some(panel => panel.dataset.panel === id)) return false;
  panels.forEach(panel => { panel.hidden = panel.dataset.panel !== id; });
  root.querySelectorAll('[data-topic]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.topic === id));
  });
  return true;
}
export function initializeGuide(root) {
  let selected = new Map();
  const questionButtons = [...root.querySelectorAll('[data-question]')];
  const list = root.querySelector('[data-note-list]');
  const print = root.querySelector('[data-print]');
  const clear = root.querySelector('[data-clear]');
  function renderNotes() {
    list.replaceChildren();
    for (const text of selected.values()) {
      const item = root.ownerDocument.createElement('li');
      item.textContent = text;
      list.append(item);
    }
    questionButtons.forEach(button => {
      const active = selected.has(button.dataset.question);
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('span').textContent = active ? '✓' : '+';
      button.setAttribute('aria-label', `${active ? root.dataset.addedLabel : root.dataset.addLabel}: ${button.parentElement.querySelector('span').textContent}`);
    });
    root.querySelector('[data-empty]').hidden = selected.size > 0;
    root.querySelector('[data-note-count]').textContent = questionCountLabel(selected.size, root.dataset.countLabel, root.ownerDocument.documentElement?.lang);
    print.disabled = clear.disabled = selected.size === 0;
  }
  root.querySelectorAll('[data-topic]').forEach(button => {
    button.addEventListener('click', () => selectTopic(root, button.dataset.topic));
  });
  questionButtons.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      selected = toggleQuestion(selected, button.dataset.question, button.parentElement.querySelector('span').textContent);
      renderNotes();
    });
  });
  clear.addEventListener('click', () => {
    selected = new Map();
    renderNotes();
    // Move focus away from the now-disabled clear control.
    root.querySelector('[data-topic][aria-pressed="true"]').focus();
  });
  print.addEventListener('click', () => root.ownerDocument.defaultView.print());
  root.querySelector('[data-guide-controls]').hidden = false;
  root.querySelector('[data-notes]').hidden = false;
  root.querySelector('.field-guide').classList.add('is-enhanced');
  selectTopic(root, root.querySelector('[data-topic]').dataset.topic);
}
if (typeof document !== 'undefined') document.querySelectorAll('[data-guide]').forEach(initializeGuide);

if (typeof document !== 'undefined') document.querySelectorAll('[data-hero-video]').forEach(root => initializeHeroVideo(root));
