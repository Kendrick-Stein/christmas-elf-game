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
