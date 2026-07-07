// useEnergyBoard.ts — the live Atlantis energy board, read client-side.
//
// Client port of the bot's getPlayerEnergies() (atlantis/src/players/players.ts):
// read the 3 Firestore collections (atlantis seasons, players roster,
// battle_log_events), replay each player's season with the pure simulator in
// utils/energy.ts, and return the same PlayerEnergy[] the CLI `--status` prints.
//
// One-shot reads (getDocs, not live listeners) + a manual refresh() — the board is
// derived against `now` on the client, so we don't need a persistent subscription.

import {
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { useFirestore } from "vuefire";
import { pickSeason, toIso, type SeasonDoc } from "~/utils/atlantis-season";

/** Roster + override-anchor doc (players/{player_key}). Ported from the bot. */
interface PlayerDoc {
  player_key: string;
  name: string;
  is_member: boolean;
  atlantis_energy: number;
  last_energy_update_at: string;
  season_id: string;
}

const ENERGY_TYPES = new Set(["DAMAGE", "BREACH"]);

/** The derived board plus the season it was computed against. */
interface BoardResult {
  rows: PlayerEnergy[];
  season: SeasonDoc;
}

/** Read all three collections and derive the board for `now`. */
async function fetchBoard(db: Firestore, now: Date): Promise<BoardResult> {
  // 1. Season
  const season = await pickSeason(db, now);
  if (!season) throw new Error("No season found in Firestore.");
  const seasonStartMs = new Date(season.conflict_start_iso).getTime();

  // 2. Players + 3. this season's spend events, in parallel
  const [playerSnap, eventSnap] = await Promise.all([
    getDocs(collection(db, "players")),
    getDocs(
      query(
        collection(db, "battle_log_events"),
        where("season_id", "==", season.season_id),
      ),
    ),
  ]);

  const players: PlayerDoc[] = playerSnap.docs.map((d) => {
    const x = d.data();
    return {
      player_key: String(x.player_key ?? d.id),
      name: String(x.name ?? d.id),
      is_member: Boolean(x.is_member),
      atlantis_energy: Number(x.atlantis_energy ?? MAX_ENERGY),
      last_energy_update_at: toIso(x.last_energy_update_at),
      season_id: String(x.season_id ?? ""),
    };
  });

  // Bucket DAMAGE/BREACH spends by player_key.
  const attacksByPlayer = new Map<string, EnergyAttackEvent[]>();
  for (const d of eventSnap.docs) {
    const e = d.data();
    const type = String(e.type ?? "");
    const player = e.player ? String(e.player) : "";
    if (!player || !ENERGY_TYPES.has(type)) continue;
    const key = e.player_key ? String(e.player_key) : normalizePlayerName(player);
    const list = attacksByPlayer.get(key) ?? [];
    list.push({ time_utc: toIso(e.time_utc), type: type as "DAMAGE" | "BREACH" });
    attacksByPlayer.set(key, list);
  }

  // Replay each player (same anchor rule as the bot).
  const rows: PlayerEnergy[] = players.map((p) => {
    const attacks = attacksByPlayer.get(p.player_key) ?? [];
    const editMs = new Date(p.last_energy_update_at).getTime();
    const override = Number.isFinite(editMs) && editMs > seasonStartMs;
    const startEnergy = override ? p.atlantis_energy : MAX_ENERGY;
    const anchorAt = override
      ? p.last_energy_update_at
      : season.conflict_start_iso;

    const sim = energyState({
      startEnergy,
      anchorAt,
      seasonStart: season.conflict_start_iso,
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
      season_id: season.season_id,
      inSeasonLogs: attacks.length > 0,
    };
  });

  // Highest-energy first; within a tier, soonest next-regen on top (closest to the
  // next energy), full players (no clock, Infinity) last, then alphabetical.
  // Plain multi-key comparator — no lib needed for ~20 rows sorted once.
  const nextMs = (r: PlayerEnergy) =>
    r.nextRegenAt ? new Date(r.nextRegenAt).getTime() : Infinity;
  rows.sort(
    (a, b) =>
      b.energy - a.energy || // 1) most energy first
      nextMs(a) - nextMs(b) || // 2) soonest regen first (full → last)
      a.name.localeCompare(b.name), // 3) alphabetical
  );
  return { rows, season };
}

/**
 * Live energy board. One-shot Firestore read on mount + manual refresh().
 * On any error (rules not yet propagated, offline) `rows` stays empty and the
 * component falls back to sample data; `error` carries the message.
 */
export function useEnergyBoard() {
  const rows = ref<PlayerEnergy[]>([]);
  const seasonId = ref<string | null>(null);
  const lastPostedAt = ref<string | null>(null);
  const pending = ref(true);
  const error = ref<string | null>(null);

  async function refresh() {
    pending.value = true;
    error.value = null;
    try {
      const db = useFirestore();
      if (!db) throw new Error("Firestore not available.");
      const result = await fetchBoard(db, new Date());
      rows.value = result.rows;
      seasonId.value = result.season.season_id;
      lastPostedAt.value = result.season.last_posted_at ?? null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      rows.value = [];
      seasonId.value = null;
      lastPostedAt.value = null;
    } finally {
      pending.value = false;
    }
  }

  // Client-only initial load.
  onMounted(refresh);

  return { rows, seasonId, lastPostedAt, pending, error, refresh };
}
