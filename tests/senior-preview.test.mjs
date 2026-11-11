import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {page,consent,independence,disclosure} from '../scripts/build.mjs';
for(const lang of ['en','es']){
 test(`${lang}: services, costs, walk-ins and static senior hero are clear`,()=>{
  const html=page(lang);
  assert.ok(html.includes(lang==='en'?'Our services are completely free. No obligation.':'Nuestros servicios son completamente gratuitos. Sin compromiso.'));
  assert.ok(html.includes(lang==='en'?'Insurance plans may have premiums and other costs.':'Los planes de seguro pueden tener primas y otros costos.'));
  assert.ok(html.includes(lang==='en'?'Walk-ins are welcome.':'Aceptamos visitas sin cita.'));
  assert.doesNotMatch(html,/<video|forest-path|data-video-toggle/);
  const text=html.replace(/<[^>]*>/g,'');
  assert.ok(text.includes(disclosure));assert.ok(text.includes(independence));
 });
 test(`${lang}: request prototype cannot collect, send, or claim availability`,()=>{
  const html=page(lang);
  const section=html.match(/<section class="wrap request-prototype[\s\S]*?<\/section>/)[0];
  assert.ok(section.includes('<fieldset disabled'));
  assert.equal((section.match(/<input\b/g)||[]).length,12);
  assert.equal((section.match(/<select\b/g)||[]).length,3);
  for(const [fieldset] of section.matchAll(/<fieldset[\s\S]*?<\/fieldset>/g))for(const [tag] of fieldset.matchAll(/<(?:input|select|button)\b[^>]*>/g))assert.match(tag,/\bdisabled\b/);
  assert.doesNotMatch(section,/<form|type="submit"|name=|action=|data-submit/);
  assert.ok(section.includes(consent));
  assert.ok(section.includes(lang==='en'?'No online availability is shown.':'No se muestra disponibilidad en línea.'));
  assert.ok(section.includes('href="tel:+19256846712"'));
 });
}
test('Spanish help link, white background, and minimum text-size declarations',async()=>{
 assert.ok(page('en').includes('>Ayuda En Español</a>'));
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 assert.ok(css.includes('font-size:20px'));
 assert.ok(css.includes('--paper:#fff;--white:#fff'));
 for(const [,size] of css.matchAll(/font-size:(0?\.\d+)rem/g))assert.ok(Number(size)>=.8,`small declaration ${size}rem`);
 const script=await readFile(new URL('../public/guide.js',import.meta.url),'utf8');
 assert.doesNotMatch(script,/hero-video|request-consent|medicare-\$|fetch\(/);
 const headers=await readFile(new URL('../public/_headers',import.meta.url),'utf8');
 assert.ok(headers.includes("form-action 'none'"));
});
