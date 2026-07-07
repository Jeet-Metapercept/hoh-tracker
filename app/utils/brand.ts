// brand.ts — alliance branding constants. Change these to re-skin the header:
// name, emblem image, and current rank. Auto-imported (app/utils/).

/** Alliance display name shown in the page header. */
export const ALLIANCE_NAME = "HUN EMPIRE";

/**
 * Alliance emblem image, served from public/. Drop a transparent PNG/WEBP at this
 * path to change it — no code edit needed.
 */
export const ALLIANCE_EMBLEM = "/hoh-style/tiers/icon_PvP_Tier_Overlord.webp";

/** Current alliance rank (leaderboard position), or null to hide the badge. */
export const ALLIANCE_RANK: number | null = null;

/** Subtitle/tagline shown under the alliance name. */
export const ALLIANCE_TAGLINE = "Atlantis Sentinel · Battle for Atlantis";

/** Fallback image if the emblem is missing/broken. */
export const ALLIANCE_EMBLEM_FALLBACK = "/hoh-style/shared/logo.webp";

/** Alliance Discord invite. */
export const DISCORD_URL = "https://discord.gg/JXfRHNZVg";
