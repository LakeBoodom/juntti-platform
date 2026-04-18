// Object-type → emoji map for countdowns. Will be replaced with real
// icons once Juntti — Countdown Icons.pdf lands in the repo.
const COUNTDOWN_EMOJI: Record<string, string> = {
  bottle: "🍾",
  helmet: "🏒",
  bonfire: "🔥",
  sunglasses: "😎",
  ornament: "🎄",
  cross: "✝️",
  microphone: "🎤",
  cake: "🎂",
  flag: "🇫🇮",
  heart: "❤️",
  star: "⭐",
  fireworks: "🎆",
  egg: "🥚",
  pumpkin: "🎃",
};

export function countdownEmoji(objectType: string): string {
  return COUNTDOWN_EMOJI[objectType] ?? "📅";
}

// Rough category → emoji for birthday quiz header.
const ROLE_EMOJI: Record<string, string> = {
  jalkapalloilija: "⚽",
  mäkihyppääjä: "⛷️",
  jääkiekkoilija: "🏒",
  "alppihiihtäjä": "⛷️",
  näyttelijä: "🎬",
  laulaja: "🎤",
  muusikko: "🎵",
  poliitikko: "🏛️",
  ohjaaja: "🎬",
  keittiömestari: "👨‍🍳",
  jalkapallovalmentaja: "⚽",
};

export function roleEmoji(role: string): string {
  const key = role.toLowerCase().trim();
  return ROLE_EMOJI[key] ?? "⭐";
}
