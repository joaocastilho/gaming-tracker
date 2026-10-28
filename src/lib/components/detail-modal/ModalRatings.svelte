<script lang="ts">
import type { Game } from '#lib/types/game.js';
import { getTierClass, getTierDisplayName } from '#lib/utils/tierUtils.js';
import { Presentation, NotebookPen, Gamepad2, Award } from '@lucide/svelte';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const ratings = $derived([
	{
		label: 'Presentation',
		value: game.ratingPresentation,
		icon: Presentation,
		tone: 'presentation',
	},
	{ label: 'Story', value: game.ratingStory, icon: NotebookPen, tone: 'story' },
	{ label: 'Gameplay', value: game.ratingGameplay, icon: Gamepad2, tone: 'gameplay' },
]);

const tierLetter = $derived(game.tier?.charAt(0) ?? '');
// getTierDisplayName returns "S - Masterpiece"; the letter is rendered separately.
const tierName = $derived(game.tier ? getTierDisplayName(game.tier).replace(/^[A-Z]\s*-\s*/, '') : '');

function fillPercent(value: number | null): number {
	if (value === null) return 0;
	return Math.max(0, Math.min(100, value * 10));
}
</script>

{#snippet scoreBadge(compact: boolean)}
	{#if game.status === 'Completed'}
		<span class="status-badge score-badge" class:compact class:is-empty={game.score === null}>
			<Award size={compact ? 18 : 26} aria-hidden="true" />
			<span class="score-num">{game.score ?? '-'}</span>
			{#if game.score !== null}
				<span class="score-max">/20</span>
			{/if}
		</span>
	{:else if game.status === 'Playing'}
		<span class="status-badge playing-badge" class:compact>PLAYING</span>
	{:else}
		<span class="status-badge planned-badge" class:compact>PLANNED</span>
	{/if}
{/snippet}

{#snippet tierBadge(compact: boolean)}
	{#if game.status === 'Completed' && game.tier}
		<span class="verdict-tier tier-badge {getTierClass(game.tier)}" class:compact>
			<span class="verdict-letter">{tierLetter}</span>
			<span class="verdict-separator" aria-hidden="true">–</span>
			<span class="verdict-name">{tierName}</span>
		</span>
	{/if}
{/snippet}

<div class="ratings-wrapper mt-6 md:mt-0 md:flex md:flex-1 md:flex-col">
	<div class="landscape-hidden-title mb-4 flex items-center gap-3 md:mt-auto md:mb-4">
		<h3
			class="text-base font-bold tracking-[0.2em] uppercase md:text-lg"
			style="color: var(--color-text-tertiary);"
		>
			Ratings
		</h3>
		<div class="h-[1px] flex-1 opacity-50" style="background-color: var(--color-border);"></div>
	</div>

	<div class="ratings-row">
		<dl class="ratings-container">
			{#each ratings as rating (rating.label)}
				{@const Icon = rating.icon}
				<div
					class="rating-card"
					class:is-empty={rating.value === null}
					data-tone={rating.tone}
					style="--rating-fill: {fillPercent(rating.value)}%"
					title={rating.value === null
						? `${rating.label}: not rated`
						: `${rating.label}: ${rating.value}/10`}
				>
					<dt class="rating-label">{rating.label}</dt>
					<dd class="rating-value">
						<Icon size={20} class="rating-icon" aria-hidden="true" />
						<span class="rating-number" aria-hidden="true">{rating.value ?? '-'}</span>
						<span class="rating-scale" aria-hidden="true">/10</span>
						<span class="sr-only">
							{rating.value === null ? 'not rated' : `${rating.value} out of 10`}
						</span>
					</dd>
					<div class="rating-meter" aria-hidden="true">
						<span class="rating-meter-fill"></span>
					</div>
				</div>
			{/each}
		</dl>

		<div class="landscape-score">
			{@render tierBadge(true)}
			{@render scoreBadge(true)}
		</div>
	</div>

	<div class="score-result verdict-strip mt-2">
		{@render tierBadge(false)}
		{@render scoreBadge(false)}
	</div>
</div>

<style>
	.ratings-container {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.5rem;
		margin: 0;
	}

	.ratings-row {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.rating-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		padding: 0.75rem 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 0.75rem;
		background: var(--color-surface-elevated);
		transition:
			opacity var(--transition-normal),
			border-color var(--transition-normal);
	}

	.rating-card.is-empty {
		opacity: 0.45;
	}

	.rating-card[data-tone='presentation'] {
		--rating-accent: var(--color-rating-presentation);
	}

	.rating-card[data-tone='story'] {
		--rating-accent: var(--color-rating-story);
	}

	.rating-card[data-tone='gameplay'] {
		--rating-accent: var(--color-rating-gameplay);
	}

	.rating-label {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		line-height: 1;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
	}

	.rating-value {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
		line-height: 1;
		color: var(--color-text-primary);
	}

	:global(.rating-icon) {
		flex-shrink: 0;
		color: var(--rating-accent);
	}

	.rating-number {
		font-variant-numeric: tabular-nums;
	}

	.rating-scale {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-tertiary);
	}

	.rating-meter {
		width: 100%;
		height: 3px;
		margin-top: 0.125rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--rating-accent) 18%, transparent);
		overflow: hidden;
	}

	.rating-meter-fill {
		display: block;
		width: var(--rating-fill, 0%);
		height: 100%;
		border-radius: inherit;
		background: var(--rating-accent);
		transition: width var(--transition-normal);
	}

	.landscape-score {
		display: none;
	}

	/* One full-width badge for every status, at a fixed height, so swiping
	   between games never shifts the ratings row above it. */
	.status-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 100%;
		height: 3.5rem;
		padding: 0.375rem 1rem;
		border: 1px solid;
		border-radius: 0.5rem;
		font-size: 1.125rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		line-height: 1;
		text-transform: uppercase;
		white-space: nowrap;
		transition:
			background-color var(--transition-normal),
			border-color var(--transition-normal);
	}

	.status-badge.is-empty {
		opacity: 0.4;
	}

	.status-badge.compact {
		width: auto;
		height: 2.5rem;
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.95rem;
	}

	/* The tier name now matches the letter, so the badges flow as flexible
	   items instead of fixed grid tracks; on very narrow screens the score
	   drops to its own row rather than squeezing either badge. */
	.verdict-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: stretch;
	}

	.verdict-strip .status-badge {
		flex: 1 1 9rem;
		min-width: 0;
	}

	.verdict-tier {
		display: inline-flex;
		flex: 0 0 auto;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		min-width: 4.25rem;
		height: 3.5rem;
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		line-height: 1;
		white-space: nowrap;
	}

	/* The shared tier badge lifts on hover; this one is not interactive. */
	.verdict-tier.tier-badge:hover {
		transform: none;
	}

	.verdict-letter,
	.verdict-name,
	.verdict-separator {
		font-size: clamp(0.95rem, 4.4vw, 1.35rem);
		font-weight: 900;
	}

	.verdict-name {
		letter-spacing: 0.01em;
		opacity: 0.95;
	}

	.verdict-separator {
		font-weight: 400;
		opacity: 0.6;
	}

	.verdict-tier.compact {
		min-width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border-radius: 0.375rem;
	}

	.verdict-tier.compact .verdict-letter {
		font-size: 1.125rem;
	}

	/* The landscape strip has room for one glyph, not the tier name. */
	.verdict-tier.compact .verdict-name,
	.verdict-tier.compact .verdict-separator {
		display: none;
	}

	.score-badge {
		gap: 0.5rem;
		padding-right: 0.75rem;
		padding-left: 0.75rem;
		color: var(--color-status-score-text);
		background: var(--color-status-score-bg);
		border-color: var(--color-status-score-border);
	}

	.playing-badge {
		color: var(--color-status-playing-text);
		background: var(--color-status-playing-bg);
		border-color: var(--color-status-playing-border);
	}

	.planned-badge {
		color: var(--color-status-planned-text);
		background: var(--color-status-planned-bg);
		border-color: var(--color-status-planned-border);
	}

	.score-num {
		font-size: 1.875rem;
		font-weight: 900;
		line-height: 1;
	}

	.score-max {
		font-size: 0.8rem;
		font-weight: 700;
		opacity: 0.55;
	}

	@media (min-width: 768px) {
		.ratings-container {
			gap: 0.75rem;
		}
	}

	@media (max-width: 767px) and (orientation: portrait) {
		/* Ratings flow directly after the metadata grid (Hours Played) and the
		   score badge follows them. `margin-top: auto` used to strand the block
		   at the bottom of the column, leaving a large gap above it. */
		.ratings-wrapper {
			margin-top: 1.25rem;
		}

		.rating-card {
			padding: 0.625rem 0.375rem;
		}

		.score-num {
			font-size: 1.625rem;
		}
	}

	@media (orientation: landscape) and (max-height: 1000px) and (max-width: 1200px) {
		.ratings-wrapper {
			margin-top: auto !important;
		}

		.landscape-hidden-title {
			display: none !important;
		}

		.ratings-row {
			flex-direction: row !important;
			align-items: center !important;
			gap: 1rem !important;
			margin-top: 1.5rem !important;
		}

		.ratings-container {
			display: flex !important;
			flex: 1;
			flex-direction: row !important;
			align-items: center !important;
			justify-content: space-between !important;
			gap: 1rem !important;
		}

		.rating-card {
			flex-direction: row !important;
			gap: 0.75rem !important;
			padding: 0.25rem 0.5rem !important;
			border-color: transparent !important;
			background: transparent !important;
		}

		.rating-label {
			display: none !important;
		}

		:global(.rating-icon) {
			width: 28px !important;
			height: 28px !important;
		}

		.rating-value {
			font-size: 1.75rem !important;
		}

		.rating-meter {
			display: none !important;
		}

		.landscape-score {
			display: flex !important;
			gap: 0.5rem !important;
			margin-left: auto !important;
			padding-left: 1.5rem !important;
			border-left: 1px solid var(--color-border);
		}

		.score-result {
			display: none !important;
		}
	}
</style>
