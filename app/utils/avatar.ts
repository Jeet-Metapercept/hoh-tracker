// avatar.ts — deterministic hero avatar per player name.
//
// Same name → same avatar, every time (stable hash → index into the hero set).
// The hero set is auto-derived from app/assets/heroes/*.webp via import.meta.glob,
// so it always matches whatever portraits are in that folder (no hardcoded list).

// Eagerly import every hero portrait; values are the bundled (hashed) URLs.
const heroModules = import.meta.glob<string>("~/assets/heroes/*.webp", {
  eager: true,
  import: "default",
});

// Stable, sorted list of avatar URLs (sorted so the index mapping is deterministic
// regardless of glob order).
const HERO_AVATARS = Object.keys(heroModules)
  .sort()
  .map((k) => heroModules[k]!);

/** Small stable string hash (djb2) — deterministic across sessions. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0; // unsigned
}

/**
 * The avatar image URL for a player name — deterministic, so the same player
 * always gets the same portrait. Normalizes the name (case/space-insensitive).
 */
export function avatarFor(name: string): string {
  if (HERO_AVATARS.length === 0) return "";
  const key = name.trim().toLowerCase();
  const idx = hashString(key) % HERO_AVATARS.length;
  return HERO_AVATARS[idx]!;
}
