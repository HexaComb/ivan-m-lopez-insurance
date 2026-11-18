import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {page,consent,employerConsent,disclosure,independence} from '../scripts/build.mjs';
for(const lang of ['en','es'])test(`${lang}: annotated PDF changes preserve safe functional boundaries`,()=>{
 const html=page(lang),hero=html.match(/<section class="hero-band"[\s\S]*?<\/section>/)[0],contact=html.match(/<section class="wrap" id="contact">[\s\S]*?<\/section>/)[0];
 assert.ok(html.includes(lang==='en'?'Our Services':'Nuestros servicios'));
 assert.ok(html.includes(lang==='en'?'Contact Us':'Contáctenos'));
 assert.ok(hero.includes(lang==='en'?'Licensed independent insurance broker':'Corredor de seguros independiente con licencia'));
 assert.doesNotMatch(hero,/<svg class="arrow"/);
 assert.ok(hero.includes(lang==='en'?'Insurance plan costs are separate.':'Los costos del plan de seguro son aparte.'));
 assert.doesNotMatch(html,/More ways we can help|Más formas de ayudarle|coverage-directory wrap|Online request preview|Request details \(not active\)|Listen to the conversation|question-mark/);
 assert.ok(html.includes('class="request-frame"><div class="request-mode-controls"'));
 assert.ok(html.includes(lang==='en'?'Online requests are not available yet.':'Las solicitudes en línea aún no están disponibles.'));
 assert.equal((html.match(/<fieldset disabled/g)||[]).length,2);
 assert.doesNotMatch(html,/<form|type="submit"/);
 assert.ok(contact.includes('href="#request-preview"'));
 assert.doesNotMatch(contact,/class="button[^\"]*" href="(?:tel|sms):/);
 const positions=['Suite A5',lang==='en'?'Office hours':'Horario de oficina','tel:+19256846712','tel:+19256345702','mailto:ivan@vanbergins.com'].map(x=>contact.indexOf(x));
 assert.ok(positions.every((x,i)=>x>=0&&(!i||x>positions[i-1])));
 const footer=html.slice(html.indexOf('<nav class="footer-links"'));
 const links=['>Linktree<','>Facebook<','>Instagram<','>X<','>LinkedIn<'].map(x=>footer.indexOf(x));
 assert.ok(links.every((x,i)=>x>=0&&(!i||x>links[i-1])));
 assert.doesNotMatch(html,/Write us a Review|href="#review"/);
 const text=html.replace(/<[^>]*>/g,'');
 for(const legal of [consent,employerConsent,disclosure,independence])assert.ok(text.includes(legal));
});
test('soft-green controls retain strong readable contrast and mobile framing',async()=>{
 const css=await readFile(new URL('../public/styles.css',import.meta.url),'utf8');
 const luminance=hex=>hex.match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 for(const fill of ['e2edcf','f5f1e8'])assert.ok((luminance(fill)+.05)/(luminance('173d32')+.05)>7);
 assert.ok(css.includes('.request-mode-controls button{flex-basis:100%'));
 assert.ok(css.includes('.faq-section{max-width:1060px}'));
});

