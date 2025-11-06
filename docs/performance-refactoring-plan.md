# AI-Assisted Performance Refactoring Plan

Your task is to apply the following performance optimizations to the SvelteKit codebase. Follow the instructions for each task, using the provided code examples as a precise guide for modifying the files.

## Task Checklist

### Priority 1: Initial Load Performance

- [ ] **1.1.** Unblock initial rendering in `src/routes/+layout.ts`.
- [ ] **1.2.** Move `sharp` from `dependencies` to `devDependencies` in `package.json`.
- [ ] **1.3.** Strip Zod schema validations from production builds in `src/lib/stores/games.ts`.
- [ ] **1.4.** Code-split the `DetailModal` component, loading it only when opened.
- [ ] **1.5.** Code-split the main page views, dynamically loading components by tab.

### Priority 2: Reactivity & Rendering

- [ ] **2.1.** Refactor Svelte 5 reactivity anti-patterns (remove `$effect`+`subscribe`).
- [ ] **2.2.** Pre-compute `titleParts` in `src/lib/utils/dataTransformer.ts`.
- [ ] **2.3.** Replace inline `style` for tier colors with CSS classes in `src/routes/+page.svelte`.
- [ ] **2.4.** Add `crossfade` transitions for tab switching in `src/routes/+page.svelte`.

### Priority 3: Perceived Performance & UX

- [ ] **3.1.** Preload modal detail images via `onmouseover` in `src/lib/components/GameCard.svelte`.
- [ ] **3.2.** Prevent image fade-in flicker for cached images in `src/lib/components/GameCard.svelte`.
- [ ] **3.3.** Debounce URL state updates.
- [ ] **3.4.** Add accessibility focus trap to `src/lib/components/DetailModal.svelte`.
- [ ] **3.5.** Lazy-load the `html2canvas` library.

### Priority 4: Advanced Optimizations

- [ ] **4.1.** (Optional) Move data processing to a Web Worker.
- [ ] **4.2.** (Optional) Implement a virtual list for game grids.
- [ ] **4.3.** (Optional) Split data into `index.json` and `details/[id].json`.

### Priority 5: CSS Cleanup

- [ ] **5.1.** Move duplicate `@keyframes` from components to `src/app.css`.

---

## Detailed Instructions

### Priority 1: Initial Load Performance

#### 1.1. Unblock Initial Rendering

**File:** `src/routes/+layout.ts`

**Problem:** The root layout `await`s the entire `games.json` file to be fetched and processed, blocking the page from rendering.
**Solution:** Remove the `await` keyword. This allows the page to render instantly with its skeleton UI while the data loads in the background.

**Before:**

```typescript
// src/routes/+layout.ts

import { gamesStore } from '$lib/stores/games';

/**
 * Layout load function that initializes the games store
 * Loads games data from games.json and populates the store
 */
export async function load(event) {
	// Start loading games data with event context for proper fetch handling
	await gamesStore.loadGames(event);

	// Return any data that needs to be available in the layout
	return {
		// The store will handle loading state and errors internally
		// No additional data needs to be returned from this loader
	};
}
```

**After:**

```typescript
// src/routes/+layout.ts

import { gamesStore } from '$lib/stores/games';

/**
 * Layout load function that initializes the games store
 * Loads games data from games.json and populates the store
 */
export async function load(event) {
	// Start loading games data, but DO NOT await it.
	// This allows the page to render immediately while the store loads.
	gamesStore.loadGames(event);

	// Return immediately
	return {
		// The store will handle loading state and errors internally
		// No additional data needs to be returned from this loader
	};
}
```

---

#### 1.2. Correct `package.json` Dependencies

**File:** `package.json`

**Problem:** The `sharp` library is a Node.js (server-side) image processor. Listing it as a `dependency` may cause bundlers to incorrectly include it in the client-side bundle, drastically increasing its size.
**Solution:** Move `sharp` from `dependencies` to `devDependencies`, as it's only used for build-time scripts (like `optimize-covers`).

**Before:**

