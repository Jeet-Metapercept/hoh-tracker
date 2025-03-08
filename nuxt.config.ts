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
    "@vite-pwa/nuxt",
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
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
  fonts: {
    families: [{ name: "Oxanium", provider: "google" }],
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
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      id: "com.hohtracker.app",
      name: "Heroes of History Tracker",
      short_name: "HoH Tracker",
      description: "HOH Tracker App",
      theme_color: "#E90052",
      background_color: "#E90052",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "/mobile-screenshot.png",
          sizes: "1080x1920",
          type: "image/png",
          form_factor: "narrow",
        },
        {
          src: "/desktop-screenshot.png",
          sizes: "2872x2852",
          type: "image/png",
          form_factor: "wide",
        },
      ],
    },
    client: {
      installPrompt: false,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,txt,png,ico,svg,json}'],
      cleanupOutdatedCaches: true,
      navigateFallback: '/',
    },
  },
});