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
	displayedGames = [],
	onOpenModal,
	onEditGame,
	onDeleteGame,
}: Props = $props();

let cardElement = $state<HTMLDivElement>();

function handleCardClick() {
	const rect = cardElement?.getBoundingClientRect();
	const cardRect = rect
		? {
				x: rect.x,
				y: rect.y,
				width: rect.width,
				height: rect.height,
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
		{onEditGame}
		{onDeleteGame}
	/>

	<div class="game-info">
		<GameCardHeader {game} />

		{#if size === 'small'}
			<div class="card-content-bottom">
				<GameCardBadges {game} />
				<GameCardInfo {game} />
			</div>
		{/if}
	</div>
</div>

<style>
	.game-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		max-width: 100%;
		border-radius: 8px;
		overflow: hidden;
		background: var(--color-surface);
		border: 0px;
		box-shadow: var(--shadow-md);
		transition:
			background-color var(--transition-normal),
			box-shadow var(--transition-normal);
		cursor: pointer;
		padding: 0;
		text-align: left;
		contain: layout style;
		container-type: inline-size;
		container-name: game-card;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.game-card.tierlist-size {
		width: 100%;
		min-width: 0;
		--cover-height: auto;
	}

	@media (hover: hover) {
		.game-card:hover,
		.game-card:focus-visible {
			transform: translateY(-4px);
			box-shadow: var(--shadow-xl);
			outline: none;
		}
	}

	.game-info {
		padding: clamp(8px, 4cqi, 16px);
		display: flex;
		flex-direction: column;
		gap: clamp(4px, 2cqi, 8px);
		flex-grow: 1;
	}

	.card-content-bottom {
		display: flex;
		flex-direction: column;
		gap: clamp(6px, 3cqi, 12px);
		margin-top: auto;
	}

	@container game-card (max-width: 300px) {
		.game-info {
			padding: clamp(6px, 3cqi, 10px);
			gap: clamp(4px, 2cqi, 6px);
		}

		.card-content-bottom {
			gap: clamp(4px, 2cqi, 8px);
		}
	}
</style>