```json
// package.json
	"dependencies": {
		"html2canvas": "^1.4.1",
		"sharp": "^0.34.4",
		"string-similarity": "^4.0.4"
	}
```

**After:**

```json
// package.json
	"devDependencies": {
        // ... (all other devDependencies)
        "sharp": "^0.34.4",
        // ...
	},
	"dependencies": {
		"html2canvas": "^1.4.1",
		"string-similarity": "^4.0.4"
	}
```

---

#### 1.3. Strip Zod Validations from Production

**File:** `src/lib/stores/games.ts`

**Problem:** Zod validation is excellent for development but adds bundle size (the Zod library) and runtime cost (parsing every game) to your production build, where you trust your static data.
**Solution:** Use SvelteKit's `dev` environment variable to only run validations in development mode.

**Before:**

```typescript
// src/lib/stores/games.ts
// ...
import { GameSchema } from '../validation/game';
import { transformGameData } from '../utils/dataTransformer';
// ...
// Transform and validate each game against the schema
const validatedGames: Game[] = gamesArray
	.map((game, index) => {
		try {
			// First transform the data to match schema requirements
			const transformedGame = transformGameData(game);

			// Then validate the transformed data
			return GameSchema.parse(transformedGame);
		} catch (validationError) {
			console.error(`Invalid game data at index ${index} (${game.title}):`, validationError);

			// Log detailed validation info for debugging
			const zodError = validationError as ZodError;
			console.error('Validation issues:', zodError.issues);

			// Skip invalid games but don't fail the entire load
			return null;
		}
	})
	.filter(Boolean) as Game[];
// ...
```

**After:**

```typescript
// src/lib/stores/games.ts

import { writable, get } from 'svelte/store';
import { dev } from '$app/environment'; // <-- IMPORT THIS
import { GameSchema } from '../validation/game';
import { transformGameData } from '../utils/dataTransformer';
import type { Game } from '../types/game';
import type { ZodError } from 'zod';
// ...
// Transform and validate each game against the schema
const validatedGames: Game[] = gamesArray
	.map((game, index) => {
		// First transform the data to match schema requirements
		const transformedGame = transformGameData(game);

		// Only run Zod validation in development
		if (dev) {
			try {
				// Validate the transformed data
				GameSchema.parse(transformedGame);
			} catch (validationError) {
				console.error(`Invalid game data at index ${index} (${game.title}):`, validationError);

				// Log detailed validation info for debugging
				const zodError = validationError as ZodError;
				console.error('Validation issues:', zodError.issues);

				// Skip invalid games but don't fail the entire load
				return null;
			}
		}

		// In production, we trust the data and just return it
		return transformedGame;
	})
	.filter(Boolean) as Game[];
// ...
```

---

#### 1.4. Code-Split the `DetailModal`

**File:** `src/routes/+layout.svelte`

**Problem:** The `DetailModal` is likely imported globally, adding its code (a large component) to the initial JavaScript bundle, even though it's not needed on load.
**Solution:** Modify `+layout.svelte` to only import `DetailModal.svelte` when `modalStore.isOpen` becomes `true`.

**Before (Assumed Structure):**

```svelte
<script lang="ts">
	import NavigationTabs from '$lib/components/NavigationTabs.svelte';
	import DetailModal from '$lib/components/DetailModal.svelte';
	// ...
</script>

<div class="app-container">
	<NavigationTabs />
	<main>
		<slot />
	</main>
</div>
<DetailModal />
```

**After:**

```svelte
<script lang="ts">
	import NavigationTabs from '$lib/components/NavigationTabs.svelte';
	import { modalStore } from '$lib/stores/modal';

	let DetailModalComponent = $state();

	// This effect will run when $modalStore.isOpen changes
	$effect(() => {
		// When the modal is told to open AND we haven't loaded the component yet
		if ($modalStore.isOpen && !DetailModalComponent) {
			// ...then, and only then, load the component's code
			import('$lib/components/DetailModal.svelte').then((m) => {
				DetailModalComponent = m.default;
			});
		}
	});
</script>

<div class="app-container">
	<NavigationTabs />
	<main>
		<slot />
	</main>
</div>

{#if $modalStore.isOpen && DetailModalComponent}
	<svelte:component this={DetailModalComponent} />
{/if}
```

