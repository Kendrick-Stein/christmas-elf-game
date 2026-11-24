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
 for(const id of ['languagePicker','workshopDialog']){
  const dialog=$(id);dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 }
 const workshopMessages=[];$('workshopFrame').contentWindow={postMessage:(...args)=>workshopMessages.push(args)};
 const finalFrames=[],emitted=[];
 if(options.finale){
  const context={setTransform(){}};$('journeyFinale').getContext=()=>context;
  w.ElfJourneyFinale={duration:5.6,paint:(_ctx,p)=>finalFrames.push(p)};
  w.dispatchEvent=e=>emitted.push(e.type);
 }
 const leaves=[],elves=[],pixels=[],labels=[],paints=[],actors=[],rings=[];let transform=[],airborne=false;
 $('field').getContext=()=>new Proxy({}, {get:(o,k)=>o[k]??(k==='setTransform'?((...args)=>{transform=args;}):k==='clearRect'?()=>{leaves.length=0;elves.length=0;pixels.length=0;labels.length=0;paints.length=0;actors.length=0;rings.length=0;airborne=false;}:
 k==='setLineDash'?a=>{if(a.length)airborne=true;}:k==='fillRect'?(...pos)=>pixels.push({pos,color:o.fillStyle,alpha:o.globalAlpha}):
 k==='ellipse'?(...args)=>rings.push({args,color:o.strokeStyle,alpha:o.globalAlpha}):k==='stroke'?()=>paints.push(o.strokeStyle):k==='fillText'?t=>labels.push(t):k==='drawImage'?(img,x,y,w,h)=>{if(img.src.includes('/pixel-branch-')){paints.push(airborne?'air-branch':'branch');leaves.push({x:x+w/2,y:y+h/2,w,h:airborne?0:31,actualHeight:h,src:img.src});}if(img.src.includes('/pixel-sled.svg'))elves.push(x+w/2);if(img.src.includes('/sprite-'))actors.push({name:img.src.split('/sprite-')[1].split('.')[0],x:x+w/2,y:y+h/2});if(img.src.includes('/pixel-bell.svg'))paints.push(airborne?'air-bell':'bell');if(img.src.includes('/pixel-cane.svg'))paints.push(airborne?'air-cane':'cane');}:()=>{})});
 let raf,time=0;
 const c=vm.createContext({window:w,document:d,location:{origin:'https://kendrick-stein.github.io'},CustomEvent:class{constructor(type){this.type=type;}},devicePixelRatio:1,matchMedia:q=>({matches:q.includes("reduced-motion")?reduced:true}),Image:class{constructor(){this.complete=true;this.naturalWidth=160;}},requestAnimationFrame:fn=>{raf=fn;},localStorage:{getItem:k=>{if(options.denyStorage&&k==='snow-pine-language-v1')throw Error('denied');return stored.get(k);},setItem:(k,v)=>{if(options.denyStorage&&k==='snow-pine-language-v1')throw Error('denied');stored.set(k,v);}}});
 Object.assign(c,{console});
 vm.runInContext('globalThis.Math.random=()=>'+random,c);
 vm.runInContext(read('game-core.js'),c);
 w.ElfCore=c.ElfCore;
 if(eventPick!==null){const pick=w.ElfCore.nextEvent;w.ElfCore.nextEvent=(...args)=>pick(...args,()=>eventPick);}

 vm.runInContext(read('locale.js'),c);
 const script=read('game.js');
 vm.runInContext(options.inspect?script.replace(/\}\)\(\);\s*$/, `window.testGame={state:()=>state,tips:hintSkill,finish:lose,decor:()=>ornaments};})();`):script,c);
 let tracking=false;
 const point=x=>{$('field').fire('pointerdown',{pointerId:1,clientX:x});$('field').fire('pointermove',{pointerId:1,clientX:x});$('field').fire('pointerup',{pointerId:1});};
 return {$,w,d,point,leaves,elves,pixels,labels,paints,actors,rings,finalFrames,emitted,workshopMessages,stored,transform:()=>transform,setSize:(w,h)=>{size.width=w;size.height=h;},follow:b=>tracking=b,advance:ms=>{for(let i=0;i<ms;i+=16){
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
 const {$,w,advance,follow,leaves,stored}=harness();$('start').fire('click');follow(true);
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
 assert.deepEqual(JSON.parse(stored.get('snow-pine-skill-tips-v1')).sort(),['compress','magnet','stable','wide']);
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
 $('helpClose').fire('click');assert($('rules').hidden);assert.equal(d.activeElement,$('settingsToggle'));
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
 assert(!sprites.some(url=>url.includes('/pixel-sled.svg')));
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
 assert.equal(d.documentElement.lang,'en');assert.equal($('languageEN').getAttribute('aria-pressed'),'true');assert.equal(d.title,'Pine & Snow · Christmas Arcade');
 assert.equal($('panelTitle').textContent,'Christmas Arcade');
 assert.equal($('defenseHome').hidden,false);
 assert($('shell').classList.contains('is-arcade'));
 assert.equal(d.activeElement,$('start'));assert.equal(stored.get('snow-pine-language-v1'),'en');
 const reload=harness(640,420,true,null,.5,{storage:stored});
 assert(!reload.$('languagePicker').open);assert.equal(reload.d.documentElement.lang,'en');
 reload.$('start').fire('click');assert.equal(reload.d.title,'Pine & Snow · Tree Stacker');
 assert(reload.$('defenseHome').hidden);assert(!reload.$('shell').classList.contains('is-arcade'));
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

test('visitor cue phases animate to the sled, then reverse only on the existing countdown',()=>{
 const h=harness(390,650,false,.01,.5),{$,actors,paints,elves,w}=h;
 waitForEvent(h,'green');
 const start=actors[0].x;
 const tap=()=>{$('right').fire('pointerdown',{pointerId:7,pointerType:'touch'});$('right').fire('pointerup',{pointerId:7,pointerType:'touch'});h.advance(16);};
 const cart=elves[0];tap();assert(elves[0]>cart);
 h.advance(600);
 assert(actors[0].x<start-15);assert(!paints.includes('#b5df81'));
 $('focusToggle').fire('click');$('focusLanguageToggle').fire('click');
 const pose={...actors[0]};h.advance(7000);assert.deepEqual(actors[0],pose);
 $('languageEN').fire('click');assert.match($('eventHud').textContent,/will reverse/);
 for(let i=0;i<112&&!paints.includes('#b5df81');i++)h.advance(16);
 assert.match($('eventHud').textContent,/reversed · 4s/);assert(paints.includes('#b5df81'));
 const reversed=elves[0];tap();assert(elves[0]<reversed);
 w.fire('keydown',{key:'Escape'});assert(!$('shell').classList.contains('focus-view'));
});
test('Santa lands beside the sled and presents a bounded expanding ring; reduced motion stays static',()=>{
 for(const reduced of [false,true]){
   const h=harness(390,650,reduced,.5,.5);
   waitForEvent(h,'santa');
   const initial=h.actors[0].y;h.advance(650);
   const current=h.actors[0].y;
   if(reduced)assert(Math.abs(initial-current)<3);
   else assert(current>initial+15);
   for(let i=0;i<90&&!h.rings.length;i++)h.advance(16);
   assert(h.rings.length);const first=h.rings[0];h.advance(240);const later=h.rings[0];
   assert(later);assert.equal(later.color,'#ffd499');
   if(reduced)assert.equal(first.args[2],later.args[2]);
   else assert(later.args[2]>first.args[2]+10&&later.alpha<first.alpha);
   h.advance(800);assert.equal(h.rings.length,0);
 }
});
test('both reindeer fly toward the same existing target and icy lane stays marked and fixed',()=>{
 for(const [name,random,color] of [['gold',.49,'#ffda83'],['blue',.5,'#b5e1ff']]){
   const h=harness(640,420,false,.99,random);
   waitForEvent(h,name);
   const start=h.actors[0].x;
   const lane=()=>h.pixels.find(p=>p.color==='#98c9fa38')?.pos[0];
   const fixed=lane();if(name==='blue')assert(Number.isFinite(fixed));
   h.advance(590);assert(h.actors[0].x>start+40);
   assert(h.pixels.some(p=>p.color===color));
   if(name==='blue'){assert.equal(lane(),fixed);h.point(555);h.advance(500);assert.equal(lane(),fixed);}
   const still=harness(640,420,true,.99,random);
   waitForEvent(still,name);const old=still.actors[0].x;
   still.advance(550);assert.equal(still.actors[0].x,old);
   assert(!still.pixels.some(p=>p.color===color));
   if(name==='blue')assert(still.pixels.some(p=>p.color==='#98c9fa38'));
 }
});

test('bottom touch holds ignore native callouts without trapping selection elsewhere',()=>{
 const {$,advance,elves}=harness(390,650);$('start').fire('click');advance(32);
 const before=elves[0];$('right').fire('pointerdown',{pointerId:27,pointerType:'touch'});advance(256);
 let cancelled=0;const event=()=>({pointerType:'touch',preventDefault(){cancelled++;}});
 $('controls').fire('contextmenu',event());assert.equal(cancelled,1);
 $('shareLink').fire('contextmenu',event());$('sensitivity').fire('contextmenu',event());$('field').fire('contextmenu',event());assert.equal(cancelled,1);
 advance(160);assert(elves[0]>before+65);
 $('right').fire('pointerup',{pointerId:27});advance(16);const released=elves[0];
 advance(96);assert.equal(elves[0],released);
 $('left').fire('pointerdown',{pointerId:28,pointerType:'touch'});advance(160);
 $('left').fire('pointercancel',{pointerId:28});advance(16);const interrupted=elves[0];
 advance(96);assert.equal(elves[0],interrupted);
});

test('skill tips are nonblocking, localized and persisted only when actually shown',()=>{
 const opts={inspect:true},h=harness(390,650,true,null,.50,opts),{$,w}=h;
 $('start').fire('click');h.advance(800);
 w.testGame.tips('wide');w.testGame.tips('magnet');w.testGame.tips('wide');
 assert.deepEqual(JSON.parse(h.stored.get('snow-pine-skill-tips-v1')),['wide']);
 assert(!$('skillTip').hidden);assert.equal($('skillTip').dataset.kind,'wide');
 assert.match($('skillTipText').textContent,/8 秒/);
 const before=h.elves[0];
 $('right').fire('pointerdown',{pointerId:19,pointerType:'touch'});h.advance(130);
 $('right').fire('pointerup',{pointerId:19});h.advance(16);
 assert(h.elves[0]>before+10);
 $('languageToggle').fire('click');$('languageEN').fire('click');assert.match($('skillTipText').textContent,/8 seconds/);
 h.advance(4700);
 assert.deepEqual(JSON.parse(h.stored.get('snow-pine-skill-tips-v1')),['wide','magnet']);
 assert.equal($('skillTip').dataset.kind,'magnet');
 const reload=harness(390,650,true,null,.50,{...opts,storage:h.stored});
 reload.$('start').fire('click');reload.w.testGame.tips('wide');assert(reload.$('skillTip').hidden);
});
test('risk warning follows raw 35 and 68 thresholds without moving any rendered branch',()=>{
 for(const reduced of [false,true]){
   const h=harness(390,650,reduced,null,.50,{inspect:true}),{$,w}=h;
   $('start').fire('click');h.advance(4800);
   const state=w.testGame.state(),laid=()=>h.leaves.filter(x=>x.h===31).map(x=>[x.x,x.y,x.w]);
   state.layers[0].x=15;
   state.risk=34.99;h.advance(16);assert($('riskHint').hidden);const before=laid();
   state.risk=35;h.advance(16);assert.equal($('riskHint').dataset.kind,'warn');assert.match($('riskHint').textContent,/35%/);
   state.risk=67.99;h.advance(16);assert.equal($('riskHint').dataset.kind,'warn');
   state.risk=68;h.advance(16);assert.equal($('riskHint').dataset.kind,'high');assert.equal($('riskHint').textContent,'危险 68%');
   assert(h.pixels.some(p=>p.color==='#ffc0a0'));assert.deepEqual(laid(),before);
   const glow=()=>h.pixels.filter(p=>p.color==='#ffc0a0').map(p=>p.pos);
   const initial=glow();h.advance(160);
   if(reduced)assert.deepEqual(glow(),initial);else assert.notDeepEqual(glow(),initial);
   $('languageToggle').fire('click');$('languageEN').fire('click');h.advance(16);assert.match($('riskHint').textContent,/Danger 68%/);
   state.risk=22;h.advance(16);assert($('riskHint').hidden);
 }
});
test('quiet settings default, do not hijack select keys, settlement mode resets on replay',()=>{
 const h=harness(1280,720,true,null,.50,{inspect:true}),{$,w,d}=h;
 assert($('rules').hidden);
 $('start').fire('click');h.advance(16);
 const before=h.elves[0];$('settingsMenu').open=true;$('settingsMenu').fire('toggle');
 w.fire('keydown',{key:'ArrowRight',target:{tagName:'SELECT'}});h.advance(96);
 assert.equal(h.elves[0],before);
 w.fire('keydown',{key:'Escape'});assert(!$('settingsMenu').open);assert.equal(d.activeElement,$('settingsToggle'));
 h.advance(4016);w.testGame.finish();
 assert.equal($('panel').dataset.mode,'lost');assert($('shell').classList.contains('is-settlement'));
 assert(!$('resultScore').hidden);assert.equal($('resultScoreValue').textContent,w.testGame.state().score.toString());
 $('start').fire('click');assert.equal($('panel').dataset.mode,'playing');assert(!$('shell').classList.contains('is-settlement'));
});

test('perfect streak pulses during the existing festival and scenery cycles without touching state',()=>{
 for(const reduced of [false,true]){
   const h=harness(390,650,reduced,null,.50,{inspect:true}),{$,w}=h;
   $('start').fire('click');h.follow(true);
   for(let i=0;i<600&&!$('screen').dataset.festivalPulse;i++)h.advance(48);
   const game=w.testGame.state();assert.equal(game.combo,4);assert(game.festival>0);
   assert.equal($('screen').dataset.festivalPulse,'on');
   const snow=()=>h.pixels.filter(p=>p.color==='#e6f6ff').map(p=>p.pos);
   assert(snow().length>0);const pos=snow();h.advance(90);
   if(reduced)assert.deepEqual(snow(),pos);else assert.notDeepEqual(snow(),pos);
   h.advance(1260);assert(!$('screen').dataset.festivalPulse);assert(game.festival>0);
   h.follow(false);
   const original=game.layers.map(row=>[row.x,row.w]),score=game.score,hearts=game.hearts;
   for(const [landed,scene] of [[8,'1'],[16,'2'],[24,'0'],[56,'1']]){
     game.landed=landed;h.advance(16);assert.equal($('screen').dataset.scene,scene);
   }
   assert.deepEqual(game.layers.map(row=>[row.x,row.w]),original);
   assert.equal(game.score,score);assert.equal(game.hearts,hearts);
 }
});
test('tilt settlement and share expose the exact compact retained prefix; time or language does not rebuild it',()=>{
 const h=harness(640,420,true,null,.50,{inspect:true}),{$,w}=h;
 $('start').fire('click');h.advance(16);
 const game=w.testGame.state();
 const rows=[{x:0,w:108},{x:4,w:87},{x:27,w:56},{x:75,w:44}];
 game.layers.push(...rows);game.level=4;game.reason='tilt';game.score=321;game.hearts=3;game.lights=2;game.decorations=1;
 w.testGame.decor().set(0,[{kind:'festival',seed:1,dx:-7,dy:-10}]);
 w.testGame.decor().set(1,[{kind:'bell',seed:3,dx:12,dy:-8}]);
 w.testGame.decor().set(3,[{kind:'string',seed:5,dx:0,dy:-6}]);
 w.testGame.finish();
 const snap=w.ElfShareSource.snapshot(),kept=w.ElfCore.retainedCount(rows,'tilt');
 assert(kept>=2&&kept<rows.length);
 assert.equal(snap.level,kept);assert.equal(snap.finalHeight,4);assert.equal(snap.dropped,4-kept);
 assert.equal(snap.score,321);assert.equal(game.hearts,3);
 assert.equal(snap.lights,1);assert.equal(snap.decorations,1);
 assert.deepEqual(Array.from(snap.layers,l=>[l.x,l.w]),rows.slice(0,kept).map(l=>[l.x,l.w]));
 assert.equal(snap.layers[1].ornaments[0].kind,'bell');assert(Object.isFrozen(snap.layers[1].ornaments[0]));
 assert.match($('panelText').textContent,/原叠 4 层/);
 $('languageToggle').fire('click');$('languageEN').fire('click');
 assert.match($('panelText').textContent,/4 stacked/);
 assert.strictEqual(w.ElfShareSource.snapshot(),snap);
 $('start').fire('click');assert.equal(w.ElfShareSource.snapshot(),null);
});

test('finale freezes run, honors hidden time, releases one identical snapshot on finish or skip and then replays',()=>{
 const h=harness(390,650,false,null,.50,{inspect:true,finale:true}),{$,d,w}=h;
 $('start').fire('click');h.advance(4800);
 const game=w.testGame.state(),elapsed=game.elapsed,score=game.score;
 w.testGame.finish();const snap=w.ElfShareSource.snapshot();
 assert(snap.layers.length>=1);assert($('shell').classList.contains('is-finale'));assert($('panel').hidden);
 assert.equal(d.activeElement,$('skipFinale'));assert(!$('journeyFinale').hidden);
 h.advance(700);const mark=h.finalFrames.at(-1);
 assert.strictEqual(mark.snapshot,snap);assert.equal(mark.width,390);assert.equal(mark.height,650);
 assert.equal(typeof mark.source.drawTree,'function');assert.equal(typeof mark.source.drawSled,'function');
 assert(!h.emitted.includes('elf:settlement'));assert.equal(game.elapsed,elapsed);assert.equal(game.score,score);
 d.hidden=true;h.advance(8500);assert(!h.emitted.includes('elf:settlement'));assert.equal(h.finalFrames.at(-1).time,mark.time);d.hidden=false;
 h.advance(5100);assert(!$('panel').hidden);assert($('journeyFinale').hidden);assert($('shell').classList.contains('is-settlement'));
 assert.strictEqual(w.ElfShareSource.snapshot(),snap);assert.equal(h.emitted.filter(x=>x==='elf:settlement').length,1);
 $('skipFinale').fire('click');assert.equal(h.emitted.filter(x=>x==='elf:settlement').length,1);
 $('start').fire('click');assert(!w.ElfShareSource.snapshot());assert($('panel').hidden);
 w.testGame.finish();assert($('shell').classList.contains('is-finale'));
 $('skipFinale').fire('click');assert(!$('panel').hidden);assert.equal(h.emitted.filter(x=>x==='elf:settlement').length,2);
});
test('reduced-motion finale paints one static end pose briefly, including zero-layer loss',()=>{
 const h=harness(390,650,true,null,.50,{inspect:true,finale:true}),{$,w}=h;
 $('start').fire('click');h.advance(16);w.testGame.finish();h.advance(800);
 assert.equal(w.ElfShareSource.snapshot().level,0);
 assert(h.finalFrames.every(f=>f.reduced&&f.time===5.6));assert($('panel').hidden);
 h.advance(560);assert(!$('panel').hidden);
});

test('animated break receives only actual upper rows and uses retained star threshold',()=>{
 const h=harness(640,420,false,null,.50,{inspect:true,finale:true}),{$,w}=h;
 $('start').fire('click');h.advance(16);
 const run=w.testGame.state();run.level=12;run.reason='tilt';
 run.layers.push(...Array.from({length:12},(_,i)=>({x:0,w:80,index:i%8})));
 const ornament={kind:'bell',seed:3,dx:-9,dy:-10};w.testGame.decor().set(11,[ornament]);
 w.testGame.finish();h.advance(16);
 const {before,removed,snapshot}=h.finalFrames.at(-1);
 assert.equal(before.level,12);assert.equal(before.star,true);assert.equal(snapshot.level,11);assert.equal(snapshot.star,false);
 assert.equal(removed.length,1);assert.strictEqual(removed[0],before.layers[11]);
 assert.deepEqual({...removed[0].ornaments[0]},ornament);assert(Object.isFrozen(before.layers));
 assert(snapshot.layers.every(row=>row.ornaments.length===0));
 $('skipFinale').fire('click');assert.strictEqual(snapshot,w.ElfShareSource.snapshot());
});

test('home workshop is same-origin, lazy, separate from the ready game and returns focus',()=>{
 const h=harness(390,700,true,null,.5,{inspect:true,finale:true}),{$,d,w}=h;
 assert.equal($('workshopFrame').src,undefined);assert.equal(h.emitted.length,0);
 $('workshopHome').fire('click');assert($('workshopDialog').open);
 assert.equal($('workshopFrame').src,'./workshop/index.html');
 assert.equal($('workshopBack').textContent,'返回首页');assert.equal(d.activeElement,$('workshopBack'));
 h.advance(11000);assert.equal(w.testGame.state().elapsed,0);
 assert.deepEqual(h.workshopMessages.at(-1).map(x=>typeof x==='object'?x.language:x),['zh','https://kendrick-stein.github.io']);
 w.fire('message',{origin:'https://different.example',source:$('workshopFrame').contentWindow,data:{type:'pine:workshop-close'}});
 assert($('workshopDialog').open);
 $('workshopBack').fire('click');assert(!$('workshopDialog').open);
 assert.equal(d.activeElement,$('workshopHome'));assert.equal(h.emitted.length,0);
 assert(!$('panel').hidden);$('start').fire('click');assert.deepEqual(h.emitted,['elf:reset']);
});
test('workshop is unavailable while playing, paused, watching finale, or settled',()=>{
 const h=harness(390,700,true,null,.5,{inspect:true,finale:true}),{$,w}=h;
 const cannotOpen=()=>{
   assert($('workshopHome').hidden);
   $('workshopHome').fire('click');assert(!$('workshopDialog').open);
   assert.equal($('workshopFrame').src,undefined);
 };
 $('start').fire('click');h.follow(true);h.advance(10000);h.follow(false);
 cannotOpen();const game=w.testGame.state(),elapsed=game.elapsed;
 w.fire('keydown',{key:'Escape'});cannotOpen();h.advance(1000);assert.equal(game.elapsed,elapsed);
 $('start').fire('click');cannotOpen();h.advance(100);assert(game.elapsed>elapsed);assert.strictEqual(w.testGame.state(),game);
 w.testGame.finish();cannotOpen();
 $('skipFinale').fire('click');cannotOpen();assert.deepEqual(h.emitted,['elf:reset','elf:settlement']);
 $('start').fire('click');cannotOpen();assert.deepEqual(h.emitted,['elf:reset','elf:settlement','elf:reset']);
});
