import test from 'node:test';
import assert from 'node:assert/strict';
import { toggleQuestion, selectTopic, questionCountLabel } from '../public/guide.js';
import { guide, page, disclosure, independence } from '../scripts/build.mjs';
import { readFile } from 'node:fs/promises';

test('question toggles are reversible, unique, ordered, and leave original state unchanged', () => {
 const empty = new Map();
 const first = toggleQuestion(empty, 'medicare-0', 'Enrollment?');
 assert.equal(empty.size, 0);
 const both = toggleQuestion(first, 'change-0', 'Timing?');
 assert.deepEqual([...both.values()], ['Enrollment?', 'Timing?']);
 const removed = toggleQuestion(both, 'medicare-0', 'Enrollment?');
 assert.deepEqual([...removed.keys()], ['change-0']);
 assert.equal(toggleQuestion(removed, 'change-0', 'Timing?').size, 0);
});

test('topic switching keeps exactly one panel visible and supports repeated and invalid selections', () => {
 const panels = ['medicare', 'change', 'individual', 'business'].map(id => ({dataset:{panel:id},hidden:false}));
 const buttons = panels.map(p => ({dataset:{topic:p.dataset.panel},attributes:{},setAttribute(k,v){this.attributes[k]=v;}}));
 const root = {querySelectorAll(selector){return selector==='[data-panel]'?panels:buttons;}};
 for (const id of ['medicare','business','business','change','individual','medicare']) {
  assert.equal(selectTopic(root,id),true);
  assert.deepEqual(panels.filter(p=>!p.hidden).map(p=>p.dataset.panel),[id]);
  assert.equal(buttons.filter(b=>b.attributes['aria-pressed']==='true').length,1);
 }
 assert.equal(selectTopic(root,'unknown'),false);
 assert.deepEqual(panels.filter(p=>!p.hidden).map(p=>p.dataset.panel),['medicare']);
});

test('English and Spanish offer the same complete topics with unique questions', () => {
 assert.deepEqual(guide.en.topics.map(t=>t.id),guide.es.topics.map(t=>t.id));
 for (const lang of ['en','es']) {
  const questions=guide[lang].topics.flatMap(t=>t.questions);
  assert.equal(questions.length,12);
  assert.equal(new Set(questions).size,12);
  assert.ok(guide[lang].topics.every(t=>t.body&&t.label&&t.title));
  const text=page(lang).replace(/<[^>]*>/g,'');
  assert.ok(text.includes(disclosure));
  assert.ok(text.includes(independence));
 }
});

test('no collection, persistent storage, gradients, or decorative counters; CSP permits only local scripts',async()=>{
 const js=await readFile(new URL('../public/guide.js',import.meta.url),'utf8');
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 const headers=await readFile(new URL('../public/_headers',import.meta.url),'utf8');
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|document.cookie|sendBeacon/);
 assert.doesNotMatch(css,/gradient\(|counter-reset|counter-increment|counter\(/);
 assert.ok(css.includes('@media print'));
 assert.ok(css.includes('prefers-reduced-motion:no-preference'));
 assert.ok(headers.includes("script-src 'self'"));
 assert.ok(headers.includes("form-action 'none'"));
});

test('guide initialization, cross-topic notes, clear focus, and print wiring work together', async () => {
 const { initializeGuide } = await import('../public/guide.js');
 const element = (dataset = {}) => ({dataset,hidden:true,disabled:false,attributes:{},events:{},children:[],textContent:'',setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,v){this.events[k]=v;},replaceChildren(){this.children=[];},append(child){this.children.push(child);},focus(){this.focused=true;}});
 const panels = guide.en.topics.map(t=>element({panel:t.id}));
 const topics = guide.en.topics.map(t=>element({topic:t.id}));
 const questions = guide.en.topics.flatMap(t=>t.questions.map((text,index)=>{
  const button=element({question:`${t.id}-${index}`});
  const icon=element();
  button.querySelector=()=>icon;
  button.parentElement={querySelector:()=>({textContent:text})};
  return button;
 }));
 const singles = Object.fromEntries(['[data-note-list]','[data-print]','[data-clear]','[data-empty]','[data-note-count]','[data-guide-controls]','[data-notes]'].map(key=>[key,element()]));
 let printed=0;
 const root={
  dataset:{countLabel:'questions selected',addLabel:'Add',addedLabel:'Added'},
  ownerDocument:{createElement:()=>element(),defaultView:{print(){printed++;}}},
  querySelectorAll(selector){return {'[data-panel]':panels,'[data-topic]':topics,'[data-question]':questions}[selector];},
  querySelector(selector){
   if(selector==='[data-topic]')return topics[0];
   if(selector==='[data-topic][aria-pressed="true"]')return topics.find(t=>t.attributes['aria-pressed']==='true');
   if(selector==='.field-guide')return {classList:{add(){}}};
   return singles[selector];
  }
 };
 initializeGuide(root);
 assert.equal(singles['[data-notes]'].hidden,false);
 assert.equal(panels.filter(p=>!p.hidden).length,1);
 questions[0].events.click();
 assert.equal(singles['[data-note-count]'].textContent,'1 question selected');
 topics[1].events.click();
 questions[3].events.click();
 assert.equal(singles['[data-note-list]'].children.length,2);
 assert.equal(singles['[data-note-count]'].textContent,'2 questions selected');
 assert.equal(singles['[data-print]'].disabled,false);
 assert.equal(questions[0].attributes['aria-pressed'],'true');
 singles['[data-print]'].events.click();
 assert.equal(printed,1);
 questions[0].events.click();
 assert.equal(singles['[data-note-list]'].children.length,1);
 singles['[data-clear]'].events.click();
 assert.equal(singles['[data-note-list]'].children.length,0);
 assert.equal(singles['[data-print]'].disabled,true);
 assert.equal(topics[1].focused,true);
 assert.equal(singles['[data-empty]'].hidden,false);
 assert.ok(questions.every(q=>q.attributes['aria-pressed']==='false'));
});

test('print retains readable disclosures while omitting footer branding', async () => {
 const css = await readFile(new URL('../public/styles.css', import.meta.url), 'utf8');
 const print = css.slice(css.indexOf('@media print'));
 assert.ok(print.includes('.footer-top,.copyright'));
 assert.doesNotMatch(print, /#contact,\.footer,/);
 assert.ok(print.includes('.footer{display:block'));
 assert.ok(print.includes('.disclosures{font-size:12pt;color:black'));
});

test('question count uses singular English and Spanish and preserves plural counts', () => {
 assert.equal(questionCountLabel(1, 'questions selected', 'en'), '1 question selected');
 assert.equal(questionCountLabel(1, 'preguntas seleccionadas', 'es'), '1 pregunta seleccionada');
 assert.equal(questionCountLabel(1, 'preguntas seleccionadas', 'es-MX'), '1 pregunta seleccionada');
 assert.equal(questionCountLabel(0, 'questions selected', 'en'), '0 questions selected');
 assert.equal(questionCountLabel(2, 'preguntas seleccionadas', 'es'), '2 preguntas seleccionadas');
 assert.equal(questionCountLabel(1, 'questions selected'), '1 question selected');
});
