# Adventure — Elderwild

A playable original 2D side-view fantasy sandbox inspired by Terraria's exploration format. Runs entirely in a browser with no dependencies, external art, or network requests.

## Play locally

Run `npm start` (Python 3 required), then open http://localhost:8000. Serve this directory on any static host to play online. This repository does not automatically publish a public website.

Enter a text or numeric world seed. The same seed reproduces terrain, biomes, caves, ore, crystals, trees, and ruins. Saved edits and progress are stored separately per seed in this browser. Continue resumes them; choose a different seed to start another world.

## Controls

- A/D or left/right arrows: move. Space/W/up: jump.
- 1: sword; 2: pickaxe; 3: place earth; 4: mana bolt; 5: healing potion.
- Aim with the pointer, hold left click to use. Right click places earth.
- E: forge the Starblade using 8 crystals, doubling sword damage.
- Escape or Pause: pause and save. Saves also run every 10 seconds.
- Touch: movement/jump buttons, tap the world to aim, hold Use. Tap hotbar to select tools.

Mine underground crystals or defeat wraith slimes to collect shards. Explore Elderwood, Amethyst Reach, and Ashen March. Death returns you to the starting shrine with your inventory preserved.

## World engine

`world.js` uses a string seed hash and coordinate-based smooth noise. Generation is order independent, including negative coordinates. Terrain streams lazily in 16×16 tile chunks; only visible chunk canvases are rendered. Far chunks and their render caches are evicted while a sparse edit map preserves changes. Tile art is cached until its chunk is edited. Horizontal travel is unbounded; depth is 180 tiles with an indestructible floor. Generation is synchronous and viewport bounded, not worker based.

## Checks

`npm test` runs Node's built-in tests for determinism, seed variation, negative coordinates, chunk eviction/edit persistence, depth limits, and underground resources.

## Current scope

A first playable foundation: original procedural pixel art, parallax scenery, biome exploration, caves, mining/building, platform movement, sword/spell combat, enemies, resource progression, touch controls, and local saves. No multiplayer, full Terraria content parity, NPC settlements, or boss campaign yet. Saves are local to this browser/device, and clearing browser storage removes them.

## Animation and scenery update

The original code-drawn art now includes a joint-animated knight with idle breathing, running, jump/fall poses, cloak flutter, and dedicated sword/mining/casting motions. Slimes squash and stretch. Combat adds swept sword arcs, glowing spell trails, impact sparks, fading rotating debris, landing dust, healing motes, and bounded particles. Movement eases into and out of running. Background layers include an eclipsed moon, stars, moving clouds, faceted mountains, ruined citadels, and three parallax forests; near trees sway and surface fireflies drift. Animation uses simulation time and freezes while paused. Collision dimensions and saved terrain remain compatible.

Validation: world and game-loop tests, animation-phase tests, and native Canvas renders of the gameplay scene and sword swing. Safari touch behavior still requires device verification.
