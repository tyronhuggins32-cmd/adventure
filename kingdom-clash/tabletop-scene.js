import * as T from './vendor/three.js';
import {group,box,ball,cyl,cone,batchStaticMeshes} from './model-3d.js?v=polish1';
import {TerrainDetails} from './terrain-detail.js?v=polish1';
import {CELL_WIDTH,CELL_SIZE,WORLD_WIDTH,WORLD_DEPTH} from './world-layout.js?v=square1';
const THEMES={corn:[0x95ad58,0x5d7540,0xdcc263],fertile:[0x9eb96f,0x637d45,0xe4cd77],mud:[0x8b7154,0x604b36,0xc8ad72],snow:[0xd1e2e4,0x7397ab,0xb7edf4],ice:[0x9ecbd8,0x507d9e,0xd1f4f1],sand:[0xe4c888,0xa58a52,0x73c9c2],water:[0x7cc7c5,0x477f89,0xd5e7bb],stone:[0xb4aeb9,0x716c85,0xd6c5a1],road:[0xa7aaab,0x626578,0xe0cb8b]};
function rim(parent,w,d,y,color){for(const sign of[-1,1]){box(parent,w,.13,.13,color,0,y,sign*d/2);box(parent,.13,.13,d,color,sign*w/2,y,0);}}
function slot(parent,x,z,w,d,color){box(parent,w,.16,d,color,x,.81,z);const frame=group(parent,x,0,z);rim(frame,w,d,.91,0xe8dbb5);}
export function buildTabletop(scene){const g=group(scene);box(g,WORLD_WIDTH+5,1.8,WORLD_DEPTH+6,0x422c26,0,-1.2,0);box(g,WORLD_WIDTH+4,.45,WORLD_DEPTH+5,0x865a3c,0,-.12,0);box(g,WORLD_WIDTH+2,.18,WORLD_DEPTH+3,0x4a3d42,0,.18,0);rim(g,WORLD_WIDTH+3,WORLD_DEPTH+4,.42,0xc3975c);
 // The center is a seam between card rows, rather than a river armies must cross.
 box(g,WORLD_WIDTH-1,.08,1.15,0xd4ba7d,0,.4,0);for(let lane=0;lane<4;lane++){const x=(lane-1.5)*CELL_WIDTH;const gem=box(g,.65,.22,.65,0xffe2a0,x,.58,0);gem.rotation.y=Math.PI/4;}
 batchStaticMeshes(g);return {group:g,bases:[],flags:[]};}
export class TabletopTerrain extends TerrainDetails{
 buildTile(f,side,lane,selected){const g=group(),theme=THEMES[f.kind]||THEMES.corn;g.position.set((lane-1.5)*CELL_WIDTH,0,(side?-.5:.5)*CELL_SIZE);g.userData.kind=f.kind;g.userData.tabletop=true;
 const width=CELL_WIDTH-1.2,depth=CELL_SIZE-3.2;box(g,width,.6,depth,theme[1],0,.27,0);box(g,width-.3,.16,depth-.3,0xefe3c3,0,.64,0);box(g,width-.85,.14,depth-.85,theme[0],0,.76,0);rim(g,width-.25,depth-.25,.9,selected?0xffdc80:0xcbb888);
 const front=side?7.92:-7.92,rear=side?-9.36:9.36;
 slot(g,0,front,7.8,8.8,theme[1]);slot(g,0,rear,6.9,6.9,theme[1]);
 // Opposing notches make each lane readable in one glance.
 for(let i=0;i<=lane;i++)box(g,.58,.15,.58,0xffebae,(i-lane/2)*1.05,.96,side?depth/2-1.1:-depth/2+1.1);
 if(f.integrity<8)for(let i=0;i<8-f.integrity;i++){const crack=box(g,.08,.03,2.0,0x5c5046,-6.1+i*1.7,.85,(i%2?1:-1)*2.2);crack.rotation.y=i*.7;}
 const food=Math.min(12,Math.max(0,f.food||0));
 if(['corn','fertile','mud','roots','thorns','warm'].includes(f.kind)){
  const stalks=[],cobs=[],leaves=[];for(const sign of[-1,1])for(let row=0;row<10;row++){const x=sign*6.4,z=-13+row*2.8,h=.8+food*.12;stalks.push([x,.8+h*.5,z,.08,h,.08]);cobs.push([x,.8+h,z,.2,.34,.16]);leaves.push([x+sign*.3,.8+h*.55,z,.6,.12,.22]);}this.scatter(g,'stalks',new T.BoxGeometry(1,1,1),0x577c40,stalks,true);this.scatter(g,'cobs',new T.SphereGeometry(1,8,6),0xf1cc64,cobs,true);this.scatter(g,'leaves',new T.SphereGeometry(1,6,4),0x719447,leaves,true);
 }else if(['snow','ice','mirror','bridge'].includes(f.kind)){
  for(const sign of[-1,1])for(let i=0;i<5;i++){const x=sign*6.2,z=-12+i*5.5;cone(g,.55,1.3+i%2,0x8fcadf,x,1.4,z,5);ball(g,.6,0xeaf4e8,x,.97,z,[1.5,.3,1.2]);}
 }else if(['sand','water','coral','barnacles'].includes(f.kind)){
  for(const sign of[-1,1]){const water=box(g,1.9,.05,depth-3,0x4caaa9,sign*6.5,.86,0);water.material=this.livingMaterial(0x4caaa9,true);for(let i=0;i<5;i++)ball(g,.22,0xf5e6b8,sign*5.5,.98,-11+i*5.2,[1.2,.5,1]);}
 }else{
  for(const sign of[-1,1])for(let i=0;i<6;i++){box(g,.7,.25,1.5,i%2?0xd2c7bd:0x8e8899,sign*6.2,1,-12+i*4.6);}
 }
 // Food pips along the back edge show the living landscape's resource state.
 for(let i=0;i<12;i++)box(g,.65,.1,.38,i<food?0xf5d570:theme[1],(i-5.5)*1.05,.96,side?-depth/2+1.1:depth/2-1.1);
 batchStaticMeshes(g);return g;
 }
}
