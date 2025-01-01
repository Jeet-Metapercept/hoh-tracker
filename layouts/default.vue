<script setup lang="ts">
const colorMode = useColorMode();
const linkGroups = computed(() => [
  {
    name: "Main Links",
    links: [{ name: "HoH Tracker", to: "/" }],
  },
]);

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
    <LayoutHeader :links="linkGroups[0].links">
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
