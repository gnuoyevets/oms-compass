/* Loads the real OMS Compass script (index.html) into a Node VM, with no browser and no network.
   Used by the accuracy-study scripts so Compass is scored exactly as shipped. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function loadCompass(file=path.join(__dirname,'..','index.html'),mode='colleague'){
 const html=fs.readFileSync(file,'utf8');const noop=()=>{};const els=new Map();
 const element=()=>({innerHTML:'',hidden:false,value:'',classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,querySelector:()=>null,querySelectorAll:()=>[],setAttribute:noop});
 const document={getElementById:id=>{if(!els.has(id))els.set(id,element());return els.get(id)},querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop,createElement:element,body:{classList:{add:noop,remove:noop,toggle:noop},appendChild:noop}};
 const store=new Map([['omsCompassAck','1'],['oms_compass_practice_mode',mode]]);
 const sb={console:{log:noop,warn:noop,error:noop},document,navigator:{},window:{scrollTo:noop},location:{hash:'',pathname:'/',search:''},history:{replaceState:noop},addEventListener:noop,setTimeout:noop,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
 vm.createContext(sb);
 vm.runInContext([...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n'),sb);
 return {run:code=>vm.runInContext(code,sb),sb};
}
module.exports={loadCompass};
