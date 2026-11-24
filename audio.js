/* Original Pine & Snow themes and operation sounds, shared across all three modes. */
(()=>{
 'use strict';
 const W=window,D=document,script=D.currentScript,mode=script?.dataset?.mode||'tree';
 const choices=['tree','workshop','gingerbread'],key='snow-pine-audio-v1',defaults={music:true,sfx:true};
 let parentAudio=null;
 if(mode==='workshop'&&W.parent&&W.parent!==W){
  try{if(W.parent.location.origin===W.location.origin)parentAudio=W.parent.PineAudio||null;}catch{}
 }
 const buttons=new WeakSet(),listeners=new Set();
 let prefs={...defaults};
 const decode=(v)=>{try{const p=JSON.parse(v);return {music:typeof p?.music==='boolean'?p.music:defaults.music,sfx:typeof p?.sfx==='boolean'?p.sfx:defaults.sfx};}catch{return {...defaults};}};
 try{prefs=decode(W.localStorage.getItem(key));}catch{}
 const get=()=>parentAudio?parentAudio.get():{...prefs};
 const isEnglish=()=>D.documentElement?.lang==='en';
 function refresh(){
  const value=get();
  for(const button of D.querySelectorAll?.('[data-pine-audio]')||[]){
   const kind=button.dataset.pineAudio,english=isEnglish();
   if(kind!=='music'&&kind!=='sfx')continue;
   const label=kind==='music'?(english?'Music':'背景音乐'):(english?'Sound effects':'操作音效');
   const status=value[kind]?(english?'On':'开'):(english?'Off':'关');
   button.textContent=label+' · '+status;
   button.setAttribute('aria-label',label+' · '+status);
   button.setAttribute('aria-pressed',String(value[kind]));
   if(!buttons.has(button)){
    buttons.add(button);button.addEventListener('click',()=>{
     const next=!get()[kind];set(kind,next);
     if(next)arm();if(kind==='sfx'&&next)effect('click');
    });
   }
  }
 }
 const emit=()=>{refresh();for(const fn of listeners)fn(get());};
 function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
 let theme=choices.includes(mode)?mode:'tree',engaged=mode!=='tree',leftPage=false,ctx=null;
 const tracks=new Map(),playingNodes=new Set(),recent=new Map();
 const live=()=>!leftPage&&!D.hidden;
 function media(){
  if(tracks.has(theme))return tracks.get(theme);
  if(typeof W.Audio!=='function')return null;
  try{
   const element=new W.Audio(),dir=new URL('./assets/audio/',script?.src||W.location.href);
   element.preload='none';element.loop=true;element.volume=.42;element.hidden=true;
   element.src=new URL(theme+'-loop.mp3?v=audio-21',dir).href;
   const record={element,pending:false,theme};
   if(element.dataset){
    element.dataset.pineTheme=theme;element.dataset.playback='paused';
    element.addEventListener?.('playing',()=>{element.dataset.playback='playing';});
    element.addEventListener?.('pause',()=>{element.dataset.playback='paused';});
    element.addEventListener?.('error',()=>{element.dataset.playback='unavailable';});
   }
   D.body?.append?.(element);tracks.set(theme,record);return record;
  }catch{return null;}
 }
 function hush(){
  for(const r of tracks.values())try{r.element.pause();}catch{}
 }
 function tryMusic(){
  if(parentAudio||!engaged||!prefs.music||!live())return;
  const row=media();if(!row||row.pending||!row.element.paused)return;
  row.pending=true;
  const failed=()=>{row.pending=false;};
  try{Promise.resolve(row.element.play()).then(()=>{
   row.pending=false;if(theme!==row.theme||!engaged||!prefs.music||!live())row.element.pause();
  },failed);}catch(e){failed(e);}
 }
 function switchTheme(next,play=true){
  if(parentAudio)return;
  if(!choices.includes(next))return;
  engaged=!!play;
  if(theme!==next||!engaged){hush();theme=next;}
  tryMusic();
 }
 function enableSfx(){
  if(!prefs.sfx||!live())return;
  try{const AC=W.AudioContext||W.webkitAudioContext;if(!ctx&&AC)ctx=new AC();if(ctx&&ctx.state!=='running')ctx.resume?.().catch(()=>{});}catch{}
 }
 function arm(){if(parentAudio){parentAudio.arm();return;}tryMusic();enableSfx();}
 function hushEffects(){
  for(const o of playingNodes)try{o.stop();}catch{}
  playingNodes.clear();
  try{if(ctx?.state==='running')ctx.suspend?.().catch(()=>{});}catch{}
 }
 const notes={
  click:[[620,.052,'sine',.055]],
  tap:[[390,.063,'triangle',.065]],
  drop:[[438,.073,'triangle',.065],[310,.09,'sine',.055]],
  rotate:[[465,.058,'sine',.065],[620,.075,'triangle',.055]],
  nice:[[522,.079,'triangle',.078],[659,.086,'sine',.069]],
  bright:[[659,.092,'sine',.078],[784,.1,'triangle',.07],[1048,.125,'sine',.055]],
  cool:[[512,.096,'sine',.058],[768,.095,'sine',.072],[1180,.16,'sine',.069]],
  tick:[[930,.083,'sine',.07],[1222,.092,'sine',.04]],
  dull:[[293,.082,'triangle',.073],[220,.145,'sine',.060]],
  warn:[[280,.075,'triangle',.065],[251,.10,'sine',.055]],
  undo:[[430,.075,'triangle',.052],[350,.11,'sine',.062]],
  lights:[[659,.08,'triangle',.062],[784,.10,'sine',.061],[990,.14,'sine',.052]],
  finish:[[392,.18,'triangle',.065],[494,.16,'triangle',.061],[587,.24,'sine',.051],[784,.32,'sine',.049]],
 };
 function effect(kind){
  if(parentAudio){parentAudio.effect(kind);return;}
  if(!prefs.sfx||!live()||!ctx)return;
  const data=notes[kind]||notes.tap,time=ctx.currentTime;
  if(time-(recent.get(kind)??-Infinity)<.108)return;
  recent.set(kind,time);
  try{let offset=0;for(const [hz,length,type,volume] of data){
    const start=time+offset,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz,start);
    g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.014);
    g.gain.exponentialRampToValueAtTime(.0001,start+length);
    o.connect(g).connect(ctx.destination);playingNodes.add(o);
    o.onended=()=>{playingNodes.delete(o);o.disconnect();g.disconnect();};
    o.start(start);o.stop(start+length+.022);offset+=length*.62;
   }}catch{}
 }
 function set(kind,enabled){
  if(!Object.hasOwn(defaults,kind)||typeof enabled!=='boolean')return;
  if(parentAudio){parentAudio.set(kind,enabled);emit();return;}
  if(prefs[kind]===enabled)return;
  prefs={...prefs,[kind]:enabled};
  try{W.localStorage.setItem(key,JSON.stringify(prefs));}catch{}
  if(kind==='music'){if(enabled)tryMusic();else hush();}
  else if(!enabled)hushEffects();else enableSfx();
  emit();
 }
 const api=Object.freeze({get,set,refresh,subscribe,arm,effect,switchTheme,theme:()=>parentAudio?parentAudio.theme():theme});
 W.PineAudio=api;
 if(parentAudio)parentAudio.subscribe(refresh);
 else{
  W.addEventListener('storage',e=>{
   if(e.key!==key)return;prefs=decode(e.newValue);
   if(prefs.music)tryMusic();else hush();
   if(!prefs.sfx)hushEffects();
   emit();
  });
  D.addEventListener('visibilitychange',()=>{if(live())tryMusic();else{hush();hushEffects();}});
  W.addEventListener('pagehide',()=>{leftPage=true;hush();hushEffects();});
  W.addEventListener('pageshow',()=>{leftPage=false;tryMusic();});
 }
 for(const event of ['pointerdown','touchend','keydown','click'])D.addEventListener(event,arm,true);
 refresh();if(!parentAudio)tryMusic();
})();
