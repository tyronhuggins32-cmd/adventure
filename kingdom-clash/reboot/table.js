import * as T from '../vendor/three.js';
import {BIOMES} from './world.js';
import {material,mesh,box,ball,cone,post,makeActor,makeBuilding,animateActor} from './models.js';
const laneX=i=>(i-1.5)*7.7;
const palette={corn:[0x8c7948,0xa4a650],blue:[0x496f64,0x71a697],ice:[0x8aa8aa,0xb5d0cd],swamp:[0x4b604b,0x6f8058]};
const random=(n)=>{let a=Math.imul(n+73,1664525)+1013904223;return ()=>{a=(Math.imul(a,1664525)+1013904223)>>>0;return a/4294967296;};};
function slab(g,c,x,y,z,w,h,d){return box(g,c,x,y,z,w,h,d);}
function tree(g,x,z,s=1,kind='blue'){post(g,kind==='ice'?0x665f58:0x514637,x,.7*s,z,.15*s,1.4*s);if(kind==='ice'){for(let i=0;i<3;i++)cone(g,i%2?0x557d70:0x68978c,x,(1.1+i*.4)*s,z,(.8-i*.15)*s,.95*s,7);cone(g,0xe0eee5,x,2.16*s,z,.39*s,.35*s,7);}else{for(let i=0;i<5;i++){const a=i*2.4;ball(g,i%2?0x527a4b:0x6b8a4e,x+Math.sin(a)*.5*s,1.8*s+Math.cos(i*1.7)*.3*s,z+Math.cos(a)*.4*s,.56*s,.65*s,.48*s);}}}
function water(g,x,z,rx,rz,color){const m=mesh(g,new T.CircleGeometry(1,24),color,x,.24,z);m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);m.receiveShadow=true;return m;}
function cornCrop(g,seed){const r=random(seed),stem=[],ears=[],leaves=[];for(const side of[-1,1])for(let line=0;line<2;line++)for(let row=0;row<15;row++){const x=side*(2.0+line*.72)+(r()-.5)*.16,z=-5.15+row*.73+(r()-.5)*.14,h=1.35+r()*.43;stem.push([x,.31+h/2,z,h]);ears.push([x,.4+h*.69,z]);leaves.push([x+side*.22,.63,z],[x-side*.2,.93,z]);}
 const dummy=new T.Object3D();function inst(geo,c,points,set){const m=new T.InstancedMesh(geo,material(c),points.length);m.castShadow=true;m.receiveShadow=true;points.forEach((p,i)=>{dummy.position.set(p[0],p[1],p[2]);dummy.scale.setScalar(1);dummy.rotation.set(0,0,0);set?.(dummy,p,i);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});g.add(m);}
 inst(new T.CylinderGeometry(.04,.06,1,5),0x547741,stem,(d,p)=>d.scale.y=p[3]);inst(new T.SphereGeometry(.12,6,5),0xd6ae4b,ears,(d)=>d.scale.set(1,1.8,1));inst(new T.SphereGeometry(.15,5,4),0x6c994c,leaves,(d,p,i)=>{d.scale.set(1.5,.25,.65);d.rotation.z=i%2?.38:-.38;});}
