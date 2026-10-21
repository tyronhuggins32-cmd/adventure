import test from "node:test";
import assert from "node:assert/strict";
import {cards,createGame,play,fight} from "../kingdom-clash/lanes.js";

test("each building card can be placed only once per player",()=>{
  const game=createGame("farm","ice",()=>0.5);
  const building=cards("farm")[3];
  game.players[0].hand=[{...building}];
  assert.equal(play(game,0,0,0),true,"first placement should work");
  assert.equal(game.players[0].placedBuildings.includes(building.id),true);
  game.players[0].hand=[{...building}];
  assert.equal(play(game,0,0,1),false,"same building card cannot be placed a second time");
  assert.equal(game.players[0].lanes[1].building,null);
});


test("units attack and destroy enemy buildings after the lane is cleared",()=>{
  const game=createGame("farm","ice",()=>0.5);
  game.round=2;
  game.players[0].lanes[0].unit={id:"test-unit",name:"Test attacker",type:"creature",atk:3,hp:4,health:4,exhausted:false,frozen:false};
  game.players[1].lanes[0].building={id:"b0",name:"Test tower",type:"building",hp:6,health:2,effect:0};
  assert.equal(fight(game,0),true);
  assert.equal(game.players[1].lanes[0].building,null,"destroyed building should be removed from the lane");
  assert.equal(game.players[1].discard.some(card=>card.name==="Test tower"),true,"destroyed building should go to discard");
  assert.equal(game.events.some(event=>event.kind==="buildingDeath"),true,"destruction should emit a visual event");
});
