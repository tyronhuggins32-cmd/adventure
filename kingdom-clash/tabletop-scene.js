import * as T from './vendor/three.js';
import {group,box,ball,cyl,cone,batchStaticMeshes,material} from './model-3d.js?v=episode6';
import {TerrainDetails} from './terrain-detail.js?v=episode6';
import {CELL_WIDTH,CELL_SIZE,WORLD_WIDTH,WORLD_DEPTH} from './world-layout.js?v=episode6';
const THEMES={plains:[0x75a9b4,0x587a7a],corn:[0x8fae4e,0x665339],fertile:[0x8db662,0x665339],bare:[0x9d8657,0x665339],mud:[0x75604b,0x4e443c],snow:[0xdae5dc,0x657c85],ice:[0x98c6d0,0x526f85],sand:[0xe3c681,0x9f8754],water:[0x74b8b4,0x647d68],stone:[0x899880,0x616b60],road:[0xa6a48c,0x696b61],gloom:[0x746b89,0x514c61],ash:[0x67665d,0x4b473e]};
const rand=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export function buildTabletop(scene){const g=group(scene);g.userData.landscapeWorld=true;
 box(g,WORLD_WIDTH+7,2.2,WORLD_DEPTH+7,0x47372e,0,-1.3,0);box(g,WORLD_WIDTH+5,.45,WORLD_DEPTH+5,0x8a6945,0,-.1,0);
 for(const sign of[-1,1]){box(g,WORLD_WIDTH+6,.2,.3,0xcaa86a,0,.15,sign*(WORLD_DEPTH+5)/2);box(g,.3,.2,WORLD_DEPTH+6,0xcaa86a,sign*(WORLD_WIDTH+5)/2,.15,0);}
 // Thin projection rails sit below the terrain; landscapes meet across the center.
 for(let i=0;i<=4;i++){const rail=box(g,.09,.06,WORLD_DEPTH,0x77d6be,(i-2)*CELL_WIDTH,.18,0);rail.material=material(0x77d6be,true);}
 batchStaticMeshes(g);return {group:g,bases:[],flags:[]};}
