<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const titleParts = $derived(game.title.split(':'));
const derivedMainTitle = $derived(game.mainTitle || titleParts[0].trim());
const derivedSubtitle = $derived(
	game.subtitle || (titleParts.length > 1 ? titleParts.slice(1).join(':').trim() : null)
);

const titleLength = $derived(derivedMainTitle.length);
const subtitleLength = $derived(derivedSubtitle?.length || 0);

// Thresholds for resizing based on character count
// Titles wrap to 2 lines early on mobile 2-column layout (~13-15 chars)
const titleNeedsResize = $derived(titleLength > 15);
const titleNeedsAggressiveResize = $derived(titleLength > 30);

const subtitleNeedsResize = $derived(subtitleLength > 25);
</script>

<div class="title-section">
	<h3
		class="game-title"
		class:has-subtitle={!!derivedSubtitle}
		style="
            --title-font-size: {titleNeedsAggressiveResize
			? 'clamp(0.75rem, 5cqi, 0.95rem)'
			: titleNeedsResize
				? 'clamp(0.9rem, 6.5cqi, 1.15rem)'
				: 'clamp(1.15rem, 8cqi, 1.4rem)'};
            --subtitle-scale: {titleNeedsAggressiveResize || titleNeedsResize ? '0.9' : '1'};
            --subtitle-base-size: {subtitleNeedsResize ? '0.7em' : '0.8em'};
        "
	>
		<span class="main-title-text">{derivedMainTitle}</span>
		{#if derivedSubtitle}
			<br />
			<span class="game-subtitle">{derivedSubtitle}</span>
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
		font-size: var(--title-font-size);
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
		/* Default ellipsis for main title only if no subtitle */
		text-overflow: ellipsis;
	}

	.game-title.has-subtitle {
		/* Switch to block to avoid mandatory ellipsis from line-clamp when subtitle overflows */
		display: block;
		-webkit-line-clamp: unset;
		line-clamp: unset;
		text-overflow: clip;
	}

	.game-subtitle {
		font-family: 'Inter', sans-serif;
		font-weight: 500;
		color: var(--color-text-secondary);
		/* Scale subtitle proportionally with title and its own length */
		font-size: calc(var(--subtitle-base-size) * var(--subtitle-scale));
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
			/* Further scale down in small containers if needed */
			--container-scale: 0.95;
			font-size: calc(var(--title-font-size) * var(--container-scale));
		}
	}
</style>
