import { LivingWorld } from './simulation.js?v=world8a';

// A playable opening, with both kingdoms already occupying the same world.
export function createTabletop(seed = 42) {
  const world = new LivingWorld({ seed });
  world.spawn('farm', 0, -36, 43);
  world.spawn('barn', 0, 31, 43);
  world.terrain.paint(-36, 43, 'corn', 16, 0);
  world.spawn('pig', 0, -17, 20);
  world.spawn('sheep', 0, 28, 29);
  world.spawn('sheep', 0, 34, 27);
  world.spawn('cow', 0, 39, 31);
  world.spawn('bull', 0, 26, 20);
  world.spawn('dog', 0, -36, 18);
  world.spawn('guard', 0, -23, 10);
  world.hand = ['pig', 'corn', 'mud', 'rain', 'school', 'tower'];
  world.history = [];
  world.note('Two kingdoms share one table. Inspect a miniature, reshape the ground, or run the world.');
  return world;
}
