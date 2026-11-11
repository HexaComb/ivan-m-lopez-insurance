import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {page} from '../scripts/build.mjs';
for(const lang of ['en','es']){
 test(`${lang}: original podcast has a wide native player directly before FAQs`,()=>{
  const html=page(lang);
  const section=html.match(/<section class="wrap section podcast-section"[\s\S]*?<\/section>/)[0];
  assert.ok(section.includes('Ivan Talks Medicare on the MarinHealth Podcast!'));
  assert.ok(section.includes('<audio class="podcast-player" controls preload="none"'));
  assert.ok(section.includes('<source src="/assets/ivan-marinhealth-podcast.mp3" type="audio/mpeg">'));
  assert.ok(section.includes('href="/assets/ivan-marinhealth-podcast.mp3"'));
  assert.doesNotMatch(section,/autoplay|<iframe|<script/);
  assert.ok(html.indexOf('id="contact"')<html.indexOf('id="podcast"'));
  assert.match(html, /<\/audio>[\s\S]*?<\/section>\s*<section class="wrap section split" id="questions">/);
  assert.ok(section.includes(lang==='en'?'This is a recorded interview.':'Esta es una entrevista grabada.'));
 });
}
test('supplied audio is unchanged and media playback remains first-party only',async()=>{
 const path=new URL('../public/assets/ivan-marinhealth-podcast.mp3',import.meta.url);
 assert.equal((await stat(path)).size,9679615);
 assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'),'6f9e7d0ad4d57a1863588829b1e1ceb670a8263d1dd4610b1ec938c8f9274c7d');
 const headers=await readFile(new URL('../public/_headers',import.meta.url),'utf8');
 assert.ok(headers.includes("media-src 'self'"));
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 assert.ok(css.includes('.podcast-player{display:block;width:100%;min-width:0;'));
});