_(Note: You will also need to apply this logic to any other globally-rendered modals, such as an "Edit Modal" or "Add Modal".)_

---

#### 1.5. Code-Split the Main Page by Tab

**File:** `src/routes/+page.svelte`

**Problem:** The `+page.svelte` component contains the rendering logic for all tabs ('All', 'Completed', 'Tier List'). The code for the complex 'Tier List' view is loaded even if the user only wants to see the 'All' tab.
**Solution:** Create separate components for each view and dynamically import them using `<svelte:component>` based on the active tab.

1.  **Create new view components:**
    - `src/lib/views/AllGamesView.svelte` (Move the 'All Games' `{#each}` block here)
    - `src/lib/views/CompletedGamesView.svelte` (Move the 'Completed' `{#each}` block here)
    - `src/lib/views/PlannedGamesView.svelte` (Move the 'Planned' `{#each}` block here)
    - `src/lib/views/TierListView.svelte` (Move the 'Tier List' `{#each}` block and `tierList` logic here)

2.  **Refactor `src/routes/+page.svelte`:**

**Before:**
_(Abridged example of the original file)_

```svelte
<script lang="ts">
	// ... (many imports)
	let allGames = $derived(...);
	let completedGames = $derived(...);
	let plannedGames = $derived(...);
	let tierList = $state(...);
	$effect(() => { /* tierList logic */ });
</script>

<div class="main-content" id="main-content">
	{#if currentActiveTab === 'completed'}
		{#each completedGames as game (game.id)}
			<GameCard {game} size="small" />
		{/each}
	{:else if currentActiveTab === 'planned'}
		{#each plannedGames as game (game.id)}
			<GameCard {game} size="small" />
		{/each}
	{:else if currentActiveTab === 'tierlist'}
		{#each Object.entries(tierList) as [tierName, games] (tierName)}{/each}
	{:else if allGames.length === 0}{:else}
		{#each allGames as game (game.id)}
			<GameCard {game} size="small" />
		{/each}
	{/if}
</div>
```

**After:**

```svelte
<script lang="ts">
	import { appStore } from '$lib/stores/app.js';
	import GameCardSkeleton from '$lib/components/GameCardSkeleton.svelte';

	let currentView = $state();
	let isLoadingView = $state(true);

	// This effect re-runs when the active tab changes
	$effect(() => {
		const activeTab = $appStore.activeTab;
		isLoadingView = true;

		// Dynamically import the component for the active tab
		if (activeTab === 'all') {
			import('$lib/views/AllGamesView.svelte').then((m) => (currentView = m.default));
		} else if (activeTab === 'completed') {
			import('$lib/views/CompletedGamesView.svelte').then((m) => (currentView = m.default));
		} else if (activeTab === 'planned') {
			import('$lib/views/PlannedGamesView.svelte').then((m) => (currentView = m.default));
		} else if (activeTab === 'tierlist') {
			import('$lib/views/TierListView.svelte').then((m) => (currentView = m.default));
		}

		// We can assume the view is loaded once `currentView` is set,
		// but a more robust way would be to set isLoadingView = false in each .then()
		// For simplicity, we'll just show skeleton if currentView isn't set.
	});

	// Note: You must move $derived(allGames), $derived(completedGames), etc.
	// into their respective view components.
</script>

<svelte:head>
	<title>Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if currentView}
		<svelte:component this={currentView} />
	{:else}
		<div
			class="grid max-w-full grid-cols-1 justify-items-center gap-2 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
		>
			<GameCardSkeleton count={12} />
		</div>
	{/if}
</div>

<style>
	.main-content {
		/* ... */
	}
	/* ... */
</style>
```

---

### Priority 2: Reactivity & Rendering

#### 2.1. Refactor Svelte 5 Reactivity Anti-Patterns

