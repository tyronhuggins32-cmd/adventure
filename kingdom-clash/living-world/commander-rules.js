import {distance,clamp,HALF} from './terrain.js?v=world10';

export const CORNLAND_COMMANDERS={
 farmer:{name:'The Farmer',description:'Tends crops, rallies livestock and turns a harvest into supplies.',ability:'Harvest Rally',cooldown:22,buildings:['farm','barn','mill','seedSlinger','livestockPen','harvestCart'],opening:['cotton','cornmaze','pig','mill','seedSlinger','livestockPen','harvestCart','corn']},
 scarecrow:{name:'Scarecrow',description:'Watches the fields, frightens raiders and coordinates crows and straw ambushers.',ability:'Dread Call',cooldown:20,buildings:['crowRoost','briarSnare','hauntedSilo'],opening:['cornmaze','crowRoost','briarSnare','hauntedSilo','crow','straw','corn','reclaim']},
 cornDruid:{name:'The Corn Druid',description:'Roots itself in living corn, raises seed guardians and restores wounded allies.',ability:'Rootwake',cooldown:24,buildings:['seedShrine','rootCircle','elderGrove'],opening:['seedShrine','rootCircle','elderGrove','kernel','ent','corn','rain','reclaim']}
};

export function commanderAbility(world,e){
 if(world.time<(e.abilityAt||0))return {ok:false,reason:`${e.card.name} can act again in ${Math.ceil(e.abilityAt-world.time)} seconds`};
 const side=e.side,id=e.card.id;
 if(id==='farmer'){
  const crop=world.terrain.cells.filter(c=>c.owner===side&&c.kind==='corn'&&c.food>=2&&distance(c,e)<35).sort((a,b)=>distance(a,e)-distance(b,e))[0];
  if(!crop)return {ok:false,reason:'Harvest Rally needs ripe friendly corn nearby'};
  crop.food-=2;world.terrain.version++;
  for(const ally of world.entities)if(ally.hp>0&&ally.side===side&&distance(ally,e)<30){ally.hp=Math.min(ally.maxHp,ally.hp+4);ally.morale=Math.min(100,ally.morale+15);ally.rallyUntil=world.time+12;}
  world.energy[side]=Math.min(10,world.energy[side]+1);world.note('The Farmer harvests corn and rallies the herd.');
 }else if(id==='scarecrow'){
  for(const enemy of world.entities)if(enemy.hp>0&&enemy.side!==side&&distance(enemy,e)<30){enemy.morale=Math.max(0,enemy.morale-45);enemy.scaredUntil=world.time+9;enemy.pathAt=0;}
  for(const ally of world.entities)if(ally.hp>0&&ally.side===side&&ally.card.behavior==='crow'&&distance(ally,e)<35){ally.morale=100;ally.rallyUntil=world.time+12;}
  world.note('The Scarecrow calls a murder of crows and the raiders scatter.');
 }else if(id==='cornDruid'){
  world.terrain.paint(e.x,e.z,'corn',18,side);
  for(const ally of world.entities)if(ally.hp>0&&ally.side===side&&distance(ally,e)<22){ally.hp=Math.min(ally.maxHp,ally.hp+3);ally.rootedUntil=world.time+12;}
  for(const enemy of world.entities)if(enemy.hp>0&&enemy.side!==side&&distance(enemy,e)<20){enemy.slowUntil=world.time+8;enemy.morale=Math.max(0,enemy.morale-12);}
  world.note('The Corn Druid wakes the roots beneath both armies.');
 }else return {ok:false,reason:'This commander has no Cornlands power'};
 e.abilityAt=world.time+CORNLAND_COMMANDERS[id].cooldown;e.action=.9;world.version++;return {ok:true};
}

export function actCommander(world,e,dt){
 const threat=world.closest(e,o=>o.side!==e.side&&!o.inside,14);
 if(threat&&e.cooldown<=0){world.attack(e,threat);return;}
 if(e.side===1){const farm=world.closest(e,o=>o.side===e.side&&o.card.id==='farm',80);if(farm&&distance(e,farm)>17){e.state='guarding realm';world.move(e,world.nearbyPoint(e,farm),dt,4);}return;}
 if(e.card.id==='farmer'){
  const wounded=world.closest(e,o=>o.side===e.side&&o.card.type==='creature'&&o.hp<o.maxHp,14);
  if(wounded&&e.cooldown<=0){wounded.hp=Math.min(wounded.maxHp,wounded.hp+2);e.cooldown=5;e.action=.5;e.harvestUntil=world.time+.5;e.state='harvest';return;}
  const farm=world.closest(e,o=>o.side===e.side&&o.card.id==='farm',95);let crop=null,best=Infinity;
  if(farm)for(const c of world.terrain.cells)if(c.owner===e.side&&c.kind==='corn'&&c.food<4&&distance(c,farm)<19&&distance(e,c)<42){const d=distance(e,c);if(d<best){best=d;crop=c;}}
  if(crop){e.state='tending crops';if(world.move(e,crop,dt,2.5)&&e.cooldown<=0){crop.food=Math.min(4,crop.food+1);world.terrain.version++;e.cooldown=2;e.action=.4;e.harvestUntil=world.time+.4;e.state='harvest';e.vx=e.vz=0;}}
  else if(farm&&distance(e,farm)>17){e.state='returning to farm';world.move(e,world.nearbyPoint(e,farm),dt,4);}return;
 }
 if(e.card.id==='scarecrow'){
  const crow=world.closest(e,o=>o.side!==e.side&&o.card.behavior==='crow',35);
  if(crow){crow.scaredUntil=world.time+4;crow.morale=Math.max(0,crow.morale-15*dt);e.state='watching crows';e.action=.25;return;}
  const intruder=world.closest(e,o=>o.side!==e.side&&o.card.type==='creature',18);
  if(intruder){intruder.scaredUntil=world.time+2;e.state='warding fields';return;}
  const roost=world.closest(e,o=>o.side===e.side&&o.card.id==='crowRoost',85);
  if(roost&&distance(e,roost)>16){e.state='patrolling roost';world.move(e,world.nearbyPoint(e,roost),dt,6);}else e.state='watching fields';return;
 }
 if(e.card.id==='cornDruid'){
  const crop=world.terrain.cells.filter(c=>c.owner===e.side&&c.kind==='corn'&&c.food<3&&distance(c,e)<32).sort((a,b)=>distance(a,e)-distance(b,e))[0];
  if(crop){e.state='cultivating';if(world.move(e,crop,dt,3)&&e.cooldown<=0){crop.food=Math.min(4,crop.food+2);world.terrain.version++;e.cooldown=3;e.action=.5;}return;}
  const hurt=world.closest(e,o=>o.side===e.side&&o.hp<o.maxHp&&o.card.type==='creature',27);
  if(hurt){e.state='mending roots';if(world.move(e,hurt,dt,9)&&e.cooldown<=0){hurt.hp=Math.min(hurt.maxHp,hurt.hp+3);e.cooldown=4;e.action=.5;}return;}
  const shrine=world.closest(e,o=>o.side===e.side&&['seedShrine','elderGrove'].includes(o.card.id),90);
  if(shrine&&distance(e,shrine)>17){e.state='circling shrine';world.move(e,world.nearbyPoint(e,shrine),dt,6);}else e.state='listening to roots';
 }
}
