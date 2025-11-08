# Gaming Tracker 🎮

A fast, client-side web application for tracking and rating video games, featuring a visual tier list generator and highly optimized cover loading. Designed for dedicated gamers who want a performant, offline-friendly way to organize and review their library.

## ✨ Features

- **Game Tracking**: Mark games as "Planned" or "Completed" with rich metadata.
- **Rating System**: Score games on Presentation, Story, and Gameplay (0–10 scale) with an aggregated total.
- **Tier Lists**: Automatic tier assignment (S–Masterpiece to E–Bad) with a visual tier list view.
- **Multiple Views**:
  - Gallery of cover cards
  - Sortable, dense table view
  - Tier list view grouped by final tier
- **Smart Filtering & Search**:
  - Search by title
  - Filter by platform, genre, status, tier, and more
- **Theme Support**: Light and dark themes with persistence.
- **Static Site**: 100% client-side, no backend; suitable for static hosting.
- **Data Handling**:
  - Ships with curated `games.json`
  - Local changes can be exported as JSON
- **Performance-Oriented**:
  - Optimized WebP covers in multiple resolutions
  - Responsive `srcset`/`sizes` usage
  - Lazy loading with IntersectionObserver
  - Targeted preloading for above-the-fold and detail views
- **No Tracking**: All logic runs in the browser; no external analytics.

## 🛠️ Tech Stack

- **Framework**: SvelteKit (Svelte 5 / Runes) + TypeScript
- **Styling**: Tailwind CSS + lightweight custom components
- **Runtime**: Bun
- **Bundler/Dev**: Vite
- **Data**: JSON files served from `/static`, stored/used entirely client-side
