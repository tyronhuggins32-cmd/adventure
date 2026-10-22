import test from 'node:test';
import assert from 'node:assert/strict';
import {LivingWorld} from '../kingdom-clash/living-world/simulation.js';
import {Terrain,SIZE} from '../kingdom-clash/living-world/terrain.js';
import {playCard,cardLock} from '../kingdom-clash/living-world/card-actions.js';
import {createTabletop} from '../kingdom-clash/living-world/scenario.js';
const run=(w,seconds)=>{w.paused=false;for(let i=0;i<seconds*20;i++)w.step(.05);};
const world=()=>new LivingWorld({rival:false});
test('the enlarged world includes farms, ice, woods, bridges, and an intact route between kingdoms',()=>{
 const t=new Terrain(42);assert.equal(SIZE,288);assert.equal(t.cells.length,48*48);
 for(const kind of ['snow','grove','water','corn','meadow'])assert.ok(t.cells.some(c=>c.kind===kind),kind);
 assert.ok(t.path({x:-100,z:100},{x:-100,z:-100}).length>0);
});
test('farmer walks to an underfed crop and tends it when idle',()=>{
 const w=world(),farmer=w.entities[0],farm=w.spawn('farm',0,-65,96),c=w.terrain.cell(-60,90);c.kind='corn';c.food=0;c.owner=0;
 // Keep the farm's regular harvest out of the way to observe the commander tending.
 farm.cooldown=100;run(w,8);assert.ok(c.food>0);assert.ok(Math.hypot(farmer.x+64,farmer.z-102)>2);
});
test('a barn sheep reveals a playable cotton card, whose ball flies before damaging nearby foes',()=>{
 const w=world(),barn=w.spawn('barn',0,60,80),enemy=w.spawn('dog',1,72,45),second=w.spawn('dog',1,75,46);
 assert.match(cardLock(w,'cotton'),/sheep/);w.spawn('sheep',0,61,73);assert.equal(cardLock(w,'cotton'),null);assert.ok(w.hand.includes('cotton'));
 const result=playCard(w,'cotton',72,45);assert.equal(result.ok,true);assert.equal(enemy.hp,enemy.maxHp);assert.equal(second.hp,second.maxHp);assert.ok(w.projectiles.some(p=>p.cotton));
 run(w,3);assert.ok(enemy.hp<enemy.maxHp);assert.ok(second.hp<second.maxHp);
 w.hurt(barn,100);assert.match(cardLock(w,'cotton'),/Barn/);
});
test('scarecrow drives raiding crows off crops and its corn maze routes around walls before expiring',()=>{
 const w=world(),farm=w.spawn('farm',0,-80,80),crow=w.spawn('crow',1,-91,83);
 const before=crow.x;w.spawn('scarecrow',0,-80,83);assert.ok(w.hand.includes('cornmaze'));run(w,2);assert.ok(crow.x<before);assert.equal(crow.state,'spooked');
 const use=playCard(w,'cornmaze',-50,-20);assert.equal(use.ok,true);const wall=w.terrain.cells.find(c=>c.kind==='mazeWall');assert.ok(wall);assert.equal(w.terrain.walkable(wall.x,wall.z),false);
 const time=w.time;w.terrain.expireMaze(time+29);assert.equal(w.terrain.cells.some(c=>c.mazeUntil),false);assert.equal(w.terrain.walkable(wall.x,wall.z),true);
 w.hurt(farm,100); // knowledge persists, but the living scarecrow is the casting condition.
});
test('three snow wolves huddle in their ice den and each companion increases bite damage',()=>{
 const w=world(),den=w.spawn('iceDen',1,-95,-85),wolf=w.spawn('wolf',1,-91,-70),mate=w.spawn('wolf',1,-85,-70),third=w.spawn('wolf',1,-88,-78);
 run(w,1);assert.ok(['huddling','hunting'].includes(wolf.state));assert.ok(w.terrain.cell(wolf.x,wolf.z).kind==='snow');
 const prey=w.spawn('dog',0,-88,-71);const hp=prey.hp;w.attack(wolf,prey);assert.equal(hp-prey.hp,7);assert.equal(wolf.packBonus,4);
 w.hurt(mate,100);w.hurt(third,100);const other=w.spawn('dog',0,-91,-70);w.attack(wolf,other);assert.equal(other.maxHp-other.hp,3);assert.equal(wolf.packBonus,0);
});
test('opening scene contains both a sheep powered barn and a pack in the snowy region',()=>{
 const w=createTabletop();assert.ok(w.hand.includes('cotton'));assert.ok(w.hand.includes('cornmaze'));assert.equal(w.entities.filter(e=>e.card.id==='wolf').length,3);assert.equal(w.terrain.cells.length,2304);
});
