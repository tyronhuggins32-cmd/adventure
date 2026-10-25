import {BIOMES,createWorld,stepWorld} from './world.js';
import {createTable} from './table.js';
const $=id=>document.getElementById(id);
let world=createWorld(),lane=null,last=performance.now(),uiElapsed=0,eventText='';
const table=createTable($('battlefield'));
function focus(index){lane=index;table.focusLane(index);$('viewName').textContent=`LANE ${index+1} · ${BIOMES[index].name.toUpperCase()}`;$('overview').hidden=false;for(const button of document.querySelectorAll('[data-lane]'))button.setAttribute('aria-pressed',String(+button.dataset.lane===index));}
table.setOnLaneSelect(focus);
function overview(){lane=null;table.overview();$('viewName').textContent='THE FOUR FIELDS';$('overview').hidden=true;for(const button of document.querySelectorAll('[data-lane]'))button.setAttribute('aria-pressed','false');}
function update(){for(const side of[0,1]){$(`hp${side}`).textContent=Math.ceil(world.health[side]);$(`bar${side}`).style.width=`${Math.max(0,world.health[side]/25*100)}%`;} $('round').textContent=`WAVE ${world.round}`;$('time').textContent=`${String(Math.floor(world.seconds/60)).padStart(2,'0')}:${String(Math.floor(world.seconds%60)).padStart(2,'0')}`;$('state').textContent=world.winner!==null?`${world.winner?'JAKE':'FARMER'} WINS`:world.paused?'PAUSED':'LIVE BATTLE';$('pause').textContent=world.paused?'▶':'Ⅱ';$('speed').textContent=`${world.speed}×`;const entry=world.events[0]?.text;if(entry&&entry!==eventText){eventText=entry;$('event').textContent=entry;}}
function tick(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;stepWorld(world,dt);table.render(world,dt);uiElapsed+=dt;if(uiElapsed>.18){uiElapsed=0;update();}requestAnimationFrame(tick);}
for(const button of document.querySelectorAll('[data-lane]'))button.addEventListener('click',()=>focus(+button.dataset.lane));
$('overview').addEventListener('click',overview);for(const button of document.querySelectorAll('[data-cam]'))button.addEventListener('click',()=>table.control(button.dataset.cam));
$('pause').addEventListener('click',()=>{world.paused=!world.paused;update();});$('speed').addEventListener('click',()=>{world.speed=world.speed===1?2:world.speed===2?3:1;update();});$('restart').addEventListener('click',()=>{world=createWorld(Math.floor(Math.random()*1000000));eventText='';overview();update();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lane!==null)overview();});
update();requestAnimationFrame(tick);
