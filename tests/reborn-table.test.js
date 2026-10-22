import test from 'node:test';
import assert from 'node:assert/strict';
import {LEADERS,makeWorld,addUnit,addBuilding,beginBattle,step,play,floop,CARDS} from '../kingdom-clash/reborn/rules.js';

const advance=(w,seconds)=>{for(let i=0;i<seconds*40;i++)step(w,.025);};
test('every new commander starts beside its signature building on the physical table',()=>{
 for(const [key,leader] of Object.entries(LEADERS)){const w=makeWorld(key);assert.equal(w.buildings.find(b=>b.team===0)?.key,leader.starter);assert.equal(w.buildings.find(b=>b.team===0)?.lane,1);assert.ok(w.hand.length===5);}
});
test('cards spend energy, occupy persistent lanes, and battles return to planning',()=>{
 const w=makeWorld('farmer');w.hand.unshift('cornfield');assert.equal(play(w,'cornfield',0),true);assert.equal(w.commanders[0].energy,3);assert.equal(w.buildings.find(b=>b.team===0&&b.lane===0)?.key,'cornfield');assert.equal(beginBattle(w),true);advance(w,22.1);assert.equal(w.phase,'plan');assert.equal(w.round,2);assert.equal(w.commanders[0].energy,5);assert.ok(w.buildings.some(b=>b.team===0&&b.lane===0));
});
test('the Pig automatically eats rival corn without AP or a player attack command',()=>{
 const w=makeWorld('blue');w.units=w.units.filter(u=>u.team===0);w.buildings=w.buildings.filter(b=>b.team===0);w.lanes.forEach(l=>{l.enemyCrop=0;l.enemyTerrain='stone';});w.lanes[1].enemyCrop=1;w.lanes[1].enemyTerrain='corn';const pig=w.units.find(u=>u.key==='pig');pig.x=-2.77;pig.lane=1;pig.z=-3;const before=w.commanders[0].energy;beginBattle(w);advance(w,5);assert.ok(w.lanes[1].enemyCrop<.8);assert.equal(w.commanders[0].energy,before);assert.ok(['eat','walk'].includes(pig.action));
});
test('Barn births sheep and gives its commander the cotton spell',()=>{
 const w=makeWorld('farmer');w.units=w.units.filter(u=>u.team===0);w.buildings=w.buildings.filter(b=>b.team===0);w.enemyDeck=[];w.hand=[];beginBattle(w);advance(w,19.5);assert.ok(w.units.filter(u=>u.key==='sheep'&&u.team===0).length>=2);assert.ok(w.hand.includes('cotton'));assert.ok(w.logs.some(e=>e.text.includes('Barn births')));
});
test('Scarecrow repels crows and wolf Floop heals its nearby pack',()=>{
 const w=makeWorld('scarecrow');w.units=[];const b=addBuilding(w,0,0,'scarecrow');const crow=addUnit(w,1,0,'crow');crow.x=b.x;crow.z=b.z-1;beginBattle(w);step(w,.05);assert.ok(crow.fear>1);assert.equal(crow.action,'flee');
 const snow=makeWorld('wolf');const a=snow.units.find(u=>u.key==='wolf');a.hp=2;const mate=addUnit(snow,0,2,'wolf');mate.hp=3;assert.equal(floop(snow,a.id),true);assert.equal(a.hp,4);assert.equal(mate.hp,5);
});
test('simulation keeps actor health and coordinates finite across multiple waves',()=>{
 for(const key of Object.keys(LEADERS)){const w=makeWorld(key);for(let n=0;n<3&&!w.winner;n++){beginBattle(w);advance(w,22.1);}for(const u of w.units)for(const value of [u.x,u.z,u.hp,u.hunger,u.fear])assert.ok(Number.isFinite(value),`${key} ${u.key}: ${value}`);for(const p of w.commanders)assert.ok(Number.isFinite(p.hp));}
});
