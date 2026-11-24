((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CocoaShareArt=api;})(globalThis,()=>{
'use strict';
const W=900,H=1080, ink='#f7dcaf', muted='#c4aec7', gold='#e8ac73';
const BASE={dark:'#754438',milk:'#c78b63',wine:'#a53954',egg:'#e5c78a',apple:'#cf8041',latte:'#986346',white:'#dedeb8'};
const TOP={mint:'#9bd2b1',cream:'#ffe5c9',mallow:'#f4b3ce',spice:'#be754a',orange:'#eea857',caramel:'#ecab50',crumb:'#c88c50',peppermint:'#f591a8'};
function drawCounter(ctx,{drinks=[],revenue=0,served=0,tips=0,omitted=0}={},language='zh',qrImage,standImage){
 const en=language==='en', tr=(a,b)=>en?b:a;
 ctx.save();
 const num=(v)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.floor(v)):0;
 const raw=Array.isArray(drinks)?drinks:[];
 const valid=raw.filter(d=>Array.isArray(d)&&typeof d[0]==='string'&&Object.hasOwn(BASE,d[0])).map(d=>d.slice(0,4));
 const shown=valid.slice(-24),n=shown.length,extra=num(omitted)+Math.max(0,valid.length-n);
 const lines=[['本局营业额','REVENUE',num(revenue)],['成功送出','SERVED',num(served)],['收到小费','TIPS',num(tips)]];
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 const poly=(c,p)=>{ctx.fillStyle=c;ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
 const text=(s,x,y,size,c=ink,align='left',weight=600)=>{ctx.fillStyle=c;ctx.font=weight+' '+size+'px "Noto Sans CJK SC","PingFang SC",system-ui,sans-serif';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);};
 const ellipse=(x,y,rx,ry,c)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();};
 const star=(x,y,s,c)=>{rect(x-s/2,y-s*1.5,s,s*3,c);rect(x-s*1.5,y-s/2,s*3,s,c);};
 const frame=(x,y,w,h,c,b=2)=>{rect(x,y,w,b,c);rect(x,y+h-b,w,b,c);rect(x,y,b,h,c);rect(x+w-b,y,b,h,c);};
 const usable=im=>Boolean(im&&im.complete!==false&&(im.naturalWidth||im.width)&&(im.naturalHeight||im.height));
 const image=(im,x,y,w,h)=>{if(!usable(im))return false;try{ctx.imageSmoothingEnabled=false;ctx.drawImage(im,x,y,w,h);return true;}catch{return false;}};
 rect(0,0,W,H,'#221a2e');rect(26,24,848,1032,'#2d223a');
 frame(25,23,850,1034,'#a57665',2);frame(34,32,832,1016,'#62495f',2);
 for(const [x,y] of [[28,26],[862,26],[28,1044],[862,1044]]){rect(x,y,9,9,gold);rect(x+2,y+2,5,5,'#ffe0a7');}
 for(let j=0;j<35;j++){
  const x=48+(j*659+22)%799,y=41+(j*139+17)%990;
  if(y<182||y>959)rect(x,y,2+j%2,2+j%2,j%4===0?'#9b7280':'#583e58');
 }
 const upper=tr('松针雪夜 · 冬日街机','PINE & SNOW  ·  WINTER ARCADE');
 star(65,66,3,'#dda978');text(upper,87,66,en?17:20,muted);
 text(tr('雪夜可可铺','Snowy Cocoa Stand'),61,122,en?53:62,ink,'left',800);
 text(tr('本局送出的饮品','DRINKS SERVED THIS SHIFT'),64,174,en?20:23,gold,'left',700);
 star(813,102,7,'#f7bd79');star(772,133,3,'#c59085');
 // Snow-lane scene through the stand window.
 rect(57,210,786,525,'#272e4a');
 if(!image(standImage,59,226,782,317)){
  rect(59,226,782,310,'#272e4a');
  for(let i=0;i<47;i++)rect(67+i*89%750,231+i*37%208,i%3?2:3,2,'#716486');
 }
 rect(59,226,782,317,'#231b324a');rect(59,210,782,32,'#2a1b38');
 for(let i=0;i<24;i++){const x=67+i*33;if(i%2===0)rect(x,218,10,4,'#b26867');rect(x+20,229,3,3,'#dcb182');}
 // Three warm counter boards support drinks; placement works for zero through 24.
 for(let q=0;q<4;q++){
  const y=335+q*85;rect(61,y,778,120,'#3c2944');
  rect(61,y+5,778,41,'#583851');rect(61,y+7,778,3,'#ad745e');
  rect(61,y+46,778,3,'#37253c');
  for(let i=0;i<12;i++){const x=68+i*66+(q%2)*7;rect(x,y+17+(i*11)%22,10+i%5*5,2,'#6e4c60');}
 }
 rect(59,713,782,19,'#573b54');rect(59,719,782,3,'#a16a62');frame(57,208,786,527,'#a3776c',2);
 function mug(d,x,baseline,u){
  const A=(xx,yy,w,h,c)=>rect(x+xx*u,baseline+yy*u,w*u,h*u,c);
  ellipse(x+u*16,baseline+u*1.5,u*21,u*4.5,'#281c34');
  const c=BASE[d[0]];
  A(1,-32,26,31,'#361f34');A(23,-25,11,22,'#361f34');A(26,-22,8,15,'#e19d7b');A(28,-19,4,9,'#4b2c43');
  A(3,-29,23,25,'#af665d');A(4,-28,18,24,'#d79173');A(5,-26,4,18,'#f0b395');
  A(4,-30,21,5,'#ffe3b7');A(6,-29,17,3,c);A(6,-2,18,3,'#9b5159');
  A(10,-21,10,13,'#993e64');A(11,-20,8,11,c);A(12,-18,6,2,'#f0c594');
  for(let j=0;j<d.slice(1).length;j++){
   const k=d[j+1],cl=TOP[k];if(!cl)continue;
   const xx=8+j*6;
   if(k==='cream'){A(xx,-35,5,4,cl);A(xx+1,-37,3,2,cl);}
   else if(k==='mint'){A(xx,-34,4,4,cl);A(xx+1,-36,2,2,'#dbf4d0');}
   else if(k==='orange'){A(xx,-35,5,5,cl);A(xx+1,-34,3,3,'#ffcf7d');}
   else if(k==='peppermint'){A(xx,-35,4,5,cl);A(xx,-33,4,1,'#fff1d2');}
   else if(k==='caramel'){A(xx,-33,5,2,cl);A(xx+2,-35,2,2,'#ffd580');}
   else {A(xx,-34,4,4,cl);A(xx+1,-35,2,1,cl);}
  }
  A(10,-42,2,4,'#ebd1bdb0');A(12,-44,2,3,'#ebd1bd90');A(19,-43,2,4,'#ebd1bd96');A(17,-46,2,3,'#ebd1bd84');
 }
 const cols=n<=4?n:n<=10?5:6;
 const rows=n?Math.ceil(n/cols):0;
 if(!n){
  rect(151,379,598,180,'#2e243a');frame(151,379,598,180,'#846576',2);
  star(450,422,4,gold);text(tr('今天还没送出饮品','No drinks served this shift'),450,480,en?24:30,ink,'center',700);
  text(tr('杯子会在成功送出后出现在这里','Drinks appear here after a successful order'),450,523,en?17:19,muted,'center');
 }else{
  for(let r=0;r<rows;r++){
   const count=Math.min(cols,n-r*cols), pitch=n<=4?Math.min(173,640/count):n<=10?140:119;
   const y=rows===1?622:rows===2?495+r*139:rows===3?415+r*102:381+r*83;
   const size=n<=2?3.2:n<=4?2.85:n<=10?2.22:n<=18?1.93:1.80;
   for(let i=0;i<count;i++){
    const x=450-(count-1)*pitch/2+i*pitch-16*size;mug(shown[r*cols+i],x,y,size);
   }
  }
 }
 if(extra){
  rect(605,678,219,36,'#2c2039');frame(605,678,219,36,'#e5a879',2);
  text(tr('另有 +'+extra+' 杯','+'+extra+' more drinks'),715,696,en?16:19,ink,'center',700);
 }
 // Receipt controls and QR visually secondary, never compete with the counter.
 rect(57,766,786,233,'#3b2a46');frame(57,766,786,233,'#96707c',2);
 text(tr('打烊账单','SHIFT RECEIPT'),83,793,en?17:20,gold,'left',800);
 const xs=[83,282,474];
 for(let i=0;i<lines.length;i++){const [a,b,v]=lines[i],x=xs[i];rect(x,823,141,1,'#836477');text(tr(a,b),x,851,en?15:17,muted);text(v.toLocaleString(en?'en':'zh-CN'),x,894,v>999999?27:40,ink,'left',800);}
 text(tr('仅统计本局成功送出的饮品','Only successful orders from this shift'),83,959,en?14:16,muted);
 if(usable(qrImage)){
  rect(653,777,173,171,'#fff7e1');image(qrImage,660,784,159,157);
  text(tr('扫码打开游戏','SCAN TO PLAY'),739,973,en?14:16,ink,'center',700);
 }
 star(67,1024,2,gold);text(tr('雪夜留念','A WINTER KEEPSAKE'),82,1024,en?14:16,muted);
 ctx.restore();return {shown:n,omitted:extra,width:W,height:H};
}
return {drawCounter,width:W,height:H};
});
