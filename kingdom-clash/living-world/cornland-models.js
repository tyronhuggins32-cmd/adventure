// Sculpted from reusable Three.js primitives: all silhouettes, mechanisms and produce
// live in the 3D scene and share the same material and geometry cache as characters.
import {group,box,ball,cyl,cone,mesh,batchStaticMeshes} from '../model-3d.js?v=commander13';
const C={wood:0x775039,beam:0x9b6945,oak:0xba8756,straw:0xdfbb62,corn:0xf2cc5e,leaf:0x54864a,leaf2:0x6f9d53,red:0xa54634,roof:0x6f3429,stone:0x8f8a75,metal:0x596067,water:0x58afbb,linen:0xe9d7a7,glow:0xffce7b};
const base=g=>{box(g,3.6,.2,3.3,0x657346,0,.05,0);for(let i=0;i<9;i++)box(g,.36,.09,.32,i%3?0xa7906a:0x8b795d,(i%3-1)*.9,.19,(Math.floor(i/3)-1)*.85);};
const post=(g,x,z,h=1.4)=>{box(g,.17,h,.17,C.wood,x,.2+h/2,z);box(g,.24,.18,.24,C.oak,x,.25+h,z);};
const fence=(g,x,z,along=1.7)=>{post(g,x-along/2,z,.85);post(g,x+along/2,z,.85);for(const y of[.55,.91])box(g,along,.09,.1,C.beam,x,y,z);};
const lantern=(g,x,y,z)=>{box(g,.32,.42,.32,C.wood,x,y,z);box(g,.22,.3,.22,C.glow,x,y,z+.03);cone(g,.3,.23,C.metal,x,y+.33,z,4);};
const stalk=(g,x,z,h=1.2)=>{cyl(g,.045,.06,h,C.leaf,x,.35+h/2,z,5);for(const sign of[-1,1]){const leaf=box(g,.38,.045,.13,C.leaf2,x+sign*.18,.52+h*.37,z);leaf.rotation.z=sign*.4;}cone(g,.13,.38,C.corn,x,.42+h,z,6);};
const crate=(g,x,y,z)=>{box(g,.62,.48,.53,C.wood,x,y,z);for(const sign of[-1,1])box(g,.07,.5,.56,C.oak,x+sign*.25,y,z);};
const sack=(g,x,y,z)=>{const b=ball(g,.29,C.linen,x,y,z,[1,.7,.78]);box(g,.34,.05,.05,C.wood,x,y+.22,z);return b;};
const roof=(g,y,color=C.red)=>{const l=box(g,1.75,.12,2.8,color,-.77,y,0),r=box(g,1.75,.12,2.8,color,.77,y,0);l.rotation.z=.35;r.rotation.z=-.35;for(const z of[-1.25,1.25])box(g,3.3,.1,.12,C.wood,0,y-.52,z);};
function farm(){const g=group();base(g);for(const x of[-1.5,1.5])for(const z of[-1.15,1.15])post(g,x,z,.72);
 for(const z of[-1.1,1.1])for(const y of[.55,.81])box(g,3.1,.1,.1,C.beam,0,y,z);
 for(const x of[-1.47,1.47])for(const y of[.55,.81])box(g,.1,.1,2.25,C.beam,x,y,0);
 for(let row=0;row<3;row++)for(let n=0;n<6;n++)stalk(g,-1.2+n*.47,-.72+row*.55,1+(n+row)%3*.13);
 box(g,.65,.25,2.25,C.wood,1.25,.44,.1);box(g,.42,.06,2.08,C.water,1.25,.6,.1);post(g,1.48,-.8,1.7);
 const wheel=group(g,1.48,1.42,-.8);cyl(wheel,.37,.37,.15,C.wood,0,0,0,12).rotation.z=Math.PI/2;for(let i=0;i<6;i++){const a=i*Math.PI/3;const spoke=box(wheel,.055,.7,.06,C.oak,0,0,0);spoke.rotation.z=a;}g.userData.mechanism={waterWheel:wheel};
 for(let n=0;n<4;n++)ball(g,.18,n%2?0xe48b31:0xb47b32,-1.2+n*.32,.45,1.4);
 return g;}
function barn(){const g=group();base(g);box(g,2.8,1.75,2.35,C.wood,0,1.2,0);
 for(const x of[-1.3,1.3])for(const z of[-1.05,1.05])post(g,x,z,2.05);
 for(let i=0;i<7;i++)box(g,.3,1.6,.05,i%2?C.red:0xb3553d,-1.07+i*.36,1.25,1.21);
 roof(g,2.55,C.roof);box(g,1.25,1.17,.09,0x302a24,0,.83,1.27);box(g,1.4,.11,.12,C.oak,0,1.49,1.29);
 box(g,.46,.5,.06,C.glow,0,2.03,1.27);lantern(g,-1.48,1.3,1.25);lantern(g,1.48,1.3,1.25);
 fence(g,-1.02,1.72,1.17);fence(g,1.02,1.72,1.17);
 for(const [x,color] of[[-.86,0xdedacf],[.75,0xd69289]]){ball(g,.37,color,x,.5,1.43,[1,.8,.68]);ball(g,.23,color,x,.62,1.75);for(const sign of[-1,1])cone(g,.11,.28,color,x+sign*.16,.87,1.7).rotation.z=sign*.3;}
 const vane=group(g,0,3.08,0);cyl(vane,.03,.03,.55,C.metal,0,.1,0);cone(vane,.3,.18,C.corn,.15,.34,0,4).rotation.z=-Math.PI/2;g.userData.mechanism={vane};return g;}
