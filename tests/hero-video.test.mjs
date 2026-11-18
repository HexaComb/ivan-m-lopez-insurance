import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { canAutoplayHero, initializeHeroVideo } from '../public/hero-video.js';
import { page } from '../scripts/build.mjs';

function fixture({mobile=true,reducedMotion=false,saveData=false,reject=false}={}) {
 const target=(extra={})=>({events:{},addEventListener(name,fn){this.events[name]=fn;},...extra});
 const button=target({dataset:{play:'Play video',pause:'Pause video'},attributes:{},hidden:true,disabled:false,setAttribute(k,v){this.attributes[k]=v;}});
 const status={dataset:{unavailable:'Video unavailable. Still image shown.'},textContent:''};
 const classes=new Set();
 const video=target({dataset:{src:'/assets/forest-path.mp4'},src:'',paused:true,muted:false,getAttribute(name){return this[name];},pause(){this.paused=true;this.events.pause?.();},async play(){if(reject)throw Error('NotAllowedError');this.paused=false;this.events.playing?.();}});
 const motion=target({matches:reducedMotion});
 const small=target({matches:mobile});
 const connection=target({saveData});
 const doc=target({hidden:false});
 let timeout, observer;
 const env={navigator:{connection},document:doc,matchMedia:q=>q.includes('reduced')?motion:small,setTimeout(fn){timeout=fn;return 1;},clearTimeout(){timeout=undefined;},IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}}};
 const root={querySelector:s=>({'video':video,'[data-video-toggle]':button,'[data-video-status]':status}[s]),classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}};
 const controller=initializeHeroVideo(root,env);
 return {button,status,classes,video,motion,small,connection,doc,controller,expire:()=>timeout?.(),leave:()=>observer([{isIntersecting:false}])};
}
test('autoplay requires desktop, normal motion/data, and visible document',()=>{
 const good={mobile:false,reducedMotion:false,saveData:false,hidden:false};
 assert.equal(canAutoplayHero(good),true);
 for(const key of Object.keys(good))assert.equal(canAutoplayHero({...good,[key]:true}),false);
});
test('mobile still loads no video until play, and repeated pause/play is reversible',async()=>{
 const f=fixture();
 assert.equal(f.video.src,'');
 assert.equal(f.button.hidden,false);
 await f.controller.play();
 assert.equal(f.video.src,'/assets/forest-path.mp4');
 assert.equal(f.video.muted,true);
 assert.equal(f.button.textContent,'Pause video');
 assert.ok(f.classes.has('video-playing'));
 f.button.events.click();
 assert.equal(f.video.paused,true);
 assert.equal(f.button.textContent,'Play video');
 await f.controller.play();
 assert.equal(f.video.paused,false);
 f.leave();
 assert.equal(f.video.paused,true);
});
test('reduced motion and save data avoid initial media requests',()=>{
 for(const option of [{mobile:false,reducedMotion:true},{mobile:false,saveData:true}]){
  const f=fixture(option);
  assert.equal(f.video.src,'');
 }
});
test('preference changes and backgrounding pause without automatic resume',async()=>{
 const f=fixture({mobile:false});
 await Promise.resolve();
 assert.equal(f.video.paused,false);
 f.motion.matches=true;f.motion.events.change();
 assert.equal(f.video.paused,true);
 await f.controller.play();
 f.doc.hidden=true;f.doc.events.visibilitychange();
 assert.equal(f.video.paused,true);
 f.doc.hidden=false;f.doc.events.visibilitychange();
 assert.equal(f.video.paused,true);
 await f.controller.play();
 f.connection.saveData=true;f.connection.events.change();
 assert.equal(f.video.paused,true);
});
test('autoplay rejection allows manual retry; media error restores still with status',async()=>{
 const denied=fixture({mobile:false,reject:true});
 await Promise.resolve();await Promise.resolve();
 assert.equal(denied.button.disabled,false);
 assert.equal(denied.button.textContent,'Play video');
 const failed=fixture();
 await failed.controller.play();
 failed.video.events.error();
 assert.equal(failed.button.disabled,true);
 assert.equal(failed.classes.has('video-playing'),false);
 assert.equal(failed.status.textContent,'Video unavailable. Still image shown.');
});
test('current client preview contains no video, tree poster, or playback loader',async()=>{
 for(const lang of ['en','es']){
  const html=page(lang);
  assert.doesNotMatch(html, /<video|forest-path|data-hero-video|data-video-toggle/);
  assert.ok(html.includes('class="advisor-portrait"'));
 }
 const script=await readFile(new URL('../public/guide.js',import.meta.url),'utf8');
 assert.doesNotMatch(script, /hero-video|initializeHeroVideo/);
});
