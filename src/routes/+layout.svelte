<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import RatingsSort from '$lib/components/RatingsSort.svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import BottomNavigation from '$lib/components/BottomNavigation.svelte';
	import { extractFilterOptions } from '$lib/utils/filterOptions';
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { gamesStore } from '$lib/stores/games.svelte';
	import { appStore } from '$lib/stores/app.svelte';
	import { modalStore } from '$lib/stores/modal.svelte';
	import { browser, dev } from '$app/environment';
	import { onMount, untrack } from 'svelte';
	import type { Game } from '$lib/types/game.js';
	import { RotateCcw } from 'lucide-svelte';
	import GamesView from '$lib/views/GamesView.svelte';
	import TierListView from '$lib/views/TierListView.svelte';
	import { filteredGames } from '$lib/stores/filteredGamesStore.svelte';

	let {
		children,
		data
	}: {
		children: import('svelte').Snippet;
		data: { games: Promise<Game[]> | Game[] };
	} = $props();

	import FilterDropdown from '$lib/components/FilterDropdown.svelte';
	import FilterToggle from '$lib/components/FilterToggle.svelte';

	import DetailModal from '$lib/components/DetailModal.svelte';

	let initialized = $state(false);
	let gamesInitialized = $state(false);
	let urlUpdateTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

	// Initialize games reactively (SSR support)
	$effect(() => {
		if (gamesInitialized) return;
		if (data.games && Array.isArray(data.games)) {
			gamesStore.initializeGames(data.games);
			gamesInitialized = true;
		}
	});

	onMount(() => {
		if (data.games) {
			// Handle promise case (client-side only)
			if (data.games instanceof Promise) {
				data.games
					.then((resolvedGames) => {
						gamesStore.initializeGames(resolvedGames);
						gamesInitialized = true;
					})
					.catch((error) => {
						console.error('Failed to load games:', error);
					});
			}
		}
	});

	onMount(() => {
		if (browser && 'serviceWorker' in navigator) {
			const swPath = '/service-worker.js';

			navigator.serviceWorker
				.register(swPath, {
					updateViaCache: 'none'
				})
				.then((registration) => {
					const checkForUpdates = () => {
						if (
							registration.installing === null &&
							registration.waiting === null &&
							registration.active !== null
						) {
							registration.update().catch(() => {
								// Silently ignore update errors
							});
						}
					};

					setInterval(checkForUpdates, 60000);
				})
				.catch(() => {});
		}
	});

	// Use a more efficient derived that doesn't block on empty games
	let filterOptions = $derived.by(() => {
		const games = $gamesStore;
		if (!games || games.length === 0) {
			return { platforms: [], genres: [], tiers: [], coOp: [] };
		}
		return extractFilterOptions(games);
	});

	let isGamesPage = $derived(
		(page.url.pathname === '/' ||
			page.url.pathname === '/completed' ||
			page.url.pathname === '/planned') &&
			appStore.activeTab !== 'tierlist'
	);

	let isTierlistPage = $derived(
		page.url.pathname === '/tierlist' || appStore.activeTab === 'tierlist'
	);
	let isPlannedPage = $derived(page.url.pathname === '/planned');

	let showTiersFilter = $derived(!isTierlistPage && !isPlannedPage);
	let showCoOpFilter = $derived(!isTierlistPage);

	$effect(() => {
		if (!initialized) return;

		const tab = appStore.activeTab;

		if (tab === 'tierlist') {
			// Only reset if filters are actually applied to avoid infinite loop
			if (filtersStore.isAnyFilterApplied()) {
				filtersStore.resetAllFilters();
			}
			if (filtersStore.state?.searchTerm) {
				filtersStore.setSearchTerm('');
			}
		}
	});

	$effect(() => {
		if (typeof window !== 'undefined' && !initialized) {
			initialized = true;
			// Initialize search from URL
			filtersStore.readSearchFromURL(page.url.searchParams);
		}
	});

	$effect(() => {
		if (initialized) {
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
		}
	});

	$effect(() => {
		if (isSearchOpen && searchInput) {
			searchInput.focus();
		}
	});

	$effect(() => {
		// Sync activeTab with URL pathname changes
		const pathname = page.url.pathname;
		let targetTab: 'all' | 'completed' | 'planned' | 'tierlist' = 'all';

		if (pathname === '/completed') {
			targetTab = 'completed';
		} else if (pathname === '/planned') {
			targetTab = 'planned';
		} else if (pathname === '/tierlist') {
			targetTab = 'tierlist';
		}

		appStore.setActiveTab(targetTab);

		// Reset sort to default if not specified in URL
		// This ensures that switching tabs applies the tab's default sort
		// unless the user specifically navigated to a sorted URL
		const hasSortInUrl = page.url.searchParams.has('sortBy');
		if (!hasSortInUrl) {
			untrack(() => filtersStore.setSort(null));
		}
	});

	// Handle URL reading for modal (Global)
	$effect(() => {
		const games = $gamesStore;
		if (games.length > 0) {
			modalStore.readFromURL(page.url.searchParams, games);
		}
	});

	// Handle pending modal from URL (Global)
	$effect(() => {
		const games = $gamesStore;
		if (games.length > 0) {
			modalStore.openPendingGameFromURL(games);
		}
	});

	let selectedPlatforms = $derived($filtersStore?.platforms ?? []);
	let selectedGenres = $derived($filtersStore?.genres ?? []);
	let selectedTiers = $derived($filtersStore?.tiers ?? []);
	let selectedCoOp = $derived($filtersStore?.coOp ?? []);

	let isSearchOpen = $state(false);
	let isFiltersOpen = $state(false);
	let searchInput = $state<HTMLInputElement | null>(null);

	function resetFilters() {
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');

		const pathname = page.url.pathname;
		if (pathname === '/' || pathname === '/planned') {
			filtersStore.setSort({ key: 'alphabetical', direction: 'asc' });
		} else if (pathname === '/completed') {
			filtersStore.setSort({ key: 'finishedDate', direction: 'desc' });
		}

		if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
	}

	function onSearchToggle() {
		isSearchOpen = !isSearchOpen;
		if (isSearchOpen) {
			isFiltersOpen = false; // Close filters if opening search
		}
	}

	function onFiltersToggle() {
		isFiltersOpen = !isFiltersOpen;
		if (isFiltersOpen) {
			isSearchOpen = false; // Close search if opening filters
		}
	}

	function onCloseSearchAndFilters() {
		isSearchOpen = false;
		isFiltersOpen = false;
	}

	function openModalWithFilterContext(game: Game, contextGames?: Game[]) {
		modalStore.openViewModal(game, contextGames ?? $filteredGames);
	}

	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());
