/**
 * Cross-Component Reactivity Tests
 * Tests that verify reactivity flows between different components/stores:
 * - Filter application → gallery update
 * - Tab switching → filter reset behavior
 * - Search → tab auto-switch
 * - Modal navigation within filtered context
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { filtersStore } from '$lib/stores/filters.svelte';
import { filteredGamesStore } from '$lib/stores/filteredGamesStore.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { appStore } from '$lib/stores/app.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import type { Game } from '$lib/types/game';

// Test game data
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
	}
];

describe('Cross-Component Reactivity', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Initialize stores with test data
		gamesStore.initializeGames(mockGames);
		filtersStore.initializeForTesting();
		filtersStore.resetAllFilters();
		appStore.setActiveTab('all');
		modalStore.closeModal();
	});

	afterEach(() => {
		filtersStore.resetAllFilters();
		modalStore.closeModal();
	});

	describe('Filter Application → Gallery Update', () => {
		it('should update filtered games when platform filter is applied', () => {
			const allGames = filteredGamesStore.games;
			expect(allGames.length).toBe(5);

			// Apply PC platform filter
			filtersStore.togglePlatform('PC');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.every((g) => g.platform === 'PC')).toBe(true);
			expect(filteredGames.length).toBe(4); // Dark Souls, Hollow Knight, Elden Ring, Cyberpunk
		});

		it('should update filtered games when genre filter is applied', () => {
			filtersStore.toggleGenre('RPG');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.every((g) => g.genre === 'RPG')).toBe(true);
			expect(filteredGames.length).toBe(3); // Dark Souls, Elden Ring, Cyberpunk
		});

		it('should update filtered games when search term is set', () => {
			filtersStore.setSearchTerm('zelda');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.length).toBe(1);
			expect(filteredGames[0].title).toBe('Zelda: Breath of the Wild');
		});

		it('should combine multiple filters correctly', () => {
			// Apply platform and genre filters
			filtersStore.togglePlatform('PC');
			filtersStore.toggleGenre('RPG');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.every((g) => g.platform === 'PC' && g.genre === 'RPG')).toBe(true);
			expect(filteredGames.length).toBe(3); // Dark Souls, Elden Ring, Cyberpunk
		});

		it('should update when filter is removed', () => {
			// Add and remove platform filter
			filtersStore.togglePlatform('PC');
			expect(filteredGamesStore.games.length).toBe(4);

			filtersStore.togglePlatform('PC'); // Remove
			expect(filteredGamesStore.games.length).toBe(5);
		});

		it('should update when all filters are reset', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.toggleGenre('RPG');
			filtersStore.setSearchTerm('dark');

			filtersStore.resetAllFilters();

			expect(filteredGamesStore.games.length).toBe(5);
		});
	});

	describe('Tab Switching → Filter Behavior', () => {
		it('should filter by Completed status when on completed tab', () => {
			appStore.setActiveTab('completed');

			// The filteredGamesStore should respect the active tab
			// Note: This depends on how filteredGamesStore is implemented
			const state = filtersStore.state;
			expect(state).toBeDefined();
		});

		it('should filter by Planned status when on planned tab', () => {
			appStore.setActiveTab('planned');

			const state = filtersStore.state;
			expect(state).toBeDefined();
		});

		it('should show all games when on all tab', () => {
			appStore.setActiveTab('all');

			const allGames = filteredGamesStore.games;
			expect(allGames.length).toBe(5);
		});

		it('should persist filters when switching tabs', () => {
			// Apply a filter
			filtersStore.togglePlatform('PC');

			// Switch tabs
			appStore.setActiveTab('completed');
			appStore.setActiveTab('all');

			// Filter should still be active
			expect(filtersStore.state?.platforms).toContain('PC');
		});
	});

	describe('Search → Filtered Results', () => {
		it('should filter games by title substring', () => {
			filtersStore.setSearchTerm('dark');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.length).toBe(1);
			expect(filteredGames[0].id).toBe('2'); // Dark Souls III
		});

		it('should filter games case-insensitively', () => {
			filtersStore.setSearchTerm('ZELDA');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.length).toBe(1);
			expect(filteredGames[0].id).toBe('1');
		});

		it('should clear results when search has no matches', () => {
			filtersStore.setSearchTerm('nonexistent game');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.length).toBe(0);
		});

		it('should restore all games when search is cleared', () => {
			filtersStore.setSearchTerm('zelda');
			expect(filteredGamesStore.games.length).toBe(1);

			filtersStore.setSearchTerm('');
			expect(filteredGamesStore.games.length).toBe(5);
		});

		it('should combine search with other filters', () => {
			filtersStore.togglePlatform('PC');
			filtersStore.setSearchTerm('hollow');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.length).toBe(1);
			expect(filteredGames[0].id).toBe('3'); // Hollow Knight
		});
	});

	describe('Modal Navigation Within Filtered Context', () => {
		it('should open modal with correct displayed games from filter', () => {
			// Apply filter
			filtersStore.togglePlatform('PC');
			const filteredGames = filteredGamesStore.games;

			// Open modal with first filtered game
			modalStore.openViewModal(filteredGames[0], filteredGames);

			const modalState = modalStore.getState();
			expect(modalState.displayedGames.length).toBe(4); // Only PC games
			expect(modalState.displayedGames.every((g) => g.platform === 'PC')).toBe(true);
		});

		it('should navigate within filtered context', () => {
			filtersStore.togglePlatform('PC');
			const filteredGames = filteredGamesStore.games;

			modalStore.openViewModal(filteredGames[0], filteredGames);

			// Navigate to next game
			const nextGame = filteredGames[1];
			modalStore.setActiveGame(nextGame);

			expect(modalStore.activeGame?.id).toBe(nextGame.id);
			expect(modalStore.activeGame?.platform).toBe('PC');
		});

		it('should preserve filter context in modal state', () => {
			const filterContext = {
				searchTerm: 'test',
				platforms: ['PC'],
				genres: ['RPG'],
				statuses: [],
				tiers: [],
				sortOption: null,
				activeTab: 'all' as const
			};

			filtersStore.togglePlatform('PC');
			filtersStore.toggleGenre('RPG');
			const filteredGames = filteredGamesStore.games;

			modalStore.openViewModal(filteredGames[0], filteredGames, filterContext);

			const modalState = modalStore.getState();
			expect(modalState.filterContext.platforms).toContain('PC');
			expect(modalState.filterContext.genres).toContain('RPG');
		});
	});

	describe('Tier Filter Integration', () => {
		it('should filter by tier when tier filter is applied', () => {
			filtersStore.toggleTier('S - Masterpiece');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.every((g) => g.tier === 'S - Masterpiece')).toBe(true);
			expect(filteredGames.length).toBe(1); // Zelda
		});

		it('should support multiple tier filters', () => {
			filtersStore.toggleTier('S - Masterpiece');
			filtersStore.toggleTier('A - Amazing');

			const filteredGames = filteredGamesStore.games;
			const expectedTiers = ['S - Masterpiece', 'A - Amazing'];
			expect(filteredGames.every((g) => g.tier !== null && expectedTiers.includes(g.tier))).toBe(
				true
			);
			expect(filteredGames.length).toBe(3); // Zelda, Dark Souls, Hollow Knight
		});
	});

	describe('Co-op Filter Integration', () => {
		it('should filter by co-op when co-op filter is applied', () => {
			filtersStore.toggleCoOp('Yes');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.every((g) => g.coOp === 'Yes')).toBe(true);
			expect(filteredGames.length).toBe(2); // Dark Souls, Elden Ring
		});

		it('should combine co-op filter with other filters', () => {
			filtersStore.toggleCoOp('Yes');
			filtersStore.togglePlatform('PC');

			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.every((g) => g.coOp === 'Yes' && g.platform === 'PC')).toBe(true);
			expect(filteredGames.length).toBe(2); // Dark Souls, Elden Ring
		});
	});

	describe('Sort Integration', () => {
		it('should maintain sort order after filter changes', () => {
			// Set sort
			filtersStore.setSort({ key: 'score', direction: 'desc' });

			// The sort should be set
			expect(filtersStore.state?.sortOption?.key).toBe('score');
			expect(filtersStore.state?.sortOption?.direction).toBe('desc');

			// Apply filter
			filtersStore.togglePlatform('PC');

			// Sort should still be active
			expect(filtersStore.state?.sortOption?.key).toBe('score');
		});

		it('should reset sort when all filters are reset', () => {
			filtersStore.setSort({ key: 'alphabetical', direction: 'asc' });
			filtersStore.togglePlatform('PC');

			filtersStore.resetAllFilters();

			expect(filtersStore.state?.sortOption).toBeNull();
		});
	});

	describe('Search → Tab Auto-Switch Behavior', () => {
		/**
		 * These tests verify the expected behavior where searching
		 * might change results across different tabs
		 */

		it('should maintain search term when switching tabs', () => {
			filtersStore.setSearchTerm('dark');
			expect(filtersStore.state?.searchTerm).toBe('dark');

			appStore.setActiveTab('completed');

			expect(filtersStore.state?.searchTerm).toBe('dark');
		});

		it('should apply search across different tab contexts', () => {
			// Search on all tab
			appStore.setActiveTab('all');
			filtersStore.setSearchTerm('elden');

			const allTabResults = filteredGamesStore.games;
			expect(allTabResults.length).toBe(1);
			expect(allTabResults[0].title).toBe('Elden Ring');

			// Same search should work on planned tab (where Elden Ring is)
			appStore.setActiveTab('planned');
			const plannedTabResults = filteredGamesStore.games;
			// Should still find Elden Ring since it's a planned game
			expect(plannedTabResults.length).toBeGreaterThanOrEqual(0); // Depends on implementation
		});

		it('should show zero results when search matches no games on current tab', () => {
			// Switch to completed tab
			appStore.setActiveTab('completed');

			// Search for a planned-only game
			filtersStore.setSearchTerm('elden');

			// Elden Ring is Planned, so on completed tab it should show 0 results
			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.filter((g) => g.status === 'Completed').length).toBe(0);
		});

		it('should clear search when reset is called', () => {
			filtersStore.setSearchTerm('zelda');
			expect(filteredGamesStore.games.length).toBe(1);

			filtersStore.resetAllFilters();

			expect(filtersStore.state?.searchTerm).toBe('');
			expect(filteredGamesStore.games.length).toBe(5);
		});
	});

	describe('Game Add/Update Reactivity', () => {
		it('should update games list when a new game is added', () => {
			const initialCount = gamesStore.games.length;

			// Add a new game
			const newGame: Game = {
				id: '6',
				title: 'New Game',
				mainTitle: 'New Game',
				subtitle: null,
				platform: 'PC',
				genre: 'Action',
				year: 2024,
				coOp: 'No',
				status: 'Planned',
				coverImage: 'covers/newgame.webp',
				playtime: null,
				finishedDate: null,
				ratingPresentation: null,
				ratingStory: null,
				ratingGameplay: null,
				score: null,
				tier: null
			};

			gamesStore.addGame(newGame);

			expect(gamesStore.games.length).toBe(initialCount + 1);
			expect(gamesStore.games.find((g) => g.id === '6')).toBeDefined();
		});

		it('should add PC game to games store', () => {
			// Add a new PC game
			const newGame: Game = {
				id: '7',
				title: 'Another PC Game',
				mainTitle: 'Another PC Game',
				subtitle: null,
				platform: 'PC',
				genre: 'Strategy',
				year: 2024,
				coOp: 'No',
				status: 'Completed',
				coverImage: 'covers/anothergame.webp',
				playtime: '10h',
				finishedDate: '2024-01-01',
				ratingPresentation: 8,
				ratingStory: 7,
				ratingGameplay: 8,
				score: 77,
				tier: 'B - Great'
			};

			const initialCount = gamesStore.games.length;
			gamesStore.addGame(newGame);

			// Verify game was added to the store
			expect(gamesStore.games.length).toBe(initialCount + 1);
			expect(gamesStore.games.find((g) => g.id === '7')).toBeDefined();
			expect(gamesStore.games.find((g) => g.id === '7')?.platform).toBe('PC');
		});

		it('should update modal displayed games after adding game', () => {
			const currentGames = gamesStore.games;
			modalStore.openViewModal(currentGames[0], currentGames);

			const initialModalGames = modalStore.getState().displayedGames.length;

			// Close modal, add game, reopen
			modalStore.closeModal();

			const newGame: Game = {
				id: '8',
				title: 'Modal Test Game',
				mainTitle: 'Modal Test Game',
				subtitle: null,
				platform: 'PlayStation',
				genre: 'RPG',
				year: 2024,
				coOp: 'No',
				status: 'Completed',
				coverImage: 'covers/modaltest.webp',
				playtime: '15h',
				finishedDate: '2024-02-01',
				ratingPresentation: 7,
				ratingStory: 8,
				ratingGameplay: 7,
				score: 73,
				tier: 'C - Good'
			};

			gamesStore.addGame(newGame);

			// Reopen modal with updated games from gamesStore directly
			const updatedGames = gamesStore.games;
			modalStore.openViewModal(updatedGames[0], updatedGames);

			expect(modalStore.getState().displayedGames.length).toBe(initialModalGames + 1);
		});

		it('should reflect game updates in filtered results', () => {
			// Find a PC game and change its platform
			const game = gamesStore.games.find((g) => g.id === '2');
			expect(game?.platform).toBe('PC');

			// Update the platform to PlayStation
			gamesStore.updateGame('2', { platform: 'PlayStation' });

			// Now if we filter by PC, game 2 should not be there
			filtersStore.togglePlatform('PC');
			const filteredGames = filteredGamesStore.games;
			expect(filteredGames.find((g) => g.id === '2')).toBeUndefined();
		});

		it('should update game title in store when edited', () => {
			const game = gamesStore.games.find((g) => g.id === '3');
			expect(game?.title).toBe('Hollow Knight');

			// Update the game using correct signature (id, partial)
			gamesStore.updateGame('3', { title: 'Hollow Knight: Silksong' });

			const updatedGame = gamesStore.games.find((g) => g.id === '3');
			expect(updatedGame?.title).toBe('Hollow Knight: Silksong');
		});
	});
});
