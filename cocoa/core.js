((g,f)=>{const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else g.Cocoa=api;})(globalThis,()=>{
'use strict';
const prices=Object.freeze({dark:3,milk:3,wine:5,egg:4,mint:1,cream:2,mallow:2,spice:1,orange:2,apple:4,latte:5,white:4,caramel:2,crumb:2,peppermint:2});
const bases=['dark','milk','wine','egg','apple','latte','white'], ingredients=[...bases,'mint','cream','mallow','spice','orange','caramel','crumb','peppermint'];
const recipes=[['dark','mallow'],['milk','cream'],['milk','mint'],['dark','spice'],['wine','orange'],['wine','spice','orange'],['egg','spice'],['egg','cream','spice'],['dark','mint','cream','mallow'],['milk','cream','spice'],['wine','orange','spice','cream'],['egg','cream','mallow','spice'],['apple','caramel'],['latte','crumb'],['white','peppermint'],['apple','orange','spice'],['latte','cream','crumb'],['white','mint','mallow'],['apple','caramel','spice','orange'],['latte','crumb','cream','spice'],['white','peppermint','cream','mallow']];
const signature=Object.freeze({7:'cream',12:'fizz',13:'cinnamon',14:'mint'});
function visual(items){
 const base=items[0];if(base==='apple'&&items.includes('caramel'))return 'fizz';
 if(base==='latte'&&(items.includes('crumb')||items.includes('spice')))return 'cinnamon';
 if((base==='white'||base==='milk')&&(items.includes('peppermint')||items.includes('mint')))return 'mint';
 if(items.includes('cream')||items.includes('mallow'))return 'cream';return '';
}
function colors(seed,id){
 let n=(seed^Math.imul(id,0x9e3779b9))>>>0;n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return (n^(n>>>16))&7;
}
const patience=[31,25,37,28,34,23];
const cap=6, historyLimit=24;
function make(seed=Math.floor(Math.random()*2**32)){return {seed:(seed>>>0)||1,colorSeed:(seed>>>0)||1,time:0,next:0,phase:'ready',orders:[],serial:0,cups:Array.from({length:4},()=>({items:[],ready:false})),selected:null,money:0,tips:0,speed:0,bonus:0,special:0,menu:0,streak:0,bestStreak:0,served:0,drinks:[],wrong:0,missed:0,failures:0};}
function rand(s){let x=s.seed;x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=x>>>0;return s.seed/2**32;}
function profile(s){return Math.min(5,Math.floor((s.time+3*s.served)/28));}
function add(s){
 const tier=profile(s),old=s.orders.at(-1)?.recipe;
 const pool=recipes.map((_,i)=>i).filter(i=>i!==old&&(tier>=2||recipes[i].length<=3)&&(tier<4||recipes[i].length>=3||signature[i]));
 const recipe=s.serial===0?Math.floor(rand(s)*2):s.serial<=5?[4,6,12,13,14][s.serial-1]:pool[Math.floor(rand(s)*pool.length)],patron=Math.floor(rand(s)*patience.length);
 const wait=s.serial===0?38:Math.max(19,patience[patron]+(recipes[recipe].length-2)*3-Math.min(6,tier)+Math.floor(rand(s)*5));
 s.orders.push({id:++s.serial,recipe,patron,palette:colors(s.colorSeed,s.serial),at:s.time,until:s.time+wait,grace:0});
 s.next=s.time+(s.serial===1?5.8:Math.max(5.2,11-tier*1.15+rand(s)*1.8));
}
function start(s){if(s.phase!=='ready')return false;s.phase='playing';add(s);return true;}
function valid(s,n){return s.phase==='playing'&&Number.isInteger(n)&&n>=0&&n<s.cups.length;}
function select(s,n){if(!valid(s,n))return false;s.selected=n;return true;}
function pour(s,key,n=s.selected){
 if(!valid(s,n)||!ingredients.includes(key))return false;
 const c=s.cups[n];if(c.ready||c.items.length>=4||(!c.items.length?!bases.includes(key):bases.includes(key)))return false;c.items.push(key);return true;
}
function seal(s,n=s.selected){if(!valid(s,n)||s.cups[n].items.length<2||s.cups[n].ready)return false;s.cups[n].ready=true;return true;}
function discard(s,n=s.selected){if(!valid(s,n)||!s.cups[n].items.length)return false;s.cups[n]={items:[],ready:false};return true;}
function fail(s){s.failures++;s.streak=0;if(s.failures>=3)s.phase='ended';}
function sorted(a){return [...a].sort().join('|');}
function serve(s,id,n=s.selected){
 if(!valid(s,n)||!s.cups[n].ready)return null;
 const o=s.orders.find(v=>v.id===id);if(!o)return null;
 const recipe=recipes[o.recipe],correct=sorted(recipe)===sorted(s.cups[n].items);
 discard(s,n);s.orders=s.orders.filter(v=>v!==o);
 if(!correct){s.wrong++;fail(s);return {correct,patron:o.patron,palette:o.palette,failures:s.failures};}
 s.served++;s.drinks.push(Object.freeze([...recipe]));if(s.drinks.length>historyLimit)s.drinks.shift();s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);s.failures=0;
 const subtotal=recipe.reduce((a,k)=>a+prices[k],0);
 const effect=signature[o.recipe]??'',tip=Math.round(6*Math.max(0,(o.until-s.time)/(o.until-o.at)));
 const speed=s.time-o.at<=(effect==='fizz'?8:5)+1e-7?3:0,bonus=Math.min(6,Math.floor(s.streak/2)*2);
 const special=effect==='cinnamon'?3:effect==='cream'?2:0;
 let extended=0;
 if(effect==='mint')for(const next of s.orders){
  const more=Math.min(2,4-next.grace);if(more>0){next.grace+=more;next.until+=more;extended++;}
 }
 const gain=subtotal+tip+speed+bonus+special;
 s.menu+=subtotal;s.tips+=tip;s.speed+=speed;s.bonus+=bonus;s.special+=special;s.money+=gain;
 return {correct,patron:o.patron,palette:o.palette,subtotal,tip,speed,bonus,special,effect,extended,gain};
}
function tick(s,dt){
 if(s.phase!=='playing'||!Number.isFinite(dt)||dt<=0)return [];
 let missed=[],remain=Math.min(dt,2);
 while(remain>1e-7&&s.phase==='playing'){
  const step=Math.min(.1,remain);remain-=step;s.time+=step;
  for(const o of s.orders.filter(v=>v.until<=s.time+1e-7).sort((a,b)=>a.until-b.until||a.id-b.id)){
   s.orders=s.orders.filter(v=>v!==o);s.missed++;missed.push(o);fail(s);if(s.phase==='ended')break;
  }
  const queue=Math.min(cap,3+profile(s));if(s.phase==='playing'&&s.time+1e-7>=s.next&&s.orders.length<queue)add(s);
 }
 return missed;
}
return {prices,bases,ingredients,recipes,signature,visual,patience,make,start,select,pour,seal,discard,serve,tick,profile};
});
