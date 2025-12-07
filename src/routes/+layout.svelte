<script lang="ts">
	import { page } from '$app/state';
	import { pushState, goto, replaceState } from '$app/navigation';
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
	import {
		RotateCcw,
		Check,
		X,
		ArrowUpDown,
		SlidersHorizontal,
		Monitor,
		Tag,
		Trophy,
		Users,
		ChevronDown
	} from 'lucide-svelte';
	import {
		getPlatformColor,
		getGenreColor,
		getTierColor,
		getCoOpColor
	} from '$lib/utils/filterOptions';
	import GamesView from '$lib/views/GamesView.svelte';
	import TierListView from '$lib/views/TierListView.svelte';
	import { filteredGames } from '$lib/stores/filteredGamesStore.svelte';
	import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';

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

			// Auto-open mobile search if URL has search parameter
			const searchParam = page.url.searchParams.get('s');
			if (searchParam && browser && window.innerWidth < 768) {
				pushState(page.url, { showMobileSearch: true });
			}
		}
	});

	import { lastManualClearTime } from '$lib/stores/searchClearCoordinator';

	// Sync search term from URL on every navigation (for auto-switching and manual tab changes)
	// BUT NOT when mobile search is open (to avoid interfering with active typing)
	// Also NOT immediately after a manual clear (to prevent race condition)
	$effect(() => {
		if (initialized && browser && !isSearchOpen) {
			const searchParam = page.url.searchParams.get('s');
			const currentSearchTerm = $filtersStore?.searchTerm ?? '';

			// Skip sync if we just manually cleared (within 100ms)
			const timeSinceLastClear = Date.now() - lastManualClearTime;
			if (timeSinceLastClear < 100) {
				console.log('[Layout] Skipping URL sync - recent manual clear');
				return;
			}

			// Only update if URL search differs from current state to avoid loops
			if (searchParam !== currentSearchTerm) {
				if (searchParam) {
					console.log('[Layout] Syncing search from URL:', searchParam);
					filtersStore.setSearchTerm(searchParam);
				}
			}
		}
	});

	$effect(() => {
		if (initialized) {
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
		}
	});

	// Track if we just opened search to set initial value
	let searchJustOpened = false;
	$effect(() => {
		if (isSearchOpen && searchInput) {
			const searchTerm = $filtersStore?.searchTerm ?? '';

			// Set initial value when search opens
			if (!searchJustOpened) {
				searchInput.value = searchTerm;
				searchJustOpened = true;
			}

			searchInput.focus();
		} else if (!isSearchOpen) {
			searchJustOpened = false;
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

	let isSearchOpen = $derived(!!(page.state as any).showMobileSearch);
	let isFiltersOpen = $state(false);
	let isDesktopFiltersExpanded = $state(true); // Desktop filter section expanded by default
	let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);
	let searchInput = $state<HTMLInputElement | null>(null);
	let savedScrollPosition = $state<number>(0);

	// Pending filter state (applied only when user clicks Apply)
	let pendingPlatforms = $state<string[]>([]);
	let pendingGenres = $state<string[]>([]);
	let pendingTiers = $state<string[]>([]);
	let pendingCoOp = $state<string[]>([]);

	// Sync pending state when modal opens
	$effect(() => {
		if (isFiltersOpen) {
			pendingPlatforms = [...selectedPlatforms];
			pendingGenres = [...selectedGenres];
			pendingTiers = [...selectedTiers];
			pendingCoOp = [...selectedCoOp];
		}
	});

	// Scroll lock effect when filters modal is open
	$effect(() => {
		if (browser && (isFiltersOpen || activeFilterPopup)) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});

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
		if (isSearchOpen) {
			history.back();
		} else {
			// Save scroll position before opening search (mobile only)
			if (browser && window.innerWidth < 768) {
				savedScrollPosition = window.scrollY;
			}

			// Tier list is not searchable - switch to Completed tab if trying to search from tierlist
			const currentTab = appStore.activeTab;
			if (currentTab === 'tierlist') {
				const searchTerm = $filtersStore?.searchTerm ?? '';
				const searchParam = searchTerm ? `?s=${encodeURIComponent(searchTerm)}` : '';
				// Open search first, then navigate
				pushState(page.url, { showMobileSearch: true });
				goto(`/completed${searchParam}`, {
					keepFocus: true,
					noScroll: true,
					state: { showMobileSearch: true }
				});
				isFiltersOpen = false;
				return;
			}

			// Open search: push state (don't reset filters to preserve search term)
			pushState(page.url, { showMobileSearch: true });
			isFiltersOpen = false;
		}
	}

	function onFiltersToggle() {
		isFiltersOpen = !isFiltersOpen;
		if (isFiltersOpen) {
			// Close search if opening filters
			if (isSearchOpen) history.back();
		}
	}

	function onCloseSearchAndFilters() {
		if (isSearchOpen) history.back();
		isFiltersOpen = false;
	}

	// Pending filter toggle functions
	function togglePendingPlatform(platform: string) {
		if (pendingPlatforms.includes(platform)) {
			pendingPlatforms = pendingPlatforms.filter((p) => p !== platform);
		} else {
			pendingPlatforms = [...pendingPlatforms, platform];
		}
	}

	function togglePendingGenre(genre: string) {
		if (pendingGenres.includes(genre)) {
			pendingGenres = pendingGenres.filter((g) => g !== genre);
		} else {
			pendingGenres = [...pendingGenres, genre];
		}
	}

	function togglePendingTier(tier: string) {
		if (pendingTiers.includes(tier)) {
			pendingTiers = pendingTiers.filter((t) => t !== tier);
		} else {
			pendingTiers = [...pendingTiers, tier];
		}
	}

	function togglePendingCoOp(coOp: string) {
		if (pendingCoOp.includes(coOp)) {
			pendingCoOp = pendingCoOp.filter((c) => c !== coOp);
		} else {
			pendingCoOp = [...pendingCoOp, coOp];
		}
	}

	function applyFilters() {
		// Clear current filters first
		filtersStore.resetAllFilters();
		// Apply pending filters
		pendingPlatforms.forEach((p) => filtersStore.togglePlatform(p));
		pendingGenres.forEach((g) => filtersStore.toggleGenre(g));
		pendingTiers.forEach((t) => filtersStore.toggleTier(t));
		pendingCoOp.forEach((c) => filtersStore.toggleCoOp(c));
		// Close modal
		isFiltersOpen = false;
	}

	function closeFiltersWithoutApplying() {
		// Simply close the modal, pending state will be discarded
		isFiltersOpen = false;
		activeFilterPopup = null;
	}

	function resetPendingFilters() {
		pendingPlatforms = [];
		pendingGenres = [];
		pendingTiers = [];
		pendingCoOp = [];
	}

	function resetCurrentCategoryPending() {
		if (activeFilterPopup === 'platforms') {
			pendingPlatforms = [];
		} else if (activeFilterPopup === 'genres') {
			pendingGenres = [];
		} else if (activeFilterPopup === 'tiers') {
			pendingTiers = [];
		} else if (activeFilterPopup === 'coOp') {
			pendingCoOp = [];
		}
		activeFilterPopup = null;
	}

	// Clear search term when search closes (e.g. via back button)
	let wasSearchOpen = false;
	$effect(() => {
		if (isSearchOpen) {
			wasSearchOpen = true;
		} else if (wasSearchOpen) {
			wasSearchOpen = false;

			// Clear filter store first to trigger unfiltering
			filtersStore.setSearchTerm('');

			// Then clear URL parameter
			if (browser) {
				const url = new URL(window.location.href);
				url.searchParams.delete('s');
				replaceState(url.toString(), page.state);
			}

			// Restore scroll position when search closes (mobile only)
			if (browser && window.innerWidth < 768) {
				requestAnimationFrame(() => {
					window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
				});
			}
		}
	});

	// Scroll to top when search term changes in mobile search
	$effect(() => {
		if (browser && isSearchOpen && window.innerWidth < 768) {
			const searchTerm = $filtersStore?.searchTerm ?? '';
			// Scroll to top when there's a search term or when results change
			if (searchTerm) {
				requestAnimationFrame(() => {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				});
			}
		}
	});

	// Auto-switch to tab with results when current tab has no matches
	let lastSearchTerm = '';
	let lastActiveTab = '';
	$effect(() => {
		if (!browser || !isSearchOpen) return;

		const searchTerm = $filtersStore?.searchTerm ?? '';
		const currentTab = appStore.activeTab;
		const counts = filteredCountsStore.counts;
		const currentCount = $filteredGames.length;

		// Only trigger on search term changes, not on initial load or tab switch
		if (searchTerm && searchTerm !== lastSearchTerm && currentTab === lastActiveTab) {
			// Current tab has no results, but complementary tab does
			if (currentCount === 0) {
				// Preserve search term in URL when navigating
				const searchParam = searchTerm ? `?s=${encodeURIComponent(searchTerm)}` : '';

				// Tier list is not searchable - switch to Completed or Planned based on what has results
				if (currentTab === 'tierlist') {
					if (counts.completed > 0) {
						goto(`/completed${searchParam}`, {
							keepFocus: true,
							noScroll: true,
							state: { showMobileSearch: true }
						});
					} else if (counts.planned > 0) {
						goto(`/planned${searchParam}`, {
							keepFocus: true,
							noScroll: true,
							state: { showMobileSearch: true }
						});
					}
				}
				// Planned and Completed are complementary - if one has no results, switch to the other
				else if (currentTab === 'planned' && counts.completed > 0) {
					goto(`/completed${searchParam}`, {
						keepFocus: true,
						noScroll: true,
						state: { showMobileSearch: true }
					});
				} else if (currentTab === 'completed' && counts.planned > 0) {
					goto(`/planned${searchParam}`, {
						keepFocus: true,
						noScroll: true,
						state: { showMobileSearch: true }
					});
				}
				// If in All tab, don't auto-switch
			}
		}

		lastSearchTerm = searchTerm;
		lastActiveTab = currentTab;
	});

	function openModalWithFilterContext(game: Game, contextGames?: Game[]) {
		modalStore.openViewModal(game, contextGames ?? $filteredGames);
	}

	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());

	// Handle mobile search input with debounce
	let mobileSearchDebounceTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

	function handleMobileSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;

		if (mobileSearchDebounceTimeout) {
			clearTimeout(mobileSearchDebounceTimeout);
		}

		mobileSearchDebounceTimeout = setTimeout(() => {
			// Update filter store FIRST to trigger filtering
			filtersStore.setSearchTerm(newValue);

			// Then update URL with search parameter using current location
			if (browser) {
				const url = new URL(window.location.href);
				if (newValue) {
					url.searchParams.set('s', newValue);
				} else {
					url.searchParams.delete('s');
				}
				// Use replaceState to update URL without navigation
				replaceState(url.toString(), { ...page.state });
			}
		}, 300);
	}

	function clearMobileSearch() {
		// Clear filter store first to trigger unfiltering
		filtersStore.setSearchTerm('');

		// Clear input value
		if (searchInput) {
			searchInput.value = '';
		}

		// Clear URL parameter
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.delete('s');
			replaceState(url.toString(), page.state);
		}

		// Close search box
		if (isSearchOpen) {
			history.back();
		}
	}
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
			<div class="container mx-auto px-6">
				{#if !isTierlistPage}
					<!-- Toggle button for collapsible filters -->
					<div class="filter-toggle-container">
						<button
							type="button"
							class="filter-toggle-button"
							onclick={() => (isDesktopFiltersExpanded = !isDesktopFiltersExpanded)}
							aria-expanded={isDesktopFiltersExpanded}
							aria-label={isDesktopFiltersExpanded ? 'Hide filters' : 'Show filters'}
						>
							<span class="filter-toggle-text">
								{isDesktopFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
							</span>
							<ChevronDown
								size={20}
								class="filter-toggle-icon"
								style="transform: rotate({isDesktopFiltersExpanded ? '180deg' : '0deg'})"
							/>
						</button>
					</div>

					<!-- Collapsible filter content -->
					{#if isDesktopFiltersExpanded}
						<div class="filter-content space-y-4 py-4">
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
										<FilterToggle
											label="Co-op"
											value="Yes"
											isSelected={selectedCoOp.includes('Yes')}
										/>
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
						</div>
					{/if}
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
			<div class="mobile-search-container md:hidden" role="search">
				<div class="mobile-search-bar-container">
					<div class="mobile-search-bar">
						<span class="mobile-search-icon" aria-hidden="true">🔍</span>
						<input
							bind:this={searchInput}
							type="text"
							placeholder="Search games..."
							class="mobile-search-input"
							oninput={handleMobileSearchInput}
							onkeydown={(e) => {
								if (e.key === 'Escape') {
									onSearchToggle();
								}
							}}
							aria-label="Search games"
							autocomplete="off"
							spellcheck="false"
						/>
						{#if $filtersStore?.searchTerm}
							<button
								type="button"
								class="mobile-clear-button"
								onclick={clearMobileSearch}
								aria-label="Clear search"
							>
								✕
							</button>
						{/if}
						<button
							type="button"
							class="mobile-close-button"
							onclick={clearMobileSearch}
							aria-label="Close search"
						>
							Close
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
					if (e.target === e.currentTarget) closeFiltersWithoutApplying();
				}}
				role="button"
				tabindex="0"
				onkeydown={(e) => {
					if (e.key === 'Escape') closeFiltersWithoutApplying();
				}}
			>
				<!-- Blurred backdrop -->
				<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
				<!-- Opaque content panel -->
				<div
					class="mobile-filters-container absolute right-0 bottom-0 left-0 max-h-[85vh] overflow-hidden rounded-t-2xl shadow-2xl"
					style="background-color: var(--color-background);"
				>
					<!-- Header with title and action icons -->
					<div class="mobile-filters-header">
						<h2 class="mobile-filters-title">Filters and Sorting</h2>
						<div class="mobile-filters-actions">
							<button
								type="button"
								class="mobile-header-icon apply-icon"
								onclick={applyFilters}
								aria-label="Apply filters"
								title="Apply"
							>
								<Check size={20} />
							</button>
							<button
								type="button"
								class="mobile-header-icon reset-icon"
								onclick={() => {
									resetPendingFilters();
									resetFilters();
								}}
								aria-label="Reset all filters"
								title="Reset"
							>
								<RotateCcw size={18} />
							</button>
							<button
								type="button"
								class="mobile-header-icon close-icon"
								onclick={closeFiltersWithoutApplying}
								aria-label="Close without applying"
								title="Close"
							>
								<X size={20} />
							</button>
						</div>
					</div>

					<div class="mobile-filters-content">
						<!-- Filter By Section -->
						<div class="mobile-filter-section">
							<h3 class="mobile-filter-section-title">
								<SlidersHorizontal size={16} class="section-icon" />
								Filter By
							</h3>
							<div class="mobile-filter-categories-compact">
								<button
									type="button"
									class="mobile-filter-category-compact {pendingPlatforms.length > 0
										? 'has-selection'
										: ''}"
									onclick={() => (activeFilterPopup = 'platforms')}
								>
									<Monitor size={14} />
									<span>Platforms</span>
									{#if pendingPlatforms.length > 0}
										<span class="category-count-small">{pendingPlatforms.length}</span>
									{/if}
								</button>
								<button
									type="button"
									class="mobile-filter-category-compact {pendingGenres.length > 0
										? 'has-selection'
										: ''}"
									onclick={() => (activeFilterPopup = 'genres')}
								>
									<Tag size={14} />
									<span>Genres</span>
									{#if pendingGenres.length > 0}
										<span class="category-count-small">{pendingGenres.length}</span>
									{/if}
								</button>
								{#if showTiersFilter}
									<button
										type="button"
										class="mobile-filter-category-compact {pendingTiers.length > 0
											? 'has-selection'
											: ''}"
										onclick={() => (activeFilterPopup = 'tiers')}
									>
										<Trophy size={14} />
										<span>Tiers</span>
										{#if pendingTiers.length > 0}
											<span class="category-count-small">{pendingTiers.length}</span>
										{/if}
									</button>
								{/if}
								{#if showCoOpFilter}
									<button
										type="button"
										class="mobile-filter-category-compact coop-toggle {pendingCoOp.includes('Yes')
											? 'has-selection'
											: ''}"
										onclick={() => togglePendingCoOp('Yes')}
									>
										<Users size={14} />
										<span>Co-op</span>
									</button>
								{/if}
							</div>
						</div>

						<!-- Sort By Section -->
						<div class="mobile-filter-section">
							<h3 class="mobile-filter-section-title">
								<ArrowUpDown size={16} class="section-icon" />
								Sort By
							</h3>
							<div class="mobile-sort-options">
								<RatingsSort />
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Filter Options Popup (Secondary Modal) -->
		{#if activeFilterPopup}
			<div
				class="filter-popup-overlay fixed inset-0 z-[60] flex items-center justify-center md:hidden"
				role="dialog"
				tabindex="-1"
				onkeydown={(e) => {
					if (e.key === 'Escape') activeFilterPopup = null;
				}}
			>
				<div
					class="absolute inset-0 bg-black/60 backdrop-blur-sm"
					onclick={() => (activeFilterPopup = null)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							activeFilterPopup = null;
						}
					}}
					role="button"
					tabindex="0"
					aria-label="Close popup"
				></div>
				<div class="filter-popup-content">
					<div class="filter-popup-header">
						<h3 class="filter-popup-title">
							{#if activeFilterPopup === 'platforms'}
								<Monitor size={18} /> Platforms
							{:else if activeFilterPopup === 'genres'}
								<Tag size={18} /> Genres
							{:else if activeFilterPopup === 'tiers'}
								<Trophy size={18} /> Tiers
							{/if}
						</h3>
						<div class="filter-popup-header-actions">
							<button
								type="button"
								class="popup-icon-btn reset"
								onclick={resetCurrentCategoryPending}
								aria-label="Reset this filter"
								title="Reset"
							>
								<RotateCcw size={18} />
							</button>
							<button
								type="button"
								class="popup-icon-btn accept"
								onclick={() => (activeFilterPopup = null)}
								aria-label="Accept selection"
								title="Accept"
							>
								<Check size={20} />
							</button>
						</div>
					</div>
					<div class="filter-popup-options">
						{#if activeFilterPopup === 'platforms'}
							{#each filterOptions.platforms as platform (platform)}
								<button
									type="button"
									class="themed-filter-pill {getPlatformColor(platform)} {pendingPlatforms.includes(
										platform
									)
										? 'selected'
										: ''}"
									onclick={() => togglePendingPlatform(platform)}
								>
									{platform}
								</button>
							{/each}
						{:else if activeFilterPopup === 'genres'}
							{#each filterOptions.genres as genre (genre)}
								<button
									type="button"
									class="themed-filter-pill {getGenreColor(genre)} {pendingGenres.includes(genre)
										? 'selected'
										: ''}"
									onclick={() => togglePendingGenre(genre)}
								>
									{genre}
								</button>
							{/each}
						{:else if activeFilterPopup === 'tiers'}
							{#each filterOptions.tiers as tier (tier)}
								<button
									type="button"
									class="themed-filter-pill {getTierColor(tier)} {pendingTiers.includes(tier)
										? 'selected'
										: ''}"
									onclick={() => togglePendingTier(tier)}
								>
									{tier}
								</button>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<BottomNavigation {onSearchToggle} {onFiltersToggle} {onCloseSearchAndFilters} />
		<ScrollToTopButton hideWhenFiltersOpen={isFiltersOpen} />
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

	/* Mobile Search Bar - matches desktop SearchBar styling */
	.mobile-search-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 40;
		background-color: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		padding: 12px 16px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.mobile-search-bar-container {
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
	}

	.mobile-search-bar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		border-radius: 8px;
		padding: 12px 16px;
		background-color: #1a1f27;
		border: 1px solid #2a2f3a;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		gap: 8px;
	}

	:global(.light) .mobile-search-bar {
		background-color: #ffffff;
		border-color: #e5e7eb;
	}

	.mobile-search-bar:focus-within {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	:global(.light) .mobile-search-bar:focus-within {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}

	.mobile-search-icon {
		font-size: 1.1rem;
		flex-shrink: 0;
	}

	.mobile-search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: #ffffff;
		font-size: 1rem;
		line-height: 1.5;
		min-width: 0;
	}

	:global(.light) .mobile-search-input {
		color: #1a1a1a;
	}

	.mobile-search-input::placeholder {
		color: #8b92a8;
	}

	:global(.light) .mobile-search-input::placeholder {
		color: #6b7280;
	}

	.mobile-clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: none;
		background: transparent;
		color: #8b92a8;
		cursor: pointer;
		border-radius: 4px;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		flex-shrink: 0;
		font-size: 0.9rem;
	}

	:global(.light) .mobile-clear-button {
		color: #6b7280;
	}

	.mobile-clear-button:hover {
		background-color: rgba(139, 146, 168, 0.1);
		color: #ffffff;
	}

	:global(.light) .mobile-clear-button:hover {
		background-color: rgba(107, 114, 128, 0.1);
		color: #1a1a1a;
	}

	.mobile-close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		border: none;
		background: rgba(59, 130, 246, 0.1);
		color: #60a5fa;
		cursor: pointer;
		border-radius: 6px;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		flex-shrink: 0;
		font-size: 0.85rem;
		font-weight: 500;
	}

	:global(.light) .mobile-close-button {
		background: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
	}

	.mobile-close-button:hover {
		background-color: rgba(59, 130, 246, 0.2);
	}

	:global(.light) .mobile-close-button:hover {
		background-color: rgba(59, 130, 246, 0.25);
	}

	/* Mobile Filters - Redesigned */
	.mobile-filters-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.mobile-filters-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.mobile-filters-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mobile-header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mobile-header-icon.apply-icon {
		background-color: #22c55e;
		color: white;
	}

	.mobile-header-icon.apply-icon:hover {
		background-color: #16a34a;
		transform: scale(1.05);
	}

	.mobile-header-icon.reset-icon {
		background-color: rgba(255, 255, 255, 0.08);
		color: var(--color-text-secondary);
	}

	:global(.light) .mobile-header-icon.reset-icon {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.mobile-header-icon.reset-icon:hover {
		background-color: rgba(255, 255, 255, 0.15);
		color: var(--color-text-primary);
	}

	:global(.light) .mobile-header-icon.reset-icon:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.mobile-header-icon.close-icon {
		background-color: rgba(239, 68, 68, 0.1);
		color: #ef4444;
	}

	.mobile-header-icon.close-icon:hover {
		background-color: rgba(239, 68, 68, 0.2);
		transform: scale(1.05);
	}

	.mobile-filters-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: rgba(255, 255, 255, 0.05);
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.mobile-filters-close:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-text-primary);
	}

	:global(.light) .mobile-filters-close {
		background: rgba(0, 0, 0, 0.05);
	}

	:global(.light) .mobile-filters-close:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	.mobile-filters-content {
		padding: 16px;
		max-height: calc(85vh - 80px);
		overflow-y: auto;
	}

	.mobile-filter-section {
		margin-bottom: 16px;
	}

	.mobile-filter-section:last-child {
		margin-bottom: 0;
		padding-bottom: 80px; /* space for bottom nav */
	}

	.mobile-filter-section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 12px;
	}

	.mobile-filter-section-title :global(.section-icon) {
		color: var(--color-text-secondary);
	}

	.mobile-filter-icon {
		font-size: 1rem;
	}

	/* Compact Filter Category Buttons */
	.mobile-filter-categories-compact {
		display: flex;
		flex-wrap: nowrap;
		gap: 6px;
		justify-content: flex-start;
		padding-bottom: 4px;
	}

	.mobile-filter-categories-compact::-webkit-scrollbar {
		display: none;
	}

	.mobile-filter-category-compact {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.mobile-filter-category-compact:hover {
		background-color: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.mobile-filter-category-compact.has-selection {
		background-color: rgba(59, 130, 246, 0.15);
		border-color: #3b82f6;
		color: #60a5fa;
	}

	.category-count-small {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: 8px;
		background-color: #3b82f6;
		color: white;
		font-size: 0.65rem;
		font-weight: 600;
	}

	.mobile-filter-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}

	.mobile-filter-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 8px 16px;
		border-radius: 20px;
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 36px;
	}

	.mobile-filter-pill:hover {
		background-color: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.mobile-filter-pill.selected {
		background-color: #3b82f6;
		border-color: #3b82f6;
		color: white;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	}

	/* Themed Filter Pills (uses color classes from FilterDropdown) */
	.themed-filter-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px 16px;
		border-radius: 12px;
		border: 2px solid transparent;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		min-height: 40px;
		opacity: 0.7;
	}

	.themed-filter-pill:hover {
		opacity: 0.85;
		transform: translateY(-1px);
	}

	.themed-filter-pill.selected {
		opacity: 1;
		border-color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		transform: scale(1.02);
	}

	.mobile-sort-options {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px 0;
	}

	.mobile-sort-options :global(.ratings-sort) {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 6px;
		width: 100%;
	}

	.mobile-sort-options :global(.sort-button) {
		flex-shrink: 0;
		padding: 6px 8px;
		font-size: 0.8rem;
	}

	.mobile-sort-options :global(.sort-field-label) {
		font-size: 0.75rem;
	}

	.mobile-sort-options :global(.sort-icon) {
		width: 16px;
		height: 16px;
	}

	.mobile-filters-footer {
		background-color: var(--color-surface);
		padding: 16px;
		gap: 12px;
	}

	.mobile-reset-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 16px;
		border: 1px solid var(--color-border);
		background-color: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.mobile-reset-button:hover {
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		border-color: var(--color-text-secondary);
	}

	.mobile-apply-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px 24px;
		border: none;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		cursor: pointer;
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	}

	.mobile-apply-button:hover {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
		transform: translateY(-1px);
	}

	.mobile-apply-button:active {
		transform: translateY(0);
	}

	/* Filter Category Buttons */
	.mobile-filter-categories {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		justify-content: center;
	}

	.mobile-filter-category-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		border-radius: 12px;
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 48px;
	}

	.mobile-filter-category-btn:hover {
		background-color: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.3);
		transform: translateY(-1px);
	}

	.mobile-filter-category-btn.has-selection {
		background-color: rgba(59, 130, 246, 0.15);
		border-color: #3b82f6;
		color: #60a5fa;
	}

	.category-icon {
		font-size: 1.1rem;
	}

	.category-label {
		font-weight: 500;
	}

	.category-count {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: 10px;
		background-color: #3b82f6;
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
	}

	/* Filter Options Popup */
	.filter-popup-overlay {
		animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.filter-popup-content {
		position: relative;
		z-index: 1;
		width: calc(100% - 32px);
		max-width: 350px;
		max-height: 80vh;
		background-color: var(--color-background);
		border-radius: 16px;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		animation: popupSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes popupSlideIn {
		from {
			opacity: 0;
			transform: scale(0.85) translateY(30px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* iOS/Android friendly slide-up animation for container */
	.mobile-filters-container {
		animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.filter-popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.filter-popup-header-actions {
		display: flex;
		gap: 8px;
	}

	.popup-icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.popup-icon-btn.reset {
		background-color: rgba(255, 255, 255, 0.08);
		color: var(--color-text-secondary);
	}

	:global(.light) .popup-icon-btn.reset {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.popup-icon-btn.reset:hover {
		background-color: rgba(255, 255, 255, 0.15);
		color: var(--color-text-primary);
	}

	:global(.light) .popup-icon-btn.reset:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.popup-icon-btn.accept {
		background-color: #22c55e;
		color: white;
	}

	.popup-icon-btn.accept:hover {
		background-color: #16a34a;
		transform: scale(1.05);
	}

	.filter-popup-title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.filter-popup-options {
		padding: 16px;
		max-height: 50vh;
		overflow-y: auto;
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}

	.filter-popup-footer {
		display: flex;
		gap: 12px;
		padding: 16px;
		border-top: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.filter-popup-reset {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px 16px;
		border: 1px solid var(--color-border);
		background-color: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 10px;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.filter-popup-reset:hover {
		background-color: var(--color-surface);
		color: var(--color-text-primary);
	}

	.filter-popup-accept {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px 16px;
		border: none;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		cursor: pointer;
		border-radius: 10px;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	}

	.filter-popup-accept:hover {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	}

	/* Desktop Collapsible Filter Toggle Styles */
	.filter-toggle-container {
		display: flex;
		justify-content: center;
		padding: 0.75rem 0;
	}

	.filter-toggle-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-toggle-button:hover {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		transform: translateY(-1px);
	}

	.filter-toggle-text {
		user-select: none;
	}

	.filter-toggle-button :global(.filter-toggle-icon) {
		transition: transform 0.3s ease;
	}

	.filter-content {
		animation: filterExpandCollapse 0.3s ease;
		transform-origin: top;
	}

	@keyframes filterExpandCollapse {
		from {
			opacity: 0;
			transform: scaleY(0.95);
		}
		to {
			opacity: 1;
			transform: scaleY(1);
		}
	}
</style>
