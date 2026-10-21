# Kingdom Clash — The Living Table

A four-lane browser card battler with illustrated terrain, creature and building miniatures, live placement reactions, and an AI opponent.

## Start a battle

1. Choose a **Territory Card**: Corn Field, Snowy Lands, The Beach, or The Knight Kingdom. This determines your scenery.
2. Choose one of that territory’s three **Commander Cards**. Read its passive, creature Floop power, and army preview. You can go back and change territory.
3. Place the commander on one of your four landscapes. The bot places its own commander. Both placements unlock the battle hands.
4. Play your commander’s **Battle Deck**: 56 cards made from four copies each of 14 unique designs. Commanders occupy a separate rear slot and share the hero’s 30 HP; damage through any empty enemy lane hits the opposing commander.

## Commanders

| Territory | Commanders |
| --- | --- |
| Corn Field | The Farmer, Scarecrow, The Corn Druid |
| Snowy Lands | Hearthkeeper, Frost Witch, Glacier Shepherd |
| The Beach | Castaway Captain, Reef Oracle, Tide Collector |
| The Knight Kingdom | Banner Knight, Royal Castellan, Exiled Prince |

Every commander has a distinct 14-card roster, creature stats, passive, and Floop ability. Play styles include summon healing, fear, plant growth, freezing, large beasts, salvage draws, draining, rallying, fortifications, and risky attack boosts. The rival uses a valid randomly chosen territory and commander.

## Rules and controls

Receive 2 AP each turn. Select a hand card, then a highlighted landscape. Each lane holds one creature and one building in addition to its commander marker. Floop exhausts a creature to activate its ability instead of attacking. Fight resolves all ready creatures: opposed creatures exchange damage; empty enemy lanes expose the commander. The first player cannot fight or Floop on their first turn. Frozen creatures miss their next turn.

The first empty-deck draw inflicts 2 fatigue damage, the next 4, then 6, and so on. Increasing fatigue prevents healing decks from stalling indefinitely. The Frost Witch’s first spell per turn is free; its current cost is displayed in hand. All passive bonuses apply in the rules engine.

Tap battlefield miniatures to inspect cards. Sound is off by default. Reduced-motion preferences disable ambient animation and shorten bot playback. On phones, scroll inside the table to see all lanes; the hand scrolls separately.

## Development

`npm start` serves http://localhost:8000. `npm test` runs the rule tests, including all 144 commander pairings. GitHub Pages deploys main through the existing workflow.

`commanders.js` defines rosters and passives; `lanes.js` runs combat and emits sequential events; `art.js` composes card portraits from the painted model sheets; `app.js` presents the setup stages and live table. The older grid engine remains unused legacy source. All art is bundled locally; no runtime dependencies are required.


## Living battlefield expansion

Each of the 12 commanders now has **14 unique card designs** (168 across all commanders), with four copies per design: **56 cards per deck**. The seven expansion cards per commander introduce animals, specialized buildings, terrain-changing spells, hazards, displacement, and effects with real downsides. The opening hand always includes one copy of that commander’s first expansion card, taken from the actual deck.

The field is now a continuous canvas-rendered isometric diorama. Commanders, combat creatures, buildings, and up to 24 auxiliary entities appear on raised terrain. Field integrity (0–8), armor, food (0–12), and terrain type are visible in the accessible lane controls. A field reduced to zero loses its building and takes +1 direct attack damage. Thorn/root terrain damages its creature at turn end. Cards can irrigate, freeze, burn, pave, swap, grow coral, or raise defensive terrain; these are rule changes, not just colors.

**Truffle Pig:** spawns as a combat creature in the Farmer’s deck. Its scripted state machine roots for food, forages, wallows in mud, wanders/rests, and flees stronger opposing creatures. Creature motion is real-time; meals, healing, food production, and combat resolve on turns so waiting cannot farm unlimited bonuses. Actors avoid building targets and stay inside their assigned landscape. This is species-inspired behavior, not a biological cognition simulation.

**Crow Barrage:** flies a visible flock toward up to three living enemy creatures and deals 2 damage to each. If there is no living enemy creature, the flock damages the chosen friendly field by 3; buildings collapse if integrity reaches zero. Auxiliary hens, lights, and seedlings are scenery/support populations, not independently targetable combat creatures.

Other examples: Henhouse grows a bounded flock that replenishes food; Powder Keg damages both fields; Root Prison binds enemies; Graft Exchange swaps terrain and food; tide effects flood/drain fields; War Drum and Rebel Camp have capped permanent growth. Each expansion card’s text describes its individual mechanic. Combat remains turn-based while movement and card reactions animate continuously. Reduced-motion mode keeps actors still and shows short feedback. The animation loop is capped around 30 FPS and stops drawing when the document is hidden; New Battle destroys the previous scene loop.

`npm test` covers all 144 commander matchups, all 84 expansion cards on empty and populated lanes, crow targeting/backfire, pig foraging, terrain resources, population limits, and entity brain behavior. No external art or AI service is needed.


## Expanded painted diorama

Fields are twice their previous width and depth (four times the ground area), using a 1920 × 960 world projection. Desktop expanded view is 2080px wide; phone view is 1320px, both twice their former dimensions. Pan inside the table or choose **Fit field**. Lane count and combat capacity stay at four per player.

The 12 commanders have new full-body painted sprites inspired by the supplied farmer reference, and all combat creatures and buildings share matching shaded materials. Three local WebP sheets include 12 commanders, 64 creatures/support entities, and 48 buildings. Spells compose matching models with magic sigils. Model names bind the same artwork in cards, inspection, and the live field. The field adds 48px exposed soil strata, cultivated beds, crop varieties, fences, shaded trees, and depth-sorted larger buildings. This is a painted 2.5D canvas diorama, not rotatable polygonal 3D. Generated bitmap art is bundled under `kingdom-clash/assets`; no image or AI service runs during play.

`scene-math.js` owns projection and inverse picking; `model-assets.js` owns atlas bands and bindings. Tests verify every commander and creature/building model, all eight clickable field centers, and the existing battle rules.


## Independent card entities

Every one of the 168 card designs and 12 commanders has a stable program descriptor and each deployed copy has independent runtime state in `entity-world.js`. Creatures and commanders steer continuously in X and Y across all four landscapes on their own side; they avoid allies/buildings, stop while frozen, and use eight heading labels. Wander, patrol, guard, forage, rooting, mud wallowing, flight circles, heavy trudging, and commander routines share primitives with different card-specific traits. Buildings remain anchored and emit their own themed activity loops; spells create moving, short-lived entities with seeded particle paths and semantic frost, vine, healing, water, ember, or shard visuals.

The painted models use procedural walking motion, facing flips, leg-strip offsets, body lean, action pulses, and ground trails. These are 2.5D billboard sprites, not new eight-angle 3D meshes. Card portraits animate by program family with individual timing. Roaming is visual: a creature’s assigned combat lane and turn-based rule effects remain authoritative. Waiting never spends AP, heals, grows food, or deals extra damage. Removed cards destroy their entities; spell entities expire even with reduced motion enabled. Click a roaming entity to inspect its own card.

Tests cover all 180 program descriptors, all creature/commander movement bounds and axes, eight headings, independent copies, frozen/anchored behavior, spell cleanup, and rule-state immutability. Browser verification covers portrait animation, live roaming commanders/creatures, active buildings and spells, phone/tablet/desktop layouts, reduced motion, and battle flow.
