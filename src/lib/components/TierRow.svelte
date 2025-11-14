<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
	import GameCard from '$lib/components/GameCard.svelte';
	import type { TransitionConfig, CrossfadeParams } from 'svelte/transition';

	interface Props {
		tierName: string;
		games: Game[];
		send: (node: Element, params: CrossfadeParams & { key: string }) => () => TransitionConfig;
		receive: (node: Element, params: CrossfadeParams & { key: string }) => () => TransitionConfig;
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	}

	let { tierName, games, send, receive, onOpenModal }: Props = $props();
</script>

<div class="tier-section">
	<h3 class="tier-header {getTierClass(tierName)}">
		{getTierDisplayName(tierName)}
		<span class="tier-count">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
	</h3>
	<div class="tier-games-grid">
		{#each games as game (game.id)}
			<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
				<GameCard {game} size="tiny" showTierBadge={false} {onOpenModal} />
			</div>
		{/each}
	</div>
</div>

<style>
	.tier-section {
		margin-bottom: 2rem;
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
		color: white;
	}

	.tier-count {
		font-size: 1.2rem;
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
