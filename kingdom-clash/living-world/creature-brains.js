import {distance,clamp,HALF} from './terrain.js?v=world9';
const crop=c=>c.kind==='corn'&&c.food>0;
const nearby=(world,e,fn,r=Infinity)=>world.closest(e,fn,r);
const fight=(w,e,target,dt,reach=e.card.ranged?27:target.radius+2.5)=>{
 const d=distance(e,target);if(d<=reach){e.vx=e.vz=0;e.state=e.card.ranged?'aim':'guard';if(e.cooldown<=0)w.attack(e,target);}
 else{e.state='walk';e.charging=e.card.behavior==='bull'&&d<20&&e.cooldown<=0;w.move(e,target,dt,target.card.type==='building'?.25:reach-1);}
};
const wander=(w,e,dt,around=null,radius=12)=>{if(w.time>e.decisionAt||e.state==='blocked'){e.decisionAt=w.time+3+w.random()*4;const anchor=around||e;e.wander={x:clamp(anchor.x+(w.random()-.5)*radius*2,-HALF+8,HALF-8),z:clamp(anchor.z+(w.random()-.5)*radius*2,-HALF+8,HALF-8)};}e.state='patrol';if(e.wander)w.move(e,e.wander,dt,1);};
const herd=e=>['pig','sheep','cow','bull'].includes(e.card.behavior);
export function actCreature(w,e,dt,threat){
 const id=e.card.id,behavior=e.card.behavior;
 if(behavior==='pig'){
  const prey=nearby(w,e,o=>o.side!==e.side&&o.card.type==='creature'&&/corn|kernel|turnip|carrot|pumpkin/i.test(o.card.name)&&!o.inside,45);
  if(prey){e.state='forage';if(distance(e,prey)<3){e.state='feed';e.vx=e.vz=0;if(e.cooldown<=0){w.hurt(prey,prey.hp,e);e.hp=Math.min(e.maxHp,e.hp+3);e.cooldown=4;}}else w.move(e,prey,dt,2);return true;}
  let closest=null,shortest=Infinity;for(const c of w.terrain.cells)if(c.owner!==e.side&&crop(c)&&w.terrain.walkable(c.x,c.z,w.structures)){const d=distance(e,c);if(d<shortest){shortest=d;closest=c;}}
  if(closest){e.state='root';if(w.move(e,closest,dt,2.8)&&e.cooldown<=0){closest.food=0;closest.kind='bare';w.terrain.version++;e.cooldown=1;e.hunger=Math.max(0,e.hunger-20);e.hp=Math.min(e.maxHp,e.hp+1);}}else wander(w,e,dt);return true;
 }
 if(behavior==='crow'){
  const guardian=nearby(w,e,o=>o.side!==e.side&&o.card.id==='scarecrow',28);
  if(guardian){e.state='spooked';e.morale=Math.max(0,e.morale-20*dt);const dx=e.x-guardian.x,dz=e.z-guardian.z,n=Math.hypot(dx,dz)||1;w.move(e,{x:clamp(e.x+dx/n*30,-HALF+8,HALF-8),z:clamp(e.z+dz/n*30,-HALF+8,HALF-8)},dt,2);return true;}
  let patch=null,best=Infinity;for(const c of w.terrain.cells)if(c.owner!==e.side&&crop(c)){const d=distance(e,c);if(d<best){best=d;patch=c;}}
  if(patch){e.state='raiding';if(w.move(e,patch,dt,2.5)&&e.cooldown<=0){patch.food=Math.max(0,patch.food-1);if(!patch.food)patch.kind='bare';e.hunger=Math.max(0,e.hunger-25);e.cooldown=2;w.terrain.version++;}}else wander(w,e,dt);return true;
 }
 if(behavior==='scarecrow'){
  const crow=nearby(w,e,o=>o.side!==e.side&&o.card.behavior==='crow',32);if(crow){e.state='scaring crows';e.action=.4;crow.morale=Math.max(0,crow.morale-8*dt);if(distance(e,crow)<10&&e.cooldown<=0)w.attack(e,crow);else if(distance(e,crow)>16)w.move(e,crow,dt,13);return true;}
  const farm=nearby(w,e,o=>o.side===e.side&&o.card.id==='farm',55);const raider=nearby(w,e,o=>o.side!==e.side&&o.card.type==='creature'&&!o.inside,18);if(raider){fight(w,e,raider,dt);return true;}wander(w,e,dt,farm||e,22);return true;
 }
 if(behavior==='sheep'||behavior==='cow'){
  if(behavior==='cow'&&e.cooldown<=0){const hurt=nearby(w,e,o=>o.side===e.side&&herd(o)&&o.hp<o.maxHp,12);if(hurt){hurt.hp=Math.min(hurt.maxHp,hurt.hp+2);e.cooldown=5;e.state='nursing';}}
  const pack=nearby(w,e,o=>o.side===e.side&&herd(o));if(pack&&distance(e,pack)>8){e.state='flock';w.move(e,pack,dt,6);}else{const barn=nearby(w,e,o=>o.side===e.side&&o.card.id==='barn',45);wander(w,e,dt,barn||e,10);}
  if(behavior==='cow'&&threat&&distance(e,threat)<4&&e.cooldown<=0)w.attack(e,threat);return true;
 }
 if(behavior==='wolf'){
  const pack=w.entities.filter(o=>o!==e&&o.hp>0&&o.side===e.side&&o.card.behavior==='wolf'&&!o.inside);
  const prey=nearby(w,e,o=>o.side!==e.side&&!o.inside&&o.card.type!=='building',30);
  if(prey){e.state='hunting';fight(w,e,prey,dt);return true;}
  const mate=pack.sort((a,b)=>distance(e,a)-distance(e,b))[0];if(mate&&distance(e,mate)>8){e.state='huddling';w.move(e,mate,dt,5);return true;}
  const den=nearby(w,e,o=>o.side===e.side&&o.card.id==='iceDen',75);wander(w,e,dt,mate||den||e,8);e.state='huddling';return true;
 }
 if(behavior==='bull'){
  const herdThreat=nearby(w,e,o=>o.side!==e.side&&!o.inside&&w.entities.some(a=>a.hp>0&&a.side===e.side&&herd(a)&&distance(a,o)<14),34);
  if(herdThreat){e.state='protecting herd';fight(w,e,herdThreat,dt);return true;}
  const friend=nearby(w,e,o=>o.side===e.side&&herd(o),60);if(friend&&distance(e,friend)>12){e.state='guarding herd';w.move(e,friend,dt,9);return true;}
 }
 if(id==='dog'){
  const protectedOne=nearby(w,e,o=>o.side===e.side&&(o.card.type==='commander'||herd(o)),40);const raider=nearby(w,e,o=>o.side!==e.side&&!o.inside&&(!protectedOne||distance(o,protectedOne)<24),24);
  if(raider){e.state='intercepting';fight(w,e,raider,dt);return true;}
  if(protectedOne){for(const a of w.entities)if(a.side===e.side&&herd(a)&&distance(a,e)<11)a.morale=Math.min(100,a.morale+3*dt);wander(w,e,dt,protectedOne,15);return true;}
 }
 if(id==='scholar'){
  const school=nearby(w,e,o=>o.side===e.side&&o.card.id==='school',90);if(school&&!w.knowledge[e.side].has('revive')){e.state='seeking school';const goal=w.nearbyPoint(e,school);if(w.move(e,goal,dt,2)){e.order={kind:'study',target:school};e.inside=school.id;}return true;}
  const wounded=nearby(w,e,o=>o.side===e.side&&o.hp<o.maxHp&&o.card.type==='creature',20);if(wounded&&e.cooldown<=0){wounded.hp=Math.min(wounded.maxHp,wounded.hp+1);e.cooldown=6;e.state='assisting';return true;}
 }
 if(id==='archer'){
  const enemy=nearby(w,e,o=>o.side!==e.side&&!o.inside,39);if(enemy){if(distance(e,enemy)<12){e.state='retreating';const dx=e.x-enemy.x,dz=e.z-enemy.z,n=Math.hypot(dx,dz)||1;w.move(e,{x:clamp(e.x+dx/n*16,-HALF+8,HALF-8),z:clamp(e.z+dz/n*16,-HALF+8,HALF-8)},dt,1);}else fight(w,e,enemy,dt);return true;}
  const tower=nearby(w,e,o=>o.side===e.side&&o.card.id==='tower',85);if(tower){wander(w,e,dt,tower,20);return true;}
 }
 if(id==='guard'){
  const corn=nearby(w,e,o=>o.side===e.side&&o.card.type==='building'&&o.card.id==='farm',65),raider=nearby(w,e,o=>o.side!==e.side&&!o.inside,35);
  if(raider){fight(w,e,raider,dt);return true;}if(corn){wander(w,e,dt,corn,22);return true;}
 }
 if(id==='maize'){
  const cropNear=w.terrain.cells.find(c=>c.owner===e.side&&crop(c)&&distance(c,e)<10);if(cropNear&&e.hp<e.maxHp&&e.cooldown<=0){e.hp=Math.min(e.maxHp,e.hp+2);e.cooldown=4;e.state='rooted';}
 }
 return false;
}
