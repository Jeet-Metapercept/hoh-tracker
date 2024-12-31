<script setup lang="ts">
const config = useAppConfig();
definePageMeta({
  title: "meta.home.title",
});
</script>

<template>
  <section class="container max-w-7xl mt-16 grid place-items-center">
    <section class="text-center">
      <h1 class="text-5xl font-bold mb-3">
        {{ config.nuxtSiteConfig_name }}
      </h1>
      <p class="text-muted-foreground">
        {{ config.nuxtSiteConfig_description }}
      </p>
    </section>

    <div class="flex flex-col justify-center gap-3 w-full">
      <HohStatus />
      <!-- <HohFirebase /> -->
    </div>
  </section>
</template>
