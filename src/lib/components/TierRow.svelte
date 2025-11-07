<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	export let tierLabel: string;
	export let tierName: string;
	export let games: Game[];

	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut
	});
</script>

<div class="tier-section">
	<h3 class="tier-header" style="background-color: var(--color-tier-{tierLabel.toLowerCase()})">
		{tierLabel} - {tierName}
		<span class="tier-count">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
	</h3>

	<div class="tier-games-grid">
		{#each games as game (game.id)}
			<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
				<GameCard {game} size="tiny" showTierBadge={false} />
			</div>
		{/each}
	</div>
</div>

<style>
	.tier-section {
		margin-bottom: 2rem; /* Space between sections */
	}

	.tier-header {
		font-size: 1.5rem;
		font-weight: 700;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		/* background-color set via inline style */
		color: white;
	}

	.tier-count {
		font-size: 0.875rem;
		font-weight: 500;
		opacity: 0.8;
	}

	.tier-games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
	}
</style>
