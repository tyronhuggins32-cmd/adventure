// The new table is self-contained. The older lane and living-world engines do not run here.
export const CARDS = {
  pig: {name:'The Pig',type:'creature',cost:1,atk:1,hp:7,move:1.38,brain:'forager',art:'pig',text:'Finds and eats corn or food creatures on its own. Frightened by Earlings.'},
  dog: {name:'Cool Dog',type:'creature',cost:1,atk:3,hp:8,move:1.28,brain:'guard',art:'dog',text:'Guards its lane; rushes a threat near its commander.'},
  scholar: {name:'Ancient Scholar',type:'creature',cost:2,atk:1,hp:6,move:.78,brain:'scholar',art:'scholar',text:'Studies beside a Schoolhouse. Two lessons unlock a revival.'},
  husker: {name:'Husker Knights',type:'creature',cost:2,atk:4,hp:8,move:.95,brain:'soldier',art:'husker',text:'Corn feeds its attack. Burn or eat the crop to weaken it.'},
  archer: {name:'Archer Dan',type:'creature',cost:2,atk:2,hp:5,move:.76,range:4.8,brain:'archer',art:'archer',text:'Prioritizes buildings; arrows cross a lane before they strike.'},
  maize: {name:'Maize Walker',type:'creature',cost:3,atk:3,hp:11,move:.82,brain:'soldier',art:'maize',text:'A corn spirit. Triples its attack while friendly corn lives.'},
  earlings: {name:'Legion of Earlings',type:'creature',cost:2,atk:2,hp:6,move:1.12,brain:'terror',art:'earlings',text:'Its presence sends fearful animals fleeing.'},
  reaper: {name:'Field Reaper',type:'creature',cost:3,atk:4,hp:8,move:1.1,brain:'hunter',art:'reaper',text:'Hunts wounded enemies through adjacent lanes.'},
  sheep: {name:'Wool Sheep',type:'creature',cost:1,atk:1,hp:5,move:.9,brain:'timid',art:'sheep',text:'Huddles near allies. A Barn births sheep and gives you Cotton Volley.'},
  wolf: {name:'Snow Wolf',type:'creature',cost:2,atk:2,hp:6,move:1.5,brain:'pack',art:'wolf',text:'Huddles with nearby wolves; each packmate adds 1 damage.'},
  crow: {name:'Black Crow',type:'creature',cost:1,atk:2,hp:4,move:1.7,range:1.7,brain:'crow',art:'crow',text:'Dives at crops, but a scarecrow drives it away.'},
  barn: {name:'Barn',type:'building',cost:2,hp:14,art:'barn',text:'Shelters frightened livestock. Births a sheep and adds Cotton Volley to hand.'},
  cornfield: {name:'Corn Field',type:'building',cost:2,hp:11,art:'corn',text:'Seeds this landscape. Living corn empowers Husker Knights and Maize Walkers.'},
  school: {name:'Schoolhouse',type:'building',cost:2,hp:12,art:'school',text:'The Scholar studies here instead of attacking.'},
  silo: {name:'Silo of Truth',type:'building',cost:2,hp:11,art:'silo',text:'Stores harvested food; helps adjacent hungry allies.'},
  scarecrow: {name:'Scarecrow',type:'building',cost:2,hp:10,art:'scarecrow',text:'Scares enemy crows away from nearby fields. Unlocks Corn Maze.'},
  throne: {name:'Broken Throne',type:'building',cost:2,hp:13,art:'throne',text:'The Prince starts seated here. Its fighters grow stronger when wounded.'},
  den: {name:'Snow Den',type:'building',cost:2,hp:12,art:'den',text:'Resting wolves heal and learn to move as a pack.'},
  cotton: {name:'Cotton Volley',type:'spell',cost:2,art:'cotton',text:'A giant wool ball rolls through the opposing landscape.'},
  maze: {name:'Corn Maze',type:'spell',cost:2,art:'corn',text:'Grows dense corn across the lane; enemies slow and lose their path.'},
  mud: {name:'Useless Swamp',type:'spell',cost:1,art:'mud',text:'Mires the rival landscape. A raiding pig gets stuck.'},
  storm: {name:'Cerebral Blood Storm',type:'spell',cost:3,art:'storm',text:'A crackling storm strikes creatures in the target landscape.'},
  volcano: {name:'Volcano',type:'spell',cost:3,art:'volcano',text:'Burns crops on both sides and hurls molten rock at a building.'},
  reclaim: {name:'Reclaim Landscape',type:'spell',cost:2,art:'reclaim',text:'Restores terrain, extinguishes fire and releases trapped allies.'},
  revive: {name:'Raise the Dead',type:'spell',cost:2,art:'revive',text:'A trained Scholar revives the last fallen ally in an empty lane.'}
};

