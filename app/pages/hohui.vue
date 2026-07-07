<script setup lang="ts">
// Sample page — showcases the Heroes of History game-style UI kit.
// Styles live in app/assets/css/hoh/{tokens,components}.css; assets in
// public/hoh-style/. This is a playground to test buttons/panels/tables.
definePageMeta({ title: "HoH UI Kit", layout: "blank" });

const resources = [
  { name: "Coins", icon: "Coin", value: "1.2M" },
  { name: "Gems", icon: "Gem", value: "348" },
  { name: "Food", icon: "Food", value: "82K" },
  { name: "Energy", icon: "CampaignEnergy", value: "4/5" },
  { name: "Ambrosia", icon: "ambrosia", value: "17" },
  { name: "Crystals", icon: "icon_chrono_crystals", value: "9" },
];

const filters = ["All", "Attackers", "Defenders", "Support"];
const activeFilter = ref("All");

const heroes = [
  { name: "Achilles", file: "Unit_Achilles", tier: "S", role: "Attacker" },
  { name: "Cleopatra", file: "Unit_Cleopatra", tier: "A", role: "Support" },
  { name: "Joan of Arc", file: "Unit_JoanOfArc", tier: "S", role: "Defender" },
  { name: "Julius Caesar", file: "Unit_JuliusCaesar", tier: "A", role: "Attacker" },
  { name: "Einstein", file: "Unit_AlbertEinstein", tier: "B", role: "Support" },
  { name: "Hua Mulan", file: "Unit_HuaMulan", tier: "S", role: "Attacker" },
];

// Hero portraits now live in app/assets/heroes/ (bundled). Map file → URL.
const heroImages = import.meta.glob<string>("~/assets/heroes/*.webp", {
  eager: true,
  import: "default",
});
const heroSrc = (file: string) =>
  heroImages[
    Object.keys(heroImages).find((k) => k.endsWith(`/${file}.webp`)) ?? ""
  ] ?? "";

const stats = [
  { icon: "icon_unit_stat_BaseDamage", label: "Base Damage", value: "12,480" },
  { icon: "icon_unit_stat_AttackSpeed", label: "Attack Speed", value: "1.35/s" },
  { icon: "icon_unit_stat_CritChance", label: "Crit Chance", value: "24%" },
  { icon: "icon_unit_stat_CritDamage", label: "Crit Damage", value: "180%" },
  { icon: "icon_unit_stat_Evasion", label: "Evasion", value: "8%" },
];

const tiles = [
  { name: "Home", icon: "Navbar_Home" },
  { name: "Heroes", icon: "Navbar_Heroes" },
  { name: "Campaign", icon: "Navbar_Campaign" },
  { name: "Seasons", icon: "Navbar_Seasons" },
  { name: "Relics", icon: "Navbar_Relics" },
  { name: "Ranks", icon: "Navbar_Leaderboards" },
];

const count = ref(3);
const showModal = ref(false);
</script>

