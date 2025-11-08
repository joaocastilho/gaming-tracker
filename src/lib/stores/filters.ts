import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { gamesStore } from './games';
import { appStore } from './app';
import type { Game } from '$lib/types/game';
import { getUrlParams, setUrlParams } from '$lib/utils/clientUtils';
import FilterWorker from '$lib/workers/filterWorker?worker';

// Add memoization utility
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

export interface FilterState {
	searchTerm: string;
	platforms: string[];
	genres: string[];
	years: [number, number];
	ratings: [number, number];
	statuses: string[];
	tiers: string[];
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

const baseFilters: Pick<FilterState, 'searchTerm' | 'years' | 'ratings'> = {
	searchTerm: '',
	years: [1980, new Date().getFullYear()],
	ratings: [0, 10]
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
		if (games.length > 0 && platforms.length > 0 && genres.length > 0 && !hasInitialized) {
			hasInitialized = true;
			const initialFilters: FilterState = {
				...baseFilters,
				platforms: [], // Start with empty selection
				genres: [], // Start with empty selection
				statuses: ['Completed', 'Planned'], // Keep default statuses
				tiers: [] // Start with empty tier selection
			};

			let loadedFilters = initialFilters;
			if (browser) {
				const savedFilters = localStorage.getItem('gaming-tracker-filters');
				if (savedFilters) {
					try {
						const parsed: Partial<FilterState> = JSON.parse(savedFilters);
						loadedFilters = {
							...initialFilters,
							...parsed,
							platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [], // Use empty array as fallback
							genres: Array.isArray(parsed.genres) ? parsed.genres : [], // Use empty array as fallback
							years:
								Array.isArray(parsed.years) && parsed.years.length === 2
									? (parsed.years as [number, number])
									: initialFilters.years,
							ratings:
								Array.isArray(parsed.ratings) && parsed.ratings.length === 2
									? (parsed.ratings as [number, number])
									: initialFilters.ratings,
							statuses: Array.isArray(parsed.statuses) ? parsed.statuses : initialFilters.statuses,
							tiers: Array.isArray(parsed.tiers) ? parsed.tiers : [] // Use empty array as fallback
						};
					} catch {
						// Ignore invalid storage
					}
				}
			}

			filters.set(loadedFilters);
			if (worker) {
				worker.postMessage({ type: 'LOAD_GAMES', payload: games });
				const initialTab = get(appStore.activeTab);
				worker.postMessage({
					type: 'APPLY_FILTERS',
					payload: { filters: loadedFilters, allGames: games, activeTab: initialTab }
				});
			}
		}
	});

	if (worker) {
		worker.onmessage = (event: MessageEvent) => {
			const { type, payload } = event.data;
			if (type === 'FILTER_RESULTS') {
				filteredGames.set(payload.filteredGames);
				gameCounts.set(payload.counts);
			}
		};
	}

	filtersAndTab.subscribe((currentData) => {
		const { filters: currentFilters, activeTab } = currentData;
		if (!currentFilters) return;

		const allGames = get(gamesStore);
		if (allGames.length > 0 && worker) {
			worker.postMessage({
				type: 'APPLY_FILTERS',
				payload: { filters: currentFilters, allGames: allGames, activeTab: activeTab }
			});
		}

		if (browser) {
			localStorage.setItem('gaming-tracker-filters', JSON.stringify(currentFilters));
		}
	});

	return {
		subscribe: filters.subscribe,
		set: filters.set,
		update: filters.update,

		resetFilters: () => {
			const resetFilters: FilterState = {
				...baseFilters,
				platforms: [], // Reset to empty selection
				genres: [], // Reset to empty selection
				statuses: ['Completed', 'Planned'],
				tiers: [] // Reset to empty tier selection
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

		setYearsRange(years: [number, number]) {
			filters.update(($filters) => {
				if (!$filters) return $filters;
				return { ...$filters, years };
			});
		},

		setRatingsRange(ratings: [number, number]) {
			filters.update(($filters) => {
				if (!$filters) return $filters;
				return { ...$filters, ratings };
			});
		},

		ratingRanges: derived(filters, ($filters) => ({
			presentation: $filters?.ratings ?? [0, 10],
			story: $filters?.ratings ?? [0, 10],
			gameplay: $filters?.ratings ?? [0, 10],
			total: $filters?.ratings
				? ([Math.round($filters.ratings[0] * 2), Math.round($filters.ratings[1] * 2)] as [
						number,
						number
					])
				: [0, 20]
		})),
		selectedPlatforms: derived(filters, ($filters) => $filters?.platforms ?? []),
		selectedGenres: derived(filters, ($filters) => $filters?.genres ?? []),
		selectedTiers: derived(filters, ($filters) => $filters?.tiers ?? []),
		searchQuery: derived(filters, ($filters) => $filters?.searchTerm ?? ''),

		createFilteredGamesStore: () => {
			// Memoize the derived store computation
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
					searchTerm: params.searchTerm ?? currentFilters.searchTerm,
					platforms: params.platforms ?? currentFilters.platforms,
					genres: params.genres ?? currentFilters.genres,
					statuses: params.statuses ?? currentFilters.statuses,
					ratings: params.ratings ?? currentFilters.ratings,
					years: params.years ?? currentFilters.years,
					tiers: params.tiers ?? currentFilters.tiers
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
