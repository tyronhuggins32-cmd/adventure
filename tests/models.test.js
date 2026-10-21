import test from 'node:test';import assert from 'node:assert/strict';
import {COMMANDERS} from '../kingdom-clash/commanders.js';
import {cards} from '../kingdom-clash/lanes.js';
import {modelFor,modelMarkup,ATLASES} from '../kingdom-clash/model-assets.js';
import {projectPoint,pickField,FIELD_SCALE} from '../kingdom-clash/scene-math.js';
import fs from 'node:fs';
test('every commander and every creature/building has a bounded painted model',()=>{for(const[id,c]of Object.entries(COMMANDERS)){const leader=modelFor({id},c.territory);assert.ok(leader);for(const card of cards(c.territory,id).filter(c=>c.type!=='spell')){const m=modelFor(card,c.territory);assert.ok(m,card.name);assert.ok(m.index>=0&&m.index<m.cols*m.rows,card.name);assert.ok(modelMarkup(card,c.territory).includes(m.url));}}for(const a of Object.values(ATLASES))assert.ok(fs.statSync(new URL(a.url)).size>10000)});
test('doubled world projection picks all eight field centers and rejects outside points',()=>{assert.equal(FIELD_SCALE,2);assert.deepEqual(projectPoint(1,1),{x:710,y:400});for(let side=0;side<2;side++)for(let lane=0;lane<4;lane++){const p=projectPoint(lane+.5,(side?0:1)+.5);assert.deepEqual(pickField(p.x,p.y),{side,lane})}const p=projectPoint(-.5,1);assert.equal(pickField(p.x,p.y),null)});
