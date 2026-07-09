<script lang="ts">
import type { Game } from '$lib/types/game';
import { formatShortDate, formatMobileDate } from '$lib/utils/dateUtils';
import { Timer, CalendarDays, Presentation, NotebookPen, Gamepad2, Award } from '@lucide/svelte';

interface Props {
	game: Game;
}

let { game }: Props = $props();

function formatSmartTime(timeStr: string | null): string {
	if (!timeStr) return 'N/A';
	let formatted = timeStr;
	if (formatted.endsWith(' 0m')) {
		formatted = formatted.replace(' 0m', '');
	}
	return formatted;
}

const hasPresentation = $derived(game.status === 'Completed' && game.ratingPresentation !== null);
const hasStory = $derived(game.status === 'Completed' && game.ratingStory !== null);
const hasGameplay = $derived(game.status === 'Completed' && game.ratingGameplay !== null);
</script>

<!-- Time and Date Section -->
<div class="time-date-row">
	<div class="time-item" title={game.status === 'Completed' ? 'Hours Played' : 'Time to Beat'}>
		<Timer />
		<span>{formatSmartTime(game.playtime)}</span>
	</div>
	<div class="date-item" title={game.status === 'Completed' ? 'Completed On' : 'Expected Completion'}>
		<CalendarDays />
		<span class="desktop-text">{game.status === 'Completed' && game.finishedDate ? formatShortDate(game.finishedDate) : 'Soon'}</span>
		<span class="mobile-text">{game.status === 'Completed' && game.finishedDate ? formatMobileDate(game.finishedDate) : 'Soon'}</span>
	</div>
</div>

<div class="ratings-and-score-wrapper">
	<!-- Ratings Section -->
<div class="ratings-compact">
	<div
		class="rating-item {hasPresentation ? '' : 'placeholder'}"
		title={hasPresentation ? `Presentation: ${game.ratingPresentation}/10` : 'Presentation'}
	>
		<Presentation size={32} class={hasPresentation ? 'text-rose-500' : 'text-muted'} />
		<span class="rating-value">
			{hasPresentation ? game.ratingPresentation : '-'}
		</span>
	</div>

	<div
		class="rating-item {hasStory ? '' : 'placeholder'}"
		title={hasStory ? `Story: ${game.ratingStory}/10` : 'Story'}
	>
		<NotebookPen size={32} class={hasStory ? 'text-sky-500' : 'text-muted'} />
		<span class="rating-value">
			{hasStory ? game.ratingStory : '-'}
		</span>
	</div>

	<div class="rating-item {hasGameplay ? '' : 'placeholder'}" title={hasGameplay ? `Gameplay: ${game.ratingGameplay}/10` : 'Gameplay'}>
		<Gamepad2 size={32} class={hasGameplay ? 'text-emerald-500' : 'text-muted'} />
		<span class="rating-value">
			{hasGameplay ? game.ratingGameplay : '-'}
		</span>
	</div>
</div>

