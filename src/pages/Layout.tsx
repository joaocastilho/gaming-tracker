import { RotateCcw } from '@lucide/solid';
import { Link, Meta, Title } from '@solidjs/meta';
import { useLocation, useNavigate } from '@solidjs/router';
import type { JSX } from '@solidjs/web';
import {
	createEffect,
	createMemo,
	createSignal,
	Loading,
	lazy,
	Match,
	onSettled,
	Show,
	Switch,
	untrack,
} from 'solid-js';
import BottomNavigation from '#lib/components/BottomNavigation.js';
import FilterToggle from '#lib/components/FilterToggle.js';
import Header from '#lib/components/Header.js';
import NoResults from '#lib/components/NoResults.js';
import ScrollToTopButton from '#lib/components/ScrollToTopButton.js';
import { appStore, type TabValue } from '#lib/stores/app.js';
import { editorStore } from '#lib/stores/editor.js';
import { editorModalState } from '#lib/stores/editorModalState.js';
import { filteredCountsStore } from '#lib/stores/filteredCounts.js';
import { filteredGamesStore } from '#lib/stores/filteredGamesStore.js';
import { filtersStore } from '#lib/stores/filters.js';
import { gamesStore } from '#lib/stores/games.js';
import { modalStore } from '#lib/stores/modal.js';
import { windowSize } from '#lib/stores/window.js';
import type { Game } from '#lib/types/game.js';
import { tabEmptyState } from '#lib/utils/emptyState.js';
import { browser, dev } from '#lib/utils/env.js';
import { extractFilterOptions } from '#lib/utils/filterOptions.js';
import { loadInitialGames } from '#lib/utils/gamesLoader.js';
import { createGlobalKeydownHandler } from '#lib/utils/keyboardShortcuts.js';
import { buildOgDescription } from '#lib/utils/ogDescription.js';
import {
	getCurrentPageState,
	goto,
	onUrlChange,
	registerNavigator,
	setCurrentPathname,
} from '#lib/utils/routerBridge.js';
import { isGamesRoute, routeKeyFromPath } from '#lib/utils/routeUtils.js';
import { registerServiceWorker } from '#lib/utils/serviceWorker.js';
import './Layout.css';

const GamesView = lazy(() => import('#lib/views/GamesView.js'));
const TierListView = lazy(() => import('#lib/views/TierListView.js'));
const FilterDropdown = lazy(() => import('#lib/components/FilterDropdown.js'));
const RatingsSort = lazy(() => import('#lib/components/RatingsSort.js'));
const SearchBar = lazy(() => import('#lib/components/SearchBar.js'));
const DetailModal = lazy(() => import('#lib/components/DetailModal.js'));
const GameEditorModal = lazy(() => import('#lib/components/GameEditorModal.js'));
const DeleteConfirmModal = lazy(() => import('#lib/components/DeleteConfirmModal.js'));
const LoginModal = lazy(() => import('#lib/components/LoginModal.js'));
const MobileSearch = lazy(() => import('#lib/components/layout/MobileSearch.js'));
const MobileFilters = lazy(() => import('#lib/components/MobileFilters.js'));
const MobileSettingsMenu = lazy(() => import('#lib/components/layout/MobileSettingsMenu.js'));

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isBeforeInstallPromptEvent(event: Event | null): event is BeforeInstallPromptEvent {
	return event !== null && 'prompt' in event && 'userChoice' in event;
}

export interface LayoutProps {
	children?: JSX.Element;
}

