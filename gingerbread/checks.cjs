const fs=require('fs'), vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(x=>x.trim());js.forEach(x=>new vm.Script(x));
const mod={exports:{}};vm.runInNewContext(js[0],{module:mod});const C=mod.exports;
const frames=(s,t,fn)=>{for(let i=0;i<Math.round(t*120);i++){C.tick(s,1/120);fn?.(s);}};
const box=(p)=>C.world(p).map(([x,y])=>[x,y,x+1,y+1]);
const over=(a,b)=>Math.min(a[2],b[2])-Math.max(a[0],b[0])>1e-5&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>1e-5;
const solid=s=>{const all=[...s.stack,...(s.active?[s.active]:[])];all.forEach((p,i)=>{for(const b of box(p)){assert(!C.tray(s).some(r=>over(b,r)));for(const q of all.slice(0,i))assert(!box(q).some(r=>over(b,r)));}});};
let s=C.make();const first=s.active,firstX=first.x;
C.target(s,C.MID+1);frames(s,.35,solid);assert.notEqual(s.cart.x,C.MID);assert.equal(first.x,firstX);
C.target(s,C.MID);frames(s,3.17,solid);assert.equal(s.stack.length,1);assert(!s.stack[0].bond);frames(s,1.2,solid);assert(s.stack[0].bond);
const frozen=s.stack[0],offset=frozen.x-s.cart.x;C.target(s,C.TRAVEL[1]);frames(s,1.65,solid);
assert(Math.abs(frozen.x-s.cart.x-offset)>.06&&Math.abs(frozen.x-s.cart.x-offset)<.345);
const endedDrift=frozen.x-s.cart.x;frames(s,.75,solid);assert.equal(frozen.x-s.cart.x,endedDrift);s.drop=true;frames(s,5,solid);assert.equal(s.mode,'collapse');assert.equal(s.hearts,0);assert.equal(s.stack.length,1);assert.equal(C.rewardFor(s).rows[0],frozen);assert.equal(C.rewardFor(s).rich,false);
// Exact screenshot analog: Z has only .37 cell of support on O, and O is just landed.
function small(c,id,x,y){return {id,kind:c,x,y,cells:C.SHAPES[c],bond:null,tack:null,vx:0,vy:0,dwell:0};}
s=C.make(); const base=small('O',41,17,0),z=small('Z',42,15.37,2.08);
s.stack=[base];assert(C.tackable(s,base,new Set()));assert(!base.bond);
s.active=z;s.drop=true;frames(s,.02,solid);assert(s.stack.includes(z));assert(z.tack);assert.equal(z.y,2);assert.equal(z.x,15.37);assert.equal(z.vy,0);assert(!base.bond);assert.equal(s.hearts,3);
s.next=20;s.drop=false;frames(s,1.2,solid);assert(z.bond&&base.bond);assert.equal(z.x,15.37);assert.equal(z.y,2);
const at=z.x-base.x;C.target(s,C.MID+1.25);frames(s,.80,solid);
const slid=z.x-base.x;assert(Math.abs(slid-at)>.04&&Math.abs(slid-at)<=.35);frames(s,.85,solid);assert(Math.abs((z.x-base.x)-slid)<.003);assert.equal(s.hearts,3);assert(z.bond);
s=C.make();s.stack=[small('O',51,17,0)];assert(C.tackable(s,s.stack[0],new Set()));const low=small('Z',52,15.19,2);s.stack.push(low);
assert(!C.tackable(s,low,C.anchors(s,true)));const air=small('Z',53,15.9,2.012);assert(!C.tackable(s,air,C.anchors(s,true)));
s.active=null;s.next=30;frames(s,3,solid);assert(!s.stack.includes(low)||low.y<2);
s=C.make();s.active=small('O',57,0,2);s.drop=true;frames(s,.65,solid);assert.equal(s.hearts,2);
s=C.make();s.active=null;s.next=30;const strong=small('O',61,17,0),weak=small('Z',62,15.37,2);s.stack=[strong,weak];
assert(C.tackable(s,strong,new Set()));assert(C.tackable(s,weak,C.anchors(s,true)));C.target(s,C.TRAVEL[1]);frames(s,.65,solid);
assert(!weak.tack&&!weak.bond,'only a large sustained move releases the weak initial joint');frames(s,2.35,solid);assert(!s.stack.includes(weak)||weak.y<2);
const rail=C.tray(s).find(r=>r[4]===-2),p={id:91,x:rail[0]-.72,y:4,cells:[[0,0]],kind:'I',vx:0,vy:0,dwell:0};
assert(Math.abs(C.sweepY(p,10,C.obstacles(s))-(4-C.RAIL_HEIGHT))<1e-8);
// A loose cookie at the inside of a real side guard can be pushed, not trap the cart.
s=C.make();s.active=null;s.next=999;
const leftRail=C.tray(s).find(r=>r[4]===-2),pushed=small('O',71,leftRail[2],0);
s.stack=[pushed];const startX=pushed.x,cartX=s.cart.x;C.target(s,cartX+1);frames(s,.26,solid);assert(pushed.x>startX+.2);assert(s.cart.x>cartX+.2);assert.equal(s.hearts,3);
s=C.make();s.stack=[small('O',71,16.5,0)];
const cookie=s.stack[0],bag={id:78,item:true,x:17,y:2,cells:[[0,0]]};
assert(C.iced(s,bag,2));assert(cookie.bond.instant);assert(!C.iced(s,bag,2));assert.equal(s.stack.length,1);
const rigid=cookie.x-s.cart.x;C.target(s,C.MID+2);frames(s,.7,solid);assert(Math.abs(rigid-(cookie.x-s.cart.x))<1e-8);
s=C.make();s.stack=[small('O',71,0,-5.09),small('O',72,32,-5.09)];
s.stack.forEach(p=>p.vy=10);frames(s,.03,solid);assert.equal(s.hearts,1);assert.equal(s.stack.length,0);
// Region on real faces only; lower warm supports may flex without moving the frozen parcel.
function place(s,p){s.stack.push(p);assert(C.tackable(s,p,C.anchors(s,true)));return p;}
s=C.make();s.active=null;s.next=100;
for(let i=0;i<5;i++)place(s,small('O',80+i,16+i*.125,i*2));
frames(s,1.25,solid);
const requested={id:99,x:17,y:10,cells:[[0,0]]};
assert(C.iced(s,requested,10));
assert.deepEqual(Array.from(s.stack.filter(p=>p.frozen).map(p=>p.id)),[83,84]);
const pin=s.stack.filter(p=>p.frozen).map(p=>[p.id,p.x-s.cart.x]), warmBase=s.stack[0].x-s.cart.x;
C.target(s,C.MID+2);frames(s,.7,solid);
assert(Math.abs(s.stack[0].x-s.cart.x-warmBase)>.05);
for(const dx of [-5,6,-3,4,-7,0]){
 C.target(s,C.MID+dx);frames(s,1.2,solid);
 for(const [id,x] of pin)assert(Math.abs(s.stack.find(p=>p.id===id).x-s.cart.x-x)<1e-8);
 assert.equal(s.stack.filter(p=>p.frozen).length,2);
 assert.equal(C.connected(s).length,5);
}
s=C.make();s.active=null;s.next=100;
place(s,small('O',91,15.8,0));place(s,small('O',92,17.92,0));frames(s,1.25,solid);
assert(C.iced(s,{x:16,y:2,cells:[[0,0]]},2));assert(s.stack[0].frozen);assert(!s.stack[1].frozen);
s=C.make();s.stack=[];assert(C.iced(s,{x:17,y:0,cells:[[0,0]]},0));assert.equal(s.trayFrost.length,1);assert.equal(s.stack.length,0);
s=C.make();s.active=null;s.next=100;place(s,small('O',93,17,0));frames(s,1.2,solid);
assert(C.iced(s,{x:16,y:0,cells:[[0,0]]},0));assert(s.stack[0].frozen);
console.log('PASS local connected region radius/hops, no air-gap spread, pinned relative geometry through repeated U-turns, warm parent flex preserved, tray-only frost');
// The preview is genuine, and missed decoration consumes its unique slot without losing a heart.
s=C.make();assert.equal(C.nextPreview(s).kind,'N');assert.equal(s.active.kind,'D');
while(s.active?.kind!=='N')C.tick(s,.04);
assert.equal(C.nextPreview(s).kind,'R');assert.equal(C.nextPreview(s).bonus,'bulb');
while(s.active?.kind!=='bulb')C.tick(s,.04);
assert.equal(s.stack.length,2);assert.equal(C.nextPreview(s).kind,'R');
const deco=s.active,hearts0=s.hearts;
while(s.active===deco)C.tick(s,.04);
assert.equal(s.hearts,hearts0);assert.equal(s.stack.flatMap(p=>p.ornaments||[]).length,1);
assert.equal(s.stack.find(p=>p.ornaments).ornaments[0].kind,'bulb');
while(s.active?.kind!=='F')C.tick(s,.04);
assert.equal(s.stack.length,4);assert.equal(C.nextPreview(s).kind,'I');
while(s.active?.kind==='F')C.tick(s,.04);assert(s.stack.filter(p=>p.frozen).length>=2);
while(s.active?.kind!=='wreath')C.tick(s,.04); assert.equal(s.hearts,3);
const wreath=s.active;while(s.active===wreath)C.tick(s,.04);
assert(s.stack.some(p=>p.ornaments?.some(x=>x.kind==='wreath')));
s=C.make();const host=small('O',96,17,0);s.stack=[host];s.active={id:97,item:true,kind:'garland',x:16,y:2.5,cells:[[0,0],[1,0],[2,0]]};
s.drop=true;frames(s,.1,solid);assert.equal(host.ornaments[0].kind,'garland');assert.equal(s.stack.length,1);
const og=host.ornaments[0],ox=og.dx;assert(ox>0&&ox<2);
s.active=null;s.next=100;frames(s,1.2,solid);C.target(s,C.MID+1);frames(s,.5,solid);assert.equal(host.ornaments[0].dx,ox);
s.active={id:98,item:true,kind:'wreath',x:0,y:0.1,cells:[[0,0],[1,0]]};s.drop=true;frames(s,.35,solid);assert.equal(s.hearts,3);assert.equal(host.ornaments.length,1);
s.stack=[host];s.active=null;C.loss(s,3);assert.equal(C.rewardFor(s).rows[0].ornaments[0].kind,'garland');
console.log('PASS exact conditional forecast, all three falling decorations, no life loss, host-bound offset, shared retained-result ornament');
// Actual playable opening: freestanding windows fit on each side of a true cutout arch.
s=C.make();
for(let i=0;i<3000&&s.active?.kind!=='F';i++){C.tick(s,1/120);solid(s);}
assert.equal(s.active?.kind,'F');
assert.equal(JSON.stringify(s.stack.map(p=>[p.kind,p.x,p.y])),JSON.stringify([['D',14.5,0],['N',12.5,0],['R',19.5,0],['M',14.55,4]]));
const broad=C.roofFit(C.rewardFor(s));assert(broad.broad);assert(broad.right-broad.left>=8.4);
const tower=small('I',151,14.3,5);
tower.cells=[[0,0],[0,1]];
s.stack.push(tower);
const narrow=C.roofFit(C.rewardFor(s));
assert(!narrow.broad);assert(narrow.right-narrow.left<1.6);assert(Math.abs(narrow.ridge-(narrow.left+narrow.right)/2)<1e-9);
s.stack.pop();
const beforeArch=s.stack[0],fa=box(beforeArch),bw=s.stack.flatMap(p=>box(p));
assert.equal(Math.max(...bw.map(a=>a[2]))-Math.min(...bw.map(a=>a[0])),9);
const aperture={id:150,x:16.6,y:.8,cells:[[0,0]],kind:'I'};
assert(!C.intersects(aperture,aperture.x,aperture.y,fa));
assert(Math.abs(C.sweepY(aperture,3,C.obstacles(s))-.8)<1e-8,'inside aperture falls to actual tray, not phantom solid box');
const above={...aperture,y:7};
assert(Math.abs(C.sweepY(above,9,C.obstacles(s))-(7-5))<1e-8,'real canopy/beam has material');
s=C.make();const rot=s.active;assert(C.rotate(s));
assert.equal(rot.cells.length,C.SHAPES.D.length);
assert(!rot.cells.some(([x,y])=>x===1&&y===2),'rotated hole remains empty');
console.log('PASS low wide default facade with open arch, rotated and probe-through occupancy, true upper support');
// Default item fills the actual one-cell upper notch, never the reserved doorway.
s=C.make();for(let i=0;i<2700&&s.active?.kind!=='P';i++){C.tick(s,1/120);solid(s);}
assert.equal(s.active?.kind,'P');assert.equal(C.nextPreview(s).kind,'F');
assert.equal(C.visiblePatches(s).length,0);assert.equal(s.stack.length,4);
for(let i=0;i<480&&s.active?.kind==='P';i++){C.tick(s,1/120);solid(s);}
assert.equal(s.hearts,3);assert.equal(s.stack.length,4);
let patch=C.visiblePatches(s)[0];assert.equal(patch.x0,19.5);assert.equal(patch.x1,20.5);assert.equal(patch.y0,3);assert.equal(patch.y1,4);
const door=s.stack[0],pockets=door.reserved.map(([a,b])=>[a+door.x,b+door.y,a+door.x+1,b+door.y+1]);
assert(!pockets.some(p=>over(p,[patch.x0,patch.y0,patch.x1,patch.y1])));
const archShape=[...door.cells.map(x=>x.join(','))];assert(archShape.includes('2,3')&&!archShape.includes('2,2'));
const extra={id:430,kind:'I',x:19.5,y:3,cells:[[0,0]],vx:0,vy:0};s.stack.push(extra);solid(s);
assert.equal(C.visiblePatches(s).length,0,'an actual cookie can occupy the non-structural patch; patch must hide');
s.stack.pop();assert.equal(C.visiblePatches(s).length,1);
const pane=s.stack.find(q=>q.kind==='R');pane.x+=.012;assert.equal(C.visiblePatches(s)[0].x1,20.512);solid(s);
C.loss(s,3);assert.equal(C.rewardFor(s).rows.length,4);assert.equal(C.visiblePatches(s).length,1);
s.stack=s.stack.filter(q=>q!==pane);assert.equal(C.visiblePatches(s).length,0,'no patch floats after host goes away');
s=C.make();s.active={id:100,item:true,kind:'P',x:0,y:.1,cells:[[0,0]]};s.drop=true;frames(s,.3,solid);
assert.equal(s.hearts,3);assert(!s.patches?.length);
s=C.make();const reserved=s.active.reserved.map(a=>a.join(',')).sort();for(let i=0;i<4;i++)assert(C.rotate(s));
assert.deepEqual(Array.from(s.active.reserved.map(a=>a.join(',')).sort()),Array.from(reserved));
s=C.make();const opening=s.active;opening.y=0;s.active=null;s.stack=[opening];
const insert=(id,x,y,cells)=>({id,x,y,cells,kind:'I',vx:0,vy:0,dwell:0});
s.stack.push(insert(402,16.5,0,[[0,0],[0,1]]),insert(403,15.5,0,[[0,0]]));
assert(!C.findPatch(s,16,1.5),'reserved arch forbids narrow bounded vacancy');
opening.reserved=null;const forbidden=C.findPatch(s,16,1.5);
assert(forbidden,'same material without reserved aperture would qualify');
console.log('PASS actual default repair, truthful preview, retained cosmetic hosts, live moved/occluded bounds, no miss penalty and sealed arch invariant');
let rng=79153,draw=()=>((rng=(Math.imul(rng,1664525)+1013904223)>>>0)/4294967296),n=0;
for(let i=0;i<110;i++){
 s=C.make();for(let j=0;j<1040&&s.mode==='playing';j++){
  const v=draw();if(v<.025)C.target(s,C.TRAVEL[0]+draw()*(C.TRAVEL[1]-C.TRAVEL[0]));else if(v<.046)C.rotate(s);else if(v<.08)s.drop=draw()>.52;
  C.tick(s,.016);solid(s);n++;
 }
}
console.log('PASS',n,'non-overlap states; independent airborne X, natural freeze and drag, loose drop, three hearts, simultaneous loss, rails, real icing and dedup');
const ctx=new Proxy({}, {get:(o,k)=>o[k]??(String(k).includes('Gradient')?()=>({addColorStop(){}}):()=>{})});
const els={}, el=id=>({textContent:'',dataset:{},style:{},state:{},handlers:{},id,focus(){},getBoundingClientRect(){return {width:390,height:560,left:0,top:0}},getContext(){return ctx},setAttribute(k,v){this.state[k]=v;},addEventListener(k,f){this.handlers[k]=f},toBlob(fn){fn({pixel:true})},click(){this.onclick?.()}});
const doc=el('document');doc.documentElement={};doc.getElementById=id=>els[id]??=el(id);const e=id=>doc.getElementById(id);
let raf, now=0, download=0, native=0, supported=true, copied='';
const memory=new Map();const localStorage={getItem:key=>memory.get(key),setItem:(key,val)=>memory.set(key,val)};
doc.createElement=id=>{let x=el(id);if(id==='a')x.click=()=>download++;return x;};
const navigator={clipboard:{writeText(x){copied=x;return Promise.resolve();}},canShare(x){assert.equal(x.files[0].type,'image/png');return supported;},share(x){assert.match(x.files[0].name,/^(搭姜饼屋-雪夜留影|Gingerbread-Builder)\.png$/);native++;return Promise.resolve();}};
vm.runInNewContext(js.join('\n'),{document:doc,window:el('window'),navigator,localStorage,File:class{constructor(x,n,o){this.name=n;this.type=o.type}},matchMedia:()=>({matches:false}),requestAnimationFrame:f=>raf=f,performance:{now:()=>now},setTimeout:()=>{},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}}});
function go(ms){const stop=now+ms;while(now<stop){now=Math.min(now+32,stop);raf(now);}}
const pointer=(el,k,x,y)=>e(el).handlers[k]({button:0,pointerId:1,clientX:x,clientY:y,preventDefault(){}});
assert.equal(doc.documentElement.lang,'zh-CN');e('screenLanguage').click();assert.equal(doc.documentElement.lang,'en');assert.equal(e('start').textContent,'Play');assert.equal(memory.get('snow-pine-language-v1'),'en');e('screenLanguage').click();
e('start').click();go(240);assert.match(e('nextBox').state['aria-label'],/暖灯窗/);assert.equal(e('nextBox').hidden,false);pointer('field','pointerdown',193,20);pointer('field','pointermove',387,20);pointer('field','pointerup',387,20);go(600);assert.equal(e('cartHandle').state['aria-valuenow'],'50');
go(3830);assert.match(e('message').textContent,/凝结/);assert.equal(e('score').textContent,'车上 1');
pointer('cartHandle','pointerdown',195,24);pointer('cartHandle','pointermove',387,24);pointer('cartHandle','pointerup',387,24);go(1700);assert.equal(e('cartHandle').state['aria-valuenow'],'100');
pointer('drop','pointerdown');go(4100);pointer('drop','pointerup');assert.equal(e('hearts').state['aria-label'],'剩余 0 心');go(1250);assert.equal(e('finaleControls').hidden,false);assert.match(e('finaleStatus').textContent,/屋顶|点亮|留影/);
e('skipFinale').click();assert.equal(e('screen').dataset.mode,'collapse');assert.equal(e('finaleControls').hidden,true);
assert.equal(e('resultScore').textContent,'1');assert.equal(e('nextBox').hidden,true);assert.match(e('resultFine').textContent,/车上保留 1 块/);
e('screenLanguage').click();assert.equal(e('resultFine').textContent,'1 saved · roof and lights in place');
e('copyLink').click();assert.equal(copied,'https://kendrick-stein.github.io/christmas-elf-game/gingerbread/');
e('share').click();assert.equal(native,1);e('save').click();assert.equal(download,1);e('screenLanguage').click();e('start').click();go(64);assert.equal(e('hearts').state['aria-label'],'剩余 3 心');
console.log('PASS actual DOM gameplay controls: empty sky no drag, natural freeze, dock drag, held drop, zero hearts, retained-result rendering, share/save, replay');
