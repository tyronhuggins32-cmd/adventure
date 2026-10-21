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

## Battle rules

Receive 2 AP each turn. Select a card, then a landscape. Floop exhausts a creature to use its ability instead of attacking. Fight resolves ready creatures: opposing creatures exchange damage; empty lanes expose the commander. Fighting and Floop unlock after the player's first turn. Frozen creatures miss their next turn. Reduce the rival commander from 30 HP to zero. Empty-deck draws inflict escalating fatigue (2, 4, 6, ...). The rival plays legal intermediate moves so placement reactions are visible.

Terrain has integrity 0–8, armor, and food 0–12. Zero integrity destroys its building and adds one to unblocked damage. Cards can irrigate, freeze, burn, pave, swap, grow coral, and raise defenses. Thorn/root fields damage their creature at turn end.

The Farmer's Truffle Pig roots for food, forages, wallows, wanders, and flees threats. Meals and healing resolve on turns. Scarecrow's Crow Barrage damages up to three enemy combat creatures; with no target, it ravages the chosen friendly field instead. Hens/support entities are bounded scenery/support populations. Individual card text describes each mechanic.

## Independent entities

Every card design and commander has a stable behavior profile; each deployed copy owns separate runtime state. Creatures and commanders steer in X and Z across all four landscapes on their own side and avoid other actors/buildings. Guards patrol, animals forage or flee, fliers circle, and heavy creatures trudge. Buildings remain anchored and animate machinery; spell particles are moving 3D meshes and expire after their cast. Summons scale in, attacks lunge and swing, and removed entities shrink away. Reduced motion holds roaming/animation still while still cleaning up expired spells.

Roaming is visual: assigned combat lanes and turn-based rules remain authoritative. Waiting never grants extra damage, healing, food, or AP.

## Development

`npm start` serves http://localhost:8000. `npm test` runs 46 tests, including all 144 commander matchups, all expansion-card effects, entity bounds/state/lifetimes, all 180 mesh builds, volumetric bounds, joint animation, windmill machinery, and spell geometry.

`model-3d.js` builds and animates geometry; `preview-3d.js` renders card thumbnails; `field-3d.js` owns the WebGL viewport/camera/raycasting. `entity-programs.js` and `entity-world.js` own independent behavior. `lanes.js`, `living-rules.js`, `commanders.js`, and `expansion.js` own battle state. The old canvas renderer/grid engine are unused legacy sources.

Browser verification covers 375/768/1280 layouts, WebGL 2 rendering, model card portraits, raycast commander/card placement, orbit/zoom, pig deployment, rival turn playback, restart, continuous model movement, and model inspection. GitHub Pages deploys main through the existing workflow.
