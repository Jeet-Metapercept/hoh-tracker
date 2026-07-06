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
});
