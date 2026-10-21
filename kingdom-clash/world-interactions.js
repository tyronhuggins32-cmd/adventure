import {baseTerrain,makeField} from './living-rules.js';
import {tableSlot} from './tabletop-layout.js?v=episode5';
export const WORLD_CARDS=[
 {id:'world-reclaim',name:'Reclaim Landscape',type:'spell',cost:1,effect:'world-reclaim',text:'Restore your kingdom’s original terrain, 8 integrity and 3 food per landscape. Recall mud-trapped creatures.'},
 {id:'world-mud',name:'Mud Trap',type:'spell',cost:1,effect:'world-mud',text:'Turn the opposing landscape into mud. A raiding pig gets stuck there until its owner reclaims the landscape.'},
 {id:'world-revive',name:'Wake the Fallen',type:'spell',cost:2,effect:'world-revive',text:'Return the last defeated friendly creature to this empty lane at half health. Requires a living creature that has studied twice.'}
];
export const cornPowered=c=>c?.terrainPower==='corn'||/corn|kernel|turnip|carrot|pumpkin|maize/i.test(c?.name||'');
export const landscapePowered=(player,card)=>!cornPowered(card)||player.lanes.some(l=>l.field.kind==='corn'&&l.field.food>0&&l.field.integrity>0);
export function worldSpell(s,p,card,lane,api){if(!s.episodeWorld||!card.effect?.startsWith('world-'))return false;const own=s.players[p],l=own.lanes[lane],op=s.players[1-p].lanes[lane];
 if(card.effect==='world-reclaim'){for(let i=0;i<4;i++){const f=own.lanes[i].field;Object.assign(f,makeField(own.kingdom),{kind:f.originalKind||baseTerrain[own.kingdom],food:3,fire:0,storm:false});const u=own.lanes[i].unit;if(u?.trapped)delete u.trapped;api.emit(s,{kind:'terrain',p,lane:i,terrain:f.kind,kingdom:own.kingdom});}api.log(s,'The kingdom is reclaimed. Crops, paths and terrain power return.');}
 if(card.effect==='world-mud'){Object.assign(op.field,{kind:'mud',food:0,hazard:0});for(const u of s.players[1-p].lanes.map(l=>l.unit).filter(Boolean))if(u.behavior==='pig'&&u.raidPosition?.side===1-p&&u.raidPosition.lane===lane)u.trapped={side:1-p,lane};api.emit(s,{kind:'terrain',p:1-p,lane,terrain:'mud',kingdom:s.players[1-p].kingdom});api.log(s,'Mud replaces the opposing landscape. Pigs cannot cross it.');}
 if(card.effect==='world-revive'){const index=own.discard.findLastIndex(c=>c.type==='creature');if(index>=0&&!l.unit){const c=own.discard.splice(index,1)[0];l.unit={...c,uid:'unit'+ ++s.entityId,health:Math.max(1,Math.ceil(c.hp/2)),exhausted:true,frozen:false};delete l.unit.trapped;api.emit(s,{kind:'summon',p,lane,card:{...l.unit},kingdom:own.kingdom});api.log(s,l.unit.name+' returns through learned magic.');}}
 return true;
}
export function worldSpellLocked(s,p,card,lane){const a=s.players[p];if(card.effect==='world-revive')return !!a.lanes[lane].unit||!a.discard.some(c=>c.type==='creature')||!a.lanes.some(l=>l.unit?.study>=2&&l.building&&(!s.episodeCards||l.building.effect==='ep-school'||!s.episodePreset));return false;}
// Building jobs are explicit choices: a creature gives up its next attack.
export function assignWorldJob(s,p,lane,job,api){const l=s.players[p]?.lanes[lane],u=l?.unit;if(!s.episodeWorld||s.wave?.running||s.phase!=='battle'||s.turn!==p||!u||!l.building||u.exhausted||u.frozen||u.trapped||!['shelter','study'].includes(job)||l.building.effect?.startsWith?.('ep-')&&l.building.effect!==(job==='study'?'ep-school':'ep-cave'))return false;u.exhausted=true;u.job=job;api.emit(s,{kind:'worldJob',p,lane,card:{...u},job,kingdom:s.players[p].kingdom});api.log(s,u.name+(job==='shelter'?' shelters in ':' studies in ')+l.building.name+'.');return true;}
export function finishWorldJobs(s){if(!s.episodeWorld)return;for(const p of s.players)for(const l of p.lanes){const u=l.unit;if(!u)continue;if(u.job==='study'&&l.building){u.study=Math.min(2,(u.study||0)+1);if(u.study===2&&!p.hand.some(c=>c.id==='world-revive'))p.hand.push({...WORLD_CARDS[2]});}if(u.job==='shelter'&&l.building)u.health=Math.min(u.hp,u.health+2);delete u.job;}}
export function startPigRaid(s,p,lane,api){const u=s.players[p].lanes[lane].unit;if(!s.episodeWorld||u?.behavior!=='pig')return false;if(u.trapped){api.log(s,u.name+' is stuck in mud. Reclaim its home landscape to release it.');return true;}const targets=s.players[1-p].lanes.map((l,i)=>({l,i})).filter(({l})=>l.field.kind==='corn'&&l.field.food>0);if(!targets.length){api.log(s,'No opposing corn remains for '+u.name+' to eat.');return true;}
 u.raid={targets:targets.map(t=>t.i)};api.emit(s,{kind:'pigRaid',p,lane,card:{...u},targets:u.raid.targets,kingdom:s.players[p].kingdom});api.log(s,u.name+' is sent to eat the opposing corn. The raid resolves when battle begins.');return true;
}
// Used by the battle and renderer, so movement follows the same authoritative path.
export function raidStops(side,lane,targets){return [tableSlot(side,lane),...targets.map(i=>tableSlot(1-side,i)),tableSlot(side,lane)];}
