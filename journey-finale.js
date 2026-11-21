(function(){
'use strict';
const duration=5.9;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{const q=clamp(x);return q*q*(3-2*q);};
const lerp=(a,b,t)=>a+(b-a)*t;
const rect=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
const shape=(g,c,p)=>{g.fillStyle=c;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
const spark=(g,x,y,r,c)=>{rect(g,x-r,y,r*2+1,1.4,c);rect(g,x,y-r,1.4,r*2+1,c);};
const seed=(n,s)=>((Math.imul(n+1,96799+s*541)^Math.imul(n-s,85231))>>>0)%997/997;
function ridge(g,y,a,k,c){
 const p=[];
 for(let x=-8;x<=488;x+=8){
   const yy=y+Math.round((Math.sin(x/41+k)*a+Math.cos(x/79-k)*a*.79)/4)*4;
   p.push([x,yy],[x+8,yy]);
 }
 shape(g,c,[...p,[496,480],[-8,480]]);
}
function pine(g,x,y,h,w,c){
 for(let k=0;k<9;k++){
  const span=Math.round(w*Math.pow((k+1)/9,1.45));
  rect(g,x-span/2,y-h+k*h/9,span,h/9+2,c);
 }
}
function house(g,x,y,w,h,plum,j){
 const top=y-h;
 rect(g,x+2,top+38,w-4,h-30,plum?'#69475e':'#344859');
 rect(g,x+w-15,top+11,9,25,plum?'#503650':'#2c3b51');
 for(let k=0;k<10;k++){
  const sw=14+k*6;
  rect(g,x+w/2-sw/2,top+7+k*3.6,sw,4.5,plum?'#554666':'#617b93');
  if(k<7)rect(g,x+w/2-sw/2,top+6+k*3.6,sw,1.5,plum?'#a890a8':'#a3c0d0');
 }
 rect(g,x+w/2-6,y-18,12,19,plum?'#412c45':'#243949');
 for(let k=0;k<3;k++){
  const xx=x+9+k*(w-24)/2,yy=top+50+(j%2)*3;
  rect(g,xx-1,yy-1,12,15,plum?'#a06663':'#52677a');
  rect(g,xx,yy,9,12,plum?['#ffcc84','#ffb96e','#ffdb96'][(j+k)%3]:'#cfa777');
  rect(g,xx+4,yy,1,12,plum?'#96665c':'#64595c');
  rect(g,xx,yy+5,9,1,plum?'#96665c':'#64595c');
 }
}
function scenery(g,plum,travel){
 const sky=g.createLinearGradient(0,0,0,380);
 sky.addColorStop(0,plum?'#221a38':'#10263d');
 sky.addColorStop(1,plum?'#63455e':'#39536a');
 g.fillStyle=sky;g.fillRect(-16,0,512,480);
 for(let n=0;n<48;n++)rect(g,seed(n,11)*480,seed(n,2)*238,1+(n%8===0),1+(n%8===0),plum?'#a188a4':'#96aebf');
 ridge(g,249,14,1,plum?'#533f63':'#34516b');
 ridge(g,277,20,2,plum?'#463650':'#2b465c');
 if(!plum){
  for(let j=0;j<13;j++){
   const x=((22+j*42-travel*98)%546+546)%546-29;
   pine(g,x,378,66+seed(j,4)*100,48+seed(j,1)*50,'#253e52');
  }
 }
 const count=8;
 for(let j=0;j<count;j++){
  const x=plum?-25+j*67:((j*79-travel*212)%632+632)%632-75;
  house(g,x,367+(j%3)*8,62+(j%2)*6,(plum?109:81)+seed(j,52)*32,plum,j);
 }
 rect(g,-16,373,512,107,plum?'#827791':'#8da9bf');
 for(const [y,c] of (plum?[[376,'#a090a6'],[397,'#93839c'],[438,'#867a96']]:[[376,'#b3c9d6'],[397,'#a4bdcf'],[438,'#7899b4']])){
  rect(g,-16,y,512,y===376?4:2,c);
 }
 for(let j=0;j<13;j++){
  const x=plum?seed(j,45)*480:((seed(j,45)*480-travel*173)%542+542)%542-48;
  rect(g,x,383+seed(j,8)*83,12+seed(j,6)*59,2,plum?'#9a87a0':'#9ebaca');
 }
 if(plum){
  for(let j=0;j<49;j++){
   const x=j*10,y=159+Math.round(29*Math.sin(Math.PI*x/480));
   rect(g,x,y,11,2,'#735352');
   if(j%3===0){
    rect(g,x+3,y+2,1,4,'#583342');rect(g,x+1,y+5,5,5,j%2?'#ffcd7c':'#f9aa64');
    if(j%6===0)spark(g,x+3,y+7,3,'#edc28b');
   }
  }
 }
}
let backdrop;
function cachedScene(plum,travel){
 // A 480px pixel layer stays isolated from sprites; only this layer is smeared.
 if(!backdrop&&typeof document!=='undefined'&&document.createElement){
  const c=document.createElement('canvas');c.width=c.height=480;const ctx=c.getContext('2d');
  if(ctx)backdrop={c,ctx};
 }
 if(!backdrop)return null;
 scenery(backdrop.ctx,plum,travel);return backdrop.c;
}
function sceneryAt(g,plum,travel,motion){
 const image=cachedScene(plum,travel);
 if(!image){scenery(g,plum,travel);return;}
 const opacity=g.globalAlpha;
 g.drawImage(image,0,0);
 if(motion>.03){
   for(let k=1;k<5;k++){
    g.globalAlpha=opacity*motion*(.25-k*.038);
    const dx=Math.round(motion*k*4);
    g.drawImage(image,-dx,0,480+dx,480);
   }
   g.globalAlpha=opacity;
 }
}
function person(g,x,y,u,t,i,crowdScale){
 const palette=['#a8586f','#39738b','#815c9a','#4d806b','#b57554'];
 const c=palette[i%palette.length],j=t*11+i*1.9;
 const hop=u>.93?Math.max(0,Math.sin(j))*6:Math.abs(Math.sin(j))*3;
 g.save();g.translate(Math.round(x),Math.round(y-hop));g.scale(crowdScale,crowdScale);
 rect(g,-8,8,17,2,'#66576f');rect(g,-7,1,5,8,'#302d49');rect(g,3,1,5,8,'#302d49');
 rect(g,-8,-13,17,15,c);rect(g,-8,-12,17,3,'#e6bb97');rect(g,-6,-22,13,11,'#e7b38c');
 rect(g,-7,-26,15,6,c);rect(g,-8,-23,17,3,'#f0dfbd');rect(g,4,-30,5,4,'#f4e8ce');
 rect(g,-3,-18,2,2,'#412e40');rect(g,3,-18,2,2,'#412e40');
 for(const d of [-1,1]){
   const yy=u>.91?-22+Math.round(Math.sin(j+d)*3):-11+Math.round(Math.sin(j+d)*3);
   shape(g,c,[[d*7,-11],[d*15,yy-1],[d*16,yy+4],[d*7,-6]]);
   rect(g,d*15-1,yy-2,4,4,'#f2caa1');
   if(u>.88&&i%4===0&&d===1){rect(g,13,yy-9,7,8,'#9e6a4c');rect(g,14,yy-8,5,6,'#ffdd8b');}
 }
 g.restore();
}
function plinth(g,x,y,w){
 shape(g,'#5c4c64',[[x-w/2,y],[x-w*.42,y+14],[x+w*.43,y+14],[x+w/2,y]]);
 shape(g,'#ad91a2',[[x-w/2,y],[x-w*.41,y-8],[x+w*.41,y-8],[x+w/2,y],[x+w*.42,y+6],[x-w*.42,y+6]]);
 rect(g,x-w*.4,y+1,w*.8,2,'#d9aeb0');
}
const layerPhase=(i,count,t)=>ease((t-(3.56+(count<=1?0:i/(count-1))*.72))/.34);
function paint(g,opt){
 const {width:w,height:h,snapshot:s,before,source,reduced=false}=opt;
 if(!s||!source||!(w>0&&h>0))return;
 const count=s.layers.length,t=reduced?duration:clamp(opt.time??0,0,duration),narrow=w/h<.82;
 const detached=before?.layers?.length>count?before:null;
 const bounds=source.bounds(detached||s);
 const treeW=Math.max(100,bounds.right-bounds.left);
 const heightBound=Math.max(65,48-bounds.top);
 const scale=Math.min((narrow?w*.46:Math.min(w*.37,h*.49))/treeW,h*.57/heightBound,2.4);
 const center=w*.52,deck=h*.803;
 const settle=ease((t-2.16)/.74),exit=ease((t-3.10)/.75);
 const blend=ease((t-.76)/1.03),speed=Math.sin(Math.PI*clamp(t/2.26))**1.25;
 const sledX=center-w*.13*(1-ease(t/.96))+w*.115*Math.sin(Math.PI*ease(t/2.26))-exit*(center+scale*115);
 const treeBaseX=lerp(sledX+exit*(center+scale*115),center,settle);
 const sledBob=Math.round(Math.sin(t*26)*speed*2);
 const treeBaseY=deck-(1-settle)*(scale*14-sledBob)-Math.sin(Math.PI*settle)*15;
 const glow=Math.min(.56,.23+count*.014)*ease((t-3.57)/1.08)*(count>0?1:.29);
 g.save();g.imageSmoothingEnabled=false;
 g.save();g.scale(w/480,h/480);
 sceneryAt(g,false,t,speed);
 if(blend>0){g.globalAlpha=blend;sceneryAt(g,true,0,speed*.78);g.globalAlpha=1;}
 if(speed>.12&&!reduced){
  for(let i=0;i<26;i++){
   const x=(i*97 + 6000-Math.floor((t+.25)**2*360))%530-28,y=255+(i*61)%204;
   g.globalAlpha=(.27+i%3*.09)*speed;rect(g,x,y,8+speed*34,1+i%6/4,blend>.49?'#e1b4b5':'#c7e0e6');
  }
  g.globalAlpha=1;
 }
 for(let i=0;i<39;i++){
  const x=(seed(i,71)*480+510-(reduced?0:t*(3+i%9)))%480,y=(seed(i,36)*465+(reduced?0:t*(6+i%6)))%465;
  g.globalAlpha=.55;rect(g,x,y,1+i%4*.45,1+i%4*.45,blend>.5?'#ddc9db':'#cee1ef');
 }
 g.restore();
 if(blend>.42){g.save();g.globalAlpha=ease((blend-.42)/.48);plinth(g,center,deck+3,Math.min(w*.53,Math.max(85,treeW*scale*.95)));g.restore();}
 if(exit<.999&&source.drawSled)source.drawSled(g,{x:sledX,bottom:deck-scale*14+sledBob,scale});
 else if(!source.drawTree&&!source.drawSled&&source.draw){source.draw(g,s,{x:treeBaseX,bottom:treeBaseY,scale});g.restore();return;}
 if(glow>.01){
  const r=Math.min(w*.36,h*.33,36+Math.sqrt(count)*31);
  const grad=g.createRadialGradient(center,deck-22,3,center,deck-22,r);
  grad.addColorStop(0,'rgba(255,179,99,'+glow+')');grad.addColorStop(1,'#ffad7000');
  g.fillStyle=grad;g.fillRect(center-r,deck-22-r,r*2,r*2);
 }
 if(source.drawTree)source.drawTree(g,s,{x:treeBaseX,bottom:treeBaseY,scale,lightForRow:i=>layerPhase(i,count,t)});
 if(detached&&!reduced&&t<.70&&source.drawTree){
  const total=detached.layers.length;
  for(let i=count;i<total;i++){
   const v=(t-((total-i-1)*.035))/Math.max(.37,.52-(i-count)*.015);
   if(v>1)continue;
   const q=clamp(v),x=treeBaseX+detached.layers[i].x*scale,y=treeBaseY-i*detached.spacing*scale;
   const drift=(14+(i-count)*9)*q,drop=(83+(i-count)*13)*q*q,spin=(.52+(i-count)*.19)*q;
   g.save();g.translate(x+drift,y+drop);g.rotate(spin);g.translate(-x,-y);
   g.globalAlpha=1-ease((q-.69)/.31);
   source.drawTree(g,detached,{x:treeBaseX,bottom:treeBaseY,scale,fromRow:i,toRow:i+1,includeTrunk:false,includeStar:i===total-1&&detached.star,lightForRow:()=>.68});
   g.restore();
   if(q>.08&&q<.83)for(let j=0;j<6;j++){
    g.globalAlpha=(1-q)*.68;rect(g,x+drift+(j-2)*7,y+drop+(j%3)*6,2,2,'#e8d8df');
   }
   g.globalAlpha=1;
  }
 }
 // The colored row glints follow the live width and lean exactly, and never substitute branches.
 if(count&&t>=3.56&&t<5.08&&!reduced){
  for(let i=0;i<count;i++){
   const phase=layerPhase(i,count,t);
   if(phase<=.01||phase>=.99)continue;
   const row=s.layers[i],x=treeBaseX+row.x*scale,y=treeBaseY-(i*s.spacing+12)*scale;
   for(let j=0;j<3;j++){const xx=x+(j-1)*row.w*scale*.23;g.globalAlpha=Math.sin(phase*Math.PI)*.9;spark(g,xx,y+(j%2)*3,2+phase*2,['#ffdf93','#ffe8ae','#ffc489'][j]);}
  }
  g.globalAlpha=1;
  const q=clamp((t-3.85)/.9);
  if(q>0&&q<1){const r=Math.max(8,Math.min(w*.35,104+count*3)*q);g.globalAlpha=(1-q)*.72;g.strokeStyle='#ffd1a0';g.lineWidth=1.5;g.beginPath();g.ellipse(center,deck+6,r,r*.13,0,0,Math.PI*2);g.stroke();g.globalAlpha=1;}
 }
 if(settle>.88&&settle<1&&!reduced)
  for(let j=0;j<9;j++)spark(g,center+(j-4)*(3+settle*6),deck+(j%3)*4,1.5,'#ecd7db');
 if(count&&!s.star&&!reduced&&t>4.26&&t<5.04){
  const tip=s.layers[count-1],a=clamp((t-4.26)/.78);
  g.globalAlpha=Math.sin(Math.PI*a)*.86;
  spark(g,treeBaseX+tip.x*scale,treeBaseY-((count-1)*s.spacing+30)*scale,2.25+2*a,'#ffda8b');
  g.globalAlpha=1;
 }
 const guests=count===0?2:count<7?4:count<13?6:count<20?8:10;
 const actorScale=Math.min(1.25,Math.max(.72,Math.min(w/435,h/580)));
 const halo=Math.min(w*.28,Math.max(w*.155,treeW*scale*.56));
 for(let i=0;i<guests;i++){
  const u=ease((t-4.39-Math.floor(i/2)*.11)/.66);if(u<=0)continue;
  const side=i%2?-1:1,k=i>>1,margin=w*(narrow?.05:.1);
  const ex=clamp(center+side*(halo+Math.min(30,w*.064)*k),margin,w-margin);
  person(g,lerp(side<0?-18:w+18,ex,u),deck+25+(k%2)*18,u,reduced?8:t,i,actorScale);
 }
 if(t>4.88&&count>0&&!reduced)
  for(let j=0;j<Math.min(36,9+count);j++){const x=(seed(j,29)*w+t*(9+j%7))%w,y=deck-h*.30+((seed(j,14)*h*.26+(t-4.88)*34)%(h*.30));if(j%4)spark(g,x,y,1.8,['#ffda94','#f1abb9','#d3ebda'][j%3]);else rect(g,x,y,2,2,'#e5cedb');}
 g.restore();
}
window.ElfJourneyFinale=Object.freeze({duration,paint});
})();
