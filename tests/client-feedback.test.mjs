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
 assert.doesNotMatch(revision,/background:var\(--brand-green\)/);
});
