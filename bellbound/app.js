(()=>{
'use strict';
const C=BellCore,A=BellArt,$=id=>document.getElementById(id);
const strings={
 brand:['松针雪夜 · 圣诞小游戏','PINE & SNOW · CHRISTMAS ARCADE'],arcade:['返回游戏合集','Back to the arcade'],title:['铃光远行','Bellbound'],
 score:['总分','Score'], best:['纪录','Best'],coins:['金币','Coins'],fish:['吃到的鱼','Fish eaten'],
 launch:['开始远行','Start the run'],again:['再来一局','Play again'],practice:['分场景练习','Practice a world'],
 air:['夜空','Night sky'],sea:['海里','Underwater'],land:['雪地','Snowpath'],pause:['暂停','Pause'],resume:['继续','Resume'],
 ready:['穿过烟囱，潜进湖里，再从雪屋的屋顶飞回夜空。','Fly past chimneys, dive into the lake, and take off again from a snowy rooftop.'],
 loop:['一局走过三个场景','THREE WORLDS, ONE RUN'],
 airHelp:['点画面或按空格腾空。穿烟囱，沿金币找暗砖洞。','Tap or press Space to hop. Follow the coin trail into the broken chimney.'],
 seaHelp:['点画面或按空格上游。吃小鱼，绕开大鱼，跟着浮标上岸。','Tap or press Space to swim up. Eat smaller fish, avoid big fish, then follow the buoy.'],
 landHelp:['点画面或按空格跳，落地再跳。沿雪路跑进亮灯小屋。','Tap or press Space to jump. Land before jumping again, then enter the lit cottage.'],
 readyHint:['手机点画面 · 电脑用空格 · 道具拾取自动生效','Tap on mobile · Space on desktop · Pickups activate automatically'],
 pauseText:['准备好再继续。','Take your time.'],
 end:['这一趟到站了','End of the run'],finish:['远行完成','RUN REPORT'],
 tryAgain:['分数已记下，下次再飞远一点。','Your score is saved. See how far you can go next time.'],
 practiceEnd:['练习不计入最高纪录。','Practice does not count toward your best score.'],
 record:['刷新了本机纪录。','A new personal best.'],
 card:['保存明信片','Save postcard'],postcardTitle:['旅行明信片','Your postcard'],close:['关闭','Close'],download:['下载 PNG','Download PNG'],menu:['回到菜单','Main menu'],
 soundOn:['声音开','Sound on'],soundOff:['声音关','Sound off'],tap:['点画面或空格移动','Tap or press Space to move'],
 dash:['铃光冲刺','Bell dash'],shield:['保护盾','Shield'],magnet:['金币磁铁','Coin magnet'],
 shieldHit:['保护盾挡住了这一次！','The shield blocked that hit!'],
 fishGrow:['小鱼长大了！','You grew!'],readyExit:['浮标出现了，游上去！','The buoy is here. Swim up!'],
 airDoor:['暗砖洞到了，跟着金币下潜','Follow the coins into the dark opening'],
 landDoor:['看见暖屋了，向亮灯门口跑','Head for the lit cottage door'],
 stageAir:['回到夜空，下一圈更快','Back in the sky. The next lap is faster.'],
 stageSea:['到了湖里，小口吃起','Underwater! Start with the smaller fish.'],
 stageLand:['上岸了，落地才能再跳','On land! Jump after touching down.'],
 practiceMode:['练习','Practice'],bump:['练习中，继续试','Practice mode. Keep going!']
};
function get(k){try{return localStorage.getItem(k)}catch{return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch{}}
const languageKey='snow-pine-language-v1',bestKey='bellbound-best-v1',soundKey='bellbound-sound-v1';
let language=get(languageKey)==='en'?'en':'zh',best=Number(get(bestKey))||0,sound=get(soundKey)!=='off';
function tr(k){return strings[k]?.[language==='en'?1:0]||k;}
let s=C.newRun(),mode='ready',resume='run',tick=0,buffer=0,visual=0,endAge=0,roundStart='air',practiceRun=false,isRecord=false;
const fx={particles:[],lit:new Set()},ctx=$('scene').getContext('2d',{alpha:false});
let noticeKey='',noticeEnd=0,lastHud='',didPortal=null,crashShot=null;
const bg=new Audio('./theme.mp3');bg.loop=true;bg.volume=.22;bg.preload='none';let ac;
const notes={coin:[790,1010],gift:[540,710,940],eat:[375,525],dash:[235,410,690],shield:[630],magnet:[540,740],shieldHit:[710,380],break:[125,84],portal:[580,420],stage:[496,662,785],lap:[420,555,660,840],crash:[340,235]};
function arm(){
 if(sound&&mode==='run'&&!document.hidden){
  bg.play().catch(()=>{});
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state!=='running')ac.resume().catch(()=>{});}catch{}
 }
}
function beep(k){if(!sound||!ac||ac.state!=='running'||!notes[k])return;
 const now=ac.currentTime;notes[k].forEach((v,i)=>{const o=ac.createOscillator(),a=ac.createGain(),t=now+i*.042,h=k==='break'?.19:.085;
 o.type=k==='break'?'triangle':'sine';o.frequency.value=v;a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(k==='break'?.047:.03,t+.012);a.gain.exponentialRampToValueAtTime(.0001,t+h);
 o.connect(a).connect(ac.destination);o.start(t);o.stop(t+h+.01);});
}
function label(){
 document.documentElement.lang=language==='en'?'en':'zh-CN';document.title=language==='en'?'Bellbound · Pine & Snow':'铃光远行 · 松针雪夜';
 $('arcade').title=tr('arcade');$('arcade').setAttribute('aria-label',tr('arcade'));
 document.querySelectorAll('[data-t]').forEach(e=>e.textContent=tr(e.dataset.t));
 $('lang').textContent=language==='en'?'中文':'EN';$('lang').setAttribute('aria-label',language==='en'?'切换为中文':'Switch to English');
 $('sound').textContent=tr(sound?'soundOn':'soundOff');$('sound').setAttribute('aria-pressed',String(sound));
 $('tapZone').setAttribute('aria-label',tr('tap'));lastHud='';update();
}
function update(){
 const playing=mode==='run', paused=mode==='pause', ready=mode==='ready', result=mode==='result';
 $('board').dataset.mode=mode;$('board').dataset.stage=s.stage;
 $('tapZone').hidden=!playing;$('overlay').hidden=playing||mode==='ending';
 $('pause').hidden=!(playing||paused);$('pause').textContent=tr(paused?'resume':'pause');
 $('eyebrow').textContent=tr(result?'finish':'loop');
 $('heading').textContent=tr(result?'end':paused?'pause':'title');
 $('intro').textContent=tr(result?(practiceRun?'practiceEnd':isRecord?'record':'tryAgain'):paused?'pauseText':'ready');
 $('primary').textContent=tr(result?'again':paused?'resume':'launch');
 $('pauseMenu').hidden=!paused;$('practice').hidden=!ready;$('results').hidden=!result;$('resultActions').hidden=!result;
 $('lastCoins').textContent=s.coins;$('lastFish').textContent=s.totalFish;
 $('hint').textContent=tr(ready?'readyHint':s.stage+'Help');hud();
}
function hud(){
 const h=[s.stage,s.round,s.score,s.coins,s.fed,Math.ceil(s.dash),s.shield,Math.ceil(s.magnet),noticeKey,Number(visual<noticeEnd),best].join('|');
 if(h===lastHud)return;lastHud=h;
 $('world').textContent=tr(s.stage)+(s.practice?' · '+tr('practiceMode'):language==='en'?' · Lap '+s.round:' · 第 '+s.round+' 圈');
 $('collect').textContent=s.stage==='sea'?s.fed:s.coins;$('collect').setAttribute('aria-label',tr(s.stage==='sea'?'fish':'coins'));
 $('score').textContent=s.score;$('best').textContent=best;
 for(const k of ['dash','shield','magnet']){
  const el=$(k),v=s[k];el.hidden=!(v>0);
  el.textContent=tr(k)+(k==='shield'?'':' '+Math.ceil(v)+'s');
 }
 $('notice').hidden=!noticeKey||visual>=noticeEnd;$('notice').textContent=noticeKey?tr(noticeKey):'';
}
function toast(key,period=1.65){noticeKey=key;noticeEnd=visual+period;lastHud='';}
const paint={break:['#a55a54','#d88563','#e6e8f2','#abbed7','#ffd39b'],coin:['#ffc16a','#ffedaa','#ec9468'],shieldHit:['#daeff0','#9dd6e0','#77a6ce'],eat:['#def0b2','#8fcbbd','#9bd6dc'],dash:['#ed8751','#ffc180','#ffe7ab'],portal:['#bed8e7','#edcda4','#92b5c7']};
function burst(kind,x,y,n,lead=0){
 const p=paint[kind]||paint.coin;
 for(let i=0;i<n;i++){
  const a=i*2.4,v=27+(i*71)%137;
  fx.particles.push({t:visual-lead,x,y,vx:Math.cos(a)*v+(kind==='break'?65:0),vy:Math.sin(a)*v,size:1+(i%5===0?4:i%3),g:kind==='break'?118:32,life:.31+(i%7)*.093,travel:s.travel,c:p[i%p.length]});
 }
}
function handle(e){
 const k=e.kind;
 if(k==='portal'){burst(k,e.x+10,s.y,19);toast('');beep('portal');}
 else if(k==='stage'){toast({air:'stageAir',sea:'stageSea',land:'stageLand'}[e.stage],2.7);didPortal=null;beep('stage');update();}
 else if(k==='lap'){beep(k);}
 else if(k==='break'){const o=s.entities.find(a=>a.id===e.id);if(o)o.cutY=e.y;burst(k,e.x,e.y,32);beep(k);}
 else if(k==='shield'){toast('shield');beep(k);}
 else if(k==='shieldHit'){toast(k);burst(k,e.x,e.y,20);beep(k);}
 else if(k==='bump'){toast(k,.8);burst('shieldHit',e.x,e.y,11);}
 else if(k==='crash'){burst('shieldHit',e.x,e.y,17,.055);finish();}
 else if(k==='gift'){fx.lit.add(Math.floor((s.depth*.56+149)/39));burst('coin',e.x,e.y,14);beep(k);}
 else if(k==='dash'||k==='magnet'){toast(k);burst(k,e.x,e.y,16);beep(k);}
 else if(k==='coin'||k==='eat'){burst(k,e.x,e.y,k==='eat'?14:5);if(k==='eat'&&s.fed%2===0)toast('fishGrow');beep(k);}
}
function start(which='air',practice=false){
 crashShot=null;s=C.newRun({stage:which,practice});practiceRun=practice;roundStart=which;isRecord=false;
 fx.particles.length=0;fx.lit.clear();didPortal=null;noticeKey='';mode='run';tick=0;buffer=0;
 update();$('tapZone').focus({preventScroll:true});arm();
 if(which!=='land')C.tap(s);
}
function menu(){
 crashShot=null;s=C.newRun();fx.particles.length=0;fx.lit.clear();practiceRun=false;isRecord=false;noticeKey='';mode='ready';bg.pause();update();
}
function finish(){
 mode='ending';endAge=0;bg.pause();beep('crash');isRecord=!practiceRun&&s.score>best;
 if(isRecord){best=s.score;set(bestKey,String(best));}update();
}
function toggle(){
 if(mode==='run'){resume=mode;mode='pause';bg.pause();update();$('primary').focus({preventScroll:true});}
 else if(mode==='pause'){mode=resume;tick=0;buffer=0;update();$('tapZone').focus({preventScroll:true});arm();}
}
function frame(ms){
 const dt=tick?Math.max(0,Math.min(.05,(ms-tick)/1000)):0;tick=ms;
 if(mode!=='pause')visual+=dt;
 if(mode==='run'){
  buffer+=dt;
  while(buffer>=C.DT&&mode==='run'){buffer-=C.DT;for(const e of C.step(s))handle(e);}
  const p=s.entities.find(e=>e.type==='portal'&&!e.passed&&e.x<199);
  if(p&&p.id!==didPortal){didPortal=p.id;toast({air:'airDoor',sea:'readyExit',land:'landDoor'}[s.stage],2.5);}
  hud();
 }else if(mode==='ending'){
  endAge+=dt;if(endAge>.64){mode='result';update();$('primary').focus({preventScroll:true});}
 }
 fx.particles=fx.particles.filter(p=>visual-p.t<p.life);
 A.scene(ctx,s,visual,fx,mode==='ready');
 if(mode==='ending'&&!crashShot){
  const canvas=document.createElement('canvas');canvas.width=C.W;canvas.height=C.H;
  canvas.getContext('2d').drawImage(ctx.canvas,0,0);
  crashShot={canvas,y:s.y,stage:s.stage};
 }
 requestAnimationFrame(frame);
}
$('primary').onclick=()=>mode==='pause'?toggle():mode==='result'?start(roundStart,practiceRun):start();
$('menu').onclick=menu;$('pauseMenu').onclick=menu;$('pause').onclick=toggle;
$('lang').onclick=()=>{language=language==='en'?'zh':'en';set(languageKey,language);label();};
$('sound').onclick=()=>{sound=!sound;set(soundKey,sound?'on':'off');if(sound)arm();else bg.pause();label();};
document.querySelectorAll('[data-stage]').forEach(e=>e.onclick=()=>start(e.dataset.stage,true));
$('tapZone').onpointerdown=e=>{if(mode==='run'&&e.isPrimary&&(e.pointerType!=='mouse'||e.button===0)){e.preventDefault();C.tap(s);}};
$('tapZone').onclick=e=>{if(mode==='run'&&e.detail===0)C.tap(s);};
window.addEventListener('keydown',e=>{
 if($('postcardDialog').open||e.repeat||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.key==='Escape'&&(mode==='run'||mode==='pause')){e.preventDefault();toggle();return;}
 if(e.code!=='Space'&&e.code!=='ArrowUp')return;
 if(e.target!==$('tapZone')&&e.target?.closest?.('button,summary,a,input'))return;
 if(mode==='ready'||mode==='pause'||mode==='result'||mode==='run'){
  e.preventDefault();if(mode==='ready')start();else if(mode==='pause')toggle();else if(mode==='result')start(roundStart,practiceRun);else C.tap(s);
 }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='run')toggle();});
window.addEventListener('pagehide',()=>bg.pause());
$('card').onclick=()=>{
 const card=document.createElement('canvas');
 BellPostcard.render(card,{lang:language,score:s.score,coins:s.coins,fish:s.totalFish,laps:s.round-1},crashShot);
 const url=card.toDataURL('image/png'), image=$('postcardPreview');image.src=url;image.alt=tr('postcardTitle');$('downloadPostcard').href=url;
 $('postcardDialog').showModal();
};
$('closePostcard').onclick=()=>$('postcardDialog').close();
label();requestAnimationFrame(frame);
})();
