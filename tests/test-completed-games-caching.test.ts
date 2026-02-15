import { describe, expect, test } from 'vitest';
import { completedGamesCache } from '$lib/stores/completedGamesCache.svelte';
import { createCompletedGame, createTestGame } from './helpers/factories';

// Mock games data — fully typed via factory functions
const mockGames = [
	createCompletedGame({
		id: 'game1',
		title: 'Game 1',
		genre: 'Action',
		finishedDate: '2024-01-15',
		ratingPresentation: 8,
		ratingStory: 7,
		ratingGameplay: 9,
		score: 8,
		tier: 'A - Amazing'
	}),
	createCompletedGame({
		id: 'game2',
		title: 'Game 2',
		genre: 'RPG',
		finishedDate: '2024-02-20',
		ratingPresentation: 9,
		ratingStory: 9,
		ratingGameplay: 8,
		score: 8.7,
		tier: 'S - Masterpiece'
	}),
	createTestGame({
		id: 'game3',
		title: 'Game 3',
		genre: 'Adventure',
		status: 'Planned',
		playtime: '20h 0m'
	}),
	createCompletedGame({
		id: 'game4',
		title: 'Game 4',
		genre: 'Action',
		finishedDate: '2024-01-01',
		ratingPresentation: 7,
		ratingStory: 6,
		ratingGameplay: 8,
		score: 7,
		tier: 'B - Great',
		playtime: '5h 0m'
	})
];

describe('Completed Games Caching', () => {
	test('Initial cache update and retrieval', async () => {
		completedGamesCache.updateCache(mockGames);
		// Wait for debounce timeout (50ms + buffer)
		await new Promise((resolve) => setTimeout(resolve, 100));

		const cachedGames = completedGamesCache.getCachedCompletedGames(mockGames);

		expect(cachedGames).toBeDefined();
		expect(cachedGames?.length).toBe(3);

		// Verify sorting (most recent first - descending order)
		if (cachedGames) {
			const dates = cachedGames.map((g) => g.finishedDate);
			const isSorted = dates.every(
				(date, i) => i === 0 || new Date(date as string) <= new Date(dates[i - 1] as string)
			);
			expect(isSorted).toBe(true);
		}
	});

	test('Cache invalidation on data change', async () => {
		const modifiedGames = [
			...mockGames,
			createCompletedGame({
				id: 'game5',
				title: 'Game 5',
				genre: 'Strategy',
				finishedDate: '2024-03-01',
				ratingPresentation: 8,
				ratingStory: 8,
				ratingGameplay: 7,
				score: 7.7,
				tier: 'A - Amazing',
				playtime: '15h 0m'
			})
		];

		completedGamesCache.updateCache(modifiedGames);
		// Wait for debounce timeout
		await new Promise((resolve) => setTimeout(resolve, 100));

		const newCachedGames = completedGamesCache.getCachedCompletedGames(modifiedGames);
		expect(newCachedGames).toBeDefined();
		expect(newCachedGames?.length).toBe(4);
	});

	test('Performance comparison simulation', async () => {
		// Ensure cache is populated first
		completedGamesCache.updateCache(mockGames);
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Simulate sorting without cache (old method)
		const oldMethodResult = mockGames
			.filter((game) => game.status === 'Completed')
			.toSorted((a, b) => {
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1;
				if (!b.finishedDate) return -1;
				return (
					new Date(b.finishedDate as string).getTime() -
					new Date(a.finishedDate as string).getTime()
				);
			});

		// Simulate sorting with cache (new method)
		const cachedResult = completedGamesCache.getCachedCompletedGames(mockGames);

		// Just verify it works, performance might vary in test env
		expect(cachedResult).toBeDefined();
		expect(cachedResult?.length).toBe(oldMethodResult.length);
	});

	test('Verify cached and direct sorting results are identical', async () => {
		// Ensure cache is populated
		completedGamesCache.updateCache(mockGames);
		await new Promise((resolve) => setTimeout(resolve, 100));

		const oldMethodResult = mockGames
			.filter((game) => game.status === 'Completed')
			.toSorted((a, b) => {
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1;
				if (!b.finishedDate) return -1;
				return (
					new Date(b.finishedDate as string).getTime() -
					new Date(a.finishedDate as string).getTime()
				);
			});

		const cachedResult = completedGamesCache.getCachedCompletedGames(mockGames);

		expect(JSON.stringify(oldMethodResult.map((g) => g.id))).toBe(
			JSON.stringify(cachedResult?.map((g) => g.id) || [])
		);
	});
});
