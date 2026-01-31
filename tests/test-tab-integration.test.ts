/**
 * Tab Integration Tests
 * Tests that verify tab-based filtering and behavior:
 * - All tab shows all games
 * - Completed tab filters by status
 * - Planned tab filters by status
 * - Tierlist tab shows tiered games in order
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { filtersStore } from '$lib/stores/filters.svelte';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { appStore } from '$lib/stores/app.svelte';
import type { Game } from '$lib/types/game';

// Test game data covering all statuses and tiers
const mockGames: Game[] = [
	{
		id: '1',
		title: 'Zelda: Breath of the Wild',
		mainTitle: 'Zelda: Breath of the Wild',
		subtitle: null,
		platform: 'Nintendo Switch',
		genre: 'Adventure',
		year: 2017,
		coOp: 'No',
		status: 'Completed',
		coverImage: 'covers/zelda.webp',
		playtime: '60h',
		finishedDate: '2023-01-15',
		ratingPresentation: 10,
		ratingStory: 9,
		ratingGameplay: 10,
		score: 97,
		tier: 'S - Masterpiece'
	},
	{
		id: '2',
		title: 'Dark Souls III',
		mainTitle: 'Dark Souls III',
		subtitle: null,
		platform: 'PC',
		genre: 'RPG',
		year: 2016,
		coOp: 'Yes',
		status: 'Completed',
		coverImage: 'covers/darksouls.webp',
		playtime: '80h',
		finishedDate: '2023-03-20',
		ratingPresentation: 9,
		ratingStory: 8,
		ratingGameplay: 10,
		score: 90,
		tier: 'A - Amazing'
	},
	{
		id: '3',
		title: 'Hollow Knight',
		mainTitle: 'Hollow Knight',
		subtitle: null,
		platform: 'PC',
		genre: 'Platformer',
		year: 2017,
		coOp: 'No',
		status: 'Completed',
		coverImage: 'covers/hollowknight.webp',
		playtime: '40h',
		finishedDate: '2023-06-10',
		ratingPresentation: 9,
		ratingStory: 8,
		ratingGameplay: 9,
		score: 87,
		tier: 'A - Amazing'
	},
	{
		id: '4',
		title: 'Elden Ring',
		mainTitle: 'Elden Ring',
		subtitle: null,
		platform: 'PC',
		genre: 'RPG',
		year: 2022,
		coOp: 'Yes',
		status: 'Planned',
		coverImage: 'covers/eldenring.webp',
		playtime: null,
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null
	},
	{
		id: '5',
		title: 'Cyberpunk 2077',
		mainTitle: 'Cyberpunk 2077',
		subtitle: null,
		platform: 'PC',
		genre: 'RPG',
		year: 2020,
		coOp: 'No',
		status: 'Planned',
		coverImage: 'covers/cyberpunk.webp',
		playtime: null,
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null
	},
	{
		id: '6',
		title: 'Stardew Valley',
		mainTitle: 'Stardew Valley',
		subtitle: null,
		platform: 'PC',
		genre: 'Simulation',
		year: 2016,
		coOp: 'Yes',
		status: 'Completed',
		coverImage: 'covers/stardew.webp',
		playtime: '100h',
		finishedDate: '2022-12-01',
		ratingPresentation: 8,
		ratingStory: 7,
		ratingGameplay: 9,
		score: 80,
		tier: 'B - Great'
	}
];

describe('Tab Integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Initialize stores with test data
		gamesStore.initializeGames(mockGames);
		filtersStore.initializeForTesting();
		filtersStore.resetAllFilters();
	});

	afterEach(() => {
		filtersStore.resetAllFilters();
		appStore.setActiveTab('all');
	});

	describe('All Tab', () => {
		beforeEach(() => {
			appStore.setActiveTab('all');
		});

		it('should show all games regardless of status', () => {
			const allGames = filteredGamesStore.games;
			expect(allGames.length).toBe(6);
		});

		it('should include both completed and planned games', () => {
			const allGames = filteredGamesStore.games;
			const completedGames = allGames.filter((g) => g.status === 'Completed');
			const plannedGames = allGames.filter((g) => g.status === 'Planned');

			expect(completedGames.length).toBe(4);
			expect(plannedGames.length).toBe(2);
		});

		it('should apply platform filters', () => {
			filtersStore.togglePlatform('PC');

			const filtered = filteredGamesStore.games;
			expect(filtered.every((g) => g.platform === 'PC')).toBe(true);
			expect(filtered.length).toBe(5); // All except Zelda
		});

		it('should apply genre filters', () => {
			filtersStore.toggleGenre('RPG');

			const filtered = filteredGamesStore.games;
			expect(filtered.every((g) => g.genre === 'RPG')).toBe(true);
			expect(filtered.length).toBe(3); // Dark Souls, Elden Ring, Cyberpunk
		});

		it('should apply search filter', () => {
			filtersStore.setSearchTerm('knight');

			const filtered = filteredGamesStore.games;
			expect(filtered.length).toBe(1);
			expect(filtered[0].title).toBe('Hollow Knight');
		});

		it('should combine multiple filters', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.toggleGenre('RPG');

			const filtered = filteredGamesStore.games;
			expect(filtered.every((g) => g.platform === 'PC' && g.genre === 'RPG')).toBe(true);
		});
	});

	describe('Completed Tab', () => {
		beforeEach(() => {
			appStore.setActiveTab('completed');
		});

		it('should only show completed games', () => {
			const games = filteredGamesStore.games;
			expect(games.every((g) => g.status === 'Completed')).toBe(true);
			expect(games.length).toBe(4);
		});

		it('should not include planned games', () => {
			const games = filteredGamesStore.games;
			const plannedGames = games.filter((g) => g.status === 'Planned');
			expect(plannedGames.length).toBe(0);
		});

		it('should apply tier filter on completed tab', () => {
			filtersStore.toggleTier('S - Masterpiece');

			const filtered = filteredGamesStore.games;
			expect(filtered.length).toBe(1);
			expect(filtered[0].tier).toBe('S - Masterpiece');
		});

		it('should apply platform filter on completed tab', () => {
			filtersStore.togglePlatform('PC');

			const filtered = filteredGamesStore.games;
			expect(filtered.every((g) => g.platform === 'PC' && g.status === 'Completed')).toBe(true);
			expect(filtered.length).toBe(3); // Dark Souls, Hollow Knight, Stardew
		});

		it('should show games with all tier values', () => {
			const games = filteredGamesStore.games;
			const tiers = games.map((g) => g.tier).filter((t) => t !== null);

			expect(tiers).toContain('S - Masterpiece');
			expect(tiers).toContain('A - Amazing');
			expect(tiers).toContain('B - Great');
		});

		it('should apply search filter on completed tab', () => {
			filtersStore.setSearchTerm('stardew');

			const filtered = filteredGamesStore.games;
			expect(filtered.length).toBe(1);
			expect(filtered[0].title).toBe('Stardew Valley');
		});
	});

	describe('Planned Tab', () => {
		beforeEach(() => {
			appStore.setActiveTab('planned');
		});

		it('should only show planned games', () => {
			const games = filteredGamesStore.games;
			expect(games.every((g) => g.status === 'Planned')).toBe(true);
			expect(games.length).toBe(2);
		});

		it('should not include completed games', () => {
			const games = filteredGamesStore.games;
			const completedGames = games.filter((g) => g.status === 'Completed');
			expect(completedGames.length).toBe(0);
		});

		it('should apply platform filter on planned tab', () => {
			// All planned games are on PC so this should not change the count
			filtersStore.togglePlatform('PC');

			const filtered = filteredGamesStore.games;
			expect(filtered.every((g) => g.platform === 'PC')).toBe(true);
			expect(filtered.length).toBe(2);
		});

		it('should apply genre filter on planned tab', () => {
			filtersStore.toggleGenre('RPG');

			const filtered = filteredGamesStore.games;
			expect(filtered.every((g) => g.genre === 'RPG')).toBe(true);
			expect(filtered.length).toBe(2); // Both Elden Ring and Cyberpunk are RPGs
		});

		it('should apply search filter on planned tab', () => {
			filtersStore.setSearchTerm('elden');

			const filtered = filteredGamesStore.games;
			expect(filtered.length).toBe(1);
			expect(filtered[0].title).toBe('Elden Ring');
		});

		it('planned games should have null tiers', () => {
			const games = filteredGamesStore.games;
			expect(games.every((g) => g.tier === null)).toBe(true);
		});
	});

	describe('Tierlist Tab', () => {
		beforeEach(() => {
			appStore.setActiveTab('tierlist');
		});

		it('should only show completed games with tiers', () => {
			const games = filteredGamesStore.games;
			expect(games.every((g) => g.status === 'Completed' && g.tier !== null)).toBe(true);
		});

		it('should not include planned games', () => {
			const games = filteredGamesStore.games;
			const plannedGames = games.filter((g) => g.status === 'Planned');
			expect(plannedGames.length).toBe(0);
		});

		it('should include games from all tier levels', () => {
			const games = filteredGamesStore.games;
			const tiers = new Set(games.map((g) => g.tier));

			expect(tiers.has('S - Masterpiece')).toBe(true);
			expect(tiers.has('A - Amazing')).toBe(true);
			expect(tiers.has('B - Great')).toBe(true);
		});

		it('should have exactly 4 tiered games', () => {
			const games = filteredGamesStore.games;
			// All 4 completed games have tiers
			expect(games.length).toBe(4);
		});
	});

	describe('Tab Switching Behavior', () => {
		it('should switch from all to completed correctly', () => {
			appStore.setActiveTab('all');
			expect(filteredGamesStore.games.length).toBe(6);

			appStore.setActiveTab('completed');
			expect(filteredGamesStore.games.length).toBe(4);
		});

		it('should switch from all to planned correctly', () => {
			appStore.setActiveTab('all');
			expect(filteredGamesStore.games.length).toBe(6);

			appStore.setActiveTab('planned');
			expect(filteredGamesStore.games.length).toBe(2);
		});

		it('should switch from completed to planned correctly', () => {
			appStore.setActiveTab('completed');
			expect(filteredGamesStore.games.every((g) => g.status === 'Completed')).toBe(true);

			appStore.setActiveTab('planned');
			expect(filteredGamesStore.games.every((g) => g.status === 'Planned')).toBe(true);
		});

		it('should maintain filters when switching tabs', () => {
			appStore.setActiveTab('all');
			filtersStore.togglePlatform('PC');

			// Switch to completed - filter should still be active
			appStore.setActiveTab('completed');
			expect(filtersStore.state?.platforms).toContain('PC');

			// Back to all - filter should still be active
			appStore.setActiveTab('all');
			expect(filtersStore.state?.platforms).toContain('PC');
		});
	});

	describe('Count Verification', () => {
		it('should have correct count for all tab', () => {
			appStore.setActiveTab('all');
			expect(filteredGamesStore.games.length).toBe(6);
		});

		it('should have correct count for completed tab', () => {
			appStore.setActiveTab('completed');
			expect(filteredGamesStore.games.length).toBe(4);
		});

		it('should have correct count for planned tab', () => {
			appStore.setActiveTab('planned');
			expect(filteredGamesStore.games.length).toBe(2);
		});

		it('should have correct count for tierlist tab', () => {
			appStore.setActiveTab('tierlist');
			expect(filteredGamesStore.games.length).toBe(4);
		});

		it('should reduce count when filters applied', () => {
			appStore.setActiveTab('all');
			const initialCount = filteredGamesStore.games.length;

			filtersStore.togglePlatform('Nintendo Switch');
			const filteredCount = filteredGamesStore.games.length;

			expect(filteredCount).toBeLessThan(initialCount);
			expect(filteredCount).toBe(1); // Only Zelda
		});
	});
});
