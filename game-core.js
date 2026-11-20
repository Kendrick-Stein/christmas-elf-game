(function (global) {
'use strict';
const CART_Y=345,TRAY=112,LEVEL_HEIGHT=19,MIN_WIDTH=48,MAX_WIDTH=128,STAR_AT=12,HEARTS=5,HEAL_EVERY=30,STREAK=4,FESTIVAL=5;
const BUFF_DURATION=8,WIDE_EXTRA=46,MIN_SPACING=10,STABLE_DURATION=6,STABLE_SCALE=.67,STRING_DURATION=2.5,STRING_SCORE=12;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const fresh=()=>({score:0,combo:0,bestCombo:0,level:0,lights:0,decorations:0,perfect:0,festival:0,hearts:HEARTS,risk:0,narrowRun:0,sinceBroad:0,spacing:LEVEL_HEIGHT,buffs:{wide:0,magnet:0,stable:0},layers:[],status:'playing',reason:null,elapsed:0});
const surface=s=>CART_Y-s.layers.length*s.spacing;
const support=s=>s.layers[s.layers.length-1]||{x:0,w:TRAY};
function nextWidth(s,random=Math.random()){
 const parent=support(s).w,r=clamp(random,0,1);
 const lo=Math.max(MIN_WIDTH,parent*.70),hi=Math.min(MAX_WIDTH,parent/.88);
 const sample=(a,b,t)=>a+(b-a)*t;
 // Draws are random at every height, with bias toward recovery after small tops.
 // Even the widest possible draw remains precisely catchable on the actual top.
 if((parent<66&&s.narrowRun>=3)||(parent<93&&s.sinceBroad>=12))return sample(Math.min(hi,parent*1.09),hi,r);
 const growth=parent<72?.74:parent>107?.25:.53;
 if(r<growth)return sample(Math.min(hi,parent+1),hi,r/growth);
 return sample(lo,Math.max(lo,parent-1),(r-growth)/(1-growth));
}
// Horizontal slabs of the exact eight branch sprite outlines, normalized around each center.
const BRANCH_BANDS=[
 [[-0.02968,0.09935,-25.5,-21.5],[-0.15871,0.23871,-21.5,-17.5],[-0.28774,0.35806,-17.5,-13.5],[-0.4071,0.43742,-13.5,-10.5],[-0.4071,0.49677,-10.5,-9.5],[-0.49677,0.49677,-9.5,-6.5],[-0.49677,0.46452,-6.5,-5.5],[-0.46452,0.46452,-5.5,-3.5],[-0.46452,0.40645,-3.5,-2.5],[-0.42581,0.40645,-2.5,-0.5]],
 [[-0.02992,0.09921,-25.5,-21.5],[-0.15906,0.2378,-21.5,-17.5],[-0.28819,0.35669,-17.5,-13.5],[-0.40709,0.43622,-13.5,-10.5],[-0.40709,0.49606,-10.5,-9.5],[-0.49606,0.49606,-9.5,-6.5],[-0.49606,0.45669,-6.5,-5.5],[-0.45669,0.45669,-5.5,-3.5],[-0.45669,0.38583,-3.5,-2.5],[-0.40945,0.38583,-2.5,-0.5]],
 [[-0.02932,0.09925,-25.5,-21.5],[-0.15865,0.23835,-21.5,-17.5],[-0.28797,0.35714,-17.5,-13.5],[-0.40677,0.43684,-13.5,-10.5],[-0.40677,0.49624,-10.5,-9.5],[-0.49624,0.49624,-9.5,-6.5],[-0.49624,0.45865,-6.5,-5.5],[-0.45865,0.45865,-5.5,-3.5],[-0.45865,0.39098,-3.5,-2.5],[-0.41353,0.39098,-2.5,-0.5]],
 [[-0.02909,0.09909,-25.5,-21.5],[-0.15818,0.23818,-21.5,-17.5],[-0.28727,0.35727,-17.5,-13.5],[-0.40636,0.43636,-13.5,-10.5],[-0.40636,0.49545,-10.5,-9.5],[-0.49545,0.49545,-9.5,-6.5],[-0.49545,0.45,-6.5,-5.5],[-0.45,0.45,-5.5,-3.5],[-0.45,0.36818,-3.5,-2.5],[-0.39545,0.36818,-2.5,-0.5]],
 [[-0.02872,0.09894,-25.5,-21.5],[-0.15745,0.23723,-21.5,-17.5],[-0.28617,0.35638,-17.5,-13.5],[-0.40532,0.43511,-13.5,-10.5],[-0.40532,0.49468,-10.5,-9.5],[-0.49468,0.49468,-9.5,-6.5],[-0.49468,0.44149,-6.5,-5.5],[-0.44149,0.44149,-5.5,-3.5],[-0.44149,0.34574,-3.5,-2.5],[-0.37766,0.34574,-2.5,-0.5]],
 [[-0.03038,0.09873,-25.5,-21.5],[-0.15823,0.23671,-21.5,-17.5],[-0.28608,0.3557,-17.5,-13.5],[-0.40506,0.43418,-13.5,-10.5],[-0.40506,0.49367,-10.5,-9.5],[-0.49367,0.49367,-9.5,-6.5],[-0.49367,0.43038,-6.5,-5.5],[-0.43038,0.43038,-5.5,-3.5],[-0.43038,0.31646,-3.5,-2.5],[-0.35443,0.31646,-2.5,-0.5]],
 [[-0.02923,0.09846,-25.5,-21.5],[-0.15692,0.23692,-21.5,-17.5],[-0.28462,0.35538,-17.5,-13.5],[-0.40308,0.43385,-13.5,-10.5],[-0.40308,0.49231,-10.5,-9.5],[-0.49231,0.49231,-9.5,-6.5],[-0.49231,0.41538,-6.5,-5.5],[-0.41538,0.41538,-5.5,-3.5],[-0.41538,0.27692,-3.5,-2.5],[-0.32308,0.27692,-2.5,-0.5]],
 [[-0.0283,0.09811,-25.5,-21.5],[-0.1566,0.23585,-21.5,-17.5],[-0.28491,0.35283,-17.5,-13.5],[-0.40189,0.43208,-13.5,-10.5],[-0.40189,0.49057,-10.5,-9.5],[-0.49057,0.49057,-9.5,-6.5],[-0.49057,0.39623,-6.5,-5.5],[-0.39623,0.39623,-5.5,-3.5],[-0.39623,0.22642,-3.5,-2.5],[-0.28302,0.22642,-2.5,-0.5]]
];
const D_RADIUS={string:{x:12,y:6},festival:{x:5,y:7},bow:{x:7,y:6},bauble:{x:5,y:7}};
function segmentBox(x0,y0,x1,y1,left,top,right,bottom){
 let a=0,b=1;
 for(const [p,v,lo,hi] of [[x0,x1-x0,left,right],[y0,y1-y0,top,bottom]]){
  if(Math.abs(v)<1e-8){if(p<lo||p>hi)return null;continue;}
  const t=(lo-p)/v,u=(hi-p)/v;a=Math.max(a,Math.min(t,u));b=Math.min(b,Math.max(t,u));
  if(a>b)return null;
 }
 return a;
}
function decorationContact(s,oldCart,newCart,x0,y0,x1,y1,kind){
 const r=D_RADIUS[kind];if(!r||!s.layers.length)return null;
 const left=x0-oldCart,right=x1-newCart;
 const minY=Math.min(y0,y1)-r.y,maxY=Math.max(y0,y1)+r.y;
 const first=Math.max(0,Math.ceil((CART_Y-maxY-26)/s.spacing));
 const last=Math.min(s.layers.length-1,Math.floor((CART_Y-minY)/s.spacing));
 let best=null;
 for(let i=last;i>=first;i--){
  const layer=s.layers[i],bottom=CART_Y-i*s.spacing;
  for(const [relA,relB,relTop,relBottom] of BRANCH_BANDS[i%8]){
   const a=relA*layer.w,b=relB*layer.w;
   const t=segmentBox(left-layer.x,y0-bottom,right-layer.x,y1-bottom,a-r.x,relTop-r.y,b+r.x,relBottom+r.y);
   if(t===null||best&&t>=best.t)continue;
   best={row:i,t,dx:clamp(left-layer.x+(right-left)*t,a,b),dy:clamp(y0-bottom+(y1-y0)*t,relTop,relBottom)};
  }
 }
 return best;
}
const receiving=s=>{const top=support(s);return {x:top.x,w:top.w+(s.buffs.wide>0?WIDE_EXTRA:0)};};
const crossesSurface=(oldY,newY,oldSurface,newSurface=oldSurface)=>oldY<oldSurface&&newY>=newSurface;
function viewport(pixelWidth,pixelHeight,worldWidth=640,baseHeight=420){
 const scale=Math.min(pixelWidth/worldWidth,pixelHeight/baseHeight);
 return {scale,worldHeight:pixelHeight/scale,insetX:(pixelWidth-worldWidth*scale)/2,extra:Math.max(0,pixelHeight/scale-baseHeight)};
}
function fall(y,dt,speed,skyLine,skySpeed){
 if(y>=skyLine||skySpeed<=speed)return {y:y+speed*dt,normal:dt};
 const until=(skyLine-y)/skySpeed;
 if(dt<=until)return {y:y+skySpeed*dt,normal:0};
 const normal=dt-until;return {y:skyLine+speed*normal,normal};
}
const worldTop=s=>Math.min(0,surface(s)-clamp(255-(s.level-5)*7,195,255));
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
 const top=support(s),recv=receiving(s),x=itemX-cartX,offset=x-top.x,covered=overlap(top.x,top.w,x,w)/w;
 const effectiveCovered=overlap(recv.x,recv.w,x,w)/w,natural=classify(offset,w,top.w);
 return {x,w,offset,covered,effectiveCovered,assisted:natural==='miss'&&effectiveCovered>=.35,rating:natural==='miss'&&effectiveCovered>=.35?'catch':natural};
}
function balance(s,p){
 const overhang=1-p.covered,edge=Math.abs(p.offset)/Math.max(1,(support(s).w+p.w)*.5);
 const old=s.layers.slice(-9),weight=old.reduce((sum,l)=>sum+l.x,0),lean=Math.abs((weight+p.x)/(old.length+1));
 const tilt=Math.max(0,lean-21)*.45;
 let gain;
 if(p.assisted)gain=9+(1-p.effectiveCovered)*11+Math.min(14,tilt);
 else if(p.rating==='perfect')gain=-13+Math.min(9,tilt);
 else if(p.rating==='close')gain=overhang*16+edge*4+tilt-5;
 else gain=7+overhang*20+edge*7+tilt;
 if(gain>0&&s.buffs.stable>0)gain*=STABLE_SCALE;
 return clamp(s.risk+gain,0,100);
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
 s.risk=balance(s,p);s.layers.push({x:p.x,w:p.w});s.level++;s.narrowRun=p.w<66?s.narrowRun+1:0;s.sinceBroad=p.w<93?s.sinceBroad+1:0;
 if(p.rating==='perfect'){
  s.combo++;s.perfect++;s.bestCombo=Math.max(s.bestCombo,s.combo);s.score+=30;
  if(s.combo%STREAK===0){s.festival=FESTIVAL;result.festival=true;s.hearts=Math.min(HEARTS,s.hearts+1);}
 }else{s.combo=0;s.score+=p.rating==='close'?20:10;}
 if(s.level===STAR_AT)result.star=true;
 if(s.risk>=100)collapse(s,'tilt');
 return result;
}
function light(s,kind='festival'){
 if(s.status!=='playing')return 0;
 const string=kind==='string',points=string?STRING_SCORE:30;
 s.score+=points;s.lights++;s.risk=Math.max(0,s.risk-(string?2:4));
 s.buffs.stable=Math.max(s.buffs.stable,string?STRING_DURATION:STABLE_DURATION);
 return points;
}
function power(s,kind){
 if(s.status!=='playing')return false;
 if(kind==='compress'){s.spacing=Math.max(MIN_SPACING,s.spacing-3);s.risk=Math.max(0,s.risk-27);return true;}
 if(kind==='wide'||kind==='magnet'){s.buffs[kind]=BUFF_DURATION;return true;}
 return false;
}
function attract(s,cartX,itemX){
 if(s.buffs.magnet<=0)return 0;
 const dx=cartX+support(s).x-itemX,dist=Math.abs(dx);
 return dist<=14||dist>116?0:Math.sign(dx)*Math.min(91,(dist-14)*1.25);
}
function tick(s,dt){
 if(s.status!=='playing')return false;
 const before=Math.floor((s.elapsed+1e-8)/HEAL_EVERY);s.elapsed+=dt;
 const rounds=Math.floor((s.elapsed+1e-8)/HEAL_EVERY)-before;
 const healed=rounds>0&&s.hearts<HEARTS;
 if(healed)s.hearts=Math.min(HEARTS,s.hearts+rounds);
 s.festival=Math.max(0,s.festival-dt);
 for(const k of ['wide','magnet','stable'])s.buffs[k]=Math.max(0,s.buffs[k]-dt);
 return healed;
}
function difficulty(s){
 const l=s.level,wind=clamp((l-3)*4.0,0,49);
 return {speed:clamp(98+l*7.3,98,276),wind};
}
const core={CART_Y,TRAY,LEVEL_HEIGHT,MIN_WIDTH,MAX_WIDTH,STAR_AT,HEARTS,HEAL_EVERY,STREAK,FESTIVAL,BUFF_DURATION,WIDE_EXTRA,MIN_SPACING,STABLE_DURATION,STABLE_SCALE,STRING_DURATION,STRING_SCORE,fresh,nextWidth,decorationContact,surface,support,receiving,viewport,fall,worldTop,crossesSurface,overlap,classify,placement,land,miss,light,power,attract,tick,difficulty};
if(typeof module!=='undefined')module.exports=core;else global.ElfCore=core;
})(globalThis);
