export const SIZE = 16;
export const REALMS = Object.freeze({
  farm: {name:"Farm Kingdom",title:"Harvest King",icon:"🌾",building:"Hay Field",buildingIcon:"🏚️",bonus:"Gold harvest",color:"#c9a765"},
  ice: {name:"Ice Kingdom",title:"Frost Queen",icon:"❄️",building:"Ice House",buildingIcon:"🧊",bonus:"Frozen defenses",color:"#8cdbf5"},
  beach: {name:"Beach Kingdom",title:"Tide Monarch",icon:"🌊",building:"Dock",buildingIcon:"⚓",bonus:"Coastal trade",color:"#8dddcf"},
  medieval: {name:"Medieval Kingdom",title:"Iron King",icon:"🏰",building:"Knight House",buildingIcon:"🏯",bonus:"Fortified garrison",color:"#dbbc85"}
});
export const CARDS = Object.freeze({
  fighter:{name:"Fighter",icon:"⚔️",cost:2,tier:1,hp:5,attack:2,move:2,range:1,detail:"Reliable front-line warrior"},
  ranger:{name:"Ranger",icon:"🏹",cost:3,tier:1,hp:3,attack:2,move:2,range:3,detail:"Long-distance arrows"},
  rider:{name:"Shadow Rider",icon:"🐎",cost:4,tier:2,hp:5,attack:3,move:4,range:1,detail:"Lightning-fast cavalry"},
  guardian:{name:"Guardian",icon:"🛡️",cost:4,tier:2,hp:8,attack:2,move:1,range:1,detail:"Armored protector"},
  archmage:{name:"Archmage",icon:"🧙",cost:6,tier:3,hp:4,attack:4,move:2,range:2,detail:"Powerful magic attacks"}
});
export const sides = ["blue","red"];
const opponent = side => side === "blue" ? "red" : "blue";
export const inBounds = (x,y) => Number.isInteger(x) && Number.isInteger(y) && x>=0 && x<SIZE && y>=0 && y<SIZE;
export const distance = (a,b) => Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
function note(s,message){s.log.unshift(message);s.log=s.log.slice(0,7);}
export function terrainAt(s,x,y){
  if(!inBounds(x,y))return null;
  return y<=7?s.kingdom.red:s.kingdom.blue;
}
export function createMatch(realm="farm",enemyRealm){
  if(!REALMS[realm])throw Error("Unknown kingdom");
  const keys=Object.keys(REALMS).filter(k=>k!==realm);
  const red=enemyRealm&&REALMS[enemyRealm]?enemyRealm:keys[Math.floor(Math.random()*keys.length)];
  return {phase:"setup",kingdom:{blue:realm,red},turn:"blue",actions:2,round:1,
    gold:{blue:6,red:6},energy:{blue:0,red:0},units:[],buildings:[],winner:null,
    nextId:1,log:["Choose a square in the lower four rows to place your Commander."],lastAction:null};
}
export function unitAt(s,x,y){return s.units.find(u=>u.hp>0&&u.x===x&&u.y===y)||null;}
export function buildingAt(s,x,y){return s.buildings.find(b=>b.hp>0&&b.x===x&&b.y===y)||null;}
export function targetAt(s,x,y){return unitAt(s,x,y)||buildingAt(s,x,y);}
const free=(s,x,y)=>inBounds(x,y)&&!targetAt(s,x,y);
export function getCommander(s,side){return s.units.find(u=>u.side===side&&u.type==="commander"&&u.hp>0)||null;}
export function getBuilding(s,side){return s.buildings.find(b=>b.side===side)||null;}
function unit(s,side,type,x,y){
  const data=type==="commander"?{hp:12,attack:2,move:2,range:1}:CARDS[type];
  return {id:s.nextId++,side,type,x,y,hp:data.hp,maxHp:data.hp,attack:data.attack,move:data.move,range:data.range,acted:type!=="commander"};
}
export function placeCommander(s,side,x,y){
  if(s.phase!=="setup"||!sides.includes(side)||!inBounds(x,y))return false;
  if(getCommander(s,side)||!free(s,x,y))return false;
  if(side==="blue"&&y<12 || side==="red"&&y>3)return false;
  let choices=[[x+1,y],[x-1,y],[x,y+(side==="blue"?-1:1)],[x,y+(side==="blue"?1:-1)]];
  let spot=choices.find(([a,b])=>inBounds(a,b)&&free(s,a,b)&&(side==="blue"?b>=12:b<=3));
  if(!spot)return false;
  s.units.push(unit(s,side,"commander",x,y));
  const kind=s.kingdom[side],defense=kind==="medieval"?10:8;
  s.buildings.push({id:s.nextId++,type:"building",side,x:spot[0],y:spot[1],hp:defense,maxHp:defense,level:1});
  note(s,(side==="blue"?"Azure":"Crimson")+" "+REALMS[kind].title+" has founded a "+REALMS[kind].building+".");
  if(getCommander(s,"blue")&&getCommander(s,"red")){
    s.phase="battle";s.turn="blue";s.actions=2;
    for(const u of s.units)u.acted=false;
    note(s,"The battle begins. Defend your kingdom, deploy cards, destroy the enemy Commander!");
  }
  return true;
}
export function legalDeploy(s,side,type){
  const card=CARDS[type],b=getBuilding(s,side),commander=getCommander(s,side);
  if(s.phase!=="battle"||!card||s.turn!==side||s.actions<1||s.gold[side]<card.cost)return [];
  if(!commander||s.units.filter(u=>u.side===side&&u.hp>0).length>=13)return [];
  if(card.tier>1&&(!b||b.hp<=0||b.level<card.tier))return [];
  const origins=[commander,...(b&&b.hp>0?[b]:[])],out=[];
  for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
    if(side==="blue"?y<8:y>7)continue;
    if(free(s,x,y)&&origins.some(o=>distance(o,{x,y})<=3))out.push({x,y});
  }
  return out;
}
export function legalMoves(s,id){
  const u=s.units.find(v=>v.id===id&&v.hp>0);
  if(!u||s.phase!=="battle"||u.side!==s.turn||u.acted||s.actions<1)return [];
  const seen=new Set([u.x+","+u.y]),queue=[{x:u.x,y:u.y,d:0}],result=[];
  for(let i=0;i<queue.length;i++){
    const v=queue[i];if(v.d>=u.move)continue;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;
      const x=v.x+dx,y=v.y+dy,key=x+","+y;
      if(!seen.has(key)&&free(s,x,y)){seen.add(key);const next={x,y,d:v.d+1};queue.push(next);result.push({x,y});}
    }
  }
  return result;
}
export function legalAttacks(s,id,power=false){
  const u=s.units.find(v=>v.id===id&&v.hp>0);
  if(!u||s.phase!=="battle"||u.side!==s.turn||u.acted||s.actions<1)return [];
  if(power&&s.energy[u.side]<100)return [];
  const reach=u.range+(power?1:0);
  return [...s.units,...s.buildings].filter(v=>v.hp>0&&v.side!==u.side&&distance(u,v)<=reach).map(v=>({x:v.x,y:v.y}));
}
const has=(cells,x,y)=>cells.some(v=>v.x===x&&v.y===y);
function result(ok,message){return {ok,message};}
function finish(s,side){s.winner=side;s.phase="ended";note(s,(side==="blue"?"AZURE LEGION":"CRIMSON EMPIRE")+" VICTORY! The enemy Commander has fallen.");}
export function perform(s,a){
  if(!a||!sides.includes(a.side)||s.phase!=="battle"||a.side!==s.turn||s.actions<1)return result(false,"Not your turn.");
  const side=a.side;
  if(a.kind==="deploy"){
    const card=CARDS[a.card];
    if(!card||!has(legalDeploy(s,side,a.card),a.x,a.y))return result(false,"Card unavailable or placement is blocked.");
    s.gold[side]-=card.cost;s.units.push(unit(s,side,a.card,a.x,a.y));
    s.actions--;s.lastAction={kind:"deploy",x:a.x,y:a.y,side};
    note(s,(side==="blue"?"Azure ":"Crimson ")+card.name+" enters the field.");
    return result(true,"Warrior deployed.");
  }
  if(a.kind==="upgrade"||a.kind==="rebuild"){
    const b=getBuilding(s,side);if(!b)return result(false,"No kingdom building.");
    if(a.kind==="upgrade"){
      const cost=5+2*(b.level-1);
      if(b.hp<=0||b.level>=3||s.gold[side]<cost)return result(false,"Building cannot be upgraded.");
      s.gold[side]-=cost;b.level++;b.hp=Math.min(b.maxHp,b.hp+3);s.actions--;
      s.lastAction={kind:"upgrade",x:b.x,y:b.y,side};note(s,REALMS[s.kingdom[side]].building+" reaches level "+b.level+". Stronger cards unlocked!");
      return result(true,"Building upgraded.");
    }
    if(b.hp>0||s.gold[side]<4||!free(s,b.x,b.y)||!getCommander(s,side))return result(false,"Cannot rebuild here.");
    s.gold[side]-=4;b.hp=b.maxHp;b.level=1;s.actions--;
    s.lastAction={kind:"upgrade",x:b.x,y:b.y,side};note(s,"Your "+REALMS[s.kingdom[side]].building+" has been rebuilt.");
    return result(true,"Building rebuilt.");
  }
  const u=s.units.find(v=>v.id===a.id&&v.hp>0&&v.side===side);
  if(!u||u.acted)return result(false,"That warrior has already acted.");
  if(a.kind==="move"){
    if(!has(legalMoves(s,u.id),a.x,a.y))return result(false,"That square is not reachable.");
    const from={x:u.x,y:u.y};u.x=a.x;u.y=a.y;u.acted=true;s.actions--;
    s.lastAction={kind:"move",x:a.x,y:a.y,from,side};
    note(s,(u.type==="commander"?"Commander":CARDS[u.type].name)+" advances.");
    return result(true,"Warrior moved.");
  }
  if(a.kind==="attack"||a.kind==="power"){
    const charged=a.kind==="power";
    if(!has(legalAttacks(s,u.id,charged),a.x,a.y))return result(false,"Enemy is not in range.");
    const victim=targetAt(s,a.x,a.y);
    if(!victim||victim.side===side)return result(false,"Invalid target.");
    const damage=charged?u.attack*2+2:u.attack;
    victim.hp=Math.max(0,victim.hp-damage);u.acted=true;s.actions--;
    if(charged)s.energy[side]=0;else s.energy[side]=Math.min(100,s.energy[side]+35+(victim.hp<=0?10:0));
    s.lastAction={kind:a.kind,x:a.x,y:a.y,from:{x:u.x,y:u.y},side,damage};
    const name=victim.type==="building"?REALMS[s.kingdom[victim.side]].building:victim.type==="commander"?"Commander":CARDS[victim.type].name;
    note(s,(charged?"⚡ ULTIMATE! ":"")+"Hit "+name+" for "+damage+" damage"+(victim.hp===0?" and destroyed it!":"."));
    if(victim.type==="commander"&&victim.hp===0)finish(s,side);
    return result(true,"Attack landed.");
  }
  return result(false,"Unknown action.");
}
export function endTurn(s){
  if(s.phase!=="battle")return false;
  s.turn=opponent(s.turn);if(s.turn==="blue")s.round++;
  s.actions=2;const side=s.turn,b=getBuilding(s,side);
  for(const u of s.units)if(u.side===side)u.acted=false;
  s.gold[side]=Math.min(20,s.gold[side]+3+(b&&b.hp>0?b.level:0));
  s.energy[side]=Math.min(100,s.energy[side]+10);
  s.lastAction=null;
  return true;
}
export function runCpuTurn(s){
  if(s.phase!=="battle"||s.turn!=="red")return [];
  const events=[];
  for(let step=0;step<2&&s.phase==="battle"&&s.turn==="red";step++){
    const team=s.units.filter(u=>u.side==="red"&&u.hp>0&&!u.acted);
    const targets=[];
    for(const u of team)for(const power of [true,false]){
      if(power&&s.energy.red<100)continue;
      for(const cell of legalAttacks(s,u.id,power)){
        const victim=targetAt(s,cell.x,cell.y);
        const damage=power?u.attack*2+2:u.attack;
        let score=30+(victim.type==="commander"?45:0)+(victim.type==="building"?20:0)+(victim.hp<=damage?90:0)+Math.min(damage,victim.hp)*3;
        targets.push({kind:power?"power":"attack",side:"red",id:u.id,...cell,score});
      }
    }
    targets.sort((a,b)=>b.score-a.score);
    if(targets.length){const best=targets[0];const {score,...action}=best;events.push(perform(s,action));continue;}
    const building=getBuilding(s,"red"),count=s.units.filter(u=>u.hp>0&&u.side==="red"&&u.type!=="commander").length;
    if(building&&building.hp===0&&s.gold.red>=4&&free(s,building.x,building.y)){
      events.push(perform(s,{kind:"rebuild",side:"red"}));continue;
    }
    if(building&&building.hp>0&&building.level<3&&s.gold.red>=5+2*(building.level-1)&&count>=2){
      events.push(perform(s,{kind:"upgrade",side:"red"}));continue;
    }
    const choices=Object.keys(CARDS).filter(key=>legalDeploy(s,"red",key).length>0);
    if(choices.length&&count<7){
      choices.sort((a,b)=>CARDS[b].tier-CARDS[a].tier||CARDS[b].attack-CARDS[a].attack);
      let pick=choices.find(k=>CARDS[k].tier>1)||choices.find(k=>k==="ranger")||choices[0];
      const cells=legalDeploy(s,"red",pick),enemy=getCommander(s,"blue");
      cells.sort((a,b)=>distance(a,enemy)-distance(b,enemy));
      const spot=cells[0];events.push(perform(s,{kind:"deploy",side:"red",card:pick,x:spot.x,y:spot.y}));continue;
    }
    let best=null,score=-Infinity;
    const enemies=[...s.units,...s.buildings].filter(e=>e.side==="blue"&&e.hp>0);
    for(const u of team){
      if(u.type==="commander"&&team.some(v=>v.type!=="commander"))continue;
      const goal=enemies.length?enemies.reduce((a,b)=>distance(u,a)<distance(u,b)?a:b):null;
      if(!goal)continue;
      for(const cell of legalMoves(s,u.id)){
        const progress=distance(u,goal)-distance(cell,goal);
        const rating=progress*12+cell.y*1.3+(u.type==="commander"?-30:0)+(Math.random()*1.5);
        if(rating>score){score=rating;best={kind:"move",side:"red",id:u.id,x:cell.x,y:cell.y};}
      }
    }
    if(best&&score>-20){events.push(perform(s,best));continue;}
    break;
  }
  if(s.phase==="battle")endTurn(s);
  return events;
}
