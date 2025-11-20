import { transformGameData } from '../src/lib/utils/dataTransformer';

/**
 * Performance Benchmarks
 *
 * Measures execution time for critical operations:
 * - Data Transformation (transformGameData)
 * - Filtering Logic (simulated)
 * - Sorting Logic (simulated)
 */

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

async function runBenchmarks() {
	console.log('🚀 Running Performance Benchmarks...\n');

	const LARGE_DATASET_SIZE = 5000;
	const ITERATIONS = 5;

	// Benchmark 1: Data Transformation
	console.log(`Benchmark 1: Transforming ${LARGE_DATASET_SIZE} games`);
	const rawGames = generateMockGames(LARGE_DATASET_SIZE);

	let totalTime = 0;
	for (let i = 0; i < ITERATIONS; i++) {
		const start = performance.now();
		rawGames.map((g) => transformGameData(g));
		const end = performance.now();
		totalTime += end - start;
	}
	const avgTransformTime = totalTime / ITERATIONS;
	console.log(`   Average time: ${avgTransformTime.toFixed(2)}ms`);

	if (avgTransformTime > 100) {
		// Threshold: 100ms for 5000 games
		console.warn('⚠️  Transformation is slower than expected (>100ms)');
	} else {
		console.log('✅ Transformation speed is within limits');
	}

	// Benchmark 2: Filtering (Simulation)
	console.log(`\nBenchmark 2: Filtering ${LARGE_DATASET_SIZE} games`);
	const transformedGames = rawGames.map((g) => transformGameData(g));

	totalTime = 0;
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
	console.log(`   Average time: ${avgFilterTime.toFixed(2)}ms`);

	if (avgFilterTime > 50) {
		// Threshold: 50ms for 5000 games
		console.warn('⚠️  Filtering is slower than expected (>50ms)');
	} else {
		console.log('✅ Filtering speed is within limits');
	}

	// Benchmark 3: Sorting (Simulation)
	console.log(`\nBenchmark 3: Sorting ${LARGE_DATASET_SIZE} games`);

	totalTime = 0;
	for (let i = 0; i < ITERATIONS; i++) {
		const start = performance.now();
		// Sort by Score Descending
		[...transformedGames].sort((a, b) => (b.score as number) - (a.score as number));
		const end = performance.now();
		totalTime += end - start;
	}
	const avgSortTime = totalTime / ITERATIONS;
	console.log(`   Average time: ${avgSortTime.toFixed(2)}ms`);

	if (avgSortTime > 50) {
		// Threshold: 50ms for 5000 games
		console.warn('⚠️  Sorting is slower than expected (>50ms)');
	} else {
		console.log('✅ Sorting speed is within limits');
	}

	console.log('\n' + '='.repeat(60));
	console.log('Benchmarks Completed');
}

runBenchmarks();
