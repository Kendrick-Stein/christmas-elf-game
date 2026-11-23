(function(g){
'use strict';
const START=[196,175,149,137,111,87],MIN=48,MAX=260,LIMIT=15,W=640,H=680;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const tree=()=>({layers:START.map(w=>({w,deco:[]})),selected:0});
const clone=s=>({selected:s.selected,layers:s.layers.map(l=>({w:l.w,deco:l.deco.map(o=>({...o}))}))});
function add(s){if(s.layers.length>=LIMIT)return false;const top=s.layers.at(-1);s.layers.push({w:clamp(top.w-13,MIN,MAX),deco:[]});s.selected=s.layers.length-1;return true;}
function drop(s){if(s.layers.length<2)return false;s.layers.splice(s.selected,1);s.selected=clamp(s.selected,0,s.layers.length-1);return true;}
function geometry(s){
 const bottom=560,space=clamp(370/Math.max(1,s.layers.length-1),24,37);
 return s.layers.map((l,i)=>({x:W/2,y:bottom-i*space,w:l.w,height:43}));
}
function pick(s,x,y,strict=false){
 const rects=geometry(s);
 for(let i=rects.length-1;i>=0;i--){
   const l=rects[i],rise=(l.y-y)/l.height;
   if(rise>=-.14&&rise<=1.08&&Math.abs(x-l.x)<=l.w*(rise>.79?.32:.57)+8)return i;
 }
 if(strict)return null;
 return s.selected;
}
function addDeco(s,index,kind,dx,dy,photo){
 if(!['garland','bulb','bell','bow','cane','star','photo'].includes(kind))return false;
 if(!s.layers[index]||s.layers.reduce((n,l)=>n+l.deco.length,0)>=100)return false;
 if(kind==='photo'&&typeof photo!=='string')return false;
 s.layers[index].deco.push({kind,dx:clamp(dx,-.39,.39),dy:clamp(dy,-31,-6),photo:kind==='photo'?photo:null});
 s.selected=index;return true;
}
function removeDeco(s,i=s.selected){return !!s.layers[i]?.deco.pop();}
function removePhoto(s,i=s.selected){
 const items=s.layers[i]?.deco;if(!items)return false;
 const j=items.findLastIndex(o=>o.kind==='photo');
 if(j<0)return false;items.splice(j,1);return true;
}
function pixelate(bytes,w,h,removeBackground){
 const out=new Uint8ClampedArray(bytes);
 if(removeBackground){
  const sea=new Uint8Array(w*h),queue=[];
  const whiteness=i=>{const k=i*4,low=Math.min(out[k],out[k+1],out[k+2]),high=Math.max(out[k],out[k+1],out[k+2]);return out[k+3]<25||(low>=230&&high-low<=25);};
  const push=i=>{if(!sea[i]&&whiteness(i)){sea[i]=1;queue.push(i);}};
  for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}
  for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
  for(let j=0;j<queue.length;j++){
    const i=queue[j];out[i*4+3]=0;
    if(i%w>0)push(i-1);if(i%w<w-1)push(i+1);if(i>=w)push(i-w);if(i<(h-1)*w)push(i+w);
  }
 }
 for(let i=0;i<out.length;i+=4){for(let j=0;j<3;j++)out[i+j]=Math.min(255,Math.round(out[i+j]/32)*32);}
 return out;
}
const m={W,H,MIN,MAX,LIMIT,clamp,tree,clone,add,drop,geometry,pick,addDeco,removeDeco,removePhoto,pixelate};
if(typeof module!=='undefined')module.exports=m;else g.WorkshopModel=m;
})(globalThis);
