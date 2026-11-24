(function(g){
'use strict';
const URL='https://kendrick-stein.github.io/christmas-elf-game/cocoa/';
const labels={
 zh:{title:'今晚的热饮吧台',close:'关闭',save:'保存 PNG',share:'分享',copy:'复制游戏链接',prep:'正在准备海报…',broken:'暂时无法生成海报，仍可复制链接。',copied:'游戏链接已复制。',manual:'选中链接后复制。',saved:'已发起 PNG 下载。',cancel:'已取消分享。',sent:'分享完成。',alt:'今晚亲手完成的饮品，附打烊账单和游戏二维码'},
 en:{title:'My Snowy Cocoa Counter',close:'Close',save:'Save PNG',share:'Share',copy:'Copy game link',prep:'Preparing your poster…',broken:'Poster unavailable. You can still copy the game link.',copied:'Game link copied.',manual:'Select the game link to copy it.',saved:'PNG download started.',cancel:'Share canceled.',sent:'Share complete.',alt:'Drinks served this shift with the closing ledger and a QR code'}
};
const snapshot=run=>Object.freeze({drinks:Object.freeze(run.drinks.map(recipe=>Object.freeze([...recipe]))),revenue:run.revenue,served:run.served,tips:run.tips,omitted:run.omitted});
function png(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG unavailable')),'image/png'));}
function load(src){return new Promise((resolve,reject)=>{const img=new Image;img.onload=()=>resolve(img);img.onerror=reject;img.src=src;});}
function init(doc,nav){
 const $=id=>doc.getElementById(id),dialog=$('shareDialog'),canvas=$('sharePoster'),save=$('saveShare'),share=$('nativeShare'),manual=$('manualShare'),message=$('shareFeedback');
 let run=null,lang='zh',rev=0,prepared=null,assets=null;
 const copy=()=>labels[lang],status=key=>{message.textContent=key?copy()[key]:'';};
 function controls(){save.disabled=!prepared;share.disabled=!run;manual.setAttribute('aria-label',copy().copy);}
 function translate(){const l=copy();$('shareTitle').textContent=l.title;$('closeShare').textContent=l.close;save.textContent=l.save;share.textContent=l.share;$('copyShare').textContent=l.copy;canvas.setAttribute('aria-label',l.alt);controls();}
 async function render(){
  const id=++rev;prepared=null;manual.hidden=true;translate();status('prep');
  try{
   const art=g.CocoaShareArt;if(!art)throw Error('Missing counter art');
   if(!assets)assets=Promise.all([load('./cocoa-qr.svg?v=cocoa-share-28'),load('./stand.svg').catch(()=>null)]).catch(e=>{assets=null;throw e;});
   const [qr,stand]=await assets;
   if(doc.fonts?.ready)await doc.fonts.ready;
   if(id!==rev||!run)return;
   art.drawCounter(canvas.getContext('2d'),run,lang,qr,stand);
   const blob=await png(canvas);
   if(id!==rev||!run)return;
   const name=lang==='en'?'My-Snowy-Cocoa-Counter.png':'我的雪夜可可吧台.png';
   let file=null;try{file=new File([blob],name,{type:'image/png'});}catch(_){}
   prepared={blob,file,name};status('');controls();
  }catch(_){if(id===rev){status('broken');controls();}}
 }
 const report=(id,key)=>{if(id===rev)status(key);};
 function copyLink(id=rev){
  const fallback=()=>{if(id!==rev)return;manual.hidden=false;manual.value=URL;manual.focus();manual.select();status('manual');};
  try{if(!nav.clipboard?.writeText){fallback();return;}Promise.resolve(nav.clipboard.writeText(URL)).then(()=>report(id,'copied'),fallback);}catch(_){fallback();}
 }
 $('copyShare').addEventListener('click',()=>copyLink());
 share.addEventListener('click',()=>{
  const id=rev,file=prepared?.file;let able=false;
  try{able=Boolean(file&&nav.share&&nav.canShare?.({files:[file]}));}catch(_){}
  if(!able){copyLink(id);return;}
  try{Promise.resolve(nav.share({files:[file],title:copy().title,text:URL})).then(()=>report(id,'sent'),e=>{if(e?.name==='AbortError')report(id,'cancel');else copyLink(id);});}
  catch(e){if(e?.name==='AbortError')report(id,'cancel');else copyLink(id);}
 });
 save.addEventListener('click',()=>{
  if(!prepared)return;
  const a=doc.createElement('a'),url=g.URL.createObjectURL(prepared.blob);a.href=url;a.download=prepared.name;doc.body.append(a);a.click();a.remove();setTimeout(()=>g.URL.revokeObjectURL(url),15000);status('saved');
 });
 $('closeShare').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{if(!$('openShare').hidden)$('openShare').focus();});
 return {open(next,loc){run=snapshot(next);lang=loc;translate();if(!dialog.open)dialog.showModal();render();},language(next){if(lang===next)return;lang=next;translate();if(run&&dialog.open)render();},reset(){rev++;run=null;prepared=null;controls();if(dialog.open)dialog.close();}};
}
const api={URL,snapshot,png,init};
if(typeof module!=='undefined')module.exports=api;else g.CocoaShare=init(g.document,g.navigator);
})(globalThis);
