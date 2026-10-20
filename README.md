# Kingdom Clash — The Living Table

A four-lane browser card battler with illustrated terrain, creature and building miniatures, live placement reactions, and an AI opponent.

## Start a battle

1. Choose a **Territory Card**: Corn Field, Snowy Lands, The Beach, or The Knight Kingdom. This determines your scenery.
2. Choose one of that territory’s three **Commander Cards**. Read its passive, creature Floop power, and army preview. You can go back and change territory.
3. Place the commander on one of your four landscapes. The bot places its own commander. Both placements unlock the battle hands.
4. Play your commander’s **Battle Deck**: 28 cards made from four copies each of three creatures, three buildings, and one spell. Commanders occupy a separate rear slot and share the hero’s 30 HP; damage through any empty enemy lane hits the opposing commander.

## Commanders

| Territory | Commanders |
| --- | --- |
| Corn Field | The Farmer, Scarecrow, The Corn Druid |
| Snowy Lands | Hearthkeeper, Frost Witch, Glacier Shepherd |
| The Beach | Castaway Captain, Reef Oracle, Tide Collector |
| The Knight Kingdom | Banner Knight, Royal Castellan, Exiled Prince |

Every commander has a distinct seven-card roster, creature stats, passive, and Floop ability. Play styles include summon healing, fear, plant growth, freezing, large beasts, salvage draws, draining, rallying, fortifications, and risky attack boosts. The rival uses a valid randomly chosen territory and commander.

## Rules and controls

Receive 2 AP each turn. Select a hand card, then a highlighted landscape. Each lane holds one creature and one building in addition to its commander marker. Floop exhausts a creature to activate its ability instead of attacking. Fight resolves all ready creatures: opposed creatures exchange damage; empty enemy lanes expose the commander. The first player cannot fight or Floop on their first turn. Frozen creatures miss their next turn.

The first empty-deck draw inflicts 2 fatigue damage, the next 4, then 6, and so on. Increasing fatigue prevents healing decks from stalling indefinitely. The Frost Witch’s first spell per turn is free; its current cost is displayed in hand. All passive bonuses apply in the rules engine.

Tap battlefield miniatures to inspect cards. Sound is off by default. Reduced-motion preferences disable ambient animation and shorten bot playback. On phones, scroll inside the table to see all lanes; the hand scrolls separately.

## Development

`npm start` serves http://localhost:8000. `npm test` runs the rule tests, including all 144 commander pairings. GitHub Pages deploys main through the existing workflow.

`commanders.js` defines rosters and passives; `lanes.js` runs combat and emits sequential events; `art.js` draws original SVG illustrations; `app.js` presents the setup stages and live table. The older grid engine remains unused legacy source. No external art assets or runtime dependencies are required.
