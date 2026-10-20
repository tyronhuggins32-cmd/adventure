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

test("website begins at Kingdom Deck with Warrior Deck locked",()=>{
  const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
  const js=readFileSync(new URL("../kingdom-clash/app.js",import.meta.url),"utf8");
  assert.match(html,/id="kingdomSection"/);
  assert.match(html,/id="kingdoms"/);
  assert.match(html,/id="warriorStage" class="deck-step locked"/);
  assert.match(html,/id="layout" hidden/);
  assert.match(js,/if\(!chosenRealm\)return/);
  assert.match(js,/s\.phase==="battle"/);
  assert.match(js,/for\(const \[key,realm\] of Object\.entries\(REALMS\)\)/);
});
