<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import type { Game } from '$lib/types/game.js';

	let { children } = $props();

	let searchQuery = $state('');
	let initialized = $state(false);
	let urlUpdateTimeout: ReturnType<typeof setTimeout> | undefined;
	let allGames = $state<Game[]>([]);

	$effect(() => {
		const unsubscribe = filtersStore.searchQuery.subscribe((value) => {
			searchQuery = value;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = gamesStore.subscribe((games) => {
			allGames = games;
		});
		return unsubscribe;
	});

	function filterGames(games: Game[], query: string): Game[] {
		if (!query.trim()) return games;
		const lowerQuery = query.toLowerCase();
		return games.filter((game) => game.title.toLowerCase().includes(lowerQuery));
	}

	let filteredGames = $derived(filterGames(allGames, searchQuery));

	let filteredCounts = $derived({
		total: filteredGames.length,
		completed: filteredGames.filter((g) => g.status === 'Completed').length,
		planned: filteredGames.filter((g) => g.status === 'Planned').length
	});

	// Initialize search from URL parameters on page load
	$effect(() => {
		if (!initialized) {
			const searchParam = $page.url.searchParams.get('search');
			if (searchParam) {
				filtersStore.searchQuery.set(searchParam);
			}
			initialized = true;
		}
	});

	// Update URL when search query changes (debounced)
	$effect(() => {
		if (initialized) {
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
			urlUpdateTimeout = setTimeout(() => {
				const currentUrl = new URL($page.url);
				if (searchQuery) {
					currentUrl.searchParams.set('search', searchQuery);
				} else {
					currentUrl.searchParams.delete('search');
				}
				goto(currentUrl.toString(), { replaceState: true });
			}, 300);
		}
	});

	// Sync URL changes (back/forward navigation) to filters store
	$effect(() => {
		const searchParam = $page.url.searchParams.get('search') || '';
		if (initialized && searchParam !== searchQuery) {
			filtersStore.searchQuery.set(searchParam);
		}
	});

	async function navigateTo(path: string) {
		await goto(path, { replaceState: true });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gaming Tracker</title>
</svelte:head>

<div class="bg-background text-foreground min-h-screen">
	<!-- Header (Fixed) -->
	<header class="bg-background border-border fixed top-0 right-0 left-0 z-50 h-15 border-b">
		<div class="container mx-auto flex h-full items-center justify-between px-6">
			<div class="flex items-center gap-4">
				<h1 class="flex items-center gap-2 text-xl font-bold">🎮 Gaming Tracker</h1>
				<button
					class="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md px-3 py-1.5 text-sm transition-colors"
				>
					+ Add Game
				</button>
			</div>
			<div class="flex items-center gap-4">
				<span class="text-muted-foreground text-sm">{filteredCounts.total} games tracked</span>
				<button class="hover:bg-accent rounded-md p-2 transition-colors" title="Toggle theme">
					<span class="text-lg">☀️</span>
				</button>
			</div>
		</div>
	</header>

	<!-- Navigation Tabs (Fixed) -->
	<nav class="bg-background border-border fixed top-15 right-0 left-0 z-40 h-12.5 border-b">
		<div class="container mx-auto h-full px-6">
			<div class="flex h-full items-center space-x-8">
				<button
					onclick={() => navigateTo('/')}
					class="text-foreground border-accent hover:border-accent/50 border-b-2 pb-3 text-sm font-medium transition-all"
				>
					Games ({filteredCounts.total})
				</button>
				<button
					onclick={() => navigateTo('/completed')}
					class="text-muted-foreground hover:text-foreground hover:border-accent/50 border-b-2 border-transparent pb-3 text-sm font-medium transition-all"
				>
					Finished ({filteredCounts.completed})
				</button>
				<button
					onclick={() => navigateTo('/planned')}
					class="text-muted-foreground hover:text-foreground hover:border-accent/50 border-b-2 border-transparent pb-3 text-sm font-medium transition-all"
				>
					Planned ({filteredCounts.planned})
				</button>
				<button
					onclick={() => navigateTo('/tierlist')}
					class="text-muted-foreground hover:text-foreground hover:border-accent/50 border-b-2 border-transparent pb-3 text-sm font-medium transition-all"
				>
					Tier List
				</button>
			</div>
		</div>
	</nav>

	<!-- Search & Filter Section (Sticky) -->
	<section class="bg-background border-border sticky top-[calc(60px+50px)] z-30 border-b">
		<div class="container mx-auto space-y-4 px-6 py-4">
			<!-- Search Bar -->
			<SearchBar />

			<!-- Filter Controls -->
			<div class="flex flex-wrap items-center gap-3">
				<button
					class="bg-surface border-border hover:bg-accent hover:text-accent-foreground rounded-md border px-3 py-1.5 text-xs transition-colors"
				>
					All Platforms ▼
				</button>
				<button
					class="bg-surface border-border hover:bg-accent hover:text-accent-foreground rounded-md border px-3 py-1.5 text-xs transition-colors"
				>
					All Genres ▼
				</button>
				<button
					class="bg-surface border-border hover:bg-accent hover:text-accent-foreground rounded-md border px-3 py-1.5 text-xs transition-colors"
				>
					All Tiers ▼
				</button>
				<button
					class="bg-surface border-border hover:bg-accent hover:text-accent-foreground rounded-md border px-3 py-1.5 text-xs transition-colors"
				>
					📊 Ratings
				</button>
				<button
					class="bg-surface border-border hover:bg-accent hover:text-accent-foreground rounded-md border px-3 py-1.5 text-xs transition-colors"
				>
					↻ Reset
				</button>

				<div class="ml-auto flex items-center gap-2">
					<button class="bg-accent text-accent-foreground rounded-md p-2" title="Gallery view">
						⊞
					</button>
					<button
						class="bg-surface border-border hover:bg-accent hover:text-accent-foreground rounded-md border p-2 transition-colors"
						title="Table view"
					>
						☰
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Content Area (Scrollable) -->
	<main class="px-6 pt-[calc(60px+50px+100px)] pb-6">
		<div class="container mx-auto">
			{@render children?.()}
		</div>
	</main>
</div>

<style>
	/* Height calculations for fixed/sticky positioning */
	:global(.h-15) {
		height: 60px;
	}
	:global(.h-12\.5) {
		height: 50px;
	}

	/* Ensure proper spacing for content area */
	:global(.pt-\[calc\(60px\+50px\+100px\)\]) {
		padding-top: calc(60px + 50px + 100px);
	}
</style>
