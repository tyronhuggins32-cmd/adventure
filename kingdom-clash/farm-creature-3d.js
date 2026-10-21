// Farmer faction animal silhouettes: readable, expressive mobile-game 3D miniatures.
// All geometry and materials use model-3d's shared caches, with no image downloads.
// Body and facial geometry stay volumetric at every camera angle.
export function farmCreatureModel(card, S) {
  const {group, ball, cyl, cone, box, mesh} = S;
  const species = String(card.model?.species || card.name || card.id || '');
  const pig = /\bpig\b|\bpiglet\b|\bboar\b/i.test(species);
  const bovine = /\bcow\b|\bcalf\b|\bbull\b|\box\b|\byak\b/i.test(species);
  const sheep = /\bsheep\b|\blamb\b|\bram\b/i.test(species);
  const goat = /\bgoat\b|\bkid\b/i.test(species);
  const chicken = /\bhen\b|\brooster\b|\bchicken\b/i.test(species);
  const duck = /\bduck\b/i.test(species);
  const bee = /\bbee swarm\b/i.test(species);
  if (!(pig || bovine || sheep || goat || chicken || duck || bee)) return null;
  const seed = (card.model?.seed ?? [...species].reduce((h,c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261)) >>> 0;
  const variant = seed % 4;
  const g = group();
  const animal = pig ? 'pig' : bovine ? /\bbull\b/i.test(species) ? 'bull' : 'cow' : sheep ? 'sheep' : goat ? 'goat' : chicken ? 'chicken' : duck ? 'duck' : 'bee';
  g.userData.kind = chicken || duck ? 'bird' : bee ? 'invertebrate' : 'quadruped';
  g.userData.farmAnimal = animal;
  g.userData.limbs = []; g.userData.wings = []; g.userData.accents = [];
  g.userData.modelStyle = 'harvest-toy-3d-v2';
  // The game faces +Z. The head is built around a real joint, not an unanimated painted face.
  const P = {
    cream: 0xffe8b6, ivory: 0xf9edcf, white: 0xf9f0df, highlight: 0xffffff,
    eye: 0x281f24, iris: 0x734a2f, pink: 0xef8e8d, blush: 0xffada7,
    pinkDark: 0xbd6972, rose: 0xf7b5a0, hoof: 0x594238, shadow: 0x633c36,
    leaf: 0x62883b, gold: 0xf0bf4e, ochre: 0xd7a248, brass: 0xd2a44f,
    leather: 0x815130, rope: 0xe8c684, charcoal: 0x302c31
  };
  const oval = (parent,r,c,x,y,z,s=[1,1,1]) => ball(parent,r,c,x,y,z,s);
  const eyelids = (head, wide=.15, y=.10, z=.32, r=.067) => {
    for (const side of [-1,1]) {
      oval(head,r*1.35,P.cream,side*wide,y,z,[1.05,1.12,.70]);
      oval(head,r,P.white,side*wide,y,z+r*.46,[.96,1.1,.63]);
      oval(head,r*.47,P.iris,side*wide-.011,y,z+r*.91,[.85,.96,.60]);
      oval(head,r*.28,P.eye,side*wide-.013,y,z+r*1.06,[1,1,.7]);
      oval(head,r*.14,P.highlight,side*wide-.027,y+r*.21,z+r*1.23,[.65,.65,.5]);
    }
  };
  const smile = (head,x=0,y=-.10,z=.35) => {
    oval(head,.060,P.shadow,x,y,z,[1.6,.33,.30]);
    for(const side of [-1,1]) oval(head,.027,P.blush,side*.087,y+.013,z+.003,[.9,.6,.5]);
  };
  const hoofLeg = (side,z,hipY,color=P.rose,hoof=P.hoof,large=false) => {
    const leg = group(g,side*(large?.37:.30),hipY,z);
    oval(leg,large?.155:.137,color,0,-.13,0,[.86,1.8,.88]);
    oval(leg,large?.127:.108,color,0,-.31,.023,[1,.8,1.05]);
    oval(leg,large?.155:.134,hoof,0,-.48,.068,[1,.73,1.25]);
    box(leg,.012,.038,.065,P.shadow,0,-.51,.21);
    g.userData.limbs.push(leg);
    return leg;
  };
  const ear = (head,side,x,y,z,color,inner,tilt=.38,small=false) => {
    const pivot = group(head,side*x,y,z);
    const e = oval(pivot,small?.105:.154,color,side*.07,.056,0,[.78,1.25,.48]);
    e.rotation.z = -side*tilt;
    const i = oval(pivot,small?.068:.103,inner,side*.078,.062,.046,[.8,1.15,.28]);
    i.rotation.z = -side*tilt;
    g.userData.accents.push(pivot);
  };
  const spot = (color,x,y,z,size,scale=[1,.26,1]) => oval(g,size,color,x,y,z,scale);
  const slingBell = (y,neckRadius=.29) => {
    const collar = mesh(g,'TorusGeometry',[neckRadius,.035,5,20],P.leather,0,y,.46);
    collar.rotation.x = Math.PI/2;
    oval(g,.083,P.brass,0,y-.115,.72,[.91,1.2,.53]);
    oval(g,.018,P.shadow,0,y-.166,.763,[.72,.72,.5]);
  };
  const clover = (parent,x,y,z,s=.07) => {
    for(let i=0;i<3;i++) oval(parent,s,P.leaf,x+Math.sin(i*2.094)*s*.85,y+Math.cos(i*2.094)*s*.85,z,[1,.65,.45]);
    cone(parent,s*.35,s*1.4,0x3d6d2f,x,y-s*.95,z,6).rotation.z=.28;
  };
  // Pigs: squashy trotters, long floppy ears, comically broad snout, curly tail.
  if (pig) {
    const boar = /\bboar\b/i.test(species);
    const coat = boar ? 0x9b644e : [0xf0a4a1,0xe49b9b,0xf3ae9e,0xda8a85][variant];
    oval(g,.49,coat,0,.74,0,[1.13,.93,1.48]);
    oval(g,.31,0xf4c4ac,0,.61,.36,[1.1,.83,.74]);
    for(const side of [-1,1]) for(const z of [-.45,.40]) hoofLeg(side,z,.62,coat,0x6b4e4a);
    const head=group(g,0,.88,.61); g.userData.head=head;
    oval(head,.31,coat,0,.025,.05,[1.12,.98,.93]);
    oval(head,.25,0xf3b3a5,0,-.13,.23,[1.10,.68,1.12]);
    oval(head,.215,0xf4b5ae,0,-.114,.44,[1.16,.70,.40]);
    for (const side of [-1,1]) {
      oval(head,.037,P.pinkDark,side*.09,-.105,.526,[.74,1.08,.44]);
      ear(head,side,.245,.26,-.045,coat,P.pinkDark,.72);
      oval(head,.094,P.blush,side*.257,-.065,.25,[.90,.58,.55]);
    }
    eyelids(head,.160,.152,.29,.075);
    smile(head,0,-.220,.405);
    if (boar) for (const side of [-1,1]) {
      const tusk=cone(head,.071,.25,P.ivory,side*.205,-.184,.342,10);
      tusk.rotation.z=side*.30;
    }
    const tail=group(g,0,.81,-.73);g.userData.tail=tail;
    const spiral=mesh(tail,'TorusGeometry',[.105,.031,7,16,Math.PI*1.65],coat,.02,.07,-.17);
    spiral.rotation.y=Math.PI/2;
    for(let i=0;i<3;i++) oval(g,.023,0xcf767a,(i-1)*.20,.95,.30,[1,.5,1]);
  }
  // Sheep: an asymmetric cloud of individually sculpted wool, delicate dark face and legs.
  else if (sheep) {
    const ram=/\bram\b/i.test(species),wool=variant===1?0xe2d0ab:variant===2?0xffead3:P.ivory;
    oval(g,.51,wool,0,.92,-.03,[1.04,1.01,1.37]);
    for(let j=0;j<20;j++){
      const a=j*2.39996, ring=j%3;
      const x=Math.sin(a)*(.36+.055*(ring%2)), z=Math.cos(a)*(.47+.05*(ring%2));
      const y=.90+((j*7)%5-2)*.16;
      mesh(g,'SphereGeometry',[.175,10,8],j%4===0?0xfff7e4:wool,x,y,z,[1.15,.94,1.12]);
    }
    for(const side of [-1,1])for(const z of [-.45,.38])hoofLeg(side,z,.64,0x7d695d,0x55433c);
    const head=group(g,0,1.05,.64);g.userData.head=head;
    oval(head,.25,0xa78a70,0,.028,.04,[.83,1.04,1.1]);
    oval(head,.19,0xbe9c7f,0,-.15,.25,[1,.72,1.04]);
    for(const side of [-1,1]) {
      ear(head,side,.25,.13,-.045,0x8c735e,0xdaa59b,.93,true);
      oval(head,.098,0x8c725c,side*.195,.125,.15,[.6,.55,.58]);
    }
    eyelids(head,.119,.125,.246,.063);
    smile(head,0,-.213,.38);
    for(let j=0;j<5;j++){
      const x=(j-2)*.115;
      mesh(head,'SphereGeometry',[.105,10,8],j%2?0xfff1dd:wool,x,.261,.052,[1.12,1.0,1.12]);
    }
    const tail=group(g,0,.91,-.66);g.userData.tail=tail;
    for(let j=0;j<3;j++)oval(tail,.107,wool,(j-1)*.09,.02,-.05,[1.1,.85,1.2]);
    if(ram)for(const side of [-1,1]){
      const horn=mesh(head,'TorusGeometry',[.20,.059,8,20,Math.PI*1.7],0xb18d56,side*.22,.23,-.09);
      horn.rotation.y=side*Math.PI/2;
    }
    clover(g,.28,1.31,.32,.07);
  }
  // Cows & bulls share cattle anatomy but NOT the same silhouette, patches or face.
  else if (bovine) {
    const bull=animal==='bull', pale=/\bcow\b|\bcalf\b/i.test(species);
    const base=bull?0x9b5835:pale?0xf6e9cf:0x8e7558;
    const deep=bull?0x653a30:0x50403a;
    oval(g,.55,base,0,bull?1.00:.85,0,[bull?1.28:1.10,bull?1.08:.86,1.45]);
    if(bull) oval(g,.40,0xb96c3d,0,1.18,.34,[1.18,1.10,1.0]); // hulking shoulder ridge
    else {
      const patches=[[-.38,.98,-.25,.23],[.37,.80,.23,.21],[-.18,1.12,.15,.17]];
      for(const [x,y,z,r] of patches)spot(deep,x,y,z,r,[1.30,.49,1.5]);
      oval(g,.17,P.pink,0,.42,.10,[1.20,.55,1.18]); // udder
      for(const side of [-1,1])oval(g,.044,0xd98785,side*.095,.34,.11,[1,.90,1.65]);
    }
    for(const side of [-1,1])for(const z of [-.49,.44])hoofLeg(side,z,bull?.79:.68,base,deep,bull);
    const head=group(g,0,bull?1.14:1.01,.62);g.userData.head=head;
    oval(head,bull?.35:.32,base,0,.05,0,[bull?1.24:1.05,1.07,1.13]);
    oval(head,bull?.26:.235,bull?0xbe8664:0xefb7a5,0,-.16,.24,[1.35,.73,1.11]);
    oval(head,bull?.115:.105,bull?0xc38b67:0xf4b6a6,0,-.16,.43,[2.07,.70,.36]);
    for(const side of [-1,1]){
      oval(head,.03,bull?0x6b4539:0xc07778,side*.137,-.144,.517,[1.15,.75,.46]);
      ear(head,side,.34,.16,-.03,base,bull?0x9a5a51:0xda9b93,.69,bull);
      if(bull) {
        const h=cone(head,.093,.30,P.ivory,side*.32,.39,-.09,12);
        h.rotation.z=-side*.56;
        cone(head,.061,.15,0xfff1cf,side*.44,.54,-.075,10).rotation.z=-side*.66;
      } else cone(head,.060,.16,P.ivory,side*.22,.36,-.08,10).rotation.z=-side*.27;
    }
    eyelids(head,bull?.17:.154,.14,.316,bull?.081:.073);
    smile(head,0,-.245,.38);
    if(!bull) slingBell(.98,.43);
    else {
      const ring=mesh(g,'TorusGeometry',[.40,.048,6,20],P.leather,0,1.08,.47);
      ring.rotation.x=Math.PI/2;
      oval(g,.065,P.brass,0,.90,.76,[1,.9,.4]);
    }
    const tail=group(g,0,.91,-.69);g.userData.tail=tail;
    cyl(tail,.024,.035,.53,base,0,-.24,-.04,8);
    oval(tail,.080,deep,0,-.51,-.045,[1,1.7,.80]);
  }
  // Goats: sharply different, wiry build, alert eyes, curling beard.
  else if(goat){
    const coat=variant===0?0xbfa780:variant===1?0xf0e6cf:0x967a65;
    oval(g,.44,coat,0,.84,0,[.91,.87,1.49]);
    oval(g,.31,0xe9d3ad,0,.95,.38,[.91,.9,1]);
    for(const side of [-1,1])for(const z of [-.43,.43])hoofLeg(side,z,.66,coat,P.hoof);
    const head=group(g,0,1.08,.61);g.userData.head=head;
    oval(head,.25,coat,0,.07,.02,[.89,1.08,1.06]);
    oval(head,.147,0xe7cdb0,0,-.18,.27,[.9,.91,1.6]);
    for(const side of [-1,1]){
      ear(head,side,.26,.12,-.04,coat,P.rose,.95,true);
      cone(head,.063,.35,P.ivory,side*.146,.40,-.06,9).rotation.z=-side*.18;
    }
    eyelids(head,.13,.145,.243,.061);
    cone(head,.088,.24,0xb08b71,0,-.39,.26,9).rotation.z=Math.PI; // long beard
    smile(head,0,-.225,.4);
    const tail=group(g,0,.97,-.62);g.userData.tail=tail;
    oval(tail,.14,coat,0,.07,-.12,[.75,.8,1.3]);
  }
  // Birds: proper feathered bodies and two articulated wings, not the generic quadruped.
  else if(chicken || duck) {
    const isDuck=duck, body=isDuck?0xe8dec0:variant===0?0xc58a4a:variant===1?0xf1dfb4:0xa76543;
    oval(g,.38,body,0,.62,0,[1.06,1.18,1.25]);
    oval(g,.235,0xffe7b5,0,.56,.246,[.87,1.07,.73]);
    const head=group(g,0,1.07,.19);g.userData.head=head;
    oval(head,.247,body,0,0,0,[1,.99,1.04]);
    eyelids(head,.12,.052,.207,.064);
    if(isDuck) {
      oval(head,.138,0xeab35d,0,-.11,.29,[1.3,.45,1.5]);
      oval(head,.087,0xf6ce7c,0,-.077,.38,[1.35,.23,1.23]);
    } else {
      const beak=cone(head,.10,.25,0xe6a53e,0,-.106,.307,10);
      beak.rotation.x=Math.PI/2;
      for(let j=0;j<3;j++) oval(head,.075,0xc94f3c,0,.245+(j%2)*.045,(j-1)*.085,[.8,1.18,.60]);
      oval(head,.09,0xdd6150,0,-.217,.22,[.63,1.15,.63]);
    }
    for(const side of [-1,1]){
      const wing=group(g,side*.30,.78,-.02);wing.userData.sign=side;
      oval(wing,.215,body,side*.085,-.10,-.12,[1.23,.35,1.72]);
      for(let j=0;j<3;j++)
        oval(wing,.085,0xf2c17d,side*(.18+j*.052),-.19,-.20-j*.093,[1.3,.4,1.9]);
      g.userData.wings.push(wing);
      cyl(g,.029,.035,.29,0xcb8b47,side*.13,.29,.18,8);
      for(let j=0;j<3;j++)oval(g,.044,0xe6a44a,side*(.12+(j-1)*.065),.14,.29,[.7,.38,1.65]);
    }
    for(let j=0;j<4;j++)oval(g,.13,body,(j-1.5)*.09,.55,-.37-j%2*.10,[.7,.45,1.9]);
    g.userData.grounded=true;
  }
  // Swarm card uses a single distinctive hero bee model; the AI owns swarm count.
  else if(bee) {
    oval(g,.25,0xdda739,0,.77,0,[1,1.0,1.6]);
    for(const z of [-.22,.02,.24]) oval(g,.25,0x3b2e32,0,.77,z,[1.04,1.01,.34]);
    const head=group(g,0,.89,.36);g.userData.head=head;
    oval(head,.22,0xf5c957,0,0,.01,[1,1.0,.95]);
    eyelids(head,.105,.058,.185,.061);
    for(const side of [-1,1]){
      const wing=group(g,side*.18,1.0,-.07);wing.userData.sign=side;
      oval(wing,.19,0xa1d9de,side*.18,.085,-.01,[1.35,.15,.96]);
      g.userData.wings.push(wing);
      cone(head,.03,.20,0x382b31,side*.11,.27,-.025,7).rotation.z=-side*.30;
    }
    const stinger=cone(g,.065,.23,0x4d3a33,0,.72,-.47,8);
    stinger.rotation.x=-Math.PI/2;
    g.scale.setScalar(.68);
  }
  // Preserve compatibility with the existing battle simulation, card preview,
  // roam animation, selected-unit overlays, and quality/detail passes.
  g.userData.anatomy = g.userData.kind;
  g.userData.isFarmCreatureHero = true;
  return g;
}
