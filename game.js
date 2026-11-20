(() => {
'use strict';
const C=window.ElfCore,$=id=>document.getElementById(id),canvas=$('field'),g=canvas.getContext('2d'),screen=$('screen'),panel=$('panel'),start=$('start'),left=$('left'),right=$('right'),banner=$('banner');
const W=640,H=420,CL=46,CR=W-46,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a,b)=>Math.max(a,Math.min(x,b));
const art={};for(const n of ['sled','bulb',...Array.from({length:8},(_,i)=>'branch-'+i)]){art[n]=new Image();art[n].src='./assets/pixel-'+n+'.svg';}
const snow=Array.from({length:42},(_,i)=>({x:(i*137.5)%W,y:(i*83.4)%H,r:1+i%3*.42,v:8+i%7*2}));
const TINTS=['#ffd979','#ff849b','#88edcf','#9bb9ff'];
const tones={bad:[176,132],nice:[523],bright:[659,784],festival:[523,659,784,1047]};
const motion={keys:new Set(),buttons:new Map(),pointer:null};
const sensitivityKey='snow-pine-input-v1', sensitivityScale={low:.66,medium:1,high:1.36};
let sensitivity='medium';
try{const previous=localStorage.getItem(sensitivityKey);if(Object.hasOwn(sensitivityScale,previous))sensitivity=previous;}catch{}
$('sensitivity').value=sensitivity;
$('sensitivity').addEventListener('change',e=>{const key=e.target.value;if(Object.hasOwn(sensitivityScale,key)){sensitivity=key;try{localStorage.setItem(sensitivityKey,key);}catch{}}});
let ornaments=new Map(),stringWait=7.4,lightSerial=0;
let mode='ready',state=C.fresh(),x=W/2,leaf=null,lights=[],pickup=null,effects=[],camera=0,wait=.4,last=0,clock=0,wave=0,bulbWait=0,notice=0,display='',muted=true,audio=null;
const POWERS=['compress','wide','magnet'],P_LABEL={compress:'压缩',wide:'加宽',magnet:'吸附',stable:'稳固'},P_ICON={compress:'⇣',wide:'↔',magnet:'∪',stable:'✦'},P_COLOR={compress:'#f8b0b4',wide:'#ffde8a',magnet:'#a5f1df'};let nextPower=3,powerCount=0;
let best={level:0,score:0};const recordKey='snow-pine-tower-v3';
try{const raw=JSON.parse(localStorage.getItem(recordKey));if(raw&&Number.isFinite(raw.level)&&Number.isFinite(raw.score))best={level:Math.max(0,raw.level),score:Math.max(0,raw.score)};}catch{}
const shell=$('shell'),rules=$('rules'),focusToggle=$('focusToggle'),helpToggle=$('helpToggle'),helpClose=$('helpClose');
const railMedia=matchMedia('(min-width: 900px)');
let focusMode=false,helpPreference=null,helpVisible=false,view=C.viewport(W,H);
function setHelp(value,restore=false){
 helpVisible=value;rules.hidden=!value;shell.classList.toggle('help-open',value);
 helpToggle.setAttribute('aria-expanded',String(value));
 if(restore)helpToggle.focus({preventScroll:true});
}
function defaultHelp(){if(!focusMode)setHelp(helpPreference??railMedia.matches);}
function toggleFocus(){
 focusMode=!focusMode;shell.classList.toggle('focus-view',focusMode);
 if(focusMode)setHelp(false);else defaultHelp();
 focusToggle.setAttribute('aria-pressed',String(focusMode));
 focusToggle.setAttribute('aria-label',focusMode?'退出放大模式':'打开放大模式');
 focusToggle.textContent=focusMode?'↙':'↗';
 resetInput();focusToggle.focus({preventScroll:true});resize();
}
helpToggle.addEventListener('click',()=>{
 helpPreference=!helpVisible;setHelp(helpPreference);
 if(helpVisible)helpClose.focus({preventScroll:true});resize();
});
helpClose.addEventListener('click',()=>{helpPreference=false;setHelp(false,true);resize();});
focusToggle.addEventListener('click',toggleFocus);
railMedia.addEventListener?.('change',defaultHelp);defaultHelp();
function resize(){
 const d=Math.min(devicePixelRatio||1,2),b=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(b.width*d)),h=Math.max(1,Math.round(b.height*d));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 view=C.viewport(w,h,W,H);
}
if(typeof ResizeObserver==='function')new ResizeObserver(resize).observe(screen);else window.addEventListener('resize',resize);
resize();
function enterSky(y,vy){const extra=Math.max(0,view.extra-8);return {y:y-extra,skyLine:y,skyV:Math.max(vy,extra/.72)};}
function falling(o,dt){const a=C.fall(o.y,dt,o.vy,o.skyLine,o.skyV);o.y=a.y;return a.normal;}
function sprite(name,x,y,w,h){
 const im=art[name];if(!im.complete||!im.naturalWidth)return false;
 g.drawImage(im,x-w/2,y-h/2,w,h);return true;
}
function star(x,y,r,color){
 g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,d=i%2?r*.41:r,px=x+d*Math.cos(a),py=y+d*Math.sin(a);if(i)g.lineTo(px,py);else g.moveTo(px,py);}g.closePath();g.fillStyle=color;g.fill();
}
function label(text,px,py,color='#d2f5c0'){
 effects.push({x:clamp(px,58,W-58),y:py,text,color,ttl:1});
}
function show(s){banner.textContent=s;banner.hidden=false;notice=2.25;$('announcer').textContent=s;}
function tone(kind){
 if(muted||!audio)return;
 try{tones[kind].forEach((hz,i)=>{const t=audio.currentTime+i*.08,o=audio.createOscillator(),a=audio.createGain();o.frequency.value=hz;a.gain.setValueAtTime(.001,t);a.gain.exponentialRampToValueAtTime(.10,t+.025);a.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(a).connect(audio.destination);o.start(t);o.stop(t+.17);});}catch{}
}
function wind(){return C.difficulty(state).wind*(Math.floor(state.level/3)%2?-1:1);}
function createLeaf(){
 const d=C.difficulty(state),top=C.support(state),supportX=x+top.x,y0=camera-22,flight=Math.max(.73,(C.surface(state)-y0)/d.speed);
 const maxReach=Math.min(205,Math.max(102,(flight-.13)*370)),distance=wave===0?0:(Math.random()-.5)*2*maxReach;
 const reachableEnd=clamp(supportX+distance,Math.max(116,CL+top.x-12),Math.min(W-116,CR+top.x+12));
 const startX=clamp(reachableEnd-wind()*flight*.8,42,W-42);
 const sign=Math.random()<.5?-1:1, wobble=state.level>7?sign*(7+Math.random()*15):0;
 const vy=d.speed+Math.random()*9;leaf={x:startX,...enterSky(y0,vy),w:C.nextWidth(state),branch:state.level%8,vy,vx:wind(),wobble,phase:0,goingPast:false};
 wave++;
}
function createBulb(kind){
 const top=C.support(state),topX=x+top.x;
 const string=kind==='string',vy=string?165:190, vx=wind()*(string?.15:.3);
 const drift=string?vx*Math.max(0,(C.surface(state)-camera+16)/vy):0;
 return {kind,seed:lightSerial++,x:clamp(topX-drift+(Math.random()-.5)*(string?74:180),48,W-48),...enterSky(camera-16,vy),vy,vx};
}
function lose(){
 mode='lost';resetInput();leaf=null;lights=[];pickup=null;banner.hidden=true;
 const old=best;best={level:Math.max(old.level,state.level),score:Math.max(old.score,state.score)};
 const record=best.level>old.level||best.score>old.score;
 if(record)try{localStorage.setItem(recordKey,JSON.stringify(best));}catch{}
 screen.classList.remove('celebrating');
 $('panelIcon').textContent=state.level>=C.STAR_AT?'✦':'❄';
 $('panelTag').textContent=record?'NEW HIGH SCORE':'SNOWFALL SETTLEMENT';
 $('panelTitle').textContent=state.reason==='tilt'?'哎呀，树倒了！':'雪夜到站';
 $('panelText').textContent=state.level+' 层 · '+state.score+' 分 · '+state.lights+' 盏彩灯';
 $('panelFine').textContent='最长精准连击 '+state.bestCombo;button('再垒一棵');panel.hidden=false;
 $('announcer').textContent=$('panelTitle').textContent+'，'+$('panelText').textContent;
 start.focus({preventScroll:true});tone('bad');hud();
}
function onMiss(o){
 const before=state.score;C.miss(state);
 const points=before-state.score;
 label(points?'−'+points+' 分 · −1 心':'漏接 · −1 心',o.x,clamp(C.surface(state)-camera-19,45,330),'#ffd1c0');
 show(points?'漏接：−'+points+' 分、−1 心':'漏接：−1 心');
 tone('bad');wait=.29;
 if(state.status==='lost')lose();
}
function spawnPower(){
 const type=POWERS[powerCount++%POWERS.length],target=x+C.support(state).x;
 const y=camera-15,vy=151+Math.min(55,state.level*3),vx=wind()*.22;
 const drift=vx*Math.max(.6,(C.surface(state)-y)/vy);
 return {type,x:clamp(target-drift+(Math.random()-.5)*58,33,W-33),...enterSky(y,vy),vy,vx};
}
function update(dt){
 const healed=C.tick(state,dt),base=C.worldTop(state);
 if(healed){
   label('+1 心',x+C.support(state).x,clamp(C.surface(state)-camera-38,43,330),'#ffadbd');
   $('announcer').textContent='恢复一颗心';
 }
 camera+=(base-camera)*Math.min(1,dt*6.2);screen.style.setProperty('--pan',Math.round(Math.min(32,-camera*.17))+'px');
 const keys=motion.keys,buttonRate=k=>{
   const p=motion.buttons.get(k);if(!p)return 0;
   p.age+=dt;
   // A normal touch microtap stays a single tiny nudge; only long holds coast.
   return p.touch?(p.age<=.070?0:Math.min(.89,.48+(p.age-.070)*2.8)):1;
 };
 const keyboard=(keys.has('ArrowRight')||keys.has('d')||keys.has('D')?1:0)-(keys.has('ArrowLeft')||keys.has('a')||keys.has('A')?1:0);
 const buttons=buttonRate('right')-buttonRate('left');
 const d=keyboard||buttons;
 if(d)x=clamp(x+d*445*sensitivityScale[sensitivity]*dt,CL,CR);
 const topY=C.surface(state);
 if(!leaf){wait-=dt;if(wait<=0)createLeaf();}
 if(leaf){
   const old=leaf.y,edge=leaf.w*.11;
   const driftDt=falling(leaf,dt);leaf.phase+=driftDt;
   leaf.x+=driftDt*(leaf.vx+leaf.wobble*Math.sin(leaf.phase*5)+(!leaf.goingPast?C.attract(state,x,leaf.x):0));
   if(leaf.x<leaf.w*.38||leaf.x>W-leaf.w*.38){leaf.x=clamp(leaf.x,leaf.w*.38,W-leaf.w*.38);leaf.vx=-leaf.vx;}
   if(!leaf.goingPast&&C.crossesSurface(old+edge,leaf.y+edge,topY)){
     const o=leaf,p=C.land(state,x,o.x,o.w);
     if(p.rating==='miss'){leaf.goingPast=true;onMiss(o);if(mode==='lost')return;}
     else{
       leaf=null;wait=Math.max(.15,.34-state.level*.008);
       label(p.rating==='perfect'?'稳稳的 +30':p.rating==='close'?'靠中 +20':'悬边 +10',o.x,topY-camera-24,p.rating==='catch'?'#ffc78b':'#d2f5c0');
       tone(p.festival?'festival':p.rating==='perfect'?'bright':'nice');
       if(!pickup&&state.level>=nextPower){pickup=spawnPower();nextPower=state.level+4;wait=Math.max(wait,.52);}
       if(p.star)show('✦ 星星亮了！');
       else if(p.festival){bulbWait=0;show('✦ 彩灯雨');}
       else if(state.risk>=68&&notice<=0)show('快倒了！对准树顶');
       if(state.status==='lost'){lose();return;}
     }
   }
   if(leaf&&leaf.y+40>=camera+H){leaf=null;wait=.24;}
 }
 if(pickup){
   const p=pickup,old=p.y,top=C.receiving(state),y=C.surface(state);
   const driftDt=falling(p,dt);p.x=clamp(p.x+p.vx*driftDt,26,W-26);
   if(C.crossesSurface(old,p.y,topY,y)&&Math.abs(p.x-(x+top.x))<=top.w*.5+14){
     pickup=null;
     if(C.power(state,p.type)){
       show(p.type==='compress'?'⇣ 压缩 · 降低晃动':P_ICON[p.type]+' '+P_LABEL[p.type]+' · '+C.BUFF_DURATION+' 秒');
       tone('bright');
     }
   }else if(p.y>camera+H+25)pickup=null;
 }
 stringWait-=dt;
 if(stringWait<=0&&state.level>0&&state.festival<=0&&!lights.some(o=>o.kind==='string')&&lights.length<6){
   lights.push(createBulb('string'));stringWait=6+Math.random()*2;
 }
 if(state.festival>0){bulbWait-=dt;if(bulbWait<=0&&lights.length<6){lights.push(createBulb('festival'));bulbWait=.72;}}
 for(let i=lights.length-1;i>=0;i--){
   const o=lights[i],old=o.y;const driftDt=falling(o,dt);o.x=clamp(o.x+o.vx*driftDt,28,W-28);
   const y=C.surface(state),top=C.receiving(state);
   if(C.crossesSurface(old,o.y,topY,y)&&Math.abs(o.x-(x+top.x))<top.w*.55+12){
     lights.splice(i,1);const points=C.light(state,o.kind);
     if(state.level>0){
       const row=state.level-1,entry=ornaments.get(row)||{};
       entry[o.kind]={seed:o.seed,side:o.x<x+top.x?-1:1};ornaments.set(row,entry);
     }
     label((o.kind==='string'?'灯串':'彩灯')+' +'+points+' · 稳固',o.x,y-camera-29,'#ffd47e');tone('bright');
   }else if(o.y>=y+25)lights.splice(i,1);
 }
 for(const f of effects){f.y-=dt*28;f.ttl-=dt;}
 effects=effects.filter(f=>f.ttl>0);
 if(notice>0){notice-=dt;if(notice<=0)banner.hidden=true;}
 hud();
}
function frame(t){
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,canvas.width,canvas.height);
 g.setTransform(view.scale,0,0,view.scale,view.insetX,0);g.imageSmoothingEnabled=false;
 const viewY=camera-view.extra,tall=view.worldHeight;
 const weather=Math.min(1,state.level/20),time=reduce?0:t/1000,wx=wind();
 for(const s of snow){
  g.globalAlpha=.32+weather*.30;const sx=((s.x+time*wx*.29)%W+W)%W, sy=(s.y+time*(s.v+weather*38))%tall;
  g.fillStyle='#b4dcf2';const p=s.r+(weather>.6?1:0);g.fillRect(Math.round(sx),Math.round(sy),p,p);
 }
 g.globalAlpha=1;
 if(state.festival>0){g.fillStyle='#ffd8010b';g.fillRect(0,0,W,tall);}
 const collapse=mode==='lost'&&state.reason==='tilt',offset=collapse?Math.min(1,Math.max(0,(t-clock)/650)):0;
 const cartY=C.CART_Y-viewY;
 const s=C.support(state),tipY=C.surface(state)-viewY,topX=x+s.x;
 const recv=C.receiving(state);
 const color=state.risk>=68?'#ffbbab':state.risk>=35?'#ffdc91':'#d6f4c9';
 const visibleLo=Math.max(0,Math.floor((cartY-tall-55)/state.spacing));
 const visibleHi=Math.min(state.level-1,Math.ceil((cartY+45)/state.spacing));
 const rowX=i=>x+state.layers[i].x+offset*Math.sign(s.x||1)*i*i*.8;
 const rowY=i=>cartY-i*state.spacing+offset*i*9;
 if(cartY<tall+80){
  g.fillStyle='#223e64aa';g.fillRect(Math.round(x)-57,Math.round(cartY)+34,115,6);
  const sw=C.TRAY/142*200,sh=sw/2;
  if(!sprite('sled',Math.round(x),Math.round(cartY)-sh*.16,sw,sh)){
     g.fillStyle='#994e61';g.fillRect(x-C.TRAY/2,cartY, C.TRAY,13);
     g.fillStyle='#ffd284';g.fillRect(x-C.TRAY/2,cartY,C.TRAY,4);
  }
 }
 if(state.level&&cartY<tall+40&&!collapse){
   const trunkX=Math.round(x+state.layers[0].x);
   g.fillStyle='#72503f';g.fillRect(trunkX-8,cartY-16,16,17);
   g.fillStyle='#b4835d';g.fillRect(trunkX-5,cartY-15,4,14);
 }
 for(let i=visibleLo;i<=visibleHi;i++){
   const l=state.layers[i],py=rowY(i),px=rowX(i),age=state.level-1-i;
   drawBranch(px,py,l.w,i%8);
   if(collapse)continue;
   const o=ornaments.get(i);
   if(o?.string)lightString(px,py-13,l.w*.32,o.string.seed,time);
   if(o?.festival)pixelBulb(px+o.festival.side*l.w*.27,py-8,o.festival.seed,time,5);
   if(state.level>=C.STAR_AT&&age>1&&i%2===0){
     const side=i%4===0?1:-1;
     pixelBulb(px+side*l.w*.22,py-7,(i*7)%13+2,time,5);
   }
 }
 if(state.level>=C.STAR_AT&&!collapse){g.shadowColor='#ffd274';g.shadowBlur=13;star(topX,tipY-19,12,'#ffd78b');g.shadowBlur=0;}
 if(!collapse&&mode!=='lost'){
   if(state.buffs.wide>0){
     g.fillStyle='#ffdb8b80';g.fillRect(topX-recv.w*.5,tipY-3,recv.w,5);
     g.fillStyle='#ffeab2';g.fillRect(topX-recv.w*.5,tipY-7,3,8);g.fillRect(topX+recv.w*.5-3,tipY-7,3,8);
   }
   if(state.buffs.magnet>0){
     g.strokeStyle='#a9f3db85';g.lineWidth=1.5;g.beginPath();g.arc(topX,tipY,radiusMagnet(state),Math.PI,Math.PI*2);g.stroke();
   }
   g.lineWidth=1.5;g.strokeStyle=color;g.setLineDash([4,4]);g.beginPath();g.moveTo(topX-s.w*.52,tipY-1);g.lineTo(topX+s.w*.52,tipY-1);g.stroke();g.setLineDash([]);
   g.fillStyle=color;g.fillRect(topX-1,tipY-8,2,10);
 }
 if(leaf){
   const py=leaf.y-viewY;
   if(!leaf.goingPast&&py<35&&mode==='playing'){
     g.globalAlpha=.85;star(leaf.x,21,7,'#d0ecc9');g.globalAlpha=1;
   }
   drawBranch(leaf.x,py+leaf.w*.11,leaf.w,leaf.branch);
 }
 if(pickup){
   const px=pickup.x,py=pickup.y-viewY,r=15,kind=pickup.type;
   g.save();g.shadowColor=P_COLOR[kind];g.shadowBlur=13;g.fillStyle='#123d39';g.strokeStyle=P_COLOR[kind];g.lineWidth=2.6;
   g.beginPath();
   if(kind==='compress')g.rect(px-r,py-r,2*r,2*r);
   else if(kind==='wide'){g.moveTo(px-r-3,py);g.lineTo(px,py-r);g.lineTo(px+r+3,py);g.lineTo(px,py+r);g.closePath();}
   else g.arc(px,py,r,0,Math.PI*2);
   g.fill();g.stroke();g.shadowBlur=0;
   g.font='900 20px system-ui';g.textAlign='center';g.fillStyle=P_COLOR[kind];g.fillText(P_ICON[kind],px,py+7);g.restore();
 }
 for(const o of lights){
   if(o.kind==='string')lightString(o.x,o.y-viewY,17,o.seed,time,true);
   else if(!sprite('bulb',o.x,o.y-viewY,26,31))star(o.x,o.y-viewY,11,'#ffcc76');
 }
 for(const f of effects){
  g.save();g.globalAlpha=clamp(f.ttl*1.5,0,1);g.font='800 16px system-ui';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#162c29';g.strokeText(f.text,f.x,f.y+view.extra);g.fillStyle=f.color;g.fillText(f.text,f.x,f.y+view.extra);g.restore();
 }
}
function drawBranch(x,bottom,w,index){
 const height=26;
 // The immutable sprite, width and fixed height are identical airborne and stacked.
 if(!sprite('branch-'+index,x,bottom-height/2,w,height)){
   // Keep the same stepped profile during decoding, without an oval placeholder.
   g.fillStyle='#367f63';
   for(let i=0;i<6;i++){const r=w*(.1+i*.08);g.fillRect(x-r,bottom-height+4*i,r*2,5);}
   g.fillRect(x-w*.37,bottom-6,w*.74,4);
 }
}
function pixelBulb(x,y,seed,time,unit){
 const px=Math.round(x),py=Math.round(y),phase=(seed%7)*.91;
 const light=reduce?.84:.76+Math.sin(time*2.1+phase)*.20;
 g.globalAlpha=light*.36;g.fillStyle=TINTS[seed%TINTS.length];g.fillRect(px-unit,py-unit/2,unit*2,unit*2);
 g.globalAlpha=light;g.fillRect(px-unit/2,py,unit,unit+1);
 g.fillStyle='#fff3d3';g.fillRect(px-unit/2,py,2,2);g.globalAlpha=1;
}
function lightString(x,y,w,seed,time,falling=false){
 const px=Math.round(x),py=Math.round(y);
 g.fillStyle=falling?'#98aebb':'#214739';
 for(let i=-4;i<=4;i++)g.fillRect(Math.round(px+w*i/4)-2,py+7-Math.round(i*i*.42),Math.ceil(w/4)+2,2);
 for(let i=-2;i<=2;i++)pixelBulb(px+w*i/2,py+8-Math.round(i*i*1.7),seed+i+2,time,falling?5:4);
}
function radiusMagnet(s){return Math.min(44,25+s.level);}
function hud(){
 const r=Math.round(state.risk),windNow=wind(),tag=[state.score,state.level,state.combo,state.hearts,r,windNow,best.level,best.score,mode,Math.ceil(state.buffs.wide),Math.ceil(state.buffs.magnet),Math.ceil(state.buffs.stable)].join(':');
 if(display===tag)return;display=tag;
 $('score').textContent=String(state.score).padStart(3,'0');$('combo').innerHTML=state.combo+'<span> / 4</span>';
 $('progress').innerHTML=state.level+'<span> 层</span>';$('risk').innerHTML=r+'<span>%</span>';
 $('risk').dataset.alert=r>=68?'high':r>=35?'warn':'';
 $('chapter').textContent=state.level>=C.STAR_AT?'✦ 星树已点亮':state.level>=7?'紧张的风雪':'稳稳起步';
 $('wind').textContent=windNow===0?'无风':(windNow>0?'来风 →':'← 来风')+(Math.abs(windNow)>30?' · 强风':'');
 $('hearts').textContent='♥'.repeat(state.hearts)+'♡'.repeat(C.HEARTS-state.hearts);$('hearts').setAttribute('aria-label','生命 '+state.hearts);
 const active=['stable','wide','magnet'].filter(k=>state.buffs[k]>0),buffs=$('buffs');
 buffs.hidden=!active.length||mode!=='playing';
 buffs.innerHTML=active.map(k=>'<span class="'+k+'">'+P_ICON[k]+' '+P_LABEL[k]+' '+Math.ceil(state.buffs[k])+'s</span>').join('');
 $('best').textContent='最高 '+best.level+' 层 · 最高 '+best.score+' 分';screen.dataset.stage=Math.min(3,Math.floor(state.level/4));
}
function button(text){start.innerHTML=text+' <span aria-hidden="true">↗</span>';}
function resetInput(){motion.keys.clear();motion.buttons.clear();motion.pointer=null;left.classList.remove('held');right.classList.remove('held');}
function begin(){
 if(mode==='paused'){mode='playing';panel.hidden=true;hud();canvas.focus({preventScroll:true});return;}
 mode='playing';state=C.fresh();x=W/2;leaf=null;lights=[];pickup=null;nextPower=3;powerCount=0;ornaments=new Map();stringWait=7.4;lightSerial=0;effects=[];wait=.44;camera=0;wave=0;bulbWait=0;notice=0;resetInput();banner.hidden=true;panel.hidden=true;hud();canvas.focus({preventScroll:true});tone('nice');
}
function pause(){
 if(mode!=='playing')return;mode='paused';resetInput();panel.hidden=false;
 $('panelIcon').textContent='❄';$('panelTag').textContent='SNOW BREAK';$('panelTitle').textContent='雪夜暂停';$('panelText').textContent='等你回来继续垒。';$('panelFine').textContent='也可以按 Esc 继续';button('继续垒树');hud();start.focus({preventScroll:true});
}
$('sound').addEventListener('click',()=>{
 muted=!muted;if(!muted){try{audio||=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{muted=true;}}
 $('sound').setAttribute('aria-pressed',String(!muted));$('sound').setAttribute('aria-label',muted?'打开声音':'关闭声音');$('sound').querySelector('span').textContent=muted?'静音':'声音开';tone('bright');
});
start.addEventListener('click',begin);canvas.tabIndex=-1;
const dirs=new Set(['ArrowLeft','ArrowRight','a','A','d','D']);
window.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='Escape'&&focusMode){e.preventDefault();toggleFocus();return;}if(e.key==='Escape'&&helpVisible&&document.activeElement===helpClose){e.preventDefault();helpPreference=false;setHelp(false,true);resize();return;}if(e.key==='Escape'&&(mode==='playing'||mode==='paused')){e.preventDefault();mode==='paused'?begin():pause();return;}if(mode==='playing'&&dirs.has(e.key)){e.preventDefault();motion.keys.add(e.key);}});
window.addEventListener('keyup',e=>motion.keys.delete(e.key));window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
function screenX(e){const b=canvas.getBoundingClientRect();return ((e.clientX-b.left)*canvas.width/b.width-view.insetX)/view.scale;}
canvas.addEventListener('pointerdown',e=>{
 if(mode!=='playing'||motion.pointer!==null)return;
 const px=screenX(e),top=C.support(state),touch=e.pointerType==='touch';
 // Dragging a held tree keeps the grab point stable; tap far away to aim directly.
 if(!touch||Math.abs(px-(x+top.x))>Math.max(26,top.w*.44))x=clamp(px-top.x,CL,CR);
 motion.pointer={id:e.pointerId,base:x,at:px,touch};canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
 if(mode!=='playing'||motion.pointer?.id!==e.pointerId)return;
 const p=motion.pointer,px=screenX(e);
 x=clamp(p.touch?p.base+(px-p.at)*sensitivityScale[sensitivity]:px-C.support(state).x,CL,CR);
});
for(const n of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(n,e=>{if(motion.pointer?.id===e.pointerId)motion.pointer=null;});
for(const [btn,dir] of [[left,'left'],[right,'right']]){
 const press=()=>{if(mode==='playing')x=clamp(x+(dir==='left'?-7:7)*sensitivityScale[sensitivity],CL,CR);};
 btn.addEventListener('pointerdown',e=>{if(mode!=='playing'||motion.buttons.has(dir))return;btn.setPointerCapture(e.pointerId);motion.buttons.set(dir,{id:e.pointerId,age:0,touch:e.pointerType==='touch'});btn.classList.add('held');press();});
 for(const n of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(n,e=>{if(motion.buttons.get(dir)?.id===e.pointerId){motion.buttons.delete(dir);btn.classList.remove('held');}});
 btn.addEventListener('click',e=>{if(e.detail===0)press();});
}
window.addEventListener('pageshow',resize);
function loop(t){
 const dt=last?Math.min((t-last)/1000,.052):0;last=t;const before=mode;
 if(mode==='playing'&&!document.hidden)update(dt);
 if(mode==='lost'&&before==='playing')clock=t;
 frame(t);requestAnimationFrame(loop);
}
hud();requestAnimationFrame(loop);
})();