function mill(){const g=group();base(g);box(g,2.25,2.1,1.9,C.stone,0,1.3,0);
 for(const z of[-.88,.88])for(let i=0;i<4;i++)box(g,2.26,.09,.12,C.wood,0,.45+i*.54,z);
 roof(g,2.71,C.roof);box(g,.64,1.15,.1,0x3a3028,0,.86,1.01);box(g,.6,.28,.13,C.oak,0,1.39,1.02);
 const sails=group(g,0,2.13,1.2);for(let i=0;i<4;i++){const wing=group(sails);wing.rotation.z=i*Math.PI/2;box(wing,.14,1.25,.1,C.wood,0,.73,0);box(wing,.73,.83,.045,C.linen,.39,.83,.03);for(let n=0;n<3;n++)box(wing,.72,.03,.07,C.wood,.39,.52+n*.26,.07);}
 cyl(sails,.2,.2,.26,C.metal,0,0,.2,12).rotation.x=Math.PI/2;
 sack(g,-1.2,.46,1.35);sack(g,1.24,.5,1.3);crate(g,1.4,.48,.64);g.userData.mechanism={sails};return g;}
function slinger(){const g=group();base(g);for(const x of[-1.35,1.35])box(g,.2,1.3,.2,C.wood,x,.8,-.15);
 for(const sign of[-1,1]){const leg=box(g,.17,2.25,.2,C.beam,sign*.88,1.25,.05);leg.rotation.z=sign*.42;box(g,.23,.25,2.65,C.wood,sign*1.1,.34,.0);}
 box(g,2.7,.2,.18,C.metal,0,1.55,.15);const barrel=group(g,0,1.62,.34);cyl(barrel,.6,.76,1.5,C.wood,0,.1,.2,12).rotation.x=Math.PI/2;
 for(const z of[-.47,.48]){const ring=mesh(barrel,'TorusGeometry',[.65,.07,7,14],C.metal,0,.1,z+.2);ring.rotation.x=Math.PI/2;}
 for(let i=0;i<12;i++)ball(barrel,.14,C.corn,(i%4-1.5)*.25,.55-Math.floor(i/4)*.15,1.05);
 for(const x of[-1.38,1.38])lantern(g,x,.75,1.25);sack(g,-1.45,.45,-1.25);crate(g,1.34,.45,-1.17);g.userData.mechanism={barrel};return g;}
function pen(){const g=group();base(g);for(const z of[-1.3,1.3])fence(g,0,z,2.6);
 for(const x of[-1.5,1.5]){post(g,x,-1.2,1.7);post(g,x,1.2,1.1);for(const y of[.62,1.05])box(g,.1,.1,2.5,C.beam,x,y,0);}
 box(g,2.55,1.35,1.35,C.red,0,1.1,-.72);roof(g,2.16,C.roof);box(g,.9,.8,.08,0x423027,0,.72,.02);
 box(g,2.4,.38,.5,C.wood,0,.45,1.02);box(g,2.2,.12,.37,C.straw,0,.69,1.02);
 for(const [x,z,shade] of[[-.85,.62,0xd69e8c],[.76,.57,0xc2b99d],[.0,.32,0x805b3d]]){ball(g,.35,shade,x,.86,z,[1.35,.85,.7]);ball(g,.2,shade,x,1.03,z+.31);for(const sign of[-1,1])cone(g,.08,.28,C.straw,x+sign*.14,1.28,z+.3).rotation.z=sign*.42;}
 lantern(g,1.5,1.3,-1.25);return g;}
function cart(){const g=group();base(g);box(g,2.65,.28,2.25,C.wood,0,1.1,0);for(const x of[-1.3,1.3])box(g,.14,.75,2.4,C.beam,x,1.4,0);
 for(const z of[-1.08,1.08])box(g,2.75,.67,.14,C.oak,0,1.42,z);
 const wheels=[];for(const x of[-1.58,1.58])for(const z of[-.75,.75]){const wheel=group(g,x,.7,z);cyl(wheel,.52,.52,.17,C.metal,0,0,0,14).rotation.z=Math.PI/2;cyl(wheel,.35,.35,.18,C.wood,0,0,0,12).rotation.z=Math.PI/2;for(let n=0;n<6;n++){const a=n*Math.PI/3;const spoke=box(wheel,.08,.68,.08,C.oak,0,0,0);spoke.rotation.x=a;}wheels.push(wheel);}
 for(let n=0;n<8;n++)ball(g,.33,n%2?0xe89132:0xd8b44d,(n%4-1.5)*.57,1.67,Math.floor(n/4)*.7-.38);
 for(const x of[-.52,0,.52]){const prong=box(g,.18,.12,1.17,C.metal,x,.45,1.7);prong.rotation.x=-.23;}
 post(g,1.03,-1,1.95);box(g,.8,.58,.06,C.red,1.38,2.04,-1);sack(g,-1.15,1.72,-.65);g.userData.mechanism={wheels};return g;}
