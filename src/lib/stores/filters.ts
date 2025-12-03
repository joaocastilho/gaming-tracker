import { writable, derived, get } from 'svelte/store';
import { gamesStore } from './games';
import { appStore } from './app';
import { completedGamesCache } from './completedGamesCache';
import { filteredCountsStore } from './filteredCounts';
import type { Game } from '$lib/types/game';
import FilterWorker from '$lib/workers/filterWorker.ts?worker';

const browser = typeof window !== 'undefined';

import { memoize } from '$lib/utils/memoize';
import { debounce } from '$lib/utils/debounce';
import { replaceState } from '$app/navigation';

export type SortKey =
	| 'presentation'
	| 'story'
	| 'gameplay'
	| 'score'
	| 'finishedDate'
	| 'alphabetical';

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
	key: SortKey;
	direction: SortDirection;
}

export interface FilterState {
	searchTerm: string;
	platforms: string[];
	genres: string[];
	statuses: string[];
	tiers: string[];
	coOp: string[];
	sortOption: SortOption | null;
}

export interface GameCounts {
	total: number;
	planned: number;
	completed: number;
}

export interface FilteredGameData {
	filteredGames: Game[];
	totalCount: number;
	completedCount: number;
	plannedCount: number;
}

const baseFilters: Pick<FilterState, 'searchTerm'> = {
	searchTerm: ''
};

