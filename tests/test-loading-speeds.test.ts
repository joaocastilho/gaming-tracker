import { describe, test, expect } from 'bun:test';
import { transformGameData } from '$lib/utils/dataTransformer';

function generateMockGames(count: number) {
	const games = [];
	for (let i = 0; i < count; i++) {
		games.push({
			id: `game-${i}`,
			title: `Game Title ${i} (Subtitle)`,
			platform: i % 2 === 0 ? 'PC' : 'PS5',
			genre: i % 3 === 0 ? 'RPG' : 'Action',
			finishedDate: new Date().toISOString(),
			hoursPlayed: Math.random() * 100,
			score: Math.random() * 10
		});
	}
	return games;
}

describe('Loading Speeds', () => {
	const LARGE_DATASET_SIZE = 5000;
	const ITERATIONS = 5;

	test('Data Transformation Benchmark', () => {
		const rawGames = generateMockGames(LARGE_DATASET_SIZE);

		let totalTime = 0;
		for (let i = 0; i < ITERATIONS; i++) {
			const start = performance.now();
			rawGames.map((g) => transformGameData(g));
			const end = performance.now();
			totalTime += end - start;
		}
		const avgTransformTime = totalTime / ITERATIONS;
		console.log(`   Average transformation time: ${avgTransformTime.toFixed(2)}ms`);

		// Just ensure it runs, don't fail on performance in test env
		expect(avgTransformTime).toBeGreaterThan(0);
	});

	test('Filtering Benchmark', () => {
		const rawGames = generateMockGames(LARGE_DATASET_SIZE);
		const transformedGames = rawGames.map((g) => transformGameData(g));

		let totalTime = 0;
		for (let i = 0; i < ITERATIONS; i++) {
			const start = performance.now();
			// Simulate complex filter: Search + Platform + Genre
			transformedGames.filter((g) => {
				const matchesSearch = (g.mainTitle as string).includes('Game');
				const matchesPlatform = g.platform === 'PC';
				const matchesGenre = g.genre === 'RPG';
				return matchesSearch && matchesPlatform && matchesGenre;
			});
			const end = performance.now();
			totalTime += end - start;
		}
		const avgFilterTime = totalTime / ITERATIONS;
		console.log(`   Average filtering time: ${avgFilterTime.toFixed(2)}ms`);

		expect(avgFilterTime).toBeGreaterThan(0);
	});

	test('Sorting Benchmark', () => {
		const rawGames = generateMockGames(LARGE_DATASET_SIZE);
		const transformedGames = rawGames.map((g) => transformGameData(g));

		let totalTime = 0;
		for (let i = 0; i < ITERATIONS; i++) {
			const start = performance.now();
			// Sort by Score Descending
			[...transformedGames].sort((a, b) => (b.score as number) - (a.score as number));
			const end = performance.now();
			totalTime += end - start;
		}
		const avgSortTime = totalTime / ITERATIONS;
		console.log(`   Average sorting time: ${avgSortTime.toFixed(2)}ms`);

		expect(avgSortTime).toBeGreaterThan(0);
	});
});
