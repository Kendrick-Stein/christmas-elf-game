'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('../share.js');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const artifact={type:'image/png',size:18};
function context(){
 const pixels=[],labels=[];
 return {pixels,labels,fillRect(...rect){pixels.push([this.fillStyle,...rect]);},
  fillText(t){labels.push(t);},createLinearGradient(){return {addColorStop(){}};},
  save(){},restore(){}};
}
function harness({nav={},toBlob=cb=>cb(artifact),sourceReady=()=>null,language='zh'}={}){
 const elements=new Map(),downloads=[],urls=[],revoked=[],timers=[],winEvents=new Map(),draw=[],contexts=[],localeListeners=[];
 function el(){
  const events=new Map(),attrs=new Map(),classes=new Set();
  return {firstChild:{nodeType:3,nodeValue:""},style:{},attrs,classes,hidden:false,events,called:0,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},
   addEventListener:(n,f)=>events.set(n,f),fire:n=>events.get(n)?.(),focus(){this.focused=true;},select(){this.selected=true;},
   setAttribute:(k,v)=>attrs.set(k,v),click(){downloads.push([this.href,this.download]);},remove(){this.removed=true;},
   getBoundingClientRect:()=>({width:300,height:160}),getContext(){const c=context();contexts.push(c);return c;},toBlob};
 }
 const $=id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id);};
 const document={getElementById:$,createElement:el,body:{appendChild(){}}};
 const win={document,navigator:nav,ElfLocale:{lang:()=>language,onChange:fn=>localeListeners.push(fn)},File:class{constructor(parts,name,o){Object.assign(this,{parts,name,type:o.type});}},
  URL:{createObjectURL(blob){assert.equal(blob,artifact);const url='blob:poster/'+(urls.length+1);urls.push(url);return url;},revokeObjectURL:u=>revoked.push(u)},
  setTimeout:f=>timers.push(f),addEventListener:(n,f)=>winEvents.set(n,f),
  ElfShareSource:{ready:sourceReady,snapshot:()=>tall,draw:(_ctx,s,g)=>draw.push({s,g})}};
 return {$,api:S.init(win),downloads,timers,revoked,draw,contexts,switchLanguage:next=>{language=next;localeListeners.forEach(fn=>fn(next));},event:n=>winEvents.get(n)?.({})};
}
const tall=Object.freeze({score:358,level:89,spacing:19,layers:Array.from({length:89},(_,i)=>({x:i*6-100,w:80}))});
test('poster 1080 square; authentic tilted/tall snapshot fits, with stable QR and actual stats',()=>{
 const ctx=context(),s=tall,b=S.fallbackBounds(s);
 const g=S.poster(ctx,s,{draw(_c,v,out){assert.equal(v,s);assert(good(out));}});
 function good(o){return Number.isFinite(o.x+o.bottom+o.scale)&&o.scale>0;}
 assert.deepEqual(ctx.pixels[0],['#172940',0,0,1080,1080]);
 assert(ctx.labels.includes('358'));assert(ctx.labels.includes('89 层'));assert(g.scale<1);
 assert(g.x+b.left*g.scale>=84);assert(g.x+b.right*g.scale<=996);
 assert(g.bottom+b.top*g.scale>=268);assert(g.bottom+b.bottom*g.scale<=826);
 assert.equal(S.URL_TARGET,'https://kendrick-stein.github.io/christmas-elf-game/');
 const qr=context(),side=S.drawQR(qr,844,836);
 assert.equal(side,164);assert.deepEqual(qr.pixels[0],['#fffef5',844,836,164,164]);
 assert(qr.pixels.slice(1).every(([,x,y,w,h])=>x>=860&&x<992&&y>=852&&y<984&&w===4&&h===4));
});
test('settlement prebuilds PNG and uses prepared File synchronously; repeated PNG and replay work',async()=>{
 let synchronous=false,calls=0;
 const h=harness({nav:{canShare:({files})=>files[0].name===S.FILE_NAME,share:({files})=>{
  assert(synchronous);assert.equal(files[0].type,'image/png');calls++;return Promise.resolve();
 }}});
 assert(h.$('shareActions').hidden);h.event('elf:settlement');assert.equal(h.$('saveTree').attrs.get('aria-disabled'),'true');
 await flush();assert.equal(h.draw.length,2);assert.equal(h.$('saveTree').attrs.get('aria-disabled'),'false');
 synchronous=true;h.$('shareTree').fire('click');synchronous=false;assert.equal(calls,1);
 h.$('shareTree').fire('click');assert.equal(calls,1);
 await flush();
 h.$('saveTree').fire('click');h.$('saveTree').fire('click');
 assert.deepEqual(h.downloads,[['blob:poster/1',S.FILE_NAME],['blob:poster/2',S.FILE_NAME]]);
 h.timers.forEach(f=>f());assert.equal(h.revoked.length,2);
 h.event('elf:reset');assert(h.$('shareActions').hidden);assert(h.$('settlementTree').hidden);
 h.$('saveTree').fire('click');assert.equal(h.downloads.length,2);
});
test('unsupported sharing copies stable link; abort does not copy; denied clipboard gives selectable URL',async()=>{
 const copied=[];const unsupported=harness({nav:{clipboard:{writeText:s=>{copied.push(s);return Promise.resolve();}}}});
 unsupported.api.settle(tall);await flush();unsupported.$('shareTree').fire('click');await flush();assert.deepEqual(copied,[S.URL_TARGET]);
 const aborted=harness({nav:{canShare:()=>true,share:()=>Promise.reject({name:'AbortError'}),clipboard:{writeText:s=>copied.push(s)}}});
 aborted.api.settle(tall);await flush();aborted.$('shareTree').fire('click');await flush();
 assert.equal(copied.length,1);assert.match(aborted.$('shareStatus').textContent,/取消/);
 const denied=harness({nav:{clipboard:{writeText:()=>Promise.reject(new Error('Not allowed'))}}});
 denied.api.settle(tall);await flush();denied.$('shareTree').fire('click');await flush();
 assert(!denied.$('shareLinkLabel').hidden);assert(denied.$('shareLink').selected);assert(denied.$('shareLink').focused);
});
test('null PNG is recoverable; stale async preparation cannot leak into replay',async()=>{
 let tries=0;
 const retry=harness({toBlob:cb=>cb(++tries===1?null:artifact)});
 retry.api.settle(tall);await flush();assert.match(retry.$('shareStatus').textContent,/无法生成/);
 retry.$('saveTree').fire('click');await flush();
 retry.$('saveTree').fire('click');assert.equal(retry.downloads.length,1);
 let done;
 const slow=harness({sourceReady:()=>new Promise(res=>done=res)});
 slow.api.settle(tall);await flush();slow.api.reset();done();await flush();
 assert(slow.$('shareActions').hidden);assert.equal(slow.draw.length,0);
});

