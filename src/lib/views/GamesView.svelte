<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';
	import { editorStore } from '$lib/stores/editor';

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

	const isEditor = $derived($editorStore.editorMode);
</script>

	<div
		bind:this={gridContainer}
		class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		{#if filteredGames.length > 0}
			{#each filteredGames as game (game.id)}
				<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
					<GameCard {game} />
				</div>
			{/each}
		{:else if isEditor}
			<div class="empty-editor-hint">
				<p>No games found for this view.</p>
				<p class="sub">Use the editor tools to add entries.</p>
			</div>
		{:else}
			<div class="empty-state">
				<h2>No games found</h2>
				<p>Try adjusting your filters or add new games</p>
			</div>
		{/if}
	</div>
