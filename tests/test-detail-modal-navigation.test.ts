import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { modalStore } from '$lib/stores/modal';
import { filtersStore } from '$lib/stores/filters';
import { appStore } from '$lib/stores/app';
import { gamesStore } from '$lib/stores/games';
import type { Game } from '$lib/types/game';

// Mock games data for testing
const mockGames: Game[] = [
	{
		id: '1',
		title: 'The Witcher 3',
		mainTitle: 'The Witcher 3: Wild Hunt',
		subtitle: '',
		platform: 'PC',
		genre: 'RPG',
		year: 2015,
		status: 'Completed',
		hoursPlayed: '120',
		timeToBeat: '50 hours',
		finishedDate: '2023-01-15',
		coOp: 'No',
		coverImage: 'covers/witcher3.webp',
		ratingPresentation: 9,
		ratingStory: 10,
		ratingGameplay: 9,
		score: 18,
		tier: 'S'
	},
	{
		id: '2',
		title: 'Cyberpunk 2077',
		mainTitle: 'Cyberpunk 2077',
		subtitle: '',
		platform: 'PC',
		genre: 'RPG',
		year: 2020,
		status: 'Completed',
		hoursPlayed: '80',
		timeToBeat: '30 hours',
		finishedDate: '2023-02-20',
		coOp: 'No',
		coverImage: 'covers/cyberpunk2077.webp',
		ratingPresentation: 8,
		ratingStory: 8,
		ratingGameplay: 7,
		score: 15,
		tier: 'A'
	},
	{
		id: '3',
		title: 'Elden Ring',
		mainTitle: 'Elden Ring',
		subtitle: '',
		platform: 'PC',
		genre: 'Action RPG',
		year: 2022,
		status: 'Completed',
		hoursPlayed: '150',
		timeToBeat: '60 hours',
		finishedDate: '2023-03-10',
		coOp: 'Yes',
		coverImage: 'covers/eldenring.webp',
		ratingPresentation: 9,
		ratingStory: 9,
		ratingGameplay: 10,
		score: 18,
		tier: 'S'
	},
	{
		id: '4',
		title: 'Hades',
		mainTitle: 'Hades',
		subtitle: '',
		platform: 'PC',
		genre: 'Roguelike',
		year: 2020,
		status: 'Planned',
		hoursPlayed: null,
		timeToBeat: '20 hours',
		finishedDate: null,
		coOp: 'No',
		coverImage: 'covers/hades.webp',
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null
	},
	{
		id: '5',
		title: "Baldur's Gate 3",
		mainTitle: "Baldur's Gate 3",
		subtitle: '',
		platform: 'PC',
		genre: 'RPG',
		year: 2023,
		status: 'Completed',
		hoursPlayed: '200',
		timeToBeat: '100 hours',
		finishedDate: '2023-04-05',
		coOp: 'Yes',
		coverImage: 'covers/baldursgate3.webp',
		ratingPresentation: 10,
		ratingStory: 10,
		ratingGameplay: 9,
		score: 19,
		tier: 'S'
	}
];

