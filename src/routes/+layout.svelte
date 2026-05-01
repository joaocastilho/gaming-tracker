<script lang="ts">
import { page } from '$app/state';
import { pushState, goto, replaceState, afterNavigate } from '$app/navigation';
import '../app.css';
import Header from '$lib/components/Header.svelte';
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
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';

let {
	children,
	data,
}: {
	children: import('svelte').Snippet;
	data: { games: Promise<Game[]> | Game[] };
} = $props();

import { editorStore } from '$lib/stores/editor.svelte';

let initialized = $state(true);
let gamesInitialized = $state(false);
let urlUpdateTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined);
let canInstall = $state(false);

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isBeforeInstallPromptEvent(event: Event | null): event is BeforeInstallPromptEvent {
	return event !== null && 'prompt' in event && 'userChoice' in event;
}

let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);

$effect(() => {
	if (gamesInitialized) return;
	if (data.games && Array.isArray(data.games)) {
		gamesStore.initializeGames(data.games);
		gamesInitialized = true;
	}
});

$effect.pre(() => {
	if (!browser) return;

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

$effect(() => {
	if (!browser) return;

	let lastScrollY = window.scrollY;
	let ticking = false;

	const handleScroll = () => {
		if (ticking) return;
		ticking = true;

		requestAnimationFrame(() => {
			const currentScrollY = window.scrollY;
			if (
				currentScrollY > 80 &&
				currentScrollY > lastScrollY &&
				filtersStore.isDesktopFiltersExpanded &&
				!filtersStore.isAnyFilterApplied()
			) {
				filtersStore.setDesktopFiltersExpanded(false);
			}
			lastScrollY = currentScrollY;
			ticking = false;
		});
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
				updateViaCache: 'none',
			})
			.then((registration) => {
				const checkForUpdates = () => {
					if (isPaused || document.hidden) return;

					if (registration.installing === null && registration.waiting === null && registration.active !== null) {
						registration.update().catch(() => {});
					}
				};

				intervalId = setInterval(checkForUpdates, 60000);

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

let filterOptions = $derived.by(() => {
	const games = $gamesStore;
	if (!games || games.length === 0) {
		return { platforms: [], genres: [], tiers: [], coOp: [] };
	}
	return extractFilterOptions(games);
});

let currentPage = $derived.by(() => {
	const path = page.url.pathname;
	if (path === '/completed') return 'completed';
	if (path === '/planned') return 'planned';
	if (path === '/tierlist') return 'tierlist';
	return 'all';
});

let currentFilteredGames = $derived(filteredGamesStore.games);

let canonicalUrl = $derived(page.url.pathname);

let isGamesPage = $derived(currentPage === 'all' || currentPage === 'completed' || currentPage === 'planned');

let isPlannedPage = $derived(currentPage === 'planned');

let isTierlistPage = $derived(currentPage === 'tierlist');

let pageTitle = $derived.by(() => {
	const path = page.url.pathname;
	if (path === '/completed') return 'Completed Games';
	if (path === '/planned') return 'Planned Games';
	if (path === '/tierlist') return 'Tier List';
	if (path === '/login') return 'Login';
	return 'Gaming Tracker';
});

let showTiersFilter = $derived(!isPlannedPage);
let showCoOpFilter = true;

$effect(() => {
	if (browser) {
		void $filtersStore;
		untrack(() => filtersStore.writeSearchToURL(page.state));
	}
});

$effect(() => {
	if (browser) {
		const searchParams = page.url.searchParams;
		void $gamesStore;

		untrack(() => {
			filtersStore.readSearchFromURL(searchParams, page.url.pathname);
			if (filtersStore.isAnyFilterApplied() && innerWidth >= 768) {
				filtersStore.setDesktopFiltersExpanded(true);
			}
		});

		if (filtersStore.isAnyFilterApplied() && innerWidth >= 768) {
			filtersStore.setDesktopFiltersExpanded(true);
		}
	}
});

let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
let resizeTicking = false;

$effect(() => {
	if (!browser) return;
	const handleResize = () => {
		if (resizeTicking) return;
		resizeTicking = true;

		requestAnimationFrame(() => {
			innerWidth = window.innerWidth;
			resizeTicking = false;
		});
	};
	window.addEventListener('resize', handleResize);
	return () => window.removeEventListener('resize', handleResize);
});

$effect(() => {
	if (browser && innerWidth >= 768) {
		if (filtersStore.isAnyFilterApplied()) {
			filtersStore.setDesktopFiltersExpanded(true);
		}
	}
});

$effect(() => {
	if (initialized) {
		if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
	}
});

$effect(() => {
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

$effect(() => {
	const games = $gamesStore;
	if (games.length > 0) {
		modalStore.readFromURL(page.url.searchParams, games);
	}
});

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

let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);

// biome-ignore lint/suspicious/noExplicitAny: Dynamic component types require 'any' to be compatible with multiple component signatures
type AnyComponent = import('svelte').Component<any, any, any>;

let DetailModalComponent = $state<AnyComponent | null>(null);
let GameEditorModalComponent = $state<AnyComponent | null>(null);
let DeleteConfirmModalComponent = $state<AnyComponent | null>(null);
let LoginModalComponent = $state<AnyComponent | null>(null);
let MobileSearchComponent = $state<AnyComponent | null>(null);
let MobileFiltersComponent = $state<AnyComponent | null>(null);
let MobileSettingsMenuComponent = $state<AnyComponent | null>(null);

let TierListViewComponent = $state<AnyComponent | null>(null);
let NoResultsComponent = $state<AnyComponent | null>(null);
let SearchBarComponent = $state<AnyComponent | null>(null);
let FilterDropdownComponent = $state<AnyComponent | null>(null);
let FilterToggleComponent = $state<AnyComponent | null>(null);
let RatingsSortComponent = $state<AnyComponent | null>(null);

let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());

$effect(() => {
	if (!browser) return;

	if ($modalStore.isOpen && !DetailModalComponent) {
		import('$lib/components/DetailModal.svelte').then((m) => (DetailModalComponent = m.default));
	}
	if (editorModalOpen && !GameEditorModalComponent) {
		import('$lib/components/GameEditorModal.svelte').then((m) => (GameEditorModalComponent = m.default));
	}
	if (deleteModalOpen && !DeleteConfirmModalComponent) {
		import('$lib/components/DeleteConfirmModal.svelte').then((m) => (DeleteConfirmModalComponent = m.default));
	}
	if (loginModalOpen && !LoginModalComponent) {
		import('$lib/components/LoginModal.svelte').then((m) => (LoginModalComponent = m.default));
	}
	if (isSearchOpen && !MobileSearchComponent) {
		import('$lib/components/layout/MobileSearch.svelte').then((m) => (MobileSearchComponent = m.default));
	}
	if (isFiltersOpen && !MobileFiltersComponent) {
		import('$lib/components/MobileFilters.svelte').then((m) => (MobileFiltersComponent = m.default));
	}
	if (browser && !MobileSettingsMenuComponent) {
		import('$lib/components/layout/MobileSettingsMenu.svelte').then((m) => (MobileSettingsMenuComponent = m.default));
	}

	if (isTierlistPage && !TierListViewComponent) {
		import('$lib/views/TierListView.svelte').then((m) => (TierListViewComponent = m.default));
	}

	if (hasActiveFilters && currentFilteredGames.length === 0 && !NoResultsComponent) {
		import('$lib/components/NoResults.svelte').then((m) => (NoResultsComponent = m.default));
	}

	if (filtersStore.isDesktopFiltersExpanded && innerWidth >= 768) {
		if (!SearchBarComponent) import('$lib/components/SearchBar.svelte').then((m) => (SearchBarComponent = m.default));
		if (!FilterDropdownComponent)
			import('$lib/components/FilterDropdown.svelte').then((m) => (FilterDropdownComponent = m.default));
		if (!FilterToggleComponent)
			import('$lib/components/FilterToggle.svelte').then((m) => (FilterToggleComponent = m.default));
		if (!RatingsSortComponent)
			import('$lib/components/RatingsSort.svelte').then((m) => (RatingsSortComponent = m.default));
	}
});

let savedScrollPosition = $state<number>(0);

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
		if (browser && innerWidth < 768) {
			savedScrollPosition = window.scrollY;
		}

		if (currentPage === 'tierlist') {
			pushState(page.url, { showMobileSearch: true, fromTierlist: true });
			isFiltersOpen = false;
			return;
		}

		pushState(page.url, { showMobileSearch: true });
		isFiltersOpen = false;
	}
}

function onFiltersToggle() {
	isFiltersOpen = !isFiltersOpen;
	if (isFiltersOpen) {
		if (isSearchOpen) history.back();
	}
}

function onCloseSearchAndFilters() {
	if (isSearchOpen) history.back();
	isFiltersOpen = false;
}

$effect(() => {
	if (!browser) return;

	const handleGlobalKeydown = (event: KeyboardEvent) => {
		const isMac = navigator.platform.toLowerCase().includes('mac');
		const modifierCheck = isMac ? event.metaKey || event.ctrlKey : event.ctrlKey || event.metaKey;

		if (event.key === '/' && modifierCheck) {
			event.preventDefault();

			if (innerWidth < 768) {
				if (!isSearchOpen) {
					onSearchToggle();
				}
				requestAnimationFrame(() => {
					const input = document.querySelector('.mobile-search-input') as HTMLInputElement;
					input?.focus();
					input?.select();
				});
			} else {
				filtersStore.toggleDesktopFiltersExpanded();
				requestAnimationFrame(() => {
					const input = document.getElementById('search-input') as HTMLInputElement;
					input?.focus();
					input?.select();
				});
			}
			return;
		}
	};

	window.addEventListener('keydown', handleGlobalKeydown);
	return () => {
		window.removeEventListener('keydown', handleGlobalKeydown);
	};
});

let wasSearchOpen = false;
$effect(() => {
	if (isSearchOpen) {
		wasSearchOpen = true;
	} else if (wasSearchOpen) {
		wasSearchOpen = false;

		filtersStore.setSearchTerm('');

		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.delete('s');
			replaceState(url.toString(), page.state);
		}

		if (browser && innerWidth < 768) {
			requestAnimationFrame(() => {
				window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
			});
		}
	}
});

let lastSearchTerm = '';
let lastActiveTab = '';
$effect(() => {
	if (!browser || !isSearchOpen) return;

	const searchTerm = $filtersStore?.searchTerm ?? '';
	const currentTab = currentPage;
	const counts = filteredCountsStore.counts;
	const currentCount = currentFilteredGames.length;

	if (searchTerm && searchTerm !== lastSearchTerm && currentTab === lastActiveTab) {
		if (currentCount === 0) {
			const searchParam = searchTerm ? `?s=${encodeURIComponent(searchTerm)}` : '';

			if (currentTab === 'tierlist') {
				if (counts.completed > 0) {
					goto(`/completed${searchParam}`, {
						keepFocus: true,
						noScroll: true,
						replaceState: true,
						state: { showMobileSearch: true },
					});
				} else if (counts.planned > 0) {
					goto(`/planned${searchParam}`, {
						keepFocus: true,
						noScroll: true,
						replaceState: true,
						state: { showMobileSearch: true },
					});
				}
			} else if (currentTab === 'planned' && counts.completed > 0) {
				goto(`/completed${searchParam}`, {
					keepFocus: true,
					noScroll: true,
					replaceState: true,
					state: { showMobileSearch: true },
				});
			} else if (currentTab === 'completed' && counts.planned > 0) {
				goto(`/planned${searchParam}`, {
					keepFocus: true,
					noScroll: true,
					replaceState: true,
					state: { showMobileSearch: true },
				});
			}
		}
	}

	lastSearchTerm = searchTerm;
	lastActiveTab = currentTab;
});

function openModalWithFilterContext(game: Game, contextGames?: Game[]) {
	modalStore.openViewModal(game, contextGames ?? currentFilteredGames);
}

let canReset = $derived(hasActiveFilters || filtersStore.isSortModified());

afterNavigate(({ from }) => {
	if (!from) {
		const searchParams = new URLSearchParams(window.location.search);
		const searchParam = searchParams.get('s');
		if (searchParam && innerWidth < 768) {
			try {
				replaceState(window.location.href, { ...page.state, showMobileSearch: true });
			} catch {}
		}
	}
});

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

let editorInitialized = $state(false);
$effect.pre(() => {
	if (!browser || editorInitialized) return;
	editorInitialized = true;
	editorStore.restoreFromSession();

	untrack(() => {
		if (editorStore.editorMode && !dev) {
			editorStore.checkSession();
		}
	});
});

$effect(() => {
	if (!browser) return;

	const handleBeforeInstallPrompt = (e: Event) => {
		e.preventDefault();
		if (isBeforeInstallPromptEvent(e)) {
			deferredPrompt = e;
			canInstall = true;
		}
	};

	window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

	return () => {
		window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
	};
});

async function installApp() {
	if (!deferredPrompt) return;

	await deferredPrompt.prompt();
	const { outcome } = await deferredPrompt.userChoice;

	if (outcome === 'accepted') {
		deferredPrompt = null;
		canInstall = false;
	}
}
</script>

<svelte:head>
	<title>{pageTitle === 'Gaming Tracker' ? 'Gaming Tracker' : `Gaming Tracker - ${pageTitle}`}</title>
	<meta name="theme-color" content={appStore.theme === 'dark' ? '#0a0c10' : '#d0cbc4'} />
	<meta property="og:title" content="Gaming Tracker" />
	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content="My personal video game collection with ratings, tier lists, and progress tracking."
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:site_name" content="Gaming Tracker" />
	<meta property="og:image" content={page.url.origin + '/android-chrome-512x512.png'} />
	<meta property="og:image:width" content="512" />
	<meta property="og:image:height" content="512" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Gaming Tracker" />
	<meta
		name="twitter:description"
		content="My personal video game collection with ratings, tier lists, and progress tracking."
	/>
	<meta name="twitter:image" content={page.url.origin + '/android-chrome-512x512.png'} />
	<link rel="canonical" href={canonicalUrl} />
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
				<!-- Filters are shown on desktop via FilterDropdowns -->
				{#if filtersStore.isDesktopFiltersExpanded}
						<div class="filter-content mb-8 space-y-4">
							{#if SearchBarComponent}
								<SearchBarComponent />
							{/if}
							<div class="flex flex-col items-center gap-4">
								<div class="flex flex-wrap items-center justify-center gap-3">
									{#if FilterDropdownComponent}
										<FilterDropdownComponent
											type="platforms"
											label="Platforms"
											options={filterOptions.platforms}
											selectedOptions={selectedPlatforms}
										/>
										<FilterDropdownComponent
											type="genres"
											label="Genres"
											options={filterOptions.genres}
											selectedOptions={selectedGenres}
										/>
										{#if showTiersFilter}
											<FilterDropdownComponent
												type="tiers"
												label="Tiers"
												options={filterOptions.tiers}
												selectedOptions={selectedTiers}
											/>
										{/if}
									{/if}

									{#if showCoOpFilter && FilterToggleComponent}
										<FilterToggleComponent
											label="Co-op"
											value="Yes"
											isSelected={selectedCoOp.includes('Yes')}
										/>
									{/if}
									<span class="pipe-separator">|</span>
									{#if RatingsSortComponent}
										<RatingsSortComponent />
									{/if}
									<button
										class="reset-button flex h-[44px] w-[44px] items-center justify-center rounded-md transition-all"
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
					{#if hasActiveFilters && currentFilteredGames.length === 0}
						{#if NoResultsComponent}
							<NoResultsComponent onReset={resetFilters} />
						{/if}
					{:else}
						<GamesView
							filteredGames={currentFilteredGames}
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
					{#if TierListViewComponent}
						<TierListViewComponent filteredGames={currentFilteredGames} onOpenModal={openModalWithFilterContext} />
					{:else}
						<div class="flex items-center justify-center p-12">
							<div class="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
						</div>
					{/if}

					<div style="display: none;">
						{@render children?.()}
					</div>
				{:else}
					{@render children?.()}
				{/if}
			</div>
		</main>

		{#if DetailModalComponent}
			<DetailModalComponent onEditGame={handleEditGame} onDeleteGame={handleDeleteGame} />
		{/if}

		{#if editorModalOpen && GameEditorModalComponent}
			<GameEditorModalComponent
				mode={editorModalMode}
				initialGame={editorModalGame}
				allGames={$gamesStore}
				onClose={handleEditorClose}
			/>
		{/if}

		{#if DeleteConfirmModalComponent}
			<DeleteConfirmModalComponent bind:open={deleteModalOpen} game={deleteModalGame} />
		{/if}

		{#if LoginModalComponent}
			<LoginModalComponent bind:open={loginModalOpen} />
		{/if}

		{#if MobileSearchComponent}
			<MobileSearchComponent isOpen={isSearchOpen} onClose={onCloseSearchAndFilters} />
		{/if}

		<!-- Mobile Filters Modal -->
		{#if MobileFiltersComponent}
			<MobileFiltersComponent
				bind:isOpen={isFiltersOpen}
				{filterOptions}
				{showTiersFilter}
				{showCoOpFilter}
				onClose={() => (isFiltersOpen = false)}
			/>
		{/if}

		{#if MobileSettingsMenuComponent}
			<MobileSettingsMenuComponent
				isOpen={isSettingsMenuOpen}
				{isTierlistPage}
				onToggle={() => (isSettingsMenuOpen = !isSettingsMenuOpen)}
				onClose={() => (isSettingsMenuOpen = false)}
				{onFiltersToggle}
				onAddGame={handleAddGame}
				onOpenLogin={() => (loginModalOpen = true)}
				{canInstall}
				onInstall={installApp}
			/>
		{/if}

		<!-- Discreet Last Updated Indicator -->
		<!-- Removed build date display - now only in source code at top -->

		<BottomNavigation {onSearchToggle} />
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
		color: var(--color-accent);
		background-color: rgba(99, 102, 241, 0.08);
		border: 1px solid var(--color-accent);
		font-size: 0.85rem;
		cursor: pointer;
		transform: translateY(-1px);
	}

	.reset-button:hover {
		background-color: rgba(99, 102, 241, 0.12);
		transform: translateY(-2px);
		box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
	}

	:global(.light) .reset-button {
		background-color: rgba(234, 88, 12, 0.08);
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	:global(.light) .reset-button:hover {
		background-color: rgba(234, 88, 12, 0.12);
	}

	/* Push content below the fixed search bar when search is open */
	:global(main.search-open-mobile) {
		padding-top: 75px !important;
	}
</style>
