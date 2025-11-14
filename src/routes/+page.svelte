<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { sortStore } from '$lib/stores/sort.js';
	import { modalStore } from '$lib/stores/modal.js';
	import GamesView from '$lib/views/GamesView.svelte';

	import type { Game } from '$lib/types/game.js';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';
	import { getTierDisplayName } from '$lib/utils/colorConstants.js';
	import type { SortOption } from '$lib/stores/filters.js';

	let { data }: { data: PageData } = $props();

	interface TierListViewProps {
		filteredGames: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	}

	// Simple state management - no complex derived stores
	let allGames = $state<Game[]>([]);
	let currentActiveTab = $state<'all' | 'completed' | 'planned' | 'tierlist'>('all');
	let TierListViewComponent = $state<Component<TierListViewProps> | null>(null);
	let hasInitializedGames = $state(false);
	let isLoadingGames = $state(true);

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
			isLoadingGames = false;
		} else if (!data.games && !hasInitializedGames) {
			// Handle case where no games data is available
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
		if (displayedGames.length > 0 && $modalStore.pendingGameFromURL) {
			modalStore.openPendingGameFromURL(displayedGames);
		}
	});

	// Function to open modal with reactive filter context
	function openModalWithFilterContext(game: Game) {
		// Pass the current filter state to the modal store
		modalStore.openViewModal(game, displayedGames);
	}

	// Simple derived values for each tab
	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());

	// Get current filter state for manual filtering
	let currentFilterState = $state<{
		searchTerm: string;
		platforms: string[];
		genres: string[];
		statuses: string[];
		tiers: string[];
		sortOption: SortOption | null;
	}>({
		searchTerm: '',
		platforms: [],
		genres: [],
		statuses: [],
		tiers: [],
		sortOption: null
	});

	// Subscribe to filter changes
	$effect(() => {
		const unsubscribe = filtersStore.subscribe(($filters) => {
			if ($filters) {
				currentFilterState = {
					searchTerm: $filters.searchTerm,
					platforms: $filters.platforms,
					genres: $filters.genres,
					statuses: $filters.statuses,
					tiers: $filters.tiers,
					sortOption: $filters.sortOption
				};
			}
		});
		return unsubscribe;
	});

	// Main display logic - apply filters directly for reliability
	let displayedGames = $derived.by(() => {
		// Wait for games to load
		if (isLoadingGames || allGames.length === 0) {
			return [];
		}

		let filteredGames = allGames;

		// Apply search filter
		if (currentFilterState.searchTerm.trim()) {
			const query = currentFilterState.searchTerm.toLowerCase().trim();
			filteredGames = filteredGames.filter((game) => {
				const titleMatch = game.title.toLowerCase().includes(query);
				const genreMatch = game.genre.toLowerCase().includes(query);
				const platformMatch = game.platform.toLowerCase().includes(query);
				return titleMatch || genreMatch || platformMatch;
			});
		}

		// Apply platform filter
		if (currentFilterState.platforms.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				currentFilterState.platforms.includes(game.platform)
			);
		}

		// Apply genre filter
		if (currentFilterState.genres.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				currentFilterState.genres.includes(game.genre)
			);
		}

		// Apply tier filter
		if (currentFilterState.tiers.length > 0) {
			filteredGames = filteredGames.filter((game) => {
				if (!game.tier) return false;
				const gameTierFullName = getTierDisplayName(game.tier);
				return currentFilterState.tiers.includes(gameTierFullName);
			});
		}

		// Apply tab-specific filtering
		switch (currentActiveTab) {
			case 'completed':
				filteredGames = filteredGames.filter((game) => game.status === 'Completed');
				break;
			case 'planned':
				filteredGames = filteredGames.filter((game) => game.status === 'Planned');
				break;
			case 'tierlist':
				filteredGames = filteredGames.filter((game) => game.tier);
				break;
			default:
				// For 'all' tab, no additional filtering
				break;
		}

		// Apply sorting based on sortOption
		if (currentFilterState.sortOption) {
			const { key, direction } = currentFilterState.sortOption;
			const dir = direction === 'asc' ? 1 : -1;

			filteredGames = filteredGames.toSorted((a, b) => {
				const aVal =
					key === 'presentation'
						? (a.ratingPresentation ?? 0)
						: key === 'story'
							? (a.ratingStory ?? 0)
							: key === 'gameplay'
								? (a.ratingGameplay ?? 0)
								: (a.score ?? 0);

				const bVal =
					key === 'presentation'
						? (b.ratingPresentation ?? 0)
						: key === 'story'
							? (b.ratingStory ?? 0)
							: key === 'gameplay'
								? (b.ratingGameplay ?? 0)
								: (b.score ?? 0);

				if (aVal === bVal) return 0;
				return aVal > bVal ? dir : -dir;
			});
		} else {
			// Default sorting when no sortOption is selected
			switch (currentActiveTab) {
				case 'completed':
					// Sort completed games by finished date (most recent first)
					filteredGames = filteredGames.toSorted((a, b) => {
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;
						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
					break;
				case 'planned':
					// Sort planned games alphabetically
					filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
					break;
				default:
					// Sort 'all' tab alphabetically
					filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
					break;
			}
		}

		console.log(`[+page] displayedGames length for tab ${currentActiveTab}:`, filteredGames.length);
		return filteredGames;
	});

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
	{:else if currentActiveTab !== 'tierlist' && isLoadingGames}
		<div class="loading">Loading games...</div>
	{:else if currentActiveTab !== 'tierlist'}
		<GamesView filteredGames={displayedGames} onOpenModal={openModalWithFilterContext} />
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
