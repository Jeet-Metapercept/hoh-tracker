# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

HoH Tracker is a Nuxt 3 PWA that displays the live status of an external "Heroes of History" automation/bot. The app is **read-only for end users**: it subscribes in real time to a Firebase Realtime Database and renders the current run status, a countdown to the next scheduled run, and recent run history. The bot itself (which writes to Firebase) lives outside this repo; status is mutated externally (e.g. the documented `curl ... PATCH` against the RTDB REST endpoint in `components/hoh/firebase.vue`), not from this UI in normal operation.

## Commands

```bash
pnpm dev          # dev server (PWA devOptions enabled)
pnpm build        # production build
pnpm generate     # static generation
pnpm preview      # preview production build
pnpm lint:fix     # eslint --fix + prettier --write + nuxi typecheck (run before committing)
```

Use **pnpm** (there is a `pnpm-lock.yaml`). There is no test suite. `typescript.typeCheck` is on in `nuxt.config.ts`, so type errors surface during `dev`/`build` as well as via `lint:fix`.

## Architecture

- **Data layer is Firebase Realtime Database via VueFire**, not Pinia stores (Pinia is installed but there are no stores). Components read live data with `useDatabaseObject` / `useDatabaseList` from `vuefire`, plus query helpers (`ref as dbRef`, `query`, `orderByChild`, `limitToLast`) from `firebase/database`. Firebase is configured in `nuxt.config.ts` under `vuefire.config` from `FIREBASE_*` env vars — there is no manual `initializeApp`; the `nuxt-vuefire` module wires it up and the composables are auto-imported.

- **`components/hoh/status.vue` is the application.** `pages/index.vue` renders only `<HohStatus />`. This single component reads `/hohtracker` (current status object) and `/hohtracker/history` (last 5 runs), computes the gauge percentage and the next-run countdown, and renders everything. When changing app behavior, this is almost always the file. `components/hoh/firebase.vue` is a dev/admin scratch component (toggle status, push history) and is commented out in `index.vue`.

- **Domain timing constants live inline in `status.vue`**: `TOTAL_DURATION_MINUTES = 39` (run cycle length, drives gauge + countdown) and `FAILURE_THRESHOLD_MINUTES = TOTAL_DURATION_MINUTES + 10` (offline/failed cutoff). Status semantics: `status === "True"` means the bot is actively running ("Live"/green); otherwise it is between runs ("Snoozed"). If the gap since `completed_at` exceeds the failure threshold it flips to "Offline"/"Failed". History events are a comma-separated string mapped to avatar images via `getAvatarSrc` (icons under `public/hoh/`).

- **Date math uses `date-fns`** (`differenceInMinutes`, `addMinutes`, `formatDistanceToNow`, `intervalToDuration`, `formatDuration`) and `useNow({ interval: 1000 })` from VueUse for the live ticking clock.

## UI conventions

- **shadcn-vue** components live in `components/ui/<name>/` with an `index.ts` re-export; configured via `components.json` (base color `zinc`, `cssVariables: true`). Add components with the shadcn-nuxt CLI rather than hand-writing them. Aliases: `@/components`, `@/utils/index`.
- **`cn()`** from `utils/index.ts` (clsx + tailwind-merge) is the standard class-merging helper.
- **Inspira UI** animated components (`components/Inspira/`: `AnimatedCircularProgressBar`, `RippleComponent`, `TracingBeam`) provide the gauge/visual effects. Auto-imported with the `Inspira` prefix (e.g. `<InspiraAnimatedCircularProgressBar>`).
- **Brand color is `premier`** (`hsl(var(--premier))`, defined in `assets/css/tailwind.css`, hot pink #E90052) — use `bg-premier` / `text-premier` for the app's accent, distinct from shadcn's neutral `primary`.
- Font is **Oxanium** (Google Fonts via `@nuxt/fonts`); color mode via `@nuxtjs/color-mode` with `classSuffix: ""` (so `dark:` works directly). Icons via `@nuxt/icon` (`<Icon name="lucide:..." />`).
- Nuxt auto-imports apply: components are referenced by path-prefixed PascalCase (`HohStatus`, `LayoutHeader`, `LayoutColorModeMenu`). Types in `types/index.ts` are globally auto-imported (`imports.dirs: ["types"]` in `nuxt.config.ts`) — no need to import `Link`, `HohData`, etc.

## Config notes

- Env vars are required for Firebase to connect — copy `.env.example` to `.env` and fill the `FIREBASE_*` keys (and `BASE_URL`, used for app config, SEO, and `.well-known/security.txt`).
- ESLint relaxes three Vue rules in `eslint.config.mjs`: `multi-word-component-names`, `require-default-prop`, `html-self-closing` are off.
- PWA (`@vite-pwa/nuxt`) is configured in `nuxt.config.ts` with `autoUpdate` and a full manifest; `<NuxtPwaManifest />` is mounted in `app.vue`.
- `git` flow: `master` is the main branch; work merges in from `develop`.
