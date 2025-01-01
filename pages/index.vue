<script setup lang="ts">
// const config = useAppConfig();
definePageMeta({
  title: "HoH Tracker",
});
</script>

<template>
  <section class="container px-0">
    <div class="flex flex-col justify-center gap-3 w-full">
      <HohStatus />
      <!-- <HohFirebase /> -->
    </div>
  </section>
</template>
