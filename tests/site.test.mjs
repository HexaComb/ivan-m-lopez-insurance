import test from 'node:test';
import assert from 'node:assert/strict';
import {page,copy,disclosure,independence,consent} from '../scripts/build.mjs';
for(const lang of ['en','es']){
 test(`${lang}: metadata, disclosure and main contact are present`,()=>{const html=page(lang);assert.ok(html.includes(`<html lang="${lang}">`));assert.ok(html.includes(independence));assert.ok(html.includes('CA License #0F87613'));assert.ok(html.includes('tel:+19256846712'));assert.ok(html.includes('sms:+19256846712'));assert.ok(html.includes('Suite A5'));assert.ok(html.includes(copy[lang].title));assert.ok(html.includes('noindex,nofollow'));});
 test(`${lang}: every section anchor resolves`,()=>{const html=page(lang);for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(html.includes(`id="${id}"`),id)});
 test(`${lang}: no false collection, external scripts or unapproved claims`,()=>{const html=page(lang);assert.doesNotMatch(html,/<form|best Medicare plan|free Medicare coverage|guaranteed lowest rates/i);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.equal((html.match(/<details>/g)||[]).length,4);});
}
test('approved wording is preserved',()=>{assert.ok(disclosure.startsWith('We do not offer every plan available in your area.'));assert.ok(consent.startsWith('By submitting this form, I consent'));});

test('only a first-party external module is loaded', () => {
 for (const lang of ['en','es']) {
  const html = page(lang);
  assert.equal((html.match(/<script/g)||[]).length, 1);
  assert.ok(html.includes('<script type="module" src="/guide.js"></script>'));
  assert.doesNotMatch(html, /↗|class="number"|>0[1-9]</);
 }
});
test('complete guide stays readable without JavaScript', () => {
 for (const lang of ['en','es']) {
  const html = page(lang);
  assert.equal((html.match(/data-panel=/g)||[]).length,4);
  assert.equal((html.match(/data-question=/g)||[]).length,12);
  assert.doesNotMatch(html, /data-panel="[^"]+"[^>]*hidden/);
  assert.ok(html.includes('data-guide-controls hidden'));
  assert.ok(html.includes('data-notes hidden'));
 }
});
