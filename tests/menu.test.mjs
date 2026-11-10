import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeMenu } from '../public/menu.js';
import { page } from '../scripts/build.mjs';

function setup({ mobile = true, reduced = false, animate = false, language = 'en' } = {}) {
  const timers = [];
  const animations = [];
  class Node {
    constructor() { this.events = {}; this.attrs = {}; this.children = []; this.dataset = {}; this.hidden = false; this.inert = false; }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    fire(name, event = {}) { for (const fn of this.events[name] || []) fn(event); }
    setAttribute(name, value) { this.attrs[name] = value; }
    getAttribute(name) { return this.attrs[name] ?? null; }
    hasAttribute(name) { return name in this.attrs; }
    removeAttribute(name) { delete this.attrs[name]; }
    contains(node) { return node === this || this.children.some(child => child.contains(node)); }
    focus() { doc.activeElement = this; }
    closest(selector) { return selector === 'a' && this.href ? this : null; }
  }
  const label = new Node();
  const toggle = new Node();
  toggle.hidden = true;
  toggle.dataset = language === 'es' ? { openLabel: 'Menú', closeLabel: 'Cerrar' } : { openLabel: 'Menu', closeLabel: 'Close' };
  toggle.querySelector = () => label;
  const link = new Node(); link.href = '#coverage'; link.attrs.href = link.href;
  const telephone = new Node(); telephone.href = 'tel:+19256846712'; telephone.attrs.href = telephone.href;
  const panel = new Node(); panel.children = [link, telephone]; panel.querySelector = () => link;
  if (animate) panel.animate = (frames, options) => {
    let resolve;
    const animation = { frames, options, canceled: false, finished: new Promise(r => resolve = r), finish() { resolve(); }, cancel() { this.canceled = true; } };
    animations.push(animation);
    return animation;
  };
  const header = new Node(); header.children = [toggle, panel];
  header.querySelector = selector => selector === '[data-menu-toggle]' ? toggle : panel;
  header.classList = { add(value) { header.className = value; } };
  const section = new Node();
  const outside = new Node();
  const media = new Node(); media.matches = mobile;
  const preference = new Node(); preference.matches = reduced;
  const doc = new Node();
  doc.activeElement = outside;
  doc.getElementById = id => id === 'coverage' ? section : null;
  doc.defaultView = { matchMedia: q => q.includes('1024') ? media : preference, setTimeout: fn => timers.push(fn) };
  header.ownerDocument = doc;
  initializeMenu(header);
  return { header, toggle, panel, label, link, telephone, section, outside, media, preference, doc, animations, flush() { timers.splice(0).forEach(fn => fn()); } };
}

for (const language of ['en', 'es']) {
  test(`${language}: menu is progressively enhanced with truthful labels and native links`, () => {
    const html = page(language);
    assert.match(html, /data-menu-toggle[^>]*hidden/);
    assert.doesNotMatch(html, /id="site-menu"[^>]*hidden|role="menu"|aria-modal/);
    const m = setup({ language });
    assert.equal(m.toggle.hidden, false);
    assert.equal(m.panel.hidden, true);
    assert.equal(m.panel.inert, true);
    assert.equal(m.toggle.getAttribute('aria-expanded'), 'false');
    m.toggle.fire('click');
    assert.equal(m.panel.hidden, false);
    assert.equal(m.panel.inert, false);
    assert.equal(m.panel.getAttribute('aria-hidden'), null);
    assert.equal(m.label.textContent, language === 'es' ? 'Cerrar' : 'Close');
    m.toggle.fire('click');
    assert.equal(m.panel.hidden, true);
    assert.equal(m.label.textContent, language === 'es' ? 'Menú' : 'Menu');
  });
}

