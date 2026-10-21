import {floopEpisodeBuilding} from './episode-cards.js?v=episode7';
import {play,emit,log,clean,victory} from './lanes.js?v=episode7';
// The rival uses the same ownership, AP and once-per-turn checks as the player.
export function prepareEpisodeRival(s){if(!s.episodePreset)return;const saved=s.turn;s.turn=1;const p=s.players[1];if(!p.lanes.some(l=>l.field.kind==='corn'&&l.field.food>0)){const i=p.hand.findIndex(c=>c.effect==='world-reclaim');if(i>=0)play(s,1,i,0);}for(let lane=0;lane<4;lane++){const b=p.lanes[lane].building;if(!b)continue;if(b.effect==='ep-volcano'&&!s.players[0].lanes[lane].building)continue;floopEpisodeBuilding(s,1,lane,{emit,log,clean,victory});}s.turn=saved;}
