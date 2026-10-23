import {makeWorld,addUnit,addBuilding,cast,beginBattle,step} from '../reborn/rules.js';
import {makeBoard} from './board.js?v=field14';

const $=id=>document.getElementById(id);
const names=['CORN LANDS','BLUE PLAINS','FROZEN LAKE','USELESS SWAMP'];
const field={slots:['corn','blue','ice','swamp']};
let world,focused=null,last=performance.now(),uiClock=0,between=0,lastEvent='';
const board=makeBoard($('board'),lane=>focus(lane));
function seed(){
 world=makeWorld('farmer',Math.floor(Math.random()*1000000));
 world.commanders[0].name='Farmer';world.commanders[1].name='Jake';
 for(let i=0;i<4;i++){const l=world.lanes[i];l.terrain=field.slots[i];l.enemyTerrain=['corn','blue','ice','swamp'][i];l.crop=i===0?.9:i===3?.15:0;l.enemyCrop=i===0?.8:i===3?.2:0;l.food=i===0?4:1;l.enemyFood=i===0?3:1;l.mud=i===3?3:0;}
 addBuilding(world,0,0,'scarecrow',true);addBuilding(world,0,2,'den',true);addBuilding(world,1,3,'silo',true);
 for(const [team,lane,key]of [[0,0,'pig'],[0,1,'dog'],[0,2,'wolf'],[0,2,'wolf'],[0,3,'archer'],[1,0,'crow'],[1,1,'dog'],[1,2,'wolf'],[1,3,'archer']])addUnit(world,team,lane,key,true);
 beginBattle(world);between=0;lastEvent='';update();
}
function focus(lane){focused=lane;board.focusLane(lane);$('game').classList.add('focused');$('viewTitle').textContent=`LANE ${lane+1} · ${names[lane]}`;$('sceneInfo').textContent='A miniature battlefield with its own terrain and creatures.';for(const [i,b]of [...document.querySelectorAll('[data-lane]')].entries())b.setAttribute('aria-current',i===lane?'true':'false');}
function overview(){focused=null;board.exitLane();$('game').classList.remove('focused');$('viewTitle').textContent='FOUR LIVING LANDSCAPES';$('sceneInfo').textContent='Miniatures think, move and fight on the table.';for(const b of document.querySelectorAll('[data-lane]'))b.removeAttribute('aria-current');}
function reinforce(){
 const round=world.round;
 const own=[['sheep',0],['husker',0],['scholar',1],['wolf',2],['pig',0],['archer',3]][(round-2)%6];
 const foe=[['earlings',0],['maize',0],['reaper',1],['wolf',2],['crow',3],['husker',0]][(round-2)%6];
 for(const [team,choice]of [[0,own],[1,foe]]){const [key,lane]=choice;if(world.units.filter(u=>u.team===team&&u.lane===lane).length<3){addUnit(world,team,lane,key,true);board.summon(key,lane,team);}}
 if(round%3===0){cast(world,round%2,round%2?0:2,round%2?'maze':'cotton');}
 beginBattle(world);
}
function update(){const own=world.commanders[0],foe=world.commanders[1];$('ownHealth').textContent=Math.max(0,Math.ceil(own.hp));$('foeHealth').textContent=Math.max(0,Math.ceil(foe.hp));$('ownBar').style.width=`${Math.max(0,own.hp/own.max*100)}%`;$('foeBar').style.width=`${Math.max(0,foe.hp/foe.max*100)}%`;$('round').textContent=`ROUND ${world.round}`;$('phaseLabel').textContent=world.winner!==null?'BATTLE ENDED':world.paused?'PAUSED':world.phase==='plan'?'REINFORCEMENTS':'BATTLE LIVE';$('battleMark').textContent=world.winner!==null?'◆ MATCH COMPLETE':world.paused?'Ⅱ SIMULATION PAUSED':'● LIVE SIMULATION';$('clock').textContent=`${String(Math.floor(world.t/60)).padStart(2,'0')}:${String(Math.floor(world.t%60)).padStart(2,'0')} · ROUND ${world.round}`;$('pause').textContent=world.paused?'▶':'Ⅱ';$('speed').textContent=`${world.speed}×`;const entry=world.logs[0]?.text;if(entry&&entry!==lastEvent){lastEvent=entry;$('event').textContent=entry;}if(world.winner!==null)$('event').textContent=`${world.winner===0?'Farmer':'Jake'} wins the living table. Start a new battle to play again.`;}
function tick(now){const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(world){step(world,dt);if(world.phase==='plan'&&!world.paused&&!world.winner){between+=dt;if(between>1.4)reinforce();}else between=0;board.render(field,world,dt);uiClock+=dt;if(uiClock>.24){uiClock=0;update();}}requestAnimationFrame(tick);}
for(const b of document.querySelectorAll('[data-lane]'))b.addEventListener('click',()=>focus(Number(b.dataset.lane)));
$('allLanes').addEventListener('click',overview);
$('prevLane').addEventListener('click',()=>focus((focused+3)%4));$('nextLane').addEventListener('click',()=>focus((focused+1)%4));
for(const b of document.querySelectorAll('[data-cam]'))b.addEventListener('click',()=>board.moveCamera(b.dataset.cam));
$('pause').addEventListener('click',()=>{if(world.winner!==null)return;world.paused=!world.paused;update();});
$('speed').addEventListener('click',()=>{world.speed=world.speed===1?2:world.speed===2?3:1;update();});
$('restart').addEventListener('click',()=>{overview();seed();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&focused!==null)overview();});
seed();requestAnimationFrame(tick);
