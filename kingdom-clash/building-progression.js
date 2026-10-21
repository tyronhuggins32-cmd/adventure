// Building ownership is checked at action time: losing a school closes its recruitment and magic.
export function recruitmentRoster(catalog,building){
 const units=catalog.filter(c=>c.type==='creature'&&c.id!=='rare-dancer');
 const buildings=catalog.filter(c=>c.type==='building');
 const branch=buildings.findIndex(c=>c.id===building.id);
 if(branch<0)return [];
 if(building.commander==='farmer'){
  const home=c=>['pig','sheep','cow','bull'].includes(c.behavior)?'barn':/\b(turnip|corn|kernel|seed|root|fruit|pumpkin|carrot|orchard)\b/i.test(c.name)?'farm':/\b(hen|chicken|rooster|bird|crow|raven|owl|griffin|gryphon)\b/i.test(c.name)?'coop':c.kind!=='animal'&&!/\b(pig|boar|wolf|fox|horse|ox|hare|cat|goat|mouse|badger|duck|sheep)\b/i.test(c.name)?'mill':null;
  const school=building.effect==='barn'?'barn':building.effect==='farm'?'farm':building.effect==='coop'?'coop':'mill';
  const names=new Set();return units.filter(c=>{if(home(c)!==school||names.has(c.name))return false;names.add(c.name);return true;}).slice(0,5);
 }
 // Each other school owns a disjoint roster, including that commander's matching core warrior.
 return units.filter((c,i)=>i%buildings.length===branch).slice(0,5);
}
export const schoolAlive=(p,id)=>p.lanes.some(l=>l.building?.id===id&&(l.building.health??l.building.hp)>0);
export function lockReason(p,c){
 if(c.recruitFrom&&!schoolAlive(p,c.recruitFrom))return 'Rebuild the recruiting building first.';
 if(c.caster){const caster=p.lanes.map(l=>l.unit).find(u=>u?.uid===c.caster&&u.health>0);if(!caster)return 'This spell needs its living veteran.';if(caster.frozen||caster.exhausted)return 'The caster must be ready.';}
 return '';
}
export function veteranSpell(unit,building,territory){
 const animal=['pig','sheep','cow','bull'].includes(unit.behavior);
 const magic=animal?'herd':building.effect==='coop'?'flock':building.name==='Windmill'?'gale':building.id==='b2'?'siege':building.id==='b0'&&territory!=='farm'?'renewal':territory==='farm'?'bloom':territory==='ice'?'winter':territory==='beach'?'tide':'siege';
 const names={flock:'Skyseed Chorus',gale:'Threshing Tempest',renewal:'Veteran Sanctuary',herd:'Sanctuary of the Herd',bloom:'Harvest Ascendant',winter:'Whiteout Seal',tide:'Tidal Reversal',siege:'Crownfire Volley'};
 const rules={flock:'Give every friendly creature +1 attack, capped at +3 from this spell per creature.',gale:'Deal 2 damage to all enemy creatures.',renewal:'Heal all friendly creatures 3 HP.',herd:'Heal all friendly livestock by 4 HP.',bloom:'Grow 3 food and repair 2 integrity in every friendly field; heal your caster 3 HP.',winter:'Deal 3 damage and freeze the creature in the chosen enemy lane.',tide:'Deal 4 damage to the chosen enemy creature and heal your commander 4 HP.',siege:'Deal 5 damage to the chosen enemy creature or 3 to an empty lane’s commander.'};
 return {id:'veteran:'+unit.uid,name:unit.name+' · '+names[magic],type:'spell',cost:2,effect:'veteran',magic,caster:unit.uid,recruitFrom:building.id,commander:unit.commander,text:rules[magic]+' Requires the veteran and '+building.name+'. One cast per wave.'};
}
export function advanceVeterans(s,p){
 const player=s.players[p];if(!player.buildingProgression||player.lastVeteranRound===s.round)return;player.lastVeteranRound=s.round;
 for(const l of player.lanes){const u=l.unit;if(!u||u.health<=0||!u.recruitFrom)continue;u.veteranWaves=(u.veteranWaves||0)+1;
 const building=player.lanes.map(l=>l.building).find(b=>b?.id===u.recruitFrom&&(b.health??b.hp)>0);
 if(u.veteranWaves>=2&&building&&!player.hand.some(c=>c.caster===u.uid)&&!player.discard.some(c=>c.caster===u.uid))player.hand.push(veteranSpell(u,building,player.kingdom));
 }
 // Spent veteran spells refresh next deployment; dead casters never leave orphan cards.
 player.hand=player.hand.filter(c=>!c.caster||player.lanes.some(l=>l.unit?.uid===c.caster&&l.unit.health>0));
 for(let i=player.discard.length-1;i>=0;i--){const c=player.discard[i];if(c.caster&&c.castRound<=s.round&&player.lanes.some(l=>l.unit?.uid===c.caster&&l.unit.health>0)&&!player.hand.some(v=>v.caster===c.caster))player.hand.push(player.discard.splice(i,1)[0]);}
}
export function castVeteran(s,p,c,lane){
 const a=s.players[p],target=s.players[1-p].lanes[lane].unit,caster=a.lanes.map(l=>l.unit).find(u=>u?.uid===c.caster);
 switch(c.magic){
 case 'flock':for(const l of a.lanes)if(l.unit&&(l.unit.chorusGrowth||0)<3){l.unit.atk++;l.unit.chorusGrowth=(l.unit.chorusGrowth||0)+1;}break;
 case 'gale':for(const l of s.players[1-p].lanes)if(l.unit)l.unit.health-=2;break;
 case 'renewal':for(const l of a.lanes)if(l.unit)l.unit.health=Math.min(l.unit.hp,l.unit.health+3);break;
 case 'herd':for(const l of a.lanes)if(l.unit&&['pig','sheep','cow','bull'].includes(l.unit.behavior))l.unit.health=Math.min(l.unit.hp,l.unit.health+4);break;
 case 'bloom':for(const l of a.lanes){l.field.food=Math.min(12,l.field.food+3);l.field.integrity=Math.min(8,l.field.integrity+2);}caster.health=Math.min(caster.hp,caster.health+3);break;
 case 'winter':if(target){target.health-=3;target.frozen=true;}break;
 case 'tide':if(target)target.health-=4;a.hp=Math.min(30,a.hp+4);break;
 case 'siege':if(target)target.health-=5;else s.players[1-p].hp=Math.max(0,s.players[1-p].hp-3);break;
 }
 c.castRound=s.round;
}
