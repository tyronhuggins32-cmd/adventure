import * as T from './vendor/three.js';
// Genuine articulated 3D geometry rendered by Three.js in both the active Living World and battle table.
// Silhouette and palette are adapted to the user's stylized mobile harvest-character references.
// All attachments remain in the joint hierarchy for walking and staff swings.
export function harvestFarmer(S){
 const {group,ball,cyl,cone,box,material}=S,g=group();
 const C={skin:0xf3b481,shade:0xdd8b60,cloth:0x747c4e,patch:0x95a15b,straw:0xe6c175,orange:0xed791e,light:0xffaa32,leaf:0x5c8c32,wood:0x795030,rope:0xc6ab78};
 g.userData.kind='human';g.userData.customFarmer=true;g.userData.modelStyle='harvest-hero-mobile-v3';g.userData.limbs=[];g.userData.accents=[];g.userData.detailLevel=3;const legs=[],arms=[];
 const tube=(p,points,r,color)=>{const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),m=new T.Mesh(new T.TubeGeometry(curve,12,r,7,false),material(color));m.castShadow=true;m.receiveShadow=true;m.userData.ownedGeometry=true;p.add(m);return m;};
 const carrotLock=(p,points,r,color)=>{const curve=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),geo=new T.TubeGeometry(curve,16,r,9,false),pos=geo.attributes.position;for(let i=0;i<=16;i++){const center=curve.getPointAt(i/16),taper=Math.max(.035,Math.pow(1-i/16,.65));for(let j=0;j<=9;j++){const k=i*10+j;pos.setXYZ(k,center.x+(pos.getX(k)-center.x)*taper,center.y+(pos.getY(k)-center.y)*taper,center.z+(pos.getZ(k)-center.z)*taper);}}geo.computeVertexNormals();const m=new T.Mesh(geo,material(color));m.castShadow=true;m.userData.ownedGeometry=true;p.add(m);return m;};
 const leaf=(p,x,y,z,a=0,size=1)=>{const l=ball(p,.12,C.leaf,x,y,z,[.6*size,1.9*size,.22*size]);l.rotation.z=a;return l;};
 // Wide shoulders, bare chest, rounded silhouette and short patched overalls.
 ball(g,.49,C.skin,0,1.32,0,[1.13,1.06,.75]);ball(g,.385,C.skin,0,1.07,.06,[1.25,.9,.84]);
 ball(g,.425,C.cloth,0,.86,-.01,[1.24,.79,.85]);box(g,.56,.37,.09,C.cloth,0,1.07,.34);
 for(const sign of[-1,1]){
  const leg=group(g,sign*.235,.77,0);legs.push(leg);cyl(leg,.19,.215,.31,C.cloth,0,-.10,0,12);cyl(leg,.218,.22,.055,C.patch,0,-.25,0,12);ball(leg,.165,C.skin,0,-.385,.015,[1,1.42,.9]);ball(leg,.165,C.skin,0,-.655,.115,[1.1,.50,1.68]);for(let j=0;j<5;j++)ball(leg,.048-j*.003,C.skin,sign*(j-2)*.058,-.665,.345-Math.abs(j-2)*.013,[.7,.7,1.2]);
  const strap=box(g,.095,.64,.068,C.cloth,sign*.275,1.35,.32);strap.rotation.z=-sign*.14;ball(g,.072,0xe4b94a,sign*.275,1.12,.41,[1,1,.3]);
  const arm=group(g,sign*.52,1.62,0);arms.push(arm);ball(arm,.195,C.skin,0,-.08,0,[1,1.14,.94]);ball(arm,.165,C.skin,sign*.07,-.32,.03,[1,1.27,1]);ball(arm,.145,C.skin,sign*.06,-.50,.1,[1,1,.9]);for(let j=0;j<4;j++)ball(arm,.05,C.skin,(j-1.5)*.065+sign*.06,-.55,.23,[.8,1.45,.8]);ball(arm,.07,C.skin,-sign*.1,-.43,.21,[1,.9,1.2]);
 }
 g.userData.limbs=[...legs,...arms];
 box(g,.90,.09,.63,0x735335,0,.88,0);tube(g,[[-.45,.92,.4],[0,.84,.47],[.42,.94,.4]],.035,C.rope);for(const sign of[-1,1])tube(g,[[0,.88,.49],[sign*.15,.97,.5],[sign*.2,.85,.5],[0,.88,.49],[sign*.15,.73,.48]],.022,C.rope);
 for(const [x,y]of[[-.38,.68],[.34,.94]]){const patch=box(g,.18,.16,.025,C.patch,x,y,.36);patch.rotation.z=.2;for(let i=0;i<4;i++)box(g,.025,.055,.03,C.rope,x-.075+i*.05,y+.08,.38);}
 // Smile, cheeks, brows, swept orange hair and curling carrot beard.
 const head=group(g,0,1.94,.015);g.userData.head=head;ball(head,.37,C.skin,0,0,0,[1.12,1,.9]);for(const sign of[-1,1]){ball(head,.1,C.skin,sign*.39,0,0,[.55,1,.65]);ball(head,.13,C.shade,sign*.23,-.04,.25,[1,.65,.45]);tube(head,[[sign*.08,.07,.3],[sign*.15,.1,.32],[sign*.23,.07,.29]],.021,0x503724);tube(head,[[sign*.07,.18,.29],[sign*.17,.21,.3],[sign*.26,.17,.26]],.04,C.orange);for(let i=0;i<3;i++){const lock=ball(head,.16,C.orange,sign*(.18+i*.07),.2-i*.08,-.08,[1.3,.48,1]);lock.rotation.z=sign*.3;}}
 ball(head,.13,C.shade,0,-.01,.35,[1,.8,.9]);
 // Large, warm expressive eyes with eyebrows, irises and clean mobile-size highlights.
 for(const sign of [-1,1]){
  ball(head,.075,0xffe8ca,sign*.154,.038,.302,[1,.78,.54]);
  ball(head,.041,0x6c7043,sign*.148,.038,.339,[.86,.94,.48]);
  ball(head,.023,0x262c22,sign*.146,.039,.361,[1,.99,.47]);
  ball(head,.012,0xffffff,sign*.160,.058,.375,[.85,.8,.55]);
  ball(head,.082,C.shade,sign*.258,-.095,.266,[1,.55,.32]);
 }
 ball(head,.18,0x623526,0,-.17,.29,[1.1,.52,.40]);box(head,.23,.038,.034,0xffefd3,0,-.135,.365);
 for(const sign of[-1,1])tube(head,[[0,-.05,.38],[sign*.18,-.05,.43],[sign*.38,.02,.34],[sign*.45,.1,.26]],.065,C.orange);
 const beard=group(head,0,-.27,.205);g.userData.beard=beard;
 for(let i=0;i<7;i++){const x=(i-3)*.105,len=.35+(1-Math.abs(i-3)/4)*.2;const b=group(beard,x,0,Math.abs(i-3)*-.025);carrotLock(b,[[0,0,.06],[0,-len*.35,.13],[.045,-len*.8,.19],[.11,-len,.18],[.14,-len+.06,.16]],.092,i%2?C.light:C.orange);if(i%2===0)leaf(b,.12,-len+.08,.16,-.5,.45);}
 // Broad irregular woven hat, red band, leaves and wheat.
 const hat=group(head,0,.33,0);g.userData.hat=hat;hat.rotation.z=-.09;const brim=cyl(hat,.68,.70,.075,C.straw,0,0,0,48);brim.scale.z=.8;const bp=brim.geometry.clone(),pa=bp.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),r=Math.hypot(x,z);pa.setY(i,pa.getY(i)+Math.sin(Math.atan2(z,x)*3+.4)*.045*r/.7);}bp.computeVertexNormals();brim.geometry=bp;brim.userData.ownedGeometry=true;cyl(hat,.29,.37,.31,C.straw,0,.16,0,20);cyl(hat,.35,.37,.09,0xa9533b,0,.07,0,24);
 for(let i=0;i<26;i++){const a=i/26*Math.PI*2;tube(hat,[[Math.sin(a)*.38,.045,Math.cos(a)*.3],[Math.sin(a)*.62,.04,Math.cos(a)*.48]],.009,0xbda061);}
 for(const sign of[-1,1]){leaf(hat,sign*.43,.1,.23,sign*-.9,1.1);tube(hat,[[sign*.4,.03,-.1],[sign*.61,.42,-.13]],.012,0xb69b48);for(let j=0;j<5;j++)ball(hat,.04,0xe7c15e,sign*(.5+j*.025),.21+j*.05,-.13,[1,1.7,.7]);}
 // Ribbed pumpkin rucksack with rope harness and curling vines.
 const pack=group(g,0,1.3,-.49);g.userData.backpack=pack;ball(pack,.355,C.orange,0,0,0,[1.08,1.13,.78]);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ball(pack,.21,i%2?0xe8a32e:0xf2b23a,Math.sin(a)*.24,0,Math.cos(a)*.18,[.8,2.15,.7]);}tube(pack,[[-.4,.25,-.12],[-.45,-.2,-.16],[0,-.4,-.25],[.45,-.2,-.16],[.4,.25,-.12]],.035,C.rope);cyl(pack,.06,.08,.2,C.wood,0,.46,0);for(let i=0;i<6;i++)leaf(pack,Math.sin(i)*.25,.35,Math.cos(i)*.2,(i-2.5)*.6,1.2);
 // Living carrot staff, firmly attached to the left hand.
 const arm=arms[0],staff=group(arm,-.17,-.43,.22);g.userData.weapon=staff;g.userData.weaponArm=arm;
 cyl(staff,.045,.06,2.0,C.wood,0,.45,0,12);cone(staff,.07,.28,0x8da354,0,-.68,0,8).rotation.z=Math.PI;
 for(let i=0;i<6;i++){const a=i*.7;tube(staff,[[Math.sin(a)*.065,-.3+i*.22,.05],[Math.sin(a+.8)*.08,-.15+i*.22,.06]],.025,C.leaf);if(i%2===0)leaf(staff,.09,-.2+i*.22,.03,-.8,.65);}
 const carrot=group(staff,0,1.66,0);g.userData.carrotCompanion=carrot;ball(carrot,.29,C.orange,0,0,0,[.9,1.3,.85]);cone(carrot,.18,.3,C.light,0,-.36,0,12).rotation.z=Math.PI;ball(carrot,.15,0xfff0c5,0,.03,.23,[.8,1.25,.35]);ball(carrot,.055,0x71392a,.015,.02,.28,[.7,1,.3]);tube(carrot,[[-.11,-.19,.21],[0,-.23,.26],[.11,-.17,.21]],.016,0x8f4b23);for(let i=0;i<5;i++)leaf(carrot,Math.sin(i)*.13,.4+Math.abs(Math.sin(i))*.07,Math.cos(i)*.13,(i-2)*.55,1.3);
 for(let i=0;i<4;i++){const a=i*.6;tube(staff,[[Math.sin(a)*.11,1.29,Math.cos(a)*.11],[Math.sin(a+2)*.12,1.39,Math.cos(a+2)*.12]],.025,C.rope);}
 g.userData.rig={legs,arms,head,hat,beard,pack,staff,carrot};
 return g;
}