**Problem:** You are using `$effect` to `.subscribe()` to stores, just to update a local `$state` variable. This is redundant and inefficient in Svelte 5.
**Solution:** Remove the local `$state` and the `$effect`/`.subscribe()` boilerplate. Read the store's rune value (e.g., `$appStore.activeTab`) directly in your script and template.

**Example 1 File:** `src/lib/components/NavigationTabs.svelte`
**Before:**

```typescript
// src/lib/components/NavigationTabs.svelte
<script lang="ts">
	// ...
	let activeTab = $state<TabId>('all');
	// ...
	$effect(() => {
		const unsubscribe = appStore.activeTab.subscribe((value) => {
			activeTab = value;
		});
		return unsubscribe;
	});
	// ...
</script>

<nav ...>
	<ul ...>
		{#each tabs as tab (tab.id)}
			<li ...>
				<button
					class:active={activeTab === tab.id}
					onclick={() => handleTabClick(tab)}
					aria-selected={activeTab === tab.id}
					tabindex={activeTab === tab.id ? 0 : -1}
					...
				>
					</button>
			</li>
		{/each}
	</ul>
</nav>
```

**After:**

```typescript
// src/lib/components/NavigationTabs.svelte
<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { appStore } from '../stores/app.js';
	import { gamesStore } from '../stores/games.js';
	import { filtersStore } from '../stores/filters.js';
	import type { FilteredGameData } from '../stores/filters.js';

	// ... (type definitions)

	// let activeTab = $state<TabId>('all'); <-- REMOVE THIS

	// $effect(() => { ... }); <-- REMOVE THE ENTIRE $effect BLOCK

	// ... (rest of the script)
</script>

<Header />
<nav class="navigation-tabs" aria-label="Game navigation">
	<ul class="tabs-list" role="tablist">
		{#each tabs as tab (tab.id)}
			<li class="tab-item" role="presentation">
				<button
					type="button"
					class="tab-button"
					class:active={$appStore.activeTab === tab.id}
					onclick={() => handleTabClick(tab)}
					role="tab"
					aria-selected={$appStore.activeTab === tab.id}
					tabindex={$appStore.activeTab === tab.id ? 0 : -1}
					title="Navigate to {tab.label} games"
				>
					</button>
			</li>
		{/each}
	</ul>
</nav>
```

**Example 2 File:** `src/routes/+page.svelte`
**Before:**

```typescript
// src/routes/+page.svelte
// ...
let filteredData = $state<FilteredGameData>({
	filteredGames: [],
	totalCount: 0,
	completedCount: 0,
	plannedCount: 0
});
// ...
// Subscribe to stores
filteredGamesStore.subscribe((data) => {
	filteredData = data;
});
// ...
let allGames = $derived(
	filteredData.filteredGames.toSorted((a, b) => a.title.localeCompare(b.title))
);
// ... (other $derived using filteredData)
```

**After:**

```typescript
// src/routes/+page.svelte
// ...
// Create filtered games store combining games and filters
const filteredGamesStore = filtersStore.createFilteredGamesStore(gamesStore);

// let filteredData = $state(...) <-- REMOVE THIS
// filteredGamesStore.subscribe(...) <-- REMOVE THIS

// ...

// Show filtered games based on active tab (computed in template)
let allGames = $derived(
	$filteredGamesStore.filteredGames.toSorted((a, b) => a.title.localeCompare(b.title))
);
let completedGames = $derived(
	$filteredGamesStore.filteredGames.filter((game: Game) => game.status === 'Completed')
	// ... (rest of logic)
);
let plannedGames = $derived(
	$filteredGamesStore.filteredGames.filter((game: Game) => game.status === 'Planned')
	// ... (rest of logic)
);
// ...
// In the template:
// {#if filteredData.totalCount === 0}
// becomes:
// {#if $filteredGamesStore.totalCount === 0}
```

---

#### 2.2. Pre-compute `titleParts`

**Problem:** `GameCard.svelte` runs a regular expression (`title.match(...)`) inside a `$derived` state for _every single card_ rendered, which is computationally expensive.
**Solution:** Move this regex logic into `src/lib/utils/dataTransformer.ts` so it runs _only once_ when data is first loaded.