export const LEADERS = {
  blue:{name:'Finn',realm:'Blue Plains',starter:'school',deck:['pig','dog','scholar','archer','school','silo','mud','storm','reclaim','pig','dog','reaper','earlings','revive','volcano'],description:'The Pig, blue landscapes, tricky spells and the Schoolhouse.'},
  jake:{name:'Jake',realm:'Corn Kingdom',starter:'silo',deck:['husker','maize','archer','earlings','cornfield','silo','crow','reaper','volcano','mud','storm','reclaim','husker','maize'],description:'Four cornfields feed the Husker Knights and Maize Walker.'},
  farmer:{name:'The Farmer',realm:'Cornlands',starter:'barn',deck:['pig','sheep','husker','archer','barn','cornfield','silo','cotton','reclaim','dog','sheep','maize','maze','storm'],description:'A living barn, livestock, crops and the giant Cotton Volley.'},
  scarecrow:{name:'Scarecrow',realm:'Cornlands',starter:'cornfield',deck:['crow','husker','maize','scarecrow','cornfield','maze','mud','reaper','archer','reclaim','crow','earlings','storm'],description:'Corn maze magic and a watchful defender of every harvest.'},
  prince:{name:'Exiled Prince',realm:'Knight Kingdom',starter:'throne',deck:['dog','reaper','archer','throne','school','earlings','storm','mud','reclaim','maize','revive','volcano'],description:'Starts seated on his throne; his army fights harder when hurt.'},
  wolf:{name:'Glacier Shepherd',realm:'Snowy Lands',starter:'den',deck:['wolf','wolf','dog','den','storm','mud','wolf','reaper','reclaim','earlings','cotton','school'],description:'Snow wolves huddle, heal and amplify their pack attacks.'}
};
export const ENEMY_DECK=['husker','maize','archer','earlings','cornfield','silo','crow','reaper','volcano','mud','storm','reclaim','husker','maize'];
export const LANES=4, BOARD_WIDTH=24, BOARD_DEPTH=24;

export function makeWorld(leaderId='blue',seed=4261){
  const leader=LEADERS[leaderId]||LEADERS.blue;
  const world={seed,t:0,round:1,phase:'plan',speed:1,paused:false,winner:null,leaderId,leader,
    commanders:[{name:leader.name,hp:25,max:25,energy:5},{name:leaderId==='jake'?'Finn':'Jake',hp:25,max:25,energy:5}],
    hand:[],deck:[...leader.deck],discard:[],enemyDeck:leaderId==='jake'?[...LEADERS.blue.deck]:[...ENEMY_DECK],enemyDiscard:[],units:[],buildings:[],effects:[],logs:[],lanes:[],corpses:[],nextId:1,elapsed:0,turnClock:0,aiClock:0,commanderTask:{x:-10.9,z:10.8,lane:0,action:'idle',work:0}};
  for(let i=0;i<LANES;i++)world.lanes.push({terrain:leaderId==='blue'?'blue':leaderId==='jake'?'corn':['grass','blue','blue','grass'][i],enemyTerrain:leaderId==='jake'?'blue':'corn',crop:leaderId==='jake'?.6:i===1?1:0,enemyCrop:leaderId==='jake'?0:.52+(i%2)*.25,fire:0,enemyFire:0,maze:0,mud:0,enemyMud:0,food:1,enemyFood:2});
  const start=addBuilding(world,0,1,leader.starter,true);
  if(leaderId==='blue')addUnit(world,0,0,'pig',true);
  if(leaderId==='wolf')addUnit(world,0,2,'wolf',true);
  if(leaderId==='farmer')addUnit(world,0,0,'sheep',true);
  addBuilding(world,1,2,leaderId==='jake'?'school':'cornfield',true);
  addUnit(world,1,1,leaderId==='jake'?'dog':'husker',true);
  draw(world,5);note(world,`${leader.name} takes the near edge of the table. ${start.name} anchors lane 2.`);
  return world;
}

