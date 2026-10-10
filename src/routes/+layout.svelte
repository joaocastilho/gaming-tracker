<script lang="ts">
import { page } from '$app/state';
import { goto, afterNavigate } from '$app/navigation';
import { browser, dev } from '$app/env';
import { untrack } from 'svelte';

import { RotateCcw } from '@lucide/svelte';

import { appStore, type TabValue } from '#lib/stores/app.svelte.js';
import { editorStore } from '#lib/stores/editor.svelte.js';
import { editorModalState } from '#lib/stores/editorModalState.svelte.js';
import { filteredCountsStore } from '#lib/stores/filteredCounts.svelte.js';
import { filteredGamesStore } from '#lib/stores/filteredGamesStore.svelte.js';
import { filtersStore } from '#lib/stores/filters.svelte.js';
import { gamesStore } from '#lib/stores/games.svelte.js';
import { modalStore } from '#lib/stores/modal.svelte.js';
import { windowSize } from '#lib/stores/window.svelte.js';

import Header from '#lib/components/Header.svelte';
import ScrollToTopButton from '#lib/components/ScrollToTopButton.svelte';
import BottomNavigation from '#lib/components/BottomNavigation.svelte';
import NoResults from '#lib/components/NoResults.svelte';
import FilterToggle from '#lib/components/FilterToggle.svelte';

import GamesView from '#lib/views/GamesView.svelte';
import TierListView from '#lib/views/TierListView.svelte';

import { extractFilterOptions } from '#lib/utils/filterOptions.js';
import { tabEmptyState } from '#lib/utils/emptyState.js';
import { registerServiceWorker } from '#lib/utils/serviceWorker.js';
import { createGlobalKeydownHandler } from '#lib/utils/keyboardShortcuts.js';
import { buildOgDescription } from '#lib/utils/ogDescription.js';

import type { Game } from '#lib/types/game.js';

import '../app.css';

let {
	children,
	data,
}: {
	children: import('svelte').Snippet;
	data: { games: Game[]; gamesSource: 'cache' | 'network' | 'none' };
} = $props();

let gamesInitialized = $state(false);
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
		// Data read straight out of IndexedDB is already there — skip the
		// redundant write-back on every page load.
		gamesStore.initializeGames(data.games, { persist: data.gamesSource !== 'cache' });
		gamesInitialized = true;
	}
});

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
let isStatsPage = $derived(currentPage === 'stats');
let showFilterSection = $derived(!isHomePage && !isTierlistPage && !isStatsPage);

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

