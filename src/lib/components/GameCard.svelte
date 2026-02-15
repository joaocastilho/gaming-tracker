<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte';
	import type { Game } from '../types/game.js';
	import GameCardArtwork from './game-card/GameCardArtwork.svelte';
	import GameCardHeader from './game-card/GameCardHeader.svelte';
	import GameCardBadges from './game-card/GameCardBadges.svelte';
	import GameCardInfo from './game-card/GameCardInfo.svelte';

	interface Props {
		game: Game;
		size?: 'small' | 'large' | 'tiny' | 'tierlist';
		showTierBadge?: boolean;
		isAboveFold?: boolean;
		isPriority?: boolean;
		displayedGames?: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
		onEditGame?: (game: Game) => void;
		onDeleteGame?: (game: Game) => void;
	}

	let {
		game,
		size = 'small',
		showTierBadge = true,
		isAboveFold = false,
		isPriority = false,
		displayedGames = [],
		onOpenModal,
		onEditGame,
		onDeleteGame
	}: Props = $props();

	let cardElement = $state<HTMLDivElement>();

	function handleCardClick() {
		const rect = cardElement?.getBoundingClientRect();
		const cardRect = rect
			? {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height
				}
			: undefined;

		if (onOpenModal) {
			onOpenModal(game, displayedGames);
		} else {
			modalStore.openViewModal(game, displayedGames, undefined, cardRect);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}
</script>

<div
	bind:this={cardElement}
	class="game-card {size === 'tierlist' ? 'tierlist-size' : ''}"
	style="background-color: {game.status === 'Completed'
		? 'var(--color-surface-completed)'
		: 'var(--color-surface)'}; color: var(--color-text-primary);"
	role="button"
	tabindex="0"
	onclick={handleCardClick}
	onkeydown={handleKeyDown}
	aria-label="View details for {game.title}"
>
	<GameCardArtwork
		{game}
		{size}
		{showTierBadge}
		{isAboveFold}
		{isPriority}
		{onEditGame}
		{onDeleteGame}
	/>

	<div class="game-info">
		<GameCardHeader {game} {size} />

		{#if size === 'small'}
			<GameCardBadges {game} />
			<GameCardInfo {game} />
		{/if}
	</div>
</div>

<style>
	.game-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-width: 280px;
		border-radius: 16px;
		overflow: hidden;
		background: var(--color-surface);
		border: 0px;
		box-shadow: var(--shadow-md);
		transition: all var(--transition-normal);
		cursor: pointer;
		padding: 0;
		text-align: left;
		contain: layout style;
		container-type: inline-size;
	}

	.game-card.tierlist-size {
		width: 100%;
		min-width: 0;
		--cover-height: auto;
	}

	.game-card:hover,
	.game-card:focus-visible {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
		outline: none;
	}

	.game-info {
		padding: 16px 16px 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
		justify-content: space-between;
	}

	/* Responsive Styles */
	@media (max-width: 768px) {
		.game-card {
			min-width: auto;
		}

		.game-info {
			padding: 12px 12px 8px 12px;
			gap: 8px;
		}
	}

	@media (max-width: 480px) {
		.game-info {
			padding: 10px 10px 6px 10px;
			gap: 6px;
		}
	}
</style>
