<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const titleText = $derived(game.mainTitle || game.title);
const totalLength = $derived((titleText?.length || 0) + (game.subtitle?.length || 0));

function calculateSubtitleFontSize(subtitle: string | null | undefined, totalLen: number): number {
	let baseSize = 0.95;
	const minSize = 0.6;

	if (totalLen > 60) {
		baseSize = 0.75;
	} else if (totalLen > 45) {
		baseSize = 0.85;
	}

	const maxLength = 25;

	if (!subtitle || subtitle.length <= maxLength) {
		return baseSize;
	}

	const reduction = Math.min((subtitle.length - maxLength) * 0.015, baseSize - minSize);
	return Math.max(baseSize - reduction, minSize);
}

const subtitleFontSize = $derived(calculateSubtitleFontSize(game.subtitle, totalLength));

const isLongTitle = $derived(totalLength > 30 && totalLength <= 45);
const isVeryLongTitle = $derived(totalLength > 45 && totalLength <= 60);
const isExtraLongTitle = $derived(totalLength > 60);
</script>

<div class="title-section">
	<h3 class="game-title" class:has-subtitle={!!game.subtitle} class:long-title={isLongTitle} class:very-long-title={isVeryLongTitle} class:extra-long-title={isExtraLongTitle}>
		{titleText}
		{#if game.subtitle}
			<br />
			<span class="game-subtitle" style="font-size: {subtitleFontSize}rem;">{game.subtitle}</span>
		{/if}
	</h3>
</div>

<style>
	.title-section {
		margin-bottom: 0;
		min-height: 40px;
		max-height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: hidden;
	}

	.game-title {
		font-family: 'Inter', sans-serif;
		font-size: clamp(1.15rem, 8cqi, 1.4rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		margin: 0;
		line-height: 1.1;
		overflow: hidden;
		width: 100%;
		color: var(--color-text-primary);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.game-title.has-subtitle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		-webkit-line-clamp: unset;
		line-clamp: unset;
		-webkit-box-orient: unset;
	}

	.game-title.long-title {
		font-size: clamp(1.0rem, 7cqi, 1.2rem);
	}

	.game-title.very-long-title {
		font-size: clamp(0.9rem, 6cqi, 1.05rem);
	}

	.game-title.extra-long-title {
		font-size: clamp(0.75rem, 5cqi, 0.9rem);
	}

	.game-subtitle {
		font-family: 'Inter', sans-serif;
		font-weight: 500;
		color: var(--color-text-secondary);
		line-height: 1.1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		width: 100%;
	}

	@container game-card (max-width: 300px) {
		.title-section {
			min-height: 44px;
			max-height: 60px;
		}
		.game-title {
			font-size: clamp(1.05rem, 9cqi, 1.25rem);
		}
		.game-title.long-title {
			font-size: clamp(0.9rem, 8cqi, 1.1rem);
		}
		.game-title.very-long-title {
			font-size: clamp(0.8rem, 7cqi, 1.0rem);
		}
		.game-title.extra-long-title {
			font-size: clamp(0.65rem, 6cqi, 0.85rem);
		}
	}
</style>
