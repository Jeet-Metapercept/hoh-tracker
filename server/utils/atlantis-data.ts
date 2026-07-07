// atlantis-data.ts — the single place that reads Atlantis data from Firestore.
// Used by the /api/atlantis/* endpoints (which the Netlify Edge caches via swr).
// Returns RAW JSON only; energy math is derived on the client (utils/derive-board).
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { pickSeason, toIso } from "~/utils/atlantis-season";
import { MAX_ENERGY, normalizePlayerName } from "~/utils/energy";
import type { RawBoard } from "~/utils/derive-board";
import type { BattleLogRow } from "~/composables/useBattleLog";

const ENERGY_TYPES = new Set(["DAMAGE", "BREACH"]);
const MAX_EVENTS = 100;

/** Raw energy-board data for the active season (no energy math). */
export async function readBoard(): Promise<RawBoard & { lastUpdatedAt: string | null }> {
  const db = serverDb();
  const season = await pickSeason(db, new Date());
  if (!season) throw createError({ statusCode: 404, statusMessage: "No season found." });

  const [playerSnap, eventSnap] = await Promise.all([
    getDocs(collection(db, "players")),
    getDocs(
      query(collection(db, "battle_log_events"), where("season_id", "==", season.season_id)),
    ),
  ]);

  const players = playerSnap.docs.map((d) => {
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

  const attacks: RawBoard["attacks"] = [];
  for (const d of eventSnap.docs) {
    const e = d.data();
    const type = String(e.type ?? "");
    const player = e.player ? String(e.player) : "";
    if (!player || !ENERGY_TYPES.has(type)) continue;
    const player_key = e.player_key ? String(e.player_key) : normalizePlayerName(player);
    attacks.push({ player_key, time_utc: toIso(e.time_utc), type: type as "DAMAGE" | "BREACH" });
  }

  return {
    seasonId: season.season_id,
    conflictStartIso: season.conflict_start_iso,
    lastUpdatedAt: season.last_updated_at ?? null,
    players,
    attacks,
  };
}

/** Recent battle-log events for the active season, newest-first (capped). */
export async function readBattleLog(): Promise<{ seasonId: string; events: BattleLogRow[] }> {
  const db = serverDb();
  const season = await pickSeason(db, new Date());
  if (!season) throw createError({ statusCode: 404, statusMessage: "No season found." });

  const snap = await getDocs(
    query(
      collection(db, "battle_log_events"),
      where("season_id", "==", season.season_id),
      orderBy("time_utc", "desc"),
      limit(MAX_EVENTS),
    ),
  );

  const events: BattleLogRow[] = snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      player: x.player ? String(x.player) : null,
      type: String(x.type ?? ""),
      node: x.node ? String(x.node) : null,
      time_ist: String(x.time_ist ?? ""),
      time_utc: toIso(x.time_utc),
      raw_text: String(x.raw_text ?? ""),
    };
  });

  return { seasonId: season.season_id, events };
}
