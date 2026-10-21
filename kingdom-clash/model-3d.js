import * as T from './vendor/three.js';
import {hashName} from './entity-programs.js';
export const PALETTES_3D={farm:{body:0x607b43,trim:0xe5b554,roof:0x9b5834,wood:0x795135,skin:0xf2bd8e},ice:{body:0x668ba5,trim:0xbceeff,roof:0x5079a1,wood:0x5d697a,skin:0xf0cfb0},beach:{body:0x38a6a0,trim:0xefcb78,roof:0xa95544,wood:0x725644,skin:0xd99d6c},medieval:{body:0x66758a,trim:0xe6b85b,roof:0x794e71,wood:0x685343,skin:0xe9b38b}};
const mats=new Map(),geos=new Map();
export function material(color,glow=false){const key=color+':'+glow;if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness:.76,metalness:glow?.15:0,flatShading:true,emissive:glow?color:0,emissiveIntensity:glow?.45:0}));return mats.get(key)}
function geo(type,args){const key=type+args.join(',');if(!geos.has(key))geos.set(key,new T[type](...args));return geos.get(key)}
export function group(parent,x=0,y=0,z=0){const g=new T.Group();g.position.set(x,y,z);parent?.add(g);return g}
export function mesh(parent,type,args,color,x=0,y=0,z=0,scale=null){const m=new T.Mesh(geo(type,args),material(color));m.position.set(x,y,z);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
export const box=(p,w,h,d,c,x=0,y=0,z=0)=>mesh(p,'BoxGeometry',[w,h,d],c,x,y,z);
export const ball=(p,r,c,x=0,y=0,z=0,s=null)=>mesh(p,'SphereGeometry',[r,10,7],c,x,y,z,s);
export const cyl=(p,rt,rb,h,c,x=0,y=0,z=0,n=10)=>mesh(p,'CylinderGeometry',[rt,rb,h,n],c,x,y,z);
export const cone=(p,r,h,c,x=0,y=0,z=0,n=7)=>mesh(p,'ConeGeometry',[r,h,n],c,x,y,z);
function ring(p,r,t,c,x,y,z){return mesh(p,'TorusGeometry',[r,t,5,12],c,x,y,z)}
function eyes(p,y,z,spread=.16){for(const sign of[-1,1]){ball(p,.045,0xfffcdd,sign*spread,y,z);ball(p,.026,0x182526,sign*spread,y,z+.035)}}
function joints(p,count=2){p.userData.limbs=[];for(let i=0;i<count;i++)p.userData.limbs.push(group(p));}
function limb(p,x,y,z,w,h,c,boot=false){const j=group(p,x,y,z);cyl(j,w*.48,w*.55,h,c,0,-h/2,0,8);if(boot)box(j,w*1.16,.18,w*1.8,0x5d3e28,0,-h,.07);p.userData.limbs.push(j);return j}
function staff(p,palette,kind='staff'){const a=group(p,-.68,.1,.05);cyl(a,.035,.045,1.9,palette.wood,0,1,0);if(kind==='fork'){box(a,.48,.06,.07,0x877454,0,.2,.02);for(let i=0;i<3;i++)box(a,.035,.4,.05,0x9e9b81,-.2+i*.2,.08,.02)}else if(kind==='sword'){box(a,.12,1,.07,0xd9e2e2,0,1.55,0);box(a,.48,.07,.12,palette.trim,0,1.05,0);}else{ball(a,.18,palette.trim,0,2,0);const r=ring(a,.25,.045,palette.body,0,2,0);r.rotation.y=.3;}return a}
function hat(p,c,wide=true){cyl(p,wide?.65:.39,wide?.65:.39,.065,c,0,2.29,0,12);cyl(p,.28,.36,.35,c,0,2.47,0,10);cyl(p,.34,.36,.085,0x65402c,0,2.33,0)}
function cape(p,c){box(p,.85,1.22,.12,c,0,1.05,-.34);for(let i=0;i<4;i++)box(p,.18,.3,.13,c,-.33+i*.22,.35-(i%2)*.06,-.35)}
function crown(p,c){cyl(p,.35,.35,.15,c,0,2.23,0);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;cone(p,.09,.26,c,Math.sin(a)*.32,2.42,Math.cos(a)*.32)}}
export function humanModel(card,k){const p=PALETTES_3D[k]||PALETTES_3D.farm,g=group(),id=card.id||'',name=card.name||'',seed=hashName(name),leader=card.type==='commander';joints(g);const scare=/scarecrow|straw|outcast/i.test(name),knight=k==='medieval'||/squire|captain|warden|cavalier|oathbreaker|duelist/i.test(name),farmer=id==='farmer',robe=/druid|witch|oracle|collector|wraith|seer|hermit/i.test(name);const suit=farmer?0x3e627d:scare?0x977442:knight?0x74838c:p.body;
 cyl(g,.39,.33,.82,suit,0,1.26,0,8).scale.z=.68;box(g,.77,.14,.48,0x65422c,0,.9,0);box(g,.19,.15,.06,p.trim,0,.9,.26);
 if(robe)cone(g,.52,.95,suit,0,.74,0,8);for(const sign of[-1,1])limb(g,sign*.21,.88,0,.22,.63,farmer?0x475e72:suit,true);
 for(const sign of[-1,1]){const arm=limb(g,sign*.47,1.65,0,.22,.62,suit);arm.rotation.z=sign*.12;ball(arm,.13,scare?0xd8bd77:p.skin,0,-.64,.02)}
 ball(g,.39,scare?0xc2a56b:p.skin,0,1.99,0,[.87,1,.87]);if(scare){for(const sign of[-1,1])ball(g,.05,0x38352a,sign*.13,2.04,.3);box(g,.24,.035,.025,0x4d3c29,0,1.88,.31);for(let i=0;i<4;i++)box(g,.02,.08,.03,0x5a4933,(i-1.5)*.06,1.88,.32);}else{eyes(g,2.04,.29);for(const sign of[-1,1])box(g,.13,.035,.025,0x5c3d2b,sign*.14,2.14,.3);box(g,.14,.025,.025,0x985d45,0,1.83,.31);}cone(g,.085,.16,p.skin,0,1.95,.36).rotation.x=Math.PI/2;
 if(farmer||/shepherd|castellan|druid/i.test(id)){ball(g,.19,0x543827,0,1.81,.24,[1.4,.6,.5]);for(const sign of[-1,1])ball(g,.16,0x543827,sign*.12,1.92,.31,[1,.4,.4]);}
 if(farmer){hat(g,0xd8b76e);for(let i=0;i<4;i++){box(g,.69,.035,.43,0x7a96a5,0,1.02+i*.18,.005);box(g,.035,.8,.435,0x8da0a8,-.27+i*.18,1.28,.008)}ball(g,.48,0xc4a76b,.26,1.4,-.42,[.85,1.3,.7]);for(let i=0;i<6;i++){const s=cyl(g,.025,.025,.6,0xd3b14c,.12+i*.055,2.02,-.4);s.rotation.z=(i-2)*.12;cone(g,.06,.28,0xe1bd4f,.12+i*.055,2.36,-.4)}staff(g,p,'fork');}
 else if(id==='scarecrow'||scare){hat(g,0x775037);for(let i=0;i<9;i++){const straw=box(g,.045,.35,.045,0xc7a75d,(i%3-1)*.25,1.6-(i%2)*.35,.28);straw.rotation.z=(i-4)*.18;}box(g,.22,.18,.035,0x674a37,.16,1.32,.23);ball(g,.13,0x283341,.5,1.76,0);cone(g,.09,.22,0x29313a,.6,1.76,.05).rotation.z=-Math.PI/2;}
 else if(id==='cornDruid'){cape(g,0x4e6638);crown(g,0xbfa942);for(let i=0;i<6;i++){const a=i*Math.PI/3;cone(g,.1,.42,0xe6c44a,Math.sin(a)*.3,2.5,Math.cos(a)*.3)}staff(g,p);}
 else if(id==='hearthkeeper'){cape(g,0x9d4b36);for(let i=0;i<8;i++)ball(g,.11,0xe9dcc0,(i%4-1.5)*.2,1.7-Math.floor(i/4)*.95,-.25);cyl(g,.1,.1,.32,0x4f4a36,.63,.85,.12);ball(g,.08,0xffd16c,.63,.89,.12).material=material(0xffbf54,true);}
 else if(id==='frostWitch'){cape(g,0x6f92b2);crown(g,0xbee9ee);staff(g,p);for(let i=0;i<4;i++)cone(g,.075,.4,0x8dd7e6,-.68+(i-1.5)*.11,2.2,0);}
 else if(id==='glacierShepherd'){cape(g,0x786d59);hat(g,0xb6b6a1,false);for(let i=0;i<7;i++)ball(g,.11,0xe4ddc5,(i-3)*.11,1.68,.15);staff(g,p);}
 else if(id==='castawayCaptain'){cape(g,0x883f36);hat(g,0x433c36);box(g,.8,.09,.44,p.trim,0,1.5,.02);staff(g,p,'sword');}
 else if(id==='reefOracle'){cape(g,0x3f949a);crown(g,0xdb926d);for(let i=0;i<5;i++)cone(g,.065,.4,0xd08165,(i-2)*.16,2.44,0);ball(g,.2,0xe8d9ac,-.64,1.8,.2);}
 else if(id==='tideCollector'){cape(g,0x3b7873);box(g,.75,.7,.3,0x795b3c,0,1.38,-.4);for(let i=0;i<4;i++)cyl(g,.09,.09,.3,0x70c6cb,(i%2-.5)*.38,1.2+Math.floor(i/2)*.45,-.62);staff(g,p);}
 else if(id==='bannerKnight'){cape(g,0x9e3e3b);box(g,.82,.66,.48,0x8b9598,0,1.38,0);box(g,.15,.5,.035,p.trim,0,1.38,.26);box(g,.4,.1,.035,p.trim,0,1.44,.27);staff(g,p,'sword');const pole=cyl(g,.035,.035,2.8,p.wood,-.82,1.4,-.12);box(g,.7,.5,.06,0xb44239,-1.15,2.5,-.12);}
 else if(id==='royalCastellan'){box(g,.96,.8,.52,0x777f82,0,1.3,0);const shield=box(g,.55,.85,.13,0x44677a,.63,1.18,.32);box(g,.12,.65,.15,p.trim,.63,1.18,.34);box(g,.4,.12,.15,p.trim,.63,1.3,.35);}
 else if(id==='exiledPrince'){cape(g,0x653a68);crown(g,0xdbc16c);staff(g,p,'sword');}
 else{if(knight){cyl(g,.4,.39,.3,0x76848a,0,2.2,0);cone(g,.1,.35,p.trim,0,2.5,0);staff(g,p,'sword')}else if(robe){cape(g,p.roof);staff(g,p)}else hat(g,p.wood,false);}
 if(!leader){g.scale.setScalar(.72+(seed%20)/100)}g.userData.kind='human';return g;}