function createFiltersStore() {
	const worker = browser ? new FilterWorker() : null;
	const filters = writable<FilterState | null>(null);
	const filteredGames = writable<Game[]>([]);
	const gameCounts = writable<GameCounts>({
		total: 0,
		planned: 0,
		completed: 0
	});

	const gamesAndOptions = derived(
		[gamesStore, gamesStore.allPlatforms, gamesStore.allGenres],
		([$games, $allPlatforms, $allGenres]) => ({
			games: $games,
			platforms: $allPlatforms,
			genres: $allGenres
		})
	);

	const filtersAndTab = derived([filters, appStore.activeTab], ([$filters, $activeTab]) => ({
		filters: $filters,
		activeTab: $activeTab
	}));

	let hasInitialized = false;

	gamesAndOptions.subscribe(({ games, platforms, genres }) => {
		if (typeof window === 'undefined') return;

		const total = games.length;
		const completed = games.filter((game) => game.status === 'Completed').length;
		const planned = games.filter((game) => game.status === 'Planned').length;

		filteredCountsStore.setCounts({
			all: total,
			completed,
			planned,
			tierlist: null
		});

		if (games.length > 0 && platforms.length > 0 && genres.length > 0 && !hasInitialized) {
			hasInitialized = true;
			const initialFilters: FilterState = {
				...baseFilters,
				platforms: [],
				genres: [],
				statuses: [],
				tiers: [],
				coOp: [],
				sortOption: null
			};

			const loadedFilters = initialFilters;
			filters.set(loadedFilters);
			if (worker) {
				worker.postMessage({ type: 'LOAD_GAMES', payload: games });
			}
		}

		if (games.length > 0) {
			completedGamesCache.updateCache(games);
		}
	});

	if (worker) {
		worker.onmessage = (event: MessageEvent) => {
			const { type, payload } = event.data;
			if (type === 'FILTER_RESULTS') {
				filteredGames.set(payload.filteredGames);
				gameCounts.set(payload.counts);

				filteredCountsStore.setCounts({
					all: payload.counts.total,
					completed: payload.counts.completed,
					planned: payload.counts.planned,
					tierlist: null
				});
			}
		};
	}

	let lastProcessedKey = '';
	let filterUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

	filtersAndTab.subscribe((currentData) => {
		const { filters: currentFilters, activeTab } = currentData;
		if (!currentFilters) return;

		const processingKey = `${activeTab}-${JSON.stringify({
			searchTerm: currentFilters.searchTerm,
			platforms: currentFilters.platforms,
			genres: currentFilters.genres,
			statuses: currentFilters.statuses,
			tiers: currentFilters.tiers,
			coOp: currentFilters.coOp,
			sortOption: currentFilters.sortOption
		})}`;

		if (filterUpdateTimeout) {
			clearTimeout(filterUpdateTimeout);
		}
		filterUpdateTimeout = setTimeout(() => {
			if (processingKey === lastProcessedKey) {
				return;
			}
			const start = performance.now();

			lastProcessedKey = processingKey;
			const allGames = get(gamesStore);
			if (allGames.length > 0 && worker) {
				const activeFilters = [];
				if (currentFilters.searchTerm.trim())
					activeFilters.push(`search:"${currentFilters.searchTerm}"`);
				if (currentFilters.platforms.length > 0)
					activeFilters.push(`platforms:[${currentFilters.platforms.join(',')}]`);
				if (currentFilters.genres.length > 0)
					activeFilters.push(`genres:[${currentFilters.genres.join(',')}]`);
				if (currentFilters.statuses.length > 0)
					activeFilters.push(`statuses:[${currentFilters.statuses.join(',')}]`);
				if (currentFilters.tiers.length > 0)
					activeFilters.push(`tiers:[${currentFilters.tiers.join(',')}]`);
				if (currentFilters.coOp.length > 0)
					activeFilters.push(`coOp:[${currentFilters.coOp.join(',')}]`);
				if (currentFilters.sortOption)
					activeFilters.push(
						`sort:${currentFilters.sortOption.key}_${currentFilters.sortOption.direction}`
					);

				const shouldUseCompletedCache =
					activeTab === 'completed' &&
					!currentFilters.searchTerm.trim() &&
					currentFilters.platforms.length === 0 &&
					currentFilters.genres.length === 0 &&
					currentFilters.tiers.length === 0 &&
					currentFilters.coOp.length === 0 &&
					currentFilters.statuses.length === 1 &&
					currentFilters.statuses.includes('Completed') &&
					!currentFilters.sortOption;

				const shouldSkipWorkerForAllTab =
					activeTab === 'all' && activeFilters.length === 0 && !currentFilters.sortOption;

				if (shouldSkipWorkerForAllTab) {
					const total = allGames.length;
					const completed = allGames.filter((game) => game.status === 'Completed').length;
					const planned = allGames.filter((game) => game.status === 'Planned').length;
					filteredCountsStore.setCounts({
						all: total,
						completed,
						planned,
						tierlist: null
					});
					return;
				}

				if (shouldUseCompletedCache) {
					const cachedGames = completedGamesCache.getCachedCompletedGames(allGames);
					if (cachedGames) {
						filteredGames.set(cachedGames);
						const totalCount = cachedGames.length;
						const completedCount = cachedGames.length;
						const plannedCount = allGames.filter((g) => g.status === 'Planned').length;
						gameCounts.set({ total: totalCount, completed: completedCount, planned: plannedCount });

						filteredCountsStore.setCounts({
							all: totalCount,
							completed: completedCount,
							planned: plannedCount,
							tierlist: null
						});
					} else {
						worker.postMessage({
							type: 'APPLY_FILTERS',
							payload: { filters: currentFilters, allGames: allGames, activeTab: activeTab }
						});
					}
				} else {
					worker.postMessage({
						type: 'APPLY_FILTERS',
						payload: { filters: currentFilters, allGames: allGames, activeTab: activeTab }
					});
				}
			}

			if (performance.now() - start > 50) {
				document.body.classList.add('disable-animations');
				setTimeout(() => document.body.classList.remove('disable-animations'), 300);
			}
		}, 100);
	});

	return {
		subscribe: filters.subscribe,
		set: filters.set,
		update: filters.update,

		isAnyFilterApplied(): boolean {
			const state = get(filters);
			if (!state) return false;

			const defaultSearchTerm = baseFilters.searchTerm;
			const hasSearch = state.searchTerm.trim() !== defaultSearchTerm;
			const hasPlatforms = state.platforms.length > 0;
			const hasGenres = state.genres.length > 0;
			const hasStatuses = state.statuses.length > 0;
			const hasTiers = state.tiers.length > 0;
			const hasCoOp = state.coOp.length > 0;

			return hasSearch || hasPlatforms || hasGenres || hasStatuses || hasTiers || hasCoOp;
		},

		resetFilters: () => {
			const resetFilters: FilterState = {
				...baseFilters,
				platforms: [],
				genres: [],
				statuses: [],
				tiers: [],
				coOp: [],
				sortOption: null
			};
			filters.set(resetFilters);
		},

		togglePlatform(platform: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const platforms = $filters.platforms.includes(platform)
					? $filters.platforms.filter((p) => p !== platform)
					: [...$filters.platforms, platform];
				return { ...$filters, platforms };
			});
		},

		toggleGenre(genre: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const genres = $filters.genres.includes(genre)
					? $filters.genres.filter((g) => g !== genre)
					: [...$filters.genres, genre];
				return { ...$filters, genres };
			});
		},

		toggleStatus(status: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const statuses = $filters.statuses.includes(status)
					? $filters.statuses.filter((s) => s !== status)
					: [...$filters.statuses, status];
				return { ...$filters, statuses };
			});
		},

		toggleTier(tier: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const tiers = $filters.tiers.includes(tier)
					? $filters.tiers.filter((t) => t !== tier)
					: [...$filters.tiers, tier];
				return { ...$filters, tiers };
			});
		},

		toggleCoOp(coOpValue: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				const coOp = $filters.coOp.includes(coOpValue)
					? $filters.coOp.filter((c) => c !== coOpValue)
					: [...$filters.coOp, coOpValue];
				return { ...$filters, coOp };
			});
		},

		removePlatform(platform: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, platforms: $filters.platforms.filter((p) => p !== platform) };
			});
		},

		removeGenre(genre: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, genres: $filters.genres.filter((g) => g !== genre) };
			});
		},

		removeTier(tier: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, tiers: $filters.tiers.filter((t) => t !== tier) };
			});
		},

		removeCoOp(coOpValue: string) {
			filters.update(($filters) => {
				if (!$filters) return null;
				return { ...$filters, coOp: $filters.coOp.filter((c) => c !== coOpValue) };
			});
		},

		resetAllFilters() {
			this.resetFilters();
		},

		setSearchTerm(term: string) {
			filters.update(($filters) => {
				if (!$filters) return $filters;
				return { ...$filters, searchTerm: term };
			});
		},

		setSort(sortOption: SortOption | null) {
			filters.update(($filters) => {
				if (!$filters) return $filters;
				return { ...$filters, sortOption };
			});
		},

		selectedPlatforms: derived(filters, ($filters) => $filters?.platforms ?? []),
		selectedGenres: derived(filters, ($filters) => $filters?.genres ?? []),
		selectedTiers: derived(filters, ($filters) => $filters?.tiers ?? []),
		selectedCoOp: derived(filters, ($filters) => $filters?.coOp ?? []),
		searchQuery: derived(filters, ($filters) => $filters?.searchTerm ?? ''),

		createFilteredGamesStore: () => {
			const memoizedDerived = memoize((games: Game[], counts: GameCounts) => ({
				filteredGames: games,
				totalCount: counts.total,
				completedCount: counts.completed,
				plannedCount: counts.planned
			}));

			return derived([filteredGames, gameCounts], ([$filteredGames, $gameCounts]) => {
				return memoizedDerived($filteredGames, $gameCounts);
			});
		},

		readSearchFromURL(searchParams: URLSearchParams) {
			const search = searchParams.get('s');
			if (search) {
				this.setSearchTerm(search);
			}
		},

		writeSearchToURL: debounce(async () => {
			if (typeof window === 'undefined') return;
			try {
				const state = get(filters);
				const url = new URL(window.location.href);
				if (state?.searchTerm) {
					url.searchParams.set('s', state.searchTerm);
				} else {
					url.searchParams.delete('s');
				}
				await replaceState(url.toString(), { noscroll: true, keepFocus: true });
			} catch {
				// Ignore router initialization errors
			}
		}, 500)
	};
}

export const filtersStore = createFiltersStore();