const next=(w)=>'m'+w.nextId++;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const laneX=l=>(l-1.5)*5.55;
const rand=w=>{w.seed=(Math.imul(w.seed,1664525)+1013904223)>>>0;return w.seed/4294967296;};
export const note=(w,message)=>{w.logs.unshift({time:Math.round(w.t),text:message});w.logs.length=Math.min(w.logs.length,35);};
export function draw(w,n=1){for(let i=0;i<n;i++){if(!w.deck.length){w.deck=w.discard.splice(0);if(!w.deck.length)break;}if(w.hand.length<8)w.hand.push(w.deck.shift());}}
export function addUnit(w,team,lane,key,free=false){const c=CARDS[key];if(!c||c.type!=='creature')return null;const u={id:next(w),key,name:c.name,team,lane,x:laneX(lane)+(rand(w)-.5)*1.4,z:team===0?5.3:-5.3,y:0,hp:c.hp,max:c.hp,atk:c.atk,brain:c.brain,move:c.move,range:c.range||1.25,hunger:0,fear:0,morale:1,cool:0,age:0,action:'spawn',actionAge:0,study:0,trapped:false,flooped:false,home:lane,free};w.units.push(u);return u;}
export function addBuilding(w,team,lane,key,free=false){const c=CARDS[key];if(!c||c.type!=='building')return null;const b={id:next(w),team,lane,key,name:c.name,hp:c.hp,max:c.hp,x:laneX(lane),z:team===0?8.1:-8.1,age:0,cycle:0,free};w.buildings.push(b);if(key==='cornfield'){const f=w.lanes[lane];f[team?'enemyCrop':'crop']=.65;}return b;}
export function canPlace(w,key,lane){const c=CARDS[key];return w.phase==='plan'&&!w.winner&&!!c&&lane>=0&&lane<4&&w.commanders[0].energy>=c.cost&&(c.type==='spell'||c.type==='creature'?c.type!=='creature'||w.units.filter(u=>u.team===0&&u.lane===lane).length<3:!w.buildings.some(b=>b.team===0&&b.lane===lane));}
export function play(w,key,lane){const index=w.hand.indexOf(key);if(index<0||!canPlace(w,key,lane))return false;const c=CARDS[key];w.commanders[0].energy-=c.cost;w.hand.splice(index,1);w.discard.push(key);if(c.type==='creature')addUnit(w,0,lane,key);else if(c.type==='building')addBuilding(w,0,lane,key);else cast(w,0,lane,key);note(w,`${c.name} played on landscape ${lane+1}.`);return true;}
export function cast(w,team,lane,key){const f=w.lanes[lane],foe=1-team;
  if(key==='mud'){f[foe?'enemyMud':'mud']=18;w.effects.push({kind:'mud',lane,team:foe,life:18});}
  if(key==='maze'){f.maze=20;f.crop=1;w.effects.push({kind:'maze',lane,team,life:20});}
  if(key==='reclaim'){for(const l of w.lanes){l[team?'enemyFire':'fire']=0;l[team?'enemyMud':'mud']=0;l[team?'enemyCrop':'crop']=Math.max(l[team?'enemyCrop':'crop'],.65);}for(const u of w.units.filter(u=>u.team===team))u.trapped=false;}
  if(key==='cotton'){w.effects.push({kind:'cotton',lane,team,x:laneX(lane),z:team? -7:7,life:6,hit:[]});}
  if(key==='storm'){w.effects.push({kind:'storm',lane,team:foe,life:6,pulse:0});}
  if(key==='volcano'){for(const l of w.lanes){l.fire=Math.max(l.fire,5);l.enemyFire=Math.max(l.enemyFire,5);}const b=w.buildings.find(b=>b.team===foe&&b.lane===lane);if(b)b.hp-=7;w.effects.push({kind:'eruption',lane,team:foe,life:3});}
  if(key==='revive'){const scholar=w.units.find(u=>u.team===team&&u.key==='scholar'&&u.study>=2);const lost=w.corpses.find(c=>c.team===team);if(scholar&&lost){const u=addUnit(w,team,lane,lost.key);u.hp=Math.ceil(u.max/2);w.corpses=w.corpses.filter(c=>c!==lost);note(w,`${scholar.name} raises ${u.name}.`);}else note(w,'The resurrection fizzles; a trained Scholar and a fallen ally are needed.');}
}
export function floop(w,id){if(w.phase!=='plan')return false;const u=w.units.find(u=>u.id===id&&u.team===0&&!u.flooped);if(!u)return false;u.flooped=true;u.action='floop';u.actionAge=0;
 if(u.key==='pig'){u.z=-2;u.fear=0;note(w,'The Pig raids the rival cornfields.');}
 else if(u.key==='scholar'){const school=w.buildings.find(b=>b.team===0&&b.key==='school'&&Math.abs(b.lane-u.lane)<=1);if(school){u.study++;note(w,`Scholar studies (${u.study}/2).`);}else {u.flooped=false;return false;}}
 else if(u.key==='wolf'){for(const v of w.units.filter(v=>v.team===0&&v.key==='wolf'&&Math.abs(v.lane-u.lane)<=1))v.hp=Math.min(v.max,v.hp+2);note(w,'The wolves huddle for warmth.');}
 else if(u.key==='sheep'){w.hand.push('cotton');note(w,'The Sheep curls wool into a Cotton Volley card.');}
 else {u.atk+=1;note(w,`${u.name} prepares a stronger strike.`);}
 return true;
}
export function beginBattle(w){if(w.phase!=='plan'||w.winner)return false;w.phase='battle';w.elapsed=0;w.paused=false;w.aiClock=0;note(w,`Battle ${w.round} begins. The miniatures make their own decisions.`);return true;}