function quadruped(card,k){const p=PALETTES_3D[k]||PALETTES_3D.farm,g=group(),name=card.name||'',seed=hashName(name),pig=/pig|boar/i.test(name),wolf=/wolf|hound|mastiff|fox/i.test(name),large=/mammoth|yak|ox|bear|ram/i.test(name),turtle=/turtle|guardian/i.test(name),seal=/seal|leech|eel|serpent/i.test(name);joints(g);const color=pig?0xc9907f:wolf?/fox/i.test(name)?0xb96737:0x626c70:turtle?0x5e8e71:k==='ice'?0xc5d6da:0x8c734f;
 ball(g,.58,color,0,.78,0,[.9,.85,1.4]);const head=group(g,0,.92,.68);ball(head,.33,color,0,0,0);ball(head,.22,pig?0xdba48d:color,0,-.05,.25,[1,.65,.7]);eyes(head,.08,.27,.13);for(const sign of[-1,1]){cone(head,.12,wolf?.38:.23,color,sign*.21,.32,0);if(/ram|yak|ox|kid|stag|mammoth/i.test(name)){const horn=cone(head,.09,.45,0xe7d9ad,sign*.32,.35,.04);horn.rotation.z=sign*-.5;}if(!seal)for(const z of[-.38,.38])limb(g,sign*.34,.58,z,.18,.48,color,true)}
 if(pig){for(const sign of[-1,1])ball(head,.035,0x78514c,sign*.075,-.05,.42);const tail=ring(g,.14,.025,color,0,.86,-.83);tail.rotation.y=Math.PI/2;}
 if(wolf){const tail=cone(g,.16,.65,color,0,.9,-.85);tail.rotation.x=-.7;}
 if(turtle){ball(g,.63,0x4e7054,0,1,0,[1,.6,1.3]);for(let i=0;i<5;i++)ball(g,.15,p.trim,Math.sin(i*2.4)*.38,1.27,Math.cos(i*2.4)*.5);}
 if(/mammoth/i.test(name)){const trunk=cyl(head,.12,.07,.7,color,0,-.38,.28);trunk.rotation.x=-.3;for(const sign of[-1,1])cone(head,.08,.45,0xf4e3bd,sign*.24,-.18,.4).rotation.x=.7;}
 if(/stag|boar|briar|bramble/i.test(name))for(let i=0;i<6;i++)cone(g,.12,.33,0x617b3c,(i%2-.5)*.55,1.28,Math.floor(i/2)*.3-.3);
 if(/charger|cavalier/i.test(name))box(g,.7,.18,.7,p.roof,0,1.25,0);
 if(/truffle/i.test(name))for(let i=0;i<4;i++)ball(g,.12,0x755533,(i%2-.5)*.35,1.24,Math.floor(i/2)*.25-.15);
 if(seal){g.userData.limbs=[];const tail=cone(g,.28,.75,color,0,.6,-.9);tail.rotation.x=Math.PI/2;g.userData.tail=tail;}
 g.userData.kind='quadruped';g.scale.setScalar(large?1.18:.85);return g;}
