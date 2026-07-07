// Live energy board: fetch raw data from /api/atlantis/board (Edge-cached) and derive
// energy/countdown on the client against live `now`.
import { deriveBoard, type RawBoard } from "~/utils/derive-board";

type BoardResponse = RawBoard & { lastUpdatedAt: string | null };

export function useEnergyBoard() {
  const raw = ref<BoardResponse | null>(null);
  const seasonId = ref<string | null>(null);
  const lastUpdatedAt = ref<string | null>(null);
  const pending = ref(true);
  const error = ref<string | null>(null);

  // Derive rows against a ticking clock so the countdown recomputes each second.
  const now = useNow({ interval: 1000 });
  const rows = computed<PlayerEnergy[]>(() =>
    raw.value ? deriveBoard(raw.value, now.value) : [],
  );

  async function refresh() {
    pending.value = true;
    error.value = null;
    try {
      const data = await $fetch<BoardResponse>("/api/atlantis/board");
      raw.value = data;
      seasonId.value = data.seasonId;
      lastUpdatedAt.value = data.lastUpdatedAt ?? null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      raw.value = null;
      seasonId.value = null;
      lastUpdatedAt.value = null;
    } finally {
      pending.value = false;
    }
  }

  onMounted(refresh);

  return { rows, seasonId, lastUpdatedAt, pending, error, refresh };
}
