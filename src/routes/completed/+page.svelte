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
		filteredData = value;
	});

	gamesStore.subscribe((games) => {
		allGamesFromStore = games;
	});

	$effect(() => {
		if (data.games) {
			gamesStore.initializeGames(data.games);
		}
		filtersStore.readFromURL(page.url.searchParams);
	});

	$effect(() => {
		// Ensure app state / filters reflect this tab semantics if needed
		// but rely primarily on URL + filters for correctness.
	});

	const completedGames = $derived(
		(filteredData.filteredGames.length ? filteredData.filteredGames : allGamesFromStore).filter(
			(game) => game.status === 'Completed'
		)
	);
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
