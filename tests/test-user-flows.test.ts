import { describe, test, expect, beforeEach } from 'bun:test';
import { get } from 'svelte/store';
import { gamesStore } from '$lib/stores/games';
import { filtersStore } from '$lib/stores/filters';
import { appStore } from '$lib/stores/app';
import type { Game } from '$lib/types/game';

describe('User Flows', () => {
	beforeEach(() => {
		// Reset stores before each test
		gamesStore.initializeGames([]);
		filtersStore.resetFilters();
	});

	describe('Game Management Flows', () => {
		let addedGameId: string;

		test('Add New Game', () => {
			const newGameData = {
				title: 'Test Game Flow',
				platform: 'PC',
				year: 2024,
				genre: 'Action',
				coOp: 'No',
				status: 'Planned',
				timeToBeat: '8h',
				coverImage: 'covers/test.webp'
			} as Game;

			const gameToAdd = {
				...newGameData,
				id: crypto.randomUUID(),
				mainTitle: newGameData.title,
				subtitle: null,
				hoursPlayed: null,
				finishedDate: null,
				ratingPresentation: null,
				ratingStory: null,
				ratingGameplay: null,
				score: null,
				tier: null
			} as Game;

			gamesStore.addGame(gameToAdd);
			addedGameId = gameToAdd.id;

			const games = get(gamesStore);
			const addedGame = games.find((g) => g.id === addedGameId);

			expect(addedGame).toBeDefined();
			expect(addedGame?.title).toBe('Test Game Flow');
		});

		test('Complete Game with Ratings', () => {
			// Setup: Add a game first (since tests are independent in beforeEach, we need to add it again or share state carefully.
			// Ideally tests should be independent. Let's add a game here.)
			const gameToAdd = {
				id: crypto.randomUUID(),
				title: 'Test Game Flow',
				platform: 'PC',
				year: 2024,
				genre: 'Action',
				coOp: 'No',
				status: 'Planned',
				timeToBeat: '8h',
				coverImage: 'covers/test.webp',
				mainTitle: 'Test Game Flow',
				subtitle: null,
				hoursPlayed: null,
				finishedDate: null,
				ratingPresentation: null,
				ratingStory: null,
				ratingGameplay: null,
				score: null,
				tier: null
			} as Game;
			gamesStore.addGame(gameToAdd);
			addedGameId = gameToAdd.id;

			const games = get(gamesStore);
			const game = games.find((g) => g.id === addedGameId);
			expect(game).toBeDefined();

			if (!game) return;

			const updatedGame = {
				...game,
				status: 'Completed',
				hoursPlayed: '12h 30m',
				finishedDate: '2024-11-02',
				ratingPresentation: 8,
				ratingStory: 7,
				ratingGameplay: 9,
				score: 16,
				tier: 'A'
			} as Game;

			gamesStore.updateGame(addedGameId, updatedGame);

			const currentGames = get(gamesStore);
			const completedGame = currentGames.find((g) => g.id === addedGameId);

			expect(completedGame?.status).toBe('Completed');
			expect(completedGame?.score).toBe(16);
			expect(completedGame?.tier).toBe('A');
		});
	});

	describe('Filtering and Search Flows', () => {
		test('Search by Title', () => {
			filtersStore.setSearchTerm('Zelda');
			const state = get(filtersStore);
			expect(state?.searchTerm).toBe('Zelda');
		});

		test('Filter by Platform', () => {
			filtersStore.togglePlatform('PC');
			let state = get(filtersStore);
			expect(state?.platforms.includes('PC')).toBe(true);

			filtersStore.togglePlatform('PC');
			state = get(filtersStore);
			expect(state?.platforms.includes('PC')).toBe(false);
		});

		test('Filter by Co-op', () => {
			filtersStore.toggleCoOp('Yes');
			let state = get(filtersStore);
			expect(state?.coOp.includes('Yes')).toBe(true);

			filtersStore.toggleCoOp('Yes');
			state = get(filtersStore);
			expect(state?.coOp.includes('Yes')).toBe(false);
		});
	});

	describe('View and Navigation Flows', () => {
		test('Switch Between Views', () => {
			appStore.setActiveTab('completed');
			const activeTab = get(appStore.activeTab);
			expect(activeTab).toBe('completed');
		});
	});
});
