import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../kingdom-clash/vendor/three.js';
import {createGame,choose,placeLandscape,canPlay,playCard,battle,tick,CARDS} from '../kingdom-clash/card-wars/engine.js';
import {createWorld3D,miniature,fit} from '../kingdom-clash/card-wars/scene.js';
function setup(){const s=createGame();for(let lane=0;lane<4;lane++){choose(s,{kind:'land',id:['corn','blue','ice','swamp'][lane],index:0});assert.equal(placeLandscape(s,lane),true);}return s;}
function cast(s,id,lane){s.hand.push(id);s.ap=3;choose(s,{kind:'card',id,index:s.hand.length-1});assert.equal(playCard(s,lane),true,id);}
test('landscape cards create the four physical fields before any battle cards can be played',()=>{
 const s=createGame();assert.equal(s.phase,'landscape');assert.equal(s.units.length,0);assert.equal(battle(s),false);
 choose(s,{kind:'land',id:'ice',index:2});assert.equal(placeLandscape(s,0),true);assert.equal(s.landscapes[0],'ice');assert.equal(placeLandscape(s,0),false);
 for(const [id,lane]of[['corn',1],['blue',2],['swamp',3]]){choose(s,{kind:'land',id,index:0});assert.equal(placeLandscape(s,lane),true);}
 assert.equal(s.phase,'deploy');assert.equal(s.hand.length,5);assert.equal(s.units.filter(u=>u.side===1).length,4);assert.equal(s.landscapes[0],'ice');
});
test('placement spends action points and creates a miniature only on matching terrain',()=>{
 const s=setup();choose(s,{kind:'card',id:'pig',index:0});assert.equal(canPlay(s,'pig',1),false);assert.equal(playCard(s,1),false);assert.equal(s.ap,3);assert.equal(playCard(s,0),true);assert.equal(s.ap,2);assert.equal(s.units.some(u=>u.card==='pig'&&u.side===0),true);
 cast(s,'wingedPig',0);assert.equal(s.units.find(u=>u.card==='pig').wings,true);assert.equal(s.effects.some(e=>e.type==='wing'),true);
});
test('barn sheep spell, scarecrow maze, and wolf packs require their exact board state',()=>{
 const s=setup();s.hand.push('cotton');assert.equal(canPlay(s,'cotton',0),false);cast(s,'barn',0);assert.equal(canPlay(s,'cotton',0),false);cast(s,'sheep',0);assert.equal(canPlay(s,'cotton',0),true);cast(s,'cotton',0);assert.equal(s.effects.some(e=>e.type==='cotton'),true);
 const other=setup();other.hand.push('maze');assert.equal(canPlay(other,'maze',0),false);cast(other,'scarecrow',0);other.ap=3;assert.equal(canPlay(other,'maze',0),true);cast(other,'maze',0);assert.equal(other.hazards[0],2);
 const pack=setup();cast(pack,'wolf',2);pack.hand.push('wolf');pack.ap=3;assert.equal(canPlay(pack,'wolf',2),true);cast(pack,'wolf',2);assert.equal(pack.units.filter(u=>u.side===0&&u.lane===2).length,2);assert.notEqual(pack.units.filter(u=>u.side===0&&u.lane===2)[0].x,pack.units.filter(u=>u.side===0&&u.lane===2)[1].x);
});
test('battle advances the simulation and returns a fresh hand and points',()=>{
 const s=setup();cast(s,'pig',0);assert.equal(battle(s),true);for(let i=0;i<120;i++)tick(s,.05);assert.equal(s.phase,'deploy');assert.equal(s.turn,2);assert.equal(s.ap,3);assert.ok(s.hand.length>=5);assert.ok(s.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.z)));
});
test('3D landscape and miniature geometry build and fit a mobile camera',()=>{
 const {scene,lands}=createWorld3D();assert.equal(lands.length,8);let meshCount=0;scene.traverse(o=>{if(o.isMesh)meshCount++;});assert.ok(meshCount>400);for(const c of Object.values(CARDS))if(c.type==='creature')assert.ok(miniature(c.art).children.length>0,c.name);
 const aspect=375/410,cam=new THREE.PerspectiveCamera(54,aspect,.1,250);for(const lane of[null,0,1,2,3])assert.ok(fit(cam,lane,aspect,.17,.82)>9);
});
