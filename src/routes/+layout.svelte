<script lang="ts">
import { page } from '$app/state';
import { goto, replaceState, afterNavigate } from '$app/navigation';
import '../app.css';
import Header from '$lib/components/Header.svelte';
import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
import BottomNavigation from '$lib/components/BottomNavigation.svelte';
import { extractFilterOptions } from '$lib/utils/filterOptions';
import { filtersStore } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { appStore, type TabValue } from '$lib/stores/app.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { browser, dev } from '$app/environment';
import { untrack } from 'svelte';
import type { Game } from '$lib/types/game.js';
import { RotateCcw } from '@lucide/svelte';
import { registerServiceWorker } from '$lib/utils/serviceWorker';
import { createGlobalKeydownHandler } from '$lib/utils/keyboardShortcuts';
import { editorModalState } from '$lib/stores/editorModalState.svelte';

import GamesView from '$lib/views/GamesView.svelte';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';

import DetailModal from '$lib/components/DetailModal.svelte';
import GameEditorModal from '$lib/components/GameEditorModal.svelte';
import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
import LoginModal from '$lib/components/LoginModal.svelte';
import MobileSearch from '$lib/components/layout/MobileSearch.svelte';
import MobileFilters from '$lib/components/MobileFilters.svelte';
import MobileSettingsMenu from '$lib/components/layout/MobileSettingsMenu.svelte';
import TierListView from '$lib/views/TierListView.svelte';
import NoResults from '$lib/components/NoResults.svelte';
import SearchBar from '$lib/components/SearchBar.svelte';
import FilterDropdown from '$lib/components/FilterDropdown.svelte';
import FilterToggle from '$lib/components/FilterToggle.svelte';
import RatingsSort from '$lib/components/RatingsSort.svelte';

let {
	children,
	data,
}: {
	children: import('svelte').Snippet;
	data: { games: Promise<Game[]> | Game[] };
} = $props();

import { editorStore } from '$lib/stores/editor.svelte';
import { windowSize } from '$lib/stores/window.svelte';

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

	setTimeout(() => {
		gamesStore.loadFromIDB();
	}, 0);

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

let lastScrollY = 0;
let scrollTicking = false;

const handleScroll = () => {
	if (scrollTicking) return;
	scrollTicking = true;

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
		scrollTicking = false;
	});
};

$effect(() => {
	if (!browser) return;
	return registerServiceWorker();
});

let filterOptions = $derived.by(() => {
	const games = gamesStore.games;
	if (!games || games.length === 0) {
		return { platforms: [], genres: [], tiers: [], coOp: [] };
	}
	return extractFilterOptions(games);
});

let currentPage = $derived.by(() => {
	const path = page.url.pathname;
	if (path === '/') return 'home';
	if (path === '/stats') return 'stats';
	if (path === '/library') return 'all';
	if (path === '/completed') return 'completed';
	if (path === '/planned') return 'planned';
	if (path === '/tierlist') return 'tierlist';
	return 'all';
});

let currentFilteredGames = $derived(filteredGamesStore.games);

let canonicalUrl = $derived(page.url.origin + page.url.pathname);

let isHomePage = $derived(currentPage === 'home');

let isGamesPage = $derived(currentPage === 'all' || currentPage === 'completed' || currentPage === 'planned');

let isPlannedPage = $derived(currentPage === 'planned');

let isTierlistPage = $derived(currentPage === 'tierlist');

let pageTitle = $derived.by(() => {
	const path = page.url.pathname;
	if (path === '/') return 'Home';
	if (path === '/stats') return 'Stats';
	if (path === '/library') return 'All Games';
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
		void filtersStore.state;
		untrack(() => filtersStore.writeSearchToURL(page.state));
	}
});

$effect(() => {
	if (browser) {
		const searchParams = page.url.searchParams;
		void gamesStore.games;

		untrack(() => {
			filtersStore.readSearchFromURL(searchParams, page.url.pathname);
			if (filtersStore.isAnyFilterApplied() && windowSize.width >= 768) {
				filtersStore.setDesktopFiltersExpanded(true);
			}
		});
	}
});

$effect(() => {
	if (browser && windowSize.width >= 768) {
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
	let targetTab: TabValue = 'all';

	if (pathname === '/') {
		targetTab = 'home';
	} else if (pathname === '/library') {
		targetTab = 'library';
	} else if (pathname === '/completed') {
		targetTab = 'completed';
	} else if (pathname === '/planned') {
		targetTab = 'planned';
	} else if (pathname === '/tierlist') {
		targetTab = 'tierlist';
	} else if (pathname === '/stats') {
		targetTab = 'stats';
	}

	appStore.setActiveTab(targetTab);
});

$effect(() => {
	const games = gamesStore.games;
	if (games.length > 0) {
		modalStore.readFromURL(page.url.searchParams, games);
	}
});

$effect(() => {
	const games = gamesStore.games;
	if (games.length > 0) {
		modalStore.openPendingGameFromURL(games);
	}
});

let selectedPlatforms = $derived(filtersStore.state?.platforms ?? []);
let selectedGenres = $derived(filtersStore.state?.genres ?? []);
let selectedTiers = $derived(filtersStore.state?.tiers ?? []);
let selectedCoOp = $derived(filtersStore.state?.coOp ?? []);

let isSearchOpen = $state(false);
let isFiltersOpen = $state(false);
let isSettingsMenuOpen = $state(false);
let loginModalOpen = $state(false);

let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);