const damage=(w,target,amount,source)=>{target.hp-=amount;target.action='hurt';target.actionAge=0;w.effects.push({kind:'impact',x:target.x,z:target.z,life:.55,team:source.team});};
const live=(u)=>u.hp>0;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function chooseTarget(w,u){const enemies=w.units.filter(v=>v.team!==u.team&&live(v));if(u.brain==='forager'||u.brain==='crow'){
   const food=enemies.filter(v=>['sheep','crow'].includes(v.key));if(food.length)return food.sort((a,b)=>dist(u,a)-dist(u,b))[0];
   const rows=w.lanes.map((l,i)=>({lane:i,value:u.team?l.crop:l.enemyCrop})).filter(v=>v.value>.1).sort((a,b)=>b.value-a.value);if(rows.length)return {crop:true,lane:rows[0].lane,x:laneX(rows[0].lane),z:u.team?5:-5};
 }
 if(u.brain==='archer'){const buildings=w.buildings.filter(b=>b.team!==u.team&&live(b));if(buildings.length)return buildings.sort((a,b)=>Math.abs(a.lane-u.lane)-Math.abs(b.lane-u.lane)||dist(u,a)-dist(u,b))[0];}
 if(u.brain==='hunter'){const injured=enemies.filter(v=>v.hp<v.max);if(injured.length)return injured.sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];}
 const same=enemies.filter(v=>v.lane===u.lane);if(same.length)return same.sort((a,b)=>dist(u,a)-dist(u,b))[0];
 const structure=w.buildings.find(b=>b.team!==u.team&&b.lane===u.lane&&live(b));if(structure)return structure;
 return {base:true,x:laneX(u.lane),z:u.team?8.5:-8.5,team:1-u.team};
}
function tendFarm(w,dt){if(w.leaderId!=='farmer')return;const farmer=w.commanderTask;const candidates=w.lanes.map((l,i)=>({lane:i,crop:l.crop})).sort((a,b)=>a.crop-b.crop);const target=candidates[0];if(farmer.work<=0&&farmer.lane!==target.lane)farmer.lane=target.lane;const x=laneX(farmer.lane),z=6.9,d=Math.hypot(farmer.x-x,farmer.z-z);
 if(d>.42){farmer.x+=(x-farmer.x)/d*dt*1.18;farmer.z+=(z-farmer.z)/d*dt*1.18;farmer.action='walk';}
 else{farmer.action='harvest';farmer.work+=dt;w.lanes[farmer.lane].crop=clamp(w.lanes[farmer.lane].crop+dt*.055,0,1);if(farmer.work>=8){farmer.work=0;farmer.lane=(farmer.lane+1)%4;}}
}
function updateCrops(w,dt){for(let i=0;i<4;i++){const l=w.lanes[i];for(const team of [0,1]){const k=team?'enemyCrop':'crop',fire=team?'enemyFire':'fire';const growing=(team?l.enemyTerrain:l.terrain)==='corn'||w.buildings.some(b=>b.team===team&&b.lane===i&&b.key==='cornfield');l[k]=clamp(l[k]+(growing?.019:.003)*dt-l[fire]*.034*dt,0,1);l[fire]=Math.max(0,l[fire]-dt*.15);if(l[fire]>.8&&l[k]>.15&&rand(w)<dt*.11){const next=w.lanes[clamp(i+(rand(w)<.5?-1:1),0,3)];next[fire]=Math.max(next[fire],l[fire]*.65);}}l.mud=Math.max(0,l.mud-dt);l.enemyMud=Math.max(0,l.enemyMud-dt);l.maze=Math.max(0,l.maze-dt);}}
function updateBuildings(w,dt){for(const b of w.buildings){b.age+=dt;b.cycle+=dt;const allies=w.units.filter(u=>u.team===b.team&&Math.abs(u.lane-b.lane)<=1);
  if(b.key==='barn'&&b.cycle>=19){b.cycle=0;if(w.units.filter(u=>u.team===b.team&&u.key==='sheep').length<5){const lane=w.units.filter(u=>u.team===b.team&&u.lane===b.lane).length>=3?clamp(b.lane+1,0,3):b.lane;addUnit(w,b.team,lane,'sheep',true);if(b.team===0&&w.hand.length<8)w.hand.push('cotton');note(w,`${b.team?'Rival':'Your'} Barn births a sheep and spins Cotton Volley.`);}}
  if(b.key==='den')for(const u of allies.filter(u=>u.key==='wolf'&&dist(u,b)<3))u.hp=clamp(u.hp+dt*.14,0,u.max);
  if(b.key==='silo')for(const u of allies)u.hunger=Math.max(0,u.hunger-dt*.25);
  if(b.key==='scarecrow')for(const u of w.units.filter(u=>u.team!==b.team&&u.key==='crow'&&dist(u,b)<6)){u.fear=Math.max(u.fear,2.8);u.action='flee';}
  if(b.key==='school')for(const u of allies.filter(u=>u.key==='scholar'&&dist(u,b)<3)){u.study=Math.min(2,u.study+dt*.08);u.action='study';}
 }}
