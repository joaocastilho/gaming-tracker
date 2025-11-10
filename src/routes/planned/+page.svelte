<script lang="ts">
	import GamesView from '$lib/views/GamesView.svelte';
	import { page } from '$app/state';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
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
		console.log(`🎮 Planned page: Received filtered data:`, value);
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
		// Initialize games from server data once
		if (data.games && data.games.length) {
			gamesStore.initializeGames(data.games);
		}
	});

	$effect(() => {
		// Apply filters from URL when page loads
		console.log(`🎮 Planned page: Reading URL parameters on page load`);
		filtersStore.readFromURL(page.url.searchParams);
	});

	const plannedGames = $derived.by(() => {
		// Use the filtered games from the worker, then filter by status
		// This ensures all filters (search, platform, genre, etc.) are applied
		const source = filteredData.filteredGames.length
			? filteredData.filteredGames
			: allGamesFromStore;

		const plannedOnly = source.filter((game) => game.status === 'Planned');
		
		// Debug: Log what we're getting
		console.log(`🎮 Planned page: source.length = ${source.length}, plannedOnly.length = ${plannedOnly.length}`);
		console.log(`🎮 Planned page: filteredData.filteredGames.length = ${filteredData.filteredGames.length}`);
		console.log(`🎮 Planned page: allGamesFromStore.length = ${allGamesFromStore.length}`);

		return plannedOnly;
	});
</script>

<div class="main-content" id="main-content">
	{#if $loading}
		<div class="loading">Loading games...</div>
	{:else}
		<GamesView filteredGames={plannedGames} />
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
