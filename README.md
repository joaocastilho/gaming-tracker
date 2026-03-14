# 🎮 Gaming Tracker - My Personal Game Backlog Companion

_Because even I forget which games I actually finished..._

## 📖 The Story Behind This Project

Let's be honest: I have way too many games in my backlog. Steam sales, humble bundles, that one time I bought a game because the cover looked cool... We've all been there.

I kept losing track of what I actually played versus what I just bought and forgot about. So I built this little tracker to solve _my_ problem. It's not meant to be the next big gaming platform - it's just my personal solution to gaming chaos.

Think of it as a digital gaming journal that actually works (unlike that notebook I tried to maintain for 3 weeks before abandoning).

## ✨ What Makes This Mine (and Maybe Yours Too)

### 🎯 Two Simple Categories

- **Planned**: The endless backlog of "I'll get to this someday" games
- **Completed**: Games I actually finished, with ratings to prove it

### ⭐ My Personal Rating System

I rate finished games across three dimensions (because "it was good" isn't specific enough):

- **Presentation** - How it looks, sounds, and feels (0-10)
- **Story** - Narrative, characters, world-building (0-10)
- **Gameplay** - Mechanics, fun factor, "just one more level" syndrome (0-10)

Your final score? `(Presentation + Story + Gameplay) / 3 × 2` = 0-20 scale. Yeah, I like math.

### 🏆 Tier Lists (Because We All Need to Feel Judgmental)

Manually sort your completed games into tiers:

- 🏅 **S** - Masterpiece (Life-changing. Play it twice.)
- 🥇 **A** - Amazing (Really damn good)
- 🥈 **B** - Great (Worth your time)
- 🥉 **C** - Good (Solid, but forgettable)
- 🎖️ **D** - Decent ("Meh" but not awful)
- ❌ **E** - Bad (Why did I play this?)

### 🔍 Find What You're Looking For

- Search by title (because scrolling sucks)
- Filter by platform, genre, tier, or rating range
- Actually find that JRPG you swore you owned

### 🎨 Pretty Enough to Look At

- Dark/Light mode (for those late-night gaming sessions)
- Glassmorphism (because it looks fancy)
- Works on phone and desktop (yes, I tested it on my phone during boring meetings)

### 📦 Actually Works Offline

- All data stored locally in your browser (IndexedDB via Dexie.js)
- Export/Import JSON for backups (because I don't trust cloud saves)
- Zero internet needed after first load (play on the plane, track on the plane)

## 🛠️ Under the Hood (The Nerdy Stuff)

This is built with the tools I enjoy using:

| Category       | Technology                                     | Version    |
| -------------- | ---------------------------------------------- | ---------- |
| **Framework**  | [SvelteKit](https://kit.svelte.dev/)           | `v2.55.0`  |
| **UI Library** | [Svelte](https://svelte.dev/)                  | `v5.53.11` |
| **Language**   | [TypeScript](https://www.typescriptlang.org/)  | `v5.9.3`   |
| **Styling**    | [Tailwind CSS](https://tailwindcss.com/)       | `v4.2.1`   |
| **Storage**    | IndexedDB (via [Dexie.js](https://dexie.org/)) | `v4.3.0`   |
| **Runtime**    | [Bun](https://bun.sh/)                         | `v1.3.10`  |
| **Build Tool** | [Vite](https://vite.dev/)                      | `v7.3.1`   |

## 🚀 Getting It Running (If You Want To)

```bash
# Clone it (if you're into that sort of thing)
git clone https://github.com/joaocastilho/gaming-tracker.git
cd gaming-tracker

# Install deps with Bun (because npm is so 2010s)
bun install

# Start the dev server
bun run dev

# Build for production when you're ready to show off
bun run build

# Preview your production build
bun run preview
```

## 📁 Where Everything Lives

```
gaming-tracker/
├── src/
│   ├── lib/
│   │   ├── components/      # Reusable UI bits (GameCard, Header, etc.)
│   │   ├── stores/          # Svelte 5 state management (no more prop drilling!)
│   │   ├── utils/           # Helper functions I keep reinventing
│   │   └── types/           # TypeScript interfaces (because safety first)
│   ├── routes/              # SvelteKit pages and endpoints
│   ├── app.css              # Global styles (mostly Tailwind overrides)
│   └── app.html             # The base HTML template
├── static/
│   ├── games.json           # Starter game data (feel free to replace)
│   ├── covers/              # Game cover images (optimized WebP)
│   └── service-worker.js    # Makes the offline magic happen
├── scripts/                 # Build-time helper scripts
│   └── optimize-covers.ts   # Squishes those cover images
├── tests/                   # Because I pretend to care about testing
└── docs/
    └── project.md           # The boring technical specification
```

## 📜 Scripts I Actually Use

| Script           | What It Does                                   |
| ---------------- | ---------------------------------------------- |
| `bun run dev`    | Starts the dev server with hot reload          |
| `bun run build`  | Makes a production-ready build                 |
| `bun run check`  | TypeScript type checking (catches my mistakes) |
| `bun run lint`   | ESLint scolding me for bad code                |
| `bun run format` | Prettier making my code look nice              |
| `bun run test`   | Runs the test suite (yes, there are tests)     |

## 📚 Want to Know More?

- [Full project specs](docs/project.md) - For when you're really bored
- [Technical deep dive](docs/TECHNICAL.md) - How the sausage is made
- [Testing strategy](docs/test-plan.md) - How I try not to break things
- [AI agent instructions](AGENTS.md) - For robots that want to help

## 🙅‍♂️ Disclaimer

This is **my** personal project. I built it to scratch my own itch. If you find it useful, awesome! If not, that's cool too. I'm not accepting feature requests (unless they align with what I want), but feel free to fork it and make it your own.

Remember: The best software solves a problem you actually have. Mine was forgetting what games I played. What's yours?

Now if you'll excuse me, I have a backlog to track. 🎮

---

_Built with Svelte, TypeScript, and mild obsession._
