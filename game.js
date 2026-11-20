(() => {
'use strict';
const C=window.ElfCore,$=id=>document.getElementById(id),canvas=$('field'),g=canvas.getContext('2d'),screen=$('screen'),panel=$('panel'),start=$('start'),left=$('left'),right=$('right'),banner=$('banner');
const W=640,H=420,CL=46,CR=W-46,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a,b)=>Math.max(a,Math.min(x,b));
const art={};for(const n of ['elf','leaf','bulb']){art[n]=new Image();art[n].src='./assets/'+n+'.svg';}
const snow=Array.from({length:42},(_,i)=>({x:(i*137.5)%W,y:(i*83.4)%H,r:1+i%3*.42,v:8+i%7*2}));
const tones={bad:[176,132],nice:[523],bright:[659,784],festival:[523,659,784,1047]};
const motion={keys:new Set(),buttons:new Map(),pointer:null};
let mode='ready',state=C.fresh(),x=W/2,leaf=null,lights=[],effects=[],camera=0,wait=.4,last=0,flick=0,clock=0,wave=0,bulbWait=0,notice=0,display='',muted=true,audio=null;
let best={level:0,score:0};const recordKey='snow-pine-tower-v3';
try{const raw=JSON.parse(localStorage.getItem(recordKey));if(raw&&Number.isFinite(raw.level)&&Number.isFinite(raw.score))best={level:Math.max(0,raw.level),score:Math.max(0,raw.score)};}catch{}
function resize(){
 const d=Math.min(devicePixelRatio||1,2),b=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(b.width*d)),h=Math.max(1,Math.round(b.height*d));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
}
if(typeof ResizeObserver==='function')new ResizeObserver(resize).observe(screen);else window.addEventListener('resize',resize);
resize();
function sprite(name,x,y,w,h){
 const im=art[name];if(!im.complete||!im.naturalWidth)return false;
 g.drawImage(im,x-w/2,y-h/2,w,h);return true;
}
function ellipse(x,y,rx,ry,color){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=color;g.fill();}
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
 leaf={x:startX,y:y0,w:Math.max(C.MIN_WIDTH,d.width+(Math.random()-.5)*10),vy:d.speed+Math.random()*9,vx:wind(),wobble,phase:0,goingPast:false};
 wave++;
}
function createBulb(){
 const top=C.support(state),topX=x+top.x;
 return {x:clamp(topX+(Math.random()-.5)*180,48,W-48),y:camera-16,vy:190,vx:wind()*.3};
}
function lose(){
 mode='lost';resetInput();leaf=null;lights=[];banner.hidden=true;
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
 C.miss(state);label('没搭上 −10 · −1 心',o.x,clamp(o.y-camera,38,335),'#ffc0ba');tone('bad');wait=.29;
 if(state.status==='lost')lose();
}
function update(dt){
 C.tick(state,dt);const base=C.worldTop(state);
 camera+=(base-camera)*Math.min(1,dt*4.8);
 const keys=motion.keys,d=(motion.buttons.has('right')||keys.has('ArrowRight')||keys.has('d')||keys.has('D')?1:0)-(motion.buttons.has('left')||keys.has('ArrowLeft')||keys.has('a')||keys.has('A')?1:0);
 if(d)x=clamp(x+d*445*dt,CL,CR);
 const topY=C.surface(state);
 if(!leaf){wait-=dt;if(wait<=0)createLeaf();}
 if(leaf){
   const old=leaf.y,edge=leaf.w*.11;
   leaf.y+=leaf.vy*dt;leaf.phase+=dt;
   leaf.x+=dt*(leaf.vx+leaf.wobble*Math.sin(leaf.phase*5));
   if(leaf.x<leaf.w*.38||leaf.x>W-leaf.w*.38){leaf.x=clamp(leaf.x,leaf.w*.38,W-leaf.w*.38);leaf.vx=-leaf.vx;}
   if(!leaf.goingPast&&old+edge<topY&&leaf.y+edge>=topY){
     const o=leaf,p=C.land(state,x,o.x,o.w);
     if(p.rating==='miss'){leaf.goingPast=true;}
     else{
       leaf=null;wait=Math.max(.15,.34-state.level*.008);flick=1;
       label(p.rating==='perfect'?'稳稳的 +30':p.rating==='close'?'靠中 +20':'悬边 +10',o.x,topY-camera-24,p.rating==='catch'?'#ffc78b':'#d2f5c0');
       tone(p.festival?'festival':p.rating==='perfect'?'bright':'nice');
       if(p.star)show('✦ 第 12 层！星星亮了，继续往上');
       else if(p.festival){bulbWait=0;show('✦ 彩灯雨！接灯加分、减晃');}
       else if(state.risk>=68&&notice<=0)show('小心！树快倒了，下一片尽量对中');
       if(state.status==='lost'){lose();return;}
     }
   }
   if(leaf&&leaf.y+40>=camera+H){const o=leaf;leaf=null;onMiss(o);if(mode==='lost')return;}
 }
 if(state.festival>0){bulbWait-=dt;if(bulbWait<=0){lights.push(createBulb());bulbWait=.72;}}
 for(let i=lights.length-1;i>=0;i--){
   const o=lights[i],old=o.y;o.y+=o.vy*dt;o.x=clamp(o.x+o.vx*dt,28,W-28);
   const y=C.surface(state);
   if(old<y&&o.y>=y&&Math.abs(o.x-(x+C.support(state).x))<C.support(state).w*.55+12){
     lights.splice(i,1);C.light(state);label('彩灯 +30 · 减晃',o.x,y-camera-29,'#ffd47e');tone('bright');
   }else if(o.y>camera+H+24)lights.splice(i,1);
 }
 flick=Math.max(0,flick-dt*3);
 for(const f of effects){f.y-=dt*28;f.ttl-=dt;}
 effects=effects.filter(f=>f.ttl>0);
 if(notice>0){notice-=dt;if(notice<=0)banner.hidden=true;}
 hud();
}
function frame(t){
 g.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);g.clearRect(0,0,W,H);
 const weather=Math.min(1,state.level/20),time=reduce?0:t/1000,wx=wind();
 for(const s of snow){
  g.globalAlpha=.32+weather*.30;const sx=((s.x+time*wx*.29)%W+W)%W, sy=(s.y+time*(s.v+weather*38))%H;
  ellipse(sx,sy,s.r+weather*.7,s.r,'#e4f5ed');
 }
 g.globalAlpha=1;
 if(state.festival>0){g.fillStyle='#ffd8010b';g.fillRect(0,0,W,H);}
 const collapse=mode==='lost'&&state.reason==='tilt',offset=collapse?Math.min(1,Math.max(0,(t-clock)/650)):0;
 const cartY=C.CART_Y-camera;
 const s=C.support(state),tipY=C.surface(state)-camera,topX=x+s.x;
 const color=state.risk>=68?'#ffbbab':state.risk>=35?'#ffdc91':'#d6f4c9';
 if(cartY<H+80){
  ellipse(x,cartY+52,76,8,'#051c1c9c');
  g.strokeStyle='#dc9f61';g.lineWidth=5;g.beginPath();g.moveTo(x-61,cartY+38);g.quadraticCurveTo(x-76,cartY+37,x-76,cartY+27);g.moveTo(x-62,cartY+39);g.lineTo(x+75,cartY+39);g.stroke();
  g.fillStyle='#98534f';g.fillRect(x-61,cartY+6,122,29);
  g.fillStyle='#f1c77f';g.fillRect(x-57,cartY-3,114,10);
  if(!sprite('elf',x+67,cartY+10,71,67))ellipse(x+73,cartY+15,19,25,'#d27158');
 }
 for(let i=0;i<state.layers.length;i++){
   const l=state.layers[i],y=C.CART_Y-i*C.LEVEL_HEIGHT-camera-9;
   if(y < -35||y>H+50)continue;
   const wobble=reduce?0:Math.sin(time*7+i*.22)*state.risk*.018*(i/3);
   const shift=offset*Math.sign(s.x||1)*i*i*.8;
   const px=x+l.x+wobble+shift;
   if(!sprite('leaf',px,y+offset*i*9,l.w,31))ellipse(px,y,l.w*.50,15,'#54a47c');
   if(state.lights>i%13 && i%2!==1){g.shadowColor='#ffc77c';g.shadowBlur=8;ellipse(px+l.w*(i%3===1?-.24:.24),y+3,3.7,3.7,i%3===1?'#f197af':'#ffdb77');g.shadowBlur=0;}
 }
 if(state.level>=C.STAR_AT&&!collapse){g.shadowColor='#ffd274';g.shadowBlur=13;star(topX,tipY-19,12,'#ffd78b');g.shadowBlur=0;}
 if(!collapse&&mode!=='lost'){
   g.lineWidth=1.5;g.strokeStyle=color;g.setLineDash([4,4]);g.beginPath();g.moveTo(topX-s.w*.52,tipY-1);g.lineTo(topX+s.w*.52,tipY-1);g.stroke();g.setLineDash([]);
   g.fillStyle=color;g.fillRect(topX-1,tipY-8,2,10);
 }
 if(leaf){
   const py=leaf.y-camera;
   if(!leaf.goingPast&&py<35&&mode==='playing'){
     g.globalAlpha=.85;star(leaf.x,21,7,'#d0ecc9');g.globalAlpha=1;
   }
   if(!sprite('leaf',leaf.x,py,leaf.w,leaf.w*.26))ellipse(leaf.x,py,leaf.w*.5,leaf.w*.13,'#78d49d');
 }
 for(const o of lights){if(!sprite('bulb',o.x,o.y-camera,26,31))star(o.x,o.y-camera,11,'#ffcc76');}
 for(const f of effects){
  g.save();g.globalAlpha=clamp(f.ttl*1.5,0,1);g.font='800 16px system-ui';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#162c29';g.strokeText(f.text,f.x,f.y);g.fillStyle=f.color;g.fillText(f.text,f.x,f.y);g.restore();
 }
}
function hud(){
 const r=Math.round(state.risk),windNow=wind(),tag=[state.score,state.level,state.combo,state.hearts,r,windNow,best.level,best.score].join(':');
 if(display===tag)return;display=tag;
 $('score').textContent=String(state.score).padStart(3,'0');$('combo').innerHTML=state.combo+'<span> / 4</span>';
 $('progress').innerHTML=state.level+'<span> 层</span>';$('risk').innerHTML=r+'<span>%</span>';
 $('risk').dataset.alert=r>=68?'high':r>=35?'warn':'';
 $('chapter').textContent=state.level>=C.STAR_AT?'✦ 星树已点亮':state.level>=7?'紧张的风雪':'稳稳起步';
 $('wind').textContent=windNow===0?'无风':(windNow>0?'来风 →':'← 来风')+(Math.abs(windNow)>30?' · 强风':'');
 $('hearts').textContent='♥'.repeat(state.hearts)+'♡'.repeat(C.HEARTS-state.hearts);$('hearts').setAttribute('aria-label','生命 '+state.hearts);
 $('best').textContent='最高 '+best.level+' 层 · 最高 '+best.score+' 分';screen.dataset.stage=Math.min(3,Math.floor(state.level/4));
}
function button(text){start.innerHTML=text+' <span aria-hidden="true">↗</span>';}
function resetInput(){motion.keys.clear();motion.buttons.clear();motion.pointer=null;left.classList.remove('held');right.classList.remove('held');}
function begin(){
 if(mode==='paused'){mode='playing';panel.hidden=true;canvas.focus({preventScroll:true});return;}
 mode='playing';state=C.fresh();x=W/2;leaf=null;lights=[];effects=[];wait=.44;camera=0;wave=0;bulbWait=0;notice=0;resetInput();banner.hidden=true;panel.hidden=true;hud();canvas.focus({preventScroll:true});tone('nice');
}
function pause(){
 if(mode!=='playing')return;mode='paused';resetInput();panel.hidden=false;
 $('panelIcon').textContent='❄';$('panelTag').textContent='SNOW BREAK';$('panelTitle').textContent='雪夜暂停';$('panelText').textContent='等你回来继续垒。';$('panelFine').textContent='也可以按 Esc 继续';button('继续垒树');start.focus({preventScroll:true});
}
$('sound').addEventListener('click',()=>{
 muted=!muted;if(!muted){try{audio||=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{muted=true;}}
 $('sound').setAttribute('aria-pressed',String(!muted));$('sound').setAttribute('aria-label',muted?'打开声音':'关闭声音');$('sound').querySelector('span').textContent=muted?'静音':'声音开';tone('bright');
});
start.addEventListener('click',begin);canvas.tabIndex=-1;
const dirs=new Set(['ArrowLeft','ArrowRight','a','A','d','D']);
window.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='Escape'&&(mode==='playing'||mode==='paused')){e.preventDefault();mode==='paused'?begin():pause();return;}if(mode==='playing'&&dirs.has(e.key)){e.preventDefault();motion.keys.add(e.key);}});
window.addEventListener('keyup',e=>motion.keys.delete(e.key));window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
function touch(e){const b=canvas.getBoundingClientRect();x=clamp((e.clientX-b.left)*W/b.width-C.support(state).x,CL,CR);}
canvas.addEventListener('pointerdown',e=>{if(mode!=='playing'||motion.pointer!==null)return;motion.pointer=e.pointerId;canvas.setPointerCapture(e.pointerId);touch(e);});
canvas.addEventListener('pointermove',e=>{if(mode==='playing'&&motion.pointer===e.pointerId)touch(e);});
for(const n of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(n,e=>{if(motion.pointer===e.pointerId)motion.pointer=null;});
for(const [btn,dir] of [[left,'left'],[right,'right']]){
 const press=()=>{if(mode==='playing')x=clamp(x+(dir==='left'?-14:14),CL,CR);};
 btn.addEventListener('pointerdown',e=>{if(mode!=='playing'||motion.buttons.has(dir))return;btn.setPointerCapture(e.pointerId);motion.buttons.set(dir,e.pointerId);btn.classList.add('held');press();});
 for(const n of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(n,e=>{if(motion.buttons.get(dir)===e.pointerId){motion.buttons.delete(dir);btn.classList.remove('held');}});
 btn.addEventListener('click',e=>{if(e.detail===0)press();});
}
function loop(t){
 const dt=last?Math.min((t-last)/1000,.052):0;last=t;const before=mode;
 if(mode==='playing')update(dt);
 if(mode==='lost'&&before==='playing')clock=t;
 frame(t);requestAnimationFrame(loop);
}
hud();requestAnimationFrame(loop);
})();
