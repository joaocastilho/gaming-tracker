<script lang="ts">
import type { Game } from '../../types/game.js';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const derivedSubtitle = $derived(game.subtitle ?? game.title.match(/\((.+?)\)/)?.[1] ?? null);
const derivedMainTitle = $derived(
	game.mainTitle ?? (derivedSubtitle ? game.title.replace(/\(.+?\)/, '').trim() : game.title)
);

const titleLength = $derived(derivedMainTitle.length);
const subtitleLength = $derived(derivedSubtitle?.length || 0);

// Thresholds for resizing based on character count
// Titles wrap to 2 lines early on mobile 2-column layout (~13-15 chars)
const titleNeedsResize = $derived(titleLength > 15);
const titleNeedsAggressiveResize = $derived(titleLength > 30);

const subtitleNeedsResize = $derived(subtitleLength > 25);
</script>

<div class="title-section" class:has-subtitle={!!derivedSubtitle}>
	<h3 class="game-title" style="--title-font-size: {titleNeedsAggressiveResize
		? 'clamp(0.75rem, 5cqi, 0.95rem)'
		: titleNeedsResize
			? 'clamp(0.9rem, 6.5cqi, 1.15rem)'
			: 'clamp(1.15rem, 8cqi, 1.4rem)'};"
	>
		{derivedMainTitle}
	</h3>
	{#if derivedSubtitle}
		<span class="game-subtitle" style="--subtitle-font-size: {subtitleNeedsResize ? '0.7em' : '0.75em'};">{derivedSubtitle}</span>
	{/if}
</div>

<style>
	.title-section {
		margin-bottom: clamp(4px, 2cqi, 8px);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: hidden;
		padding: clamp(2px, 1cqi, 4px) 0;
		min-height: calc(2.4 * clamp(1.15rem, 8cqi, 1.4rem));
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
		text-overflow: ellipsis;
	}

	.game-subtitle {
		font-family: 'Inter', sans-serif;
		font-weight: 500;
		color: var(--color-text-secondary);
		font-size: var(--subtitle-font-size);
		display: block;
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.2;
	}

	@container game-card (max-width: 300px) {
		.title-section {
			padding: clamp(1px, 0.5cqi, 2px) 0;
		}
		.game-title {
			--container-scale: 0.95;
			font-size: calc(var(--title-font-size) * var(--container-scale));
		}
	}
</style>
