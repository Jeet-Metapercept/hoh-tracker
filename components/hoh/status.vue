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

const { data, pending, error } = await useFetch("/api/list", {
  headers: { Authorization: config.apiKey },
});
</script>

<template>
  <div class="gague max-w-6xl">
    <div class="flex flex-col justify-center gap-8 my-8">
      <div class="flex justify-center">
        <InspiraAnimatedCircularProgressBar
          :gauge-primary-color="gaugePrimaryColor"
          :gauge-secondary-color="gaugeSecondaryColor"
          :max="100"
          :min="0"
          :value="value"
        />
      </div>

    <div class="max-w-2xl">
      <InspiraTracingBeam v-if="!pending && !error" class="px-6">
          <div class="relative max-w-2xl pt-3 antialiased text-left">
            <div v-for="item in data?.data || []" :key="item.id" class="mb-10">
              <Badge class="mb-2" variant="secondary">
                {{ new Date(item.created_at).toLocaleString() }}
              </Badge>

              <p class="mb-2 text-xl text-left">
                {{ item.step }}
              </p>

              <div class="prose prose-sm dark:prose-invert text-sm text-left">
                <div>
                  <p>Created: {{ new Date(item.created_at).toLocaleString() }}</p>
                  <p>Updated: {{ new Date(item.updated_at).toLocaleString() }}</p>
{{ item.created_at }}
                  <!-- Progress bar stays centered -->
                  <div class="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      class="bg-primary h-2.5 rounded-full transition-all duration-500"
                      :style="{ width: `${item.process}%` }"
                    ></div>
                  </div>
                  <p class="mt-2 text-sm text-gray-500">
                    Progress: {{ item.process }}%
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-if="data && !data.data.length"
              class="text-gray-500 py-4"
            >
              No items available
            </div>
          </div>
        </InspiraTracingBeam>

      <!-- Keep the loading and error states outside the TracingBeam -->
      <div v-if="pending" class="flex justify-center py-8">
        <div
          class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        ></div>
      </div>

      <div v-else-if="error" class="text-red-500 p-4 rounded-lg bg-red-50">
        {{ error.message }}
      </div>
    </div>

    </div>
  </div>
</template>
