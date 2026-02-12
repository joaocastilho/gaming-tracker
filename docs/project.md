# Gaming Tracker - Complete Project Documentation

> **AI Implementation Guide**: This document packages all requirements, design, and technical specifications for sequential implementation of the Gaming Tracker application.

---

## 🚀 Quick Start Summary

### What We're Building

A single-user, client-side web application for tracking and rating video games with a visual tier list generator.

### Core Technology Stack

- **Framework**: SvelteKit with Svelte 5 Runes + TypeScript
- **Styling**: Tailwind CSS + Shadcn-Svelte components
- **Runtime**: Bun (Windows)
- **Deployment**: Static site (GitHub Pages/Netlify via @sveltejs/adapter-static)
- **Data**: Local JSON file (no database, no backend)
- **Environment**: Windows (using Git Bash for all terminal commands)

### Critical Constraints ⚠️

1. **NO BACKEND**: Purely client-side, static site generation only
2. **NO BROWSER STORAGE in artifacts**: Cannot use localStorage/sessionStorage in Claude artifacts (use React state or JS variables)
3. **STATIC DATA**: All data from `static/games.json`, mutations via file download
4. **BUILD-TIME IMAGES**: Image optimization runs pre-build via sharp script
5. **SINGLE USER**: No authentication, no multi-user support

### Project Structure

```
gaming-tracker/
├── src/
│   ├── routes/              # SvelteKit routes (SSG pages)
│   ├── lib/
│   │   ├── components/      # Reusable UI components
│   │   ├── stores/          # Svelte 5 Runes stores (app, games, filters, modal, editor, etc.)
│   │   └── utils/           # Helper functions
│   └── app.html             # HTML shell
├── static/
│   ├── games.json           # Data source (user downloads to update)
│   ├── covers/              # Optimized WebP images (build output)
│   └── covers_raw/          # Source PNG images (pre-optimization)
├── scripts/
│   └── optimize-covers.ts   # Pre-build image processor
└── svelte.config.js         # Static adapter config
```

### Implementation Order

1. **Phase 1 - Foundation** (Day 1-2)
   - Project setup + dependencies
   - Data schema + JSON loader
   - Basic layout + theme system
   - Image export
2. **Phase 2 - Core UI** (Day 2-3)
   - Gallery view with game cards
   - Navigation + search
   - Filtering system

3. **Phase 3 - Data Management** (Day 3-4)
   - Add/Edit forms (Phase 1: Planned, Phase 2: Completed)
   - JSON export mechanism
   - Detail modal

4. **Phase 4 - Advanced Views** (Day 4-5)
   - Detail modal with full game information
   - Tier list visualization

5. **Phase 5 - Polish** (Day 5-6)
   - Responsive design
   - Performance optimization
   - Accessibility

---

## 📋 Table of Contents

