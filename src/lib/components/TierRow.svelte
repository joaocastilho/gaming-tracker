<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
	import GameCard from '$lib/components/GameCard.svelte';

	interface Props {
		tierName: string;
		games: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	}

	let { tierName, games, onOpenModal }: Props = $props();

	let displayedCount = $state(20);
	let displayedGames = $derived(games.slice(0, displayedCount));

	function intersectionObserver(node: HTMLElement) {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				displayedCount += 20;
			}
		});

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<div class="tier-section">
	<h3 class="tier-header {getTierClass(tierName)}">
		{getTierDisplayName(tierName)}
		<span class="tier-count">{games.length} {games.length === 1 ? 'game' : 'games'}</span>
	</h3>
	<div class="tier-games-grid">
		{#each displayedGames as game (game.id)}
			<div>
				<GameCard
					{game}
					size="tierlist"
					showTierBadge={false}
					{onOpenModal}
					displayedGames={games}
				/>
			</div>
		{/each}

		{#if displayedCount < games.length}
			<div class="sentinel" use:intersectionObserver></div>
		{/if}
	</div>
</div>

<style>
	.tier-section {
		margin-bottom: 2rem;
		content-visibility: auto;
		contain-intrinsic-size: 1px 500px;
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
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		max-width: 100%;
		width: 100%;
	}

	@media (max-width: 768px) {
		.tier-games-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 0.5rem;
		}
	}
</style>
