<script lang="ts">
import type { Game, TierValue } from '$lib/types/game';
import TierRow from '$lib/components/TierRow.svelte';

interface Props {
	filteredGames: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
}

let { filteredGames = [], onOpenModal }: Props = $props();

let tierList = $derived(buildTierList(filteredGames ?? []));
let allGames = $derived(Object.values(tierList).flat());

function buildTierList(games: Game[]): Record<string, Game[]> {
	const gamesByTier: Record<string, Game[]> = {
		'S - Masterpiece': [],
		'A - Amazing': [],
		'B - Great': [],
		'C - Good': [],
		'D - Decent': [],
		'E - Bad': [],
	};

	games
		.filter((game): game is Game & { tier: TierValue } => game.tier !== null)
		.forEach((game) => {
			const tier = game.tier;
			if (gamesByTier[tier]) {
				gamesByTier[tier].push(game);
			}
		});

	return gamesByTier;
}

let rows = $derived.by(() => {
	const entries = Object.entries(tierList).filter(([, games]) => games.length > 0);
	return entries.map(([tierName, games]) => ({
		tierName,
		games,
		allGames,
	}));
});
</script>

{#if rows.length === 0}
	<div class="empty-state">
		<h2>No tiered games found</h2>
	</div>
{:else}
	<div class="tier-list-container max-w-none">
		{#each rows as row (row.tierName)}
			<TierRow tierName={row.tierName} games={row.games} allGames={row.allGames} {onOpenModal} />
		{/each}
	</div>
{/if}

<style>
	.tier-list-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 0;
		padding-bottom: 60px;
	}

	@media (max-width: 768px) {
		.tier-list-container {
			padding-top: 0.25rem;
			padding-bottom: 60px;
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		text-align: center;
		color: var(--color-text-tertiary);
	}

	.empty-state h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		color: var(--color-text-primary);
	}
</style>
