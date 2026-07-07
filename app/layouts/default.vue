<script setup lang="ts">
const colorMode = useColorMode();
const links = computed<Link[]>(() => [{ name: "HoH Tracker", to: "/" }]);

const _socials: Link[] = [
  {
    to: "https://www.x.com",
    icon: "bi:twitter-x",
    name: "X",
  },
  {
    to: "https://www.instagram.com",
    icon: "bi:instagram",
    name: "Instagram",
  },
  {
    to: "https://www.linkedin.com",
    icon: "bi:linkedin",
    name: "LinkedIn",
  },
];
</script>

<template>
  <div>
    <LayoutHeader :links="links">
      <NuxtLink
        to="/atlantis"
        class="flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-white/25"
        title="Battle for Atlantis dashboard"
      >
        <Icon name="lucide:swords" class="h-4 w-4" />
        <span class="hidden sm:inline">Atlantis</span>
      </NuxtLink>
      <LayoutColorModeMenu
        :color-mode="colorMode.preference"
        @update:color-mode="colorMode.preference = $event"
      />
    </LayoutHeader>
    <main class="pt-[65px] min-h-screen">
      <slot />
    </main>
    <!-- <LayoutFooter :link-groups="linkGroups" :socials="socials" /> -->
  </div>
</template>
