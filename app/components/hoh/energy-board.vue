<script setup lang="ts">
// HohEnergyBoard — live Atlantis energy board (client-side).
// Data: useEnergyBoard() (Firestore read + energy replay). Shows a loading spinner
// while fetching, an error banner on failure, and an empty state. Countdown ticks
// every 1s. Styled with the HoH kit (hoh-panel/hoh-table).

import { formatDistanceToNow } from "date-fns";

const { rows, seasonId, lastPostedAt, pending, error, refresh } = useEnergyBoard();
const now = useNow({ interval: 1000 });

// Player-detail modal.
const lastAttackLabel = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true });
const selected = ref<PlayerEnergy | null>(null);
function openPlayer(r: PlayerEnergy) {
  selected.value = r;
}
function closePlayer() {
  selected.value = null;
}

// "Our team" = players active in THIS season's battle logs (had a DAMAGE/BREACH).
// The table and the banner both use this set. (is_member is not used for the
// filter — an idle full member who hasn't attacked this season won't appear.)
const members = computed(() => rows.value.filter((r) => r.inSeasonLogs));

// ── Summary totals (season participants) ──────────────────────────────────────
const totalEnergy = computed(() =>
  members.value.reduce((sum, r) => sum + r.energy, 0),
);
const maxEnergy = computed(() => members.value.length * MAX_ENERGY);
const fillPct = computed(() =>
  maxEnergy.value ? (totalEnergy.value / maxEnergy.value) * 100 : 0,
);

// Animate the number + bar ONCE, to the final value — only after loading settles,
// so we don't flicker 0→sample then 0→real. `settled` flips true the first time
// the fetch finishes (pending → false); until then we hold at 0.
const settled = ref(false);
watch(
  pending,
  (p) => {
    if (!p) settled.value = true;
  },
  { immediate: true },
);

// The target the animations run toward: 0 while unsettled, live value once ready.
const animTarget = computed(() => (settled.value ? totalEnergy.value : 0));
const barPct = ref(0);
watch(
  [settled, fillPct],
  ([isSettled, target]) => {
    if (!isSettled) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        barPct.value = target; // fill 0 → live once, on the next frame → smooth ease
      }),
    );
  },
  { immediate: true },
);
const seasonLabel = computed(() => `Season ${seasonId.value ?? "—"}`);

// ── Countdown formatting — "1h19m27s" / "39m36s" (matches cli.ts hms) ─────────
function countdown(nextRegenAt: string | null): string {
  if (!nextRegenAt) return "full";
  const ms = new Date(nextRegenAt).getTime() - now.value.getTime();
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
}

// "as of" = the bot's last_posted_at (when the board was last posted/updated),
// falling back to the client clock only for the sample view. `now` is referenced
// so the relative label re-renders as time passes.
const asOf = computed(() => {
  void now.value; // tick dependency so "x ago" stays fresh
  if (lastPostedAt.value) {
    return formatDistanceToNow(new Date(lastPostedAt.value), { addSuffix: true });
  }
  return "just now";
});