function bird(card,k){const p=PALETTES_3D[k]||PALETTES_3D.farm,g=group(),name=card.name||'',crow=/crow|raven/i.test(name),phoenix=/phoenix|ember/i.test(name),color=crow?0x283341:phoenix?0xd77631:p.body;joints(g);ball(g,.4,color,0,.65,0,[.8,1.1,1]);ball(g,.26,color,0,1.05,.25);eyes(g,1.1,.45,.11);const beak=cone(g,.11,.3,p.trim,0,1,.56);beak.rotation.x=Math.PI/2;
 for(const sign of[-1,1]){const wing=group(g,sign*.25,.8,0);for(let i=0;i<4;i++){const feather=box(wing,.22,.08,.65-i*.08,color,sign*(.18+i*.17),0,-i*.08);feather.rotation.z=sign*.18;}g.userData.limbs.push(wing);}for(let i=0;i<3;i++){const tail=cone(g,.1,.5,color,(i-1)*.1,.6,-.47);tail.rotation.x=-1.2;}
 g.userData.kind='bird';if(/griffin|gryphon|manta/i.test(name))g.scale.setScalar(1.3);return g;}
function monster(card,k){const p=PALETTES_3D[k]||PALETTES_3D.farm,g=group(),name=card.name||'',seed=hashName(name),tree=/ent|root|seed|orchard|plant|kernel|turnip|sprite/i.test(name),color=tree?0x697f3f:/ice|crystal|mirror/i.test(name)?0x91c7dc:p.body;joints(g);const giant=/colossus|golem|keep|leviathan|collector|ent/i.test(name);ball(g,.52,color,0,.96,0,[1,1.3,.8]);ball(g,.34,tree?0xb2be60:color,0,1.7,0);eyes(g,1.74,.29,.14);
 for(const sign of[-1,1]){limb(g,sign*.27,.6,0,.25,.52,tree?0x78663e:color,true);limb(g,sign*.59,1.4,0,.25,.7,color);if(tree)for(let i=0;i<3;i++)cone(g,.15,.45,0x76954a,sign*(.2+i*.2),1.98-(i%2)*.15,0);}
 if(/keep|colossus|golem/i.test(name)){box(g,.9,.55,.6,color,0,1.17,0);for(let i=0;i<4;i++)box(g,.2,.25,.3,p.trim,(i-1.5)*.25,1.63,0)}
 if(/crab/i.test(name))for(const sign of[-1,1])ball(g,.23,p.roof,sign*.84,1.12,.3);
 for(let i=0;i<3;i++)ball(g,.09,p.trim,(i-1)*.2,1.05,.43);
 g.userData.kind='monster';g.scale.setScalar(giant?1.25:.8+(seed%20)/100);return g;}
