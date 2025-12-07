/**
 * Search, Filter, and Sort Integration Tests
 * Tests that verify the core functionality of searching, filtering, and sorting games.
 * These tests ensure that changes to filters/search/sort actually affect the filtered results.
 * 
 * IMPORTANT: These tests use singleton store imports (like the app) to ensure we test
 * actual production behavior, including caching. State is reset between tests using
 * store reset methods instead of vi.resetModules().
 */
import { beforeEach, describe, expect, it } from 'vitest';
import type { Game } from '$lib/types/game';
import { gamesStore } from '$lib/stores/games.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';

// Mock game data for testing
const mockGames: Partial<Game>[] = [
	{
		id: '1',
		title: 'Zelda: Breath of the Wild',
		platform: 'Nintendo Switch',
		genre: 'Action-Adventure',
		status: 'Completed',
		score: 95,
		tier: 'S',
		coOp: 'No',
		finishedDate: '15/03/2023',
		ratingGameplay: 10,
		ratingPresentation: 9,
		ratingStory: 8
	},
	{
		id: '2',
		title: 'Dark Souls III',
		platform: 'PC',
		genre: 'Action RPG',
		status: 'Completed',
		score: 88,
		tier: 'A',
		coOp: 'Yes',
		finishedDate: '20/01/2023',
		ratingGameplay: 9,
		ratingPresentation: 8,
		ratingStory: 7
	},
	{
		id: '3',
		title: 'Hollow Knight',
		platform: 'PC',
		genre: 'Metroidvania',
		status: 'Completed',
		score: 92,
		tier: 'S',
		coOp: 'No',
		finishedDate: '10/06/2023',
		ratingGameplay: 10,
		ratingPresentation: 9,
		ratingStory: 8
	},
	{
		id: '4',
		title: 'Elden Ring',
		platform: 'PC',
		genre: 'Action RPG',
		status: 'Planned',
		score: null,
		tier: null,
		coOp: 'Yes',
		finishedDate: null,
		ratingGameplay: null,
		ratingPresentation: null,
		ratingStory: null
	},
	{
		id: '5',
		title: 'Mario Odyssey',
		platform: 'Nintendo Switch',
		genre: 'Platformer',
		status: 'Completed',
		score: 90,
		tier: 'A',
		coOp: 'No',
		finishedDate: '05/02/2023',
		ratingGameplay: 9,
		ratingPresentation: 10,
		ratingStory: 6
	}
];

// Helper to reset all store state between tests (mimics app restart)
function resetStoreState() {
	// Clear filters
	filtersStore.resetAllFilters();
	filtersStore.setSearchTerm('');
	filtersStore.setSort(null);

	// Clear caches
	filteredGamesStore.clearCache();

	// Reinitialize games
	gamesStore.initializeGames(mockGames);
}

