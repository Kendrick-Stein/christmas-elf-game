'use strict';
const fs=require('node:fs'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict'),C=require('./core.js');
const advance=s=>{C.launch(s);let n=0;while(s.phase==='raid'&&n++<100)C.step(s);assert.ok(n<100);};
test('economy and slots enforce costs, levels, and replacement',()=>{
 const s=C.newGame();
 assert.equal(C.invest(s,'snow',3),false);assert.equal(C.invest(s,'snow',0),true);assert.equal(C.invest(s,'frost',0),true);assert.deepEqual(s.lanes[0],{kind:'frost',lv:1});
 assert.equal(s.money,3);assert.equal(C.invest(s,'frost',0),false);
 s.money=40;assert.equal(C.invest(s,'frost',0),true);assert.equal(C.invest(s,'frost',0),false);
 C.invest(s,'cocoa',0);C.invest(s,'cocoa',2);assert.equal(s.cocoa,2);assert.equal(C.invest(s,'cocoa',1),false);
 C.launch(s);assert.equal(C.invest(s,'snow',2),false);
});
test('no defenses loses; cocoa produces income on every cleared wave',()=>{
 const s=C.newGame();advance(s);advance(s);advance(s);assert.equal(s.phase,'lost');assert.equal(s.gifts,0);
 const t=C.newGame();C.invest(t,'cocoa',0);advance(t);assert.equal(t.money,13);assert.equal(t.gifts,5);
});
test('armor resistance rewards switching to a lantern or keeping a rescue bell',()=>{
 const s=C.newGame();s.wave=4;s.entries=C.W[4];s.lanes[1]={kind:'snow',lv:2};C.launch(s);C.step(s);C.step(s);
 assert.equal(s.enemies.find(x=>x.kind==='chief').hp,14);
 const t=C.newGame();t.wave=4;t.entries=C.W[4];t.lanes[1]={kind:'lantern',lv:2};C.launch(t);C.step(t);C.step(t);
 assert.equal(t.enemies.find(x=>x.kind==='chief').hp,11);
 assert.equal(C.bell(t),true);assert.equal(t.enemies.find(x=>x.kind==='chief').hp,8);assert.equal(t.ring,1);
 assert.ok(t.enemies.every(e=>e.frost===2));
});
test('a mixed build saves seven gifts at the fifth checkpoint, then continues',()=>{
 const s=C.newGame(1);const buys=[[['cocoa',0],['snow',0],['snow',2]],[['frost',1]],[['lantern',2]],[['lantern',0],['lantern',2]],[['lantern',1],['lantern',1]]];
 for(const wave of buys){
  for(const [x,l] of wave)assert.equal(C.invest(s,x,l),true);
  assert.ok(C.launch(s));let safety=0;while(s.phase==='raid'&&safety++<100){if(s.wave===4&&s.beat===5)assert.ok(C.bell(s));C.step(s);}
  assert.ok(safety<100);
 }
 assert.equal(s.phase,'plan');assert.equal(s.wave,5);assert.equal(s.cleared,5);assert.equal(s.gifts,7);assert.equal(s.ring,1);assert.equal(s.entries.length,9);
 advance(s);
 assert.ok(s.phase==='lost'||s.wave===6);
});
test('independent runs start at identical resources but fresh seeds vary later waves',()=>{
 const a=C.newGame(1001),b=C.newGame(0x69caf82d),c=C.newGame(1001);
 for(const x of [a,b,c]){x.wave=7;assert.deepEqual(x.lanes,[null,null,null]);assert.equal(x.ring,2);assert.equal(x.money,12);}
 assert.deepEqual(C.planWave(a),C.planWave(c));
 assert.notDeepEqual(C.planWave(C.newGame(1)),C.planWave(C.newGame(0x69caf82d)));
 const t=C.newGame(1);while(t.cleared<5&&t.phase==='plan'){for(let i=0;i<3;i++)C.invest(t,'snow',i);advance(t);}
 assert.ok(t.gifts<7);
});
test('UI selects lanes, draws, swaps language and pauses through browser-compatible entry point',()=>{
 class E{
  constructor(id){this.id=id;this.dataset={};this.events={};this.children={};this.attributes={};}
  addEventListener(k,f){(this.events[k]||=[]).push(f);} fire(k,v={}){for(const f of this.events[k]||[])f(v);}
  setAttribute(k,v){this.attributes[k]=String(v);}querySelector(k){return this.children[k]??(this.children[k]=new E(k));}focus(){}
  getBoundingClientRect(){return {height:298,top:0};}
 }
 const html=fs.readFileSync(__dirname+'/index.html','utf8'),ids=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(([,id])=>[id,new E(id)]));
 const draw=()=>{},ctx=new Proxy({createLinearGradient(){return {addColorStop:draw};}},{get(target,k){return k in target?target[k]:draw;}});
 ids.board.getContext=()=>ctx;
 const dom=new E('dom'),win=new E('win'),main=new E('main'),lane=[0,1,2].map(i=>Object.assign(new E('lane'+i),{dataset:{lane:i}}));
 const buy=Object.keys(C.DEF).map(k=>Object.assign(new E(k),{dataset:{build:k}}));
 const pref={},sounds=[],queue=[];let cb=null,ticks=0;
 Object.assign(dom,{documentElement:{},getElementById:id=>ids[id],querySelectorAll:q=>q==='[data-lane]'?lane:buy,querySelector:()=>main});
 Object.assign(win,{GiftDefense:C,PineAudio:{refresh(){},switchTheme(...v){sounds.push(v);},arm(){},effect(){}},matchMedia:()=>({matches:false})});
 vm.runInNewContext(fs.readFileSync(__dirname+'/game.js','utf8'),{document:dom,window:win,Image:class{constructor(){this.complete=true;this.naturalWidth=48}},requestAnimationFrame:f=>queue.push(f),performance:{now:()=>ticks*430},setInterval:f=>(cb=f,1),clearInterval:()=>{cb=null},localStorage:{getItem:k=>pref[k],setItem:(k,v)=>{pref[k]=v}},console});
 queue.shift()(10);assert.equal(dom.documentElement.lang,'zh-CN');assert.equal(ids.phase.textContent,'布置防线');
 ids.language.fire('click');assert.equal(pref['snow-pine-language-v1'],'en');assert.equal(ids.title.textContent,'Gift Depot Defense');
 assert.match(ids.forecast.textContent,/Next wave.*Scout/);
 lane[0].fire('click');buy[0].fire('click');assert.equal(ids.money.textContent,8);assert.match(ids.target.textContent,/Left.*Snow Post Lv. 1/);
 ids.go.fire('click');assert.equal(ids.phase.textContent,'The prankster raid is on');assert.ok(cb);
 cb();ids.pause.fire('click');assert.equal(ids.phase.textContent,'Taking a breather');assert.equal(cb,null);assert.deepEqual(sounds.at(-1),['workshop',false]);
 ids.pause.fire('click');assert.ok(cb);while(cb&&ticks++<30)cb();assert.equal(ids.wave.textContent,2);
 ids.restart.fire('click');assert.equal(ids.gifts.textContent,8);assert.equal(ids.money.textContent,12);
});
