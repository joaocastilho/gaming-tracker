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
	import { untrack } from 'svelte';
	import type { Game } from '$lib/types/game.js';
	import { RotateCcw } from 'lucide-svelte';

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
	import MobileSearch from '$lib/components/layout/MobileSearch.svelte';
	import MobileSettingsMenu from '$lib/components/layout/MobileSettingsMenu.svelte';

	import DetailModal from '$lib/components/DetailModal.svelte';
	import GameEditorModal from '$lib/components/GameEditorModal.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import NoResults from '$lib/components/NoResults.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';

	let initialized = $state(true);
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

	// Effect for one-time initialization (replaces onMount)
	$effect.pre(() => {
		if (!browser) return;

		// Load from IDB and handle promise-based games data
		gamesStore.loadFromIDB();

		if (data.games && data.games instanceof Promise) {
			data.games
				.then((resolvedGames) => {
					gamesStore.initializeGames(resolvedGames);
					gamesInitialized = true;
				})
				.catch((error) => {
					console.error('Failed to load games:', error);
				});
		}
	});

	// Effect for scroll-based filter collapse (desktop only)
	$effect(() => {
		if (!browser) return;

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
			let intervalId: ReturnType<typeof setInterval> | null = null;
			let isPaused = false;
			let visibilityHandler: (() => void) | null = null;

			navigator.serviceWorker
				.register(swPath, {
					updateViaCache: 'none'
				})
				.then((registration) => {
					const checkForUpdates = () => {
						// Skip update check if tab is hidden to save battery/CPU
						if (isPaused || document.hidden) return;

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

					// Handle page visibility changes to pause/resume polling
					visibilityHandler = () => {
						if (document.hidden) {
							isPaused = true;
						} else {
							isPaused = false;
						}
					};

					document.addEventListener('visibilitychange', visibilityHandler);
				})
				.catch(() => {});

			return () => {
				if (intervalId) clearInterval(intervalId);
				if (visibilityHandler) {
					document.removeEventListener('visibilitychange', visibilityHandler);
				}
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
	let pageTitle = $derived.by(() => {
		const path = page.url.pathname;
		if (path === '/completed') return 'Completed Games';
		if (path === '/planned') return 'Planned Games';
		if (path === '/tierlist') return 'Tier List';
		if (path === '/login') return 'Login';
		return 'All Games';
	});

	let isPlannedPage = $derived(page.url.pathname === '/planned');

	let showTiersFilter = $derived(!isTierlistPage && !isPlannedPage);
	let showCoOpFilter = $derived(!isTierlistPage);

	// Sync Store to URL whenever state changes
	$effect(() => {
		if (browser) {
			void $filtersStore;
			untrack(() => filtersStore.writeSearchToURL({}));
		}
	});

	$effect(() => {
		if (browser) {
			// Trigger on URL change OR when games are initialized/loaded
			const searchParams = page.url.searchParams;
			void $gamesStore;

			// Restore state from URL on navigation
			// Use untrack so manual state changes don't trigger an immediate clobbering restoration
			untrack(() => {
				filtersStore.readSearchFromURL(searchParams, page.url.pathname);
			});

			// Auto-open mobile search if URL has search parameter
			const searchParam = searchParams.get('s');
			if (searchParam && window.innerWidth < 768 && !isSearchOpen) {
				pushState(page.url, { showMobileSearch: true });
			}
		}
	});

	$effect(() => {
		if (initialized) {
			if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
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

	let isSearchOpen = $derived(!!page.state.showMobileSearch);
	let isFiltersOpen = $state(false);
	let isSettingsMenuOpen = $state(false);
	let loginModalOpen = $state(false);

	// Desktop filters expanded state moved to filtersStore
	let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);

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

	// Initialize editor state once on mount
	let editorInitialized = $state(false);
	$effect.pre(() => {
		if (!browser || editorInitialized) return;
		editorInitialized = true;

		// Restore editor mode from session storage
		editorStore.restoreFromSession();

		// Check session validity if in editor mode (production only)
		untrack(() => {
			if (editorStore.editorMode && !dev) {
				editorStore.checkSession();
			}
		});
	});
</script>

<svelte:head>
	<title>{pageTitle} | Gaming Tracker</title>
	<meta name="theme-color" content={appStore.theme === 'dark' ? '#0a0c10' : '#d0cbc4'} />
	<meta property="og:title" content="{pageTitle} | Gaming Tracker" />
	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content="Track your gaming progress, completed games, and create tier lists."
	/>
	<meta property="og:url" content={page.url.origin + page.url.pathname} />
	<link rel="canonical" href={page.url.origin + page.url.pathname} />
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
			<div class="mx-auto px-6" style="max-width: 1800px;">
				{#if !isTierlistPage}
					<!-- Filters are shown on desktop via FilterDropdowns -->
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

		<a
			href="#main-content"
			class="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4"
		>
			Skip to main content
		</a>

		<main
			id="main-content"
			class="bg-[var(--color-background)] px-2 pt-0 pb-6 md:px-6"
			class:search-open-mobile={isSearchOpen}
		>
			<div class="mx-auto" style="max-width: 1800px;">
				{#if isGamesPage}
					{#if hasActiveFilters && $filteredGames.length === 0}
						<NoResults onReset={resetFilters} />
					{:else}
						<GamesView
							filteredGames={$filteredGames}
							onOpenModal={openModalWithFilterContext}
							onEditGame={handleEditGame}
							onDeleteGame={handleDeleteGame}
							loading={!gamesInitialized}
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

		<MobileSearch isOpen={isSearchOpen} onClose={onCloseSearchAndFilters} />

		<!-- Mobile Filters Modal -->
		<MobileFilters
			bind:isOpen={isFiltersOpen}
			{filterOptions}
			{showTiersFilter}
			{showCoOpFilter}
			onClose={() => (isFiltersOpen = false)}
		/>

		<MobileSettingsMenu
			isOpen={isSettingsMenuOpen}
			{isTierlistPage}
			onToggle={() => (isSettingsMenuOpen = !isSettingsMenuOpen)}
			onClose={() => (isSettingsMenuOpen = false)}
			{onFiltersToggle}
			onAddGame={handleAddGame}
			onOpenLogin={() => (loginModalOpen = true)}
		/>

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

	/* Push content below the fixed search bar when search is open */
	:global(main.search-open-mobile) {
		padding-top: 75px !important;
	}
</style>
