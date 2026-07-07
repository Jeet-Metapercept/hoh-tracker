<script setup lang="ts">
// HohBattleTimeline — recent battle-log events as a vertical timeline (a gradient
// rail with a colored dot per event), styled with the HoH kit. Data: useBattleLog()
// (Firestore, newest-first, bulk-loaded up to 1000; type/member/slot filters +
// client-side reveal-more, all client-side).

import { formatDistanceToNow } from "date-fns";

const { events, seasonId, pending, error, refresh } = useBattleLog();
const now = useNow({ interval: 30000 }); // refresh relative labels every 30s

// Client-side "reveal more": show PAGE at a time from the filtered list.
const PAGE = 10;
const visibleCount = ref(PAGE);
function loadMore() {
  visibleCount.value += PAGE;
}

// All loaded events, before filters.
const loaded = computed(() => events.value);

// ── Filters (client-side, over the loaded events) ─────────────────────────────
const typeFilter = ref<string | null>(null); // null = all types
const playerFilter = ref<string | null>(null); // null = all players
const nodeFilter = ref<string | null>(null); // null = all nodes/slots

// Distinct players present in the loaded set (for the player dropdown).
const playerOptions = computed(() =>
  [...new Set(loaded.value.map((e) => e.player).filter(Boolean))].sort() as string[],
);

// Distinct nodes/slots (e.g. B17, C22), sorted by letter then number.
const nodeOptions = computed(() =>
  ([...new Set(loaded.value.map((e) => e.node).filter(Boolean))] as string[]).sort(
    (a, b) => {
      const [, la = "", na = ""] = /^([A-Za-z]*)(\d*)$/.exec(a) ?? [];
      const [, lb = "", nb = ""] = /^([A-Za-z]*)(\d*)$/.exec(b) ?? [];
      return la === lb ? Number(na) - Number(nb) : la.localeCompare(lb);
    },
  ),
);

// Full filtered list (all matches), then the visible slice ("reveal more").
const filtered = computed(() =>
  loaded.value.filter(
    (e) =>
      (!typeFilter.value || e.type === typeFilter.value) &&
      (!playerFilter.value || e.player === playerFilter.value) &&
      (!nodeFilter.value || e.node === nodeFilter.value),
  ),
);
const feed = computed(() => filtered.value.slice(0, visibleCount.value));
const canLoadMore = computed(() => visibleCount.value < filtered.value.length);

const isFiltered = computed(
  () => !!typeFilter.value || !!playerFilter.value || !!nodeFilter.value,
);
function clearFilters() {
  typeFilter.value = null;
  playerFilter.value = null;
  nodeFilter.value = null;
}

// Reset the reveal count whenever the filter changes, so a new filter starts
// from the top (and Load more reflects the new result set).
watch([typeFilter, playerFilter, nodeFilter], () => {
  visibleCount.value = PAGE;
});

// ── Type → color + icon (game-log semantics) ──────────────────────────────────
// Each type gets a distinct, well-separated color.
const TYPE_META: Record<string, { color: string; icon: string; label: string }> = {
  DAMAGE: { color: "#c0392b", icon: "lucide:swords", label: "Damage" }, // red
  BREACH: { color: "#e8590c", icon: "lucide:flame", label: "Breach" }, // orange-red
  GARRISON: { color: "#7048e8", icon: "lucide:shield", label: "Garrison" }, // violet
  WITHDRAW: { color: "#e6a817", icon: "lucide:log-out", label: "Withdraw" }, // amber
  REPAIR: { color: "#1c7ed6", icon: "lucide:wrench", label: "Repair" }, // blue
  HEAL: { color: "#12b886", icon: "lucide:heart-pulse", label: "Heal" }, // teal
  GAIN_CONTROL: { color: "#2f9e44", icon: "lucide:flag", label: "Gained control" }, // green
  LOSE_CONTROL: { color: "#a61e4d", icon: "lucide:flag-off", label: "Lost control" }, // maroon-pink
  SLOT_LOST: { color: "#868e96", icon: "lucide:circle-slash", label: "Slot lost" }, // grey
};
function meta(type: string) {
  return (
    TYPE_META[type] ?? { color: "#555", icon: "lucide:dot", label: type }
  );
}

