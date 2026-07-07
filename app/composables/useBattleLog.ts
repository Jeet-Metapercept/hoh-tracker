// useBattleLog.ts — recent battle-log events for the active season, newest-first.
//
// Reads battle_log_events from Firestore (client SDK) for the current season and
// returns them ordered by time_utc descending — the feed for the timeline view.
// One-shot read + manual refresh (same snapshot model as useEnergyBoard).

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { useFirestore } from "vuefire";
import { pickSeason, toIso } from "~/utils/atlantis-season";

/** One battle-log event for the timeline (mirrors the bot's BattleLogEvent). */
export interface BattleLogRow {
  id: string;
  player: string | null;
  type: string;
  node: string | null;
  time_ist: string;
  time_utc: string;
  raw_text: string;
}

/**
 * Recent battle-log events for the active season, newest-first.
 * @param max how many events to fetch (default 40).
 */
function mapDoc(d: QueryDocumentSnapshot): BattleLogRow {
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
}

/** Hard cap on how many events we pull in one bulk load (bounds reads/memory). */
const MAX_TOTAL = 100;

/**
 * Battle log, newest-first. Pulls the season's events in ONE query (up to
 * MAX_TOTAL) so client-side filtering sees the whole set. No incremental
 * Firestore pagination — the component reveals more of this list locally.
 */
export function useBattleLog() {
  const events = ref<BattleLogRow[]>([]);
  const seasonId = ref<string | null>(null);
  const pending = ref(true);
  const error = ref<string | null>(null);

  /** Load the season's events (newest-first, capped at 1000). */
  async function refresh() {
    pending.value = true;
    error.value = null;
    try {
      const db = useFirestore();
      if (!db) throw new Error("Firestore not available.");
      const season = await pickSeason(db, new Date());
      if (!season) throw new Error("No season found in Firestore.");
      seasonId.value = season.season_id;

      const snap = await getDocs(
        query(
          collection(db, "battle_log_events"),
          where("season_id", "==", season.season_id),
          orderBy("time_utc", "desc"),
          limit(MAX_TOTAL),
        ),
      );
      events.value = snap.docs.map(mapDoc);
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      events.value = [];
    } finally {
      pending.value = false;
    }
  }

  onMounted(refresh);

  return { events, seasonId, pending, error, refresh };
}
