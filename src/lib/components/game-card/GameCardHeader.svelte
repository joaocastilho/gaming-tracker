<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const titleText = $derived(game.mainTitle || game.title);
const titleLength = $derived(titleText?.length || 0);

const isLongTitle = $derived(titleLength > 20 && titleLength <= 35);
const isVeryLongTitle = $derived(titleLength > 35 && titleLength <= 50);
const isExtraLongTitle = $derived(titleLength > 50);
</script>

<div class="title-section">
	<h3
		class="game-title"
		class:has-subtitle={!!game.subtitle}
		class:long-title={isLongTitle}
		class:very-long-title={isVeryLongTitle}
		class:extra-long-title={isExtraLongTitle}
	>
		<span class="main-title-text">{titleText}</span>
		{#if game.subtitle}
			<br />
			<span class="game-subtitle">{game.subtitle}</span>
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
		/* Use ellipsis for main title ONLY when NO subtitle is present */
		text-overflow: ellipsis;
	}

	.game-title.has-subtitle {
		/* Switch to block to avoid mandatory ellipsis from line-clamp when subtitle overflows */
		display: block;
		-webkit-line-clamp: unset;
		line-clamp: unset;
		text-overflow: clip;
		/* More aggressive scaling for subtitles to avoid truncation of main title */
		font-size: clamp(0.85rem, 6cqi, 1.1rem);
	}

	.game-title.long-title {
		font-size: clamp(0.85rem, 6cqi, 1.1rem);
	}

	.game-title.very-long-title {
		font-size: clamp(0.7rem, 5cqi, 0.9rem);
	}

	.game-title.extra-long-title {
		font-size: clamp(0.6rem, 4cqi, 0.75rem);
	}

	.game-subtitle {
		font-family: 'Inter', sans-serif;
		font-weight: 500;
		color: var(--color-text-secondary);
		/* Scale subtitle proportionally with title using em */
		font-size: 0.75em;
		display: block;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		/* Use clip to ensure no dots when subtitle overflows the 2-line container */
		text-overflow: clip;
	}

	@container game-card (max-width: 300px) {
		.title-section {
			padding: clamp(1px, 0.5cqi, 2px) 0;
		}
		.game-title {
			font-size: clamp(1.05rem, 9cqi, 1.25rem);
		}
		.game-title.has-subtitle {
			font-size: clamp(0.8rem, 6.5cqi, 1.0rem);
		}
		.game-title.long-title {
			font-size: clamp(0.8rem, 7cqi, 1.0rem);
		}
		.game-title.very-long-title {
			font-size: clamp(0.65rem, 6cqi, 0.85rem);
		}
		.game-title.extra-long-title {
			font-size: clamp(0.55rem, 5cqi, 0.7rem);
		}
	}
</style>

