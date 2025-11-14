<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';
	import { editorStore } from '$lib/stores/editor';

	interface Props {
		filteredGames: Game[];
		displayedGames?: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	}

	let { filteredGames, displayedGames = filteredGames, onOpenModal }: Props = $props();

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

	const isEditor = $derived($editorStore.editorMode);
</script>

<div
	bind:this={gridContainer}
	class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
>
	{#if filteredGames.length > 0}
		{#each filteredGames as game (game.id)}
			<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
				<GameCard {game} {displayedGames} {onOpenModal} />
			</div>
		{/each}
	{:else if isEditor}
		<div class="empty-editor-hint">
			<p>No games found for this view.</p>
			<p class="sub">Use the editor tools to add entries.</p>
		</div>
	{/if}
</div>