export default function Layout(props: LayoutProps): JSX.Element {
	const location = useLocation();
	const routerNavigate = useNavigate();

	const [gamesInitialized, setGamesInitialized] = createSignal(false);
	const [canInstall, setCanInstall] = createSignal(false);
	const [deferredPrompt, setDeferredPrompt] = createSignal<BeforeInstallPromptEvent | null>(null);
	const [isSearchOpen, setIsSearchOpen] = createSignal(false);
	const [isFiltersOpen, setIsFiltersOpen] = createSignal(false);
	const [isSettingsMenuOpen, setIsSettingsMenuOpen] = createSignal(false);
	const [loginModalOpen, setLoginModalOpen] = createSignal(false);
	const [urlTick, setUrlTick] = createSignal(0);

	onSettled(() => {
		registerNavigator((url, options) => {
			const parsed = new URL(url, window.location.origin);
			const target = `${parsed.pathname}${parsed.search}${parsed.hash}`;
			routerNavigate(target, {
				replace: options?.replace ?? false,
				scroll: options?.reset ?? true,
				state: options?.state,
			});
		});

		const offUrl = onUrlChange(() => setUrlTick((n) => n + 1));
		const onPopState = () => setUrlTick((n) => n + 1);
		window.addEventListener('popstate', onPopState);

		const unregisterSw = registerServiceWorker();

		editorStore.restoreFromSession();
		if (editorStore.editorMode && !dev) {
			void editorStore.checkSession();
		}

		void loadInitialGames().then(({ games, gamesSource }) => {
			if (!gamesInitialized()) {
				gamesStore.initializeGames(games, { persist: gamesSource !== 'cache' });
				setGamesInitialized(true);
			}
		});

		const searchParam = new URLSearchParams(window.location.search).get('s');
		if (searchParam && window.innerWidth < 768) {
			setIsSearchOpen(true);
		}

		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			if (isBeforeInstallPromptEvent(e)) {
				setDeferredPrompt(e);
				setCanInstall(true);
			}
		};
		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		return () => {
			registerNavigator(null);
			offUrl();
			window.removeEventListener('popstate', onPopState);
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			unregisterSw?.();
		};
	});

	const pathname = createMemo(() => {
		void urlTick();
		return location.pathname;
	});

	const liveParams = createMemo(() => {
		void urlTick();
		void location.search;
		if (!browser) return new URLSearchParams(location.search);
		return new URLSearchParams(window.location.search);
	});

	const currentPage = createMemo(() => routeKeyFromPath(pathname()));
	const currentFilteredGames = createMemo(() => filteredGamesStore.games);
	const isHomePage = createMemo(() => currentPage() === 'home');
	const isGamesPage = createMemo(() => isGamesRoute(currentPage()));
	const isPlannedPage = createMemo(() => currentPage() === 'planned');
	const isTierlistPage = createMemo(() => currentPage() === 'tierlist');
	const showFilterSection = createMemo(() => isGamesPage());
	const showTiersFilter = createMemo(() => !isPlannedPage());

	const filterOptions = createMemo(() => {
		const games = gamesStore.games;
		if (!games || games.length === 0) {
			return { platforms: [], genres: [], tiers: [], coOp: [] };
		}
		return extractFilterOptions(games);
	});

	const selectedPlatforms = createMemo(() => filtersStore.state?.platforms ?? []);
	const selectedGenres = createMemo(() => filtersStore.state?.genres ?? []);
	const selectedTiers = createMemo(() => filtersStore.state?.tiers ?? []);
	const selectedCoOp = createMemo(() => filtersStore.state?.coOp ?? []);
	const hasActiveFilters = createMemo(() => filtersStore.isAnyFilterApplied());
	const canReset = createMemo(() => hasActiveFilters() || filtersStore.isSortModified());

	const pageTitle = createMemo(() => {
		const path = pathname();
		if (path === '/') return 'Home';
		if (path === '/stats') return 'Stats';
		if (path === '/library') return 'All Games';
		if (path === '/completed') return 'Completed Games';
		if (path === '/planned') return 'Planned Games';
		if (path === '/tierlist') return 'Tier List';
		if (path === '/login') return 'Login';
		return 'Gaming Tracker';
	});

	const origin = createMemo(() => (browser ? window.location.origin : 'https://gaming-tracker.pages.dev'));
	const canonicalUrl = createMemo(() => origin() + pathname());

	const sharedGame = createMemo(() =>
		browser ? (gamesStore.findByUrlSlug(liveParams().get('game') ?? '') ?? null) : null
	);

	const shareDescription = createMemo(() => {
		const g = sharedGame();
		if (!g) return 'My personal video game collection with ratings, tier lists, and progress tracking.';
		return buildOgDescription(g);
	});

	// Sync active tab + routerBridge pathname
	createEffect(
		() => pathname(),
		(path) => {
			setCurrentPathname(path);
			let targetTab: TabValue = 'all';
			if (path === '/') targetTab = 'home';
			else if (path === '/library') targetTab = 'library';
			else if (path === '/completed') targetTab = 'completed';
			else if (path === '/planned') targetTab = 'planned';
			else if (path === '/tierlist') targetTab = 'tierlist';
			else if (path === '/stats') targetTab = 'stats';
			appStore.setActiveTab(targetTab);
		}
	);

	// Sync filters to URL
	createEffect(
		() => filtersStore.state,
		() => {
			if (browser) {
				untrack(() => filtersStore.writeSearchToURL(getCurrentPageState()));
			}
		}
	);

	// Sync URL params into filters
	createEffect(
		() => ({ params: liveParams(), path: pathname(), games: gamesStore.games }),
		({ params, path }) => {
			if (!browser) return;
			untrack(() => {
				filtersStore.readSearchFromURL(params, path);
				if (filtersStore.isAnyFilterApplied() && windowSize.width >= 768) {
					filtersStore.setDesktopFiltersExpanded(true);
				}
			});
		}
	);

	// Sync ?game= param into modal
	createEffect(
		() => ({ games: gamesStore.games, params: liveParams() }),
		({ games, params }) => {
			if (games.length > 0) {
				modalStore.readFromURL(params, games);
			}
		}
	);

	// Body scroll lock for mobile filters
	createEffect(
		() => isFiltersOpen(),
		(open) => {
			if (browser && open) {
				document.body.classList.add('no-scroll');
				return () => document.body.classList.remove('no-scroll');
			}
		}
	);

	function pushSearchState(open: boolean): void {
		if (!browser) return;
		void goto(window.location.href, {
			shallow: true,
			replace: true,
			state: { ...getCurrentPageState(), showMobileSearch: open },
		});
	}

	function onSearchToggle(): void {
		if (isSearchOpen()) {
			setIsSearchOpen(false);
			pushSearchState(false);
		} else {
			setIsSearchOpen(true);
			pushSearchState(true);
			setIsFiltersOpen(false);
		}
	}

	function onFiltersToggle(): void {
		const next = !isFiltersOpen();
		setIsFiltersOpen(next);
		if (next && isSearchOpen()) {
			setIsSearchOpen(false);
			pushSearchState(false);
		}
	}

	function onCloseSearchAndFilters(): void {
		if (isSearchOpen()) {
			setIsSearchOpen(false);
			pushSearchState(false);
		}
		setIsFiltersOpen(false);
	}

	// Global keyboard shortcuts
	onSettled(() => {
		if (!browser) return;
		const handler = createGlobalKeydownHandler(() => ({
			currentPage: currentPage(),
			onSearchToggle,
			onDesktopSearch: () => {
				const cur = currentPage();
				if (cur === 'home' || cur === 'tierlist' || cur === 'stats') {
					filtersStore.setDesktopSearchOpen(true);
					void goto('/library', { state: { showMobileSearch: windowSize.isMobile } });
					return;
				}
				filtersStore.toggleDesktopSearch();
				requestAnimationFrame(() => {
					const input = document.getElementById('search-input');
					if (input instanceof HTMLInputElement) {
						input.focus();
						input.select();
					}
				});
			},
		}));

		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});

	// Clear search when closing mobile search bar
	let wasSearchOpen = false;
	createEffect(
		() => isSearchOpen(),
		(open) => {
			if (open) {
				wasSearchOpen = true;
			} else if (wasSearchOpen) {
				wasSearchOpen = false;
				filtersStore.setSearchTerm('');

				if (browser) {
					const url = new URL(window.location.href);
					url.searchParams.delete('s');
					void goto(url.toString(), { shallow: true, replace: true, state: getCurrentPageState() });
					if (window.innerWidth < 768) {
						requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
					}
				}
			}
		}
	);

	// Auto-switch tabs when searching yields 0 results on current tab
	let lastSearchTerm = '';
	let lastActiveTab = '';
	createEffect(
		() => ({
			searchTerm: filtersStore.state?.searchTerm ?? '',
			currentTab: currentPage(),
			counts: filteredCountsStore.counts,
			currentCount: currentFilteredGames().length,
		}),
		({ searchTerm, currentTab, counts, currentCount }) => {
			if (!browser) return;

			if (searchTerm && searchTerm !== lastSearchTerm) {
				const searchParam = `?s=${encodeURIComponent(searchTerm)}`;

				if (currentTab === 'home' || currentTab === 'stats') {
					void goto(`/library${searchParam}`, { reset: false, replace: true, state: { showMobileSearch: true } });
				} else if (currentTab === 'tierlist') {
					if (counts.completed > 0) {
						void goto(`/completed${searchParam}`, { reset: false, replace: true, state: { showMobileSearch: true } });
					} else if (counts.planned > 0) {
						void goto(`/planned${searchParam}`, { reset: false, replace: true, state: { showMobileSearch: true } });
					}
				} else if (currentTab === lastActiveTab && currentCount === 0) {
					if (currentTab === 'planned' && counts.completed > 0) {
						void goto(`/completed${searchParam}`, { reset: false, replace: true, state: { showMobileSearch: true } });
					} else if (currentTab === 'completed' && counts.planned > 0) {
						void goto(`/planned${searchParam}`, { reset: false, replace: true, state: { showMobileSearch: true } });
					}
				}
			}

			lastSearchTerm = searchTerm;
			lastActiveTab = currentTab;
		}
	);

	function resetFilters(): void {
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
		filtersStore.setSort(null);
	}

	function openModalWithFilterContext(game: Game, contextGames?: Game[]): void {
		modalStore.openViewModal(game, contextGames ?? currentFilteredGames());
	}

	async function installApp(): Promise<void> {
		const prompt = deferredPrompt();
		if (!prompt) return;
		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		if (outcome === 'accepted') {
			setDeferredPrompt(null);
			setCanInstall(false);
		}
	}

	return (
		<>
			<Title>
				{sharedGame()
					? `Gaming Tracker - ${sharedGame()?.title}`
					: pageTitle() === 'Gaming Tracker'
						? 'Gaming Tracker'
						: `Gaming Tracker - ${pageTitle()}`}
			</Title>
			<Meta name="theme-color" content={appStore.theme === 'dark' ? '#0a0c10' : '#d0cbc4'} />
			<Meta property="og:title" content={sharedGame() ? `Gaming Tracker - ${sharedGame()?.title}` : 'Gaming Tracker'} />
			<Meta property="og:type" content="website" />
			<Meta property="og:description" content={shareDescription()} />
			<Meta property="og:url" content={canonicalUrl()} />
			<Meta property="og:site_name" content="Gaming Tracker" />
			<Meta
				property="og:image"
				content={sharedGame() ? `${origin()}/${sharedGame()?.coverImage}` : `${origin()}/android-chrome-512x512.png`}
			/>
			<Meta property="og:image:width" content={sharedGame() ? '300' : '512'} />
			<Meta property="og:image:height" content={sharedGame() ? '450' : '512'} />
			<Meta property="og:image:alt" content={sharedGame()?.title ?? 'Gaming Tracker'} />
			<Meta name="twitter:card" content="summary_large_image" />
			<Meta
				name="twitter:title"
				content={sharedGame() ? `Gaming Tracker - ${sharedGame()?.title}` : 'Gaming Tracker'}
			/>
			<Meta name="twitter:description" content={shareDescription()} />
			<Meta
				name="twitter:image"
				content={sharedGame() ? `${origin()}/${sharedGame()?.coverImage}` : `${origin()}/android-chrome-512x512.png`}
			/>
			<Link rel="canonical" href={canonicalUrl()} />
			<Meta
				name="apple-mobile-web-app-status-bar-style"
				content={appStore.theme === 'dark' ? 'black-translucent' : 'default'}
			/>

			<div class="bg-background text-foreground min-h-screen bg-[var(--color-background)]">
				<Header
					onAddGame={() => editorModalState.handleAddGame()}
					onApplyChanges={() => void editorModalState.handleApplyChanges()}
					onOpenLogin={() => setLoginModalOpen(true)}
				/>

				<Show when={showFilterSection()}>
					<section class="filter-section hidden md:block" style={{ 'min-height': '44px' }}>
						<div class="mx-auto px-6" style={{ 'max-width': '1800px' }}>
							<div class="filter-content mb-6">
								<div class="flex flex-col items-center gap-4">
									<div class="flex flex-wrap items-center justify-center gap-3">
										<Loading>
											<FilterDropdown
												type="platforms"
												label="Platforms"
												options={filterOptions().platforms}
												selectedOptions={selectedPlatforms()}
											/>
											<FilterDropdown
												type="genres"
												label="Genres"
												options={filterOptions().genres}
												selectedOptions={selectedGenres()}
											/>
											<Show when={showTiersFilter()}>
												<FilterDropdown
													type="tiers"
													label="Tiers"
													options={filterOptions().tiers}
													selectedOptions={selectedTiers()}
												/>
											</Show>
										</Loading>

										<FilterToggle label="Co-op" value="Yes" isSelected={selectedCoOp().includes('Yes')} />
										<span class="mx-1 font-bold text-zinc-600 dark:text-zinc-500">|</span>

										<Loading>
											<RatingsSort />
										</Loading>

										<button
											type="button"
											class={[
												'reset-button flex h-[44px] w-[44px] items-center justify-center rounded-md transition-all',
												{ invisible: !canReset() },
											]}
											title="Reset all filters"
											onClick={resetFilters}
										>
											<RotateCcw size={18} />
										</button>
									</div>
								</div>

								<Show when={filtersStore.isDesktopSearchOpen}>
									<div class="desktop-search-row">
										<Loading>
											<SearchBar />
										</Loading>
									</div>
								</Show>
							</div>
						</div>
					</section>
				</Show>

				<a
					href="#main-content"
					class="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4"
				>
					Skip to main content
				</a>

				<main
					id="main-content"
					class={[
						'bg-[var(--color-background)] px-2 pt-0 pb-6 md:px-6 md:pt-4',
						{ 'search-open-mobile': isSearchOpen() },
					]}
				>
					<div class="mx-auto" style={{ 'max-width': '1800px' }}>
						<Switch fallback={props.children}>
							<Match when={isHomePage()}>{props.children}</Match>
							<Match when={isGamesPage()}>
								<Loading>
									<Switch
										fallback={
											<GamesView
												filteredGames={currentFilteredGames()}
												onOpenModal={openModalWithFilterContext}
												onEditGame={(g) => editorModalState.handleEditGame(g)}
												onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
												loading={false}
											/>
										}
									>
										<Match when={!gamesInitialized()}>
											<GamesView
												filteredGames={[]}
												onOpenModal={openModalWithFilterContext}
												onEditGame={(g) => editorModalState.handleEditGame(g)}
												onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
												loading={true}
											/>
										</Match>
										<Match when={gamesStore.games.length === 0}>
											<div class="empty-database">
												<p>No games in your collection yet.</p>
												<p class="sub">Add your first game to get started.</p>
											</div>
										</Match>
										<Match when={hasActiveFilters() && currentFilteredGames().length === 0}>
											<NoResults onReset={resetFilters} />
										</Match>
										<Match when={currentFilteredGames().length === 0}>
											<NoResults
												message={tabEmptyState(currentPage()).message}
												description={tabEmptyState(currentPage()).description}
											/>
										</Match>
									</Switch>
								</Loading>
							</Match>
							<Match when={isTierlistPage()}>
								<Loading>
									<TierListView filteredGames={currentFilteredGames()} onOpenModal={openModalWithFilterContext} />
								</Loading>
							</Match>
						</Switch>
					</div>
				</main>

				<Show when={modalStore.isOpen}>
					<Loading>
						<DetailModal
							onEditGame={(g) => editorModalState.handleEditGame(g)}
							onDeleteGame={(g) => editorModalState.handleDeleteGame(g)}
						/>
					</Loading>
				</Show>

				<Show when={editorModalState.editorModalOpen}>
					<Loading>
						<GameEditorModal
							mode={editorModalState.editorModalMode}
							initialGame={editorModalState.editorModalGame}
							allGames={gamesStore.games}
							onClose={() => editorModalState.handleEditorClose()}
						/>
					</Loading>
				</Show>

				<Show when={editorModalState.deleteModalOpen}>
					<Loading>
						<DeleteConfirmModal
							open={editorModalState.deleteModalOpen}
							onOpenChange={(open) => {
								editorModalState.deleteModalOpen = open;
							}}
							game={editorModalState.deleteModalGame}
						/>
					</Loading>
				</Show>

				<Show when={loginModalOpen()}>
					<Loading>
						<LoginModal open={loginModalOpen()} onOpenChange={setLoginModalOpen} />
					</Loading>
				</Show>

				<Show when={isSearchOpen()}>
					<Loading>
						<MobileSearch isOpen={isSearchOpen()} onClose={onCloseSearchAndFilters} />
					</Loading>
				</Show>

				<Show when={isFiltersOpen()}>
					<Loading>
						<MobileFilters
							isOpen={isFiltersOpen()}
							filterOptions={filterOptions()}
							showTiersFilter={showTiersFilter()}
							showCoOpFilter={true}
							onClose={() => setIsFiltersOpen(false)}
						/>
					</Loading>
				</Show>

				<Loading>
					<MobileSettingsMenu
						isOpen={isSettingsMenuOpen()}
						isTierlistPage={isTierlistPage()}
						onToggle={() => setIsSettingsMenuOpen((v) => !v)}
						onClose={() => setIsSettingsMenuOpen(false)}
						onFiltersToggle={onFiltersToggle}
						onAddGame={() => editorModalState.handleAddGame()}
						onOpenLogin={() => setLoginModalOpen(true)}
						canInstall={canInstall()}
						onInstall={() => void installApp()}
					/>
				</Loading>

				<BottomNavigation onSearchToggle={onSearchToggle} />
				<ScrollToTopButton hideWhenFiltersOpen={isFiltersOpen()} />
			</div>
		</>
	);
}
