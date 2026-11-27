(function(g){
'use strict';
const W=1500,H=1000;
const palette={ink:'#293c51',soft:'#6f776f',rule:'#bab1a0',red:'#a7534b',navy:'#35586d',gold:'#b48b68',paper:'#fbf1df'};
const qr=
{"url": "https://kendrick-stein.github.io/christmas-elf-game/bellbound/", "rows": ["00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00001111111000001000001110010011111110000", "00001000001001101011011011101010000010000", "00001011101011000000001001011010111010000", "00001011101011101101010100101010111010000", "00001011101011001100111110010010111010000", "00001000001011001111010011000010000010000", "00001111111010101010101010101011111110000", "00000000000011010000101111100000000000000", "00001011111001000110011100100011111000000", "00000101010001100100101111010011011010000", "00000101101001111111100010101100101100000", "00000000100011001011100011000000111110000", "00001101111101111001010000001100110110000", "00001111100010111100111101010010001110000", "00001101001111110101110010000110110100000", "00000000000001011001101011100111011000000", "00001111011011100111110000111101100010000", "00000101000110010100111110010011011010000", "00001001011001001101000001101111101000000", "00001011100111010011001011110101111110000", "00000000011011100010110000111100110110000", "00001011110010001000101110011010000010000", "00001010101110011111110010000010001100000", "00001001100100000100100011111111111010000", "00001001011001100110010110001111110110000", "00000000000011110000111111001000101010000", "00001111111001011001000010111010101100000", "00001000001010101111101101111000111100000", "00001011101010111111010000101111110010000", "00001011101011000010111110011100101110000", "00001011101011001101001011111011000000000", "00001000001001001010000001110000111000000", "00001111111010001001110010111101000100000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000"]};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function line(c,x,y,x2,y2,col,w=1){
 c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
}
function type(c,str,x,y,px,{color=palette.ink,weight=400,face='serif',align='left'}={}){
 const sys=face==='serif'?'"Noto Serif CJK SC","Songti SC",Georgia,serif':'"Noto Sans CJK SC","PingFang SC",system-ui,sans-serif';
 c.font=weight+' '+px+'px '+sys;c.textAlign=align;c.textBaseline='alphabetic';c.fillStyle=color;c.fillText(str,x,y);
}
function tiny(c,s,x,y,px,col=palette.red){
 type(c,s,x,y,px,{color:col,weight:700,face:'sans'});
}
function circle(c,x,y,r,col,w=1){
 c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=w;c.stroke();
}
function polygon(c,ps,col){
 c.fillStyle=col;c.beginPath();ps.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
}
function framing(c){
 rect(c,0,0,W,H,'#f9efdd');
 const grad=c.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#fff9ed');grad.addColorStop(.6,'#f9eedb');grad.addColorStop(1,'#ebdbc0');rect(c,0,0,W,H,grad);
 for(let i=0;i<5100;i++){
  const x=(i*883+Math.floor(i/11)*23)%W,y=(i*97+Math.floor(i/17)*61)%H;
  rect(c,x,y,i%11===0?2:1,1,i%2?'#a78a6c2b':'#ffffff56');
 }
 rect(c,22,22,W-44,H-44,'#bdb3a461');rect(c,24,24,W-48,H-48,'#f8efdf');
 const shade=c.createLinearGradient(26,28,1474,974);shade.addColorStop(0,'#faf2e3');shade.addColorStop(.64,'#f9f1e2');shade.addColorStop(1,'#f5e6cd');rect(c,26,28,W-52,H-56,shade);
 c.save();c.beginPath();c.rect(24,24,W-48,H-48);c.rect(39,39,W-78,H-78);c.clip('evenodd');
 for(let x=-24,i=0;x<W;x+=44,i++){
  const col=i%2?'#a45349':'#41667a';
  polygon(c,[[x,24],[x+22,24],[x+10,39],[x-12,39]],col);
  polygon(c,[[x,H-39],[x+22,H-39],[x+10,H-24],[x-12,H-24]],col);
 }
 for(let y=24,i=0;y<H;y+=42,i++){
  const col=i%2?'#a45349':'#41667a';
  polygon(c,[[24,y],[39,y-9],[39,y+13],[24,y+22]],col);
  polygon(c,[[W-39,y],[W-24,y-9],[W-24,y+13],[W-39,y+22]],col);
 }
 c.restore();
}
function stamp(c,zh){
 const x=1118,y=98,w=292,h=332,r=5;
 c.save();c.shadowColor='#7c71544c';c.shadowOffsetY=5;c.shadowBlur=14;
 rect(c,x,y,w,h,'#fcf9f0');c.restore();
 c.fillStyle='#e6d7c0';
 for(let i=x+9;i<x+w;i+=15)for(const yy of [y,y+h]){c.beginPath();c.arc(i,yy,r,0,Math.PI*2);c.fill();}
 for(let i=y+10;i<y+h;i+=15)for(const xx of [x,x+w]){c.beginPath();c.arc(xx,i,r,0,Math.PI*2);c.fill();}
 c.strokeStyle='#aa7158';c.lineWidth=2;c.strokeRect(x+13,y+14,w-26,h-28);
 tiny(c,'WINTER POST',x+28,y+45,19);
 const ax=x+w-38,ay=y+35;polygon(c,[[ax,ay-8],[ax+3,ay-2],[ax+8,ay],[ax+3,ay+3],[ax,ay+8],[ax-3,ay+3],[ax-8,ay],[ax-3,ay-2]],palette.red);
 const unit=5,side=qr.rows.length*unit,sx=Math.round(x+(w-side)/2),sy=y+Math.round((350-side)/2);
 rect(c,sx,sy,side,side,'#fff');
 for(let j=0;j<qr.rows.length;j++)for(let i=0;i<qr.rows.length;i++)if(qr.rows[j][i]==='1')rect(c,sx+i*unit,sy+j*unit,unit,unit,'#20232a');
 type(c,zh?'扫码游玩':'SCAN TO PLAY',x+w/2,y+h-25,21,{color:palette.navy,weight:700,face:'sans',align:'center'});
}
function postmark(c){
 c.save();c.translate(1058,282);c.rotate(-.13);c.globalAlpha=.76;
 const c1='#7b685e';circle(c,0,0,66,c1,2);circle(c,0,0,57,c1,1.5);
 type(c,'SNOWTOWN',0,-18,15,{align:'center',weight:700,color:c1,face:'sans'});
 type(c,'WINTER MAIL',0,30,12,{align:'center',weight:700,color:c1,face:'sans'});
 for(let i=0;i<3;i++)line(c,-13+i*5,7,13-i*5,7,c1,1.8);
 for(let j=0;j<3;j++){c.beginPath();c.moveTo(-68,-14+j*12);c.bezierCurveTo(-101,-29+j*12,-120,2+j*12,-155,-15+j*12);c.strokeStyle=c1;c.lineWidth=2;c.stroke();}
 c.restore();
}
function render(canvas,data,snapshot){
 const c=canvas.getContext('2d');canvas.width=W;canvas.height=H;
 const zh=data.lang!=='en';
 framing(c);
 tiny(c,'01   /   WINTER ARCADE',71,94,22);
 type(c,zh?'冬日旅行纪念':'A WINTER KEEPSAKE',803,93,19,{color:palette.navy,align:'right',weight:700,face:'sans'});
 rect(c,70,116,735,478,'#c5ad91');
 rect(c,74,120,727,470,'#1b2741');
 const frame=snapshot?.canvas;
 if(frame){
  // Use the original pixel buffer, never the DOM overlay. Crop around the impact.
  c.imageSmoothingEnabled=false;
  const h=frame.width*468/725;
  const top=Math.round(Math.max(0,Math.min(frame.height-h,snapshot.y-h*.57)));
  c.drawImage(frame,0,top,frame.width,h,75,121,725,468);
 }
 const world={air:['夜空','NIGHT SKY'],sea:['海里','UNDERWATER'],land:['雪地','SNOWPATH']}[snapshot?.stage];
 if(world){
  const caption=zh?world[0]+' · 撞击瞬间':world[1]+' / THE IMPACT';
  rect(c,89,135,zh?190:308,37,'#17233deb');
  tiny(c,caption,103,161,18,'#ffe2b6');
 }
 type(c,zh?'来自雪镇的问候':'Greetings from Snowtown',72,674,zh?57:52,{weight:700});
 type(c,zh?'铃光远行 · 本局留念':'BELLBOUND  /  A POSTCARD FROM THIS RUN',77,716,21,{color:palette.red,face:'sans',weight:700});
 line(c,76,745,804,745,palette.rule,1.5);
 const stats=[[zh?'总分':'SCORE',data.score],[zh?'金币':'COINS',data.coins],[zh?'吃到的鱼':'FISH EATEN',data.fish],[zh?'完成圈数':'LAPS',data.laps]];
 stats.forEach(([label,v],i)=>{
  const x=78+i*185;
  if(i)line(c,x-16,771,x-16,878,palette.rule,1);
  type(c,String(v??0),x,827,42,{weight:700});
  tiny(c,label,x,866,19,palette.soft);
 });
 line(c,76,900,804,900,palette.rule,1.5);
 type(c,zh?'愿你下一程也有铃光相伴。':'May the bells light your next adventure.',77,940,24,{color:palette.navy});
 line(c,848,74,848,927,'#b3aa99',2);
 tiny(c,zh?'明信片  /  POST CARD':'POST CARD',887,96,24);
 postmark(c);stamp(c,zh);
 tiny(c,zh?'寄给':'TO',895,550,27,palette.navy);
 for(let i=0;i<4;i++)line(c,897,613+i*65,1413,613+i*65,'#83939a',1.6);
 type(c,zh?'扫码打开《铃光远行》。':'Scan to play Bellbound.',897,918,17,{color:palette.soft,face:'sans'});
 type(c,'BELLBOUND  •  SNOWTOWN POST OFFICE',897,947,15,{color:palette.red,face:'sans',weight:700});
 return canvas;
}
const api={render,target:qr.url};
g.BellPostcard=api;
if(typeof module!=='undefined')module.exports=api;
})(globalThis);
