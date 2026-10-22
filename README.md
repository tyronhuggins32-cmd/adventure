# The Living Table

[Play the rebuilt Card Wars table](https://tyronhuggins32-cmd.github.io/adventure/) or open
[the older twelve commander table](https://tyronhuggins32-cmd.github.io/adventure/episode-table.html).

## Rebuilt homepage

The homepage is a new, self-contained four-landscape game in
`kingdom-clash/reborn`. Its deck selection, world state, autonomous decisions,
camera, miniature models and card dock do not import the older battle engine.
Choose Finn's Blue Plains or Jake's Cornfields for the episode-inspired Pig,
Husker Knights, Archer Dan and storm cards, or choose the Farmer, Scarecrow,
Prince or Glacier Shepherd. Each
commander begins beside a different structure. Deploy cards during planning,
then watch a 22-second live simulation before the next turn. Miniatures and
buildings persist across turns. Pigs forage without a command or energy cost;
barns birth sheep and Cotton Volley; scarecrows repel crows; wolves buff their
pack. WebGL renders the dimensional tabletop with pan, orbit and zoom controls.
A playable animated canvas fallback remains available if WebGL is unavailable.
Run `node --test tests/reborn-table.test.js` for the new simulation rules.

## Older battle formats

The earlier living-world code simulates a persistent **288 × 288** 3D world. The Farmer starts
beside a Barn and herd; the Scarecrow starts beside a producing Corn Field; the
Corn Druid starts at a Seed Shrine. It runs at fixed .05 second simulation steps,
with independent creature needs, paths, ecology, building production, combat and
commander decisions. Pausing freezes world time. See
[`kingdom-clash/living-world/README.md`](kingdom-clash/living-world/README.md)
for ranges, production intervals and counterplay.

The card table in `episode-table.html` has **twelve commanders** across farm,
ice, beach and medieval territories. Placing one starts their unique building on
the same landscape without spending AP. It becomes a real six HP building: its
healing, lane bonus, defense and recruitment function normally, and opponents
can destroy it. The starting copy is removed from the opening hand while copies
in the deck allow rebuilding. The Exiled Prince starts with a Broken Throne.

| Territory | Commander → starting building |
| --- | --- |
| Farm | Farmer → Barn · Scarecrow → Crow Roost · Corn Druid → Seed Shrine |
| Ice | Hearthkeeper → Snow Lodge · Frost Witch → Mirror Spire · Glacier Shepherd → Frost Pasture |
| Beach | Castaway Captain → Driftwood Dock · Reef Oracle → Pearl Pool · Tide Collector → Undertow Bell |
| Medieval | Banner Knight → Rally Standard · Royal Castellan → Castle Wall · Exiled Prince → Broken Throne |

`commander-spawn-models.js` adds twelve distinct miniature arrival sets. The
Prince's character mesh is moved into a seated pose within a separate throne
hierarchy; his legs stay articulated. `starter-building-models.js` makes twelve
building silhouettes, including the Broken Throne, for the card table. The
Farmer keeps his straw hat, carrot beard, pumpkin pack and carrot staff, with
refined face, fabric details, harness and crop tending motion. Shared model
geometry remains batched for mobile rendering. The existing Cornlands structures
and creatures keep their separate animation and AI systems.

Three.js is bundled under `kingdom-clash/vendor`. WebGL2 is required for the
3D scenes; the living Cornlands has an animated map fallback. Camera pan, orbit,
tilt, zoom and expanded view remain available.

## Development

`npm start` serves the project at `http://localhost:8000`. Run
`node --test tests/*.test.js` for rules, all commander matchups, pathfinding,
starter buildings and model geometry.
