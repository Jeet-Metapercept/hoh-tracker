<script setup lang="ts">
const route = useRoute();
const config = useAppConfig();

const description = computed(
  () => (route.meta.description as string) ?? config.nuxtSiteConfig_description,
);
const title = computed(
  () => (route.meta.title as string) ?? config.nuxtSiteConfig_name,
);
const siteName = computed(() => config.nuxtSiteConfig_name);

defineOgImageComponent("Default", {
  description,
  title,
});

useHead({
  titleTemplate: (pageTitle) =>
    pageTitle ? `${pageTitle} - ${siteName.value}` : siteName.value,
  meta: [
    { name: "description", content: description.value },
    { property: "og:title", content: title.value },
    { property: "og:description", content: description.value },
    { property: "og:site_name", content: siteName.value },
    { property: "og:type", content: "website" },
  ],
});
</script>

<template>
  <Html lang="en" dir="ltr">
    <Head>
      <Title>{{ title }}</Title>
      <Meta :content="description" name="description" />
      <NuxtPwaManifest />
    </Head>
    <Body>
      <NuxtLoadingIndicator />
      <NuxtRouteAnnouncer />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </Body>
  </Html>
</template>
