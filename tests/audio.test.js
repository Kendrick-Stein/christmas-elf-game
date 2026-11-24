'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','audio.js'),'utf8');
const KEY='snow-pine-audio-v1',SITE='https://kendrick-stein.github.io/christmas-elf-game/';
const wait=()=>Promise.resolve().then(()=>Promise.resolve());
function harness({mode='tree',lang='zh-CN',accept=false,stored,host,parentOrigin=SITE}={}){
 const media=[],notes=[],wins={},docs={},memory=new Map(stored===undefined?[]:[[KEY,JSON.stringify(stored)]]),appended=[];
 const state={accept};
 const button=k=>({dataset:{pineAudio:k},listeners:{},attrs:{},setAttribute(n,v){this.attrs[n]=v;},addEventListener(n,f){this.listeners[n]=f;},click(){this.listeners.click();}});
 const music=button('music'),sfx=button('sfx');
 const doc={currentScript:{src:SITE+'audio.js?v=audio-21',dataset:{mode}},documentElement:{lang},hidden:false,body:{append(e){appended.push(e);}},querySelectorAll:()=>[music,sfx],addEventListener(n,f){docs[n]=f;}};
 let now=0;
 class Audio{
  constructor(){this.paused=true;this.attempts=0;this.dataset={};this.events={};media.push(this);}
  addEventListener(n,f){this.events[n]=f;}
  play(){this.attempts++;if(!state.accept)return Promise.reject(new Error('autoplay denied'));this.paused=false;this.events.playing?.();return Promise.resolve();}
  pause(){this.paused=true;this.events.pause?.();}
 }
 class AC{
  constructor(){this.state='suspended';this.destination={};}
  get currentTime(){return ++now;}
  resume(){this.state='running';return Promise.resolve();}
  suspend(){this.state='suspended';return Promise.resolve();}
  createOscillator(){const note={};notes.push(note);return {frequency:{setValueAtTime(a){note.hz=a;}},connect(g){return g;},disconnect(){},start(){note.started=true;},stop(){note.stopped=true;}};}
  createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
 }
 const win={Audio,AudioContext:AC,location:{origin:new URL(SITE).origin,href:SITE+(mode==='tree'?'':mode+'/')},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},addEventListener(n,f){wins[n]=f;}};
 win.parent=host?{PineAudio:host,location:{origin:new URL(parentOrigin).origin}}:win;
 vm.runInNewContext(source,{window:win,document:doc,URL});
 return {api:win.PineAudio,state,media,notes,doc,memory,wins,docs,music,sfx,appended};
}
test('tree lobby is silent, first valid gesture unlocks a rejected start',async()=>{
 const h=harness();assert.equal(h.media.length,0);h.docs.pointerdown();assert.equal(h.media.length,0);
 h.api.switchTheme('tree');assert.equal(h.media[0].attempts,1);await wait();assert(h.media[0].paused);
 h.state.accept=true;h.docs.keydown();await wait();assert.equal(h.media[0].attempts,2);
 assert.equal(h.media[0].src,SITE+'assets/audio/tree-loop.mp3?v=audio-21');
 assert.equal(h.media[0].dataset.playback,'playing');assert.equal(h.media[0].loop,true);assert.equal(h.appended[0],h.media[0]);
});
test('route selection is exclusive even with a delegated Workshop frame',async()=>{
 const h=harness({accept:true});h.api.switchTheme('tree');await wait();
 h.api.switchTheme('workshop');await wait();assert(h.media[0].paused);assert(!h.media[1].paused);
 assert.equal(h.media[1].src,SITE+'assets/audio/workshop-loop.mp3?v=audio-21');
 const child=harness({mode:'workshop',lang:'en',accept:true,host:h.api});
 assert.equal(child.media.length,0);child.docs.pointerdown();child.api.effect('tick');assert(h.notes.length>0);
 child.music.click();assert(h.media[1].paused);assert.equal(h.music.attrs['aria-pressed'],'false');
 assert.equal(child.music.textContent,'Music · Off');child.music.click();await wait();assert(!h.media[1].paused);
 h.api.switchTheme('tree',false);await wait();assert(h.media.every(a=>a.paused));assert.equal(child.media.length,0);
});
test('background and effects independently persist and survive language changes',async()=>{
 const h=harness({mode:'gingerbread',lang:'en',accept:true});await wait();h.docs.click();
 assert.equal(h.media[0].src,SITE+'assets/audio/gingerbread-loop.mp3?v=audio-21');
 assert.equal(h.music.textContent,'Music · On');h.api.effect('rotate');assert(h.notes.length>0);
 h.sfx.click();let n=h.notes.length;h.api.effect('drop');assert.equal(h.notes.length,n);assert(!h.media[0].paused);
 h.music.click();assert(h.media[0].paused);h.sfx.click();h.api.effect('finish');assert(h.notes.length>n);assert(h.media[0].paused);
 assert.deepEqual(JSON.parse(h.memory.get(KEY)),{music:false,sfx:true});
 h.doc.documentElement.lang='zh-CN';h.api.refresh();assert.equal(h.sfx.textContent,'操作音效 · 开');assert.equal(h.music.textContent,'背景音乐 · 关');
 const copy=harness({mode:'gingerbread',stored:JSON.parse(h.memory.get(KEY)),accept:true});assert.equal(copy.media.length,0);assert.equal(copy.sfx.attrs['aria-pressed'],'true');
});
test('hidden/navigation stops both channels, Return and cross-tab prefs remain consistent',async()=>{
 const h=harness({mode:'workshop',accept:true});h.docs.touchend();await wait();assert(!h.media[0].paused);
 h.doc.hidden=true;h.docs.visibilitychange();assert(h.media[0].paused);let n=h.notes.length;h.api.effect('lights');assert.equal(h.notes.length,n);
 h.doc.hidden=false;h.docs.visibilitychange();await wait();assert(!h.media[0].paused);
 h.wins.pagehide();assert(h.media[0].paused);h.docs.pointerdown();assert(h.media[0].paused);
 h.wins.pageshow();await wait();assert(!h.media[0].paused);
 h.wins.storage({key:KEY,newValue:'{"music":false,"sfx":true}'});assert(h.media[0].paused);
 assert.equal(h.music.attrs['aria-pressed'],'false');assert.equal(h.sfx.attrs['aria-pressed'],'true');
});
test('static files and compatible nested scripts resolve on the same Pages origin',()=>{
 for(const kind of ['tree','workshop','gingerbread']){
  const file=require('node:path').join(__dirname,'..','assets','audio',kind+'-loop.mp3');
  assert(fs.statSync(file).size>10000);
  const h=harness({mode:kind,accept:true});if(kind==='tree')h.api.switchTheme('tree');
  assert.equal(new URL(h.media[0].src).origin,new URL(SITE).origin);
 }
 const root=require('node:path').join(__dirname,'..');
 assert.match(fs.readFileSync(root+'/index.html','utf8'),/audio\.js\?v=audio-21.*data-mode="tree"/);
 assert.match(fs.readFileSync(root+'/workshop/index.html','utf8'),/\.\.\/audio\.js\?v=audio-21/);
 assert.match(fs.readFileSync(root+'/gingerbread/index.html','utf8'),/\.\.\/audio\.js\?v=audio-21/);
});
