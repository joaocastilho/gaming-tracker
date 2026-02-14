<script lang="ts">
	import type { Game } from '$lib/types/game';
	import GameCard from '$lib/components/GameCard.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';
	import VirtualList from '$lib/components/VirtualList.svelte';
	import { onMount } from 'svelte';

	interface Props {
		filteredGames: Game[];
		displayedGames?: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
		onEditGame?: (game: Game) => void;
		onDeleteGame?: (game: Game) => void;
	}

	let {
		filteredGames = [],
		displayedGames: displayedGamesProp,
		onOpenModal,
		onEditGame,
		onDeleteGame
	}: Props = $props();
	let displayedGames = $derived(displayedGamesProp ?? filteredGames ?? []);

	const isEditor = $derived($editorStore.editorMode);
	let mounted = $state(false);
	let containerWidth = $state(1600);

	let columns = $derived(
		!containerWidth || containerWidth < 768 ? 2 : Math.max(1, Math.floor(containerWidth / 320))
	);

	let rows = $derived(
		(() => {
			if (!filteredGames) return [];

			const uniqueGames = new Map();
			filteredGames.forEach((game) => {
				if (game && typeof game.id === 'string' && game.id.length > 0) {
					if (!uniqueGames.has(game.id)) {
						uniqueGames.set(game.id, game);
					}
				}
			});

			const validGames = Array.from(uniqueGames.values());

			const result = [];
			for (let i = 0; i < validGames.length; i += columns) {
				const chunk = validGames.slice(i, i + columns);
				const firstGameId = chunk[0]?.id || 'empty';
				result.push({
					id: `row-${i}-${firstGameId}`,
					games: chunk,
					startIndex: i
				});
			}
			return result;
		})()
	);

	let itemHeight = $derived(
		(() => {
			const containerPadding = 16;
			const gap = 12;
			const totalGapWidth = (columns - 1) * gap;
			const availableWidth = containerWidth - containerPadding - totalGapWidth;
			const columnWidth = availableWidth / columns;
			const coverHeight = columnWidth * 1.5;

			const infoRatio = 1.35;
			const infoHeight = Math.max(220, Math.min(260, columnWidth * infoRatio));

			return coverHeight + infoHeight;
		})()
	);

	onMount(() => {
		mounted = true;
	});

	function handleOpenModal(game: Game) {
		onOpenModal?.(game, displayedGames);
	}
</script>

<div class="game-gallery-container" bind:clientWidth={containerWidth}>
	{#if mounted && filteredGames.length > 0}
		<VirtualList
			items={rows}
			{itemHeight}
			useWindowScroll={true}
			overscan={5}
			keyExtractor={(row, i) => row?.id ?? `row-${i}`}
			className="game-gallery-virtual"
		>
			{#snippet renderItem(
				row: { id: string; games: Game[]; startIndex: number },
				isPriority: boolean
			)}
				<div class="game-row pb-5" style="height: {itemHeight}px;">
					{#each row.games as game, i (game.id ? `${game.id}-${i}` : `fallback-${row.id}-${i}`)}
						<div class="game-card-wrapper">
							<GameCard
								{game}
								{displayedGames}
								isPriority={isPriority && i < 4}
								onOpenModal={handleOpenModal}
								{onEditGame}
								{onDeleteGame}
							/>
						</div>
					{/each}
					{#if row.games.length < columns}
						{#each Array.from({ length: columns - row.games.length }) as _, i (i)}
							<div class="game-card-wrapper empty"></div>
						{/each}
					{/if}
				</div>
			{/snippet}
		</VirtualList>
	{:else if filteredGames.length > 0}
		<div class="game-gallery-virtual">
			{#each rows.slice(0, 4) as row (row.id)}
				<div class="game-row pb-5">
					{#each row.games as game, i (game.id ? `${game.id}-${i}` : `fallback-ssr-${row.id}-${i}`)}
						<div class="game-card-wrapper">
							<GameCard
								{game}
								{displayedGames}
								isPriority={i < 4}
								onOpenModal={handleOpenModal}
								{onEditGame}
								{onDeleteGame}
							/>
						</div>
					{/each}
					{#if row.games.length < columns}
						{#each Array.from({ length: columns - row.games.length }) as _, i (i)}
							<div class="game-card-wrapper empty"></div>
						{/each}
					{/if}
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
	.game-gallery-container {
		width: 100%;
		min-height: 600px;
	}

	:global(.game-gallery-virtual) {
		width: 100%;
	}

	.game-row {
		display: flex;
		justify-content: flex-start;
		gap: clamp(0.5rem, 0.5rem + 2vw, 1.5rem);
		width: 100%;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}

	.game-card-wrapper {
		flex: 1;
		display: flex;
		justify-content: center;
		min-width: 0;
	}

	.game-card-wrapper.empty {
		visibility: hidden;
	}

	.game-gallery-container :global(.game-card) {
		margin-bottom: 0;
		margin-left: auto;
		margin-right: auto;
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
