import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { page, copy } from '../scripts/build.mjs';

for (const lang of ['en', 'es']) {
  test(`${lang}: floating language shortcut opens the existing translated page`, () => {
    const html = page(lang);
    const language = lang === 'en' ? 'es' : 'en';
    const floating = html.match(/<a class="floating-language"[^>]*>[^<]*<\/a>/)?.[0];
    assert.ok(floating);
    assert.ok(floating.includes(`href="${copy[lang].langPath}"`));
    assert.ok(floating.includes(`lang="${language}"`));
    assert.ok(floating.includes(`hreflang="${language}"`));
    assert.ok(floating.endsWith(`>${copy[lang].lang}</a>`));
    assert.doesNotMatch(floating, /hidden|onclick|target=|role="button"/);
    const header = html.match(/<header[\s\S]*?<\/header>/)[0];
    assert.ok(header.includes(`>${copy[lang].lang}</a>`));
    assert.ok(html.includes('<div class="site-header-shell"><header'));
    assert.ok(html.includes('</header></div><a class="floating-language"'));
  });
}

test('mobile shortcut is fixed, safe-area aware, readable and kept clear of the open menu', async () => {
  const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
  assert.ok(css.includes('.floating-language{display:none}'));
  assert.ok(css.includes('.floating-language{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px))'));
  assert.ok(css.includes('min-height:54px'));
  assert.ok(css.includes('scroll-padding-bottom:calc(100px + env(safe-area-inset-bottom,0px))'));
  assert.ok(css.includes('padding-bottom:calc(86px + env(safe-area-inset-bottom,0px))'));
  assert.ok(css.includes('.site-header-shell:has(.menu-toggle[aria-expanded=true])+.floating-language{display:none}'));
  assert.ok(css.includes('.floating-language:focus-visible'));
});

test('desktop navbar stays visible while scrolling; print contains neither floating shortcut nor header', async () => {
  const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
  assert.match(css, /@media\(min-width:1025px\)\{\s*\.site-header-shell\{position:sticky;top:0/);
  assert.ok(css.includes('scroll-padding-top:140px'));
  assert.ok(css.includes('@media print{.site-header-shell,.floating-language{display:none!important}body{padding-bottom:0}}'));
});