test('Escape returns focus and outside interaction dismisses without stealing another target’s focus', () => {
  const m = setup(); m.toggle.fire('click'); m.link.focus();
  let prevented = false;
  m.header.fire('keydown', { key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(m.doc.activeElement, m.toggle); assert.equal(m.panel.hidden, true);
  m.toggle.fire('click'); m.outside.focus(); m.doc.fire('pointerdown', { target: m.outside });
  assert.equal(m.panel.hidden, true); assert.equal(m.doc.activeElement, m.outside);
  m.toggle.fire('click'); m.link.focus(); m.doc.fire('pointerdown', { target: m.outside });
  assert.equal(m.doc.activeElement, m.toggle);
});

test('internal links close and focus the destination; telephone links return focus to the toggle', () => {
  const m = setup(); m.toggle.fire('click'); m.link.focus();
  m.panel.fire('click', { target: m.link });
  assert.equal(m.doc.activeElement, m.section); assert.equal(m.panel.hidden, true);
  assert.equal(m.section.getAttribute('tabindex'), '-1'); m.section.fire('blur');
  assert.equal(m.section.getAttribute('tabindex'), null);
  m.toggle.fire('click'); m.telephone.focus(); m.panel.fire('click', { target: m.telephone });
  assert.equal(m.doc.activeElement, m.toggle); assert.equal(m.panel.hidden, true);
});

test('Tab can move within the header and beyond it without a focus trap', () => {
  const m = setup(); m.toggle.fire('click'); m.link.focus(); m.header.fire('focusout'); m.flush();
  assert.equal(m.panel.hidden, false);
  m.outside.focus(); m.header.fire('focusout'); m.flush();
  assert.equal(m.panel.hidden, true); assert.equal(m.doc.activeElement, m.outside);
});

test('crossing the breakpoint restores desktop links and never leaves focus hidden', () => {
  const m = setup(); m.toggle.focus(); m.media.matches = false; m.media.fire('change');
  assert.equal(m.toggle.hidden, true); assert.equal(m.panel.hidden, false); assert.equal(m.panel.inert, false);
  assert.equal(m.panel.getAttribute('aria-hidden'), null); assert.equal(m.doc.activeElement, m.link);
  m.media.matches = true; m.media.fire('change');
  assert.equal(m.toggle.hidden, false); assert.equal(m.panel.hidden, true); assert.equal(m.doc.activeElement, m.toggle);
  const desktop = setup({ mobile: false });
  assert.equal(desktop.panel.hidden, false); assert.equal(desktop.toggle.hidden, true);
});

test('animation completes with a finite duration and keeps closing content inert', async () => {
  const m = setup({ animate: true }); m.toggle.fire('click');
  assert.equal(m.animations[0].options.duration, 240);
  m.animations[0].finish(); await Promise.resolve();
  assert.equal(m.panel.hidden, false); assert.equal(m.animations[0].canceled, true);
  m.toggle.fire('click');
  assert.equal(m.panel.inert, true); assert.equal(m.panel.getAttribute('aria-hidden'), 'true');
  assert.equal(m.animations[1].options.duration, 160);
  m.animations[1].finish(); await Promise.resolve(); assert.equal(m.panel.hidden, true);
});

test('rapid open-close-open cancels stale animation callbacks without hiding the new menu', async () => {
  const m = setup({ animate: true });
  m.toggle.fire('click'); m.toggle.fire('click'); m.toggle.fire('click');
  assert.equal(m.animations[0].canceled, true); assert.equal(m.animations[1].canceled, true);
  m.animations[0].finish(); m.animations[1].finish(); await Promise.resolve();
  assert.equal(m.panel.hidden, false); assert.equal(m.panel.inert, false);
  assert.equal(m.toggle.getAttribute('aria-expanded'), 'true');
  m.animations[2].finish(); await Promise.resolve(); assert.equal(m.panel.hidden, false);
});

test('reduced motion and unavailable animation APIs preserve instant operation', async () => {
  const m = setup({ reduced: true, animate: true }); m.toggle.fire('click'); m.toggle.fire('click');
  assert.equal(m.animations.length, 0); assert.equal(m.panel.hidden, true);
  const live = setup({ animate: true }); live.toggle.fire('click'); live.toggle.fire('click');
  live.preference.matches = true; live.preference.fire('change');
  assert.equal(live.panel.hidden, true); assert.equal(live.animations[1].canceled, true);
  live.animations[1].finish(); await Promise.resolve();
  live.toggle.fire('click'); assert.equal(live.panel.hidden, false); assert.equal(live.animations.length, 2);
  const fallback = setup(); fallback.toggle.fire('click'); assert.equal(fallback.panel.hidden, false);
});

test('resizing during a closing animation cannot hide desktop navigation later', async () => {
  const m = setup({ animate: true }); m.toggle.fire('click'); m.toggle.fire('click');
  m.media.matches = false; m.media.fire('change');
  m.animations[1].finish(); await Promise.resolve();
  assert.equal(m.panel.hidden, false); assert.equal(m.panel.inert, false);
});

test('menu styles support narrow viewports, visible focus, and optional motion without decorative counters', async () => {
  const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
  const js = await readFile(new URL('../public/menu.js', import.meta.url), 'utf8');
  assert.match(css, /max-height:calc\(100dvh - 158px\)/);
  assert.match(css, /overflow-y:auto/);
  assert.match(css, /@media\(max-width:1024px\) and \(prefers-reduced-motion:no-preference\)/);
  assert.match(css, /a:focus-visible,button:focus-visible/);
  assert.doesNotMatch(js, /fetch\(|localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(page('en'), /class="number"|>0[1-9]</);
});
