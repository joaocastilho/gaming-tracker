<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	export let filteredGames: Game[];
	export let viewMode: string;

	// Filter to only planned games
	$: plannedGames = filteredGames.filter((game) => game.status === 'Planned');

	const [, receive] = crossfade({
		duration: 300,
		easing: (t) => t * t * (3 - 2 * t) // ease-in-out cubic
	});
</script>

{#if viewMode === 'gallery'}
	<div
		class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		{#each plannedGames as game (game.id)}
			<div transition:receive={{ key: game.id }}>
				<GameCard {game} />
			</div>
		{/each}
	</div>
{:else}
	<table class="game-table">
		<tbody>
			{#each plannedGames as game (game.id)}
				<tr>
					<td>{game.title}</td>
					<td>{game.platform}</td>
					<td>{game.year}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