describe('Search Functionality', () => {
	beforeEach(() => {
		resetStoreState();
	});

	it('should filter games by title when search term is set', () => {
		// Search for "Zelda"
		filtersStore.setSearchTerm('Zelda');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(1);
		expect(results[0].title).toBe('Zelda: Breath of the Wild');
	});

	it('should filter games by partial title match (case insensitive)', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		// Search for "souls" (lowercase)
		filtersStore.setSearchTerm('souls');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(1);
		expect(results[0].title).toBe('Dark Souls III');
	});

	it('should filter games by genre', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		// Search for "RPG"
		filtersStore.setSearchTerm('RPG');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(2); // Dark Souls III and Elden Ring
		expect(results.map((g) => g.title)).toContain('Dark Souls III');
		expect(results.map((g) => g.title)).toContain('Elden Ring');
	});

	it('should filter games by platform', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		// Search for "Switch"
		filtersStore.setSearchTerm('Switch');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(2); // Zelda and Mario
	});

	it('should return all games when search term is cleared', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSearchTerm('Zelda');
		expect(filteredGamesStore.games).toHaveLength(1);

		filtersStore.setSearchTerm('');
		expect(filteredGamesStore.games).toHaveLength(5);
	});

	it('should allow clearing search multiple times in sequence', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		// First search and clear
		filtersStore.setSearchTerm('Zelda');
		expect(filteredGamesStore.games).toHaveLength(1);
		filtersStore.setSearchTerm('');
		expect(filteredGamesStore.games).toHaveLength(5);
		expect(filtersStore.state?.searchTerm).toBe('');

		// Second search and clear
		filtersStore.setSearchTerm('Souls');
		expect(filteredGamesStore.games).toHaveLength(1);
		filtersStore.setSearchTerm('');
		expect(filteredGamesStore.games).toHaveLength(5);
		expect(filtersStore.state?.searchTerm).toBe('');

		// Third search and clear
		filtersStore.setSearchTerm('Mario');
		expect(filteredGamesStore.games).toHaveLength(1);
		filtersStore.setSearchTerm('');
		expect(filteredGamesStore.games).toHaveLength(5);
		expect(filtersStore.state?.searchTerm).toBe('');
	});

	it('should not interfere with typing when setting consecutive search terms', async () => {
		const { filtersStore } = await import('$lib/stores/filters.svelte');

		// Simulate typing "Zelda" character by character (like user typing)
		filtersStore.setSearchTerm('Z');
		expect(filtersStore.state?.searchTerm).toBe('Z');

		filtersStore.setSearchTerm('Ze');
		expect(filtersStore.state?.searchTerm).toBe('Ze');

		filtersStore.setSearchTerm('Zel');
		expect(filtersStore.state?.searchTerm).toBe('Zel');

		filtersStore.setSearchTerm('Zelda');
		expect(filtersStore.state?.searchTerm).toBe('Zelda');

		// Clear should work after typing
		filtersStore.setSearchTerm('');
		expect(filtersStore.state?.searchTerm).toBe('');
	});

	it('should clear search and show all games even when no results match', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		// Search for non-existent game
		filtersStore.setSearchTerm('XYZ_NONEXISTENT');
		expect(filteredGamesStore.games).toHaveLength(0);

		// Clear should work and show all games
		filtersStore.setSearchTerm('');
		expect(filtersStore.state?.searchTerm).toBe('');
		expect(filteredGamesStore.games).toHaveLength(5);
	});

	it('should clear search but preserve other filters', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		// Apply platform filter
		filtersStore.togglePlatform('PC');
		expect(filteredGamesStore.games).toHaveLength(3); // PC games

		// Search within filtered results
		filtersStore.setSearchTerm('Souls');
		expect(filteredGamesStore.games).toHaveLength(1);

		// Clear search (but keep filter)
		filtersStore.setSearchTerm('');
		expect(filtersStore.state?.searchTerm).toBe('');
		expect(filteredGamesStore.games).toHaveLength(3); // Back to all PC games
	});

	it('should return empty array when no games match search', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSearchTerm('NONEXISTENT');

		expect(filteredGamesStore.games).toHaveLength(0);
	});

	it('should clear search and show all tab games after navigation (bug fix test)', async () => {
		// This test verifies the fix for: search → tab change → clear
		// Bug was: URL sync effect restored search term after clear
		const { appStore } = await import('$lib/stores/app.svelte');

		// Search for "Ring" on default tab
		filtersStore.setSearchTerm('Ring');
		expect(filteredGamesStore.games).toHaveLength(1); // Elden Ring

		// Navigate to Planned tab
		appStore.setActiveTab('planned');
		const filteredPlanned = filteredGamesStore.games;
		expect(filteredPlanned).toHaveLength(1); // Elden Ring is Planned

		// Clear search - critical: should show ALL planned games
		filtersStore.setSearchTerm('');
		const allPlanned = filteredGamesStore.games;

		// Verify search is cleared and gallery updated
		expect(filtersStore.state?.searchTerm).toBe('');
		expect(allPlanned).toHaveLength(1); // Still 1 because we only have 1 Planned game
		expect(allPlanned.every(g => g.status === 'Planned')).toBe(true);
	});
});

describe('Platform Filter Functionality', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should filter games by single platform', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.togglePlatform('PC');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(3); // Dark Souls, Hollow Knight, Elden Ring
		expect(results.every((g) => g.platform === 'PC')).toBe(true);
	});

	it('should filter games by Nintendo Switch', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.togglePlatform('Nintendo Switch');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(2); // Zelda and Mario
		expect(results.every((g) => g.platform === 'Nintendo Switch')).toBe(true);
	});

	it('should remove platform filter when toggled off', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.togglePlatform('PC');
		expect(filteredGamesStore.games).toHaveLength(3);

		filtersStore.togglePlatform('PC'); // Toggle off
		expect(filteredGamesStore.games).toHaveLength(5);
	});
});

