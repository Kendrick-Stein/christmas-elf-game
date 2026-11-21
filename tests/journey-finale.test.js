const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const body=fs.readFileSync(require('node:path').join(__dirname,'../journey-finale.js'),'utf8');
function sample(n){
 return Object.freeze({level:n,score:648,star:n>=12,spacing:20,layers:Object.freeze(Array.from({length:n},(_,i)=>Object.freeze({x:i*1.5,w:120-i,ornaments:Object.freeze([{kind:'string'}])})))});
}
function render(snapshot,time,{reduced=false,before,width=390,height=710}={}){
 const calls=[],grad=()=>({addColorStop(){}}),canvas=()=>new Proxy({globalAlpha:1,createLinearGradient:grad,createRadialGradient:grad,drawImage:()=>calls.push(['image'])},{get:(o,k)=>k in o?o[k]:()=>{}});
 const window={},g=canvas();
 vm.runInNewContext(body,{window,document:{createElement:()=>({getContext:()=>canvas()})}});
 const engine=window.ElfJourneyFinale;
 const source={bounds:()=>({left:-85,right:85,top:-snapshot.level*20,bottom:38}),drawTree:(_,s,p)=>calls.push(['tree',s,p]),drawSled:(_,p)=>calls.push(['sled',p])};
 engine.paint(g,{snapshot,before,time,width,height,source,reduced});
 return calls;
}
test('cinematic draws detached actual upper rows, and only the retained tree in the plaza',()=>{
 const snapshot=sample(5),before=sample(8);
 const early=render(snapshot,.16,{before});
 assert(early.some(([kind])=>kind==='sled'));
 assert(early.some(([kind,s,p])=>kind==='tree'&&s===before&&p.fromRow===5&&p.toRow===6));
 for(const width of [390,1360]){
  const late=render(snapshot,5.8,{width,before});
  const tree=late.filter(([kind])=>kind==='tree');
  assert.equal(tree.length,1);
  assert.equal(tree[0][1],snapshot);
  assert.equal(tree[0][2].lightForRow(4),1);
  assert(!late.some(([kind])=>kind==='sled'));
  assert(tree[0][2].x>0&&tree[0][2].scale>0);
 }
});
test('lighting runs bottom to top; reduced motion directly shows the true final tree',()=>{
 const snapshot=sample(12);
 const t=render(snapshot,3.95).find(([k])=>k==='tree')[2].lightForRow;
 assert(t(0)>t(11));
 const staticCalls=render(snapshot,0,{reduced:true,before:sample(14)});
 assert.deepEqual(staticCalls.filter(([k])=>k==='tree').map(([,snap])=>snap),[snapshot]);
 assert.equal(staticCalls.find(([k])=>k==='tree')[2].lightForRow(11),1);
 assert(!staticCalls.some(([k])=>k==='sled'));
});
