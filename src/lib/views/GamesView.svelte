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
</script>

<div class="game-grid-container">
	{#if filteredGames.length > 0}
		<div class="game-grid">
			{#each filteredGames as game (game.id)}
				<div class="game-card-wrapper">
					<GameCard {game} {displayedGames} {onOpenModal} />
				</div>
			{/each}
		</div>
	{:else if isEditor}
		<div class="empty-editor-hint">
			<p>No games found for this view.</p>
			<p class="sub">Use the editor tools to add entries.</p>
		</div>
	{/if}
</div>

<style>
	.game-grid-container {
		width: 100%;
	}

	.game-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		padding: 1rem;
		justify-items: center;
	}

	@media (min-width: 640px) {
		.game-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 768px) {
		.game-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.game-grid {
			grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		}
	}

	.game-card-wrapper {
		display: flex;
		justify-content: center;
		width: 100%;
	}
</style>
