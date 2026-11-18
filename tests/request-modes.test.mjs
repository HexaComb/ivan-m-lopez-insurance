import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {page, employerConsent, consent} from '../scripts/build.mjs';
import {selectRequestMode, initializeRequestModes} from '../public/request-modes.js';

for(const lang of ['en','es']){
 test(`${lang}: requested section order and exact consent stay intact`,()=>{
  const html=page(lang);
  const markers=['id="hero-title"','id="coverage"','id="about"','id="request-preview"','id="contact"','id="questions"'];
  const offsets=markers.map(m=>html.indexOf(m));
  assert.ok(offsets.every((n,i)=>n>=0&&(i===0||n>offsets[i-1])));
  assert.ok(html.includes(consent));assert.ok(html.includes(employerConsent));
  assert.equal((html.match(/<fieldset disabled/g)||[]).length,2);
  for(const mode of ['medicare','employer']){
   const panel=html.match(new RegExp(`<div id="request-${mode}"[\\s\\S]*?<\\/fieldset>`))[0];
   for(const [control] of panel.matchAll(/<(?:input|select|button)\b[^>]*>/g))assert.match(control,/\bdisabled\b/);
   assert.ok(panel.includes(`id="${mode}-request-consent"`));
  }
  assert.ok(html.includes(lang==='en'?'Company name':'Nombre de la empresa'));
  assert.ok(html.includes(lang==='en'?'Number of employees':'Número de empleados'));
  assert.ok(html.includes('data-request-controls hidden'));
  assert.doesNotMatch(html,/data-request-panel="[^"]+"[^>]*hidden/);
  assert.doesNotMatch(html,/<form|type="submit"/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'unique HTML IDs');
 });
}
test('native mode buttons support repeated switches and never access disabled fields',()=>{
 const panels=['medicare','employer'].map(mode=>({dataset:{requestPanel:mode},hidden:false}));
 const buttons=panels.map(p=>({dataset:{requestMode:p.dataset.requestPanel},attrs:{},events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.events[k]=fn;}}));
 const controls={hidden:true};
 const root={querySelectorAll:s=>s==='[data-request-panel]'?panels:buttons,querySelector:()=>controls};
 initializeRequestModes(root);
 assert.equal(controls.hidden,false);
 assert.equal(panels[1].hidden,true);
 for(const mode of ['employer','employer','medicare','employer','medicare']){
  buttons.find(b=>b.dataset.requestMode===mode).events.click();
  assert.deepEqual(panels.filter(p=>!p.hidden).map(p=>p.dataset.requestPanel),[mode]);
  assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);
 }
 assert.equal(selectRequestMode(root,'invalid'),false);
 assert.equal(panels[0].hidden,false);
});
test('mode script is display-only with no storage, network, or enabling of controls',async()=>{
 const script=await readFile(new URL('../public/request-modes.js',import.meta.url),'utf8');
 assert.doesNotMatch(script,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|\.value|\.disabled|removeAttribute\(['"]disabled/);
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 assert.ok(css.includes('.request-mode-controls button[aria-pressed=true]'));
 assert.ok(css.includes('flex-basis:100%'));
});
