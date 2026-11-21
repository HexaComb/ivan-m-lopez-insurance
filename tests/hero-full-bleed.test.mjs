import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { page } from '../scripts/build.mjs';

test('both language heroes use a full-width surface around centered content', () => {
  for (const lang of ['en', 'es']) {
    const html = page(lang);
    assert.match(html, /<section class="hero-band" aria-labelledby="hero-title"><div class="wrap hero senior-hero">/);
    assert.match(html, /<\/figcaption><\/figure><\/div><\/section>/);
    assert.ok(!html.includes('<video'));
    assert.match(html, /<fieldset disabled/);
  }
});
test('hero surface removes the inset card without viewport-width overflow hacks', async () => {
  const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
  const rules = css.slice(css.indexOf('/* Full-bleed hero surface;'));
  assert.match(rules, /\.hero-band\{width:100%;background:var\(--hero-beige\)\}/);
  assert.match(rules, /border:0;border-radius:0;margin-block:0/);
  assert.ok(!rules.includes('100vw'));
});

for(const lang of ['en','es'])test(`${lang}: hero offers consultation preview plus working call and text links`,()=>{
 const html=page(lang), hero=html.match(/<section class="hero-band"[\s\S]*?<\/section>/)[0];
 assert.match(hero,/<a class="button secondary" href="tel:\+19256846712">/);
 assert.match(hero,/<a class="hero-sms" href="sms:\+19256846712">/);
 assert.match(hero,/<a class="button" href="#request-preview">/);
 assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
});
