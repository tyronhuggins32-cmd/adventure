import {distance} from './terrain.js?v=world10';
const alive=(w,side,id)=>w.entities.filter(e=>e.hp>0&&e.side===side&&(!id||e.card.id===id));
const foodNear=(w,b,r=20)=>w.terrain.cells.filter(c=>c.owner===b.side&&c.food>0&&['corn','meadow','grove'].includes(c.kind)&&distance(c,b)<r);
function breed(w,b,choices,max=5){
 if(w.time<(b.productionAt||0)||alive(w,b.side).filter(e=>choices.includes(e.card.id)).length>=max)return;
 const crop=foodNear(w,b)[0];if(!crop)return;const index=b.births||0,id=choices[index%choices.length];
 const place=[[-8,0],[8,0],[0,8],[0,-8],[10,6],[-10,6]][index%6];const x=b.x+place[0],z=b.z+place[1];
 if(!w.terrain.walkable(x,z,w.structures)){b.productionAt=w.time+6;return;}
 crop.food--;w.terrain.version++;const child=w.spawn(id,b.side,x,z);b.births=index+1;b.productionAt=w.time+(b.card.id==='barn'?26:34);
 if(b.card.id==='livestockPen'){child.maxHp=Math.ceil(child.maxHp*1.2);child.hp=child.maxHp;child.penBorn=true;}
 w.note(b.card.name+' raises '+child.card.name+'.');
}
function seededShot(w,b){const target=w.closest(b,e=>e.side!==b.side&&!e.inside,43);if(!target)return;
 b.action=.7;b.state='loading seeds';w.projectiles.push({id:++w.serial,source:b,target,side:b.side,x:b.x,z:b.z,age:0,speed:25,damage:4,area:7,seedPod:true});
}
export function actBuilding(w,b){const id=b.card.id;
 if(id==='farm'){
  for(const c of w.terrain.cells)if(distance(c,b)<22&&c.kind!=='water'&&c.kind!=='mazeWall'&&c.kind!=='snow'&&!c.fire){c.kind='corn';c.owner=b.side;c.food=Math.min(4,c.food+1);}
  for(const e of alive(w,b.side))if(e.card.type==='creature'&&distance(e,b)<20&&w.terrain.cell(e.x,e.z).kind==='corn')e.hp=Math.min(e.maxHp,e.hp+1);
  w.terrain.version++;return;
 }
 if(id==='barn'||id==='cave'||id==='livestockPen'){
  for(const e of alive(w,b.side))if(e.inside===b.id||['pig','sheep','cow','bull'].includes(e.card.behavior)&&distance(e,b)<15){e.hp=Math.min(e.maxHp,e.hp+2);e.morale=Math.min(100,e.morale+8);if(e.inside===b.id&&e.order?.kind==='rest'&&e.hp>=e.maxHp*.85){e.inside=null;e.order=null;}}
  if(id==='barn')breed(w,b,['sheep','pig','cow'],6);
  if(id==='livestockPen')breed(w,b,['pig','sheep','cow','bull'],8);return;
 }
 if(id==='mill'){
  const crop=foodNear(w,b,26).find(c=>c.kind==='corn'&&c.food>=2);
  if(crop){crop.food-=2;w.grain[b.side]=Math.min(25,w.grain[b.side]+2);w.terrain.version++;b.action=.35;}
  if(w.grain[b.side]>0){let fed=0;for(const e of alive(w,b.side))if(e.card.type!=='building'&&distance(e,b)<28){e.hp=Math.min(e.maxHp,e.hp+2);e.hunger=Math.max(0,e.hunger-18);e.rationUntil=w.time+9;fed++;}if(fed)w.grain[b.side]--;}
  return;
 }
 if(id==='seedSlinger'){seededShot(w,b);return;}
 if(id==='harvestCart'){
  if(w.time<(b.productionAt||0)||alive(w,b.side,'cart').length>=2)return;
  const crop=foodNear(w,b,28).find(c=>c.kind==='corn'&&c.food>=2);if(!crop)return;
  const z=b.z+(b.side?-9:9);if(!w.terrain.walkable(b.x,z,w.structures))return;
  crop.food-=2;w.terrain.version++;const cart=w.spawn('cart',b.side,b.x,z);cart.origin=b.id;b.productionAt=w.time+40;w.note('The Harvest Cart rolls out toward enemy fortifications.');return;
 }
 if(id==='crowRoost'){breed(w,b,['crow'],4);return;}
 if(id==='briarSnare'){
  for(const e of alive(w,1-b.side))if(distance(e,b)<17&&!e.inside){e.slowUntil=w.time+5;e.morale=Math.max(0,e.morale-7);if(distance(e,b)<10)w.hurt(e,2,b);}return;
 }
 if(id==='hauntedSilo'){breed(w,b,['straw'],3);return;}
 if(id==='seedShrine'||id==='elderGrove'){
  for(const c of w.terrain.cells)if(distance(c,b)<(id==='elderGrove'?23:17)&&c.kind!=='water'&&c.kind!=='snow'&&!c.fire){c.kind='corn';c.owner=b.side;c.food=Math.min(4,c.food+1);}w.terrain.version++;
  breed(w,b,id==='elderGrove'?['ent']:['kernel'],id==='elderGrove'?2:5);return;
 }
 if(id==='rootCircle'){
  for(const e of alive(w,b.side))if(distance(e,b)<20){e.hp=Math.min(e.maxHp,e.hp+2);e.rootedUntil=w.time+8;}
  for(const e of alive(w,1-b.side))if(distance(e,b)<18){e.slowUntil=w.time+6;e.morale=Math.max(0,e.morale-9);}return;
 }
 if(id==='iceDen'){for(const e of alive(w,b.side,'wolf'))if(distance(e,b)<18){e.hp=Math.min(e.maxHp,e.hp+1);e.morale=Math.min(100,e.morale+5);}return;}
 if(id==='tower'){const target=w.closest(b,e=>e.side!==b.side&&!e.inside,30);if(target)w.attack(b,target);}
}
