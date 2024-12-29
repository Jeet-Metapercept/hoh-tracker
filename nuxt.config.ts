const baseUrl = process.env.BASE_URL;

export default defineNuxtConfig({
  modules: [
    "@zadigetvoltaire/nuxt-well-known",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vee-validate/nuxt",
    "@nuxtjs/fontaine",
    "nuxt-vitalizer",
    "nuxt-security",
    "@nuxt/eslint",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "@nuxt/image",
    "@nuxt/fonts",
    "@nuxtjs/seo",
    "@pinia/nuxt",
    "@nuxt/icon",
    "nuxt-svgo",
  ],
  wellKnown: {
    securityTxt: {
      canonical: [`${baseUrl}/.well-known/security.txt`],
      expires: new Date("2025-11-14").toISOString(),
      contacts: ["mailto:you@domain.com"],
      preferredLanguages: ["en"],
      disabled: false,
    },
    devtools: true,
  },
  svgo: {
    autoImportPath: false,
  },
  security: {
    rateLimiter: false,
  },
  imports: {
    dirs: ["types"],
  },
  typescript: {
    typeCheck: true,
  },
  colorMode: {
    classSuffix: "",
  },
  devtools: {
    enabled: true,
  },
  compatibilityDate: "2024-11-14",
});
