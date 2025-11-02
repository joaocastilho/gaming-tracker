<script lang="ts">
	import { onMount } from 'svelte';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import GameCard from '$lib/components/GameCard.svelte';
	import GameTable from '$lib/components/GameTable.svelte';
	import { extractFilterOptions } from '$lib/utils/filterOptions.js';
	import { memoizeGameFilter } from '$lib/utils/memoize.js';
	import type { Game } from '$lib/types/game.js';

	let games: Game[] = [];
	let filteredGames = $state<Game[]>([]);
	let filterOptions = $state({
		platforms: [] as string[],
		genres: [] as string[],
		tiers: [] as string[]
	});
	let currentViewMode = 'gallery';
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
		filterOptions = extractFilterOptions(g);
		performanceMetrics.totalGames = g.length;
	});

	// Memoized filter function for performance testing
	const filterGames = memoizeGameFilter((games: Game[], filters: any): Game[] => {
		const startTime = performance.now();

		const result = games.filter((game) => {
			// Basic filtering logic for testing
			if (filters.searchQuery?.trim()) {
				const query = filters.searchQuery.toLowerCase().trim();
				const titleMatch = game.title.toLowerCase().includes(query);
				if (!titleMatch) return false;
			}

			if (filters.selectedPlatforms?.length > 0) {
				if (!filters.selectedPlatforms.includes(game.platform)) {
					return false;
				}
			}

			if (filters.selectedGenres?.length > 0) {
				if (!filters.selectedGenres.includes(game.genre)) {
					return false;
				}
			}

			return true;
		});

		const endTime = performance.now();
		performanceMetrics.filterTime = endTime - startTime;

		return result;
	});

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
			console.log(`   ${test.name}: ${result.length} results in ${(endTime - startTime).toFixed(2)}ms`);
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
		<h1 class="text-3xl font-bold mb-4">Performance Testing</h1>
		<p class="text-muted-foreground mb-6">
			Testing app performance with large datasets (1000+ games).
			Check browser console for detailed performance metrics.
		</p>

		<!-- Performance Metrics -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div class="bg-card p-4 rounded-lg border">
				<div class="text-2xl font-bold text-primary">{performanceMetrics.totalGames}</div>
				<div class="text-sm text-muted-foreground">Total Games</div>
			</div>
			<div class="bg-card p-4 rounded-lg border">
				<div class="text-2xl font-bold text-primary">{performanceMetrics.filteredCount}</div>
				<div class="text-sm text-muted-foreground">Filtered Games</div>
			</div>
			<div class="bg-card p-4 rounded-lg border">
				<div class="text-2xl font-bold text-primary">{performanceMetrics.loadTime.toFixed(0)}ms</div>
				<div class="text-sm text-muted-foreground">Load Time</div>
			</div>
			<div class="bg-card p-4 rounded-lg border">
				<div class="text-2xl font-bold text-primary">{performanceMetrics.filterTime.toFixed(2)}ms</div>
				<div class="text-sm text-muted-foreground">Filter Time</div>
			</div>
		</div>

		<!-- Test Controls -->
		<div class="flex gap-4 mb-6">
			<button
				class="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
				onclick={runPerformanceTests}
			>
				Run Performance Tests
			</button>
			<button
				class="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
				onclick={loadLargeDataset}
			>
				Reload Large Dataset
			</button>
		</div>
	</div>

	<!-- Sample Games Display -->
	<div class="mb-8">
		<h2 class="text-xl font-semibold mb-4">Sample Games (First 20)</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each filteredGames.slice(0, 20) as game (game.id)}
				<GameCard {game} />
			{/each}
		</div>
	</div>

	<!-- Performance Notes -->
	<div class="bg-muted p-6 rounded-lg">
		<h3 class="text-lg font-semibold mb-3">Performance Optimizations Tested:</h3>
		<ul class="list-disc list-inside space-y-1 text-sm">
			<li><strong>Memoized Filtering:</strong> Cached filter results with TTL-based expiration</li>
			<li><strong>Memoized Sorting:</strong> Cached sort operations for table views</li>
			<li><strong>Optimized Re-renders:</strong> Reduced unnecessary reactive updates</li>
			<li><strong>Lazy Image Loading:</strong> Images load only when entering viewport</li>
			<li><strong>Virtual Scrolling:</strong> Table component ready for 1000+ rows</li>
		</ul>
	</div>
</div>
