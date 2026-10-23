import * as THREE from '../vendor/three.js';

const mats=new Map();
const material=(color,metalness=0)=>{const key=`${color}-${metalness}`;if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness:metalness?.43:.83,metalness,flatShading:false}));return mats.get(key);};
const part=(parent,geo,color,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geo,material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
const sphere=(p,color,x,y,z,sx,sy,sz)=>{const m=part(p,new THREE.SphereGeometry(1,16,12),color,x,y,z);m.scale.set(sx,sy,sz);return m;};
const box=(p,color,x,y,z,w,h,d)=>part(p,new THREE.BoxGeometry(w,h,d),color,x,y,z);
const cone=(p,color,x,y,z,r,h,n=9)=>part(p,new THREE.ConeGeometry(r,h,n),color,x,y,z);
const cylinder=(p,color,x,y,z,top,bottom,h,n=12)=>part(p,new THREE.CylinderGeometry(top,bottom,h,n),color,x,y,z);
const group=(p,x=0,y=0,z=0)=>{const o=new THREE.Group();o.position.set(x,y,z);p.add(o);return o;};
const beam=(p,color,a,b,r)=>{const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),m=cylinder(p,color,...v1.clone().add(v2).multiplyScalar(.5).toArray(),r,r,v1.distanceTo(v2),8);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v2.sub(v1).normalize());return m;};

