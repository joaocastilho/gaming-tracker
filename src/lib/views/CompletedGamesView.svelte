<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';

	interface Props {
		filteredGames: Game[];
	}

	let { filteredGames }: Props = $props();

	// Filter to only completed games
	let completedGames = $derived(filteredGames.filter((game) => game.status === 'Completed'));

	const [send, receive] = crossfade({
		duration: 300,
		easing: quintOut
	});
</script>

<div
	class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
>
	{#each completedGames as game (game.id)}
		<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
			<GameCard {game} />
		</div>
	{/each}
</div>
