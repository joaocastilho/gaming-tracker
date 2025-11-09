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

<svelte:head>
	<title>Completed Games - Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if $loading}
		<p>Loading games...</p>
	{:else}
		<GamesView filteredGames={completedGames} />
	{/if}
</div>
