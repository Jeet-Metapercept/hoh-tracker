// Recent battle-log events from /api/atlantis/battle-log (Edge-cached); the component
// filters and reveals-more client-side. Loaded ON DEMAND (not on mount) — the first
// refresh() is triggered by the user, so idle visitors never hit Firestore.

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

interface BattleLogResponse {
  seasonId: string;
  lastUpdatedAt: string | null;
  events: BattleLogRow[];
}

export function useBattleLog() {
  const events = ref<BattleLogRow[]>([]);
  const seasonId = ref<string | null>(null);
  const lastUpdatedAt = ref<string | null>(null);
  const pending = ref(false);
  const hasLoaded = ref(false); // true once the first fetch resolves
  const error = ref<string | null>(null);

  async function refresh() {
    pending.value = true;
    error.value = null;
    try {
      const data = await $fetch<BattleLogResponse>("/api/atlantis/battle-log");
      events.value = data.events;
      seasonId.value = data.seasonId;
      lastUpdatedAt.value = data.lastUpdatedAt ?? null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      events.value = [];
    } finally {
      pending.value = false;
      hasLoaded.value = true;
    }
  }

  return { events, seasonId, lastUpdatedAt, pending, hasLoaded, error, refresh };
}
