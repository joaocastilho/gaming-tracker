# Gaming Tracker - Software Requirements Specification Document (SRSD)

## System Design

### Overview

A client-side Single Page Application (SPA) built with SvelteKit as a static site generator. The application operates entirely in the browser with no backend server, using local JSON for data persistence and browser storage for user preferences.

### Core Principles

- **Static Site Generation (SSG):** Pre-render all routes at build time
- **Client-Side Only:** Zero backend dependencies, purely browser-based
- **File-Based Data:** JSON file as the single source of truth
- **Optimized Assets:** WebP images with responsive sizing for performance
- **Progressive Enhancement:** Core functionality works, enhanced features gracefully degrade

### Key Architectural Decisions

- Static adapter configuration for GitHub Pages/Netlify deployment
- Pre-build image optimization pipeline using `sharp`
- Client-side routing with SvelteKit's built-in router
- URL-based state management for shareability
- Browser localStorage for user preferences (theme)

---

## Architecture Pattern

### Pattern: **Layered Architecture with Component-Based UI**

**Layer 1: Presentation Layer**

- Svelte 5 components with Runes for reactivity
- Route-based page components (`+page.svelte`)
- Reusable UI components (cards, modals)
- Tailwind CSS for styling with Shadcn-Svelte theming

**Layer 2: Business Logic Layer**

- Svelte stores for global state management
- Utility functions for data transformation
- Filtering, sorting, and search algorithms
- Score calculation logic

**Layer 3: Data Access Layer**

- JSON file loader/parser
- Browser localStorage wrapper
- Image path resolution utilities
- Data validation and schema enforcement

**Cross-Cutting Concerns**

- Theme management (dark/light mode)
- Responsive design utilities
- Error boundaries and fallback UI
- Performance monitoring (lazy loading, virtualization)

---

## State Management

### Global State (Svelte Stores)

**App Store (`stores/app.ts`)**

```typescript
- theme: 'dark' | 'light'
- activeTab: 'all' | 'completed' | 'planned' | 'tierlist'
```

**Games Store (`stores/games.ts`)**

```typescript
- games: Game[] (loaded from JSON)
- loading: boolean
- error: string | null
```

**Filters Store (`stores/filters.ts`)**

```typescript
- searchQuery: string
- selectedPlatforms: string[]
- selectedGenres: string[]
- selectedTiers: string[]
- ratingRanges: {
  presentation: [min, max]
  story: [min, max]
  gameplay: [min, max]
  total: [min, max]
}
```

**Sort Store (`stores/sort.ts`)**

```typescript
- sortBy: 'title' | 'year' | 'score' | 'hours' | 'finished' | null
- sortDirection: 'asc' | 'desc'
```

**Modal Store (`stores/modal.ts`)**

```typescript
- isOpen: boolean
- activeGame: Game | null
- mode: 'view' | 'edit' | 'add'
```

### Local State

- Component-specific UI state (hover, focus)
- Form validation errors
- Dropdown open/closed states
- Virtualization scroll position

### Derived State

- Filtered games (computed from games + filters)
- Sorted games (computed from filtered games + sort)
- Game counts by status (computed from games array)
- Tier list groupings (computed from completed games)

### State Persistence

- Theme preference → localStorage

- Filter state → URL query parameters
- Sort state → URL query parameters
- Active tab → URL route

---

## Data Flow

### Application Initialization

1. **App Mount** → Load theme from localStorage → Apply theme class to `<html>`
2. **Load Games Data** → Fetch `static/games.json` → Parse JSON → Populate games store
3. **Restore UI State** → Read URL params → Set filters/sort → Read localStorage → Set theme
4. **Initial Render** → Compute filtered/sorted games → Render active view

### User Interactions Flow

**Search/Filter Flow:**

```
User types in search → Update filters store → Recompute derived state →
Re-render game list → Update URL params
```

**Tab Navigation Flow:**

```
User clicks tab → Update activeTab in app store → Update URL →
Filter games by status → Re-render view
```

**Sort Flow:**

```
User clicks column header → Update sort store →
Recompute sorted games → Re-render → Update URL
```

**Add/Edit Game Flow:**

```
User clicks Add/Edit → Open modal → Populate form → User submits →
Validate data → Update games array → Save to JSON (download) →
Close modal → Re-render list
```

**Detail View Flow:**

```
User clicks game card → Set activeGame in modal store →
Open modal → Render detail view → User closes →
Clear activeGame → Re-render
```

**Theme Toggle Flow:**

```
User clicks theme button → Toggle theme in app store →
Update <html> class → Save to localStorage → Re-render with new styles
```

### Image Loading Flow

```
Build time: sharp script → Read PNG from covers_raw/ →
Optimize to WebP → Save to static/covers/ → Generate manifest

Runtime: Component requests cover → Resolve path from games.json →
Lazy load image → Show placeholder while loading → Display optimized WebP
```

---

## Technical Stack

### Core Framework

