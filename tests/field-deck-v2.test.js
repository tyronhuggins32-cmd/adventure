import test from 'node:test';
import assert from 'node:assert/strict';
import {createFieldDeck,selectLandscape,placeLandscape,canStart,lockField,applyField,LANDSCAPES} from '../kingdom-clash/tabletop-v2/field-deck.js';
import {makeWorld} from '../kingdom-clash/reborn/rules.js';
import {makeMiniature} from '../kingdom-clash/tabletop-v2/miniatures.js';

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