1. [Business Requirements (PRD)](#business-requirements-prd)
2. [Technical Specification (SRSD)](#technical-specification-srsd)
3. [User Interface Design (UXD)](#user-interface-design-uxd)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Cross-Reference Matrix](#cross-reference-matrix)

---

## Business Requirements (PRD)

### 1. Elevator Pitch 🎮

**Gaming Tracker** is a fast, personal, Single Page Application (SPA) designed for dedicated gamers to meticulously record and rank the games they play. By focusing on a clean **User Experience (UX)** and intuitive navigation, it allows a user to track games they have **Planned** and rate **Completed** games on **Presentation, Story, and Gameplay** to generate a visually appealing, cover-focused tier list that prioritizes speed and personal review insights.

### 2. Who is this app for 👤

- **Dedicated Gamers/Reviewers:** Individuals who want a structured, personal system for recording and reviewing their gaming history with specific metrics.
- **Curators:** Users who wish to organize their **Completed** games into a visually appealing, shareable Tier List based on personal scores.
- **Single User/Personal Projects:** The initial target is a single user (the owner) managing their personal data.

### 3. Functional Requirements - What does it do ⚙️

#### Core Tracking & Status

- Allow the user to mark a game's status as **"Planned"** or **"Completed."**
- Display a count of total tracked games and separate counts for **"Completed"** and **"Planned"** categories in the navigation bar.

#### Game Data Management (Two-Phase Input)

- Provide a dedicated **Game Input page** for adding and editing game data.

**Phase 1: Adding a New Game (Status: Planned)**

- **Purpose:** To quickly add a game to the user's backlog.
- **Required Fields for Input:**
  - **Title**
  - **Platform**
  - **Year**
  - **Genre**
  - **Co-op**
  - **Time to Beat** (Estimated completion time)
  - **Cover Image:** Accepts a **URL link** to a game cover. The application must fetch this image, save it to a local project directory (e.g., `/public/covers/`), and store the new local path (e.g., `covers/game-title.jpg`) in the JSON.
- **Status:** The game is automatically marked as **"Planned."**

**Phase 2: Completing an Existing Game (Status: Completed)**

- **Purpose:** To update a **"Planned"** game with final review metrics upon finishing.
- **Actions:** The user triggers this phase by selecting an 'Edit' button on a game card or row from the 'Planned' list.
- **Fields to be Added/Edited:**
  - Update Status to **"Completed."**
  - **Finished Date**
  - **Hours Played:** (Actual time taken, replacing "Time to Beat").
  - **Ratings:** Presentation (0-10), Story (0-10), Gameplay (0-10).
  - **Tier:** Assign a Tier.

#### Review & Scoring System

- Track and store three specific user ratings on a **0-10 scale**: **Presentation, Story, and Gameplay**.
- **Total Score Logic:** Automatically calculate the final **Score** using the formula:
  ```
  Score = (Presentation + Story + Gameplay) / 3 × 2
  ```
  This results in a final score on a scale from **0 to 20**.
- **Tier Structure:** The allowed Tiers are explicitly: **S - Masterpiece, A - Amazing, B - Great, C - Good, D - Decent, E - Bad**.

#### Data Persistence

- The application must read data from and intelligently update a local **JSON file**.
- The SPA must feature a mechanism to allow the user to **update and save the underlying JSON data** (e.g., via a discreet local file download/upload process).

#### Filtering and Sorting

- Provide filtering options for **Platforms, Genres, and Tiers**.
- Enable sorting/filtering by score ranges (Presentation, Story, Gameplay, Total Score).
- Include a prominent **Search bar** to quickly find games by Title.
- **Sorting:** The **Gallery View** must provide a clear way to initiate sorting based on key metrics (e.g., Score, Hours Played, Title, Year).

### 4. User Stories - How will the user interact 🙋

- **Phase 1 Input (Planned):** _As a user, I want a simple input form to quickly add a game to my **Planned** list, only requiring basic fields like **Cover, Title, Platform, Genre, Coop and Time to Beat**, so I can manage my backlog efficiently._
- **Phase 2 Input (Completed):** _As a user, I want to easily open a **Planned** game via an 'Edit' button, mark it as **Completed**, and then input my **Finished Date**, actual **Hours Played**, tier level and detailed **0-10 ratings** to finalize the review._
- **Visual Verification:** _As a user, I want to see a cover-focused **Gallery View** of my tracked games by default, with clear **icons and metrics** visible, to prioritize visual appeal._
- **Tier List Generation:** _As a user, I want to view a dedicated **Tier List** screen that groups all my **Completed** games visually by their assigned Tier, and allow the user to **export this list as an image**._

### 5. User Interface - How will the app look 🎨

- **Priorities:** **Speed, UX, and Navigation** are paramount. **Game Covers** must be the key visual element.
- **Theme:** Must feature a visible **Light Mode and Dark Mode** toggle.
- **Navigation:** A clean top navigation bar with clear links for **Completed, Planned, Tier List**, and **Game Input**.
- **Gallery View:** Game covers are the primary focus. Game cards must display: Title, Platform, Genre tags, and clear, icon-based metrics for the three scores and the final 0-20 score.
- **Iconography:** Metrics should use **clear, obvious icons and graphs** (instead of long labels) to represent scores, hours played, and dates, provided their meaning is immediately intuitive.
- **Responsiveness:** **Mobile and tablet support must be ensured.** The design must be optimized for all views, particularly ensuring the gallery of game covers is smooth and easily navigable on small screens.

### 6. Data Schema 💾

**Reference**: See [Database Design ERD](#database-design-erd) in Technical Specification for complete schema.

Each game object structure:

```json
{
	"id": "uuid-string-12345",
	"title": "Game Title",
	"platform": "PC",
	"year": 2024,
	"genre": "RPG",
	"coOp": "No",
	"status": "Planned",
	"coverImage": "covers/game-title.png",
	"timeToBeat": "25h 30m",
	"hoursPlayed": null,
	"finishedDate": null,
	"ratingPresentation": null,
	"ratingStory": null,
	"ratingGameplay": null,
	"score": null,
	"tier": null
}
```

---

## Technical Specification (SRSD)

### System Design

#### Overview

A client-side Single Page Application (SPA) built with SvelteKit as a static site generator. The application operates entirely in the browser with no backend server, using local JSON for data persistence and browser storage for user preferences.

#### Core Principles

- **Static Site Generation (SSG):** Pre-render all routes at build time
- **Client-Side Only:** Zero backend dependencies, purely browser-based
- **File-Based Data:** JSON file as the single source of truth
- **Optimized Assets:** WebP images with responsive sizing for performance
- **Progressive Enhancement:** Core functionality works, enhanced features gracefully degrade

#### Key Architectural Decisions

- Static adapter configuration for GitHub Pages/Netlify deployment
- Pre-build image optimization pipeline using `sharp`
- Client-side routing with SvelteKit's built-in router
- URL-based state management for shareability
- Browser localStorage for user preferences (theme)

### Architecture Pattern

**Pattern: Layered Architecture with Component-Based UI**

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

### State Management

#### Global State (Svelte Stores)

**App Store (`stores/app.svelte.ts`)**

```typescript
- theme: 'dark' | 'light'
- activeTab: 'all' | 'completed' | 'planned' | 'tierlist'
```

**Games Store (`stores/games.svelte.ts`)**

```typescript
- games: Game[] (loaded from JSON)
- loading: boolean
- error: string | null
```

**Filters Store (`stores/filters.svelte.ts`)**

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

**Filtered Games Store (`stores/filteredGamesStore.svelte.ts`)**

```typescript
- Computed filtered and sorted games based on current filters and active tab
- Filtered counts by status
```

**Modal Store (`stores/modal.svelte.ts`)**

```typescript
- isOpen: boolean
- activeGame: Game | null
- mode: 'view' | 'edit' | 'add'
```

**Editor Store (`stores/editor.svelte.ts`)**

```typescript
- Manages game creation and editing state
- Form validation and submission handling
```

**Completed Games Cache (`stores/completedGamesCache.svelte.ts`)**

```typescript
- Caches sorted completed games for performance
- Maintains completion order for sorting
```

**Offline Store (`stores/offline.svelte.ts`)**

```typescript
- Tracks online/offline status
- Manages offline data sync queue
```

#### Local State

- Component-specific UI state (hover, focus)
- Form validation errors
- Dropdown open/closed states
- Virtualization scroll position

#### Derived State

- Filtered games (computed from games + filters)
- Sorted games (computed from filtered games + sort)
- Game counts by status (computed from games array)
- Tier list groupings (computed from completed games)

#### State Persistence

- Theme preference → localStorage
- Filter state → URL query parameters
- Sort state → URL query parameters
- Active tab → URL route

### Data Flow

#### Application Initialization

1. **App Mount** → Load theme from localStorage → Apply theme class to `<html>`
2. **Load Games Data** → Fetch `static/games.json` → Parse JSON → Populate games store
3. **Restore UI State** → Read URL params → Set filters/sort → Read localStorage → Set view mode
4. **Initial Render** → Compute filtered/sorted games → Render active view

#### User Interactions Flow

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

#### Image Loading Flow

```
Build time: sharp script → Read PNG from covers_raw/ →
Optimize to WebP → Save to static/covers/ → Generate manifest

Runtime: Component requests cover → Resolve path from games.json →
Lazy load image → Show placeholder while loading → Display optimized WebP
```

### Technical Stack

#### Core Framework

- **SvelteKit:** with Svelte 5 Runes
- **TypeScript:**
- **Vite:** (bundled with SvelteKit)
- **Bun:** runtime for Windows

#### UI & Styling

- **Tailwind CSS:**
- **Shadcn-Svelte:** Component library with theming
- **Lucide-Svelte:** Icon library
- **PostCSS:** For Tailwind processing

#### Build & Optimization

- **@sveltejs/adapter-static:** Static site generation
- **sharp:** Image optimization pipeline
- **cssnano:** CSS minification
- **terser:** JavaScript minification (via Vite)

#### Development Tools

- **ESLint:** with `eslint-plugin-svelte` and TypeScript plugins
- **Prettier:** with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`
- **TypeScript ESLint:** For TypeScript linting
- **Svelte Check:** Type checking for Svelte files

#### Data Handling

- **Zod:** Runtime schema validation for JSON data
- **date-fns:** Date formatting and manipulation
- **Dexie.js:** IndexedDB wrapper for client-side storage

#### Testing

- **Vitest:** Unit testing framework
- **@testing-library:** Component testing utilities

### Authentication Process

**Not Applicable**: This is a single-user, client-side application with no authentication system. All data is local and stored in a static JSON file.

### Route Design

#### SvelteKit Routes Structure

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
├── login/
│   └── +page.svelte        # Admin login page
│
├── api/                    # API routes (local development only)
│   └── games-local/
│       └── +server.ts      # POST endpoint for saving games.json
│
└── +error.svelte           # Error page for 404/build errors
```

#### URL Structure & Query Parameters

**Base Routes:**

- `/` → All games
- `/completed` → Completed games only
- `/planned` → Planned games only
- `/tierlist` → Tier list visualization

**Query Parameters (Shared across routes):**

```
&search=query                    # Search filter
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
```

#### Navigation Behavior

- Tab clicks update URL and trigger route change
- Browser back/forward respects filter/sort state
- Deep linking supported (shareable URLs)
- Modal state in URL for direct linking to game details

### API Design

**Not Applicable (No Backend)**: This application has no traditional API layer. All data interactions happen client-side with static files.

#### Static Data API (File-Based)

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

#### Data Mutation Pattern (Pseudo-API)

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

### Database Design ERD

#### Entity: **Game**

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

#### Type Definitions (TypeScript)

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

#### Schema Validation (Zod)

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

#### Data Relationships

**No Foreign Keys** (Single entity, no relational database)

**Derived Fields:**

- `score`: Calculated from `(ratingPresentation + ratingStory + ratingGameplay) / 3 * 2`
- Must be recalculated whenever ratings change

**Conditional Fields:**

- When `status === 'Planned'`:
  - `hoursPlayed`, `finishedDate`, `rating*`, `score`, `tier` must be `null`
- When `status === 'Completed'`:
  - `hoursPlayed`, `finishedDate`, `rating*`, `score`, `tier` must have values

#### Storage Format

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

#### Indexing Strategy (In-Memory)

```typescript
// Created at runtime for performance
const gamesByStatus = new Map<GameStatus, Game[]>();
const gamesByTier = new Map<TierValue, Game[]>();
const gamesByPlatform = new Map<string, Game[]>();
const gamesById = new Map<string, Game>();
```

### Additional Implementation Notes

#### Image Optimization Script

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

#### Performance Optimizations

- **Lazy Loading:** Images load as they enter viewport
- **Performance:** Gallery view optimized for large datasets
- **Debounced Search:** 300ms delay before filtering
- **Memoized Computations:** Cache filtered/sorted results
- **Code Splitting:** Route-based chunks
- **Preload Critical Assets:** Theme CSS, font files

#### Deployment Configuration

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

## User Interface Design (UXD)

### Layout Structure

#### Primary Layout

The application uses a **fixed header layout** with content areas below:

1. **Header (Fixed)**
   - Always visible at the top
   - Contains: Logo, Add Game button, game count, theme toggle
   - Height: ~60px
   - Spans full viewport width

2. **Navigation Tabs (Fixed)**
   - Directly below header
   - Contains: Games, Finished, Planned, Tier List tabs
   - Each tab shows count in parentheses
   - Active tab indicated by bottom border and color change
   - Height: ~50px

3. **Search & Filter Section (Sticky)**
   - Sticks below navigation when scrolling
   - Contains: Search bar, filter dropdowns, view toggle
   - Two-row layout: Search bar (full width), then filters row
   - Height: ~100px total

4. **Content Area (Scrollable)**
   - Main content area that scrolls
   - Displays game cards in Gallery View
   - Padding: 24px horizontal

### Core Components

#### 1. Header Component

**Structure:**

```
[Logo + Add Button] -------- [Game Count + Theme Toggle]
```

**Elements:**

- **Logo**: Gaming Tracker with 🎮 emoji, left-aligned
- **Add Game Button**: Small, subtle button next to logo with "+ Add Game" text
- **Game Count**: "548 games tracked" (dynamic number)
- **Theme Toggle**: Sun ☀️ (light mode) or Moon 🌙 (dark mode) icon

**Styling:**

- Dark mode: Background #0a0d11, text white
- Light mode: Background white, text #1a1a1a
- Border bottom: 1-2px separator line

**Cross-reference**: [Header State](#global-state-svelte-stores) managed by App Store

#### 2. Navigation Tabs

**Tab Structure:**

- Games (548)
- Finished (174)
- Planned (374)
- Tier List

**Active State:**

- 2px blue (#3b82f6) bottom border
- Text color changes to white (dark) or black (light)

**Inactive State:**

- Text color #6b7280 (gray)
- No bottom border

**Cross-reference**: Maps to [Route Design](#route-design) - `/`, `/completed`, `/planned`, `/tierlist`

#### 3. Search Bar

**Full-width input field:**

- Placeholder: "🔍 Search games..."
- Border radius: 8px
- Padding: 12px 16px
- Dark mode: Background #1a1f27, border #2a2f3a
- Light mode: Background white, border #e5e7eb

**Cross-reference**: Updates [Filters Store](#global-state-svelte-stores) `searchQuery`

#### 4. Filter Controls

**Horizontal row of filter dropdowns:**

- All Platforms ▼
- All Genres ▼
- All Tiers ▼
- 📊 Ratings (opens rating sliders)
- ↻ Reset



**Styling:**

- Pills/buttons with rounded corners (6px)
- Padding: 8px 14px
- Font size: 0.85rem
- Dark mode: Background #1a1f27, border #2a2f3a
- Light mode: Background #f3f4f6, border #d1d5db

**Cross-reference**: Updates [Filters Store](#global-state-svelte-stores) and [URL Query Parameters](#url-structure--query-parameters)

#### 5. Game Card (Gallery View)

**Dimensions:**

- Cover: 260px wide × 390px tall (displays 600x900 source)
- Card spacing: 20px gap between cards
- Grid: Auto-fill, minimum 200px per column

**Cover Section:**

- Border radius: 12px
- Shadow: 0 4px 20px rgba(0,0,0,0.3)
- Hover: Translates up 4px, deeper shadow

**Badges on Cover:**

- **Tier Badge** (top-right): Tier name with color
  - S - Masterpiece: #dc2626 (red)
  - A - Amazing: #f97316 (orange)
  - B - Great: #eab308 (yellow)
  - C - Good: #22c55e (green)
  - D - Decent: #06b6d4 (cyan)
  - E - Bad: #6b7280 (gray)
- **Co-op Badge** (top-left, if applicable): "👥 Co-op" with blue background

**Info Section Below Cover:**

- **Title**: Font size 0.95rem, font weight 600
- **Year**: Font size 0.8rem, gray color
- **Platform & Genre Badges**: Row of colored pills
- **Metrics Row**: Icons with values
  - 👁️ Presentation score
  - ✏️ Story score
  - 🎮 Gameplay score
  - 🏆 Total score
- **Time/Date Row**:
  - Left: ⏱️ Hours played
  - Right: ✓ Finished date

**Cross-reference**:

- Data from [Game Entity Schema](#database-design-erd)
- Score calculation from [Review & Scoring System](#review--scoring-system)
- Click opens [Detail Modal](#9-detail-modal)

#### 6. Platform Badges

**Color Coding:**

- PC: Background #1e3a5f, Text #60a5fa (blue)
- PS5: Background #1e293b, Text #38bdf8 (cyan)
- Xbox: Background #14532d, Text #4ade80 (green)
- Switch: Background #7c2d12, Text #fb923c (orange)
- Add more as needed with distinct colors

**Styling:**

- Padding: 4px 8px
- Border radius: 4px
- Font size: 0.7rem
- Font weight: 500

#### 7. Genre Badges

**Color Coding:**

- Action RPG: Background #2d1f3f, Text #c084fc (purple)
- Story Adventure: Background #422006, Text #fbbf24 (amber)
- Action Adventure: Background #164e63, Text #22d3ee (cyan)
- Puzzle: Background #3f1f4d, Text #e879f9 (fuchsia)
- Metroidvania: Background #4c1d95, Text #a78bfa (violet)
- Add more with distinct color pairings

**Styling:**

- Same as platform badges
- Padding: 4px 8px
- Border radius: 4px



#### 8. Detail Modal

**Trigger:**

- Click on any game card in gallery view

**Layout:**

- Full-screen overlay with semi-transparent black background (rgba(0,0,0,0.8))
- Centered modal with max-width 1000px
- Two-column grid: Cover (400px) | Info (remaining space)

**Cover Section (Left):**

- Full-size cover: 400px × 600px (displays 600x900 source)
- Border radius: 12px
- Tier badge in top-right corner

**Info Section (Right):**

- **Title**: Font size 2rem, font weight 700
- **Meta badges**: Platform, Genre, Co-op status
- **Detail Grid** (2 columns):
  - Year Released
  - Time to Beat
  - Hours Played
  - Finished Date
- **Ratings Section**:
  - Each rating (Presentation, Story, Gameplay) with:
    - Icon + Label
    - Score value (e.g., "9/10")
    - Progress bar visualization
  - Total Score highlighted in larger box

**Progress Bars:**

- Background: #2a2f3a (dark) or #e5e7eb (light)
- Fill: Gradient from #3b82f6 to #8b5cf6
- Height: 8px
- Border radius: 4px

**Close Button:**

- Top-right corner (✕)
- Font size: 1.5rem
- Color: #8b92a8 (dark) or #6b7280 (light)

**Cross-reference**:

- State managed by [Modal Store](#global-state-svelte-stores)
- URL parameter `?game={gameId}` for deep linking

### Interaction Patterns

#### Navigation

1. **Tab Switching**: Click tab to change view, updates URL, maintains filters
2. **Search**: Real-time filtering as user types (debounced)
3. **Filters**: Dropdown menus with checkboxes for multi-select
4. **Sorting**: Select sort option from dropdown (e.g., Score, Title, Year, Hours)

**Cross-reference**: See [Data Flow](#data-flow) for detailed interaction flows

#### Adding Games

1. Click "+ Add Game" button in header
2. Opens modal form with Phase 1 fields (for Planned games)
3. After saving, game appears in Planned tab

**Cross-reference**: See [Phase 1 Input](#game-data-management-two-phase-input) in PRD

#### Editing Games

1. Click "Edit" button on game card (visible on hover or always visible on mobile)
2. Opens same modal with all fields populated
3. Can change status from Planned → Completed (unlocks Phase 2 fields)

**Cross-reference**: See [Add/Edit Game Flow](#user-interactions-flow)

#### Completing Games

1. From Planned list, click Edit on a game
2. Change status to "Completed"
3. Phase 2 fields appear: Finished Date, Hours Played, Ratings, Tier
4. After saving, game moves to Finished tab

**Cross-reference**: See [Phase 2 Input](#game-data-management-two-phase-input) in PRD

#### Detail View

1. Click on any game card
2. Modal opens with full information
3. Click overlay or ✕ button to close
4. Arrow keys to navigate between games (optional enhancement)

**Cross-reference**: See [Detail View Flow](#user-interactions-flow)

#### Tier List Export

1. Navigate to Tier List tab
2. Click "Export Image" button
3. Generates and downloads image of tier list

**Cross-reference**: See [Tier List Generation](#tier-list-generation) user story

### Visual Design Elements & Color Scheme

#### Color Palette

**Dark Mode:**

- Background: #0f1419
- Surface: #1a1f27
- Border: #2a2f3a
- Text Primary: #ffffff
- Text Secondary: #8b92a8
- Text Tertiary: #6b7280
- Accent: #3b82f6

**Light Mode:**

- Background: #f8f9fa
- Surface: #ffffff
- Border: #e5e7eb
- Text Primary: #1a1a1a
- Text Secondary: #4b5563
- Text Tertiary: #6b7280
- Accent: #3b82f6

**Tier Colors:**

- S - Masterpiece: #dc2626
- A - Amazing: #f97316
- B - Great: #eab308
- C - Good: #22c55e
- D - Decent: #06b6d4
- E - Bad: #6b7280

**Cross-reference**: Tier colors match [Tier Structure](#review--scoring-system) in PRD

#### Shadows & Elevation

- Card shadow: 0 4px 20px rgba(0,0,0,0.3)
- Card hover: 0 8px 30px rgba(0,0,0,0.5)
- Modal shadow: 0 20px 60px rgba(0,0,0,0.5)
- Badge shadow: 0 2px 8px rgba(0,0,0,0.3)

#### Border Radius

- Cards: 12px
- Badges: 4px
- Buttons: 6px
- Inputs: 8px
- Modal: 16px

#### Spacing Scale

- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 20px
- 2xl: 24px
- 3xl: 32px
- 4xl: 40px

### Mobile, Web App, Desktop Considerations

#### Desktop (1200px+)

- Gallery: 5-6 cards per row
- Modal: Two-column layout
- Filters: Single row
- Sidebar navigation: Optional left sidebar for future enhancement

#### Tablet (768px - 1199px)

- Gallery: 3-4 cards per row
- Modal: Two-column layout (narrower)
- Filters: May wrap to two rows

#### Mobile (< 768px)

- Gallery: 2 cards per row
- Cover size: Scales down proportionally (height: 240px)
- Modal: Single column layout, cover on top (height: 400px)
- Filters: Horizontal scroll, no wrap
- Search: Full width, prominent
- Navigation tabs: May scroll horizontally
- Sticky header and filters for easy access

**Cross-reference**: See [Responsiveness](#5-user-interface---how-will-the-app-look-) requirement in PRD

#### Touch Considerations

- All interactive elements minimum 44×44px touch target
- Increased padding on buttons and links
- Swipe gestures: Optional swipe to navigate between detail views
- Pull to refresh: Optional enhancement for updating data

#### Performance

- Lazy load game covers as user scrolls
- Optimize rendering for large datasets
- Debounce search input (300ms)
- Cache filter states in URL/localStorage

**Cross-reference**: See [Performance Optimizations](#performance-optimizations) in SRSD

### Typography

#### Font Family

- Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif
- System fonts for optimal performance and native feel

#### Font Sizes

- Hero Title (Modal): 2rem (32px)
- Page Title: 1.3rem (20.8px)
- Card Title: 0.95rem (15.2px)
- Body: 0.9rem (14.4px)
- Small Text: 0.8rem (12.8px)
- Tiny Text: 0.75rem (12px)
- Badge/Label: 0.7rem (11.2px)

#### Font Weights

- Bold: 700 (headings, important data)
- Semibold: 600 (titles, labels)
- Medium: 500 (badges, buttons)
- Normal: 400 (body text)

#### Line Heights

- Tight: 1.2 (headings)
- Normal: 1.3 (card titles)
- Relaxed: 1.5 (body text)
- Loose: 1.75 (long-form content)

#### Letter Spacing

- Tight: -0.02em (large headings)
- Normal: 0 (default)
- Wide: 0.5px (uppercase labels)

### Accessibility

#### Color Contrast

- Text on background: Minimum 4.5:1 ratio
- Badge text on badge background: Minimum 4.5:1 ratio
- All interactive elements meet WCAG AA standards

#### Keyboard Navigation

- Tab order: Logical top-to-bottom, left-to-right
- Focus indicators: 2px blue outline on all interactive elements
- Escape key: Closes modals and dropdowns
- Enter/Space: Activates buttons and toggles
- Arrow keys: Navigate between game cards (optional)

#### Screen Readers

- Semantic HTML: Proper heading hierarchy (h1, h2, h3)
- ARIA labels: Descriptive labels for icons and interactive elements
- Alt text: All images have descriptive alt text
- Live regions: Announce filter results and status changes
- Skip links: "Skip to main content" link at top

#### Focus Management

- Modal open: Focus moves to modal, traps within modal
- Modal close: Focus returns to triggering element
- Filter changes: Announce number of results

#### Other Considerations

- Animations: Respect prefers-reduced-motion
- Text: Minimum 16px for body text (0.9rem with 16px base = 14.4px - may need adjustment)
- Interactive elements: Clear hover and focus states
- Error messages: Clear, descriptive, associated with form fields

### Additional Notes

#### Icons Reference

- Presentation: 👁️ (eye)
- Story: ✏️ (writing hand)
- Gameplay: 🎮 (game controller)
- Score: 🏆 (trophy)
- Time: ⏱️ (stopwatch)
- Completed: ✓ (checkmark)
- Co-op: 👥 (people)
- Search: 🔍 (magnifying glass)
- Ratings: 📊 (bar chart)
- Reset: ↻ (circular arrow)
- Gallery: ⊞ (grid)

**Cross-reference**: Use Lucide-Svelte icons from [Technical Stack](#ui--styling)

#### State Management

- Active tab
- Selected filters
- Theme preference (dark/light)
- Sort order and column
- Search query
- Modal open/closed state

**Cross-reference**: See [State Management](#state-management) section in SRSD

#### Data Display Formats

- Hours: "XXh XXm" (e.g., "58h 38m")
- Dates: "Month DD, YYYY" (e.g., "May 28, 2025")
- Scores: "X/10" for individual, "XX/20" for total
- Year: "YYYY" (e.g., "2019")

**Cross-reference**: See [Data Schema](#6-data-schema-) for format specifications

#### Cover Image Specifications

- Source resolution: 600 × 900 pixels (2:3 aspect ratio)
- Display size (gallery): 260 × 390 pixels
- Display size (modal): 400 × 600 pixels
- Format: PNG source, WebP optimized
- Fallback: Gradient placeholder if image fails to load
- Storage: Local directory `/static/covers/`

**Cross-reference**: See [Image Optimization Script](#image-optimization-script) for build process

---

## Implementation Roadmap

### Phase 1 - Foundation (Day 1-2)

**Goal**: Set up project structure and core data layer

#### Tasks

1. **Project Initialization**
   - Create SvelteKit project with TypeScript
   - Install dependencies (see [Technical Stack](#technical-stack))
   - Configure `svelte.config.js` with static adapter
   - Set up Tailwind CSS v4.1 and PostCSS
   - Configure ESLint and Prettier

2. **Data Layer Setup**
   - Create `static/games.json` with sample data
   - Define TypeScript interfaces in `src/lib/types/game.ts`
   - Implement Zod schema validation
   - Create games store (`src/lib/stores/games.ts`)
   - Implement JSON loader in `+layout.ts`

3. **Basic Layout & Theme**
   - Create root layout (`+layout.svelte`)
   - Implement theme store (`src/lib/stores/app.ts`)
   - Add theme toggle component
   - Set up dark/light mode CSS variables
   - Create header component

**Validation Criteria**:

- ✓ Project builds successfully
- ✓ Theme toggle works and persists to localStorage
- ✓ Games data loads from JSON
- ✓ TypeScript types are enforced

**Cross-references**:

- [System Design](#system-design)
- [Database Design ERD](#database-design-erd)
- [Header Component](#1-header-component)

---

### Phase 2 - Core UI (Day 2-3)

**Goal**: Implement gallery view and navigation

#### Tasks

1. **Navigation System**
   - Create navigation tabs component
   - Implement routing for `/`, `/completed`, `/planned`, `/tierlist`
   - Add game count badges to tabs
   - Wire up active tab state

2. **Gallery View**
   - Create game card component
   - Implement CSS Grid layout (auto-fill)
   - Add platform and genre badges
   - Display tier badges
   - Show rating icons and scores
   - Add lazy loading for images

3. **Search Functionality**
   - Create search bar component
   - Implement filters store
   - Add debounced search (300ms)
   - Wire search to URL query parameters
   - Update game count based on search results

**Validation Criteria**:

- ✓ All routes work and show correct games
- ✓ Gallery displays cards in responsive grid
- ✓ Search filters games in real-time
- ✓ Tab counts update dynamically
- ✓ URL updates with search query

**Cross-references**:

- [Navigation Tabs](#2-navigation-tabs)
- [Game Card](#5-game-card-gallery-view)
- [Search Bar](#3-search-bar)
- [Route Design](#route-design)

---

### Phase 3 - Data Management (Day 3-4)

**Goal**: Enable adding, editing, and completing games

#### Tasks

1. **Filter System**
   - Create filter dropdown components
   - Implement multi-select for platforms/genres/tiers
   - Add rating range sliders
   - Wire filters to URL query parameters
   - Add reset filters button

2. **Add Game Form (Phase 1)**
   - Create modal store
   - Build add game modal
   - Implement form validation
   - Add fields: title, platform, year, genre, co-op, timeToBeat, cover
   - Handle cover image URL input (note: actual optimization happens at build time)
   - Generate UUID for new games
   - Update games store on submit

3. **Edit Game Form (Phase 2)**
   - Add edit button to game cards
   - Populate form with existing game data
   - Add status toggle (Planned → Completed)
   - Show Phase 2 fields when status is Completed
   - Implement score calculation
   - Update games store on submit

4. **JSON Export**
   - Create export function
   - Generate downloadable JSON file
   - Add export button to UI
   - Show success notification

**Validation Criteria**:

- ✓ Filters work correctly and update URL
- ✓ Can add new games (marked as Planned)
- ✓ Can edit existing games
- ✓ Phase 2 fields appear when status changes to Completed
- ✓ Score calculates correctly: `(P + S + G) / 3 × 2`
- ✓ JSON export downloads updated file

**Cross-references**:

- [Filter Controls](#4-filter-controls)
- [Game Data Management](#game-data-management-two-phase-input)
- [Add/Edit Game Flow](#user-interactions-flow)
- [Data Mutation Pattern](#data-mutation-pattern-pseudo-api)

---

### Phase 4 - Advanced Views (Day 4-5)

**Goal**: Add detail modal and tier list

#### Tasks

1. **Detail Modal**
   - Create detail modal component
   - Implement two-column layout (cover + info)
   - Show all game details
   - Display rating progress bars
   - Add close button and overlay click
   - Support `?game={id}` URL parameter for deep linking

2. **Tier List View**
   - Create tier list page (`/tierlist`)
   - Group completed games by tier (S, A, B, C, D, E)
   - Display games in horizontal rows per tier
   - Implement tier list export as image
   - Use HTML2Canvas or similar library

**Validation Criteria**:

- ✓ Detail modal opens with correct game data
- ✓ URL updates with `?game={id}` parameter
- ✓ Tier list groups games correctly
- ✓ Can export tier list as image

**Cross-references**:

- [Detail Modal](#8-detail-modal)
- [Tier List Generation](#tier-list-generation)
- [Route Design](#route-design)

---

### Phase 5 - Polish (Day 5-6)

**Goal**: Optimize performance, responsiveness, and accessibility

#### Tasks

1. **Responsive Design**
   - Test and fix mobile layout (< 768px)
   - Test and fix tablet layout (768px - 1199px)
   - Adjust grid columns for different breakpoints
   - Make filters scrollable on mobile
   - Optimize touch targets (minimum 44×44px)

2. **Performance Optimization**
   - Implement image lazy loading
   
   - Memoize filtered/sorted game computations
   - Optimize re-renders with Svelte reactivity
   - Test with large datasets (1000+ games)

3. **Accessibility**
   - Add ARIA labels to all icons
   - Implement keyboard navigation
   - Add focus indicators
   - Test with screen reader
   - Ensure color contrast ratios
   - Add skip links

4. **Image Optimization Pipeline**
   - Create `scripts/optimize-covers.ts`
   - Implement sharp-based conversion (PNG → WebP)
   - Add pre-build script to `package.json`
   - Test with sample cover images
   - Generate image manifest

5. **Final Testing**
   - Test all user flows end-to-end
   - Verify data persistence (JSON export/import)
   - Test theme switching
   - Test browser back/forward navigation
   - Test on different browsers
   - Verify build output (static files)

**Validation Criteria**:

- ✓ Fully responsive on mobile, tablet, desktop
- ✓ Gallery scrolls smoothly with 1000+ games
- ✓ Meets WCAG AA accessibility standards
- ✓ Images optimized to WebP format
- ✓ All user stories completed
- ✓ Production build succeeds and deploys

**Cross-references**:

- [Mobile Considerations](#mobile-web-app-desktop-considerations)
- [Performance Optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Image Optimization Script](#image-optimization-script)

---

## Cross-Reference Matrix

### PRD → SRSD → UXD Mapping

| PRD Requirement                       | SRSD Implementation                     | UXD Component                  |
| ------------------------------------- | --------------------------------------- | ------------------------------ |
| Two-Phase Input (Planned → Completed) | Games Store + Modal Store               | Add/Edit Game Form Modal       |
| Game Status Tracking                  | GameStatus type, conditional validation | Navigation Tabs with counts    |
| Cover Image URL Input                 | Image optimization script (build-time)  | Cover upload in form           |
| Rating System (0-10 × 3)              | Score calculation function              | Rating sliders in form         |
| Total Score (0-20)                    | `(P + S + G) / 3 × 2` formula           | Score display in card/detail   |
| Tier Structure (S-E)                  | TierValue type, validation              | Tier badge on cards            |
| Filtering (Platform/Genre/Tier)       | Filters Store + derived state           | Filter dropdown components     |
| Search by Title                       | Filters Store `searchQuery`             | Search bar component           |
| Gallery View (Default)                | App Store `activeTab`                   | Game card grid layout          |
| Tier List with Export                 | Tier grouping logic + HTML2Canvas       | Tier list page + export button |
| Sorting                               | Sort Store + URL params                 | Sort dropdown component        |
| Theme Toggle                          | App Store `theme` + localStorage        | Theme toggle button in header  |
| JSON Export/Import                    | Download/upload functions               | Export button in UI            |
| Responsive Design                     | Tailwind breakpoints                    | Mobile/tablet/desktop layouts  |

### Key Dependencies

**Must Complete Before**:

1. **Phase 1** before all others (foundation)
2. **Games Store** before any UI that displays games
3. **Filters Store** before search/filter UI
4. **Modal Store** before add/edit forms
5. **Theme System** before any styled components
6. **Gallery View** before detail modal (needs clickable cards)

**Can Build in Parallel**:

- Badge components (platform, genre, tier)
- Icon components
- Filter dropdown components
- Theme toggle and navigation tabs
- Image optimization script (separate from main app)

---

## Critical Implementation Notes

### ⚠️ Constraint Reminders

1. **NO BACKEND**: All operations client-side. No server, no API calls.
2. **NO BROWSER STORAGE in artifacts**: Cannot use localStorage/sessionStorage when building in Claude artifacts.
3. **STATIC ONLY**: Must use `@sveltejs/adapter-static` for deployment.
4. **BUILD-TIME IMAGES**: Image optimization runs before build, not at runtime.
5. **MANUAL DATA UPDATES**: User downloads updated JSON, no automatic sync.

### Score Calculation

**Formula**: `Score = (Presentation + Story + Gameplay) / 3 × 2`

**Example**:

- Presentation: 9
- Story: 8
- Gameplay: 10
- Score: (9 + 8 + 10) / 3 × 2 = 18

**Implementation**: Create utility function in `src/lib/utils/score.ts`

### Conditional Fields Logic

**When status is "Planned"**:

```typescript
hoursPlayed = null;
finishedDate = null;
ratingPresentation = null;
ratingStory = null;
ratingGameplay = null;
score = null;
tier = null;
```

**When status is "Completed"**:
All above fields must have values (non-null).

### Image Path Resolution

**Source**: `static/covers_raw/{gameTitle}.png`
**Optimized**: `static/covers/{gameId}.webp`
**In JSON**: `"coverImage": "covers/{gameId}.webp"`
**In Component**: `<img src="/{game.coverImage}" alt={game.title} />`

### URL State Management

**Example URL with full state**:

```
/completed?search=zelda&platforms=Switch&sortBy=score&sortDir=desc&game=uuid-123
```

**Benefits**:

- Shareable links
- Browser back/forward works
- Deep linking to specific game details
- State survives page refresh

---

## End of Project Documentation

This document provides complete context for building the Gaming Tracker application. Implement sequentially following the roadmap, referring back to specific sections as needed.

**Next Steps**:

1. Initialize project: `bun create svelte@latest gaming-tracker`
2. Install dependencies: `bun install`
3. Start with Phase 1 - Foundation
4. Follow implementation roadmap sequentially
5. Validate each phase before moving to next

**For Questions/Clarifications**: Refer to cross-referenced sections in this document.
