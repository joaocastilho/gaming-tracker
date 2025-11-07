<script lang="ts">
	import { appStore } from '$lib/stores/app';
	import type { Game } from '$lib/types/game';
	import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
	import GameCard from '$lib/components/GameCard.svelte';
	import GameTable from '$lib/components/GameTable.svelte';
	import type { TransitionConfig, CrossfadeParams } from 'svelte/transition';

	const { viewMode } = appStore;

	interface Props {
		tierName: string;
		games: Game[];
		send: (node: Element, params: CrossfadeParams & { key: string }) => () => TransitionConfig;
		receive: (node: Element, params: CrossfadeParams & { key: string }) => () => TransitionConfig;
	}

	let { tierName, games, send, receive }: Props = $props();
</script>

<div class="tier-section">
	<h3 class="tier-header {getTierClass(tierName)}">
		{getTierDisplayName(tierName)}
		<span class="tier-count">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
	</h3>
	{#if $viewMode === 'gallery'}
		<div class="tier-games-grid">
			{#each games as game (game.id)}
				<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
					<GameCard {game} size="tiny" showTierBadge={false} />
				</div>
			{/each}
		</div>
	{:else}
		<GameTable {games} />
	{/if}
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
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 1rem;
		max-width: none;
		width: 100%;
	}
</style>
