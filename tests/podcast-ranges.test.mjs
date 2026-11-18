import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {onRequest,parseRange} from '../functions/assets/ivan-marinhealth-podcast.mp3.js';
const data=Uint8Array.from({length:100},(_,i)=>i);
async function call(headers={},method='GET',status=200){
 let seen;
 const context={request:new Request('https://example.test/assets/ivan-marinhealth-podcast.mp3',{method,headers}),env:{ASSETS:{async fetch(req){seen=req;return new Response(data,{status,headers:{'Content-Type':'audio/mpeg','ETag':'"podcast"','Content-Length':'100'}});}}},next:()=>new Response('next')};
 const response=await onRequest(context);
 return {response,seen};
}
test('range parser supports closed, open, suffix, clamped and invalid requests',()=>{
 assert.deepEqual(parseRange('bytes=20-29',100),{start:20,end:29});
 assert.deepEqual(parseRange('bytes=90-',100),{start:90,end:99});
 assert.deepEqual(parseRange('bytes=-10',100),{start:90,end:99});
 assert.deepEqual(parseRange('bytes=90-999',100),{start:90,end:99});
 for(const value of ['bytes=100-','bytes=30-20','bytes=-0','bytes=-','bytes=x-y'])assert.equal(parseRange(value,100),false);
 assert.equal(parseRange('bytes=0-1,5-6',100),null);
});
test('audio handler sends exact 206 bytes with valid headers',async()=>{
 const {response,seen}=await call({Range:'bytes=20-29'});
 assert.equal(response.status,206);
 assert.equal(response.headers.get('Content-Range'),'bytes 20-29/100');
 assert.equal(response.headers.get('Content-Length'),'10');
 assert.equal(response.headers.get('Accept-Ranges'),'bytes');
 assert.equal(seen.headers.has('Range'),false);
 assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[20,21,22,23,24,25,26,27,28,29]);
});
test('full GET, HEAD, invalid range and stale validator are handled correctly',async()=>{
 let {response}=await call();assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,100);
 ({response}=await call({},'HEAD'));assert.equal(response.status,200);assert.equal(response.headers.get('Content-Length'),'100');assert.equal((await response.arrayBuffer()).byteLength,0);
 ({response}=await call({Range:'bytes=200-'}));assert.equal(response.status,416);assert.equal(response.headers.get('Content-Range'),'bytes */100');
 ({response}=await call({Range:'bytes=20-29','If-Range':'"old"'}));assert.equal(response.status,200);
 ({response}=await call({Range:'bytes=20-29','If-Range':'"podcast"'}));assert.equal(response.status,206);
 ({response}=await call({},'GET',404));assert.equal(response.status,404);
 ({response}=await call({},'POST'));assert.equal(await response.text(),'next');
});
test('function routing is limited to the single approved static MP3',async()=>{
 const routes=JSON.parse(await readFile(new URL('../public/_routes.json',import.meta.url),'utf8'));
 assert.deepEqual(routes.include,['/assets/ivan-marinhealth-podcast.mp3']);
 assert.deepEqual(routes.exclude,[]);
});
