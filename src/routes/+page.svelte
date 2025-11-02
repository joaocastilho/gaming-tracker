<script lang="ts">
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import GameCard from '$lib/components/GameCard.svelte';

	// Get all games from the store
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

	// Show filtered games (both planned and completed)
	let displayGames = $derived(filterGames(allGames, searchQuery));
</script>

<svelte:head>
	<title>Gaming Tracker - All Games</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if displayGames.length === 0}
		<div class="empty-state">
			<h2>No games yet</h2>
			<p>Add your first game to get started!</p>
		</div>
	{:else}
		<div class="game-grid">
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

	.game-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 20px;
		justify-items: center;
		max-width: 100%;
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

	/* Responsive breakpoints */
	@media (max-width: 767px) {
		.game-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 768px) and (max-width: 1199px) {
		.game-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		}
	}

	@media (min-width: 1200px) {
		.game-grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		}
	}

	/* Light mode */
	:global(.light) .empty-state {
		color: #6b7280;
	}
</style>