1.  **Modify:** `src/lib/utils/dataTransformer.ts`
    _(Note: This file was not provided, so I am assuming its contents. Add the `mainTitle` and `subtitle` properties.)_

    ```typescript
    // src/lib/utils/dataTransformer.ts

    // ... (imports)

    export function transformGameData(game: any): any {
    	// ... (all your other transformation logic)

    	// Add title splitting logic
    	let mainTitle = game.title;
    	let subtitle = null;
    	if (game.title) {
    		const match = game.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    		if (match) {
    			mainTitle = match[1].trim();
    			subtitle = `(${match[2]})`;
    		}
    	}

    	// Return the transformed game object
    	return {
    		...game,
    		// ... (other transformed properties)
    		mainTitle: mainTitle, // Add new property
    		subtitle: subtitle, // Add new property
    		status: game.status || 'Planned'
    		// ... (etc.)
    	};
    }
    ```

2.  **Modify:** `src/lib/types/game.ts`
    - Add `mainTitle: string;` and `subtitle: string | null;` to your `Game` type definition.

3.  **Modify:** `src/lib/components/GameCard.svelte`
    **Before:**

    ```svelte
    <script lang="ts">
    	// ...
    	let { game, size = 'small', showTierBadge = true }: Props = $props();
    	// ...
    	// Extract parenthetical content from title for subtitle display
    	let titleParts = $derived(() => {
    		const match = game.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    		if (match) {
    			return {
    				mainTitle: match[1].trim(),
    				subtitle: `(${match[2]})`
    			};
    		}
    		return {
    			mainTitle: game.title,
    			subtitle: null
    		};
    	});
    	// Dynamic font size calculation for title
    	let titleFontSize = $derived(() => {
    		const title = titleParts().mainTitle;
    		// ... (rest of logic)
    	});
    	// ...
    </script>

    <div class="title-section">
    	<h3 class="game-title" style="font-size: {titleFontSize()}rem;">
    		{titleParts().mainTitle}
    		{#if titleParts().subtitle}
    			<br />
    			<span class="game-subtitle">{titleParts().subtitle}</span>
    		{/if}
    	</h3>
    </div>
    ```

    **After:**

    ```svelte
    <script lang="ts">
    	// ...
    	let { game, size = 'small', showTierBadge = true }: Props = $props();
    	// ...
    	// let titleParts = $derived(...) <-- REMOVE THIS ENTIRE BLOCK

    	// Dynamic font size calculation for title
    	let titleFontSize = $derived(() => {
    		const title = game.mainTitle; // <-- USE PRE-COMPUTED VALUE
    		const baseSize = 1.1; // Base font size in rem
    		const minSize = 0.65; // Minimum font size in rem
    		const maxLength = 25; // Length at which we start reducing font size

    		if (title.length <= maxLength) {
    			return baseSize;
    		}

    		// Calculate reduction factor based on length
    		const reduction = Math.min((title.length - maxLength) * 0.015, baseSize - minSize);
    		return Math.max(baseSize - reduction, minSize);
    	});
    	// ...
    </script>

    <div class="title-section">
    	<h3 class="game-title" style="font-size: {titleFontSize()}rem;">
    		{game.mainTitle}
    		{#if game.subtitle}
    			<br />
    			<span class="game-subtitle">{game.subtitle}</span>
    		{/if}
    	</h3>
    </div>
    ```

    _(Note: You must also apply this `titleParts` change to `src/lib/components/DetailModal.svelte`)_

---

#### 2.3. Replace Inline Styles with CSS Classes

**File:** `src/routes/+page.svelte`

**Problem:** Using inline `style` tags for tier headers is slow to render and bypasses CSS optimizations.
**Solution:** Use dedicated CSS classes for each tier.

