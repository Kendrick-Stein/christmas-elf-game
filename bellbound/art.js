(() => {
  'use strict';
  const {W,H,X:PX,GROUND}=BellCore;const FLOOR=280,WALL=23;
  const fit = (v, mod) => ((v % mod) + mod) % mod;
  const hash = n => (((n * 1103515245 + 12345) >>> 8) & 65535) / 65536;
  const pixel = (c, x, y, w, h, color) => { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const deer=new Image();deer.src='./deer.svg';
  function cross(c,x,y,t) {
    pixel(c,x-2,y,5,1,t); pixel(c,x,y-2,1,5,t); pixel(c,x,y,1,1,'#fff0c4');
  }
  function rooftops(c,d,lit) {
    const n = Math.floor(d / 39);
    for(let i=n-1;i<n+7;i++){
      const x=Math.floor(i*39-d), rr=hash(i+340), eave=239+Math.floor(rr*12);
      pixel(c,x+2,eave,34,FLOOR-eave,'#28314a');
      pixel(c,x+32,eave,4,FLOOR-eave,'#1e2842');
      for(let row=0;row<9;row++){
        const inset=Math.max(0,16-row*2), y=eave-18+row*2;
        pixel(c,x+inset,y,38-inset*2,2,row<2?'#bdcde8':row%3===0?'#4c587b':'#344061');
        if(row>1){pixel(c,x+inset,y,3,1,'#9aafce');pixel(c,x+35-inset,y,3,1,'#8fa6cd');}
      }
      pixel(c,x,eave-2,38,2,'#8299bf');
      for(let w=0;w<3;w++){
        const wx=x+5+w*10, bright=hash(i*31+w+71)>.55, glow=w===1 && typeof lit?.has==="function" && lit.has(i);
        pixel(c,wx-1,eave+4,7,9,'#191f35');
        pixel(c,wx,eave+5,5,7,glow?'#ffcf79':bright?'#ce9064':'#515676');
        if(bright||glow){pixel(c,wx,eave+5,2,3,glow?'#fff0b1':'#ffc881');pixel(c,wx+2,eave+5,1,7,'#69465b');}
      }
    }
  }
  function sky(c, distance, clock, warm) {
    const bands=['#131932','#171f3d','#1b2748','#222f53','#293859','#344666','#415475'];
    for(let i=0;i<bands.length;i++)pixel(c,0,i*40,W,40,bands[i]);
    pixel(c,142,36,13,10,'#dfc896');pixel(c,144,34,9,14,'#dfc896');pixel(c,144,36,8,9,'#efe3b8');pixel(c,149,33,8,9,bands[0]);
    for(let i=0;i<32;i++){
      const x=fit(hash(i*4+4)*W-distance*.015,W),y=9+hash(i*5+4)*176;
      if(i%9===0 && Math.sin(clock+i)>.35)cross(c,x,y,'#b9abc6');else pixel(c,x,y,1,1,i%4===0?'#d6c7b4':'#7586a7');
    }
    for(let k=0;k<2;k++) for(let x=0;x<W;x+=2){
      const p=x+distance*(k?.21:.095);
      const elevation=Math.floor((Math.sin(p*.060+k*1.3)*12+Math.sin(p*.023)*19+k*15)/2)*2;
      const ridge=201+k*14-elevation;
      pixel(c,x,ridge,2,H-ridge,k?'#293956':'#364668');
      if(!k)pixel(c,x,ridge,2,2,'#576587');
    }
    for(let i=0;i<16;i++){
      const x=fit(i*17+hash(i+13)*13-distance*.35,W+43)-15,y=213+hash(i+77)*12;
      for(let t=0;t<5;t++) pixel(c,x-t,y+t*3,2+t*2,3,t===1?'#526784':'#263d53');
      pixel(c,x, y+14,2,12,'#24394f');
    }
    rooftops(c,distance*.56,warm);
    pixel(c,0,FLOOR,W,H-FLOOR,'#aebfdf');
    pixel(c,0,FLOOR+2,W,4,'#8298c3');
    for(let i=0;i<17;i++){
      const x=fit(i*17-distance*1.05,W+12)-4,y=278+(i%4)*2;
      pixel(c,x,y,5+i%4,1,'#8ca2c9');
    }
  }
  function chimney(c,x,start,end,upper,id){
    if(end<=start) return;
    const yCap=upper?end-5:start;
    pixel(c,x+1,start,WALL-2,end-start,'#442b3d');
    pixel(c,x+2,start,WALL-5,end-start,'#653748');
    for(let y=start+2, n=0;y+2<end;y+=6,n++){
      const offset=n%2?4:0;
      for(let p=-1;p<3;p++){
        const xx= Math.max(x+2,x+offset+p*10+2), rr=Math.min(x+WALL-2,x+offset+p*10+10);
        if(rr<=xx)continue;
        pixel(c,xx,y,rr-xx,4,(n+p+id)%3===0?'#aa5d56':'#914e4e');
        if(rr-xx>4)pixel(c,xx+1,y,rr-xx-2,1,'#b66a60');
      }
    }
    pixel(c,x,yCap,WALL,5,'#67799e');pixel(c,x,yCap+(upper?2:0),WALL,3,'#dae5f8');
    for(let i=1;i<WALL-1;i+=5)pixel(c,x+i,yCap+(upper?1:0),3,2,'#f7e9e9');
    const lamp=upper?end-24:start+13;
    if(lamp>start+2 && lamp+7<end-2){
      pixel(c,x+7,lamp,9,8,'#362438');pixel(c,x+8,lamp+1,7,6,'#ffc983');pixel(c,x+11,lamp+1,1,6,'#985f5c');pixel(c,x+8,lamp+3,7,1,'#985f5c');
    }
  }
  function parcel(c,x,y){
    pixel(c,x-5,y-3,10,8,'#33273d');pixel(c,x-4,y-3,8,7,'#cb5559');pixel(c,x-5,y-4,10,2,'#f38170');
    pixel(c,x-1,y-5,2,9,'#ffc880');pixel(c,x-3,y-5,2,1,'#ffe0a2');pixel(c,x+1,y-5,2,1,'#ffe0a2');
  }
  function player(c,x,y,phase,kick,ending=false){
    c.save();c.translate(Math.round(x),Math.round(y));
    if(!ending && kick){pixel(c,-17,4,2,2,'#f8c58b');pixel(c,-20,7,1,1,'#f6deb6');pixel(c,-15,9,1,1,'#899dd2');}
    if(deer.complete&&deer.naturalWidth)c.drawImage(deer,-14,-11,28,24);
    else{pixel(c,-8,-1,15,8,'#b5684f');pixel(c,5,-6,8,10,'#dc925b');pixel(c,13,-1,2,3,'#f46e70');}
    if(kick){pixel(c,-9,8,4,2,'#633c40');pixel(c,-4,6,6,2,'#df945b');}
    else if(Math.floor(phase*6)%2){pixel(c,-8,9,2,2,'#e49d62');pixel(c,2,7,3,2,'#613d46');}
    c.restore();
  }
  const C=BellCore;
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
  function polygon(c,points,color){
    c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();
  }
  function snow(c,d,t){
    for(let i=0;i<52;i++){let x=fit(hash(i*47)*W-d*(.08+(i%3)*.08)-t*3,W),y=fit(hash(i*71+1)*H+t*(4+i%5),H);pixel(c,x,y,1+(i%11===0),1,['#788bab','#a8bbda','#c8d3e8'][i%3]);}
  }
  function bricky(c,x,y,w,h){
    if(h<1)return;
    c.save();c.beginPath();c.rect(Math.round(x),Math.round(y),w,h);c.clip();
    pixel(c,x,y,w,h,'#432a40');
    for(let j=0;j<h;j+=6){const k=j/6;for(let i=-1;i<w/9;i++){
      const a=x+9*i+(k%2?4:0);pixel(c,a,y+j+1,8,4,['#884b53','#9e5655','#ad6259'][(i+2+k)%3]);pixel(c,a,y+j+1,8,1,'#b7746a');
    }}c.restore();
  }
  function portal(c,x,y,clock){
    const w=40,start=y-24;
    bricky(c,x,start,w,FLOOR-start);
    pixel(c,x-2,start-4,w+4,4,'#e0e6f3');pixel(c,x,start,w,2,'#9aaccd');
    const p=[[5,6],[10,6],[10,4],[21,4],[21,6],[28,6],[28,9],[34,9],[34,15],[37,15],[37,22],[34,22],[34,28],[27,28],[27,31],[14,31],[14,29],[9,29],[9,26],[5,26],[5,22],[3,22],[3,12],[5,12]];
    polygon(c,p.map(([a,b])=>[x+a,y+b-15]),'#242137');
    for(let i=0;i<4;i++){
      pixel(c,x+7+i*6,y+12+(i%2),4,1,['#ad7569','#d29a70','#be8b6d','#94645e'][i]);
      const p=(clock*.77+i*.21)%1;if(p>.12&&p<.72)pixel(c,x+10+i*6,y+12-p*15,1,1,'#e8b77f');
    }
  }
  function beach(c,d,t){
    sky(c,d*.7,t);
    pixel(c,0,259,W,33,'#414f70');pixel(c,0,254,W,6,'#c4d5ee');pixel(c,0,260,W,4,'#7f93bb');
    for(let i=0;i<17;i++){let x=fit(i*17-d*1.13,W+11)-4;pixel(c,x,272+i%3*4,4+i%3,1,'#879ec1');}
    snow(c,d,t);
  }
  function home(c,x,y,t){
    bricky(c,x,y-27,62,36);
    polygon(c,[[x-5,y-25],[x+29,y-57],[x+66,y-25]],'#7487a9');
    polygon(c,[[x-6,y-25],[x+29,y-59],[x+67,y-25],[x+62,y-24],[x+29,y-54],[x-1,y-24]],'#d9e7f4');
    pixel(c,x+14,y-17,15,26,'#ebb376');
    pixel(c,x+17,y-14,10,23,'#342741');
    pixel(c,x+38,y-15,10,11,'#ffd58a');pixel(c,x+42,y-15,1,11,'#a77964');
    bricky(c,x+45,y-55,13,20);pixel(c,x+43,y-58,16,3,'#dbe6f7');
    for(let i=0;i<8;i++)pixel(c,x+3+i*7,y-24,2,2,['#ffc881','#64a8a3','#d98b8e'][i%3]);
    if(Math.sin(t*10)>.2) cross(c,x+19,y-5,'#edc790');
  }
  function hare(c,x,y,t,going){
    const p=[[0,0],[2,-6],[7,-8],[13,-7],[15,-12],[13,-17],[14,-21],[17,-21],[21,-13],[24,-10],[27,-8],[28,-2],[25,1],[13,2],[5,1]];
    polygon(c,p.map(([a,b])=>[x+a-15,y+b+6]),'#f0edf2');
    pixel(c,x+1,y-11,2,4,'#d791a0');pixel(c,x+6,y,2,2,'#252b41');pixel(c,x+12,y+2,2,2,'#de898e');
    pixel(c,x-6,y+1,9,3,'#60aaa0');
    pixel(c,x-9,y+(going?8:9),6,2,'#9eb6d7');
    if(going&&t%0.3>.14)pixel(c,x-20,y+8,4,1,'#b3cae2');
  }
  function underwater(c,d,t){
    for(let i=0;i<6;i++)pixel(c,0,49*i,W,49,['#214956','#255964','#245261','#21465e','#1b3a55','#172e49'][i]);
    for(let j=0;j<7;j++){const x=fit(j*39-d*.16,W+45)-20;polygon(c,[[x,0],[x+10,0],[x-18,199],[x-35,227]],'#2d6070');}
    for(let i=0;i<47;i++){let x=fit(hash(i*53)*W-d*.21,W),y=fit(hash(i*91)*H-t*(3+i%3),H);pixel(c,x,y,1,1,'#77a6ac');}
    for(let i=0;i<11;i++){
      const x=fit(29*i-d*.67,W+40)-18,h=6+Math.round(hash(i+812)*12);
      for(let j=0;j<h;j++){const yy=H-4-j*4,xx=x+Math.sin(t+j*.7+i)*3;pixel(c,xx,yy,2,4,i%2?'#416e72':'#4c7475');if(j%4===2)pixel(c,xx-3,yy,4,1,'#6e9287');}
    }
    pixel(c,0,H-4,W,4,'#455b6d');
    for(let i=0;i<12;i++){const x=fit(i*31-d*.47,W),yy=fit(i*49-t*(12+i%4),H);bubble(c,x,yy,2+i%3,'#83b7c0');}
  }
  function bubble(c,x,y,n,col){
    pixel(c,x-n+1,y-n,n*2-1,1,col);pixel(c,x-n+1,y+n,n*2-1,1,col);
    pixel(c,x-n,y-n+1,1,n*2-1,col);pixel(c,x+n,y-n+1,1,n*2-1,col);
  }
  function fish(c,x,y,sz,t,type='hero',dir=1){
    const red=type==='hero',p=red?['#81384c','#e17968','#ffd49c','#68b4ab']:type==='danger'?['#54304d','#b0678f','#e4a9ac','#8d4970']:['#3e6972','#75c3b5','#caf0bf','#67a79e'];
    const f=(pts,col)=>polygon(c,pts.map(([a,b])=>[x+a*sz*dir,y+b*sz]),col);
    const q=Math.round(Math.sin(t*13)*2);
    f([[-15,-6+q],[-10,-2],[-5,-6],[5,-6],[10,-3],[12,1],[8,5],[-6,5],[-10,2],[-15,6-q]],p[0]);
    f([[-13,-3+q],[-8,-1],[-5,-5],[5,-5],[9,-2],[10,1],[7,4],[-5,4],[-8,1],[-13,3-q]],p[1]);
    f([[-4,-5],[-1,-9],[2,-5]],p[3]);f([[-5,2],[7,1],[7,4],[-4,4]],p[2]);
    f([[5,-3],[7,-3],[7,-1],[5,-1]],'#252940');
    if(red)f([[-5,-2],[-3,-2],[-3,3],[-5,3]],p[3]);
  }
  function localCoin(c,x,y,t){
    const w=3+Math.round(Math.abs(Math.sin(t*8+x*.033))*4);
    pixel(c,x-w/2,y-5,w,9,'#9a614e');pixel(c,x-w/2+1,y-4,w-2,7,'#f2ad52');pixel(c,x-w/2,y-3,1,5,'#ffda98');
    if(w>4)pixel(c,x,y-3,1,5,'#fff1ba');
  }
  function loot(c,x,y,kind,t){
    if(kind==='dash'){
      polygon(c,[[x-8,y+4],[x-6,y+2],[x-6,y-4],[x-3,y-7],[x+3,y-7],[x+6,y-4],[x+7,y+2],[x+9,y+4]],'#ffc179');
      pixel(c,x-3,y-5,2,8,'#fff0bb');pixel(c,x-2,y+6,4,2,'#e78c61');pixel(c,x-1,y-9,3,2,'#64afa6');
    }else if(kind==='magnet'){
      pixel(c,x-6,y-5,4,12,'#e47d87');pixel(c,x+3,y-5,4,12,'#e47d87');pixel(c,x-3,y+4,8,3,'#e47d87');
      pixel(c,x-6,y-5,4,3,'#e4e7f1');pixel(c,x+3,y-5,4,3,'#e4e7f1');
    }else bubble(c,x,y,7,'#93d5d9');
    if(Math.sin(t*8)>.5)cross(c,x+10,y-6,'#d6ad83');
  }
  function buoy(c,x,y,t){
    for(let i=0;i<3;i++){
      const off=(t*4+i*5)%14;
      bubble(c,x,y+7+off,2+i,'#80b9c8');
    }
    pixel(c,x-9,y-2,18,4,'#efb679');pixel(c,x-4,y-8,9,6,'#f2d793');
    pixel(c,x+1,y-17,1,9,'#dbd2a7');pixel(c,x+2,y-16,7,4,'#db7f72');
    if(Math.sin(t*7)>.1)cross(c,x+6,y-18,'#ecd8a1');
  }
  function flames(c,s,t){
    const {x,y,stage}=s;
    const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
    const power=ease((2.2-s.dash)/.12)*(.36+.64*ease(s.dash/.29));
    const fire=stage==='air',sea=stage==='sea';
    const colors=fire?['#733746','#a14b48','#e47d55','#ffc077','#ffe5ab']:
      sea?['#2b6680','#3f849b','#67adc4','#a3dbe1','#d6edf0']:
      ['#4d6489','#6886ad','#91aacf','#bbd0e7','#e2e9f4'];
    const root=x-12,top=y+(stage==='land'?4:2);
    for(let lane=0;lane<4;lane++){
      const max=(lane===0?71:61-lane*7)*power;
      for(let gap=1;gap<max;gap+=2){
        const p=gap/max,phase=t*(20+lane*3)-p*6+lane*1.4;
        const wave=(Math.sin(phase)*2.6+Math.sin(phase*1.31)*1.4)*p;
        const yy=top+wave+(lane-1.7)*(1.55+3.3*p)-(lane===3?1.7:0);
        const col=colors[Math.min(4,Math.max(lane===1?2:lane===2?1:0, (gap<16&&lane===1?4:gap<34?3:gap<49?2:1)-(lane%2?0:1)))];
        if(gap<13||Math.sin(phase*.5+lane)>.07||lane===1){
          pixel(c,root-gap,yy,2,Math.max(1,Math.round((1-p)*(lane===1?4:1.5))),col);
        }
      }
    }
    for(let i=0;i<27;i++){
      const age=fit(t*(.8+(i%4)*.18)+hash(i+51),1),gap=(15+age*(71+hash(i+425)*42))*power;
      const off=(hash(i+374)-.5)*(8+age*39)+Math.sin(age*9+i)*2;
      const xx=root-gap,yy=top+off-age*4;
      if(fire&&i%11===0&&age<.30)cross(c,xx,yy,colors[3]);
      else if(sea&&i%7===0&&age<.67)bubble(c,xx,yy,1,colors[3]);
      else pixel(c,xx,yy,age>.77?1:i%4===0?3:2,1,colors[age<.3?4:age<.65?2:0]);
    }
  }
  function deerRank(c,x,y,t,s){
    player(c,x,y,t,s.t-s.lastTap<.16);
    const k=C.level(s);
    if(k){
      pixel(c,x+5,y-12,1,k>=2?9:5,'#eed4a0');pixel(c,x+9,y-11,1,k>=2?8:4,'#efd7a3');
      pixel(c,x+3,y-12,3,1,'#edd0a0');pixel(c,x+9,y-10,4,1,'#efd39d');
      pixel(c,x+2,y+6,3,1,'#efae71');
    }
    if(k>1){pixel(c,x+5,y-15,1,3,'#ffdb95');pixel(c,x+3,y-13,6,1,'#ffe8ad');}
    if(k>2){pixel(c,x-6,y+3,2,1,'#ffc888');pixel(c,x-3,y+3,2,1,'#7cbbb6');}
  }
  function actual(c,s,t,fx,ready){
    if(s.stage==='sea')underwater(c,s.depth,t);
    else if(s.stage==='land')beach(c,s.depth,t);
    else {sky(c,s.depth,t,fx.lit);snow(c,s.depth,t);}
    const drawList=[...s.entities].sort((a,b)=>Number(a.type==='coin')-Number(b.type==='coin'));
    for(const e of drawList){
      const x=Math.round(e.x),y=Math.round(e.y);
      if(x>W+12||x< -68)continue;
      if(e.type==='wall'&&s.stage==='air'){
        const [top,bot]=[y-e.gap/2,y+e.gap/2];
        if(e.broken){
          // Widen the original passable opening; visible jagged ends remain.
          const cut=e.cutY??y;
          bricky(c,x,0,WALL,Math.max(0,Math.min(top-14,cut-18)));
          const end=Math.max(bot+14,cut+18);bricky(c,x,end,WALL,FLOOR-end);
          for(let k=0;k<5;k++){pixel(c,x+k*4,Math.min(top-14,cut-18)+(k*3)%5,4,2,'#a2635e');pixel(c,x+k*4,end-(k*3)%5,4,2,'#a2635e');}
        }else {chimney(c,x,0,top,true,e.id);chimney(c,x,bot,FLOOR,false,e.id);}
      }
      if(e.type==='wall'&&s.stage==='land'&&!e.broken){bricky(c,x,GROUND-e.h+5,e.w,e.h+3);pixel(c,x-2,GROUND-e.h+2,e.w+4,5,'#cbdcf1');}
      if(e.type==='portal'){
        if(s.stage==='air')portal(c,x,y,t);
        if(s.stage==='sea')buoy(c,x+8,y,t);
        if(s.stage==='land')home(c,x-8,GROUND,t);
      }
      if(e.type==='coin')localCoin(c,x,y,t);
      if(e.type==='gift')parcel(c,x,y);
      if(e.type==='tool')loot(c,x,y,e.kind,t);
      if(e.type==='fish'){
        const size=e.size,type=size>C.fishSize(s)?'danger':'prey';
        fish(c,x,y,size,t,type,-1);
        if(type==='danger'&&!e.broken)pixel(c,x,y-15,2,2,'#dd899f');
      }
    }
    if(ready&&s.stage==='air'){portal(c,153,173,t);[122,133,144].forEach((x,i)=>localCoin(c,x,158+i*4,t));}
    for(const p of fx.particles){
      const age=t-p.t;if(age<0||age>p.life)continue;
      const x=p.x+p.vx*age-(s.travel-p.travel),y=p.y+p.vy*age+p.g*age*age;
      pixel(c,x,y,age<p.life*.62?p.size:1,age<p.life*.68?p.size:1,p.c);
    }
    const py=ready?134+3*Math.sin(t*3):s.y;
    if(s.dash>0)flames(c,s,t);
    if(s.shield)bubble(c,s.x,py,16,'#9bcbd4');
    if(s.magnet>0&&Math.sin(t*8)>.5){pixel(c,s.x-19,py-3,2,6,'#df859c');pixel(c,s.x+17,py-3,2,6,'#df859c');}
    if(s.stage==='sea')fish(c,s.x,py,C.fishSize(s),t);
    else if(s.stage==='land')hare(c,s.x,py-1,t,py<GROUND||Math.sin(t*12)>.1);
    else deerRank(c,s.x,py,t,s);
  }
  const cuts={air:{img:new Image(),n:56},sea:{img:new Image(),n:39},land:{img:new Image(),n:44}};
  for(const [k,v] of Object.entries(cuts))v.img.src='./'+k+'-cut.webp';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function scene(c,s,t,fx,ready){
    c.imageSmoothingEnabled=false;actual(c,s,t,fx,ready);
    const tr=s.transition;
    if(!tr)return;
    const f=clamp(tr.age/tr.duration),v=cuts[tr.from];
    if(v.img.complete&&v.img.naturalWidth&&!reduce.matches){
      const k=Math.min(v.n-1,Math.floor(ease((f-.05)/.88)*v.n));
      // The ambient art is held briefly at entry, then gives way to the authored camera shot.
      c.globalAlpha=ease((f-.02)/.13);
      c.drawImage(v.img,k%8*W,Math.floor(k/8)*H,W,H,0,0,W,H);
      c.globalAlpha=1;
    }else{
      const col=tr.to==='sea'?'#254757':tr.to==='land'?'#496082':'#212540';
      c.globalAlpha=ease(f);pixel(c,0,0,W,H,col);c.globalAlpha=1;
    }
  }
  window.BellArt={scene,sky,player};
})();
