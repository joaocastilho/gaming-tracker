<script lang="ts">
	import GamesView from '$lib/views/GamesView.svelte';
	import { page } from '$app/state';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import { completedGamesCache } from '$lib/stores/completedGamesCache.js';
	import type { FilteredGameData } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import type { PageData } from '../$types';

	let { data }: { data: PageData } = $props();

	const filteredGamesStore = filtersStore.createFilteredGamesStore();

	let filteredData: FilteredGameData = {
		filteredGames: [],
		totalCount: 0,
		completedCount: 0,
		plannedCount: 0
	};

	let allGamesFromStore: Game[] = [];

	const { loading } = gamesStore;

	filteredGamesStore.subscribe((value) => {
		filteredData = value;
	});

	gamesStore.subscribe((games) => {
		// Debounce rapid updates to avoid excessive processing
		if (!games || games.length === 0) {
			allGamesFromStore = games;
			return;
		}

		allGamesFromStore = games;
	});

	$effect(() => {
		if (data.games) {
			gamesStore.initializeGames(data.games);
		}
		filtersStore.readFromURL(page.url.searchParams);
	});

	const completedGames = $derived.by(() => {
		console.log(`🎮 Completed page: allGamesFromStore.length = ${allGamesFromStore.length}`);
		console.log(`🎮 Completed page: filteredData.filteredGames.length = ${filteredData.filteredGames.length}`);
		
		// Use cached completed games for optimal performance when no custom filters
		const hasCustomFilters = filtersStore.isAnyFilterApplied();
		console.log(`🎮 Completed page: hasCustomFilters = ${hasCustomFilters}`);
		
		if (!hasCustomFilters && filteredData.filteredGames.length === 0) {
			// Use cached sorted completed games when no filters are applied
			console.log(`🎮 Completed page: Using cached completed games`);
			const cachedGames = completedGamesCache.getCachedCompletedGames(allGamesFromStore);
			if (cachedGames) {
				console.log(`🎮 Completed page: Cached games returned: ${cachedGames.length} games`);
				return cachedGames;
			} else {
				console.log(`🎮 Completed page: No cached games available`);
			}
		}
		
		// Use filtered games from worker when filters are active
		const source = filteredData.filteredGames.length
			? filteredData.filteredGames
			: allGamesFromStore;
		
		// Filter to only completed games
		const completedOnly = source.filter((game) => game.status === 'Completed');
		console.log(`🎮 Completed page: source.length = ${source.length}, completedOnly.length = ${completedOnly.length}`);
		
		// If we have filtered games but no custom filters, sort by finished date
		if (filteredData.filteredGames.length > 0 && !hasCustomFilters) {
			const sortedGames = completedOnly.toSorted((a, b) => {
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1;
				if (!b.finishedDate) return -1;
				return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
			});
			console.log(`🎮 Completed page: Sorted games returned: ${sortedGames.length} games`);
			return sortedGames;
		}
		
		console.log(`🎮 Completed page: Returning ${completedOnly.length} completed games`);
		return completedOnly;
	});
</script>

<div class="main-content" id="main-content">
	{#if $loading}
		<div class="loading">Loading games...</div>
	{:else}
		<GamesView filteredGames={completedGames} />
	{/if}
</div>

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		text-align: center;
		font-weight: 500;
		color: var(--color-text-primary);
		font-size: clamp(1.1rem, 2.5vw, 1.6rem);
	}
</style>
