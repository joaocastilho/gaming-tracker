<script lang="ts">
import type { Game } from '$lib/types/game';
import GameCard from '$lib/components/GameCard.svelte';
import { editorStore } from '$lib/stores/editor.svelte';
import SkeletonGrid from '$lib/components/SkeletonGrid.svelte';
import VirtualList from '$lib/components/VirtualList.svelte';

interface Props {
	filteredGames: Game[];
	displayedGames?: Game[];
	onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
	loading?: boolean;
}

let { filteredGames = [], onOpenModal, onEditGame, onDeleteGame, loading = false }: Props = $props();

const isEditor = $derived(editorStore.editorMode);
let mounted = $state(true);
let container = $state<HTMLDivElement>();
let columns = $state(1);

$effect(() => {
	if (!container) return;
	const observer = new ResizeObserver((entries) => {
		const width = entries[0]?.contentRect.width ?? 0;
		if (width < 768) {
			columns = 2;
		} else {
			const calc = Math.floor((width + 12) / (300 + 12));
			columns = Math.min(5, Math.max(1, calc));
		}
	});
	observer.observe(container);
	return () => observer.disconnect();
});

let rows = $derived.by(() => {
	if (!filteredGames) return [];

	const uniqueGames = new Map();
	for (const game of filteredGames) {
		if (game && typeof game.id === 'string' && game.id.length > 0) {
			if (!uniqueGames.has(game.id)) {
				uniqueGames.set(game.id, game);
			}
		}
	}

	const validGames = Array.from(uniqueGames.values());
	const result = [];
	for (let i = 0; i < validGames.length; i += columns) {
		const chunk = validGames.slice(i, i + columns);
		const firstGameId = chunk[0]?.id || 'empty';
		result.push({
			id: `row-${i}-${firstGameId}`,
			games: chunk,
			startIndex: i,
		});
	}
	return result;
});

let itemHeight = $derived.by(() => {
	const coverHeight = 300 * 1.5;
	const infoHeight = 360;
	return coverHeight + infoHeight;
});
</script>

<div bind:this={container} class="game-gallery-container">
	{#if mounted && filteredGames.length > 0}
		<VirtualList
			items={rows}
			{itemHeight}
			useWindowScroll={true}
			overscan={2}
			keyExtractor={(row) => row?.id ?? 'row'}
			className="game-gallery-virtual"
		>
			{#snippet renderItem(row: { id: string; games: Game[]; startIndex: number }, isPriority: boolean)}
				<div class="game-row pb-5">
					{#each row.games as game, i (game.id ?? `fallback-${row.id}-${game.title || 'unknown'}`)}
						<GameCard
							{game}
							size="small"
							showTierBadge={true}
							isAboveFold={isPriority && i < 4}
							{onOpenModal}
							{onEditGame}
							{onDeleteGame}
							displayedGames={filteredGames}
						/>
					{/each}
				</div>
			{/snippet}
		</VirtualList>
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

	:global(.game-gallery-virtual) {
		width: 100%;
	}

	.game-row {
		display: flex;
		justify-content: center;
		gap: 12px;
		width: 100%;
		flex-wrap: wrap;
	}

	.game-gallery-container :global(.game-card) {
		flex: 1 1 300px;
		max-width: 300px;
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