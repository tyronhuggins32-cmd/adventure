import {Terrain,distance,clamp,SIZE,HALF} from './terrain.js?v=world9';
import {actCreature} from './creature-brains.js?v=world9';
import {CARDS,card,RECRUITS} from './catalog.js?v=world9';
const livestock=e=>['pig','sheep','cow','bull'].includes(e.card.behavior);
export class LivingWorld{
 constructor({seed=42,rival=true}={}){this.seed=seed;this.rngState=seed>>>0;this.terrain=new Terrain(seed);this.entities=[];this.projectiles=[];this.graveyard=[];this.history=[];this.time=0;this.accumulator=0;this.ecologyClock=0;this.serial=0;this.version=0;this.paused=true;this.speed=1;this.ended=false;this.winner=null;this.energy=[10,10];this.knowledge=[new Set(),new Set()];this.hand=['farm','barn','pig','dog','corn','mud'];this.discard=[];this.drawSerial=0;this.rival=rival;this.nextRival=12;this.cornPower=[true,true];this.weather='clear';this.spawn('commander',0,-64,102,{id:'farmer',name:'The Farmer',type:'commander',hp:100,atk:2,speed:2.8});this.spawn('commander',1,64,-102,{id:'bannerKnight',name:'Corn King',type:'commander',hp:100,atk:3,speed:3});if(rival){this.spawn('guard',1,-38,-66);this.spawn('guard',1,44,-80);this.spawn('farm',1,-56,-104);this.spawn('tower',1,24,-108);}this.note('The tabletop is paused. Place cards anywhere on your side, then let the world run.');}
 get structures(){return this.entities.filter(e=>e.card.type==='building'&&e.hp>0);}
 random(){let n=this.rngState+=0x6d2b79f5;n=Math.imul(n^n>>>15,n|1);n^=n+Math.imul(n^n>>>7,n|61);return ((n^n>>>14)>>>0)/4294967296;}
 note(text){this.history.unshift({time:this.time,text});this.history.length=Math.min(30,this.history.length);this.version++;}
 spawn(id,side,x,z,override=null){const c=override||card(id),e={id:'entity-'+ ++this.serial,card:c,side,x,z,hp:c.hp,maxHp:c.hp,atk:c.atk||0,radius:c.radius||1.5,speed:c.speed||0,vx:0,vz:0,state:c.type==='building'?'working':'idle',hunger:20,morale:85,cooldown:0,abilityAt:0,foodAt:0,study:0,path:[],pathAt:0,decisionAt:0,action:0,order:null,clock:0,inside:null,trapped:false};this.entities.push(e);this.version++;if(c.id==='sheep'&&this.closest(e,o=>o.side===side&&o.card.id==='barn',18)){this.unlock(side,'cotton','A sheep in the barn unlocks Cotton Siege.');}if(c.id==='scarecrow')this.unlock(side,'cornmaze','The scarecrow teaches Corn Maze.');return e;}
 unlock(side,id,message){if(this.knowledge[side].has(id))return;this.knowledge[side].add(id);if(side===0&&this.hand.length<8&&!this.hand.includes(id))this.hand.push(id);this.note(message);}
 draw(){const pool=['farm','barn','pig','dog','corn','meadow','mud','rain','fire','reclaim','school','tower','cave','spirit','volcano','guard','maize'];for(const id of ['revive','cotton','cornmaze'])if(this.knowledge[0].has(id))pool.push(id);if(this.hand.length<8)this.hand.push(pool[Math.floor(this.random()*pool.length)]);}
 prepareCard(id,buildingId){const b=this.entities.find(e=>e.id===buildingId&&e.hp>0&&e.side===0);if(!b||!(RECRUITS[b.card.id]||[]).includes(id))return false;if(this.hand.length>=8)return false;this.hand.push(id);this.version++;return true;}
 closest(e,predicate,max=Infinity){let found=null,best=max;for(const o of this.entities){if(o===e||o.hp<=0||!predicate(o))continue;const d=distance(e,o);if(d<best){best=d;found=o;}}return found;}
 nearbyPoint(e,target){const dx=e.x-target.x,dz=e.z-target.z,n=Math.hypot(dx,dz)||1,r=target.radius+2.2;return {x:target.x+dx/n*r,z:target.z+dz/n*r};}
 move(e,target,dt,reach=1){const structures=this.structures,goal=target.card?.type==='building'?this.nearbyPoint(e,target):target;if(distance(e,goal)<=reach){e.vx=e.vz=0;return true;}const signature=Math.floor(goal.x/6)+':'+Math.floor(goal.z/6)+':'+this.terrain.version;
 if(e.pathAt<=this.time||e.pathKey!==signature){e.path=this.terrain.path(e,goal,structures,reach);e.pathKey=signature;e.pathAt=this.time+1.1;}
 while(e.path.length&&distance(e,e.path[0])<=(e.path.length===1?reach:1.3))e.path.shift();let waypoint=e.path[0];if(!waypoint){e.vx=e.vz=0;e.state='blocked';return false;}
 let dx=waypoint.x-e.x,dz=waypoint.z-e.z,n=Math.hypot(dx,dz)||1,vx=dx/n,vz=dz/n;
 for(const other of this.entities){if(other===e||other.hp<=0||other.card.type==='building'||other.inside)continue;const d=distance(e,other);if(d>0&&d<2.3){vx+=(e.x-other.x)/d*(1-d/2.3)*.7;vz+=(e.z-other.z)/d*(1-d/2.3)*.7;}}
 n=Math.hypot(vx,vz)||1;const ground=this.terrain.cell(e.x,e.z),mud=ground.kind==='mud',cold=ground.kind==='snow'&&e.card.behavior!=='wolf',speed=e.speed*(e.slowUntil>this.time?.55:1)*(e.state==='flee'?1.6:e.charging?1.65:1)*(mud?.48:cold?.72:1),step=Math.min(distance(e,waypoint),speed*dt),nx=clamp(e.x+vx/n*step,-HALF+3,HALF-3),nz=clamp(e.z+vz/n*step,-HALF+3,HALF-3);
 if(this.terrain.walkable(nx,nz,structures)){e.x=nx;e.z=nz;e.vx=vx/n*speed;e.vz=vz/n*speed;}else{e.pathAt=0;e.vx=e.vz=0;}return distance(e,goal)<=reach;
 }
 hurt(target,amount,source=null){if(target.hp<=0||target.inside)return;const armor=(target.card.behavior==='bull'?1:0)+(source?.card.ranged&&this.terrain.cell(target.x,target.z).cover?2:0),targetBefore=target.hp;target.hp=Math.max(0,target.hp-Math.max(1,amount-armor));target.action=.4;target.morale=Math.max(0,target.morale-amount*2);target.lastHit=this.time;if(target.hp<=0&&targetBefore>0){this.graveyard.push({card:{...target.card},side:target.side,hunger:target.hunger,x:target.x,z:target.z});this.note(target.card.name+' falls'+(source?' to '+source.card.name:'')+'.');for(const e of this.entities)if(e.side===target.side&&e.hp>0&&distance(e,target)<20)e.morale=Math.max(0,e.morale-12);if(target.card.type==='building'){for(const e of this.entities)if(e.inside===target.id){e.inside=null;e.order=null;this.hurt(e,Math.ceil(e.maxHp*.5));}this.terrain.version++;}if(target.card.type==='commander'){this.ended=true;this.winner=1-target.side;this.paused=true;this.note(this.winner===0?'Your kingdom holds the table.':'Your Farmer has fallen.');}}}
 attack(e,target){e.cooldown=e.card.ranged?2.7:e.card.behavior==='bull'?2.2:1.8;e.action=.6;e.state=e.card.ranged?'shoot':'attack';e.vx=target.x-e.x;e.vz=target.z-e.z;let amount=e.atk+(e.charging?3:0);if(e.card.behavior==='wolf'){const mates=this.entities.filter(o=>o!==e&&o.hp>0&&o.side===e.side&&o.card.behavior==='wolf'&&distance(e,o)<16).length;amount+=Math.min(8,mates*2);e.packBonus=Math.min(8,mates*2);}if(e.card.id==='guard'&&this.terrain.cell(e.x,e.z).kind==='corn')amount+=2;if(e.card.id==='maize'&&this.cornPower[e.side])amount*=3;e.charging=false;if(e.card.ranged||e.card.type==='building'){this.projectiles.push({id:++this.serial,source:e,target,x:e.x,z:e.z,age:0,damage:amount||3});}else this.hurt(target,amount,e);}
 command(id,kind,target=null){const e=this.entities.find(e=>e.id===id&&e.side===0&&e.hp>0);if(!e||this.ended)return {ok:false,reason:'Choose one of your living creatures'};if(kind==='auto'){e.order=null;e.inside=null;return {ok:true};}if(e.trapped)return {ok:false,reason:'Reclaim this muddy ground to free the pig'};if(kind==='move'){if(!target||!this.terrain.walkable(target.x,target.z,this.structures))return {ok:false,reason:'Choose open ground'};e.order={kind,target};e.inside=null;e.pathAt=0;return {ok:true};}
 if(['rest','study'].includes(kind)){const b=this.closest(e,o=>o.side===e.side&&o.card.type==='building'&&(kind==='study'?o.card.id==='school':['barn','cave'].includes(o.card.id)));if(!b)return {ok:false,reason:kind==='study'?'Build a Schoolhouse first':'Build a Barn or Cave first'};e.order={kind,target:b};e.inside=null;e.pathAt=0;this.note(e.card.name+' heads to '+b.card.name+'.');return {ok:true};}
 if(kind==='raid'&&e.card.behavior==='pig'){e.order={kind:'raid'};e.braveUntil=this.time+15;e.pathAt=0;this.note('The pig searches the rival kingdom for corn.');return {ok:true};}
 if(kind==='floop'&&e.card.type==='building'){if(this.time<e.abilityAt)return {ok:false,reason:'This building is recovering'};if(e.card.id==='spirit'){const spirit=this.closest(e,o=>o.side!==e.side&&o.card.spirit,38);if(!spirit)return {ok:false,reason:'No enemy spirit is within 38 metres'};spirit.side=e.side;spirit.order=null;spirit.pathAt=0;this.note('The Spirit Tower captures '+spirit.card.name+'.');}else if(e.card.id==='volcano'){if(!target)return {ok:false,reason:'Choose an eruption point'};this.terrain.paint(target.x,target.z,'fire',16);this.note('The volcano erupts. Fire can spread through either kingdom.');}else return {ok:false,reason:'This building works automatically'};e.abilityAt=this.time+20;this.version++;return {ok:true};}return {ok:false,reason:'This order does not apply to this miniature'};}
 updateCreature(e,dt){e.clock+=dt;e.cooldown=Math.max(0,e.cooldown-dt);e.action=Math.max(0,e.action-dt);if(e.inside){const b=this.entities.find(b=>b.id===e.inside&&b.hp>0);if(!b){e.inside=null;e.order=null;}else{e.state=e.order?.kind==='study'?'study':'rest';e.vx=e.vz=0;if(e.state==='study'){e.study+=dt;if(e.study>=20&&!this.knowledge[e.side].has('revive')){this.knowledge[e.side].add('revive');if(e.side===0&&!this.hand.includes('revive'))this.hand.push('revive');this.note(e.card.name+' learns Raise the Dead.');}}return;}}
 if(e.card.type==='commander'){
   // Commands use the live pathfinder and move the actual character in the world.
   if(e.order?.kind==='move'){
     e.state='walk';
     if(this.move(e,e.order.target,dt,1.35)){
       e.order={kind:'hold',target:{x:e.x,z:e.z}};
       e.state='guard';e.vx=e.vz=0;
     }
     return;
   }
   if(e.order?.kind==='hold'){e.state='guard';e.vx=e.vz=0;return;}
   e.state='command';
   const hurt=this.closest(e,o=>o.side===e.side&&o.hp<o.maxHp&&livestock(o),14);
   if(hurt&&e.cooldown<=0){hurt.hp=Math.min(hurt.maxHp,hurt.hp+2);e.cooldown=5;e.action=.5;e.state='harvest';}
   const enemy=this.closest(e,o=>o.side!==e.side&&!o.inside,7);
   if(enemy&&e.cooldown<=0){this.attack(e,enemy);return;}
   // Preserve existing autonomous farmer farming: he walks to live crop patches and grows them.
   const farm=this.closest(e,o=>o.side===e.side&&o.card.id==='farm',90);
   let crop=null,best=Infinity;
   if(farm)for(const c of this.terrain.cells)
     if(c.owner===e.side&&c.kind==='corn'&&c.food<4&&distance(c,farm)<18&&distance(e,c)<40){
       const d=distance(e,c);if(d<best){best=d;crop=c;}
     }
   if(crop){
     e.state='tending crops';
     if(this.move(e,crop,dt,2.5)&&e.cooldown<=0){
       crop.food=Math.min(4,crop.food+1);
       this.terrain.version++;e.cooldown=2;e.action=.4;e.state='harvest';e.vx=e.vz=0;
     }
   }else if(farm&&distance(e,farm)>17){
     e.state='returning to farm';this.move(e,this.nearbyPoint(e,farm),dt,4);
   }else{e.vx=e.vz=0;}
   return;
 }
 const cell=this.terrain.cell(e.x,e.z);if(e.card.behavior==='pig'&&cell.kind==='mud')e.trapped=true;if(e.trapped){e.state='trapped';e.vx=e.vz=0;return;}if(e.card.cornPowered&&!this.cornPower[e.side]){e.state='unpowered';e.vx=e.vz=0;return;}
 if(e.order?.kind==='move'){e.state='walk';if(this.move(e,e.order.target,dt,1.5)){e.state='holding';e.vx=e.vz=0;const target=this.closest(e,o=>o.side!==e.side&&!o.inside,5);if(target&&e.cooldown<=0)this.attack(e,target);}return;}
 if(['rest','study'].includes(e.order?.kind)){const b=e.order.target;if(b.hp<=0){e.order=null;}else{e.state='walk';const goal=this.nearbyPoint(e,b);if(this.move(e,goal,dt,2)){e.inside=b.id;e.x=goal.x;e.z=goal.z;}return;}}
 const threat=this.closest(e,o=>o.side!==e.side&&o.card.type==='creature'&&!o.inside&&!/corn|kernel|turnip|carrot|pumpkin/i.test(o.card.name),e.card.behavior==='pig'?11:8);
 if((['pig','sheep'].includes(e.card.behavior)&&(threat&&this.time>(e.braveUntil||0)||e.morale<20))||e.hp<e.maxHp*.25&&e.morale<30){const shelter=this.closest(e,o=>o.side===e.side&&['barn','cave'].includes(o.card.id));const away=shelter?this.nearbyPoint(e,shelter):{x:clamp(e.x+(e.x-(threat?.x||0))*.8,-HALF+8,HALF-8),z:clamp(e.z+(e.side?-10:10),-HALF+8,HALF-8)};e.state='flee';if(this.move(e,away,dt,2)&&shelter){e.order={kind:'rest',target:shelter};e.inside=shelter.id;}return;}
 if(actCreature(this,e,dt,threat))return;
 let target=this.closest(e,o=>o.side!==e.side&&!o.inside&&o.card.type==='creature',e.card.ranged?38:32)||this.closest(e,o=>o.side!==e.side&&!o.inside&&['building','commander'].includes(o.card.type));if(!target){this.wander(e,dt);return;}const reach=e.card.ranged?27:target.radius+2.5,d=distance(e,target);if(d<=reach){e.vx=e.vz=0;e.state='guard';if(e.cooldown<=0)this.attack(e,target);}else{e.state='walk';e.charging=e.card.behavior==='bull'&&d<20&&e.cooldown<=0;this.move(e,target,dt,target.card.type==='building'?.25:reach-1);}}
 wander(e,dt){if(this.time>e.decisionAt||e.state==='blocked'){e.decisionAt=this.time+3+this.random()*4;e.wander={x:clamp(e.x+(this.random()-.5)*10,-HALF+8,HALF-8),z:clamp(e.z+(this.random()-.5)*10,-HALF+8,HALF-8)};}e.state=e.card.behavior?'graze':'patrol';if(e.wander)this.move(e,e.wander,dt,1);}
 updateBuilding(b,dt){b.clock+=dt;b.cooldown-=dt;b.action=Math.max(0,b.action-dt);b.state='working';if(b.cooldown>0)return;b.cooldown=b.card.id==='tower'?3:6;
 if(b.card.id==='farm'){for(const c of this.terrain.cells)if(distance(c,b)<21&&c.kind!=='water'&&c.kind!=='mazeWall'&&c.kind!=='snow'&&!c.fire){c.kind='corn';c.owner=b.side;c.food=Math.min(4,c.food+1);}this.terrain.version++;}
 if(['barn','cave'].includes(b.card.id)){for(const e of this.entities)if(e.side===b.side&&e.hp>0&&(e.inside===b.id||livestock(e)&&distance(e,b)<12)){e.hp=Math.min(e.maxHp,e.hp+2);e.morale=Math.min(100,e.morale+8);if(e.inside===b.id&&e.order?.kind==='rest'&&e.hp>=e.maxHp*.85){e.inside=null;e.order=null;}}}
 if(b.card.id==='iceDen'){for(const e of this.entities)if(e.hp>0&&e.side===b.side&&e.card.behavior==='wolf'&&distance(e,b)<18){e.hp=Math.min(e.maxHp,e.hp+1);e.morale=Math.min(100,e.morale+5);}}
 if(b.card.id==='tower'){const target=this.closest(b,o=>o.side!==b.side&&!o.inside,30);if(target)this.attack(b,target);}}
 ecology(){this.weather=Math.floor(this.time/60)%3===2?'rain':'clear';this.terrain.expireMaze(this.time);this.cornPower=[0,1].map(side=>this.terrain.cells.some(c=>c.owner===side&&c.kind==='corn'&&c.food>0));const spread=[];
 for(const c of this.terrain.cells){if(c.fire){if(this.weather==='rain')c.fire=0;else{c.fire--;c.food=0;c.kind='ash';for(const e of this.entities)if(e.hp>0&&distance(e,c)<5&&!e.inside)this.hurt(e,2);if(c.fire===2)for(const d of this.terrain.cells)if(d.kind==='corn'&&!d.fire&&distance(c,d)<7)spread.push(d);this.terrain.version++;}}}for(const c of spread){c.fire=5;c.kind='ash';}
 for(const e of this.entities){if(e.hp<=0||e.card.type==='building')continue;e.hunger=Math.min(100,e.hunger+.45);const c=this.terrain.cell(e.x,e.z);if(e.hunger>30&&c.food>0&&c.owner===e.side){c.food--;e.hunger=Math.max(0,e.hunger-15);e.hp=Math.min(e.maxHp,e.hp+1);this.terrain.version++;}if(e.hunger>90&&!e.inside)this.hurt(e,1);if(e.morale<80&&!this.closest(e,o=>o.side!==e.side,18))e.morale=Math.min(80,e.morale+1);}
 this.energy=this.energy.map(n=>Math.min(10,n+.25));this.version++;}
 rivalTurn(){if(!this.rival||this.time<this.nextRival)return;this.nextRival=this.time+12;const side=1;if(this.entities.filter(e=>e.side===side&&e.card.type==='creature'&&e.hp>0).length>=12)return;const id=this.entities.some(e=>e.side===1&&e.hp>0&&e.card.id==='iceDen')&&this.random()>.6?'wolf':this.random()>.65?'dog':'guard',c=CARDS[id];if(this.energy[1]<c.cost)return;for(let tries=0;tries<10;tries++){const den=this.entities.find(e=>e.side===1&&e.hp>0&&e.card.id==='iceDen'),x=id==='wolf'&&den?den.x+(this.random()-.5)*35:(this.random()-.5)*180,z=id==='wolf'&&den?den.z+(this.random()-.5)*35:-60-this.random()*56;if(this.terrain.walkable(x,z,this.structures)){this.spawn(id,1,x,z);this.energy[1]-=c.cost;this.note('The rival summons '+c.name+'.');break;}}}
 tick(dt){this.time+=dt;for(const e of [...this.entities]){if(e.hp<=0)continue;if(e.card.type==='building')this.updateBuilding(e,dt);else this.updateCreature(e,dt);}for(const p of [...this.projectiles]){if(p.target&&(p.target.hp<=0||p.target.inside)){this.projectiles.splice(this.projectiles.indexOf(p),1);continue;}const destination=p.target||p.point,d=distance(p,destination),step=(p.speed||24)*dt;p.age+=dt;if(d<=step+1){if(p.area){for(const enemy of this.entities)if(enemy.hp>0&&enemy.side!==p.side&&!enemy.inside&&distance(enemy,destination)<p.area){this.hurt(enemy,p.damage,p.source);enemy.slowUntil=this.time+5;}this.note('The cotton ball bursts across the enemy line.');}else this.hurt(p.target,p.damage,p.source);this.projectiles.splice(this.projectiles.indexOf(p),1);}else{p.x+=(destination.x-p.x)/d*step;p.z+=(destination.z-p.z)/d*step;}}
 this.ecologyClock+=dt;if(this.ecologyClock+1e-9>=1){this.ecologyClock-=1;this.ecology();}this.rivalTurn();if(this.entities.length>160)this.entities=this.entities.filter(e=>e.hp>0);}
 step(realDt){if(this.paused||this.ended)return;this.accumulator+=Math.min(.25,Math.max(0,realDt))*this.speed;let steps=0;while(this.accumulator+1e-9>=.05&&steps++<20&&!this.ended){this.tick(.05);this.accumulator-=.05;}}
}
