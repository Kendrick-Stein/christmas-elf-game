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
 for(let i=0;i<3;i++)a(!C.land(s,320,320,C.totalWidth(s.level)).festival);
 a(C.land(s,320,320,C.totalWidth(s.level)).festival);a.equal(s.festival,5);a.equal(s.hearts,5);
 s.risk=10;C.light(s);a.equal(s.risk,6);a.equal(s.score,150);
 C.tick(s,7);a.equal(s.festival,0);
 for(let i=0;i<5;i++)C.miss(s);
 a.equal(s.reason,'misses');a.equal(s.score,100);
});
test('star is a one-time milestone; camera tracks without size collapse or forced ending',()=>{
 const s=C.fresh();let stars=0;
 for(let i=0;i<40;i++){const p=C.land(s,320,320,C.totalWidth(s.level));if(p.star)stars++;}
 a.equal(stars,1);a.equal(s.level,40);a.equal(s.status,'playing');a(C.worldTop(s)<0);
 a.equal(C.totalWidth(s.level),C.MIN_WIDTH);a.equal(C.difficulty(s).speed,276);
});
test('compression keeps layers, star, score and source support; relocates plane and camera together',()=>{
 const s=C.fresh();for(let i=0;i<19;i++)C.land(s,320,320,C.totalWidth(s.level));
 s.risk=65;const before=C.surface(s),oldCam=C.worldTop(s),score=s.score,level=s.level,assembled=JSON.stringify(s.layers);
 a(C.power(s,'compress'));a.equal(C.surface(s),before+level*3);a.equal(C.worldTop(s),oldCam+level*3);
 a.equal(s.risk,38);a.equal(s.level,level);a.equal(s.score,score);a.equal(JSON.stringify(s.layers),assembled);
 for(let j=0;j<10;j++)C.power(s,'compress');a.equal(s.spacing,C.MIN_SPACING);
 a.equal(s.level,19);a.equal(s.risk,0);
});
test('widen extends last leaf (not base), saves borderline catches and expires without changing saved positions',()=>{
 const s=C.fresh();for(let i=0;i<12;i++)C.land(s,290,315,C.totalWidth(s.level));
 const natural=C.support(s);a.equal(natural.x,25);a.notEqual(natural.w,C.TRAY);
 const edge=290+natural.x+37,w=44;
 a.equal(C.placement(s,290,edge,w).rating,'miss');
 a(C.power(s,'wide'));
 a.equal(C.receiving(s).w,natural.w+C.WIDE_EXTRA);
 const p=C.land(s,290,edge,w);a(p.assisted);a.equal(p.rating,'catch');a.equal(s.layers.at(-1).x,62);
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
 const s=C.fresh();for(let i=0;i<13;i++)C.land(s,320,320,C.totalWidth(s.level));
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
 for(let i=0;i<4;i++)C.land(s,320,320,C.totalWidth(s.level));
 a.equal(C.worldTop(s),0);
 C.land(s,320,320,C.totalWidth(s.level));const five=C.worldTop(s);a(five<0);
 for(let i=0;i<7;i++)C.land(s,320,320,C.totalWidth(s.level));
 a(C.worldTop(s)<five-70);a(C.surface(s)-C.worldTop(s)>=195);
 const savedCollisionSurface=C.surface(s);C.worldTop(s);a.equal(C.surface(s),savedCollisionSurface);
});
