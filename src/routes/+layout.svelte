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
	import { RotateCcw, SlidersHorizontal, Settings, Moon, LogIn, LogOut, Plus } from 'lucide-svelte';

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
	import MobileFilters from '$lib/components/MobileFilters.svelte';

	import DetailModal from '$lib/components/DetailModal.svelte';
	import GameEditorModal from '$lib/components/GameEditorModal.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';

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
		gamesStore.loadFromIDB();

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

		// Auto-collapse filters on scroll (desktop only)
		let lastScrollY = window.scrollY;
		const handleScroll = () => {
			if (window.innerWidth < 768) return; // Skip on mobile
			const currentScrollY = window.scrollY;
			// Collapse filters when scrolling down past 80px
			if (
				currentScrollY > 80 &&
				currentScrollY > lastScrollY &&
				filtersStore.isDesktopFiltersExpanded
			) {
				filtersStore.setDesktopFiltersExpanded(false);
			}
			lastScrollY = currentScrollY;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	$effect(() => {
		if (browser && 'serviceWorker' in navigator) {
			const swPath = '/service-worker.js';
			let intervalId: any;

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

					intervalId = setInterval(checkForUpdates, 60000);
				})
				.catch(() => {});

			return () => {
				if (intervalId) clearInterval(intervalId);
			};
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
				return;
			}

			// Only update if URL search differs from current state to avoid loops
			if (searchParam !== currentSearchTerm) {
				if (searchParam) {
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
	let isSettingsMenuOpen = $state(false);
	let loginModalOpen = $state(false);
	let isEditor = $derived(editorStore.editorMode);

	// Desktop filters expanded state moved to filtersStore
	let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);

	let searchInput = $state<HTMLInputElement | null>(null);
	let savedScrollPosition = $state<number>(0);

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
		filtersStore.setSort(null);

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

			// Tier list is not searchable - open search overlay first
			// When user starts typing, we'll redirect to Games page
			const currentTab = appStore.activeTab;
			if (currentTab === 'tierlist') {
				// Just open search, no redirect yet - redirect happens when typing
				pushState(page.url, { showMobileSearch: true, fromTierlist: true });
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
	let canReset = $derived(hasActiveFilters || filtersStore.isSortModified());

	// Handle mobile search input with debounce
	let mobileSearchDebounceTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

	function handleMobileSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;

		if (mobileSearchDebounceTimeout) {
			clearTimeout(mobileSearchDebounceTimeout);
		}

		mobileSearchDebounceTimeout = setTimeout(() => {
			// Check if we're searching from tierlist and user started typing
			const isFromTierlist = (page.state as any)?.fromTierlist;
			if (isFromTierlist && newValue && appStore.activeTab === 'tierlist') {
				// Redirect to Games page with search term
				const searchParam = `?s=${encodeURIComponent(newValue)}`;
				goto(`/${searchParam}`, {
					keepFocus: true,
					noScroll: true,
					state: { showMobileSearch: true }
				});
				return;
			}

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

	let editorModalOpen = $state(false);
	let editorModalMode = $state<'create' | 'edit'>('create');
	let editorModalGame = $state<Game | null>(null);
	let deleteModalOpen = $state(false);
	let deleteModalGame = $state<Game | null>(null);

	function handleAddGame() {
		editorModalMode = 'create';
		editorModalGame = null;
		editorModalOpen = true;
	}

	function handleEditGame(game: Game) {
		editorModalMode = 'edit';
		editorModalGame = game;
		editorModalOpen = true;
	}

	function handleDeleteGame(game: Game) {
		deleteModalGame = game;
		deleteModalOpen = true;
	}

	function handleEditorClose() {
		editorModalOpen = false;
		editorModalGame = null;
	}

	async function handleApplyChanges() {
		const games = $gamesStore;
		const finalGames = editorStore.buildFinalGames(games);

		const success = await editorStore.applyAllChanges(games);
		if (success) {
			gamesStore.setAllGames(finalGames);
		}
	}

	onMount(() => {
		if (browser) {
			editorStore.restoreFromSession();

			if (editorStore.editorMode && !dev) {
				editorStore.checkSession();
			}
		}
	});
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
		<Header onAddGame={handleAddGame} onApplyChanges={handleApplyChanges} />
		<section class="filter-section top-[104px] z-30 hidden md:top-[110px] md:block">
			<div class="container mx-auto px-6">
				{#if !isTierlistPage}
					<!-- Filter toggle moved to Header.svelte -->

					<!-- Collapsible filter content -->
					{#if filtersStore.isDesktopFiltersExpanded}
						<div class="filter-content mb-8 space-y-4">
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
										class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex h-[44px] w-[44px] items-center justify-center rounded-md transition-colors"
										class:invisible={!canReset}
										title="Reset all filters"
										onclick={resetFilters}
									>
										<RotateCcw size={18} />
									</button>
								</div>
							</div>
						</div>
					{/if}
				{/if}
			</div>
		</section>

		<main
			class="bg-[var(--color-background)] px-2 pt-0 pb-6 md:px-6"
			class:search-open-mobile={isSearchOpen}
		>
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
								class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex h-[44px] w-[44px] items-center justify-center rounded-md transition-colors"
								type="button"
								onclick={resetFilters}
								title="Reset all filters"
							>
								<RotateCcw size={18} />
							</button>
						</div>
					{:else}
						<GamesView
							filteredGames={$filteredGames}
							onOpenModal={openModalWithFilterContext}
							onEditGame={handleEditGame}
							onDeleteGame={handleDeleteGame}
						/>
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
								class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex h-[44px] w-[44px] items-center justify-center rounded-md transition-colors"
								type="button"
								onclick={resetFilters}
								title="Reset all filters"
							>
								<RotateCcw size={18} />
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

		<DetailModal onEditGame={handleEditGame} onDeleteGame={handleDeleteGame} />

		{#if editorModalOpen}
			<GameEditorModal
				mode={editorModalMode}
				initialGame={editorModalGame}
				allGames={$gamesStore}
				onClose={handleEditorClose}
			/>
		{/if}

		<DeleteConfirmModal bind:open={deleteModalOpen} game={deleteModalGame} />

		<LoginModal bind:open={loginModalOpen} />

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
		<MobileFilters
			bind:isOpen={isFiltersOpen}
			{filterOptions}
			{showTiersFilter}
			{showCoOpFilter}
			onClose={() => (isFiltersOpen = false)}
		/>

		<!-- Mobile Settings Menu -->
		{#if !$modalStore.isOpen && !isFiltersOpen}
			<div class="mobile-settings-container md:hidden">
				<!-- Filter button - prominent, always visible (not on tierlist) -->
				{#if !isTierlistPage}
					<button
						type="button"
						class="floating-action-button filter-fab"
						onclick={onFiltersToggle}
						aria-label="Open filters"
						title="Filters"
					>
						<SlidersHorizontal size={20} />
					</button>
				{/if}

				<!-- Main Settings FAB -->
				<button
					type="button"
					class="floating-action-button settings-fab"
					class:active={isSettingsMenuOpen}
					onclick={() => (isSettingsMenuOpen = !isSettingsMenuOpen)}
					aria-label={isSettingsMenuOpen ? 'Close settings' : 'Open settings'}
					aria-expanded={isSettingsMenuOpen}
					title="Settings"
				>
					<Settings size={20} class="settings-icon" />
				</button>
			</div>
		{/if}

		<!-- Settings Bottom Sheet -->
		{#if isSettingsMenuOpen}
			<div
				class="settings-bottom-sheet-overlay md:hidden"
				onclick={() => (isSettingsMenuOpen = false)}
				onkeydown={(e) => e.key === 'Escape' && (isSettingsMenuOpen = false)}
				role="button"
				tabindex="0"
			>
				<div
					class="settings-bottom-sheet"
					onclick={(e) => e.stopPropagation()}
					onkeydown={() => {}}
					role="dialog"
					aria-modal="true"
					tabindex="-1"
				>
					<div class="sheet-handle"></div>
					<div class="sheet-content">
						<button
							type="button"
							class="sheet-item"
							onclick={() => {
								appStore.toggleTheme();
								isSettingsMenuOpen = false;
							}}
						>
							<Moon size={20} />
							<span>{appStore.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
						</button>

						{#if isEditor && !isTierlistPage}
							<button
								type="button"
								class="sheet-item sheet-item-green"
								onclick={() => {
									isSettingsMenuOpen = false;
									handleAddGame();
								}}
							>
								<Plus size={20} />
								<span>Add Game</span>
							</button>
						{/if}

						{#if isEditor}
							<button
								type="button"
								class="sheet-item sheet-item-red"
								onclick={async () => {
									isSettingsMenuOpen = false;
									await editorStore.logout();
								}}
							>
								<LogOut size={20} />
								<span>Logout</span>
							</button>
						{:else}
							<button
								type="button"
								class="sheet-item sheet-item-blue"
								onclick={() => {
									isSettingsMenuOpen = false;
									loginModalOpen = true;
								}}
							>
								<LogIn size={20} />
								<span>Login</span>
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<BottomNavigation {onSearchToggle} {onCloseSearchAndFilters} />
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
		padding: 12px 16px;
		padding-top: calc(12px + env(safe-area-inset-top, 0px));
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	/* Push content below the fixed search bar when search is open */
	:global(main.search-open-mobile) {
		padding-top: 75px !important;
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

	/* Mobile Settings Menu */
	.mobile-settings-container {
		position: fixed;
		right: 16px;
		bottom: 70px;
		z-index: 45;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	@media (min-width: 768px) {
		.mobile-settings-container {
			display: none;
		}
	}

	.floating-action-button {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		outline: none;
	}

	.floating-action-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
	}

	.floating-action-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}

	.floating-action-button:focus {
		outline: none;
	}

	/* Settings FAB */
	.settings-fab {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		border: none;
		color: white;
		opacity: 0.7;
	}

	.settings-fab:hover {
		background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
		opacity: 0.9;
	}

	.settings-fab.active {
		background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
		opacity: 0.9;
	}

	/* Light theme variations for settings FAB */
	:global(.light) .settings-fab {
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		opacity: 0.7;
	}

	:global(.light) .settings-fab:hover {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
		opacity: 0.9;
	}

	:global(.light) .settings-fab.active {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
	}

	.settings-fab :global(.settings-icon) {
		transition: transform 0.2s ease;
	}

	.settings-fab.active :global(.settings-icon) {
		transform: rotate(90deg);
	}

	/* Filter FAB */
	.filter-fab {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border: none;
		color: white;
	}

	.filter-fab:hover {
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
		box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
	}

	:global(.light) .filter-fab {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
	}

	:global(.light) .filter-fab:hover {
		background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
	}

	/* Settings Bottom Sheet */
	.settings-bottom-sheet-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		animation: fadeIn 0.15s ease-out;
	}

	.settings-bottom-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-background);
		border-radius: 20px 20px 0 0;
		padding: 8px 16px 24px;
		padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
		animation: slideUp 0.2s cubic-bezier(0.32, 0.72, 0, 1);
		z-index: 61;
		box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
	}

	.sheet-handle {
		width: 36px;
		height: 4px;
		background-color: var(--color-border);
		border-radius: 2px;
		margin: 8px auto 16px;
	}

	.sheet-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.sheet-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: 12px;
		border: none;
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.12s ease-out;
		text-align: left;
	}

	.sheet-item:hover {
		background-color: rgba(59, 130, 246, 0.1);
	}

	.sheet-item:active {
		transform: scale(0.98);
	}

	.sheet-item-green {
		color: #22c55e;
	}

	.sheet-item-green:hover {
		background-color: rgba(34, 197, 94, 0.1);
	}

	.sheet-item-red {
		color: #ef4444;
	}

	.sheet-item-red:hover {
		background-color: rgba(239, 68, 68, 0.1);
	}

	.sheet-item-blue {
		color: #3b82f6;
	}

	.sheet-item-blue:hover {
		background-color: rgba(59, 130, 246, 0.15);
	}

	@media (max-width: 480px) {
		.mobile-settings-container {
			right: 16px;
			bottom: 74px;
		}

		.floating-action-button {
			width: 44px;
			height: 44px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.floating-action-button,
		.settings-bottom-sheet,
		.settings-bottom-sheet-overlay {
			transition: none;
			animation: none;
		}
	}
</style>
