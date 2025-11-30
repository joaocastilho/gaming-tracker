<script lang="ts">
	import { gamesStore } from '$lib/stores/games';
	import { filtersStore } from '$lib/stores/filters';
	import { appStore } from '$lib/stores/app';
	import { modalStore } from '$lib/stores/modal';
	import GamesView from '$lib/views/GamesView.svelte';
	import type { Game } from '$lib/types/game';
	import { getTierDisplayName } from '$lib/utils/colorConstants';
	import { parseDate } from '$lib/utils/dateUtils';
	import type { SortOption } from '$lib/stores/filters';

	let allGames = $state<Game[]>([]);
	let hasInitializedGames = $state(false);
	let isLoadingGames = $state(true);

	// Subscribe to games store
	gamesStore.subscribe((games) => {
		if (games && games.length > 0) {
			allGames = games;
		}
	});

	// Force active tab to completed
	$effect(() => {
		appStore.setActiveTab('completed', true);
	});

	// Initialize URL reading
	$effect(() => {
		if (typeof window !== 'undefined') {
			const searchParams = new URLSearchParams(window.location.search);
			filtersStore.readFromURL(searchParams);
			appStore.readFromURL(searchParams);
		}
	});

	// Handle URL writing
	$effect(() => {
		const updateURLs = () => {
			try {
				filtersStore.writeToURL();
				appStore.writeToURL();
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

	// Initialize games from server data or wait for store
	$effect(() => {
		const unsubscribe = gamesStore.loading.subscribe((loading) => {
			isLoadingGames = loading;
		});

		const gamesUnsubscribe = gamesStore.subscribe((games) => {
			if (games && games.length > 0 && !hasInitializedGames) {
				hasInitializedGames = true;
			}
		});

		return () => {
			unsubscribe();
			gamesUnsubscribe();
		};
	});

	// Get current filter state
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
				// Default to finished date descending if no sort option is set
				if (!$filters.sortOption) {
					filtersStore.setSort({ key: 'finishedDate', direction: 'desc' });
				}

				currentFilterState = {
					searchTerm: $filters.searchTerm,
					platforms: $filters.platforms,
					genres: $filters.genres,
					statuses: $filters.statuses,
					tiers: $filters.tiers,
					sortOption: $filters.sortOption || { key: 'finishedDate', direction: 'desc' }
				};
			}
		});
		return unsubscribe;
	});

	// Filter and display completed games
	let displayedGames = $derived.by(() => {
		if (isLoadingGames || allGames.length === 0) {
			return [];
		}

		let filteredGames = allGames.filter((game) => game.status === 'Completed');

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

		// Sort by finished date (most recent first) - default for completed tab
		filteredGames = filteredGames.toSorted((a, b) => {
			const aTime = parseDate(a.finishedDate);
			const bTime = parseDate(b.finishedDate);

			if (aTime === null && bTime === null) return 0;
			if (aTime === null) return 1;
			if (bTime === null) return -1;
			return bTime - aTime;
		});

		// Override with custom sort if specified
		if (currentFilterState.sortOption) {
			const { key, direction } = currentFilterState.sortOption;
			const dir = direction === 'asc' ? 1 : -1;

			filteredGames = filteredGames.toSorted((a, b) => {
				if (key === 'finishedDate') {
					const aTime = parseDate(a.finishedDate);
					const bTime = parseDate(b.finishedDate);

					if (aTime === null && bTime === null) return 0;
					if (aTime === null) return 1;
					if (bTime === null) return -1;
					return direction === 'asc' ? aTime - bTime : bTime - aTime;
				}

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
		}

		return filteredGames;
	});

	function openModalWithFilterContext(game: Game) {
		modalStore.openViewModal(game, displayedGames);
	}

	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());
</script>

<svelte:head>
	<title>Completed Games - Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if isLoadingGames}
		<div class="loading">Loading completed games...</div>
	{:else if hasActiveFilters && displayedGames.length === 0}
		<div class="no-results flex flex-col items-center justify-center gap-3 py-10 text-center">
			<h2 class="font-semibold">No completed games match your current filters</h2>
			<p class="text-gray-600 dark:text-gray-400">
				Try adjusting or clearing your filters to see your completed games.
			</p>
			<button
				class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors"
				type="button"
				onclick={() => {
					filtersStore.resetAllFilters();
					filtersStore.setSearchTerm('');
				}}
			>
				↻ Reset
			</button>
		</div>
	{:else}
		<GamesView filteredGames={displayedGames} onOpenModal={openModalWithFilterContext} />
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
