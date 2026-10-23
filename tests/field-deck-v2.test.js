import test from 'node:test';
import assert from 'node:assert/strict';
import {createFieldDeck,selectLandscape,placeLandscape,canStart,lockField,applyField,LANDSCAPES} from '../kingdom-clash/tabletop-v2/field-deck.js';
import {makeWorld} from '../kingdom-clash/reborn/rules.js';
import {makeMiniature} from '../kingdom-clash/tabletop-v2/miniatures.js';
import * as T from '../kingdom-clash/vendor/three.js';
import {projectCanvasPoint,pickCanvasLane,fitTableDistance,TABLE_SCALE} from '../kingdom-clash/tabletop-v2/board.js';

test('four physical landscape slots consume cards and permit replacement before lock',()=>{
 const field=createFieldDeck();assert.equal(canStart(field),false);assert.equal(lockField(field),false);
 for(let i=0;i<4;i++){assert.ok(selectLandscape(field,0));assert.ok(placeLandscape(field,i));}
 assert.deepEqual(field.slots,['corn','corn','blue','blue']);assert.equal(field.cards.length,4);
 assert.ok(selectLandscape(field,0));assert.ok(placeLandscape(field,0));assert.equal(field.slots[0],'swamp');assert.equal(field.cards.length,4);assert.ok(field.cards.includes('corn'));
 assert.ok(canStart(field));assert.ok(lockField(field));assert.equal(selectLandscape(field,0),false);assert.equal(placeLandscape(field,0),false);
});
test('placed terrain changes the simulation field and leaves the rival field independent',()=>{
 const field=createFieldDeck();field.slots=['corn','swamp','ice','blue'];const world=applyField(makeWorld('blue'),field);
 assert.deepEqual(world.lanes.map(l=>l.terrain),field.slots);assert.equal(world.lanes[0].crop,.75);assert.equal(world.lanes[1].mud,8);assert.equal(world.lanes[3].crop,0);assert.ok(world.lanes.every(l=>l.enemyTerrain==='corn'));
 assert.equal(Object.keys(LANDSCAPES).length,6);
});
test('the new miniature factory returns dimensional pig and distinct battle figures',()=>{
 for(const key of ['pig','dog','wolf','sheep','husker','archer','barn','cornfield','silo']){const model=makeMiniature(key);assert.ok(model.children.length>0,key);assert.ok(model.children.some(child=>child.isMesh||child.children.length),key);}
 const pig=makeMiniature('pig');assert.ok(pig.children.length>=15);assert.equal(pig.userData.legs.length,4);assert.ok(pig.userData.head);assert.ok(pig.userData.tail);
});
test('camera projection maps a tapped lane back to that lane after orbit, zoom and pan',()=>{
 for(const yaw of [0,.2,-.6,.78])for(const zoom of [22,36,49]){
  const camera={yaw,pitch:.69,zoom,x:2.4,z:-1};for(let lane=0;lane<4;lane++){
   const point=projectCanvasPoint((lane-1.5)*5.65,5.6,1360,610,camera);
   assert.equal(pickCanvasLane(...point,1360,610,camera),lane,`${yaw} ${zoom} ${lane}`);
  }
 }
});
test('focused canvas lane shows both armies and keeps taps aligned',()=>{
 const camera={yaw:0,pitch:.42,zoom:8,x:(1-1.5)*5.65,z:0,focused:1};
 for(const z of[-5.65,5.65]){
  const point=projectCanvasPoint(camera.x,z,375,740,camera);
  assert.ok(point[0]>0&&point[0]<375&&point[1]>90&&point[1]<690,`${z}: ${point}`);
  assert.equal(pickCanvasLane(...point,375,740,camera),1);
 }
});
test('the 3D camera frames all four tabletop edges on phone and desktop screens',()=>{
 assert.equal(TABLE_SCALE,2);
 for(const [width,height] of [[375,740],[320,568],[768,540],[1280,680]])for(const yaw of [0,.57,-.6]){
  const distance=fitTableDistance(width,height,yaw,.69);
  const camera=new T.PerspectiveCamera(height>width?56:46,width/height,.1,500);
  const direction=new T.Vector3(Math.sin(yaw)*.32,Math.sin(.69),Math.cos(yaw)*.86).normalize();
  camera.position.copy(direction.multiplyScalar(distance));camera.lookAt(0,0,0);camera.updateMatrixWorld();
  for(const x of[-13.8,13.8])for(const y of[-.75,4.4])for(const z of[-12.5,12.5]){
   const point=new T.Vector3(x,y,z).multiplyScalar(TABLE_SCALE).project(camera);
   assert.ok(Math.abs(point.x)<.861&&Math.abs(point.y)<.861,`${width}×${height} yaw ${yaw}: ${point.x}, ${point.y}`);
  }
 }
});
