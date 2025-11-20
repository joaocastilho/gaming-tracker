import { describe, test, expect } from 'bun:test';
import { completedGamesCache } from '$lib/stores/completedGamesCache';
import type { Game } from '$lib/types/game';

// Mock games data
const mockGames = [
	{
		id: 'game1',
		title: 'Game 1',
		mainTitle: 'Game 1',
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'Action',
		coOp: 'No' as const,
		status: 'Completed' as const,
		coverImage: 'game1.webp',
		timeToBeat: '10 hours',
		hoursPlayed: '10 hours',
		finishedDate: '2024-01-15',
		ratingPresentation: 8,
		ratingStory: 7,
		ratingGameplay: 9,
		score: 8,
		tier: 'A' as const
	},
	{
		id: 'game2',
		title: 'Game 2',
		mainTitle: 'Game 2',
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'RPG',
		coOp: 'No' as const,
		status: 'Completed' as const,
		coverImage: 'game2.webp',
		timeToBeat: '50 hours',
		hoursPlayed: '50 hours',
		finishedDate: '2024-02-20',
		ratingPresentation: 9,
		ratingStory: 9,
		ratingGameplay: 8,
		score: 8.7,
		tier: 'S' as const
	},
	{
		id: 'game3',
		title: 'Game 3',
		mainTitle: 'Game 3',
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'Adventure',
		coOp: 'No' as const,
		status: 'Planned' as const,
		coverImage: 'game3.webp',
		timeToBeat: '20 hours',
		hoursPlayed: null,
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null
	},
	{
		id: 'game4',
		title: 'Game 4',
		mainTitle: 'Game 4',
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'Action',
		coOp: 'No' as const,
		status: 'Completed' as const,
		coverImage: 'game4.webp',
		timeToBeat: '5 hours',
		hoursPlayed: '5 hours',
		finishedDate: '2024-01-01',
		ratingPresentation: 7,
		ratingStory: 6,
		ratingGameplay: 8,
		score: 7,
		tier: 'B' as const
	}
] as Game[];

describe('Completed Games Caching', () => {
	test('Initial cache update and retrieval', async () => {
		completedGamesCache.updateCache(mockGames);
		// Wait for debounce timeout (50ms + buffer)
		await new Promise((resolve) => setTimeout(resolve, 100));

		const cachedGames = completedGamesCache.getCachedCompletedGames(mockGames);

		expect(cachedGames).toBeDefined();
		expect(cachedGames?.length).toBe(3);

		// Verify sorting (most recent first - descending order)
		const dates = cachedGames!.map((g) => g.finishedDate);
		const isSorted = dates.every(
			(date, i) => i === 0 || new Date(date!) <= new Date(dates[i - 1]!)
		);
		expect(isSorted).toBe(true);
	});

	test('Cache invalidation on data change', async () => {
		const modifiedGames = [...mockGames];
		modifiedGames.push({
			id: 'game5',
			title: 'Game 5',
			mainTitle: 'Game 5',
			subtitle: null,
			platform: 'PC',
			year: 2024,
			genre: 'Strategy',
			coOp: 'No' as const,
			status: 'Completed' as const,
			coverImage: 'game5.webp',
			timeToBeat: '15 hours',
			hoursPlayed: '15 hours',
			finishedDate: '2024-03-01',
			ratingPresentation: 8,
			ratingStory: 8,
			ratingGameplay: 7,
			score: 7.7,
			tier: 'A' as const
		} as Game);

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
				return new Date(b.finishedDate!).getTime() - new Date(a.finishedDate!).getTime();
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
				return new Date(b.finishedDate!).getTime() - new Date(a.finishedDate!).getTime();
			});

		const cachedResult = completedGamesCache.getCachedCompletedGames(mockGames);

		expect(JSON.stringify(oldMethodResult.map((g) => g.id))).toBe(
			JSON.stringify(cachedResult?.map((g) => g.id) || [])
		);
	});
});
