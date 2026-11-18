import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {page, copy, coverageDetails, consent, disclosure, independence} from '../scripts/build.mjs';
import {clientFaqs, serviceTopics} from '../scripts/client-feedback.mjs';

for(const lang of ['en','es']) {
 test(`${lang}: client FAQs replace the printable guide`,()=>{
  const html=page(lang);
  assert.equal(clientFaqs[lang].length,11);
  assert.equal((html.match(/<details>/g)||[]).length,11);
  for(const [question,answer] of clientFaqs[lang]) {
   assert.ok(html.includes(`<summary>${question}`));
   assert.ok(html.includes(answer));
  }
  assert.doesNotMatch(html,/data-print|data-notes|data-guide|Print my questions|Imprimir mis preguntas/);
 });
 test(`${lang}: all requested services keep the existing illustrations`,()=>{
  const html=page(lang);
  assert.equal(coverageDetails[lang].topics.length,3);
  for(const topic of serviceTopics[lang]) {
   assert.ok(html.includes(`data-focus="${topic.id}"`));
   assert.ok(html.includes(`data-art="${topic.id}"`));
   assert.ok(html.includes(topic.label));
   assert.ok(html.includes(topic.text));
  }
  assert.ok(html.includes('id="coverage"'));
 });
 test(`${lang}: consultation links to a truthful disabled prototype`,()=>{
  const html=page(lang),hero=html.match(/<section class="wrap hero[\s\S]*?<\/section>/)[0];
  assert.ok(hero.includes('href="#request-preview"'));
  assert.ok(hero.includes('href="tel:+19256846712"'));
  assert.ok(hero.includes('href="sms:+19256846712"'));
  assert.ok(html.includes('<fieldset disabled'));
  assert.doesNotMatch(html,/<form|type="submit"|submit an appointment request through our website/);
  assert.ok(html.includes(consent));
  const text=html.replace(/<[^>]*>/g,'');
  assert.ok(text.includes(disclosure));assert.ok(text.includes(independence));
 });
}
test('requested English labels and first-person introduction are exact',()=>{
 const html=page('en');
 for(const label of ['Request a Free Consultation','Call or Text Us at (925) 684-6712','How Can We Help?','Medicare Advantage','Medicare Supplement with Prescription Drug Plan','Employer & Group Health Plans','Let’s find coverage that works for you.','Give us a call','I’m a Licensed Independent Insurance Broker'])assert.ok(html.includes(label),label);
 assert.doesNotMatch(copy.en.lead,/Ivan M\. Lopez helps/);
});
test('PDF revision removes the green headline box and retains original portrait',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 const revision=css.slice(css.indexOf("/* Yami's annotated PDF:"));
 assert.ok(revision.includes('.senior-hero h1{background:none;border:0;padding:0;border-radius:0}'));
 assert.ok(revision.includes('background:var(--hero-beige)'));
 assert.ok(revision.includes('background:var(--soft-brand);color:var(--ink)'));
 assert.doesNotMatch(revision,/gradient|counter-increment/);
});

// WCAG relative luminance: the sampled logo green needs dark, not white, text.
test('logo-green heading text and border exceed normal-text AA contrast',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 const color=name=>css.match(new RegExp(`--${name}:#([0-9a-f]{6})`))[1];
 const luminance=hex=>hex.match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 assert.equal(color('brand-green'),'8dbb4a');
 const contrast=(luminance(color('brand-green'))+.05)/(luminance(color('ink'))+.05);
 assert.ok(contrast>=4.5,`Heading and border contrast: ${contrast.toFixed(2)}:1`);
});
