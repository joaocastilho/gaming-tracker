# <img src="static/favicon-32x32.png" alt="Gaming Tracker" width="32" height="32"> Gaming Tracker

A personal project for tracking my own video game collection. Includes tier lists, ratings, search, filters, stats, and works offline.

[![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
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

- **Presentation** - Visuals, art style, sound design, and music. How the game looks, feels, and immerses the player.
- **Story** - Narrative, characters, and world-building. How the plot, dialogue, and themes create a compelling story.
- **Gameplay** - Mechanics, progression systems, and interactivity. How engaging the game's systems and challenges are.

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
- Filter by platform, genre, status, or tier
- Filter by co-op
- Sort by score, ratings, finished date, playtime, or title — all persisted in the URL

### 🎨 UI

- Dark and light mode themes
- Glassmorphism design effects
- Responsive layout for desktop and mobile, with a bottom navigation bar on small screens
- Smooth animations and transitions that respect `prefers-reduced-motion`
- Variable-height cards with pre-computed text measurements for optimal scrolling

### 📊 Stats & Backlog Journey

- **Home** — Now Playing shelf plus recent completions
- **Backlog Journey** — Dual segmented bars (Hours + Games) showing Completed (indigo), Playing (amber) and Planned (slate) with counts and hours inside the bars, tracing conversion from backlog to fully played
- Tier, genre, playtime, score and year-over-year charts plus top-rated lists and a monthly completion heatmap

### 📦 Offline

- Data stored locally in the browser via IndexedDB (Dexie), with `games.json` as the seeded source
- JSON export/import for backup
- Works without internet after initial load

### 🌐 PWA Service Worker

The service worker (`static/service-worker.js`) uses per-resource-type strategies:

| Resource | Strategy | Rationale |
| -------- | -------- | --------- |
| HTML navigations | **Network-first** | Prerendered pages reference hashed `/_app/immutable/` chunks that are deleted on every deployment; serving stale HTML would break hydration |
| `/_app/*` bundles | Cache-first | Content-hashed filenames are safe to cache indefinitely |
| Cover images | Cache-first | Immutable (`max-age=1y`), never revalidated |
| `games.json`, manifest | Cache-first + background refresh | Fresh data arrives on the next request |

Updates apply on the next natural page load — no forced reloads mid-session.

### ⚡ Performance Optimizations

- **Zero Layout Shift (CLS):** Use of `contain: layout` and strict height reservations.
- **Virtualized Gallery:** Windowed rendering keeps scrolling smooth with 1000+ games.
- **Single-Pass Filtering:** Search and all active filters evaluate in one array pass against a precomputed search key, and the sorted master list is cached per tab/sort configuration.
- **Deduped Preloads:** Detail-cover preloads fire at most once per image, on card hover/focus and modal navigation.
- **Lazy Loading:** Modals, charts, filters, and secondary UI components are dynamically imported using `{#await}`; text measurement (`@chenglou/pretext`) is deferred to idle time.
- **Font Self-hosting:** Self-hosted Inter font with `preload` to eliminate render-blocking external requests.
- **Deferred Data:** Defer heavy `games.json` loading to the client side to minimize SSR payload.
- **Tree-shaking:** Optimized imports for Chart.js and intelligent Vite chunking.

## 🛠️ Tech Stack

| Category             | Technology                                     | Version   |
| -------------------- | ---------------------------------------------- | --------- |
| **Framework**        | [SvelteKit](https://kit.svelte.dev/)           | `v3.0.1`  |
| **UI Library**       | [Svelte](https://svelte.dev/)                  | `v5.57.2` |
| **Styling**          | [Tailwind CSS](https://tailwindcss.com/)       | `v4.3.3`  |
| **Linter**           | [Biome](https://biomejs.dev/)                  | `v2.5.15` |
| **Build Tool**       | [Vite](https://vite.dev/)                      | `v8.3.4`  |
| **TypeScript**       | [TypeScript](https://www.typescriptlang.org/)  | `v6.0.3`  |
| **Test Runner**      | [Vitest](https://vitest.dev/)                  | `v5.0.3`  |
| **Text Measurement** | [Pretext](https://github.com/chenglou/pretext) | `v0.0.9`  |
| **Icons**            | [Lucide Svelte](https://lucide.dev/)           | `v1.55.0` |
| **Runtime**          | [Bun](https://bun.sh/)                         | `v1.4.3`  |
| **Charts**           | [Chart.js](https://www.chartjs.org/)            | `v4.5.1`  |
| **IndexedDB**        | [Dexie](https://dexie.org/)                    | `v4.4.6`  |
| **Validation**       | [Zod](https://zod.dev/)                        | `v4.6.5`  |

> `jsdom` is pinned to `30.0.x`: 30.1+ requires `this === globalThis` inside its vm context, which Bun's `vm` does not provide ([oven-sh/bun#43671](https://github.com/oven-sh/bun/issues/43671)). It can be bumped once that lands.

## 🚀 Running Locally

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run all checks (lint, format, typecheck, tests)
bun run validate
```

## 📁 Project Structure

```
gaming-tracker/
├── src/
│   ├── lib/
│   │   ├── components/      # UI components (lazy-loaded modals)
│   │   ├── stores/          # Svelte 5 stores ($state / $effect)
│   │   ├── styles/          # fonts.css, critical.css
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── routes/              # SvelteKit routes (+layout.svelte)
│   ├── app.css              # Global tailwind styles
│   └── app.html             # HTML template (preloads)
├── static/
│   ├── _headers             # Cloudflare Pages cache headers
│   ├── fonts/               # Self-hosted woff2 fonts
│   ├── games.json           # Game data
│   └── covers/              # Game cover images (WebP)
├── tests/                   # Vitest tests
└── docs/                    # Documentation
```

## 📖 Documentation

| Document                               | Purpose                    |
| -------------------------------------- | -------------------------- |
| [docs/project.md](docs/project.md)     | Full project specification |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Architecture & data flow   |
| [AGENTS.md](AGENTS.md)                 | AI agent instructions      |