function terrain(parent,kind,lane,side){const g=new T.Group();parent.add(g);g.position.set(laneX(lane),0,side?-6:6);const r=random(71+lane*37+side*113),base=palette[kind];
 slab(g,0x4b3727,0,.03,0,7.35,.47,11.72);slab(g,base[0],0,.26,0,7.12,.09,11.51);slab(g,base[1],0,.32,0,6.86,.08,11.22);
 for(const x of[-3.56,3.56]){slab(g,0xd3ae6a,x,.43,0,.10,.29,11.45);for(let j=0;j<6;j++)ball(g,0xeac988,x,.61,-5+j*2,.055,.05,.055);}
 for(const z of[-5.64,5.64])slab(g,0xd3ae6a,0,.43,z,7.15,.29,.11);
 if(kind==='corn'){
  for(const x of[-2.9,-2.18,2.18,2.9])slab(g,0x766341,x,.38,0,.50,.12,10.55);
  const crop=new T.Group();g.add(crop);cornCrop(crop,lane*3+side*5);g.userData.crop=crop;
  for(let i=0;i<9;i++){const x=(r()-.5)*5.3,z=(r()-.5)*9;ball(g,i%3?0xb2763c:0xe39b45,x,.48,z,.21,.15,.22);ball(g,0x608044,x+.2,.61,z,.09,.07,.11);}
  for(const z of[-3.6,3.8]){post(g,0x7c563b,-.4,.72,z,.09,1.0);post(g,0x7c563b,.5,.72,z,.09,1.0);slab(g,0xb38a5a,.05,.83,z,.95,.10,.08);}
 }
 if(kind==='blue'){
  water(g,-.7,-2,1.7,3.1,0x4b9eaa);water(g,.65,2.8,1.45,2.4,0x52a2ac);
  for(let i=0;i<24;i++){const x=(r()-.5)*6,z=(r()-.5)*10;if(i%5===0){ball(g,0xa7b7a2,x,.40,z,.36,.18,.28);}else{post(g,0x5b826a,x,.42,z,.025,.25+r()*.35);ball(g,0x8eac69,x,.65,z,.09,.13,.05);}}
  for(const z of[-3.9,3.9]){tree(g,2.4,z,.76,'blue');slab(g,0xd2bb82,-.8,.48,z,2.4,.17,.34);}
 }
 if(kind==='ice'){
  water(g,0,0,2.05,4.2,0x81b8bd);water(g,.55,-2,1.25,1.8,0xb1dadd);
  for(let i=0;i<22;i++){const x=(r()-.5)*6.1,z=(r()-.5)*10;ball(g,i%3?0xd9e8df:0x96bec5,x,.43,z,.25+r()*.3,.14,.23+r()*.28);if(i%5===0)cone(g,0xb8dce0,x,.78,z,.17,.68,5);}
  for(const z of[-3.5,3.7])for(const x of[-2.45,2.6])tree(g,x,z,.55,'ice');
 }
 if(kind==='swamp'){
  for(let i=0;i<10;i++){const x=(r()-.5)*5.8,z=(r()-.5)*9.7;water(g,x,z,.38+r()*.55,.35+r()*.8,i%3?0x355b55:0x476c5a);if(i%2===0){ball(g,0x61784d,x+.45,.37,z+.45,.32,.1,.26);}}
  for(let i=0;i<32;i++){const x=(r()-.5)*6.1,z=(r()-.5)*10.2,h=.25+r()*.35;post(g,0x536f43,x,.39+h/2,z,.025,h);ball(g,0x6c5540,x,.43+h,z,.055,.13,.055);}
  for(const z of[-4.1,4.1]){tree(g,2.4,z,.85,'swamp');post(g,0x4a4537,-2.5,.73,z,.17,1.0);ball(g,0x66794d,-2.5,1.47,z,.54,.39,.47);}
  for(let i=0;i<7;i++)slab(g,i%2?0x987650:0x806345,.35,.44,-3.3+i*1.04,1.7,.15,.38);
 }
 return g;
}
export function makeScene(){const scene=new T.Scene();scene.background=new T.Color(0x172c2c);scene.fog=new T.Fog(0x172c2c,80,170);scene.add(new T.HemisphereLight(0xe6ebd4,0x4c382b,2.1));const sun=new T.DirectionalLight(0xffd6a5,2.7);sun.position.set(-26,48,32);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-40;sun.shadow.camera.right=40;sun.shadow.camera.top=40;sun.shadow.camera.bottom=-40;sun.shadow.bias=-.0003;scene.add(sun);
 const table=new T.Group();scene.add(table);slab(table,0x493023,0,-.91,0,35.2,1.5,27.2);slab(table,0x8a5e3b,0,-.1,0,34.8,.25,26.8);
 for(let i=0;i<13;i++)slab(table,i%2?0x986b44:0x805539,0,.045,-12.2+i*2.02,34.4,.045,.065);
 for(const x of[-17,17]){slab(table,0xc49557,x,.20,0,.32,.52,26.2);for(let i=0;i<12;i++)ball(table,0xe9bd77,x,.50,-11.7+i*2.13,.07,.05,.07);}
 for(const z of[-13,13])slab(table,0xc49557,0,.20,z,34.4,.52,.35);
 for(let i=0;i<4;i++)slab(table,0x564131,laneX(i),.12,0,7.43,.17,24.5);
 const lands=[];for(let lane=0;lane<4;lane++)for(let side=0;side<2;side++)lands.push({lane,side,group:terrain(table,BIOMES[lane].id,lane,side)});
 return {scene,table,lands};}