describe('Genre Filter Functionality', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should filter games by genre', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.toggleGenre('Action RPG');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(2); // Dark Souls and Elden Ring
		expect(results.every((g) => g.genre === 'Action RPG')).toBe(true);
	});

	it('should remove genre filter when toggled off', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.toggleGenre('Metroidvania');
		expect(filteredGamesStore.games).toHaveLength(1);

		filtersStore.toggleGenre('Metroidvania'); // Toggle off
		expect(filteredGamesStore.games).toHaveLength(5);
	});
});

describe('Tier Filter Functionality', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should filter games by tier', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.toggleTier('S - Masterpiece');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(2); // Zelda and Hollow Knight
		expect(results.every((g) => g.tier === 'S')).toBe(true);
	});

	it('should filter games by A tier', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.toggleTier('A - Amazing');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(2); // Dark Souls and Mario
		expect(results.every((g) => g.tier === 'A')).toBe(true);
	});
});

describe('Co-Op Filter Functionality', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should filter games by co-op Yes', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.toggleCoOp('Yes');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(2); // Dark Souls and Elden Ring
		expect(results.every((g) => g.coOp === 'Yes')).toBe(true);
	});

	it('should filter games by co-op No', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.toggleCoOp('No');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(3); // Zelda, Hollow Knight, Mario
		expect(results.every((g) => g.coOp === 'No')).toBe(true);
	});
});

describe('Sorting Functionality', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should sort games by score descending', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSort({ key: 'score', direction: 'desc' });

		const results = filteredGamesStore.games;
		// Games with scores should come first, sorted by score descending
		// Elden Ring has null score so should be last
		const gamesWithScores = results.filter((g) => g.score !== null);
		for (let i = 0; i < gamesWithScores.length - 1; i++) {
			expect(gamesWithScores[i].score).toBeGreaterThanOrEqual(gamesWithScores[i + 1].score!);
		}
	});

	it('should sort games by score ascending', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSort({ key: 'score', direction: 'asc' });

		const results = filteredGamesStore.games;
		const gamesWithScores = results.filter((g) => g.score !== null);
		for (let i = 0; i < gamesWithScores.length - 1; i++) {
			expect(gamesWithScores[i].score).toBeLessThanOrEqual(gamesWithScores[i + 1].score!);
		}
	});

	it('should sort games alphabetically ascending', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSort({ key: 'alphabetical', direction: 'asc' });

		const results = filteredGamesStore.games;
		for (let i = 0; i < results.length - 1; i++) {
			expect(results[i].title.localeCompare(results[i + 1].title)).toBeLessThanOrEqual(0);
		}
	});

	it('should sort games alphabetically descending', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSort({ key: 'alphabetical', direction: 'desc' });

		const results = filteredGamesStore.games;
		for (let i = 0; i < results.length - 1; i++) {
			expect(results[i].title.localeCompare(results[i + 1].title)).toBeGreaterThanOrEqual(0);
		}
	});

	it('should sort games by gameplay rating', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSort({ key: 'gameplay', direction: 'desc' });

		const results = filteredGamesStore.games;
		const gamesWithRating = results.filter((g) => g.ratingGameplay !== null);
		for (let i = 0; i < gamesWithRating.length - 1; i++) {
			expect(gamesWithRating[i].ratingGameplay).toBeGreaterThanOrEqual(
				gamesWithRating[i + 1].ratingGameplay!
			);
		}
	});

	it('should sort games by presentation rating', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSort({ key: 'presentation', direction: 'desc' });

		const results = filteredGamesStore.games;
		const gamesWithRating = results.filter((g) => g.ratingPresentation !== null);
		for (let i = 0; i < gamesWithRating.length - 1; i++) {
			expect(gamesWithRating[i].ratingPresentation).toBeGreaterThanOrEqual(
				gamesWithRating[i + 1].ratingPresentation!
			);
		}
	});

	it('should sort games by story rating', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSort({ key: 'story', direction: 'desc' });

		const results = filteredGamesStore.games;
		const gamesWithRating = results.filter((g) => g.ratingStory !== null);
		for (let i = 0; i < gamesWithRating.length - 1; i++) {
			expect(gamesWithRating[i].ratingStory).toBeGreaterThanOrEqual(
				gamesWithRating[i + 1].ratingStory!
			);
		}
	});
});

