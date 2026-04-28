<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
}

let { game }: Props = $props();

function calculateSubtitleFontSize(title: string | null | undefined): number {
	const baseSize = 0.85;
	const minSize = 0.55;
	const maxLength = 25;

	if (!title || title.length <= maxLength) {
		return baseSize;
	}

	const reduction = Math.min((title.length - maxLength) * 0.015, baseSize - minSize);
	return Math.max(baseSize - reduction, minSize);
}

const subtitleFontSize = $derived(calculateSubtitleFontSize(game.subtitle));

const titleText = $derived(game.mainTitle || game.title);
const titleLength = $derived(titleText ? titleText.length : 0);
const isLongTitle = $derived(titleLength > 35 && titleLength <= 50);
const isVeryLongTitle = $derived(titleLength > 50);
</script>

<div class="title-section">
	<h3 class="game-title" class:has-subtitle={!!game.subtitle} class:long-title={isLongTitle} class:very-long-title={isVeryLongTitle}>
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
		height: 95px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: visible;
	}

	.game-title {
		font-family: 'Inter', sans-serif;
		font-size: clamp(1.2rem, 9cqi, 1.5rem);
		font-weight: 800;
		letter-spacing: -0.01em;
		margin: 0;
		line-height: 1.2;
		overflow: visible;
		width: 100%;
		color: var(--color-text-primary);
	}

	.game-title.long-title {
		font-size: clamp(1.1rem, 8cqi, 1.35rem);
	}

	.game-title.very-long-title {
		font-size: clamp(1.0rem, 7cqi, 1.25rem);
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
		font-size: 0.85rem;
	}

	@container game-card (max-width: 300px) {
		.title-section {
			height: 75px;
		}
		.game-title {
			font-size: clamp(1.1rem, 10cqi, 1.3rem);
		}
		.game-title.long-title {
			font-size: clamp(1.0rem, 9cqi, 1.2rem);
		}
		.game-title.very-long-title {
			font-size: clamp(0.9rem, 8cqi, 1.1rem);
		}
		.game-subtitle {
			font-size: 0.75rem;
		}
	}

</style>