// Legend = every event type the backend can push (the full canonical set),
// in TYPE_META order. Each entry keeps its `type` key so it doubles as a filter.
const legend = Object.entries(TYPE_META).map(([type, m]) => ({ type, ...m }));
function toggleType(type: string) {
  typeFilter.value = typeFilter.value === type ? null : type;
}

function ago(iso: string): string {
  void now.value; // tick dependency
  if (!iso) return "";
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}
// Format the event's UTC instant in the VIEWER's local timezone (browser default),
// so everyone sees times in their own zone — not hardcoded IST.
function localTime(row: BattleLogRow): string {
  if (!row.time_utc) return "";
  return new Date(row.time_utc).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
</script>

<template>
  <section class="hoh-panel">
    <div class="hoh-panel-header">
      <img
        src="/hoh-style/icons/icon_unit_stat_AttackSpeed.webp"
        alt=""
        class="h-5 w-5 shrink-0"
      />
      <span class="truncate">Battle Log</span>
      <span
        class="ml-auto flex shrink-0 items-center gap-1.5 text-xs font-normal normal-case sm:gap-2"
      >
        <span v-if="seasonId" class="whitespace-nowrap opacity-80">
          <span class="sm:hidden">{{ seasonId }}</span>
          <span class="hidden sm:inline">Season {{ seasonId }}</span>
        </span>
        <button
          class="rounded px-1.5 py-0.5 text-white/90 hover:bg-white/15"
          :disabled="pending"
          title="Refresh"
          @click="refresh"
        >
          <Icon
            :name="pending ? 'svg-spinners:tadpole' : 'lucide:refresh-cw'"
            class="h-4 w-4"
          />
        </button>
      </span>
    </div>

    <div class="hoh-panel-body">
      <!-- Filters: clickable type chips + player dropdown -->
      <div
        class="mb-4 rounded-md border px-3 py-3"
        style="border-color: var(--hoh-gold-border); background: #f8f5e6"
      >
        <!-- Player + node filters + clear -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <!-- Members -->
          <div class="flex flex-1 flex-col gap-1">
            <label class="text-xs font-bold" style="color: var(--hoh-gold-deep)">Members</label>
            <select
              v-model="playerFilter"
              class="w-full rounded border px-2 py-1.5 text-xs"
              style="border-color: var(--hoh-gold-border); background: #fff; color: var(--hoh-gold-chip-text)"
            >
              <option :value="null">All Members</option>
              <option v-for="p in playerOptions" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <!-- Slot -->
          <div class="flex flex-1 flex-col gap-1">
            <label class="text-xs font-bold" style="color: var(--hoh-gold-deep)">Slot</label>
            <select
              v-model="nodeFilter"
              class="w-full rounded border px-2 py-1.5 text-xs"
              style="border-color: var(--hoh-gold-border); background: #fff; color: var(--hoh-gold-chip-text)"
            >
              <option :value="null">All Slots</option>
              <option v-for="n in nodeOptions" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>

        <!-- Type filter buttons (also serve as the legend). -->
        <div class="mt-3 flex flex-wrap gap-2 border-t pt-3" style="border-color: var(--hoh-gold-border)">
          <button
            v-for="l in legend"
            :key="l.type"
            class="hoh-toggle group flex items-center justify-center !px-2 !py-1 text-[11px] leading-none"
            :data-active="typeFilter === l.type"
            :class="typeFilter && typeFilter !== l.type ? 'opacity-60 hover:opacity-100' : ''"
            :title="`Filter: ${l.label}`"
            @click="toggleType(l.type)"
          >
            <span
              class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-white"
              :style="{ background: l.color }"
            >
              <Icon :name="l.icon" class="h-2 w-2" />
            </span>
            <span
              class="overflow-hidden whitespace-nowrap transition-all duration-200"
              :class="
                typeFilter === l.type
                  ? 'ml-0.5 max-w-[140px]'
                  : 'max-w-0 group-hover:ml-0.5 group-hover:max-w-[140px]'
              "
            >{{ l.label }}</span>
          </button>
        </div>

        <!-- Clear filters — only shown when a filter is active. Full width on
             mobile, constrained on web. -->
        <button
          v-if="isFiltered"
          class="mt-3 flex w-full items-center justify-center gap-1 rounded px-6 py-1.5 text-xs font-bold sm:w-auto"
          style="background: var(--hoh-blue); color: #fff"
          @click="clearFilters"
        >
          <Icon name="lucide:x" class="h-3 w-3" /> Clear
        </button>
      </div>

      <!-- Error banner -->
      <div
        v-if="error"
        class="mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-xs"
        style="border-color: var(--hoh-gold-border); background: #f8e6d6; color: #8a3d12"
      >
        <span class="flex-1">Couldn't load the battle log. Please try again.</span>
        <button
          class="shrink-0 rounded px-2 py-1 font-bold text-white"
          :disabled="pending"
          style="background: var(--hoh-blue)"
          @click="refresh"
        >
          Retry
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="pending" class="flex justify-center py-8">
        <Icon name="svg-spinners:tadpole" class="h-8 w-8" style="color: var(--hoh-blue)" />
      </div>

      <!-- Timeline rail: a continuous line with a dot per event -->
      <div v-else class="relative">
        <!-- the vertical line -->
        <span
          class="absolute bottom-2 left-4 top-2 w-0.5"
          style="background: linear-gradient(180deg, var(--hoh-blue), var(--hoh-gold-border))"
          aria-hidden="true"
        ></span>

        <div
          v-for="ev in feed"
          :key="ev.id"
          class="relative mb-5 flex items-start gap-4 pl-0"
        >
          <!-- dot (always visible, colored by type) -->
          <span class="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full text-white shadow"
              :style="{ background: meta(ev.type).color, outline: '3px solid var(--hoh-cream)' }"
              :title="ev.type"
            >
              <Icon :name="meta(ev.type).icon" class="h-4 w-4" />
            </span>
          </span>

          <!-- body card -->
          <div
            class="min-w-0 flex-1 rounded-lg border px-3 py-2"
            style="background: #f8f5e6; border-color: var(--hoh-gold-border)"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                :style="{ background: meta(ev.type).color }"
              >
                {{ meta(ev.type).label }}
              </span>
              <span
                v-if="ev.player"
                class="text-sm font-bold"
                style="color: var(--hoh-gold-chip-text)"
              >
                {{ ev.player }}
              </span>
              <button
                v-if="ev.node"
                class="rounded border px-1.5 py-0.5 text-[10px] font-bold text-[var(--hoh-blue)] transition-colors hover:bg-[var(--hoh-blue)] hover:text-white"
                style="border-color: var(--hoh-blue)"
                :title="`Filter slot ${ev.node}`"
                @click="nodeFilter = nodeFilter === ev.node ? null : ev.node"
              >
                {{ ev.node }}
              </button>
              <span
                class="ml-auto hidden shrink-0 whitespace-nowrap text-xs tabular-nums sm:inline"
                style="color: var(--hoh-gold-deep)"
              >
                {{ ago(ev.time_utc) }}
              </span>
            </div>

            <p class="mt-1 text-sm" style="color: #5a4a1e">{{ ev.raw_text }}</p>
            <div
              class="mt-0.5 flex items-center gap-2 text-xs tabular-nums"
              style="color: var(--hoh-gold-deep)"
            >
              <span>{{ localTime(ev) }}</span>
              <span class="ml-auto sm:hidden">{{ ago(ev.time_utc) }}</span>
            </div>
          </div>
        </div>

        <p
          v-if="!pending && feed.length === 0"
          class="py-6 text-center text-sm"
          style="color: var(--hoh-gold-deep)"
        >
          <template v-if="isFiltered">
            No events match this filter.
            <button class="ml-1 font-bold underline" @click="clearFilters">
              Clear
            </button>
          </template>
          <template v-else>No events yet this season.</template>
        </p>
      </div>

      <!-- Load more (reveals more of the filtered list; only when 10+ remain) -->
      <div v-if="canLoadMore" class="mt-2 flex justify-center">
        <button class="hoh-btn !px-4 !py-1.5 text-xs" @click="loadMore">
          Load more
        </button>
      </div>

      <!-- Result count (below the list / load more) -->
      <p
        v-if="!pending && feed.length > 0"
        class="mt-3 text-center text-xs"
        style="color: var(--hoh-gold-deep)"
      >
        <template v-if="isFiltered">
          Showing {{ feed.length }} of {{ filtered.length }} match{{
            filtered.length === 1 ? "" : "es"
          }}
          ({{ loaded.length }} events)
        </template>
        <template v-else>
          Showing {{ feed.length }} of {{ loaded.length }} events
        </template>
      </p>
    </div>
  </section>
</template>