describe('Combined Filters', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should apply both search and platform filter', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.setSearchTerm('Souls');
		filtersStore.togglePlatform('PC');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(1);
		expect(results[0].title).toBe('Dark Souls III');
	});

	it('should apply search, platform, and sort together', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.togglePlatform('PC');
		filtersStore.setSort({ key: 'score', direction: 'desc' });

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(3); // PC games only
		// Hollow Knight (92) should come before Dark Souls (88)
		const scores = results.filter((g) => g.score !== null).map((g) => g.score);
		for (let i = 0; i < scores.length - 1; i++) {
			expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]!);
		}
	});

	it('should apply genre and tier filters together', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.toggleGenre('Action RPG');
		filtersStore.toggleTier('A - Amazing');

		const results = filteredGamesStore.games;
		expect(results).toHaveLength(1);
		expect(results[0].title).toBe('Dark Souls III');
	});

	it('should return empty when combined filters match nothing', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		filtersStore.togglePlatform('PC');
		filtersStore.toggleTier('S - Masterpiece');
		filtersStore.toggleCoOp('Yes');

		// No PC games with S tier and Co-op
		const results = filteredGamesStore.games;
		expect(results).toHaveLength(0);
	});
});

describe('Reset Filters', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should clear all filters and return all games', async () => {
		const { gamesStore } = await import('$lib/stores/games.svelte');
		const { filtersStore } = await import('$lib/stores/filters.svelte');
		const { filteredGamesStore } = await import('$lib/stores/filteredGamesStore.svelte');

		gamesStore.initializeGames(mockGames);

		// Apply multiple filters
		filtersStore.setSearchTerm('Zelda');
		filtersStore.togglePlatform('Nintendo Switch');
		filtersStore.toggleGenre('Action-Adventure');
		filtersStore.setSort({ key: 'score', direction: 'desc' });

		expect(filteredGamesStore.games.length).toBeLessThan(5);

		// Reset all filters
		filtersStore.resetAllFilters();

		expect(filtersStore.state?.searchTerm).toBe('');
		expect(filtersStore.state?.platforms).toHaveLength(0);
		expect(filtersStore.state?.genres).toHaveLength(0);
		expect(filtersStore.state?.sortOption).toBeNull();
	});

	it('should report isAnyFilterApplied correctly', async () => {
		const { filtersStore } = await import('$lib/stores/filters.svelte');

		expect(filtersStore.isAnyFilterApplied()).toBe(false);

		filtersStore.setSearchTerm('test');
		expect(filtersStore.isAnyFilterApplied()).toBe(true);

		filtersStore.setSearchTerm('');
		expect(filtersStore.isAnyFilterApplied()).toBe(false);

		filtersStore.togglePlatform('PC');
		expect(filtersStore.isAnyFilterApplied()).toBe(true);

		filtersStore.togglePlatform('PC');
		expect(filtersStore.isAnyFilterApplied()).toBe(false);
	});
});

describe('Filter Removal', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should remove individual platform filter', async () => {
		const { filtersStore } = await import('$lib/stores/filters.svelte');

		filtersStore.togglePlatform('PC');
		filtersStore.togglePlatform('Nintendo Switch');
		expect(filtersStore.state?.platforms).toHaveLength(2);

		filtersStore.removePlatform('PC');
		expect(filtersStore.state?.platforms).toHaveLength(1);
		expect(filtersStore.state?.platforms).toContain('Nintendo Switch');
	});

	it('should remove individual genre filter', async () => {
		const { filtersStore } = await import('$lib/stores/filters.svelte');

		filtersStore.toggleGenre('Action');
		filtersStore.toggleGenre('RPG');
		expect(filtersStore.state?.genres).toHaveLength(2);

		filtersStore.removeGenre('Action');
		expect(filtersStore.state?.genres).toHaveLength(1);
		expect(filtersStore.state?.genres).toContain('RPG');
	});

	it('should remove individual tier filter', async () => {
		const { filtersStore } = await import('$lib/stores/filters.svelte');

		filtersStore.toggleTier('S - Masterpiece');
		filtersStore.toggleTier('A - Amazing');
		expect(filtersStore.state?.tiers).toHaveLength(2);

		filtersStore.removeTier('S - Masterpiece');
		expect(filtersStore.state?.tiers).toHaveLength(1);
		expect(filtersStore.state?.tiers).toContain('A - Amazing');
	});
});
