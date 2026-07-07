# Heroes of History — Design System

Reverse-engineered from https://heroesofhistory.wiki/. This is the spec for
reproducing the game's UI look in the tracker frontend. The live tokens +
component recipes are in **`index.css`** (same folder); the served image/icon
subset is in **`public/hoh-style/`** (referenced as `/hoh-style/...`). Demo page:
`app/pages/sample.vue` (`/sample`).

---

## 1. Color palette

### Blues — the "chrome" (headers, nav, buttons, borders)
| Hex | Role |
|---|---|
| `#3e7bad` | **Primary blue.** Section headers, buttons, `border:3px solid`, dropdowns. The signature color. |
| `#3e7aac` | Near-identical alt, used inside gradients. |
| `#82adcf` | Light blue — top/bottom edge of the raised tile gradient. |
| `#538cb8` | Mid blue — table `<th>`, tier-list titles, share button. |
| `#4792cf` | Hover blue for interactive elements. |
| `#2c5a7a` / `#2c5d80` | Deep blue border under headers. |
| `#1d4468` | Menu-tile border (darkest). |
| `#1d5d92` | Intro-panel fill. |
| `#3367b4` | Footer background. |

### Parchment / cream — panel bodies & cards
| Hex | Role |
|---|---|
| `#ebe4cc` | **Primary cream.** Section body, modal, sliding window. |
| `#ecdec0` | Table `<td>` fill. |
| `#eae4cd` / `#eddec1` / `#dacfa7` | Cream variants. |
| `#f8f5e6` | Light edge of tier-row gradient. |
| `#fbf0ce` | Tab-link text (pale parchment). |

### Gold / amber — tables, currency, highlights
| Hex | Role |
|---|---|
| `#e2c587` | Alt table `<th>` fill. |
| `#aa822b` | Alt table `<th>` text. |
| `#da8641` | Warm accent / dropdown-item hover. |
| `#916a17` | Event-info text; toggle-button border+text. |
| `#4f3e0f` / `#4e3f14` | Darkest amber text. |
| `#e3c586` | Encounter-button chip fill. |
| `#dcc698` | Cell borders & header underline. |

### Neutrals
`#fff`, `#000`, `#666` (muted text), `#ccc` (grey border), `#a5b6c4` (steel cell border).

**Rule of thumb:** blue = interactive/chrome, cream = content surface, gold =
data/currency/emphasis. Never cream text on cream; white or dark-amber on blue/gold.

---

## 2. Typography

- **Font:** `Geist Sans` (body) + `Geist Mono` (code/numbers), loaded as `.woff`
  (see `fonts/`). Weight range `100–900` (variable).
- **Game-chrome fallback stack** (used explicitly on tabs/footer):
  `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …, sans-serif`.
- **Uppercase** on tabs and tier titles; `font-weight:700` for titles/labels.
- **Signature text outline** for text on colored chrome — 4-way black shadow:
  ```css
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
  ```
  Table headers use a lighter `text-shadow:1px 1px 2px #000` + `-webkit-text-stroke:.2px #000`.

---

## 3. Borders & radii

- **Radii:** `4px` (buttons, tab tops), `5px` (small cards), **`10px` (default panel)**,
  `12px` (tier-list container), `15px` (footer top), `20px` (pill toggles), `50%` (chips/dots).