export function fitDistance(aspect,focus=null,yaw=.12,pitch=.84){const camera=new T.PerspectiveCamera(aspect<1?54:46,aspect,.1,250),target=new T.Vector3(focus===null?0:laneX(focus),0,0),dir=new T.Vector3(Math.sin(yaw)*.35,Math.sin(pitch),Math.cos(pitch)*.9).normalize();const xs=focus===null?[-17.6,17.6]:[laneX(focus)-3.8,laneX(focus)+3.8],zs=[-13.6,13.6],ys=[-.95,4.25];let lo=8,hi=220;for(let n=0;n<20;n++){const d=(lo+hi)/2;camera.position.copy(dir).multiplyScalar(d).add(target);camera.lookAt(target);camera.updateMatrixWorld();const fits=xs.every(x=>zs.every(z=>ys.every(y=>{const p=new T.Vector3(x,y,z).project(camera);return p.z<1&&Math.abs(p.x)<.91&&Math.abs(p.y)<.87;})));if(fits)hi=d;else lo=d;}return hi;}
const mapX=i=>laneX(i);
export function createTable(canvas){let renderer=null,ctx=null,scene,table,lands,camera,onLaneSelect=()=>{};const actors=new Map(),structures=new Map(),effects=[];let focus=null,aspect=1,lastW=0,lastH=0,orbit=.12,pitch=.84,zoom=1,panZ=0,drag=null,clock=0;const abort=new AbortController();const sprites=typeof Image!=='undefined'?{creature:new Image(),building:new Image()}:null;if(sprites){sprites.creature.src='kingdom-clash/assets/creatures.webp';sprites.building.src='kingdom-clash/assets/buildings.webp';}
 try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;({scene,table,lands}=makeScene());camera=new T.PerspectiveCamera(54,1,.1,250);}catch(_){renderer?.dispose();renderer=null;ctx=canvas.getContext('2d');}
 function cameraUpdate(){if(!camera)return;const base=fitDistance(aspect,focus,orbit,pitch),target=new T.Vector3(focus===null?0:mapX(focus),0,panZ),dir=new T.Vector3(Math.sin(orbit)*.35,Math.sin(pitch),Math.cos(pitch)*.9).normalize();camera.position.copy(dir.multiplyScalar(base*zoom)).add(target);camera.lookAt(target);camera.updateMatrixWorld();}
 function resize(){const r=canvas.getBoundingClientRect();if(r.width===lastW&&r.height===lastH)return;lastW=r.width;lastH=r.height;aspect=r.width/Math.max(1,r.height);if(renderer){renderer.setSize(r.width,r.height,false);camera.aspect=aspect;camera.fov=aspect<1?54:46;camera.updateProjectionMatrix();}else{canvas.width=Math.max(1,Math.round(r.width));canvas.height=Math.max(1,Math.round(r.height));}cameraUpdate();}
 function focusLane(lane){focus=lane;zoom=1;orbit=.12;pitch=.84;panZ=0;cameraUpdate();}
 function overview(){focus=null;zoom=1;orbit=.12;pitch=.84;panZ=0;cameraUpdate();}
 function control(action){if(action==='left')orbit=Math.max(-.6,orbit-.13);if(action==='right')orbit=Math.min(.6,orbit+.13);if(action==='orbit')orbit=orbit>.5?-.5:orbit+.2;if(action==='up')pitch=Math.min(1.19,pitch+.11);if(action==='down')pitch=Math.max(.43,pitch-.11);if(action==='in')zoom=Math.max(.78,zoom-.10);if(action==='out')zoom=Math.min(1.65,zoom+.10);if(action==='reset'){zoom=1;orbit=.12;pitch=.84;panZ=0;}cameraUpdate();}
 function hitLane(e){const rect=canvas.getBoundingClientRect(),px=(e.clientX-rect.left)/rect.width,py=(e.clientY-rect.top)/rect.height;let x,z;if(renderer){const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(px*2-1,1-py*2),camera);const point=new T.Vector3();if(!ray.ray.intersectPlane(new T.Plane(new T.Vector3(0,1,0),-.36),point))return;x=point.x;z=point.z;}else{z=((py-.075)/.83)*27-13.5;const side=.76+(z+13.5)/27*.28;x=(px-.5)*43*zoom/side-Math.sin(orbit)*z*.13;}if(Math.abs(z)>12||Math.abs(x)>16.2)return;const index=Math.round(x/7.7+1.5);if(index>=0&&index<4&&Math.abs(x-laneX(index))<3.7)onLaneSelect(index);}
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId,distance:0};canvas.setPointerCapture(e.pointerId);},{signal:abort.signal});canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.distance+=Math.hypot(dx,dy);if(e.shiftKey||focus!==null){panZ=Math.max(-2.2,Math.min(2.2,panZ+dy*.013));orbit=Math.max(-.62,Math.min(.62,orbit+dx*.004));}else{orbit=Math.max(-.62,Math.min(.62,orbit+dx*.004));pitch=Math.max(.43,Math.min(1.19,pitch+dy*.003));}drag.x=e.clientX;drag.y=e.clientY;cameraUpdate();},{signal:abort.signal});canvas.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId&&drag.distance<8&&focus===null)hitLane(e);drag=null;},{signal:abort.signal});canvas.addEventListener('pointercancel',()=>{drag=null;},{signal:abort.signal});canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.78,Math.min(1.65,zoom+Math.sign(e.deltaY)*.08));cameraUpdate();},{signal:abort.signal,passive:false});
 function sync(world){const active=new Set();for(const u of world.units){active.add(u.id);let m=actors.get(u.id);if(!m){m=makeActor(u.kind);table.add(m);actors.set(u.id,m);}m.position.set(u.x,.55+Math.sin(clock*2+u.phase)*.018,u.z);m.rotation.y=u.side?0:Math.PI;m.visible=focus===null||u.lane===focus;animateActor(m,u,clock);}
 for(const [id,m]of actors)if(!active.has(id)){table.remove(m);actors.delete(id);}
 for(const b of world.buildings){let m=structures.get(b.id);if(!m){m=makeBuilding(b.kind);table.add(m);structures.set(b.id,m);}m.position.set(b.x,.32,b.z);m.rotation.y=b.side?0:Math.PI;m.visible=focus===null||b.lane===focus;}
 for(const terrain of lands){terrain.group.visible=focus===null||terrain.lane===focus;if(terrain.group.userData.crop){const value=terrain.side?world.lanes[terrain.lane].enemyCrop:world.lanes[terrain.lane].crop;terrain.group.userData.crop.scale.y=.3+value*.7;terrain.group.userData.crop.rotation.z=Math.sin(clock*1.3+terrain.side)*.007;}}
 while(effects.length<world.effects.length){const m=new T.Mesh(new T.SphereGeometry(1,10,8),material(0xffd684));table.add(m);effects.push(m);}effects.forEach((m,i)=>{const e=world.effects[i];m.visible=!!e&&(focus===null||e.lane===focus);if(e){m.position.set(e.x,1,e.z);m.scale.setScalar(e.kind==='spawn'?1.2:.48+e.life*.2);m.material=material(e.kind==='spawn'?0xe8e1ad:0xffcb83);}});
 }
 function render(world,dt){resize();clock+=Math.min(.05,dt);if(renderer){sync(world);renderer.render(scene,camera);}else if(ctx)paintFallback(ctx,canvas,world,focus,sprites,clock,orbit,zoom);}
 return {focusLane,overview,control,render,setOnLaneSelect(fn){onLaneSelect=fn;},mode:renderer?'webgl':'canvas',dispose(){abort.abort();renderer?.dispose();}};
}
const spriteUnit={pig:[4,4],sheep:[7,1],farmer:[1,0],husker:[4,0],dog:[5,4],scholar:[2,3],wolf:[4,5],crow:[6,4],archer:[3,3],earling:[1,5],scarecrow:[4,0]};
const spriteBuild={barn:[4,4],den:[1,1],watchtower:[3,2],silo:[5,0],school:[3,3],iceKeep:[6,1],ruin:[2,4]};
function polygon(c,points,fill,stroke,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}}
function ellipse(c,x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function paintFallback(c,canvas,w,focus,sprites,t,yaw,zoom){const W=canvas.width,H=canvas.height,focused=focus!==null,center=focused?laneX(focus):0,k=focused?W/10:W/43;
 function p(x,z,y=0){const depth=(z+13.5)/27,side=(.76+depth*.28),turn=x-center+Math.sin(yaw)*z*.13;return[W*.5+turn*k*side/zoom,H*(.075+depth*.83)-y*(focused?H/30:H/54)];}
 const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#263c35');bg.addColorStop(1,'#112b2b');c.fillStyle=bg;c.fillRect(0,0,W,H);
 const left=focused?center-4.05:-17.5,right=focused?center+4.05:17.5;polygon(c,[p(left,-13.4),p(right,-13.4),p(right,13.4),p(left,13.4)],'#63452e','#c8975c',Math.max(2,W/300));polygon(c,[p(left+.2,-12.8),p(right-.2,-12.8),p(right-.2,12.8),p(left+.2,12.8)],'#8e603d','#392d27',2);
 for(const lane of focused?[focus]:[0,1,2,3]){const x=laneX(lane),kind=BIOMES[lane].id,tone=BIOMES[lane].color;for(const side of[1,0]){const z0=side?-11.85:.12,z1=side?-.12:11.85;
  polygon(c,[p(x-3.55,z0),p(x+3.55,z0),p(x+3.55,z1),p(x-3.55,z1)],'#523d29','#d8b676',2.2);
  polygon(c,[p(x-3.37,z0+.17),p(x+3.37,z0+.17),p(x+3.37,z1-.17),p(x-3.37,z1-.17)],tone);
  const r=random(lane*29+side*73+4),count=focused?78:62;
  if(kind==='corn'){for(const col of[-2.7,-1.96,1.96,2.7])polygon(c,[p(x+col-.25,z0+.3),p(x+col+.26,z0+.3),p(x+col+.26,z1-.3),p(x+col-.25,z1-.3)],'#756643');for(let i=0;i<count;i++){const col=[-2.7,-1.96,1.96,2.7][i%4],z=z0+.45+(Math.floor(i/4)+.5)*(z1-z0-.9)/(count/4),[px,py]=p(x+col+(r()-.5)*.15,z),size=focused?10:4.5;c.strokeStyle='#4e793a';c.lineWidth=focused?2:1;c.beginPath();c.moveTo(px,py);c.lineTo(px,py-size);c.stroke();ellipse(c,px,py-size,size*.21,size*.38,'#e4bb54');}}
  if(kind==='blue'){for(let i=0;i<5;i++){const z=z0+.65+i*(z1-z0-1.3)/4;polygon(c,[p(x-1.6,z),p(x+1.3,z+.35),p(x+1.4,z+1.1),p(x-1.25,z+.8)],'#539ca6','#a9ceba',1);}for(let i=0;i<20;i++){const z=z0+.4+r()*(z1-z0-.8),xx=x-3+r()*6,[px,py]=p(xx,z);ellipse(c,px,py,focused?3:1.5,focused?1.3:.6,'#c2d8bc');}}
  if(kind==='ice'){for(let i=0;i<16;i++){const z=z0+.4+r()*(z1-z0-.8),xx=x-3+r()*6;polygon(c,[p(xx,z),p(xx+.45,z-.15),p(xx+.7,z+.35),p(xx+.1,z+.54)],i%3?'#ddece8':'#8ebec3');}for(const zz of[z0+2,z1-2])for(const xx of[x-2.4,x+2.2]){const [tx,ty]=p(xx,zz);polygon(c,[[tx-7,ty],[tx,ty-(focused?25:10)],[tx+7,ty]],'#5d8a80');}}
  if(kind==='swamp'){for(let i=0;i<24;i++){const z=z0+.5+r()*(z1-z0-1),xx=x-3+r()*6,[px,py]=p(xx,z);ellipse(c,px,py,focused?12:5,focused?4:2,i%3?'#42665c':'#3d5d4f');if(i%3===0){c.strokeStyle='#87965a';c.beginPath();c.moveTo(px+4,py);c.lineTo(px+6,py-(focused?14:6));c.stroke();}}for(const zz of[z0+2,z1-2]){const [tx,ty]=p(x+2.35,zz);ellipse(c,tx,ty,focused?17:6,focused?8:3,'#3b6049');ellipse(c,tx,ty-(focused?23:9),focused?14:5,focused?13:5,'#658459');}}
  }
  polygon(c,[p(x-3.6,0),p(x+3.6,0),p(x+3.6,.22),p(x-3.6,.22)],'#dfbb77','#6a4b2f',2);
 }
 const all=[...w.buildings.map(b=>({...b,structure:true})),...w.units].filter(o=>!focused||o.lane===focus).sort((a,b)=>a.z-b.z);
 for(const o of all){const [px,py]=p(o.x,o.z),img=sprites?.[o.structure?'building':'creature'],cell=(o.structure?spriteBuild:spriteUnit)[o.kind],scale=(focused?W/375:W/1100)*(.83+(o.z+12)*.013),width=(o.structure?92:58)*scale,height=(o.structure?88:59)*scale;ellipse(c,px,py+2,width*.34,height*.075,'#17251a99');ellipse(c,px,py,width*.24,height*.055,o.side?'#dc8b66':'#d7c17b');if(img?.complete&&img.naturalWidth&&cell){const cw=img.naturalWidth/8,ch=img.naturalHeight/(o.structure?6:7);c.save();c.shadowColor='#17251fcc';c.shadowBlur=5*scale;c.shadowOffsetY=3*scale;c.drawImage(img,cell[0]*cw,cell[1]*ch,cw,ch,px-width/2,py-height,width,height);c.restore();}else{ellipse(c,px,py-height*.47,width*.36,height*.4,o.side?'#965d43':'#82965f');}
  c.fillStyle='#172922';c.fillRect(px-width*.3,py-height-2*scale,width*.6,3*scale);c.fillStyle=o.side?'#e69768':'#a5da7a';c.fillRect(px-width*.3,py-height-2*scale,width*.6*Math.max(0,o.hp/(o.max||18)),3*scale);
 }
 for(const effect of w.effects.filter(e=>!focused||e.lane===focus)){const [x,y]=p(effect.x,effect.z);ellipse(c,x,y,focused?12:5,focused?4:2,effect.kind==='spawn'?'#d9e8a9bb':'#efb86dbb');}
}
