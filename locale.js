(() => {
'use strict';
const words={
 brand:["松针雪夜", "Pine & Snow"],
 title:["松针雪夜 · 垒树挑战", "Pine & Snow · Tree Stacker"],
 description:["推着小精灵的雪橇，在雪夜垒起一棵圣诞树。", "Guide the elf’s sled and stack a Christmas tree on a snowy night."],
 help:["玩法", "How to play"],
 sensitivity:["灵敏度", "Sensitivity"],
 low:["低", "Low"],
 medium:["标准", "Normal"],
 high:["高", "High"],
 soundOff:["静音", "Muted"],
 soundOn:["声音开", "Sound on"],
 unmute:["打开声音", "Unmute"],
 mute:["关闭声音", "Mute"],
 hud:["游戏状态", "Game status"],
 score:["分数", "Score"],
 combo:["连击", "Streak"],
 levels:["层数", "Layers"],
 wobble:["晃动", "Wobble"],
 hearts:["生命 {n}", "Lives: {n}"],
 noWind:["无风", "No wind"],
 beginChapter:["稳稳起步", "Easy start"],
 stormChapter:["紧张的风雪", "Snowstorm"],
 starChapter:["✦ 星树已点亮", "✦ Tree lit"],
 windR:["来风 →", "Wind →"],
 windL:["← 来风", "← Wind"],
 heavyWind:["强风", "Strong"],
 expand:["打开放大模式", "Open focus mode"],
 collapse:["退出放大模式", "Exit focus mode"],
 field:["游戏场地：按左右键移动雪橇，用树顶接住松枝", "Game field: move the sled with arrow controls and catch branches on the treetop"],
 readyTitle:["垒得越高越好", "Stack as high as you can"],
 readyText:["移动树顶，对准落下的松叶。", "Move the treetop under the falling branches."],
 start:["开始垒树", "Start stacking"],
 save:["保存我的树", "Save my tree"],
 share:["分享", "Share"],
 copy:["复制游戏链接", "Copy game link"],
 left:["向左移动", "Move left"],
 right:["向右移动", "Move right"],
 keyboard:["键盘", "Keys"],
 or:["或", "or"],
 touch:["点按或长按下方左右箭头", "Tap or hold the arrows below"],
 closeHelp:["收起玩法", "Close instructions"],
 rule1:["树顶接叶", "Catch with the treetop"],
 rule1body:["手机用下方箭头；松枝接得越准，分越高", "On phones, use the arrow buttons. Centered catches score more."],
 rule2:["别让树倒", "Keep the tree upright"],
 rule2body:["松叶漏接 −10 分、−1 心", "Miss a branch: −10 points and −1 heart."],
 rule3:["4 连准触发彩灯雨", "4 perfect catches bring a light shower"],
 rule3body:["平时也会掉灯串；接住可挂树、加分并稳固", "Catch light strings to decorate, score and steady the tree."],
 rule4:["压缩 · 加宽 · 吸附", "Compact · Widen · Magnet"],
 rule4body:["用树顶接住道具，漏接不扣分", "Catch power-ups with the treetop. No penalty for missing them."],
 rule5:["200 分后 · 随机访客", "Visitors after 200 points"],
 rule5body:["小心反转和冷色驯鹿；圣诞老人会推正树底", "Watch for reversed controls and icy reindeer. Santa straightens the base."],
 language:["选择语言", "Choose language"],
 cancel:["返回", "Back"],
 languageNote:["之后随时可以用右上角的地球图标切换。", "Switch anytime using the globe in the top right."],
 layerUnit:[" 层", " layers"],
 best:["最高 {level} 层 · 最高 {score} 分", "Best: {level} layers · {score} pts"],
 record:["新纪录", "NEW RECORD"],
 settlement:["雪夜结算", "RUN COMPLETE"],
 tilt:["哎呀，树倒了！", "Oh no, the tree fell!"],
 lost:["雪夜到站", "End of the snowy run"],
 results:["{level} 层 · {score} 分 · {lights} 盏彩灯 · {decorations} 件装饰", "{level} layers · {score} pts · {lights} lights · {decorations} ornaments"],
 bestCombo:["最长精准连击 {n}", "Longest perfect streak: {n}"],
 replay:["再垒一棵", "Play again"],
 missPoints:["−{n} 分 · −1 心", "−{n} pts · −1 heart"],
 missHeart:["漏接 · −1 心", "Miss · −1 heart"],
 missBanner:["漏接：−{n} 分、−1 心", "Miss: −{n} pts, −1 heart"],
 missBannerHeart:["漏接：−1 心", "Miss: −1 heart"],
 heartPlus:["+1 心", "+1 heart"],
 heartRestored:["恢复一颗心", "One heart restored"],
 perfect:["稳稳的 +30", "Perfect +30"],
 close:["靠中 +20", "Close +20"],
 catch:["悬边 +10", "On the edge +10"],
 starLit:["✦ 星星亮了！", "✦ The star is lit!"],
 festival:["✦ 彩灯雨", "✦ Light shower"],
 riskAlert:["快倒了！对准树顶", "About to topple! Center your catch"],
 compress:["压缩", "Compact"],
 wide:["加宽", "Widen"],
 magnet:["吸附", "Magnet"],
 stable:["稳固", "Stable"],
 compressed:["⇣ 压缩 · 降低晃动", "⇣ Compact · Less wobble"],
 powerFor:["{icon} {power} · {n} 秒", "{icon} {power} · {n}s"],
 orn_festival:["彩灯", "Light"],
 orn_string:["灯串", "Garland"],
 orn_bow:["蝴蝶结", "Bow"],
 orn_bauble:["彩球", "Bauble"],
 orn_cane:["拐杖糖", "Candy cane"],
 orn_gift:["驯鹿礼灯", "Reindeer gift"],
 orn_bell:["铃铛", "Bell"],
 ornReward:["{name} +{points}", "{name} +{points}"],
 ornStable:["{name} +{points} · 稳固", "{name} +{points} · Stable"],
 greenWarn:["绿毛怪来了 · 准备左右反转", "The green prankster is here · Controls will reverse"],
 reversed:["左右反转 · {n} 秒", "Controls reversed · {n}s"],
 santaWarn:["圣诞老人来了 · 稳住底部", "Santa is here to steady the base"],
 goldWarn:["金色驯鹿 · 接住礼灯 +30", "Golden reindeer · Catch the gift +30"],
 blueWarn:["冷色驯鹿 · 快离开标记路线", "Icy reindeer · Move off the marked path"],
 blueRun:["冷色驯鹿 · 闪开路线", "Icy reindeer · Dodge the path"],
 santaMoved:["圣诞老人 · 把底部推稳了", "Santa straightened the base"],
 santaFine:["圣诞老人 · 底部已经很稳", "Santa found the base steady"],
 deerBumpPoints:["驯鹿撞到树顶 · −1 层、−{n} 分", "Reindeer hit the treetop · −1 layer, −{n} pts"],
 deerBump:["驯鹿撞到树顶 · −1 层", "Reindeer hit the treetop · −1 layer"],
 minusLayer:["−1 层", "−1 layer"],
 dodge:["躲开驯鹿了！", "You dodged the reindeer!"],
 break:["休息一下", "SNOW BREAK"],
 paused:["雪夜暂停", "Paused"],
 pausedText:["等你回来继续垒。", "Your tree will be here when you return."],
 pausedFine:["也可以按 Esc 继续", "Press Esc to resume"],
 skipFinale:["跳过庆祝","Skip celebration"],
 workshop:["造树工坊","Tree Workshop"],
 gingerbreadGame:["搭姜饼屋","Build a Gingerbread House"],
 workshopOther:["自由搭树，不计分，和垒树挑战分开。","Build a separate tree at your own pace, without scoring."],
 workshopBack:["返回首页","Back to home"],
 settings:["设置","Settings"],
 scoreUnit:["分","pts"],
 resultRetained:["原叠 {finalHeight} 层 · 保住 {level} 层 · {lights} 盏彩灯 · {decorations} 件装饰","{finalHeight} stacked · {level} kept · {lights} lights · {decorations} ornaments"],
 resultSummary:["{level} 层 · {lights} 盏彩灯 · {decorations} 件装饰","{level} layers · {lights} lights · {decorations} ornaments"],
 tip_compress:["压低树身，同时降低晃动","Compacts the tree and reduces wobble."],
 tip_wide:["8 秒内拓宽树顶接取范围","A wider catch area for 8 seconds."],
 tip_magnet:["8 秒内轻拉附近松枝","Gently pulls nearby branches for 8 seconds."],
 tip_stable:["短时间减轻偏接带来的晃动","Off-center catches add less wobble for a short time."],
 riskEarly:["树身开始晃动 {n}%","Tree wobbling {n}%"],
 riskTop:["危险 {n}%","Danger {n}%"],
 resume:["继续垒树", "Resume"]
};
const key='snow-pine-language-v1', $=id=>document.getElementById(id);
let saved;try{saved=localStorage.getItem(key);}catch{}
let chosen=saved==='zh'||saved==='en',active=chosen?saved:'zh',opened=false;
const listeners=new Set(),pickerListeners=new Set();
const t=(name,vars={})=>(words[name]?.[active==='en'?1:0]??name).replace(/\{(\w+)\}/g,(_,k)=>vars[k]??'');
const picker=$('languagePicker'),toggle=$('languageToggle'),focusToggle=$('focusLanguageToggle'),back=$('languageBack');
const zh=$("languageZH"),en=$("languageEN");
const nativeModal=typeof picker.showModal==="function";
let origin=toggle;
function render(){
 document.documentElement.lang=active==='en'?'en':'zh-CN';
 document.title=t('title');
 for(const node of document.querySelectorAll('[data-l10n]'))node.textContent=t(node.dataset.l10n);
 for(const node of document.querySelectorAll('[data-l10n-aria]'))node.setAttribute('aria-label',t(node.dataset.l10nAria));
 for(const node of document.querySelectorAll('[data-l10n-title]'))node.setAttribute('title',t(node.dataset.l10nTitle));
 document.querySelector('meta[name="description"]')?.setAttribute('content',t('description'));
 $('languageBadge').textContent=active==='en'?'EN':'中';
 $('focusLanguageBadge').textContent=active==='en'?'EN':'中';
 back.hidden=!chosen;
 for(const [button,code] of [[zh,'zh'],[en,'en']]){
   if(chosen)button.setAttribute('aria-pressed',String(active===code));
   else button.removeAttribute('aria-pressed');
 }
}
function open(from=toggle){
 if(opened)return;
 opened=true;origin=from;origin.setAttribute('aria-expanded','true');render();
 for(const fn of pickerListeners)fn(true);
 if(nativeModal)picker.showModal();else{picker.setAttribute('open','');picker.dataset.fallback='true';$('shell').inert=true;}
 $(active==='en'?'languageEN':'languageZH').focus({preventScroll:true});
}
function close(focus){
 if(!opened)return;
 opened=false;origin.setAttribute('aria-expanded','false');
 if(nativeModal)picker.close();else{picker.removeAttribute('open');$('shell').inert=false;}
 for(const fn of pickerListeners)fn(false);
 focus.focus({preventScroll:true});
}
function choose(lang){
 const first=!chosen,changed=active!==lang;
 active=lang;chosen=true;
 try{localStorage.setItem(key,lang);}catch{}
 render();close(first?$('start'):origin);
 if(changed)for(const fn of listeners)fn(lang);
}
toggle.addEventListener('click',()=>open(toggle));
focusToggle.addEventListener('click',()=>open(focusToggle));
$('languageZH').addEventListener('click',()=>choose('zh'));
$('languageEN').addEventListener('click',()=>choose('en'));
back.addEventListener('click',()=>{if(chosen)close(origin);});
function dismiss(e){e.preventDefault();if(chosen)close(origin);}
picker.addEventListener('cancel',dismiss);
if(!nativeModal)picker.addEventListener('keydown',e=>{
 if(e.key==='Escape')dismiss(e);
 if(e.key==='Tab'){
    const nodes=chosen?[zh,en,back]:[zh,en],index=nodes.indexOf(document.activeElement);
    e.preventDefault();nodes[(index+(e.shiftKey?-1:1)+nodes.length)%nodes.length].focus();
 }
});
window.addEventListener('storage',e=>{
 if(e.key!==key||!['en','zh'].includes(e.newValue)||active===e.newValue&&chosen)return;
 const changed=active!==e.newValue;active=e.newValue;chosen=true;render();if(opened)close(origin);
 if(changed)for(const fn of listeners)fn(active);
});
window.ElfLocale=Object.freeze({t,lang:()=>active,blocking:()=>opened,onChange:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},onPicker:fn=>{pickerListeners.add(fn);return()=>pickerListeners.delete(fn);}});
render();if(!chosen)open();
})();
