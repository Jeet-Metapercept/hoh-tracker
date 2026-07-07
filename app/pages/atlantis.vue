<script setup lang="ts">
// Atlantis page — the live alliance dashboard: energy board + battle log timeline.
// Branding constants in app/utils/brand.ts; components in app/components/hoh/.
definePageMeta({ title: "Battle for Atlantis", layout: "blank" });

// SEO / social share for this page.
useSeoMeta({
  title: `Atlantis Sentinel`,
  description: `${ALLIANCE_NAME} · Battle for Atlantis`,
  ogTitle: `${ALLIANCE_NAME} · Battle for Atlantis`,
  ogDescription: `${ALLIANCE_NAME} · Battle for Atlantis`,
  ogImage: "/hoh-style/bg/hero-bg.webp",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterImage: "/hoh-style/bg/hero-bg.webp",
});

// Show a styled shield placeholder if the emblem image is missing/broken.
const emblemBroken = ref(false);
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden py-8"
    style="
      background:
        radial-gradient(circle at 50% 0%, #5f97c2 0%, #2c5a7a 60%, #1d4468 100%);
    "
  >
    <!-- Faded hero key-art background (fixed, behind everything) -->
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style="
        background-image:
          linear-gradient(to bottom, rgba(29, 68, 104, 0.72), rgba(29, 68, 104, 0.92)),
          url('/hoh-style/bg/hero-bg.webp');
      "
    ></div>

    <!-- Animated light-rays background (fixed to viewport, behind content) -->
    <ClientOnly>
      <div class="pointer-events-none fixed inset-0 z-0 opacity-100">
        <VuebitsLightRays
          rays-origin="top-center"
          rays-color="#d6f4ff"
          :rays-speed="1.7"
          :light-spread="1.4"
          :ray-length="2.2"
          :pulsating="true"
          :fade-distance="1.6"
          :saturation="1.2"
          :follow-mouse="true"
          :mouse-influence="0.15"
          :noise-amount="0.04"
          :distortion="0.06"
        />
      </div>
    </ClientOnly>

    <div class="relative z-10 mx-auto flex max-w-4xl flex-col gap-6 px-4">
      <!-- Header / alliance brand -->
      <div class="flex items-center gap-4">
        <div class="relative shrink-0">
          <img
            :src="emblemBroken ? ALLIANCE_EMBLEM_FALLBACK : ALLIANCE_EMBLEM"
            :alt="ALLIANCE_NAME"
            class="h-16 w-auto drop-shadow-lg"
            @error="emblemBroken = true"
          />
          <span
            v-if="ALLIANCE_RANK != null"
            class="hoh-outline absolute -bottom-1 -left-1 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-extrabold text-white"
            style="background: var(--hoh-premier, #e90052)"
          >
            #{{ ALLIANCE_RANK }}
          </span>
        </div>
        <div class="min-w-0">
          <h1
            class="hoh-outline text-2xl font-extrabold uppercase tracking-wide text-white sm:text-3xl"
          >
            {{ ALLIANCE_NAME }}
          </h1>
          <p class="text-xs text-white/80 sm:text-sm">{{ ALLIANCE_TAGLINE }}</p>
        </div>

        <!-- Discord — right end of the header -->
        <a
          :href="DISCORD_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow transition-transform hover:scale-105"
          style="background: #5865f2"
          title="Join our Discord"
        >
          <Icon name="simple-icons:discord" class="h-4 w-4" />
          <span class="hidden sm:inline">Discord</span>
        </a>
      </div>

      <!-- Live energy board -->
      <ClientOnly>
        <HohEnergyBoard />
      </ClientOnly>

      <!-- Battle log timeline -->
      <ClientOnly>
        <HohBattleTimeline />
      </ClientOnly>
    </div>
  </div>
</template>
