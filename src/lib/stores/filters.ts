import { writable, derived, get } from 'svelte/store';
import { gamesStore } from './games';
import { appStore } from './app';
import { completedGamesCache } from './completedGamesCache';
import { filteredCountsStore } from './filteredCounts';
import type { Game } from '$lib/types/game';
import { getUrlParams, setUrlParams } from '$lib/utils/clientUtils';
import FilterWorker from '$lib/workers/filterWorker.ts?worker';

// Define browser check for test environments
const browser = typeof window !== 'undefined';

function memoize<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => TReturn
): (...args: TArgs) => TReturn {
	const cache = new Map<string, TReturn>();
	return (...args: TArgs) => {
		const key = JSON.stringify(args);
		if (cache.has(key)) {
			return cache.get(key)!;
		}
		const result = fn(...args);
		cache.set(key, result);
		return result;
	};
}

export type SortKey = 'presentation' | 'story' | 'gameplay' | 'score';

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

		// Always update counts when games change, regardless of initialization
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
				sortOption: null
			};

			const loadedFilters = initialFilters;
			filters.set(loadedFilters);
			if (worker) {
				worker.postMessage({ type: 'LOAD_GAMES', payload: games });
				// Don't send APPLY_FILTERS here - let filtersAndTab handle it
			}
		}

		// Update the completed games cache when games change
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

				// Update filtered counts for all tabs
				filteredCountsStore.setCounts({
					all: payload.counts.total,
					completed: payload.counts.completed,
					planned: payload.counts.planned,
					tierlist: null
				});
			}
		};
	}

	// Track last processing to prevent duplicate calls
	let lastProcessedKey = '';
	let filterUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

	filtersAndTab.subscribe((currentData) => {
		const { filters: currentFilters, activeTab } = currentData;
		if (!currentFilters) return;

		// Create a unique key for this filter/tab combination
		const processingKey = `${activeTab}-${JSON.stringify({
			searchTerm: currentFilters.searchTerm,
			platforms: currentFilters.platforms,
			genres: currentFilters.genres,
			statuses: currentFilters.statuses,
			tiers: currentFilters.tiers,
			sortOption: currentFilters.sortOption
		})}`;

		// Clear previous timeout to debounce rapid updates
		if (filterUpdateTimeout) {
			clearTimeout(filterUpdateTimeout);
		}

		// Debounce filter processing to avoid excessive worker calls
		filterUpdateTimeout = setTimeout(() => {
			// Skip processing if this is an exact duplicate of the last call
			if (processingKey === lastProcessedKey) {
				return;
			}

			// Performance Guard - Start timing
			const start = performance.now();

			lastProcessedKey = processingKey;
			const allGames = get(gamesStore);
			if (allGames.length > 0 && worker) {
				// Log filter state when filters are applied
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
				if (currentFilters.sortOption)
					activeFilters.push(
						`sort:${currentFilters.sortOption.key}_${currentFilters.sortOption.direction}`
					);

				// Check if we should use cache for completed tab (only when no custom filters and not sorting)
				const shouldUseCompletedCache =
					activeTab === 'completed' &&
					!currentFilters.searchTerm.trim() &&
					currentFilters.platforms.length === 0 &&
					currentFilters.genres.length === 0 &&
					currentFilters.tiers.length === 0 &&
					currentFilters.statuses.length === 1 &&
					currentFilters.statuses.includes('Completed') &&
					!currentFilters.sortOption;

				// For "all" tab with no filters, we don't need to call the worker at all
				// The main page will handle this case directly
				const shouldSkipWorkerForAllTab =
					activeTab === 'all' && activeFilters.length === 0 && !currentFilters.sortOption;

				if (shouldSkipWorkerForAllTab) {
					// Update filtered counts with total counts when skipping worker for 'all' tab
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
					// Use cached completed games for optimal performance
					const cachedGames = completedGamesCache.getCachedCompletedGames(allGames);
					if (cachedGames) {
						filteredGames.set(cachedGames);
						const totalCount = cachedGames.length;
						const completedCount = cachedGames.length;
						const plannedCount = allGames.filter((g) => g.status === 'Planned').length;
						gameCounts.set({ total: totalCount, completed: completedCount, planned: plannedCount });

						// Update filtered counts store for header tabs
						filteredCountsStore.setCounts({
							all: totalCount,
							completed: completedCount,
							planned: plannedCount,
							tierlist: null
						});
					} else {
						// Fallback to worker if cache is not available
						worker.postMessage({
							type: 'APPLY_FILTERS',
							payload: { filters: currentFilters, allGames: allGames, activeTab: activeTab }
						});
					}
				} else {
					// For all other cases (including planned tab), use worker
					worker.postMessage({
						type: 'APPLY_FILTERS',
						payload: { filters: currentFilters, allGames: allGames, activeTab: activeTab }
					});
				}
			}

			// Performance Guard - Check if filtering took too long
			if (performance.now() - start > 50) {
				document.body.classList.add('disable-animations');
				setTimeout(() => document.body.classList.remove('disable-animations'), 300);
			}
		}, 100); // Increased debounce to 100ms for better deduplication
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

			return hasSearch || hasPlatforms || hasGenres || hasStatuses || hasTiers;
		},

		resetFilters: () => {
			const resetFilters: FilterState = {
				...baseFilters,
				platforms: [],
				genres: [],
				statuses: [],
				tiers: [],
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

		readFromURL: (searchParams: URLSearchParams) => {
			const params = getUrlParams(searchParams);
			filters.update((currentFilters) => {
				if (!currentFilters) return null;
				return {
					...currentFilters,
					searchTerm: params.searchTerm ?? '',
					platforms: params.platforms ?? [],
					genres: params.genres ?? [],
					statuses: params.statuses ?? [],
					tiers: params.tiers ?? [],
					sortOption: params.sortOption ?? null
				};
			});
		},

		writeToURL: () => {
			const currentFilters = get(filters);
			const $allPlatforms = get(gamesStore.allPlatforms);
			const $allGenres = get(gamesStore.allGenres);
			if (currentFilters && $allPlatforms.length > 0 && $allGenres.length > 0) {
				setUrlParams(currentFilters, $allPlatforms, $allGenres);
			}
		}
	};
}

export const filtersStore = createFiltersStore();
