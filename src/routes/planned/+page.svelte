<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';

	import type { FilteredGameData } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import GameCard from '$lib/components/GameCard.svelte';
	import GameTable from '$lib/components/GameTable.svelte';

	// Create filtered games store combining games and filters
	const filteredGamesStore = filtersStore.createFilteredGamesStore(gamesStore);

	// Get filtered games and counts
	let filteredData = $state<FilteredGameData>({
		filteredGames: [],
		totalCount: 0,
		completedCount: 0,
		plannedCount: 0
	});

	// Get current view mode
	let currentViewMode = $state<'gallery' | 'table'>('gallery');

	$effect(() => {
		const unsubscribe = filteredGamesStore.subscribe((data) => {
			filteredData = data;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = appStore.viewMode.subscribe((viewMode) => {
			currentViewMode = viewMode;
		});
		return unsubscribe;
	});

	// Handle browser back/forward navigation
	onMount(() => {
		// Subscribe to URL changes
		const unsubscribePage = page.subscribe(($page) => {
			// Read search query from URL when browser navigation occurs
			filtersStore.readFromURL($page.url.searchParams);
			appStore.readFromURL($page.url.searchParams);
		});

		// Update URL with current filter state on initial load
		filtersStore.writeToURL();
		appStore.writeToURL();

		return () => {
			unsubscribePage();
		};
	});

	// Filter to show only planned games, sorted alphabetically
	let displayGames = $derived(
		filteredData.filteredGames
			.filter((game) => game.status === 'Planned')
			.toSorted((a, b) => a.title.localeCompare(b.title))
	);

	// Handle game card/row clicks for detail modal
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function handleGameClick(_game: Game): void {
		// TODO: Implement modal functionality
	}
</script>

<svelte:head>
	<title>Gaming Tracker - Planned Games</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if displayGames.length === 0}
		<div class="empty-state">
			{#if filteredData.plannedCount === 0}
				<h2>No planned games yet</h2>
				<p>Add some games to your wishlist to see them here!</p>
			{:else}
				<h2>No planned games match your search</h2>
				<p>Try adjusting your search terms or filters.</p>
			{/if}
		</div>
		{:else}
			{#if currentViewMode === 'gallery'}
			<!-- Gallery View -->
			<div
				class="grid max-w-full grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
			>
				{#each displayGames as game (game.id)}
					<GameCard {game} />
				{/each}
			</div>
		{:else}
			<!-- Table View -->
			<GameTable games={displayGames} onRowClick={handleGameClick} />
		{/if}
	{/if}
</div>

<style>
	.main-content {
		padding: 0 1.5rem;
		min-height: calc(100vh - 140px); /* Account for header and navigation */
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		text-align: center;
		color: #8b92a8;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		color: inherit;
	}

	/* Light mode */
	:global(.light) .empty-state {
		color: #6b7280;
	}
</style>
