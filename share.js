(function (global) {
'use strict';
const URL_TARGET='https://kendrick-stein.github.io/christmas-elf-game/';
const SIZE=1080,FILE_NAME='我的圣诞树.png';
const ROWS=('1fd28f27f 105584641 174d3a65d 175d7255d 174ac195d 104c4f541 1fd55557f 00174a700 16ed5894b 0c0717a6d 13d358efb 04b7c75a9 17f92419b 16001712a 00e5bfd6c 0aa995cec 095af5cdc 0b3b29fdb 15c668df4 0ba3005d2 107fa6a2d 1caa67341 01f3d4b2b 099cd724a 10496b1fa 001f7a318 1fdd13b50 1053b2f1e 1747c9ff4 1754cde21 1755c5f60 1046bd571 1fdb6fa14').split(' ').map(row=>Number.parseInt(row,16));
const FONT='system-ui,"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
const MONO='ui-monospace,monospace';
function rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function text(ctx,value,x,y,size,color,{end=false,family=FONT,max}={}){
 ctx.fillStyle=color;ctx.font='bold '+size+'px '+family;ctx.textAlign=end?'right':'left';
 if(max===undefined)ctx.fillText(String(value),x,y);else ctx.fillText(String(value),x,y,max);
}
function drawQR(ctx,x,y,unit=4){
 const quiet=4,side=ROWS.length+quiet*2;
 rect(ctx,x,y,side*unit,side*unit,'#fffef5');ctx.fillStyle='#112033';
 for(let row=0;row<ROWS.length;row++)for(let col=0;col<ROWS.length;col++)
  if(Math.floor(ROWS[row]/2**(ROWS.length-1-col))%2)ctx.fillRect(x+(col+quiet)*unit,y+(row+quiet)*unit,unit,unit);
 return side*unit;
}
function fit(bounds,area,maxScale=Infinity){
 const width=bounds.right-bounds.left,height=bounds.bottom-bounds.top;
 if(!(width>0&&height>0&&[width,height,bounds.left,bounds.top].every(Number.isFinite)))throw new Error('Invalid tree bounds');
 const scale=Math.min(area.width/width,area.height/height,maxScale);
 if(!(scale>0))throw new Error('Invalid preview space');
 return {x:area.x+area.width/2-(bounds.left+bounds.right)/2*scale,
  bottom:area.y+area.height-bounds.bottom*scale,scale};
}
function fallbackBounds(snapshot){
 const layers=snapshot.layers||[];
 let left=-117,right=117;
 for(const layer of layers){
  const x=Number(layer.x)||0,w=Math.max(0,Number(layer.w)||0);
  left=Math.min(left,x-w/2-24);right=Math.max(right,x+w/2+24);
 }
 return {left,right,top:Math.min(-55,-layers.length*(snapshot.spacing||19)-50),bottom:49};
}
function scene(ctx,x,y,w,h){
 const paint=ctx.createLinearGradient(0,y,0,y+h);
 paint.addColorStop(0,'#14284f');paint.addColorStop(1,'#2a5068');
 rect(ctx,x,y,w,h,paint);
 // Fixed pixel-sky pattern: copy neither game state nor any external image.
 for(let j=0;j<44;j++){
  const dx=(j*67.91+11)%100/100,dy=(j*39.37+3)%100/100,sz=Math.max(1,Math.round(w*.0035));
  rect(ctx,x+Math.floor(dx*w),y+Math.floor(dy*h*.91),sz,sz,j%3?'#81a4bc':'#afc8d5');
 }
 const q=Math.max(3,Math.round(w*.014)),mx=x+Math.floor(w*.82),my=y+Math.floor(h*.20);
 for(const [i,z,ww,hh,c] of [[1,0,3,1,'#ffd787'],[0,1,5,3,'#ffd787'],[1,4,3,1,'#ffd787'],[0,3,5,1,'#e8ab65']])
  rect(ctx,mx+i*q,my+z*q,ww*q,hh*q,c);
 for(let i=0;i<13;i++){
  const unit=w/13,bh=h*(.09+((i*5)%9)*.021);
  rect(ctx,x+i*unit,y+h-bh,unit+1,bh,i%3===0?'#2b536d':'#274862');
 }
 rect(ctx,x,y+h-Math.max(5,h*.045),w,Math.max(5,h*.045),'#7799b0');
}
function tree(ctx,snapshot,source,area,maxScale){
 const bounds=typeof source.bounds==='function'?source.bounds(snapshot):fallbackBounds(snapshot);
 const geometry=fit(bounds,area,maxScale);
 ctx.save();
 try{ctx.imageSmoothingEnabled=false;source.draw(ctx,snapshot,geometry);}
 finally{ctx.restore();}
 return geometry;
}
function poster(ctx,snapshot,source){
 rect(ctx,0,0,SIZE,SIZE,'#172940');
 rect(ctx,1,1,1078,1078,'#54718b');rect(ctx,3,3,1074,1074,'#172940');
 for(const x of [20,1026])for(const y of [20,1054])rect(ctx,x,y,34,6,'#ffda95');
 rect(ctx,26,26,1028,226,'#15263e');rect(ctx,72,84,40,6,'#ffcd7c');
 text(ctx,'PINE & SNOW',136,100,27,'#ffcd87',{family:MONO});
 text(ctx,'松针雪夜 / 垒树挑战',1010,104,24,'#b8cddd',{end:true});
 text(ctx,'我的圣诞树',69,201,86,'#fff0cd');rect(ctx,70,236,940,2,'#64809b');
 scene(ctx,26,252,1028,792);
 const g=tree(ctx,snapshot,source,{x:84,y:268,width:912,height:558},3.7);
 rect(ctx,49,839,982,190,'#5e819e');rect(ctx,51,841,978,186,'#163352');
 text(ctx,'总分',90,900,25,'#bbd1e0');text(ctx,'树高',301,900,25,'#bbd1e0');
 text(ctx,snapshot.score,90,958,62,'#ffce86',{family:MONO,max:190});
 text(ctx,snapshot.level+' 层',301,958,53,'#eef0db',{max:285});
 text(ctx,'同一场雪，每棵树都不同。',90,1004,24,'#bbd1e0',{max:520});
 text(ctx,'扫二维码',818,940,24,'#d0e4eb',{end:true});
 text(ctx,'也来垒一棵',818,977,20,'#b4ccd9',{end:true});
 drawQR(ctx,844,836,4);
 return g;
}
function preview(canvas,snapshot,source){
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
 // Match the painted resolution to the CSS box so portrait/landscape never stretch the tree.
 const box=canvas.getBoundingClientRect();
 if(box.width>0&&box.height>0){const d=Math.min(global.devicePixelRatio||1,2);canvas.width=Math.round(box.width*d);canvas.height=Math.round(box.height*d);}
 const w=canvas.width,h=canvas.height;
 scene(ctx,0,0,w,h);
 tree(ctx,snapshot,source,{x:w*.06,y:h*.06,width:w*.88,height:h*.87},w/90);
}
function pngBlob(canvas){
 return new Promise((resolve,reject)=>{try{
  if(typeof canvas.toBlob!=='function')throw new Error('PNG export unavailable');
  canvas.toBlob(blob=>blob&&blob.type==='image/png'&&blob.size>0?resolve(blob):reject(new Error('PNG export failed')),'image/png');
 }catch(error){reject(error);}});
}
function init(env){
 const doc=env.document,$=id=>doc.getElementById(id);
 const actions=$('shareActions'),save=$('saveTree'),share=$('shareTree'),status=$('shareStatus'),
  canvas=$('settlementTree'),form=$('shareLinkLabel'),link=$('shareLink'),panel=$('panel');
 if(!actions||!save||!share||!status||!canvas||!form||!link||!panel)return null;
 const nav=env.navigator||{};
 let snapshot=null,prepared=null,task=null,failed=false,sharing=false,revision=0;
 link.value=URL_TARGET;
 const active=id=>id===revision&&snapshot!==null;
 const report=(id,message)=>{if(active(id)){status.hidden=!message;status.textContent=message||'';}};
 const state=()=>{
  save.setAttribute('aria-disabled',String(!prepared&&!failed));
  share.setAttribute('aria-disabled',String(sharing||(!prepared&&!failed)));
 };
 function closeLink(){form.hidden=true;}
 function reset(){
  revision++;snapshot=null;prepared=null;task=null;failed=false;sharing=false;
  actions.hidden=true;canvas.hidden=true;status.hidden=true;status.textContent='';closeLink();
  panel.classList.remove('settlement-panel');state();
 }
 function make(id){
  if(!active(id)||task)return task;
  const current=snapshot,source=env.ElfShareSource;
  failed=false;state();
  task=Promise.resolve().then(()=>{
   if(!source||typeof source.draw!=='function')throw new Error('Tree renderer missing');
   return typeof source.ready==='function'?source.ready():null;
  }).then(()=>{
   if(!active(id))return null;
   try{preview(canvas,current,source);}catch(_){canvas.hidden=true;}
   const output=doc.createElement('canvas');output.width=SIZE;output.height=SIZE;
   const ctx=output.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
   poster(ctx,current,source);
   return pngBlob(output);
  }).then(blob=>{
   if(!active(id)||!blob)return;
   let file=null;try{if(typeof env.File==='function')file=new env.File([blob],FILE_NAME,{type:'image/png'});}catch(_){}
   prepared={blob,file};report(id,'');state();
  }).catch(()=>{
   if(active(id)){failed=true;report(id,'暂时无法生成图片。可以重试，或复制游戏链接。');state();}
  }).finally(()=>{if(active(id))task=null;});
  return task;
 }
 function settle(value){
  if(!value||value===snapshot)return;
  reset();snapshot=value;panel.classList.add('settlement-panel');actions.hidden=false;canvas.hidden=false;
  report(revision,'正在准备图片…');state();make(revision);
 }
 function manualLink(id){
  if(!active(id))return;
  form.hidden=false;report(id,'无法自动复制，请长按或选中链接复制。');
  link.focus({preventScroll:true});link.select();
 }
 function copyLink(id){
  if(!active(id))return;
  closeLink();
  if(!nav.clipboard||typeof nav.clipboard.writeText!=='function'){manualLink(id);return;}
  try{Promise.resolve(nav.clipboard.writeText(URL_TARGET)).then(()=>{
   report(id,prepared?'已复制游戏链接，图片可单独保存。':'已复制游戏链接。');
  },()=>manualLink(id));}catch(_){manualLink(id);}
 }
 save.addEventListener('click',()=>{
  if(!snapshot)return;
  const id=revision;
  if(!prepared){if(failed){report(id,'正在重试生成图片…');make(id);}return;}
  closeLink();let objectURL=null;
  try{
   objectURL=env.URL.createObjectURL(prepared.blob);
   const a=doc.createElement('a');a.href=objectURL;a.download=FILE_NAME;
   doc.body.appendChild(a);
   try{a.click();}finally{a.remove();}
   report(id,'已发起 PNG 下载。');
  }catch(_){report(id,'无法下载图片，请重试，或使用分享。');}
  finally{if(objectURL)env.setTimeout(()=>env.URL.revokeObjectURL(objectURL),45000);}
 });
 share.addEventListener('click',()=>{
  if(!snapshot||sharing||(!prepared&&!failed))return;
  const id=revision;closeLink();
  const file=prepared&&prepared.file;let supported=false;
  try{supported=!!(file&&typeof nav.share==='function'&&typeof nav.canShare==='function'&&nav.canShare({files:[file]}));}
  catch(_){}
  if(!supported){copyLink(id);return;}
  sharing=true;state();
  // This call must stay synchronous in the click handler: it consumes user activation.
  let requested;
  try{requested=nav.share({files:[file],title:'我的圣诞树'});}
  catch(error){sharing=false;state();if(error&&error.name==='AbortError')report(id,'已取消分享。');else copyLink(id);return;}
  Promise.resolve(requested).then(()=>report(id,'分享操作已完成。'),error=>{
   if(error&&error.name==='AbortError')report(id,'已取消分享。');
   else copyLink(id);
  }).finally(()=>{if(active(id)){sharing=false;state();}});
 });
 env.addEventListener('elf:settlement',e=>{
  const source=env.ElfShareSource;settle(e.detail&&Array.isArray(e.detail.layers)?e.detail:source&&source.snapshot());
 });
 env.addEventListener('elf:reset',reset);
 const redraw=()=>{const source=env.ElfShareSource;
  if(snapshot&&prepared&&source&&!canvas.hidden)try{preview(canvas,snapshot,source);}catch(_){}
 };
 if(typeof env.ResizeObserver==='function')new env.ResizeObserver(redraw).observe(canvas);
 else env.addEventListener('resize',redraw);
 reset();
 return {settle,reset};
}
const api={URL_TARGET,SIZE,FILE_NAME,drawQR,fit,fallbackBounds,poster,pngBlob,init};
if(typeof module!=='undefined')module.exports=api;
else if(global.document)global.ChristmasShare=init(global);
})(globalThis);
