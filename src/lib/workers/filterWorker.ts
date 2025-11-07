/**
 * Web Worker for game filtering operations
 * Offloads CPU-intensive filtering to a separate thread to keep the main thread responsive
 */

import type { Game } from '../types/game.js';
import type { FilterState } from '../stores/filters.js';
import { getTierDisplayName } from '../utils/colorConstants.js';

// Type for worker messages
interface FilterMessage {
	type: 'LOAD_GAMES' | 'APPLY_FILTERS' | 'FILTER';
	payload: {
		games?: Game[];
		filters?: FilterState;
		allGames?: Game[];
		allGamesAndFilters?: {
			allGames: Game[];
			filters: FilterState;
		};
	};
}

interface FilterResponse {
	type: 'FILTER_RESULTS';
	payload: {
		filteredGames: Game[];
		counts: {
			total: number;
			completed: number;
			planned: number;
		};
	};
}

interface LoadResponse {
	type: 'GAMES_LOADED';
	payload: {
		gamesCount: number;
	};
}

// Global state in worker
let loadedGames: Game[] = [];

// Core filtering logic (same as in filters.ts but optimized for worker context)
function filterGames(games: Game[], filters: FilterState): Game[] {
	return games.filter((game) => {
		// Search query filter (title matching)
		if (filters.searchTerm.trim()) {
			const query = filters.searchTerm.toLowerCase().trim();
			const titleMatch = game.title.toLowerCase().includes(query);
			const genreMatch = game.genre.toLowerCase().includes(query);
			const platformMatch = game.platform.toLowerCase().includes(query);

			if (!titleMatch && !genreMatch && !platformMatch) {
				return false;
			}
		}

		// Platform filter
		if (filters.platforms.length > 0) {
			if (!filters.platforms.includes(game.platform)) {
				return false;
			}
		}

		// Genre filter
		if (filters.genres.length > 0) {
			if (!filters.genres.includes(game.genre)) {
				return false;
			}
		}

		// Year range filter
		if (filters.years && filters.years.length === 2) {
			const [minYear, maxYear] = filters.years;
			if (game.year < minYear || game.year > maxYear) {
				return false;
			}
		}

		// Status filter
		if (filters.statuses.length > 0) {
			if (!filters.statuses.includes(game.status)) {
				return false;
			}
		}

		// Tier filter (only show games that have the selected tiers)
		if (filters.tiers.length > 0) {
			// If tiers are selected, the game must have a tier and it must match
			if (!game.tier) {
				return false; // Filter out games without tiers
			}
			const gameTierFullName = getTierDisplayName(game.tier);
			if (!filters.tiers.includes(gameTierFullName)) {
				return false; // Filter out games with non-matching tiers
			}
		}

		// Rating range filters (only applies to games with ratings)
		if (filters.ratings[0] > 0 || filters.ratings[1] < 10) {
			const [minRating, maxRating] = filters.ratings;
			if (game.ratingPresentation === null) return false;
			if (game.ratingPresentation < minRating || game.ratingPresentation > maxRating) {
				return false;
			}
		}

		return true;
	});
}

// Main worker message handler
self.addEventListener('message', (event: MessageEvent<FilterMessage>) => {
	const { type, payload } = event.data;

	try {
		if (type === 'LOAD_GAMES') {
			// Store games for filtering
			if (payload.games) {
				loadedGames = payload.games;
				const response: LoadResponse = {
					type: 'GAMES_LOADED',
					payload: {
						gamesCount: loadedGames.length
					}
				};
				self.postMessage(response);
			}
		} else if (type === 'APPLY_FILTERS') {
			// Handle the message format from filters store
			const { filters, allGames } = payload;
			let gamesToFilter = loadedGames;

			// If games provided in payload, use those; otherwise use stored games
			if (allGames && allGames.length > 0) {
				gamesToFilter = allGames;
			}

			if (filters && gamesToFilter.length > 0) {
				// Perform filtering in the worker thread
				const filteredGames = filterGames(gamesToFilter, filters);

				// Calculate counts
				const totalCount = filteredGames.length;
				const completedCount = filteredGames.filter((g) => g.status === 'Completed').length;
				const plannedCount = filteredGames.filter((g) => g.status === 'Planned').length;

				// Send results back to main thread
				const response: FilterResponse = {
					type: 'FILTER_RESULTS',
					payload: {
						filteredGames,
						counts: {
							total: totalCount,
							completed: completedCount,
							planned: plannedCount
						}
					}
				};

				self.postMessage(response);
			}
		} else if (type === 'FILTER') {
			// Legacy support for direct filter calls
			const { games, filters } = payload;
			if (games && filters) {
				const filteredGames = filterGames(games, filters);
				const totalCount = filteredGames.length;
				const completedCount = filteredGames.filter((g) => g.status === 'Completed').length;
				const plannedCount = filteredGames.filter((g) => g.status === 'Planned').length;

				const response: FilterResponse = {
					type: 'FILTER_RESULTS',
					payload: {
						filteredGames,
						counts: {
							total: totalCount,
							completed: completedCount,
							planned: plannedCount
						}
					}
				};

				self.postMessage(response);
			}
		}
	} catch (error) {
		console.error('Worker filtering error:', error);
		// Send empty result on error
		self.postMessage({
			type: 'FILTER_RESULTS',
			payload: {
				filteredGames: [],
				counts: {
					total: 0,
					completed: 0,
					planned: 0
				}
			}
		});
	}
});
