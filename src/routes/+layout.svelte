<script lang="ts">
import { page } from '$app/state';
import { goto, replaceState, afterNavigate } from '$app/navigation';
import { browser, dev } from '$app/environment';
import { untrack } from 'svelte';

import { RotateCcw } from '@lucide/svelte';

import { appStore, type TabValue } from '$lib/stores/app.svelte';
import { editorStore } from '$lib/stores/editor.svelte';
import { editorModalState } from '$lib/stores/editorModalState.svelte';
import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { windowSize } from '$lib/stores/window.svelte';

import Header from '$lib/components/Header.svelte';
import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
import BottomNavigation from '$lib/components/BottomNavigation.svelte';
import NoResults from '$lib/components/NoResults.svelte';
import FilterToggle from '$lib/components/FilterToggle.svelte';

import GamesView from '$lib/views/GamesView.svelte';
import TierListView from '$lib/views/TierListView.svelte';

import { extractFilterOptions } from '$lib/utils/filterOptions';
import { registerServiceWorker } from '$lib/utils/serviceWorker';
import { createGlobalKeydownHandler } from '$lib/utils/keyboardShortcuts';
import { getTierDisplayName } from '$lib/utils/tierUtils';

import type { Game } from '$lib/types/game';

import '../app.css';

let {
	children,
	data,
}: {
	children: import('svelte').Snippet;
	data: { games: Game[]; sharedGame: Game | null };
} = $props();

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

$effect(() => {
	if (urlUpdateTimeout) clearTimeout(urlUpdateTimeout);
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
			if (currentPage === 'home' || currentPage === 'tierlist' || currentPage === 'stats') {
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

let shareDescription = $derived.by(() => {
	const g = data.sharedGame;
	if (!g) return 'My personal video game collection with ratings, tier lists, and progress tracking.';

	let lines: string[] = [];

	if (g.status === 'Completed') {
		const p = g.ratingPresentation ?? '-';
		const s = g.ratingStory ?? '-';
		const gp = g.ratingGameplay ?? '-';
		lines.push(`Presentation: ${p}/10 · Story: ${s}/10 · Gameplay: ${gp}/10`);
	}

	if (g.status === 'Completed' || g.tier) {
		let secondLine = '';
		if (g.status === 'Completed') {
			const total = g.score ?? '-';
			secondLine += `Score: ${total}/20`;
		}
		if (g.tier) {
			if (secondLine) secondLine += ' · ';
			secondLine += `Tier: ${getTierDisplayName(g.tier)}`;
		}
		lines.push(secondLine);
	}

	return lines.join('\n');
});
</script>

<svelte:head>
	<title>{data.sharedGame ? `Gaming Tracker - ${data.sharedGame.title}` : (pageTitle === 'Gaming Tracker' ? 'Gaming Tracker' : `Gaming Tracker - ${pageTitle}`)}</title>
	<meta name="theme-color" content={appStore.theme === 'dark' ? '#0a0c10' : '#d0cbc4'} />
	<meta property="og:title" content={data.sharedGame ? `Gaming Tracker - ${data.sharedGame.title}` : "Gaming Tracker"} />
	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content={shareDescription}
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:site_name" content="Gaming Tracker" />
	<meta property="og:image" content={data.sharedGame ? `${page.url.origin}/${data.sharedGame.coverImage}` : `${page.url.origin}/android-chrome-512x512.png`} />
	<meta property="og:image:width" content={data.sharedGame ? "300" : "512"} />
	<meta property="og:image:height" content={data.sharedGame ? "450" : "512"} />
	<meta property="og:image:alt" content={data.sharedGame ? data.sharedGame.title : "Gaming Tracker"} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.sharedGame ? `Gaming Tracker - ${data.sharedGame.title}` : "Gaming Tracker"} />
	<meta
		name="twitter:description"
		content={shareDescription}
	/>
	<meta name="twitter:image" content={data.sharedGame ? `${page.url.origin}/${data.sharedGame.coverImage}` : `${page.url.origin}/android-chrome-512x512.png`} />
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
			onOpenLogin={() => (loginModalOpen = true)}
		/>
		{#if showFilterSection}
		<section class="filter-section top-[104px] z-30 hidden md:top-[110px] md:block" style="min-height: 44px;">
			<div class="mx-auto px-6" style="max-width: 1800px;">
				<!-- Filters are shown on desktop via FilterDropdowns -->
				{#if filtersStore.isDesktopFiltersExpanded}
						<div class="filter-content mb-8 space-y-4">
								{#await import('$lib/components/SearchBar.svelte') then { default: SearchBar }}
									<SearchBar />
								{/await}
							<div class="flex flex-col items-center gap-4">
								<div class="flex flex-wrap items-center justify-center gap-3">
									{#await import('$lib/components/FilterDropdown.svelte') then { default: FilterDropdown }}
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
									{#await import('$lib/components/RatingsSort.svelte') then { default: RatingsSort }}
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
					{:else if hasActiveFilters && currentFilteredGames.length === 0}
						<NoResults onReset={resetFilters} />
					{:else}
						<GamesView
							filteredGames={currentFilteredGames}
							onOpenModal={openModalWithFilterContext}
							onEditGame={(g) => editorModalState.handleEditGame(g)}
							onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
							loading={false}
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

		{#if modalStore.getState().isOpen}
			{#await import('$lib/components/DetailModal.svelte') then { default: DetailModal }}
				<DetailModal
					onEditGame={(g) => editorModalState.handleEditGame(g)}
					onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
				/>
			{/await}
		{/if}

		{#if editorModalState.editorModalOpen}
			{#await import('$lib/components/GameEditorModal.svelte') then { default: GameEditorModal }}
				<GameEditorModal
					mode={editorModalState.editorModalMode}
					initialGame={editorModalState.editorModalGame}
					allGames={gamesStore.games}
					onClose={() => editorModalState.handleEditorClose()}
				/>
			{/await}
		{/if}

		{#if editorModalState.deleteModalOpen}
			{#await import('$lib/components/DeleteConfirmModal.svelte') then { default: DeleteConfirmModal }}
				<DeleteConfirmModal bind:open={editorModalState.deleteModalOpen} game={editorModalState.deleteModalGame} />
			{/await}
		{/if}

		{#if loginModalOpen}
			{#await import('$lib/components/LoginModal.svelte') then { default: LoginModal }}
				<LoginModal bind:open={loginModalOpen} />
			{/await}
		{/if}

		{#if isSearchOpen}
			{#await import('$lib/components/layout/MobileSearch.svelte') then { default: MobileSearch }}
				<MobileSearch isOpen={isSearchOpen} onClose={onCloseSearchAndFilters} />
			{/await}
		{/if}

		<!-- Mobile Filters Modal -->
		{#if isFiltersOpen}
			{#await import('$lib/components/MobileFilters.svelte') then { default: MobileFilters }}
				<MobileFilters
					bind:isOpen={isFiltersOpen}
					{filterOptions}
					{showTiersFilter}
					showCoOpFilter={true}
					onClose={() => (isFiltersOpen = false)}
				/>
			{/await}
		{/if}

		{#await import('$lib/components/layout/MobileSettingsMenu.svelte') then { default: MobileSettingsMenu }}
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
		{/await}

		<!-- Discreet Last Updated Indicator -->
		<!-- Removed build date display - now only in source code at top -->

		<BottomNavigation {onSearchToggle} />
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

	/* Push content below the fixed search bar when search is open */
	:global(main.search-open-mobile) {
		padding-top: 75px !important;
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
