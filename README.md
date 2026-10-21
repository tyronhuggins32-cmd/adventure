# Kingdom Clash — 3D living table

A browser card battler with a real WebGL 2 mesh battlefield. Pick a territory, choose its commander, deploy that commander, build recruitment schools, and unlock veteran spells through surviving battles. [Play on GitHub Pages](https://tyronhuggins32-cmd.github.io/adventure/).

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

The four territories are Corn Field, Snowy Lands, The Beach, and Knight Kingdom. Each has three commanders. Each commander has 14 core designs plus 180 territory roster entries and a mythic catalog option. New browser matches open with building choices; each school offers an exclusive selection of up to five recruits. The legacy card-deck API remains available separately. Each lane holds one combat creature and one building, in addition to its commander marker. Each building design may have only one live copy per player; destroyed buildings can be rebuilt, and buildings can absorb attacks and be destroyed.

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

`npm start` serves http://localhost:8000. `npm test` runs 84 tests, including all 144 commander matchups, all expansion-card effects, entity bounds/state/lifetimes, all 2,352 commander/card mesh builds, volumetric bounds, joint animation, windmill machinery, and spell geometry.

`model-3d.js` builds and animates geometry; `preview-3d.js` renders card thumbnails; `field-3d.js` owns the WebGL viewport/camera/raycasting. `entity-programs.js` and `entity-world.js` own independent behavior. `lanes.js`, `living-rules.js`, `commanders.js`, and `expansion.js` own battle state. The old canvas renderer/grid engine are unused legacy sources.

Browser verification covers 375/768/1280 layouts, WebGL 2 rendering, model card portraits, raycast commander/card placement, orbit/zoom, pig deployment, rival turn playback, restart, continuous model movement, and model inspection. GitHub Pages deploys main through the existing workflow.

### Camera controls

Drag to pan, or select **Orbit** to rotate and tilt. Two fingers move, pinch to zoom, and twist to rotate; a multi-touch gesture never places a card. Mouse wheel zooms toward the pointer and right-drag or Shift-drag orbits. The zoom slider, holdable movement/rotation buttons, Full map, My army, Rival army, Top view, and Follow battle work on touch and desktop. Manual movement releases battle follow. Expand opens a fullscreen battlefield with an in-page expanded view where fullscreen is unavailable.

With the battlefield focused: WASD/arrows move, Q/E rotate, R/F tilt, +/− zoom, Home resets the full map, and Escape exits expanded view. Camera transitions are smoothed and respect reduced motion.

### Farmer livestock deck

Farm and Barn replace Hay Field and Orchard Tower. Farm grows food and repairs its field every 4 seconds and at wave end. Barn heals nearby livestock and offers a refuge for frightened animals. Pasture Sheep, Dairy Cow, and Barnyard Bull replace Truffle Hound, Living Compost, and Supper Bell in the Farmer’s core deck, preserving its 14 core designs. Sheep flock and graze, cows heal the herd, and bulls charge with a six-second bonus cooldown. Truffle Pigs automatically consume enemy food-based creatures at contact for zero AP (four-second cooldown); non-food threats within seven meters make them flee. Food identity accepts an explicit `foodBased: true` tag or recognizable crop/fruit names. Allied creatures are never eaten.

Validation: all 84 tests pass, including livestock AI, recruitment, veteran spell progression, rebuilt schools, valid portrait fallbacks, and destroyed-building navigation. The old catalog-count assertions now cover the expanded catalog. An additional DOM harness exercised the real app’s commander selection, Barn construction, wave/AP refresh, pig recruitment, veteran progress, and restart. Full browser/WebGL rendering remains unverified because a browser binary could not be installed in this environment.

### Building-led recruitment and veteran magic

New browser matches now open with construction cards. Build a school to reveal its exclusive recruitment panel, choose an empty landscape, and spend AP to recruit. Each of the twelve commanders has separate building rosters. Farmer branches are Farm (crop creatures), Barn (pig, sheep, cow, bull), Windmill (harvest warriors), and Henhouse (birds). Existing livestock AI remains active. Destroyed buildings can be rebuilt; only one live copy of each building design is allowed. Existing troops survive the loss of their school, but recruitment and veteran spell casting require that school.

A recruited unit that survives two completed waves earns a 2 AP spell. The living veteran must be ready and its school intact. Each veteran has at most one spell card, refreshed after a completed wave. Building branches unlock herd healing, field growth, flock empowerment, harvest area damage, winter control, tide reversal, sanctuary healing, or siege damage. Dead veterans leave no usable spells. Recruitment and casting are blocked while a wave runs; the rival uses the same construction and recruitment rules.

The browser explicitly enables `buildingProgression: true`. The engine’s default retains the old card-deck API for legacy consumers and tests; new progression tests opt in explicitly.

### Detailed miniatures and living terrain

The camera now reaches **16× zoom**, twice the former maximum, through the slider, pinch, wheel, and buttons. Card art uses 512-pixel renders of the same models shown on the battlefield. Anatomical recipes distinguish winged quadruped griffins and dragons, birds, hoofed and padded mammals, swimming creatures, crustaceans, and tentacled creatures. Commanders and troops have additional clothing, armor, faces, hair, equipment, and articulated accessories. Special structures have purpose-built silhouettes, including bell frames, drums, cranes, ballistas, tents, crystal cages, lighthouses, and coral.

Terrain details use physical world sizes. Crop rows, grass, flowers, snow drifts, shore shells, palms, river stones, reeds, taller trees, keep flags, drifting pollen/snow, rippling water, and movement dust bring the square field to life. Wind and placement ripples animate foliage in the shader; reduced-motion mode holds ambient effects still. Mesh batching preserves moving wings, magical orbs, and machinery. Coverage includes the expanded roster and anatomy regressions.
