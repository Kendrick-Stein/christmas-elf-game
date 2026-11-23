'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=n=>fs.readFileSync(path.join(__dirname,'..',n),'utf8');
function harness(){
 const nodes=new Map(),out=[],images=[],photos=[],uploads=[],storage=new Map();
 function node(type='div'){
  const events={},attrs={},n={
   type,children:[],events,attrs,dataset:{},hidden:false,checked:true,value:'',files:[],
   textContent:'',width:type==='sample'?26:640,height:type==='sample'?26:680,
   addEventListener(name,fn){events[name]=fn;},fire(name,fields={}){return events[name]?.({target:n,preventDefault(){},...fields});},
   setAttribute(k,v){attrs[k]=v;},focus(){},append(...els){n.children.push(...els);},replaceChildren(){n.children=[];},remove(){},
   querySelectorAll(){return n.children;},get childElementCount(){return n.children.length;},
   getBoundingClientRect(){return {width:390,height:440,left:0,top:0};},
   getContext(){return new Proxy({
    drawImage(im){images.push([n.type,im.src]);},
    getImageData(){return {data:new Uint8ClampedArray(26*26*4).fill(255)};},
    putImageData(bitmap){photos.push(bitmap);}}, {get:(o,k)=>o[k]??(()=>{})});},
   toDataURL(){return 'data:image/png;base64,fixture-converted';},
   toBlob(cb){cb({type:'image/png',w:n.width,h:n.height});},
   click(){if(type==='a')out.push([n.download,n.href]);else n.onclick?.();}
  };return n;
 }
 const $=id=>{if(!nodes.has(id))nodes.set(id,node(id==='photoSample'?'sample':id));return nodes.get(id);};
 const tabs=['layer','deco','photo'].map(x=>{const b=node();b.dataset.tab=x;return b;});
 const document={
   documentElement:{},body:node(),getElementById:$,createElement:node,createTextNode:s=>s,
   querySelectorAll(s){return s==='[data-tab]'?tabs:s==='.layerChip'?$('layerButtons').children:[];}
 };
 const window={addEventListener(){}};
 const C={
  document,window,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},devicePixelRatio:2,
  URL:{createObjectURL(o){uploads.push(o);return o.broken?'blob:broken':'blob:local';},revokeObjectURL(){}},
  Image:class{
   width=320;height=320;naturalWidth=320;naturalHeight=320;
   set src(v){this.source=v;if(v==='blob:broken')this.onerror?.();else this.onload?.();}
   get src(){return this.source;}
   decode(){return Promise.resolve();}
  },setTimeout(){}
 };
 const ctx=vm.createContext(C);
 vm.runInContext(read('model.js'),ctx);window.WorkshopModel=ctx.WorkshopModel;
 vm.runInContext(read('art.js'),ctx);vm.runInContext(read('workshop.js'),ctx);
 return {$,tabs,document,out,images,photos,uploads,storage};
}
test('upload, local conversion, hang/remove/undo, malformed retry, and exported PNG retain photo pixels',async()=>{
 const h=harness(),{$}=h,photo=$('photoFile');h.tabs[2].fire('click');
 const tryPhoto=async file=>{photo.files=[file];await photo.fire('change');};
 await tryPhoto({type:'image/jpeg',size:1024,broken:true});assert($('hangPhoto').disabled);
 assert.match($('photoInfo').textContent,/读不出/);
 await tryPhoto({type:'image/png',size:13*1024*1024});assert($('hangPhoto').disabled);
 await tryPhoto({type:'image/png',size:1024});assert(!$('hangPhoto').disabled);
 assert.equal(h.photos.at(-1).data[3],0);assert.equal(h.uploads[1].type,'image/png');
 $('hangPhoto').click();assert(!$('unhangPhoto').disabled);
 $('unhangPhoto').click();assert($('unhangPhoto').disabled);
 $('undo').click();assert(!$('unhangPhoto').disabled);
 await $('export').onclick();assert.equal(h.out[0][0],'pine-and-snow-workshop.png');
 assert(h.images.some(([surface,src])=>surface==='canvas'&&src==='data:image/png;base64,fixture-converted'));
 assert.deepEqual(h.uploads.at(-1),{type:'image/png',w:960,h:1020});
 $('language').click();assert.equal(h.document.documentElement.lang,'en');
 assert.deepEqual([...h.storage.keys()],['pine-workshop-language']);
});
