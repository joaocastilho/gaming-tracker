<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { sortStore } from '$lib/stores/sort.js';
	import { debounce } from '$lib/utils/debounce.js';
	import GamesView from '$lib/views/GamesView.svelte';

	import type { FilteredGameData } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface TierListViewProps {
		filteredGames: Game[];
	}

	const filteredGamesStore = filtersStore.createFilteredGamesStore();

	let filteredData = $state<FilteredGameData>({
		filteredGames: [],
		totalCount: 0,
		completedCount: 0,
		plannedCount: 0
	});

	let allGamesFromStore = $state<Game[]>([]);
	let currentActiveTab = $state<'all' | 'completed' | 'planned' | 'tierlist'>('all');
	let TierListViewComponent = $state<Component<TierListViewProps> | null>(null);
	let hasInitializedGames = $state(false);

	const debouncedFiltersWriteToURL = debounce(() => filtersStore.writeToURL(), 100);
	const debouncedAppWriteToURL = debounce(() => appStore.writeToURL(), 100);
	const debouncedSortWriteToURL = debounce(() => sortStore.writeToURL(), 100);

	filteredGamesStore.subscribe((data) => {
		filteredData = data;
	});

	gamesStore.subscribe((games) => {
		// Skip the initial empty array subscription trigger
		if (!games || games.length === 0) {
			return;
		}

		console.log('🎮 Main page: GamesStore subscription triggered, games length:', games?.length);
		console.log('🎮 Main page: Setting allGamesFromStore to', games.length, 'games');
		allGamesFromStore = games;
	});

	appStore.activeTab.subscribe((activeTab) => {
		currentActiveTab = activeTab;
		if (activeTab === 'tierlist') {
			loadTierListView();
		}
	});

	$effect(() => {
		filtersStore.readFromURL(page.url.searchParams);
		appStore.readFromURL(page.url.searchParams);
		sortStore.readFromURL(page.url.searchParams);
	});

	$effect(() => {
		const updateURLs = () => {
			try {
				debouncedFiltersWriteToURL();
				debouncedAppWriteToURL();
				debouncedSortWriteToURL();
			} catch (error) {
				if (error instanceof Error && error.message.includes('router is initialized')) {
					setTimeout(updateURLs, 10);
				}
			}
		};

		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(updateURLs);
		} else {
			setTimeout(updateURLs, 10);
		}
	});

	let tierListGames = $derived(allGamesFromStore.filter((game) => game.tier));
	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());

	// Filter games based on active tab (similar to individual tab pages)
	let displayedGames = $derived.by(() => {
		console.log(
			`🎮 Main page: currentActiveTab = ${currentActiveTab}, hasActiveFilters = ${hasActiveFilters}`
		);
		console.log(`🎮 Main page: allGamesFromStore.length = ${allGamesFromStore.length}`);
		console.log(
			`🎮 Main page: filteredData.filteredGames.length = ${filteredData.filteredGames.length}`
		);

		// Wait for games to be loaded before processing
		if (allGamesFromStore.length === 0) {
			console.log(`🎮 Main page: Waiting for games to load (${allGamesFromStore.length} games)`);
			return [];
		}

		// For "all" tab with no custom filters, show all games directly, sorted alphabetically by title
		if (currentActiveTab === 'all' && !hasActiveFilters) {
			console.log(
				`🎮 Main page: Showing all games directly (${allGamesFromStore.length} games), sorted alphabetically by title`
			);
			return allGamesFromStore.toSorted((a, b) => a.title.localeCompare(b.title));
		}

		// When filters are applied, use the worker's filtered results
		if (hasActiveFilters && filteredData.filteredGames.length > 0) {
			console.log(
				`🎮 Main page: Using worker filtered results (${filteredData.filteredGames.length} games)`
			);
			// For tab-specific filtering when filters are active, we need to further filter
			// the worker results by the current tab's status requirement
			switch (currentActiveTab) {
				case 'completed': {
					const completedGames = filteredData.filteredGames.filter(
						(game) => game.status === 'Completed'
					);
					console.log(
						`🎮 Main page: Completed tab - ${completedGames.length} games after filtering`
					);
					return completedGames;
				}
				case 'planned': {
					const plannedGames = filteredData.filteredGames.filter(
						(game) => game.status === 'Planned'
					);
					console.log(`🎮 Main page: Planned tab - ${plannedGames.length} games after filtering`);
					return plannedGames;
				}
				case 'all':
				default: {
					console.log(
						`🎮 Main page: All tab with filters - ${filteredData.filteredGames.length} games`
					);
					return filteredData.filteredGames;
				}
			}
		}

		// When no filters are applied, apply tab-specific filtering
		switch (currentActiveTab) {
			case 'completed': {
				const completedOnly = allGamesFromStore
					.filter((game) => game.status === 'Completed')
					.toSorted((a, b) => {
						// Sort by finishedDate descending (most recent first), missing dates last
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;
						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
				console.log(
					`🎮 Main page: Completed tab - ${completedOnly.length} completed games, sorted by finished date desc`
				);
				return completedOnly;
			}
			case 'planned': {
				const plannedOnly = allGamesFromStore
					.filter((game) => game.status === 'Planned')
					.toSorted((a, b) => a.title.localeCompare(b.title));
				console.log(
					`🎮 Main page: Planned tab - ${plannedOnly.length} planned games, sorted alphabetically by title`
				);
				return plannedOnly;
			}
			case 'all':
			default: {
				console.log(`🎮 Main page: All tab - showing ${allGamesFromStore.length} games`);
				return allGamesFromStore;
			}
		}
	});

	async function loadTierListView() {
		if (TierListViewComponent) return;

		try {
			const module = await import('$lib/views/TierListView.svelte');
			TierListViewComponent = module.default;
		} catch (err) {
			console.error('Failed to load tier list view:', err);
		}
	}

	function preloadTierListView() {
		if (!TierListViewComponent) {
			loadTierListView();
		}
	}

	if (typeof window !== 'undefined') {
		type WindowWithPreload = Window & {
			__preloadTierListView?: () => void;
		};
		(window as WindowWithPreload).__preloadTierListView = preloadTierListView;
	}

	$effect(() => {
		console.log('🎮 Main page: Received data.games:', data?.games?.length, 'games');
		if (data.games && !hasInitializedGames) {
			console.log('🎮 Main page: Initializing games store with data...');
			hasInitializedGames = true;
			gamesStore.initializeGames(data.games);
		} else if (data.games && hasInitializedGames) {
			console.log('🎮 Main page: Skipping duplicate initialization - games already initialized');
		} else {
			console.log('🎮 Main page: No games data received');
		}
	});
</script>

<svelte:head>
	<title>Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if currentActiveTab === 'tierlist' && TierListViewComponent}
		<TierListViewComponent filteredGames={tierListGames} />
	{:else if currentActiveTab !== 'tierlist' && hasActiveFilters && displayedGames.length === 0}
		<div class="no-results flex flex-col items-center justify-center gap-3 py-10 text-center">
			<h2 class="font-semibold">No games match your current filters</h2>
			<p class="text-gray-600 dark:text-gray-400">
				Try adjusting or clearing your filters to see more games.
			</p>
			<button
				class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors"
				type="button"
				onclick={() => {
					filtersStore.resetAllFilters();
					filtersStore.setSearchTerm('');
					appStore.writeToURLWithFilters(filtersStore);
				}}
			>
				↻ Reset filters
			</button>
		</div>
	{:else if currentActiveTab !== 'tierlist' && allGamesFromStore.length > 0}
		<GamesView filteredGames={displayedGames} />
	{:else if currentActiveTab !== 'tierlist'}
		<div class="loading">Loading games...</div>
	{/if}
</div>

<style>
	.no-results {
		font-size: 1.5rem;
		color: var(--color-text-primary);
	}

	.reset-button {
		color: var(--color-text-primary);
		font-size: 1rem;
		cursor: pointer;
	}
</style>
