// energy.ts — pure Atlantis-energy simulator. No I/O, no Firestore.
//
// Ported VERBATIM from the bot (atlantis/src/energy/energy.ts) so the board here
// matches `npx tsx cli.ts --status` exactly. Keep the math identical — if the bot
// changes REGEN_MS or the replay rule, mirror it here.
//
// Energy is DERIVED, never stored: replay the timeline from an anchor (the season
// start, or a manual override) forward to now.
//
// REGEN MODEL (verified against the live game): regen is a PER-PLAYER 2h clock
// tied to a "depletion episode", NOT a global grid and NOT reset by every spend.
//
//   - A depletion episode BEGINS when a spend drops the player below 5 while they
//     were AT 5. The regen clock starts from THAT first spend: +1 at firstSpend+2h,
//     +4h, … Later spends within the episode subtract −1 but DO NOT move the
//     clock. When energy climbs back to 5/5 the clock STOPS. The next spend from
//     full starts a NEW episode with a fresh clock.
//   - ATTACK (−1): observed from battle_logs (each DAMAGE/BREACH time_utc). Floor 0.
//   - REGEN (+1): generated on the current episode's clock. Hard cap 5.
//
// All instants are UTC.

/** Energy cap and floor — hard limits (no gem / over-cap modelling). */
export const MAX_ENERGY = 5;

/** Regen cadence: +1 energy every 2h (the documented baseline rate). */
export const REGEN_MS = 2 * 60 * 60 * 1000;

/** Clamp to the hard 0–5 range. */
export function clampEnergy(energy: number): number {
  return Math.max(0, Math.min(MAX_ENERGY, energy));
}

/** A spend event: one DAMAGE or BREACH at a UTC instant. */
export interface EnergyAttackEvent {
  time_utc: string;
  type: "DAMAGE" | "BREACH";
}

export interface SimulateEnergyInput {
  /** Energy at the anchor instant — 5 by default, or a manual-override value. */
  startEnergy: number;
  /** The anchor instant (ISO): season conflict_start, or a manual edit time. */
  anchorAt: string;
  /** Season conflict_start (ISO) — origin of the regen grid (fixed cadence). */
  seasonStart: string;
  /** This player's DAMAGE/BREACH events (any range; filtered to the window here). */
  attackTimes: EnergyAttackEvent[];
  /** Replay up to this instant. */
  now: Date;
}

export interface SimulateEnergyResult {
  /** Derived current energy, 0–5. */
  energy: number;
  /** Attacks counted after the anchor (and up to `now`). */
  attacksSince: number;
  /** ISO of the most recent counted attack, or null if none. */
  lastAttackAt: string | null;
}

/** Full detail of an episode-based replay — energy plus the live regen clock. */
export interface EnergyState {
  /** Derived current energy, 0–5. */
  energy: number;
  /** Spends counted after the anchor (up to now). */
  attacksSince: number;
  /** ISO of the most recent counted spend, or null. */
  lastAttackAt: string | null;
  /**
   * The instant the NEXT regen +1 lands, or null when the player is full (5/5) —
   * no clock runs at full. On the current episode's grid (episodeStart + 2h·n).
   */
  nextRegenAt: string | null;
}

/**
 * Core episode replay: walk spends in time order, running the 2h regen clock of the
 * CURRENT depletion episode. An episode's clock is anchored to the first spend that
 * took the player below 5; it is NOT reset by later spends and STOPS when energy
 * returns to 5. Returns energy plus the next-regen instant (null at full).
 */
function replay(input: SimulateEnergyInput): EnergyState {
  const anchorMs = new Date(input.anchorAt).getTime();
  const nowMs = input.now.getTime();
  let energy = clampEnergy(input.startEnergy);

  if (anchorMs >= nowMs) {
    return { energy, attacksSince: 0, lastAttackAt: null, nextRegenAt: null };
  }

  const spends = input.attackTimes
    .map((e) => new Date(e.time_utc).getTime())
    .filter((t) => t > anchorMs && t <= nowMs)
    .sort((a, b) => a - b);

  // episodeStart = clock origin of the current below-5 episode, or null when full.
  let episodeStart: number | null = energy < MAX_ENERGY ? anchorMs : null;
  let attacksSince = 0;
  let lastAttackAt: string | null = null;

  // Apply all regen ticks in (from, upTo] on the current episode grid, stopping
  // early (and clearing the episode) if energy reaches full.
  const runRegen = (upTo: number): void => {
    if (episodeStart === null) return;
    for (let t = episodeStart + REGEN_MS; t <= upTo; t += REGEN_MS) {
      energy = clampEnergy(energy + 1);
      if (energy >= MAX_ENERGY) {
        episodeStart = null; // back to full → clock stops
        return;
      }
    }
  };

  for (const spend of spends) {
    runRegen(spend); // regen up to this spend on the current episode
    energy = clampEnergy(energy - 1);
    attacksSince++;
    lastAttackAt = new Date(spend).toISOString();
    // If this spend opened a new episode (was full → now below), start its clock.
    if (episodeStart === null && energy < MAX_ENERGY) episodeStart = spend;
  }

  runRegen(nowMs); // regen from the last event up to now

  // Next regen instant on the current episode grid (null if full / no clock).
  let nextRegenAt: string | null = null;
  if (episodeStart !== null && energy < MAX_ENERGY) {
    let t = episodeStart + REGEN_MS;
    while (t <= nowMs) t += REGEN_MS; // first tick strictly after now
    nextRegenAt = new Date(t).toISOString();
  }

  return { energy, attacksSince, lastAttackAt, nextRegenAt };
}

/** Replay anchor → now, returning current energy (+ spend stats). */
export function simulateEnergy(
  input: SimulateEnergyInput,
): SimulateEnergyResult {
  const { energy, attacksSince, lastAttackAt } = replay(input);
  return { energy, attacksSince, lastAttackAt };
}

/** Full state including the next-regen instant — for countdown displays. */
export function energyState(input: SimulateEnergyInput): EnergyState {
  return replay(input);
}

/**
 * Canonical player identity: trim, collapse inner whitespace, lowercase. The join
 * key between battle-log player names and player docs. Ported from the bot
 * (atlantis/src/players/types.ts).
 */
export function normalizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
