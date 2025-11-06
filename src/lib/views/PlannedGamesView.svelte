<script lang="ts">
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	export let filteredGames: Game[];
	export let viewMode: string;

	// Filter to only planned games
	$: plannedGames = filteredGames.filter((game) => game.status === 'Planned');
</script>

{#if viewMode === 'gallery'}
	<div class="game-grid">
		{#each plannedGames as game (game.id)}
			<GameCard {game} />
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
