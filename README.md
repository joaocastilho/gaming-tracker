# 🎮 Gaming Tracker

A fast personal library for tracking and rating my video game collection. Designed to be a clean, offline-friendly way to organize played and planned games, complete with visual tier lists and detailed stats.

[![Svelte](https://img.shields.io/badge/Svelte-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh/)

## ✨ Features

### 🎯 Game Tracking

Organize games into two categories:

- **Planned** — Games in the backlog waiting to be played
- **Completed** — Finished games with full rating data

### ⭐ Rating System

Rate completed games across three dimensions (0-10 scale):

- **Presentation** - Visuals, art style, sound design, and music. How the game looks, feels, and immerses the player.
- **Story** - Narrative, characters, and world-building. How the plot, dialogue, and themes create a compelling story.
- **Gameplay** - Mechanics, progression systems, and interactivity. How engaging the game's systems and challenges are.

The total score is automatically calculated using the formula: `(Presentation + Story + Gameplay) / 3 × 2` resulting in a **0-20 score**.

### 🏆 Tier Lists

Manually assign games to tiers based on overall assessment:

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
- Filter by rating ranges (presentation, story, gameplay, or total score)

### 🎨 Modern UI

- 🌙 Dark and light mode themes
- ✨ Glassmorphism design effects
- 📱 Responsive layout for desktop and mobile
- ⚡ Smooth animations and transitions

### 📦 Offline Support

- Works without internet after initial load
- All data stored locally in the browser via IndexedDB
- 🔄 JSON export/import for data backup and restoration
- 📲 Installable as a PWA (Progressive Web App) for native-like experience

## 🛠️ Tech Stack

| Category       | Technology                                     | Version   |
| -------------- | ---------------------------------------------- | --------- |
| **Framework**  | [SvelteKit](https://kit.svelte.dev/)           | `v2.50.2` |
| **UI Library** | [Svelte](https://svelte.dev/)                  | `v5.50.2` |
| **Language**   | [TypeScript](https://www.typescriptlang.org/)  | `v5.9.3`  |
| **Styling**    | [Tailwind CSS](https://tailwindcss.com/)       | `v4.1.18` |
| **Storage**    | IndexedDB (via [Dexie.js](https://dexie.org/)) | `v4.3.0`  |
| **Runtime**    | [Bun](https://bun.sh/)                         | `v1.3.8`  |
| **Build Tool** | [Vite](https://vite.dev/)                      | `v7.3.1`  |

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
│   │   ├── components/      # UI components (GameCard, Header, etc.)
│   │   ├── stores/          # Svelte 5 stores for state
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── routes/              # SvelteKit routes
│   ├── app.css              # Global styles
│   └── app.html             # HTML template
├── static/
│   ├── games.json           # Game data
│   ├── covers/              # Game cover images (WebP)
│   └── service-worker.js    # Offline support
├── scripts/                 # Build scripts
│   └── optimize-covers.ts   # Image optimizer
├── tests/                   # Unit tests
└── docs/
    └── project.md           # Full documentation
```

## 📜 Available Scripts

| Script           | Description            |
| ---------------- | ---------------------- |
| `bun run dev`    | Start dev server       |
| `bun run build`  | Build for production   |
| `bun run check`  | TypeScript type check  |
| `bun run lint`   | Check code with ESLint |
| `bun run format` | Format with Prettier   |
| `bun run test`   | Run tests              |

## 📖 Documentation

| Document                                 | Purpose                     |
| ---------------------------------------- | --------------------------- |
| [docs/project.md](docs/project.md)       | Full project specification  |
| [docs/TECHNICAL.md](docs/TECHNICAL.md)   | Architecture & data flow    |
| [docs/test-audit.md](docs/test-audit.md) | Test suite analysis         |
| [docs/test-plan.md](docs/test-plan.md)   | Test-first development plan |
| [AGENTS.md](AGENTS.md)                   | AI agent instructions       |

---

## 🧪 Testing

```bash
# Run all tests
bun test

# Run specific test
bun test tests/test-game-management.test.ts

# Run with coverage
bun test --coverage
```

**Test-First Development**: All refactors require tests written BEFORE implementation.

---

## 🎯 Quality Standards

- **TypeScript**: Strict mode enabled, zero `any` types
- **Tests**: 85%+ coverage, all tests passing
- **Linting**: Zero ESLint warnings
- **Formatting**: Prettier enforced
- **Accessibility**: Zero axe-core violations
- **Performance**: Lighthouse 95+ in all categories

---

## 🤝 Contributing

See [AGENTS.md](AGENTS.md) for development workflows and standards.
