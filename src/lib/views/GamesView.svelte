<script lang="ts">
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';
	import { editorStore } from '$lib/stores/editor';

	interface Props {
		filteredGames: Game[];
		displayedGames?: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	}

	let { filteredGames, displayedGames = filteredGames, onOpenModal }: Props = $props();

	const isEditor = $derived($editorStore.editorMode);

	function handleOpenModal(game: Game) {
		onOpenModal?.(game, displayedGames);
	}
</script>

<div class="game-gallery">
	{#if filteredGames.length > 0}
		{#each filteredGames as game, index (game.id)}
			<GameCard {game} {displayedGames} isPriority={index < 8} onOpenModal={handleOpenModal} />
		{/each}
	{:else if isEditor}
		<div class="empty-editor-hint">
			<p>No games found for this view.</p>
			<p class="sub">Use the editor tools to add entries.</p>
		</div>
	{/if}
</div>

<style>
	.game-gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		padding: 1rem;
		justify-items: center;
		width: 100%;
	}

	/* Ensure cards are centered within their grid cells */
	.game-gallery > :global(.game-card) {
		margin-bottom: 0;
	}

	.empty-editor-hint {
		grid-column: 1 / -1;
		text-align: center;
		color: var(--color-text-secondary);
		padding: 2rem;
	}

	.empty-editor-hint .sub {
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		margin-top: 0.5rem;
	}
</style>
