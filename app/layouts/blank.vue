<script setup lang="ts">
// Blank layout — no header/footer, no padding. Full-bleed page canvas.
// Used by pages that render their own chrome (e.g. the HoH-styled sample page).
</script>

<template>
  <main class="min-h-screen">
    <slot />
  </main>
</template>
