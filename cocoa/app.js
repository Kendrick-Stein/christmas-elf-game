(()=>{
'use strict';
const C=globalThis.Cocoa,$=id=>document.getElementById(id),langKey='snow-pine-language-v1',record='snow-cocoa-endless-best-v1';
const get=k=>{try{return localStorage.getItem(k);}catch{return null;}},set=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
let en=get(langKey)==='en',best=Number(get(record))||0,s=C.make(),paused=false,last=0,heard='',reaction=null,finalAt=0,finalProgress=1;
const audio=globalThis.PineAudio;
const L=(z,e)=>en?e:z,cash=n=>'✦ '+n;
const labels={home:['首页','Arcade'],brand:['松针雪夜 · 冬日街机','Pine & Snow · Winter Arcade'],title:['雪夜可可铺','Snowy Cocoa Stand'],pause:['暂停','Pause'],money:['营业额','Revenue'],streak:['连单','Streak'],fails:['连续失手','Misses in a row'],best:['纪录','Best'],served:['完成','Served'],tips:['小费','Tips'],sound:['声音','Audio'],music:['背景音乐','Background music'],sfx:['操作音效','Sound effects'],retry:['重新开局','Restart'],skip:['跳过动画','Skip animation'],orders:['顾客订单','Customer orders'],orderKeys:['订单 1–6','Orders 1–6'],cups:['备餐台 · 四杯','Counter · four cups'],cupKeys:['杯位 7 · 8 · 9 · 0','Cups 7 · 8 · 9 · 0'],mix:['调制台','Mixing station'],seal:['做好放台面','Set cup down'],serve:['选择顾客递杯','Pick a guest to serve']};
const food={dark:['黑可可','Dark cocoa','#754438'],milk:['牛奶可可','Milk cocoa','#c78b63'],wine:['热红酒','Mulled wine','#a53954'],egg:['蛋奶酒','Eggnog','#e5c78a'],mint:['薄荷','Mint','#9bd2b1'],cream:['奶油','Cream','#ffe5c9'],mallow:['棉花糖','Marshmallow','#f4b3ce'],spice:['肉桂','Cinnamon','#be754a'],orange:['橙片','Orange','#eea857']};
const patrons=[['松针精灵','Pine Elf'],['送信员','Courier'],['织帽客','Knit-cap Guest'],['星灯客','Lamplighter'],['滑雪客','Skier'],['围巾精灵','Scarf Elf']];
const name=k=>L(...food[k]),list=items=>items.map(name).join(' + '),reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function say(text){if(text!==heard){heard=text;$('feedback').textContent=text;}}
function node(tag,cls){const n=document.createElement(tag);if(cls)n.className=cls;return n;}
function button(cls,action){const b=node('button',cls);b.type='button';b.addEventListener('click',action);return b;}
function isPlaying(){return s.phase==='playing'&&!paused;}
function pick(i){if(!isPlaying()||!C.select(s,i))return;say(s.cups[i].ready?L('杯子已选好，点顾客递出。','Cup selected. Tap its guest.'):L('已选第 '+(i+1)+' 杯。','Cup '+(i+1)+' selected.'));render();}
function discard(i){if(!isPlaying()||!C.discard(s,i))return;say(L('已清空第 '+(i+1)+' 杯。','Cup '+(i+1)+' cleared.'));render();}
function pour(k){if(!isPlaying())return;if(C.pour(s,k)){audio?.effect?.('tap');say('');}else if(s.selected===null)say(L('先选一个空杯。','Pick an empty cup first.'));render();}
function seal(){if(!isPlaying()||!C.seal(s))return;audio?.effect?.('click');say(L('这杯已留在台面，随时可递出。','Cup saved on the counter. Serve it whenever you’re ready.'));render();}
function deliver(id){
 if(!isPlaying())return;
 const r=C.serve(s,id);
 if(!r){say(L('先点一杯已做好的饮品，再点顾客。','Tap a ready cup, then tap its guest.'));return;}
 reaction={patron:r.patron,ok:r.correct,end:s.time+.8};audio?.effect?.(r.correct?'bright':'dull');
 if(r.correct)say(L('做对啦！ +'+r.gain+' · 小费 '+r.tip+(r.speed?' · 快单 +'+r.speed:'')+(r.bonus?' · 连单 +'+r.bonus:''),'Perfect! +'+r.gain+' · tip '+r.tip+(r.speed?' · quick +'+r.speed:'')+(r.bonus?' · streak +'+r.bonus:'')));
 else say(L('这杯给错人了。失手 '+r.failures+'/3。','Wrong drink for this guest. Misses '+r.failures+'/3.'));
 if(s.phase==='ended')end();else render();
}
const ingKeys='qweasdzxc',orderNodes=new Map(),empty=node('p','empty');$('orders').append(empty);
const ing=C.ingredients.map((k,i)=>{
 const b=button('ingredient',()=>pour(k));b.append(node('i'),node('span'),node('kbd'));b.children[0].style.setProperty('--item',food[k][2]);b.children[2].textContent=ingKeys[i].toUpperCase();$('ingredients').append(b);return b;
});
const slots=s.cups.map((_,i)=>{
 const el=node('div','cup-slot'),pickBtn=button('cup-pick',()=>pick(i)),trash=button('cup-discard',()=>discard(i));pickBtn.append(node('b'),node('em'));trash.textContent='×';el.append(pickBtn,trash);$('cups').append(el);return {el,pickBtn,trash};
});
function setText(el,text){if(el.textContent!==text)el.textContent=text;}
function render(){
 const playing=isPlaying(),end=s.phase==='ended',cup=s.selected===null?null:s.cups[s.selected],animate=end&&finalProgress<1;
 $('kitchen').inert=!playing;$('pause').hidden=!playing;$('overlay').hidden=playing;$('overlay').dataset.screen=end?'result':paused?'paused':'ready';$('overlay').classList.toggle('celebrating',animate);
 $('honors').hidden=!end;$('breakdown').hidden=!end||animate;$('restart').hidden=!paused;$('skipAnimation').hidden=!animate;$('start').hidden=animate;
 setText($('money'),cash(s.money));setText($('streak'),s.streak+'');setText($('fails'),s.failures+' / 3');setText($('best'),cash(best));
 if(!playing){
  setText($('banner'),end?L('今日打烊','Closing time'):paused?L('稍歇一下','Taking a break'):L('准备营业！','Open for winter!'));
  setText($('intro'),end?L('连续三位客人没服务好。','Three guests in a row left unserved.'):paused?L('暂停时，顾客不会离开。','Customers wait while paused.'):L('选四个杯位中的一个，加底饮和小料。做好放台面，选成品杯再点对应顾客。连续失手三次打烊。','Pick one of four cups, add the base and toppings, then set it down. Select the ready cup and tap its guest. Three consecutive misses close the stand.'));
  setText($('start'),end?L('再开一班','Another shift'):paused?L('继续营业','Resume shift'):L('开始营业','Open the stand'));
 }
 if(end){const f=1-Math.pow(1-finalProgress,3);setText($('finalMoney'),cash(Math.floor(f*s.money)));setText($('finalServed'),Math.floor(f*s.served)+'');setText($('finalTips'),cash(Math.floor(f*s.tips)));setText($('breakdown'),L('饮品本价 '+s.menu+' · 快单奖金 '+s.speed+' · 连单奖金 '+s.bonus,'Menu sales '+s.menu+' · Quick bonus '+s.speed+' · Streak bonus '+s.bonus));}
 for(const [id,b] of orderNodes)if(!s.orders.some(o=>o.id===id)){b.remove();orderNodes.delete(id);}
 empty.hidden=!!s.orders.length;
 s.orders.forEach((o,i)=>{
  let b=orderNodes.get(o.id);if(!b){b=button('order',()=>deliver(o.id));b.append(node('b'),node('em'),node('span','bar'));b.children[2].append(node('i'));$('orders').append(b);orderNodes.set(o.id,b);}
  setText(b.children[0],(i+1)+'. '+L(...patrons[o.patron]));setText(b.children[1],list(C.recipes[o.recipe]));b.dataset.drink=C.recipes[o.recipe][0];b.disabled=!playing;
  const pct=Math.max(0,(o.until-s.time)/(o.until-o.at)),bar=b.children[2].firstChild;bar.style.width=(pct*100)+'%';bar.classList.toggle('low',pct<.27);
  b.classList.toggle('targetable',Boolean(cup?.ready));b.classList.toggle('urgent',pct<.27);
 });
 slots.forEach(({el,pickBtn,trash},i)=>{
  const c=s.cups[i];el.dataset.state=c.ready?'ready':c.items.length?'mixing':'empty';el.dataset.drink=c.items[0]??'';
  pickBtn.disabled=!playing;pickBtn.setAttribute('aria-pressed',String(s.selected===i));trash.hidden=!c.items.length;trash.disabled=!playing||!c.items.length;trash.setAttribute('aria-label',L('清空第 '+(i+1)+' 杯','Clear cup '+(i+1)));
  setText(pickBtn.children[0],L('杯 '+(i+1),'Cup '+(i+1))+(c.ready?L(' · 已好',' · Ready'):''));setText(pickBtn.children[1],c.items.length?list(c.items):L('空杯','Empty'));
 });
 ing.forEach((b,i)=>b.disabled=!playing||!cup||cup.ready||cup.items.length>=4||(cup.items.length?i<4:i>=4));
 $('seal').disabled=!playing||!cup||cup.ready||cup.items.length<2;$('serve').disabled=!playing||!cup?.ready||!s.orders.length;
 setText($('formula'),cup?.items.length?list(cup.items):cup?L('先选一款底饮','Choose a base first'):L('先选一个杯位','Select a cup slot'));
 const guest=reaction&&reaction.end>s.time?reaction.patron:s.orders[0]?.patron;
 $('patron').textContent=guest===undefined?'':' ';$('patron').style.backgroundPositionX=(guest??0)*20+'%';$('patron').classList.toggle('ok',Boolean(reaction?.ok&&reaction.end>s.time));
 $('liquid').style.backgroundColor=cup?.items[0]?food[cup.items[0]][2]:'#542e36';$('liquid').dataset.drink=cup?.items[0]??'';document.querySelector('.cup').dataset.drink=cup?.items[0]??'';setText($('garnish'),(cup?.items.slice(1)??[]).map(x=>({mint:'✦',cream:'☁',mallow:'▪',spice:'✶',orange:'◕'}[x])).join(''));
}
function lang(){
 document.documentElement.lang=en?'en':'zh-CN';document.title=L(...labels.title);setText($('language'),en?'中文':'EN');$('language').setAttribute('aria-label',L('Switch to English','切换为中文'));
 for(const el of document.querySelectorAll('[data-t]'))setText(el,L(...labels[el.dataset.t]));
 ing.forEach((b,i)=>setText(b.children[1],name(C.ingredients[i])+' '+cash(C.prices[C.ingredients[i]])));
 setText(empty,L('下一位顾客还在路上…','The next guest is on their way…'));say('');render();
}
function begin(){for(const b of orderNodes.values())b.remove();orderNodes.clear();s=C.make();C.start(s);paused=false;reaction=null;finalProgress=1;say('');audio?.switchTheme?.('tree',true);audio?.arm?.();render();slots[0].pickBtn.focus();}
function pause(value,focus=true){if(s.phase!=='playing')return;paused=value;render();if(focus)(value?$('start'):$('pause')).focus();}
function end(){audio?.effect?.('finish');if(s.money>best){best=s.money;set(record,String(best));}finalAt=0;finalProgress=reduced()?1:0;render();(finalProgress===1?$('start'):$('skipAnimation')).focus();}
function finishAnimation(){finalProgress=1;render();$('start').focus();}
$('start').addEventListener('click',()=>paused?pause(false):begin());$('pause').addEventListener('click',()=>pause(true));$('restart').addEventListener('click',begin);$('skipAnimation').addEventListener('click',finishAnimation);
$('language').addEventListener('click',()=>{en=!en;set(langKey,en?'en':'zh');lang();});window.addEventListener('storage',e=>{if(e.key===langKey&&(e.newValue==='en'||e.newValue==='zh')){en=e.newValue==='en';lang();}});
$('seal').addEventListener('click',seal);$('serve').addEventListener('click',()=>{if(isPlaying()&&s.cups[s.selected]?.ready){say(L('点要递杯的顾客。','Tap the guest for this cup.'));$('orders').querySelector('button')?.focus();}});
document.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;const k=e.key.toLowerCase();if(e.target?.tagName==='INPUT'||e.target?.tagName==='SUMMARY')return;if(k==='escape'&&s.phase==='playing'){e.preventDefault();pause(!paused);return;}if(!isPlaying())return;
 if(/^[1-6]$/.test(k)&&s.orders[Number(k)-1]){e.preventDefault();deliver(s.orders[Number(k)-1].id);}else if('7890'.includes(k)&&k.length===1){e.preventDefault();pick('7890'.indexOf(k));}else if(k.length===1&&ingKeys.includes(k)){e.preventDefault();pour(C.ingredients[ingKeys.indexOf(k)]);}else if(k==='f'){e.preventDefault();seal();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true,false);});
function frame(now){const dt=last?Math.min(.22,(now-last)/1000):0;last=now;
 if(isPlaying()&&!document.hidden){const misses=C.tick(s,dt);if(misses.length)say(L('有顾客离开了 · 失手 '+s.failures+'/3','A customer left · misses '+s.failures+'/3'));if(s.phase==='ended')end();else render();}
 else if(s.phase==='ended'&&finalProgress<1&&!document.hidden){finalAt+=dt;finalProgress=Math.min(1,finalAt/1.85);if(finalProgress===1)finishAnimation();else render();}
 requestAnimationFrame(frame);
}
function syncAudio(){const p=audio?.get?.();if(!p){$('audioSettings').hidden=true;return;}for(const k of ['music','sfx'])$(k).checked=!!p[k];}
for(const k of ['music','sfx'])$(k).addEventListener('change',()=>audio?.set?.(k,$(k).checked));
audio?.subscribe?.(syncAudio);syncAudio();lang();requestAnimationFrame(frame);
})();