function updateUnits(w,dt){for(const u of w.units){u.age+=dt;u.actionAge+=dt;u.cool=Math.max(0,u.cool-dt);u.hunger=clamp(u.hunger+dt*.008,0,1);u.fear=Math.max(0,u.fear-dt*.55);const field=w.lanes[u.lane];const theirCorn=u.team?field.crop:field.enemyCrop;
  if(['pig','crow'].includes(u.key)&&u.z*(u.team?1:-1)>0&&theirCorn>.1&&Math.abs(u.z)>1.5){const eat=Math.min(theirCorn,dt*(u.key==='pig'?.19:.08));field[u.team?'crop':'enemyCrop']-=eat;u.hunger=Math.max(0,u.hunger-eat*1.8);u.hp=Math.min(u.max,u.hp+eat*.6);u.action='eat';}
  if(['pig','sheep'].includes(u.key)){const terror=w.units.some(v=>v.team!==u.team&&v.key==='earlings'&&dist(u,v)<4.8);if(terror)u.fear=Math.max(u.fear,3.8);}
  const mud=u.team?field.mud:field.enemyMud;if(mud>0&&u.key==='pig'&&Math.abs(u.z)<2.4){u.trapped=true;u.action='stuck';}
  if(u.trapped&&mud<=0)u.trapped=false;
  if(u.brain==='scholar'&&w.buildings.some(b=>b.team===u.team&&b.key==='school'&&Math.abs(b.lane-u.lane)<=1&&dist(u,b)<3)){u.action='study';continue;}
  let target=chooseTarget(w,u);if(!target)continue;
  if(u.fear>1.2){target={x:laneX(u.home),z:u.team?8:-8};u.action='flee';}
  if(u.brain==='guard'&&Math.abs(u.z)>5&&target.base)target={x:laneX(u.home),z:u.team?3.9:-3.9};
  if(u.brain==='timid'&&target.base)target={x:laneX(u.home),z:u.team?6:-6};
  if(u.brain==='pack'){const mates=w.units.filter(v=>v!==u&&v.team===u.team&&v.key==='wolf'&&dist(u,v)<4);if(mates.length&&target.base)target={x:laneX(u.lane),z:u.team?2:-2};}
  if(target.crop&&Math.abs(u.z-(u.team?5:-5))<1.6&&u.lane===target.lane){u.action='eat';continue;}
  const d=dist(u,target),range=target.crop?.8:u.range;if(d>range||target.base&&d>1.3){if(u.trapped)continue;const dx=(target.x-u.x)/Math.max(d,.001),dz=(target.z-u.z)/Math.max(d,.001);const slow=(u.team?field.enemyMud:field.mud)>0?.48:1;const maze=(u.team===1&&field.maze>0&&u.z>0)?.4:1;const pace=u.move*slow*maze*(u.hunger>.82?.65:1)*(u.fear>1.2?1.35:1);u.x=clamp(u.x+dx*pace*dt,-11.5,11.5);u.z=clamp(u.z+dz*pace*dt,-9.8,9.8);u.lane=clamp(Math.round(u.x/5.55+1.5),0,3);if(u.action!=='flee')u.action='walk';}
  else if(u.cool===0&&u.fear<=1.2){u.cool=u.range>2?1.8:1.25;u.action='attack';u.actionAge=0;let power=u.atk;
    if(u.key==='husker'&&!(w.lanes.some(l=>(u.team?l.enemyCrop:l.crop)>.24)))power=0;
    if(u.key==='maize'&&w.lanes.some(l=>(u.team?l.enemyCrop:l.crop)>.24))power*=3;
    if(u.key==='wolf')power+=w.units.filter(v=>v!==u&&v.team===u.team&&v.key==='wolf'&&dist(u,v)<4).length;
    if(w.leaderId==='prince'&&u.team===0&&u.hp<u.max*.5)power++;
    if(target.crop){const f=w.lanes[target.lane];f[u.team?'crop':'enemyCrop']=Math.max(0, f[u.team?'crop':'enemyCrop']-.3);u.hunger=Math.max(0,u.hunger-.35);u.hp=Math.min(u.max,u.hp+.6);u.action='eat';}
    else if(target.base){w.commanders[1-u.team].hp-=Math.max(1,power);w.effects.push({kind:'impact',x:target.x,z:target.z,life:.65,team:u.team});note(w,`${u.name} breaks through to ${w.commanders[1-u.team].name}.`);}
    else if(power>0){damage(w,target,power,u);if(u.key==='pig'&&['sheep','crow'].includes(target.key)){u.hp=Math.min(u.max,u.hp+2);u.hunger=0;note(w,'The Pig eats a food creature without a command or AP cost.');}}
  }
 }}
