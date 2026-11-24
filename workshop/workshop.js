(()=>{
'use strict';
const M=window.WorkshopModel,$=id=>document.getElementById(id),{W,H}=M,canvas=$('tree'),g=canvas.getContext('2d');
const words={
 back:['返回游戏','Back to game'],brand:['造树工坊','Tree Workshop'],export:['保存 PNG','Save PNG'],myTree:['我的圣诞树','My Christmas tree'],workbench:['工作台','WORKBENCH'],customize:['搭一棵自己的树','Build your own tree'],layers:['松枝','Branches'],decor:['挂饰','Ornaments'],photo:['照片','Photos'],
 aboutLayers:['点树枝选层，每层可以用不同宽度。','Tap a branch to select a layer. Each can have its own width.'],width:['松枝宽度','Branch width'],small:['小','Small'],medium:['中','Medium'],large:['大','Large'],addLayer:['＋ 加一层','＋ Add a layer'],deleteLayer:['删掉这层','Remove this layer'],
 aboutDecor:['先选挂饰，再点松枝挂上去。','Choose an ornament, then tap a branch to hang it.'],hangSelected:['挂到所选层','Hang on selected layer'],deleteLast:['移除该层最后一件','Remove last item from layer'],
 localPhoto:['建议用白底照片。只在本机转换，不会上传。','Try a white-background photo. It stays on this device and is never uploaded.'],choosePhoto:['选择照片','Choose photo'],removeWhite:['去掉边缘相连的白底','Remove the white background connected to the edge'],hangPhoto:['把照片挂到所选层','Hang photo on selected layer'],unhangPhoto:['移除该层最后一张照片','Remove last photo on layer'],undo:['↶ 撤销','↶ Undo'],
 garland:['灯带','Light strand'],bulb:['彩灯','Bulb'],bell:['铃铛','Bell'],bow:['蝴蝶结','Bow'],cane:['拐杖糖','Candy cane'],star:['星星','Star'],
 stage:['圣诞树画布','Christmas tree canvas'],tools:['编辑工具','Editing tools'],count:['{n} 层','{n} layers'],layer:['第 {n} 层','Layer {n}'],selectHint:['点松枝选择要编辑的层','Tap a branch to select its layer'],hangHint:['点树枝挂上','Tap a branch to hang it'],photoHint:['点树枝挂照片','Tap a branch to hang the photo'],
 placed:['挂上了。','Hung on the tree.'],deleted:['已移除。','Removed.'],restored:['已撤销。','Undone.'],full:['挂饰已满。','The tree is full of ornaments.'],noBranch:['请点实际松枝。','Tap an actual branch.'],photoReady:['像素照片已就绪，可以挂到树上。','Pixel photo ready to hang.'],photoBad:['读不出这张照片。请重试 PNG、JPG 或 WebP 文件。','Could not read this photo. Try a PNG, JPG or WebP file.'],photoLarge:['照片太大。请选择不超过 12 MB、2400 万像素的文件。','Use a file under 12 MB and 24 megapixels.'],saved:['已请求保存 PNG。','PNG download requested.'],saveBad:['未能保存，请重试。','Could not save the image. Please try again.'],switch:['切换语言','Change language']
};
const embedded=!!window.parent&&window.parent!==window;
const LANGUAGE_KEY='snow-pine-language-v1', WORKSHOP_LEGACY_KEY='pine-workshop-language';
let lang='zh';try{const shared=localStorage.getItem(LANGUAGE_KEY);const legacy=localStorage.getItem(WORKSHOP_LEGACY_KEY);if((shared||legacy)==='en')lang='en';}catch{}
$('language').hidden=embedded;
if(!embedded&&typeof location!=='undefined'&&/^\/christmas-elf-game\/workshop(?:\/|\/index\.html)?$/.test(location.pathname))$('backStandalone').hidden=false;
if(embedded){
 window.addEventListener('message',e=>{
   if(e.source!==window.parent||e.origin!==location.origin||e.data?.type!=='pine:workshop-language'||!['en','zh'].includes(e.data.language))return;
   if(lang!==e.data.language){lang=e.data.language;language();}
 });
 window.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&location.origin!=='null'){e.preventDefault();window.parent.postMessage({type:'pine:workshop-close'},location.origin);}
 });
}
const t=(k,vars={})=>(words[k]?.[lang==='en'?1:0]??k).replace(/\{(\w+)\}/g,(_,n)=>vars[n]??'');
const kinds={garland:'✦ ✦',bulb:'●',bell:'♧',bow:'⋈',cane:'⌝',star:'✦'};
const colors=['#ffdc76','#ff8d9c','#8ceccb','#a6bafa'];
const art={};const photos=new Map();
const ready=Promise.all(Object.entries(window.WorkshopArt).map(([key,url])=>new Promise(resolve=>{
 const im=new Image();art[key]=im;im.onload=im.onerror=resolve;im.src=url;
})));
let model=M.tree(),history=[],tab='layer',kind='garland',photoImage=null,photoSprite=null,photoGeneration=0,view={s:1,x:0,y:0},status='',photoStatus='';
function message(key){status=key;$('status').textContent=key?t(key):'';}
function photoMessage(key){photoStatus=key;$('photoInfo').textContent=key?t(key):'';}
function update(fn,key){const before=M.clone(model);if(fn(model)){history.push(before);if(history.length>40)history.shift();if(key)message(key);sync();}else if(key==='placed')message('full');}
function sync(){
 const selected=model.layers[model.selected];
 $('width').value=selected.w;$('widthValue').textContent=selected.w;
 $('prune').disabled=model.layers.length<=1;$('grow').disabled=model.layers.length>=M.LIMIT;
 $('undo').disabled=!history.length;$('unhang').disabled=!selected.deco.length;$('hangPhoto').disabled=!photoSprite;$('unhangPhoto').disabled=!selected.deco.some(o=>o.kind==='photo');
 $('layerCount').textContent=t('count',{n:model.layers.length});
 prunePhotoCache();
 $('stageHint').textContent=t(tab==='layer'?'selectHint':tab==='deco'?'hangHint':photoSprite?'photoHint':'localPhoto');
 document.querySelectorAll('.layerChip').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===model.selected)));
 if($('layerButtons').childElementCount!==model.layers.length)buildLayers();
 render();
}
function prunePhotoCache(){
 const refs=new Set([photoSprite]);
 for(const s of [model,...history])for(const l of s.layers)for(const o of l.deco)if(o.photo)refs.add(o.photo);
 for(const p of photos.keys())if(!refs.has(p))photos.delete(p);
}
function buildLayers(){
 const wrapper=$('layerButtons');wrapper.replaceChildren();
 model.layers.forEach((_,i)=>{
  const b=document.createElement('button');b.textContent=i+1;b.className='layerChip';b.setAttribute('aria-label',t('layer',{n:i+1}));b.setAttribute('aria-pressed',String(model.selected===i));
  b.onclick=()=>{model.selected=i;sync();};wrapper.append(b);
 });
}
function buildSwatches(){
 const wrapper=$('swatches');wrapper.replaceChildren();
 for(const [k,symbol] of Object.entries(kinds)){
  const b=document.createElement('button'),bloom=document.createElement('b');bloom.textContent=symbol;bloom.setAttribute('aria-hidden','true');
  b.append(bloom,document.createTextNode(t(k)));b.setAttribute('aria-pressed',String(kind===k));b.onclick=()=>{kind=k;wrapper.querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));};wrapper.append(b);
 }
}
function language(){
 document.documentElement.lang=lang==='en'?'en':'zh-CN';document.title=t('brand')+' · Pine & Snow';
 for(const node of document.querySelectorAll('[data-i18n]'))node.textContent=t(node.dataset.i18n);
 $('language').textContent=lang==='en'?'🌐 中文':'🌐 English';$('language').setAttribute('aria-label',t('switch'));
 canvas.setAttribute('aria-label',t('stage'));$('photoFile').setAttribute('aria-label',t('choosePhoto'));
 buildLayers();buildSwatches();message(status);photoMessage(photoStatus);sync();
}
function changeTab(name,focus=false){
 tab=name;
 for(const b of document.querySelectorAll('[data-tab]')){
   const yes=b.dataset.tab===tab;b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1;$('panel-'+b.dataset.tab).hidden=!yes;
   if(yes&&focus)b.focus();
 }
 sync();
}
function image(ctx,key,x,y,w,h){
 const im=art[key];if(!im?.naturalWidth)return false;
 ctx.drawImage(im,x,y,w,h);return true;
}
function rect(ctx,color,x,y,w,h){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function star(ctx,x,y,r){
 ctx.beginPath();for(let i=0;i<10;i++){const a=Math.PI*i/5-Math.PI/2,d=i%2?r*.42:r;ctx[i===0?'moveTo':'lineTo'](x+Math.cos(a)*d,y+Math.sin(a)*d);}
 ctx.closePath();ctx.fillStyle='#ffdc86';ctx.fill();
 rect(ctx,'#fff1bc',x-2,y-2,4,4);
}
function bulb(ctx,x,y,i,small=false){
 const c=colors[i%colors.length],z=small?7:10;
 ctx.globalAlpha=.27;rect(ctx,c,x-z*.8,y-z*.45,z*1.6,z*1.7);ctx.globalAlpha=1;
 rect(ctx,'#323343',x-z*.5-1,y,z+2,z+3);rect(ctx,c,x-z*.5,y+1,z,z);rect(ctx,'#fff3d7',x-z*.5+1,y+2,2,2);
}
function ornament(ctx,o,row,i){
 const x=row.x+o.dx*row.w,y=row.y+o.dy;
 if(o.kind==='garland'){
  const half=Math.min(53,row.w*.31),cx=M.clamp(x,row.x-row.w*.41+half,row.x+row.w*.41-half);
  ctx.strokeStyle='#cbb281';ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(cx-half,y);ctx.quadraticCurveTo(cx,y+21,cx+half,y);ctx.stroke();
  for(let k=0;k<5;k++){const p=k/2-1;bulb(ctx,cx+p*half*.88,y+1+(1-p*p)*10,i+k,true);}return;
 }
 rect(ctx,'#c8a980',x-1,y-6,2,8);
 if(o.kind==='bulb')bulb(ctx,x,y+2,i);
 if(o.kind==='bell')image(ctx,'pixel-bell',x-9,y,18,18);
 if(o.kind==='cane')image(ctx,'pixel-cane',x-9,y,18,22);
 if(o.kind==='star')star(ctx,x,y+8,10);
 if(o.kind==='bow'){
  rect(ctx,'#78384c',x-12,y+2,24,13);rect(ctx,'#ed879e',x-11,y+3,8,10);rect(ctx,'#ed879e',x+3,y+3,8,10);rect(ctx,'#ffd29a',x-3,y+6,6,6);rect(ctx,'#984b64',x-8,y+15,5,7);rect(ctx,'#984b64',x+3,y+15,5,7);
 }
 if(o.kind==='photo'){
  const px=x-20,py=y-7,im=photos.get(o.photo);
  if(im?.naturalWidth)ctx.drawImage(im,px+8,py+14,24,24);
  image(ctx,'pixel-photo-pendant-frame',px,py,39,46);
 }
}
function draw(ctx,state,showSelection){
 ctx.imageSmoothingEnabled=false;
 if(!image(ctx,'workshop-bg',0,0,W,H)){rect(ctx,'#1b334b',0,0,W,H);rect(ctx,'#654a45',0,573,W,107);}
 image(ctx,'pixel-workshop-plinth',W/2-109,558,218,40);
 rect(ctx,'#855341',W/2-9,540,18,28);rect(ctx,'#b58359',W/2-6,542,4,22);
 const rows=M.geometry(state);
 rows.forEach((r,i)=>{if(!image(ctx,'pixel-branch-'+i%8,r.x-r.w/2,r.y-r.height,r.w,r.height))rect(ctx,'#42886e',r.x-r.w/2,r.y-28,r.w,27);});
 rows.forEach((r,i)=>state.layers[i].deco.forEach((o,j)=>ornament(ctx,o,r,j+i)));
 if(showSelection){
  const r=rows[state.selected],l=r.x-r.w/2-12;
  rect(ctx,'#ffcb88',l,r.y-19,3,13);rect(ctx,'#ffcb88',l,r.y-7,12,2);
  rect(ctx,'#ffcb88',r.x+r.w/2+10,r.y-19,3,13);rect(ctx,'#ffcb88',r.x+r.w/2+1,r.y-7,12,2);
 }
}
function render(){
 const box=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);
 if(!box.width||!box.height)return;
 const cw=Math.round(box.width*d),ch=Math.round(box.height*d);
 if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
 const s=Math.min(cw/W,ch/H),x=(cw-W*s)/2,y=(ch-H*s)/2;
 view={s,x,y};g.setTransform(1,0,0,1,0,0);
 rect(g,'#203854',0,0,cw,ch);
 g.setTransform(s,0,0,s,x,y);draw(g,model,true);
}
function hang(at,kind,x=null,y=null){
 const r=M.geometry(model)[at];if(!r)return;
 update(s=>M.addDeco(s,at,kind,x===null?0:(x-r.x)/r.w,y===null?-12:y-r.y,photoSprite),'placed');
}
canvas.addEventListener('click',e=>{
 const b=canvas.getBoundingClientRect(),x=((e.clientX-b.left)*canvas.width/b.width-view.x)/view.s,y=((e.clientY-b.top)*canvas.height/b.height-view.y)/view.s;
 const at=M.pick(model,x,y,true);if(at===null){message('noBranch');return;}
 if(tab==='layer'){model.selected=at;sync();}
 else if(tab==='deco')hang(at,kind,x,y);
 else if(photoSprite)hang(at,'photo',x,y);
});
for(const b of document.querySelectorAll('[data-tab]'))b.addEventListener('click',()=>changeTab(b.dataset.tab));
$('tabs').addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 const all=['layer','deco','photo'],i=all.indexOf(tab);e.preventDefault();changeTab(all[e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowLeft'?2:1))%3],true);
});
$('language').onclick=()=>{lang=lang==='en'?'zh':'en';try{localStorage.setItem(LANGUAGE_KEY,lang);localStorage.setItem(WORKSHOP_LEGACY_KEY,lang);}catch{}language();};
$('grow').onclick=()=>update(M.add);
$('prune').onclick=()=>update(M.drop,'deleted');
$('hangDecor').onclick=()=>hang(model.selected,kind);
$('hangPhoto').onclick=()=>{if(photoSprite)hang(model.selected,'photo');};
$('unhang').onclick=()=>update(M.removeDeco,'deleted');
$('unhangPhoto').onclick=()=>update(M.removePhoto,'deleted');
$('undo').onclick=()=>{if(history.length){model=history.pop();message('restored');sync();}};
for(const b of document.querySelectorAll('[data-size]'))b.addEventListener('click',()=>update(s=>{const w=Number(b.dataset.size);if(s.layers[s.selected].w===w)return false;s.layers[s.selected].w=w;return true;}));
let sliderSnapshot=null;
$('width').addEventListener('input',()=>{if(!sliderSnapshot)sliderSnapshot=M.clone(model);model.layers[model.selected].w=Number($('width').value);sync();});
$('width').addEventListener('change',()=>{if(sliderSnapshot){history.push(sliderSnapshot);if(history.length>40)history.shift();sliderSnapshot=null;sync();}});
function refreshPhoto(){
 if(!photoImage)return;
 const sample=$('photoSample'),ctx=sample.getContext('2d',{willReadFrequently:true}),n=sample.width;
 ctx.clearRect(0,0,n,n);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const scale=n/Math.max(photoImage.width,photoImage.height),w=photoImage.width*scale,h=photoImage.height*scale;
 ctx.drawImage(photoImage,(n-w)/2,(n-h)/2,w,h);
 const data=ctx.getImageData(0,0,n,n);data.data.set(M.pixelate(data.data,n,n,$('removeWhite').checked));ctx.putImageData(data,0,0);
 photoSprite=sample.toDataURL('image/png');
 if(!photos.has(photoSprite)){const im=new Image();photos.set(photoSprite,im);im.onload=render;im.src=photoSprite;}
 $('photoPreview').hidden=false;photoMessage('photoReady');sync();
}
function rejectPhoto(key){
 photoImage=null;photoSprite=null;$('photoSample').getContext('2d').clearRect(0,0,26,26);$('photoPreview').hidden=false;photoMessage(key);sync();
}
$('photoFile').addEventListener('change',async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 const seq=++photoGeneration;
 if(file.size>12*1024*1024){rejectPhoto('photoLarge');return;}
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)){rejectPhoto('photoBad');return;}
 const u=URL.createObjectURL(file),im=new Image();
 try{
   await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;im.src=u;});
   if(seq!==photoGeneration)return;
   if(!im.naturalWidth||!im.naturalHeight){rejectPhoto('photoBad');return;}
   if(im.naturalWidth*im.naturalHeight>24000000){rejectPhoto('photoLarge');return;}
   photoImage=im;refreshPhoto();
 }catch(_){if(seq===photoGeneration)rejectPhoto('photoBad');}
 finally{URL.revokeObjectURL(u);}
});
$('removeWhite').addEventListener('change',refreshPhoto);
$('export').onclick=async()=>{
 try{
   await ready;
   const pending=[...new Set(model.layers.flatMap(l=>l.deco.map(o=>o.photo).filter(Boolean)))];
   await Promise.all(pending.map(p=>photos.get(p)?.decode?.().catch(()=>{})));
   const c=document.createElement('canvas');c.width=960;c.height=1020;
   const ctx=c.getContext('2d');ctx.scale(1.5,1.5);draw(ctx,model,false);
   c.toBlob(blob=>{if(!blob){message('saveBad');return;}const u=URL.createObjectURL(blob),a=document.createElement('a');
     a.href=u;a.download='pine-and-snow-workshop.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),20000);message('saved');
   },'image/png');
 }catch(_){message('saveBad');}
};
if(typeof ResizeObserver==='function')new ResizeObserver(render).observe(canvas);else window.addEventListener('resize',render);
language();changeTab('layer');ready.then(render);
window.addEventListener('storage',e=>{if(e.key===LANGUAGE_KEY&&['en','zh'].includes(e.newValue)&&lang!==e.newValue){lang=e.newValue;language();}});
})();