1.  **Add to:** `src/app.css` (or any global stylesheet)

    ```css
    /* src/app.css */
    .tier-header.tier-s {
    	background-color: #dc2626 !important;
    }
    .tier-header.tier-a {
    	background-color: #f97316 !important;
    }
    .tier-header.tier-b {
    	background-color: #eab308 !important;
    }
    .tier-header.tier-c {
    	background-color: #22c55e !important;
    }
    .tier-header.tier-d {
    	background-color: #06b6d4 !important;
    }
    .tier-header.tier-e {
    	background-color: #6b7280 !important;
    }

    .tier-header.tier-s,
    .tier-header.tier-a,
    .tier-header.tier-b,
    .tier-header.tier-c,
    .tier-header.tier-d,
    .tier-header.tier-e {
    	color: white !important;
    }

    .tier-header.tier-s .tier-count,
    .tier-header.tier-a .tier-count,
    .tier-header.tier-b .tier-count,
    .tier-header.tier-c .tier-count,
    .tier-header.tier-d .tier-count,
    .tier-header.tier-e .tier-count {
    	color: white !important;
    }
    ```

2.  **Modify:** `src/routes/+page.svelte`
    **Before:**

    ```svelte
    <script lang="ts">
    	// ...
    	// Get tier background color
    	function getTierBackgroundColor(tier: string): string {
    		switch (tier) {
    			case 'S - Masterpiece':
    				return '#dc2626';
    			// ... (rest of cases)
    			default:
    				return '#6b7280';
    		}
    	}

    	// Get tier text color
    	function getTierTextColor(): string {
    		return 'white';
    	}
    </script>

    <div class="tier-section">
    	<h3
    		class="tier-header"
    		style="background-color: {getTierBackgroundColor(tierName)} !important;
    							color: {getTierTextColor()} !important;"
    	>
    		{tierName}
    		<span class="tier-count" style="color: {getTierTextColor()} !important;"
    			>{games.length} {games.length === 1 ? 'game' : 'games'}</span
    		>
    	</h3>
    </div>
    ```

    **After:**

    ```svelte
    <script lang="ts">
    	// ...
    	// function getTierBackgroundColor(tier: string): string { ... } <-- REMOVE
    	// function getTierTextColor(): string { ... } <-- REMOVE

    	// Get tier CSS class
    	function getTierClass(tier: string): string {
    		switch (tier) {
    			case 'S - Masterpiece':
    				return 'tier-s';
    			case 'A - Amazing':
    				return 'tier-a';
    			case 'B - Great':
    				return 'tier-b';
    			case 'C - Good':
    				return 'tier-c';
    			case 'D - Decent':
    				return 'tier-d';
    			case 'E - Bad':
    				return 'tier-e';
    			default:
    				return 'tier-e';
    		}
    	}
    </script>

    <div class="tier-section">
    	<h3 class="tier-header {getTierClass(tierName)}">
    		{tierName}
    		<span class="tier-count">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
    	</h3>
    </div>
    ```

---

#### 2.4. Add `crossfade` Transitions

**File:** `src/routes/+page.svelte`

**Problem:** Switching tabs causes an abrupt replacement of content.
**Solution:** Use Svelte's `crossfade` transition to animate the change.

```svelte
<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	// ... (all other imports)

	// ...
	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut,
		fallback: 'fade'
	});
	// ...
</script>

<div class="main-content" id="main-content">
	{#if currentActiveTab === 'completed'}{:else if currentViewMode === 'gallery'}
		<div class="grid ...">
			{#each completedGames as game (game.id)}
				<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
					<GameCard {game} size="small" />
				</div>
			{/each}
		</div>
	{:else if currentActiveTab === 'planned'}{:else if currentViewMode === 'gallery'}
		<div class="grid ...">
			{#each plannedGames as game (game.id)}
				<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
					<GameCard {game} size="small" />
				</div>
			{/each}
		</div>
	{:else if currentActiveTab === 'tierlist'}{:else if allGames.length === 0}{:else if currentViewMode === 'gallery'}
		<div class="grid ...">
			{#each allGames as game (game.id)}
				<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
					<GameCard {game} size="small" />
				</div>
			{/each}
		</div>
	{/if}
</div>
```

---

### Priority 3: Perceived Performance & UX

#### 3.1. Preload Modal Detail Images

**File:** `src/lib/components/GameCard.svelte`

