import test from "node:test";
import assert from "node:assert/strict";
import {cards,createGame,play} from "../kingdom-clash/lanes.js";

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
