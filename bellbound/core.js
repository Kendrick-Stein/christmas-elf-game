(function(g){
'use strict';
const W=224,H=292,X=63,GROUND=246,DT=1/120;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const next={air:'sea',sea:'land',land:'air'};
const speed={air:63,sea:68,land:83};
// Difficulty is locked for an entire lap. Taper the late-game speed for playability.
const pace=round=>1+.62*(1-Math.pow(.77,Math.max(0,round-1)));
const speedFor=(stage,round)=>speed[stage]*pace(round);
const duration={air:1.85,sea:1.2,land:1.45};
const minStageTime={air:18,sea:18,land:17};
const openingProgress={air:7,sea:8,land:7};
const LAND_G=435, LAND_JUMP=-245, LAND_BUFFER=.16;
const ranks=[0,18,40,75];
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function newRun({stage='air',practice=false,rng=Math.random}={}){
 const s={rng,practice,stage,round:1,score:0,coins:0,totalFish:0,totalGifts:0,breaks:0,t:0,stageT:0,x: X,y:0,vy:0,depth:0,travel:0,shield:0,dash:0,magnet:0,alive:true,transition:null,entities:[],id:1,lastTap:-99};
 resetStage(s,stage);return s;
}
const level=s=>ranks.reduce((n,a,i)=>s.score>=a?i:n,0);
const fishSize=s=>[.82,1.03,1.26,1.56,1.83][Math.min(4,Math.floor(s.fed/2))];
function resetStage(s,stage){
 s.stage=stage;s.stageT=0;s.depth=0;s.x=X;s.vy=0;s.y=stage==='land'?GROUND:140;s.fed=0;
 s.entities=[];s.spawned=0;s.cleared=0;s.lastCenter=140;s.spawnAt=0;s.lastTap=-99;s.jumpQueued=0;s.nextPortal=openingProgress[stage];
 s.portalLive=false;s.exitReady=false;
 schedule(s,stage==='land'?174:176);
}
function add(s,e){e.id=s.id++;s.entities.push(e);return e;}
function arc(s,x,y,count=4,kind='hill'){
 for(let i=0;i<count;i++)add(s,{type:'coin',x:x+i*11,y:y-(kind==='hill'?Math.sin(i*Math.PI/(count-1))*12:i*7),base:y});
}
function schedule(s,x= W+22){
 const i=++s.spawned,r=s.rng(),ring=Math.min(8,s.round-1),st=s.stage;
 const rested=s.stageT>=minStageTime[st];
 if(st==='sea'&&rested&&(s.fed>=4||s.cleared>=10)&&s.cleared>=s.nextPortal&&!s.portalLive){
  add(s,{type:'portal',x,y:51,w:24});
  arc(s,x-53,96,5,'rising');s.portalLive=true;
 }else if(st!=='sea'&&rested&&s.cleared>=s.nextPortal&&!s.portalLive){
  const y=st==='air'?clamp(s.lastCenter-10,103,178):GROUND;
  add(s,{type:'portal',x,y,w:st==='air'?31:67});
  if(st==='air')for(let k=0;k<4;k++)add(s,{type:'coin',x:x-55+k*11,y:y-22+k*5});
  s.portalLive=true;
 }else if(st==='air'){
  const center=i===1?140:clamp(s.lastCenter+(r-.5)*(39+ring*3),88,202);
  s.lastCenter=center;
  const gap=112-Math.min(37,ring*4+Math.min(i,14)*1.15);
  const type=i===2&&s.round===1?'practiceTool':'wall';
  if(type==='wall')add(s,{type,x,y:center,gap,w:23,broken:false,passed:false});
  else add(s,{type:'marker',x,y:center,w:1});
  arc(s,x-40,center+(i%2?12:5),4);
  if(i===2)add(s,{type:'tool',kind:'dash',x:x-7,y:center-17});
  else if(i%5===0)add(s,{type:'tool',kind:i%10===0?'shield':'magnet',x:x-34,y:center+16});
  if(i===1||i%4===0)add(s,{type:'gift',x:x+12,y:center-22});
 }else if(st==='sea'){
  const center=clamp(i===1?140:s.lastCenter+(r-.5)*66,83,206);
  s.lastCenter=center;
  const sz=i<=6?(.56+.09*(i%3)):[.73,.79,1.15,1.52][i%4];
  add(s,{type:'fish',x,y:center,size:sz,phase:r*8,drift:9+ring*2});
  if(i>3)add(s,{type:'fish',x:x+24,y:clamp(center+(center<147?66:-66),101,246),size:1.65,phase:r*6,drift:12+ring*2});
  arc(s,x-39,center+4);
  if(i%4===1)add(s,{type:'tool',kind:['shield','magnet','dash'][Math.floor(i/4)%3],x:x-53,y:center+8});
 }else{
  const w=15+Math.floor(s.rng()*13);const h=i===1?21:20+Math.floor(r*(15+Math.min(4,ring)));
  add(s,{type:'wall',x,y:GROUND,w,h});
  arc(s,x-26,GROUND-h-12,5);
  if(i%4===2)add(s,{type:'tool',kind:['dash','shield','magnet'][Math.floor(i/4)%3],x:x-32,y:GROUND-10});
 }
 // Keep early hazards readable and reserve a full landing/rejump interval on snow.
 const scale=pace(s.round);
 const spacing=st==='air'?106*(1+(scale-1)*.25):st==='sea'?102*(1+(scale-1)*.22):Math.max(117,speedFor(st,s.round)*1.38);
 s.spawnAt=s.depth+spacing+(x-(W+22));
}
function tap(s){
 if(!s.alive||s.transition||s.t-s.lastTap<.095)return false;
 if(s.stage==='land'&&s.y<GROUND-.1){
  // Queue only when descending close to landing, rather than auto-repeating taps.
  if(s.vy>0&&GROUND-s.y<=s.vy*LAND_BUFFER+.5*LAND_G*LAND_BUFFER**2)s.jumpQueued=s.t+LAND_BUFFER;
  return false;
 }
 s.lastTap=s.t;s.vy=s.stage==='air'?-91:s.stage==='sea'?-72:LAND_JUMP;return true;
}
function take(s,kind){
 if(kind==='dash'){s.dash=2.2;s.vy=0;}
 if(kind==='magnet')s.magnet=7.5;
 if(kind==='shield')s.shield=1;
}
function enter(s,e,out){
 s.transition={from:s.stage,to:next[s.stage],age:0,duration:duration[s.stage],x:e.x,y:e.y,pX:s.x,pY:s.y};
 s.dash=0;out.push({kind:'portal',stage:s.stage,x:e.x,y:e.y});
}
function hit(s,e,out){
 if(e.safe)return;
 if(s.dash>0){e.safe=true;e.broken=true;s.breaks++;e.cutY=s.y;out.push({kind:'break',id:e.id,x:e.x,y:s.y});return;}
 if(s.shield){s.shield=0;e.safe=true;out.push({kind:'shieldHit',id:e.id,x:s.x,y:s.y});return;}
 if(s.practice){e.safe=true;out.push({kind:'bump',id:e.id,x:s.x,y:s.y});return;}
 s.alive=false;out.push({kind:'crash',id:e.id,x:s.x,y:s.y});
}
function step(s,dt=DT){
 const out=[];if(!s.alive)return out;s.t+=dt;
 if(s.transition){
  s.transition.age+=dt;
  if(s.transition.age>=s.transition.duration){
   const to=s.transition.to;
   if(s.stage==='land'){s.round++;s.score+=5;out.push({kind:'lap',round:s.round});}
   s.transition=null;resetStage(s,to);
   out.push({kind:'stage',stage:to});
  }
  return out;
 }
 s.stageT+=dt;
 const st=s.stage,oldY=s.y,dash=s.dash>0,ring=Math.min(8,s.round-1);
 s.dash=Math.max(0,s.dash-dt);s.magnet=Math.max(0,s.magnet-dt);
 const dx=(speedFor(st,s.round)+(dash?109+ring*4:0))*dt;
 if(dash&&st!=='land'){s.vy*=.91;s.y+=s.vy*dt;}
 else if(st==='land'){
  s.vy=Math.min(270,s.vy+LAND_G*dt);s.y=Math.min(GROUND,s.y+s.vy*dt);
  if(s.y===GROUND){
   if(s.jumpQueued&&s.t<=s.jumpQueued){s.vy=LAND_JUMP;s.lastTap=s.t;s.jumpQueued=0;}
   else{s.vy=0;s.jumpQueued=0;}
  }
 }else{
  s.vy=Math.min(st==='air'?136:90,s.vy+(st==='air'?185:118)*dt);s.y+=s.vy*dt;
 }
 s.x+=(X+(dash?14:0)-s.x)*Math.min(1,dt*6);
 if(st==='air'){
  if(s.y<23){s.y=23;s.vy=Math.max(10,s.vy);}
  if(s.y>269){
   if(s.practice){s.y=238;s.vy=-65;}
   else if(!dash){hit(s,{id:'snow',x:0},out);s.y=257;if(s.alive)s.vy=-73;else return out;}
   else{s.y=259;s.vy=0;}
  }
 }else if(st==='sea'){const y=clamp(s.y,26,271);if(y!==s.y)s.vy=0;s.y=y;}
 s.depth+=dx;s.travel+=dx;
 if(s.depth>=s.spawnAt)schedule(s);
 for(const e of s.entities){
  const before=e.x;e.x-=dx;
  if(e.type==='fish'){
   e.x-=dt*(e.broken?105:e.drift);if(e.broken)e.y-=22*dt;
   e.y+=dt*13*Math.sin(s.t*2.2+e.phase);
  }
  if(e.type==='coin'&&s.magnet&&Math.hypot(e.x-s.x,e.y-s.y)<61){
   e.x+=(s.x-e.x)*Math.min(1,dt*7);e.y+=(s.y-e.y)*Math.min(1,dt*7);
  }
  const r=st==='sea'?fishSize(s)*6:7, dy=Math.abs(s.y-e.y);
  if(e.type==='coin'||e.type==='tool'||e.type==='gift'){
   if(Math.abs(e.x-s.x)<r+6&&dy<r+7){
    e.used=true;
    if(e.type==='coin'){s.coins++;s.score++;out.push({kind:'coin',x:e.x,y:e.y});}
    if(e.type==='tool'){take(s,e.kind);out.push({kind:e.kind,x:e.x,y:e.y});}
    if(e.type==='gift'){s.totalGifts++;s.score+=2;out.push({kind:'gift',x:e.x,y:e.y});}
   }
  }else if(e.type==='portal'){
   if(e.x<s.x+(st==='land'?13:12)&&e.x+e.w>s.x-8&&dy<(st==='land'?21:st==='air'?28:34)){
    e.used=true;enter(s,e,out);break;
   }
   if(e.x+e.w<s.x-10&&!e.passed){e.passed=true;s.portalLive=false;s.nextPortal=s.cleared+2;}
  }else if(e.type==='wall'||e.type==='marker'){
   if(e.type==='wall'&&e.x<s.x+r&&e.x+e.w>s.x-r&&(st==='air'?dash||dy>e.gap/2-r:Math.max(s.y,oldY)>GROUND-e.h+r*.25)){
    hit(s,e,out);if(!s.alive)break;
   }
   if(!e.passed&&e.x+e.w<s.x-r){e.passed=true;s.cleared++;s.score++;out.push({kind:'pass'});}
  }else if(e.type==='fish'&&!e.broken){
   const edible=e.size<=fishSize(s)*1.01;
   if(Math.abs(e.x-s.x)<(e.size+fishSize(s))*6.1+(edible?6:0)&&dy<(e.size+fishSize(s))*4.2+(edible?13:0)){
    if(!dash&&edible){
     e.used=true;s.fed++;s.totalFish++;s.score+=3;out.push({kind:'eat',x:e.x,y:e.y});
    }else{hit(s,e,out);if(!s.alive)break;}
   }
   if(e.x+e.size*15<s.x&&!e.passed){
    e.passed=true;if(!s.exitReady&&s.fed>=4){s.exitReady=true;s.nextPortal=Math.max(s.nextPortal,s.cleared+1);}
    s.cleared++;
   }
  }
 }
 s.entities=s.entities.filter(e=>!e.used&&e.x> -95);
 return out;
}
const api={W,H,X,GROUND,DT,minStageTime,speedFor,clamp,random,newRun,tap,step,take,level,fishSize};
if(typeof module!=='undefined')module.exports=api;g.BellCore=api;
})(globalThis);
