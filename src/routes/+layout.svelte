<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import FilterDropdown from '$lib/components/FilterDropdown.svelte';
	import RatingsFilter from '$lib/components/RatingsFilter.svelte';
	import DetailModal from '$lib/components/DetailModal.svelte';
	import Header from '$lib/components/Header.svelte';
	import NavigationTabs from '$lib/components/NavigationTabs.svelte';
	import { extractFilterOptions } from '$lib/utils/filterOptions';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';

	import { Grid3x3, List } from 'lucide-svelte';

	let { children } = $props();

	let initialized = false;
	let urlUpdateTimeout: ReturnType<typeof setTimeout> | undefined;

	// Reactive state
	let filterOptions = $state({
		platforms: [] as string[],
		genres: [] as string[],
		tiers: [] as string[]
	});
	let currentViewMode = $state('gallery');

	// Reactive filter options derived from games store
	$effect(() => {
		const unsubscribe = gamesStore.subscribe((games) => {
			filterOptions = extractFilterOptions(games);
		});
		return unsubscribe;
	});

	// Reactive view mode from app store
	$effect(() => {
		const unsubscribe = appStore.viewMode.subscribe((viewMode) => {
			currentViewMode = viewMode;
		});
		return unsubscribe;
	});

	// Initialize app from URL parameters
	$effect(() => {
		if (!initialized) {
			appStore.readFromURLWithFilters(page.url.searchParams, filtersStore);
			// Handle game parameter for detail modal
			const gameId = page.url.searchParams.get('game');
			if (gameId) {
				// Find the game and open modal (will be handled by modal store)
				setTimeout(() => {
					const game = gamesStore.getGameById(gameId);
					if (game) {
						modalStore.openViewModal(game);
					}
				}, 100); // Small delay to ensure games are loaded
			}
			initialized = true;
		}
	});

	// Handle URL updates for all filters (debounced)
	let currentFilterState = {
		searchQuery: '',
		selectedPlatforms: [] as string[],
		selectedGenres: [] as string[],
		selectedTiers: [] as string[],
		ratingRanges: {
			presentation: [0, 10] as [number, number],
			story: [0, 10] as [number, number],
			gameplay: [0, 10] as [number, number],
			total: [0, 20] as [number, number]
		}
	};

	// Direct subscription to filter state
	filtersStore.filterState.subscribe((filters) => {
		currentFilterState = filters;
	});

	// Debounced URL update for all filter changes
	$effect(() => {
		if (initialized) {
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
			urlUpdateTimeout = setTimeout(() => {
				appStore.writeToURLWithFilters(filtersStore);
			}, 300);
		}
	});

	// Handle browser back/forward navigation
	$effect(() => {
		// Compare current state with previous to detect external URL changes
		const currentURL = page.url;
		const searchParam = currentURL.searchParams.get('search') || '';
		const platformsParam = currentURL.searchParams.get('platforms') || '';
		const genresParam = currentURL.searchParams.get('genres') || '';
		const tiersParam = currentURL.searchParams.get('tiers') || '';
		const ratingPresentationParam = currentURL.searchParams.get('ratingPresentation') || '';
		const ratingStoryParam = currentURL.searchParams.get('ratingStory') || '';
		const ratingGameplayParam = currentURL.searchParams.get('ratingGameplay') || '';
		const ratingTotalParam = currentURL.searchParams.get('ratingTotal') || '';

		// Check if URL parameters differ from current filter state
		const urlState = {
			searchQuery: searchParam,
			selectedPlatforms: platformsParam ? platformsParam.split(',') : [],
			selectedGenres: genresParam ? genresParam.split(',') : [],
			selectedTiers: tiersParam ? tiersParam.split(',') : [],
			ratingRanges: {
				presentation: ratingPresentationParam
					? (ratingPresentationParam.split(',').map(Number) as [number, number])
					: [0, 10],
				story: ratingStoryParam
					? (ratingStoryParam.split(',').map(Number) as [number, number])
					: [0, 10],
				gameplay: ratingGameplayParam
					? (ratingGameplayParam.split(',').map(Number) as [number, number])
					: [0, 10],
				total: ratingTotalParam
					? (ratingTotalParam.split(',').map(Number) as [number, number])
					: [0, 20]
			}
		};

		// Simple comparison to detect changes (could be more sophisticated)
		const urlStateString = JSON.stringify(urlState);
		const currentStateString = JSON.stringify(currentFilterState);

		if (initialized && urlStateString !== currentStateString) {
			filtersStore.readFromURL(page.url.searchParams);
		}

		// URL parameters changed, trigger filter update
		filtersStore.readFromURL(page.url.searchParams);
	});

	function handleViewModeToggle() {
		appStore.toggleViewMode();
	}

	// Filter state with reactive updates
	let selectedPlatforms: string[] = $state([]);
	let selectedGenres: string[] = $state([]);
	let selectedTiers: string[] = $state([]);

	// Reactive updates for filter selections (consolidated)
	$effect(() => {
		const unsubPlatforms = filtersStore.selectedPlatforms.subscribe((platforms) => {
			selectedPlatforms = platforms;
		});
		const unsubGenres = filtersStore.selectedGenres.subscribe((genres) => {
			selectedGenres = genres;
		});
		const unsubTiers = filtersStore.selectedTiers.subscribe((tiers) => {
			selectedTiers = tiers;
		});

		return () => {
			unsubPlatforms();
			unsubGenres();
			unsubTiers();
		};
	});

	// Reset all filters
	function resetFilters() {
		filtersStore.resetAllFilters();
		// Immediately update URL to reflect reset state
		if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
		appStore.writeToURLWithFilters(filtersStore);
	}
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Gaming Tracker</title>
</svelte:head>

