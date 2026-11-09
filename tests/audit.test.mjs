import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { page, copy, disclosure, independence } from '../scripts/build.mjs';

for (const lang of ['en', 'es']) {
 test(`${lang}: supplied contact, licensing, logo, and profiles are retained`, () => {
  const html=page(lang);
  assert.ok(html.includes('src="/assets/van-berg-insurance.png" alt="Van Berg Insurance Services" width="701" height="201"'));
  assert.ok(html.includes('href="https://www.linkedin.com/in/ivan-m-lopez-02979180"'));
  assert.ok(html.includes('href="https://x.com/IvanMLopezins"'));
  assert.ok(html.includes('href="tel:+19256345702"'));
  assert.ok(html.includes(lang==='en'?'Front office':'Recepción'));
  assert.ok(html.indexOf('tel:+19256846712')<html.indexOf('tel:+19256345702'));
  assert.ok(html.includes('sms:+19256846712'));
  const states=lang==='en'?['Arizona','Hawaii','Nevada','Utah','North Carolina','Texas','Washington']:['Arizona','Hawái','Nevada','Utah','Carolina del Norte','Texas','Washington'];
  for(const state of states)assert.ok(html.includes(state));
  const text=html.replace(/<[^>]*>/g,'');
  assert.ok(text.includes(disclosure));
  assert.ok(text.includes(independence));
 });
 test(`${lang}: navigation has four native visible links and an independent language switch`,()=>{
  const header=page(lang).match(/<header[\s\S]*?<\/header>/)[0];
  assert.equal((header.match(/class="section-link"/g)||[]).length,4);
  for(const label of copy[lang].nav)assert.ok(header.includes(`>${label}</a>`));
  assert.ok(header.includes('</nav><a class="lang"'));
  assert.doesNotMatch(header, /hidden|aria-hidden|tabindex="-1"|<button|<details/);
 });
}
test('mobile navigation cannot disappear; logo preserves dimensions and original PNG bytes',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/\.nav \.section-link\{display:none/);
 assert.ok(css.includes('.header>.nav{grid-column:1/-1;grid-row:2'));
 assert.ok(css.includes('.agency-logo{width:250px;max-width:100%;height:auto;'));
 const png=await readFile(new URL('../public/assets/van-berg-insurance.png',import.meta.url));
 assert.equal(png.readUInt32BE(16),701);
 assert.equal(png.readUInt32BE(20),201);
 assert.ok(css.includes('a:focus-visible'));
});
