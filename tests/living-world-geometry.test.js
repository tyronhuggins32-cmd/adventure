import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../kingdom-clash/vendor/three.js';
import {createTabletop} from '../kingdom-clash/living-world/scenario.js';
import {buildWorldGeometry} from '../kingdom-clash/living-world/world-geometry.js';
import {miniatureCard,miniatureScale} from '../kingdom-clash/living-world/view.js';
import {createModel,animateModel,disposeModel} from '../kingdom-clash/model-3d.js';
import {programFor} from '../kingdom-clash/entity-programs.js';

test('the playable opening occupies a shared 288 unit world with real models',()=>{
 const world=createTabletop();
 assert.equal(world.paused,true);
 assert.ok(world.entities.filter(e=>!e.side).length>8);
 for(const entity of world.entities){
  assert.ok(world.terrain.walkable(entity.x,entity.z,world.structures,entity));
  const card=miniatureCard(entity.card),model=createModel(card,entity.side?'medieval':'farm');
  model.scale.setScalar(miniatureScale(entity));
  animateModel(model,{clock:1,program:programFor(card),moving:true,vx:1,vy:1,activity:.5,action:'attack'});
  const bounds=new T.Box3().setFromObject(model);
  for(const point of [bounds.min,bounds.max])assert.ok([point.x,point.y,point.z].every(Number.isFinite));
  assert.ok(bounds.max.y>1);disposeModel(model);
 }
});
test('physical crops disappear when pigs consume terrain and fire appears at its world coordinates',()=>{
 const world=createTabletop(),geometry=buildWorldGeometry(world.terrain),matrix=new T.Matrix4();
 const cell=world.terrain.cells.find(c=>c.kind==='corn'&&c.food>0);
 geometry.stalks.getMatrixAt(cell.i*6,matrix);assert.ok(matrix.elements[5]>0);
 cell.food=0;cell.kind='bare';world.terrain.version++;geometry.update(1);
 geometry.stalks.getMatrixAt(cell.i*6,matrix);assert.equal(matrix.elements[5],0);
 cell.fire=5;geometry.update(2,true);geometry.fire.getMatrixAt(cell.i,matrix);
 assert.equal(matrix.elements[12],cell.x);assert.equal(matrix.elements[14],cell.z);assert.equal(matrix.elements[0],1);
 geometry.dispose();
});
