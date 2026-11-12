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
 for(const label of ['Request a Free Consultation','Call or Text Us at (925) 684-6712','What Can We Help With?','Medicare Advantage','Medicare Supplement with Prescription Drug Plan','Employer & Group Health Plans','Our team is here to help','Give us a call','I’m a Licensed Independent Insurance Broker'])assert.ok(html.includes(label),label);
 assert.doesNotMatch(copy.en.lead,/Ivan M\. Lopez helps/);
});
test('restrained revision preserves the white hero and original portrait treatment',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 const revision=css.slice(css.indexOf('/* Restrained client revision:'));
 assert.ok(revision.includes('--brand-green:#8dbb4a'));
 assert.ok(revision.includes('.site-header-shell{border-bottom:3px solid var(--brand-green)}'));
 assert.ok(revision.includes('.senior-hero{background:#fff;border:0;box-shadow:none}'));
 assert.ok(revision.includes('.senior-hero .hero-copy{background:transparent;padding:0;border:0;box-shadow:none}'));
 assert.ok(revision.includes('.advisor-portrait img{box-shadow:none}'));
 assert.ok(revision.includes('.senior-hero h1{background:var(--brand-green);color:var(--ink);border:2px solid var(--ink);'));
 assert.ok(revision.includes('padding:clamp(16px,2.2vw,28px)'));
 assert.ok(revision.includes('@media print{.senior-hero h1{background:white;color:black;border-color:black}}'));
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

test('brand green connects section bands, selected choices and primary actions without recoloring the page',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 const brand=css.slice(css.indexOf('/* A coherent logo-green path'));
 assert.ok(brand.includes('.trust{background:var(--brand-green);color:var(--ink);border-block:0;padding-block:28px}'));
 assert.ok(brand.includes('.hero-actions>.button:not(.secondary),.contact .button:not(.secondary){background:var(--brand-green);color:var(--ink);border-color:var(--ink)}'));
 assert.ok(brand.includes('.coverage-focus-controls button[aria-pressed=true],.request-mode-controls button[aria-pressed=true]{background:var(--brand-green);color:var(--ink);border-color:var(--ink);font-weight:700}'));
 assert.ok(brand.includes('.contact{border-top:4px solid var(--brand-green)}'));
 assert.ok(brand.includes('.podcast-section h2{border-left:4px solid var(--brand-green);padding-left:22px}'));
 assert.doesNotMatch(brand,/body\s*\{|:root|linear-gradient|font-size|position:|animation:/);
 assert.ok(css.includes('body,.soft,.coverage-moment,.guide-index,.notes-sheet{background:#fff}'));
});
