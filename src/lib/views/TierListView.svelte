<script lang="ts">
	import type { Game } from '$lib/types/game';
	import TierRow from '$lib/components/TierRow.svelte';

	export let filteredGames: Game[];

	// Group games by tier
	$: tierGroups = {
		S: filteredGames.filter((game) => game.tier === 'S'),
		A: filteredGames.filter((game) => game.tier === 'A'),
		B: filteredGames.filter((game) => game.tier === 'B'),
		C: filteredGames.filter((game) => game.tier === 'C'),
		D: filteredGames.filter((game) => game.tier === 'D'),
		E: filteredGames.filter((game) => game.tier === 'E'),
		Unrated: filteredGames.filter((game) => !game.tier)
	};
</script>

<div class="tier-list-container">
	{#each Object.entries(tierGroups) as [tierLabel, games] (tierLabel)}
		<TierRow {tierLabel} {games} />
	{/each}
</div>
