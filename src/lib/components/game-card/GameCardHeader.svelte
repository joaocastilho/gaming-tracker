<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const titleText = $derived(game.mainTitle || game.title);
const titleLength = $derived(titleText?.length || 0);

function calculateSubtitleFontSize(subtitle: string | null | undefined): number {
	let baseSize = 0.95;
	const minSize = 0.65;

	const len = subtitle?.length || 0;

	if (len > 60) {
		baseSize = 0.8;
	} else if (len > 45) {
		baseSize = 0.9;
	}

	const maxLength = 25;

	if (!subtitle || len <= maxLength) {
		return baseSize;
	}

	const reduction = Math.min((len - maxLength) * 0.015, baseSize - minSize);
	return Math.max(baseSize - reduction, minSize);
}

const subtitleFontSize = $derived(calculateSubtitleFontSize(game.subtitle));

const isLongTitle = $derived(titleLength > 30 && titleLength <= 45);
const isVeryLongTitle = $derived(titleLength > 45 && titleLength <= 60);
const isExtraLongTitle = $derived(titleLength > 60);
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
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: hidden;
		padding: clamp(2px, 1cqi, 4px) 0;
		/* Reserve space for exactly 2 lines of title to prevent layout shifts */
		/* Increased multiplier slightly to ensure no descenders are cut */
		height: calc(2.8 * clamp(1.15rem, 8cqi, 1.4rem));
	}

	.game-title {
		font-family: 'Inter', sans-serif;
		font-size: clamp(1.15rem, 8cqi, 1.4rem);
		font-weight: 700;
		margin: 0;
		line-height: 1.2;
		width: 100%;
		color: var(--color-text-primary);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.game-title.has-subtitle {
		/* Use standard block display when there's a subtitle to avoid -webkit-line-clamp's ellipsis */
		/* The .title-section's fixed height and overflow: hidden will handle the clipping */
		display: block;
		-webkit-line-clamp: unset;
		line-clamp: unset;
		text-overflow: clip;
		/* More aggressive scaling for subtitles to avoid truncation of main title */
		font-size: clamp(0.9rem, 6.5cqi, 1.15rem);
	}

	.game-title.long-title {
		font-size: clamp(0.85rem, 6cqi, 1.05rem);
	}

	.game-title.very-long-title {
		font-size: clamp(0.7rem, 5.5cqi, 0.95rem);
	}

	.game-title.extra-long-title {
		font-size: clamp(0.6rem, 4.2cqi, 0.75rem);
	}

	.game-title.has-subtitle.long-title {
		font-size: clamp(0.7rem, 5.5cqi, 0.9rem);
	}

	.game-subtitle {
		font-family: 'Inter', sans-serif;
		font-weight: 500;
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		width: 100%;
	}

	@container game-card (max-width: 300px) {
		.title-section {
			padding: clamp(1px, 0.5cqi, 2px) 0;
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

