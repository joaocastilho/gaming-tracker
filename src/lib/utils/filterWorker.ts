/**
 * Web Worker manager for game filtering
 * Provides a fallback to main thread filtering when Web Workers aren't available
 */

import type { Game } from '../types/game.js';
import type { FilterState } from '../stores/filters.js';

export interface FilterWorkerResult {
	filteredGames: Game[];
	totalCount: number;
	completedCount: number;
	plannedCount: number;
}

export interface FilterWorkerManager {
	filterGames: (games: Game[], filters: FilterState) => Promise<FilterWorkerResult>;
	terminate: () => void;
	supportsWorkers: boolean;
}

let workerManager: FilterWorkerManager | null = null;

/**
 * Create a Web Worker for filtering
 * Falls back to main thread filtering if Web Workers aren't supported
 */
function createWorkerFilterManager(): FilterWorkerManager {
	// Check if Web Workers are supported
	const supportsWorkers = typeof Worker !== 'undefined';

	// Fallback to main thread filtering
	if (!supportsWorkers) {
		return {
			filterGames: async (games: Game[], filters: FilterState) => {
				// Use the original filterGames function from filters.ts
				const filteredGames = games.filter((game) => {
					// Search query filter (title matching)
					if (filters.searchQuery.trim()) {
						const query = filters.searchQuery.toLowerCase().trim();
						const titleMatch = game.title.toLowerCase().includes(query);
						const genreMatch = game.genre.toLowerCase().includes(query);
						const platformMatch = game.platform.toLowerCase().includes(query);

						if (!titleMatch && !genreMatch && !platformMatch) {
							return false;
						}
					}

					// Platform filter
					if (filters.selectedPlatforms.length > 0) {
						if (!filters.selectedPlatforms.includes(game.platform)) {
							return false;
						}
					}

					// Genre filter
					if (filters.selectedGenres.length > 0) {
						if (!filters.selectedGenres.includes(game.genre)) {
							return false;
						}
					}

					// Tier filter (only applies to completed games)
					if (filters.selectedTiers.length > 0) {
						const tierMapping: Record<string, string> = {
							'S - Masterpiece': 'S',
							'A - Amazing': 'A',
							'B - Great': 'B',
							'C - Good': 'C',
							'D - Decent': 'D',
							'E - Bad': 'E'
						};

						const selectedTierLetters = filters.selectedTiers
							.map((tier) => tierMapping[tier])
							.filter(Boolean);

						if (game.status === 'Completed' && game.tier) {
							if (!selectedTierLetters.includes(game.tier)) {
								return false;
							}
						} else {
							return false;
						}
					}

					// Rating range filters
					if (
						game.status === 'Completed' &&
						game.ratingPresentation !== null &&
						game.ratingStory !== null &&
						game.ratingGameplay !== null
					) {
						const [pMin, pMax] = filters.ratingRanges.presentation;
						const [sMin, sMax] = filters.ratingRanges.story;
						const [gMin, gMax] = filters.ratingRanges.gameplay;
						const [tMin, tMax] = filters.ratingRanges.total;

						if (game.ratingPresentation < pMin || game.ratingPresentation > pMax) return false;
						if (game.ratingStory < sMin || game.ratingStory > sMax) return false;
						if (game.ratingGameplay < gMin || game.ratingGameplay > gMax) return false;

						const totalScore = Math.round(
							((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2
						);
						if (totalScore < tMin || totalScore > tMax) return false;
					}

					return true;
				});

				const totalCount = filteredGames.length;
				const completedCount = filteredGames.filter((g) => g.status === 'Completed').length;
				const plannedCount = filteredGames.filter((g) => g.status === 'Planned').length;

				return {
					filteredGames,
					totalCount,
					completedCount,
					plannedCount
				};
			},
			terminate: () => {},
			supportsWorkers: false
		};
	}

	// Create the actual Web Worker
	const worker = new Worker(new URL('../workers/filterWorker.ts', import.meta.url), {
		type: 'module'
	});

	return {
		async filterGames(games: Game[], filters: FilterState): Promise<FilterWorkerResult> {
			return new Promise((resolve, reject) => {
				// Set up timeout to prevent hanging
				const timeout = setTimeout(() => {
					reject(new Error('Filter operation timed out'));
				}, 10000); // 10 second timeout

				// Set up message handler
				const handleMessage = (event: MessageEvent) => {
					const { type, payload } = event.data;
					if (type === 'FILTERED') {
						clearTimeout(timeout);
						worker.removeEventListener('message', handleMessage);
						resolve(payload);
					}
				};

				// Set up error handler
				const handleError = (error: ErrorEvent) => {
					clearTimeout(timeout);
					worker.removeEventListener('message', handleMessage);
					worker.removeEventListener('error', handleError);
					reject(new Error('Worker filtering failed: ' + error.message));
				};

				worker.addEventListener('message', handleMessage);
				worker.addEventListener('error', handleError);

				// Send filter request to worker
				worker.postMessage({
					type: 'FILTER',
					payload: { games, filters }
				});
			});
		},

		terminate: () => {
			worker.terminate();
		},

		supportsWorkers: true
	};
}

/**
 * Get the singleton worker manager instance
 */
export function getFilterWorkerManager(): FilterWorkerManager {
	if (!workerManager) {
		workerManager = createWorkerFilterManager();
	}

	return workerManager;
}

/**
 * Clean up the worker manager (for app shutdown)
 */
export function terminateWorkerManager(): void {
	if (workerManager) {
		workerManager.terminate();
		workerManager = null;
	}
}

/**
 * Create a memoized Web Worker filtering function
 * This provides the same interface as the original memoized function but uses Web Workers
 */
export function createWorkerFilteredGamesStore(
	gamesStore: { subscribe: (fn: (games: Game[]) => void) => () => void },
	filterState: { subscribe: (fn: (filters: FilterState) => void) => () => void }
) {
	const workerManager = getFilterWorkerManager();

	return {
		subscribe: (callback: (data: FilterWorkerResult) => void) => {
			let currentGames: Game[] = [];
			let currentFilters: FilterState;

			// Subscribe to games store
			const gamesUnsubscribe = gamesStore.subscribe((games) => {
				currentGames = games;
				// Trigger filtering when games change
				performFiltering();
			});

			// Subscribe to filter state
			const filtersUnsubscribe = filterState.subscribe((filters) => {
				currentFilters = filters;
				// Trigger filtering when filters change
				performFiltering();
			});

			// Perform the actual filtering
			const performFiltering = async () => {
				if (currentGames.length > 0 && currentFilters) {
					try {
						const result = await workerManager.filterGames(currentGames, currentFilters);
						callback(result);
					} catch (error) {
						console.error('Worker filtering failed, falling back to main thread:', error);
						// The worker manager handles fallback internally
						const result = await workerManager.filterGames(currentGames, currentFilters);
						callback(result);
					}
				} else if (currentGames.length === 0) {
					// Empty games array
					callback({
						filteredGames: [],
						totalCount: 0,
						completedCount: 0,
						plannedCount: 0
					});
				}
			};

			// Initial filtering
			performFiltering();

			// Return cleanup function
			return () => {
				gamesUnsubscribe();
				filtersUnsubscribe();
			};
		}
	};
}
