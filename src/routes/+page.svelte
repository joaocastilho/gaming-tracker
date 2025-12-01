<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';
	import { filteredGames } from '$lib/stores/filteredGamesStore.js';
	import GamesView from '$lib/views/GamesView.svelte';

	import type { Game } from '$lib/types/game.js';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';
	import { RotateCcw } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	interface TierListViewProps {
		filteredGames: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	}

	// Simple state management
	let allGames = $state<Game[]>([]);
	let currentActiveTab = $state<'all' | 'completed' | 'planned' | 'tierlist'>('all');
	let TierListViewComponent = $state<Component<TierListViewProps> | null>(null);
	let hasInitializedGames = $state(false);
	let isLoadingGames = $state(true);
	let filteredGamesArray = $state<Game[]>([]);

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

	// Force active tab to all
	$effect(() => {
		appStore.setActiveTab('all', true);
	});

	// Consolidated effect for all URL operations to reduce re-renders
	$effect(() => {
		if (typeof window !== 'undefined') {
			const searchParams = new URLSearchParams(window.location.search);

			// Read from URL
			filtersStore.readFromURL(searchParams);
			appStore.readFromURL(searchParams);

			// Write to URL in next frame to avoid conflicts
			requestAnimationFrame(() => {
				try {
					filtersStore.writeToURL();
					appStore.writeToURL();
				} catch (error) {
					if (error instanceof Error && error.message.includes('router is initialized')) {
						setTimeout(() => {
							filtersStore.writeToURL();
							appStore.writeToURL();
						}, 10);
					}
				}
			});
		}
	});

	// Initialize games from server data
	// Games initialization is now handled in +layout.svelte to prevent double initialization
	$effect(() => {
		if (!hasInitializedGames && $gamesStore.length > 0) {
			hasInitializedGames = true;
			isLoadingGames = false;
		} else if (!data.games && !hasInitializedGames) {
			isLoadingGames = false;
		}
	});

	// Handle URL reading for modal
	$effect(() => {
		if (allGames.length > 0) {
			modalStore.readFromURL(page.url.searchParams, allGames);
		}
	});

	// Handle pending modal from URL
	$effect(() => {
		if (allGames.length > 0) {
			modalStore.openPendingGameFromURL(allGames);
		}
	});

	// Function to open modal with reactive filter context
	function openModalWithFilterContext(game: Game) {
		modalStore.openViewModal(game, filteredGamesArray);
	}

	// Subscribe to filtered games store
	$effect(() => {
		const unsubscribe = filteredGames.subscribe((value) => {
			filteredGamesArray = value;
		});
		return unsubscribe;
	});

	// Subscribe to filters store (no longer enforcing default sort here)
	$effect(() => {
		const unsubscribe = filtersStore.subscribe(($filters) => {
			// Logic moved to filteredGamesStore
		});
		return unsubscribe;
	});

	// Simple derived values for each tab
	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());

	// Use the memoized filtered games store with reactive derived
	let displayedGames = $derived(filteredGamesArray);

	// Tier list view loading
	async function loadTierListView() {
		if (TierListViewComponent) return;

		try {
			const module = await import('$lib/views/TierListView.svelte');
			TierListViewComponent = module.default;
		} catch {
			// Silently ignore tier list component loading errors
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
		<TierListViewComponent
			filteredGames={displayedGames}
			onOpenModal={openModalWithFilterContext}
		/>
	{:else if currentActiveTab !== 'tierlist' && hasActiveFilters && displayedGames.length === 0}
		<div class="no-results flex flex-col items-center justify-center gap-3 py-10 text-center">
			<h2 class="font-semibold">No games match your current filters</h2>
			<p class="text-gray-600 dark:text-gray-400">
				Try adjusting or clearing your filters to see more games.
			</p>
			<button
				class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors"
				type="button"
				onclick={() => {
					filtersStore.resetAllFilters();
					filtersStore.setSearchTerm('');
					filtersStore.setSort({ key: 'alphabetical', direction: 'asc' });
				}}
			>
				<RotateCcw size={18} />
				Reset
			</button>
		</div>
	{:else if currentActiveTab !== 'tierlist' && isLoadingGames}
		<div class="loading">Loading games...</div>
	{:else if currentActiveTab !== 'tierlist'}
		<GamesView
			filteredGames={displayedGames}
			displayedGames={allGames}
			onOpenModal={openModalWithFilterContext}
		/>
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

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		text-align: center;
		font-weight: 500;
		color: var(--color-text-primary);
		font-size: clamp(1.1rem, 2.5vw, 1.6rem);
	}
</style>
