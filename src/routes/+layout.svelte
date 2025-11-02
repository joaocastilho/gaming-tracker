<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import FilterDropdown from '$lib/components/FilterDropdown.svelte';
	import RatingsFilter from '$lib/components/RatingsFilter.svelte';
	import AddEditModal from '$lib/components/AddEditModal.svelte';
	import DetailModal from '$lib/components/DetailModal.svelte';
	import Header from '$lib/components/Header.svelte';
	import { extractFilterOptions } from '$lib/utils/filterOptions.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';

	let { children } = $props();

	let filterOptions = $state({
		platforms: [] as string[],
		genres: [] as string[],
		tiers: [] as string[]
	});
	let initialized = $state(false);
	let urlUpdateTimeout: ReturnType<typeof setTimeout> | undefined;

	// Subscribe to games store and extract filter options
	$effect(() => {
		const unsubscribe = gamesStore.subscribe((games) => {
			filterOptions = extractFilterOptions(games);
		});
		return unsubscribe;
	});

	// Subscribe to app store for view mode
	let currentViewMode = $state('gallery');

	$effect(() => {
		const unsubscribe = appStore.viewMode.subscribe((viewMode) => {
			currentViewMode = viewMode;
		});
		return unsubscribe;
	});

	// Initialize app from URL parameters
	$effect(() => {
		if (!initialized) {
			appStore.readFromURLWithFilters($page.url.searchParams, filtersStore);
			// Handle game parameter for detail modal
			const gameId = $page.url.searchParams.get('game');
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
	let currentFilterState = $state({
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
	});

	$effect(() => {
		const unsubscribe = filtersStore.filterState.subscribe((filters) => {
			currentFilterState = filters;
		});
		return unsubscribe;
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
		const currentURL = $page.url;
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
			filtersStore.readFromURL($page.url.searchParams);
		}

		// URL parameters changed, trigger filter update
		filtersStore.readFromURL($page.url.searchParams);
	});

	function handleViewModeToggle() {
		appStore.toggleViewMode();
	}

	// Filter state
	let selectedPlatforms = $state<string[]>([]);
	let selectedGenres = $state<string[]>([]);
	let selectedTiers = $state<string[]>([]);

	// Subscribe to filter stores
	$effect(() => {
		const unsubscribe = filtersStore.selectedPlatforms.subscribe((platforms) => {
			selectedPlatforms = platforms;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = filtersStore.selectedGenres.subscribe((genres) => {
			selectedGenres = genres;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = filtersStore.selectedTiers.subscribe((tiers) => {
			selectedTiers = tiers;
		});
		return unsubscribe;
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

	<!-- Search & Filter Section (Sticky) -->
	<section class="bg-background border-border sticky top-[60px] z-30 border-b">
		<div class="container mx-auto space-y-4 px-6 py-4">
			<!-- Search Bar -->
			<SearchBar />

			<!-- Filter Controls -->
			<div class="flex flex-wrap items-center gap-3">
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
					class="bg-surface border-border hover:bg-accent hover:text-accent-foreground rounded-md border px-3 py-1.5 text-xs transition-colors"
					title="Reset all filters"
					onclick={resetFilters}
				>
					↻ Reset
				</button>

				<div class="ml-auto flex items-center gap-2">
					<button
						class="rounded-md p-2 transition-colors"
						class:bg-accent={currentViewMode === 'gallery'}
						class:text-accent-foreground={currentViewMode === 'gallery'}
						class:bg-surface={currentViewMode !== 'gallery'}
						class:border-border={currentViewMode !== 'gallery'}
						class:hover:bg-accent={currentViewMode !== 'gallery'}
						class:hover:text-accent-foreground={currentViewMode !== 'gallery'}
						class:border={currentViewMode !== 'gallery'}
						title="Gallery view"
						onclick={handleViewModeToggle}
					>
						⊞
					</button>
					<button
						class="rounded-md p-2 transition-colors"
						class:bg-accent={currentViewMode === 'table'}
						class:text-accent-foreground={currentViewMode === 'table'}
						class:bg-surface={currentViewMode !== 'table'}
						class:border-border={currentViewMode !== 'table'}
						class:hover:bg-accent={currentViewMode !== 'table'}
						class:hover:text-accent-foreground={currentViewMode !== 'table'}
						class:border={currentViewMode !== 'table'}
						title="Table view"
						onclick={handleViewModeToggle}
					>
						☰
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- Content Area (Scrollable) -->
	<main class="px-6 pt-[calc(60px+60px)] pb-6">
		<div class="container mx-auto">
			{@render children?.()}
		</div>
	</main>

	<!-- Add/Edit Game Modal -->
	<AddEditModal />

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

	/* Ensure proper spacing for content area */
	:global(.pt-\[calc\(60px\+50px\+100px\)\]) {
		padding-top: calc(60px + 50px + 100px);
	}
</style>