**Problem:** The `DetailModal` loads a high-resolution image (`-detail.webp`), which only starts downloading _after_ the user clicks, making the modal feel slow.
**Solution:** Start downloading the detail image when the user _hovers_ over the card.

```svelte
<script lang="ts">
	// ... (all other imports and props)

	function preloadDetailImage() {
		if (game.coverImage) {
			const detailImg = new Image();
			// Preload the same image URL the modal will request
			detailImg.src = game.coverImage.replace('.webp', '-detail.webp');
		}
	}
	// ... (rest of script)
</script>

<button
	class="game-card"
	onmouseover={preloadDetailImage}
	onclick={() => modalStore.openViewModal(game)}
	onkeydown={handleKeyDown}
	aria-label="View details for {game.title}"
	style="..."
>
</button>
```

---

#### 3.2. Prevent Fade-in on Cached Images

**File:** `src/lib/components/GameCard.svelte`

**Problem:** Fading in images that are already in the browser cache looks like a flicker.
**Solution:** Synchronously check if the image is in the cache (`.complete` property) and set the initial state correctly.

**Before:**

```svelte
<script lang="ts">
	// ...
	let { game, size = 'small', showTierBadge = true }: Props = $props();
	// Image loading state
	let isImageLoaded = $state(false);
	let hasImageError = $state(false);
	// ...
	// Handle image load success
	function handleImageLoad() {
		isImageLoaded = true;
		hasImageError = false;
	}
	// ...
</script>
```

**After:**

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	// ...
	let { game, size = 'small', showTierBadge = true }: Props = $props();

	// Check if image is already in cache
	let isImageInCache = false;
	if (browser) {
		const img = new Image();
		img.src = game.coverImage;
		isImageInCache = img.complete; // true if cached
	}

	// Image loading state
	let isImageLoaded = $state(isImageInCache); // <-- Set initial state
	let hasImageError = $state(false);
	// ...
	// Handle image load success
	function handleImageLoad() {
		isImageLoaded = true;
		hasImageError = false;
	}
	// ...
