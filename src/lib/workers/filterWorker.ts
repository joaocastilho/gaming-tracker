/**
 * Web Worker for game filtering operations
 * Offloads CPU-intensive filtering to a separate thread to keep the main thread responsive
 */

import type { Game } from '../types/game.js';
import type { FilterState } from '../stores/filters.js';
import { getTierDisplayName } from '../utils/colorConstants.js';
import { parseDate } from '../utils/dateUtils.js';

interface FilterMessage {
	type: 'LOAD_GAMES' | 'APPLY_FILTERS' | 'FILTER';
	payload: {
		games?: Game[];
		filters?: FilterState;
		allGames?: Game[];
		activeTab?: 'all' | 'completed' | 'planned' | 'tierlist';
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

let loadedGames: Game[] = [];

function filterGames(games: Game[], filters: FilterState): Game[] {
	return games.filter((game) => {
		if (filters.searchTerm.trim()) {
			const query = filters.searchTerm.toLowerCase().trim();
			const titleMatch = game.title.toLowerCase().includes(query);
			const genreMatch = game.genre.toLowerCase().includes(query);
			const platformMatch = game.platform.toLowerCase().includes(query);

			if (!titleMatch && !genreMatch && !platformMatch) {
				return false;
			}
		}

		if (filters.platforms.length > 0) {
			if (!filters.platforms.includes(game.platform)) {
				return false;
			}
		}

		if (filters.genres.length > 0) {
			if (!filters.genres.includes(game.genre)) {
				return false;
			}
		}

		if (filters.statuses.length > 0) {
			if (!filters.statuses.includes(game.status)) {
				return false;
			}
		}

		if (filters.tiers.length > 0) {
			if (!game.tier) {
				return false;
			}
			const gameTierFullName = getTierDisplayName(game.tier);
			if (!filters.tiers.includes(gameTierFullName)) {
				return false;
			}
		}

		if (filters.coOp.length > 0) {
			if (!filters.coOp.includes(game.coOp)) {
				return false;
			}
		}

		return true;
	});
}

function filterGamesWithoutStatus(games: Game[], filters: FilterState): Game[] {
	return games.filter((game) => {
		if (filters.searchTerm.trim()) {
			const query = filters.searchTerm.toLowerCase().trim();
			const titleMatch = game.title.toLowerCase().includes(query);
			const genreMatch = game.genre.toLowerCase().includes(query);
			const platformMatch = game.platform.toLowerCase().includes(query);

			if (!titleMatch && !genreMatch && !platformMatch) {
				return false;
			}
		}

		if (filters.platforms.length > 0) {
			if (!filters.platforms.includes(game.platform)) {
				return false;
			}
		}

		if (filters.genres.length > 0) {
			if (!filters.genres.includes(game.genre)) {
				return false;
			}
		}

		if (filters.tiers.length > 0) {
			if (!game.tier) {
				return false;
			}
			const gameTierFullName = getTierDisplayName(game.tier);
			if (!filters.tiers.includes(gameTierFullName)) {
				return false;
			}
		}

		if (filters.coOp.length > 0) {
			if (!filters.coOp.includes(game.coOp)) {
				return false;
			}
		}

		return true;
	});
}

export function applySortOption(games: Game[], sortOption: FilterState['sortOption']): Game[] {
	if (!sortOption) return games;

	const { key, direction } = sortOption;
	const dir = direction === 'asc' ? 1 : -1;

	return games.toSorted((a, b) => {
		if (key === 'finishedDate') {
			const aTime = parseDate(a.finishedDate);
			const bTime = parseDate(b.finishedDate);

			if (aTime === null && bTime === null) return 0;
			if (aTime === null) return 1;
			if (bTime === null) return -1;

			return direction === 'asc' ? aTime - bTime : bTime - aTime;
		}

		const getVal = (g: Game, k: string) => {
			if (k === 'presentation') return g.ratingPresentation;
			if (k === 'story') return g.ratingStory;
			if (k === 'gameplay') return g.ratingGameplay;
			if (k === 'score') return g.score;
			return 0;
		};

		const aRaw = getVal(a, key);
		const bRaw = getVal(b, key);

		const aHasData = aRaw !== null && aRaw !== undefined;
		const bHasData = bRaw !== null && bRaw !== undefined;

		if (aHasData && !bHasData) return -1;
		if (!aHasData && bHasData) return 1;
		if (!aHasData && !bHasData) return 0;

		const aVal = aRaw as number;
		const bVal = bRaw as number;

		if (aVal === bVal) return 0;
		return aVal > bVal ? dir : -dir;
	});
}

function filterAndSortForTab(
	games: Game[],
	tab: 'all' | 'completed' | 'planned' | 'tierlist',
	sortOption: FilterState['sortOption']
): Game[] {
	let base = games;

	switch (tab) {
		case 'completed':
			base = base.filter((game) => game.status === 'Completed');
			break;
		case 'planned':
			base = base.filter((game) => game.status === 'Planned');
			break;
		case 'all':
		default:
			break;
	}

	if (sortOption) {
		return applySortOption(base, sortOption);
	}

	if (tab === 'completed') {
		return base.toSorted((a, b) => {
			const aTime = parseDate(a.finishedDate);
			const bTime = parseDate(b.finishedDate);

			if (aTime === null && bTime === null) return 0;
			if (aTime === null) return 1;
			if (bTime === null) return -1;
			return bTime - aTime;
		});
	}

	return base.toSorted((a, b) => a.title.localeCompare(b.title));
}

self.addEventListener('message', (event: MessageEvent<FilterMessage>) => {
	const { type, payload } = event.data;

	try {
		if (type === 'LOAD_GAMES') {
			if (payload.games) {
				loadedGames = payload.games;
				const response: LoadResponse = {
					type: 'GAMES_LOADED',
					payload: { gamesCount: loadedGames.length }
				};
				self.postMessage(response);
			}
		} else if (type === 'APPLY_FILTERS') {
			const { filters, allGames, activeTab } = payload;
			let gamesToFilter = loadedGames;

			if (allGames && allGames.length > 0) {
				gamesToFilter = allGames;
			}

			if (filters && gamesToFilter.length > 0 && activeTab) {
				const baseFilteredGames = filterGames(gamesToFilter, filters);
				const baseFilteredGamesWithoutStatus = filterGamesWithoutStatus(gamesToFilter, filters);

				const totalCount = baseFilteredGamesWithoutStatus.length;
				const completedCount = baseFilteredGamesWithoutStatus.filter(
					(g) => g.status === 'Completed'
				).length;
				const plannedCount = baseFilteredGamesWithoutStatus.filter(
					(g) => g.status === 'Planned'
				).length;

				const finalFilteredGames =
					activeTab === 'tierlist'
						? []
						: filterAndSortForTab(baseFilteredGames, activeTab, filters.sortOption);

				const response: FilterResponse = {
					type: 'FILTER_RESULTS',
					payload: {
						filteredGames: finalFilteredGames,
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
	} catch {
		self.postMessage({
			type: 'FILTER_RESULTS',
			payload: {
				filteredGames: [],
				counts: { total: 0, completed: 0, planned: 0 }
			}
		});
	}
});

export default {};
