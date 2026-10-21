# Kingdom Clash — 3D living table

A browser card battler with a real WebGL 2 mesh battlefield. Pick a territory, choose its commander, deploy that commander, and play a 56-card battle deck. [Play on GitHub Pages](https://tyronhuggins32-cmd.github.io/adventure/).

## Actual 3D models

`field-3d.js` is the active renderer. Terrain, soil slabs, corn, fences, a central river with four bridges, palms, ice crystals, characters, creatures, buildings, and spells are polygonal geometry with Standard materials, depth testing, directional lighting, and cast/received shadows. Characters turn in world space; separate leg/arm/wing joints animate their movement. This replaces the earlier painted sprite battlefield. The new models are stylized low-poly models built from reusable geometry; they are not high-detail sculpted assets.

The twelve commander builds include the Farmer's straw hat, plaid shirt, mustache, wheat sack, boots, and pitchfork; Scarecrow's straw, stitched face and crow; Corn Druid's leaf cloak and corn crown; and individual winter, beach, and knight equipment. Every creature/building card and spell has a mesh model. Card portraits are rendered from the same model builders by one shared thumbnail renderer, cached in memory. Older painted illustrations remain as lightweight UI fallbacks and miniature icons.

The 3D scene uses a locally bundled Three.js 0.186.1 (MIT, license in `kingdom-clash/vendor/THREE-LICENSE.txt`). No CDN, server, image-generation service, or AI call is needed to play. Terrain crops are instanced and static model parts are merged by material to reduce draw calls. The canvas caps pixel ratio at 1.5 and targets 30 FPS. WebGL 2 is required; if unavailable, the game displays an explicit message and retains the lane controls below the viewport.

## Camera and controls

- Drag one finger or the mouse to orbit. Rotate buttons work without gestures.
- Pinch two fingers to zoom; move both fingers to pan. On desktop, Shift-drag/right-drag pans; Ctrl-wheel zooms.
- **My field** moves the camera closer to your landscapes. **Full table** resets the camera. Plus/minus zoom buttons are available.
- With the canvas focused, arrow keys orbit, +/- zoom, and Home resets orientation.
- Select a card and tap its target landscape, or use the lane's Place button. Raycasting follows camera rotation and zoom.
- Tap a roaming model to inspect its own card. Buildings, creatures, and commanders remain selectable from the lane controls too.

The four territories are Corn Field, Snowy Lands, The Beach, and Knight Kingdom. Each has three commanders. All twelve commanders have 14 unique designs with four copies per design: 168 designs total, 56 cards per deck. The opening hand includes that commander's first expansion card. Each lane holds one combat creature and one building, in addition to its commander marker. Each building design may be placed only once per player; buildings can absorb attacks and be destroyed.

## Battle-world simulation

The active map is **72 × 72 meters**, a square made by expanding the short side of the earlier 72 × 36 world. Each territory tile is 18 meters wide and 36 meters deep. Both sides have modeled keeps, a river with four bridges, stone paths, and 120 instanced trees. Models remain their previous physical size, so the additional space is real travel distance.

Deploy cards with 2 AP, then choose **Launch battle**. The rival deploys its cards, and both armies fight a live wave lasting up to 32 simulation seconds. Units seek enemy creatures, then buildings, then the opposing keep. Ground units use grid pathfinding around trees/buildings and cross at bridges; fliers travel directly. Damage happens on melee contact or projectile arrival. Surviving attackers strike the keep once per wave, then return. Commanders guard their camps with healing or ranged support. Casualties are removed immediately from battle state and animate out of the scene.

**Pause**, **×2 speed**, and **Follow battle** control playback. Following centers the camera on a frontline encounter; camera pan/zoom and Full table remain available. The simulation pauses when the page is hidden. During a wave cards are locked; when it ends, surviving creatures reset, end-of-wave field effects resolve, both sides draw, and 2 AP refreshes for the next deployment. Floop is still available during deployment after the first wave. The keep/commander retains 30 HP and empty-deck draws still cause escalating fatigue.

Every card keeps its original effect and gains a displayed battlefield capability:

- Creatures have a role, movement speed, attack reach, cadence, armor, and an additional trait. Traits include first-target ember damage, slowing hits, cleave, first-takedown scavenging, third-hit focus/life steal, rally bonuses, and low-health agility. Bonuses are capped and described on cards.
- Buildings act as infirmaries (nearby healing), rally posts (15% movement/attack cadence boost), watchtowers (ranged defense), or supply depots (bounded food production). Each building design remains one placement per player and has finite durability.
- Spells keep their immediate effect and add a six-second resonance around the cast field during the next battle: healing magic restores nearby allies periodically; hostile magic slows enemies. Resonances do not replay in subsequent waves without another cast.
- The Farmer's pig still roots, wallows and forages during deployment, then fights with a scavenging trait. Crow Barrage still hits enemy creatures or ravages its own field if there are no valid targets.

World animations include articulated marching, wing beats, aiming, attack swings, projectile arcs, healing/hit rings, damage reactions, summon scale-ins, species-aware fall effects, interruptible wolf feeding, machinery, and unit/building/base health bars. Reduced motion suppresses cosmetic gait, while positions still reflect the running combat; Pause stops the simulation itself.

`battle-simulation.js` owns the real fight and changes authoritative health. `navigation.js` owns obstacle routing, `card-traits.js` owns the additional capabilities, and `world-layout.js`/`world-scenery.js` own the expanded geography. `entity-world.js` follows combat actors during a wave and uses its roaming brains during deployment. The legacy instant lane-fight function remains for compatibility/tests but is no longer called by the website's battle button.

## Development

`npm start` serves http://localhost:8000. `npm test` runs 62 tests, including all 144 commander matchups, all expansion-card effects, entity bounds/state/lifetimes, all 180 mesh builds, volumetric bounds, joint animation, windmill machinery, and spell geometry.

`model-3d.js` builds and animates geometry; `preview-3d.js` renders card thumbnails; `field-3d.js` owns the WebGL viewport/camera/raycasting. `entity-programs.js` and `entity-world.js` own independent behavior. `lanes.js`, `living-rules.js`, `commanders.js`, and `expansion.js` own battle state. The old canvas renderer/grid engine are unused legacy sources.

Browser verification covers 375/768/1280 layouts, WebGL 2 rendering, model card portraits, raycast commander/card placement, orbit/zoom, pig deployment, rival turn playback, restart, continuous model movement, and model inspection. GitHub Pages deploys main through the existing workflow.