<div class="bg-background text-foreground min-h-screen">
	<!-- Header Component -->
	<Header />

	<!-- Navigation Tabs -->
	<NavigationTabs />

	<!-- Search & Filter Section (Sticky) -->
	<section class="filter-section sticky top-[104px] z-30 md:top-[110px]">
		<div class="container mx-auto space-y-4 px-6 py-4">
			<!-- Search Bar -->
			<SearchBar />

			<!-- Filter Controls -->
			<div
				class="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 md:flex-wrap md:overflow-x-visible md:pb-0"
			>
				<FilterDropdown
					type="platforms"
					label="Platforms"
					options={filterOptions.platforms}
					selectedOptions={selectedPlatforms}
				/>
				<FilterDropdown
					type="genres"
					label="Genres"
					options={filterOptions.genres}
					selectedOptions={selectedGenres}
				/>
				<FilterDropdown
					type="tiers"
					label="Tiers"
					options={filterOptions.tiers}
					selectedOptions={selectedTiers}
				/>
				<RatingsFilter />
				<button
					class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs transition-colors"
					title="Reset all filters"
					onclick={resetFilters}
				>
					↻ Reset
				</button>

				<div class="ml-auto flex items-center">
					<button
						class="view-toggle-button flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
						title={currentViewMode === 'gallery'
							? 'Switch to table view'
							: 'Switch to gallery view'}
						onclick={handleViewModeToggle}
					>
						{#if currentViewMode === 'gallery'}
							<List size={18} class="text-gray-600 dark:text-gray-400" />
						{:else}
							<Grid3x3 size={18} class="text-gray-600 dark:text-gray-400" />
						{/if}
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Content Area (Scrollable) -->
	<main style="background-color: var(--color-background);" class="px-6 pt-0 pb-6">
		<div class="container mx-auto">
			{@render children?.()}
		</div>
	</main>

	<!-- Detail Modal -->
	<DetailModal />
</div>

<style>
	/* Height calculations for fixed/sticky positioning */
	:global(.h-15) {
		height: 60px;
	}
	:global(.h-12\.5) {
		height: 50px;
	}

	/* Filter section with proper background */
	.filter-section {
		background-color: var(--color-background);
		border-color: var(--color-border);
	}

	/* Reset button text color */
	.reset-button {
		color: var(--color-text-primary);
	}

	/* Ensure proper spacing for content area */
	:global(.pt-\[calc\(60px\+50px\+100px\)\]) {
		padding-top: calc(60px + 50px + 100px);
	}
</style>
