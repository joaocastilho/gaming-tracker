<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const titleText = $derived(game.mainTitle || game.title);
const totalLength = $derived((titleText?.length || 0) + (game.subtitle?.length || 0));

function calculateSubtitleFontSize(subtitle: string | null | undefined, totalLen: number): number {
	let baseSize = 0.85;
	const minSize = 0.55;
	
	if (totalLen > 60) {
		baseSize = 0.65;
	} else if (totalLen > 45) {
		baseSize = 0.75;
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
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: visible;
	}

	.game-title {
		font-family: 'Inter', sans-serif;
		font-size: clamp(1.0rem, 7cqi, 1.25rem);
		font-weight: 800;
		letter-spacing: -0.01em;
		margin: 0;
		line-height: 1.2;
		overflow: visible;
		width: 100%;
		color: var(--color-text-primary);
	}

	.game-title.long-title {
		font-size: clamp(0.85rem, 6cqi, 1.05rem);
	}

	.game-title.very-long-title {
		font-size: clamp(0.75rem, 5cqi, 0.95rem);
	}

	.game-title.extra-long-title {
		font-size: clamp(0.65rem, 4cqi, 0.85rem);
	}

	.game-title.has-subtitle {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.game-subtitle {
		font-family: 'Inter', sans-serif;
		font-weight: 500;
		color: var(--color-text-secondary);
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		width: 100%;
	}

	@container game-card (max-width: 300px) {
		.title-section {
			height: 44px;
		}
		.game-title {
			font-size: clamp(0.95rem, 8cqi, 1.15rem);
		}
		.game-title.long-title {
			font-size: clamp(0.8rem, 7cqi, 1.0rem);
		}
		.game-title.very-long-title {
			font-size: clamp(0.7rem, 6cqi, 0.9rem);
		}
		.game-title.extra-long-title {
			font-size: clamp(0.6rem, 5cqi, 0.8rem);
		}
	}
</style>
