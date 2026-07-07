// derive-board.ts — pure energy-board derivation from raw season data.
// Ported verbatim from the bot's getPlayerEnergies (atlantis/src/players/players.ts)
// so the board matches CLI `--status`. No I/O: takes raw docs + `now`, returns rows.

/** Roster + override-anchor doc (players/{player_key}). */
export interface RawPlayer {
  player_key: string;
  name: string;
  is_member: boolean;
  atlantis_energy: number;
  last_energy_update_at: string;
  season_id: string;
}

/** One DAMAGE/BREACH spend (already filtered), from battle_log_events. */
export interface RawAttack {
  player_key: string;
  time_utc: string;
  type: "DAMAGE" | "BREACH";
}

export interface RawBoard {
  seasonId: string;
  conflictStartIso: string;
  players: RawPlayer[];
  attacks: RawAttack[];
}

/** Replay each player's season against `now` → sorted PlayerEnergy[]. */
export function deriveBoard(raw: RawBoard, now: Date): PlayerEnergy[] {
  const seasonStartMs = new Date(raw.conflictStartIso).getTime();

  const attacksByPlayer = new Map<string, EnergyAttackEvent[]>();
  for (const a of raw.attacks) {
    const list = attacksByPlayer.get(a.player_key) ?? [];
    list.push({ time_utc: a.time_utc, type: a.type });
    attacksByPlayer.set(a.player_key, list);
  }

  const rows: PlayerEnergy[] = raw.players.map((p) => {
    const attacks = attacksByPlayer.get(p.player_key) ?? [];
    const editMs = new Date(p.last_energy_update_at).getTime();
    const override = Number.isFinite(editMs) && editMs > seasonStartMs;
    const startEnergy = override ? p.atlantis_energy : MAX_ENERGY;
    const anchorAt = override ? p.last_energy_update_at : raw.conflictStartIso;

    const sim = energyState({
      startEnergy,
      anchorAt,
      seasonStart: raw.conflictStartIso,
      attackTimes: attacks,
      now,
    });

    return {
      name: p.name,
      is_member: p.is_member,
      energy: sim.energy,
      attacksSince: sim.attacksSince,
      lastAttackAt: sim.lastAttackAt,
      nextRegenAt: sim.nextRegenAt,
      season_id: raw.seasonId,
      inSeasonLogs: attacks.length > 0,
    };
  });

  // Highest-energy first; within a tier, soonest next-regen on top (full → last),
  // then alphabetical.
  const nextMs = (r: PlayerEnergy) =>
    r.nextRegenAt ? new Date(r.nextRegenAt).getTime() : Infinity;
  rows.sort(
    (a, b) =>
      b.energy - a.energy ||
      nextMs(a) - nextMs(b) ||
      a.name.localeCompare(b.name),
  );
  return rows;
}