<template>
  <div
    class="min-h-screen py-8"
    style="
      background:
        radial-gradient(circle at 50% 0%, #5f97c2 0%, #2c5a7a 60%, #1d4468 100%);
    "
  >
    <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4">
      <!-- Header / brand -->
      <div class="flex items-center gap-4">
        <img src="/hoh-style/shared/logo.webp" alt="HoH" class="h-14 w-auto drop-shadow-lg" />
        <div>
          <h1 class="hoh-outline text-2xl font-bold uppercase tracking-wide text-white">
            Heroes of History — UI Kit
          </h1>
          <p class="text-sm text-white/80">Sample page · game-styled components</p>
        </div>
      </div>

      <!-- Resource bar -->
      <div class="flex flex-wrap gap-2">
        <div v-for="r in resources" :key="r.name" class="hoh-resource" :title="r.name">
          <img :src="`/hoh-style/resources/${r.icon}.webp`" :alt="r.name" class="h-6 w-6" />
          <span>{{ r.value }}</span>
        </div>
      </div>

      <!-- Buttons panel -->
      <section class="hoh-panel">
        <div class="hoh-panel-header">
          <Icon name="lucide:mouse-pointer-click" class="h-5 w-5" />
          Buttons & Controls
        </div>
        <div class="hoh-panel-body flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-3">
            <button class="hoh-btn">Primary</button>
            <button class="hoh-btn hoh-btn-gold">Gold</button>
            <button class="hoh-btn" disabled>Disabled</button>
          </div>

          <!-- Pill toggle group -->
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="f in filters"
              :key="f"
              class="hoh-toggle"
              :data-active="activeFilter === f"
              @click="activeFilter = f"
            >
              {{ f }}
            </button>
          </div>

          <!-- Chip stepper -->
          <div class="flex items-center gap-3">
            <button class="hoh-chip" @click="count = Math.max(0, count - 1)">−</button>
            <span class="min-w-8 text-center text-lg font-bold">{{ count }}</span>
            <button class="hoh-chip" @click="count++">+</button>
            <button class="hoh-btn ml-2" @click="showModal = true">Open Modal</button>
          </div>
        </div>
      </section>

      <!-- Menu tiles -->
      <section class="hoh-panel">
        <div class="hoh-panel-header">
          <Icon name="lucide:layout-grid" class="h-5 w-5" />
          Menu Tiles
        </div>
        <div class="hoh-panel-body">
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <button
              v-for="t in tiles"
              :key="t.name"
              class="hoh-tile flex flex-col items-center gap-1 px-2 pb-2 pt-3"
            >
              <img :src="`/hoh-style/navbar/${t.icon}.webp`" :alt="t.name" class="h-10 w-auto" />
              <span class="text-xs font-bold">{{ t.name }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Hero cards -->
      <section class="hoh-panel">
        <div class="hoh-panel-header">
          <Icon name="lucide:users" class="h-5 w-5" />
          Heroes
          <span class="ml-auto text-xs font-normal normal-case opacity-80">
            filter: {{ activeFilter }}
          </span>
        </div>
        <div class="hoh-panel-body">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div
              v-for="h in heroes"
              :key="h.name"
              class="flex items-center gap-3 rounded-lg border-2 p-2"
              style="background: #f8f5e6; border-color: var(--hoh-gold-border)"
            >
              <div class="relative">
                <img
                  :src="heroSrc(h.file)"
                  :alt="h.name"
                  class="h-16 w-14 rounded-md border-2 object-cover object-top"
                  style="border-color: var(--hoh-blue)"
                />
                <span
                  class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white hoh-outline"
                  style="background: var(--hoh-blue)"
                >
                  {{ h.tier }}
                </span>
              </div>
              <div class="leading-tight">
                <div class="text-sm font-bold" style="color: var(--hoh-gold-chip-text)">
                  {{ h.name }}
                </div>
                <div class="text-xs" style="color: var(--hoh-gold-deep)">{{ h.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats table -->
      <section class="hoh-panel">
        <div class="hoh-panel-header">
          <Icon name="lucide:bar-chart-3" class="h-5 w-5" />
          Unit Stats
        </div>
        <div class="hoh-panel-body">
          <table class="hoh-table">
            <thead>
              <tr>
                <th>Stat</th>
                <th class="text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in stats" :key="s.label">
                <td>
                  <span class="flex items-center gap-2">
                    <img :src="`/hoh-style/icons/${s.icon}.webp`" :alt="s.label" class="h-5 w-5" />
                    {{ s.label }}
                  </span>
                </td>
                <td class="text-right font-bold">{{ s.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p class="pt-2 text-center text-xs text-white/60">
        Styles: <code>app/assets/css/hoh/</code> · Assets: <code>public/hoh-style/</code>
      </p>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background: rgba(0, 0, 0, 0.5)"
          @click.self="showModal = false"
        >
          <div class="hoh-modal w-full max-w-sm p-6 text-center">
            <img
              src="/hoh-style/shared/icon_flat_portal_swirl.webp"
              alt=""
              class="mx-auto mb-3 h-16 w-16"
            />
            <h3 class="mb-2 text-lg font-bold">Chunky Blue Frame</h3>
            <p class="mb-4 text-sm">
              This modal uses the game's signature 7px border on a parchment surface.
            </p>
            <button class="hoh-btn" @click="showModal = false">Got it</button>
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
