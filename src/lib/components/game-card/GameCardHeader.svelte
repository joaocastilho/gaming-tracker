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
</script>

<div class="title-section">
	<h3 class="game-title" class:has-subtitle={!!game.subtitle}>
		{game.mainTitle || game.title}
		{#if game.subtitle}
			<br />
			<span class="game-subtitle" style="font-size: {subtitleFontSize}rem;">{game.subtitle}</span>
		{/if}
	</h3>
</div>

<style>
	.title-section {
		margin-bottom: 0;
		min-height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: visible;
	}

	.game-title {
		font-size: clamp(1.05rem, 7cqi, 1.3rem);
		font-weight: 700;
		margin: 0;
		line-height: 1.2;
		overflow: visible;
		width: 100%;
		color: var(--color-text-primary);
	}

	.game-title.has-subtitle {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.game-subtitle {
		font-weight: 500;
		color: var(--color-text-secondary);
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		width: 100%;
		font-size: 0.75rem;
	}

	@container game-card (max-width: 200px) {
		.game-title {
			font-size: clamp(0.95rem, 8cqi, 1.1rem);
		}
		.game-subtitle {
			font-size: 0.65rem;
		}
	}

</style>