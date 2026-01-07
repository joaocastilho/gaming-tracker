import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '$lib/db';
import type { Game } from '$lib/types/game';

const mockGame: Game = {
	id: 'test-game-1',
	title: 'Test Game',
	mainTitle: 'Test Game',
	subtitle: null,
	platform: 'PC',
	year: 2023,
	genre: 'Action',
	coOp: 'No',
	status: 'Completed',
	coverImage: 'covers/test.webp',
	playtime: '10h 30m',
	finishedDate: '15/01/2023',
	ratingPresentation: 8,
	ratingStory: 7,
	ratingGameplay: 9,
	score: 16,
	tier: 'A - Amazing'
};

describe('Dexie Database', () => {
	beforeEach(async () => {
		await db.games.clear();
	});

	afterEach(async () => {
		await db.games.clear();
	});

	it('should add and retrieve a game by id', async () => {
		await db.games.add(mockGame);
		const game = await db.games.get('test-game-1');
		expect(game).toBeDefined();
		expect(game?.title).toBe('Test Game');
	});

	it('should bulkPut multiple games', async () => {
		const games = [mockGame, { ...mockGame, id: 'test-game-2', title: 'Test Game 2' }];
		await db.games.bulkPut(games);
		const all = await db.games.toArray();
		expect(all.length).toBe(2);
	});

	it('should query by status index', async () => {
		await db.games.bulkPut([
			{ ...mockGame, id: '1', status: 'Completed' },
			{ ...mockGame, id: '2', status: 'Planned' },
			{ ...mockGame, id: '3', status: 'Completed' }
		]);
		const completed = await db.games.where('status').equals('Completed').toArray();
		expect(completed.length).toBe(2);
	});

	it('should query by platform index', async () => {
		await db.games.bulkPut([
			{ ...mockGame, id: '1', platform: 'PC' },
			{ ...mockGame, id: '2', platform: 'PS5' },
			{ ...mockGame, id: '3', platform: 'PC' }
		]);
		const pcGames = await db.games.where('platform').equals('PC').toArray();
		expect(pcGames.length).toBe(2);
	});

	it('should query by genre index', async () => {
		await db.games.bulkPut([
			{ ...mockGame, id: '1', genre: 'Action' },
			{ ...mockGame, id: '2', genre: 'RPG' }
		]);
		const actionGames = await db.games.where('genre').equals('Action').toArray();
		expect(actionGames.length).toBe(1);
	});

	it('should query by tier index', async () => {
		await db.games.bulkPut([
			{ ...mockGame, id: '1', tier: 'S - Masterpiece' },
			{ ...mockGame, id: '2', tier: 'A - Amazing' },
			{ ...mockGame, id: '3', tier: 'S - Masterpiece' }
		]);
		const masterpieces = await db.games.where('tier').equals('S - Masterpiece').toArray();
		expect(masterpieces.length).toBe(2);
	});

	it('should update an existing game', async () => {
		await db.games.add(mockGame);
		await db.games.update('test-game-1', { title: 'Updated Title' });
		const game = await db.games.get('test-game-1');
		expect(game?.title).toBe('Updated Title');
	});

	it('should delete a game', async () => {
		await db.games.add(mockGame);
		await db.games.delete('test-game-1');
		const game = await db.games.get('test-game-1');
		expect(game).toBeUndefined();
	});

	it('should clear all games', async () => {
		await db.games.bulkPut([
			{ ...mockGame, id: '1' },
			{ ...mockGame, id: '2' }
		]);
		await db.games.clear();
		const count = await db.games.count();
		expect(count).toBe(0);
	});

	it('should count games correctly', async () => {
		await db.games.bulkPut([
			{ ...mockGame, id: '1' },
			{ ...mockGame, id: '2' },
			{ ...mockGame, id: '3' }
		]);
		const count = await db.games.count();
		expect(count).toBe(3);
	});
});
