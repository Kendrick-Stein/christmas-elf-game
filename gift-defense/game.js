(()=>{
'use strict';
const C=window.GiftDefense,$=id=>document.getElementById(id),A=window.PineAudio;
const nodes=Array.from(document.querySelectorAll('[data-lane]')),buys=Array.from(document.querySelectorAll('[data-build]'));
const key='snow-pine-language-v1',recordKey='pine-depot-best-v2',canvas=$('board'),screen=canvas.getContext('2d'),reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const words={
 title:['礼物仓保卫战','Gift Depot Defense'],suite:['松针雪夜 · 圣诞小游戏','PINE & SNOW · CHRISTMAS ARCADE'],story:['圣诞老人守仓，绿毛怪来偷礼物','Santa guards the gifts. The Green Prankster wants them!'],
 back:['返回游戏合集','Back to the arcade'],gear:['设置','Settings'],gift:['礼物','Gifts'],money:['暖星','Warm stars'],wave:['波次','Wave'],board:['三条通往礼物仓的雪道','Three snowy lanes leading to the gift depot'],
 lane:['选择雪道','Choose a lane'],left:['左路','Left'],mid:['中路','Center'],right:['右路','Right'],
 snow:['雪球台','Snow Post'],frost:['冻霜塔','Frost Tower'],lantern:['暖灯塔','Lantern Tower'],cocoa:['热可可炉','Cocoa Stove'],
 plan:['布置防线','Plan your defense'],raid:['绿毛怪突袭中','The prankster raid is on'],paused:['暂歇一下','Taking a breather'],won:['礼物守住了！','The gifts are safe!'],lost:['礼物都被偷走了','The gifts were stolen'],
 scout:['捣蛋精灵','Scout'],sneak:['快手精灵','Sprinter'],sled:['护甲雪橇','Armored Sled'],chief:['绿毛怪首领','Prankster Chief'],
 go:['开始防守','Start wave'],pause:['暂停','Pause'],resume:['继续','Resume'],again:['再开一局','Play again'],newgame:['重开','Restart'],bell:['摇星铃','Ring the star bell'],full:['已满级','Max level'],built:['已建造','Built'],swapped:['已替换','Replaced'],leveled:['已升级','Upgraded'],bellhit:['星铃冻住了所有来客！','The bell froze every raider!'],cannot:['现在不能这么做。','That move is not available.'],checkpoint:['守住阶段波次！继续准备下一波。','Checkpoint held! Get ready for the next wave.']
};
const routes=['left','mid','right'];
const tr=(id)=>words[id][lang==='zh'?0:1], duo=(zh,en)=>lang==='zh'?zh:en;
let lang='zh';try{lang=localStorage.getItem(key)==='en'?'en':'zh';}catch{}
let best=0;try{best=Math.max(0,parseInt(localStorage.getItem(recordKey),10)||0);}catch{}
let s=C.newGame(),selected=1,paused=false,timer=0,lastBeat=0,noticeKey='',prevPos=new Map();
const imgs={}; for(const [k,p] of Object.entries({santa:'../assets/sprite-santa.svg',grinch:'../assets/sprite-green-mischief.svg'})){const img=new Image();img.src=p;imgs[k]=img;}
const quality=()=>document.querySelector('main');
const status=(id)=>{noticeKey=id;renderText();};
function refreshLanguage(){
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=tr('title')+' · '+duo('松针雪夜','Pine & Snow');
 for(const id of ['title','suite','story'])$(id).textContent=tr(id);
 for(const [id,k] of [['gift-label','gift'],['money-label','money'],['wave-label','wave']])$(id).textContent=tr(k);
 $('back').setAttribute('aria-label',tr('back'));$('gear').setAttribute('aria-label',tr('gear'));$('lanes').setAttribute('aria-label',tr('lane'));canvas.setAttribute('aria-label',tr('board'));
 $('language').textContent=duo('English','中文');A?.refresh();
 renderText();
}
function more(key,value){
 const description={
  snow:duo('每拍掷雪球，打护甲较弱','Fast; weak against armor'),
  frost:duo('减速并打多个目标','Slows groups'),
  lantern:duo('隔拍照射，能破护甲','Slow, pierces armor'),
  cocoa:duo('每波额外产出暖星','Earn stars each wave')
 }[key];
 if(value===null)return tr('full')+' · '+description;
 const upgrade=key==='cocoa'?s.cocoa>0:s.lanes[selected]?.kind===key;
 return (upgrade?duo('升级 ','Upgrade '):'')+value+' ★ · '+description;
}
function renderText(){
 const end=s.phase==='lost',raid=s.phase==='raid';
 quality().dataset.phase=s.phase;
 $('gifts').textContent=s.gifts;$('money').textContent=s.money;$('wave').textContent=s.wave+1;
 $('phase').textContent=tr(paused?'paused':s.phase);
 $('pause').hidden=!raid;$('pause').textContent=tr(paused?'resume':'pause');
 $('go').hidden=s.phase!=='plan';$('go').textContent=tr('go');
 $('bell').hidden=!raid;$('bell').disabled=paused||s.ring<1||!s.enemies.length;$('bell').textContent=tr('bell')+' · '+s.ring;
 $('restart').textContent=tr(end?'again':'newgame');
 const counts=s.entries.reduce((r,[lane,kind])=>{r[lane][kind]=(r[lane][kind]??0)+1;return r;},[{},{},{}]);
 $('forecast').textContent=end?duo('本机最好成绩：守住 '+best+' 波。','Local best: '+best+' waves cleared.'):duo(raid?'本波':'下一波',raid?'This wave':'Next wave')+' · '+counts.map((counts,i)=>tr(routes[i])+': '+Object.entries(counts).map(([k,n])=>tr(k)+(n>1?' ×'+n:'')).join(', ')).join('  /  ');
 $('target').textContent=end?duo('已击退 '+s.saved+' 名捣蛋鬼，共通过 '+s.cleared+' 波。',s.saved+' raiders stopped · '+s.cleared+' waves cleared.'):raid?duo('观察进度，必要时用两枚星铃救场。','Watch the lanes and save your two bell charges for danger.'):duo('当前操作：','Selected: ')+tr(routes[selected])+' · '+(!s.lanes[selected]?duo('尚未布防','Empty'):(tr(s.lanes[selected].kind)+' '+duo('等级 ','Lv. ')+s.lanes[selected].lv));
 $('hints').textContent=s.phase==='plan'?duo('选雪道再布防；异种塔会替换旧塔。热可可炉增加全场收入。','Choose a lane, then build. A different tower replaces that lane’s old one. Cocoa income is shared.'):raid?duo('星铃伤害并冻住场上敌人，礼物被偷光即失败。','The bell damages and slows raiders. Lose all gifts and the run ends.'):duo('每次重开都会重置暖星、塔和星铃，并生成不同来袭路线。','Every new run starts over with fresh stars, towers, bells and raid routes.');
 $('status').textContent=noticeKey?tr(noticeKey):'';
 $('builds').hidden=s.phase!=='plan';
 nodes.forEach((b,i)=>{
  b.setAttribute('aria-pressed',String(selected===i));b.textContent=tr(routes[i])+(s.lanes[i]?' · '+tr(s.lanes[i].kind):'');b.disabled=s.phase!=='plan';
 });
 for(const b of buys){
  const type=b.dataset.build,cost=C.price(s,type,selected);
  b.querySelector('b').textContent=tr(type);b.querySelector('small').textContent=more(type,cost);b.disabled=cost===null||cost>s.money;
 }
}
function moveLane(lane){if(s.phase!=='plan')return;selected=lane;noticeKey='';renderText();A?.effect('click');}
nodes.forEach((b,i)=>b.addEventListener('click',()=>moveLane(i)));
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();let lane=Math.floor(((e.clientY-r.top)/r.height*298-76)/65);if(lane>=0&&lane<3)moveLane(lane);});
for(const b of buys)b.addEventListener('click',()=>{
 const k=b.dataset.build,old=s.lanes[selected],before=s.cocoa;
 if(C.invest(s,k,selected)){status(k==='cocoa'?before?'leveled':'built':old?(old.kind===k?'leveled':'swapped'):'built');A?.effect('nice');}else status('cannot');
});
const clearTimer=()=>{if(timer){clearInterval(timer);timer=0;}};
function enableBeat(){clearTimer();timer=setInterval(()=>{
 prevPos=new Map(s.enemies.map(e=>[e.id,e.x]));lastBeat=performance.now();
 C.step(s);
 if(s.loss.length)A?.effect('warn');else if(s.hits.length)A?.effect('tap');
 if(s.phase!=='raid'){
  clearTimer();noticeKey='';
  if(s.cleared>best){best=s.cleared;try{localStorage.setItem(recordKey,String(best));}catch{}}
  if(s.phase==='lost'){A?.effect('warn');A?.switchTheme('workshop',false);}
  else if(s.cleared%5===0){noticeKey='checkpoint';A?.effect('finish');}else A?.effect('nice');
 }
 renderText();
},430);}
$('go').addEventListener('click',()=>{
 if(C.launch(s)){noticeKey='';prevPos.clear();A?.switchTheme('workshop',true);A?.arm();A?.effect('nice');enableBeat();renderText();}
});
function setPaused(value){
 if(s.phase!=='raid')return;
 paused=value;
 if(value){clearTimer();A?.switchTheme('workshop',false);}
 else{A?.switchTheme('workshop',true);A?.arm();enableBeat();}
 renderText();
}
$('pause').addEventListener('click',()=>setPaused(!paused));
$('bell').addEventListener('click',()=>{if(!paused&&C.bell(s)){noticeKey='bellhit';A?.effect('bright');renderText();}});
$('restart').addEventListener('click',()=>{
 clearTimer();s=C.newGame();paused=false;selected=1;noticeKey='';prevPos.clear();A?.switchTheme('workshop',false);renderText();$('go').focus();
});
$('language').addEventListener('click',()=>{lang=duo('en','zh');try{localStorage.setItem(key,lang);}catch{}refreshLanguage();});
window.addEventListener('storage',e=>{if(e.key===key&&(e.newValue==='en'||e.newValue==='zh')){lang=e.newValue;refreshLanguage();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&s.phase==='raid')setPaused(true);});
document.addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.repeat)return;if(e.key==='Escape'&&s.phase==='raid'){e.preventDefault();setPaused(!paused);}});
const col={snow:['#b9dce8','#5d87ad'],frost:['#91c2ef','#547cba'],lantern:['#ffd18e','#b57160'],cocoa:['#c79567','#7e5b58']};
const rect=(x,y,w,h,c)=>{screen.fillStyle=c;screen.fillRect(Math.round(x),Math.round(y),w,h);};
function sprite(k,x,y,w,h){
 const i=imgs[k];if(!i.complete||!i.naturalWidth)return false;
 screen.imageSmoothingEnabled=false;screen.drawImage(i,Math.round(x),Math.round(y),w,h);return true;
}
function tree(x,y,h){
 const w=h*.30;
 rect(x-2,y-8,4,8,'#433746');
 for(let i=0;i<3;i++){
  const k=(i+1)/3,dy=y-h+(h*.27)*i;
  screen.fillStyle=i%2?'#355365':'#2a485a';screen.beginPath();screen.moveTo(x,dy);screen.lineTo(x-w*k,dy+h*.45);screen.lineTo(x+w*k,dy+h*.45);screen.fill();
  rect(x-w*k*.41,dy+h*.29,w*k*.81,2,'#65818b');
 }
}
function gift(x,y,c='#bf5262',k='#ffe0a1'){
 rect(x,y+2,11,9,c);rect(x-1,y+1,13,2,c);rect(x+4,y+1,2,10,k);rect(x+1,y,3,2,k);rect(x+7,y,3,2,k);
}
function tower(d,x,y){
 const [fill,shadow]=col[d.kind];
 rect(x-13,y+9,26,4,'#17253a');rect(x-9,y+3,18,8,shadow);rect(x-6,y-8,12,14,fill);
 if(d.kind==='snow'){
  rect(x-9,y-5,18,4,fill);rect(x-4,y-14,8,9,'#e6f4f5');rect(x-3,y-11,2,3,'#334e6c');rect(x+3,y-11,2,3,'#334e6c');
 }else if(d.kind==='frost'){
  rect(x-2,y-15,4,22,'#d7eafb');rect(x-8,y-10,16,4,'#e6f4f5');rect(x-5,y-13,10,10,fill);
 }else{
  rect(x-4,y-5,8,9,'#fff0a9');rect(x-8,y-10,16,4,shadow);rect(x-2,y-15,4,5,'#efba7b');
 }
 if(d.lv>1){rect(x-12,y+9,24,3,'#ffda92');rect(x+7,y-13,4,4,'#ffda92');}
}
let time0=0;
function draw(now){
 const q=screen,W=540,H=298;
 const grad=q.createLinearGradient(0,0,0,H);
 grad.addColorStop(0,'#141d38');grad.addColorStop(.58,'#263b56');grad.addColorStop(1,'#172b43');
 q.fillStyle=grad;q.fillRect(0,0,W,H);
 rect(56,16,23,20,'#edcc9b');rect(67,11,17,19,'#1b2943');
 for(let i=0;i<30;i++)rect((i*73)%W,(i*31)%66,i%9===0?2:1,1,i%7?'#637d91':'#e3d4b7');
 for(let i=0;i<19;i++)tree((i*35+13)%W,73,(i*13)%27+24);
 rect(0,64,W,4,'#a9c9d4');
 rect(0,70,W,225,'#1f3650');
 for(let lane=0;lane<3;lane++){
  const y=76+lane*65, chosen=lane===selected;
  rect(8,y,426,54,chosen&&s.phase==='plan'?'#395568':'#2c445c');
  rect(8,y,426,2,chosen&&s.phase==='plan'?'#e0b87d':'#687f8f');
  rect(8,y+54,426,2,'#44708a');
  for(let i=0;i<12;i++)rect(15+i*34,y+27,13,2,i%2?'#55758a':'#486a81');
  for(let i=0;i<15;i++)rect(13+i*28,y+6+(i*11)%42,2,1,'#8eacb7');
  const d=s.lanes[lane];if(d)tower(d,100,y+25);else if(s.phase==='plan'){
   rect(89,y+29,22,3,'#c4ab85');rect(98,y+22,3,15,'#c4ab85');
  }
  if(s.hits.includes(lane)&&s.phase==='raid'&&!paused){
   const target=s.enemies.filter(e=>e.lane===lane).sort((a,b)=>b.x-a.x)[0];
   if(target){const p=reduce?.6:Math.min(.95,(now-lastBeat)/270);const end=32+target.x*25;const tx=100+(end-100)*p;rect(tx,y+20,7,5,d?.kind==='lantern'?'#ffe0a1':d?.kind==='frost'?'#a7d9ff':'#eff7ef');}
  }
  if(s.loss.includes(lane)&&s.phase==='raid')rect(401,y+20,30,4,'#e08285');
 }
 rect(444,71,89,213,'#253146');rect(445,85,87,190,'#674d59');
 for(let row=0;row<10;row++)for(let i=0;i<5;i++)rect(447+i*18+(row%2?3:0),89+row*18,12,2,'#82636d');
 rect(441,75,94,11,'#c4d6dc');rect(442,268,92,11,'#849cab');
 rect(457,104,61,46,'#594153');rect(464,111,47,34,s.cleared>=5&&s.phase==='plan'?'#ffeea6':'#dca769');rect(485,111,4,34,'#8b6264');rect(464,126,47,3,'#af775f');
 rect(465,169,50,86,'#442f46');rect(470,176,39,73,'#573545');
 sprite('santa',465,187,44,52)||rect(478,191,21,37,'#c56371');
 for(let i=0;i<s.gifts;i++)gift(450+(i%4)*18,249-Math.floor(i/4)*11,i%2?'#498982':'#b85264');
 if(s.cocoa){tower({kind:'cocoa',lv:s.cocoa},467,47);rect(480,53,16,8,'#9d6a58');}
 if(s.phase==='plan'||s.beat<4)sprite('grinch',10,16,36,41);
 for(const e of s.enemies){
  const delta=reduce||paused?1:Math.max(0,Math.min(1,(now-lastBeat)/320)),start=prevPos.get(e.id)??Math.max(0,e.x-1);
  const x=30+(start+(e.x-start)*delta)*26,y=84+65*e.lane;
  const scale=e.kind==='chief'?40:e.kind==='sled'?34:28;
  if(e.kind==='sled'){rect(x-4,y+35,scale+8,5,'#9d713e');rect(x-2,y+31,scale+5,5,'#cdaf74');}
  if(!sprite('grinch',x,y+Math.max(0,37-scale),scale,Math.round(scale*1.12)))rect(x,y+12,22,25,'#73a574');
  if(e.kind==='chief')rect(x+6,y+2,scale-12,3,'#ffcc7e');
  if(e.frost){rect(x-2,y+38,scale+4,3,'#aad9f9');rect(x+3,y+13,3,3,'#d0f0f7');}
  rect(x,y+43,scale,3,'#23324b');rect(x,y+43,Math.max(1,Math.round(scale*e.hp/e.max)),3,'#f1c783');
 }
 if(!reduce){
  const t=(now-time0)/1100;
  for(let i=0;i<30;i++)rect((i*103+t*(5+i%7))%W,(i*57+t*(9+i%12))%H,i%6===0?2:1,1,'#a8c7d2');
 }
 if(s.bellFlash>0){q.fillStyle='#b8daee22';q.fillRect(0,68,438,209);for(let i=0;i<16;i++)rect((i*333)%425,75+(i*139)%190,3,3,'#bfe4ff');}
 if(s.cleared>=5&&s.phase==='plan'){for(let i=0;i<19;i++)rect(426+(i*13)%113,76+(i*37)%200,3,2,i%2?'#ffe58e':'#f5aa99');}
 requestAnimationFrame(draw);
}
time0=performance.now();refreshLanguage();requestAnimationFrame(draw);
})();
