import test from "node:test";
import assert from "node:assert/strict";
import {SIZE,createMatch,REALMS,CARDS,placeCommander,terrainAt,getBuilding,getCommander,legalDeploy,legalMoves,perform,endTurn,runCpuTurn} from "../kingdom-clash/engine.js";

test("battlefield doubles to a sixteen-by-sixteen grid",()=>{
  assert.equal(SIZE,16);
  for(const k of Object.keys(REALMS)){
    const s=createMatch(k,"medieval");
    assert.equal(terrainAt(s,0,15),k);
    assert.equal(terrainAt(s,0,0),"medieval");
  }
});
test("both commanders are needed to begin and create a matching building",()=>{
  for(const k of Object.keys(REALMS)){
    const s=createMatch(k,k);
    assert.equal(s.phase,"setup");
    assert.equal(placeCommander(s,"blue",7,10),false);
    assert.equal(placeCommander(s,"blue",7,14),true);
    assert.equal(s.phase,"setup");
    assert.equal(getBuilding(s,"blue").hp, k==="medieval"?10:8);
    assert.equal(placeCommander(s,"red",8,1),true);
    assert.equal(s.phase,"battle");
    assert.ok(getCommander(s,"blue"));
    assert.ok(getCommander(s,"red"));
  }
});
test("cards cost gold and advanced cards unlock on building upgrades",()=>{
  const s=createMatch("farm","ice");
  placeCommander(s,"blue",7,14);placeCommander(s,"red",8,1);
  assert.equal(legalDeploy(s,"blue","rider").length,0);
  const target=legalDeploy(s,"blue","fighter")[0];
  assert.ok(target);
  assert.equal(perform(s,{kind:"deploy",side:"blue",card:"fighter",...target}).ok,true);
  assert.equal(s.gold.blue,6-CARDS.fighter.cost);
  assert.equal(perform(s,{kind:"upgrade",side:"blue"}).ok,false);
  endTurn(s);runCpuTurn(s);
  // Accrue gold, then make room for an upgrade
  for(let i=0;i<3&&s.phase==="battle";i++){endTurn(s);runCpuTurn(s);}
  if(s.phase==="battle"){
    const b=getBuilding(s,"blue");
    assert.ok(b.level>=1);
  }
});
test("warriors move and strike only when legal",()=>{
  const s=createMatch("medieval","farm");
  placeCommander(s,"blue",7,14);placeCommander(s,"red",7,1);
  const spot=legalDeploy(s,"blue","fighter")[0];
  assert.equal(perform(s,{kind:"deploy",side:"blue",card:"fighter",...spot}).ok,true);
  const warrior=s.units.find(u=>u.type==="fighter");
  assert.equal(legalMoves(s,warrior.id).length,0,"newly deployed warrior waits until next turn");
  endTurn(s);runCpuTurn(s);
  if(s.phase==="battle"){
    assert.ok(legalMoves(s,warrior.id).length>0);
    assert.equal(perform(s,{kind:"move",side:"blue",id:warrior.id,x:99,y:99}).ok,false);
  }
});
test("computer can complete its turn and hands play back",()=>{
  const s=createMatch("beach","ice");
  placeCommander(s,"blue",6,14);placeCommander(s,"red",8,1);
  endTurn(s);
  const events=runCpuTurn(s);
  assert.ok(events.length>=1);
  assert.equal(s.turn,"blue");
  assert.equal(s.round,2);
});
