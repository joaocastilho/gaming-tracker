<script lang="ts">
	import type { Game } from '$lib/types/game';
	import TierRow from '$lib/components/TierRow.svelte';
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { memoize } from '$lib/utils/memoize';

	interface Props {
		filteredGames: Game[];
	}

	let { filteredGames }: Props = $props();

	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut
	});

	const memoizedBuildTierList = memoize(buildTierList);

	let tierList = $derived(memoizedBuildTierList(filteredGames));

	function buildTierList(games: Game[]): Record<string, Game[]> {
		const gamesByTier: Record<string, Game[]> = {
			'S - Masterpiece': [],
			'A - Amazing': [],
			'B - Great': [],
			'C - Good': [],
			'D - Decent': [],
			'E - Bad': [],
			'F - Awful': []
		};

		games
			.filter((game) => game.tier)
			.forEach((game) => {
				const tier = game.tier!;
				if (gamesByTier[tier]) {
					gamesByTier[tier].push(game);
				}
			});

		return gamesByTier;
	}
</script>

{#if Object.values(tierList).every((games) => games.length === 0)}
	<div class="empty-state">
		<h2>No tiered games found</h2>
	</div>
{:else}
	<div class="tier-list-container max-w-none">
		{#each Object.entries(tierList) as [tierName, games] (tierName)}
			{#if games.length > 0}
				<TierRow {tierName} {games} {send} {receive} />
			{/if}
		{/each}
	</div>
{/if}

<style>
	.tier-list-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 1.5rem;
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
