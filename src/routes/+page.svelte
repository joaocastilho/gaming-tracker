<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';
	import { sortStore } from '$lib/stores/sort.js';

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

	// Get current active tab
	let currentActiveTab = $state<'all' | 'completed' | 'planned' | 'tierlist'>('all');

	// Subscribe to stores
	filteredGamesStore.subscribe((data) => {
		filteredData = data;
	});

	appStore.viewMode.subscribe((viewMode) => {
		currentViewMode = viewMode;
	});

	appStore.activeTab.subscribe((activeTab) => {
		currentActiveTab = activeTab;
	});

	// Handle browser back/forward navigation
	onMount(() => {
		// Subscribe to URL changes
		const unsubscribePage = page.subscribe(($page) => {
			// Read search query from URL when browser navigation occurs
			filtersStore.readFromURL($page.url.searchParams);
			appStore.readFromURL($page.url.searchParams);
			sortStore.readFromURL($page.url.searchParams);
		});

		// Update URL with current filter state on initial load (defer to ensure router is ready)
		const updateURLs = () => {
			try {
				filtersStore.writeToURL();
				appStore.writeToURL();
				sortStore.writeToURL();
			} catch (error) {
				// If router still not ready, try again later
				if (error instanceof Error && error.message.includes('router is initialized')) {
					setTimeout(updateURLs, 10);
				}
			}
		};

		// Use requestAnimationFrame for better timing, fallback to setTimeout
		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(updateURLs);
		} else {
			setTimeout(updateURLs, 10);
		}

		return () => {
			unsubscribePage();
		};
	});

	// Show filtered games based on active tab (computed in template)
	let allGames = $derived(filteredData.filteredGames.toSorted((a, b) => a.title.localeCompare(b.title)));
	let completedGames = $derived(filteredData.filteredGames.filter((game: Game) => game.status === 'Completed'));
	let plannedGames = $derived(filteredData.filteredGames
		.filter((game: Game) => game.status === 'Planned')
		.toSorted((a, b) => a.title.localeCompare(b.title)));
	let tierlistGames = $derived(filteredData.filteredGames.filter(
		(game: Game) => game.status === 'Completed' && game.tier
	));

	// Handle game card/row clicks for detail modal
	function handleGameClick(game: Game): void {
		modalStore.openViewModal(game);
	}
</script>

<svelte:head>
	<title>Gaming Tracker - All Games</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if currentActiveTab === 'completed'}
		{#if completedGames.length === 0}
			<div class="empty-state">
				{#if filteredData.totalCount === 0}
					<h2>No games found</h2>
					<p>Add your first game to get started!</p>
				{:else}
					<h2>No games match your search</h2>
					<p>Try adjusting your search terms or filters.</p>
				{/if}
			</div>
		{:else}
			{#if currentViewMode === 'gallery'}
				<!-- Gallery View -->
				<div
					class="grid max-w-full grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
				>
					{#each completedGames as game (game.id)}
						<GameCard {game} />
					{/each}
				</div>
			{:else}
				<!-- Table View -->
				<GameTable games={completedGames} onRowClick={handleGameClick} />
			{/if}
		{/if}
	{:else if currentActiveTab === 'planned'}
		{#if plannedGames.length === 0}
			<div class="empty-state">
				{#if filteredData.totalCount === 0}
					<h2>No games found</h2>
					<p>Add your first game to get started!</p>
				{:else}
					<h2>No games match your search</h2>
					<p>Try adjusting your search terms or filters.</p>
				{/if}
			</div>
		{:else}
			{#if currentViewMode === 'gallery'}
				<!-- Gallery View -->
				<div
					class="grid max-w-full grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
				>
					{#each plannedGames as game (game.id)}
						<GameCard {game} />
					{/each}
				</div>
			{:else}
				<!-- Table View -->
				<GameTable games={plannedGames} onRowClick={handleGameClick} />
			{/if}
		{/if}
	{:else if currentActiveTab === 'tierlist'}
		{#if tierlistGames.length === 0}
			<div class="empty-state">
				{#if filteredData.totalCount === 0}
					<h2>No games found</h2>
					<p>Add your first game to get started!</p>
				{:else}
					<h2>No games match your search</h2>
					<p>Try adjusting your search terms or filters.</p>
				{/if}
			</div>
		{:else}
			{#if currentViewMode === 'gallery'}
				<!-- Gallery View -->
				<div
					class="grid max-w-full grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
				>
					{#each tierlistGames as game (game.id)}
						<GameCard {game} />
					{/each}
				</div>
			{:else}
				<!-- Table View -->
				<GameTable games={tierlistGames} onRowClick={handleGameClick} />
			{/if}
		{/if}
	{:else}
		{#if allGames.length === 0}
			<div class="empty-state">
				{#if filteredData.totalCount === 0}
					<h2>No games found</h2>
					<p>Add your first game to get started!</p>
				{:else}
					<h2>No games match your search</h2>
					<p>Try adjusting your search terms or filters.</p>
				{/if}
			</div>
		{:else}
			{#if currentViewMode === 'gallery'}
				<!-- Gallery View -->
				<div
					class="grid max-w-full grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
				>
					{#each allGames as game (game.id)}
						<GameCard {game} />
					{/each}
				</div>
			{:else}
				<!-- Table View -->
				<GameTable games={allGames} onRowClick={handleGameClick} />
			{/if}
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
