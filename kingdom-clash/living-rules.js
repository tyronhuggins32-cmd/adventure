export const baseTerrain={farm:'corn',ice:'snow',beach:'sand',medieval:'stone'};
export const makeField=k=>({kind:baseTerrain[k],integrity:8,armor:0,food:k==='farm'?3:1,hazard:0});
export const wet=f=>['water','coral','moat','ice','mirror'].includes(f.kind);
export function terrainChange(s,p,i,kind,api){const f=s.players[p].lanes[i].field;if(f.kind!==kind)f.armor=0;f.kind=kind;f.hazard=['thorns','roots'].includes(kind)?1:0;api.emit(s,{kind:'terrain',p,lane:i,terrain:kind,kingdom:s.players[p].kingdom});}
export function fieldDamage(s,p,i,n,api){const l=s.players[p].lanes[i],f=l.field;f.integrity=Math.max(0,f.integrity-Math.max(0,n-f.armor));if(!f.integrity&&l.building){api.log(s,l.building.name+' collapses with its field.');s.players[p].discard.push(l.building);l.building=null;}api.emit(s,{kind:'fieldDamage',p,lane:i,damage:n,kingdom:s.players[p].kingdom});}
const heal=(p,n)=>p.hp=Math.min(30,p.hp+n),mend=(u,n)=>{if(u)u.health=Math.min(u.hp,u.health+n)},food=(f,n)=>f.food=Math.max(0,Math.min(12,f.food+n)),repair=(f,n)=>f.integrity=Math.min(8,f.integrity+n);
const animal=u=>u&&['sheep','cow','bull','pig','hound','rat','fox','seal','ox','gull','turtle','fish','horse','hare','wolf','monkey','owl'].includes(u.behavior);
export function token(s,p,lane,kind){s.population??=[];if(s.population.length<24&&s.population.filter(a=>a.side===p&&a.lane===lane&&a.kind===kind).length<3)s.population.push({id:'token'+ ++s.entityId,side:p,lane,kind});}
export function extraEffect(s,p,c,i,api){const a=s.players[p],b=s.players[1-p],l=a.lanes[i],e=b.lanes[i],f=l.field,t=e.field,u=l.unit,v=e.unit;
 const terrain=(side,lane,k)=>terrainChange(s,side,lane,k,api),damage=(side,lane,n)=>fieldDamage(s,side,lane,n,api),hit=(unit,n)=>{if(unit)unit.health-=n},adj=[i-1,i,i+1].filter(j=>j>=0&&j<4),own=()=>terrain(p,i,c.effect),steal=n=>{const nfood=Math.min(n,t.food);food(t,-nfood);food(f,nfood)};
 switch(c.effect){
 case 'pig':terrain(p,i,'mud');break;case 'hound':case 'sprout':food(f,2);break;case 'boar':terrain(p,i,'thorns');break;
 case 'raven':if(v)v.atk=Math.max(1,v.atk-1);break;case 'rats':steal(2);break;
 case 'fox':terrain(p,i,'warm');break;case 'coal':repair(f,2);break;
 case 'owl':if(v&&['ice','snow','mirror'].includes(t.kind))v.frozen=true;break;case 'thief':steal(1);terrain(1-p,i,'ice');break;
 case 'musk':if(f.food&&u){u.hp+=2;u.health+=2}break;
 case 'gull':for(const j of adj.filter(j=>j!==i)){const ef=b.lanes[j].field;if(ef.food){food(ef,-1);food(f,1)}}break;
 case 'monkey':api.draw(s,p);a.hp=Math.max(0,a.hp-1);break;
 case 'turtle':terrain(p,i,'coral');break;case 'jelly':if(v&&wet(f)&&wet(t))v.frozen=true;break;
 case 'leech':if(v){hit(v,1);if(u){u.hp++;u.health++}}break;case 'angler':steal(3);break;
 case 'horse':if(l.building&&u)u.atk++;break;case 'squire':if(adj.some(j=>j!==i&&a.lanes[j].unit))api.draw(s,p);break;
 case 'mastiff':if(l.building)l.building.hp=Math.min(6,l.building.hp+2);break;case 'gargoyle':if(f.armor&&u){u.hp+=2;u.health+=2}break;
 case 'wolf':if(v&&v.health<v.hp)hit(v,2);break;case 'phoenix':terrain(p,i,'ash');heal(a,2);break;
 case 'irrigate':for(const j of adj){terrain(p,j,'water');food(a.lanes[j].field,2);repair(a.lanes[j].field,1)}break;
 case 'stampede':for(let j=0;j<4;j++){if(animal(a.lanes[j].unit)){hit(b.lanes[j].unit,2);api.emit(s,{kind:'charge',p,lane:j,kingdom:a.kingdom})}else damage(p,j,1)}break;
 case 'compost':terrain(p,i,'fertile');if(u)hit(u,1);repair(f,4);food(f,3);break;
 case 'bell':for(const lane of a.lanes)mend(lane.unit,animal(lane.unit)?2:1);break;
 case 'crows':{const targets=b.lanes.map((l,j)=>({u:l.unit,j})).filter(o=>o.u&&o.u.health>0).slice(0,3);if(targets.length){for(const o of targets){hit(o.u,2);api.emit(s,{kind:'crows',p,lane:i,targetLane:o.j,targetSide:1-p,kingdom:a.kingdom});}}else{damage(p,i,3);api.emit(s,{kind:'crows',p,lane:i,targetLane:i,targetSide:p,backfire:true,kingdom:a.kingdom});api.log(s,'No enemy creature can be hit: Crow Barrage ravages your own field!');}break;}
 case 'thorns':terrain(1-p,i,'thorns');break;case 'gale':case 'rope':case 'whirlpool':{if(c.effect==='whirlpool')terrain(1-p,i,'water');const j=b.lanes.findIndex((l,j)=>j!==i&&!l.unit);if(v){if(j>=0){b.lanes[j].unit=v;e.unit=null;}else hit(v,c.effect==='rope'?2:3)}if(c.effect==='rope'&&u)u.atk++;break;}
 case 'eclipse':for(let j=0;j<4;j++){terrain(1-p,j,'gloom');damage(1-p,j,1);if(b.lanes[j].unit)b.lanes[j].unit.atk=Math.max(1,b.lanes[j].unit.atk-1)}break;
 case 'seedRain':for(let j=0;j<4;j++){food(a.lanes[j].field,1);repair(a.lanes[j].field,1)}token(s,p,i,'seedling');break;
 case 'rootPrison':terrain(1-p,i,'roots');if(v)v.frozen=true;break;case 'spore':terrain(p,i,'fungi');for(const j of adj)mend(a.lanes[j].unit,3);break;
 case 'swap':{const old={kind:f.kind,food:f.food,hazard:f.hazard};Object.assign(f,{kind:t.kind,food:t.food,hazard:t.hazard});Object.assign(t,old);f.armor=0;t.armor=0;api.emit(s,{kind:'terrain',p,lane:i,kingdom:a.kingdom});api.emit(s,{kind:'terrain',p:1-p,lane:i,kingdom:b.kingdom});break;}
 case 'campfire':for(const j of adj){terrain(p,j,'warm');if(a.lanes[j].unit){a.lanes[j].unit.frozen=false;a.lanes[j].unit.exhausted=false;mend(a.lanes[j].unit,1)}}token(s,p,i,'fire');break;
 case 'rescue':{if(!u){const from=a.lanes.filter(l=>l.unit).sort((x,y)=>x.unit.health-y.unit.health)[0];if(from){l.unit=from.unit;from.unit=null}}mend(l.unit,3);break;}
 case 'blanket':for(let j=0;j<4;j++){terrain(p,j,'snow');a.lanes[j].field.armor=1}break;
 case 'lanterns':for(let j=0;j<3;j++)token(s,p,i,'lantern');heal(a,3);repair(f,2);break;
 case 'blackIce':terrain(1-p,i,'ice');hit(v,1);break;case 'shatter':for(const lane of b.lanes)hit(lane.unit,lane.unit?.frozen?4:1);break;
 case 'mirrorLake':terrain(p,i,'mirror');repair(f,2);if(u)u.atk++;break;case 'hail':token(s,1-p,i,'cloud');hit(v,2);damage(1-p,i,1);break;
 case 'salt':for(const lane of a.lanes)food(lane.field,2);break;
 case 'herd':for(let j=2;j>=0;j--)if(animal(a.lanes[j].unit)&&!a.lanes[j+1].unit){a.lanes[j+1].unit=a.lanes[j].unit;a.lanes[j].unit=null;repair(a.lanes[j+1].field,2)}break;
 case 'bridge':terrain(p,i,'bridge');mend(u,2);break;
 case 'mammoth':for(let j=0;j<4;j++)if(a.lanes[j].unit?.cost===2){damage(1-p,j,2);hit(b.lanes[j].unit,1)}break;
 case 'lowTide':{let draws=0;for(let side=0;side<2;side++)for(let j=0;j<4;j++)if(wet(s.players[side].lanes[j].field)){terrain(side,j,'sand');if(side===p&&draws++<2)api.draw(s,p)}break;}
 case 'powder':hit(v,5);damage(1-p,i,2);damage(p,i,1);break;
 case 'treasure':terrain(p,i,'sand');food(f,3);damage(p,i,1);api.draw(s,p);break;
 case 'coralGarden':for(const j of adj){terrain(p,j,'coral');repair(a.lanes[j].field,2);mend(a.lanes[j].unit,1)}break;
 case 'forecast':api.draw(s,p);if(s.phase==='battle')api.draw(s,p);if(!wet(f))damage(p,i,2);break;
 case 'echo':{heal(a,3);const index=a.discard.findLastIndex(c=>c.type==='creature');if(index>=0)a.hand.push(a.discard.splice(index,1)[0]);break;}
 case 'reefWall':for(let side=0;side<2;side++)for(let j=0;j<4;j++){const f=s.players[side].lanes[j].field;if(side===p&&f.kind==='coral')f.armor=1;if(side!==p&&!wet(f))damage(side,j,1)}break;
 case 'barnacle':terrain(1-p,i,'barnacles');food(t,-2);if(v)v.atk=Math.max(1,v.atk-1);break;
 case 'undertow':{const j=(i+1)%4;[l.unit,a.lanes[j].unit]=[a.lanes[j].unit,l.unit];mend(l.unit,1);mend(a.lanes[j].unit,1);break;}
 case 'drainOcean':for(let j=0;j<4;j++)if(wet(b.lanes[j].field)){terrain(1-p,j,'sand');damage(1-p,j,2);heal(a,1)}break;
 case 'road':for(const j of adj){terrain(p,j,'road');repair(a.lanes[j].field,1)}break;
 case 'volley':for(let j=0;j<4;j++)if(a.lanes[j].building){if(b.lanes[j].unit)hit(b.lanes[j].unit,2);else damage(1-p,j,1)}break;
 case 'duel':if(u&&v){const ua=u.atk,va=v.atk;hit(v,ua);hit(u,va)}else heal(a,1);break;
 case 'parade':for(const lane of a.lanes){repair(lane.field,2);if(lane.field.integrity===8&&lane.unit)lane.unit.atk++}break;
 case 'moat':terrain(p,i,'moat');f.armor=1;mend(u,1);break;
 case 'portcullis':hit(v,3);if(v)v.frozen=true;f.armor=1;break;
 case 'ration':{const n=Math.min(3,f.food);food(f,-n);heal(a,n?n*2:1);break;}
 case 'keep':f.integrity=8;if(l.building)l.building.hp=Math.min(6,l.building.hp+3);mend(u,2);break;
 case 'burn':terrain(1-p,i,'ash');damage(1-p,i,3);a.hp=Math.max(0,a.hp-1);break;
 case 'betrayal':if(u){const hitpoints=Math.min(8,u.health);u.health=0;if(v)hit(v,hitpoints);else damage(p,i,2)}break;
 case 'oath':a.hp=Math.max(0,a.hp-2);for(const lane of a.lanes)if(lane.unit)lane.unit.atk++;break;
 case 'throne':terrain(p,i,'thorns');if(u)u.atk+=3;break;
 }
}
export function extraFloop(s,p,i,api){const a=s.players[p],l=a.lanes[i],u=l.unit,f=l.field,b=s.players[1-p];if(!u)return false;const adj=[i-1,i+1].filter(j=>j>=0&&j<4);switch(u.ability){
case 'snuffle':food(f,1);mend(u,1);break;case 'nose':if(f.food){food(f,-1);api.draw(s,p)}break;case 'omen':if(b.lanes[i].unit)b.lanes[i].unit.atk=Math.max(1,b.lanes[i].unit.atk-2);break;
case 'nibble':if(f.food){food(f,-1);mend(u,2)}break;case 'bramble':u.atk+=Math.min(2,Math.floor(f.food/2));break;case 'sprout':if(f.food){food(f,-1);u.atk++;u.hp++;u.health++}break;
case 'embers':heal(a,Math.min(3,a.lanes.filter(l=>l.field.kind==='warm').length));break;case 'thaw':for(const j of adj)if(a.lanes[j].unit){a.lanes[j].unit.frozen=false;a.lanes[j].unit.exhausted=false}break;
case 'mirror':if(b.lanes[i].unit&&['ice','mirror','snow'].includes(f.kind))b.lanes[i].unit.frozen=true;break;case 'iceDraw':if(['ice','mirror','snow'].includes(f.kind))api.draw(s,p);break;
case 'slide':mend(u,wet(f)||f.kind==='snow'?3:1);break;case 'graze':if(f.food){food(f,-1);u.atk+=2}break;
case 'plunder':if(f.food)b.hp=Math.max(0,b.hp-2);break;case 'rigging':if(l.building)u.atk++;break;case 'shell':repair(f,2);mend(u,1);break;
case 'pulse':if(wet(f)&&b.lanes[i].unit)b.lanes[i].unit.health-=2;break;case 'leech':b.hp=Math.max(0,b.hp-1);heal(a,1);break;case 'debt':if(f.food>=2){food(f,-2);b.hp=Math.max(0,b.hp-3)}break;
case 'charge':for(const j of adj)if(a.lanes[j].unit)a.lanes[j].unit.atk++;break;case 'dispatch':if(adj.some(j=>a.lanes[j].unit))api.draw(s,p);break;
case 'guard':f.armor=1;break;case 'stone':if(f.armor){u.hp++;u.health++}break;case 'hunt':if(b.lanes[i].unit?.health<b.lanes[i].unit?.hp)b.lanes[i].unit.health-=3;break;
case 'cinder':u.health--;b.hp=Math.max(0,b.hp-2);break;default:return false;}return true;}
export function settleField(s,p,api){const a=s.players[p],b=s.players[1-p];for(let i=0;i<4;i++){let l=a.lanes[i],f=l.field,u=l.unit,build=l.building;if(u&&f.hazard&&f.kind!=='bridge')u.health-=f.hazard;if(u?.behavior==='pig'&&f.food){food(f,-1);mend(u,1);if(f.kind!=='thorns')terrainChange(s,p,i,'mud',api)}if(!build)continue;switch(build.effect){
case 'farm':food(f,2);repair(f,1);break;
case 'barn':if(animal(u))mend(u,2);break;
case 'coop':token(s,p,i,'hen');food(f,s.population.filter(v=>v.side===p&&v.lane===i&&v.kind==='hen').length);break;
case 'orchard':food(f,2);mend(u,1);break;case 'soup':{const injured=a.lanes.map(l=>l.unit).filter(Boolean).sort((a,b)=>(a.health/a.hp)-(b.health/b.hp))[0];mend(injured,2);break;}
case 'prism':if(b.lanes[i].unit&&(b.lanes[i].unit.frozen||b.lanes[i].unit.exhausted))b.lanes[i].unit.health--;break;
case 'pen':if(animal(u)&&(build.growth||0)<3){u.hp++;u.health++;build.growth=(build.growth||0)+1}break;
case 'wreck':repair(f,1);if(b.lanes[i].building){b.lanes[i].building.hp--;if(b.lanes[i].building.hp<=0){b.discard.push(b.lanes[i].building);b.lanes[i].building=null}}break;
case 'anemone':if(f.kind==='coral'&&b.lanes[i].unit)b.lanes[i].unit.health--;break;case 'jar':if(wet(f)){b.hp=Math.max(0,b.hp-1);heal(a,1)}break;
case 'drum':if(u&&(build.growth||0)<3){u.atk++;build.growth=(build.growth||0)+1}break;
case 'mason':repair(a.lanes.reduce((x,y)=>x.field.integrity<y.field.integrity?x:y).field,2);break;
case 'rebelCamp':if(u&&(build.growth||0)<4){a.hp=Math.max(0,a.hp-1);u.atk++;build.growth=(build.growth||0)+1}break;
}}
}
