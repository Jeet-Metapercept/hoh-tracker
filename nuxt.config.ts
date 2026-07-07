import tailwindcss from "@tailwindcss/vite";
import { version } from "./package.json";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      appVersion: version,
    },
  },
  // Home redirects to the Atlantis dashboard (the app's main page).
  routeRules: {
    "/": { redirect: "/atlantis" },
  },
  modules: [
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "nuxt-vuefire",
    "@vite-pwa/nuxt",
    "nuxt-umami",
  ],
  umami: {
    id: "382a16b9-68ed-4334-8412-633e78d2c92b",
    host: "https://analytics.proximabiz.net",
    autoTrack: true,
    ignoreLocalhost: true,
  },
  css: ["~/assets/css/tailwind.css"],
  imports: {
    dirs: ["types"],
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "class-variance-authority",
        "clsx",
        "date-fns",
        "lucide-vue-next",
        "reka-ui",
        "tailwind-merge",
        "vue-use-spring",
        "vuefire",
      ],
    },
  },
  colorMode: {
    classSuffix: "",
    preference: "dark",
    fallback: "dark",
  },
  shadcn: {
    prefix: "",
    componentDir: "./app/components/ui",
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
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      id: "com.hohtracker.app",
      name: "Heroes of History Tracker",
      short_name: "HoH Tracker",
      description: "HOH Tracker App",
      theme_color: "#1d4468",
      background_color: "#1d4468",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icon-1024.png", sizes: "1024x1024", type: "image/png" },
        { src: "/icon-2048.png", sizes: "2048x2048", type: "image/png" },
        {
          src: "/icon-192-maskable.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/icon-512-maskable.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    client: {
      installPrompt: false,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
      type: "module",
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,txt,png,ico,svg,json}"],
      cleanupOutdatedCaches: true,
      navigateFallback: undefined,
    },
  },
});
