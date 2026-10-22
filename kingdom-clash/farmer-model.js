import * as T from './vendor/three.js';
// Original game mesh adapted from the supplied harvest-warrior reference.
// All attachments remain in the joint hierarchy for walking and staff swings.
export function harvestFarmer(S){
 const {group,ball,cyl,cone,box,material}=S,g=group();
 const speck=(p,r,color,x,y,z,scale)=>{const m=S.mesh(p,'SphereGeometry',[r,8,6],color,x,y,z);if(scale)m.scale.set(...scale);return m;};
 const C={skin:0xf3b481,shade:0xdd8b60,cloth:0x72764b,patch:0x95a15b,straw:0xe6c175,orange:0xed791e,light:0xffaa32,leaf:0x5c8c32,wood:0x795030,rope:0xc6ab78};
 g.userData.kind='human';g.userData.customFarmer=true;g.userData.limbs=[];g.userData.accents=[];const legs=[],arms=[];
 const tube=(p,points,r,color)=>{const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),m=new T.Mesh(new T.TubeGeometry(curve,12,r,7,false),material(color));m.castShadow=true;m.receiveShadow=true;m.userData.ownedGeometry=true;p.add(m);return m;};
 const carrotLock=(p,points,r,color)=>{const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),geo=new T.TubeGeometry(curve,16,r,9,false),pos=geo.attributes.position;for(let i=0;i<=16;i++){const center=curve.getPointAt(i/16),taper=Math.max(.035,Math.pow(1-i/16,.65));for(let j=0;j<=9;j++){const k=i*10+j;pos.setXYZ(k,center.x+(pos.getX(k)-center.x)*taper,center.y+(pos.getY(k)-center.y)*taper,center.z+(pos.getZ(k)-center.z)*taper);}}geo.computeVertexNormals();const m=new T.Mesh(geo,material(color));m.castShadow=true;m.userData.ownedGeometry=true;p.add(m);return m;};
 const leaf=(p,x,y,z,a=0,size=1)=>{const l=ball(p,.12,C.leaf,x,y,z,[.6*size,1.9*size,.22*size]);l.rotation.z=a;return l;};
 // Wide shoulders, bare chest, rounded silhouette and short patched overalls.
 ball(g,.54,C.skin,0,1.32,0,[1.22,1.05,.72]);ball(g,.42,C.skin,0,1.07,.06,[1.3,.9,.88]);
 ball(g,.48,C.cloth,0,.86,-.01,[1.25,.72,.8]);box(g,.64,.42,.12,C.cloth,0,1.08,.35);
 for(const sign of[-1,1]){
  const leg=group(g,sign*.29,.73,0);legs.push(leg);cyl(leg,.23,.25,.32,C.cloth,0,-.1,0,12);cyl(leg,.25,.25,.055,C.patch,0,-.26,0,12);ball(leg,.18,C.skin,0,-.36,.015,[1,1.4,1]);ball(leg,.19,C.skin,0,-.57,.13,[1.1,.55,1.65]);for(let j=0;j<5;j++)ball(leg,.048-j*.003,C.skin,sign*(j-2)*.067,-.59,.36-Math.abs(j-2)*.015,[.7,.7,1.2]);
  const strap=box(g,.105,.67,.075,C.cloth,sign*.32,1.35,.32);strap.rotation.z=-sign*.14;ball(g,.072,0xe4b94a,sign*.29,1.12,.44,[1,1,.3]);
  const arm=group(g,sign*.6,1.62,0);arms.push(arm);ball(arm,.24,C.skin,0,-.08,0,[1,1.1,.9]);ball(arm,.19,C.skin,sign*.07,-.32,.03,[1,1.25,1]);ball(arm,.18,C.skin,sign*.06,-.5,.1,[1,1,.8]);for(let j=0;j<4;j++)ball(arm,.05,C.skin,(j-1.5)*.065+sign*.06,-.55,.23,[.8,1.45,.8]);ball(arm,.07,C.skin,-sign*.1,-.43,.21,[1,.9,1.2]);
 }
 g.userData.limbs=[...legs,...arms];
 box(g,1.05,.1,.69,0x735335,0,.88,0);tube(g,[[-.45,.92,.4],[0,.84,.47],[.42,.94,.4]],.035,C.rope);for(const sign of[-1,1])tube(g,[[0,.88,.49],[sign*.15,.97,.5],[sign*.2,.85,.5],[0,.88,.49],[sign*.15,.73,.48]],.022,C.rope);
 for(const sign of[-1,1]){const seam=box(g,.025,.55,.015,0x4d5838,sign*.34,1.32,.386);seam.rotation.z=-sign*.14;ball(g,.026,0xd6b761,sign*.29,1.12,.47);}
 box(g,.36,.31,.13,0x8b6744,-.48,.88,.22);box(g,.36,.045,.15,0x5c472e,-.48,1.05,.22);ball(g,.032,0xe3bd67,-.48,.9,.30);
 for(const [x,y]of[[-.38,.68],[.34,.94]]){const patch=box(g,.18,.16,.025,C.patch,x,y,.36);patch.rotation.z=.2;for(let i=0;i<4;i++)box(g,.025,.055,.03,C.rope,x-.075+i*.05,y+.08,.38);}
 // Smile, cheeks, brows, swept orange hair and curling carrot beard.
 const head=group(g,0,1.94,.015);g.userData.head=head;ball(head,.37,C.skin,0,0,0,[1.12,1,.9]);for(const sign of[-1,1]){ball(head,.1,C.skin,sign*.39,0,0,[.55,1,.65]);ball(head,.13,C.shade,sign*.23,-.04,.25,[1,.65,.45]);speck(head,.076,0xffecd4,sign*.155,.075,.293,[1.18,.88,.4]);speck(head,.033,0x603c2b,sign*.148,.075,.326,[1,.94,.42]);speck(head,.011,0xfff8d8,sign*.14,.087,.343);tube(head,[[sign*.08,.07,.3],[sign*.15,.1,.32],[sign*.23,.07,.29]],.021,0x503724);tube(head,[[sign*.07,.18,.29],[sign*.17,.21,.3],[sign*.26,.17,.26]],.04,C.orange);for(let i=0;i<3;i++){const lock=ball(head,.16,C.orange,sign*(.18+i*.07),.2-i*.08,-.08,[1.3,.48,1]);lock.rotation.z=sign*.3;}for(let i=0;i<3;i++)speck(head,.012,0xb96b47,sign*(.2+i*.045),-.045-(i%2)*.04,.36);}
 ball(head,.13,C.shade,0,-.01,.35,[1,.8,.9]);ball(head,.19,0x623526,0,-.17,.29,[1.1,.62,.4]);box(head,.25,.045,.035,0xffefd3,0,-.12,.365);
 for(const sign of[-1,1])tube(head,[[0,-.05,.38],[sign*.18,-.05,.43],[sign*.38,.02,.34],[sign*.45,.1,.26]],.065,C.orange);
 const beard=group(g,0,1.67,.22);g.userData.beard=beard;
 for(let i=0;i<7;i++){const x=(i-3)*.105,len=.35+(1-Math.abs(i-3)/4)*.2;const b=group(beard,x,0,Math.abs(i-3)*-.025);carrotLock(b,[[0,0,.06],[0,-len*.35,.13],[.045,-len*.8,.19],[.11,-len,.18],[.14,-len+.06,.16]],.115,i%2?C.light:C.orange);if(i%2===0)leaf(b,.12,-len+.08,.16,-.5,.45);}
 // Broad irregular woven hat, red band, leaves and wheat.
 const hat=group(g,0,2.27,0);g.userData.hat=hat;hat.rotation.z=-.09;const brim=cyl(hat,.78,.79,.075,C.straw,0,0,0,48);brim.scale.z=.8;const bp=brim.geometry.clone(),pa=bp.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),r=Math.hypot(x,z);pa.setY(i,pa.getY(i)+Math.sin(Math.atan2(z,x)*3+.4)*.045*r/.79);}bp.computeVertexNormals();brim.geometry=bp;brim.userData.ownedGeometry=true;cyl(hat,.29,.37,.31,C.straw,0,.16,0,20);cyl(hat,.35,.37,.09,0xa9533b,0,.07,0,24);
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2;tube(hat,[[Math.sin(a)*.38,.045,Math.cos(a)*.3],[Math.sin(a)*.72,.04,Math.cos(a)*.56]],.009,0xbda061);}
 for(let i=0;i<3;i++){const band=tube(hat,[[-.32+i*.07,.14,.33],[-.14+i*.07,.11,.36],[.18+i*.06,.14,.34]],.013,i%2?0xf2d395:0x9e6642);band.rotation.y=.12;}
 for(const sign of[-1,1]){leaf(hat,sign*.43,.1,.23,sign*-.9,1.1);tube(hat,[[sign*.4,.03,-.1],[sign*.61,.42,-.13]],.012,0xb69b48);for(let j=0;j<5;j++)ball(hat,.04,0xe7c15e,sign*(.5+j*.025),.21+j*.05,-.13,[1,1.7,.7]);}
 // Ribbed pumpkin rucksack with rope harness and curling vines.
 const pack=group(g,0,1.3,-.49);g.userData.backpack=pack;ball(pack,.43,C.orange,0,0,0,[1.1,1.15,.75]);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ball(pack,.21,i%2?0xe8a32e:0xf2b23a,Math.sin(a)*.28,0,Math.cos(a)*.21,[.8,2.15,.7]);}tube(pack,[[-.4,.25,-.12],[-.45,-.2,-.16],[0,-.4,-.25],[.45,-.2,-.16],[.4,.25,-.12]],.035,C.rope);for(const sign of[-1,1])tube(g,[[sign*.25,1.61,-.08],[sign*.42,1.35,-.34],[sign*.31,.98,-.48]],.046,C.rope);cyl(pack,.06,.08,.2,C.wood,0,.46,0);for(let i=0;i<6;i++)leaf(pack,Math.sin(i)*.25,.35,Math.cos(i)*.2,(i-2.5)*.6,1.2);
 // Living carrot staff, firmly attached to the left hand.
 const arm=arms[0],staff=group(arm,-.24,-.43,.22);g.userData.weapon=staff;g.userData.weaponArm=arm;
 g.userData.freeArm=arms[1];g.userData.staff=staff;
 cyl(staff,.045,.06,2.0,C.wood,0,.45,0,12);cone(staff,.07,.28,0x8da354,0,-.68,0,8).rotation.z=Math.PI;
 for(let i=0;i<6;i++){const a=i*.7;tube(staff,[[Math.sin(a)*.065,-.3+i*.22,.05],[Math.sin(a+.8)*.08,-.15+i*.22,.06]],.025,C.leaf);if(i%2===0)leaf(staff,.09,-.2+i*.22,.03,-.8,.65);}
 const carrot=group(staff,0,1.66,0);g.userData.carrotCompanion=carrot;ball(carrot,.29,C.orange,0,0,0,[.9,1.3,.85]);cone(carrot,.18,.3,C.light,0,-.36,0,12).rotation.z=Math.PI;ball(carrot,.15,0xfff0c5,0,.03,.23,[.8,1.25,.35]);ball(carrot,.055,0x71392a,.015,.02,.28,[.7,1,.3]);tube(carrot,[[-.11,-.19,.21],[0,-.23,.26],[.11,-.17,.21]],.016,0x8f4b23);for(let i=0;i<5;i++)leaf(carrot,Math.sin(i)*.13,.4+Math.abs(Math.sin(i))*.07,Math.cos(i)*.13,(i-2)*.55,1.3);
 for(let i=0;i<4;i++){const a=i*.6;tube(staff,[[Math.sin(a)*.11,1.29,Math.cos(a)*.11],[Math.sin(a+2)*.12,1.39,Math.cos(a+2)*.12]],.025,C.rope);}
 return g;
}
export function animateFarmer(g,t,moving,reduced,a={}){if(!g.userData.customFarmer)return;const amount=reduced?0:1,tending=a.action==='harvest'||a.state==='tending crops';g.userData.beard.rotation.x=Math.sin(t*(moving?7:2))*.055*amount;g.userData.backpack.rotation.z=Math.sin(t*(moving?7:1.5))*.035*amount;g.userData.carrotCompanion.rotation.z=Math.sin(t*2.4)*.12*amount;g.userData.head.rotation.y=Math.sin(t*.8)*.05*amount;g.userData.head.rotation.x=tending?.10*amount:Math.sin(t*1.7)*.025*amount;g.userData.hat.rotation.z=-.09+Math.sin(t*(moving?6:1.4))*.025*amount;g.userData.staff.rotation.z=Math.sin(t*(moving?6:2))*.035*amount;if(tending)g.userData.freeArm.rotation.x=-.38+Math.sin(t*9)*.26*amount;}
