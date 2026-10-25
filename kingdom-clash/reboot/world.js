export const BIOMES=[
 {id:'corn',name:'Cornlands',color:'#a6aa55'},
 {id:'blue',name:'Blue Plains',color:'#6da999'},
 {id:'ice',name:'Frozen Lake',color:'#a9c9ca'},
 {id:'swamp',name:'Useless Swamp',color:'#667a59'}
];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const laneX=i=>(i-1.5)*7.7;
const stats={pig:[8,1,1.6],sheep:[6,1,1.05],farmer:[15,2,1.08],husker:[10,2,1.13],dog:[8,2,1.7],scholar:[7,1,.93],wolf:[9,2,1.9],crow:[5,1,1.6],archer:[7,2,1.1],earling:[7,2,1.45]};
let serial=0;
export function createWorld(seed=17){const world={seed,seconds:0,round:1,paused:false,speed:1,winner:null,health:[25,25],lanes:BIOMES.map((b,i)=>({biome:b.id,crop:i===0?.9:0,enemyCrop:i===0?.92:0,water:i===3?.8:.2,noise:i*7})),units:[],buildings:[],effects:[],events:[],spawnClock:0};
 const roster=[
  [0,0,'pig',5.2],[0,0,'farmer',8.3],[1,0,'husker',-5.2],[1,0,'crow',-7.4],
  [0,1,'dog',6.0],[0,1,'scholar',8.2],[1,1,'archer',-6.2],[1,1,'earling',-8.2],
  [0,2,'wolf',6.0],[0,2,'wolf',8.0],[1,2,'wolf',-5.5],[1,2,'wolf',-8.0],
  [0,3,'sheep',6.2],[0,3,'scarecrow',8.2],[1,3,'crow',-6.5],[1,3,'husker',-8.2]
 ];
 for(const [side,lane,kind,z]of roster)addUnit(world,side,lane,kind,z);
 for(const [side,lane,kind]of [[0,0,'barn'],[0,2,'den'],[0,3,'watchtower'],[1,0,'silo'],[1,1,'school'],[1,2,'iceKeep'],[1,3,'ruin']])world.buildings.push({id:`b${++serial}`,side,lane,kind,x:laneX(lane),z:side?-10:10,hp:18,cycle:0});
 say(world,'The living battlefield wakes.');return world;
}
export function addUnit(w,side,lane,kind,z=side?-8:8){const [hp,attack,speed]=stats[kind]||[9,2,1];const n=w.units.filter(u=>u.lane===lane&&u.side===side).length;const unit={id:`u${++serial}`,side,lane,kind,x:laneX(lane)+(n%2?1.05:-.95),z,hp,max:hp,attack,speed,action:'idle',phase:n*1.8,cool:0,fear:0,hunger:0};w.units.push(unit);return unit;}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const move=(u,target,dt)=>{const d=dist(u,target);if(d<.02)return;const pace=Math.min(d,u.speed*dt);u.x+=(target.x-u.x)/d*pace;u.z+=(target.z-u.z)/d*pace;u.action='walk';};
const say=(w,text)=>{w.events.unshift({at:Math.floor(w.seconds),text});w.events.length=Math.min(16,w.events.length);};
function hurt(w,target,power,source){target.hp-=power;target.action='hurt';w.effects.push({kind:'hit',x:target.x,z:target.z,lane:target.lane,life:.65});if(target.hp<=0){say(w,`${source.kind} defeats ${target.kind} in ${BIOMES[target.lane].name}.`);w.effects.push({kind:'fall',x:target.x,z:target.z,lane:target.lane,life:1.1});}}
export function stepWorld(w,dt){if(w.paused||w.winner!==null)return;dt=clamp(dt,0,.06)*w.speed;w.seconds+=dt;for(const e of w.effects)e.life-=dt;w.effects=w.effects.filter(e=>e.life>0);
 const corn=w.lanes[0];corn.crop=clamp(corn.crop+dt*.012,0,1);corn.enemyCrop=clamp(corn.enemyCrop+dt*.013,0,1);
 for(const b of w.buildings){b.cycle+=dt;if(b.kind==='barn'&&b.cycle>19){b.cycle=0;if(w.units.filter(u=>u.side===b.side&&u.kind==='sheep').length<3){addUnit(w,b.side,b.lane,'sheep',b.side?-8:8);say(w,'The barn releases a sheep into the corn.');}}}
 for(const u of w.units){if(u.hp<=0)continue;u.phase+=dt;u.cool=Math.max(0,u.cool-dt);u.fear=Math.max(0,u.fear-dt);const enemies=w.units.filter(v=>v.side!==u.side&&v.hp>0&&v.lane===u.lane);const foe=enemies.sort((a,b)=>dist(u,a)-dist(u,b))[0];
  if(u.kind==='farmer'&&(!foe||dist(u,foe)>4)){const point={x:laneX(u.lane)-.8,z:7.5+Math.sin(w.seconds*.18)*1.5};if(dist(u,point)>.7)move(u,point,dt);else{u.action='tend';corn.crop=clamp(corn.crop+dt*.09,0,1);}continue;}
  if(u.kind==='scarecrow'){u.action='watch';for(const v of enemies.filter(v=>v.kind==='crow'&&dist(u,v)<7))v.fear=3;continue;}
  if(u.kind==='pig'&&u.z< -3.3&&corn.enemyCrop>.04){u.action='eat';corn.enemyCrop=clamp(corn.enemyCrop-dt*.11,0,1);u.hunger=0;u.hp=Math.min(u.max,u.hp+dt*.08);if(Math.floor((w.seconds-dt)/5)!==Math.floor(w.seconds/5))say(w,'The Pig eats rival corn without a command.');continue;}
  if(u.kind==='sheep'&&foe&&dist(u,foe)<3){u.fear=2;move(u,{x:laneX(u.lane)+1,z:9.5},dt*1.8);u.action='flee';continue;}
  if(u.fear>0){move(u,{x:laneX(u.lane),z:u.side?-9:9},dt*1.8);u.action='flee';continue;}
  if(!foe){const objective={x:laneX(u.lane),z:u.side?9:-9};if(dist(u,objective)>1.5)move(u,objective,dt);else if(u.cool===0){w.health[1-u.side]=Math.max(0,w.health[1-u.side]-u.attack);u.cool=2;u.action='attack';w.effects.push({kind:'hit',x:objective.x,z:objective.z,lane:u.lane,life:.6});}continue;}
  const reach=u.kind==='archer'||u.kind==='crow'?4.1:1.35;if(dist(u,foe)>reach)move(u,foe,dt);else if(u.cool===0){const allies=w.units.filter(v=>v!==u&&v.hp>0&&v.side===u.side&&v.kind==='wolf'&&dist(u,v)<3.5).length;hurt(w,foe,u.attack+(u.kind==='wolf'?allies:0),u);u.cool=u.kind==='archer'?2:1.35;u.action='attack';}
 }
 w.units=w.units.filter(u=>u.hp>0);w.spawnClock+=dt;if(w.spawnClock>16){w.spawnClock=0;w.round++;for(const side of[0,1])for(const lane of[0,1,2,3]){if(w.units.filter(u=>u.side===side&&u.lane===lane).length<2){const key=lane===0?side?'husker':'pig':lane===1?side?'archer':'dog':lane===2?'wolf':side?'crow':'sheep';addUnit(w,side,lane,key);w.effects.push({kind:'spawn',x:laneX(lane),z:side?-8:8,lane,life:1});}}say(w,`Wave ${w.round} enters the field.`);}
 if(w.health[0]<=0||w.health[1]<=0){w.winner=w.health[0]<=0?1:0;say(w,`${w.winner?'Jake':'Farmer'} wins the table.`);}
}
