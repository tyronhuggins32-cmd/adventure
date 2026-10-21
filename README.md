# Kingdom Clash — Living landscape cards

The browser game now plays across **four opposing card lanes** on a **72 × 72 meter 3D tabletop**. Raised landscape cards replace the crowded RTS map. Creatures stand on front slots, buildings on back slots, and each landscape has a distinct terrain border and visible food pips. Detailed miniatures are larger, and the default camera fits the board on mobile without jumping into a follow camera. Orbit, pinch/zoom, 16× close inspection, and expanded view remain available; advanced camera controls live below the scene.

Build → recruit → cast or Floop → **End turn**. Each ready creature attacks its opposing lane once. Opposing creatures exchange damage simultaneously; a building intercepts attacks when its creature slot is empty, and an open lane takes commander damage. The four lanes resolve in order with a short battle animation, then AP and cards refresh. Floop uses the unit’s existing power instead of its attack. Frozen units miss an exchange. Pausing stops resolution. Creatures remain anchored to their own cards between turns.

Buildings retain their exclusive recruitment rosters. Farmer branches: Farm grows food, repairs its landscape and recruits crop creatures; Barn recruits pigs, sheep, cows and bulls; Windmill recruits harvest warriors; Henhouse recruits birds. Two surviving turns unlock a veteran spell requiring its living caster and school. Pigs automatically eat opposing food creatures without AP; non-food enemies make them flee. Sheep graze, cows heal livestock in neighboring lanes, and bulls charge. Buildings can be rebuilt after destruction.

[Play the game](https://tyronhuggins32-cmd.github.io/adventure/).

## Development

`npm start` serves the game at http://localhost:8000. `npm test` checks card effects, all commander pairings, models, camera math, recruitment, livestock, progression, and the new tabletop resolution. `tabletop-battle.js` owns live card-lane combat; `tabletop-layout.js` owns physical slots and camera fitting; `tabletop-scene.js` owns the raised landscape geometry. The earlier continuous simulation remains available in `battle-simulation.js` for compatibility; the website no longer launches it.

Three.js is bundled locally under `kingdom-clash/vendor` with its MIT license. WebGL 2 is required for the 3D scene; accessible lane controls remain available if it cannot initialize. Existing terrain shaders, detailed miniature anatomy, and card portraits share the same local models. Reduced motion suppresses cosmetic movement.