function roost(){const g=group();base(g);for(const x of[-1,0,1]){post(g,x,0,2.3+(x===0?.5:0));for(const y of[1.35,2])box(g,.85,.12,.6,C.wood,x,y,.1);ball(g,.27,C.straw,x,2.14,.14,[1,.35,1]);ball(g,.17,0x27363a,x,2.44,.16);}
 for(const x of[-1.4,1.4])lantern(g,x,.95,1.2);return g;}
function snare(){const g=group();base(g);for(let i=0;i<13;i++){const a=i*2.4,x=Math.sin(a)*1.35,z=Math.cos(a)*1.15;const vine=cyl(g,.09,.11,.65+(i%3)*.3,0x3b663c,x,.55,z,6);vine.rotation.z=Math.sin(a)*.4;cone(g,.18,.4,0x557e42,x,.95+(i%3)*.3,z,5);}
 for(let i=0;i<7;i++){const a=i*1.7;cone(g,.07,.3,C.metal,Math.sin(a)*.75,.4,Math.cos(a)*.8,4);}return g;}
function silo(){const g=group();base(g);cyl(g,.95,1.05,2.7,C.stone,0,1.55,0,12);cone(g,1.1,.7,C.roof,0,3.28,0,12);for(let i=0;i<5;i++)cyl(g,1.02,1.02,.07,C.wood,0,.37+i*.51,0,12);
 box(g,.65,.9,.1,0x302a25,0,.9,1.01);ball(g,.18,C.glow,0,2.4,1.03);fence(g,0,1.55,1.7);return g;}
function shrine(){const g=group();base(g);for(let i=0;i<10;i++){const a=i*Math.PI/5;stalk(g,Math.sin(a)*1.17,Math.cos(a)*1.07,1.2+(i%3)*.2);}
 cyl(g,.56,.72,1.35,C.stone,0,.9,0,7);cone(g,.42,.9,C.corn,0,2.01,0,7);for(const x of[-1.37,1.37])lantern(g,x,1.05,0);return g;}
function circle(){const g=group();base(g);const torus=mesh(g,'TorusGeometry',[1.23,.12,7,24],C.wood,0,.4,0);torus.rotation.x=Math.PI/2;
 for(let i=0;i<10;i++){const a=i*Math.PI/5;const root=box(g,.11,.18,.7,C.wood,Math.sin(a)*1.1,.36,Math.cos(a)*1.1);root.rotation.y=a;stalk(g,Math.sin(a)*1.5,Math.cos(a)*1.5,.85);}
 ball(g,.42,0x93bd58,0,.72,0);return g;}
function grove(){const g=group();base(g);const trunk=cyl(g,.35,.6,2.7,C.wood,0,1.53,0,9);for(let i=0;i<7;i++){const a=i*2.4;ball(g,.74,i%2?C.leaf:C.leaf2,Math.sin(a)*.72,2.8+(i%3)*.27,Math.cos(a)*.66,[1,1.05,.9]);ball(g,.12,C.corn,Math.sin(a)*.82,2.5,Math.cos(a)*.84);}
 for(let i=0;i<9;i++){const a=i*2.4;const root=box(g,.15,.23,.95,C.wood,Math.sin(a)*.82,.34,Math.cos(a)*.82);root.rotation.y=a;}
 return g;}
const builders={farm,barn,mill,seedSlinger:slinger,livestockPen:pen,harvestCart:cart,cart,crowRoost:roost,briarSnare:snare,hauntedSilo:silo,seedShrine:shrine,rootCircle:circle,elderGrove:grove};
export const CORNLAND_BUILDINGS=Object.keys(builders);
export function createCornlandBuilding(card){const make=builders[card.id];if(!make)return null;const g=make();g.userData.kind=card.id==='cart'?'vehicle':'building';g.userData.limbs=[];g.userData.rotors=[];g.name=card.name;g.userData.card=card;batchStaticMeshes(g,Object.values(g.userData.mechanism||{}).flat());return g;}
export function animateCornlandBuilding(g,t,reduced=false){const m=g.userData.mechanism;if(!m)return;const time=reduced?0:t;if(m.waterWheel)m.waterWheel.rotation.x=time*.7;if(m.sails)m.sails.rotation.z=time*.9;if(m.vane)m.vane.rotation.y=time*.55;if(m.barrel)m.barrel.rotation.x=-.12+Math.sin(time*.9)*.16;for(const [i,wheel] of(m.wheels||[]).entries())wheel.rotation.x=time*(i%2?-1:1)*.5;}