function buildingModel(card,k){const p=PALETTES_3D[k]||PALETTES_3D.farm,g=group(),name=card.name||'',seed=hashName(name);g.userData.limbs=[];g.userData.rotors=[];const stone=k==='ice'?0xb5d6e0:k==='medieval'?0xaaa391:0xb7a478,wood=p.wood;
 box(g,2.05,.2,1.7,stone,0,.1,0);for(let i=0;i<5;i++)box(g,.35,.2,.28,stone,-.8+i*.4,.2,.86);
 if(/field|pasture|pen|circle|yard|pool|dock|snare/i.test(name)){box(g,1.9,.12,1.6,/pool|dock/i.test(name)?0x4dadae:0x6e8350,0,.25,0);for(let i=0;i<8;i++){const x=(i%4-1.5)*.55,z=Math.floor(i/4)?-.75:.75;box(g,.09,.65,.09,wood,x,.6,z);}for(const z of[-.75,.75]){box(g,1.9,.06,.05,0xb49b6b,0,.55,z);box(g,1.9,.06,.05,0xb49b6b,0,.8,z)}if(/field|pasture/i.test(name))for(let i=0;i<7;i++){const hay=cyl(g,.22,.22,.4,0xd8b553,(i%3-1)*.45,.5,Math.floor(i/3)*.35-.35,8);hay.rotation.z=Math.PI/2;}if(/yard/i.test(name))for(let i=0;i<6;i++)box(g,.35,.23,.3,stone,(i%3-1)*.4,.35+Math.floor(i/3)*.23,0);}
 else if(/orchard|grove|shrine|effigy|root/i.test(name)){cyl(g,.17,.25,1.4,wood,0,.9,0);for(let i=0;i<7;i++){const a=i*2.4;ball(g,.5,0x648044,Math.sin(a)*.55,1.75+(i%2)*.32,Math.cos(a)*.4);ball(g,.095,0xd4a841,Math.sin(a)*.65,1.75,Math.cos(a)*.52);}if(/shrine/i.test(name))cone(g,.5,.9,p.trim,0,.8,.7);}
 else if(/soup|pot|jar|bell|drum/i.test(name)){cyl(g,.7,.5,1.1,/jar/i.test(name)?0x63b8c4:0x505958,0,.85,0);cyl(g,.61,.61,.05,0xe4ac4e,0,1.43,0);ring(g,.7,.06,p.trim,0,1.35,0).rotation.x=Math.PI/2;for(let i=0;i<3;i++)cone(g,.1,.4,0xe5ad45,(i-1)*.35,.4,.5);}
 else{const tower=/tower|spire|silo|lighthouse|beacon|wall|castle|keep|vault/i.test(name),height=tower?2.1:1.15;
 box(g,1.55,height,1.2,k==='farm'?0xc8b58d:stone,0,.3+height/2,0);
 if(/wall|castle|keep/i.test(name)){for(let i=0;i<5;i++){box(g,.22,.3,.25,stone,(i-2)*.34,height+.45,.5);box(g,.22,.3,.25,stone,(i-2)*.34,height+.45,-.5)}}else{const roof=cone(g,1.22,.85,p.roof,0,height+.75,0,4);roof.rotation.y=Math.PI/4;roof.scale.z=.8;for(let n=0;n<4;n++){const beam=box(g,1.6,.045,.04,0xb7774b,0,height+.46+n*.13,.65-n*.13);beam.rotation.z=0;}}
 box(g,.38,.72,.055,0x5b4838,0,.68,.625);ball(g,.035,p.trim,.12,.72,.67);
 for(const x of[-.47,.47]){box(g,.25,.34,.06,0x5e4937,x,1.05,.64);box(g,.18,.25,.065,0xf6cf74,x,1.05,.675).material=material(0xe5bb66,true);box(g,.025,.28,.07,wood,x,1.05,.71);}
 for(const x of[-.77,.77])box(g,.08,height,.08,wood,x,.3+height/2,.6);box(g,1.6,.08,.08,wood,0,.38,.61);
 if(k==='ice'){box(g,1.6,.08,1.3,0xe3eff0,0,height+.35,0);for(let i=0;i<3;i++)cone(g,.09,.4,0x98d8e6,(i-1)*.4,1.9,.68).rotation.z=Math.PI;}
 if(/windmill/i.test(name)){const rotor=group(g,0,1.8,.78);for(let i=0;i<4;i++){const blade=box(rotor,.16,1.25,.07,0xd6c899,0,.55,0);const pivot=group(rotor);rotor.remove(blade);pivot.add(blade);pivot.rotation.z=i*Math.PI/2;}ball(rotor,.14,wood);g.userData.rotors.push(rotor);}
 if(/crane|siege|ballista/i.test(name)){const arm=box(g,.14,.14,2.1,wood,0,1.65,.7);arm.rotation.x=-.4;}
 if(/beacon|lighthouse|spire|prism/i.test(name)){const crystal=cone(g,.22,.75,0x89d4df,0,height+1.35,0,5);crystal.material=material(0x85e4ef,true);g.userData.rotors.push(crystal);}
 box(g,.23,.8,.23,stone,.5,height+.8,-.2);
 }
 if(k==='beach'){for(let i=0;i<4;i++)ball(g,.13,0xcc8773,(i-1.5)*.4,.3,.95);}
 if(k==='medieval'){cyl(g,.025,.025,1.2,wood,-.9,1,0);box(g,.45,.35,.04,p.roof,-1.12,1.4,0);}
 g.userData.kind='building';g.scale.setScalar(.92+(seed%12)/100);return g;}
