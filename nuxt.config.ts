const baseUrl = process.env.BASE_URL;

export default defineNuxtConfig({
  modules: [
    "@zadigetvoltaire/nuxt-well-known",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
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
    "@formkit/auto-animate/nuxt",
    "nuxt-vuefire",
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
  // vuefire: {
  //   config: {
  //     apiKey: "AIzaSyDLiXUeLCL_SqQTdXi4bQ70ulUEzUtTPwg",
  //     authDomain: "hoh-stats.firebaseapp.com",
  //     databaseURL: "https://hoh-stats-default-rtdb.asia-southeast1.firebasedatabase.app",
  //     projectId: "hoh-stats",
  //     storageBucket: "hoh-stats.firebasestorage.app",
  //     messagingSenderId: "427466791217",
  //     appId: "1:427466791217:web:905bf02bd2d5fd47597810",
  //     measurementId: "G-ZEH6SGV52N"
  //   },
  // },
  vuefire: {
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
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
