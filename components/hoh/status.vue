<script setup lang="ts">
const config = useRuntimeConfig();
const colorMode = useColorMode();

const gaugePrimaryColor = computed(() => "rgb(233,0,82)");

const gaugeSecondaryColor = computed(() =>
  colorMode.value === "dark"
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)",
);

const value = ref(0);

// let interval: ReturnType<typeof setInterval>;

// onMounted(() => {
//   interval = setInterval(() => {
//     if (value.value < 100) {
//       value.value += 10;
//     } else {
//       value.value = 0;
//     }
//   }, 5 * 1000);
// });

// onBeforeUnmount(() => {
//   clearInterval(interval);
// });


const { data, pending, error } = await useFetch('/api/list', {headers: {Authorization: config.apiKey}});
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

    <!-- list of status -->
    <div class="my-8 mx-auto">
    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-8">
      <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-red-500 p-4 rounded-lg bg-red-50">
      {{ error.message }}
    </div>

    <!-- Items list -->
    <ul v-else v-auto-animate class="space-y-2">
      <li
        v-for="item in data?.data || []"
        :key="item.id"
        class="p-3 rounded-lg cursor-pointer hover:ring-1 ring-primary ring-opacity-20"
      >
        {{ item.step }}
      </li>
      
      <li v-if="data && !data.data.length" class="text-center text-gray-500 py-4">
        No items available
      </li>
    </ul>
  </div>
  </div>
</template>
