<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { sortStore } from '$lib/stores/sort.js';
	import { debounce } from '$lib/utils/debounce.js';
	import GameCardSkeleton from '$lib/components/GameCardSkeleton.svelte';

	import type { FilteredGameData } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import type { Component } from 'svelte';

	interface StandardViewProps {
		filteredGames: Game[];
	}

	interface TierListViewProps {
		filteredGames: Game[];
	}

	// Create filtered games store combining games and filters
	const filteredGamesStore = filtersStore.createFilteredGamesStore();

	// Get filtered games and counts
	let filteredData = $state<FilteredGameData>({
		filteredGames: [],
		totalCount: 0,
		completedCount: 0,
		plannedCount: 0
	});

	// Get all games directly from gamesStore for tier list
	let allGamesFromStore = $state<Game[]>([]);

	// Get current active tab
	let currentActiveTab = $state<'all' | 'completed' | 'planned' | 'tierlist'>('all');

	// Get loading state from games store
	let isLoadingGames = $state(false);

	// View components
	let ActiveView = $state<null | Component<StandardViewProps> | Component<TierListViewProps>>(null);
	let isLoadingView = $state(false);

	// Debounced URL update functions to reduce main-thread jank
	const debouncedFiltersWriteToURL = debounce(() => filtersStore.writeToURL(), 100);
	const debouncedAppWriteToURL = debounce(() => appStore.writeToURL(), 100);
	const debouncedSortWriteToURL = debounce(() => sortStore.writeToURL(), 100);

	// Subscribe to stores
	filteredGamesStore.subscribe((data) => {
		filteredData = data;
	});

	gamesStore.subscribe((games) => {
		allGamesFromStore = games;
	});

	appStore.activeTab.subscribe((activeTab) => {
		currentActiveTab = activeTab;
		loadViewComponent(activeTab);
	});

	gamesStore.loading.subscribe((loading) => {
		isLoadingGames = loading;
	});

	// Handle browser back/forward navigation
	$effect(() => {
		// Read search query from URL when browser navigation occurs
		filtersStore.readFromURL(page.url.searchParams);
		appStore.readFromURL(page.url.searchParams);
		sortStore.readFromURL(page.url.searchParams);
	});

	// Update URL with current filter state on initial load (defer to ensure router is ready)
	$effect(() => {
		const updateURLs = () => {
			try {
				debouncedFiltersWriteToURL();
				debouncedAppWriteToURL();
				debouncedSortWriteToURL();
			} catch (error) {
				// If router still not ready, try again later
				if (error instanceof Error && error.message.includes('router is initialized')) {
					setTimeout(updateURLs, 10);
				}
			}
		};

		// Use requestAnimationFrame for better timing, fallback to setTimeout
		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(updateURLs);
		} else {
			setTimeout(updateURLs, 10);
		}
	});

	// Show filtered games based on active tab (computed in template)
	let allGames = $derived(
		filteredData.filteredGames.toSorted((a, b) => a.title.localeCompare(b.title))
	);
	let completedGames = $derived(
		filteredData.filteredGames
			.filter((game: Game) => game.status === 'Completed')
			.toSorted((a, b) => {
				// Sort by finished date descending (most recent first)
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1; // null dates go to end
				if (!b.finishedDate) return -1; // null dates go to end
				return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
			})
	);
	let plannedGames = $derived(
		filteredData.filteredGames
			.filter((game: Game) => game.status === 'Planned')
			.toSorted((a, b) => a.title.localeCompare(b.title))
	);

	// For tier list, get all games that have tiers assigned (ignoring status filters)
	let tierListGames = $derived(
		allGamesFromStore.filter((game) => game.tier)
	);

	// Load view component dynamically based on active tab
	async function loadViewComponent(tab: string) {
		isLoadingView = true;
		try {
			switch (tab) {
				case 'all':
					ActiveView = (await import('$lib/views/AllGamesView.svelte')).default;
					break;
				case 'completed':
					ActiveView = (await import('$lib/views/CompletedGamesView.svelte')).default;
					break;
				case 'planned':
					ActiveView = (await import('$lib/views/PlannedGamesView.svelte')).default;
					break;
				case 'tierlist':
					ActiveView = (await import('$lib/views/TierListView.svelte')).default;
					break;
				default:
					ActiveView = null;
			}
		} catch (err) {
			console.error('Failed to load view component:', err);
		} finally {
			isLoadingView = false;
		}
	}

	// Load initial view (wrapped in effect to capture reactive updates)
	$effect(() => {
		loadViewComponent(currentActiveTab);
	});

	// Load games data when the component mounts (fallback for client-side)
	$effect(() => {
		// Only load if games store is empty (server-side loading might have failed)
		gamesStore.subscribe((games) => {
			if (games.length === 0) {
				gamesStore.loadGames();
			}
		});
	});

	let imagesLoading = $derived(isLoadingGames || isLoadingView);
</script>

<svelte:head>
	<title>Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if isLoadingView || isLoadingGames || imagesLoading}
		<!-- Loading Skeleton -->
		<div
			class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
		>
			<GameCardSkeleton count={12} />
		</div>
	{:else if ActiveView}
		<ActiveView
			filteredGames={currentActiveTab === 'completed'
				? completedGames
				: currentActiveTab === 'planned'
					? plannedGames
					: currentActiveTab === 'tierlist'
						? tierListGames
						: allGames}
		/>
	{:else}
		<div class="empty-state">
			<h2>View not found</h2>
			<p>Please select a valid view from the navigation tabs</p>
		</div>
	{/if}
</div>

<style>
	.main-content {
		min-height: calc(100vh - 140px); /* Account for header and navigation */
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		text-align: center;
		color: #8b92a8;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		color: inherit;
	}

	/* Light mode */
	:global(.light) .empty-state {
		color: #6b7280;
	}
</style>
