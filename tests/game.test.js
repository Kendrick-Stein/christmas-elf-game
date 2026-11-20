'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),C=require('../game-core');
test('true overlap, including unequal widths and zero support',()=>{
 a.equal(C.overlap(0,120,0,70),70);a.equal(C.overlap(0,100,50,60),30);
 a.equal(C.overlap(0,100,80,60),0);a.equal(C.overlap(0,100,15,150),100);
 a.equal(C.classify(0,118,112),'perfect');a.equal(C.classify(35,80,80),'catch');
 a.equal(C.classify(57,80,80),'miss');
});
test('offset is retained; moving cart moves support; score refers to top not cart',()=>{
 const s=C.fresh();
 let p=C.land(s,300,325,115);
 a.notEqual(p.rating,'miss');a.equal(s.layers[0].x,25);
 const stale=C.placement(s,360,360,70),aligned=C.placement(s,360,385,70);
 a.notEqual(stale.rating,'perfect');a.equal(aligned.rating,'perfect');
 p=C.land(s,360,385,70);a.equal(p.x,25);a.equal(s.layers[1].x,25);a.equal(s.layers[0].x,25);
 a.equal(C.surface(s),C.CART_Y-2*C.LEVEL_HEIGHT);
 const before=s.score;const failed=C.land(s,360,540,66);
 a.equal(failed.rating,'miss');a.equal(s.level,2);a.equal(s.score,before);
});
test('precise placement recovers instability; poorly supported drift eventually collapses',()=>{
 const s=C.fresh();
 C.land(s,300,300,115);C.land(s,300,350,104);a(s.risk>15);
 const risk=s.risk;C.land(s,300,350,95);a(s.risk<risk);
 while(s.status==='playing'&&s.level<30){
  const top=C.support(s);C.land(s,300,300+top.x+top.w*.55,Math.max(44,top.w-4));
 }
 a.equal(s.reason,'tilt');a.equal(s.risk,100);
});
test('five misses end after penalties; four flawless placements restore a heart and unlock lights',()=>{
 const s=C.fresh();
 C.miss(s);a.equal(s.hearts,4);a.equal(s.score,0);
 for(let i=0;i<3;i++)a(!C.land(s,320,320,C.nextWidth(s,.5)).festival);
 a(C.land(s,320,320,C.nextWidth(s,.5)).festival);a.equal(s.festival,5);a.equal(s.hearts,5);
 s.risk=10;C.light(s);a.equal(s.risk,6);a.equal(s.score,150);
 C.tick(s,7);a.equal(s.festival,0);
 for(let i=0;i<5;i++)C.miss(s);
 a.equal(s.reason,'misses');a.equal(s.score,100);
});
test('star is a one-time milestone; camera tracks without size collapse or forced ending',()=>{
 const s=C.fresh();let stars=0;
 for(let i=0;i<40;i++){const p=C.land(s,320,320,C.nextWidth(s,.5));if(p.star)stars++;}
 a.equal(stars,1);a.equal(s.level,40);a.equal(s.status,'playing');a(C.worldTop(s)<0);
 a(C.nextWidth(s,.5)>=C.MIN_WIDTH);a.equal(C.difficulty(s).speed,276);
});
test('compression keeps layers, star, score and source support; relocates plane and camera together',()=>{
 const s=C.fresh();for(let i=0;i<19;i++)C.land(s,320,320,C.nextWidth(s,.5));
 s.risk=65;const before=C.surface(s),oldCam=C.worldTop(s),score=s.score,level=s.level,assembled=JSON.stringify(s.layers);
 a(C.power(s,'compress'));a.equal(C.surface(s),before+level*3);a.equal(C.worldTop(s),oldCam+level*3);
 a.equal(s.risk,38);a.equal(s.level,level);a.equal(s.score,score);a.equal(JSON.stringify(s.layers),assembled);
 for(let j=0;j<10;j++)C.power(s,'compress');a.equal(s.spacing,C.MIN_SPACING);
 a.equal(s.level,19);a.equal(s.risk,0);
});
test('widen extends last leaf (not base), saves borderline catches and expires without changing saved positions',()=>{
 const s=C.fresh();for(let i=0;i<12;i++)C.land(s,290,315,C.nextWidth(s,.5));
 const natural=C.support(s);a.equal(natural.x,25);a.notEqual(natural.w,C.TRAY);
 const w=44,edge=290+natural.x+(natural.w+w)/2-.30*w;
 a.equal(C.placement(s,290,edge,w).rating,'miss');
 a(C.power(s,'wide'));
 a.equal(C.receiving(s).w,natural.w+C.WIDE_EXTRA);
 const p=C.land(s,290,edge,w);a(p.assisted);a.equal(p.rating,'catch');a.equal(s.layers.at(-1).x,edge-290);
 const saved=JSON.stringify(s.layers);C.tick(s,7.95);a(s.buffs.wide>0);
 C.tick(s,.1);a.equal(s.buffs.wide,0);a.equal(C.receiving(s).w,s.layers.at(-1).w);
 a.equal(JSON.stringify(s.layers),saved);
});
test('attraction uses offset top, not cart, and stops in deadband or outside radius or after expiry',()=>{
 const s=C.fresh();C.land(s,290,314,115);
 a.equal(C.attract(s,290,280),0);a(C.power(s,'magnet'));
 a(C.attract(s,290,280)>0);a(C.attract(s,290,365)<0);
 a.equal(C.attract(s,290,309),0);a.equal(C.attract(s,290,190),0);
 C.tick(s,8);a.equal(C.attract(s,290,280),0);
});
test('crossing uses world coordinates and a compressed plane cannot trigger a premature impact',()=>{
 const s=C.fresh();for(let i=0;i<13;i++)C.land(s,320,320,C.nextWidth(s,.5));
 const old=C.surface(s);
 C.power(s,'compress');const compressed=C.surface(s);
 a(compressed>old);
 a(!C.crossesSurface(old-2,old+3,old,compressed));
 a(!C.crossesSurface(old+3,compressed-1,compressed));
 a(C.crossesSurface(compressed-1,compressed+1,compressed));
 a(!C.crossesSurface(compressed+1,compressed+3,compressed));
});
test('camera starts following at level five, then tracks world surface independent of collision geometry',()=>{
 const s=C.fresh();
 for(let i=0;i<4;i++)C.land(s,320,320,C.nextWidth(s,.5));
 a.equal(C.worldTop(s),0);
 C.land(s,320,320,C.nextWidth(s,.5));const five=C.worldTop(s);a(five<0);
 for(let i=0;i<7;i++)C.land(s,320,320,C.nextWidth(s,.5));
 a(C.worldTop(s)<five-70);a(C.surface(s)-C.worldTop(s)>=195);
 const savedCollisionSurface=C.surface(s);C.worldTop(s);a.equal(C.surface(s),savedCollisionSurface);
});
test('uniform scale extends portrait world sky and centers a wide short view without stretching',()=>{
 const phone=C.viewport(320,460);
 a.equal(phone.scale,.5);a.equal(phone.worldHeight,920);a.equal(phone.extra,500);a.equal(phone.insetX,0);
 const desktop=C.viewport(1280,600);
 a.equal(desktop.scale,600/420);a.equal(desktop.worldHeight,420);a(desktop.insetX>180);
 a.equal(desktop.insetX*2+desktop.scale*640,1280);
});
test('extra sky flight does not change speed on the collision approach',()=>{
 const high=C.fall(-220,.5,100,-20,400);
 a.equal(high.y,-20);a.equal(high.normal,0);
 const crossover=C.fall(-120,.7,100,-20,400);
 a(Math.abs(crossover.y-25)<1e-8);a(Math.abs(crossover.normal-.45)<1e-8);
 const near=C.fall(30,.4,100,-20,400);
 a.equal(near.y,70);a.equal(near.normal,.4);
});
test('full-game seeded size draws stay precisely catchable and retain late-game variation',()=>{
 const midEstimate=(x,p)=>x.slice().sort((a,b)=>a-b)[Math.floor(x.length*p)];
 const early=[],late=[];
 for(let seed=1;seed<=24;seed++){
  const s=C.fresh(),widths=[];let randomState=seed;
  for(let i=0;i<420;i++){
   const next=(Math.imul(randomState,1664525)+1013904223)>>>0;
   randomState=next;const w=C.nextWidth(s,next/2**32),top=C.support(s);
   a(w>=C.MIN_WIDTH&&w<=C.MAX_WIDTH&&w<=top.w/.88+1e-8);
   a.equal(C.classify(0,w,top.w),'perfect');widths.push(w);C.land(s,320,320,w);
  }
  const tail=widths.slice(300);
  a(tail.some(w=>w<62));a(tail.some(w=>w>=93));a(Math.max(...tail)-Math.min(...tail)>36);
  a(tail.some((v,i)=>i&&v>tail[i-1]+5));a(tail.some((v,i)=>i&&v<tail[i-1]-5));
  early.push(...widths.slice(32,152));late.push(...tail);
 }
 const spread=w=>midEstimate(w,.75)-midEstimate(w,.25);
 a(spread(late)>=spread(early)*.85);
 a(Math.abs(midEstimate(late,.5)-midEstimate(early,.5))<5);
});
test('tiny-width streak advances back to a broad support despite lowest draw',()=>{
 const s=C.fresh();C.land(s,320,320,C.MIN_WIDTH);s.narrowRun=3;s.sinceBroad=12;
 for(let i=0;i<10&&C.support(s).w<93;i++){
  const prev=C.support(s).w,w=C.nextWidth(s,0);
  a(w>prev);a.equal(C.land(s,320,320,w).rating,'perfect');
 }
 a(C.support(s).w>=93);a.equal(s.sinceBroad,0);
});
test('caught light lowers current risk and reduces only positive landing risk while active',()=>{
 const plain=C.fresh(),steady=C.fresh();
 for(const s of [plain,steady]){C.land(s,320,320,110);s.risk=25;s.score=80;}
 C.light(steady);a.equal(steady.risk,21);a.equal(steady.score,110);a.equal(steady.buffs.stable,6);
 const p=C.land(plain,320,355,95),q=C.land(steady,320,355,95);
 a.equal(p.rating,q.rating);a(plain.risk>25);
 a(Math.abs((steady.risk-21)-(plain.risk-25)*C.STABLE_SCALE)<1e-8);
 const before=steady.risk,heart=steady.hearts;C.miss(steady);
 a.equal(steady.risk,before+6);a.equal(steady.hearts,heart-1);
 C.tick(steady,2);C.light(steady);a.equal(steady.buffs.stable,6);
 C.tick(steady,6);a.equal(steady.buffs.stable,0);
});
test('stability dampens wide-assisted risk and cannot hide a true collapse above the cap',()=>{
 const base=C.fresh(),steady=C.fresh(),mayfall=C.fresh();
 for(const s of [base,steady,mayfall]){C.land(s,320,320,110);C.power(s,'wide');s.risk=35;}
 C.light(steady);const shifted=320+(110+100)/2-30;
 const p=C.land(base,320,shifted,100),q=C.land(steady,320,shifted,100);
 a(p.assisted&&q.assisted);a(Math.abs((steady.risk-31)-(base.risk-35)*C.STABLE_SCALE)<1e-8);
 C.light(mayfall);mayfall.risk=99;C.land(mayfall,320,shifted,100);
 a.equal(mayfall.risk,100);a.equal(mayfall.status,'lost');
});
test('ordinary lights are smaller rewards and never shorten festival stability',()=>{
 const s=C.fresh();s.risk=14;
 a.equal(C.light(s,'string'),12);
 a.deepEqual([s.score,s.risk,s.lights,s.buffs.stable,s.hearts],[12,12,1,2.5,5]);
 C.tick(s,2.5);a.equal(s.buffs.stable,0);
 C.light(s);C.tick(s,1);C.light(s,'string');
 a.deepEqual([s.score,s.risk,s.lights,s.buffs.stable,s.hearts],[54,6,3,5,5]);
});
test('active clock restores one heart on 30-second boundaries, not repeatedly or after banking',()=>{
 const s=C.fresh();s.hearts=2;
 a.equal(C.tick(s,29.999),false);a.equal(s.hearts,2);
 a.equal(C.tick(s,.001),true);a.equal(s.hearts,3);
 a.equal(C.tick(s,.001),false);a.equal(s.hearts,3);
 a.equal(C.tick(s,30),true);a.equal(s.hearts,4);
 a.equal(C.tick(s,30),true);a.equal(s.hearts,5);
 a.equal(C.tick(s,30),false);a.equal(s.hearts,5);
 s.hearts--;a.equal(C.tick(s,29),false);a.equal(s.hearts,4);
 a.equal(C.tick(s,1),true);a.equal(s.hearts,5);
 s.status='lost';s.hearts=0;a.equal(C.tick(s,90),false);a.equal(s.hearts,0);
 const replay=C.fresh();replay.hearts=4;a.equal(C.tick(replay,29),false);a.equal(replay.hearts,4);
});
