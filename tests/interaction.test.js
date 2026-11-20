'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function harness(){
 const elements=new Map(),freshNode=()=>{const events=new Map(),classes=new Set(),attrs=new Map(),span={textContent:''};return {
  addEventListener:(n,fn)=>events.set(n,fn),fire:(n,e={})=>events.get(n)?.({preventDefault(){},...e}),textContent:'',innerHTML:'',hidden:false,focus(){},setPointerCapture(){},getBoundingClientRect:()=>({width:640,height:420,left:0,right:640}),querySelector:()=>span,
  dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,b)=>b?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},setAttribute:(n,v)=>attrs.set(n,v),getAttribute:n=>attrs.get(n)
 };};
 const d=freshNode(),w=freshNode(),stored=new Map();
 const $=id=>{if(!elements.has(id))elements.set(id,freshNode());return elements.get(id);};
 d.getElementById=$;d.hidden=false;
 const leaves=[];
 $('field').getContext=()=>new Proxy({}, {get:(o,k)=>o[k]??(k==='clearRect'?()=>{leaves.length=0;}:k==='drawImage'?(img,x,y,w,h)=>{if(img.src.includes('/leaf.svg'))leaves.push({x:x+w/2,y:y+h/2,w,h});}:()=>{})});
 let raf,time=0;
 const c=vm.createContext({window:w,document:d,devicePixelRatio:1,matchMedia:()=>({matches:true}),Image:class{constructor(){this.complete=true;this.naturalWidth=160;}},requestAnimationFrame:fn=>{raf=fn;},localStorage:{getItem:k=>stored.get(k),setItem:(k,v)=>stored.set(k,v)}});
 Object.assign(c,{console});
 vm.runInContext('globalThis.Math.random=()=>.50',c);
 vm.runInContext(read('game-core.js'),c);
 w.ElfCore=c.ElfCore;
 vm.runInContext(read('game.js'),c);
 let tracking=false;
 const point=x=>{$('field').fire('pointerdown',{pointerId:1,clientX:x});$('field').fire('pointermove',{pointerId:1,clientX:x});$('field').fire('pointerup',{pointerId:1});};
 return {$,w,d,point,leaves,follow:b=>tracking=b,advance:ms=>{for(let i=0;i<ms;i+=16){
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