export class TabletopTerrain extends TerrainDetails{
 update(time,tiles,reduced=false){const list=[...tiles];super.update(time,list,reduced);for(const tile of list)for(const [i,flame]of (tile.object.userData.flames||[]).entries()){flame.scale.y=reduced?1:1+Math.sin(time*7+i)*.25;flame.rotation.y=reduced?0:time*.4+i;}}
 buildTile(f,side,lane,selected){const g=group(),theme=THEMES[f.kind]||THEMES.corn,w=CELL_WIDTH-.3,d=CELL_SIZE-.3,seed=side*1000+lane*100;
 g.position.set((lane-1.5)*CELL_WIDTH,0,(side?-.5:.5)*CELL_SIZE);g.userData.kind=f.kind;g.userData.tabletop=true;g.userData.landscapeWorld=true;
 box(g,w,.65,d,theme[1],0,.27,0);box(g,w-.1,.16,d-.1,theme[0],0,.68,0);
 // The central trail and two cross-trails keep buildings and creatures readable.
 const trail=f.kind==='snow'?0xb8ccca:f.kind==='stone'?0xb6b39a:f.kind==='mud'?0x8e7756:0xc0a574;
 box(g,6.2,.025,d,trail,0,.78,0);for(const z of[-18,18])box(g,w,.025,3,trail,0,.78,z);
 for(let i=0;i<12;i++){const stone=ball(g,.38,0xa2a08a,(i%2?1:-1)*2,.85,-31+i*5.6,[1.2,.22,1.5]);stone.rotation.y=i;}
 const corn=['corn','fertile','warm','thorns','roots'].includes(f.kind),wet=['water','coral','moat','mud'].includes(f.kind),winter=['snow','ice','mirror'].includes(f.kind);
 const patches=[];for(let x=-14;x<=14;x+=4)for(let z=-30;z<=30;z+=5){if(Math.abs(x)<4||Math.abs(Math.abs(z)-18)<3)continue;patches.push({x:x+(rand(seed+x*7+z)-.5),z:z+(rand(seed+z*2)-.5),n:seed+x*31+z});}
 if(f.kind==='plains'){const grass=[];for(let i=0;i<120;i++){const x=(rand(seed+i)-.5)*30,z=(rand(seed+i+200)-.5)*64;if(Math.abs(x)<3.4||Math.abs(Math.abs(z)-18)<2)continue;grass.push([x,.9,z,.24,.42+rand(i)*.4,.13]);}this.scatter(g,'blue-grass',new T.ConeGeometry(1,1,5),0x8bb89a,grass,true);}if(corn&&f.food>0){const stalks=[],cobs=[],leaves=[],count=Math.ceil(patches.length*Math.min(1,f.food/3));for(const p of patches.slice(0,count)){const h=3.8+rand(p.n)*2.8;stalks.push([p.x,.8+h/2,p.z,.16,h,.16]);cobs.push([p.x+.2,.8+h*.8,p.z,.34,.66,.3]);for(const sign of[-1,1])leaves.push([p.x+sign*.45,.8+h*.55,p.z,1.1,.15,.4]);}this.scatter(g,'corn-stalks',new T.BoxGeometry(1,1,1),0x60853b,stalks,true);this.scatter(g,'corn-cobs',new T.SphereGeometry(1,8,6),0xeac45c,cobs,true);this.scatter(g,'corn-leaves',new T.SphereGeometry(1,6,4),0x78a349,leaves,true);g.userData.cropCount=count;}
 if(f.kind==='bare'||f.kind==='ash'||!f.food&&corn){for(let i=0;i<30;i++){const x=(rand(seed+i)-.5)*30,z=(rand(seed+i+90)-.5)*66;if(Math.abs(x)<3)continue;const stalk=box(g,.11,.4,.11,0x9a7948,x,.96,z);stalk.rotation.z=(rand(i)-.5)*.8;}g.userData.cropCount=0;}
 // Low hills stay at the edges, leaving a navigable flat floor through the world.
 for(const sign of[-1,1])for(let j=0;j<5;j++){const z=-29+j*14.3,height=1.8+rand(seed+j)*2.5;ball(g,3.2,theme[0],sign*15,.7,z,[.8,height/3.2,1.8]);if(winter){cone(g,1.4,4.5,0x80b9ca,sign*14,2.2,z,5);ball(g,1.6,0xe4ece4,sign*14,1,z,[1,.25,1]);}else if(!wet&&!['bare','ash'].includes(f.kind)&&(lane===0&&sign===-1||lane===3&&sign===1)&&j%2===0){const tree=group(g,sign*15,.8,z+4);cyl(tree,.18,.27,2.7,0x76593b,0,1.35,0);ball(tree,1.5,side?0x6a8f67:0x678c42,0,3.1,0,[.8,1.1,.9]);ball(tree,1.1,0x789b49,.7,2.8,.2);}}
 if(wet){for(const sign of[-1,1]){const p=this.water(g,7,17,sign*10,side?-8:8);p.position.y=.81;if(f.kind==='mud'){p.material=this.livingMaterial(0x756147,true);for(let i=0;i<5;i++)ball(g,.5,0x9a8966,sign*(7+i%2),.88,-14+i*7,[1,.2,1]);}}g.userData.mudTrap=f.kind==='mud';}
 if(['sand','water','coral'].includes(f.kind))for(let j=0;j<6;j++){const tree=group(g,(j%2?1:-1)*13,.8,-27+j*10);const trunk=cyl(tree,.16,.3,4,0x8f734c,0,2,0);trunk.rotation.z=.15;for(let k=0;k<5;k++){const leaf=ball(tree,1.1,0x6a9a53,Math.sin(k*1.26)*.8,4,Math.cos(k*1.26)*.8,[1.8,.16,.5]);leaf.rotation.y=k*1.26;}}
 // Boundaries are light seams, not miniature parking spaces.
 for(const sign of[-1,1]){const edge=box(g,.07,.04,d,selected?0xffe18c:0xa5d3a6,sign*w/2,.85,0);edge.material=material(selected?0xffe18c:0x86c6aa,selected);}
 if(f.integrity<8)for(let i=0;i<8-f.integrity;i++){const crack=box(g,.12,.03,4.2,0x534b3a,(i%2?1:-1)*(4+i),.8,-24+i*7);crack.rotation.y=i*.7;}
 if(f.weather==='rain'||winter){const positions=new Float32Array(48*3);for(let i=0;i<48;i++){positions[i*3]=(rand(seed+i)-.5)*w;positions[i*3+1]=rand(seed+i+400)*5;positions[i*3+2]=(rand(seed+i+800)-.5)*d;}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const points=new T.Points(geo,new T.PointsMaterial({color:winter?0xf1f8e7:0x8bd6e7,size:winter?.25:.15,transparent:true,opacity:.65}));points.userData.ownedGeometry=true;points.userData.ownedMaterial=true;points.userData.animated=true;g.add(points);g.userData.motes={object:points,base:positions.slice(),snow:true};}if(f.fire>0){g.userData.flames=[];for(let i=0;i<12;i++){const flame=cone(g,.6,2.5,0xf9ac3c,(i%3-1)*8,2,-24+Math.floor(i/3)*16,7);flame.material=material(0xf0902b,true);g.userData.flames.push(flame);}}if(f.storm){const cloud=ball(g,4,0x6c526d,0,8,0,[1,.35,1]);cloud.material=material(0x65526d);g.userData.storm=true;}batchStaticMeshes(g,g.userData.flames||[]);return g;
 }
}
