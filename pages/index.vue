<script setup lang="ts">
const config = useAppConfig();
definePageMeta({
  title: "meta.home.title",
});

const items = ref(["😏","😐","😑","😒","😕",])
function removeItem(toRemove: string) {
  items.value = items.value.filter((item) => item !== toRemove)
}
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
       <HohTimer />

       <div>
        <h5>Click emojis to remove them.</h5>
  <ul v-auto-animate>
    <li
      v-for="item in items"
      :key="item"
      @click="removeItem(item)"
    >
      {{ item }}
    </li>
  </ul>
        
       </div>
      </div>
    </section>
  </section>
</template>