let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());

let savedScrollPosition = $state<number>(0);

$effect(() => {
	if (browser && (isFiltersOpen || activeFilterPopup)) {
		document.body.classList.add('no-scroll');
		return () => {
			document.body.classList.remove('no-scroll');
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
		isSearchOpen = false;
		pushSearchState(false);
	} else {
		if (browser && innerWidth < 768) {
			savedScrollPosition = window.scrollY;
		}

		isSearchOpen = true;
		pushSearchState(true);
		isFiltersOpen = false;
	}
}

function onFiltersToggle() {
	isFiltersOpen = !isFiltersOpen;
	if (isFiltersOpen) {
		if (isSearchOpen) {
			isSearchOpen = false;
			pushSearchState(false);
		}
	}
}

function onCloseSearchAndFilters() {
	if (isSearchOpen) {
		isSearchOpen = false;
		pushSearchState(false);
	}
	isFiltersOpen = false;
}

let internalSearchChange = false;

function pushSearchState(open: boolean) {
	internalSearchChange = true;
	replaceState(page.url, { ...page.state, showMobileSearch: open });
}

$effect(() => {
	if (!browser) return;

	const handler = createGlobalKeydownHandler(() => ({
		isSearchOpen,
		currentPage,
		onSearchToggle,
		onDesktopSearch: () => {
			if (currentPage === 'home') {
				filtersStore.setDesktopFiltersExpanded(true);
				goto('/library', { state: { showMobileSearch: true } });
				return;
			}
			filtersStore.toggleDesktopFiltersExpanded();
			requestAnimationFrame(() => {
				const input = document.getElementById('search-input') as HTMLInputElement;
				input?.focus();
				input?.select();
			});
		},
	}));

	window.addEventListener('keydown', handler);
	return () => {
		window.removeEventListener('keydown', handler);
	};
});

$effect(() => {
	if (internalSearchChange) {
		internalSearchChange = false;
		return;
	}
	if (page.state.showMobileSearch !== undefined && page.state.showMobileSearch !== isSearchOpen) {
		isSearchOpen = !!page.state.showMobileSearch;
	}
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
	if (!browser) return;

	const searchTerm = filtersStore.state?.searchTerm ?? '';
	const currentTab = currentPage;
	const counts = filteredCountsStore.counts;
	const currentCount = currentFilteredGames.length;

	if (searchTerm && searchTerm !== lastSearchTerm) {
		const searchParam = searchTerm ? `?s=${encodeURIComponent(searchTerm)}` : '';

		if (currentTab === 'home' || currentTab === 'stats') {
			goto(`/library${searchParam}`, {
				keepFocus: true,
				noScroll: true,
				replaceState: true,
				state: { showMobileSearch: true },
			});
		} else if (currentTab === 'tierlist') {
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
		} else if (currentTab === lastActiveTab && currentCount === 0) {
			if (currentTab === 'planned' && counts.completed > 0) {
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
		const searchParam = page.url.searchParams.get('s');
		if (searchParam && innerWidth < 768) {
			try {
				replaceState(window.location.href, { ...page.state, showMobileSearch: true });
			} catch {
				// Ignore replaceState errors during initial navigation
			}
		}
	}
});

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

<svelte:window onscroll={handleScroll} />

{#if initialized}
	<div class="bg-background text-foreground min-h-screen bg-[var(--color-background)]">
		<Header
			onAddGame={() => editorModalState.handleAddGame()}
			onApplyChanges={() => editorModalState.handleApplyChanges()}
			onOpenLogin={() => (loginModalOpen = true)}
		/>
		{#if !isHomePage}
		<section class="filter-section top-[104px] z-30 hidden md:top-[110px] md:block" style="min-height: 44px;">
			<div class="mx-auto px-6" style="max-width: 1800px;">
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
		{/if}

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
				{#if isHomePage}
					{@render children?.()}
				{:else if isGamesPage}
					{#if hasActiveFilters && currentFilteredGames.length === 0}
							<NoResults onReset={resetFilters} />
					{:else}
						<GamesView
							filteredGames={currentFilteredGames}
							onOpenModal={openModalWithFilterContext}
							onEditGame={(g) => editorModalState.handleEditGame(g)}
							onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
							loading={!gamesInitialized}
						/>
					{/if}

					<div style="display: none;">
						{@render children?.()}
					</div>
				{:else if isTierlistPage}
						<TierListView filteredGames={currentFilteredGames} onOpenModal={openModalWithFilterContext} />

					<div style="display: none;">
						{@render children?.()}
					</div>
				{:else}
					{@render children?.()}
				{/if}
			</div>
		</main>

		<DetailModal
			onEditGame={(g: Game) => editorModalState.handleEditGame(g)}
			onDeleteGame={(g: Game) => editorModalState.handleDeleteGame(g)}
		/>

		{#if editorModalState.editorModalOpen}
			<GameEditorModal
				mode={editorModalState.editorModalMode}
				initialGame={editorModalState.editorModalGame}
				allGames={gamesStore.games}
				onClose={() => editorModalState.handleEditorClose()}
			/>
		{/if}

			<DeleteConfirmModal bind:open={editorModalState.deleteModalOpen} game={editorModalState.deleteModalGame} />

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
				onAddGame={() => editorModalState.handleAddGame()}
				onOpenLogin={() => (loginModalOpen = true)}
				{canInstall}
				onInstall={installApp}
			/>

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
