<script setup lang="ts">
definePageMeta({
  title: "HoH Tracker",
});
</script>

<template>
  <section class="container px-0">
    <div class="flex flex-col justify-center gap-3 w-full">
      <ClientOnly>
        <HohStatus />
        <template #fallback>
          <div class="flex justify-center py-16">
            <Icon name="svg-spinners:tadpole" class="w-8 h-8" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
