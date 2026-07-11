# <img src="static/favicon-32x32.png" alt="Gaming Tracker" width="32" height="32"> Gaming Tracker

A personal project for tracking my own video game collection. Includes tier lists, ratings, search, filters, and works offline.

[![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

**PageSpeed Insights Scores (Post-Optimization):**
- 📱 Mobile: 85+ Performance
- 💻 Desktop: 95+ Performance

## Features

### 🎯 Game Tracking

Games are organized into two categories:

- **Planned** — Games in the backlog waiting to be played
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

- Real-time title search
- Filter by platform, genre, or tier
- Filter by rating ranges

### 🎨 UI

- Dark and light mode themes
- Glassmorphism design effects
- Responsive layout for desktop and mobile
- Smooth animations and transitions
- Variable-height cards with pre-computed text measurements for optimal scrolling

### 📦 Offline

- Data stored locally in the browser via IndexedDB
- JSON export/import for backup
- Works without internet after initial load

### ⚡ Performance Optimizations

- **Zero Layout Shift (CLS):** Use of `contain: layout` and strict height reservations.
- **Lazy Loading:** Modals, charts, and secondary UI components are dynamically imported using `{#await}`.
- **Font Self-hosting:** Self-hosted Inter font with `preload` to eliminate render-blocking external requests.
- **Deferred Data:** Defer heavy `games.json` loading to the client side to minimize SSR payload.
- **Tree-shaking:** Optimized imports for Chart.js and intelligent Vite chunking.

## 🛠️ Tech Stack

| Category             | Technology                                     | Version   |
| -------------------- | ---------------------------------------------- | --------- |
| **Framework**        | [SvelteKit](https://kit.svelte.dev/)           | `v2.69.2` |
| **UI Library**       | [Svelte](https://svelte.dev/)                  | `v5.56.4` |
| **Styling**          | [Tailwind CSS](https://tailwindcss.com/)       | `v4.3.2`  |
| **Linter**           | [Biome](https://biomejs.dev/)                  | `v2.5.3`  |
| **Build Tool**       | [Vite](https://vite.dev/)                      | `v8.1.4`  |
| **Text Measurement** | [Pretext](https://github.com/chenglou/pretext) | `v0.0.8`  |
| **Icons**            | [Lucide Svelte](https://lucide.dev/)           | `v1.24.0` |
| **Runtime**          | [Bun](https://bun.sh/)                         | `v1.3.14`  |
| **Charts**           | [Chart.js](https://www.chartjs.org/)            | `v4.5.1`  |
| **IndexedDB**        | [Dexie](https://dexie.org/)                    | `v4.4.4`  |

## 🚀 Running Locally

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
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

## 📜 Available Scripts

| Script           | Description           |
| ---------------- | --------------------- |
| `bun run dev`    | Start dev server      |
| `bun run build`  | Build for production  |
| `bun run preview`| Preview build locally |
| `bun run check`  | TypeScript type check |
| `bun run lint`   | Check code with Biome |
| `bun run format` | Format code with Biome |
| `bun run test`   | Run tests             |
| `bun run optimize-covers` | Optimize images |

## 📖 Documentation

| Document                               | Purpose                    |
| -------------------------------------- | -------------------------- |
| [docs/project.md](docs/project.md)     | Full project specification |
| [docs/TECHNICAL.md](docs/TECHNICAL.md) | Architecture & data flow   |
| [AGENTS.md](AGENTS.md)                 | AI agent instructions      |