$effect.pre(() => {
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
}

function onSearchToggle() {
	if (isSearchOpen) {
		isSearchOpen = false;
		pushSearchState(false);
	} else {
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

	goto(page.url.href, {
		shallow: true,
		replace: true,
		state: { ...page.state, showMobileSearch: open },
	});
}

$effect(() => {
	if (!browser) return;

	const handler = createGlobalKeydownHandler(() => ({
		currentPage,
		onSearchToggle,
		onDesktopSearch: () => {
			if (currentPage === 'home' || currentPage === 'tierlist' || currentPage === 'stats') {
				filtersStore.setDesktopSearchOpen(true);
				goto('/library', { state: { showMobileSearch: windowSize.isMobile } });
				return;
			}
			filtersStore.toggleDesktopSearch();
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
			goto(url.toString(), { shallow: true, replace: true, state: page.state });
		}

		if (browser && innerWidth < 768) {
			requestAnimationFrame(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
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
				reset: false,
				replace: true,
				state: { showMobileSearch: true },
			});
		} else if (currentTab === 'tierlist') {
			if (counts.completed > 0) {
				goto(`/completed${searchParam}`, {
					reset: false,
					replace: true,
					state: { showMobileSearch: true },
				});
			} else if (counts.planned > 0) {
				goto(`/planned${searchParam}`, {
					reset: false,
					replace: true,
					state: { showMobileSearch: true },
				});
			}
		} else if (currentTab === lastActiveTab && currentCount === 0) {
			if (currentTab === 'planned' && counts.completed > 0) {
				goto(`/completed${searchParam}`, {
					reset: false,
					replace: true,
					state: { showMobileSearch: true },
				});
			} else if (currentTab === 'completed' && counts.planned > 0) {
				goto(`/planned${searchParam}`, {
					reset: false,
					replace: true,
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

afterNavigate(({ from, shallow, type }) => {
	if (shallow && type === 'goto') return;

	if (!from) {
		const searchParam = page.url.searchParams.get('s');
		if (searchParam && innerWidth < 768) {
			try {
				goto(window.location.href, {
					shallow: true,
					replace: true,
					state: { ...page.state, showMobileSearch: true },
				});
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

let sharedGame = $derived(browser ? (gamesStore.findByUrlSlug(page.url.searchParams.get('game') ?? '') ?? null) : null);

let shareDescription = $derived.by(() => {
	const g = sharedGame;
	if (!g) return 'My personal video game collection with ratings, tier lists, and progress tracking.';
	return buildOgDescription(g);
});
</script>

<svelte:head>
	<title>{sharedGame
		? `Gaming Tracker - ${sharedGame.title}`
		: pageTitle === 'Gaming Tracker' ? 'Gaming Tracker' : `Gaming Tracker - ${pageTitle}`}</title>

	<meta
		name="theme-color"
		content={appStore.theme === 'dark' ? '#0a0c10' : '#d0cbc4'}
	/>

	<meta
		property="og:title"
		content={sharedGame
			? `Gaming Tracker - ${sharedGame.title}`
			: "Gaming Tracker"}
	/>

	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content={shareDescription}
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:site_name" content="Gaming Tracker" />
	<meta property="og:image" content={sharedGame ? `${page.url.origin}/${sharedGame.coverImage}` : `${page.url.origin}/android-chrome-512x512.png`} />
	<meta property="og:image:width" content={sharedGame ? "300" : "512"} />
	<meta property="og:image:height" content={sharedGame ? "450" : "512"} />
	<meta property="og:image:alt" content={sharedGame ? sharedGame.title : "Gaming Tracker"} />
	<meta name="twitter:card" content="summary_large_image" />

	<meta
		name="twitter:title"
		content={sharedGame
			? `Gaming Tracker - ${sharedGame.title}`
			: "Gaming Tracker"}
	/>

	<meta
		name="twitter:description"
		content={shareDescription}
	/>
	<meta name="twitter:image" content={sharedGame ? `${page.url.origin}/${sharedGame.coverImage}` : `${page.url.origin}/android-chrome-512x512.png`} />
	<link rel="canonical" href={canonicalUrl} />
	<meta
		name="apple-mobile-web-app-status-bar-style"
		content={appStore.theme === 'dark' ? 'black-translucent' : 'default'}
	/>
	{#if dev}
		<link rel="modulepreload" href="/@vite/client" />
	{/if}
</svelte:head>



<div class="bg-background text-foreground min-h-screen bg-[var(--color-background)]">
	<Header
		onAddGame={() => editorModalState.handleAddGame()}
		onApplyChanges={() => editorModalState.handleApplyChanges()}
		onOpenLogin={() => loginModalOpen = true}
	/>
	{#if showFilterSection}
		<section class="filter-section hidden md:block" style="min-height: 44px;">
			<div class="mx-auto px-6" style="max-width: 1800px;">
				<div class="filter-content mb-6">
					<div class="flex flex-col items-center gap-4">
						<div class="flex flex-wrap items-center justify-center gap-3">
							{#await import('#lib/components/FilterDropdown.svelte') then { default: FilterDropdown }}
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
							{/await}

							<FilterToggle
								label="Co-op"
								value="Yes"
								isSelected={selectedCoOp.includes('Yes')}
							/>
							<span class="mx-1 font-bold text-zinc-600 dark:text-zinc-500">|</span>
							{#await import('#lib/components/RatingsSort.svelte') then { default: RatingsSort }}
								<RatingsSort />
							{/await}
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
					{#if filtersStore.isDesktopSearchOpen}
						<div class="desktop-search-row">
							{#await import('#lib/components/SearchBar.svelte') then { default: SearchBar }}
								<SearchBar />
							{/await}
						</div>
					{/if}
				</div>
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
				{#if !gamesInitialized}
					<GamesView
						filteredGames={[]}
						onOpenModal={openModalWithFilterContext}
						onEditGame={(g) => editorModalState.handleEditGame(g)}
						onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
						loading={true}
					/>
				{:else if gamesStore.games.length === 0}
					<div class="empty-database">
						<p>No games in your collection yet.</p>
						<p class="sub">Add your first game to get started.</p>
					</div>
				{:else}
					{#if hasActiveFilters && currentFilteredGames.length === 0}
						<NoResults onReset={resetFilters} />
					{:else if currentFilteredGames.length === 0}
						{@const emptyCopy = tabEmptyState(currentPage)}
						<NoResults message={emptyCopy.message} description={emptyCopy.description} />
					{:else}
						<GamesView
							filteredGames={currentFilteredGames}
							onOpenModal={openModalWithFilterContext}
							onEditGame={(g) => editorModalState.handleEditGame(g)}
							onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
							loading={false}
						/>
					{/if}
				{/if}
			{:else if isTierlistPage}
					<TierListView filteredGames={currentFilteredGames} onOpenModal={openModalWithFilterContext} />
			{:else}
				{@render children?.()}
			{/if}
		</div>
	</main>

	{#if modalStore.isOpen}
		{#await import('#lib/components/DetailModal.svelte') then { default: DetailModal }}
			<DetailModal
				onEditGame={(g) => editorModalState.handleEditGame(g)}
				onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
			/>
		{/await}
	{/if}

	{#if editorModalState.editorModalOpen}
		{#await import('#lib/components/GameEditorModal.svelte') then { default: GameEditorModal }}
			<GameEditorModal
				mode={editorModalState.editorModalMode}
				initialGame={editorModalState.editorModalGame}
				allGames={gamesStore.games}
				onClose={() => editorModalState.handleEditorClose()}
			/>
		{/await}
	{/if}

	{#if editorModalState.deleteModalOpen}
		{#await import('#lib/components/DeleteConfirmModal.svelte') then { default: DeleteConfirmModal }}
				<DeleteConfirmModal bind:open={editorModalState.deleteModalOpen} game={editorModalState.deleteModalGame} />
		{/await}
	{/if}

	{#if loginModalOpen}
		{#await import('#lib/components/LoginModal.svelte') then { default: LoginModal }}
			<LoginModal bind:open={loginModalOpen} />
		{/await}
	{/if}

	{#if isSearchOpen}
		{#await import('#lib/components/layout/MobileSearch.svelte') then { default: MobileSearch }}
				<MobileSearch isOpen={isSearchOpen} onClose={onCloseSearchAndFilters} />
		{/await}
	{/if}

	<!-- Mobile Filters Modal -->
	{#if isFiltersOpen}
		{#await import('#lib/components/MobileFilters.svelte') then { default: MobileFilters }}
			<MobileFilters
				bind:isOpen={isFiltersOpen}
				filterOptions={filterOptions}
				showTiersFilter={showTiersFilter}
				showCoOpFilter={true}
				onClose={() => isFiltersOpen = false}
			/>
		{/await}
	{/if}

	{#await import('#lib/components/layout/MobileSettingsMenu.svelte') then { default: MobileSettingsMenu }}
		<MobileSettingsMenu
			isOpen={isSettingsMenuOpen}
			isTierlistPage={isTierlistPage}
			onToggle={() => isSettingsMenuOpen = !isSettingsMenuOpen}
			onClose={() => isSettingsMenuOpen = false}
			onFiltersToggle={onFiltersToggle}
			onAddGame={() => editorModalState.handleAddGame()}
			onOpenLogin={() => loginModalOpen = true}
			canInstall={canInstall}
			onInstall={installApp}
		/>
	{/await}

	<!-- Discreet Last Updated Indicator -->
	<!-- Removed build date display - now only in source code at top -->

	<BottomNavigation onSearchToggle={onSearchToggle} />
	<ScrollToTopButton hideWhenFiltersOpen={isFiltersOpen} />
</div>

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

	/* Search bar sits below the filter row; give it a small top gap and let the
	   filter-content mb-6 provide the spacing to the grid (the component's own
	   20px bottom margin would otherwise stack on top of it). */
	.desktop-search-row {
		margin-top: 1rem;
	}

	.desktop-search-row :global(.search-bar-container) {
		margin-bottom: 0;
	}

	/* Push content below the fixed search bar when search is open */
	:global(main.search-open-mobile) {
		padding-top: 75px !important;
	}

	/* The mobile search bar is hidden at md+, so the 75px top padding must not
	   leak into the desktop layout (it would leave a large empty gap between
	   the filters and the game grid). */
	@media (min-width: 768px) {
		:global(main.search-open-mobile) {
			padding-top: 0 !important;
		}
	}

	.empty-database {
		text-align: center;
		color: var(--color-text-secondary);
		padding: 4rem 2rem;
	}

	.empty-database .sub {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		margin-top: 0.5rem;
	}
</style>
