// Small, readable arrival sets. The leader and its starting building are separate
// game pieces; these props make the leader's role legible at tabletop camera scale.
export function dressCommanderSpawn(g,card,S){
 const {group,box,ball,cyl,cone,mesh}=S,id=card.id;
 if(!id)return g;
 const palettes={farm:[0x866e44,0xc8aa68],ice:[0x778f9e,0xd8e5e7],beach:[0x90795b,0xc6aa74],medieval:[0x727079,0xbaa27d]};
 const realm=['farmer','scarecrow','cornDruid'].includes(id)?'farm':['hearthkeeper','frostWitch','glacierShepherd'].includes(id)?'ice':['castawayCaptain','reefOracle','tideCollector'].includes(id)?'beach':'medieval';
 const [ground,edge]=palettes[realm],set=group(g);
 const plank=(x,z,w,d,color=edge)=>box(set,w,.09,d,color,x,.09,z);
 const pole=(x,z,h,color=edge)=>cyl(set,.045,.065,h,color,x,h/2,z,7);
 const flame=(x,y,z,color)=>{const b=cone(set,.14,.42,color,x,y,z,7);b.userData.animated=true;g.userData.spawnFlames??=[];g.userData.spawnFlames.push(b);};
 cyl(set,1.02,1.09,.14,ground,0,-.06,0,16);
 for(let n=0;n<10;n++){const a=n*Math.PI/5;box(set,.33,.045,.1,edge,Math.sin(a)*.9,.05,Math.cos(a)*.9).rotation.y=a;}
 switch(id){
 case 'farmer':
  for(const x of[-.78,.78]){box(set,.26,.16,.62,0x765339,x,.09,.23);for(let z=-.16;z<.38;z+=.2){pole(x,z,.34,0x65904e);cone(set,.07,.22,0xecc35b,x,.55,z,6);}}
  ball(set,.18,0xe58b2c,.55,.24,-.55);break;
 case 'scarecrow':
  for(const x of[-.74,.74]){pole(x,-.45,.9,0x80613b);plank(x,-.45,.46,.11,0xb39159);}
  ball(set,.14,0x25313a,-.72,1.03,-.45);cone(set,.08,.22,0x25313a,-.6,1.05,-.38,5).rotation.z=-Math.PI/2;break;
 case 'cornDruid':
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const root=box(set,.08,.08,.48,0x6c5638,Math.sin(a)*.69,.13,Math.cos(a)*.69);root.rotation.y=a;cone(set,.09,.3,0xd9bd58,Math.sin(a)*.86,.38,Math.cos(a)*.86,6);}break;
 case 'hearthkeeper':
  box(set,.63,.42,.52,0x718088,.72,.23,-.31);box(set,.52,.08,.48,0xaab5ae,.72,.48,-.31);flame(.72,.73,-.31,0xffa955);break;
 case 'frostWitch':
  for(const [x,z,h] of[[-.73,-.22,.68],[.72,-.38,.95],[.64,.55,.48]]){const crystal=cone(set,.14,h,0x88d1ea,x,h/2,z,5);crystal.rotation.z=x*.13;}break;
 case 'glacierShepherd':
  for(const x of[-.72,.72]){const horn=cone(set,.18,.76,0xe2e4d4,x,.46,-.33,7);horn.rotation.z=x*.38;}plank(0,-.66,1.45,.13,0x8397a4);break;
 case 'castawayCaptain':
  for(const x of[-.7,0,.7])plank(x,0,.6,1.7,0x785642);pole(.7,-.4,1.15,0x4e4939);box(set,.43,.58,.04,0xb4503c,.72,1.05,-.4);break;
 case 'reefOracle':
  cyl(set,.38,.48,.28,0xdaa886,-.66,.17,-.28,12);ball(set,.22,0xe8e3c7,-.66,.38,-.28);for(const x of[-.83,-.49])cone(set,.1,.5,0xcb7e73,x,.42,.35,6);break;
 case 'tideCollector':
  box(set,.55,.5,.52,0x657f79,.7,.32,-.38);for(const x of[.48,.7,.92])pole(x,-.08,.61,0xb29a6e);ball(set,.13,0x6abac2,.7,.59,-.38);break;
 case 'bannerKnight':
  pole(.72,-.45,1.7,0x6e513e);box(set,.43,.57,.06,0xa84945,.72,1.37,-.45);cone(set,.1,.21,0xe4c16c,.72,1.82,-.45,5);break;
 case 'royalCastellan':
  box(set,.85,.55,.24,0x898987,.66,.41,-.43);for(const x of[.36,.66,.96])box(set,.19,.2,.24,0xc2bbb0,x,.77,-.43);break;
 case 'exiledPrince':{
  // The avatar sits on its own broken throne. Feet and arms stay in the
  // character's animation hierarchy; the furniture remains fixed in world space.
  const avatar=group(g,0,.24,-.28);for(const child of [...g.children])if(child!==set&&child!==avatar)avatar.add(child);avatar.scale.setScalar(.87);
  g.userData.seated=true;g.userData.spawnAvatar=avatar;
  box(set,1.05,.22,.77,0x533f4c,0,.77,-.42);box(set,1.15,1.35,.2,0x654756,0,1.51,-.76);
  for(const x of[-.52,.52]){box(set,.22,.72,.62,0x816473,x,.83,-.35);box(set,.24,.24,.26,0xb39b6c,x,1.15,-.35);}
  for(const x of[-.38,0,.38]){const crenel=box(set,.3,.36,.24,0x7d6275,x,2.28,-.75);crenel.rotation.z=x*.13;}
  box(set,.36,.07,.23,0xc2a46d,0,1.33,-.37);box(set,1.28,.12,.16,0x8c7580,0,.19,.48);break;
 }
 }
 g.userData.commanderSpawn=id;
 return g;
}
export function animateCommanderSpawn(g,t,reduced){
 for(const [i,flame] of(g.userData.spawnFlames||[]).entries())flame.scale.y=reduced?1:1+Math.sin(t*7+i)*.18;
 if(g.userData.seated){for(const limb of(g.userData.limbs||[]).slice(0,2))limb.rotation.x=-1.17;}
}
