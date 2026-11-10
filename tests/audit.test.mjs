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
 test(`${lang}: navigation has four native links and a language switch in the disclosure panel`,()=>{
  const header=page(lang).match(/<header[\s\S]*?<\/header>/)[0];
  assert.equal((header.match(/class="section-link"/g)||[]).length,4);
  for(const label of copy[lang].nav)assert.ok(header.includes(`>${label}</a>`));
  assert.ok(header.includes('</nav><a class="lang"'));
  assert.ok(header.includes('aria-controls="site-menu"'));
  assert.ok(header.includes('data-menu-toggle'));
  assert.doesNotMatch(header, /id="site-menu"[^>]*hidden/);
  assert.doesNotMatch(header, /role="menu"|role="dialog"/);
 });
}
test('progressive mobile navigation and original logo dimensions are retained',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/\.nav \.section-link\{display:none/);
 assert.ok(css.includes('.menu-ready>.menu-panel'));
 assert.ok(css.includes('.menu-panel .nav{display:grid;grid-template-columns:1fr 1fr;'));
 assert.ok(css.includes('.agency-logo{width:250px;max-width:100%;height:auto;'));
 const png=await readFile(new URL('../public/assets/van-berg-insurance.png',import.meta.url));
 assert.equal(png.readUInt32BE(16),701);
 assert.equal(png.readUInt32BE(20),201);
 assert.ok(css.includes('a:focus-visible'));
});

test('company branding leads while Ivan remains the independent advisor', () => {
 for (const lang of ['en','es']) {
  const html=page(lang);
  const header=html.match(/<header[\s\S]*?<\/header>/)[0];
  assert.ok(header.includes('class="brand company-brand"'));
  assert.ok(header.includes('alt="Van Berg Insurance Services"'));
  assert.ok(html.includes('class="brand advisor-brand">Ivan M. Lopez'));
  assert.ok(html.includes(`<span>${copy[lang].role}</span>`));
  assert.ok(html.includes(independence));
  assert.doesNotMatch(html, /Ivan owns|owner of Van Berg|fundador|propietario|subsidiary|LLC/);
 }
});
