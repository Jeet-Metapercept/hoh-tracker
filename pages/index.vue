<script setup lang="ts">
// const config = useAppConfig();
definePageMeta({
  title: "HoH Tracker",
});
</script>

<template>
  <section class="container px-0">
    <!-- <div class="text-center">
      <h1 class="text-5xl font-bold mb-3">
        {{ config.nuxtSiteConfig_name }}
      </h1>
      <p class="text-muted-foreground">
        {{ config.nuxtSiteConfig_description }}
      </p>
    </div> -->

    <!-- <div class="space-y-1 text-center">
      <h4 class="text-xl font-medium leading-none">
        {{ config.nuxtSiteConfig_name }}

      </h4>
      <p class="text-sm text-muted-foreground">
        {{ config.nuxtSiteConfig_description }}
      </p>
    </div> -->

    <div class="flex flex-col justify-center gap-3 w-full">
      <HohStatus />
      <!-- <HohFirebase /> -->
    </div>
  </section>
</template>
