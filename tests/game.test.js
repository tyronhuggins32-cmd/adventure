import test from 'node:test';
import assert from 'node:assert/strict';
// Exercise the actual game loop and controls without a browser dependency.
test('game starts, renders, moves, jumps, saves and resumes through UI handlers',async()=>{
 const listeners={},elements=new Map(),store=new Map();let nextFrame;
 const context=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>(t[k]=v,true)});
 class Element{constructor(){this.value='the-fallen-crown';this.children=[];this.hidden=false;this.dataset={};this.classList={toggle(){}};}getContext(){return context;}append(b){this.children.push(b);}}
 globalThis.HTMLInputElement=class{};globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},createElement:()=>new Element(),querySelectorAll:q=>q==='#hotbar button'?elements.get('hotbar').children:[]};
 globalThis.window=globalThis;globalThis.innerWidth=1000;globalThis.innerHeight=700;globalThis.addEventListener=(n,fn)=>listeners[n]=fn;globalThis.requestAnimationFrame=fn=>nextFrame=fn;globalThis.localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
 await import('../game.js');elements.get('start').onclick();assert.equal(adventure.state.playing,true);
 let t=0;function frames(n){for(let i=0;i<n;i++)nextFrame(t+=16);}
 frames(100);let p=adventure.state.player;assert.ok(p.ground);assert.ok(adventure.state.chunks>0);
 function key(k){listeners.keydown({key:k,target:{},preventDefault(){}});}function up(k){listeners.keyup({key:k});}
 key(' ');frames(8);up(' ');assert.ok(adventure.state.player.y<p.y,'jump rises');key('d');frames(25);up('d');assert.ok(adventure.state.player.x>p.x,'movement advances');
 key('Escape');assert.equal(adventure.state.paused,true);let saved=JSON.parse(store.get('elderwild:the-fallen-crown'));assert.ok(saved.player[0]>p.x);elements.get('resume').onclick();assert.equal(adventure.state.player.x,saved.player[0]);assert.equal(adventure.state.paused,false);
 elements.get('forge').onclick();assert.equal(elements.get('notice').textContent,'Forging needs 8 crystal shards.');
 frames(100);assert.ok(adventure.state.cached>0);
});
