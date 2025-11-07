<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	export let filteredGames: Game[];
	export let viewMode: string;

	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut
	});
</script>

{#if viewMode === 'gallery'}
	<!-- Gallery view implementation -->
	<div
		class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		{#each filteredGames as game (game.id)}
			<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
				<GameCard {game} />
			</div>
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
