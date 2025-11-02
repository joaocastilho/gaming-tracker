<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';

	import type { FilteredGameData } from '$lib/stores/filters.js';
	import GameCard from '$lib/components/GameCard.svelte';

	// Create filtered games store combining games and filters
	const filteredGamesStore = filtersStore.createFilteredGamesStore(gamesStore);

	// Get filtered games and counts
	let filteredData = $state<FilteredGameData>({
		filteredGames: [],
		totalCount: 0,
		completedCount: 0,
		plannedCount: 0
	});

	$effect(() => {
		const unsubscribe = filteredGamesStore.subscribe((data) => {
			filteredData = data;
		});
		return unsubscribe;
	});

	// Get current search query for display
	let searchQuery = $state('');
	$effect(() => {
		const unsubscribe = filtersStore.searchQuery.subscribe((value) => {
			searchQuery = value;
		});
		return unsubscribe;
	});

	// Handle browser back/forward navigation
	onMount(() => {
		// Subscribe to URL changes
		const unsubscribePage = page.subscribe(($page) => {
			// Read search query from URL when browser navigation occurs
			filtersStore.readFromURL($page.url.searchParams);
		});

		// Update URL with current filter state on initial load
		filtersStore.writeToURL();

		return () => {
			unsubscribePage();
		};
	});

	// Show filtered games (both planned and completed)
	let displayGames = $derived(filteredData.filteredGames);
</script>

<svelte:head>
	<title>Gaming Tracker - All Games</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if displayGames.length === 0}
		<div class="empty-state">
			{#if searchQuery || filteredData.totalCount === 0}
				<h2>No games found</h2>
				<p>
					{#if searchQuery}
						No games match your search "{searchQuery}". Try adjusting your search terms.
					{:else}
						Add your first game to get started!
					{/if}
				</p>
			{:else}
				<h2>No games yet</h2>
				<p>Add your first game to get started!</p>
			{/if}
		</div>
	{:else}
		<div class="game-count-info">
			<span class="count-text">
				Showing {filteredData.totalCount} game{filteredData.totalCount !== 1 ? 's' : ''}
				{#if searchQuery}
					matching "{searchQuery}"
				{/if}
			</span>
			<span class="breakdown-text">
				({filteredData.completedCount} completed, {filteredData.plannedCount} planned)
			</span>
		</div>
		<div
			class="grid max-w-full grid-cols-2 justify-items-center gap-5 md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
		>
			{#each displayGames as game (game.id)}
				<GameCard {game} />
			{/each}
		</div>
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

	.game-count-info {
		margin-bottom: 1rem;
		padding: 0 0.5rem;
		text-align: center;
	}

	.count-text {
		font-size: 0.9rem;
		font-weight: 500;
		color: #8b92a8;
	}

	.breakdown-text {
		font-size: 0.8rem;
		color: #6b7280;
		margin-left: 0.5rem;
	}

	/* Light mode */
	:global(.light) .empty-state {
		color: #6b7280;
	}

	:global(.light) .count-text {
		color: #6b7280;
	}

	:global(.light) .breakdown-text {
		color: #9ca3af;
	}
</style>
