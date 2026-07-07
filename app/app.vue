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

useHead({
  titleTemplate: (pageTitle) =>
    pageTitle ? `${pageTitle} - ${siteName.value}` : siteName.value,
  link: [
    { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
    { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Oxanium:wght@200..800&display=swap",
    },
  ],
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
