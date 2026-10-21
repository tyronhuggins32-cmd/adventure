import {emit,log,clean} from './lanes.js?v=episode7';
// Deterministic world ticks: rendering never changes health or terrain.
export class Ecosystem{
 constructor(s){this.s=s;this.accumulator=0;s.world??={ticks:0,minutes:0,weather:'clear',history:[]};s.world.weather=s.round%4===0?'rain':s.round%6===0?'drought':'clear';}
 step(dt){this.accumulator+=dt;while(this.accumulator+1e-9>=1){this.accumulator-=1;this.tick();}}
 tick(){const s=this.s;s.world.ticks++;s.world.minutes+=10;for(let side=0;side<2;side++)for(let i=0;i<4;i++){const l=s.players[side].lanes[i],f=l.field,u=l.unit;
 if(f.fire>0){if(s.world.weather==='rain')f.fire=0;else{f.fire--;f.food=Math.max(0,f.food-1);f.integrity=Math.max(0,f.integrity-1);if(u&&!(u.job==='shelter'&&l.building))u.health=Math.max(0,u.health-1);if(l.building)l.building.health=f.integrity?Math.max(0,(l.building.health??l.building.hp)-1):0;if(f.fire===1){const neighbor=s.players[side].lanes[i+1];if(neighbor?.field.kind==='corn'){neighbor.field.fire=2;neighbor.field.kind='ash';log(s,'Fire spreads into landscape '+(i+2)+'.');}}}emit(s,{kind:'terrain',p:side,lane:i,kingdom:s.players[side].kingdom});}
 if(!u)continue;u.needs??={hunger:20,morale:80};u.needs.hunger=Math.min(100,u.needs.hunger+1);const safe=u.job==='shelter'&&l.building;
 if(s.world.ticks%3===0&&f.food>0&&u.needs.hunger>=24){f.food--;u.needs.hunger=Math.max(0,u.needs.hunger-12);u.needs.morale=Math.min(100,u.needs.morale+2);emit(s,{kind:'supply',p:side,lane:i,kingdom:s.players[side].kingdom});}
 if(u.needs.hunger>90&&s.world.ticks%3===0&&!safe){u.health=Math.max(0,u.health-1);u.needs.morale=Math.max(0,u.needs.morale-5);}
 if(s.players[1-side].lanes[i].unit?.fearAura&&!safe){u.needs.morale=Math.max(0,u.needs.morale-8);}else if(safe)u.needs.morale=Math.min(100,u.needs.morale+3);
 }clean(s);}
}
