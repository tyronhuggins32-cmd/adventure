import{test}from'node:test';import assert from'node:assert/strict';import{createGame,cards,play,fight,floop,cpu}from'../kingdom-clash/lanes.js';
test('four themed lanes and opening hand',()=>{for(let k of ['farm','ice','beach','medieval']){let s=createGame(k);assert.equal(s.players[0].lanes.length,4);assert.equal(s.players[0].hand.length,5);assert.equal(s.players[0].deck.length,51);assert.ok(cards(k).filter(c=>c.type==='building').length>=3)}});
test('placement spends AP and rejects occupied slots',()=>{let s=createGame('farm');s.players[0].hand=[cards('farm')[0],cards('farm')[0]];assert.ok(play(s,0,0,0));assert.equal(s.players[0].ap,1);assert.equal(play(s,0,0,0),false);assert.equal(s.players[0].hand.length,1);assert.equal(play(s,1,0,1),false)});
test('opening restriction and direct hero damage',()=>{let s=createGame('farm');s.players[0].hand=[cards('farm')[0]];play(s,0,0,0);assert.equal(floop(s,0,0),false);fight(s,0);assert.equal(s.players[1].hp,30);fight(s,1);fight(s,0);assert.equal(s.players[1].hp,28)});
test('simultaneous combat removes casualties',()=>{let s=createGame('farm');s.round=2;let u={...cards('farm')[0],health:2,exhausted:false};s.players[0].lanes[0].unit={...u};s.players[1].lanes[0].unit={...u};fight(s,0);assert.equal(s.players[0].lanes[0].unit,null);assert.equal(s.players[1].lanes[0].unit,null)});
test('all 16 kingdom matchups finish',()=>{for(let a of ['farm','ice','beach','medieval'])for(let b of ['farm','ice','beach','medieval']){let s=createGame(a,b);for(let n=0;n<250&&s.phase==='battle';n++){if(s.turn===1){cpu(s);continue}let p=s.players[0];for(let j=0;j<2;j++){let done=false;for(let i=0;i<p.hand.length&&!done;i++)for(let lane=0;lane<4&&!done;lane++)done=play(s,0,i,lane)}fight(s,0)}assert.equal(s.phase,'ended',a+' vs '+b)}});
test('every placement emits one uniquely identified typed reaction',()=>{
 const s=createGame('farm');const p=s.players[0];p.hand=[cards('farm')[0],cards('farm')[3],cards('farm')[6]];p.ap=5;
 assert.ok(play(s,0,0,0));assert.ok(play(s,0,0,0));assert.ok(play(s,0,0,1));
 assert.deepEqual(s.events.map(e=>e.kind),['summon','build','spell']);assert.deepEqual(s.events.map(e=>e.seq),[1,2,3]);assert.equal(s.events[0].card.name,'Turnip Squire');
 const before=s.eventId;assert.equal(play(s,0,0,0),false);assert.equal(s.eventId,before);
});
test('bot exposes intermediate states for visible card reactions',()=>{
 let s=createGame('beach','medieval');fight(s,0);s.players[1].hand=[cards('medieval')[0],cards('medieval')[3]];let snapshots=[];cpu(s,v=>snapshots.push(structuredClone(v)));
 assert.equal(snapshots.length,3);assert.equal(snapshots[0].turn,1);assert.equal(snapshots[0].players[1].ap,1);assert.equal(snapshots[1].players[1].ap,0);assert.equal(snapshots[2].turn,0);assert.ok(snapshots[1].eventId>snapshots[0].eventId);
});
test('defeated creatures retain artwork metadata for fade reaction',()=>{
 let s=createGame('farm','ice');s.round=2;s.players[0].hand=[cards('farm')[2]];play(s,0,0,0);s.turn=1;s.players[1].hand=[cards('ice')[0]];play(s,1,0,0);s.turn=0;fight(s,0);
 let e=s.events.find(e=>e.kind==='death');assert.equal(e.kingdom,'ice');assert.equal(e.card.id,'u0');assert.equal(e.p,1);assert.equal(s.players[1].lanes[0].unit,null);
});
