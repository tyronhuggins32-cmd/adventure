import { createTabletop } from './scenario.js?v=farmer3d9';
import { WorldView } from './view.js?v=farmer3d9';
import { CARDS, RECRUITS } from './catalog.js?v=world9';
import { playCard, cardLock } from './card-actions.js?v=world9';

const $ = id => document.getElementById(id);
let world, view, selectedId = null, cardIndex = null, order = null, last = 0, lastUI = 0, handKey = '', rosterKey = '', seed = 42;
const message = text => { $('status').textContent = text; };
const chosen = () => world.entities.find(entity => entity.id === selectedId);
function select(entity) {
  selectedId = entity?.id || null; view.selectedId = selectedId;
  cardIndex = null; order = null; handKey = ''; render(true);
}
function place(point, entity) {
  if (cardIndex !== null) {
    const id = world.hand[cardIndex], result = playCard(world, id, point.x, point.z, { handIndex: cardIndex });
    if (!result.ok) { message(result.reason); return; }
    cardIndex = null; handKey = ''; message(CARDS[id].name + ' played.');
    if (result.entity.id) select(result.entity);
    render(true); return;
  }
  if (order) {
    const result = world.command(selectedId, order, point);
    message(result.ok ? order === 'move' ? 'Moving to the chosen ground. Auto restores independent decisions.' : 'Eruption ordered.' : result.reason);
    if (result.ok) order = null;
    render(true); return;
  }
  select(entity);
  if (entity) message(entity.card.name + ' · ' + (entity.side ? 'rival kingdom' : 'your kingdom'));
}
function renderHand() {
  const key = JSON.stringify([world.hand, cardIndex, Math.floor(world.energy[0]), world.structures.map(e => e.id), [...world.knowledge[0]], world.graveyard.length, world.ended]);
  if (key === handKey) return; handKey = key;
  $('hand').replaceChildren();
  world.hand.forEach((id, index) => {
    const definition = CARDS[id], button = document.createElement('button'), locked = cardLock(world, id);
    button.className = 'hand-card'; button.dataset.card = id; button.setAttribute('aria-pressed', String(cardIndex === index));
    button.disabled = world.ended || !!locked || world.energy[0] < definition.cost;
    button.innerHTML = `<span class="card-type">${definition.type}<b>${definition.cost}</b></span><strong>${definition.name}</strong><span>${definition.text}</span>${locked ? `<em>${locked}</em>` : ''}`;
    button.onclick = () => {
      cardIndex = cardIndex === index ? null : index; order = null;
      message(cardIndex === null ? 'Card selection cleared.' : definition.name + ': tap the ground to play.'); render(true);
    };
    $('hand').append(button);
  });
}
function actionButton(label, kind) {
  const button = document.createElement('button'); button.textContent = label; button.dataset.order = kind;
  button.disabled = world.ended;
  button.onclick = () => {
    if (kind === 'move' || kind === 'floop' && chosen()?.card.id === 'volcano') {
      order = kind; cardIndex = null; handKey = ''; message('Tap the ground to choose a destination.'); render(true); return;
    }
    const result = world.command(selectedId, kind);
    message(result.ok ? label + ' ordered.' : result.reason); render(true);
  };
  return button;
}
function renderSelection(rebuild = false) {
  const entity = chosen();
  if (!entity) { $('selectedName').textContent = 'A world in motion.'; $('selectedDescription').textContent = 'Select a miniature to inspect its decisions, needs, and orders.'; $('selectedStats').replaceChildren(); $('orders').replaceChildren(); $('recruits').replaceChildren(); return; }
  $('selectedName').textContent = entity.card.name;
  $('selectedDescription').textContent = entity.card.text || 'Your commander holds the kingdom. Protect them to keep the world alive.';
  $('selectedStats').innerHTML = `<div class="state-line"><span>${entity.side ? 'Rival' : 'Friendly'}</span><strong>${entity.hp <= 0 ? 'fallen' : entity.state}</strong></div><label>Health <b>${Math.ceil(entity.hp)} / ${entity.maxHp}</b><meter min="0" max="${entity.maxHp}" value="${entity.hp}"></meter></label>${entity.card.type !== 'building' ? `<label>Hunger <b>${Math.round(entity.hunger)} / 100</b><meter min="0" max="100" value="${entity.hunger}"></meter></label><label>Morale <b>${Math.round(entity.morale)} / 100</b><meter min="0" max="100" value="${entity.morale}"></meter></label>` : ''}${entity.inside ? '<p>Protected inside a building.</p>' : ''}`;
  if (!rebuild) return;
  $('orders').replaceChildren(); $('recruits').replaceChildren();
  if (entity.side || entity.hp <= 0) return;
  if(entity.card.id==='farmer'&&entity.card.type==='commander'){
    for(const [label,kind] of [['Move Farmer','move'],['Hold position','hold'],['Auto-tend fields','auto']])$('orders').append(actionButton(label,kind));
  }
  if (entity.card.type === 'creature') {
    for (const [label, kind] of [['Move / hold', 'move'], ['Auto', 'auto'], ['Seek shelter', 'rest'], ['Study', 'study']]) $('orders').append(actionButton(label, kind));
    if (entity.card.behavior === 'pig') $('orders').append(actionButton('Brave raid · 15 sec', 'raid'));
  }
  if (['spirit', 'volcano'].includes(entity.card.id)) $('orders').append(actionButton('Floop building', 'floop'));
  const recruits = RECRUITS[entity.card.id] || [];
  if (recruits.length) {
    const title = document.createElement('h3'); title.textContent = 'Prepare a recruit card'; $('recruits').append(title);
    for (const id of recruits) {
      const button = document.createElement('button'); button.textContent = `${CARDS[id].name} · ${CARDS[id].cost} energy`;
      button.onclick = () => { const ok = world.prepareCard(id, entity.id); message(ok ? CARDS[id].name + ' added to your hand. Select its card to summon.' : 'Your hand is full, or this building has fallen.'); render(true); };
      $('recruits').append(button);
    }
  }
}
function render(rebuild = false) {
  const seconds = Math.floor(world.time);
  $('worldTime').textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  $('weather').textContent = world.weather === 'rain' ? 'Rain · fire extinguishes' : world.paused ? 'Paused · plan your move' : 'Clear skies';
  $('ownHealth').textContent = Math.ceil(world.entities[0].hp); $('enemyHealth').textContent = Math.ceil(world.entities[1].hp);
  $('focusFarmer').textContent = view?.followFarmer ? 'Stop following Farmer' : 'Watch Farmer in 3D';
  $('focusFarmer').setAttribute('aria-pressed',String(!!view?.followFarmer));
  $('run').textContent = world.ended ? (world.winner === 0 ? 'Your kingdom wins' : 'Your Farmer has fallen') : world.paused ? 'Run world' : 'Pause world';
  $('run').disabled = world.ended; $('run').setAttribute('aria-pressed', String(!world.paused));
  $('speed').textContent = world.speed + '× speed'; $('energy').textContent = world.energy[0].toFixed(1) + ' / 10 energy';
  $('cancel').hidden = cardIndex === null && !order;
  const creatures = world.entities.filter(e => e.hp > 0 && e.card.type === 'creature');
  $('population').textContent = creatures.filter(e => !e.side).length + ' friendly creatures · ' + creatures.filter(e => e.side).length + ' rival';
  $('fireCount').textContent = world.terrain.cells.filter(cell => cell.fire).length + ' burning patches';
  renderHand(); renderSelection(rebuild);
  const key = world.entities.filter(e => e.hp > 0).map(e => e.id + e.side).join();
  if (key !== rosterKey) {
    rosterKey = key; $('roster').replaceChildren();
    for (const entity of world.entities.filter(e => e.hp > 0)) { const button = document.createElement('button'); button.textContent = (entity.side ? 'Rival · ' : 'Your · ') + entity.card.name; button.dataset.entity = entity.id; button.onclick = () => select(entity); $('roster').append(button); }
  }
  $('journal').replaceChildren(...world.history.slice(0, 12).map(event => { const item = document.createElement('li'); item.textContent = Math.floor(event.time) + 's · ' + event.text; return item; }));
}
function start() {
  view?.destroy();
  const oldCanvas = $('livingField'), canvas = oldCanvas.cloneNode(false); oldCanvas.replaceWith(canvas);
  selectedId = null; cardIndex = null; order = null; handKey = ''; rosterKey = '';
  world = createTabletop(seed); view = new WorldView(canvas, world, place);
  $('graphics').textContent = view.renderer ? 'Animated 3D tabletop · 288 × 288' : 'Map graphics · WebGL2 unavailable';
  $('selectedName').textContent = 'A world in motion.';
  $('selectedDescription').textContent = 'The Farmer tends crops; crows raid them, scarecrows repel crows, sheep empower the barn, and wolves hunt in packs. Select a miniature to inspect its needs and orders.';
  message('Paused for planning. Run the world to watch both kingdoms act.'); render(true);
}
$('run').onclick = () => { world.paused = !world.paused; message(world.paused ? 'World paused. Plan, place cards, or issue orders.' : 'World running. You can still place cards or pause to plan.'); render(true); };
$('focusFarmer').onclick=()=>{
  if(view.followFarmer){view.followFarmer=false;view.target.set(0,0,0);view.zoom=1.12;view.controls.sync();message('Showing the full living table.');render(true);return;}
  const farmer=view.focusFarmer();if(!farmer){message('The Farmer is not on the table.');return;}
  select(farmer);message('Farmer in 3D: move, tend crops, swing the carrot staff and react to attacks. Run world to watch the animation.');render(true);
};
$('speed').onclick = () => { world.speed = world.speed === 1 ? 2 : 1; render(); };
$('cancel').onclick = () => { cardIndex = null; order = null; handKey = ''; message('Selection cleared.'); render(true); };
$('restart').onclick = () => { seed++; start(); };
document.addEventListener('visibilitychange', () => { if (document.hidden) { world.paused = true; render(true); } });
start();
function frame(now) {
  const dt = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
  if (!document.hidden) {
    world.step(dt); view.draw(dt);
    if (now - lastUI > 250) { render(); lastUI = now; }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
