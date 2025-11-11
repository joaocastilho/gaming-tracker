<script lang="ts">
	import GamesView from '$lib/views/GamesView.svelte';
	import { page } from '$app/state';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
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
		console.log('🎮 Planned page: Received filtered data from worker store:', value);
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
		// Ensure active tab is correctly set when visiting /planned directly,
		// so the filter worker uses the planned-tab logic.
		appStore.setActiveTab('planned');
	});

	const plannedGames = $derived.by(() => {
		// Worker already:
		// - runs with activeTab === 'planned'
		// - applies all filters
		// - restricts to status === 'Planned'
		// - sorts alphabetically by title
		//
		// So when filteredData.filteredGames is present, it is already the
		// correct, fully-processed list for the planned tab.
		if (filteredData.filteredGames && filteredData.filteredGames.length > 0) {
			console.log(
				`🎮 Planned page: using worker results: ${filteredData.filteredGames.length} planned games`
			);
			return filteredData.filteredGames;
		}

		// Fallback: mirror worker behavior on initial load or if worker not yet ready
		const plannedOnly = allGamesFromStore.filter((game) => game.status === 'Planned');
		const sortedPlanned = plannedOnly.toSorted((a, b) => a.title.localeCompare(b.title));

		console.log(
			`🎮 Planned page: fallback computed list: ${sortedPlanned.length} planned games from store`
		);
		return sortedPlanned;
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