function updateEffects(w,dt){for(const e of w.effects){e.life-=dt;if(e.kind==='cotton'){e.z+=(e.team?1:-1)*dt*4.4;for(const u of w.units.filter(u=>u.team!==e.team&&u.lane===e.lane&&!e.hit.includes(u.id)&&dist(u,e)<2)){e.hit.push(u.id);damage(w,u,4,{team:e.team});}if(Math.abs(e.z)>9.2)e.life=0;}
 if(e.kind==='storm'){e.pulse+=dt;if(e.pulse>.9){e.pulse=0;for(const u of w.units.filter(u=>u.team===e.team&&u.lane===e.lane))damage(w,u,1,{team:1-e.team});}}
 }w.effects=w.effects.filter(e=>e.life>0);}
function enemyPlay(w){
 const p=w.commanders[1];if(p.energy<1||!w.enemyDeck.length)return;
 const viable=w.enemyDeck.filter(k=>CARDS[k].cost<=p.energy);if(!viable.length)return;
 const score=k=>{const c=CARDS[k],pig=w.units.some(u=>u.team===0&&u.key==='pig'),corn=w.lanes.some(l=>l.enemyCrop>.22),scarecrow=w.buildings.some(b=>b.team===0&&b.key==='scarecrow');return (k==='cornfield'&&!corn?7:0)+(k==='husker'&&corn?5:0)+(k==='maize'&&corn?4:0)+(k==='mud'&&pig?4:0)+(k==='crow'&&scarecrow?-5:0)+(c.type==='creature'?3:0)+(c.type==='spell'?1:0)+rand(w)*1.5;};
 const key=viable.map(k=>({k,s:score(k)})).sort((a,b)=>b.s-a.s)[0].k,card=CARDS[key];
 const ranking=[0,1,2,3].sort((a,b)=>{const rank=i=>w.units.filter(u=>u.team===0&&u.lane===i).length*2-w.units.filter(u=>u.team===1&&u.lane===i).length+(w.lanes[i].enemyCrop>0?.6:0);return rank(b)-rank(a)});
 let lane=ranking[0];if(card.type==='building'&&w.buildings.some(b=>b.team===1&&b.lane===lane))lane=ranking.find(i=>!w.buildings.some(b=>b.team===1&&b.lane===i));if(card.type==='creature'&&w.units.filter(u=>u.team===1&&u.lane===lane).length>=3)lane=ranking.find(i=>w.units.filter(u=>u.team===1&&u.lane===i).length<3);if(lane===undefined)return;
 p.energy-=card.cost;w.enemyDeck.splice(w.enemyDeck.indexOf(key),1);w.enemyDiscard.push(key);if(card.type==='creature')addUnit(w,1,lane,key);else if(card.type==='building')addBuilding(w,1,lane,key);else cast(w,1,lane,key);note(w,`${w.commanders[1].name} plays ${card.name} in lane ${lane+1}.`);
}
function finishRound(w){w.phase='plan';w.round++;w.commanders[0].energy=5;w.commanders[1].energy=5;if(!w.enemyDeck.length)w.enemyDeck=w.enemyDiscard.splice(0);for(const u of w.units)u.flooped=false;draw(w,2);note(w,`Round ${w.round}. Place cards, Floop, then send the figures back into battle.`);}
export function step(w,dt){if(w.paused||w.winner||w.phase!=='battle')return;dt=Math.min(.06,Math.max(0,dt))*w.speed;w.t+=dt;w.elapsed+=dt;w.aiClock+=dt;updateCrops(w,dt);tendFarm(w,dt);updateBuildings(w,dt);updateUnits(w,dt);updateEffects(w,dt);
 if(w.aiClock>5){w.aiClock=0;enemyPlay(w);}
 for(const u of w.units.filter(u=>u.hp<=0)){w.corpses.unshift({team:u.team,key:u.key});w.corpses.length=Math.min(w.corpses.length,12);note(w,`${u.name} falls on lane ${u.lane+1}.`);w.effects.push({kind:'fall',x:u.x,z:u.z,life:1.3});}
 w.units=w.units.filter(live);for(const b of w.buildings.filter(b=>b.hp<=0)){note(w,`${b.name} is destroyed.`);w.effects.push({kind:'fall',x:b.x,z:b.z,life:1.2});}w.buildings=w.buildings.filter(live);
 for(const commander of w.commanders)if(commander.hp<=0){w.winner=commander===w.commanders[0]?1:0;w.phase='ended';note(w,`${w.commanders[w.winner].name} wins the table.`);return;}
 if(w.elapsed>=22)finishRound(w);
}
