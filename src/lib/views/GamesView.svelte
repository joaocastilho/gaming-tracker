<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Game } from '$lib/types/game';
	import GameCardSkeleton from '$lib/components/GameCardSkeleton.svelte';
	import GameCard from '$lib/components/GameCard.svelte';

	interface Props {
		filteredGames: Game[];
	}

	let { filteredGames }: Props = $props();

	const [send, receive] = crossfade({
		duration: 200,
		easing: quintOut,
		fallback() {
			return {
				duration: 0
			};
		}
	});

	let gridContainer = $state<HTMLDivElement>();
</script>

{#if filteredGames.length === 0}
	<!-- Show skeleton if no games to display -->
	<div
		class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		<GameCardSkeleton count={12} />
	</div>
{:else}
	<div
		bind:this={gridContainer}
		class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		{#each filteredGames as game (game.id)}
			<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
				<GameCard {game} />
			</div>
		{/each}
	</div>
{/if}