- **SvelteKit:** `latest` (1.30+) with Svelte 5 Runes
- **TypeScript:** `5.9.x`
- **Vite:** `6.x` (bundled with SvelteKit)
- **Bun:** `1.3.x` runtime for Windows

### UI & Styling

- **Tailwind CSS:** `v4.1`
- **Shadcn-Svelte:** Component library with theming
- **Lucide-Svelte:** Icon library
- **PostCSS:** For Tailwind processing

### Build & Optimization

- **@sveltejs/adapter-static:** Static site generation
- **sharp:** Image optimization pipeline
- **cssnano:** CSS minification
- **terser:** JavaScript minification (via Vite)

### Development Tools

- **ESLint:** `9.x` with `eslint-plugin-svelte` and TypeScript plugins
- **Prettier:** `3.x` with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`
- **TypeScript ESLint:** For TypeScript linting
- **Svelte Check:** Type checking for Svelte files

### Data Handling

- **Zod:** Runtime schema validation for JSON data
- **date-fns:** Date formatting and manipulation

### Testing (Optional/Future)

- **Vitest:** Unit testing framework
- **Playwright:** E2E testing

---

## Authentication Process

### Not Applicable

This is a single-user, client-side application with no authentication system. All data is local and stored in a static JSON file.

### Future Considerations (If Multi-User Required)

- Could integrate browser-based authentication (e.g., Firebase Auth)
- User-specific data would require backend or cloud storage
- Current architecture assumes single-user ownership

---

## Route Design

### SvelteKit Routes Structure

```
src/routes/
├── +layout.svelte           # Root layout with header, nav, theme provider
├── +layout.ts              # Load games.json, initialize stores
├── +page.svelte            # Home/All games (default: gallery view)
├── +page.ts                # Load and filter all games
│
├── completed/
│   ├── +page.svelte        # Completed games view
│   └── +page.ts            # Filter games where status === 'Completed'
│
├── planned/
│   ├── +page.svelte        # Planned games view
│   └── +page.ts            # Filter games where status === 'Planned'
│
├── tierlist/
│   ├── +page.svelte        # Tier list view with export functionality
│   └── +page.ts            # Group completed games by tier
│
└── +error.svelte           # Error page for 404/build errors
```

### URL Structure & Query Parameters

**Base Routes:**

- `/` → All games
- `/completed` → Completed games only
- `/planned` → Planned games only
- `/tierlist` → Tier list visualization

**Query Parameters (Shared across routes):**

```
?search=query                    # Search filter
&platforms=PC,PS5                # Selected platforms (comma-separated)
&genres=RPG,Action               # Selected genres (comma-separated)
&tiers=S,A,B                     # Selected tiers (comma-separated)
&sortBy=score                    # Sort column
&sortDir=desc                    # Sort direction
&game={gameId}                   # Open detail modal for game
```

**Example URLs:**

```
/completed?sortBy=score&sortDir=desc
/planned?search=zelda&platforms=Switch
/?game=uuid-12345                # Opens detail modal for game
/tierlist                         # No filters apply here
```

### Navigation Behavior

- Tab clicks update URL and trigger route change
- Browser back/forward respects filter/sort state
- Deep linking supported (shareable URLs)
- Modal state in URL for direct linking to game details

---

## API Design

### Not Applicable (No Backend)

This application has no traditional API layer. All data interactions happen client-side with static files.

### Static Data API (File-Based)

**Endpoint:** `static/games.json`

- **Method:** GET (via fetch at build time)
- **Response:** JSON array of game objects
- **Schema:** Defined in PRD (id, title, platform, etc.)
- **Error Handling:** Fallback to empty array, display error message

**Endpoint:** `static/covers/{gameId}.webp`

- **Method:** GET (via `<img>` tag)
- **Response:** Optimized WebP image
- **Fallback:** Placeholder gradient if image missing
- **Error Handling:** `onerror` handler shows fallback UI

### Data Mutation Pattern (Pseudo-API)

**Add Game:**

```typescript
function addGame(newGame: Game): void {
	games.update((all) => [...all, newGame]);
	downloadUpdatedJSON(); // Trigger browser download
}
```

**Update Game:**

```typescript
function updateGame(id: string, updates: Partial<Game>): void {
	games.update((all) => all.map((g) => (g.id === id ? { ...g, ...updates } : g)));
	downloadUpdatedJSON();
}
```

**Delete Game:**

```typescript
function deleteGame(id: string): void {
	games.update((all) => all.filter((g) => g.id !== id));
	downloadUpdatedJSON();
}
```

**Export JSON:**

```typescript
function downloadUpdatedJSON(): void {
	const json = JSON.stringify($games, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'games.json';
	link.click();
}
```

---

## Database Design ERD

### Entity: **Game**

```
┌─────────────────────────────────────────┐
│                  GAME                   │
├─────────────────────────────────────────┤
│ PK  id: string (UUID)                   │
│     title: string                       │
│     platform: string                    │
│     year: number                        │
│     genre: string                       │
│     coOp: "Yes" | "No"                  │
│     status: "Planned" | "Completed"     │
│     coverImage: string (path)           │
│     timeToBeat: string (e.g. "25h 30m") │
│     hoursPlayed: string | null          │
│     finishedDate: string | null         │
│     ratingPresentation: number | null   │
│     ratingStory: number | null          │
│     ratingGameplay: number | null       │
│     score: number | null (0-20 calc)    │
│     tier: TierValue | null              │
└─────────────────────────────────────────┘
```

### Type Definitions (TypeScript)

```typescript
type GameStatus = 'Planned' | 'Completed';

type TierValue = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

type CoOpStatus = 'Yes' | 'No';

interface Game {
	id: string; // UUID v4
	title: string; // Required, 1-200 chars
	platform: string; // Required (PC, PS5, Xbox, Switch, etc.)
	year: number; // Required, 1970-2099
	genre: string; // Required (RPG, Action, etc.)
	coOp: CoOpStatus; // Required
	status: GameStatus; // Required, default: "Planned"
	coverImage: string; // Path: covers/{id}.webp
	timeToBeat: string; // Format: "XXh XXm"
	hoursPlayed: string | null; // Format: "XXh XXm", null if Planned
	finishedDate: string | null; // ISO date string, null if Planned
	ratingPresentation: number | null; // 0-10, null if Planned
	ratingStory: number | null; // 0-10, null if Planned
	ratingGameplay: number | null; // 0-10, null if Planned
	score: number | null; // 0-20 (calculated), null if Planned
	tier: TierValue | null; // null if Planned
}
```

### Schema Validation (Zod)

```typescript
const GameSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).max(200),
	platform: z.string().min(1),
	year: z.number().int().min(1970).max(2099),
	genre: z.string().min(1),
	coOp: z.enum(['Yes', 'No']),
	status: z.enum(['Planned', 'Completed']),
	coverImage: z.string().regex(/^covers\/[\w-]+\.webp$/),
	timeToBeat: z.string().regex(/^\d+h \d+m$/),
	hoursPlayed: z
		.string()
		.regex(/^\d+h \d+m$/)
		.nullable(),
	finishedDate: z.string().datetime().nullable(),
	ratingPresentation: z.number().min(0).max(10).nullable(),
	ratingStory: z.number().min(0).max(10).nullable(),
	ratingGameplay: z.number().min(0).max(10).nullable(),
	score: z.number().min(0).max(20).nullable(),
	tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E']).nullable()
});
```

### Data Relationships

**No Foreign Keys** (Single entity, no relational database)

**Derived Fields:**

- `score`: Calculated from `(ratingPresentation + ratingStory + ratingGameplay) / 3 * 2`
- Must be recalculated whenever ratings change

**Conditional Fields:**

- When `status === 'Planned'`:
  - `hoursPlayed`, `finishedDate`, `rating*`, `score`, `tier` must be `null`
- When `status === 'Completed'`:
  - `hoursPlayed`, `finishedDate`, `rating*`, `score`, `tier` must have values

### Storage Format

**File:** `static/games.json`

**Structure:**

```json
{
	"games": [
		{
			/* Game object */
		},
		{
			/* Game object */
		}
	],
	"meta": {
		"lastUpdated": "2025-11-01T12:00:00Z",
		"version": "1.0"
	}
}
```

**File Operations:**

- **Read:** Loaded at build time via `+layout.ts`
- **Write:** User downloads updated JSON file manually
- **Validation:** Zod schema validation on load
- **Backup:** User responsible for version control

### Indexing Strategy (In-Memory)

```typescript
// Created at runtime for performance
const gamesByStatus = new Map<GameStatus, Game[]>();
const gamesByTier = new Map<TierValue, Game[]>();
const gamesByPlatform = new Map<string, Game[]>();
const gamesById = new Map<string, Game>();
```

---

## Additional Implementation Notes

### Image Optimization Script

**Location:** `scripts/optimize-covers.ts`

**Execution:** `bun run optimize-covers` (pre-build step)

**Process:**

1. Read all PNG files from `static/covers_raw/`
2. For each file:
   - Validate dimensions (expect 600x900)
   - Convert to WebP with quality 85
   - Resize to multiple sizes (400w, 260w thumbnails optional)
   - Save to `static/covers/{gameId}.webp`
3. Generate manifest file with image metadata
4. Log optimization results (size reduction, count)

### Performance Optimizations

- **Lazy Loading:** Images load as they enter viewport
- **Virtualization:** List view virtualizes items for 1000+ games
- **Debounced Search:** 300ms delay before filtering
- **Memoized Computations:** Cache filtered/sorted results
- **Code Splitting:** Route-based chunks
- **Preload Critical Assets:** Theme CSS, font files

### Deployment Configuration

**Adapter Config (`svelte.config.js`):**

```typescript
adapter: static({
	pages: 'build',
	assets: 'build',
	fallback: 'index.html',
	precompress: true,
	strict: true
});
```

**Build Output:**

- Static HTML for all routes
- Pre-rendered pages with data
- Optimized assets (CSS, JS, images)
- Service worker for offline support (optional)

---

**End of Software Requirements Specification Document**
