<script lang="ts">
	import { gamesStore } from '$lib/stores/games.js';
	import type { Game } from '$lib/types/game.js';

	// Get completed games with tiers from the store
	let tierGames = $state<Game[]>([]);

	$effect(() => {
		const unsubscribe = gamesStore.subscribe((games) => {
			// Only show completed games that have tiers for tier list
			tierGames = games.filter((game) => game.status === 'Completed' && game.tier);
		});
		return unsubscribe;
	});
</script>

<svelte:head>
	<title>Gaming Tracker - Tier List</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if tierGames.length === 0}
		<div class="empty-state">
			<h2>No tiered games yet</h2>
			<p>Complete some games and assign tiers to see the tier list!</p>
		</div>
	{:else}
		<!-- Tier List View - Will be implemented in Phase 4.4 -->
		<div class="gallery-placeholder">
			<p>Tier list visualization will be implemented in Phase 4.4...</p>
			<p>Tiered games count: {tierGames.length}</p>
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
