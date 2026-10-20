# Kingdom Clash

A browser card battler inspired by four-lane landscape games. Choose Farm, Ice, Beach, or Medieval; each commander founds four matching landscapes and brings a 28-card deck with three creature types, three kingdom buildings, and a spell.

## Play

Select a kingdom, select a hand card, and choose a friendly lane. Each turn grants 2 AP. A lane holds one creature and one building. Floop exchanges a creature's attack for its kingdom ability. Fight resolves all ready creatures, with simultaneous creature damage and direct hero damage through empty lanes. The first player cannot fight or Floop on their first turn. The opposing kingdom is controlled by the bot. Reduce its hero from 30 HP to zero; drawing from an empty deck inflicts fatigue damage.

Buildings heal the hero, increase lane attack, or reduce incoming direct damage. Cards are drawn from a shuffled deck; the hand filters expose creatures, buildings, and spells without providing free extra cards.

## Local

`npm start` serves the game at http://localhost:8000. `npm test` runs Node tests, including automated complete matches for all 16 kingdom combinations. The older grid engine is retained as unused source; the website imports lanes.js.

GitHub Pages publishes main through the existing workflow. No external dependencies or assets are required. Card illustrations use CSS landscapes and animated emoji figures; this is an original kingdom adaptation, not a complete reproduction of the licensed Card Wars game.
