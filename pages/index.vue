<script setup lang="ts">
defineProps<{ package: object }>();
const config = useAppConfig();
definePageMeta({
  title: "meta.home.title",
});
</script>

<template>
  <section class="container my-16 grid place-items-center">
    <section class="grid text-center">
      <h1 class="text-5xl font-bold mb-3">
        {{ config.nuxtSiteConfig_name }}
      </h1>
      <p class="text-muted-foreground">
        {{ config.nuxtSiteConfig_description }}
      </p>
      <div class="flex flex-wrap justify-center gap-3 my-10">
        <InspiraAnimatedCircularProgressBar />
      </div>
    </section>
  </section>
</template>
