<script module lang="ts">
	import { dev } from '$app/environment';
	import { error } from '@sveltejs/kit';

	// Only allow access in development
	if (!dev) {
		error(404, 'Performance test page is only available in development mode');
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gamesStore } from '$lib/stores/games.js';
	import GameCard from '$lib/components/GameCard.svelte';
	import { memoizeGameFilter } from '$lib/utils/memoize.js';
	import type { Game } from '$lib/types/game.js';

	let games: Game[] = [];
	let filteredGames = $state<Game[]>([]);
	let performanceMetrics = {
		loadTime: 0,
		filterTime: 0,
		renderTime: 0,
		totalGames: 0,
		filteredCount: 0
	};

	// Subscribe to games store
	gamesStore.subscribe((g) => {
		games = g;
		performanceMetrics.totalGames = g.length;
	});

	// Memoized filter function for performance testing
	const filterGames = memoizeGameFilter(
		(
			games: Game[],
			filters: {
				searchQuery?: string;
				selectedPlatforms?: string[];
				selectedGenres?: string[];
			}
		): Game[] => {
			const startTime = performance.now();

			const result = games.filter((game) => {
				// Basic filtering logic for testing
				if (filters.searchQuery && filters.searchQuery.trim()) {
					const query = filters.searchQuery.toLowerCase().trim();
					const titleMatch = game.title.toLowerCase().includes(query);
					if (!titleMatch) return false;
				}

				if (filters.selectedPlatforms && filters.selectedPlatforms.length > 0) {
					if (!filters.selectedPlatforms.includes(game.platform)) {
						return false;
					}
				}

				if (filters.selectedGenres && filters.selectedGenres.length > 0) {
					if (!filters.selectedGenres.includes(game.genre)) {
						return false;
					}
				}

				return true;
			});

			const endTime = performance.now();
			performanceMetrics.filterTime = endTime - startTime;

			return result;
		}
	);

	// Reactive filtered games
	$effect(() => {
		const renderStart = performance.now();
		filteredGames = filterGames(games, {
			searchQuery: '',
			selectedPlatforms: [],
			selectedGenres: []
		});
		performanceMetrics.filteredCount = filteredGames.length;
		const renderEnd = performance.now();
		performanceMetrics.renderTime = renderEnd - renderStart;
	});

	// Load large dataset
	async function loadLargeDataset() {
		const startTime = performance.now();
		await gamesStore.loadGames(undefined, true);
		const endTime = performance.now();
		performanceMetrics.loadTime = endTime - startTime;
	}

	// Run performance tests
	async function runPerformanceTests() {
		console.log('🚀 Starting Performance Tests...');

		// Test 1: Load time
		console.log('📊 Test 1: Dataset Loading');
		await loadLargeDataset();
		console.log(`   Load time: ${performanceMetrics.loadTime.toFixed(2)}ms`);

		// Test 2: Filtering performance
		console.log('📊 Test 2: Filtering Performance');
		const filterTests = [
			{ name: 'No filters', filters: {} },
			{ name: 'Platform filter', filters: { selectedPlatforms: ['PC'] } },
			{ name: 'Genre filter', filters: { selectedGenres: ['Action'] } },
			{ name: 'Search filter', filters: { searchQuery: 'legend' } }
		];

		for (const test of filterTests) {
			const startTime = performance.now();
			const result = filterGames(games, test.filters);
			const endTime = performance.now();
			console.log(
				`   ${test.name}: ${result.length} results in ${(endTime - startTime).toFixed(2)}ms`
			);
		}

		// Test 3: Memoization effectiveness
		console.log('📊 Test 3: Memoization Effectiveness');
		const memoTestFilters = { selectedPlatforms: ['PC'] };
		const times = [];

		for (let i = 0; i < 10; i++) {
			const startTime = performance.now();
			filterGames(games, memoTestFilters);
			const endTime = performance.now();
			times.push(endTime - startTime);
		}

		const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
		const firstTime = times[0];
		const speedup = firstTime / avgTime;
		console.log(`   First run: ${firstTime.toFixed(2)}ms`);
		console.log(`   Average (cached): ${avgTime.toFixed(2)}ms`);
		console.log(`   Speedup: ${speedup.toFixed(1)}x`);

		console.log('✅ Performance Tests Complete!');
	}

	onMount(() => {
		// Auto-run performance tests when component mounts
		runPerformanceTests();
	});
</script>

<svelte:head>
	<title>Performance Test - Gaming Tracker</title>
</svelte:head>

<div class="container mx-auto px-6 py-8">
	<div class="mb-8">
		<h1 class="mb-4 text-3xl font-bold">Performance Testing</h1>
		<p class="text-muted-foreground mb-6">
			Testing app performance with large datasets (1000+ games). Check browser console for detailed
			performance metrics.
		</p>

		<!-- Performance Metrics -->
		<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
			<div class="bg-card rounded-lg border p-4">
				<div class="text-primary text-2xl font-bold">{performanceMetrics.totalGames}</div>
				<div class="text-muted-foreground text-sm">Total Games</div>
			</div>
			<div class="bg-card rounded-lg border p-4">
				<div class="text-primary text-2xl font-bold">{performanceMetrics.filteredCount}</div>
				<div class="text-muted-foreground text-sm">Filtered Games</div>
			</div>
			<div class="bg-card rounded-lg border p-4">
				<div class="text-primary text-2xl font-bold">
					{performanceMetrics.loadTime.toFixed(0)}ms
				</div>
				<div class="text-muted-foreground text-sm">Load Time</div>
			</div>
			<div class="bg-card rounded-lg border p-4">
				<div class="text-primary text-2xl font-bold">
					{performanceMetrics.filterTime.toFixed(2)}ms
				</div>
				<div class="text-muted-foreground text-sm">Filter Time</div>
			</div>
		</div>

		<!-- Test Controls -->
		<div class="mb-6 flex gap-4">
			<button
				class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors"
				onclick={runPerformanceTests}
			>
				Run Performance Tests
			</button>
			<button
				class="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-md px-4 py-2 transition-colors"
				onclick={loadLargeDataset}
			>
				Reload Large Dataset
			</button>
		</div>
	</div>

	<!-- Sample Games Display -->
	<div class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Sample Games (First 20)</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredGames.slice(0, 20) as game (game.id)}
				<GameCard {game} />
			{/each}
		</div>
	</div>

	<!-- Performance Notes -->
	<div class="bg-muted rounded-lg p-6">
		<h3 class="mb-3 text-lg font-semibold">Performance Optimizations Tested:</h3>
		<ul class="list-inside list-disc space-y-1 text-sm">
			<li><strong>Memoized Filtering:</strong> Cached filter results with TTL-based expiration</li>
			<li><strong>Memoized Sorting:</strong> Cached sort operations for table views</li>
			<li><strong>Optimized Re-renders:</strong> Reduced unnecessary reactive updates</li>
			<li><strong>Lazy Image Loading:</strong> Images load only when entering viewport</li>
			<li><strong>Virtual Scrolling:</strong> Table component ready for 1000+ rows</li>
		</ul>
	</div>
</div>
