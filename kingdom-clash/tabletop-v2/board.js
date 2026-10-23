import * as T from '../vendor/three.js';
import {LANDSCAPES} from './field-deck.js';
import {makeMiniature,animateMiniature} from './miniatures.js';

const X=i=>(i-1.5)*5.65;
const colors={corn:0x8ea948,blue:0x4a9fb4,swamp:0x617956,ice:0xbadce3,sand:0xcfad70,stone:0x96998e,blank:0x393c36};
const tableCorners=[];
for(const x of[-13.8,13.8])for(const y of[-.75,1.4])for(const z of[-12.5,12.5])tableCorners.push(new T.Vector3(x,y,z));
// Fit the whole tabletop to the actual canvas aspect, including its raised edge and miniatures.
export function fitTableDistance(width,height,yaw=0,pitch=.69){
 const camera=new T.PerspectiveCamera(height>width?56:46,width/height,.1,240);
 const direction=new T.Vector3(Math.sin(yaw)*.32,Math.sin(pitch),Math.cos(yaw)*.86).normalize();
 let lo=10,hi=240;
 for(let i=0;i<18;i++){
  const distance=(lo+hi)/2;camera.position.copy(direction).multiplyScalar(distance);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const fits=tableCorners.every(corner=>{const point=corner.clone().project(camera);return point.z<1&&Math.abs(point.x)<.86&&Math.abs(point.y)<.86;});
  if(fits)hi=distance;else lo=distance;
 }
 return hi;
}
export function projectCanvasPoint(x,z,W,H,cam){const zoom=36/cam.zoom,fit=1-Math.abs(cam.yaw)*.25,rx=(x-cam.x)*Math.cos(cam.yaw)+(z-cam.z)*Math.sin(cam.yaw)*.75,rz=(z-cam.z)*Math.cos(cam.yaw)-(x-cam.x)*Math.sin(cam.yaw)*.45,p=(rz+11.7)/23.4;return [W*.5+rx*W*.037*(.70+p*.31)*zoom*fit,H*(.15+p*.72)*zoom+(1-zoom)*H*.49];}
export function pickCanvasLane(px,py,W,H,cam){const zoom=36/cam.zoom,fit=1-Math.abs(cam.yaw)*.25,progress=((py-(1-zoom)*H*.49)/zoom/H-.15)/.72,rz=progress*23.4-11.7,rx=(px-W*.5)/(W*.037*(.70+progress*.31)*zoom*fit),cos=Math.cos(cam.yaw),sin=Math.sin(cam.yaw),det=cos*cos+sin*sin*.3375,dx=(rx*cos-rz*sin*.75)/det,dz=(rz*cos+rx*sin*.45)/det,x=dx+cam.x,z=dz+cam.z;return Math.abs(x)<11.4&&Math.abs(z)<11.8?Math.max(0,Math.min(3,Math.round(x/5.65+1.5))):null;}
const mats=new Map();
function mat(color){if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.87}));return mats.get(color);}
function shape(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
const cube=(g,c,x,y,z,w,h,d)=>shape(g,new T.BoxGeometry(w,h,d),c,x,y,z);
const orb=(g,c,x,y,z,sx,sy,sz)=>{const m=shape(g,new T.SphereGeometry(1,10,8),c,x,y,z);m.scale.set(sx,sy,sz);return m;};
const stalk=(g,c,x,y,z,r,h)=>shape(g,new T.CylinderGeometry(r*.55,r,h,7),c,x,y+h/2,z);

function tabletop(scene){const g=new T.Group();scene.add(g);
 cube(g,0x5d3928,0,-.75,0,27.6,1.2,26);cube(g,0x93643f,0,-.12,0,27.5,.14,25.8);
 for(let j=0;j<13;j++)cube(g,j%2?0x795138:0x81553a,0,-.01,-11.8+j*1.95,27,.025,.045);
 for(const x of[-13.45,13.45]){cube(g,0xc69859,x,.12,0,.37,.45,25.5);for(let j=0;j<13;j++)orb(g,0xe7bc77,x,.37,-11.6+j*1.95,.065,.065,.065);}
 for(const z of[-12.2,12.2]){cube(g,0xc69859,0,.12,z,26.9,.48,.39);for(let i=0;i<4;i++)cube(g,0xf1cc7e,X(i),.39,z,4.9,.04,.09);}
 for(let i=0;i<4;i++){const x=X(i);cube(g,0x332f2a,x,.10,0,5.53,.18,23.55);for(const side of[-1,1]){cube(g,0xd1ac6c,x+side*2.76,.35,0,.075,.39,22.8);for(let j=0;j<12;j++)orb(g,0xefd5a4,x+side*2.76,.57,-10.8+j*1.96,.055,.055,.055);}cube(g,0xe2b964,x,.30,0,5.48,.11,.17);}
 return g;
}

function landscape(parent,kind,lane,team){const g=new T.Group();parent.add(g);g.position.set(X(lane),.32,team? -5.65:5.65);
 const color=colors[kind]||colors.blank;cube(g,0x4f3b29,0,0,0,5.44,.34,10.9);cube(g,color,0,.18,0,5.29,.08,10.7);
 const edge=kind==='blue'?0xb5e3d4:kind==='ice'?0xe7f6f4:kind==='blank'?0x877250:0xd4bd77;
 for(const x of[-2.65,2.65])cube(g,edge,x,.25,0,.035,.06,10.5);
 if(kind==='blank'){for(let j=0;j<6;j++)cube(g,0x6e5940,(j%3-1)*1.42,.225,(Math.floor(j/3)-.5)*3,.62,.012,.09);return g;}
 const seed=lane*23+team*67,details=new T.Group();g.add(details);g.userData.details=details;
 for(let j=0;j<48;j++){const x=((j*73+seed*11)%91)/91*4.74-2.37,z=((j*37+seed*5)%89)/89*9.9-4.95;
  if(kind==='corn'){
   if(j%3===0){stalk(details,0x577b38,x,.22,z,.065,.38+(j%5)*.06);orb(details,0xdcb64b,x,.68+(j%5)*.06,z,.11,.21,.09);for(const side of[-1,1]){const leaf=orb(details,0x769b43,x+side*.13,.43,z,.18,.035,.08);leaf.rotation.z=side*.35;}}
   else orb(details,j%5?0x688840:0x9cb252,x,.24,z,.075,.045,.055);
  }else if(kind==='blue'){if(j%4===0){orb(details,0x9bdbcd,x,.25,z,.11,.06,.05);stalk(details,0x427f79,x,.25,z,.018,.14);}else if(j%3===0)cube(details,0x70bfd0,x,.224,z,.16,.008,.032);}
  else if(kind==='ice'){if(j%4===0)orb(details,0xf0faf7,x,.25,z,.12,.07,.13);else if(j%3===0)cube(details,0x81b6c4,x,.23,z,.26,.012,.025);}
  else if(kind==='swamp'){if(j%4===0){orb(details,0x52664b,x,.24,z,.20,.03,.15);stalk(details,0x876d48,x,.25,z,.025,.25);}else if(j%3===0)orb(details,0x859757,x,.24,z,.08,.025,.08);}
  else{if(j%4===0)orb(details,kind==='stone'?0xb1b1a2:0xe3ca93,x,.24,z,.14,.08,.12);}
 }
 return g;
}

function fallingCard(scene,kind,lane,team){const g=new T.Group();scene.add(g);g.position.set(X(lane),4,team?-5.65:5.65);cube(g,0xf1d8a5,0,0,0,4.1,.09,6.1);cube(g,colors[kind]||0xc6a36b,0,.07,0,3.72,.025,5.72);return g;}

export function makeBoard(canvas,onLane){let renderer=null,scene,table,camera,raycaster,plane,ctx=null;const cameraState={yaw:0,pitch:.69,zoom:36,x:0,z:0};let frameKey='',frameDistance=36,dragging=null,clock=0;const terrain=new Map(),actors=new Map(),summons=[],bursts=[];const events=new AbortController();
 try{
  renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
  scene=new T.Scene();scene.background=new T.Color(0x253b34);scene.fog=new T.Fog(0x253b34,110,190);camera=new T.PerspectiveCamera(46,1,.1,240);
  scene.add(new T.HemisphereLight(0xddeacb,0x513a2e,2));const sun=new T.DirectionalLight(0xffdfa5,2.65);sun.position.set(-9,19,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;scene.add(sun);
  table=tabletop(scene);raycaster=new T.Raycaster();plane=new T.Plane(new T.Vector3(0,1,0),-.39);
 }catch(_){renderer?.dispose();renderer=null;ctx=canvas.getContext('2d');}
 function moveCamera(action){if(action==='left')cameraState.x=Math.max(-8,cameraState.x-1.8);if(action==='right')cameraState.x=Math.min(8,cameraState.x+1.8);if(action==='orbit')cameraState.yaw=cameraState.yaw>.45?0:cameraState.yaw+.19;if(action==='zoomIn')cameraState.zoom=Math.max(20,cameraState.zoom-3);if(action==='zoomOut')cameraState.zoom=Math.min(49,cameraState.zoom+3);if(action==='reset')Object.assign(cameraState,{yaw:0,pitch:.69,zoom:36,x:0,z:0});updateCamera();}
 function updateCamera(){if(!camera)return;const s=cameraState,key=`${camera.aspect}/${s.yaw}/${s.pitch}`;if(key!==frameKey){frameDistance=fitTableDistance(camera.aspect,1,s.yaw,s.pitch);frameKey=key;}const distance=frameDistance*s.zoom/36,direction=new T.Vector3(Math.sin(s.yaw)*.32,Math.sin(s.pitch),Math.cos(s.yaw)*.86).normalize();camera.position.copy(direction.multiplyScalar(distance)).add(new T.Vector3(s.x,0,s.z));camera.lookAt(s.x,0,s.z);camera.updateProjectionMatrix();}
 function resize(){const r=canvas.getBoundingClientRect(),d=renderer?Math.min(window.devicePixelRatio||1,1.5):1,w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){if(renderer){renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=r.height>r.width?56:46;camera.updateProjectionMatrix();}else{canvas.width=w;canvas.height=h;}}updateCamera();}
 function pick(cx,cy){const r=canvas.getBoundingClientRect();if(renderer){raycaster.setFromCamera(new T.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height*2-1)),camera);const hit=new T.Vector3();if(raycaster.ray.intersectPlane(plane,hit)&&Math.abs(hit.x)<11.4&&Math.abs(hit.z)<11.8)return Math.max(0,Math.min(3,Math.round(hit.x/5.65+1.5)));return null;}
  return pickCanvasLane((cx-r.left)*canvas.width/r.width,(cy-r.top)*canvas.height/r.height,canvas.width,canvas.height,cameraState);}
 canvas.addEventListener('pointerdown',e=>{dragging={x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,moved:false};canvas.setPointerCapture?.(e.pointerId);},{signal:events.signal});
 canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.hypot(e.clientX-dragging.originX,e.clientY-dragging.originY)>7)dragging.moved=true;if(dragging.moved){if(e.shiftKey){cameraState.x=Math.max(-8,Math.min(8,cameraState.x-dx*.027));cameraState.z=Math.max(-6,Math.min(6,cameraState.z+dy*.027));}else{cameraState.yaw=Math.max(-.8,Math.min(.8,cameraState.yaw-dx*.004));cameraState.pitch=Math.max(.42,Math.min(1.14,cameraState.pitch+dy*.003));}updateCamera();}dragging.x=e.clientX;dragging.y=e.clientY;},{signal:events.signal});
 canvas.addEventListener('pointerup',e=>{if(dragging&&!dragging.moved){const lane=pick(e.clientX,e.clientY);if(lane!==null)onLane(lane);}dragging=null;},{signal:events.signal});
 canvas.addEventListener('wheel',e=>{e.preventDefault();cameraState.zoom=Math.max(20,Math.min(49,cameraState.zoom+Math.sign(e.deltaY)*2));updateCamera();},{signal:events.signal,passive:false});
 function summon(key,lane,team=0){bursts.push({lane,team,age:0});if(renderer)summons.push({mesh:fallingCard(table,LANDSCAPES[key]?key:key==='cornfield'?'corn':'sand',lane,team),age:0});}
 function syncTerrain(field,world){if(!renderer)return;for(let lane=0;lane<4;lane++)for(let team=0;team<2;team++){const kind=team?(world?.lanes[lane].enemyTerrain||'corn'):(field.slots[lane]||'blank'),id=`${team}-${lane}`,old=terrain.get(id);if(old?.kind===kind)continue;if(old)table.remove(old.group);const group=landscape(table,kind,lane,team);terrain.set(id,{kind,group});}}
 function syncActors(world,dt){if(!renderer||!world)return;const active=new Set();for(const object of [...world.buildings,...world.units]){active.add(object.id);let item=actors.get(object.id);if(!item){const mesh=makeMiniature(object.key);table.add(mesh);mesh.scale.setScalar(.001);item={mesh,age:0};actors.set(object.id,item);bursts.push({lane:object.lane,team:object.team,age:0});}item.age+=dt;const rise=Math.min(1,item.age/.8),bounce=1+Math.sin(Math.min(1,item.age/.8)*Math.PI)*.32;item.mesh.scale.setScalar(rise*bounce*(world.buildings.includes(object)?1.1:1));item.mesh.position.set(object.x,.55+Math.sin(clock*3+object.id.length)*.025+Math.max(0,1-rise)*1.5,object.z);item.mesh.rotation.y=object.team?0:Math.PI;animateMiniature(item.mesh,object,clock);}
 for(const [id,item]of actors)if(!active.has(id)){table.remove(item.mesh);actors.delete(id);}}
 function render(field,world,dt){resize();clock+=Math.min(.07,dt);for(const burst of bursts)burst.age+=dt;for(let i=bursts.length-1;i>=0;i--)if(bursts[i].age>1.1)bursts.splice(i,1);if(!renderer){paint(ctx,canvas,field,world,clock,cameraState,bursts);return;}
  syncTerrain(field,world);for(const [id,item]of terrain){if(item.kind==='corn'&&item.group.userData.details){const [team,lane]=id.split('-').map(Number),amount=world?(team?world.lanes[lane].enemyCrop:world.lanes[lane].crop):team?.75:.7;item.group.userData.details.scale.y=Math.max(.02,amount);}}syncActors(world,dt);for(let i=summons.length-1;i>=0;i--){const s=summons[i];s.age+=dt;s.mesh.position.y=4-(Math.min(1,s.age/.72)*3.54);s.mesh.rotation.y+=dt*2;s.mesh.scale.setScalar(Math.max(.001,1-s.age/.95));if(s.age>=.95){table.remove(s.mesh);summons.splice(i,1);}}
  renderer.render(scene,camera);
 }
 return {render,moveCamera,summon,mode:renderer?'3d':'canvas',dispose(){events.abort();renderer?.dispose();terrain.clear();actors.clear();}};
}

