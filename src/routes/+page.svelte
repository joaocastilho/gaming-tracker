<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { sortStore } from '$lib/stores/sort.js';
	import { debounce } from '$lib/utils/debounce.js';
	import { memoizeGameFilter } from '$lib/utils/memoize.js';
	import GameCardSkeleton from '$lib/components/GameCardSkeleton.svelte';
	import GamesView from '$lib/views/GamesView.svelte';

	import type { FilteredGameData } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import type { Component } from 'svelte';

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

	// View components - only tier list needs dynamic loading
	let TierListViewComponent = $state<Component<TierListViewProps> | null>(null);
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
		if (activeTab === 'tierlist') {
			loadTierListView();
		}
	});

	gamesStore.loading.subscribe((loading) => {
		isLoadingGames = loading;
	});

	// Handle browser back/forward navigation
	$effect(() => {
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

	// Memoized function to get filtered games for a specific tab
	// This prevents unnecessary recalculations when switching tabs with the same filtered games
	const getFilteredGamesForTab = memoizeGameFilter(
		(games: Game[], tab: 'all' | 'completed' | 'planned' | 'tierlist'): Game[] => {
			switch (tab) {
				case 'completed':
					return games
						.filter((game) => game.status === 'Completed')
						.toSorted((a, b) => {
							if (!a.finishedDate && !b.finishedDate) return 0;
							if (!a.finishedDate) return 1;
							if (!b.finishedDate) return -1;
							return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
						});
				case 'planned':
					return games
						.filter((game) => game.status === 'Planned')
						.toSorted((a, b) => a.title.localeCompare(b.title));
				case 'all':
				default:
					return games.toSorted((a, b) => a.title.localeCompare(b.title));
			}
		},
		{ maxSize: 5, ttl: 5000 } // Cache up to 5 results for 5 seconds
	);

	// Memoized filtered games for the current tab
	// This will only recalculate if the filtered games array or tab changes
	let memoizedFilteredGames = $derived(
		currentActiveTab !== 'tierlist'
			? getFilteredGamesForTab(filteredData.filteredGames, currentActiveTab)
			: []
	);

	// Get first 6 games for preloading critical images
	let criticalGames = $derived(memoizedFilteredGames.slice(0, 6));

	// For tier list, get all games that have tiers assigned (ignoring status filters)
	let tierListGames = $derived(allGamesFromStore.filter((game) => game.tier));

	// Load tier list view component only when needed
	async function loadTierListView() {
		if (TierListViewComponent) return; // Already loaded

		isLoadingView = true;
		try {
			const module = await import('$lib/views/TierListView.svelte');
			TierListViewComponent = module.default;
		} catch (err) {
			console.error('Failed to load tier list view:', err);
		} finally {
			isLoadingView = false;
		}
	}

	// Preload tier list view when hovering over tier list tab (called from Header component)
	function preloadTierListView() {
		if (!TierListViewComponent) {
			loadTierListView();
		}
	}

	// Expose preload function for Header component to use
	// This will be called via appStore or directly if needed
	if (typeof window !== 'undefined') {
		type WindowWithPreload = Window & {
			__preloadTierListView?: () => void;
		};
		(window as WindowWithPreload).__preloadTierListView = preloadTierListView;
	}

	// Load games data when the component mounts (fallback for client-side)
	$effect(() => {
		// Only load if games store is empty (server-side loading might have failed)
		gamesStore.subscribe((games) => {
			if (games.length === 0) {
				gamesStore.loadGames();
			}
		});
	});

	// Derived loading state - no artificial delay
	let imagesLoading = $derived(isLoadingGames || isLoadingView);
</script>

<svelte:head>
	<title>Gaming Tracker</title>
	{#each criticalGames as game (game.id)}
		<link rel="preload" as="image" href={game.coverImage} fetchpriority="high" />
	{/each}
</svelte:head>

<div class="main-content" id="main-content">
	{#if isLoadingView || isLoadingGames || imagesLoading}
		<!-- Loading Skeleton -->
		<div
			class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
		>
			<GameCardSkeleton count={12} />
		</div>
	{:else if currentActiveTab === 'tierlist' && TierListViewComponent}
		<TierListViewComponent filteredGames={tierListGames} />
	{:else if currentActiveTab !== 'tierlist'}
		<GamesView filteredGames={memoizedFilteredGames} activeTab={currentActiveTab} />
	{/if}
</div>
