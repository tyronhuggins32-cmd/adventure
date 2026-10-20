import {
 SIZE, REALMS, CARDS, createMatch, placeCommander, perform, endTurn, runCpuTurn,
 unitAt, buildingAt, getBuilding, legalDeploy, legalMoves, legalAttacks, terrainAt
} from "./engine.js";

const $ = id => document.getElementById(id);
const realmArt = {
 farm: {scene:"🌻　🌾　🐓", detail:"Fields and golden farmland"},
 ice: {scene:"❄️　🏔️　🧊", detail:"Frozen lakes and snowfall"},
 beach: {scene:"🌴　🐚　🌊", detail:"Sandy shores and ocean"},
 medieval: {scene:"🛡️　🏰　⚔️", detail:"Stone roads and castles"}
};
const icon = Object.fromEntries(Object.entries(CARDS).map(([key,card])=>[key,card.icon]));
const setupHints = Array.from({length:SIZE*4},(_,i)=>({x:i%SIZE,y:12+Math.floor(i/SIZE)}));
let s = createMatch("farm"), chosenRealm = null, selected = null, mode = null, hints = [], busy = false, cpuTimer = null;

function reset() {
 if (cpuTimer !== null) clearTimeout(cpuTimer);
 cpuTimer=null;busy=false;chosenRealm=null;s=createMatch("farm");selected=null;mode=null;hints=[];
 render();
}
function chooseKingdom(key) {
 if(s.phase!=="setup"||!REALMS[key])return;
 if(cpuTimer!==null)clearTimeout(cpuTimer);
 cpuTimer=null;busy=false;s=createMatch(key);chosenRealm=key;selected=null;mode=null;hints=setupHints;
 render();
}
function selectCard(key) {
 if(s.phase!=="battle"||s.turn!=="blue"||busy)return;
 selected=null;mode=key;hints=legalDeploy(s,"blue",key);render();
}
function pick(x,y) {
 if(busy||s.phase==="ended")return;
 if(s.phase==="setup"){
   if(!chosenRealm)return;
   if(placeCommander(s,"blue",x,y)){
     const enemyX=2+Math.floor(Math.random()*12);
     placeCommander(s,"red",enemyX,1);
     selected=null;mode=null;hints=[];
   }
   render();return;
 }
 if(s.turn!=="blue")return;
 if(mode&&CARDS[mode]){
   const r=perform(s,{kind:"deploy",side:"blue",card:mode,x,y});
   if(r.ok){mode=null;hints=[];selected=null;afterAction();}else render();
   return;
 }
 if(selected){
   const action=mode==="power"?"power":hints.some(p=>p.x===x&&p.y===y)
     ?(unitAt(s,x,y)||buildingAt(s,x,y)?"attack":"move"):null;
   if(action){
     const r=perform(s,{kind:action,side:"blue",id:selected.id,x,y});
     if(r.ok){selected=null;mode=null;hints=[];afterAction();return;}
   }
 }
 const u=unitAt(s,x,y);
 if(u&&u.side==="blue"&&!u.acted){
   selected=u;mode=null;hints=[...legalMoves(s,u.id),...legalAttacks(s,u.id)];
 }else{selected=null;mode=null;hints=[];}
 render();
}
function afterAction(){render();if(s.actions<=0&&s.phase==="battle")nextTurn();}
function nextTurn(){
 if(busy||s.phase!=="battle"||s.turn!=="blue")return;
 selected=null;mode=null;hints=[];
 const match=s;endTurn(match);busy=true;render();
 cpuTimer=setTimeout(()=>{
   cpuTimer=null;
   if(s!==match)return;
   runCpuTurn(match);busy=false;render();
 },550);
}
function terrainStyle(realm,x,y) {
 const v=(x*13+y*7)%7;
 if(realm==="farm")return {background:v===0?"#a9a15a":v===1?"#b3a56b":"#718c4e"};
 if(realm==="ice")return {background:v===0?"#d6ecf5":v===1?"#9ac9d8":"#a7dbe8"};
 if(realm==="beach")return {background:v===0?"#3e9caa":v===1?"#e1c58b":"#d3b779"};
 return {background:v===0?"#899080":v===1?"#75816b":"#677967"};
}
function renderKingdomDeck() {
 const setup=s.phase==="setup";
 $("kingdomSection").hidden=!setup;
 if(!setup)return;
 $("kingdomInstructions").textContent=chosenRealm
   ?REALMS[chosenRealm].title+" selected. Tap a highlighted square in the bottom four rows to place your Commander. You can switch cards before placing."
   :"Choose ONE of the four Commander cards below. Your kingdom controls your environment and creates a building you must protect.";
 const list=$("kingdoms");list.replaceChildren();
 for(const [key,realm] of Object.entries(REALMS)){
   const card=document.createElement("button");
   card.type="button";
   card.className="kingdom-card "+key+(key===chosenRealm?" active":"");
   card.setAttribute("aria-pressed",String(key===chosenRealm));
   card.setAttribute("aria-label",realm.title+", "+realm.name+", creates "+realm.building);
   const top=document.createElement("span");top.className="kingdom-card-label";top.textContent="KINGDOM COMMANDER";
   const scene=document.createElement("span");scene.className="kingdom-scene";scene.textContent=realmArt[key].scene;
   const portrait=document.createElement("span");portrait.className="commander-portrait";portrait.textContent=realm.icon;
   const title=document.createElement("strong");title.textContent=realm.title;
   const sub=document.createElement("span");sub.className="kingdom-subtitle";sub.textContent=realm.name;
   const landscape=document.createElement("span");landscape.className="kingdom-detail";landscape.textContent=realmArt[key].detail;
   const building=document.createElement("span");building.className="kingdom-building";building.textContent=realm.buildingIcon+" Creates: "+realm.building;
   const footer=document.createElement("span");footer.className="choose-label";footer.textContent=key===chosenRealm?"✓ Selected · Place Commander":"Choose Commander";
   card.append(top,scene,portrait,title,sub,landscape,building,footer);
   card.onclick=()=>chooseKingdom(key);list.append(card);
 }
}
function render() {
 const setup=s.phase==="setup";
 const playing=s.phase==="battle",ready=Boolean(chosenRealm);
 $("layout").hidden=!ready;
 $("status").textContent=!ready
   ?"Select your first deck: four Kingdom Commanders."
   :setup?"Place your "+REALMS[chosenRealm].title+" on the board to start the match."
   :s.phase==="ended"?(s.winner==="blue"?"Victory! You defeated the Crimson Commander!":"Defeat! Your Commander has fallen.")
   :s.turn==="blue"?"Your turn · "+s.actions+" actions remaining":"Crimson Empire is thinking...";
 $("kingdomStage").className="deck-step "+(playing||s.phase==="ended"?"complete":"current");
 $("kingdomStage").querySelector("small").textContent=playing||s.phase==="ended"?"Commander deployed":ready?"Place your Commander":"Choose your Commander";
 $("warriorStage").className="deck-step "+(playing||s.phase==="ended"?"current":"locked");
 $("warriorStage").querySelector("small").textContent=playing||s.phase==="ended"?"Deploy and battle":"Unlocks after placement";
 renderKingdomDeck();
 if(!ready)return;
 $("enemy").textContent="🔴 "+REALMS[s.kingdom.red].name+" | Round "+s.round;
 $("resources").textContent="🪙 "+s.gold.blue+" gold | ⚡ "+s.energy.blue+"/100";
 $("help").textContent=setup?"Choose a highlighted home square. Your "+REALMS[chosenRealm].building+" will appear beside your Commander."
   :mode==="power"?"Tap a highlighted enemy to unleash a special attack."
   :mode&&CARDS[mode]?"Select a highlighted square to deploy "+CARDS[mode].name+"."
   :selected?"Tap a highlighted move square or enemy.":"Select a warrior on the board, or play a card from Deck 02.";
 const board=$("board");board.replaceChildren();
 const highlight=new Set(hints.map(p=>p.x+","+p.y));
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
   const cell=document.createElement("button"),realm=terrainAt(s,x,y);
   cell.type="button";Object.assign(cell.style,terrainStyle(realm,x,y));
   cell.setAttribute("aria-label",String.fromCharCode(65+x)+(16-y));
   if(highlight.has(x+","+y))cell.classList.add("hint");
   if(setup&&y>=12)cell.classList.add("home");
   const u=unitAt(s,x,y),b=buildingAt(s,x,y);
   if(u){
     const span=document.createElement("span");span.className="sprite "+u.side;
     span.textContent=u.type==="commander"?REALMS[s.kingdom[u.side]].icon:icon[u.type];cell.append(span);
     const hp=document.createElement("span");hp.className="hp";hp.textContent=u.hp+"/"+u.maxHp;cell.append(hp);
   }else if(b){
     const span=document.createElement("span");span.className="structure";span.textContent=REALMS[s.kingdom[b.side]].buildingIcon;cell.append(span);
     const hp=document.createElement("span");hp.className="hp";hp.textContent=b.hp+"/"+b.maxHp+" Lv"+b.level;cell.append(hp);
   }
   if(selected&&selected.x===x&&selected.y===y)cell.classList.add("selected");
   cell.onclick=()=>pick(x,y);board.append(cell);
 }
 $("deckTitle").textContent="Warrior Deck";
 $("deckSubtitle").textContent=setup?"🔒 Finish placing your Commander to unlock warrior cards.":"Deploy fighters, rangers, riders, guardians and archmages.";
 const cards=$("cards");cards.replaceChildren();
 if(setup){
   const locked=document.createElement("div");locked.className="locked-message";
   locked.textContent="🔒 Deck 02 is locked until both players have placed their Commanders.";
   cards.append(locked);
 }else{
   for(const [key,c] of Object.entries(CARDS)){
     const b=document.createElement("button");b.type="button";
     b.className="card"+(mode===key?" active":"");
     b.disabled=!playing||s.turn!=="blue"||busy||legalDeploy(s,"blue",key).length===0;
     b.innerHTML='<strong>'+c.name+'</strong><span class="portrait">'+c.icon+'</span><small>🪙 '+c.cost+' · Tier '+c.tier+'</small><small>♥ '+c.hp+' · ⚔ '+c.attack+'</small>';
     b.onclick=()=>selectCard(key);cards.append(b);
   }
 }
 const base=getBuilding(s,"blue"),cost=base?5+2*(base.level-1):0;
 $("upgrade").textContent="⬆ Upgrade building ("+cost+" gold)";
 $("upgrade").disabled=!playing||s.turn!=="blue"||busy||!base||base.hp<=0||base.level>=3||s.gold.blue<cost;
 $("rebuild").disabled=!playing||s.turn!=="blue"||busy||!base||base.hp>0||s.gold.blue<4;
 $("power").disabled=!playing||!selected||s.energy.blue<100||s.turn!=="blue"||busy;
 $("end").disabled=!playing||s.turn!=="blue"||busy;
 $("log").replaceChildren(...s.log.map(line=>{const p=document.createElement("div");p.textContent=line;return p;}));
}
$("restart").onclick=reset;
$("upgrade").onclick=()=>{const r=perform(s,{kind:"upgrade",side:"blue"});if(r.ok)afterAction();};
$("rebuild").onclick=()=>{const r=perform(s,{kind:"rebuild",side:"blue"});if(r.ok)afterAction();};
$("power").onclick=()=>{if(!selected)return;mode="power";hints=legalAttacks(s,selected.id,true);render();};
$("end").onclick=nextTurn;
render();
