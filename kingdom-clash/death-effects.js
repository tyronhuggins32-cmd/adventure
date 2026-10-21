// Shared timing and species-aware poses for battlefield death animations.
export const DEATH_DURATION = 0.72;

export function deathPose(card = {}) {
  const identity = [card.name, card.id, card.behavior].filter(Boolean).join(" ").toLowerCase();
  if (/sheep|cow|bull|pig|boar|hog|wolf|hound|fox|rat|hare|ox|horse|turtle|seal/.test(identity)) return "side";
  if (/bird|crow|raven|owl|gull|hen|phoenix/.test(identity)) return "flat";
  return "ragdoll";
}

export function deathProgress(elapsed) {
  return Math.max(0, Math.min(1, elapsed / DEATH_DURATION));
}

export function deathHealthGain(wolf, prey) {
  if (!wolf || !prey || wolf.hp <= 0 || prey.hp > 0) return 0;
  if (!/wolf/i.test([wolf.name, wolf.id, wolf.behavior].filter(Boolean).join(" "))) return 0;
  const max = Number(wolf.maxHp ?? wolf.hp);
  return Math.max(0, Math.min(max - wolf.hp, Math.ceil(max * 0.2)));
}
