// useBattleLog.ts — recent battle-log events for the active season, newest-first.
// Fetches from /api/atlantis/battle-log (Netlify-Edge cached); the component filters
// and reveals-more client-side. No direct client→Firestore reads.

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
  events: BattleLogRow[];
}

export function useBattleLog() {
  const events = ref<BattleLogRow[]>([]);
  const seasonId = ref<string | null>(null);
  const pending = ref(true);
  const error = ref<string | null>(null);

  async function refresh() {
    pending.value = true;
    error.value = null;
    try {
      const data = await $fetch<BattleLogResponse>("/api/atlantis/battle-log");
      events.value = data.events;
      seasonId.value = data.seasonId;
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
