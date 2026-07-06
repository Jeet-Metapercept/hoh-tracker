import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/color-mode",
    "@nuxt/icon",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "nuxt-vuefire",
    "@vite-pwa/nuxt",
  ],
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
      theme_color: "#E90052",
      background_color: "#E90052",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icon-1024.png", sizes: "1024x1024", type: "image/png" },
        { src: "/icon-2048.png", sizes: "2048x2048", type: "image/png" },
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
      enabled: false,
      type: "module",
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,txt,png,ico,svg,json}"],
      cleanupOutdatedCaches: true,
      navigateFallback: "/",
    },
  },
});
