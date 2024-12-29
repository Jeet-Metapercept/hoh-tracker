<script setup lang="ts">
const colorMode = useColorMode();

const gaugePrimaryColor = computed(() => "rgb(233,0,82)");

const gaugeSecondaryColor = computed(() =>
  colorMode.value === "dark"
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)",
);

const value = ref(0);

let interval: ReturnType<typeof setInterval>;

onMounted(() => {
  interval = setInterval(() => {
    if (value.value < 100) {
      value.value += 10;
    } else {
      value.value = 0;
    }
  }, 5 * 1000);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>

<template>
  <div class="gague">
    <InspiraAnimatedCircularProgressBar
      :gauge-primary-color="gaugePrimaryColor"
      :gauge-secondary-color="gaugeSecondaryColor"
      :max="100"
      :min="0"
      :value="value"
    />

    <Button variant="outline" @click="value = value + 10">Button</Button>
  </div>
</template>
