# Technical Architecture Documentation

**Project**: Gaming Tracker  
**Version**: 1.0.0  
**Last Updated**: 15 February 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Data Flow](#data-flow)
4. [Component Hierarchy](#component-hierarchy)
5. [Store Architecture](#store-architecture)
6. [State Management](#state-management)
7. [Performance Optimizations](#performance-optimizations)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Build & Deployment](#build--deployment)

---

## System Overview

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | SvelteKit | 2.51.0 | Full-stack framework |
| UI Library | Svelte | 5.51.0 | Reactive UI with Runes |
| Language | TypeScript | 5.9.3 | Type safety |
| Styling | Tailwind CSS | 4.1.18 | Utility-first CSS |
| Storage | Dexie.js | 4.3.0 | IndexedDB wrapper |
| Runtime | Bun | 1.3.8 | Package manager & runtime |
| Build | Vite | 7.3.1 | Bundler & dev server |

### Application Type

**Single-Page Application (SPA)** with static site generation:
- Client-side rendering after initial load
- No backend server required
- Data persisted in browser's IndexedDB
- Static export for deployment

---

## Architecture Patterns

### 1. Svelte 5 Runes Pattern

All reactive state uses Svelte 5 Runes:

```typescript
// Store Pattern
class Store {
  private _state = $state<State>(initialState);
  
  get state() {
    return this._state;
  }
  
  setState(value: State) {
    this._state = value;
  }
}

// Component Pattern
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  // Side effects
  console.log(count);
});
```

**Why**: Native reactivity without stores, better performance, simpler mental model

### 2. Class-Based Stores

Stores implemented as classes with:
- Private state fields
- Public getter methods
- Action methods for mutations
- No legacy subscribe pattern (removed in Phase 11)

```typescript
class GamesStore {
  private _games = $state<Game[]>([]);
  
  get games() {
    return this._games;
  }
  
  addGame(game: Game) {
    this._games = [...this._games, game];
  }
}
```

### 3. Derived State Pattern

Computed values use `$derived`:

```typescript
// In components
let isEditor = $derived(editorStore.editorMode);

// In stores
get completedGames() {
  return this._games.filter(g => g.status === 'Completed');
}
```

### 4. Props-Down Events-Up

Data flow:
- Props passed down from parent to child
- Events dispatched up from child to parent
- No prop drilling - use stores for shared state

---

## Data Flow

### Initialization Flow

```
1. Browser loads index.html
   ↓
2. SvelteKit hydrates SPA
   ↓
3. +layout.ts load() function
   ├─ Try Dexie/IndexedDB first
   ├─ Fall back to fetch /games.json
   └─ Seed Dexie if empty
   ↓
4. +layout.svelte initializes
   ├─ gamesStore.initializeGames(data)
   ├─ Apply theme from localStorage
   └─ Read URL params for filters/modal
   ↓
5. App renders based on route
```

### User Interaction Flow

**Search Example:**
```
User types in SearchBar
    ↓
SearchBar debounces (300ms)
    ↓
filtersStore.setSearchTerm(value)
    ↓
filtersStore.writeSearchToURL() (debounced)
    ↓
filteredGamesStore.games recomputes
    ↓
GamesView re-renders with filtered games
    ↓
URL updated with ?s=searchterm
```

**Filter Example:**
```
User selects platform filter
    ↓
filtersStore.togglePlatform(platform)
    ↓
filtersStore.writeFiltersToURL()
    ↓
filteredGamesStore.games recomputes
    ↓
GamesView re-renders
    ↓
filteredCountsStore updates tab counts
    ↓
Header/BottomNavigation updates badges
```

### Modal Flow

**Opening:**
```
User clicks game card
    ↓
GameCard calls onOpenModal prop
    ↓
GamesView calls modalStore.openViewModal()
    ↓
modalStore updates state
    ↓
modalStore.writeToURL() - updates URL ?game=slug
    ↓
DetailModal renders with activeGame
    ↓
Focus trap activates
```

**Closing:**
```
User clicks close or presses Escape
    ↓
modalStore.closeModal()
    ↓
modalStore clears state
    ↓
modalStore.writeToURL() - removes ?game param
    ↓
URL updated
    ↓
DetailModal unmounts
    ↓
Focus restored to trigger element
```

---

## Component Hierarchy

```
+layout.svelte (Root)
├── Header
│   ├── Logo
│   ├── SearchBar
│   ├── FilterDropdown (platform, genre, tier)
│   ├── FilterToggle (co-op)
│   ├── RatingsSort
│   └── ThemeToggle
│
├── Main Content Area
│   ├── GamesView (route: /, /completed, /planned)
│   │   └── VirtualList
│   │       └── GameCard (×N)
│   │           ├── Cover Image
│   │           ├── Badges (platform, genre)
│   │           └── Rating indicators
│   │
│   └── TierListView (route: /tierlist)
│       └── TierRow (S, A, B, C, D, E)
│           └── GameCard
│
├── BottomNavigation (Mobile)
│   ├── All Games
│   ├── Completed
│   ├── Planned
│   └── Tier List
│
├── Modals (conditionally rendered)
│   ├── DetailModal
│   │   ├── Cover Image (full size)
│   │   ├── Rating details
│   │   ├── Navigation (prev/next)
│   │   └── Edit/Delete buttons
│   │
│   ├── GameEditorModal
│   │   ├── Form fields
│   │   ├── Cover upload
│   │   └── Rating inputs
│   │
│   ├── DeleteConfirmModal
│   └── LoginModal
│
└── Utilities
    ├── ScrollToTopButton
    └── OfflineIndicator
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `+layout.svelte` | App shell, routing, global state coordination |
| `Header` | Top navigation, search, filters |
| `GamesView` | Grid layout, virtualization |
| `VirtualList` | Efficient rendering of large lists |
| `GameCard` | Individual game display |
| `DetailModal` | Full game details, navigation |
| `GameEditorModal` | Add/edit game forms |

---

## Store Architecture

### Store Hierarchy

```
appStore (Theme, Active Tab)
    ↓
gamesStore (Source of Truth - All Games)
    ↓
filtersStore (Search, Filters, Sort)
    ↓
filteredGamesStore (Computed - Filtered & Sorted)
    ↓
filteredCountsStore (Tab Counts)
    ↓
UI Components
```

### Store Details

#### appStore
```typescript
interface AppState {
  theme: 'dark' | 'light';
  activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
}
```
- **Purpose**: Global UI state
- **Persistence**: localStorage (theme only)

#### gamesStore
```typescript
interface GamesState {
  games: Game[];
}
```
- **Purpose**: Source of truth for all game data
- **Persistence**: Dexie/IndexedDB
- **Operations**: CRUD (add, update, delete)

#### filtersStore
```typescript
interface FilterState {
  searchTerm: string;
  platforms: string[];
  genres: string[];
  tiers: string[];
  coOp: string[];
  sortOption: { key: string; direction: 'asc' | 'desc' } | null;
}
```
- **Purpose**: User filter selections
- **Persistence**: URL query parameters
- **Operations**: Toggle filters, set search, sort

#### filteredGamesStore
```typescript
// Computed - no persisted state
interface FilteredGames {
  games: Game[]; // Filtered & sorted based on current tab/filters
}
```
- **Purpose**: Derived filtered/sorted game list
- **Caching**: Stringified cache key based on filters
- **Updates**: Automatically when games/filters change

#### modalStore
```typescript
interface ModalState {
  isOpen: boolean;
  mode: 'view' | 'edit' | 'add' | null;
  activeGame: Game | null;
  displayedGames: Game[];
}
```
- **Purpose**: Modal state management
- **Persistence**: URL (?game=slug parameter)
- **Operations**: Open, close, navigate

---

## State Management

### Reactive Dependencies

```
appStore.activeTab
  → filtersStore.resetAllFilters() (when switching to tierlist)
  → isGamesPage / isTierlistPage derived values
  → showTiersFilter / showCoOpFilter derived values

gamesStore.games
  → filteredGamesStore.games (recomputes)
  → filteredCountsStore.updateCounts()
  → game cards re-render

filtersStore.state
  → filteredGamesStore.games (recomputes)
  → URL updates (debounced)
  → filteredCountsStore.updateCounts()

modalStore.state
  → URL updates
  → DetailModal visibility
  → Keyboard event handlers
```

### URL as State

The URL serves as serialized application state:

| Parameter | Store | Example |
|-----------|-------|---------|
| `s` | filtersStore | `?s=zelda` |
| `platform` | filtersStore | `?platform=PC,PS5` |
| `genre` | filtersStore | `?genre=Action` |
| `tier` | filtersStore | `?tier=S,A` |
| `coop` | filtersStore | `?coop=Yes` |
| `sort` | filtersStore | `?sort=score:desc` |
| `game` | modalStore | `?game=zelda-botw` |

### Sync Strategy

**URL → State** (on page load/navigation):
```typescript
$effect(() => {
  filtersStore.readSearchFromURL(page.url.searchParams);
  filtersStore.readFiltersFromURL(page.url.searchParams);
  modalStore.readFromURL(page.url.searchParams, games);
});
```

**State → URL** (on user action):
```typescript
// Debounced 300ms for search
writeSearchToURL = debounce((pageState) => {
  replaceState(pageState, { ...currentState, searchTerm });
}, 300);
```

---

## Performance Optimizations

### 1. Virtual Scrolling

**File**: `VirtualList.svelte`

Renders only visible items + overscan:
```typescript
// Only render items in viewport
visibleItems = items.slice(startIndex, endIndex);
```

**Benefits**:
- O(visible) DOM nodes regardless of total items
- 1000+ games render smoothly
- Reduced memory usage

### 2. Memoized Filtering

**File**: `filteredGamesStore.svelte.ts`

Cache key based on filter state:
```typescript
private createCacheKey(filters, activeTab): string {
  return JSON.stringify({
    searchTerm: filters?.searchTerm,
    platforms: filters?.platforms,
    // ...all filter params
  });
}

get games(): Game[] {
  const cacheKey = this.createCacheKey(filters, activeTab);
  if (this.lastCacheKey === cacheKey) {
    return this.lastCachedResult; // Return cached
  }
  // ...compute and cache
}
```

**Benefits**:
- No recomputation if filters unchanged
- O(1) cache lookup vs O(n) filtering

### 3. Debounced Inputs

**File**: `SearchBar.svelte`, `filters.svelte.ts`

```typescript
writeSearchToURL = debounce((value) => {
  updateURL(value);
}, 300);
```

**Benefits**:
- Reduces URL updates while typing
- Fewer filter recomputations

### 4. Lazy Image Loading

**File**: `GameCard.svelte`

```svelte
<img
  loading={isPriority ? 'eager' : 'lazy'}
  decoding="async"
/>
```

**Benefits**:
- Images load as they enter viewport
- Reduced initial page load
- Priority loading for above-fold images

### 5. Code Splitting

**File**: `vite.config.ts`

```typescript
manualChunks: {
  'filters': ['filter components'],
  'modals': ['modal components'],
  'games-store': ['games store logic']
}
```

**Benefits**:
- Smaller initial bundle
- On-demand loading of features

### 6. Content Visibility

**File**: `TierRow.svelte`

```css
.tier-row {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}
```

**Benefits**:
- Browser skips off-screen rendering
- Improved scroll performance

---

## Security Considerations

### XSS Prevention

1. **No innerHTML**: All content rendered via Svelte's safe templating
2. **URL Validation**: Slugs validated before use
3. **Input Sanitization**: Zod validation on all inputs

### CSP (Content Security Policy)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self';
```

**Note**: `unsafe-inline` and `unsafe-eval` required for SvelteKit but should be documented.

### Data Persistence

- No sensitive data stored
- All data client-side only
- No authentication (single-user app)
- IndexedDB isolated to origin

---

## Testing Strategy

### Test Types

| Type | Purpose | Location |
|------|---------|----------|
| Unit | Individual functions | `tests/test-utils.test.ts` |
| Store | State management | `tests/test-*-store*.test.ts` |
| Component | UI behavior | `tests/test-*-ui.test.ts` |
| Integration | Flows across components | `tests/test-*-integration*.test.ts` |

### Test Approach

**Test-First Development**:
1. Write failing test
2. Verify it fails
3. Implement fix
4. Verify test passes
5. Run full suite

### Coverage Requirements

- **Overall**: 85%+ line coverage
- **Stores**: 95%+ coverage
- **Utils**: 90%+ coverage
- **Components**: 80%+ coverage

### Mock Strategy

- **IndexedDB**: fake-indexeddb
- **SvelteKit modules**: Custom mocks in `tests/mocks/`
- **Browser APIs**: jsdom + manual mocks
- **Stores**: Real stores with reset capability

---

## Build & Deployment

### Build Process

```bash
bun run build
```

Steps:
1. Svelte compilation
2. TypeScript compilation
3. Tailwind CSS processing
4. Vite bundling with manual chunks
5. Static adapter generates HTML/CSS/JS
6. Output to `build/` directory

### Deployment Targets

- **Static hosting**: GitHub Pages, Netlify, Cloudflare Pages
- **Output**: Single-page application with fallback to index.html
- **Precompression**: Gzip/Brotli enabled

### Performance Budgets

- **Initial bundle**: < 200KB gzipped
- **Total assets**: < 2MB
- **First paint**: < 1.5s
- **Time to interactive**: < 3s

---

## Development Guidelines

### Adding a New Feature

1. **Design**: How does it fit in the store hierarchy?
2. **Tests**: Write tests first (TDD)
3. **State**: Does it need a new store or use existing?
4. **Components**: Create/update components
5. **Integration**: Wire up to existing flow
6. **Verify**: Run full test suite

### Modifying Existing Code

1. **Understand**: Trace data flow through stores
2. **Test**: Write test capturing current + desired behavior
3. **Refactor**: Make minimal change
4. **Verify**: All tests pass
5. **Check**: No regressions in lint/typecheck/tests

### Debugging

1. **Store DevTools**: Check `$gamesStore`, `$filtersStore` in console
2. **URL State**: Check query params match expected state
3. **Virtual List**: Check visible item indices
4. **Network**: Check games.json load, cover images

---

## Migration Notes

### Phase 11: Store Pattern Migration

**Before** (Legacy):
```typescript
// Subscribe pattern
export const gamesStore = writable<Game[]>([]);
$gamesStore.subscribe(value => { ... });
```

**After** (Svelte 5):
```typescript
// Class with $state
class GamesStore {
  private _games = $state<Game[]>([]);
  get games() { return this._games; }
}
export const gamesStore = new GamesStore();
// Usage: gamesStore.games
```

---

## Appendix

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `GameCard.svelte` |
| Stores | camelCase.svelte.ts | `games.svelte.ts` |
| Utils | camelCase.ts | `dateUtils.ts` |
| Tests | test-kebab-case.test.ts | `test-game-management.test.ts` |

### Key Dependencies

- **Dexie**: IndexedDB wrapper for offline storage
- **Zod**: Runtime validation
- **Lucide**: **Tailwind**: Icon library
- Utility CSS

### Progressive Web App (PWA)

The app includes full PWA support for offline-first functionality:

#### Web App Manifest
Located at `static/site.webmanifest`:
- App name: "Gaming Tracker"
- Display: "standalone" (launches without browser chrome)
- Theme color: Matches app dark theme
- Icons: 192x192 and 512x512 with maskable variants
- Categories: entertainment, games

#### Service Worker
Located at `static/service-worker.js`:
- **Cache-first** for navigation requests and app shell
- **Cache-first with background update** for static assets (JS, CSS, images)
- **Network-first** for dynamic content
- **Background sync** for offline mutations

#### Offline Support

| Feature | Implementation |
|---------|----------------|
| Data Storage | IndexedDB via Dexie.js |
| Offline Detection | `navigator.onLine` + window events |
| Offline Indicator | `OfflineIndicator` component in Header |
| Sync Queue | `offline.svelte.ts` store |
| Install Prompt | `beforeinstallprompt` event handler |

#### Install Prompt Flow

1. App listens for `beforeinstallprompt` event in `+layout.svelte`
2. User clicks "Install App" in MobileSettingsMenu
3. Native browser install dialog appears
4. App installs as standalone PWA

### File Naming Conventions
