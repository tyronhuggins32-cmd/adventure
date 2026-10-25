import * as T from '../vendor/three.js';
const cache=new Map();
export function material(color,metal=0){const id=`${color}:${metal}`;if(!cache.has(id))cache.set(id,new T.MeshStandardMaterial({color,roughness:metal?.53:.88,metalness:metal,flatShading:false}));return cache.get(id);}
export function mesh(parent,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export const box=(p,c,x,y,z,w,h,d)=>mesh(p,new T.BoxGeometry(w,h,d),c,x,y,z);
export function ball(p,c,x,y,z,sx,sy,sz){const m=mesh(p,new T.SphereGeometry(1,12,8),c,x,y,z);m.scale.set(sx,sy,sz);return m;}
export const cone=(p,c,x,y,z,r,h,n=8)=>mesh(p,new T.ConeGeometry(r,h,n),c,x,y,z);
export const post=(p,c,x,y,z,r,h)=>mesh(p,new T.CylinderGeometry(r*.8,r,h,8),c,x,y,z);
function limb(root,c,x,z){const g=new T.Group();g.position.set(x,.63,z);root.add(g);ball(g,c,0,-.24,0,.16,.34,.17);ball(g,0x584d42,0,-.51,.09,.19,.11,.22);return g;}
function animal(kind){const g=new T.Group(),pig=kind==='pig',sheep=kind==='sheep',wolf=kind==='wolf',dog=kind==='dog';const coat=pig?0xd99689:sheep?0xebe4d1:wolf?0xa6bec6:0x9a8b72;
 ball(g,coat,0,.94,-.09,pig?.85:.78,pig?.56:.51,.53);const head=new T.Group();head.position.set(0,1.15,.57);g.add(head);ball(head,coat,0,0,0,.45,.39,.37);
 if(pig){ball(head,0xe9b2a0,0,-.12,.34,.31,.23,.17);ball(head,0x9e6c65,-.12,-.12,.485,.035,.045,.015);ball(head,0x9e6c65,.12,-.12,.485,.035,.045,.015);for(const s of[-1,1]){cone(head,0xbe8077,s*.35,.35,-.06,.17,.43,5).rotation.z=s*.35;ball(head,0x412e31,s*.20,.10,.31,.045,.06,.025);}}
 else if(sheep){for(let i=0;i<22;i++){const a=i*2.4;ball(g,i%3?0xf4f0e5:0xdedacf,Math.cos(a)*.55,.88+Math.sin(i*2.1)*.37,Math.sin(a)*.38-.1,.19,.2,.2);}ball(head,0x85776d,0,-.08,.31,.26,.23,.16);for(const s of[-1,1])ball(head,0x292b2c,s*.20,.08,.34,.035,.043,.019);}
 else{for(const s of[-1,1]){cone(head,wolf?0x708e9c:0x655743,s*.32,.41,-.03,.19,.47,5);ball(head,0x263735,s*.18,.07,.325,.036,.05,.018);}ball(head,0x36464a,0,-.13,.35,.22,.17,.23);}
 const legs=[];for(const s of[-1,1])for(const a of[-1,1])legs.push(limb(g,coat,s*.5,a*.35));const tail=new T.Group();tail.position.set(0,.96,-.6);g.add(tail);ball(tail,coat,0,.11,-.25,.14,.18,.31);g.userData={head,legs,tail};return g;
}
function person(kind){const g=new T.Group(),farmer=kind==='farmer',scare=kind==='scarecrow',archer=kind==='archer',coat=farmer?0x5e6f45:scare?0x805f3d:archer?0x586d6e:kind==='husker'?0x7b8741:kind==='scholar'?0x445e76:0x6b5b4d;
 const legs=[];for(const s of[-1,1])legs.push(limb(g,coat,s*.22,0));ball(g,coat,0,1.22,0,.43,.56,.34);const head=new T.Group();head.position.set(0,1.72,.07);g.add(head);ball(head,scare?0xbda579:0xdba67e,0,.1,.09,.32,.32,.30);
 for(const s of[-1,1]){const a=new T.Group();a.position.set(s*.41,1.49,0);g.add(a);ball(a,coat,s*.06,-.28,0,.17,.38,.19);if(scare)a.rotation.z=-s*.95;if(!scare)ball(head,0x252f2e,s*.13,.15,.34,.033,.043,.02);}
 if(farmer){const brim=mesh(head,new T.CylinderGeometry(.62,.62,.09,16),0xb6975f,0,.38,0);brim.rotation.z=.06;mesh(head,new T.CylinderGeometry(.34,.39,.38,12),0xc3a267,0,.58,0);for(let i=0;i<5;i++)cone(head,0xa85d30,(i-2)*.11,-.18,.29,.08,.34,5);box(g,0x6c5543,0,1.1,.32,.46,.36,.07);}
 else if(scare){box(g,0x806347,0,1.48,0,1.8,.07,.07);box(head,0x7d6b4c,0,.45,0,1.04,.08,.72);cone(head,0x735b3c,0,.67,0,.45,.5);}
 else{cone(head,kind==='scholar'?0x39536e:0x826d42,0,.48,0,.43,.44);box(head,0x745b42,0,.29,0,.87,.07,.65);if(archer){const bow=mesh(g,new T.TorusGeometry(.51,.035,6,16,Math.PI),0x755439,.65,1.22,.1);bow.rotation.z=Math.PI/2;}}
 g.userData={head,legs};return g;
}
export function makeActor(kind){return ['pig','sheep','wolf','dog'].includes(kind)?animal(kind):person(kind);}
export function animateActor(model,unit,t){const walk=unit.action==='walk'||unit.action==='flee',step=walk?Math.sin(t*11+unit.phase)*.44:0;model.userData.legs?.forEach((l,i)=>l.rotation.x=i%2?step:-step);if(model.userData.head)model.userData.head.rotation.x=unit.action==='eat'?.19:Math.sin(t*2+unit.phase)*.03;if(model.userData.tail)model.userData.tail.rotation.y=Math.sin(t*5+unit.phase)*.26;}
export function makeBuilding(kind){const g=new T.Group(),wood=0x895a3e,roof=kind==='barn'?0x9f4133:kind==='den'?0x687f8a:0x76634f;
 if(kind==='barn'||kind==='school'||kind==='den'){box(g,kind==='barn'?0xa1553e:kind==='den'?0x8da6ab:0x9c8a68,0,1.25,0,2.7,2.25,2.35);for(const s of[-1,1]){const r=box(g,roof,s*.72,2.55,0,1.85,.17,2.75);r.rotation.z=s*.52;}box(g,0x4c382e,0,.8,1.23,.75,1.42,.12);for(const s of[-1,1])box(g,wood,s*1.16,1.37,1.25,.12,2.08,.12);if(kind==='barn'){for(const s of[-1,1])box(g,0xc99065,s*.55,1.35,1.27,.08,.85,.13);box(g,0xc99065,0,1.35,1.28,1.18,.08,.13);}}
 else if(kind==='silo'){post(g,0xb6a17b,0,1.5,0,1.04,2.7);cone(g,0x7e5544,0,3.17,0,1.23,.83,12);box(g,0x5b4234,0,.7,1.05,.55,.9,.1);}
 else if(kind==='watchtower'||kind==='iceKeep'){for(const x of[-.85,.85])for(const z of[-.8,.8])post(g,wood,x,1.6,z,.12,3.1);box(g,kind==='iceKeep'?0xb1cbd0:wood,0,2.9,0,2.4,.28,2.35);cone(g,roof,0,3.55,0,1.8,1.18,4).rotation.y=Math.PI/4;}
 else{for(let i=0;i<5;i++)box(g,0x887e6d,(i-2)*.51,.35+i%2*.24,0,.55,.7+i%2*.4,.65);}
 return g;}
