import * as T from '../vendor/three.js';
import {LANDSCAPES} from './field-deck.js';
import {makeMiniature,animateMiniature} from './miniatures.js';

const X=i=>(i-1.5)*5.65;
export const TABLE_SCALE=2;
export const FIELD_SIZE=Object.freeze({width:1.5,length:3});
const physicalX=x=>x*FIELD_SIZE.width,physicalZ=z=>z*FIELD_SIZE.length;
// Temporary miniatures keep their geometry; only their footprint on the field changes.
export const MODEL_SCALE=Object.freeze({creature:.35,building:.65});
const colors={corn:0x8ea948,blue:0x4a9fb4,swamp:0x617956,ice:0xbadce3,sand:0xcfad70,stone:0x96998e,blank:0x393c36};
const tableCorners=[];
for(const x of[-13.8,13.8])for(const y of[-.75,4.4])for(const z of[-12.5,12.5])tableCorners.push(new T.Vector3(physicalX(x),y,physicalZ(z)).multiplyScalar(TABLE_SCALE));
// Fit the whole tabletop to the actual canvas aspect, including its raised edge and miniatures.
export function fitTableDistance(width,height,yaw=0,pitch=.69,fov=height>width?56:46){
 const camera=new T.PerspectiveCamera(fov,width/height,.1,500);
 const direction=new T.Vector3(Math.sin(yaw)*.32,Math.sin(pitch),Math.cos(pitch)*.86).normalize();
 let lo=10,hi=480;
 for(let i=0;i<18;i++){
  const distance=(lo+hi)/2;camera.position.copy(direction).multiplyScalar(distance);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const fits=tableCorners.every(corner=>{const point=corner.clone().project(camera);return point.z<1&&Math.abs(point.x)<.86&&Math.abs(point.y)<.86;});
  if(fits)hi=distance;else lo=distance;
 }
 return hi;
}
export function projectCanvasPoint(x,z,W,H,cam){const zoom=36/cam.zoom,vertical=Number.isInteger(cam.focused)?1:zoom,fit=1-Math.abs(cam.yaw)*.25,rx=(x-cam.x)*Math.cos(cam.yaw)+(z-cam.z)*Math.sin(cam.yaw)*1.5,rz=(z-cam.z)*Math.cos(cam.yaw)-(x-cam.x)*Math.sin(cam.yaw)*.225,p=(rz+11.7)/23.4,lens=Number.isInteger(cam.focused)?4/3:1;return [W*.5+rx*W*.02775*(.70+p*.31)*zoom*fit*lens,H*(.06+p*.86)*vertical+(1-vertical)*H*.49];}
export function pickCanvasLane(px,py,W,H,cam){const zoom=36/cam.zoom,vertical=Number.isInteger(cam.focused)?1:zoom,fit=1-Math.abs(cam.yaw)*.25,progress=((py-(1-vertical)*H*.49)/vertical/H-.06)/.86,rz=progress*23.4-11.7,lens=Number.isInteger(cam.focused)?4/3:1,rx=(px-W*.5)/(W*.02775*(.70+progress*.31)*zoom*fit*lens),cos=Math.cos(cam.yaw),sin=Math.sin(cam.yaw),det=cos*cos+sin*sin*.3375,dx=(rx*cos-rz*sin*1.5)/det,dz=(rz*cos+rx*sin*.225)/det,x=dx+cam.x,z=dz+cam.z;return Math.abs(x)<11.4&&Math.abs(z)<11.8?Math.max(0,Math.min(3,Math.round(x/5.65+1.5))):null;}
const mats=new Map();
function mat(color){if(!mats.has(color))mats.set(color,new T.MeshStandardMaterial({color,roughness:.87}));return mats.get(color);}
function shape(g,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
const cube=(g,c,x,y,z,w,h,d)=>shape(g,new T.BoxGeometry(w,h,d),c,x,y,z);
const orb=(g,c,x,y,z,sx,sy,sz)=>{const m=shape(g,new T.SphereGeometry(1,10,8),c,x,y,z);m.scale.set(sx,sy,sz);return m;};
const stalk=(g,c,x,y,z,r,h)=>shape(g,new T.CylinderGeometry(r*.55,r,h,7),c,x,y+h/2,z);
function instances(parent,geometry,color,positions){if(!positions.length)return;const mesh=new T.InstancedMesh(geometry,mat(color),positions.length),dummy=new T.Object3D();positions.forEach(([x,y,z,sx,sy,sz,turn=0],index)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.z=turn;dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);}

function tabletop(scene){const table=new T.Group(),g=new T.Group(),focusBase=new T.Group();scene.add(table);table.add(g,focusBase);table.userData.surface=g;table.userData.focusBase=focusBase;focusBase.visible=false;g.scale.set(FIELD_SIZE.width,1,FIELD_SIZE.length);
 cube(g,0x5d3928,0,-.75,0,27.6,1.2,26);cube(g,0x93643f,0,-.12,0,27.5,.14,25.8);
 for(let j=0;j<13;j++)cube(g,j%2?0x795138:0x81553a,0,-.01,-11.8+j*1.95,27,.025,.045);
 for(const x of[-13.45,13.45]){cube(g,0xc69859,x,.12,0,.37,.45,25.5);for(let j=0;j<13;j++)orb(g,0xe7bc77,x,.37,-11.6+j*1.95,.065,.065,.065);}
 for(const z of[-12.2,12.2]){cube(g,0xc69859,0,.12,z,26.9,.48,.39);for(let i=0;i<4;i++)cube(g,0xf1cc7e,X(i),.39,z,4.9,.04,.09);}
 for(let i=0;i<4;i++){const x=X(i);cube(g,0x332f2a,x,.10,0,5.53,.18,23.55);for(const side of[-1,1]){cube(g,0xd1ac6c,x+side*2.76,.35,0,.075,.39,22.8);for(let j=0;j<12;j++)orb(g,0xefd5a4,x+side*2.76,.57,-10.8+j*1.96,.055,.055,.055);}cube(g,0xe2b964,x,.30,0,5.48,.11,.17);}
 cube(focusBase,0x5d3928,0,-.75,0,9.5,1.2,78);cube(focusBase,0x95623b,0,-.10,0,9.35,.14,77.8);
 for(const x of[-4.52,4.52]){cube(focusBase,0xd4ab65,x,.15,0,.30,.43,77.4);for(let z=-36;z<=36;z+=6)orb(focusBase,0xe9ca82,x,.4,z,.055,.055,.055);}
 for(const z of[-38,0,38])cube(focusBase,0xe5c078,0,.28,z,9.2,.12,.27);
 return table;
}

function landscape(parent,kind,lane,team){const g=new T.Group();parent.add(g);g.position.set(physicalX(X(lane)),.32,physicalZ(team? -5.65:5.65));
 const w=FIELD_SIZE.width,d=FIELD_SIZE.length,color=colors[kind]||colors.blank;cube(g,0x4f3b29,0,0,0,5.44*w,.34,10.9*d);cube(g,color,0,.18,0,5.29*w,.08,10.7*d);
 const edge=kind==='blue'?0xb5e3d4:kind==='ice'?0xe7f6f4:kind==='blank'?0x877250:0xd4bd77;
 for(const x of[-2.65*w,2.65*w])cube(g,edge,x,.25,0,.035,.06,10.5*d);
 for(const z of[-5.3*d,5.3*d]){cube(g,edge,0,.26,z,5.28*w,.055,.04);for(const x of[-2.54*w,2.54*w])orb(g,0xf0d28c,x,.30,z,.075,.045,.075);}
 if(kind==='blank'){for(let j=0;j<18;j++)cube(g,0xa08a63,(j%3-1)*1.42*w,.225,(Math.floor(j/3)-2.5)*5,.62,.015,.12);for(const x of[-2.18*w,2.18*w])for(const z of[-4.2*d,4.2*d])orb(g,0xd5b36f,x,.3,z,.11,.05,.11);return g;}
 const seed=lane*23+team*67,details=new T.Group(),cropParts={stalk:[],ear:[],leaf:[],grass:[],lightGrass:[]};g.add(details);g.userData.details=details;
 if(kind==='corn')for(let col=0;col<8;col++)cube(details,0x789447,(col-3.5)*.59*w,.232,0,.035,.012,10.25*d);
 for(let j=0;j<144;j++){const col=j%8,row=Math.floor(j/8),jx=(((j*43+seed*19)%97)/97-.5)*.16,jz=(((j*31+seed*13)%89)/89-.5)*.26,x=((col-3.5)*.59+jx)*w,z=((row-8.5)*.56+jz)*d;
  if(kind==='corn'){
   if(j%3===0){const h=.38+(j%5)*.06;cropParts.stalk.push([x,.22+h/2,z,.065,h,.065]);cropParts.ear.push([x,.68+(j%5)*.06,z,.11,.21,.09]);for(const side of[-1,1])cropParts.leaf.push([x+side*.13,.43,z,.18,.035,.08,side*.35]);}
   else cropParts[j%5?'grass':'lightGrass'].push([x,.24,z,.075,.045,.055]);
  }else if(kind==='blue'){if(j%4===0){orb(details,0x9bdbcd,x,.25,z,.11,.06,.05);stalk(details,0x427f79,x,.25,z,.018,.14);}else if(j%3===0)cube(details,0x70bfd0,x,.224,z,.16,.008,.032);}
  else if(kind==='ice'){if(j%4===0)orb(details,0xf0faf7,x,.25,z,.12,.07,.13);else if(j%3===0)cube(details,0x81b6c4,x,.23,z,.26,.012,.025);}
  else if(kind==='swamp'){if(j%4===0){orb(details,0x52664b,x,.24,z,.20,.03,.15);stalk(details,0x876d48,x,.25,z,.025,.25);}else if(j%3===0)orb(details,0x859757,x,.24,z,.08,.025,.08);}
  else{if(j%4===0)orb(details,kind==='stone'?0xb1b1a2:0xe3ca93,x,.24,z,.14,.08,.12);}
 }
 if(kind==='corn'){const sphere=new T.SphereGeometry(1,10,8);instances(details,new T.CylinderGeometry(.55,1,1,7),0x577b38,cropParts.stalk);instances(details,sphere,0xdcb64b,cropParts.ear);instances(details,sphere,0x769b43,cropParts.leaf);instances(details,sphere,0x688840,cropParts.grass);instances(details,sphere,0x9cb252,cropParts.lightGrass);}
 // Terrain is a miniature world: shore, snow shelf, furrows and pools have actual height.
 if(kind==='corn')for(let i=0;i<14;i++){const x=(i%7-3)*.73*w,z=(Math.floor(i/7)?3.8:-3.8)*d;orb(g,i%4?0xb7813f:0xe09843,x,.37,z,.16,.12,.18);for(const side of[-1,1])orb(g,0x527c3c,x+side*.13,.43,z,.09,.06,.12);}
 if(kind==='blue'){
  for(const side of[-1,1]){cube(g,0x6b9c82,side*2.05*w,.255,0,.83*w,.055,9.4*d);for(let i=0;i<16;i++){const z=(i-7.5)*.58*d,x=side*(1.8+((i*7)%5)*.13)*w;stalk(g,0x4b826a,x,.26,z,.018,.16+(i%4)*.07);}}
  for(let i=0;i<14;i++){const x=((i*17)%19-9)*.22*w,z=((i*31)%37-18)*.25*d;orb(g,0x79c5cf,x,.275,z,.27,.012,.07);orb(g,0xd0e6d0,x+.12,.28,z,.12,.015,.035);}
 }
 if(kind==='ice'){
  for(let i=0;i<24;i++){const x=((i*19)%23-11)*.17*w,z=((i*29)%41-20)*.23*d;orb(g,i%3?0xe6f1e6:0x8cbcc6,x,.28,z,.28+(i%4)*.08,.045,.17);if(i%4===0)shape(g,new T.ConeGeometry(.15,.55,5),0xb4dce0,x,.57,z);}
 }
 if(kind==='swamp'){
  for(let i=0;i<16;i++){const x=((i*13)%17-8)*.22*w,z=((i*23)%31-15)*.30*d;orb(g,i%2?0x304f4d:0x425b46,x,.29,z,.45,.015,.32);for(let j=0;j<2;j++){const rx=x+(j?-.3:.3),rz=z+(j?-.36:.36);stalk(g,0x708353,rx,.29,rz,.026,.30+(i%3)*.11);orb(g,0x715b3d,rx,.72+(i%3)*.11,rz,.05,.15,.05);}}
 }
 return g;
}

function fallingCard(scene,kind,lane,team){const g=new T.Group();scene.add(g);g.position.set(physicalX(X(lane)),4,physicalZ(team?-5.65:5.65));cube(g,0xf1d8a5,0,0,0,4.1,.09,6.1);cube(g,colors[kind]||0xc6a36b,0,.07,0,3.72,.025,5.72);return g;}

export function makeBoard(canvas,onLane){let renderer=null,scene,table,camera,raycaster,plane,ctx=null;const cameraState={yaw:0,pitch:1.14,zoom:36,x:0,z:0,focused:null};let focusedLane=null,frameKey='',frameDistance=72,dragging=null,pinching=false,clock=0;const pointers=new Map(),terrain=new Map(),actors=new Map(),summons=[],bursts=[],effectMeshes=[];const events=new AbortController();
 try{
  renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;
  scene=new T.Scene();scene.background=new T.Color(0x253b34);scene.fog=new T.Fog(0x253b34,220,380);camera=new T.PerspectiveCamera(46,1,.1,500);
  scene.add(new T.HemisphereLight(0xddeacb,0x513a2e,2));const sun=new T.DirectionalLight(0xffdfa5,2.65);sun.position.set(-30,75,45);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;scene.add(sun);
  table=tabletop(scene);table.scale.setScalar(TABLE_SCALE);raycaster=new T.Raycaster();plane=new T.Plane(new T.Vector3(0,1,0),-.39*TABLE_SCALE);
 }catch(_){renderer?.dispose();renderer=null;ctx=canvas.getContext('2d');}
 function setLaneVisibility(){if(!table)return;table.userData.surface.visible=focusedLane===null;table.userData.focusBase.visible=focusedLane!==null;if(focusedLane!==null)table.userData.focusBase.position.x=physicalX(X(focusedLane));for(const [id,item]of terrain)item.group.visible=focusedLane===null||Number(id.split('-')[1])===focusedLane;for(const item of actors.values())item.mesh.visible=focusedLane===null||item.lane===focusedLane;}
 function focusLane(lane){focusedLane=lane;Object.assign(cameraState,{x:X(lane),z:renderer?1:0,yaw:0,pitch:1.15,zoom:renderer?30:8,focused:lane});setLaneVisibility();updateCamera();}
 function exitLane(){focusedLane=null;Object.assign(cameraState,{x:0,z:0,yaw:0,pitch:1.14,zoom:36,focused:null});setLaneVisibility();updateCamera();}
 function moveCamera(action){const s=cameraState;
  if(action==='left')s.x=Math.max(focusedLane===null?-10:X(focusedLane)-2.3,s.x-1.5);
  if(action==='right')s.x=Math.min(focusedLane===null?10:X(focusedLane)+2.3,s.x+1.5);
  if(action==='orbit')s.yaw=s.yaw>.55?-.55:s.yaw+.18;
  if(action==='tiltUp')s.pitch=Math.min(1.14,s.pitch+.12);
  if(action==='tiltDown')s.pitch=Math.max(.24,s.pitch-.12);
  if(action==='zoomIn')s.zoom=Math.max(20,s.zoom-2);
  if(action==='zoomOut')s.zoom=Math.min(focusedLane===null?49:40,s.zoom+2);
  if(action==='reset')focusedLane===null?exitLane():focusLane(focusedLane);
  updateCamera();
 }
 function updateCamera(){if(!camera)return;const s=cameraState,key=`${camera.aspect}/${camera.fov}/${s.yaw}/${s.pitch}`;if(key!==frameKey){frameDistance=fitTableDistance(camera.aspect,1,s.yaw,s.pitch,camera.fov);frameKey=key;}const distance=frameDistance*s.zoom/36,direction=new T.Vector3(Math.sin(s.yaw)*.32,Math.sin(s.pitch),Math.cos(s.pitch)*.86).normalize(),target=new T.Vector3(physicalX(s.x)*TABLE_SCALE,0,physicalZ(s.z)*TABLE_SCALE);camera.position.copy(direction.multiplyScalar(distance)).add(target);camera.lookAt(target);camera.updateProjectionMatrix();if(focusedLane!==null){camera.projectionMatrix.elements[0]*=4.8;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();}}
 function resize(){const r=canvas.getBoundingClientRect(),d=renderer?Math.min(window.devicePixelRatio||1,1.5):1,w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){if(renderer){renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.fov=r.height>r.width?56:46;camera.updateProjectionMatrix();}else{canvas.width=w;canvas.height=h;}}updateCamera();}
 function pick(cx,cy){const r=canvas.getBoundingClientRect();if(renderer){raycaster.setFromCamera(new T.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height*2-1)),camera);const hit=new T.Vector3();if(!raycaster.ray.intersectPlane(plane,hit)||Math.abs(hit.z)>=physicalZ(11.8)*TABLE_SCALE)return null;if(focusedLane!==null)return Math.abs(hit.x-physicalX(X(focusedLane))*TABLE_SCALE)<physicalX(2.8)*TABLE_SCALE?focusedLane:null;if(Math.abs(hit.x)<physicalX(11.4)*TABLE_SCALE)return Math.max(0,Math.min(3,Math.round(hit.x/(physicalX(5.65)*TABLE_SCALE)+1.5)));return null;}
  const lane=pickCanvasLane((cx-r.left)*canvas.width/r.width,(cy-r.top)*canvas.height/r.height,canvas.width,canvas.height,cameraState);return focusedLane!==null&&lane!==focusedLane?null:lane;}
 canvas.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){pinching=false;dragging={id:e.pointerId,x:e.clientX,y:e.clientY,originX:e.clientX,originY:e.clientY,moved:false};}else{pinching=true;dragging=null;}canvas.setPointerCapture?.(e.pointerId);},{signal:events.signal});
 canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=[...pointers.values()],before=old.length===2?Math.hypot(old[0].x-old[1].x,old[0].y-old[1].y):0;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const pair=[...pointers.values()],after=Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y);if(before>5)cameraState.zoom=Math.max(20,Math.min(focusedLane===null?49:40,cameraState.zoom*before/after));updateCamera();return;}
  if(!dragging||dragging.id!==e.pointerId)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.hypot(e.clientX-dragging.originX,e.clientY-dragging.originY)>7)dragging.moved=true;if(dragging.moved){if(e.shiftKey||focusedLane!==null&&!e.altKey){const min=focusedLane===null?-10:X(focusedLane)-2.3,max=focusedLane===null?10:X(focusedLane)+2.3;cameraState.x=Math.max(min,Math.min(max,cameraState.x-dx*.027));cameraState.z=Math.max(-9,Math.min(9,cameraState.z+dy*.055));}else{cameraState.yaw=Math.max(-.8,Math.min(.8,cameraState.yaw-dx*.004));cameraState.pitch=Math.max(.24,Math.min(1.14,cameraState.pitch+dy*.003));}updateCamera();}dragging.x=e.clientX;dragging.y=e.clientY;},{signal:events.signal});
 canvas.addEventListener('pointerup',e=>{if(dragging?.id===e.pointerId&&!dragging.moved&&!pinching){const lane=pick(e.clientX,e.clientY);if(lane!==null)onLane(lane);}pointers.delete(e.pointerId);dragging=null;if(!pointers.size)pinching=false;},{signal:events.signal});
 canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);dragging=null;if(!pointers.size)pinching=false;},{signal:events.signal});
 canvas.addEventListener('wheel',e=>{e.preventDefault();cameraState.zoom=Math.max(20,Math.min(focusedLane===null?49:40,cameraState.zoom+Math.sign(e.deltaY)*2));updateCamera();},{signal:events.signal,passive:false});
 function summon(key,lane,team=0){bursts.push({lane,team,age:0});if(renderer)summons.push({mesh:fallingCard(table,LANDSCAPES[key]?key:key==='cornfield'?'corn':'sand',lane,team),age:0});}
 function syncTerrain(field,world){if(!renderer)return;for(let lane=0;lane<4;lane++)for(let team=0;team<2;team++){const kind=team?(world?.lanes[lane].enemyTerrain||'corn'):(field.slots[lane]||'blank'),id=`${team}-${lane}`,old=terrain.get(id);if(old?.kind===kind)continue;if(old)table.remove(old.group);const group=landscape(table,kind,lane,team);group.visible=focusedLane===null||lane===focusedLane;terrain.set(id,{kind,group});}}
 function syncActors(world,dt){if(!renderer||!world)return;const active=new Set();for(const object of [...world.buildings,...world.units]){active.add(object.id);let item=actors.get(object.id);if(!item){const mesh=makeMiniature(object.key);table.add(mesh);mesh.scale.setScalar(.001);item={mesh,age:0,lane:object.lane};actors.set(object.id,item);bursts.push({lane:object.lane,team:object.team,age:0});}item.age+=dt;item.lane=object.lane;item.mesh.visible=focusedLane===null||object.lane===focusedLane;const rise=Math.min(1,item.age/.8),bounce=1+Math.sin(Math.min(1,item.age/.8)*Math.PI)*.32;item.mesh.scale.setScalar(rise*bounce*(world.buildings.includes(object)?MODEL_SCALE.building:MODEL_SCALE.creature));item.mesh.position.set(physicalX(object.x),.55+Math.sin(clock*3+object.id.length)*.025+Math.max(0,1-rise)*1.5,physicalZ(object.z));item.mesh.rotation.y=object.team?0:Math.PI;animateMiniature(item.mesh,object,clock);}
 for(const [id,item]of actors)if(!active.has(id)){table.remove(item.mesh);actors.delete(id);}}
 function render(field,world,dt){resize();clock+=Math.min(.07,dt);for(const burst of bursts)burst.age+=dt;for(let i=bursts.length-1;i>=0;i--)if(bursts[i].age>1.1)bursts.splice(i,1);if(!renderer){paint(ctx,canvas,field,world,clock,cameraState,bursts);return;}
  syncTerrain(field,world);for(const [id,item]of terrain){if(item.kind==='corn'&&item.group.userData.details){const [team,lane]=id.split('-').map(Number),amount=world?(team?world.lanes[lane].enemyCrop:world.lanes[lane].crop):team?.75:.7;item.group.userData.details.scale.y=Math.max(.02,amount);}}syncActors(world,dt);for(let i=summons.length-1;i>=0;i--){const s=summons[i];s.age+=dt;s.mesh.position.y=4-(Math.min(1,s.age/.72)*3.54);s.mesh.rotation.y+=dt*2;s.mesh.scale.setScalar(Math.max(.001,1-s.age/.95));if(s.age>=.95){table.remove(s.mesh);summons.splice(i,1);}}
  const effects=world?.effects||[];while(effectMeshes.length<effects.length){const mesh=new T.Mesh(new T.SphereGeometry(1,12,10),mat(0xffd286));table.add(mesh);effectMeshes.push(mesh);}
  for(let i=0;i<effectMeshes.length;i++){const mesh=effectMeshes[i],effect=effects[i];mesh.visible=!!effect&&(focusedLane===null||effect.lane===focusedLane||effect.lane===undefined&&Math.abs(effect.x- X(focusedLane))<2.9);if(!effect)continue;mesh.material=mat(({cotton:0xf4efdf,storm:0xb69adf,eruption:0xf4793c,impact:0xffd383,fall:0x9a8d71,maze:0xd1d767,mud:0x6d7c65})[effect.kind]||0xe5cf96);mesh.position.set(physicalX(effect.x??X(effect.lane??1)),effect.kind==='storm'?1.8:.8,physicalZ(effect.z??(effect.team?-5.5:5.5)));const size=effect.kind==='cotton'?.85:effect.kind==='storm'?1.4:effect.kind==='eruption'?1.2:.4+Math.min(1,effect.life)*.35;mesh.scale.set(size,effect.kind==='cotton'?size:size*.5,size);mesh.rotation.y+=dt*3;}
  renderer.render(scene,camera);
 }
 return {render,moveCamera,focusLane,exitLane,summon,mode:renderer?'3d':'canvas',dispose(){events.abort();renderer?.dispose();terrain.clear();actors.clear();}};
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
 const focused=Number.isInteger(cam.focused),left=focused?X(cam.focused)-3.3:-13.8,right=focused?X(cam.focused)+3.3:13.8;
 poly(c,[project(left,-12.5),project(right,-12.5),project(right,12.5),project(left,12.5)],'#5d3d2b','#d1a56b',Math.max(3,W/260));
 poly(c,[project(left+.35,-11.7),project(right-.35,-11.7),project(right-.35,11.7),project(left+.35,11.7)],'#9c714b','#3e3028',3);
 for(const lane of focused?[cam.focused]:[0,1,2,3]){const x0=-11.3+lane*5.65,x1=x0+5.65;for(const team of[1,0]){const z0=team?-11.15:.12,z1=team?-.12:11.15,kind=team?(world?.lanes[lane].enemyTerrain||'corn'):(field.slots[lane]||'blank'),config=LANDSCAPES[kind],base=config?.tone||'#474941';
  poly(c,[project(x0+.08,z0),project(x1-.08,z0),project(x1-.08,z1),project(x0+.08,z1)],'#4e392b','#cfac70',2.5);
  poly(c,[project(x0+.20,z0+.19),project(x1-.20,z0+.19),project(x1-.20,z1-.19),project(x0+.20,z1-.19)],base);
  if(kind==='corn')for(let row=0;row<7;row++){const x=x0+.50+row*.72;poly(c,[project(x,z0+.3),project(x+.23,z0+.3),project(x+.23,z1-.3),project(x,z1-.3)],row%2?'#8da044':'#91a54a');}
  if(kind==='blue'){for(const side of[0,1]){const a=side?x1-.95:x0+.28,b=side?x1-.28:x0+.95;poly(c,[project(a,z0+.3),project(b,z0+.3),project(b,z1-.3),project(a,z1-.3)],'#7ea383');}for(let i=0;i<9;i++){const z=z0+.9+i*(z1-z0-1.8)/8;poly(c,[project(x0+1.15,z),project(x0+4.5,z+.19),project(x0+4.2,z+.25),project(x0+1.25,z+.07)],'#97d5cf70');}}
  if(kind==='ice')for(let i=0;i<12;i++){const x=x0+.4+(i%4)*1.25,z=z0+.9+Math.floor(i/4)*(z1-z0-1.8)/2;poly(c,[project(x,z),project(x+.7,z-.24),project(x+1.05,z+.27),project(x+.45,z+.57)],i%3?'#d7e9dc':'#8dbbc3');}
  if(kind==='swamp')for(let i=0;i<14;i++){const x=x0+.6+(i%4)*1.23,z=z0+.7+Math.floor(i/4)*(z1-z0-1.4)/3;poly(c,[project(x,z),project(x+.7,z-.15),project(x+.93,z+.48),project(x+.23,z+.71)],i%3?'#3e6656':'#446b65');}
  if(kind!=='blank')for(let j=0;j<186;j++){const ix=(j%12+.5+(((j*71+lane*37+team*13)%31)/31-.5)*.3)/12,iz=(Math.floor(j/12)+.5+(((j*41+lane*19+team*23)%29)/29-.5)*.36)/16,x=x0+.45+ix*4.75,z=z0+.42+iz*(z1-z0-.84),[px,py]=project(x,z),s=Math.max(.5,W/1350)*(.73+(z+12)/48);if(kind==='corn'){const crop=world?(team?world.lanes[lane].enemyCrop:world.lanes[lane].crop):.75;if(j/186>crop)continue;const plantScale=cam.zoom<20?3.2:2.5,stem=(3+crop*8)*s*plantScale;c.strokeStyle=j%3?'#6b883c':'#4e7635';c.lineWidth=2*s;c.beginPath();c.moveTo(px,py);c.lineTo(px,py-stem);c.stroke();if(j%3===0){oval(c,px,py-stem,2*s*plantScale,4*s*crop*plantScale,'#d9b84e');oval(c,px-3*s*plantScale,py-3*s*crop*plantScale,3*s*plantScale,1.3*s*plantScale,'#83a84a');}}
   else if(kind==='blue'){oval(c,px,py,3*s,1*s,j%3?'#7fc3cf':'#b3e2d9');if(j%4===0){c.fillStyle='#d0e7ad';c.fillRect(px,py-4*s,2*s,4*s);}}
   else if(kind==='ice'){oval(c,px,py,4*s,1.5*s,j%3?'#ecf5ed':'#7eb6c5');}
   else oval(c,px,py,3*s,1.3*s,j%3?'#c1a975':'#718764');}
  if(kind==='blank'){const [px,py]=project((x0+x1)/2,(z0+z1)/2);c.save();c.font=`700 ${Math.max(10,Math.min(16,W/85))}px Georgia`;c.textAlign='center';c.fillStyle='#bca87c';c.fillText(W<700?'PLACE':'PLACE LANDSCAPE',px,py);c.restore();}
 }
 poly(c,[project(x0,0),project(x1,0),project(x1,.2),project(x0,.2)],'#e8be78','#866642',2);
 }
 for(const z of[-11.4,11.4])for(let j=0;j<(focused?6:18);j++){const [x,y]=project(focused?left+.45+j*(right-left-.9)/5:-12.3+j*1.45,z);c.fillStyle='#7d5a3c';c.fillRect(x-2,y-9,4,10);}
 if(world){for(const o of [...world.buildings,...world.units].filter(o=>!focused||o.lane===cam.focused).sort((a,b)=>a.z-b.z)){const [x,y]=project(o.x,o.z),close=cam.zoom<20,base=close?Math.max(.3,Math.min(.55,W/2500))*1.15:Math.max(.17,Math.min(.4,W/3200)),building=world.buildings.includes(o);figure(c,o,x,y,base*(.8+(o.z+11)/45)*(building?2.2:1),t);}}
 for(const b of bursts){if(focused&&b.lane!==cam.focused)continue;const [x,y]=project(X(b.lane),b.team?-5.65:5.65),age=b.age;c.save();c.globalAlpha=1-age;oval(c,x,y,8+age*62,3+age*22,'#ffe79b88');c.strokeStyle='#ffe8a8';c.lineWidth=3;c.beginPath();c.ellipse(x,y,10+age*45,4+age*17,0,0,Math.PI*2);c.stroke();c.restore();}
 for(const e of world?.effects||[]){if(focused&&e.lane!==undefined&&e.lane!==cam.focused)continue;const [x,y]=project(e.x??X(e.lane??1),e.z??(e.team?-5.5:5.5)),size=e.kind==='cotton'?13:e.kind==='storm'?17:9;oval(c,x,y,size,size*.55,({cotton:'#f7f2e4',storm:'#bc9edb',eruption:'#f27b42',impact:'#ffd786',maze:'#d5d975'})[e.kind]||'#9bbcb3');}
}
