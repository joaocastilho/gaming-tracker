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

	// 1. Create the crossfade transitions
	// These will be passed down to <TierRow>
	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut
	});

	// 2. Create a memoized version of the build function
	// This ensures the expensive filtering/sorting only runs when
	// the list of games actually changes.
	const memoizedBuildTierList = memoize(buildTierList);

	// 3. Pass the reactive games array to the memoized function
	let tierList = $derived(memoizedBuildTierList(filteredGames));

	// 4. This is now a pure function that accepts the games array
	function buildTierList(games: Game[]): Record<string, Game[]> {
		const gamesByTier: Record<string, Game[]> = {
			S: [],
			A: [],
			B: [],
			C: [],
			D: [],
			E: [],
			F: []
		};

		// Use the 'games' argument instead of the global store
		games
			.filter((game) => game.tier)
			.sort((a, b) => a.title.localeCompare(b.title))
			.forEach((game) => {
				if (game.tier && gamesByTier[game.tier]) {
					gamesByTier[game.tier].push(game);
				}
			});

		return gamesByTier;
	}
</script>

{#if Object.values(tierList).every((games) => games.length === 0)}
	<div class="empty-state">
		<h2>No tiered games found</h2>
		<p>Filter your games or assign tiers to see them here!</p>
	</div>
{:else}
	<div class="tier-list-container">
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
