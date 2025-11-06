<script lang="ts">
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	export let tierLabel: string;
	export let games: Game[];
</script>

<div class="tier-section">
	<h3 class="tier-header">
		{tierLabel}
		<span class="tier-count">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
	</h3>

	<div class="tier-games-grid">
		{#each games as game (game.id)}
			<GameCard {game} size="tiny" showTierBadge={false} />
		{/each}
	</div>
</div>

<style>
	.tier-header {
		font-size: 1.5rem;
		font-weight: 700;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.tier-count {
		font-size: 0.875rem;
		font-weight: 500;
		opacity: 0.8;
	}

	.tier-games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
	}
</style>
