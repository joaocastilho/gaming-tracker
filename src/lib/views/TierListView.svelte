<script lang="ts">
	import type { Game } from '$lib/types/game';
	import TierRow from '$lib/components/TierRow.svelte';

	export let filteredGames: Game[];

	// Group games by tier
	const tierNames = {
		S: 'Masterpiece',
		A: 'Excellent',
		B: 'Great',
		C: 'Good',
		D: 'Average',
		E: 'Mediocre',
		Unrated: 'Unrated'
	};

	function getTierName(tierLabel: string): string {
		return tierNames[tierLabel as keyof typeof tierNames] || tierLabel;
	}

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

<div class="tier-list-container bg-background pt-4">
	{#each Object.entries(tierGroups) as [tierLabel, games] (tierLabel)}
		<TierRow {tierLabel} {games} tierName={getTierName(tierLabel)} />
	{/each}
</div>
