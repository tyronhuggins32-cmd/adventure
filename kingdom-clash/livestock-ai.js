import {distance} from './world-layout.js?v=harvest4';
export const isLivestock=c=>['pig','sheep','cow','bull'].includes(c?.behavior);
export const isFoodCreature=c=>c?.type==='creature'&&(c.foodBased===true||/turnip|corn|kernel|carrot|pumpkin|cabbage|potato|fruit|berry|mushroom/i.test(c.name||''));
// Returns true when the animal owns this frame instead of ordinary combat.
export function livestockStep(sim,a,alive,dt){
 const species=a.card.behavior;if(!isLivestock(a.card))return false;
 const enemies=alive.filter(b=>b.side!==a.side&&sim.health(b)>0).sort((b,c)=>distance(a,b)-distance(a,c));
 const allies=alive.filter(b=>b!==a&&b.side===a.side&&sim.health(b)>0&&isLivestock(b.card));
 const threat=enemies.find(b=>!isFoodCreature(b.card)&&distance(a,b)<(species==='pig'?7:6));
 if((species==='pig'||species==='sheep')&&threat){
  const barn=sim.structures.find(b=>b.side===a.side&&b.card.effect==='barn'&&sim.health(b)>0);
  const dx=a.x-threat.x,dy=a.y-threat.y,n=Math.hypot(dx,dy)||1;
  sim.move(a,barn||{x:Math.max(.1,Math.min(3.9,a.x+dx/n*.4)),y:Math.max(.1,Math.min(1.9,a.y+dy/n*.4))},dt);a.state='flee';return true;
 }
 if(species==='pig'){
  const prey=enemies.find(b=>isFoodCreature(b.card));
  if(prey){if(distance(a,prey)>2)sim.move(a,prey,dt);else{a.vx=a.vy=0;a.state='root';if((a.eatAt||0)<=sim.time){a.eatAt=sim.time+4;prey.card.health=0;a.card.health=Math.min(a.card.hp,a.card.health+2);a.feedUntil=sim.time+1;sim.s.wave.stats.kills++;sim.event('feed',a,prey,{healed:2});sim.event('defeat',prey);sim.cleanLivestock();}}return true;}
  a.state='forage';a.vx=a.vy=0;return true;
 }
 if(species==='sheep'){
  const friend=allies.sort((b,c)=>distance(a,b)-distance(a,c))[0];
  if(friend&&distance(a,friend)>3)sim.move(a,friend,dt);else{a.state='graze';a.vx=a.vy=0;const f=sim.s.players[a.side].lanes[a.lane].field;if(f.food&&a.card.health<a.card.hp&&(a.grazeAt||0)<=sim.time){f.food--;a.card.health++;a.grazeAt=sim.time+4;sim.event('healing',a,a);}}return true;
 }
 if(species==='cow'&&(a.milkAt||0)<=sim.time){const hurt=[a,...allies].find(b=>distance(a,b)<8&&b.card.health<b.card.hp);if(hurt){hurt.card.health++;a.milkAt=sim.time+5;sim.event('healing',a,hurt);}}
 if(species==='cow'&&!enemies.some(b=>distance(a,b)<6)){const herd=allies.sort((b,c)=>distance(a,b)-distance(a,c))[0];if(herd&&distance(a,herd)>4){sim.move(a,herd,dt);a.state='herd';return true;}a.vx=a.vy=0;a.state='graze';return true;}
 if(species==='bull'&&enemies.length){const target=enemies[0];if(distance(a,target)>a.profile.reach&&(a.chargeAt||0)<=sim.time){a.charging=true;a.profile.speed=6;}else a.profile.speed=4.2;}
 return false;
}