describe('DetailModal Navigation Fix', () => {
	beforeEach(() => {
		// Reset stores before each test
		gamesStore.initializeGames(mockGames);
		modalStore.closeModal();
		filtersStore.resetFilters();
		appStore.setActiveTab('all');
	});

	afterEach(() => {
		// Clean up after each test
		modalStore.closeModal();
		filtersStore.resetFilters();
		appStore.setActiveTab('all');
	});

	describe('1. Open modal with filters applied', () => {
		it('should open modal with correct filter context', () => {
			// Apply filters
			filtersStore.set({
				searchTerm: 'witcher',
				platforms: ['PC'],
				genres: ['RPG'],
				statuses: [],
				tiers: [],
				sortOption: null
			});

			// Get filtered games
			const filteredGames = mockGames.filter(
				(game) =>
					game.title.toLowerCase().includes('witcher') &&
					game.platform === 'PC' &&
					game.genre === 'RPG'
			);

			// Open modal with filter context
			modalStore.openViewModal(mockGames[0], filteredGames, {
				searchTerm: 'witcher',
				platforms: ['PC'],
				genres: ['RPG'],
				statuses: [],
				tiers: [],
				sortOption: null,
				activeTab: 'all'
			});

			// Verify modal is open with correct context
			expect(modalStore.getState().isOpen).toBe(true);
			expect(modalStore.getState().activeGame?.id).toBe('1');
			expect(modalStore.getState().displayedGames).toEqual(filteredGames);
			expect(modalStore.getState().filterContext.searchTerm).toBe('witcher');
			expect(modalStore.getState().filterContext.platforms).toEqual(['PC']);
			expect(modalStore.getState().filterContext.genres).toEqual(['RPG']);
		});

		it('should navigate within filtered games', () => {
			// Apply platform filter
			filtersStore.set({
				searchTerm: '',
				platforms: ['PC'],
				genres: [],
				statuses: [],
				tiers: [],
				sortOption: null
			});
			const pcGames = mockGames.filter((game) => game.platform === 'PC');

			// Open modal with filtered games
			modalStore.openViewModal(mockGames[0], pcGames);

			// Test navigation to next game
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex((g) => g.id === '1');
			const nextGame = state.displayedGames[currentIndex + 1];

			expect(nextGame?.id).toBe('2'); // Cyberpunk 2077

			// Navigate to next game
			modalStore.openViewModal(nextGame!, state.displayedGames);

			expect(modalStore.getState().activeGame?.id).toBe('2');
		});
	});

	describe('2. Change filters while modal is open', () => {
		it('should update navigation when filters change', () => {
			// Start with no filters
			modalStore.openViewModal(mockGames[0], mockGames);

			// Initially should have all games
			expect(modalStore.getState().displayedGames.length).toBe(5);

			// Add genre filter while modal is open
			modalStore.updateFilterContext({ genres: ['RPG'] });

			// Should update displayed games based on new filter
			const filteredGames = mockGames.filter((game) => game.genre === 'RPG');
			expect(modalStore.getState().displayedGames).toEqual(filteredGames);
			expect(modalStore.getState().displayedGames.length).toBe(3);
		});

		it('should maintain current game when filters change', () => {
			// Open modal with a specific game
			modalStore.openViewModal(mockGames[0], mockGames);

			const currentGame = modalStore.getState().activeGame;

			// Change filters
			modalStore.updateFilterContext({ genres: ['RPG'] });

			// Current game should still be active if it matches new filters
			expect(modalStore.getState().activeGame?.id).toBe(currentGame?.id);
		});

		it('should handle current game being filtered out', () => {
			// Open modal with a specific game
			modalStore.openViewModal(mockGames[0], mockGames);

			// Apply filters that exclude the current game
			modalStore.updateFilterContext({
				genres: ['Roguelike'],
				platforms: ['PC']
			});

			// Current game should be null if it's filtered out
			const state = modalStore.getState();
			const filteredGames = mockGames.filter(
				(game) => game.genre === 'Roguelike' && game.platform === 'PC'
			);

			expect(state.displayedGames).toEqual(filteredGames);
			expect(state.activeGame).toBeNull();
		});
	});

	describe('3. Verify navigation respects new filters', () => {
		it('should navigate within filtered results', () => {
			// Apply platform filter
			filtersStore.set({
				searchTerm: '',
				platforms: ['PC'],
				genres: [],
				statuses: [],
				tiers: [],
				sortOption: null
			});
			const pcGames = mockGames.filter((game) => game.platform === 'PC');

			// Open modal with first PC game
			modalStore.openViewModal(mockGames[0], pcGames);

			// Navigate to next game
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex((g) => g.id === '1');
			const nextGame = state.displayedGames[currentIndex + 1];

			modalStore.openViewModal(nextGame!, state.displayedGames);

			// Should be within PC games only
			expect(modalStore.getState().activeGame?.platform).toBe('PC');
			expect(modalStore.getState().displayedGames.every((g) => g.platform === 'PC')).toBe(true);
		});

		it('should update navigation when sort changes', () => {
			// Apply sort by rating descending
			modalStore.openViewModal(mockGames[0], mockGames, {
				sortOption: { key: 'score', direction: 'desc' }
			});

			const state = modalStore.getState();
			const sortedGames = [...mockGames].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

			expect(state.displayedGames).toEqual(sortedGames);

			// Navigate to next game (should be highest rated)
			const currentIndex = state.displayedGames.findIndex((g) => g.id === '1');
			const nextGame = state.displayedGames[currentIndex + 1];

			expect(nextGame?.id).toBe('5'); // Baldur's Gate 3 (highest score)
		});
	});

	describe('4. Test tier list navigation specifically', () => {
		it('should navigate within tier list tab', () => {
			// Set to tier list tab
			appStore.setActiveTab('tierlist');

			// Get tiered games only
			const tieredGames = mockGames.filter((game) => game.tier);

			// Open modal with first tiered game
			modalStore.openViewModal(mockGames[0], tieredGames, {
				activeTab: 'tierlist'
			});

			const state = modalStore.getState();

			// Should only show tiered games
			expect(state.displayedGames.every((g) => g.tier)).toBe(true);
			expect(state.displayedGames.length).toBe(4);

			// Navigate to next game
			const currentIndex = state.displayedGames.findIndex((g) => g.id === '1');
			const nextGame = state.displayedGames[currentIndex + 1];

			modalStore.openViewModal(nextGame!, state.displayedGames);

			expect(modalStore.getState().activeGame?.id).toBe('2');
		});

		it('should respect tier ordering in navigation', () => {
			// Set to tier list tab
			appStore.setActiveTab('tierlist');

			// Get tiered games
			const tieredGames = mockGames.filter((game) => game.tier);

			// Open modal
			modalStore.openViewModal(mockGames[0], tieredGames, {
				activeTab: 'tierlist'
			});

			const state = modalStore.getState();

			// Games should be ordered by tier (S, A, B, C, D, E)
			const expectedOrder: ('S' | 'A' | 'B' | 'C' | 'D' | 'E')[] = ['S', 'A', 'S', 'S']; // Witcher3(S), Cyberpunk(A), EldenRing(S), Baldur'sGate3(S)
			const actualOrder = state.displayedGames.map(
				(g) => g.tier as 'S' | 'A' | 'B' | 'C' | 'D' | 'E'
			);

			expect(actualOrder).toEqual(expectedOrder);
		});

		it('should navigate between different tiers', () => {
			// Set to tier list tab
			appStore.setActiveTab('tierlist');

			// Get tiered games
			const tieredGames = mockGames.filter((game) => game.tier);

			// Open modal with S tier game
			modalStore.openViewModal(mockGames[0], tieredGames, {
				activeTab: 'tierlist'
			});

			const state = modalStore.getState();

			// Navigate to next game (should stay within tier list context)
			const currentIndex = state.displayedGames.findIndex((g) => g.id === '1');
			const nextGame = state.displayedGames[currentIndex + 1];

			modalStore.openViewModal(nextGame!, state.displayedGames);

			// Should still be in tier list tab
			expect(modalStore.getState().filterContext.activeTab).toBe('tierlist');
		});
	});

	describe('5. Test backward compatibility', () => {
		it('should work without filter context (legacy behavior)', () => {
			// Open modal without explicit filter context
			modalStore.openViewModal(mockGames[0]);

			// Should still work and use all games
			expect(modalStore.getState().isOpen).toBe(true);
			expect(modalStore.getState().activeGame?.id).toBe('1');
			expect(modalStore.getState().displayedGames).toEqual(mockGames);
		});

		it('should handle empty displayedGames array', () => {
			// Open modal with empty displayed games
			modalStore.openViewModal(mockGames[0], []);

			// Should still open modal
			expect(modalStore.getState().isOpen).toBe(true);
			expect(modalStore.getState().activeGame?.id).toBe('1');
			expect(modalStore.getState().displayedGames).toEqual([]);
		});

		it('should handle null activeGame gracefully', () => {
			// Open modal with null active game
			modalStore.openViewModal(null, mockGames);

			// Should handle gracefully
			expect(modalStore.getState().isOpen).toBe(true);
			expect(modalStore.getState().activeGame).toBeNull();
		});

		it('should maintain existing behavior for URL-based navigation', () => {
			// Simulate URL-based game opening
			const urlSearchParams = new URLSearchParams();
			urlSearchParams.set('game', 'witcher-3');

			modalStore.readFromURL(urlSearchParams, mockGames);

			// Should set up pending game
			expect(modalStore.getState().pendingGameFromURL?.id).toBe('1');

			// Open pending game with displayed games
			modalStore.openPendingGameFromURL(mockGames);

			expect(modalStore.getState().isOpen).toBe(true);
			expect(modalStore.getState().activeGame?.id).toBe('1');
		});
	});

	describe('6. Edge cases and error handling', () => {
		it('should handle navigation at boundaries', () => {
			// Open modal with first game
			modalStore.openViewModal(mockGames[0], mockGames);

			// Try to navigate previous (should stay at first)
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex((g) => g.id === '1');

			// Simulate navigation to previous
			if (currentIndex > 0) {
				const prevGame = state.displayedGames[currentIndex - 1];
				modalStore.openViewModal(prevGame, state.displayedGames);
			}

			// Should still be at first game
			expect(modalStore.getState().activeGame?.id).toBe('1');

			// Navigate to last game
			const lastGame = state.displayedGames[state.displayedGames.length - 1];
			modalStore.openViewModal(lastGame, state.displayedGames);

			// Try to navigate next (should stay at last)
			const finalState = modalStore.getState();
			const finalIndex = finalState.displayedGames.findIndex((g) => g.id === lastGame.id);

			if (finalIndex < finalState.displayedGames.length - 1) {
				const nextGame = finalState.displayedGames[finalIndex + 1];
				modalStore.openViewModal(nextGame, finalState.displayedGames);
			}

			expect(modalStore.getState().activeGame?.id).toBe(lastGame.id);
		});

		it('should handle games with missing properties', () => {
			// Create game with missing properties
			const incompleteGame: Game = {
				id: '999',
				title: 'Incomplete Game',
				mainTitle: 'Incomplete Game',
				subtitle: '',
				platform: 'PC',
				genre: 'Action',
				year: 2023,
				status: 'Planned',
				hoursPlayed: null,
				timeToBeat: '10 hours',
				finishedDate: null,
				coOp: 'No',
				coverImage: 'covers/incomplete.webp',
				ratingPresentation: null,
				ratingStory: null,
				ratingGameplay: null,
				score: null,
				tier: null
			};

			// Open modal with incomplete game
			modalStore.openViewModal(incompleteGame, [incompleteGame]);

			// Should handle gracefully
			expect(modalStore.getState().isOpen).toBe(true);
			expect(modalStore.getState().activeGame?.id).toBe('999');
		});

		it('should handle concurrent filter changes', () => {
			// Open modal
			modalStore.openViewModal(mockGames[0], mockGames);

			// Apply multiple filter changes rapidly
			modalStore.updateFilterContext({ genres: ['RPG'] });
			modalStore.updateFilterContext({ platforms: ['PC'] });
			modalStore.updateFilterContext({ statuses: ['Completed'] });

			const state = modalStore.getState();
			const filteredGames = mockGames.filter(
				(game) => game.genre === 'RPG' && game.platform === 'PC' && game.status === 'Completed'
			);

			// Should apply all filters correctly
			expect(state.displayedGames).toEqual(filteredGames);
			expect(state.displayedGames.length).toBe(2); // Witcher 3 and Cyberpunk 2077
		});
	});
});
