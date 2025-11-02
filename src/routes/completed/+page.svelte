<script lang="ts">
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';

	// Get completed games from the store
	let allGames = $state<Game[]>([]);
	let searchQuery = $state('');

	$effect(() => {
		const unsubscribe = gamesStore.subscribe((games) => {
			allGames = games;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = filtersStore.searchQuery.subscribe((value) => {
			searchQuery = value;
		});
		return unsubscribe;
	});

	function filterGames(games: Game[], query: string): Game[] {
		if (!query.trim()) return games;
		const lowerQuery = query.toLowerCase();
		return games.filter((game) => game.title.toLowerCase().includes(lowerQuery));
	}

	// Get filtered completed games
	let completedGames = $derived(
		filterGames(allGames, searchQuery).filter((game) => game.status === 'Completed')
	);
</script>

<svelte:head>
	<title>Gaming Tracker - Completed Games</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if completedGames.length === 0}
		<div class="empty-state">
			<h2>No completed games yet</h2>
			<p>Complete some games to see them here!</p>
		</div>
	{:else}
		<!-- Gallery Grid - Will be implemented in Phase 2.2 -->
		<div class="gallery-placeholder">
			<p>Completed games gallery view will be implemented next...</p>
			<p>Completed games count: {completedGames.length}</p>
		</div>
	{/if}
</div>

<style>
	.main-content {
		padding: 2rem;
		min-height: calc(100vh - 140px);
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

	.gallery-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		text-align: center;
		color: #8b92a8;
		border: 2px dashed #2a2f3a;
		border-radius: 8px;
		padding: 2rem;
	}

	.gallery-placeholder p {
		margin: 0.5rem 0;
	}

	/* Light mode */
	:global(.light) .empty-state,
	:global(.light) .gallery-placeholder {
		color: #6b7280;
	}

	:global(.light) .gallery-placeholder {
		border-color: #e5e7eb;
	}
</style>
