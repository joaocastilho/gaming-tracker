import { beforeEach, describe, expect, test } from 'vitest';
import { appStore } from '$lib/stores/app.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import type { Game } from '$lib/types/game';

describe('Game Management Flows', () => {
	beforeEach(() => {
		// Reset stores before each test
		gamesStore.initializeGames([]);
	});

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

		const games = gamesStore.games;
		const addedGame = games.find((g) => g.id === addedGameId);

		expect(addedGame).toBeDefined();
		expect(addedGame?.title).toBe('Test Game Flow');
	});

	test('Complete Game with Ratings', () => {
		// Setup: Add a game first
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

		const games = gamesStore.games;
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
			tier: 'A - Amazing'
		} as Game;

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
