<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';
	import { sortStore } from '$lib/stores/sort.js';

	import type { FilteredGameData } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import GameCard from '$lib/components/GameCard.svelte';
	import GameTable from '$lib/components/GameTable.svelte';
	import GameCardSkeleton from '$lib/components/GameCardSkeleton.svelte';

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

	// Get loading state from games store
	let isLoadingGames = $state(false);

	// Get all games for tier list
	let allGamesForTierList = $state<Game[]>([]);

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

	gamesStore.loading.subscribe((loading) => {
		isLoadingGames = loading;
	});

	gamesStore.subscribe((games) => {
		allGamesForTierList = games;
	});

	// Handle browser back/forward navigation
	$effect(() => {
		// Read search query from URL when browser navigation occurs
		filtersStore.readFromURL(page.url.searchParams);
		appStore.readFromURL(page.url.searchParams);
		sortStore.readFromURL(page.url.searchParams);
	});

	// Update URL with current filter state on initial load (defer to ensure router is ready)
	$effect(() => {
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
	});

	// Show filtered games based on active tab (computed in template)
	let allGames = $derived(
		filteredData.filteredGames.toSorted((a, b) => a.title.localeCompare(b.title))
	);
	let completedGames = $derived(
		filteredData.filteredGames
			.filter((game: Game) => game.status === 'Completed')
			.toSorted((a, b) => {
				// Sort by finished date descending (most recent first)
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1; // null dates go to end
				if (!b.finishedDate) return -1; // null dates go to end
				return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
			})
	);
	let plannedGames = $derived(
		filteredData.filteredGames
			.filter((game: Game) => game.status === 'Planned')
			.toSorted((a, b) => a.title.localeCompare(b.title))
	);
	// Tier list organized by tiers (uses all games, not filtered)
	let tierList = $state<Record<string, Game[]>>({
		'S - Masterpiece': [],
		'A - Amazing': [],
		'B - Great': [],
		'C - Good': [],
		'D - Decent': [],
		'E - Bad': []
	});

	// Update tier list when games change
	$effect(() => {
		const gamesByTier: Record<string, Game[]> = {
			'S - Masterpiece': [],
			'A - Amazing': [],
			'B - Great': [],
			'C - Good': [],
			'D - Decent': [],
			'E - Bad': []
		};

		// Map single letter tiers to full tier names
		const tierMapping: Record<string, string> = {
			'S': 'S - Masterpiece',
			'A': 'A - Amazing',
			'B': 'B - Great',
			'C': 'C - Good',
			'D': 'D - Decent',
			'E': 'E - Bad'
		};

		// Group completed games with tiers from allGamesForTierList
		const tieredGames = allGamesForTierList
			.filter((game: Game) => game.status === 'Completed' && game.tier);

		tieredGames.forEach((game) => {
			if (game.tier) {
				// Map single letter tier to full tier name
				const fullTierName = tierMapping[game.tier] || game.tier;
				if (gamesByTier[fullTierName]) {
					gamesByTier[fullTierName].push(game);
				}
			}
		});

		// Sort games within each tier alphabetically
		Object.keys(gamesByTier).forEach((tier) => {
			gamesByTier[tier].sort((a, b) => a.title.localeCompare(b.title));
		});

		tierList = gamesByTier;
	});

	// Handle game card/row clicks for detail modal
	function handleGameClick(game: Game): void {
		modalStore.openViewModal(game);
	}

	// Convert tier name to CSS class
	function getTierClass(tier: string): string {
		return tier
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	}

	// Get tier background color
	function getTierBackgroundColor(tier: string): string {
		switch (tier) {
			case 'S - Masterpiece': return '#dc2626';
			case 'A - Amazing': return '#f97316';
			case 'B - Great': return '#eab308';
			case 'C - Good': return '#22c55e';
			case 'D - Decent': return '#06b6d4';
			case 'E - Bad': return '#6b7280';
			default: return '#6b7280';
		}
	}

	// Get tier text color
	function getTierTextColor(tier: string): string {
		return 'white';
	}
</script>

<svelte:head>
	<title>Gaming Tracker</title>
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
		{:else if currentViewMode === 'gallery'}
			<!-- Gallery View -->
			<div
				class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] pt-6"
			>
				{#each completedGames as game (game.id)}
					<GameCard {game} size="small" />
				{/each}
			</div>
		{:else}
			<!-- Table View -->
			<GameTable games={completedGames} onRowClick={handleGameClick} />
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
		{:else if currentViewMode === 'gallery'}
			<!-- Gallery View -->
			<div
				class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] pt-6"
			>
				{#each plannedGames as game (game.id)}
					<GameCard {game} size="small" />
				{/each}
			</div>
		{:else}
			<!-- Table View -->
			<GameTable games={plannedGames} onRowClick={handleGameClick} />
		{/if}
	{:else if currentActiveTab === 'tierlist'}

		{#if Object.values(tierList).every((games) => games.length === 0)}
			<div class="empty-state">
				{#if filteredData.totalCount === 0}
					<h2>No games found</h2>
					<p>Add your first game to get started!</p>
				{:else}
					<h2>No tiered games found</h2>
					<p>Complete some games and assign them tiers to see them here!</p>
				{/if}
			</div>
		{:else}
			<!-- Tier List View -->
			<div class="tier-list-container">
				{#each Object.entries(tierList) as [tier, games] (tier)}
					{#if games.length > 0}
						<div class="tier-section">
							<h3 class="tier-header" style="background-color: {getTierBackgroundColor(tier)} !important; color: {getTierTextColor(tier)} !important;">
								{tier}
								<span class="tier-count" style="color: {getTierTextColor(tier)} !important;">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
							</h3>
							{#if currentViewMode === 'gallery'}
								<div
									class="grid max-w-full grid-cols-2 justify-items-center gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 4xl:grid-cols-9"
								>
									{#each games as game (game.id)}
										<GameCard {game} size="tiny" showTierBadge={false} />
									{/each}
								</div>
							{:else}
								<!-- Table View -->
								<GameTable {games} onRowClick={handleGameClick} />
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{:else if allGames.length === 0}
		<div class="empty-state">
			{#if filteredData.totalCount === 0}
				<h2>No games found</h2>
				<p>Add your first game to get started!</p>
			{:else}
				<h2>No games match your search</h2>
				<p>Try adjusting your search terms or filters.</p>
			{/if}
		</div>
	{:else if isLoadingGames && currentViewMode === 'gallery'}
		<!-- Loading Skeleton Gallery View -->
		<div
			class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
		>
			<GameCardSkeleton count={12} />
		</div>
	{:else if currentViewMode === 'gallery'}
		<!-- Gallery View -->
		<div
			class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] pt-6"
		>
			{#each allGames as game (game.id)}
				<GameCard {game} size="small" />
			{/each}
		</div>
	{:else if isLoadingGames}
		<!-- Loading Skeleton Table View -->
		<div class="loading-table-placeholder">
			<GameCardSkeleton count={6} />
		</div>
	{:else}
		<!-- Table View -->
		<GameTable games={allGames} onRowClick={handleGameClick} />
	{/if}
</div>

<style>
	.main-content {
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

	/* Tier List Styles */
	.tier-list-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.tier-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.tier-header {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.tier-count {
		font-size: 0.875rem;
		font-weight: 500;
		opacity: 0.8;
	}


</style>
