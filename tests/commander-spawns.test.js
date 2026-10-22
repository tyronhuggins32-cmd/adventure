import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../kingdom-clash/vendor/three.js';
import {COMMANDERS,COMMANDER_STARTERS} from '../kingdom-clash/commanders.js';
import {createGame,placeCommander,cards,play} from '../kingdom-clash/lanes.js';
import {createModel,animateModel,disposeModel} from '../kingdom-clash/model-3d.js';

test('every commander arrives with a distinct playable school on its chosen lane',()=>{
 const names=new Set();
 for(const [id,profile] of Object.entries(COMMANDERS)){
  const rival=profile.territory==='ice'?'farm':'ice',s=createGame(profile.territory,rival,()=>.42,{commander:id,requirePlacement:true,buildingProgression:true,tabletop:true,episodeWorld:true,starterBuildings:true});
  assert.equal(placeCommander(s,0,2),true,id);assert.equal(s.players[0].ap,3,id);
  const starter=s.players[0].lanes[2].building,expected=cards(profile.territory,id).filter(c=>c.type==='building')[COMMANDER_STARTERS[id]];
  assert.equal(starter.name,expected.name,id);assert.equal(starter.starter,true,id);assert.equal(starter.health,starter.hp,id);
  assert.equal(s.players[0].lanes.filter(l=>l.building).length,1,id);names.add(starter.name);
  assert.equal(placeCommander(s,1,0),true,id);assert.equal(s.phase,'battle',id);
  assert.ok(!s.players[0].hand.some(c=>c.id===starter.id),id+' should not show a duplicate starting card');
  assert.ok(s.players[0].hand.some(c=>c.type==='building'),id);
  const spare=s.players[0].hand.findIndex(c=>c.type==='building');assert.equal(play(s,0,spare,3),true,id);
 }
 assert.equal(names.size,12);
});
test('each arrival set and building has a visible 3D silhouette; Prince sits on his throne',()=>{
 const footprints=new Set();
 for(const [id,profile] of Object.entries(COMMANDERS)){
  const leader=createModel({id,name:profile.name,type:'commander'},profile.territory);
  assert.equal(leader.userData.commanderSpawn,id);
  const bounds=new T.Box3().setFromObject(leader),size=bounds.getSize(new T.Vector3());
  assert.ok(size.x>1.5&&size.y>2&&size.z>1.5,id);
  const starterName=profile.buildings[COMMANDER_STARTERS[id]],building=createModel({id:'b'+COMMANDER_STARTERS[id],name:starterName,type:'building'},profile.territory);
  assert.equal(building.userData.starterBuilding,starterName,id);
  const volume=new T.Box3().setFromObject(building).getSize(new T.Vector3());assert.ok(volume.x>2&&volume.y>1&&volume.z>2,id);
  footprints.add(starterName);
  animateModel(leader,{clock:1.2,program:{stride:6,phase:0},moving:false,vx:0,vy:0,activity:0,action:'idle'},false);
  if(id==='exiledPrince'){
   assert.equal(leader.userData.seated,true);
   assert.ok(leader.userData.spawnAvatar.position.y>.2);
   assert.ok(leader.userData.limbs.slice(0,2).every(limb=>limb.rotation.x<-.9));
   assert.ok(bounds.max.y>2.3);
  }
  if(id==='farmer'){
   assert.equal(leader.userData.customFarmer,true);
   assert.ok(leader.userData.head&&leader.userData.hat&&leader.userData.carrotCompanion);
   animateModel(leader,{clock:2,program:{stride:6,phase:0},moving:false,vx:0,vy:0,activity:.5,action:'harvest',state:'tending crops'},false);
   assert.ok(leader.userData.rig.arms[1].rotation.x<-.1);
  }
  disposeModel(building);disposeModel(leader);
 }
 assert.equal(footprints.size,12);
});
