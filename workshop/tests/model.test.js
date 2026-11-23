'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),M=require('../model');
test('each branch keeps its own width, height stays on canvas through edits and widths can be restored',()=>{
 const s=M.tree(),saved=M.clone(s);
 while(M.add(s)){s.layers[s.selected].w=260;}
 a.equal(s.layers.length,M.LIMIT);
 a(M.geometry(s).every(r=>r.y-r.height>0&&r.y<M.H));
 a.equal(M.pick(s,320,M.geometry(s).at(-1).y-18,true),s.layers.length-1);
 a.equal(M.pick(s,3,3,true),null);
 a.equal(saved.layers.length,6);a.equal(saved.layers[0].w,196);
 while(M.drop(s)){}
 a.equal(s.layers.length,1);a.equal(s.selected,0);
});
test('ornaments are owned by their rows; removing a photo never deletes other decorations',()=>{
 const s=M.tree();a(M.addDeco(s,2,'photo',2,-40,'local-sprite'));a(M.addDeco(s,2,'bell',-2,-3));
 a(M.addDeco(s,5,'garland',0,-14));a(!M.addDeco(s,2,'invalid',0,-10));
 const copy=M.clone(s);a.equal(copy.layers[2].deco[0].dx,.39);
 a.equal(copy.layers[2].deco[1].dy,-6);a.equal(s.selected,5);
 a(M.removePhoto(s,2));a(!M.removePhoto(s,2));
 a.equal(s.layers[2].deco[0].kind,'bell');
 a.equal(copy.layers[2].deco[0].photo,'local-sprite');
 a(M.removeDeco(s));a.equal(s.layers[5].deco.length,0);
});
test('pixel conversion removes only edge-connected white, preserves internal whites, keeps source immutable',()=>{
 const w=5,h=5,bytes=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4,dark=(x===1||x===3||y===1||y===3)&&x>=1&&x<=3&&y>=1&&y<=3;
  bytes.set(dark?[17,49,79,255]:[250,250,250,255],i);
 }
 const changed=M.pixelate(bytes,w,h,true),get=(x,y)=>changed.slice((y*w+x)*4,(y*w+x+1)*4);
 a.equal(get(0,0)[3],0);a.equal(get(4,2)[3],0);a.equal(get(2,2)[3],255);
 a.deepEqual(Array.from(get(1,1)),[32,64,64,255]);a.equal(bytes[3],255);
 a.equal(M.pixelate(bytes,w,h,false)[3],255);
});
