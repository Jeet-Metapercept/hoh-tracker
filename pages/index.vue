<script setup lang="ts">
const config = useAppConfig();
definePageMeta({
  title: "meta.home.title",
});

const colorMode = useColorMode();

const gaugePrimaryColor = computed(() => "rgb(233,0,82)");

const gaugeSecondaryColor = computed(() =>
  colorMode.value === "dark"
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)",
);

const value = ref(0);
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
      <div class="flex flex-col justify-center gap-6 my-10">
        <InspiraAnimatedCircularProgressBar
          :gauge-primary-color="gaugePrimaryColor"
          :gauge-secondary-color="gaugeSecondaryColor"
          :max="100"
          :min="0"
          :value="value"
        />

        <Button variant="outline" @click="value = value + 10">Button</Button>
      </div>
    </section>
  </section>
</template>
