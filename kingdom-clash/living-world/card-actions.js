import { CARDS, card } from './catalog.js?v=world8a';
import { distance } from './terrain.js?v=world8a';

export function cardLock(world, id, side = 0) {
  const definition = CARDS[id];
  if (!definition) return 'Unknown card';
  if (definition.requires && !world.entities.some(entity =>
    entity.side === side && entity.card.id === definition.requires && entity.hp > 0
  )) return 'Build a ' + CARDS[definition.requires].name + ' first';
  if (definition.requiresKnowledge && !world.knowledge[side].has(definition.requiresKnowledge)) {
    return 'A scholar must learn this spell';
  }
  if (id === 'revive' && !world.graveyard.some(entity =>
    entity.side === side && entity.card.type === 'creature'
  )) return 'No fallen creature to revive';
  return null;
}

export function playCreatureCard(world, definition, point, side) {
  return world.spawn(definition.id, side, point.x, point.z);
}

export function playBuildingCard(world, definition, point, side) {
  return world.spawn(definition.id, side, point.x, point.z);
}

export function playTerrainCard(world, definition, point, side) {
  world.terrain.paint(point.x, point.z, definition.id, definition.radius, side);
  world.note(definition.name + ' reshapes the ground.');
  return { terrain: true };
}

export function castFire(world, definition, point) {
  world.terrain.paint(point.x, point.z, 'fire', definition.radius);
  return { spell: true };
}

export function castRain(world, definition, point) {
  for (const cell of world.terrain.cells) {
    if (distance(cell, point) > definition.radius) continue;
    cell.fire = 0;
    if (cell.kind === 'ash') cell.kind = 'meadow';
    if (cell.kind === 'corn' || cell.kind === 'meadow') cell.food = Math.min(4, cell.food + 2);
  }
  world.terrain.version++;
  return { spell: true };
}

export function castReclaim(world, definition, point, side) {
  world.terrain.paint(point.x, point.z, side ? 'corn' : 'meadow', definition.radius, side);
  for (const entity of world.entities) {
    if (distance(entity, point) <= definition.radius && entity.card.behavior === 'pig') {
      entity.trapped = false;
      entity.path = [];
      entity.pathAt = 0;
    }
  }
  return { spell: true };
}

export function castRevive(world, definition, point, side) {
  const index = world.graveyard.findLastIndex(entity =>
    entity.side === side && entity.card.type === 'creature'
  );
  if (index < 0) return null;
  const fallen = world.graveyard.splice(index, 1)[0];
  const entity = world.spawn(fallen.card.id, side, point.x, point.z);
  entity.hp = Math.ceil(entity.maxHp / 2);
  entity.hunger = fallen.hunger;
  entity.morale = 50;
  return entity;
}

const spells = { fire: castFire, rain: castRain, reclaim: castReclaim, revive: castRevive };
export function playSpellCard(world, definition, point, side) {
  const result = spells[definition.id]?.(world, definition, point, side);
  if (result) world.note(definition.name + ' resolves in the world.');
  return result;
}

const executors = {
  creature: playCreatureCard,
  building: playBuildingCard,
  terrain: playTerrainCard,
  spell: playSpellCard
};

// The public entry point validates everything before an effect or payment occurs.
export function playCard(world, id, x, z, { side = 0, handIndex = null } = {}) {
  const reject = reason => ({ ok: false, reason });
  if (side !== 0 && side !== 1) return reject('Unknown kingdom');
  if (!Number.isFinite(x) || !Number.isFinite(z)) return reject('Choose a valid point on the tabletop');
  if (handIndex !== null && (
    !Number.isInteger(handIndex) || handIndex < 0 || world.hand[handIndex] !== id || side !== 0
  )) return reject('Choose this card from your hand');
  const definition = CARDS[id];
  const locked = cardLock(world, id, side);
  if (locked) return reject(locked);
  if (world.ended) return reject('The battle has ended');
  if (world.energy[side] < definition.cost) return reject('Not enough energy');
  if (Math.abs(x) > 67 || Math.abs(z) > 67) return reject('Choose ground inside the tabletop');

  const point = { x, z };
  const summons = definition.type === 'creature' || definition.type === 'building' || id === 'revive';
  if (summons) {
    if ((side === 0 && z < 2) || (side === 1 && z > -2)) return reject('Summon inside your own kingdom');
    if (!world.terrain.walkable(x, z, world.structures)) return reject('Choose open, dry ground');
    if (definition.type === 'building' && world.structures.some(building =>
      distance(building, point) < building.radius + (definition.radius || 3) + 2
    )) return reject('Leave room around nearby buildings');
    if ((definition.type === 'creature' || id === 'revive') && world.entities.filter(entity =>
      entity.side === side && entity.card.type === 'creature' && entity.hp > 0
    ).length >= 24) return reject('Your kingdom supports 24 creatures');
  }

  const result = executors[definition.type](world, card(id), point, side);
  if (!result) return reject('This card has no valid target');
  world.energy[side] -= definition.cost;
  if (handIndex !== null) {
    world.hand.splice(handIndex, 1);
    world.discard.push(id);
    world.draw();
  }
  world.note(definition.name + ' enters the tabletop.');
  world.version++;
  return { ok: true, entity: result };
}
