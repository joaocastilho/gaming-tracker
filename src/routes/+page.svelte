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

	// Simple state management - no complex derived stores
	let allGames = $state<Game[]>([]);
	let currentActiveTab = $state<'all' | 'completed' | 'planned' | 'tierlist'>('all');
	let TierListViewComponent = $state<Component<TierListViewProps> | null>(null);
	let hasInitializedGames = $state(false);

	const { loading } = gamesStore;

	// Subscribe to games store
	gamesStore.subscribe((games) => {
		if (games && games.length > 0) {
			allGames = games;
		}
	});

	// Subscribe to active tab
	appStore.activeTab.subscribe((activeTab) => {
		currentActiveTab = activeTab;
		if (activeTab === 'tierlist') {
			loadTierListView();
		}
	});

	// Initialize URL reading
	$effect(() => {
		filtersStore.readFromURL(page.url.searchParams);
		appStore.readFromURL(page.url.searchParams);
		sortStore.readFromURL(page.url.searchParams);
	});

	// Handle URL writing
	$effect(() => {
		const updateURLs = () => {
			try {
				filtersStore.writeToURL();
				appStore.writeToURL();
				sortStore.writeToURL();
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

	// Initialize games from server data
	$effect(() => {
		if (data.games && !hasInitializedGames) {
			gamesStore.initializeGames(data.games);
			hasInitializedGames = true;
		}
	});

	// Simple derived values for each tab
	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());

	// Main display logic - simple and direct
	let displayedGames = $derived.by(() => {
		// Wait for games to load
		if (allGames.length === 0) {
			return [];
		}

		// Apply filters if any exist
		if (hasActiveFilters) {
			const filteredGamesStore = filtersStore.createFilteredGamesStore();
			let filteredData: FilteredGameData = {
				filteredGames: [],
				totalCount: 0,
				completedCount: 0,
				plannedCount: 0
			};

			// Subscribe to filtered data
			const unsubscribe = filteredGamesStore.subscribe((data) => {
				filteredData = data;
			});
			
			// For filtered results, apply tab-specific filtering
			const baseGames = filteredData.filteredGames.length > 0 ? filteredData.filteredGames : allGames;
			
			switch (currentActiveTab) {
				case 'completed':
					return baseGames.filter(game => game.status === 'Completed')
						.toSorted((a, b) => {
							if (!a.finishedDate && !b.finishedDate) return 0;
							if (!a.finishedDate) return 1;
							if (!b.finishedDate) return -1;
							return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
						});
				case 'planned':
					return baseGames.filter(game => game.status === 'Planned')
						.toSorted((a, b) => a.title.localeCompare(b.title));
				case 'tierlist':
					return baseGames.filter(game => game.tier);
				default:
					return baseGames.toSorted((a, b) => a.title.localeCompare(b.title));
			}
		}

		// No filters - simple tab-based logic
		switch (currentActiveTab) {
			case 'completed':
				return allGames.filter(game => game.status === 'Completed')
					.toSorted((a, b) => {
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;
						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
			case 'planned':
				return allGames.filter(game => game.status === 'Planned')
					.toSorted((a, b) => a.title.localeCompare(b.title));
			case 'tierlist':
				return allGames.filter(game => game.tier);
			default:
				return allGames.toSorted((a, b) => a.title.localeCompare(b.title));
		}
	});

	// Tier list view loading
	async function loadTierListView() {
		if (TierListViewComponent) return;

		try {
			const module = await import('$lib/views/TierListView.svelte');
			TierListViewComponent = module.default;
		} catch (err) {
			console.error('Failed to load tier list view:', err);
		}
	}

	// Preload tier list view
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
</script>

<svelte:head>
	<title>Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if currentActiveTab === 'tierlist' && TierListViewComponent}
		<TierListViewComponent filteredGames={displayedGames} />
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
				}}
			>
				↻ Reset filters
			</button>
		</div>
	{:else if currentActiveTab !== 'tierlist'}
		<GamesView filteredGames={displayedGames} />
	{:else}
		<div class="loading">Loading tier list...</div>
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
