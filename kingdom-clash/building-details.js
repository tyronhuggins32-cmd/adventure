// Small tactical readouts and personality for every building card.
// Mechanical effects stay in the battle engine; these labels explain them and give every structure a little life.
const detailsByName = {
  'Hay Field': ['FIELD SUPPORT','The scarecrow practices its victory pose.','sway','🌾'],
  'Windmill': ['ATTACK BOOST','One blade squeaks louder than the others.','spin','💨'],
  'Orchard Tower': ['COMMANDER HEAL','An apple bonks the lookout on the helmet.','bob','🍎'],
  'Ice House': ['COMMANDER HEAL','A tiny snowman salutes, then loses its nose.','shiver','☃️'],
  'Glacier Forge': ['ATTACK BOOST','The anvil gives a proud little sparkle.','spark','✨'],
  'Frost Tower': ['DEFENSIVE COVER','A snow puff sneezes off the battlements.','shiver','❄️'],
  'Dock': ['COMMANDER HEAL','A fish jumps up, misses the bucket, and flops back.','bob','🐟'],
  'Lighthouse': ['ATTACK BOOST','The lamp spins to point at absolutely nothing.','spin','🔆'],
  'Coral Forge': ['DEFENSIVE COVER','A crab tries to look intimidating sideways.','sway','🦀'],
  'Knight House': ['COMMANDER HEAL','A helmet tips over like it is bowing.','bob','🪖'],
  'Blacksmith': ['ATTACK BOOST','The hammer bonks the anvil with a tiny star.','spark','⚒️'],
  'Watchtower': ['DEFENSIVE COVER','The guard checks the same empty horizon twice.','sway','👀'],
  'Henhouse': ['FOOD GENERATOR','A hen lays an egg, then looks surprised.','bob','🥚'],
  'Decoy Effigy': ['DAMAGE REDUCTION','The straw dummy waves at the enemy.','sway','🪹'],
  'Walking Orchard': ['HEAL + FOOD','An apple falls; the tree pretends it meant to.','sway','🍏'],
  'Bottomless Soup Pot': ['HEALING','The soup bubbles like it is telling a joke.','bob','🍲'],
  'Prism Cage': ['ENEMY PUNISHMENT','The crystal flashes dramatically for no reason.','spark','💎'],
  'Icehorn Pen': ['ALLY GROWTH','A tiny horned silhouette trots in a circle.','bob','🐐'],
  'Wreck Crane': ['FIELD REPAIR','The crane lifts one pebble like a champion.','sway','⚓'],
  'Watchful Anemone': ['ENEMY DAMAGE','The anemone opens and immediately gets shy.','bob','🪸'],
  'Tide Jar': ['DRAIN + HEAL','A bubble escapes and looks very pleased.','bob','🫧'],
  'War Drum': ['ATTACK GROWTH','The drumroll goes on one beat too long.','bob','🥁'],
  'Mason’s Yard': ['FIELD REPAIR','A brick lands perfectly, then one rolls away.','sway','🧱'],
  'Gate Mastiff': ['BUILDING REPAIR','The mastiff barks at its own tail.','bob','🐕'],
  'Rebel Camp': ['ATTACK GROWTH','A rebel salutes with the flag upside down.','sway','🏴'],
  'Coral Garden': ['FIELD SUPPORT','A tiny crab proudly plants one coral pebble.','sway','🦀'],
  'Mason Yard': ['FIELD REPAIR','A brick lands perfectly, then one rolls away.','sway','🧱'],
  'Crystal Prism': ['ENEMY PUNISHMENT','A crystal twinkles like it knows a secret.','spark','💎']
};
export function buildingDetail(card) {
  const found = detailsByName[card?.name];
  if (found) return {label:found[0],gag:found[1],motion:found[2],emoji:found[3]};
  const effect = card?.effect;
  const fallback = typeof effect === 'number'
    ? [['COMMANDER HEAL','The little flag waves at nobody.','bob','✨'],['ATTACK BOOST','A loose bolt does a victory dance.','spin','⚒️'],['DEFENSIVE COVER','The lookout salutes a passing butterfly.','sway','🛡️']][effect] || ['LANE BONUS','A tiny flag flaps proudly.','sway','✨']
    : ['SPECIAL BUILDING','The building makes a tiny, unnecessary flourish.','bob','✨'];
  return {label:fallback[0],gag:fallback[1],motion:fallback[2],emoji:fallback[3]};
}
