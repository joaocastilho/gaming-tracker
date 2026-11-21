# <img src="static/favicon-32x32.png" alt="Gaming Tracker" width="32" height="32"> Gaming Tracker

A personal project for tracking my own video game collection. Includes tier lists, ratings, search, filters, stats, and works offline.

[![SolidJS](https://img.shields.io/badge/SolidJS-2C4F7C?logo=solid&logoColor=white)](https://www.solidjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

## Features

### 🎯 Game Tracking

Games are organized into three statuses:

- **Planned** — Games in the backlog waiting to be played
- **Playing** — Games currently in progress
- **Completed** — Finished games with full rating data

### ⭐ Rating System

Completed games are rated across three dimensions (0-10 scale):

- **Presentation** — Visuals, art style, sound design, and music. How the game looks, feels, and immerses the player.
- **Story** — Narrative, characters, and world-building. How the plot, dialogue, and themes create a compelling story.
- **Gameplay** — Mechanics, progression systems, and interactivity. How engaging the game's systems and challenges are.

The total score is automatically calculated using the formula: `(Presentation + Story + Gameplay) / 3 × 2` resulting in a **0-20 score**.

### 🏆 Tier Lists

Manually assigned tiers to games based on overall assessment:

| Tier     | Meaning     |
| :------- | :---------- |
| 🏅 **S** | Masterpiece |
| 🥇 **A** | Amazing     |
| 🥈 **B** | Great       |
| 🥉 **C** | Good        |
| 🎖️ **D** | Decent      |
| ❌ **E** | Bad         |

### 🔍 Search & Filter

- Real-time title search with a precomputed lowercase index (no re-lowercasing per keystroke)
- Browse by status tab (Library, Completed, Planned) and filter by platform, genre, tier, or co-op
- Sort by score, ratings, finished date, playtime, or title — all persisted in the URL

### 🎨 UI

- Dark and light mode themes
- Glassmorphism design effects
- Responsive layout for desktop and mobile, with a bottom navigation bar on small screens
- Smooth animations and transitions that respect `prefers-reduced-motion`
- Variable-height cards with pre-computed text measurements for optimal scrolling

### ✏️ Editing

- Authenticated in-app editor that commits changes back to `static/games.json` in the GitHub repository
- Offline saves queue in IndexedDB and retry when the editor is back online

### 📊 Stats & Backlog Journey

- **Home** — Now Playing poster showcase plus recent completions
- **Backlog Journey** — Dual segmented bars (Hours + Games) showing Completed (indigo), Playing (amber) and Planned (slate) with counts and hours inside the bars, tracing conversion from backlog to fully played
- Tier, genre, playtime, score and year-over-year charts plus top-rated lists and a monthly completion heatmap

### 📦 Offline

- Data cached locally in the browser via IndexedDB (Dexie), seeded from `games.json` and refreshed in the background
- Works without internet after initial load

### 🌐 PWA Service Worker

The worker source is `src/service-worker.source.js`; the build minifies it to `/service-worker.js`. Registration is production-only.

| Resource                | Strategy                           | Rationale                                                                                                                    |
| ----------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| HTML navigations        | **Network-first**                  | Built HTML references hashed `/assets/` chunks that change on every deployment; serving stale HTML would reference old files |
| `/assets/*` bundles     | Cache-first                        | Content-hashed filenames are safe to cache indefinitely                                                                      |
| Cover images            | Cache-first                        | Immutable (`max-age=1y`), never revalidated                                                                                  |
| `games.json`            | **Network-first** + cache fallback | Keeps edits fresh while online, with offline fallback                                                                        |
| Manifest & static icons | Cache-first + background refresh   | Fresh metadata arrives on the next request                                                                                   |
| Other same-origin GETs  | Network-first + cache fallback     | Keeps non-versioned responses usable offline                                                                                 |

Updates apply on the next natural page load — no forced reloads mid-session. In dev the worker is never registered, and any stale dev registration is removed automatically.

### ⚡ Performance Optimizations

- **Zero Layout Shift (CLS):** Use of `contain: layout` and strict height reservations.
- **Virtualized Gallery:** Windowed rendering keeps scrolling smooth with 1000+ games.
- **Single-Pass Filtering:** Search and all active filters evaluate in one array pass against a precomputed search key, and the sorted master list is cached per tab/sort configuration.
- **Deduped Preloads:** Detail-cover preloads fire at most once per image, on card hover/focus and modal navigation.
- **Lazy Loading:** Modals, charts, filters, and secondary UI components are dynamically imported with `lazy()`; text measurement (`@chenglou/pretext`) is deferred to idle time.
- **Font Self-hosting:** Self-hosted Inter font with `preload` to eliminate render-blocking external requests.
- **Deferred Data:** Cold visits fetch `games.json` directly (keeping Dexie off the critical path); repeat visits hydrate from IndexedDB and refresh in the background.
- **Chunk Splitting:** Rolldown `codeSplitting` groups keep Solid, charts, Dexie, text measurement, icons, and editor validation in dedicated chunks.

## 🛠️ Tech Stack

| Category             | Technology                                     | Version   |
| -------------------- | ---------------------------------------------- | --------- |
| **UI Library**       | [SolidJS](https://www.solidjs.com/)            | `v2.0.3`  |
| **Router**           | [Solid Router](https://docs.solidjs.com/)      | `v2.0.1`  |
| **Styling**          | [Tailwind CSS](https://tailwindcss.com/)       | `v4.3.5`  |
| **Linter / Format**  | [Biome](https://biomejs.dev/)                  | `v2.6.8`  |
| **Build Tool**       | [Vite](https://vite.dev/)                      | `v8.3.8`  |
| **TypeScript**       | [TypeScript](https://www.typescriptlang.org/)  | `v7.0.2`  |
| **Test Runner**      | [Vitest](https://vitest.dev/)                  | `v5.1.0`  |
| **Text Measurement** | [Pretext](https://github.com/chenglou/pretext) | `v1.0.0`  |
| **Icons**            | [Lucide Solid](https://lucide.dev/)            | `v1.77.0` |
| **Runtime**          | [Bun](https://bun.sh/)                         | `v1.4+`   |
| **Charts**           | [Chart.js](https://www.chartjs.org/)           | `v4.6.1`  |
| **IndexedDB**        | [Dexie](https://dexie.org/)                    | `v4.4.7`  |
| **Validation**       | [Zod](https://zod.dev/)                        | `v4.6.7`  |
