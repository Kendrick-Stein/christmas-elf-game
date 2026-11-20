'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function harness(width=640,height=420){
 const size={width,height};
 const elements=new Map(),freshNode=()=>{const events=new Map(),classes=new Set(),attrs=new Map(),span={textContent:''};return {
  addEventListener:(n,fn)=>events.set(n,fn),fire:(n,e={})=>events.get(n)?.({preventDefault(){},...e}),textContent:'',innerHTML:'',hidden:false,style:{setProperty(){}},focus(){d.activeElement=this;},setPointerCapture(){},getBoundingClientRect:()=>({...size,left:0,right:size.width}),querySelector:()=>span,
  dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,b)=>b?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},setAttribute:(n,v)=>attrs.set(n,v),getAttribute:n=>attrs.get(n)
 };};
 const d=freshNode(),w=freshNode(),stored=new Map();
 const $=id=>{if(!elements.has(id))elements.set(id,freshNode());return elements.get(id);};
 d.getElementById=$;d.hidden=false;
 const leaves=[],elves=[];let transform=[];
 $('field').getContext=()=>new Proxy({}, {get:(o,k)=>o[k]??(k==='setTransform'?((...args)=>{transform=args;}):k==='clearRect'?()=>{leaves.length=0;elves.length=0;}:k==='drawImage'?(img,x,y,w,h)=>{if(img.src.includes('/pixel-leaf.svg'))leaves.push({x:x+w/2,y:y+h/2,w,h});if(img.src.includes('/pixel-sled.svg'))elves.push(x+w/2);}:()=>{})});
 let raf,time=0;
 const c=vm.createContext({window:w,document:d,devicePixelRatio:1,matchMedia:()=>({matches:true}),Image:class{constructor(){this.complete=true;this.naturalWidth=160;}},requestAnimationFrame:fn=>{raf=fn;},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)}});
 Object.assign(c,{console});
 vm.runInContext('globalThis.Math.random=()=>.50',c);
 vm.runInContext(read('game-core.js'),c);
 w.ElfCore=c.ElfCore;
 vm.runInContext(read('game.js'),c);
 let tracking=false;
 const point=x=>{$('field').fire('pointerdown',{pointerId:1,clientX:x});$('field').fire('pointermove',{pointerId:1,clientX:x});$('field').fire('pointerup',{pointerId:1});};
 return {$,w,d,point,leaves,elves,stored,transform:()=>transform,setSize:(w,h)=>{size.width=w;size.height=h;},follow:b=>tracking=b,advance:ms=>{for(let i=0;i<ms;i+=16){
      if(tracking && leaves.length){const o=leaves.find(x=>x.h!==31&&x.y>0);if(o)point(o.x);}
      raf(time+=16);
 }}};
}
test('wired interface follows through star and records height after failure and replay',()=>{
 const {$,w,advance,follow}=harness();
 $('start').fire('click');assert($('panel').hidden);
 advance(500);w.fire('keydown',{key:'Escape'});
 assert.equal($('panelTitle').textContent,'雪夜暂停');
 advance(1500);assert.equal($('progress').innerHTML,'0<span> 层</span>');
 w.fire('keydown',{key:'Escape'});follow(true);advance(36000);
 assert.match($('chapter').textContent,/星树已点亮/);assert($('panel').hidden);
 const level=parseInt($('progress').innerHTML,10);assert(level>12);
 follow(false);w.fire('keydown',{key:'ArrowRight'});advance(1100);w.fire('keyup',{key:'ArrowRight'});
 // Moving fully away after each spawned leaf exits its launch/landing neighborhood.
 for(let i=0;i<30&&$('panel').hidden;i++)advance(950);
 assert.match($('panelTitle').textContent,/雪夜到站|树倒了/);
 assert.match($('best').textContent,new RegExp('最高 '+level+' 层'));
 $('start').fire('click');assert.equal($('score').textContent,'000');assert.equal($('progress').innerHTML,'0<span> 层</span>');
});
test('settled leaf retains landing offset and moves with the cart',()=>{
 const {$,w,advance,point,leaves,follow}=harness();$('start').fire('click');
 advance(900);point(297);advance(3100);assert.equal($('progress').innerHTML,'1<span> 层</span>');
 const layer=leaves.find(o=>o.h===31);assert(layer);assert(Math.abs(layer.x-320)<.1);
 w.fire('keydown',{key:'ArrowRight'});advance(160);w.fire('keyup',{key:'ArrowRight'});advance(16);
 const moved=leaves.find(o=>o.h===31);assert(moved.x-layer.x>50);
 follow(true);advance(3400);
 assert.equal($('progress').innerHTML,'2<span> 层</span>');
 assert.equal($('score').textContent,'050');
});
test('visible drops activate compression, wide and attraction in order, then countdown and clear',()=>{
 const {$,w,advance,follow,leaves}=harness();$('start').fire('click');follow(true);
 const seen=new Set();let minSpacing=20,everBuffs=false;
 for(let i=0;i<420;i++){
   advance(185);
   const text=$('banner').textContent;
   if(!($('banner').hidden))for(const s of ['压缩','加宽','吸附'])if(text.includes(s))seen.add(s);
   const t=leaves.filter(o=>o.h===31).sort((a,b)=>a.y-b.y);
   for(let j=1;j<t.length;j++){const spacing=t[j].y-t[j-1].y;if(spacing>0)minSpacing=Math.min(minSpacing,spacing);}
   everBuffs ||= !$('buffs').hidden;
 }
 assert.deepEqual([...seen].slice(0,3),['压缩','加宽','吸附']);
 assert(minSpacing<19);assert(everBuffs);assert(parseInt($('progress').innerHTML,10)>16);
 // Timed badges are frozen during pause and never remain visible on its overlay.
 const badge=$('buffs').innerHTML;w.fire('keydown',{key:'Escape'});assert($('buffs').hidden);
 advance(11000);assert.equal($('buffs').innerHTML,badge);w.fire('keydown',{key:'Escape'});
 assert.equal($('buffs').innerHTML,badge);
});
test('quick arrow presses nudge 7 units both ways, long hold motion remains 445 units/sec',()=>{
 const {$,advance,elves}=harness();$('start').fire('click');advance(32);
 const center=elves[0];
 $('left').fire('pointerdown',{pointerId:1});$('left').fire('pointerup',{pointerId:1});advance(16);
 assert.equal(elves[0],center-7);
 $('right').fire('click',{detail:0});advance(16);
 assert.equal(elves[0],center);
 $('right').fire('pointerdown',{pointerId:1});advance(160);$('right').fire('pointerup',{pointerId:1});advance(16);
 assert(Math.abs(elves[0]-(center+7+445*.160))<=.51);
});
test('390px touch drag uses chosen gain, touch microtap does not coast and setting persists',()=>{
 const {$,advance,elves,stored}=harness(390);$('start').fire('click');advance(32);
 const center=elves[0], f=$('field'), pos=center*390/640;
 $('sensitivity').fire('change',{target:{value:'low'}});
 assert.equal(stored.get('snow-pine-input-v1'),'low');
 f.fire('pointerdown',{pointerId:31,pointerType:'touch',clientX:pos});
 f.fire('pointermove',{pointerId:31,pointerType:'touch',clientX:pos+20});
 f.fire('pointercancel',{pointerId:31});advance(16);
 assert(Math.abs(elves[0]-(center+20*640/390*.66))<=.51);
 const next=elves[0];
 $('right').fire('pointerdown',{pointerId:32,pointerType:'touch'});advance(48);
 $('right').fire('pointerup',{pointerId:32,pointerType:'touch'});advance(16);
 assert(Math.abs(elves[0]-(next+7*.66))<=1);
 $('right').fire('pointerdown',{pointerId:33,pointerType:'touch'});advance(176);
 $('right').fire('pointerup',{pointerId:33,pointerType:'touch'});advance(16);
 assert(elves[0]-next>20);
});
test('miss changes score when crossing top, is signalled while the foliage still falls, and does not double-penalize',()=>{
 const {$,advance,point,leaves}=harness();
 $('start').fire('click');advance(4050);assert.equal($('score').textContent,'030');
 // Let a subsequent leaf spawn, then shift out of its path.
 advance(700);point(590);
 for(let i=0;i<280&&$('hearts').getAttribute('aria-label')==='生命 5';i++)advance(16);
 assert.equal($('hearts').getAttribute('aria-label'),'生命 4');assert.equal($('score').textContent,'020');
 assert.match($('banner').textContent,/−10 分/);assert(leaves.some(o=>o.h!==31));
 advance(750);
 assert.equal($('hearts').getAttribute('aria-label'),'生命 4');assert.equal($('score').textContent,'020');
});
test('focus and rail toggle without restarting; resize keeps one scale and centered pointer coordinates',()=>{
 const {$,w,d,advance,setSize,transform,elves}=harness(320,460);
 $('start').fire('click');advance(1200);
 assert.equal(transform()[0],.5);assert.equal(transform()[0],transform()[3]);
 $('focusToggle').fire('click');assert($('shell').classList.contains('focus-view'));assert.equal($('focusToggle').getAttribute('aria-pressed'),'true');
 setSize(320,502);w.fire('resize');advance(1800);
 assert.equal(transform()[0],.5);assert.equal(transform()[3],.5);
 assert($('panel').hidden);assert.equal($('score').textContent,'000');
 w.fire('keydown',{key:'Escape'});assert(!$('shell').classList.contains('focus-view'));assert($('panel').hidden);
 assert.equal($('focusToggle').getAttribute('aria-label'),'打开放大模式');
 if(!$('rules').hidden)$('helpToggle').fire('click');$('helpToggle').fire('click');assert(!$('rules').hidden);
 assert.equal(d.activeElement,$('helpClose'));
 $('helpClose').fire('click');assert($('rules').hidden);assert.equal(d.activeElement,$('helpToggle'));
 setSize(1280,600);w.fire('resize');advance(16);
 assert.equal(transform()[0],transform()[3]);assert(transform()[4]>0);
 const inside=transform()[4]+440*transform()[0];
 $('field').fire('pointerdown',{pointerId:19,clientX:inside});$('field').fire('pointerup',{pointerId:19});advance(16);
 assert.equal(elves[0],440);assert($('panel').hidden);
});
