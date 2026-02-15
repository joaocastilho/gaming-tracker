import { beforeEach, describe, expect, test } from 'vitest';
import { appStore } from '$lib/stores/app.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { createTestGame } from './helpers/factories';

describe('Game Management Flows', () => {
	beforeEach(() => {
		// Reset stores before each test
		gamesStore.initializeGames([]);
	});

	let addedGameId: string;

	test('Add New Game', () => {
		const gameToAdd = createTestGame({
			title: 'Test Game Flow',
			platform: 'PC',
			year: 2024,
			genre: 'Action',
			coOp: 'No',
			status: 'Planned',
			playtime: '8h 0m'
		});

		gamesStore.addGame(gameToAdd);
		addedGameId = gameToAdd.id;

		const games = gamesStore.games;
		const addedGame = games.find((g) => g.id === addedGameId);

		expect(addedGame).toBeDefined();
		expect(addedGame?.title).toBe('Test Game Flow');
	});

	test('Complete Game with Ratings', () => {
		// Setup: Add a game first
		const gameToAdd = createTestGame({
			title: 'Test Game Flow',
			platform: 'PC',
			year: 2024,
			genre: 'Action',
			coOp: 'No',
			status: 'Planned',
			playtime: '8h 0m'
		});
		gamesStore.addGame(gameToAdd);
		addedGameId = gameToAdd.id;

		const games = gamesStore.games;
		const game = games.find((g) => g.id === addedGameId);
		expect(game).toBeDefined();

		if (!game) return;

		const updatedGame = createTestGame({
			...game,
			status: 'Completed',
			playtime: '12h 30m',
			finishedDate: '2024-11-02',
			ratingPresentation: 8,
			ratingStory: 7,
			ratingGameplay: 9,
			score: 16,
			tier: 'A - Amazing'
		});

		gamesStore.updateGame(addedGameId, updatedGame);

		const currentGames = gamesStore.games;
		const completedGame = currentGames.find((g) => g.id === addedGameId);

		expect(completedGame?.status).toBe('Completed');
		expect(completedGame?.score).toBe(16);
		expect(completedGame?.tier).toBe('A - Amazing');
	});

	test('Switch Between Views', () => {
		appStore.setActiveTab('completed');
		const activeTab = appStore.activeTab;
		expect(activeTab).toBe('completed');
	});
});