</script>

<svelte:head>
	<title>Gaming Tracker</title>
	<meta name="theme-color" content={appStore.theme === 'dark' ? '#0f1419' : '#f2ebe1'} />
	<meta
		name="apple-mobile-web-app-status-bar-style"
		content={appStore.theme === 'dark' ? 'black-translucent' : 'default'}
	/>
	{#if dev}
		<link rel="modulepreload" href="/@vite/client" />
	{/if}
</svelte:head>

{#if initialized}
	<div class="bg-background text-foreground min-h-screen bg-[var(--color-background)]">
		<Header />
		<section class="filter-section top-[104px] z-30 hidden md:top-[110px] md:block">
			<div class="container mx-auto space-y-4 px-6 py-4">
				{#if !isTierlistPage}
					<SearchBar />
					<div class="flex flex-col items-center gap-4">
						<div class="flex flex-wrap items-center justify-center gap-3">
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
							{#if showTiersFilter}
								<FilterDropdown
									type="tiers"
									label="Tiers"
									options={filterOptions.tiers}
									selectedOptions={selectedTiers}
								/>
							{/if}

							{#if showCoOpFilter}
								<FilterToggle label="Co-op" value="Yes" isSelected={selectedCoOp.includes('Yes')} />
							{/if}
							<span class="pipe-separator">|</span>
							<RatingsSort />
							<button
								class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors"
								title="Reset all filters"
								onclick={resetFilters}
							>
								<RotateCcw size={18} />
								Reset
							</button>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<main class="bg-[var(--color-background)] px-2 pt-0 pb-6 md:px-6">
			<div class="container mx-auto">
				{#if isGamesPage}
					{#if hasActiveFilters && $filteredGames.length === 0}
						<div
							class="no-results flex flex-col items-center justify-center gap-3 py-10 text-center"
						>
							<h2 class="font-semibold">No games match your current filters</h2>
							<p class="text-gray-600 dark:text-gray-400">
								Try adjusting or clearing your filters to see more games.
							</p>
							<button
								class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors"
								type="button"
								onclick={resetFilters}
							>
								<RotateCcw size={18} />
								Reset
							</button>
						</div>
					{:else}
						<GamesView filteredGames={$filteredGames} onOpenModal={openModalWithFilterContext} />
					{/if}

					<div style="display: none;">
						{@render children?.()}
					</div>
				{:else if isTierlistPage}
					{#if hasActiveFilters && $filteredGames.length === 0}
						<div
							class="no-results flex flex-col items-center justify-center gap-3 py-10 text-center"
						>
							<h2 class="font-semibold">No games match your current filters</h2>
							<p class="text-gray-600 dark:text-gray-400">
								Try adjusting or clearing your filters to see more games.
							</p>
							<button
								class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors"
								type="button"
								onclick={resetFilters}
							>
								<RotateCcw size={18} />
								Reset
							</button>
						</div>
					{:else}
						<TierListView filteredGames={$filteredGames} onOpenModal={openModalWithFilterContext} />
					{/if}

					<div style="display: none;">
						{@render children?.()}
					</div>
				{:else}
					{@render children?.()}
				{/if}
			</div>
		</main>

		<DetailModal />

		<!-- Mobile Search Input -->
		{#if isSearchOpen}
			<div class="mobile-search-overlay fixed inset-x-0 top-0 z-40 md:hidden" role="search">
				<div class="bg-background border-border border-b p-3 shadow-lg">
					<div class="relative flex items-center gap-2">
						<span class="text-muted-foreground text-lg">🔍</span>
						<input
							bind:this={searchInput}
							type="text"
							placeholder="Search games..."
							class="bg-surface border-border text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-md border py-3 pr-10 pl-3 text-base focus:ring-2 focus:outline-none"
							bind:value={$filtersStore.searchTerm}
							onkeydown={(e) => {
								if (e.key === 'Escape') {
									onSearchToggle();
								}
							}}
						/>
						<button
							type="button"
							class="bg-surface hover:bg-accent text-muted-foreground hover:text-foreground flex h-10 w-10 items-center justify-center rounded-md transition-colors"
							onclick={() => {
								$filtersStore.searchTerm = '';
								onSearchToggle();
							}}
							aria-label="Close search"
						>
							✕
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Mobile Filters Modal -->
		{#if isFiltersOpen}
			<div
				class="mobile-filters-modal fixed inset-0 z-50 md:hidden"
				onclick={(e) => {
					if (e.target === e.currentTarget) onFiltersToggle();
				}}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						if (e.target === e.currentTarget) onFiltersToggle();
					}
				}}
			>
				<!-- Blurred backdrop -->
				<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
				<!-- Opaque content panel -->
				<div
					class="mobile-filters-container absolute right-0 bottom-0 left-0 max-h-[95vh] overflow-hidden rounded-t-2xl shadow-2xl"
					style="background-color: var(--color-background);"
				>
					<div class="border-border flex items-center justify-between border-b p-4">
						<h2 class="text-lg font-semibold">Filters & Sorts</h2>
						<button type="button" onclick={onFiltersToggle} aria-label="Close filters"> ✕ </button>
					</div>
					<div class="max-h-[calc(95vh-120px)] space-y-4 overflow-y-auto p-4">
						<!-- Platforms -->
						<FilterDropdown
							type="platforms"
							label="Platforms"
							options={filterOptions.platforms}
							selectedOptions={selectedPlatforms}
						/>
						<!-- Genres -->
						<FilterDropdown
							type="genres"
							label="Genres"
							options={filterOptions.genres}
							selectedOptions={selectedGenres}
						/>
						<!-- Tiers -->
						{#if showTiersFilter}
							<FilterDropdown
								type="tiers"
								label="Tiers"
								options={filterOptions.tiers}
								selectedOptions={selectedTiers}
							/>
						{/if}
						<!-- Co-op -->
						{#if showCoOpFilter}
							<FilterToggle label="Co-op" value="Yes" isSelected={selectedCoOp.includes('Yes')} />
						{/if}
						<!-- Ratings Sort -->
						<RatingsSort />
					</div>
					<div class="border-border flex items-center justify-between border-t p-4">
						<button
							class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex items-center rounded-md px-3 py-2 text-xs transition-colors"
							onclick={resetFilters}
						>
							↻ Reset
						</button>
						<button
							type="button"
							class="apply-button bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
							onclick={() => {
								// Apply filters - they are already bound
								onFiltersToggle();
							}}
						>
							✓ Apply
						</button>
					</div>
				</div>
			</div>
		{/if}

		<BottomNavigation {onSearchToggle} {onFiltersToggle} {onCloseSearchAndFilters} />
		<ScrollToTopButton />
	</div>
{/if}

<style>
	:global(.h-15) {
		height: 60px;
	}
	:global(.h-12\.5) {
		height: 50px;
	}

	.filter-section {
		background-color: var(--color-background);
		border-color: var(--color-border);
	}

	.reset-button {
		color: var(--color-text-primary);
		font-size: 0.85rem;
		cursor: pointer;
	}

	.no-results {
		font-size: 1.5rem;
		color: var(--color-text-primary);
	}
</style>