// Compact form for small screens: "8m ago", "3h ago", "2d ago".
const asOfShort = computed(() => {
  void now.value;
  if (!lastPostedAt.value) return "now";
  const s = Math.max(0, (now.value.getTime() - new Date(lastPostedAt.value).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Summary banner: total alliance energy + active conflict -->
    <div
      class="flex flex-col gap-4 rounded-[10px] px-5 py-4 shadow-[0_4px_8px_rgba(0,0,0,0.25)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
      style="
        background:
          repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.02) 0 6px,
              transparent 6px 12px
            ),
          linear-gradient(180deg, #2c5a7a 0%, #1d3a54 100%);
        border: 1px solid #14293b;
      "
    >
      <!-- Left: total -->
      <div>
        <div
          class="text-xs font-bold uppercase tracking-widest"
          style="color: var(--hoh-gold-header)"
        >
          Total Alliance Energy
        </div>
        <div class="mt-1 flex items-center gap-4">
          <div
            class="text-2xl font-extrabold leading-none text-white hoh-outline tabular-nums sm:text-4xl"
          >
            <VuebitsCountUp :to="animTarget" :duration="1.2" separator="," />
            <span class="text-white/50">/ {{ maxEnergy }}</span>
          </div>
          <div
            class="h-3 w-40 overflow-hidden rounded-full"
            style="background: #0e1f2e; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5)"
          >
            <div
              class="h-full rounded-full"
              :style="{
                width: `${barPct}%`,
                transition: 'width 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
                background:
                  'linear-gradient(90deg, var(--hoh-blue-light), var(--hoh-gold-header))',
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Right: active conflict -->
      <div class="text-left sm:text-right">
        <div
          class="text-xs font-bold uppercase tracking-widest"
          style="color: var(--hoh-gold-header)"
        >
          Active Conflict
        </div>
        <div class="mt-1 flex items-center gap-2 sm:justify-end">
          <span class="relative flex h-2.5 w-2.5">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style="background: #e23b3b"
            ></span>
            <span
              class="relative inline-flex h-2.5 w-2.5 rounded-full"
              style="background: #e23b3b"
            ></span>
          </span>
          <span class="text-lg font-bold text-white hoh-outline">{{ seasonLabel }}</span>
        </div>
      </div>
    </div>

    <section class="hoh-panel">
    <div class="hoh-panel-header">
      <img src="/hoh-style/resources/atlantis_energy.webp" alt="" class="h-6 w-6 shrink-0" />
      <span class="truncate">Atlantis Energy</span>
      <span
        class="ml-auto flex shrink-0 items-center gap-1.5 text-xs font-normal normal-case sm:gap-2"
      >
        <span
          v-if="lastPostedAt"
          class="whitespace-nowrap opacity-80"
          :title="lastPostedAt ?? ''"
        >
          <!-- compact on mobile, full on ≥sm -->
          <span class="sm:hidden">{{ asOfShort }}</span>
          <span class="hidden sm:inline">updated {{ asOf }}</span>
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
      <!-- Error banner -->
      <p
        v-if="error"
        class="mb-3 rounded border px-3 py-2 text-xs"
        style="border-color: var(--hoh-gold-border); background: #f8e6d6; color: #8a3d12"
      >
        Couldn't load the energy board — {{ error }}
      </p>

      <!-- Loading -->
      <div v-if="pending" class="flex justify-center py-8">
        <Icon name="svg-spinners:tadpole" class="h-8 w-8" style="color: var(--hoh-blue)" />
      </div>

      <!-- Empty -->
      <p
        v-else-if="members.length === 0"
        class="py-8 text-center text-sm"
        style="color: var(--hoh-gold-deep)"
      >
        No active players this season yet.
      </p>

      <div v-else class="-mx-2 overflow-x-auto px-2">
      <table class="hoh-table min-w-[420px]">
        <thead>
          <tr>
            <th class="whitespace-nowrap">Player</th>
            <th class="whitespace-nowrap" style="width: 140px">Energy</th>
            <th class="whitespace-nowrap text-right" style="width: 100px">Next +1 In</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in members" :key="r.name">
            <td class="font-bold">
              <button
                class="flex cursor-pointer items-center gap-2 text-left transition-colors hover:text-[var(--hoh-blue)]"
                :title="`View ${r.name}`"
                @click="openPlayer(r)"
              >
                <img
                  :src="avatarFor(r.name)"
                  :alt="r.name"
                  class="h-7 w-7 shrink-0 rounded-full border-2 object-cover object-top"
                  style="border-color: var(--hoh-gold-header); background: var(--hoh-blue)"
                />
                <span class="truncate underline decoration-dotted underline-offset-2">
                  {{ r.name }}
                </span>
              </button>
            </td>
            <td>
              <span class="flex items-center gap-2">
                <span class="flex gap-0.5">
                  <img
                    v-for="i in MAX_ENERGY"
                    :key="i"
                    src="/hoh-style/resources/atlantis_energy.webp"
                    alt=""
                    class="h-4 w-4 shrink-0 transition-[filter]"
                    :style="{
                      filter:
                        i <= r.energy
                          ? 'none'
                          : 'grayscale(1) opacity(0.3)',
                    }"
                  />
                </span>
                <span class="tabular-nums font-bold">{{ r.energy }}/{{ MAX_ENERGY }}</span>
              </span>
            </td>
            <td class="text-right">
              <span
                v-if="!r.nextRegenAt"
                class="font-bold"
                style="color: var(--hoh-gold-text)"
              >
                full
              </span>
              <span v-else class="tabular-nums" style="color: var(--hoh-gold-deep)">
                {{ countdown(r.nextRegenAt) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
    </section>

    <!-- Player detail modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selected"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0, 0, 0, 0.55)"
          @click.self="closePlayer"
        >
          <div class="hoh-modal w-full max-w-sm p-5">
            <!-- header -->
            <div class="flex items-center gap-3">
              <img
                :src="avatarFor(selected.name)"
                :alt="selected.name"
                class="h-14 w-14 shrink-0 rounded-full border-2 object-cover object-top"
                style="border-color: var(--hoh-gold-header); background: var(--hoh-blue)"
              />
              <div class="min-w-0">
                <h3 class="truncate text-lg font-bold">{{ selected.name }}</h3>
                <p class="text-xs" style="color: var(--hoh-gold-deep)">
                  {{ selected.is_member ? "Alliance member" : "Player" }}
                </p>
              </div>
              <button
                class="ml-auto rounded p-1 hover:bg-black/10"
                title="Close"
                @click="closePlayer"
              >
                <Icon name="lucide:x" class="h-5 w-5" />
              </button>
            </div>

            <!-- energy -->
            <div class="mt-4 flex items-center gap-2">
              <img
                v-for="i in 5"
                :key="i"
                src="/hoh-style/resources/atlantis_energy.webp"
                alt=""
                class="h-6 w-6"
                :style="{ filter: i <= selected.energy ? 'none' : 'grayscale(1) opacity(0.3)' }"
              />
              <span class="ml-1 text-lg font-bold tabular-nums">{{ selected.energy }}/{{ MAX_ENERGY }}</span>
            </div>

            <!-- stats -->
            <dl class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between border-b pb-1" style="border-color: var(--hoh-gold-border)">
                <dt style="color: var(--hoh-gold-deep)">Next Energy In</dt>
                <dd class="font-bold tabular-nums">
                  {{ selected.nextRegenAt ? countdown(selected.nextRegenAt) : "Full" }}
                </dd>
              </div>
              <div class="flex justify-between border-b pb-1" style="border-color: var(--hoh-gold-border)">
                <dt style="color: var(--hoh-gold-deep)">Attacks this season</dt>
                <dd class="font-bold tabular-nums">{{ selected.attacksSince }}</dd>
              </div>
              <div class="flex justify-between">
                <dt style="color: var(--hoh-gold-deep)">Last attack</dt>
                <dd class="font-bold">
                  {{ selected.lastAttackAt ? lastAttackLabel(selected.lastAttackAt) : "—" }}
                </dd>
              </div>
            </dl>

            <button class="hoh-btn mt-5 w-full" @click="closePlayer">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
