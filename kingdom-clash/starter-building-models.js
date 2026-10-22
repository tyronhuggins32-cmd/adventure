// The twelve commander schools use purpose-built silhouettes instead of the
// generic cottage. All pieces are ordinary cached Three.js geometry.
export function starterBuildingModel(card,S){
 const name=card.name||'',names=['Barn','Crow Roost','Seed Shrine','Snow Lodge','Mirror Spire','Frost Pasture','Driftwood Dock','Pearl Pool','Undertow Bell','Rally Standard','Castle Wall','Broken Throne'];
 if(!names.includes(name))return null;
 const {group,box,ball,cyl,cone,mesh}=S,g=group(),stone=0x928879,wood=0x74533b,trim=0xb08d57,cream=0xe0d2b0,ice=0xa9dbe1,water=0x60aab2;
 box(g,3.6,.2,3.4,name.includes('Snow')||name.includes('Frost')||name.includes('Mirror')?0xc7dfe0:name.includes('Pool')||name.includes('Dock')||name.includes('Bell')?0x9b9b79:0x746d52,0,.1,0);
 const post=(x,z,h=1.7,color=wood)=>{box(g,.18,h,.18,color,x,.25+h/2,z);box(g,.25,.12,.25,trim,x,.3+h,z);};
 const lantern=(x,z)=>{box(g,.23,.37,.22,0xf3c77a,x,1.18,z);cone(g,.23,.2,wood,x,1.46,z,5);};
 const fence=(z,color=wood)=>{for(const x of[-1.5,-.5,.5,1.5])post(x,z,.73,color);for(const y of[.55,.84])box(g,3.2,.09,.12,color,0,y,z);};
 const flag=(x,y,z,c)=>{box(g,.065,1.8,.06,wood,x,y,z);box(g,.8,.53,.05,c,x+.44,y+.48,z);};
 switch(name){
 case 'Barn':{
  box(g,2.65,1.7,2.45,0x8e4e37,0,1.1,0);for(const x of[-1.25,1.25])for(const z of[-1.18,1.18])post(x,z,2.25);
  for(const s of[-1,1]){const r=box(g,1.55,.16,2.8,0xa45e40,s*.71,2.24,0);r.rotation.z=-s*.36;}
  box(g,1.25,1.18,.08,0x322b25,0,.85,1.27);box(g,1.45,.12,.13,trim,0,1.43,1.31);box(g,.45,.48,.09,0xf1c377,0,2.03,1.28);
  fence(1.67);lantern(-1.38,1.2);lantern(1.38,1.2);break;}
 case 'Crow Roost':
  for(const x of[-1,0,1]){post(x,0,2.15+(x===0?.55:0));box(g,.75,.12,.54,wood,x,1.72,.12);ball(g,.31,0xd0aa6a,x,1.97,.11,[1,.36,.8]);ball(g,.21,0x2b3438,x,2.33,.13);cone(g,.09,.25,0x33393b,x+.21,2.32,.16,6).rotation.z=-Math.PI/2;}fence(-1.25);break;
 case 'Seed Shrine':
  cyl(g,.84,.98,1.4,stone,0,.87,0,8);cone(g,.6,.88,0xe6bf5e,0,1.99,0,8);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;cone(g,.12,.52,0xd9b452,Math.sin(a)*1.25,.53,Math.cos(a)*1.2,6);}lantern(-1.35,0);lantern(1.35,0);break;
 case 'Snow Lodge':
  cyl(g,1.18,1.38,1.05,0xb9ced2,0,.8,0,12);ball(g,1.2,0xe5edef,0,1.32,0,[1,.65,1]);box(g,.74,.88,.18,0x555d61,0,.62,1.28);box(g,.35,1.2,.35,0x73858d,.65,1.75,-.38);ball(g,.17,0xe9ad5b,.65,2.53,-.38);break;
 case 'Mirror Spire':
  cyl(g,.76,1.05,2.0,0x718d9b,0,1.2,0,8);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const m=cone(g,.26,1.22,ice,Math.sin(a)*.71,2.23,Math.cos(a)*.65,5);m.rotation.z=Math.sin(a)*.28;}cone(g,.49,1.34,0xd6f2f2,0,3.0,0,6);for(const x of[-1.25,1.25])cone(g,.28,1.3,0x80baca,x,.78,.1,5);break;
 case 'Frost Pasture':
  for(const z of[-1.3,1.3])fence(z,0x718894);box(g,1.4,1.25,1.2,0x728691,-.77,.93,-.58);cone(g,1.0,.72,0xc5dbe0,-.77,1.92,-.58,4).rotation.y=Math.PI/4;for(const x of[.45,1.12])cone(g,.15,.7,0xe1e9db,x,.64,.4,7);break;
 case 'Driftwood Dock':
  for(let n=0;n<6;n++)box(g,2.9,.14,.33,n%2?0x9b744f:0xb58e62,0,.45,-1.15+n*.43);for(const x of[-1.26,1.26])for(const z of[-1.17,.0,1.1])post(x,z,.9);flag(-1.08,1.8,-.8,0xb86044);box(g,1.4,.5,.54,0x725543,.8,.65,-.2);break;
 case 'Pearl Pool':{
  cyl(g,1.25,1.43,.52,0xd0a88a,0,.5,0,16);const pond=cyl(g,1.13,1.13,.06,water,0,.8,0,16);pond.material=S.material(water,true);ball(g,.39,0xf5ebd1,0,.96,0);for(let i=0;i<7;i++){const a=i*2.4;cone(g,.12,.66,i%2?0xd08371:0xe2a283,Math.sin(a)*1.18,.66,Math.cos(a)*1.2,6);}break;}
 case 'Undertow Bell':
  for(const x of[-.8,.8])post(x,0,2.7,0x758b83);box(g,2.1,.22,1.5,0x5d807c,0,2.84,0);cone(g,.58,.7,0x67a9ac,0,2.1,0,12);cyl(g,.46,.55,.55,0xba9562,0,1.77,0,12);ball(g,.11,0xe3c785,0,1.27,0);for(const x of[-1.3,1.3])cone(g,.2,.65,0x90bdb9,x,.48,.7,7);break;
 case 'Rally Standard':
  cyl(g,.53,.72,.65,stone,0,.46,0,8);post(0,0,2.75);flag(0,2.32,0,0x9e453f);for(const x of[-1.24,1.24]){box(g,.4,.16,.65,0x83888b,x,.48,.15);cone(g,.16,.39,0xd5ad62,x,.87,.15,5);}break;
 case 'Castle Wall':
  box(g,3.25,2.05,.9,0x939089,0,1.25,-.25);for(let i=0;i<6;i++)box(g,.4,.48,1.04,i%2?0xb4aca0:0x888681,-1.35+i*.54,2.51,-.25);for(const x of[-1.26,1.26]){box(g,.47,2.6,1.22,0x777783,x,1.55,-.25);cone(g,.33,.56,0xa26364,x,3.13,-.25,5);}box(g,.55,1,.12,0x37332f,0,.9,.26);break;
 case 'Broken Throne':
  for(let n=0;n<3;n++)box(g,2.9-n*.38,.22,2.25-n*.32,n%2?0x766978:0x9a8691,0,.25+n*.22,0);
  box(g,.92,.22,.68,0x564454,0,1.0,-.4);box(g,1.04,1.32,.18,0x735367,0,1.75,-.73);
  for(const x of[-.43,.43]){box(g,.18,.83,.49,0x9a7a83,x,1.35,-.36);cone(g,.13,.41,0xbaa36a,x,2.35,-.65,5).rotation.z=x*.44;}
  flag(-1.36,1.86,-.66,0x6e3a52);break;
 }
 g.userData.kind='building';g.userData.limbs=[];g.userData.rotors=[];g.userData.starterBuilding=name;
 return g;
}
