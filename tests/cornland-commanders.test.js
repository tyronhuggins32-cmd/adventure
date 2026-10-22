import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../kingdom-clash/vendor/three.js';
import {createTabletop} from '../kingdom-clash/living-world/scenario.js';
import {LivingWorld} from '../kingdom-clash/living-world/simulation.js';
import {card,CARDS} from '../kingdom-clash/living-world/catalog.js';
import {cardLock,playCard} from '../kingdom-clash/living-world/card-actions.js';
import {createCornlandBuilding,animateCornlandBuilding,CORNLAND_BUILDINGS} from '../kingdom-clash/living-world/cornland-models.js';
import {CORNLAND_COMMANDERS} from '../kingdom-clash/living-world/commander-rules.js';
const run=(w,s)=>{w.paused=false;for(let i=0;i<s*20;i++)w.step(.05);};

test('all three Cornlands leaders start with distinct functioning buildings, hands and models',()=>{
 for(const id of Object.keys(CORNLAND_COMMANDERS)){
  const w=createTabletop(42,id);assert.equal(w.entities[0].card.id,id);assert.equal(w.hand.length,8);assert.ok(w.entities.some(e=>e.side===0&&e.card.type==='building'));
  for(const e of w.entities.filter(e=>e.side===0&&e.card.type==='building'))assert.ok(w.terrain.walkable(e.x,e.z,w.structures,e));
  assert.equal(cardLock(w,CORNLAND_COMMANDERS[id].buildings[0]),null);
  for(const other of Object.keys(CORNLAND_COMMANDERS).filter(x=>x!==id))assert.match(cardLock(w,CORNLAND_COMMANDERS[other].buildings[0]),/different Cornlands/);
 }
});
test('Scarecrow patrols toward its roost without dropping the final path segment',()=>{
 const w=createTabletop(42,'scarecrow'),e=w.entities[0];run(w,5);assert.ok(Math.hypot(e.x+64,e.z-102)>1.5);assert.notEqual(e.state,'blocked');
});
test('commander powers change terrain and entity state, with a real cooldown',()=>{
 const farmer=createTabletop(),f=farmer.entities[0],sheep=farmer.spawn('sheep',0,-62,97);sheep.hp-=8;
 assert.equal(farmer.command(f.id,'ability').ok,true);assert.ok(sheep.hp>sheep.maxHp-8);assert.equal(farmer.command(f.id,'ability').ok,false);
 const scare=createTabletop(42,'scarecrow'),crow=scare.entities.find(e=>e.side===1&&e.card.id==='crow');
 // Bring a crow within hearing range to show the fear impulse.
 crow.x=scare.entities[0].x+8;crow.z=scare.entities[0].z;
 assert.equal(scare.command(scare.entities[0].id,'ability').ok,true);assert.ok(crow.scaredUntil>0);
 const druid=createTabletop(42,'cornDruid'),d=druid.entities[0],target=druid.terrain.cell(d.x+6,d.z);
 target.kind='bare';assert.equal(druid.command(d.id,'ability').ok,true);assert.equal(target.kind,'corn');
});
test('farm production chains are finite and consume food, while the mill turns crops into rations',()=>{
 const w=new LivingWorld({rival:false}),farm=w.spawn('farm',0,-70,90),barn=w.spawn('barn',0,-55,87),mill=w.spawn('mill',0,-70,78);
 run(w,40);assert.ok(w.entities.some(e=>e.card.id==='sheep'&&e.side===0));assert.ok(w.knowledge[0].has('cotton')||w.entities.some(e=>e.card.id==='sheep'));
 assert.ok(w.grain[0]>=0&&w.grain[0]<=25);assert.ok(w.entities.filter(e=>e.side===0&&['sheep','pig','cow'].includes(e.card.id)).length<=6);
 assert.equal(farm.hp>0&&barn.hp>0&&mill.hp>0,true);
});
test('seed slinger projects damage, plants at impact, and cart charges buildings and drops debris',()=>{
 const w=new LivingWorld({rival:false}),slinger=w.spawn('seedSlinger',0,-30,20),foe=w.spawn('dog',1,-30,-5);
 run(w,4);assert.ok(w.projectiles.some(p=>p.seedPod)||foe.hp<foe.maxHp);
 run(w,3);assert.ok(foe.hp<foe.maxHp);assert.equal(w.terrain.cell(foe.x,foe.z).kind,'corn');
 const siege=new LivingWorld({rival:false}),cart=siege.spawn('cart',0,-25,22),fort=siege.spawn('tower',1,-25,-30);run(siege,4);
 assert.ok(siege.terrain.cells.some(c=>c.kind==='debris'));assert.ok(cart.z<22);assert.ok(fort.hp>0);
});
test('scarecrow and druid buildings generate specialized inhabitants and area effects',()=>{
 const s=new LivingWorld({rival:false,commanderId:'scarecrow'});const roost=s.spawn('crowRoost',0,-70,90),silo=s.spawn('hauntedSilo',0,-55,86);s.terrain.paint(-67,87,'corn',20,0);run(s,28);
 assert.ok(s.entities.some(e=>e.card.id==='crow'&&e.side===0));assert.ok(s.entities.some(e=>e.card.id==='straw'&&e.side===0));
 const d=new LivingWorld({rival:false,commanderId:'cornDruid'});d.spawn('seedShrine',0,-70,90);d.spawn('elderGrove',0,-50,85);d.spawn('rootCircle',0,-80,65);run(d,30);
 assert.ok(d.entities.some(e=>e.card.id==='kernel'&&e.side===0));assert.ok(d.entities.some(e=>e.card.id==='ent'&&e.side===0));
 const enemy=d.spawn('dog',1,-80,68);run(d,7);assert.ok(enemy.slowUntil>d.time-7);
});
test('six reference inspired 3D buildings have distinct volumes and animated mechanisms',()=>{
 const names=['farm','barn','mill','seedSlinger','livestockPen','harvestCart'];
 for(const id of names){const g=createCornlandBuilding(card(id));assert.ok(g);
  const bounds=new T.Box3().setFromObject(g),size=bounds.getSize(new T.Vector3());assert.ok(size.x>2&&size.y>1.5&&size.z>2,id);
  assert.ok([...g.children].some(o=>o.isMesh||o.isGroup));animateCornlandBuilding(g,10);assert.ok(Number.isFinite(bounds.max.y));
 }
 assert.equal(CORNLAND_BUILDINGS.length,13);const mill=createCornlandBuilding(card('mill')),sails=mill.userData.mechanism.sails;
 animateCornlandBuilding(mill,0);const before=sails.rotation.z;animateCornlandBuilding(mill,1);assert.notEqual(sails.rotation.z,before);
});
