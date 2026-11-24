((root,f)=>{const d=f();if(typeof module==='object'&&module.exports)module.exports=d;else root.GiftDefense=d;})(globalThis,()=>{
'use strict';
const DEF=Object.freeze({snow:{cost:4,up:4,power:2},frost:{cost:5,up:5,power:1},lantern:{cost:6,up:5,power:3},cocoa:{cost:4,up:4,power:0}});
const FOES=Object.freeze({scout:{hp:3,speed:2,steal:1},sneak:{hp:3,speed:3,steal:1},sled:{hp:7,speed:1,steal:2},chief:{hp:15,speed:2,steal:3}});
const W=Object.freeze([
 [[0,'scout',1],[1,'scout',3],[2,'scout',5]],
 [[0,'sneak',1],[2,'sneak',2],[1,'scout',4],[0,'scout',6]],
 [[2,'sled',1],[0,'scout',2],[1,'sneak',3],[2,'scout',5],[0,'sneak',7]],
 [[0,'sled',1],[1,'sled',2],[2,'sneak',3],[0,'scout',5],[1,'sneak',6],[2,'scout',8]],
 [[1,'chief',1],[0,'sled',2],[2,'sled',3],[1,'sneak',5],[0,'sneak',6],[2,'sneak',7],[1,'scout',9]]
]);
function randomState(s){
 let x=s.rng||1;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296;
}
function planWave(s){
 const r=()=>randomState(s);
 const lanes=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(r()*(i+1));[lanes[i],lanes[j]]=[lanes[j],lanes[i]];}
 if(s.wave<W.length)return W[s.wave].map(([lane,type,beat])=>[lanes[lane],type,beat]);
 let beats=0;const wave=s.wave+1;
 const n=7+Math.min(17,Math.floor((wave-4)*1.25));
 return Array.from({length:n},(_,i)=>{
  beats+=i===0?1:(i%4===3&&wave>=9?0:r()>.76&&wave<11?2:1);
  const chance=r(),lane=lanes[(i+Math.floor(r()*3))%3];
  const type=i===0&&wave%2===0?'chief':chance<Math.min(.23,.035*(wave-4))?'chief':chance<.48?'sled':chance<.77?'sneak':'scout';
  return [lane,type,beats];
 });
}
function newGame(seed=Math.floor(Math.random()*0xffffffff)){
 const s={phase:'plan',wave:0,money:12,gifts:8,saved:0,ring:2,lanes:[null,null,null],cocoa:0,enemies:[],beat:0,spawn:0,entries:[],serial:0,bellFlash:0,hits:[],loss:[],cleared:0,earn:0,rng:(Number(seed)>>>0)||1};
 s.entries=planWave(s);return s;
}
function price(s,key,lane){
 if(!Object.hasOwn(DEF,key)||!Number.isInteger(lane)||lane<0||lane>2)return null;
 if(key==='cocoa')return s.cocoa>=2?null:s.cocoa?DEF[key].up:DEF[key].cost;
 const old=s.lanes[lane];
 return old&&old.kind===key?(old.lv>=2?null:DEF[key].up):DEF[key].cost;
}
function invest(s,key,lane){
 if(s.phase!=='plan')return false;
 const cost=price(s,key,lane);
 if(cost===null||cost>s.money)return false;
 s.money-=cost;
 if(key==='cocoa')s.cocoa++;
 else s.lanes[lane]={kind:key,lv:s.lanes[lane]?.kind===key?2:1};
 return true;
}
function launch(s){
 if(s.phase!=='plan')return false;
 s.phase='raid';s.beat=0;s.spawn=0;s.hits=[];s.loss=[];s.earn=0;s.bellFlash=0;
 return true;
}
function removeStopped(s){
 const before=s.enemies.length;
 s.enemies=s.enemies.filter(e=>e.hp>0);
 const n=before-s.enemies.length;
 s.saved+=n;s.earn+=n;
}
function bell(s){
 if(s.phase!=='raid'||s.ring<=0||!s.enemies.length)return false;
 s.ring--;s.bellFlash=2;
 for(const e of s.enemies){e.hp-=3;e.frost=Math.max(e.frost,2);}
 removeStopped(s);
 return true;
}
function step(s){
 if(s.phase!=='raid')return false;
 s.beat++;s.bellFlash=Math.max(0,s.bellFlash-1);s.hits=[];s.loss=[];
 while(s.spawn<s.entries.length&&s.entries[s.spawn][2]<=s.beat){
  const [lane,kind]=s.entries[s.spawn++];
  const f=FOES[kind],hp=f.hp+Math.max(0,Math.floor((s.wave-4)*1.35));s.enemies.push({lane,kind,hp,max:hp,x:0,frost:0,id:++s.serial});
 }
 for(let lane=0;lane<3;lane++){
  const d=s.lanes[lane];if(!d)continue;
  const targets=s.enemies.filter(e=>e.hp>0&&e.lane===lane&&e.x>=2).sort((a,b)=>b.x-a.x||a.id-b.id);
  if(!targets.length)continue;
  if(d.kind==='lantern'&&s.beat%2===1)continue;
  if(d.kind==='frost'){
   for(const e of targets.slice(0,d.lv===2?3:2)){e.hp-=d.lv;e.frost=Math.max(e.frost,1);s.hits.push(lane);}
  } else {
   const e=targets[0];e.hp-=Math.max(1,DEF[d.kind].power+(d.lv===2?1:0)-(d.kind==='snow'&&(e.kind==='sled'||e.kind==='chief')?2:0));s.hits.push(lane);
   if(d.kind==='lantern'&&d.lv===2&&targets[1])targets[1].hp-=2;
  }
 }
 removeStopped(s);
 for(const e of s.enemies){
  if(e.frost){e.frost--;e.x+=1;}else e.x+=FOES[e.kind].speed;
  if(e.x>=15){s.loss.push(e.lane);s.gifts=Math.max(0,s.gifts-FOES[e.kind].steal);}
 }
 s.enemies=s.enemies.filter(e=>e.x<15);
 if(s.gifts===0){s.phase='lost';return true;}
 if(s.spawn===s.entries.length&&!s.enemies.length){
  s.cleared=s.wave+1;
  s.money+=3+s.cocoa*2+s.earn;s.wave++;s.entries=planWave(s);s.phase='plan';
 }
 return true;
}
return {DEF,FOES,W,newGame,launch,step,invest,bell,price,planWave};
});
