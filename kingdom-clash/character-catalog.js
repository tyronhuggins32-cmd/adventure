// Kingdom Clash — procedural 3D roster expansion.
// Generates 720 named, commander-aligned character and animal variants from reusable
// low-poly model recipes. Models are built by model-3d.js; no external assets required.
export const ROSTER_TARGET = 720;
export const ROSTER_KINGDOMS = Object.freeze({
  farm: { title: "Harvest Kingdom", palette: "farm", creatures: ["Hay Golem","Harvest Griffin","Turnip Squire","Scarecrow Knight","Corn Witch","Orchard Keeper","Moss Boar","Clover Stag"], animals: ["Pig","Wolf","Fox","Horse","Ox","Hare","Crow","Owl","Sheep","Goat","Barn Cat","Field Mouse","Badger","Duck","Rooster","Bee Swarm"] },
  ice: { title: "Frost Kingdom", palette: "ice", creatures: ["Glacier Guardian","Snow Imp","Frost Wyvern","Aurora Mage","Rime Knight","Crystal Troll","Blizzard Monk","Ice Warden"], animals: ["Snow Wolf","Polar Bear","Arctic Fox","Seal","Snow Hare","Owl","Raven","Musk Ox","Penguin","Lynx","White Stag","Frost Moth","Ice Turtle","Mountain Goat","Snow Leopard","Walrus"] },
  beach: { title: "Tide Kingdom", palette: "beach", creatures: ["Shell Squire","Reef Colossus","Storm Ray","Tidecaller","Coral Sentinel","Pearl Witch","Abyss Knight","Wave Dancer"], animals: ["Sea Turtle","Seal","Dolphin","Crab","Seagull","Pelican","Otter","Shark","Manta Ray","Octopus","Jellyfish","Lobster","Beach Fox","Sandpiper","Sea Lion","Clownfish"] },
  medieval: { title: "Iron Kingdom", palette: "medieval", creatures: ["Crown Squire","Iron Guardian","Royal Dragon","Rune Knight","Castle Mage","Royal Medic","Gargoyle Custodian","Oathbreaker"], animals: ["War Horse","Dire Wolf","Raven","Falcon","Boar","Stag","Hound","Mountain Lion","Bat","Giant Eagle","Griffin","Dragon Whelp","Mule","Pigeon","Ferret","Black Cat"] }
});
const roles = [
  { key:"guard", label:"Guard", rarity:"common", hp:7, attack:2, ability:"guard" },
  { key:"ranger", label:"Ranger", rarity:"common", hp:4, attack:3, ability:"ranged" },
  { key:"mage", label:"Spellcaster", rarity:"rare", hp:4, attack:4, ability:"magic" },
  { key:"healer", label:"Healer", rarity:"rare", hp:5, attack:1, ability:"heal" },
  { key:"monster", label:"Monster", rarity:"epic", hp:10, attack:4, ability:"monster" },
  { key:"scout", label:"Scout", rarity:"common", hp:5, attack:2, ability:"scout" }
];
const prefixes = ["Amber","Ancient","Ashen","Aurora","Bramble","Bright","Copper","Dawn","Dusk","Elder","Ember","Fable","Feral","Golden","Hollow","Ivory","Jade","Moon","Moss","Night","Oak","Opal","Rune","Silver","Star","Storm","Thorn","Thunder","Wild","Winter"];
const suffixes = ["Adept","Bane","Bearer","Caller","Champion","Dancer","Defender","Drifter","Keeper","Mender","Rider","Seeker","Sentinel","Shaper","Singer","Stalker","Tender","Walker","Watcher","Weaver","Warden","Whisper"];
function hash(text) { let h=2166136261; for (const c of text) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
function makeEntry(index, kingdom) {
  const data=ROSTER_KINGDOMS[kingdom], seed=hash(kingdom+":"+index), role=roles[seed%roles.length];
  const animal=(index%3===0)||(index%7===0);
  const list=animal?data.animals:data.creatures;
  const base=list[Math.floor(seed/list.length)%list.length];
  const prefix=prefixes[(seed>>>5)%prefixes.length], suffix=suffixes[(seed>>>11)%suffixes.length];
  const name=index<list.length?base:`${prefix} ${base} ${suffix}`;
  return Object.freeze({
    id:`${kingdom}-roster-${String(index+1).padStart(4,"0")}`, name, kingdom,
    kind:animal?"animal":"character", role:animal?"beast":role.key,
    roleLabel:animal?"Beast":role.label, rarity:animal?(index%13===0?"rare":"common"):role.rarity,
    hp:animal?5+(seed%7):role.hp+(seed%3), attack:animal?1+(seed%4):role.attack,
    ability:animal?(index%5===0?"pack":"beast"):role.ability,
    model:{type:animal?"animal":"human",palette:data.palette,seed,variant:seed%8},
    commanderAffinity:kingdom
  });
}
export const COMMANDER_ROSTERS = Object.freeze(Object.fromEntries(
  Object.keys(ROSTER_KINGDOMS).map(k=>[k,Object.freeze(Array.from({length:180},(_,i)=>makeEntry(i,k)))])
));
export const CHARACTER_ROSTER = Object.freeze(Object.values(COMMANDER_ROSTERS).flat());
export function rosterForCommander(commanderOrKingdom) {
  const key=ROSTER_KINGDOMS[commanderOrKingdom]?commanderOrKingdom:
    Object.keys(ROSTER_KINGDOMS).find(k=>commanderOrKingdom?.toLowerCase?.().includes(k));
  return key?COMMANDER_ROSTERS[key]:CHARACTER_ROSTER;
}
export function findRosterCard(id) { return CHARACTER_ROSTER.find(card=>card.id===id)||null; }

// Ultra-rare territory thief: wins a dance-off on the enemy side and converts
// half of the enemy's remaining assets. Call only when the dancer reaches enemy territory.
export const RARE_DANCER = Object.freeze({
  id:"mythic-territory-dancer", name:"The Grand Conqueror", type:"creature",
  rarity:"mythic", cost:9, hp:8, attack:2, ability:"territory-dance",
  description:"Dances on enemy territory and converts half of the opponent's remaining buildings, characters, and animals.",
  danceDuration:4.5, conversionRatio:0.5
});
export function resolveTerritoryDance(state, side, dancerId) {
  const dancer=state?.players?.[side]?.lanes?.flatMap(l=>[l.unit]).find(u=>u?.uid===dancerId);
  if(!dancer||dancer.id!==RARE_DANCER.id||dancer.ability!=="territory-dance")return {ok:false,converted:[]};
  const enemy=state.players[1-side], assets=[];
  for(let lane=0;lane<enemy.lanes.length;lane++){
    const l=enemy.lanes[lane];
    if(l.unit)assets.push({kind:"character",lane,asset:l.unit});
    if(l.building)assets.push({kind:"building",lane,asset:l.building});
  }
  for(const animal of enemy.population||[])assets.push({kind:"animal",asset:animal});
  const count=Math.floor(assets.length*RARE_DANCER.conversionRatio);
  const converted=assets.slice(0,count);
  for(const item of converted){
    if(item.kind==="character")enemy.lanes[item.lane].unit=null;
    else if(item.kind==="building")enemy.lanes[item.lane].building=null;
    else enemy.population=enemy.population.filter(a=>a!==item.asset);
    state.players[side].convertedAssets??=[];
    state.players[side].convertedAssets.push({...item.asset,convertedFrom:1-side,assetKind:item.kind});
  }
  return {ok:true,converted:converted.map(x=>({kind:x.kind,name:x.asset.name}))};
}
