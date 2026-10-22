# Living Cornlands

The root game is a persistent 288 × 288 world. `episode-table.html` keeps the earlier
turn based version. The active model is independent of the renderer: fixed .05 second
steps update terrain, creatures, projectiles, buildings and commanders. A pause stops
all those clocks, including births and spell durations. Every player placement goes
through `playCard` so it checks allegiance, space, ownership and energy first.

| Commander | Routine | Active order | Buildings |
| --- | --- | --- | --- |
| Farmer | Finds depleted corn by a live Farm; heals wounded livestock | Harvest Rally consumes 2 ripe crop food, heals and rallies nearby allies, adds 1 energy; 22s recovery | Farm Field, Barn, Harvest Mill, Seed Slinger, Livestock Pen, Harvest Cart |
| Scarecrow | Watches the Crow Roost and frightens crows and raiders | Dread Call lowers nearby enemy morale and sends them fleeing; 20s recovery | Crow Roost, Briar Snare, Haunted Silo |
| Corn Druid | Cultivates weakened crops and repairs creatures | Rootwake plants corn, heals allies and slows enemies; 24s recovery | Seed Shrine, Root Circle, Elder Grove |

### Production and counterplay

- Farm Field increases nearby corn food every 6 seconds. Its crop cover supports the
  Farmer and crop powered creatures; fire and pigs can consume those cells.
- Barn consumes nearby food to raise sheep, pigs and cows every 26 seconds, capped at
  six local herd creatures. A sheep born near a live Barn teaches Cotton Siege. The
  spell needs both living sheep and a Barn; its large projectile applies damage and
  slow on impact. Resting livestock regain health and morale.
- Harvest Mill consumes 2 units of nearby ripe corn and creates 2 grain, capped at
  25. Each pulse spends stored grain to feed, heal and speed allies within 28 units.
- Seed Slinger finds an enemy within 43 units, sends a physical pod every 3 seconds,
  damages a group within 7 units, then plants friendly corn at impact.
- Livestock Pen consumes food to breed a rotating pig/sheep/cow/bull roster every
  34 seconds, capped at eight. Pen born creatures gain 20% maximum health.
- Harvest Cart consumes ripe crop to launch a rolling siege cart every 40 seconds,
  with at most two active. It seeks enemy buildings, scatters slowing debris and
  damages enemies gathered at its impact point.
- Crow Roost breeds at most four crop raiders. Briar Snare slows and injures
  trespassers in its radius. Haunted Silo raises three straw ambushers which hide
  in corn and groves and land a stronger first hit.
- Seed Shrine grows corn and raises Kernel Guardians to intercept pigs. Root Circle
  heals friendly units while slowing hostiles. Elder Grove grows corn and awakens
  slow Corn Ents that root enemies on contact.

`catalog.js` defines costs and stats. `card-actions.js` validates effects, recruitment
and placement. `commander-rules.js`, `creature-brains.js`, and `building-engine.js`
contain separate decisions. `simulation.js` owns fixed steps, entity state, movement,
combat, ecology and resource limits. `terrain.js` handles the 48 × 48 spatial grid,
bridges, biomes, mazes and A* pathfinding. `scenario.js` creates each commander opening.

`cornland-models.js` makes the six reference inspired structures as genuine 3D
meshes: framed wood, fencing, layered crops, waterwheel, barn loft and pens,
canvas mill sails, a pitching seed barrel, horned livestock pen, wheeled cart and
plow. Their pivots animate in `view.js` alongside the existing character models.
The additional Scarecrow and Druid buildings have distinct 3D silhouettes too.
When WebGL2 is unavailable, `view.js` draws the same authoritative world as a
labeled map. Camera pan, orbit, tilt, zoom and fullscreen still work in either mode.

Run `node --test tests/*.test.js` from the repository root. The interaction tests
exercise production caps, costs, commander recovery, projectile travel, terrain
change, pack behavior and model geometry, as well as the older game route.
