'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function harness(width=640,height=420,reduced=true,eventPick=null,random=.50,options={}){
 const size={width,height};
 const elements=new Map(),freshNode=()=>{const events=new Map(),classes=new Set(),attrs=new Map(),span={textContent:''};return {
  addEventListener:(n,fn)=>events.set(n,fn),fire:(n,e={})=>events.get(n)?.({preventDefault(){},...e}),textContent:'',innerHTML:'',hidden:false,style:{setProperty(){}},focus(){d.activeElement=this;},setPointerCapture(){},getBoundingClientRect:()=>({...size,left:0,right:size.width}),querySelector:()=>span,
  dataset:{},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,b)=>b?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},setAttribute:(n,v)=>attrs.set(n,v),getAttribute:n=>attrs.get(n),removeAttribute:n=>attrs.delete(n)
 };};
 const d=freshNode(),w=freshNode(),stored=options.storage||new Map();
 if(!options.firstVisit&&!stored.has("snow-pine-language-v1"))stored.set("snow-pine-language-v1","zh");
 const $=id=>{if(!elements.has(id))elements.set(id,freshNode());return elements.get(id);};
 d.getElementById=$;d.hidden=false;d.documentElement={};d.querySelectorAll=()=>[];d.querySelector=()=>null;
 const picker=$('languagePicker');picker.showModal=()=>{picker.open=true;};picker.close=()=>{picker.open=false;};
 const leaves=[],elves=[],pixels=[],labels=[],paints=[];let transform=[],airborne=false;
 $('field').getContext=()=>new Proxy({}, {get:(o,k)=>o[k]??(k==='setTransform'?((...args)=>{transform=args;}):k==='clearRect'?()=>{leaves.length=0;elves.length=0;pixels.length=0;labels.length=0;paints.length=0;airborne=false;}:
 k==='setLineDash'?a=>{if(a.length)airborne=true;}:k==='fillRect'?(...pos)=>pixels.push({pos,color:o.fillStyle,alpha:o.globalAlpha}):
 k==='stroke'?()=>paints.push(o.strokeStyle):k==='fillText'?t=>labels.push(t):k==='drawImage'?(img,x,y,w,h)=>{if(img.src.includes('/pixel-branch-')){paints.push(airborne?'air-branch':'branch');leaves.push({x:x+w/2,y:y+h/2,w,h:airborne?0:31,actualHeight:h,src:img.src});}if(img.src.includes('/pixel-sled.svg'))elves.push(x+w/2);if(img.src.includes('/pixel-bell.svg'))paints.push(airborne?'air-bell':'bell');if(img.src.includes('/pixel-cane.svg'))paints.push(airborne?'air-cane':'cane');}:()=>{})});
 let raf,time=0;
 const c=vm.createContext({window:w,document:d,devicePixelRatio:1,matchMedia:q=>({matches:q.includes("reduced-motion")?reduced:true}),Image:class{constructor(){this.complete=true;this.naturalWidth=160;}},requestAnimationFrame:fn=>{raf=fn;},localStorage:{getItem:k=>{if(options.denyStorage&&k==='snow-pine-language-v1')throw Error('denied');return stored.get(k);},setItem:(k,v)=>{if(options.denyStorage&&k==='snow-pine-language-v1')throw Error('denied');stored.set(k,v);}}});
 Object.assign(c,{console});
 vm.runInContext('globalThis.Math.random=()=>'+random,c);
 vm.runInContext(read('game-core.js'),c);
 w.ElfCore=c.ElfCore;
 if(eventPick!==null){const pick=w.ElfCore.nextEvent;w.ElfCore.nextEvent=(...args)=>pick(...args,()=>eventPick);}

 vm.runInContext(read('locale.js'),c);
 vm.runInContext(read('game.js'),c);
 let tracking=false;
 const point=x=>{$('field').fire('pointerdown',{pointerId:1,clientX:x});$('field').fire('pointermove',{pointerId:1,clientX:x});$('field').fire('pointerup',{pointerId:1});};
 return {$,w,d,point,leaves,elves,pixels,labels,paints,stored,transform:()=>transform,setSize:(w,h)=>{size.width=w;size.height=h;},follow:b=>tracking=b,advance:ms=>{for(let i=0;i<ms;i+=16){
      if(tracking && leaves.length){const o=leaves.find(x=>x.h!==31&&x.y>0);if(o)point(o.x*transform[0]+transform[4]);}
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
 const seen=new Set();let minSpacing=20,everBuffs=false,stableSeen=false;
 for(let i=0;i<420;i++){
   advance(185);
   const text=$('banner').textContent;
   if(!($('banner').hidden))for(const s of ['压缩','加宽','吸附'])if(text.includes(s))seen.add(s);
   const t=leaves.filter(o=>o.h===31).sort((a,b)=>a.y-b.y);
   for(let j=1;j<t.length;j++){const spacing=t[j].y-t[j-1].y;if(spacing>0)minSpacing=Math.min(minSpacing,spacing);}
   everBuffs ||= !$('buffs').hidden;
   stableSeen ||= !$('buffs').hidden && /稳固 [1-6]s/.test($('buffs').innerHTML);
 }
 assert.deepEqual([...seen].slice(0,3),['压缩','加宽','吸附']);
 assert(minSpacing<19);assert(everBuffs);assert(stableSeen);assert(parseInt($('progress').innerHTML,10)>16);
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
test('390px bottom arrow uses chosen gain, touch microtap does not coast and setting persists',()=>{
 const {$,advance,elves,stored}=harness(390);$('start').fire('click');advance(32);
 const center=elves[0], f=$('field'), pos=center*390/640;
 $('sensitivity').fire('change',{target:{value:'low'}});
 assert.equal(stored.get('snow-pine-input-v1'),'low');
 f.fire('pointerdown',{pointerId:31,pointerType:'touch',clientX:pos});
 f.fire('pointermove',{pointerId:31,pointerType:'touch',clientX:pos+20});
 f.fire('pointercancel',{pointerId:31});advance(16);
 assert.equal(elves[0],center);
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
test('actual rendered late falling leaves keep getting wider and narrower while replayable',()=>{
 const {$,advance,leaves,follow}=harness();$('start').fire('click');follow(true);
 const all=[];
 for(let i=0;i<365;i++){
  advance(195);
  const o=leaves.find(o=>o.h!==31&&o.y>3);
  if(o&&o.w!==all[all.length-1])all.push(o.w);
 }
 const late=all.slice(12);
 assert(late.length>10);assert(late.some((w,i)=>i&&w>late[i-1]+1));assert(late.some((w,i)=>i&&w<late[i-1]-1));assert($('panel').hidden);
});
test('same immutable branch art and dimensions in flight and after landing; actual landing offsets survive',()=>{
 const {$,point,advance,leaves}=harness();$('start').fire('click');
 advance(1300);
 const falling=leaves.find(o=>o.h!==31);
 assert(falling);assert.equal(falling.actualHeight,26);
 point(297);
 advance(2700);
 const placed=leaves.find(o=>o.h===31);
 assert(placed);assert.equal(placed.src,falling.src);assert.match(falling.src,/pixel-branch-\d+\.svg\?v=warm-13$/);
 assert.equal(placed.w,falling.w);assert.equal(placed.actualHeight,falling.actualHeight);
 assert.equal(placed.x,falling.x);assert.notEqual(placed.x,297);
 point(340);advance(16);assert.equal(leaves.find(o=>o.h===31).x,340);
});
test('ordinary strings arrive before a four-catch streak, attach and reward a smaller bonus, optional miss does not drain hearts',()=>{
 const get=harness();get.$('start').fire('click');
 get.advance(7550);
 assert(get.paints.includes('#a9bda4')); // airborne cord
 assert(parseInt(get.$('progress').innerHTML,10)<4);
 let caught=false,cabled=false;
 for(let i=0;i<150;i++){
   get.advance(16);caught ||= get.labels.some(t=>t.includes('灯串 +12')); cabled ||= get.paints.includes('#d8bc93');
 }
 assert(caught);assert(cabled);assert.equal(get.$('hearts').getAttribute('aria-label'),'生命 5');
 const miss=harness();miss.$('start').fire('click');miss.advance(7800);
 miss.point(409);miss.advance(1600);
 assert.equal(miss.$('hearts').getAttribute('aria-label'),'生命 5');
 assert.equal(miss.$('score').textContent,'060');assert(!miss.paints.includes('#d8bc93'));
});
test('late ornaments shimmer with differing phases and are static for reduced motion',()=>{
 function phases(reduced){
   const h=harness(640,420,reduced);h.$('start').fire('click');h.follow(true);h.advance(36000);
   assert.match(h.$('chapter').textContent,/星树已点亮/);
   h.follow(false);h.w.fire('keydown',{key:'Escape'});
   const read=()=>h.pixels.filter(o=>['#ffdc76','#ff8fae','#a3f4be','#a6bbfa'].includes(o.color)&&[7,9].includes(o.pos[2])).map(o=>o.alpha);
   h.advance(16);const first=read();h.advance(432);
   assert(first.length>=5);return [first,read()];
 }
 const [first,next]=phases(false),[fixed,later]=phases(true);
 assert.equal(first.length,next.length);
 assert(first.some((v,i)=>v<next[i])&&first.some((v,i)=>v>next[i]));
 assert.deepEqual(fixed,later);
});
test('timed heal waits for active play after pausing or hiding and supplies visible feedback',()=>{
 const h=harness(),{$,d,w}=h;const hearts=()=>$('hearts').getAttribute('aria-label');
 $('start').fire('click');h.follow(true);h.advance(24000);
 h.follow(false);h.point(590);
 let spent=24000;
 while(hearts()==='生命 5'&&spent<28700){h.advance(16);spent+=16;}
 assert.equal(hearts(),'生命 4');
 d.hidden=true;d.fire('visibilitychange');assert.equal($('panelTitle').textContent,'雪夜暂停');
 h.advance(42000);assert.equal(hearts(),'生命 4');assert(!$('panel').hidden);
 d.hidden=false;w.fire('keydown',{key:'Escape'});h.follow(true);
 let feedback=false;
 while(spent<31000&&!feedback){h.advance(16);spent+=16;feedback=h.labels.includes('+1 心');}
 assert(feedback);assert(spent>=29960);assert.equal(hearts(),'生命 5');
});
test('foreground decor paints above all settled branches and end snapshot keeps every caught item',()=>{
 const h=harness(),{$,w}=h;
 assert.equal(w.ElfShareSource.snapshot(),null);
 $('start').fire('click');h.follow(true);
 let orderSeen=false,caneFell=false,caneAttached=false,caneReward=false,bellFell=false,bellAttached=false,bellReward=false;
 for(let i=0;i<800;i++){
   h.advance(160);
   const {paints}=h;caneFell ||= paints.includes('air-cane');caneAttached ||= paints.includes('cane');caneReward ||= h.labels.includes('拐杖糖 +8');bellFell ||= paints.includes('air-bell');bellAttached ||= paints.includes('bell');bellReward ||= h.labels.includes('铃铛 +8');
   if(paints.includes('#d8bc93')&&paints.includes('branch')){
     assert(paints.indexOf('#d8bc93')>paints.lastIndexOf('branch'));orderSeen=true;
   }
 }
 assert(orderSeen&&caneFell&&caneAttached&&caneReward);assert(bellFell&&bellAttached&&bellReward);h.follow(false);h.point(590);
 for(let i=0;i<150&&$('panel').hidden;i++){
   h.advance(200);
   const o=h.leaves.find(o=>o.h!==31);if(o)h.point(o.x<320?590:50);
 }
 const snap=w.ElfShareSource.snapshot();assert(snap);
 const entries=snap.layers.flatMap(l=>l.ornaments);
 assert.equal(entries.length,snap.lights+snap.decorations);
 assert(entries.some(o=>o.kind==='bow'));
 assert(entries.some(o=>o.kind==='cane'));assert(entries.some(o=>o.kind==='bell'));
 assert(entries.some(o=>o.kind==='festival'));
 assert(entries.every(o=>Number.isFinite(o.dx)&&o.dy>=-26&&o.dy<=0));
 assert(entries.length>3);assert(Object.isFrozen(snap.layers[0].ornaments));
 const box=w.ElfShareSource.bounds(snap);assert(box.top<0&&box.bottom>0);
 const sprites=[];
 const poster=new Proxy({drawImage:im=>sprites.push(im.src)},{get:(o,k)=>o[k]??(()=>{})});
 w.ElfShareSource.draw(poster,snap,{x:0,bottom:0,scale:1});
 assert(sprites.some(url=>url.endsWith('/pixel-cane.svg?v=warm-13')));assert(sprites.some(url=>url.endsWith('/pixel-bell.svg?v=warm-13')));
 $('start').fire('click');assert.equal(w.ElfShareSource.snapshot(),null);
});
function waitForEvent(h,type){
 h.$('start').fire('click');h.follow(true);
 for(let i=0;i<240&&h.$('eventHud').dataset.kind!==type;i++)h.advance(125);
 h.follow(false);
 assert.equal(h.$('eventHud').dataset.kind,type);
 assert(parseInt(h.$('score').textContent,10)>=200);
}
test('green warning reverses held and bottom arrow controls; field touch stays disabled and pause freezes countdown',()=>{
 const h=harness(390,650,true,.01,.5),{$,w,d,elves}=h;
 waitForEvent(h,'green');
 assert.match($('eventHud').textContent,/准备/);
 const field=$('field'), pointerId=1, pos=28, before=elves[0];
 field.fire('pointerdown',{pointerId,pointerType:'touch',clientX:pos});
 h.advance(16);assert.equal(elves[0],before);
 for(let i=0;i<120&&!/4 秒/.test($('eventHud').textContent);i++)h.advance(16);
 assert.match($('eventHud').textContent,/4 秒/);
 field.fire('pointermove',{pointerId,pointerType:'touch',clientX:pos});h.advance(16);assert(Math.abs(elves[0]-before)<1);
 field.fire('pointermove',{pointerId,pointerType:'touch',clientX:pos+15});h.advance(16);assert.equal(elves[0],before);
 field.fire('pointerup',{pointerId});
 const mid=elves[0];w.fire('keydown',{key:'ArrowRight'});h.advance(96);w.fire('keyup',{key:'ArrowRight'});assert(elves[0]<mid-20);
 $('sensitivity').fire('change',{target:{value:'low'}});
 const preTap=elves[0];$('left').fire('pointerdown',{pointerId:3,pointerType:'touch'});
 h.advance(32);$('left').fire('pointerup',{pointerId:3});h.advance(16);
 assert(Math.abs(elves[0]-(preTap+7*.66))<=1);
 const badge=$('eventHud').textContent;d.hidden=true;d.fire('visibilitychange');h.advance(10000);
 assert($('eventHud').hidden);d.hidden=false;w.fire('keydown',{key:'Escape'});assert.equal($('eventHud').textContent,badge);
 const endPos=350,endBefore=elves[0];
 field.fire('pointerdown',{pointerId,pointerType:'touch',clientX:endPos});h.advance(16);assert.equal(elves[0],endBefore);
 for(let i=0;i<270&&!$('eventHud').hidden;i++)h.advance(16);
 assert($('eventHud').hidden);field.fire('pointermove',{pointerId,pointerType:'touch',clientX:endPos});h.advance(16);assert(Math.abs(elves[0]-endBefore)<1);
 field.fire('pointermove',{pointerId,pointerType:'touch',clientX:endPos+14});h.advance(16);assert.equal(elves[0],endBefore);
});
test('deer warns before fixed route: stationary tree loses one layer, dodge avoids it, gold attaches for 30',()=>{
 const blue=harness(640,420,true,.99,.5);waitForEvent(blue,'blue');
 assert.match(blue.$('eventHud').textContent,/快离开/);
 let struck=0;
 for(let i=0;i<250&&!blue.$('eventHud').hidden;i++){
   const before=Number.parseInt(blue.$('progress').innerHTML,10);
   blue.advance(16);
   if(blue.labels.includes('−1 层')&&Number.parseInt(blue.$('progress').innerHTML,10)<before)struck++;
 }
 assert.equal(struck,1);
 const evade=harness(640,420,true,.99,.5);waitForEvent(evade,'blue');
 evade.point(evade.elves[0]>320?93:551);
 let dodge=false;
 for(let i=0;i<250&&!evade.$('eventHud').hidden;i++){
   evade.advance(16);dodge ||= evade.$('banner').textContent==='躲开驯鹿了！';
   assert(!evade.labels.includes('−1 层'));
 }
 assert(dodge);
 const gold=harness(640,420,true,.99,.49);waitForEvent(gold,'gold');gold.follow(true);
 let got=false;
 for(let i=0;i<300&&!got;i++){gold.advance(16);got=gold.labels.includes('驯鹿礼灯 +30');}
 assert(got);
});

test('far touch taps and drags do not move sled, while desktop pointing remains direct',()=>{
 const {$,advance,elves,point}=harness(390);$('start').fire('click');advance(32);
 const center=elves[0], field=$('field');
 field.fire('pointerdown',{pointerId:45,pointerType:'touch',clientX:28});advance(16);assert.equal(elves[0],center);
 field.fire('pointerup',{pointerId:45});advance(16);assert.equal(elves[0],center);
 $('sensitivity').fire('change',{target:{value:'low'}});
 field.fire('pointerdown',{pointerId:46,pointerType:'touch',clientX:338});
 advance(16);assert.equal(elves[0],center);
 field.fire('pointermove',{pointerId:46,pointerType:'touch',clientX:318});
 advance(16);assert.equal(elves[0],center);
 field.fire('pointerup',{pointerId:46});
 point(300);advance(16);assert(Math.abs(elves[0]-300*640/390)<=.51);
});

test('first visit requires an explicit choice, persists it and supports unavailable storage',()=>{
 const h=harness(390,650,true,null,.5,{firstVisit:true}),{$,d,stored}=h;
 assert($('languagePicker').open);assert($('languageBack').hidden);assert.equal($('languageZH').getAttribute('aria-pressed'),undefined);assert.equal(d.activeElement,$('languageZH'));
 $('languagePicker').fire('cancel');assert($('languagePicker').open);
 $('start').fire('click');assert($('languagePicker').open);
 $('languageEN').fire('click');assert(!$('languagePicker').open);
 assert.equal(d.documentElement.lang,'en');assert.equal($('languageEN').getAttribute('aria-pressed'),'true');assert.equal(d.title,'Pine & Snow · Tree Stacker');
 assert.equal($('panelTitle').textContent,'Stack as high as you can');
 assert.equal(d.activeElement,$('start'));assert.equal(stored.get('snow-pine-language-v1'),'en');
 const reload=harness(640,420,true,null,.5,{storage:stored});
 assert(!reload.$('languagePicker').open);assert.equal(reload.d.documentElement.lang,'en');
 const denied=harness(640,420,true,null,.5,{firstVisit:true,denyStorage:true});
 denied.$('languageZH').fire('click');assert(!denied.$('languagePicker').open);
 denied.$('start').fire('click');assert(denied.$('panel').hidden);
});
test('focus-mode language switch freezes only the modal time and preserves live run',()=>{
 const h=harness(390,650),{$,d,w}=h;
 $('start').fire('click');h.follow(true);h.advance(10500);
 const score=$('score').textContent,level=parseInt($('progress').innerHTML,10),hearts=$('hearts').getAttribute('aria-label');
 assert(+score>0);assert(level>=2);
 h.follow(false);
 $('focusToggle').fire('click');$('focusLanguageToggle').fire('click');
 assert($('languagePicker').open);assert(!$('languageBack').hidden);
 h.advance(12000);assert.equal($('score').textContent,score);assert.equal($('hearts').getAttribute('aria-label'),hearts);
 $('languageEN').fire('click');assert.equal(d.activeElement,$('focusLanguageToggle'));
 assert(!$('languagePicker').open);assert($('panel').hidden);assert($('shell').classList.contains('focus-view'));
 assert.equal($('score').textContent,score);assert.equal($('progress').innerHTML,level+'<span> layers</span>');
 assert.match($('hearts').getAttribute('aria-label'),/Lives:/);
 $('focusLanguageToggle').fire('click');$('languagePicker').fire('cancel');
 assert(!$('languagePicker').open);assert.equal(d.documentElement.lang,'en');
 w.fire('keydown',{key:'Escape'});w.fire('keydown',{key:'Escape'});
 assert.equal($('panelTitle').textContent,'Paused');
 $('languageToggle').fire('click');$('languageZH').fire('click');
 assert.equal($('panelTitle').textContent,'雪夜暂停');assert.equal($('score').textContent,score);
});