test('English settlement localizes PNG, native file title, controls and file download; effective language can switch',async()=>{
 let shared;
 const h=harness({language:'en',nav:{canShare:()=>true,share:data=>{shared=data;return Promise.resolve();}}});
 assert.equal(h.$('saveTree').textContent,'Save my tree');assert.equal(h.$('shareTree').textContent,'Share');
 assert.equal(h.$('shareLinkLabel').firstChild.nodeValue,'Copy game link ');
 assert.equal(h.$('shareLink').attrs.get('aria-label'),'Copy game link');
 h.api.settle(tall);assert.equal(h.$('shareStatus').textContent,'Preparing your image…');await flush();
 let labels=h.contexts.at(-1).labels;
 assert(labels.includes('My Christmas Tree'));assert(labels.includes('89 layers'));assert(!labels.some(x=>/[\u4e00-\u9fff]/.test(x)));
 h.$('saveTree').fire('click');assert.match(h.downloads[0][1],/^My-Christmas-Tree\.png$/);
 h.$('shareTree').fire('click');assert.equal(shared.title,'My Christmas Tree');assert.equal(shared.files[0].name,'My-Christmas-Tree.png');
 await flush();assert.equal(h.$('shareStatus').textContent,'Sharing completed.');
 h.switchLanguage('zh');assert.equal(h.$('saveTree').attrs.get('aria-disabled'),'true');
 await flush();labels=h.contexts.at(-1).labels;assert(labels.includes('我的圣诞树'));assert(labels.includes('89 层'));
 h.$('saveTree').fire('click');assert.equal(h.downloads[1][1],S.FILE_NAME);
});
test('settlement language rebuild ignores older PNG work and manual fallback localization follows active language',async()=>{
 const encoding=[];const h=harness({toBlob:cb=>encoding.push(cb)});
 h.api.settle(tall);await flush();assert.equal(encoding.length,1);
 h.switchLanguage('en');await flush();assert.equal(encoding.length,2);
 encoding[0](artifact);await flush();assert.equal(h.$('saveTree').attrs.get('aria-disabled'),'true');
 assert.equal(h.$('shareStatus').textContent,'Preparing your image…');
 encoding[1](artifact);await flush();
 h.$('shareTree').fire('click');assert(!h.$('shareLinkLabel').hidden);
 assert.match(h.$('shareStatus').textContent,/Automatic copy/);
 h.$('saveTree').fire('click');assert.equal(h.downloads[0][1],'My-Christmas-Tree.png');
});