function spellModel(card,k){const p=PALETTES_3D[k]||PALETTES_3D.farm,g=group(),seed=hashName(card.name);g.userData.particles=[];g.userData.limbs=[];const ringMesh=ring(g,.5,.04,p.trim,0,.18,0);ringMesh.rotation.x=Math.PI/2;g.userData.rotors=[ringMesh];for(let i=0;i<9;i++){const m=mesh(g,/freeze|ice|shatter/.test(card.effect||'')?'OctahedronGeometry':'IcosahedronGeometry',[.08+i%3*.025,0],p.trim);m.material=material(p.trim,true);m.position.set(Math.sin(i)*.6,.4+i*.12,Math.cos(i)*.6);g.userData.particles.push(m)}g.userData.kind='spell';return g;}
export function createModel(card,k='farm'){let g;if(card.type==='building')g=buildingModel(card,k);else if(card.type==='spell')g=spellModel(card,k);else if(card.type==='commander'||/squire|captain|knight|duelist|oathbreaker|cavalier|warden|seer|wraith|hermit|corsair|imp|thief|buccaneer/i.test(card.name||''))g=humanModel(card,k);else if(/crow|raven|owl|gull|phoenix|griffin|gryphon|manta|penguin|hen|cloud/i.test(card.name||''))g=bird(card,k);else if(/pig|hound|rat|boar|yak|bear|kid|ram|mammoth|fox|cricket|seal|ox|turtle|leech|eel|serpent|charger|hare|mastiff|wolf|stag/i.test(card.name||''))g=quadruped(card,k);else g=monster(card,k);optimizeModel(g);g.name=card.name||card.id;g.userData.card=card;g.userData.seed=hashName(g.name);return g;}
export function animateModel(g,a,reduced=false){const t=reduced?0:a.clock,phase=t*a.program.stride+a.program.phase,moving=a.moving&&!reduced,kind=g.userData.kind;g.rotation.y+=Math.atan2(Math.sin((a.moving?Math.atan2(a.vx,a.vy):g.rotation.y)-g.rotation.y),Math.cos((a.moving?Math.atan2(a.vx,a.vy):g.rotation.y)-g.rotation.y))*.2;if(kind==='building')g.rotation.y=0;
 for(let i=0;i<(g.userData.limbs||[]).length;i++){const limb=g.userData.limbs[i];if(kind==='bird')limb.rotation.z=(i%2?1:-1)*(.2+Math.sin(phase)*.45);else limb.rotation.x=moving?Math.sin(phase+i%2*Math.PI)*.45:Math.sin(t*2+i)*.025;}
 for(const rotor of g.userData.rotors||[]){if(kind==='building'&&/windmill/i.test(g.name))rotor.rotation.z=t*.9;else rotor.rotation.y=t*.8;}
 for(let i=0;i<(g.userData.particles||[]).length;i++){const p=g.userData.particles[i],angle=t*1.6+i*.7;p.position.set(Math.cos(angle)*(.3+i*.04),.3+(t*.4+i*.15)%1.5,Math.sin(angle)*(.3+i*.04));p.rotation.set(t,t+i,0)}
 if(a.activity>.1&&a.action==='attack'&&!reduced&&g.userData.limbs.length>2)g.userData.limbs[g.userData.limbs.length-1].rotation.x-=Math.sin(a.activity/.9*Math.PI)*1.2;if(g.userData.tail)g.userData.tail.rotation.y=Math.sin(phase)*.25;g.userData.bob=reduced?0:kind==='bird'?Math.sin(t*3)*.15:moving?Math.abs(Math.sin(phase))*.045:Math.sin(t*2)*.015;
}
export function disposeModels(){for(const g of geos.values())g.dispose();for(const m of mats.values())m.dispose();geos.clear();mats.clear();}

function optimizeModel(root){if(root.userData.kind==='spell')return;const protectedParts=new Set(root.userData.rotors||[]);root.traverse(node=>{if(!node.isGroup)return;const batches=new Map();for(const child of [...node.children]){if(!child.isMesh||protectedParts.has(child))continue;child.updateMatrix();const key=child.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(child);}for(const parts of batches.values()){if(parts.length<2)continue;const geometries=parts.map(part=>{const g=part.geometry.index?part.geometry.toNonIndexed():part.geometry.clone();g.applyMatrix4(part.matrix);return g;});const merged=T.mergeGeometries(geometries);geometries.forEach(g=>g.dispose());if(!merged)continue;parts.forEach(part=>node.remove(part));const m=new T.Mesh(merged,parts[0].material);m.userData.ownedGeometry=true;m.castShadow=true;m.receiveShadow=true;node.add(m);}});}
export function disposeModel(g){g.traverse(o=>{if(o.userData.ownedGeometry)o.geometry.dispose()});}
