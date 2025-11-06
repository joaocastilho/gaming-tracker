<script lang="ts">
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	export let filteredGames: Game[];
	export let viewMode: string;
</script>

{#if viewMode === 'gallery'}
	<!-- Gallery view implementation -->
	<div
		class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		{#each filteredGames as game (game.id)}
			<GameCard {game} />
		{/each}
	</div>
{:else}
	<!-- Table view implementation -->
	<table class="game-table">
		<tbody>
			{#each filteredGames as game (game.id)}
				<tr>
					<td>{game.title}</td>
					<td>{game.platform}</td>
					<td>{game.status}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
