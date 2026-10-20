import {SIZE,REALMS,CARDS,createMatch,placeCommander,perform,endTurn,runCpuTurn,unitAt,buildingAt,getBuilding,getCommander,legalDeploy,legalMoves,legalAttacks,terrainAt} from "./engine.js";
const $=id=>document.getElementById(id);
let s=createMatch(),selected=null,mode=null,hints=[],busy=false;
const icon={commander:"👑",...Object.fromEntries(Object.entries(CARDS).map(([k,v])=>[k,v.icon]))};
function chooseKingdom(k){s=createMatch(k);selected=null;mode=null;hints=[];render();}
function selectCard(k){if(s.phase!=="battle"||s.turn!=="blue")return;selected=null;mode=k;hints=legalDeploy(s,"blue",k);render();}
function pick(x,y){
 if(busy||s.phase==="ended")return;
 if(s.phase==="setup"){if(placeCommander(s,"blue",x,y)){const ex=2+Math.floor(Math.random()*12);placeCommander(s,"red",ex,1);}render();return;}
 if(s.turn!=="blue")return;
 if(mode&&CARDS[mode]){const r=perform(s,{kind:"deploy",side:"blue",card:mode,x,y});if(r.ok){mode=null;hints=[];selected=null;afterAction();}else render();return;}
 if(selected){const action=mode==="power"?"power":hints.some(p=>p.x===x&&p.y===y)?(unitAt(s,x,y)||buildingAt(s,x,y)?"attack":"move"):null;
  if(action){const r=perform(s,{kind:action,side:"blue",id:selected.id,x,y});if(r.ok){selected=null;mode=null;hints=[];afterAction();return;}}
 }
 const u=unitAt(s,x,y);if(u&&u.side==="blue"&&!u.acted){selected=u;mode=null;hints=[...legalMoves(s,u.id),...legalAttacks(s,u.id)];}else{selected=null;mode=null;hints=[];}render();
}
function afterAction(){render();if(s.actions<=0&&s.phase==="battle")nextTurn();}
function nextTurn(){if(busy||s.phase!=="battle")return;selected=null;mode=null;hints=[];endTurn(s);busy=true;render();setTimeout(()=>{runCpuTurn(s);busy=false;render();},550);}
function terrainStyle(realm,x,y){
 const variant=(x*13+y*7)%7;
 if(realm==="farm")return {background:variant===0?"#a9a15a":variant===1?"#b3a56b":"#718c4e"};
 if(realm==="ice")return {background:variant===0?"#d6ecf5":variant===1?"#9ac9d8":"#a7dbe8"};
 if(realm==="beach")return {background:variant===0?"#3e9caa":variant===1?"#e1c58b":"#d3b779"};
 return {background:variant===0?"#899080":variant===1?"#75816b":"#677967"};
}
function render(){
 $('status').textContent=s.phase==="setup"?"Place your Commander on any square in the bottom four rows. The AI places its own Commander and building.":s.phase==="ended"?(s.winner==="blue"?"Victory!":"Defeat!"):s.turn==="blue"?"Your turn: "+s.actions+" actions remaining":"Crimson Empire is thinking...";
 $('kingdoms').innerHTML="";
 for(const [key,r] of Object.entries(REALMS)){const b=document.createElement("button");b.textContent=r.icon+" "+r.name;b.className=s.kingdom.blue===key?"active":"";b.disabled=s.phase!=="setup";b.onclick=()=>chooseKingdom(key);$('kingdoms').append(b);}
 $('enemy').textContent="🔴 "+REALMS[s.kingdom.red].name+" | Round "+s.round;
 $('resources').textContent="🪙 "+s.gold.blue+" gold | ⚡ "+s.energy.blue+"/100";
 $('help').textContent=s.phase==="setup"?"Pick a home square to found your kingdom.":mode==="power"?"Select a highlighted enemy for your ultimate.":mode&&CARDS[mode]?"Select a highlighted square to deploy your card.":selected?"Choose a highlighted destination or enemy.":"Select a warrior, or play a card from your deck.";
 const board=$('board');board.replaceChildren();const highlight=new Set(hints.map(p=>p.x+","+p.y));
 for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
  const cell=document.createElement("button"),realm=terrainAt(s,x,y);Object.assign(cell.style,terrainStyle(realm,x,y));
  cell.setAttribute("aria-label",String.fromCharCode(65+x)+(16-y));
  if(highlight.has(x+","+y))cell.classList.add("hint");
  const u=unitAt(s,x,y),b=buildingAt(s,x,y);
  if(u){const span=document.createElement("span");span.className="sprite "+u.side;span.textContent=u.type==="commander"?REALMS[s.kingdom[u.side]].icon:icon[u.type];cell.append(span);const hp=document.createElement("span");hp.className="hp";hp.textContent=u.hp+"/"+u.maxHp;cell.append(hp);}
  else if(b){const span=document.createElement("span");span.className="structure";span.textContent=REALMS[s.kingdom[b.side]].buildingIcon;cell.append(span);const hp=document.createElement("span");hp.className="hp";hp.textContent=b.hp+"/"+b.maxHp+" Lv"+b.level;cell.append(hp);}
  if(selected&&selected.x===x&&selected.y===y)cell.classList.add("selected");
  cell.onclick=()=>pick(x,y);board.append(cell);
 }
 const cards=$('cards');cards.replaceChildren();
 for(const [key,c] of Object.entries(CARDS)){
  const b=document.createElement("button");b.className="card"+(mode===key?" active":"");b.disabled=s.phase!=="battle"||s.turn!=="blue"||legalDeploy(s,"blue",key).length===0;
  b.innerHTML='<strong>'+c.name+'</strong><span class="portrait">'+c.icon+'</span><small>🪙 '+c.cost+' · Tier '+c.tier+'</small><small>♥ '+c.hp+' · ⚔ '+c.attack+'</small>';
  b.onclick=()=>selectCard(key);cards.append(b);
 }
 const base=getBuilding(s,"blue"),cost=base?5+2*(base.level-1):0;
 $('upgrade').textContent="⬆ Upgrade building ("+cost+" gold)";
 $('upgrade').disabled=s.phase!=="battle"||s.turn!=="blue"||!base||base.hp<=0||base.level>=3||s.gold.blue<cost;
 $('rebuild').disabled=s.phase!=="battle"||s.turn!=="blue"||!base||base.hp>0||s.gold.blue<4;
 $('power').disabled=!selected||s.energy.blue<100||s.turn!=="blue";
 $('end').disabled=s.phase!=="battle"||s.turn!=="blue"||busy;
 $('log').replaceChildren(...s.log.map(line=>{const p=document.createElement("div");p.textContent=line;return p;}));
}
$('restart').onclick=()=>chooseKingdom(s.kingdom.blue);
$('upgrade').onclick=()=>{const r=perform(s,{kind:"upgrade",side:"blue"});if(r.ok)afterAction();};
$('rebuild').onclick=()=>{const r=perform(s,{kind:"rebuild",side:"blue"});if(r.ok)afterAction();};
$('power').onclick=()=>{if(!selected)return;mode="power";hints=legalAttacks(s,selected.id,true);render();};
$('end').onclick=nextTurn;
render();