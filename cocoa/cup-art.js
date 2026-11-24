((g)=>{
'use strict';
const W=32,H=30;
const def=(rim,paths)=>Object.freeze({rim:Object.freeze({x:rim[0],y:rim[1],width:rim[2]}),paths:Object.freeze(paths.map(Object.freeze))});
const cups=Object.freeze({
 dark:def([3,5,20],[
 ['#342539','M3 3h20v2h2v4h4v2h2v11h-2v2h-5v3h-2v2H4v-2H2V6h1zM25 12v8h3v-8z'],
 ['#b97568','M4 6h18v2h2v16h-2v3H5v-2H4zM24 10h4v2h2v8h-2v2h-4v-2h4v-8h-4z'],
 ['#925063','M5 10h17v15h-2v2H6v-2H5z'],['#d89280','M6 12h3v12H6z'],
 ['#f4c995','M4 5h18v2h2v4H3V7h1z'],['#542f3c','M5 7h17v2H5z'],['#a96957','M7 7h8v1H7z'],
 ['#ffda9c','M13 16h2v2h2v2h-2v2h-2v-2h-2v-2h2z']]),
 milk:def([3,8,19],[
 ['#37283c','M4 7h17v2h3v3h5v2h2v6h-2v3h-6v2h-2v2h-3v2H8v-2H5v-2H3v-4H2V10h2zM24 15v5h4v-5z'],
 ['#e5b18a','M4 10h17v2h2v9h-1v3h-2v2h-3v2H8v-2H6v-2H4v-3H3v-9h1zM23 13h5v2h2v5h-2v2h-5v-2h5v-5h-5z'],
 ['#bc7365','M5 14h17v7h-2v3h-3v2H9v-2H6v-3H5z'],['#ebb58a','M6 15h3v5H6z'],
 ['#ffe1a9','M5 9h16v2h2v3H3v-3h2z'],['#a56651','M5 11h16v2H5z']]),
 wine:def([7,3,18],[
 ['#36273e','M7 2h18v2h2v7h-1v3h-2v2h-2v2h-3v7h4v2h3v2H6v-2h3v-2h4v-7h-3v-2H8v-2H6v-3H5V4h2z'],
 ['#dda1ab','M7 4h18v7h-1v3h-2v2h-4v10h5v1h2v1H7v-1h2v-1h5V16h-4v-2H8v-3H7z'],
 ['#a34058','M8 7h16v4h-1v2h-2v3H11v-3H9v-2H8z'],['#d36c77','M10 9h2v4h-2zM16 17h1v9h-1z'],
 ['#ffe1c0','M7 4h18v2H7zM9 27h14v1H9z']]),
 egg:def([6,5,20],[
 ['#392942','M7 3h18v2h3v9h-2v3h-3v3h-4v3h4v2h4v4H5v-4h4v-2h4v-3H9v-3H6v-3H4V5h3z'],
 ['#d5ac77','M6 6h20v8h-2v3h-3v2h-3v5h4v2h4v2H6v-2h4v-2h4v-5h-3v-2H8v-3H6z'],
 ['#edcd94','M7 10h18v4h-2v2h-3v2h-8v-2H9v-2H7z'],['#f7dfaa','M9 10h4v5H9zM16 20h1v4h-1z'],
 ['#fff0c3','M7 5h18v2h2v3H5V7h2zM8 26h16v1H8z'],['#d1a679','M8 7h16v2H8z']]),
 apple:def([7,4,18],[
 ['#3a2a43','M6 2h20v2h2v9h-1v7h-1v5h-2v4H8v-4H6v-5H5v-7H4V4h2z'],
 ['#ddae86','M6 5h20v8h-1v7h-1v5h-2v3H10v-3H8v-5H7v-7H6z'],
 ['#b76941','M8 7h16v7h-1v6h-1v5h-2v2h-8v-2h-2v-5H9v-6H8z'],
 ['#e89b55','M9 10h4v9h1v5h-3v-6h-1z'],['#8c493b','M20 10h3v7h-1v6h-2z'],
 ['#ffe2a5','M6 4h20v2H6zM10 26h12v1H10z']]),
 latte:def([5,3,16],[
 ['#39283f','M5 1h16v2h2v5h4v2h3v9h-2v3h-5v5h-2v2H5v-2H3V3h2zM23 11v8h4v-8z'],
 ['#d7ad90','M5 3h16v2h1v21h-2v2H6v-2H4V5h1zM22 9h5v2h2v8h-2v2h-5v-2h5v-8h-5z'],
 ['#906451','M6 16h14v10H6z'],['#bc8b69','M6 10h14v8H6z'],['#f1d2a9','M6 6h14v5H6z'],
 ['#ffe6bd','M7 7h2v17H7zM5 3h16v2H5z'],['#cba07d','M12 4h7v1h-7z']]),
 white:def([5,9,20],[
 ['#392941','M5 8h19v2h2v2h3v2h2v6h-2v2h-5v2h-2v1h7v2h-3v2H5v-2H2v-2h7v-1H6v-2H4v-3H2v-8h3zM26 15v5h2v-5z'],
 ['#d6a6a8','M4 26h24v1h-3v1H6v-1H4zM24 13h4v2h2v5h-2v1h-4v-1h4v-5h-4z'],
 ['#f1dbc5','M5 10h19v2h1v6h-2v3h-2v2h-4v2h-6v-2H8v-2H6v-3H4v-6h1z'],
 ['#dcb6ab','M6 15h3v3h3v3h7v-1h3v2h-4v2h-7v-2H8v-2H6z'],
 ['#fff1d4','M5 10h19v2h1v2H4v-2h1z'],['#d8c69f','M6 12h16v1H6z'],['#a76479','M13 15h1v1h-1zM17 16h1v1h-1z']])
});
const aliases=Object.freeze({cocoa:'dark',eggnog:'egg',mulled:'wine'});
const get=id=>Object.hasOwn(cups,id)?cups[id]:Object.hasOwn(aliases,id)?cups[aliases[id]]:cups.dark;
const catalogue=Object.freeze(Object.keys(cups));
function svg(id){
 return '<svg width="32" height="30" viewBox="0 0 32 30" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">'+get(id).paths.map(([c,d])=>'<path fill="'+c+'" fill-rule="evenodd" d="'+d+'"/>').join('')+'</svg>';
}
const pathsCache=new WeakMap();
function draw(ctx,id,{x=0,y=0,size=W}={}){
 const data=get(id);
 let paths=pathsCache.get(data);
 if(!paths){paths=data.paths.map(([c,d])=>[c,new g.Path2D(d)]);pathsCache.set(data,paths);}
 ctx.save();
 try{
   ctx.translate(x,y);ctx.scale(size/W,size/W);
   for(const [c,path] of paths){ctx.fillStyle=c;ctx.fill(path,'evenodd');}
 }finally{ctx.restore();}
}
const api=Object.freeze({W,H,catalogue,svg,draw,rim:id=>get(id).rim});
if(typeof module==='object'&&module.exports)module.exports=api;else g.PineCups=api;
})(globalThis);
