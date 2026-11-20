(function (global) {
'use strict';
const CART_Y=345,TRAY=112,LEVEL_HEIGHT=19,MIN_WIDTH=44,STAR_AT=12,HEARTS=5,STREAK=4,FESTIVAL=5;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const fresh=()=>({score:0,combo:0,bestCombo:0,level:0,lights:0,perfect:0,festival:0,hearts:HEARTS,risk:0,layers:[],status:'playing',reason:null,elapsed:0});
const totalWidth=level=>Math.max(MIN_WIDTH,118-level*6.55);
const surface=s=>CART_Y-s.layers.length*LEVEL_HEIGHT;
const support=s=>s.layers[s.layers.length-1]||{x:0,w:TRAY};
const worldTop=s=>Math.min(0,surface(s)-145);
function overlap(parentX,parentW,childX,childW){
 return Math.max(0,Math.min(parentX+parentW/2,childX+childW/2)-Math.max(parentX-parentW/2,childX-childW/2));
}
function classify(offset,itemWidth,topWidth){
 const ratio=overlap(0,topWidth,offset,itemWidth)/itemWidth,dx=Math.abs(offset);
 if(ratio<.35)return'miss';
 if(ratio>=.85&&dx<=Math.max(5,Math.min(11,itemWidth*.13)))return'perfect';
 if(ratio>=.62&&dx<=itemWidth*.38)return'close';
 return'catch';
}
function placement(s,cartX,itemX,w){
 const top=support(s),x=itemX-cartX,offset=x-top.x,covered=overlap(top.x,top.w,x,w)/w;
 return {x,w,offset,covered,rating:classify(offset,w,top.w)};
}
function balance(s,p){
 const overhang=1-p.covered,edge=Math.abs(p.offset)/Math.max(1,(support(s).w+p.w)*.5);
 const old=s.layers.slice(-9),weight=old.reduce((sum,l)=>sum+l.x,0),lean=Math.abs((weight+p.x)/(old.length+1));
 const tilt=Math.max(0,lean-21)*.45;
 if(p.rating==='perfect')return Math.max(0,s.risk-13+Math.min(9,tilt));
 if(p.rating==='close')return clamp(s.risk+overhang*16+edge*4+tilt-5,0,100);
 return clamp(s.risk+7+overhang*20+edge*7+tilt,0,100);
}
function collapse(s,reason){s.status='lost';s.reason=reason;}
function miss(s){
 if(s.status!=='playing')return;
 s.score=Math.max(0,s.score-10);s.combo=0;s.hearts--;s.risk=clamp(s.risk+6,0,100);
 if(s.hearts===0||s.risk>=100)collapse(s,s.risk>=100?'tilt':'misses');
}
function land(s,cartX,itemX,w){
 const p=placement(s,cartX,itemX,w),result={...p,festival:false,star:false};
 if(s.status!=='playing'||p.rating==='miss')return result;
 s.risk=balance(s,p);s.layers.push({x:p.x,w:p.w});s.level++;
 if(p.rating==='perfect'){
  s.combo++;s.perfect++;s.bestCombo=Math.max(s.bestCombo,s.combo);s.score+=30;
  if(s.combo%STREAK===0){s.festival=FESTIVAL;result.festival=true;s.hearts=Math.min(HEARTS,s.hearts+1);}
 }else{s.combo=0;s.score+=p.rating==='close'?20:10;}
 if(s.level===STAR_AT)result.star=true;
 if(s.risk>=100)collapse(s,'tilt');
 return result;
}
function light(s){if(s.status!=='playing')return;s.score+=30;s.lights++;s.risk=Math.max(0,s.risk-4);}
function tick(s,dt){if(s.status!=='playing')return;s.elapsed+=dt;s.festival=Math.max(0,s.festival-dt);}
function difficulty(s){
 const l=s.level,wind=clamp((l-3)*4.0,0,49);
 return {speed:clamp(98+l*7.3,98,276),width:totalWidth(l),wind};
}
const core={CART_Y,TRAY,LEVEL_HEIGHT,MIN_WIDTH,STAR_AT,HEARTS,STREAK,FESTIVAL,fresh,totalWidth,surface,support,worldTop,overlap,classify,placement,land,miss,light,tick,difficulty};
if(typeof module!=='undefined')module.exports=core;else global.ElfCore=core;
})(globalThis);
