import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../kingdom-clash/vendor/three.js';
import {createWorld,stepWorld,BIOMES} from '../kingdom-clash/reboot/world.js';
import {fitDistance} from '../kingdom-clash/reboot/table.js';

test('the reboot opens with four populated, distinct physical lanes',()=>{
 const w=createWorld();assert.deepEqual(w.lanes.map(l=>l.biome),BIOMES.map(b=>b.id));
 for(let lane=0;lane<4;lane++)for(let side=0;side<2;side++)assert.ok(w.units.some(u=>u.lane===lane&&u.side===side),`${lane}:${side}`);
 assert.ok(w.buildings.some(b=>b.kind==='barn'));
});
test('pig harvests enemy corn automatically and farmer tends friendly corn',()=>{
 const w=createWorld();w.units=w.units.filter(u=>u.side===0&&['pig','farmer'].includes(u.kind));w.buildings=[];
 w.lanes[0].crop=.2;const enemy=w.lanes[0].enemyCrop;
 for(let i=0;i<600;i++)stepWorld(w,.05);
 assert.ok(w.lanes[0].crop>.2,'farmer grows corn during idle work');
 assert.ok(w.lanes[0].enemyCrop<enemy,'pig finds enemy corn and eats it');
 assert.ok(w.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.z)&&Number.isFinite(u.hp)));
});
test('lane camera fits its raised terrain and buildings on a phone',()=>{
 const aspect=375/575,pitch=.84,yaw=.12;
 for(const lane of[null,0,1,2,3]){
  const d=fitDistance(aspect,lane,yaw,pitch),x=lane===null?0:(lane-1.5)*7.7;
  const c=new T.PerspectiveCamera(54,aspect,.1,250);
  const dir=new T.Vector3(Math.sin(yaw)*.35,Math.sin(pitch),Math.cos(pitch)*.9).normalize();
  c.position.copy(dir.multiplyScalar(d)).add(new T.Vector3(x,0,0));c.lookAt(x,0,0);c.updateMatrixWorld();
  const xs=lane===null?[-17.6,17.6]:[x-3.8,x+3.8];
  for(const xx of xs)for(const z of[-13.6,13.6])for(const y of[-.95,4.25]){
   const p=new T.Vector3(xx,y,z).project(c);
   assert.ok(Math.abs(p.x)<.915&&Math.abs(p.y)<.875,`lane ${lane}: ${p.x},${p.y}`);
  }
 }
});
