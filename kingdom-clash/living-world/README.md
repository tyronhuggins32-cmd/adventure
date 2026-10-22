# Living tabletop rules

The root game now runs this persistent tabletop route, including a 3D renderer,
camera controls, card placement, miniature inspection and creature orders.
`episode-table.html` retains the previous turn-and-lane game.

`catalog.js` holds card definitions and building recruitment lists.
`card-actions.js` exposes one validated entry point, `playCard`, and separate
creature, building, terrain and spell effect functions. Each spell has its own
function. UI code should call `playCard`, rather than bypassing validation with
an effect function.
`simulation.js` owns the continuous world, creature decisions, orders, projectiles,
building work, hunger, morale, shelter, knowledge and resource regeneration.
`terrain.js` owns the 144 × 144 world, terrain painting and spatial pathfinding.

```js
import { LivingWorld } from './simulation.js';
import { playCard } from './card-actions.js';

const world = new LivingWorld(); // Paused for planning.
const result = playCard(world, 'pig', -24, 24, { handIndex: 2 });
if (!result.ok) console.log(result.reason);
world.paused = false;
world.step(0.05); // Call with elapsed seconds from the browser animation loop.
```

Coordinates are world units, not card lanes. Summons start in their owner's half;
movement and fighting can cross the whole world. Card placements and continuous
world updates share the same entity state. Pausing freezes simulation time.

To add a card, define its cost, type and stats in the catalogue. Terrain cards use
the common terrain painter; new spell effects get a named function and an entry
in the spell dispatch table. Creature decisions belong in the simulation rather
than in card placement functions.

Run `node --test tests/living-world.test.js` from the repository root.

`scenario.js` sets up a playable two-kingdom opening. `world-geometry.js` builds
the continuous terrain, physical crops and fire. `view.js` animates the existing
miniatures from simulation state and provides a labeled map fallback when WebGL2
is unavailable. `app.js` connects the rules to the hand, orders and simulation HUD.