// Animations use authoritative simulation state. Distinct actions drive separate mesh joints;
// pause/reduced motion pose exactly at rest, and no animation changes world position or combat.
export function animateFarmer(g,a,reduced=false){
 if(!g.userData.customFarmer)return;
 const r=g.userData.rig,t=Number.isFinite(a.clock)?a.clock:0;
 if(reduced){
   // Explicit stable pose, including no negative-zero Euler values.
   for(const pivot of [...r.legs,...r.arms])pivot.rotation.set(0,0,0);
   r.head.rotation.set(0,0,0);
   r.hat.rotation.set(0,0,-.09);
   r.beard.rotation.set(0,0,0);
   r.pack.rotation.set(0,0,0);
   r.carrot.rotation.set(0,0,0);
   g.userData.bob=0;g.userData.animationState='rest';
   return;
 }
 const moving=!!a.moving;
 const state=a.action||a.state||'idle', activity=Math.max(0,Math.min(1,Number(a.activity)||0));
 const wave=moving?Math.sin(t*9+(a.program?.phase||0)):0;
 const kick=moving?Math.cos(t*9+(a.program?.phase||0)):0;
 const strike=!reduced&&['attack','shoot'].includes(state)?Math.sin((1-activity/.65)*Math.PI*.92):0;
 const pulse=!reduced&&['command','summon','harvest','power','celebrate'].includes(state)&&activity>.01?Math.sin((1-activity/.65)*Math.PI*.90):0;
 const hurt=!reduced&&state==='hit'?Math.min(1,activity*2):0;
 const stoop=!reduced&&['feed','graze','root','inspect crops'].includes(state)?1:0;
 const amount=reduced?0:1;
 // Legs alternate in opposite phases; both feet and shorts follow their own pivots.
 r.legs[0].rotation.x=wave*.58;
 r.legs[1].rotation.x=moving?-wave*.58:0;
 r.legs[0].rotation.z=kick*.045;
 r.legs[1].rotation.z=moving?-kick*.045:0;
 // Staff-bearing left arm strikes forward. Right arm counterbalances, waves and gathers crops.
 r.arms[0].rotation.x=wave*-.28-strike*1.18-pulse*.65+stoop*.2;
 r.arms[1].rotation.x=wave*.29+strike*.42-pulse*1.0+stoop*.55;
 r.arms[0].rotation.z=-.14-strike*.23;
 r.arms[1].rotation.z=.14+pulse*.15;
 r.head.rotation.x=(Math.sin(t*1.8)*.035-stoop*.26-hurt*.24)*amount;
 r.head.rotation.y=(Math.sin(t*.74)*.08+strike*.14)*amount;
 r.head.rotation.z=(Math.sin(t*1.3)*.025+hurt*.15)*amount;
 r.hat.rotation.z=-.09+Math.sin(t*(moving?8.5:1.35))*.045*amount;
 r.beard.rotation.x=Math.sin(t*(moving?9:2.2))*.075*amount+strike*.15;
 r.beard.rotation.z=(Math.sin(t*2.4)*.025+kick*.08)*amount;
 r.pack.rotation.z=Math.sin(t*(moving?8:1.55))*(moving?.095:.027)*amount;
 r.pack.rotation.x=(Math.sin(t*1.7)*.027+kick*.03)*amount;
 r.carrot.rotation.z=(Math.sin(t*3.1)*.10+strike*.30)*amount;
 r.carrot.rotation.x=Math.sin(t*2.2)*.045*amount;
 g.userData.bob=reduced?0:moving?Math.abs(wave)*.08:Math.sin(t*2.3)*.024;
 g.userData.animationState=reduced?'rest':hurt?'hit':strike?'attack':pulse?'harvest':moving?'walk':stoop?'inspect':'idle';
}