<!-- Total Score Section -->
{#if game.status === 'Completed' && game.score !== null}
	<div class="status-indicator score-badge">
		<Award />
		<div class="score-text-wrapper">
			<span class="desktop-text">
				<span class="score-value">{game.score}</span>
			</span>
			<span class="mobile-text">
				<span class="score-value">{game.score}</span>
			</span>
		</div>
	</div>
{:else}
	<div class="status-indicator planned-badge">
		<span>PLANNED</span>
	</div>
{/if}
</div>

<style>
	.time-date-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0;
		min-width: 0;
		margin-top: clamp(1px, 0.5cqi, 4px);
	}

	.time-item,
	.date-item {
		display: flex;
		align-items: flex-end;
		gap: clamp(3px, 1.2cqi, 6px);
		font-size: clamp(0.75rem, 5cqi, 1rem);
		color: var(--color-text-secondary);
		flex-shrink: 1;
		min-width: 0;
		line-height: 1.1;
		font-weight: 500;
	}

	.time-item :global(svg),
	.date-item :global(svg) {
		width: clamp(0.75rem, 5cqi, 1rem);
		height: clamp(0.75rem, 5cqi, 1rem);
		flex-shrink: 0;
		margin-bottom: 1px;
	}

	.ratings-compact {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		padding: 0;
		gap: clamp(8px, 3cqi, 16px);
		margin-bottom: 0;
	}

	.rating-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: clamp(4px, 1.5cqi, 8px);
		flex: 1;
		min-width: 0;
	}

	.rating-item.placeholder {
		opacity: 0.3;
		filter: grayscale(1);
	}

	:global(.text-muted) {
		color: var(--color-text-tertiary, #888);
	}

	.rating-value {
		font-size: clamp(0.9rem, 6.5cqi, 1.3rem);
		font-weight: 800;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.rating-item :global(svg) {
		width: clamp(14px, 6cqi, 22px);
		height: clamp(14px, 6cqi, 22px);
		flex-shrink: 0;
		margin-right: 1px;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(6px, 2.5cqi, 12px);
		font-weight: 800;
		font-size: clamp(0.75rem, 5cqi, 0.95rem);
		padding: clamp(4px, 1.5cqi, 6px) clamp(6px, 2cqi, 8px);
		flex-shrink: 0;
		border-radius: 4px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		transition:
			background-color var(--transition-normal),
			border-color var(--transition-normal);
		border: 1px solid rgba(255, 255, 255, 0.1);
		line-height: normal;
		height: clamp(32px, 12cqi, 48px);
	}

	.status-indicator :global(svg) {
		width: clamp(14px, 6cqi, 24px);
		height: clamp(14px, 6cqi, 24px);
	}

	.score-badge {
		color: #fbbf24;
		background: rgba(245, 158, 11, 0.15);
		border-color: rgba(245, 158, 11, 0.25);
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
	}

	.planned-badge {
		color: #60a5fa;
		background: rgba(59, 130, 246, 0.15);
		border-color: rgba(59, 130, 246, 0.25);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
	}

	:global(.light) .score-badge {
		color: #d97706;
		background: rgba(245, 158, 11, 0.15);
		border-color: rgba(245, 158, 11, 0.3);
	}

	:global(.light) .planned-badge {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.2);
	}

	.mobile-text {
		display: none;
	}

	.desktop-text {
		display: inline-block;
	}

	.score-text-wrapper {
		display: contents;
	}

	.score-value {
		font-size: clamp(0.9rem, 7cqi, 1.35rem);
		font-weight: 900;
		line-height: normal;
	}

	.ratings-and-score-wrapper {
		display: flex;
		flex-direction: column;
		gap: clamp(12px, 4cqi, 24px);
		width: 100%;
		margin-top: clamp(6px, 2cqi, 12px);
		padding-bottom: 4px;
	}

	@container game-card (max-width: 300px) {
		.time-date-row {
			margin-top: 6px;
			padding: 0;
		}

		.ratings-and-score-wrapper {
			margin-top: 12px;
			gap: 16px;
		}

		.desktop-text {
			display: none !important;
		}

		.mobile-text {
			display: inline-block !important;
		}

		.status-indicator {
			padding: 5px clamp(4px, 1.5cqw, 8px);
			gap: clamp(4px, 1.5cqw, 8px);
		}

		.status-indicator :global(svg) {
			width: clamp(16px, 10px + 3cqw, 24px);
			height: clamp(16px, 10px + 3cqw, 24px);
		}

		.rating-item {
			gap: clamp(3px, 1.5cqw, 6px);
		}

		.rating-item :global(svg) {
			width: clamp(18px, 6cqw, 28px);
			height: clamp(18px, 6cqw, 28px);
			margin-right: 2px;
		}

		.planned-badge {
			min-height: unset;
		}
	}
</style>

