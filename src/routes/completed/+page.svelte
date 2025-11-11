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
		console.log(
			`🎮 Completed page: filteredData.filteredGames.length = ${filteredData.filteredGames.length}`
		);

		const hasCustomFilters = filtersStore.isAnyFilterApplied();
		console.log(`🎮 Completed page: hasCustomFilters = ${hasCustomFilters}`);

		// Base source: worker-filtered games when available, otherwise all games
		const source = filteredData.filteredGames.length
			? filteredData.filteredGames
			: allGamesFromStore;

		// Always filter to only completed games first
		const completedOnly = source.filter((game) => game.status === 'Completed');
		console.log(
			`🎮 Completed page: source.length = ${source.length}, completedOnly.length = ${completedOnly.length}`
		);

		// When there are no custom filters, prefer cached sorted completed games if available
		if (!hasCustomFilters && filteredData.filteredGames.length === 0) {
			console.log(`🎮 Completed page: Attempting to use cached completed games`);
			const cachedGames = completedGamesCache.getCachedCompletedGames(allGamesFromStore);
			if (cachedGames && cachedGames.length) {
				console.log(
					`🎮 Completed page: Using cached completed games (${cachedGames.length}), already sorted by finished date`
				);
				return cachedGames;
			}
			console.log(`🎮 Completed page: No cached games available, falling back to computed list`);
		}

		// Sort completed games by finished date (desc) when:
		// - No custom filters (default view), or
		// - Sort behavior should prioritize recency
		const sortedByFinishedDate = completedOnly.toSorted((a, b) => {
			if (!a.finishedDate && !b.finishedDate) return 0;
			if (!a.finishedDate) return 1;
			if (!b.finishedDate) return -1;
			return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
		});

		console.log(
			`🎮 Completed page: Returning ${sortedByFinishedDate.length} completed games sorted by finished date desc`
		);
		return sortedByFinishedDate;
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
