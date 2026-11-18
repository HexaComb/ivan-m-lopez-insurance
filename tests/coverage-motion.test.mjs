import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { coverageDetails, page } from '../scripts/build.mjs';
import { selectCoverageDetail, initializeCoverageMotion } from '../public/coverage-motion.js';

function fixture(reduced=false,hasObserver=true){
 const animations=[];
 const node=(dataset={})=>({dataset,hidden:false,attrs:{},events:{},classes:new Set(),setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];},addEventListener(k,fn){this.events[k]=fn;},hasAttribute(k){return k==='data-care-art'&&this.isArt;},animate(frames,options){const a={frames,options,cancelled:false,cancel(){this.cancelled=true;this.oncancel?.();}};animations.push(a);return a;}});
 function withClasses(n){n.classList={add:c=>n.classes.add(c),remove:c=>n.classes.delete(c),toggle:(c,v)=>v?n.classes.add(c):n.classes.delete(c)};return n;}
 const ids=['doctors','prescriptions','costs'];
 const panels=ids.map(id=>node({detail:id}));
 const buttons=ids.map(id=>node({focus:id}));
 const arts=ids.map(id=>withClasses(node({art:id})));
 const controls=node();controls.hidden=true;
 const root=withClasses(node());
 root.querySelectorAll=s=>({'[data-detail]':panels,'[data-focus]':buttons,'[data-art]':arts}[s]);
 root.querySelector=s=>s==='[data-focus-controls]'?controls:s==='[data-focus]'?buttons[0]:panels.find(p=>s===`[data-detail="${p.dataset.detail}"]`);
 const reveal=node();
 const canvas=withClasses(node());canvas.isArt=true;
 const doc=node();doc.hidden=false;
 doc.querySelectorAll=s=>s==='[data-coverage-moment]'?[root]:s==='[data-care-art]'?[canvas]:[reveal,canvas];
 const motion=node();motion.matches=reduced;
 let observer;
 const env={matchMedia:()=>motion};
 if(hasObserver)env.IntersectionObserver=class{constructor(callback){this.callback=callback;this.observed=new Set();this.disconnected=false;observer=this;}observe(n){this.observed.add(n);}unobserve(n){this.observed.delete(n);}disconnect(){this.disconnected=true;this.observed.clear();}};
 const controller=initializeCoverageMotion(doc,env);
 return {root,panels,buttons,arts,controls,reveal,canvas,doc,motion,animations,observer,controller};
}
test('bilingual coverage story has visible static content and a decorative SVG',()=>{
 assert.deepEqual(coverageDetails.en.topics.map(t=>t.id),coverageDetails.es.topics.map(t=>t.id));
 for(const lang of ['en','es']){
  const html=page(lang);
  assert.equal((html.match(/data-detail=/g)||[]).length,3);
  assert.doesNotMatch(html, /data-detail="[^"]+"[^>]*hidden/);
  assert.ok(html.includes('data-focus-controls hidden'));
  assert.ok(html.includes('class="coverage-illustration" viewBox="0 0 700 390" fill="none" aria-hidden="true"'));
  assert.ok(html.includes(coverageDetails[lang].note));
  for(const topic of coverageDetails[lang].topics)assert.ok(html.includes(topic.text));
 }
});
test('topic controls switch panels/art and ignore repeated or invalid requests',()=>{
 const f=fixture();
 assert.equal(f.controls.hidden,false);
 assert.deepEqual(f.panels.filter(p=>!p.hidden).map(p=>p.dataset.detail),['doctors']);
 f.buttons[1].events.click();
 assert.deepEqual(f.panels.filter(p=>!p.hidden).map(p=>p.dataset.detail),['prescriptions']);
 assert.equal(f.buttons[1].attrs['aria-pressed'],'true');
 assert.ok(f.arts[1].classes.has('is-selected'));
 assert.equal(f.animations.length,1);
 f.buttons[1].events.click();
 assert.equal(f.animations.length,1);
 assert.equal(selectCoverageDetail(f.root,'unknown'),false);
 for(const i of [2,0,2,1])f.buttons[i].events.click();
 assert.equal(f.panels.filter(p=>!p.hidden).length,1);
 assert.equal(f.buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
});
test('reduced motion leaves the illustration static but controls fully functional',()=>{
 const f=fixture(true);
 assert.equal(f.observer,undefined);
 f.buttons[2].events.click();
 assert.equal(f.panels[2].hidden,false);
 assert.equal(f.animations.length,0);
 assert.equal(f.canvas.classes.has('is-drawn'),false);
});
test('entrances run once and motion preference changes cancel active animation',()=>{
 const f=fixture();
 f.observer.callback([{target:f.reveal,isIntersecting:true},{target:f.canvas,isIntersecting:true}]);
 assert.equal(f.animations.length,1);
 assert.equal(f.animations[0].options.duration,650);
 assert.equal(f.observer.observed.size,0);
 assert.ok(f.canvas.classes.has('is-drawn'));
 f.motion.matches=true;f.motion.events.change();
 assert.ok(f.animations[0].cancelled);
 assert.ok(f.observer.disconnected);
 assert.equal(f.canvas.classes.has('is-drawn'),false);
 f.buttons[1].events.click();
 assert.equal(f.animations.length,1);
});
test('backgrounding cancels motion; missing observer leaves usable controls',()=>{
 const f=fixture();
 f.buttons[1].events.click();
 f.doc.hidden=true;f.doc.events.visibilitychange();
 assert.ok(f.animations[0].cancelled);
 assert.ok(f.observer.disconnected);
 const basic=fixture(false,false);
 basic.buttons[2].events.click();
 assert.equal(basic.panels[2].hidden,false);
});
test('motion styles are optional, bounded, and never conceal unenhanced content',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 const added=css.slice(css.indexOf('/* A small illustrated coverage story.'));
 assert.ok(added.includes('@media(prefers-reduced-motion:no-preference)'));
 assert.doesNotMatch(added,/infinite|opacity:0[;} ]|visibility:hidden|gradient\(/);
 assert.ok(added.includes('coverage-route-draw 1.8s'));
 assert.ok(added.includes('@media print{.coverage-moment{display:none!important}}'));
});
