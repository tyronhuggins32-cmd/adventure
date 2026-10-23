// Landscape cards are physical slots on the table, not a cosmetic biome choice.
export const LANDSCAPES = Object.freeze({
  corn:{name:'Cornfield',family:'Corn',tone:'#a9b949',edge:'#536830',detail:'Corn grows during battle. Corn-fed creatures gain their terrain bonuses.',icon:'✦'},
  blue:{name:'Blue Plains',family:'Blue',tone:'#4ba7b5',edge:'#246579',detail:'Open ground. Creatures move freely and can see across the row.',icon:'≋'},
  swamp:{name:'Useless Swamp',family:'Bog',tone:'#677c53',edge:'#374e42',detail:'Mud slows visitors; a Pig crossing the center may get stuck.',icon:'◉'},
  ice:{name:'Frozen Lake',family:'Snow',tone:'#aed6db',edge:'#6b98ab',detail:'Cold ground sheltering a Snow Wolf pack.',icon:'❅'},
  sand:{name:'Dust Flats',family:'Sand',tone:'#d2b171',edge:'#967447',detail:'Dry earth holds no corn until a field card grows it.',icon:'◇'},
  stone:{name:'Stone Yard',family:'Stone',tone:'#92938a',edge:'#5a615a',detail:'Hard ground leaves little food for foragers.',icon:'⬡'}
});

export const FIELD_DECK = Object.freeze(['corn','corn','blue','blue','swamp','ice','sand','stone']);
export const FIELD_SLOTS = 4;

export function createFieldDeck(){return {cards:[...FIELD_DECK],slots:[null,null,null,null],selected:null,ready:false};}
export function selectLandscape(field,index){if(field.ready||index<0||index>=field.cards.length)return false;field.selected=field.selected===index?null:index;return true;}
export function placeLandscape(field,lane){if(field.ready||field.selected===null||lane<0||lane>=FIELD_SLOTS)return false;
 const index=field.selected,terrain=field.cards[index],previous=field.slots[lane];field.slots[lane]=terrain;
 if(previous)field.cards[index]=previous;else field.cards.splice(index,1);
 field.selected=null;return true;
}
export function canStart(field){return field.slots.every(Boolean);}
export function lockField(field){if(!canStart(field))return false;field.ready=true;field.selected=null;return true;}
export function applyField(world,field){for(let i=0;i<FIELD_SLOTS;i++){const kind=field.slots[i];if(!kind)continue;const row=world.lanes[i];row.terrain=kind;row.crop=kind==='corn'?.75:0;row.food=kind==='corn'?2:kind==='swamp'?1:0;row.mud=kind==='swamp'?8:0;row.fire=0;}return world;}