</script>
```

---

#### 3.3. Debounce URL State Updates

**Problem:** The URL is updated on _every single state change_ (e.g., filter click, modal navigation), which can cause main-thread jank.
**Solution:** Create a `debounce` utility and wrap the `writeToURL` functions.

1.  **Create file:** `src/lib/utils/debounce.ts`

    ```typescript
    // src/lib/utils/debounce.ts
    export function debounce(func: (...args: any[]) => void, wait: number) {
    	let timeout: number;

    	return (...args: any[]) => {
    		const later = () => {
    			clearTimeout(timeout);
    			func(...args);
    		};

    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait) as any;
    	};
    }
    ```

2.  **Modify:** `src/lib/stores/app.ts`, `src/lib/stores/filters.ts`, `src/lib/stores/sort.ts`
    _(Example using `app.ts`)_

    ```typescript
    // src/lib/stores/app.ts
    import { writable } from 'svelte/store';
    import { browser } from '$app/environment';
    import { debounce } from '$lib/utils/debounce'; // <-- IMPORT

    // ...
    function createAppStore() {
    	// ...
    	const _writeToURL = () => {
    		// ... (all existing writeToURL logic)
    	};

    	return {
    		// ...
    		writeToURL: _writeToURL,
    		debouncedWriteToURL: debounce(_writeToURL, 250) // <-- EXPORT DEBOUNCED
    	};
    }
    // ...
    ```

3.  **Modify:** `src/routes/+page.svelte`
    **Before:**

    ```svelte
    // src/routes/+page.svelte
    $effect(() => {
    	const updateURLs = () => {
    		try {
    			filtersStore.writeToURL();
    			appStore.writeToURL();
    			sortStore.writeToURL();
    		// ...
    ```

    **After:**

    ```svelte
    // src/routes/+page.svelte
    $effect(() => {
    	const updateURLs = () => {
    		try {
    			filtersStore.debouncedWriteToURL(); // <-- Use debounced
    			appStore.debouncedWriteToURL();     // <-- Use debounced
    			sortStore.debouncedWriteToURL();    // <-- Use debounced
    		// ...
    ```

---

#### 3.4. Add Accessibility Focus Trap

**File:** `src/lib/components/DetailModal.svelte`

**Problem:** A user can `Tab` out of the modal and focus elements behind it.
**Solution:** Add logic to the modal's `handleKeydown` function to trap focus.

**Before:**

```typescript
// src/lib/components/DetailModal.svelte
// ...
let modalElement = $state<HTMLDivElement>();
// ...
function handleKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		modalStore.closeModal();
	} else if (event.key === 'ArrowLeft') {
		event.preventDefault();
		navigateToPrevious();
	} else if (event.key === 'ArrowRight') {
		event.preventDefault();
		navigateToNext();
	}
}
// ...
```

**After:**

```typescript
// src/lib/components/DetailModal.svelte
// ...
let modalElement = $state<HTMLDivElement>();
// ...
function handleKeydown(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		modalStore.closeModal();
		return;
	} else if (event.key === 'ArrowLeft') {
		event.preventDefault();
		navigateToPrevious();
		return;
	} else if (event.key === 'ArrowRight') {
		event.preventDefault();
		navigateToNext();
		return;
	}

	// --- ADD FOCUS TRAP LOGIC ---
	if (event.key === 'Tab') {
		if (!modalElement) return;

		// Find all focusable elements within the modal
		const focusableElements = modalElement.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) {
			event.preventDefault();
			return;
		}

		const first = focusableElements[0] as HTMLElement;
		const last = focusableElements[focusableElements.length - 1] as HTMLElement;

		if (event.shiftKey) {
			// Shift + Tab
			if (document.activeElement === first) {
				last.focus();
				event.preventDefault();
			}
		} else {
			// Tab
			if (document.activeElement === last) {
				first.focus();
				event.preventDefault();
			}
		}
	}
}
// ...
```

---

#### 3.5. Lazy-Load `html2canvas`

**File:** _(Wherever you use `html2canvas`)_

**Problem:** `html2canvas` is a large library likely included in `dependencies` and imported at the top of a file, adding to the initial bundle.
**Solution:** Use dynamic `import()` to load it only inside the function that needs it.

**Before (Assumed):**

```typescript
import html2canvas from 'html2canvas';

async function handleShareAsImage() {
	const canvas = await html2canvas(document.body);
	// ...
}
```

**After:**

```typescript
// No import at the top of the file

async function handleShareAsImage() {
	// Import the library only when the function is called
	const html2canvas = (await import('html2canvas')).default;

	const canvas = await html2canvas(document.body);
	// ...
}
```

---

### Priority 5: CSS Cleanup

#### 5.1. Move Duplicate Keyframes to Global CSS

**Problem:** The `strongPulse` and `shimmer` animations are defined in both `GameCard.svelte` and `DetailModal.svelte`, creating duplicate CSS.
**Solution:** Move these `@keyframes` definitions to your global `src/app.css` file once and remove them from the individual components.

1.  **Add to:** `src/app.css`

    ```css
    /* src/app.css */

    /* ... (rest of your global styles) ... */

    @keyframes strongPulse {
    	0% {
    		opacity: 1;
    		transform: scale(1);
    	}
    	25% {
    		opacity: 0.7;
    		transform: scale(1.01);
    	}
    	50% {
    		opacity: 0.4;
    		transform: scale(1.02);
    	}
    	75% {
    		opacity: 0.7;
    		transform: scale(1.01);
    	}
    	100% {
    		opacity: 1;
    		transform: scale(1);
    	}
    }

    @keyframes shimmer {
    	0% {
    		left: -100%;
    	}
    	100% {
    		left: 100%;
    	}
    }
    ```

2.  **Remove from:**
    - `src/lib/components/GameCard.svelte` (Remove the `@keyframes strongPulse` and `@keyframes shimmer` blocks from the `<style>` tag).
    - `src/lib/components/DetailModal.svelte` (Remove the `@keyframes strongPulse` and `@keyframes shimmer` blocks from the `<style>` tag).
