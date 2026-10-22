import { LivingWorld } from './simulation.js?v=farmer3d9';

// A playable opening, with both kingdoms already occupying the same world.
export function createTabletop(seed = 42) {
  const world = new LivingWorld({ seed });
  world.spawn('farm', 0, -72, 86);
  world.spawn('barn', 0, 62, 86);
  world.terrain.paint(-72, 86, 'corn', 24, 0);
  world.spawn('pig', 0, -34, 40);
  world.spawn('sheep', 0, 58, 75);
  world.spawn('sheep', 0, 65, 76);
  world.spawn('cow', 0, 77, 70);
  world.spawn('bull', 0, 52, 52);
  world.spawn('dog', 0, -72, 43);
  world.spawn('guard', 0, -46, 20);
  world.spawn('scarecrow', 0, -85, 72);
  world.spawn('crow', 1, -105, 48);
  world.spawn('crow', 1, -116, 61);
  world.spawn('iceDen', 1, -99, -87);
  for(const [x,z] of [[-84,-76],[-91,-70],[-78,-68]])world.spawn('wolf',1,x,z);
  world.hand = ['cotton', 'cornmaze', 'pig', 'corn', 'mud', 'rain', 'school', 'tower'];
  world.history = [];
  world.note('Two kingdoms share one table. Inspect a miniature, reshape the ground, or run the world.');
  return world;
}
