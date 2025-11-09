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
	let isLoadingView = $state(false);

	const debouncedFiltersWriteToURL = debounce(() => filtersStore.writeToURL(), 100);
	const debouncedAppWriteToURL = debounce(() => appStore.writeToURL(), 100);
	const debouncedSortWriteToURL = debounce(() => sortStore.writeToURL(), 100);

	filteredGamesStore.subscribe((data) => {
		filteredData = data;
	});

	const { loading } = gamesStore;

	gamesStore.subscribe((games) => {
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
				// If router still not ready, try again later
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

	let hasActiveFilters = filtersStore.isAnyFilterApplied();
	let tierListGames = $derived(allGamesFromStore.filter((game) => game.tier));

	async function loadTierListView() {
		if (TierListViewComponent) return;

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
		if (data.games) {
			gamesStore.initializeGames(data.games);
		}
	});
</script>

<svelte:head>
	<title>Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if currentActiveTab === 'tierlist' && TierListViewComponent}
		<TierListViewComponent filteredGames={tierListGames} />
	{:else if currentActiveTab !== 'tierlist' && hasActiveFilters && filteredData.filteredGames.length === 0}
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
	{:else if currentActiveTab !== 'tierlist' && filteredData.filteredGames.length > 0}
		<GamesView filteredGames={filteredData.filteredGames} />
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
