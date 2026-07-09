<script lang="ts">
import type { Game } from '$lib/types/game';
import GameCard from '$lib/components/GameCard.svelte';
import { editorStore } from '$lib/stores/editor.svelte';
import SkeletonGrid from '$lib/components/SkeletonGrid.svelte';

interface Props {
	filteredGames: Game[];
	displayedGames?: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
	loading?: boolean;
}

let {
	filteredGames = [],
	displayedGames: displayedGamesProp,
	onOpenModal,
	onEditGame,
	onDeleteGame,
	loading = false,
}: Props = $props();
let displayedGames = $derived(displayedGamesProp ?? filteredGames ?? []);

const isEditor = $derived(editorStore.editorMode);
let mounted = $state(true);

function handleOpenModal(game: Game) {
	onOpenModal?.(game, displayedGames);
}
</script>

<div class="game-gallery-container">
	{#if mounted && filteredGames.length > 0}
		<div class="game-gallery-grid">
			{#each filteredGames as game (game.id)}
				<div class="game-card-grid-item">
					<GameCard
						{game}
						{displayedGames}
						onOpenModal={handleOpenModal}
						{onEditGame}
						{onDeleteGame}
					/>
				</div>
			{/each}
		</div>
	{:else if loading || !mounted}
		<SkeletonGrid />
	{:else if isEditor}
		<div class="empty-editor-hint">
			<p>No games found for this view.</p>
			<p class="sub">Use the editor tools to add entries.</p>
		</div>
	{/if}
</div>

<style>
	.game-gallery-container {
		width: 100%;
		min-height: 600px;
		padding-bottom: 60px;
	}

	.game-gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		justify-content: center;
		gap: 12px;
		width: 100%;
	}

	.game-card-grid-item {
		display: flex;
		justify-content: center;
		min-width: 0;
	}

	.game-gallery-container :global(.game-card) {
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