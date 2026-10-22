import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {REALMS, createMatch, placeCommander, getBuilding} from "../kingdom-clash/engine.js";

test("Kingdom Deck contains exactly four starting options in order",()=>{
  assert.deepEqual(Object.keys(REALMS),["farm","ice","beach","medieval"]);
  assert.deepEqual(Object.values(REALMS).map(x=>x.building),["Hay Field","Ice House","Dock","Knight House"]);
});

test("every Kingdom Commander creates its own building and starts a match only after both sides deploy",()=>{
  for(const key of Object.keys(REALMS)){
    const game=createMatch(key,"farm");
    assert.equal(game.phase,"setup");
    assert.equal(placeCommander(game,"blue",5,13),true);
    assert.equal(game.phase,"setup");
    assert.equal(game.kingdom.blue,key);
    assert.equal(getBuilding(game,"blue").hp,key==="medieval"?10:8);
    assert.equal(placeCommander(game,"red",9,2),true);
    assert.equal(game.phase,"battle");
  }
});

test("previous game starts at kingdom selection with lane battle hidden",()=>{
const html=readFileSync(new URL("../episode-table.html",import.meta.url),"utf8");
assert.match(html,/id="setup"/);assert.match(html,/id="game" hidden/);assert.match(html,/id="kingdoms"/);assert.match(html,/id="hand"/);
});
