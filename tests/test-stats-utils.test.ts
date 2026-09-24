import { describe, expect, it } from 'vitest';
import type { Game } from '$lib/types/game';
import { computeGenreStats, computeScoreDistribution } from '$lib/utils/statsUtils';
import { createTestGame } from './helpers/factories';

describe('computeGenreStats', () => {
	it('includes every completed genre sorted by count and then name', () => {
		const games: Game[] = [
			createTestGame({ status: 'Completed', genre: 'Strategy', score: 16 }),
			createTestGame({ status: 'Completed', genre: 'Puzzle', score: 14 }),
			createTestGame({ status: 'Completed', genre: 'Puzzle', score: 18 }),
			createTestGame({ status: 'Completed', genre: 'Action', score: 12 }),
			createTestGame({ status: 'Completed', genre: 'Action', score: 16 }),
			createTestGame({ status: 'Completed', genre: 'Action', score: null }),
			createTestGame({ status: 'Completed', genre: 'Metroidvania', score: 15 }),
			createTestGame({ status: 'Completed', genre: 'Metroidvania', score: 17 }),
			createTestGame({ status: 'Completed', genre: 'RPG', score: 14 }),
			createTestGame({ status: 'Completed', genre: 'RPG', score: 16 }),
			createTestGame({ status: 'Completed', genre: 'Survival', score: 12 }),
			createTestGame({ status: 'Completed', genre: 'Survival', score: 14 }),
		];

		const stats = computeGenreStats(games);

		expect(stats.map(({ name }) => name)).toEqual(['Action', 'Metroidvania', 'Puzzle', 'RPG', 'Survival', 'Strategy']);
		expect(stats[0]).toMatchObject({ count: 3, ratedCount: 2, totalScore: 28, averageScore: 14, percentage: 25 });
		expect(stats[1]).toMatchObject({ count: 2, ratedCount: 2, totalScore: 32, averageScore: 16, percentage: 16.7 });
		expect(stats[5]).toMatchObject({ count: 1, ratedCount: 1, totalScore: 16, averageScore: 16, percentage: 8.3 });
	});

	it('ignores games that are not completed', () => {
		const stats = computeGenreStats([
			createTestGame({ status: 'Planned', genre: 'Planned only' }),
			createTestGame({ status: 'Playing', genre: 'Playing only' }),
		]);

		expect(stats).toEqual([]);
	});

	describe('computeScoreDistribution', () => {
		it('groups every rated completed game into score bands', () => {
			const distribution = computeScoreDistribution([
				createTestGame({ status: 'Completed', score: 4 }),
				createTestGame({ status: 'Completed', score: 8 }),
				createTestGame({ status: 'Completed', score: 12 }),
				createTestGame({ status: 'Completed', score: 16 }),
				createTestGame({ status: 'Completed', score: 20 }),
				createTestGame({ status: 'Completed', score: null }),
				createTestGame({ status: 'Planned', score: 18 }),
			]);

			expect(distribution).toEqual([
				{ label: '0–4', min: 0, max: 4, count: 1, percentage: 20 },
				{ label: '5–8', min: 5, max: 8, count: 1, percentage: 20 },
				{ label: '9–12', min: 9, max: 12, count: 1, percentage: 20 },
				{ label: '13–16', min: 13, max: 16, count: 1, percentage: 20 },
				{ label: '17–20', min: 17, max: 20, count: 1, percentage: 20 },
			]);
		});
	});
});
