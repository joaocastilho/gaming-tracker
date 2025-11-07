/**
 * Web Worker for game filtering operations
 * Offloads CPU-intensive filtering to a separate thread to keep the main thread responsive
 */

import type { Game } from '../types/game.js';
import type { FilterState } from '../stores/filters.js';

// Type for worker messages
interface FilterMessage {
	type: 'FILTER';
	payload: {
		games: Game[];
		filters: FilterState;
	};
}

interface FilterResponse {
	type: 'FILTERED';
	payload: {
		filteredGames: Game[];
		totalCount: number;
		completedCount: number;
		plannedCount: number;
	};
}

// Core filtering logic (same as in filters.ts but optimized for worker context)
function filterGames(games: Game[], filters: FilterState): Game[] {
	return games.filter((game) => {
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
			// Map full tier names back to single letters for comparison
			const tierMapping: Record<string, string> = {
				'S - Masterpiece': 'S',
				'A - Amazing': 'A',
				'B - Great': 'B',
				'C - Good': 'C',
				'D - Decent': 'D',
				'E - Bad': 'E'
			};

			// Convert selected full tier names to single letters
			const selectedTierLetters = filters.selectedTiers
				.map((tier) => tierMapping[tier])
				.filter(Boolean);

			if (game.status === 'Completed' && game.tier) {
				if (!selectedTierLetters.includes(game.tier)) {
					return false;
				}
			} else {
				// If filtering by tier, exclude games that are not completed or don't have a tier
				return false;
			}
		}

		// Rating range filters (only applies to completed games with ratings)
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

			// Check if ratings fall within specified ranges
			if (game.ratingPresentation < pMin || game.ratingPresentation > pMax) return false;
			if (game.ratingStory < sMin || game.ratingStory > sMax) return false;
			if (game.ratingGameplay < gMin || game.ratingGameplay > gMax) return false;

			// Calculate total score and check range
			const totalScore = Math.round(
				((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2
			);
			if (totalScore < tMin || totalScore > tMax) return false;
		}

		return true;
	});
}

// Main worker message handler
self.addEventListener('message', (event: MessageEvent<FilterMessage>) => {
	const { type, payload } = event.data;

	if (type === 'FILTER') {
		try {
			const { games, filters } = payload;

			// Perform filtering in the worker thread
			const filteredGames = filterGames(games, filters);

			// Calculate counts
			const totalCount = filteredGames.length;
			const completedCount = filteredGames.filter((g) => g.status === 'Completed').length;
			const plannedCount = filteredGames.filter((g) => g.status === 'Planned').length;

			// Send results back to main thread
			const response: FilterResponse = {
				type: 'FILTERED',
				payload: {
					filteredGames,
					totalCount,
					completedCount,
					plannedCount
				}
			};

			self.postMessage(response);
		} catch (error) {
			console.error('Worker filtering error:', error);
			// Send empty result on error
			self.postMessage({
				type: 'FILTERED',
				payload: {
					filteredGames: [],
					totalCount: 0,
					completedCount: 0,
					plannedCount: 0
				}
			});
		}
	}
});