- **Border widths seen:** `1px` (cells/dropdowns), `2px` (tiles, header underlines),
  **`3px solid #3e7bad`** (sliding window / emphasis frame), `7px solid #3e7bad`
  (modal frame — the game's chunky-frame look), `8px` left-border on tier rows.
- Panels round only the **outer** corners: header `10px 10px 0 0`, body `0 0 10px 10px`.

> Note for BoldKit/neubrutalism: the game already leans into **thick colored borders**
> (3–7px) — this maps naturally onto BoldKit's `border-3` + hard-shadow aesthetic.

---

## 4. Shadows

| Token | Value | Use |
|---|---|---|
| sm | `0 2px 10px rgba(0,0,0,.1)` | modal |
| base | `0 4px 6px rgba(0,0,0,.1)` | dropdowns, cards |
| md | `0 4px 8px rgba(0,0,0,.2)` | sliding window, intro panel |
| lg | `0 4px 12px rgba(0,0,0,.3)` | active/raised state |
| xl | `0 8px 16px rgba(0,0,0,.3), 0 4px 6px rgba(0,0,0,.2)` | group dropdown menu |
| drop | `4px 4px 8px rgba(0,0,0,.2)` | floating arrow (offset — neubrutalism-adjacent) |
| up | `0 -4px 6px rgba(0,0,0,.3)` | footer (light from below) |

---

## 5. Gradients (signature)

```css
/* Raised menu tile — light top band, blue body, light bottom band */
linear-gradient(180deg,#82adcf 0,#82adcf 5%,#3e7bad 0,#3e7bad 95%,#82adcf 0,#82adcf);

/* Tier-list row */
linear-gradient(90deg,#ebe4cc,#f8f5e6);

/* Empty-state box */
linear-gradient(to bottom right,#b8b8b8,#3e7bad);

/* Tier-list container */
linear-gradient(180deg,#dbd4bf,#b8b6ac);
```

---

## 6. Core layout unit: the Panel

Every content area is a **blue header bar + cream body**:

```
┌───────────────────────────────┐  header: bg #3e7bad, white text,
│  SECTION HEADER            [⚙] │           radius 10px 10px 0 0, min-h 34px
├───────────────────────────────┤
│                               │  body: bg #ebe4cc, radius 0 0 10px 10px,
│   content on parchment…       │        padding 10px
│                               │
└───────────────────────────────┘
```
`.section-header` / `.section-body` in `css/8cb54133325824fe.css`. Reproduced as
`.hoh-panel-header` / `.hoh-panel-body` in `tokens.css`.

Layout: `.container-wrapper` is a flex row — `.side-column` (flex 1) + `.main-content`
(flex 5, ~70%). Collapses to column under 768px.

---

## 7. Components (extracted recipes)

- **Buttons** (`.btn`, `.btn-close`, `.btn-layouts`): `#3e7bad` bg, white, no border,
  `padding:10px 20px`, `radius:4px`, `transition:background-color .3s`. Hover → `#4792cf`.
- **Pill toggle** (`.toggle-button`): transparent bg, `1px solid #916a17`, gold text,
  `radius:20px`.
- **Chip button** (`.encounter-button`): `#e3c586` circle, `#4e3f14` text, `radius:50%`.
- **Tabs** (`.section-tabs .tab`): PNG background (`shared/tab_small.png`,
  `background-size:100% 100%`), 150×24px, uppercase pale-parchment text w/ outline,
  `radius:4px 4px 0 0`. Active = `font-weight:700` + `filter:brightness(1.2)` on icon.
- **Dropdown menu** (`.dropdown-group-menu`): blue-gradient bg, `1px solid #ccc`,
  `radius:10px`, xl shadow, fade+translateY transition.
- **Modal** (`.modal-content`): cream bg, **`7px solid #3e7bad` frame**, `radius:8px`,
  backdrop `rgba(0,0,0,.5)`.
- **Table** (`th`/`td`): blue (`#538cb8`) or gold (`#e2c587`) headers with gold
  underline; cream (`#ecdec0`) cells with `#dcc698` borders.
- **Tier list** (`.tier-section`): left `8px` colored border, cream→light gradient,
  uppercase blue title.
- **Footer**: `#3367b4`, `navbar.png` repeated along bottom, outlined cream text,
  upward shadow, `radius:15px 15px 0 0`.
- **Hover motion:** cards `translateY(-5px)`; images `scale(1.1)`; tabs `scaleY(1.02)`;
  `pulsate` keyframe (scale 1→1.05→1, 3s infinite) for attention.

---

## 8. Iconography (`public/hoh-style/`)

The served subset lives in `public/hoh-style/`, referenced by URL (`/hoh-style/...`):

- **Currency/resources** (`resources/`): Coin, Gem, Food, ambrosia, CampaignEnergy,
  chrono_crystals, doubloons, xp_hero, etc. → energy/resource displays.
- **Unit stats** (`icons/`): crit chance/damage, attack speed, evasion, base damage…
- **Nav** (`navbar/Navbar_*.webp`): section icons.
- **Heroes** (`heroes/Unit_*.webp`): portraits (216×262 — use `object-cover`).
- **Brand** (`shared/`): `logo.webp`, `icon_flat_portal_swirl.webp`.

> Only a working subset was copied in. The full ~450-asset library came from the
> game wiki — re-scrape from https://heroesofhistory.wiki/ if more art is needed.

---

## 9. Mapping to our stack

- Our brand accent is **`premier` hot-pink `#E90052`** (see project CLAUDE.md). HoH's
  own accent is **blue `#3e7bad`**. Decide per-page whether the tracker keeps pink or
  adopts HoH blue when we build the game-styled page.
- The thick-border + hard-shadow game look aligns with the **BoldKit / neubrutalism**
  direction already planned (`border-3`, offset shadows). Feed the `index.css` colors
  into BoldKit's `--shadow-color` / theme.
- Fonts: the tracker uses **Oxanium**; HoH uses **Geist**. Match Geist on a
  game-styled page if desired (re-fetch the woff from the wiki).