// The same card slots and state remain playable when the browser disables WebGL.
function poly(c,points,color,stroke=null,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function oval(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function figure(c,o,x,y,s,t){c.save();c.translate(x,y);c.scale(s,s);const bob=o.action==='walk'?Math.abs(Math.sin(t*9))*6:Math.sin(t*2)*2;c.translate(0,-bob);oval(c,0,0,32,11,'#151e1b88');oval(c,0,-6,28,11,o.team?'#d59d61':'#e7c976');const kind=o.key;
 if(kind==='pig'){oval(c,0,-39,25,21,'#d99591');oval(c,7,-57,17,16,'#f0b0a5');poly(c,[[-3,-70],[-11,-87],[6,-76]],'#e5a29b');poly(c,[[18,-72],[31,-86],[30,-65]],'#e5a29b');oval(c,13,-55,12,7,'#d8858b');for(const eye of[0,20])oval(c,eye,-62,3,4,'#26312b');for(const foot of[-16,16]){oval(c,foot,-18,7,12,'#c67b76');oval(c,foot,-9,8,4,'#865552');}}
 else if(['barn','school','cornfield','silo','den','throne'].includes(kind)){c.fillStyle=kind==='barn'?'#a34936':kind==='school'?'#d1ad76':'#947549';c.fillRect(-25,-51,50,42);poly(c,[[-30,-50],[0,-77],[30,-50]],kind==='barn'?'#6e3d34':'#61716b');c.fillStyle='#503c32';c.fillRect(-7,-32,14,23);}
 else if(['dog','wolf','sheep'].includes(kind)){oval(c,0,-37,24,17,kind==='sheep'?'#efe9d7':'#8fb7c1');oval(c,12,-49,16,14,kind==='sheep'?'#fbf6e4':'#9fc5ce');for(const eye of[5,19])oval(c,eye,-52,2.5,3,'#243a3c');for(const foot of[-15,15])oval(c,foot,-18,6,10,'#748990');}
 else{for(const foot of[-10,10]){c.fillStyle='#56493c';c.fillRect(foot-5,-23,9,19);}c.fillStyle=kind==='husker'?'#89964e':kind==='archer'?'#9e7652':'#637d78';c.fillRect(-16,-58,32,40);oval(c,0,-64,12,13,'#d4ac80');poly(c,[[-18,-73],[0,-89],[18,-73]],kind==='husker'?'#e5c45b':'#526267');}
 c.fillStyle='#23312c';c.fillRect(-26,-93,52,5);c.fillStyle=o.team?'#d87452':'#89d76e';c.fillRect(-26,-93,52*Math.max(0,o.hp/o.max),5);c.restore();}
function paint(c,canvas,field,world,t,cam,bursts){const W=canvas.width,H=canvas.height,project=(x,z)=>projectCanvasPoint(x,z,W,H,cam);
 const background=c.createLinearGradient(0,0,W,H);background.addColorStop(0,'#243c34');background.addColorStop(1,'#172d2b');c.fillStyle=background;c.fillRect(0,0,W,H);
 poly(c,[project(-13.8,-12.5),project(13.8,-12.5),project(13.8,12.5),project(-13.8,12.5)],'#5d3d2b','#d1a56b',Math.max(3,W/260));
 poly(c,[project(-12.9,-11.7),project(12.9,-11.7),project(12.9,11.7),project(-12.9,11.7)],'#9c714b','#3e3028',3);
 for(let lane=0;lane<4;lane++){const x0=-11.3+lane*5.65,x1=x0+5.65;for(const team of[1,0]){const z0=team?-11.15:.12,z1=team?-.12:11.15,kind=team?(world?.lanes[lane].enemyTerrain||'corn'):(field.slots[lane]||'blank'),config=LANDSCAPES[kind],base=config?.tone||'#474941';
  poly(c,[project(x0+.08,z0),project(x1-.08,z0),project(x1-.08,z1),project(x0+.08,z1)],'#4e392b','#cfac70',2.5);
  poly(c,[project(x0+.20,z0+.19),project(x1-.20,z0+.19),project(x1-.20,z1-.19),project(x0+.20,z1-.19)],base);
  if(kind!=='blank')for(let j=0;j<62;j++){const ix=((j*71+lane*37+team*13)%101)/101,iz=((j*41+lane*19+team*23)%97)/97,x=x0+.45+ix*4.75,z=z0+.42+iz*(z1-z0-.84),[px,py]=project(x,z),s=Math.max(.5,W/1350)*(.73+(z+12)/48);if(kind==='corn'){const crop=world?(team?world.lanes[lane].enemyCrop:world.lanes[lane].crop):.75;if(j/62>crop)continue;c.strokeStyle=j%3?'#6b883c':'#4e7635';c.lineWidth=2*s;c.beginPath();c.moveTo(px,py);c.lineTo(px,py-(3+crop*8)*s);c.stroke();if(j%3===0){oval(c,px,py-(3+crop*8)*s,3*s,7*s*crop,'#d9b84e');oval(c,px-4*s,py-6*s*crop,5*s,2*s,'#83a84a');}}
   else if(kind==='blue'){oval(c,px,py,3*s,1*s,j%3?'#7fc3cf':'#b3e2d9');if(j%4===0){c.fillStyle='#d0e7ad';c.fillRect(px,py-4*s,2*s,4*s);}}
   else if(kind==='ice'){oval(c,px,py,4*s,1.5*s,j%3?'#ecf5ed':'#7eb6c5');}
   else oval(c,px,py,3*s,1.3*s,j%3?'#c1a975':'#718764');}
  if(kind==='blank'){const [px,py]=project((x0+x1)/2,(z0+z1)/2);c.save();c.font=`700 ${Math.max(12,W/85)}px Georgia`;c.textAlign='center';c.fillStyle='#bca87c';c.fillText('PLACE LANDSCAPE',px,py);c.restore();}
 }
 poly(c,[project(x0,0),project(x1,0),project(x1,.2),project(x0,.2)],'#e8be78','#866642',2);
 }
 for(const z of[-11.4,11.4])for(let j=0;j<18;j++){const [x,y]=project(-12.3+j*1.45,z);c.fillStyle='#7d5a3c';c.fillRect(x-2,y-9,4,10);}
 if(world){for(const o of [...world.buildings,...world.units].sort((a,b)=>a.z-b.z)){const [x,y]=project(o.x,o.z);figure(c,o,x,y,Math.max(.53,Math.min(1.3,W/1150))*(.8+(o.z+11)/45),t);}}
 for(const b of bursts){const [x,y]=project(X(b.lane),b.team?-5.65:5.65),age=b.age;c.save();c.globalAlpha=1-age;oval(c,x,y,8+age*62,3+age*22,'#ffe79b88');c.strokeStyle='#ffe8a8';c.lineWidth=3;c.beginPath();c.ellipse(x,y,10+age*45,4+age*17,0,0,Math.PI*2);c.stroke();c.restore();}
}
