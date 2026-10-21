// Per-card programs share movement primitives, but each actor owns its state and traits.
export const hashName=name=>[...String(name)].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
const birds=/crow|raven|owl|griffin|gryphon|manta|gull|phoenix|jelly|sprite|cloud/i;
const beasts=/sheep|cow|bull|pig|hound|rat|boar|yak|bear|kid|ram|mammoth|fox|cricket|seal|ox|monkey|turtle|leech|angler|charger|hare|mastiff|wolf|hen/i;
export function programFor(card){
 const key=[card.commander||'',card.type||'',card.id||'',card.name||''].join(':'),seed=hashName(key),name=card.name||card.id||'Entity';
 let family=card.type==='spell'?'spell':card.type==='building'?'structure':card.type==='commander'?'leader':birds.test(name)?'fly':beasts.test(name)?'animal':/root|seed|corn|ent|golem|keep|colossus/i.test(name)?'lumber':'patrol';
 const specialty=card.behavior||card.effect||card.ability||family;
 const leaders={farmer:'inspect crops',scarecrow:'watch crows',cornDruid:'tend roots',hearthkeeper:'share warmth',frostWitch:'weave frost',glacierShepherd:'watch herd',castawayCaptain:'scout supplies',reefOracle:'read tides',tideCollector:'collect relics',bannerKnight:'rally allies',royalCastellan:'inspect defenses',exiledPrince:'practice blade'};
 const routine=leaders[card.id]||(/hound|wolf|mastiff|warden|guardian|sentinel/i.test(name)?'guard':/rat|spy|thief|outcast|hermit/i.test(name)?'skulk':family==='animal'?'forage':family==='fly'?'circle':family==='lumber'?'trudge':'patrol');
 const cue=name+' '+specialty;
 const visual=/windmill|crane|drum/i.test(name)?'rotor':/fire|ember|kiln|hearth|ash|burn|phoenix/i.test(cue)?'ember':/freeze|frost|snow|ice|shatter|blizzard|glacier/i.test(cue)?'frost':/root|plant|garden|growth|corn|seed|orchard|grove|briar/i.test(cue)?'vine':/heal|feast|soup|renewal/i.test(cue)?'heal':/water|tide|reef|pearl|coral|irrig|ocean|pool|jar|dock/i.test(cue)?'water':/bolt|cannon|volley|lance|siege|ballista/i.test(cue)?'shard':'spark';
 return {key,seed,family,specialty,routine,visual,name,speed:(family==='leader'?.16:family==='fly'?.3:family==='lumber'?.11:.22)*(1+(seed%31)/100),stride:5+(seed%5),pause:1+(seed%17)/10,range:.7+(seed%23)/10,phase:(seed%628)/100,hue:seed%360,particles:5+seed%5,style:['orbit','spiral','spray','ripple'][seed%4],lifetime:4.5+(seed%20)/10,stationary:family==='structure',signature:`${key}/${seed}`};
}
export function headingFor(dx,dy){const angle=Math.atan2(dy,dx);return ['E','SE','S','SW','W','NW','N','NE'][(Math.round(angle/(Math.PI/4))+8)%8];}