export function sculptPig(){const root=new THREE.Group();root.userData.kind='pig';
 sphere(root,0xe2a19b,0,.94,-.09,.95,.68,.65);sphere(root,0xf4b9af,0,1.02,.39,.63,.49,.48);
 const head=group(root,0,1.18,.59);root.userData.head=head;
 sphere(head,0xf0afa7,0,.10,.08,.54,.48,.46);sphere(head,0xf6b9b2,0,-.17,.35,.41,.28,.2);
 sphere(head,0xdd8d91,0,-.17,.52,.28,.17,.09);
 for(const side of [-1,1]){
  sphere(head,0x864f57,side*.13,-.15,.612,.045,.055,.019);
  const ear=group(head,side*.42,.44,-.02);ear.rotation.z=side*-.28;
  sphere(ear,0xe7a098,0,.11,0,.17,.30,.095);sphere(ear,0xc77980,0,.12,.07,.11,.2,.015);
  sphere(head,0xfff2d7,side*.24,.21,.422,.14,.17,.07);sphere(head,0x342932,side*.22,.21,.48,.052,.07,.025);
  sphere(head,0xffffff,side*.24-.028,.25,.504,.018,.02,.01);
  for(let j=0;j<3;j++)sphere(head,0xc9827c,side*(.33+j*.04),-.03+j*.1,.407-j*.025,.018,.019,.014);
 }
 const legs=[];for(const side of [-1,1])for(const fore of [-1,1]){const limb=group(root,side*.58,.65,fore*.42-.08);sphere(limb,0xe8a59c,0,-.17,0,.19,.35,.21);sphere(limb,0xd1837e,0,-.48,.09,.21,.13,.27);for(const toe of[-1,1])box(limb,0x946564,toe*.095,-.57,.26,.07,.05,.11);legs.push(limb);}root.userData.legs=legs;
 const tail=group(root,0,1,-.7);root.userData.tail=tail;beam(tail,0xe4938e,[0,0,0],[.14,.21,-.24],.065);for(let i=0;i<8;i++){const a=i*.68; sphere(tail,0xe4938e,.14+Math.cos(a)*.13,.24+Math.sin(a)*.13,-.26-i*.007,.056,.056,.06);}
 // Tiny sculpted coat tufts keep the figure readable at both tabletop and zoomed scale.
 for(let i=0;i<13;i++){const a=i*2.4;const x=Math.sin(a)*.55,z=Math.cos(a)*.37-.11;const tuft=cone(root,i%3?0xe8aaa0:0xf4bdb1,x,1.51+Math.sin(i*1.7)*.08,z,.055,.13,5);tuft.rotation.z=Math.sin(a)*.42;}
 return root;
}
function sculptBeast(kind){if(kind==='pig')return sculptPig();const root=new THREE.Group(),sheep=kind==='sheep',wolf=kind==='wolf',dog=kind==='dog';const base=sheep?0xf3eee0:wolf?0xc5dce5:0x7899a8;
 sphere(root,base,0,.86,0,.78,.56,.51);const head=group(root,0,1.06,.62);root.userData.head=head;sphere(head,base,0,0,.06,.43,.42,.39);
 if(sheep){for(let i=0;i<30;i++){const a=i*2.399,y=.75+Math.sin(i*2.13)*.36; sphere(root,i%4?0xf9f4e8:0xded7cc,Math.cos(a)*.62,y,Math.sin(a)*.38,.20,.22,.20);}sphere(head,0x8b786c,0,-.09,.35,.29,.24,.18);}
 else{for(const side of [-1,1]){const ear=cone(head,wolf?0x9fbecb:0x607a87,side*.29,.47,-.08,.20,.48,5);ear.rotation.z=-side*.2;}sphere(head,0x536d79,0,-.12,.42,.23,.19,.27);sphere(head,0x263942,0,-.06,.62,.1,.085,.09);}
 for(const side of[-1,1]){sphere(head,0xf2f1e8,side*.2,.08,.38,.10,.11,.035);sphere(head,0x2e3f45,side*.2,.08,.414,.042,.055,.02);}
 const legs=[];for(const side of[-1,1])for(const fore of[-1,1]){const l=group(root,side*.46,.56,fore*.38);sphere(l,base,0,-.2,0,.15,.32,.16);sphere(l,0x63747d,0,-.45,.07,.16,.1,.22);legs.push(l);}root.userData.legs=legs;
 const tail=group(root,0,1,-.46);sphere(tail,base,0,.12,-.38,.13,.2,.43);root.userData.tail=tail;return root;
}
function sculptWarrior(kind){const root=new THREE.Group();const robe=kind==='scholar'?0x315c6d:kind==='husker'?0x829344:kind==='maize'?0xa28730:kind==='reaper'?0x743c42:kind==='archer'?0x7a7854:0x6c784e;
 const legs=[];for(const side of[-1,1]){const l=group(root,side*.2,.53,0);sphere(l,robe,0,-.25,0,.14,.34,.16);box(l,0x4a4036,0,-.5,.07,.22,.11,.31);legs.push(l);}root.userData.legs=legs;
 const torso=group(root,0,1.14,0);root.userData.arms=[];sphere(torso,robe,0,0,0,.44,.57,.34);for(const side of[-1,1]){const arm=group(torso,side*.4,.2,0);sphere(arm,robe,side*.02,-.29,.02,.16,.39,.18);sphere(arm,0xd7aa74,side*.04,-.61,.08,.13,.14,.14);root.userData.arms.push(arm);}
 const head=group(torso,0,.54,.05);root.userData.head=head;sphere(head,0xe9c092,0,.14,.05,.33,.35,.29);for(const side of[-1,1])sphere(head,0x263635,side*.13,.21,.313,.031,.045,.015);
 if(kind==='husker'||kind==='archer'){cone(head,kind==='husker'?0xd2b959:0x806947,0,.53,0,.43,.34);box(head,0x9d7b43,0,.38,0,1.05,.08,.8);}else if(kind==='scholar'){cone(head,0x365f74,0,.48,0,.47,.68,7);sphere(head,0x314450,0,-.17,.27,.3,.1,.12);}else if(kind==='reaper'){cone(head,0x4b2936,0,.51,0,.45,.77,8);}else if(kind==='maize'){for(let i=0;i<8;i++)cone(head,i%2?0xd8b953:0x5f8b45,Math.sin(i*2.4)*.29,.53+Math.cos(i*1.4)*.10,Math.cos(i*2.4)*.25,.14,.41,6);}
 if(kind==='archer'){const bow=group(torso,.69,-.03,.03);for(let j=0;j<7;j++){const y=(j-3)*.14;beam(bow,0x80613d,[Math.sin(j*.4)*.12,y,0],[Math.sin((j+1)*.4)*.12,y+.14,0],.035);}beam(bow,0xd5cab0,[0,-.42,0],[0,.48,0],.012);}
 return root;
}
function sculptStructure(kind){const root=new THREE.Group();if(kind==='cornfield'){box(root,0x6b4930,0,.25,0,2.4,.45,2.1);for(let i=0;i<14;i++){const x=(i%4-1.5)*.52,z=(Math.floor(i/4)-1)*.52;beam(root,0x64833d,[x,.48,z],[x,1.6,z],.045);sphere(root,0xf0c456,x,1.4,z,.12,.25,.12);for(const side of[-1,1]){const leaf=sphere(root,0x6e9a4a,x+side*.19,1.04,z,.22,.055,.10);leaf.rotation.z=-side*.35;}}}
 else if(kind==='barn'||kind==='school'){const red=kind==='barn';box(root,red?0x9c4c35:0xc8aa7b,0,.99,0,2.35,1.75,1.85);for(const side of[-1,1]){const roof=box(root,red?0x653f33:0x4f6874,side*.64,2.08,0,1.6,.15,2.25);roof.rotation.z=side*.59;box(root,0xd1ad70,side*1.04,.95,1.0,.12,1.52,.12);}box(root,0x513d32,0,.65,1.0,.7,1.2,.10);box(root,0xdcb677,0,1.46,1.0,.46,.38,.11);}
 else if(kind==='silo'){cylinder(root,0xb9a17c,0,1.15,0,.81,.81,2.0,16);cone(root,0x7c5440,0,2.45,0,.93,.65,16);for(let i=0;i<4;i++)cylinder(root,0x756450,0,.55+i*.42,0,.83,.83,.055,16);box(root,0x5c4a38,0,.53,.78,.43,.65,.10);}
 else{box(root,0x8b775f,0,.72,0,1.75,1.35,1.5);cone(root,0x655d53,0,1.69,0,1.29,.87,4).rotation.y=Math.PI/4;}
 return root;}

export function makeMiniature(key){if(['pig','sheep','wolf','dog'].includes(key))return sculptBeast(key);if(['barn','cornfield','school','silo','scarecrow','throne','den'].includes(key))return sculptStructure(key);return sculptWarrior(key);}
export function animateMiniature(group,unit,time){const walk=unit.action==='walk'||unit.action==='flee',pace=walk?Math.sin(time*10+unit.id.length):0;
 if(group.userData.legs)group.userData.legs.forEach((leg,i)=>leg.rotation.x=pace*(i%2?.4:-.4));
 if(group.userData.arms)group.userData.arms.forEach((arm,i)=>arm.rotation.x=unit.action==='attack'?Math.sin(time*14+i)*.65:pace*(i?.38:-.38));
 if(group.userData.head)group.userData.head.rotation.x=unit.action==='eat'?.22:Math.sin(time*2.2)*.035;
 if(group.userData.tail)group.userData.tail.rotation.y=Math.sin(time*4.3)*.22;
}
